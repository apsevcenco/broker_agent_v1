import { useEffect, useState } from "react";
import type { AgentDefinition } from "../../shared/types";
import { api, postJson } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

type KnowledgeSource = {
  id: string; agentId?: string; scope: string; sourceType: string;
  title: string; description?: string; originalUrl?: string;
  sourceAuthority?: string; reliabilityLevel: string; status: string;
  language: string; lastCheckedAt?: string; createdAt: string;
};
type RetrievalResult = {
  id: string; type: string; title: string; summary: string; content: string;
  category?: string; tags: string[]; reliabilityLevel: string; source?: string; score: number;
};
type KnowledgeReview = {
  id: string; sourceId?: string; knowledgeEntryId?: string;
  reviewer: string; status: string; notes?: string; createdAt: string;
};
type ImportPlan = {
  id: string; agentId?: string; topic: string; category: string;
  sourceUrls: string[]; notes?: string; reliabilityExpectation: string;
  status: string; createdAt: string;
};

type Section = "sources" | "planner" | "retrieval" | "reviews" | "versions";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "sources", label: "Source Library" },
  { id: "planner", label: "Import Planner" },
  { id: "retrieval", label: "Retrieval Test" },
  { id: "reviews", label: "Review Queue" },
  { id: "versions", label: "Version History" }
];

const SOURCE_TYPES = ["manual", "url", "pdf", "docx", "txt", "html", "other"];
const RELIABILITY = ["low", "medium", "high", "verified"];

const reliabilityTone = (r: string) =>
  r === "verified" ? "green" : r === "high" ? "blue" : ("neutral" as const);

