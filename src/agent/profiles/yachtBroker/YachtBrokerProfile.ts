import type { ReasoningProfile } from "../ReasoningProfile";
import type { IntelligenceContext } from "../../core/IntelligenceContext";
import type { IntelligenceResponse } from "../../core/IntelligenceResponse";
import type { ExecutionStepType } from "../../core/ExecutionPlan";
import { RecommendedDecision } from "../../core/RecommendedDecision";
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

export const YachtBrokerProfile: ReasoningProfile = {
  id: "yacht-broker",
  name: "Yacht Broker Agent",
  domain: "superyacht-brokerage",
  version: "1.0.0",
  description: "Senior superyacht broker reasoning profile. Handles buyer, seller, and broker enquiries; NDA processes; owner mandates; buyer qualification; and off-market transactions. Powered by the Professional Brokerage Reasoning Engine (PBRE).",

  async execute(context: IntelligenceContext): Promise<IntelligenceResponse> {
    const { message, knowledge, memory } = context;

    // Preliminary signals used to populate DraftReplyInput
    const classification = message.classification ?? classifyMessage(message);
    const riskLevel = message.riskLevel ?? assessRisk(message);
    const leadScore = scoreLead(message);

    // PBRE contains all brokerage intelligence — do not duplicate logic here
    const pbre = await draftReplyWithContext({
      message,
      classification,
      riskLevel,
      leadScore,
      knowledgeResults: knowledge,
      memoryEntries: memory
    });

    const recommendation: RecommendedDecision =
      pbre.riskLevel === "critical"                        ? RecommendedDecision.ESCALATE :
      pbre.riskLevel === "high"                            ? RecommendedDecision.PROCEED_WITH_CAUTION :
      pbre.missingQualificationItems.length > 3           ? RecommendedDecision.NEED_MORE_INFORMATION :
      pbre.leadScore === "D"                               ? RecommendedDecision.ARCHIVE :
                                                             RecommendedDecision.PROCEED;

    return {
      profileId: "yacht-broker",
      agentId: message.agentId,
      createdAt: new Date().toISOString(),

      perception: {
        conversationType:  pbre.conversationType,
        conversationStage: pbre.conversationStage,
        urgency:           message.urgency,
        senderProfile:     `${message.senderName} (${message.senderRole})`,
        intentSummary:     classification
      },

      reasoning: {
        leadScore:                  pbre.leadScore,
        leadScoreReason:            pbre.leadScoreReason,
        riskLevel:                  pbre.riskLevel,
        riskReason:                 pbre.riskReason,
        missingQualificationItems:  pbre.missingQualificationItems,
        knowledgeUsed:              pbre.knowledgeUsed,
        memoryUsed:                 pbre.memoryUsed,
        adminReasoningSummary:      pbre.adminReasoningSummary
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
        draftMocked:   pbre.mocked
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

      // Carry the full PBRE output as the draft layer so the approval payload
      // format is identical to what the frontend already expects.
      draft: pbre as unknown as Record<string, unknown>
    };
  }
};
