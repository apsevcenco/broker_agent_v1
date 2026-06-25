import { useEffect, useState } from "react";
import { api, patchJson, postJson } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

export function Leads() { return <SimpleList title="Leads / CRM" subtitle="Shared profiles, qualification and relationship history across agents." endpoint="/api/leads" create={{ name: "New Lead", role: "buyer", source: "manual", status: "new", leadScore: "C" }} fields={["name", "company", "role", "leadScore", "interestType", "region"]} />; }
export function Tasks() { return <SimpleList title="Tasks" subtitle="Shared human review, follow-ups and specialist agent work queue." endpoint="/api/tasks" create={{ type: "human review required", title: "Review new opportunity", description: "Check qualification and next step.", priority: "medium" }} fields={["title", "type", "status", "priority"]} />; }
export function Memory() { return <SimpleList title="Memory" subtitle="Shared editable relationship memory protected from automatic overwrite." endpoint="/api/memory" create={{ personName: "New Contact", role: "broker", relationshipStatus: "new", trustLevel: "unknown" }} fields={["personName", "company", "role", "relationshipStatus", "trustLevel"]} />; }
export function Knowledge() { return <SimpleList title="Knowledge Base" subtitle="Shared knowledge entries for luxury mobility agents." endpoint="/api/knowledge" create={{ title: "New Entry", category: "Luxury Mobility", summary: "", content: "", reliabilityLevel: "medium", tags: [] }} fields={["title", "category", "summary", "reliabilityLevel"]} />; }
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

type DraftPayload = {
  draft: string;
  // PBRE fields (present for AI-generated drafts; absent for legacy/template items)
  conversationType?: string;
  conversationStage?: string;
  leadScore?: string;
  leadScoreReason?: string;
  riskReason?: string;
  missingQualificationItems?: string[];
  suggestedNextActions?: string[];
  adminReasoningSummary?: string;
  // Core fields
  riskLevel: string;
  knowledgeUsed: { title: string; category: string; reliability: string; relevance?: string }[];
  memoryUsed: { personName: string; trustLevel: string; context: string; relevance?: string }[];
  approvalRequired: boolean;
  safetyNotes: string;
  provider: string;
  mocked: boolean;
};

function parseDraft(raw: string): DraftPayload | null {
  try { const p = JSON.parse(raw); return typeof p?.draft === "string" ? p as DraftPayload : null; }
  catch { return null; }
}

function reliabilityTone(r: string): "green" | "blue" | "neutral" {
  if (r === "verified") return "green";
  if (r === "high") return "blue";
  return "neutral";
}

function kRelevanceTone(r: string): "green" | "blue" | "neutral" {
  if (r === "high") return "green";
  if (r === "medium") return "blue";
  return "neutral";
}

function mRelevanceTone(r: string): "red" | "blue" | "neutral" {
  if (r === "critical") return "red";
  if (r === "useful") return "blue";
  return "neutral";
}

function leadScoreTone(s: string): "green" | "blue" | "gold" | "neutral" {
  if (s === "A" || s === "A+") return "green";
  if (s === "B") return "blue";
  if (s === "C") return "gold";
  return "neutral";
}

