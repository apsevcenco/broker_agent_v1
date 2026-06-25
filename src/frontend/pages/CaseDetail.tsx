import { useEffect, useState } from "react";
import { api, postJson } from "../services/api";
import { Badge, Empty } from "../components/UI";
import { ApprovalCaseCard } from "./ListPages";

// ── Types ────────────────────────────────────────────────────────────────────

type CaseRecord = {
  id: string; title: string; caseType: string; caseProfile: string;
  status: string; source: string;
  primaryContactName?: string; primaryContactEmail?: string;
  createdAt: string; updatedAt: string;
};

type CaseEvt = {
  id: string; eventType: string; actorType: string; actorId?: string;
  summary: string; payload: Record<string, unknown>;
  relatedEntityType?: string; relatedEntityId?: string; createdAt: string;
};

type CaseParticipant = {
  id: string; name: string; email?: string; role: string; status: string; createdAt: string;
};

type AssignedAgent = { slug: string; name: string };

type CaseDetailData = {
  case: CaseRecord;
  events: CaseEvt[];
  participants: CaseParticipant[];
  approvals: any[];
  messages: any[];
  latestIntelligence: any | null;
  latestDraft: string | null;
  latestToolPlan: any | null;
  assignedAgents: AssignedAgent[];
};

type Tone = "neutral" | "gold" | "red" | "green" | "blue";
type Tab  = "overview" | "timeline" | "messages" | "decisions" | "toolplans" | "approvals" | "participants";

// ── Constants ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",     label: "Overview" },
  { id: "timeline",     label: "Timeline" },
  { id: "messages",     label: "Messages" },
  { id: "decisions",    label: "AI Decisions" },
  { id: "toolplans",    label: "Tool Plans" },
  { id: "approvals",    label: "Approvals" },
  { id: "participants", label: "Participants" }
];

const EVENT_LABELS: Record<string, string> = {
  "message.received":       "Message received",
  "intelligence.generated": "Intelligence generated",
  "decision.proposed":      "Decision proposed",
  "toolplan.created":       "Tool plan created",
  "approval.created":       "Approval created",
  "approval.decided":       "Approval decided"
};

const EVENT_DOT: Record<string, string> = {
  "message.received":       "message",
  "intelligence.generated": "intelligence",
  "decision.proposed":      "decision",
  "toolplan.created":       "toolplan",
  "approval.created":       "approval",
  "approval.decided":       "decided"
};

// ── Utilities ─────────────────────────────────────────────────────────────────

