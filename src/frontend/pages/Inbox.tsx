import { useEffect, useState } from "react";
import type { InboxMessage, LeadRole, Source, Urgency } from "../../shared/types";
import { api, postJson } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

const sources: Source[] = ["email", "LinkedIn", "Instagram", "WhatsApp", "PDYE", "website", "manual"];
const roles: LeadRole[] = ["buyer", "seller", "broker", "owner", "captain", "owner representative", "investor", "shipyard", "supplier", "unknown"];
const urgencies: Urgency[] = ["low", "medium", "high", "critical"];

export function Inbox() {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [form, setForm] = useState({ source: "manual", senderName: "", senderCompany: "", senderRole: "unknown", body: "", relatedYacht: "", relatedDeal: "", urgency: "medium" });
  const load = () => api<InboxMessage[]>("/api/inbox").then(setMessages);
  useEffect(() => { void load(); }, []);
  async function submit() { await postJson("/api/inbox/message", form); setForm({ ...form, senderName: "", senderCompany: "", body: "", relatedYacht: "", relatedDeal: "" }); load(); }
  async function classify(id: string) { await postJson(`/api/inbox/${id}/classify`, {}); load(); }
  async function suggest(id: string) { await postJson(`/api/inbox/${id}/suggest-reply`, {}); load(); }
  return <>
    <PageHeader title="Agent Inbox" subtitle="Manual intake for future email, social, PDYE and website channels." />
    <section className="form-grid">
      <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}>{sources.map(s => <option key={s}>{s}</option>)}</select>
      <input placeholder="Sender name" value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} />
      <input placeholder="Company" value={form.senderCompany} onChange={e => setForm({ ...form, senderCompany: e.target.value })} />
      <select value={form.senderRole} onChange={e => setForm({ ...form, senderRole: e.target.value })}>{roles.map(r => <option key={r}>{r}</option>)}</select>
      <input placeholder="Related yacht" value={form.relatedYacht} onChange={e => setForm({ ...form, relatedYacht: e.target.value })} />
      <input placeholder="Related deal" value={form.relatedDeal} onChange={e => setForm({ ...form, relatedDeal: e.target.value })} />
      <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })}>{urgencies.map(u => <option key={u}>{u}</option>)}</select>
      <textarea placeholder="Message body" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
      <button onClick={submit} disabled={!form.senderName || !form.body}>Create message</button>
    </section>
    <section>{messages.length ? messages.map(m => <article className="item" key={m.id}><div><h3>{m.senderName}</h3><p>{m.body}</p><div className="meta"><Badge>{m.source}</Badge><Badge tone={m.riskLevel === "critical" ? "red" : "blue"}>{m.riskLevel || m.status}</Badge>{m.classification && <Badge tone="gold">{m.classification}</Badge>}</div></div><div className="actions"><button onClick={() => classify(m.id)}>Classify</button><button onClick={() => suggest(m.id)}>Suggest reply</button></div></article>) : <Empty text="No inbox messages yet." />}</section>
  </>;
}