function DraftPayloadView({ raw }: { raw: string }) {
  const p = parseDraft(raw);
  if (!p) return <pre style={{ whiteSpace: "pre-wrap" }}>{raw}</pre>;

  const isPBRE = Boolean(p.conversationType || p.leadScore);

  return <div>
    {isPBRE && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
      {p.conversationType && <Badge tone="blue">{p.conversationType}</Badge>}
      {p.conversationStage && <Badge>{p.conversationStage}</Badge>}
      {p.leadScore && <Badge tone={leadScoreTone(p.leadScore)}>Score {p.leadScore}</Badge>}
    </div>}
    {p.leadScoreReason && <p style={{ fontSize: 13, margin: "0 0 4px", color: "#64748b" }}><strong>Lead:</strong> {p.leadScoreReason}</p>}
    {p.riskReason && <p style={{ fontSize: 13, margin: "0 0 10px", color: "#64748b" }}><strong>Risk:</strong> {p.riskReason}</p>}

    <h4 style={{ margin: "0 0 6px" }}>Draft reply</h4>
    <pre style={{ whiteSpace: "pre-wrap", marginBottom: 10 }}>{p.draft}</pre>

    {(p.missingQualificationItems?.length ?? 0) > 0 && <div style={{ marginBottom: 10 }}>
      <strong style={{ fontSize: 13 }}>Missing qualification ({p.missingQualificationItems!.length})</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
        {p.missingQualificationItems!.map((item, i) => <li key={i} style={{ fontSize: 13 }}>{item}</li>)}
      </ul>
    </div>}

    {(p.suggestedNextActions?.length ?? 0) > 0 && <div style={{ marginBottom: 10 }}>
      <strong style={{ fontSize: 13 }}>Suggested next actions</strong>
      <ol style={{ margin: "4px 0 0", paddingLeft: 18 }}>
        {p.suggestedNextActions!.map((action, i) => <li key={i} style={{ fontSize: 13 }}>{action}</li>)}
      </ol>
    </div>}

    {p.safetyNotes && <div style={{ background: "#fff8e6", border: "1px solid #d5b56f", borderRadius: 6, padding: "8px 12px", marginBottom: 10, fontSize: 13 }}><strong>Safety:</strong> {p.safetyNotes}</div>}

    {p.knowledgeUsed.length > 0 && <div style={{ marginBottom: 8 }}>
      <strong style={{ fontSize: 13 }}>Knowledge used ({p.knowledgeUsed.length})</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
        {p.knowledgeUsed.map((k, i) => <li key={i} style={{ marginBottom: 3, fontSize: 13 }}>
          {k.title} <span style={{ color: "#64748b" }}>({k.category})</span>{" "}
          <Badge tone={reliabilityTone(k.reliability)}>{k.reliability}</Badge>{" "}
          {k.relevance && <Badge tone={kRelevanceTone(k.relevance)}>{k.relevance}</Badge>}
        </li>)}
      </ul>
    </div>}

    {p.memoryUsed.length > 0 && <div style={{ marginBottom: 8 }}>
      <strong style={{ fontSize: 13 }}>Memory context ({p.memoryUsed.length})</strong>
      <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
        {p.memoryUsed.map((m, i) => <li key={i} style={{ fontSize: 13 }}>
          {m.personName} <span style={{ color: "#64748b" }}>trust: {m.trustLevel}</span>{" "}
          {m.relevance && <Badge tone={mRelevanceTone(m.relevance)}>{m.relevance}</Badge>}
          {m.context ? ` — ${m.context}` : ""}
        </li>)}
      </ul>
    </div>}

    {p.adminReasoningSummary && <details style={{ marginBottom: 8 }}>
      <summary style={{ fontSize: 13, cursor: "pointer", color: "#64748b" }}>Admin reasoning</summary>
      <pre style={{ fontSize: 12, whiteSpace: "pre-wrap", margin: "6px 0 0", padding: "8px 12px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4 }}>{p.adminReasoningSummary}</pre>
    </details>}

    <div className="meta" style={{ marginTop: 8 }}>
      <Badge tone={p.mocked ? "neutral" : "green"}>{p.provider}</Badge>
      {p.mocked && <Badge>mocked</Badge>}
      {p.approvalRequired && <Badge tone="red">approval required</Badge>}
    </div>
  </div>;
}

export function Approvals() {
  const [items, setItems] = useState<any[]>([]);
  const load = () => api<any[]>("/api/approvals").then(setItems);
  useEffect(() => { void load(); }, []);
  async function decide(id: string, action: "approve" | "reject") { await postJson(`/api/approvals/${id}/${action}`, {}); load(); }
  return <><PageHeader title="Approvals" subtitle="No high-risk action executes without admin review." />
    {items.length ? items.map(item => <article className="item" key={item.id}>
      <div>
        <h3>{item.title}</h3>
        <DraftPayloadView raw={item.payload} />
        <div className="meta" style={{ marginTop: 8 }}><Badge tone="red">{item.riskLevel}</Badge><Badge>{item.status}</Badge></div>
      </div>
      <div className="actions">
        <button onClick={() => decide(item.id, "approve")}>Approve</button>
        <button onClick={() => decide(item.id, "reject")}>Reject</button>
      </div>
    </article>) : <Empty text="No approval items yet." />}
  </>;
}

export function ActivityLog() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { api<any[]>("/api/activity").then(setItems); }, []);
  return <><PageHeader title="Activity Log" subtitle="Agent, admin and system actions." />{items.length ? items.map(item => <article className="row" key={item.id}><strong>{item.action}</strong><span>{item.actor} - {item.details}</span></article>) : <Empty text="No activity yet." />}</>;
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
