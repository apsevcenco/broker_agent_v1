import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Badge, Empty, PageHeader, Stat } from "../components/UI";

export function Dashboard() {
  const [data, setData] = useState<any>();
  useEffect(() => { api("/api/dashboard/summary").then(setData); }, []);
  if (!data) return null;
  return <>
    <PageHeader title="Dashboard" subtitle="Global command center for supervised luxury mobility agents." />
    <section className="stats-grid">
      <Stat label="Agents" value={`${data.activeAgents || 0}/${data.totalAgents || 0}`} />
      <Stat label="Assets" value={data.totalAssets || 0} />
      <Stat label="Total leads" value={data.totalLeads} />
      <Stat label="Hot leads" value={data.hotLeads} />
      <Stat label="Pending tasks" value={data.pendingTasks} />
      <Stat label="Pending approvals" value={data.pendingApprovals} />
      <Stat label="Knowledge entries" value={data.knowledgeBaseStatus.entries} />
    </section>
    <section className="two-col">
      <div><h2>Recent conversations</h2>{data.recentConversations.length ? data.recentConversations.map((m:any) => <article className="row" key={m.id}><strong>{m.senderName}</strong><span>{m.classification || m.status}</span></article>) : <Empty text="No conversations yet." />}</div>
      <div><h2>Agent alerts</h2>{data.agentAlerts.length ? data.agentAlerts.map((a:any) => <article className="row" key={a.id}><strong>{a.title}</strong><Badge tone="red">{a.riskLevel}</Badge></article>) : <Empty text="No high-risk pending approvals." />}</div>
    </section>
    <section><h2>Recent agent activity</h2>{data.recentAgentActivity.length ? data.recentAgentActivity.map((a:any) => <article className="row" key={a.id}><strong>{a.action}</strong><span>{a.details}</span></article>) : <Empty text="Activity will appear after first action." />}</section>
  </>;
}
