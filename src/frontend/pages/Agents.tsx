import { useEffect, useState } from "react";
import type { AgentDefinition } from "../../shared/types";
import { Badge, Empty, PageHeader } from "../components/UI";
import { api } from "../services/api";

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
  useEffect(() => { void api<AgentDefinition>(`/api/agents/${slug}`).then(setAgent); }, [slug]);
  if (!agent) return null;
  const isCarRental = agent.slug === "car-rental";
  const isYachtBroker = agent.slug === "yacht-broker";
  return <>
    <PageHeader title={agent.name} subtitle={agent.description} />
    <section className="two-col">
      <div className="panel"><h2>Module Status</h2><div className="meta"><Badge tone={agent.status === "active" ? "green" : "blue"}>{agent.status}</Badge><Badge>{agent.category}</Badge><Badge tone="gold">{agent.riskLevel} risk</Badge></div><p>{agent.defaultTone}</p></div>
      <div className="panel"><h2>Action Model</h2><p>Allowed: {agent.allowedActions.join(", ")}</p><p>Blocked: {agent.blockedActions.join(", ")}</p></div>
    </section>
    {isYachtBroker && <section><h2>Yacht Broker Agent</h2><p>This is the first active module. It owns yacht-specific brokerage logic while using shared inbox, CRM, memory, tasks, approvals, assets and knowledge.</p></section>}
    {isCarRental && <section><h2>Planned Module</h2><p>Future architecture covers fleet database, vehicle profiles, daily/weekly/monthly prices, deposits, insurance, included kilometers, chauffeur pricing, airport transfers, weddings, delivery/pickup, availability, rental contract drafts and client qualification.</p></section>}
  </>;
}