function tc(s: string): string {
  return s ? s.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "";
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function statusTone(s: string): Tone {
  if (s === "completed") return "green";
  if (s === "qualified" || s === "waiting") return "gold";
  if (s === "open" || s === "in_progress") return "blue";
  return "neutral";
}

function riskTone(s: string): Tone {
  const v = (s || "").toLowerCase();
  if (v === "high" || v === "critical") return "red";
  if (v === "medium") return "gold";
  if (v === "low") return "green";
  return "neutral";
}

function scoreTone(s: string): Tone {
  const v = (s || "").toUpperCase();
  if (v === "A" || v === "A+") return "green";
  if (v === "B") return "blue";
  if (v === "C") return "gold";
  return "neutral";
}

function decisionLabel(s: string): string {
  const map: Record<string, string> = {
    PROCEED:               "Proceed",
    PROCEED_WITH_CAUTION:  "Proceed with caution",
    NEED_MORE_INFORMATION: "Need more info",
    ESCALATE:              "Escalate",
    REJECT:                "Reject"
  };
  return map[(s || "").toUpperCase()] || tc(s) || "Review";
}

function decisionTone(label: string): Tone {
  if (label === "Proceed") return "green";
  if (label.includes("caution") || label.includes("info")) return "gold";
  if (label === "Escalate" || label === "Reject") return "red";
  return "neutral";
}

function priorityTone(p: string): Tone {
  if (p === "critical" || p === "high") return "red";
  if (p === "medium") return "gold";
  return "neutral";
}

function safeStr(v: unknown): string {
  if (!v || typeof v !== "string") return "";
  return v.trim();
}

function safeArr<T>(v: unknown): T[] {
  return Array.isArray(v) ? v.filter(Boolean) as T[] : [];
}

function toolLabel(tool: string): string {
  if (!tool) return "Proposed action";
  const last = tool.split(".").pop() || tool;
  return tc(last.replace(/([a-z])([A-Z])/g, "$1 $2"));
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function AssignedAgentSidebar({ agents }: { agents: AssignedAgent[] }) {
  return (
    <aside className="cd-sidebar">
      <div className="cd-sidebar-card">
        <div className="cd-sidebar-title">Assigned Agent</div>
        {agents.length === 0
          ? <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>No assigned agent yet.</p>
          : agents.map(a => (
            <div key={a.slug} className="cd-agent">
              <span className="cd-agent-dot active" />
              <div className="cd-agent-info">
                <div className="cd-agent-name">{a.name}</div>
                <div className="cd-agent-role">Active</div>
              </div>
            </div>
          ))
        }
      </div>
    </aside>
  );
}

// ── Case Header ────────────────────────────────────────────────────────────────

function CaseDetailHeader({ c }: { c: CaseRecord }) {
  return (
    <div className="cd-header">
      <div className="cd-header-top">
        <h2>{c.title}</h2>
        <Badge tone={statusTone(c.status)}>{tc(c.status)}</Badge>
      </div>
      <div className="meta">
        <Badge tone="blue">{c.caseProfile}</Badge>
        <Badge>{tc(c.caseType)}</Badge>
        <Badge>{c.source}</Badge>
      </div>
      <div className="cd-fields">
        {c.primaryContactName && (
          <div>
            <div className="cd-field-label">Contact</div>
            <div className="cd-field-value">{c.primaryContactName}</div>
          </div>
        )}
        {c.primaryContactEmail && (
          <div>
            <div className="cd-field-label">Email</div>
            <div className="cd-field-value">{c.primaryContactEmail}</div>
          </div>
        )}
        <div>
          <div className="cd-field-label">Created</div>
          <div className="cd-field-value">{relTime(c.createdAt)}</div>
        </div>
        <div>
          <div className="cd-field-label">Updated</div>
          <div className="cd-field-value">{relTime(c.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────────

function OverviewTab({ data }: { data: CaseDetailData }) {
  const intel    = data.latestIntelligence;
  const reasoning = intel?.reasoning || {};
  const decision  = intel?.decision  || {};
  const decLbl    = decisionLabel(safeStr(decision.recommendation));
  const pending   = data.approvals.filter((a: any) => a.status === "pending").length;
  const toolReqs  = safeArr(intel?.execution?.toolPlan?.toolRequests).length;

  return (
    <>
      <div className="cd-overview">
        <div className="cd-stat">
          <div className="cd-stat-label">Lead Score</div>
          <div className="cd-stat-value">
            {reasoning.leadScore
              ? <Badge tone={scoreTone(reasoning.leadScore)}>{reasoning.leadScore}</Badge>
              : <span className="cd-empty-val">—</span>}
          </div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Risk</div>
          <div className="cd-stat-value">
            {reasoning.riskLevel
              ? <Badge tone={riskTone(reasoning.riskLevel)}>{tc(reasoning.riskLevel)}</Badge>
              : <span className="cd-empty-val">—</span>}
          </div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Decision</div>
          <div className="cd-stat-value">
            {decision.recommendation
              ? <Badge tone={decisionTone(decLbl)}>{decLbl}</Badge>
              : <span className="cd-empty-val">—</span>}
          </div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Participants</div>
          <div className="cd-stat-value">{data.participants.length}</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Pending Approvals</div>
          <div className="cd-stat-value">{pending}</div>
        </div>
        <div className="cd-stat">
          <div className="cd-stat-label">Tool Requests</div>
          <div className="cd-stat-value">{toolReqs}</div>
        </div>
      </div>

      {data.events.length > 0 && (
        <div className="panel">
          <p className="cd-section-label">Recent Activity</p>
          {data.events.slice(0, 5).map(evt => (
            <div key={evt.id} className="cd-event">
              <span className={`cd-event-dot ${EVENT_DOT[evt.eventType] || "system"}`} />
              <div>
                <div className="cd-event-type">{EVENT_LABELS[evt.eventType] || tc(evt.eventType)}</div>
                <div className="cd-event-summary">{evt.summary}</div>
                <div className="cd-event-time">{relTime(evt.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ── Timeline Tab ───────────────────────────────────────────────────────────────

function TimelineTab({ events }: { events: CaseEvt[] }) {
  if (!events.length) return <Empty text="No events recorded for this case yet." />;
  return (
    <div className="panel">
      {events.map(evt => (
        <div key={evt.id} className="cd-event">
          <span className={`cd-event-dot ${EVENT_DOT[evt.eventType] || "system"}`} />
          <div>
            <div className="cd-event-type">{EVENT_LABELS[evt.eventType] || tc(evt.eventType)}</div>
            <div className="cd-event-summary">{evt.summary}</div>
            <div className="cd-event-time">
              {relTime(evt.createdAt)} · {evt.actorType}
              {evt.actorId ? ` · ${evt.actorId}` : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Messages Tab ───────────────────────────────────────────────────────────────

function MessagesTab({ messages }: { messages: any[] }) {
  if (!messages.length) return <Empty text="No messages linked to this case yet." />;
  return (
    <>
      {messages.map((msg: any) => (
        <div key={msg.id} className="cd-msg-card">
          <div className="meta" style={{ marginBottom: 10 }}>
            <Badge>{msg.source || "email"}</Badge>
            {msg.senderRole && <Badge>{tc(msg.senderRole)}</Badge>}
            {msg.urgency && (msg.urgency === "high" || msg.urgency === "critical")
              ? <Badge tone="red">{tc(msg.urgency)} urgency</Badge>
              : null
            }
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#94a3b8" }}>
              {relTime(msg.receivedAt || msg.createdAt)}
            </span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: "#334155" }}>
            {msg.senderName}
          </div>
          <div className="cd-msg-body">{msg.body || msg.content || "(no body)"}</div>
        </div>
      ))}
    </>
  );
}

// ── AI Decisions Tab ───────────────────────────────────────────────────────────

function AIDecisionsTab({ intelligence, draft }: { intelligence: any; draft: string | null }) {
  if (!intelligence) {
    return <Empty text="No AI decision data yet. Process a message to generate intelligence." />;
  }

  const reasoning    = intelligence.reasoning || {};
  const decision     = intelligence.decision  || {};
  const planning     = intelligence.planning  || {};
  const draftPayload = intelligence.draft     || {};

  const convType  = safeStr(reasoning.conversationType  || draftPayload.conversationType);
  const convStage = safeStr(reasoning.conversationStage || draftPayload.conversationStage);
  const leadScore = safeStr(reasoning.leadScore  || draftPayload.leadScore);
  const riskLevel = safeStr(reasoning.riskLevel  || draftPayload.riskLevel);
  const rec       = safeStr(decision.recommendation);
  const decLbl    = decisionLabel(rec);
  const rationale = safeStr(decision.rationale   || draftPayload.leadScoreReason);
  const missing   = safeArr<string>(reasoning.missingQualificationItems || draftPayload.missingQualificationItems);
  const nextActs  = safeArr<string>(planning.suggestedNextActions       || draftPayload.suggestedNextActions);
  const adminSum  = safeStr(reasoning.adminReasoningSummary  || draftPayload.adminReasoningSummary);
  const safety    = safeStr(decision.safetyNotes             || draftPayload.safetyNotes);

  return (
    <>
      <div className="cd-overview">
        {convType  && <div className="cd-stat"><div className="cd-stat-label">Conversation</div><div className="cd-stat-text">{convType}</div></div>}
        {convStage && <div className="cd-stat"><div className="cd-stat-label">Stage</div><div className="cd-stat-text">{convStage}</div></div>}
        {leadScore && <div className="cd-stat"><div className="cd-stat-label">Lead Score</div><div className="cd-stat-value"><Badge tone={scoreTone(leadScore)}>{leadScore}</Badge></div></div>}
        {riskLevel && <div className="cd-stat"><div className="cd-stat-label">Risk</div><div className="cd-stat-value"><Badge tone={riskTone(riskLevel)}>{tc(riskLevel)}</Badge></div></div>}
        {rec       && <div className="cd-stat"><div className="cd-stat-label">Decision</div><div className="cd-stat-value"><Badge tone={decisionTone(decLbl)}>{decLbl}</Badge></div></div>}
      </div>

      {rationale && (
        <div className="ops-panel" style={{ marginBottom: 12 }}>
          <h4>Reason</h4>
          <p style={{ margin: 0 }}>{rationale}</p>
        </div>
      )}

      {draft && (
        <div className="ops-panel ops-draft">
          <h4>AI Draft</h4>
          <pre>{draft}</pre>
        </div>
      )}

      {(missing.length > 0 || nextActs.length > 0 || adminSum || safety) && (
        <details className="ops-details">
          <summary>Reasoning Details</summary>
          <div className="ops-detail-grid">
            {missing.length > 0 && (
              <div>
                <strong>Missing qualification</strong>
                <ul>{missing.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
            )}
            {nextActs.length > 0 && (
              <div>
                <strong>Suggested next actions</strong>
                <ol>{nextActs.map((item, i) => <li key={i}>{item}</li>)}</ol>
              </div>
            )}
            {adminSum && <pre>{adminSum}</pre>}
            {safety   && <p><strong>Safety:</strong> {safety}</p>}
          </div>
        </details>
      )}
    </>
  );
}

// ── Tool Plans Tab ─────────────────────────────────────────────────────────────

function ToolPlansTab({ intelligence }: { intelligence: any }) {
  if (!intelligence) return <Empty text="No tool plan data available yet." />;

  const toolPlan = intelligence?.execution?.toolPlan;
  const requests = safeArr<any>(toolPlan?.toolRequests);

  if (!requests.length) return <Empty text="No tool requests in the latest plan." />;

  return (
    <>
      {toolPlan?.summary && (
        <p style={{ color: "#64748b", marginBottom: 16 }}>{toolPlan.summary}</p>
      )}
      <div className="ops-tool-list">
        {requests.map((req: any, i: number) => (
          <div key={req.id || i} className="ops-tool-row">
            <div className="ops-check" aria-hidden="true">✓</div>
            <div>
              <strong>{toolLabel(req.tool)}</strong>
              {req.reason && <p>{req.reason}</p>}
              <div className="meta">
                {req.category   && <Badge>{tc(req.category)}</Badge>}
                {req.priority   && <Badge tone={priorityTone(req.priority)}>{tc(req.priority)}</Badge>}
                {req.riskLevel  && <Badge tone={riskTone(req.riskLevel)}>{tc(req.riskLevel)} risk</Badge>}
                {req.approvalRequired && <Badge tone="red">Approval required</Badge>}
                {req.status     && <Badge>{tc(req.status)}</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Approvals Tab ──────────────────────────────────────────────────────────────

function ApprovalsTab({ approvals, onDecide }: {
  approvals: any[];
  onDecide: (id: string, action: "approve" | "reject") => Promise<void>;
}) {
  if (!approvals.length) return <Empty text="No approvals linked to this case yet." />;
  return (
    <>
      {approvals.map(item => (
        <ApprovalCaseCard key={item.id} item={item} onDecide={onDecide} />
      ))}
    </>
  );
}

// ── Participants Tab ───────────────────────────────────────────────────────────

function ParticipantsTab({ participants }: { participants: CaseParticipant[] }) {
  if (!participants.length) return <Empty text="No participants recorded for this case." />;
  return (
    <div className="panel">
      <div className="cd-participant-header">
        <span>Name</span><span>Role</span><span>Email</span><span>Status</span>
      </div>
      {participants.map(p => (
        <div key={p.id} className="cd-participant-row">
          <span style={{ fontWeight: 600 }}>{p.name}</span>
          <span>{tc(p.role)}</span>
          <span style={{ color: "#64748b" }}>{p.email || "—"}</span>
          <span><Badge tone={p.status === "active" ? "green" : "neutral"}>{p.status}</Badge></span>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function CaseDetail({ id }: { id: string }) {
  const [data, setData]       = useState<CaseDetailData | null>(null);
  const [tab,  setTab]        = useState<Tab>("overview");
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    api<CaseDetailData>(`/api/cases/${id}`)
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, [id]);

  async function decide(approvalId: string, action: "approve" | "reject") {
    await postJson(`/api/approvals/${approvalId}/${action}`, {});
    const fresh = await api<CaseDetailData>(`/api/cases/${id}`);
    setData(fresh);
  }

  if (error) return (
    <><a href="/cases" className="cd-back">← Cases</a><Empty text={`Error loading case: ${error}`} /></>
  );
  if (!data) return (
    <><a href="/cases" className="cd-back">← Cases</a><Empty text="Loading case…" /></>
  );

  return (
    <>
      <a href="/cases" className="cd-back">← Cases</a>
      <div className="cd-shell">
        <div className="cd-main">
          <CaseDetailHeader c={data.case} />
          <div className="cd-tabs">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`cd-tab${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview"     && <OverviewTab data={data} />}
          {tab === "timeline"     && <TimelineTab events={data.events} />}
          {tab === "messages"     && <MessagesTab messages={data.messages} />}
          {tab === "decisions"    && <AIDecisionsTab intelligence={data.latestIntelligence} draft={data.latestDraft} />}
          {tab === "toolplans"    && <ToolPlansTab intelligence={data.latestIntelligence} />}
          {tab === "approvals"    && <ApprovalsTab approvals={data.approvals} onDecide={decide} />}
          {tab === "participants" && <ParticipantsTab participants={data.participants} />}
        </div>
        <AssignedAgentSidebar agents={data.assignedAgents ?? []} />
      </div>
    </>
  );
}
