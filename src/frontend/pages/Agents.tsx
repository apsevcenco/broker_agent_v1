import { useEffect, useState } from "react";
import type { AgentDefinition } from "../../shared/types";
import { Badge, Empty, PageHeader, Stat } from "../components/UI";
import { api, postJson } from "../services/api";

type AgentKnowledgeProfile = {
  mission: string;
  domainKnowledge: string[];
  workflows: string[];
  qualificationSignals: string[];
  riskRules: string[];
  vocabulary: string[];
  draftTemplates: string[];
  blockedBehaviors: string[];
};

type AgentWorkspace = {
  agent: AgentDefinition;
  counts: { inbox: number; leads: number; tasks: number; approvals: number; memory: number; knowledge: number; assets: number };
  recent: { memory: any[]; tasks: any[]; approvals: any[]; activity: any[] };
};

export function Agents() {
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  useEffect(() => { void api<AgentDefinition[]>("/api/agents").then(setAgents); }, []);
  return <>
    <PageHeader title="Agents" subtitle="Registry of specialized luxury mobility agents sharing one core OS." />
    <section>{agents.length ? agents.map(agent => <article className="item" key={agent.id}>
      <div>
        <h3>{agent.name}</h3>
        <p>{agent.description}</p>
        <div className="meta"><Badge tone={agent.status === "active" ? "green" : "blue"}>{agent.status}</Badge><Badge>{agent.category}</Badge><Badge tone="gold">{agent.riskLevel} risk</Badge></div>
      </div>
      <div className="actions"><a className="button-link" href={`/agents/${agent.slug}`}>Open</a></div>
    </article>) : <Empty text="No agents registered yet." />}</section>
  </>;
}

export function AgentDetail({ slug }: { slug: string }) {
  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [workspace, setWorkspace] = useState<AgentWorkspace | null>(null);
  const [profile, setProfile] = useState<AgentKnowledgeProfile | null>(null);
  const [memoryName, setMemoryName] = useState("");
  const load = () => {
    void api<AgentDefinition>(`/api/agents/${slug}`).then(setAgent);
    void api<AgentWorkspace>(`/api/agents/${slug}/workspace`).then(setWorkspace);
    void api<{ profile: AgentKnowledgeProfile | null }>(`/api/agents/${slug}/profile`).then(data => setProfile(data.profile));
  };
  useEffect(load, [slug]);
  if (!agent) return null;
  const isCarRental = agent.slug === "car-rental";
  const isYachtBroker = agent.slug === "yacht-broker";
  const isClientAcquisition = agent.slug === "client-acquisition";
  async function addMemory() {
    if (!agent || !memoryName.trim()) return;
    await postJson("/api/memory", { agentId: agent.id, personName: memoryName.trim(), role: "unknown", relationshipStatus: "new", trustLevel: "unknown", pastInteractions: [] });
    setMemoryName("");
    load();
  }
  return <>
    <PageHeader title={agent.name} subtitle={agent.description} />
    <section className="two-col">
      <div className="panel"><h2>Module Status</h2><div className="meta"><Badge tone={agent.status === "active" ? "green" : "blue"}>{agent.status}</Badge><Badge>{agent.category}</Badge><Badge tone="gold">{agent.riskLevel} risk</Badge></div><p>{agent.defaultTone}</p></div>
      <div className="panel"><h2>Action Model</h2><p>Allowed: {agent.allowedActions.join(", ")}</p><p>Blocked: {agent.blockedActions.join(", ")}</p></div>
    </section>
    {profile && <section className="two-col">
      <div className="panel"><h2>Bootstrap Knowledge</h2><p>{profile.mission}</p><h3>Core workflows</h3><ul>{profile.workflows.map(item => <li key={item}>{item}</li>)}</ul><h3>Domain knowledge</h3><ul>{profile.domainKnowledge.map(item => <li key={item}>{item}</li>)}</ul></div>
      <div className="panel"><h2>Risk & Language</h2><h3>Risk rules</h3><ul>{profile.riskRules.map(item => <li key={item}>{item}</li>)}</ul><h3>Qualification signals</h3><p>{profile.qualificationSignals.join(", ")}</p><h3>Vocabulary</h3><p>{profile.vocabulary.join(", ")}</p></div>
    </section>}
    {workspace && <section className="stats-grid">
      <Stat label="Inbox" value={workspace.counts.inbox} />
      <Stat label="Leads" value={workspace.counts.leads} />
      <Stat label="Tasks" value={workspace.counts.tasks} />
      <Stat label="Approvals" value={workspace.counts.approvals} />
      <Stat label="Memory" value={workspace.counts.memory} />
      <Stat label="Assets" value={workspace.counts.assets} />
    </section>}
    <section className="two-col">
      <div className="panel"><h2>Relationship Memory</h2><div className="toolbar"><input placeholder="Person or company" value={memoryName} onChange={e => setMemoryName(e.target.value)} /><button onClick={addMemory}>Add</button></div>{workspace?.recent.memory.length ? workspace.recent.memory.map(item => <article className="row" key={item.id}><strong>{item.personName}</strong><span>{item.relationshipStatus}</span></article>) : <Empty text="No relationship memory entries for this agent yet." />}</div>
      <div className="panel"><h2>Recent Tasks</h2>{workspace?.recent.tasks.length ? workspace.recent.tasks.map(item => <article className="row" key={item.id}><strong>{item.title}</strong><span>{item.status}</span></article>) : <Empty text="No recent tasks for this agent." />}</div>
    </section>
    {isYachtBroker && <section><h2>Yacht Broker Agent</h2><p>This is the first active module. It owns yacht-specific brokerage logic while using shared inbox, CRM, memory, tasks, approvals, assets and knowledge.</p></section>}
    {isCarRental && <section><h2>Planned Module</h2><p>Future architecture covers fleet database, vehicle profiles, daily/weekly/monthly prices, deposits, insurance, included kilometers, chauffeur pricing, airport transfers, weddings, delivery/pickup, availability, rental contract drafts and client qualification.</p></section>}
    {isClientAcquisition && <section><h2>Safe Outreach Module</h2><p>This planned agent researches public prospects, prepares compliant outreach drafts, suggests target segments and creates follow-up tasks. In V1 it must not send messages, join chats, post ads, scrape platforms, bypass limits or impersonate people without explicit human-controlled integrations and approval.</p></section>}
  </>;
}
