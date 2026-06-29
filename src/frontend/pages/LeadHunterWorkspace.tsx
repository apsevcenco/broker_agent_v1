import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Badge, Empty } from "../components/UI";

// ── Types ─────────────────────────────────────────────────────────────────────

type BusinessLine = "yacht_sale" | "yacht_charter" | "car_rental" | "mixed";
type Tone = "neutral" | "gold" | "red" | "green" | "blue";

type LeadResult = {
  id: string;
  approvalId: string;
  approvalStatus: string;
  riskLevel: string;
  createdAt: string;
  companyOrPerson: string;
  businessLine: BusinessLine;
  leadCategory: string;
  targetSegment: string;
  leadScore: string;
  confidence: number | null;
  sourceUrl: string;
  searchQuery: string;
  snippet: string;
  searchQualityReason: string;
  recommendation: string;
  rationale: string;
  candidateSummary: string;
  recommendedNextAction: string;
  missingItems: string[];
  draft: string;
  handoffPending: string | null;
  routedAgentId: string | null;
  leadScoreReason: string;
  riskReason: string;
  toolPlan: any;
  caseId: string | null;
  caseStatus: string | null;
  searchMode: string;
  demandLevel: string | null;
  urgency: string | null;
  commercialPriority: string | null;
  estimatedRevenue: string | null;
  bookingWindow: string | null;
  closingProbability: string | null;
  repeatPotential: string | null;
  requestType: string | null;
  operatorRecommendation: string | null;
};

type Filters = {
  businessLine: string;
  leadCategory: string;
  approvalStatus: string;
  search: string;
};

// ── Tab config ────────────────────────────────────────────────────────────────

type TabId = "all" | "yacht_sale" | "yacht_charter" | "car_rental" | "active_demand" | "partners" | "rejected";

const TABS: { id: TabId; label: string; test: (l: LeadResult) => boolean }[] = [
  { id: "all",           label: "All",           test: () => true },
  { id: "yacht_sale",    label: "Yacht Sale",    test: l => l.businessLine === "yacht_sale" },
  { id: "yacht_charter", label: "Yacht Charter", test: l => l.businessLine === "yacht_charter" },
  { id: "car_rental",    label: "Car Rental",    test: l => l.businessLine === "car_rental" },
  {
    id: "active_demand", label: "Active Demand",
    test: l => l.searchMode === "demand_discovery" &&
               (l.commercialPriority === "immediate" || l.commercialPriority === "today")
  },
  { id: "partners",  label: "Partners",  test: l => l.searchMode === "partner_discovery" },
  { id: "rejected",  label: "Rejected",  test: l => l.approvalStatus === "rejected" }
];

// ── Utilities ─────────────────────────────────────────────────────────────────

function tc(s: string): string {
  return s ? s.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "";
}

function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function trunc(s: string, n: number): string {
  return s && s.length > n ? s.slice(0, n) + "…" : (s || "");
}

function domainOf(url: string): string {
  if (!url) return "";
  try { return new URL(url).hostname.replace(/^www\./, ""); }
  catch { return url.split("/")[0] || ""; }
}

function scoreTone(s: string): Tone {
  if (s === "A") return "green";
  if (s === "B") return "blue";
  if (s === "C") return "gold";
  return "neutral";
}

function riskTone(r: string): Tone {
  if (r === "high" || r === "critical") return "red";
  if (r === "medium") return "gold";
  if (r === "low") return "green";
  return "neutral";
}

function statusTone(s: string): Tone {
  if (s === "approved") return "green";
  if (s === "rejected") return "red";
  if (s === "pending")  return "gold";
  return "neutral";
}

function urgencyTone(u: string): Tone {
  if (u === "immediate") return "red";
  if (u === "today")     return "gold";
  if (u === "this_week") return "blue";
  return "neutral";
}

function urgencyLabel(u: string): string {
  const map: Record<string, string> = {
    immediate: "ASAP", today: "Today", this_week: "This Week", future: "Future"
  };
  return map[u] || tc(u);
}

function opRecTone(r: string): Tone {
  if (r === "Contact Immediately") return "red";
  if (r === "Contact Today")       return "gold";
  if (r === "Contact Within 24 Hours") return "blue";
  return "neutral";
}

