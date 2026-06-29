import { useEffect, useState } from "react";
import type { AgentDefinition, ApprovalItem, AgentTask, KnowledgeEntry, ManagedAsset, MemoryEntry } from "../../shared/types";
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
  recent: { memory: MemoryEntry[]; tasks: AgentTask[]; approvals: ApprovalItem[]; activity: any[] };
};

type AgentContext = {
  agent: AgentDefinition;
  profile: AgentKnowledgeProfile | null;
  knowledge: KnowledgeEntry[];
  memory: MemoryEntry[];
  assets: ManagedAsset[];
  tasks: AgentTask[];
  approvals: ApprovalItem[];
  safety: { draftOnly: boolean; requiresApproval: string[] };
};
type LeadSourceStatus = "available" | "not configured" | "coming later";

type LeadSourceConfig = {
  id: string;
  name: string;
  category: string;
  status: LeadSourceStatus;
  connectionMode: "API" | "Manual import" | "Public search" | "CSV" | "Future integration";
  safetyNote: string;
  requiredSetup: string[];
  allowedUse: string[];
  blockedUse: string[];
  notes: string;
};

type LeadSourcesResponse = {
  safetyRules: string[];
  sources: LeadSourceConfig[];
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
  const [context, setContext] = useState<AgentContext | null>(null);
  const [memoryName, setMemoryName] = useState("");
  const [campaignName, setCampaignName] = useState("Luxury Mobility Lead Search");
  const [businessLine, setBusinessLine] = useState<"yacht_sale" | "yacht_charter" | "car_rental" | "mixed">("mixed");
  const [offerBrief, setOfferBrief] = useState("");
  const [targetSegments, setTargetSegments] = useState("");
  const [geography, setGeography] = useState("");
  const [maxResults, setMaxResults] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchStatus, setSearchStatus] = useState<string | null>(null);
  const [leadSources, setLeadSources] = useState<LeadSourcesResponse | null>(null);
  const [selectedLeadSourceId, setSelectedLeadSourceId] = useState<string | null>(null);
  const load = () => {
    void api<AgentDefinition>(`/api/agents/${slug}`).then(setAgent);
    void api<AgentWorkspace>(`/api/agents/${slug}/workspace`).then(setWorkspace);
    void api<{ profile: AgentKnowledgeProfile | null }>(`/api/agents/${slug}/profile`).then(data => setProfile(data.profile));
    void api<AgentContext>(`/api/agents/${slug}/context`).then(setContext);
    void api<LeadSourcesResponse>("/api/lead-hunter/sources").then(data => {
      setLeadSources(data);
      setSelectedLeadSourceId(current => current || data.sources[0]?.id || null);
    });
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
  const selectedLeadSource = leadSources?.sources.find(source => source.id === selectedLeadSourceId) || null;
  const sourceStatusTone = (status: LeadSourceStatus) => status === "available" ? "green" : status === "not configured" ? "gold" : "blue";

  async function runLeadSearch() {
    setSearchStatus("Running public web lead search...");
    try {
      const result = await postJson<{ setupRequired?: boolean; message?: string; created?: number; processed?: number; accepted?: number; filtered?: number }>("/api/lead-hunter/search/run", {
        campaignName,
        businessLine,
        offerBrief,
        targetSegments,
        geography,
        maxResults,
        perQuery: 4,
        searchQueries: searchQuery.trim() ? [searchQuery.trim()] : undefined
      });
      if (result.setupRequired) {
        setSearchStatus(result.message || "Search provider setup is required.");
      } else {
        setSearchStatus(`Created ${result.created ?? 0} approval item(s). Processed ${result.processed ?? 0}, accepted ${result.accepted ?? 0}, filtered ${result.filtered ?? 0}.`);
        load();
      }
    } catch (error) {
      setSearchStatus(error instanceof Error ? error.message : "Lead search failed.");
    }
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
    {context && <section className="two-col">
      <div className="panel"><h2>Loaded Knowledge Memory</h2><p>{context.knowledge.length} verified operating entries are available to this agent.</p>{context.knowledge.length ? context.knowledge.slice(0, 6).map(item => <article className="row" key={item.id}><strong>{item.title}</strong><span>{item.category}</span></article>) : <Empty text="Run the Yacht Broker Agent memory migration in Supabase to load entries." />}</div>
      <div className="panel"><h2>Context Guardrails</h2><p>Draft only: {context.safety.draftOnly ? "yes" : "no"}</p><h3>Approval required for</h3><ul>{context.safety.requiresApproval.map(item => <li key={item}>{item}</li>)}</ul></div>
    </section>}
    {workspace && <section className="stats-grid">
      <Stat label="Inbox" value={workspace.counts.inbox} />
      <Stat label="Leads" value={workspace.counts.leads} />
      <Stat label="Tasks" value={workspace.counts.tasks} />
      <Stat label="Approvals" value={workspace.counts.approvals} />
      <Stat label="Memory" value={workspace.counts.memory} />
      <Stat label="Knowledge" value={workspace.counts.knowledge} />
      <Stat label="Assets" value={workspace.counts.assets} />
    </section>}
    <section className="two-col">
      <div className="panel"><h2>Relationship Memory</h2><div className="toolbar"><input placeholder="Person or company" value={memoryName} onChange={e => setMemoryName(e.target.value)} /><button onClick={addMemory}>Add</button></div>{workspace?.recent.memory.length ? workspace.recent.memory.map(item => <article className="row" key={item.id}><strong>{item.personName}</strong><span>{item.relationshipStatus}</span></article>) : <Empty text="No relationship memory entries for this agent yet." />}</div>
      <div className="panel"><h2>Recent Tasks</h2>{workspace?.recent.tasks.length ? workspace.recent.tasks.map(item => <article className="row" key={item.id}><strong>{item.title}</strong><span>{item.status}</span></article>) : <Empty text="No recent tasks for this agent." />}</div>
    </section>
    {isYachtBroker && <>
      <section>
        <h2>Agent Control Center</h2>
        <div className="panel" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>How to operate this agent</h3>
          <p>Every enquiry follows this workflow. Complete each step in order before moving to the next.</p>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {["Inbox", "Classification", "Lead Score", "Draft Reply", "Approval", "Memory Update"].flatMap((step, i, arr) =>
              i < arr.length - 1
                ? [
                    <span key={step} style={{ background: "#071421", color: "#d5b56f", fontWeight: 700, padding: "6px 14px", borderRadius: 6, fontSize: 13, whiteSpace: "nowrap" }}>{step}</span>,
                    <span key={`${step}-arrow`} style={{ color: "#b8924b", fontWeight: 900, fontSize: 18, lineHeight: 1 }}>â†’</span>
                  ]
                : [<span key={step} style={{ background: "#071421", color: "#d5b56f", fontWeight: 700, padding: "6px 14px", borderRadius: 6, fontSize: 13, whiteSpace: "nowrap" }}>{step}</span>]
            )}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
          {([
            { step: "1", title: "Add Incoming Message", desc: "Paste or type an enquiry from a buyer, seller, broker or captain into the inbox.", href: "/inbox", label: "Go to Inbox" },
            { step: "2", title: "Classify Message", desc: "Auto-classify the message type: buyer inquiry, broker cooperation, seller inquiry, NDA step.", href: "/inbox", label: "Open Inbox" },
            { step: "3", title: "Generate Draft Reply", desc: "Use Suggest Reply to produce a knowledge-matched draft. All drafts are internal until approved.", href: "/inbox", label: "Open Inbox" },
            { step: "4", title: "Create / Update Lead", desc: "Register the enquiry as a CRM lead with stage, budget and qualification status.", href: "/leads", label: "Go to Leads" },
            { step: "5", title: "Create Task", desc: "Log the next action: follow-up, document request, qualification call or NDA step.", href: "/tasks", label: "Go to Tasks" },
            { step: "6", title: "Send to Approval", desc: "All drafts enter the approval queue. No communication leaves without admin review.", href: "/approvals", label: "Go to Approvals" },
            { step: "7", title: "Add Memory Note", desc: "Record relationship context: trust level, past interactions, role and contact style.", href: "/memory", label: "Go to Memory" },
            { step: "T", title: "Test Knowledge Retrieval", desc: "Verify which knowledge entries match a given query before generating a draft reply.", href: "/knowledge-engine", label: "Knowledge Engine" },
          ] as const).map(card => (
            <div key={card.step} className="panel" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ color: "#b8924b", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {card.step === "T" ? "Tool" : `Step ${card.step}`}
              </div>
              <h3 style={{ margin: 0 }}>{card.title}</h3>
              <p style={{ margin: 0, flex: 1 }}>{card.desc}</p>
              <a className="button-link" href={card.href} style={{ marginTop: 4, alignSelf: "flex-start" }}>{card.label}</a>
            </div>
          ))}
        </div>
      </section>
      <section><h2>Yacht Broker Agent</h2><p>This is the first active module. It owns yacht-specific brokerage logic while using shared inbox, CRM, memory, tasks, approvals, assets and knowledge.</p></section>
    </>}
    {isCarRental && <section><h2>Planned Module</h2><p>Future architecture covers fleet database, vehicle profiles, daily/weekly/monthly prices, deposits, insurance, included kilometers, chauffeur pricing, airport transfers, weddings, delivery/pickup, availability, rental contract drafts and client qualification.</p></section>}
    {isClientAcquisition && <>
      <section>
        <h2>Lead Sources</h2>
        <div className="panel">
          <h3>Source configuration</h3>
          <p>Source registry for future Lead Hunter channels. V1 only displays status and setup guidance; it does not connect accounts, scrape pages, send messages or store secrets.</p>
          {leadSources ? <>
            <div className="meta" style={{ marginBottom: 14 }}>
              {leadSources.safetyRules.map(rule => <Badge key={rule} tone="red">{rule}</Badge>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 }}>
              {leadSources.sources.map(source => <article className="row" key={source.id} style={{ alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <strong>{source.name}</strong>
                  <div className="meta" style={{ marginTop: 8 }}>
                    <Badge>{source.category}</Badge>
                    <Badge tone={sourceStatusTone(source.status)}>{source.status}</Badge>
                    <Badge tone="blue">{source.connectionMode}</Badge>
                  </div>
                  <p style={{ marginBottom: 0 }}>{source.safetyNote}</p>
                </div>
                <button onClick={() => setSelectedLeadSourceId(source.id)}>Configure</button>
              </article>)}
            </div>
            {selectedLeadSource && <div className="panel" style={{ marginTop: 16 }}>
              <div className="toolbar" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>{selectedLeadSource.name}</h3>
                <div className="meta"><Badge tone={sourceStatusTone(selectedLeadSource.status)}>{selectedLeadSource.status}</Badge><Badge>{selectedLeadSource.connectionMode}</Badge></div>
              </div>
              <p>{selectedLeadSource.notes}</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                <div><h4>Required setup</h4><ul>{selectedLeadSource.requiredSetup.map(item => <li key={item}>{item}</li>)}</ul></div>
                <div><h4>Allowed use</h4><ul>{selectedLeadSource.allowedUse.map(item => <li key={item}>{item}</li>)}</ul></div>
                <div><h4>Blocked use</h4><ul>{selectedLeadSource.blockedUse.map(item => <li key={item}>{item}</li>)}</ul></div>
              </div>
            </div>}
          </> : <Empty text="Loading lead sources." />}
        </div>
      </section>
      <section>
        <h2>Lead Hunter Search</h2>
        <div className="panel">
          <h3>Controlled Outreach Preparation V1</h3>
          <p>Searches public web results, filters weak signals, creates lead candidate approvals, and never contacts prospects automatically.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            <label>Campaign name<input value={campaignName} onChange={e => setCampaignName(e.target.value)} /></label>
            <label>Business line<select value={businessLine} onChange={e => setBusinessLine(e.target.value as typeof businessLine)}>
              <option value="mixed">Mixed luxury mobility</option>
              <option value="yacht_sale">Yacht sale / acquisition</option>
              <option value="yacht_charter">Yacht charter</option>
              <option value="car_rental">Luxury car rental</option>
            </select></label>
            <label>Geography<input placeholder="Monaco, Cannes, Dubai" value={geography} onChange={e => setGeography(e.target.value)} /></label>
            <label>Max results<input type="number" min={1} max={20} value={maxResults} onChange={e => setMaxResults(Number(e.target.value) || 1)} /></label>
          </div>
          <label>Offer brief<textarea placeholder="What are we offering? e.g. discreet off-market yacht acquisition support, charter desk, chauffeur fleet..." value={offerBrief} onChange={e => setOfferBrief(e.target.value)} /></label>
          <label>Target segments<textarea placeholder="Family offices, yacht managers, charter brokers, concierges, hotels, wedding planners..." value={targetSegments} onChange={e => setTargetSegments(e.target.value)} /></label>
          <div className="toolbar">
            <input placeholder="Optional custom query" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button onClick={runLeadSearch}>Run Search</button>
          </div>
          {searchStatus && <p className="ops-muted">{searchStatus}</p>}
        </div>
        <h2>Safe Outreach Module</h2>
        <p>This active agent researches public prospects, prepares compliant outreach drafts, suggests target segments and creates follow-up tasks. In V1 it must not send messages, join chats, post ads, scrape platforms, bypass limits or impersonate people without explicit human-controlled integrations and approval.</p>
      </section>
    </>}
  </>;
}
