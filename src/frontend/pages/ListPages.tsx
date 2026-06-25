import { useEffect, useState } from "react";
import { api, patchJson, postJson } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

export function Leads() { return <SimpleList title="CRM" subtitle="Commercial contacts, lead qualification and relationship history." endpoint="/api/leads" create={{ name: "New Lead", role: "buyer", source: "manual", status: "new", leadScore: "C" }} fields={["name", "company", "role", "leadScore", "interestType", "region"]} />; }
export function Tasks() { return <SimpleList title="Tasks" subtitle="Shared human review, follow-ups and specialist agent work queue." endpoint="/api/tasks" create={{ type: "human review required", title: "Review new opportunity", description: "Check qualification and next step.", priority: "medium" }} fields={["title", "type", "status", "priority"]} />; }
export function Memory() { return <SimpleList title="Memory" subtitle="Shared editable relationship memory protected from automatic overwrite." endpoint="/api/memory" create={{ personName: "New Contact", role: "broker", relationshipStatus: "new", trustLevel: "unknown" }} fields={["personName", "company", "role", "relationshipStatus", "trustLevel"]} />; }
export function Knowledge() { return <SimpleList title="Knowledge" subtitle="Reusable company knowledge used by all AI agents during reasoning." endpoint="/api/knowledge" create={{ title: "New Entry", category: "Luxury Mobility", summary: "", content: "", reliabilityLevel: "medium", tags: [] }} fields={["title", "category", "summary", "reliabilityLevel"]} />; }
export function Assets() { return <SimpleList title="Assets" subtitle="Shared asset registry for yachts, vehicles, aircraft, villas, services and future modules." endpoint="/api/assets" create={{ type: "yacht", name: "New Asset", status: "draft", metadata: {} }} fields={["type", "name", "brand", "model", "year", "location", "status", "notes"]} />; }

function SimpleList({ title, subtitle, endpoint, create, fields }: { title: string; subtitle: string; endpoint: string; create: any; fields: string[] }) {
  const [items, setItems] = useState<any[]>([]);
  const load = () => api<any[]>(endpoint).then(setItems);
  useEffect(() => { void load(); }, [endpoint]);
  async function add() { await postJson(endpoint, create); load(); }
  async function patch(id: string, key: string, value: string) { await patchJson(`${endpoint}/${id}`, { [key]: value }); load(); }
  return <>
    <PageHeader title={title} subtitle={subtitle} />
    <div className="toolbar"><button onClick={add}>Create</button></div>
    <section>{items.length ? items.map(item => <article className="item" key={item.id}>{fields.map(field => <label key={field}><span>{field}</span><input value={Array.isArray(item[field]) ? item[field].join(", ") : typeof item[field] === "object" && item[field] ? JSON.stringify(item[field]) : item[field] || ""} onChange={e => patch(item.id, field, e.target.value)} /></label>)}</article>) : <Empty text="Nothing here yet." />}</section>
  </>;
}

type Tone = "neutral" | "gold" | "red" | "green" | "blue";

type ParsedApprovalPayload = {
  draft?: string;
  intelligence?: any;
  conversationType?: string;
  conversationStage?: string;
  leadScore?: string;
  leadScoreReason?: string;
  riskLevel?: string;
  riskReason?: string;
  missingQualificationItems?: string[];
  suggestedNextActions?: string[];
  knowledgeUsed?: any[];
  memoryUsed?: any[];
  safetyNotes?: string;
  adminReasoningSummary?: string;
  provider?: string;
  mocked?: boolean;
  approvalRequired?: boolean;
  [key: string]: unknown;
};

function parsePayload(raw: string): ParsedApprovalPayload | null {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed as ParsedApprovalPayload : null;
  } catch {
    return null;
  }
}

function usable(value: unknown): value is string | number | boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0 && value !== "undefined" && value !== "null" && value !== "[]" && value !== "[object Object]";
  return typeof value === "number" || typeof value === "boolean";
}

function text(value: unknown) {
  return usable(value) ? String(value) : "";
}