const BL_LABEL: Record<BusinessLine, string> = {
  yacht_sale: "Yacht Sale", yacht_charter: "Yacht Charter",
  car_rental: "Car Rental", mixed: "Mixed"
};
const BL_TONE: Record<BusinessLine, Tone> = {
  yacht_sale: "blue", yacht_charter: "green", car_rental: "gold", mixed: "neutral"
};
function blLabel(l: BusinessLine) { return BL_LABEL[l] || tc(l as string); }
function blTone(l: BusinessLine)  { return BL_TONE[l]  || "neutral" as Tone; }

function recLabel(s: string): string {
  const map: Record<string, string> = {
    PROCEED: "Contact", PROCEED_WITH_CAUTION: "Review",
    NEED_MORE_INFORMATION: "Qualify", REJECT: "Low Priority", ARCHIVE: "Low Priority"
  };
  return map[(s || "").toUpperCase()] || tc(s) || "—";
}

function rejectionType(lead: LeadResult): string {
  const text = [lead.searchQualityReason, lead.leadScoreReason, lead.snippet, lead.candidateSummary].join(" ").toLowerCase();
  if (/job|career|vacancy|hiring|employment|position/.test(text)) return "Job Ad";
  if (/directory|yellow pages|listing|top \d+|best \d+/.test(text))  return "Directory";
  if (/blog|news|magazine|press release|article|seo/.test(text))     return "SEO / Content";
  if (/expired|old|archived|2020|2021|2022/.test(text))              return "Old / Expired";
  return "Operator Rejected";
}

function effectiveRecommendation(lead: LeadResult): string {
  if (lead.operatorRecommendation) return lead.operatorRecommendation;
  if (lead.recommendation)         return recLabel(lead.recommendation);
  return "—";
}

