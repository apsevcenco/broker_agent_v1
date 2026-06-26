import type { ReasoningProfile } from "../ReasoningProfile";
import type { IntelligenceContext } from "../../core/IntelligenceContext";
import type { IntelligenceResponse } from "../../core/IntelligenceResponse";
import type { ExecutionStepType } from "../../core/ExecutionPlan";
import type { DraftReplyResult } from "../../draftReplyWithContext";
import type { InboxMessage } from "../../../shared/types";
import type { ToolRequest, ToolRequestPriority, ToolRiskLevel } from "../../core/ToolRequest";
import { RecommendedDecision } from "../../core/RecommendedDecision";
import { buildToolPlan } from "../../core/ToolPlan";
import { resolvePolicy } from "../../core/ToolRegistry";
import { draftReplyWithContext } from "../../draftReplyWithContext";
import { classifyMessage } from "../../classifyMessage";
import { scoreLead } from "../../leadScoring";
import { assessRisk } from "../../riskAssessment";

function inferStepType(action: string): ExecutionStepType {
  const a = action.toLowerCase();
  if (a.includes("task")) return "create_task";
  if (a.includes("lead") || a.includes("crm")) return "create_lead";
  if (a.includes("draft") || a.includes("send") || a.includes("reply")) return "send_draft";
  if (a.includes("approval")) return "request_approval";
  if (a.includes("memory") || a.includes("note") || a.includes("relationship")) return "update_memory";
  return "store_experience";
}

const SPECIALIST_REVIEW_TERMS = [
  "tax",
  "vat",
  "flag",
  "registration",
  "class",
  "insurance",
  "legal",
  "solas",
  "marpol",
  "mlc",
  "ism",
  "isps",
  "commercial use",
  "charter"
];

function specialistReviewTopics(message: InboxMessage, pbre: DraftReplyResult): string[] {
  const text = [
    message.body,
    pbre.riskReason,
    pbre.safetyNotes,
    pbre.adminReasoningSummary,
    ...pbre.missingQualificationItems
  ].join(" ").toLowerCase();

  return SPECIALIST_REVIEW_TERMS.filter((term) => text.includes(term));
}

function buildSpecialistReviewToolRequest(
  message: InboxMessage,
  pbre: DraftReplyResult,
  topics: string[]
): ToolRequest {
  const policy = resolvePolicy("task.create");

  return {
    id: crypto.randomUUID(),
    tool: "task.create",
    category: "TASK",
    reason: "Specialist review required before responding on flag, tax, class, insurance or regulatory implications.",
    priority: "critical",
    approvalRequired: policy.requiresApproval,
    status: "proposed",
    riskLevel: "high",
    createdAt: new Date().toISOString(),
    input: {
      title: `Specialist review for ${message.senderName}`,
      contactName: message.senderName,
      conversationType: pbre.conversationType,
      riskLevel: pbre.riskLevel,
      topics
    },
    expectedOutput: "Admin routes complex regulatory, tax or insurance questions to the appropriate specialist before external advice."
  };
}

// Maps a plain-English suggested action string to a structured ToolRequest.
// Returns null when no recognisable tool pattern is found.
function mapActionToToolRequest(
  action: string,
  message: InboxMessage,
  pbre: DraftReplyResult,
  index: number
): ToolRequest | null {
  const a = action.toLowerCase();
  const now = new Date().toISOString();
  const priority: ToolRequestPriority =
    index === 0 ? "high" : index <= 2 ? "medium" : "low";

  function base(tool: string, riskLevel: ToolRiskLevel, overridePriority?: ToolRequestPriority) {
    const policy = resolvePolicy(tool);
    return {
      id:               crypto.randomUUID(),
      tool,
      reason:           action,
      priority:         overridePriority ?? priority,
      approvalRequired: policy.requiresApproval,
      status:           "proposed" as const,
      riskLevel,
      createdAt:        now
    };
  }

  if (a.includes("nda") || (a.includes("document") && a.includes("request"))) {
    return {
      ...base("document.requestNda", "high", "high"),
      category: "DOCUMENT",
      input: {
        contactName: message.senderName,
        company:     message.senderCompany ?? undefined,
        enquiryType: pbre.conversationType
      },
      expectedOutput: "NDA draft prepared and sent to admin for review before contacting the prospect."
    };
  }

  if (a.includes("crm") || (a.includes("lead") && (a.includes("creat") || a.includes("add")))) {
    return {
      ...base("crm.createLead", "low"),
      category: "CRM",
      input: {
        name:             message.senderName,
        company:          message.senderCompany ?? undefined,
        role:             message.senderRole,
        source:           message.source,
        leadScore:        pbre.leadScore,
        conversationType: pbre.conversationType
      },
      expectedOutput: "New lead record created in CRM with qualification data from this enquiry."
    };
  }

  if (a.includes("lead") && a.includes("updat")) {
    return {
      ...base("crm.updateLead", "low"),
      category: "CRM",
      input: {
        name:             message.senderName,
        leadScore:        pbre.leadScore,
        conversationType: pbre.conversationType
      },
      expectedOutput: "Existing CRM lead updated with latest qualification data."
    };
  }

  if (a.includes("call") || a.includes("meeting") || a.includes("schedul")) {
    return {
      ...base("calendar.proposeMeeting", "low"),
      category: "CALENDAR",
      input: {
        contactName: message.senderName,
        purpose:     "Buyer qualification call",
        notes: pbre.missingQualificationItems.length
          ? `Clarify: ${pbre.missingQualificationItems.slice(0, 3).join("; ")}`
          : "Initial discovery call"
      },
      expectedOutput: "Meeting proposal prepared. Admin approves and sends to contact."
    };
  }

  if (a.includes("task") || a.includes("follow")) {
    return {
      ...base("task.create", "low"),
      category: "TASK",
      input: {
        title:       action,
        contactName: message.senderName,
        leadScore:   pbre.leadScore
      },
      expectedOutput: "Task added to the agent queue for admin review."
    };
  }

  if (a.includes("memory") || a.includes("note") || a.includes("relationship")) {
    return {
      ...base("memory.proposeUpdate", "low"),
      category: "MEMORY",
      input: {
        personName:       message.senderName,
        conversationType: pbre.conversationType,
        notes:            action
      },
      expectedOutput: "Memory update proposed. Admin reviews before it is applied."
    };
  }

  if (a.includes("email") || a.includes("draft") || a.includes("reply")) {
    return {
      ...base("email.prepareDraft", "medium"),
      category: "EMAIL",
      input: {
        recipientName: message.senderName,
        source:        message.source,
        context:       action
      },
      expectedOutput: "Email draft prepared for admin review before sending."
    };
  }

  if (a.includes("knowledge") || a.includes("listing") || a.includes("vessel info")) {
    return {
      ...base("knowledge.proposeEntry", "low"),
      category: "KNOWLEDGE",
      input: { notes: action, contactName: message.senderName },
      expectedOutput: "Knowledge entry proposed for admin review."
    };
  }

  return null;
}