export function KnowledgeEngine() {
  const [section, setSection] = useState<Section>("sources");
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [reviews, setReviews] = useState<KnowledgeReview[]>([]);
  const [importPlans, setImportPlans] = useState<ImportPlan[]>([]);
  const [retrievalResults, setRetrievalResults] = useState<RetrievalResult[]>([]);
  const [retrievalLoading, setRetrievalLoading] = useState(false);
  const [retrievalRan, setRetrievalRan] = useState(false);

  const [sourceForm, setSourceForm] = useState({
    title: "", sourceType: "manual", scope: "agent",
    reliabilityLevel: "medium", originalUrl: "",
    sourceAuthority: "", agentId: "", description: "", language: "en"
  });
  const [planForm, setPlanForm] = useState({
    agentId: "", topic: "", category: "",
    sourceUrls: "", notes: "", reliabilityExpectation: "medium"
  });
  const [lastPlan, setLastPlan] = useState<ImportPlan | null>(null);
  const [retrieval, setRetrieval] = useState({
    agentId: "", query: "", limit: "10", includeGlobal: true
  });

  const loadAll = () => {
    void api<AgentDefinition[]>("/api/agents").then(setAgents);
    void api<KnowledgeSource[]>("/api/knowledge-engine/sources").then(setSources);
    void api<KnowledgeReview[]>("/api/knowledge-engine/reviews").then(setReviews);
    void api<ImportPlan[]>("/api/knowledge-engine/import-plans").then(setImportPlans);
  };

  useEffect(() => { loadAll(); }, []);

  async function addSource() {
    if (!sourceForm.title.trim()) return;
    await postJson("/api/knowledge-engine/sources", {
      ...sourceForm,
      agentId: sourceForm.agentId || undefined,
      originalUrl: sourceForm.originalUrl || undefined,
      sourceAuthority: sourceForm.sourceAuthority || undefined,
      description: sourceForm.description || undefined
    });
    setSourceForm({ title: "", sourceType: "manual", scope: "agent", reliabilityLevel: "medium", originalUrl: "", sourceAuthority: "", agentId: "", description: "", language: "en" });
    void api<KnowledgeSource[]>("/api/knowledge-engine/sources").then(setSources);
  }

  async function submitPlan() {
    if (!planForm.topic.trim()) return;
    const result = await postJson<ImportPlan>("/api/knowledge-engine/import-plan", {
      ...planForm,
      sourceUrls: planForm.sourceUrls.split("\n").map((u) => u.trim()).filter(Boolean),
      agentId: planForm.agentId || undefined
    });
    setLastPlan(result);
    void api<ImportPlan[]>("/api/knowledge-engine/import-plans").then(setImportPlans);
  }

  async function runRetrieval() {
    if (!retrieval.agentId || !retrieval.query) return;
    setRetrievalLoading(true);
    setRetrievalRan(false);
    try {
      const results = await postJson<RetrievalResult[]>("/api/knowledge-engine/retrieve", {
        agentId: retrieval.agentId,
        query: retrieval.query,
        limit: Number(retrieval.limit) || 10,
        includeGlobal: retrieval.includeGlobal
      });
      setRetrievalResults(results);
      setRetrievalRan(true);
    } finally {
      setRetrievalLoading(false);
    }
  }

  async function decideReview(id: string, action: "approve" | "reject") {
    await postJson(`/api/knowledge-engine/reviews/${id}/${action}`, {});
    void api<KnowledgeReview[]>("/api/knowledge-engine/reviews").then(setReviews);
  }

  return (
    <>
      <PageHeader
        title="Knowledge Engine"
        subtitle="Source library, chunking, retrieval, review workflow and versioning for all agents."
      />

      <div className="toolbar">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{ fontWeight: section === s.id ? "bold" : undefined, textDecoration: section === s.id ? "underline" : undefined }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "sources" && (
        <section>
          <h2>Source Library</h2>
          <div className="form-grid">
            <input placeholder="Title *" value={sourceForm.title} onChange={(e) => setSourceForm({ ...sourceForm, title: e.target.value })} />
            <input placeholder="Description" value={sourceForm.description} onChange={(e) => setSourceForm({ ...sourceForm, description: e.target.value })} />
            <select value={sourceForm.sourceType} onChange={(e) => setSourceForm({ ...sourceForm, sourceType: e.target.value })}>
              {SOURCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <select value={sourceForm.scope} onChange={(e) => setSourceForm({ ...sourceForm, scope: e.target.value })}>
              <option value="agent">agent (scoped)</option>
              <option value="global">global (all agents)</option>
            </select>
            <select value={sourceForm.agentId} onChange={(e) => setSourceForm({ ...sourceForm, agentId: e.target.value })}>
              <option value="">No agent (global source)</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <select value={sourceForm.reliabilityLevel} onChange={(e) => setSourceForm({ ...sourceForm, reliabilityLevel: e.target.value })}>
              {RELIABILITY.map((r) => <option key={r}>{r}</option>)}
            </select>
            <input placeholder="Original URL (optional)" value={sourceForm.originalUrl} onChange={(e) => setSourceForm({ ...sourceForm, originalUrl: e.target.value })} />
            <input placeholder="Source authority (e.g. IMO, MCA, internal)" value={sourceForm.sourceAuthority} onChange={(e) => setSourceForm({ ...sourceForm, sourceAuthority: e.target.value })} />
            <button onClick={addSource} disabled={!sourceForm.title.trim()}>Add Source</button>
          </div>
          {sources.length ? sources.map((s) => (
            <article className="item" key={s.id}>
              <div>
                <h3>{s.title}</h3>
                {s.description && <p>{s.description}</p>}
                {s.originalUrl && <p><small>{s.originalUrl}</small></p>}
                <div className="meta">
                  <Badge>{s.sourceType}</Badge>
                  <Badge tone={s.scope === "global" ? "gold" : "neutral"}>{s.scope}</Badge>
                  <Badge tone={reliabilityTone(s.reliabilityLevel)}>{s.reliabilityLevel}</Badge>
                  <Badge tone={s.status === "approved" ? "green" : s.status === "failed" ? "red" : "neutral"}>{s.status}</Badge>
                  {s.sourceAuthority && <Badge>{s.sourceAuthority}</Badge>}
                </div>
              </div>
            </article>
          )) : <Empty text="No sources registered yet. Add a manual source above to start building the source library." />}
        </section>
      )}

      {section === "planner" && (
        <section>
          <h2>Import Planner</h2>
          <p style={{ color: "#888", marginBottom: "1rem" }}>
            Plan knowledge imports safely. No web scraping — admin provides source URLs.
            Each plan requires review before content is processed.
          </p>
          <div className="form-grid">
            <select value={planForm.agentId} onChange={(e) => setPlanForm({ ...planForm, agentId: e.target.value })}>
              <option value="">Global (all agents)</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input placeholder="Topic * (e.g. Flag State Registration)" value={planForm.topic} onChange={(e) => setPlanForm({ ...planForm, topic: e.target.value })} />
            <input placeholder="Category (e.g. Flags and Registration)" value={planForm.category} onChange={(e) => setPlanForm({ ...planForm, category: e.target.value })} />
            <select value={planForm.reliabilityExpectation} onChange={(e) => setPlanForm({ ...planForm, reliabilityExpectation: e.target.value })}>
              {RELIABILITY.map((r) => <option key={r}>{r}</option>)}
            </select>
            <textarea
              placeholder={"Source URLs — one per line (admin-provided, not auto-fetched):\nhttps://www.imo.org/...\nhttps://www.transport.gov.mt/..."}
              value={planForm.sourceUrls}
              onChange={(e) => setPlanForm({ ...planForm, sourceUrls: e.target.value })}
              rows={4}
            />
            <textarea placeholder="Notes for reviewer" value={planForm.notes} onChange={(e) => setPlanForm({ ...planForm, notes: e.target.value })} rows={2} />
            <button onClick={submitPlan} disabled={!planForm.topic.trim()}>Create Import Plan</button>
          </div>
          {lastPlan && (
            <article className="item">
              <div>
                <h3>Plan created: {lastPlan.topic}</h3>
                <p>Category: {lastPlan.category}</p>
                <p>{lastPlan.sourceUrls.length} source URL(s) listed</p>
                {lastPlan.notes && <p>Notes: {lastPlan.notes}</p>}
                <div className="meta"><Badge>{lastPlan.status}</Badge><Badge tone="gold">{lastPlan.reliabilityExpectation}</Badge></div>
              </div>
            </article>
          )}
          {importPlans.length > 0 && (
            <>
              <h3 style={{ marginTop: "1.5rem" }}>All Import Plans ({importPlans.length})</h3>
              {importPlans.map((p) => (
                <article className="row" key={p.id}>
                  <strong>{p.topic}</strong>
                  <span>{p.category}</span>
                  <Badge tone={p.status === "approved" ? "green" : p.status === "rejected" ? "red" : "neutral"}>{p.status}</Badge>
                  <span>{p.sourceUrls.length} URL(s)</span>
                </article>
              ))}
            </>
          )}
        </section>
      )}

      {section === "retrieval" && (
        <section>
          <h2>Retrieval Test</h2>
          <p style={{ color: "#888", marginBottom: "1rem" }}>
            Test unified knowledge retrieval across knowledge_entries and knowledge_chunks.
          </p>
          <div className="form-grid">
            <select value={retrieval.agentId} onChange={(e) => setRetrieval({ ...retrieval, agentId: e.target.value })}>
              <option value="">Select agent *</option>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <input
              placeholder="Query * (e.g. buyer qualification NDA off-market survey)"
              value={retrieval.query}
              onChange={(e) => setRetrieval({ ...retrieval, query: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") void runRetrieval(); }}
            />
            <select value={retrieval.limit} onChange={(e) => setRetrieval({ ...retrieval, limit: e.target.value })}>
              {["5", "10", "20"].map((n) => <option key={n} value={n}>{n} results</option>)}
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={retrieval.includeGlobal} onChange={(e) => setRetrieval({ ...retrieval, includeGlobal: e.target.checked })} />
              Include global knowledge entries
            </label>
            <button onClick={runRetrieval} disabled={!retrieval.agentId || !retrieval.query || retrievalLoading}>
              {retrievalLoading ? "Retrieving…" : "Retrieve Knowledge"}
            </button>
          </div>
          {retrievalRan && retrievalResults.length === 0 && (
            <Empty text="No results matched the query. Try different keywords or verify knowledge entries are loaded in Supabase." />
          )}
          {retrievalResults.map((r, i) => (
            <article className="item" key={r.id}>
              <div>
                <h3>{i + 1}. {r.title}</h3>
                <p>{r.summary}</p>
                <div className="meta">
                  <Badge tone={r.type === "knowledge_entry" ? "blue" : "gold"}>
                    {r.type === "knowledge_entry" ? "entry" : "chunk"}
                  </Badge>
                  {r.category && <Badge tone="gold">{r.category}</Badge>}
                  <Badge tone={reliabilityTone(r.reliabilityLevel)}>{r.reliabilityLevel}</Badge>
                  <Badge>score {r.score}</Badge>
                </div>
                {r.source && <p><small>Source: {r.source}</small></p>}
              </div>
            </article>
          ))}
        </section>
      )}

      {section === "reviews" && (
        <section>
          <h2>Review Queue</h2>
          <p style={{ color: "#888", marginBottom: "1rem" }}>
            All knowledge sources and entries pass through review before becoming active.
          </p>
          {reviews.length ? reviews.map((r) => (
            <article className="item" key={r.id}>
              <div>
                <h3>{r.sourceId ? "Source review" : "Knowledge entry review"}</h3>
                {r.sourceId && <p><small>Source ID: {r.sourceId}</small></p>}
                {r.knowledgeEntryId && <p><small>Entry ID: {r.knowledgeEntryId}</small></p>}
                <p>Reviewer: {r.reviewer}</p>
                {r.notes && <p>Notes: {r.notes}</p>}
                <div className="meta">
                  <Badge tone={r.status === "approved" ? "green" : r.status === "rejected" ? "red" : "neutral"}>{r.status}</Badge>
                  <small>{new Date(r.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
              {r.status === "pending" && (
                <div className="actions">
                  <button onClick={() => decideReview(r.id, "approve")}>Approve</button>
                  <button onClick={() => decideReview(r.id, "reject")}>Reject</button>
                </div>
              )}
            </article>
          )) : <Empty text="No reviews yet. Reviews are created when sources or knowledge entries are submitted for approval." />}
        </section>
      )}

      {section === "versions" && (
        <section>
          <h2>Version History</h2>
          <p style={{ color: "#888", marginBottom: "1rem" }}>
            Versions are recorded in the knowledge_versions table each time a knowledge entry is updated.
            The full title, summary, content, source and reliability level are preserved at each version.
          </p>
          <Empty text="Version history viewer available in V2. API: GET /api/knowledge-engine/versions/:entryId" />
        </section>
      )}
    </>
  );
}