function effectiveRecTone(lead: LeadResult): Tone {
  if (lead.operatorRecommendation) return opRecTone(lead.operatorRecommendation);
  const lbl = lead.recommendation ? recLabel(lead.recommendation) : "";
  if (lbl === "Contact") return "green";
  if (lbl === "Review" || lbl === "Qualify") return "gold";
  if (lbl === "Low Priority") return "red";
  return "neutral";
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function TabBar({
  active, counts, onChange
}: {
  active: TabId; counts: Record<TabId, number>; onChange: (t: TabId) => void
}) {
  return (
    <div className="lhw-tabs">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`lhw-tab${active === tab.id ? " lhw-tab-active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {counts[tab.id] > 0 && <span className="lhw-tab-count">{counts[tab.id]}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────

function FiltersBar({
  filters, categories, onChange
}: {
  filters: Filters; categories: string[]; onChange: (f: Filters) => void
}) {
  const set = (key: keyof Filters) =>
    (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
      onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="lh-filters" style={{ marginTop: 12 }}>
      <select className="lh-filter-select" value={filters.businessLine} onChange={set("businessLine")}>
        <option value="">All Business Lines</option>
        <option value="yacht_sale">Yacht Sale</option>
        <option value="yacht_charter">Yacht Charter</option>
        <option value="car_rental">Car Rental</option>
        <option value="mixed">Mixed</option>
      </select>
      <select className="lh-filter-select" value={filters.leadCategory} onChange={set("leadCategory")}>
        <option value="">All Categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <select className="lh-filter-select" value={filters.approvalStatus} onChange={set("approvalStatus")}>
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <input
        className="lh-filter-search"
        placeholder="Search company, category, query…"
        value={filters.search}
        onChange={set("search")}
      />
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

function ResultsTable({ leads, onView }: { leads: LeadResult[]; onView: (l: LeadResult) => void }) {
  if (!leads.length) {
    return (
      <div className="lhw-empty">
        <p>No results match the current filters.</p>
        <a href="/lead-hunter/results" className="lh-btn-sm">Run New Search →</a>
      </div>
    );
  }

  return (
    <div className="lh-table-wrap" style={{ marginTop: 14 }}>
      <table className="lh-table">
        <thead>
          <tr>
            <th>Business Line</th>
            <th>Source</th>
            <th>Company / Person</th>
            <th>Lead Category</th>
            <th>Score</th>
            <th>Urgency</th>
            <th>Recommendation</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => <ResultRow key={lead.id} lead={lead} onView={onView} />)}
        </tbody>
      </table>
    </div>
  );
}

function ResultRow({ lead, onView }: { lead: LeadResult; onView: (l: LeadResult) => void }) {
  const domain = domainOf(lead.sourceUrl);

  return (
    <tr>
      <td>
        <Badge tone={blTone(lead.businessLine)}>{blLabel(lead.businessLine)}</Badge>
      </td>
      <td>
        {domain
          ? <span className="lhw-source">{domain}</span>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        <div className="lh-row-person">{lead.companyOrPerson || "—"}</div>
        {lead.snippet && <div className="lh-row-sub">{lead.snippet}</div>}
      </td>
      <td>
        {lead.requestType
          ? <Badge>{lead.requestType}</Badge>
          : lead.leadCategory
            ? <Badge>{tc(lead.leadCategory)}</Badge>
            : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        {lead.leadScore
          ? <Badge tone={scoreTone(lead.leadScore)}>{lead.leadScore}</Badge>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        {lead.urgency
          ? <Badge tone={urgencyTone(lead.urgency)}>{urgencyLabel(lead.urgency)}</Badge>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        {lead.approvalStatus === "rejected"
          ? <Badge tone="red">{rejectionType(lead)}</Badge>
          : <Badge tone={effectiveRecTone(lead)}>{effectiveRecommendation(lead)}</Badge>}
      </td>
      <td>
        <Badge tone={statusTone(lead.approvalStatus)}>{tc(lead.approvalStatus)}</Badge>
      </td>
      <td style={{ whiteSpace: "nowrap", color: "#64748b" }}>
        {relTime(lead.createdAt)}
      </td>
      <td>
        <div className="lh-row-actions">
          <button className="lh-btn-sm" onClick={() => onView(lead)}>View Details</button>
          {lead.approvalId && (
            <a className="lh-btn-sm lh-btn-link" href="/approvals">Approval</a>
          )}
          {lead.sourceUrl && (
            <a className="lh-btn-sm lh-btn-link" href={lead.sourceUrl} target="_blank" rel="noopener noreferrer">
              Source ↗
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Drawer Section ────────────────────────────────────────────────────────────

function DrawerSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lh-section">
      <div className="lh-section-label">{label}</div>
      <div className="lh-section-value">{children}</div>
    </div>
  );
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────

function LeadDrawer({ lead, onClose }: { lead: LeadResult; onClose: () => void }) {
  const toolRequests: any[] = Array.isArray(lead.toolPlan?.toolRequests) ? lead.toolPlan.toolRequests : [];
  const isRejected  = lead.approvalStatus === "rejected";
  const isDemand    = lead.searchMode === "demand_discovery";
  const rejType     = isRejected ? rejectionType(lead) : "";

  return (
    <>
      <div className="lh-overlay" onClick={onClose} />
      <aside className="lh-drawer">

        <div className="lh-drawer-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="lh-drawer-title">{lead.companyOrPerson || "Lead Detail"}</p>
            <div className="meta" style={{ marginTop: 6, flexWrap: "wrap" }}>
              <Badge tone={blTone(lead.businessLine)}>{blLabel(lead.businessLine)}</Badge>
              <Badge tone={statusTone(lead.approvalStatus)}>{tc(lead.approvalStatus)}</Badge>
              {lead.leadScore  && <Badge tone={scoreTone(lead.leadScore)}>Score {lead.leadScore}</Badge>}
              {lead.riskLevel  && <Badge tone={riskTone(lead.riskLevel)}>{tc(lead.riskLevel)} risk</Badge>}
              {lead.urgency    && <Badge tone={urgencyTone(lead.urgency)}>{urgencyLabel(lead.urgency)}</Badge>}
            </div>
          </div>
          <button className="lh-drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="lh-drawer-body">

          {isRejected && (
            <div className="lhw-rejection-banner">
              <strong>Rejected: {rejType}</strong>
              <p>
                {rejType === "Job Ad"         && "This result appears to be a job advertisement, not a commercial opportunity."}
                {rejType === "Directory"      && "This result appears to be a directory or listing page with no actionable commercial signal."}
                {rejType === "SEO / Content"  && "This result appears to be SEO content, a blog post, or a press release — not a direct lead signal."}
                {rejType === "Old / Expired"  && "This result may be outdated or expired and unlikely to represent an active opportunity."}
                {rejType === "Operator Rejected" && "This candidate was reviewed and rejected by the operator."}
              </p>
              {lead.searchQualityReason && (
                <div className="lhw-rejection-reason">{lead.searchQualityReason}</div>
              )}
            </div>
          )}

          {lead.sourceUrl && (
            <DrawerSection label="Source URL">
              <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer"
                 style={{ wordBreak: "break-all" }}>
                {lead.sourceUrl}
              </a>
            </DrawerSection>
          )}

          {lead.searchQuery && (
            <DrawerSection label="Search Query Used">
              {lead.searchQuery}
            </DrawerSection>
          )}

          {lead.candidateSummary && (
            <DrawerSection label="AI Summary">
              {lead.candidateSummary}
            </DrawerSection>
          )}

          {lead.snippet && (
            <DrawerSection label="Web Snippet">
              {lead.snippet}
            </DrawerSection>
          )}

          {lead.searchQualityReason && !isRejected && (
            <DrawerSection label="Why AI Selected This">
              {lead.searchQualityReason}
            </DrawerSection>
          )}

          {lead.leadScoreReason && (
            <DrawerSection label="Opportunity Score Reasoning">
              {lead.leadScoreReason}
            </DrawerSection>
          )}

          {isDemand && (lead.urgency || lead.commercialPriority || lead.estimatedRevenue) && (
            <DrawerSection label="Demand Evidence">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {lead.urgency           && <span><strong>Urgency:</strong> {urgencyLabel(lead.urgency)}</span>}
                {lead.commercialPriority && <span><strong>Commercial Priority:</strong> {tc(lead.commercialPriority)}</span>}
                {lead.estimatedRevenue  && <span><strong>Revenue Estimate:</strong> {lead.estimatedRevenue}</span>}
                {lead.bookingWindow     && <span><strong>Booking Window:</strong> {lead.bookingWindow}</span>}
                {lead.closingProbability && <span><strong>Closing Probability:</strong> {lead.closingProbability}</span>}
                {lead.repeatPotential   && <span><strong>Repeat Potential:</strong> {lead.repeatPotential}</span>}
              </div>
            </DrawerSection>
          )}

          {lead.operatorRecommendation && (
            <DrawerSection label="Operator Action">
              <Badge tone={opRecTone(lead.operatorRecommendation)}>{lead.operatorRecommendation}</Badge>
            </DrawerSection>
          )}

          {lead.riskReason && (
            <DrawerSection label="Risk Assessment">
              <div style={{ marginBottom: 6 }}>
                {lead.riskLevel && <Badge tone={riskTone(lead.riskLevel)}>{tc(lead.riskLevel)} risk</Badge>}
              </div>
              {lead.riskReason}
            </DrawerSection>
          )}

          {lead.recommendedNextAction && (
            <DrawerSection label="Recommended Next Step">
              {lead.recommendedNextAction}
            </DrawerSection>
          )}

          {lead.targetSegment && (
            <DrawerSection label="Target Segment">
              {lead.targetSegment}
            </DrawerSection>
          )}

          {lead.missingItems.length > 0 && (
            <DrawerSection label="Missing Qualification Info">
              <div className="lh-missing">
                {lead.missingItems.map((item, i) => <Badge key={i}>{item}</Badge>)}
              </div>
            </DrawerSection>
          )}

          {lead.draft && (
            <div className="lh-section">
              <div className="lh-section-label">Draft Outreach (Not Sent)</div>
              <pre className="lh-draft-pre">{lead.draft}</pre>
            </div>
          )}

          {toolRequests.length > 0 && (
            <div className="lh-section">
              <div className="lh-section-label">
                Proposed Tool Plan — {toolRequests.length} action{toolRequests.length !== 1 ? "s" : ""} (approval required)
              </div>
              <div className="ops-tool-list" style={{ marginTop: 8 }}>
                {toolRequests.map((req: any, i: number) => (
                  <div key={req.id || i} className="ops-tool-row">
                    <div className="ops-check">✓</div>
                    <div>
                      <strong>{req.tool || "Proposed action"}</strong>
                      {req.reason && <p>{req.reason}</p>}
                      <div className="meta">
                        {req.priority  && <Badge tone={req.priority === "high" ? "red" : req.priority === "medium" ? "gold" : "neutral"}>{tc(req.priority)}</Badge>}
                        {req.riskLevel && <Badge tone={riskTone(req.riskLevel)}>{tc(req.riskLevel)} risk</Badge>}
                        {req.approvalRequired && <Badge tone="red">Approval required</Badge>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DrawerSection label="Approval State">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Badge tone={statusTone(lead.approvalStatus)}>{tc(lead.approvalStatus)}</Badge>
              {lead.approvalId && (
                <a className="lh-btn-sm lh-btn-link" href="/approvals">Open in Operations Center</a>
              )}
            </div>
          </DrawerSection>

          <DrawerSection label="Business Case">
            {lead.caseId ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>{lead.caseId}</span>
                {lead.caseStatus && <Badge>{tc(lead.caseStatus)}</Badge>}
                <a className="lh-btn-sm lh-btn-link" href={`/cases/${lead.caseId}`}>Open Case</a>
              </div>
            ) : (
              <span style={{ color: "#94a3b8" }}>Not yet created</span>
            )}
          </DrawerSection>

        </div>
      </aside>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = { businessLine: "", leadCategory: "", approvalStatus: "", search: "" };

export function LeadHunterWorkspace() {
  const [leads,    setLeads]    = useState<LeadResult[] | null>(null);
  const [tab,      setTab]      = useState<TabId>("all");
  const [filters,  setFilters]  = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<LeadResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    api<LeadResult[]>("/api/lead-hunter/search/results")
      .then(setLeads)
      .catch((e: Error) => setError(e.message));
  }, []);

  const tabCounts = useMemo<Record<TabId, number>>(() => {
    if (!leads) return {} as Record<TabId, number>;
    return Object.fromEntries(TABS.map(t => [t.id, leads.filter(t.test).length])) as Record<TabId, number>;
  }, [leads]);

  const categories = useMemo(() => {
    if (!leads) return [];
    const seen = new Set<string>();
    for (const l of leads) {
      if (l.requestType)  seen.add(l.requestType);
      if (l.leadCategory) seen.add(tc(l.leadCategory));
    }
    return [...seen].sort();
  }, [leads]);

  const visible = useMemo(() => {
    if (!leads) return [];
    const tabFilter = TABS.find(t => t.id === tab)?.test ?? (() => true);
    const q = filters.search.toLowerCase();
    return leads.filter(l => {
      if (!tabFilter(l)) return false;
      if (filters.businessLine   && l.businessLine   !== filters.businessLine) return false;
      if (filters.approvalStatus && l.approvalStatus !== filters.approvalStatus) return false;
      if (filters.leadCategory) {
        const cat = (l.requestType || tc(l.leadCategory) || "").toLowerCase();
        if (!cat.includes(filters.leadCategory.toLowerCase())) return false;
      }
      if (q) {
        const hay = [l.companyOrPerson, l.candidateSummary, l.snippet, l.leadCategory,
                     l.requestType, l.targetSegment, l.searchQuery, domainOf(l.sourceUrl)]
          .join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, tab, filters]);

  return (
    <>
      <div className="lhw-page-head">
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Lead Hunter Results</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>
            All discovered lead candidates from public web search. Review, qualify, and approve before creating Business Cases.
          </p>
        </div>
        <a href="/lead-hunter/results" className="lhw-run-btn">Run New Search →</a>
      </div>

      {error && <Empty text={`Error loading results: ${error}`} />}

      {!error && (
        <>
          <TabBar active={tab} counts={tabCounts} onChange={t => { setTab(t); setFilters(DEFAULT_FILTERS); }} />

          <FiltersBar filters={filters} categories={categories} onChange={setFilters} />

          {!leads
            ? <Empty text="Loading…" />
            : leads.length === 0
              ? (
                <div className="lhw-empty lhw-empty-page">
                  <p>No lead results yet.</p>
                  <a href="/lead-hunter/results" className="lh-btn-sm">Run Lead Hunter Search →</a>
                </div>
              )
              : <ResultsTable leads={visible} onView={setSelected} />
          }
        </>
      )}

      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
