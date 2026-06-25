import { useEffect, useMemo, useState } from "react";
import type { AgentDefinition, InboxMessage, LeadRole, Source, Urgency } from "../../shared/types";
import { api, postJson } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

const sources: Source[] = ["email", "LinkedIn", "Instagram", "WhatsApp", "PDYE", "website", "manual"];
const roles: LeadRole[] = ["buyer", "seller", "broker", "owner", "captain", "owner representative", "investor", "shipyard", "supplier", "unknown"];
const urgencies: Urgency[] = ["low", "medium", "high", "critical"];
const defaultAgentId = "yacht-broker-agent";

export function Inbox() {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [agentFilter, setAgentFilter] = useState("all");
  const [form, setForm] = useState({ agentId: defaultAgentId, source: "manual", senderName: "", senderCompany: "", senderRole: "unknown", body: "", relatedYacht: "", relatedDeal: "", urgency: "medium" });
  const agentName = useMemo(() => new Map(agents.map(agent => [agent.id, agent.name])), [agents]);
  const load = () => {
    void api<AgentDefinition[]>("/api/agents").then(items => {
      setAgents(items);
      if (!items.some(agent => agent.id === form.agentId) && items[0]) setForm(current => ({ ...current, agentId: items[0].id }));
    });
    const query = agentFilter === "all" ? "" : `?agentId=${encodeURIComponent(agentFilter)}`;
    void api<InboxMessage[]>(`/api/inbox${query}`).then(setMessages);
  };
  useEffect(load, [agentFilter]);
  async function submit() {
    await postJson("/api/inbox/message", form);
    setForm({ ...form, senderName: "", senderCompany: "", body: "", relatedYacht: "", relatedDeal: "" });
    load();
  }
  async function classify(id: string) { await postJson(`/api/inbox/${id}/classify`, {}); load(); }
  async function suggest(id: string) { await postJson(`/api/inbox/${id}/suggest-reply`, {}); load(); }
  return <>
    <PageHeader title="Agent Inbox" subtitle="Manual intake routed to the right specialist agent." />
    <section className="form-grid">
      <select value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })}>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
      <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>{sources.map(s => <option key={s}>{s}</option>)}</select>
      <input placeholder="Sender name" value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} />
      <input placeholder="Company" value={form.senderCompany} onChange={e => setForm({ ...form, senderCompany: e.target.value })} />
      <select value={form.senderRole} onChange={e => setForm({ ...form, senderRole: e.target.value })}>{roles.map(r => <option key={r}>{r}</option>)}</select>
      <input placeholder="Related asset / yacht" value={form.relatedYacht} onChange={e => setForm({ ...form, relatedYacht: e.target.value })} />
      <input placeholder="Related deal" value={form.relatedDeal} onChange={e => setForm({ ...form, relatedDeal: e.target.value })} />
      <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>{urgencies.map(u => <option key={u}>{u}</option>)}</select>
      <textarea placeholder="Message body" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
      <button onClick={submit} disabled={!form.senderName || !form.body}>Create message</button>
    </section>
    <div className="toolbar"><select value={agentFilter} onChange={e => setAgentFilter(e.target.value)}><option value="all">All agents</option>{agents.map(agent => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select></div>
    <section>{messages.length ? messages.map(m => <article className="item" key={m.id}><div><h3>{m.senderName}</h3><p>{m.body}</p><div className="meta"><Badge>{agentName.get(m.agentId || "") || "Unassigned"}</Badge><Badge>{m.source}</Badge><Badge tone={m.riskLevel === "critical" ? "red" : "blue"}>{m.riskLevel || m.status}</Badge>{m.classification && <Badge tone="gold">{m.classification}</Badge>}</div></div><div className="actions"><button onClick={() => classify(m.id)}>Classify</button><button onClick={() => suggest(m.id)}>Suggest reply</button></div></article>) : <Empty text="No inbox messages yet." />}</section>
  </>;
}