export const YachtBrokerProfile: ReasoningProfile = {
  id: "yacht-broker",
  name: "Yacht Broker Agent",
  domain: "superyacht-brokerage",
  version: "1.1.0",
  description: "Senior superyacht broker reasoning profile. Handles buyer, seller, and broker enquiries; NDA processes; owner mandates; buyer qualification; and off-market transactions. Powered by the Professional Brokerage Reasoning Engine (PBRE).",

  async execute(context: IntelligenceContext): Promise<IntelligenceResponse> {
    const { message, knowledge, memory } = context;

    const classification = message.classification ?? classifyMessage(message);
    const riskLevel      = message.riskLevel ?? assessRisk(message);
    const leadScore      = scoreLead(message);

    const pbre = await draftReplyWithContext({
      message,
      classification,
      riskLevel,
      leadScore,
      knowledgeResults: knowledge,
      memoryEntries:    memory
    });

    const recommendation: RecommendedDecision =
      pbre.riskLevel === "critical"             ? RecommendedDecision.ESCALATE :
      pbre.riskLevel === "high"                 ? RecommendedDecision.PROCEED_WITH_CAUTION :
      pbre.missingQualificationItems.length > 3 ? RecommendedDecision.NEED_MORE_INFORMATION :
      pbre.leadScore === "D"                    ? RecommendedDecision.ARCHIVE :
                                                  RecommendedDecision.PROCEED;

    const toolRequests: ToolRequest[] = pbre.suggestedNextActions
      .map((action, i) => mapActionToToolRequest(action, message, pbre, i))
      .filter((r): r is ToolRequest => r !== null);

    const specialistTopics = specialistReviewTopics(message, pbre);
    if (
      pbre.riskLevel === "critical" &&
      specialistTopics.length > 0 &&
      !toolRequests.some((r) => r.tool === "task.create" && String(r.input?.title ?? "").toLowerCase().includes("specialist review"))
    ) {
      toolRequests.unshift(buildSpecialistReviewToolRequest(message, pbre, specialistTopics));
    }

    const toolPlan = buildToolPlan(
      toolRequests,
      toolRequests.length > 0
        ? `${toolRequests.length} proposed action(s) for ${message.senderName}. All require admin approval before execution.`
        : "No tool actions proposed for this conversation."
    );

    return {
      profileId: "yacht-broker",
      agentId:   message.agentId,
      createdAt: new Date().toISOString(),

      perception: {
        conversationType:  pbre.conversationType,
        conversationStage: pbre.conversationStage,
        urgency:           message.urgency,
        senderProfile:     `${message.senderName} (${message.senderRole})`,
        intentSummary:     classification
      },

      reasoning: {
        leadScore:                 pbre.leadScore,
        leadScoreReason:           pbre.leadScoreReason,
        riskLevel:                 pbre.riskLevel,
        riskReason:                pbre.riskReason,
        missingQualificationItems: pbre.missingQualificationItems,
        knowledgeUsed:             pbre.knowledgeUsed,
        memoryUsed:                pbre.memoryUsed,
        adminReasoningSummary:     pbre.adminReasoningSummary
      },

      decision: {
        recommendation,
        rationale:        pbre.leadScoreReason,
        safetyNotes:      pbre.safetyNotes,
        approvalRequired: pbre.approvalRequired
      },

      planning: {
        suggestedNextActions: pbre.suggestedNextActions,
        executionPlan: {
          steps: pbre.suggestedNextActions.map((action, i) => ({
            type:             inferStepType(action),
            description:      action,
            priority:         i + 1,
            requiresApproval: true
          })),
          blockers: pbre.missingQualificationItems.slice(0, 2)
        }
      },

      execution: {
        draftContent:  pbre.draft,
        draftProvider: pbre.provider,
        draftMocked:   pbre.mocked,
        toolPlan
      },

      learning: {
        updates: {
          memoryUpdates:        [],
          knowledgeCandidates:  [],
          experienceCandidates: [{
            conversationType: pbre.conversationType,
            outcome:          "draft_created",
            lessonsLearned:   []
          }],
          relationshipUpdates: []
        }
      },

      draft: pbre as unknown as Record<string, unknown>
    };
  }
};