function titleCase(value: unknown) {
  const raw = text(value);
  if (!raw) return "";
  return raw.toLowerCase().replace(/[_-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function compactDecision(value: unknown) {
  const normalized = text(value).toUpperCase();
  const labels: Record<string, string> = {
    PROCEED: "Proceed",
    PROCEED_WITH_CAUTION: "Proceed with caution",
    NEED_MORE_INFORMATION: "Need more information",
    ESCALATE: "Escalate",
    REJECT: "Reject",
    ARCHIVE: "Archive"
  };
  return labels[normalized] || "Review required";
}

function decisionTone(label: string): Tone {
  if (label === "Proceed") return "green";
  if (label === "Proceed with caution" || label === "Need more information") return "gold";
  if (label === "Escalate" || label === "Reject") return "red";
  return "neutral";
}

function riskTone(value: unknown): Tone {
  const risk = text(value).toLowerCase();
  if (risk === "high" || risk === "critical") return "red";
  if (risk === "medium") return "gold";
  if (risk === "low") return "green";
  return "neutral";
}

function scoreTone(value: unknown): Tone {
  const score = text(value).toUpperCase();
  if (score === "A" || score === "A+") return "green";
  if (score === "B") return "blue";
  if (score === "C") return "gold";
  return "neutral";
}

function statusTone(value: unknown): Tone {
  const status = text(value).toLowerCase();
  if (status === "approved" || status === "done") return "green";
  if (status === "rejected" || status === "failed") return "red";
  if (status === "pending") return "gold";
  return "neutral";
}

function reliabilityTone(value: unknown): Tone {
  const reliability = text(value).toLowerCase();
  if (reliability === "verified") return "green";
  if (reliability === "high") return "blue";
  return "neutral";
}

function sourceFromTitle(title: unknown) {
  const raw = text(title);
  const match = raw.match(/^Reply draft for\s+(.+)$/i);
  return match?.[1] || "";
}

function agentLabel(intelligence: any, item: any) {
  return titleCase(intelligence?.profileId || intelligence?.agentId || item.agentId || "AI Agent");
}

function findOriginalMessage(payload: ParsedApprovalPayload, intelligence: any) {
  return text(payload.originalMessage || payload.messageBody || payload.sourceMessage || intelligence?.message?.body || intelligence?.input?.message?.body || intelligence?.context?.message?.body);
}

function draftText(payload: ParsedApprovalPayload, intelligence: any) {
  return text(payload.draft || intelligence?.draft?.draft || intelligence?.execution?.draftContent);
}

function actionName(tool: unknown) {
  const raw = text(tool);
  if (!raw) return "Proposed action";
  const last = raw.split(".").pop() || raw;
  return titleCase(last.replace(/([a-z])([A-Z])/g, "$1 $2"));
}

function safeArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value.filter(Boolean) as T[] : [];
}

function FieldBadge({ value, tone = "neutral", prefix }: { value: unknown; tone?: Tone; prefix?: string }) {
  const safe = text(value);
  if (!safe) return null;
  return <Badge tone={tone}>{prefix ? `${prefix} ${safe}` : safe}</Badge>;
}

function CaseHeader({ item, payload, intelligence }: { item: any; payload: ParsedApprovalPayload; intelligence: any }) {
  const perception = intelligence?.perception || {};
  const reasoning = intelligence?.reasoning || {};
  const contact = sourceFromTitle(item.title) || text(perception.senderProfile);
  const conversationType = payload.conversationType || perception.conversationType;
  const stage = payload.conversationStage || perception.conversationStage;
  const score = payload.leadScore || reasoning.leadScore;
  const risk = item.riskLevel || payload.riskLevel || reasoning.riskLevel;

  return <div className="ops-case-header">
    <div>
      <h3>{text(item.title) || "Approval case"}</h3>
      <div className="meta">
        <FieldBadge value={agentLabel(intelligence, item)} tone="blue" />
        <FieldBadge value={contact} />
        <FieldBadge value={titleCase(conversationType)} />
        <FieldBadge value={titleCase(stage)} />
        <FieldBadge value={score} tone={scoreTone(score)} prefix="Lead" />
        <FieldBadge value={risk ? `${titleCase(risk)} Risk` : ""} tone={riskTone(risk)} />
        <FieldBadge value={titleCase(item.status)} tone={statusTone(item.status)} />
      </div>
    </div>
  </div>;
}

function OriginalMessagePanel({ message }: { message: string }) {
  if (!message) return null;
  return <section className="ops-panel">
    <h4>Original Message</h4>
    <p className="ops-message">{message}</p>
  </section>;
}

function DecisionPanel({ payload, intelligence }: { payload: ParsedApprovalPayload; intelligence: any }) {
  const decision = compactDecision(intelligence?.decision?.recommendation);
  const reason = text(intelligence?.decision?.rationale || payload.leadScoreReason || intelligence?.reasoning?.leadScoreReason || intelligence?.reasoning?.riskReason);
  return <section className="ops-panel ops-decision">
    <div className="meta"><Badge tone={decisionTone(decision)}>{decision}</Badge></div>
    {reason && <p>{reason}</p>}
  </section>;
}

function DraftOutputPanel({ draft }: { draft: string }) {
  if (!draft) return <section className="ops-panel"><h4>AI Draft / Output</h4><p className="ops-muted">No draft output is available for this case.</p></section>;
  return <section className="ops-panel ops-draft">
    <h4>AI Draft / Output</h4>
    <pre>{draft}</pre>
  </section>;
}

function ToolPlanChecklist({ toolPlan }: { toolPlan: any }) {
  const requests = safeArray(toolPlan?.toolRequests);
  if (!requests.length) return <section className="ops-panel"><h4>Proposed Next Actions</h4><p className="ops-muted">No proposed tool actions.</p></section>;
  return <section className="ops-panel">
    <h4>Proposed Next Actions</h4>
    {text(toolPlan.summary) && <p className="ops-muted">{toolPlan.summary}</p>}
    <div className="ops-tool-list">
      {requests.map((request: any, index) => <div className="ops-tool-row" key={text(request.id) || index}>
        <div className="ops-check" aria-hidden="true">✓</div>
        <div>
          <strong>{actionName(request.tool)}</strong>
          {text(request.reason) && <p>{request.reason}</p>}
          <div className="meta">
            <FieldBadge value={titleCase(request.category)} />
            <FieldBadge value={titleCase(request.priority)} tone={request.priority === "critical" || request.priority === "high" ? "red" : request.priority === "medium" ? "gold" : "neutral"} />
            <FieldBadge value={request.riskLevel ? `${titleCase(request.riskLevel)} Risk` : ""} tone={riskTone(request.riskLevel)} />
            {request.approvalRequired && <Badge tone="red">Approval required</Badge>}
            <FieldBadge value={titleCase(request.status)} />
          </div>
        </div>
      </div>)}
    </div>
  </section>;
}

function IntelligenceDetailsAccordion({ payload, intelligence }: { payload: ParsedApprovalPayload; intelligence: any }) {
  const reasoning = intelligence?.reasoning || {};
  const planning = intelligence?.planning || {};
  const decision = intelligence?.decision || {};
  const missing = safeArray<string>(payload.missingQualificationItems || reasoning.missingQualificationItems);
  const next = safeArray<string>(payload.suggestedNextActions || planning.suggestedNextActions);
  const confidence = text(payload.confidence || reasoning.confidence || intelligence?.confidence);

  return <details className="ops-details">
    <summary>Intelligence Details</summary>
    <div className="ops-detail-grid">
      {text(payload.leadScoreReason || reasoning.leadScoreReason) && <p><strong>Lead score:</strong> {text(payload.leadScoreReason || reasoning.leadScoreReason)}</p>}
      {text(payload.riskReason || reasoning.riskReason) && <p><strong>Risk:</strong> {text(payload.riskReason || reasoning.riskReason)}</p>}
      {missing.length > 0 && <div><strong>Missing qualification</strong><ul>{missing.map((item, i) => <li key={i}>{item}</li>)}</ul></div>}
      {next.length > 0 && <div><strong>Suggested next actions</strong><ol>{next.map((item, i) => <li key={i}>{item}</li>)}</ol></div>}
      {text(payload.adminReasoningSummary || reasoning.adminReasoningSummary) && <pre>{text(payload.adminReasoningSummary || reasoning.adminReasoningSummary)}</pre>}
      {text(payload.safetyNotes || decision.safetyNotes) && <p><strong>Safety:</strong> {text(payload.safetyNotes || decision.safetyNotes)}</p>}
      {confidence && <p><strong>Confidence:</strong> {confidence}</p>}
    </div>
  </details>;
}

function KnowledgeMemoryAccordion({ payload, intelligence }: { payload: ParsedApprovalPayload; intelligence: any }) {
  const reasoning = intelligence?.reasoning || {};
  const knowledge = safeArray<any>(payload.knowledgeUsed || reasoning.knowledgeUsed);
  const memory = safeArray<any>(payload.memoryUsed || reasoning.memoryUsed);
  if (!knowledge.length && !memory.length) return null;

  return <details className="ops-details">
    <summary>Knowledge & Memory</summary>
    {knowledge.length > 0 && <div className="ops-reference-list">
      <strong>Knowledge used ({knowledge.length})</strong>
      {knowledge.map((entry, index) => <div className="ops-reference" key={index}>
        <span>{text(entry.title) || "Knowledge entry"}</span>
        <div className="meta">
          <FieldBadge value={entry.category} />
          <FieldBadge value={entry.reliability} tone={reliabilityTone(entry.reliability)} />
          <FieldBadge value={entry.relevance} />
        </div>
      </div>)}
    </div>}
    {memory.length > 0 && <div className="ops-reference-list">
      <strong>Memory context ({memory.length})</strong>
      {memory.map((entry, index) => <div className="ops-reference" key={index}>
        <span>{text(entry.personName) || "Memory entry"}</span>
        {text(entry.context) && <p>{entry.context}</p>}
        <div className="meta">
          <FieldBadge value={entry.trustLevel ? `Trust ${entry.trustLevel}` : ""} />
          <FieldBadge value={entry.relevance} />
        </div>
      </div>)}
    </div>}
  </details>;
}

function TechnicalDetailsAccordion({ raw, payload, intelligence }: { raw: string; payload: ParsedApprovalPayload; intelligence: any }) {
  return <details className="ops-details">
    <summary>Technical Details</summary>
    {text(payload.provider || intelligence?.execution?.draftProvider) && <p><strong>Provider:</strong> {text(payload.provider || intelligence?.execution?.draftProvider)}</p>}
    {(payload.mocked === true || intelligence?.execution?.draftMocked === true) && <Badge>mocked</Badge>}
    <pre>{JSON.stringify(payload || raw, null, 2)}</pre>
  </details>;
}

function LegacyDraftApproval({ raw, payload }: { raw: string; payload: ParsedApprovalPayload | null }) {
  if (!payload || !text(payload.draft)) return <pre>{raw}</pre>;
  return <div className="ops-legacy">
    <DraftOutputPanel draft={text(payload.draft)} />
    <IntelligenceDetailsAccordion payload={payload} intelligence={null} />
    <KnowledgeMemoryAccordion payload={payload} intelligence={null} />
    <TechnicalDetailsAccordion raw={raw} payload={payload} intelligence={null} />
  </div>;
}

export function ApprovalCaseCard({ item, onDecide }: { item: any; onDecide: (id: string, action: "approve" | "reject") => Promise<void> }) {
  const payload = parsePayload(item.payload);
  const intelligence = payload?.intelligence;

  if (!payload || !intelligence) {
    return <article className="item ops-case-card">
      <div>
        <CaseHeader item={item} payload={payload || {}} intelligence={null} />
        <LegacyDraftApproval raw={item.payload || ""} payload={payload} />
        <div className="meta" style={{ marginTop: 8 }}><Badge tone={riskTone(item.riskLevel)}>{titleCase(item.riskLevel) || "Risk"}</Badge><Badge tone={statusTone(item.status)}>{titleCase(item.status) || "Status"}</Badge></div>
      </div>
      <OperatorActions item={item} onDecide={onDecide} />
    </article>;
  }

  const original = findOriginalMessage(payload, intelligence);
  const draft = draftText(payload, intelligence);

  return <article className="item ops-case-card">
    <div>
      <CaseHeader item={item} payload={payload} intelligence={intelligence} />
      <OriginalMessagePanel message={original} />
      <DecisionPanel payload={payload} intelligence={intelligence} />
      <DraftOutputPanel draft={draft} />
      <ToolPlanChecklist toolPlan={intelligence.execution?.toolPlan} />
      <IntelligenceDetailsAccordion payload={payload} intelligence={intelligence} />
      <KnowledgeMemoryAccordion payload={payload} intelligence={intelligence} />
      <TechnicalDetailsAccordion raw={item.payload || ""} payload={payload} intelligence={intelligence} />
    </div>
    <OperatorActions item={item} onDecide={onDecide} />
  </article>;
}

function OperatorActions({ item, onDecide }: { item: any; onDecide: (id: string, action: "approve" | "reject") => Promise<void> }) {
  return <div className="actions ops-actions">
    <button onClick={() => onDecide(item.id, "approve")}>Approve</button>
    <button onClick={() => onDecide(item.id, "reject")}>Reject</button>
  </div>;
}

export function Approvals() {
  const [items, setItems] = useState<any[]>([]);
  const load = () => api<any[]>("/api/approvals").then(setItems);
  useEffect(() => { void load(); }, []);
  async function decide(id: string, action: "approve" | "reject") { await postJson(`/api/approvals/${id}/${action}`, {}); load(); }
  return <><PageHeader title="AI Operations Center" subtitle="Human supervision workspace for AI decisions, drafts, proposed actions and approvals." />
    {items.length ? items.map(item => <ApprovalCaseCard key={item.id} item={item} onDecide={decide} />) : <Empty text="No approval items yet." />}
  </>;
}

export function ActivityLog() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/activity").then(setItems); }, []);
  return <><PageHeader title="Analytics" subtitle="Agent activity log, AI operations and system actions." />{items.length ? items.map(item => <article className="row" key={item.id}><strong>{item.action}</strong><span>{item.actor} - {item.details}</span></article>) : <Empty text="No activity yet." />}</>;
}

export function Settings() {
  return <><PageHeader title="Settings" subtitle="Safe V1 controls and future platform placeholders." /><section className="settings"><label>Agent mode<select defaultValue="draft_only"><option value="draft_only">draft only</option><option disabled>approval required</option><option disabled>future auto mode disabled</option></select></label><label>Default language<input defaultValue="English" /></label><label>Default tone<input defaultValue="Senior, discreet, concise" /></label><label>Risk threshold<select defaultValue="medium"><option>low</option><option>medium</option><option>high</option></select></label><label>Company name<input defaultValue="Luxury Mobility AI OS" /></label><label>Connected platforms<input defaultValue="PDYE, YachtWorth, Render, Supabase placeholders" /></label><a className="button-link" href="/settings/ai-providers">AI Providers</a></section></>;
}

export function AiProviders() {
  const [settings, setSettings] = useState<any>();
  useEffect(() => { void api("/api/settings/ai-providers").then(setSettings); }, []);
  if (!settings) return null;
  return <><PageHeader title="AI Providers" subtitle="Provider-agnostic routing by task type with mock fallback in V1." /><section className="stats-grid"><div className="stat"><span>Default</span><strong>{settings.defaultProvider}</strong></div><div className="stat"><span>Fallback</span><strong>{settings.fallbackProvider}</strong></div><div className="stat"><span>Cost</span><strong>{settings.costPriority}</strong></div><div className="stat"><span>Quality</span><strong>{settings.qualityPriority}</strong></div></section><section>{settings.providers.map((p:any) => <article className="item" key={p.provider}><div><h3>{p.provider}</h3><p>{p.strengths.join(", ")}</p><div className="meta"><Badge tone={p.configured ? "green" : "blue"}>{p.configured ? "configured" : "mock/fallback"}</Badge></div></div></article>)}</section></>;
}
