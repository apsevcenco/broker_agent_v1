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

export function Approvals() {
  const [items, setItems] = useState<any[]>([]);
  const load = () => api<any[]>("/api/approvals").then(setItems);
  useEffect(() => { void load(); }, []);
  async function decide(id: string, action: "approve" | "reject") { await postJson(`/api/approvals/${id}/${action}`, {}); load(); }
  return <><PageHeader title="Approvals" subtitle="No high-risk action executes without admin review." />{items.length ? items.map(item => <article className="item" key={item.id}><div><h3>{item.title}</h3><pre>{item.payload}</pre><div className="meta"><Badge tone="red">{item.riskLevel}</Badge><Badge>{item.status}</Badge></div></div><div className="actions"><button onClick={() => decide(item.id, "approve")}>Approve</button><button onClick={() => decide(item.id, "reject")}>Reject</button></div></article>) : <Empty text="No approval items yet." />}</>;
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
