import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

// ── Types ─────────────────────────────────────────────────────────────────────

type BusinessLine = "yacht_sale" | "yacht_charter" | "car_rental" | "mixed";

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
};

type Tone = "neutral" | "gold" | "red" | "green" | "blue";

// ── Utilities ─────────────────────────────────────────────────────────────────

const BL_LABEL: Record<BusinessLine, string> = {
  yacht_sale:    "Yacht Sale",
  yacht_charter: "Yacht Charter",
  car_rental:    "Car Rental",
  mixed:         "Mixed"
};

const BL_TONE: Record<BusinessLine, Tone> = {
  yacht_sale:    "blue",
  yacht_charter: "green",
  car_rental:    "gold",
  mixed:         "neutral"
};

function tc(s: string) {
  return s ? s.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "";
}

function relTime(iso: string) {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7)  return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function scoreTone(s: string): Tone {
  if (s === "A" || s === "A+") return "green";
  if (s === "B") return "blue";
  if (s === "C") return "gold";
  return "neutral";
}

function riskTone(s: string): Tone {
  if (s === "high" || s === "critical") return "red";
  if (s === "medium") return "gold";
  if (s === "low") return "green";
  return "neutral";
}

function statusTone(s: string): Tone {
  if (s === "approved") return "green";
  if (s === "rejected") return "red";
  if (s === "pending")  return "gold";
  return "neutral";
}

function recLabel(s: string): string {
  const map: Record<string, string> = {
    PROCEED:               "Contact",
    PROCEED_WITH_CAUTION:  "Review",
    NEED_MORE_INFORMATION: "Needs Qualification",
    ESCALATE:              "Escalate",
    REJECT:                "Low Priority",
    ARCHIVE:               "Low Priority"
  };
  return map[(s || "").toUpperCase()] || tc(s) || "Review";
}

function recTone(rec: string): Tone {
  const lbl = recLabel(rec);
  if (lbl === "Contact") return "green";
  if (lbl === "Review" || lbl === "Needs Qualification") return "gold";
  if (lbl === "Low Priority" || lbl === "Escalate") return "red";
  return "neutral";
}

function blLabel(line: BusinessLine) { return BL_LABEL[line] || tc(line as string); }
function blTone(line: BusinessLine)  { return BL_TONE[line]  || "neutral"; }

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ leads }: { leads: LeadResult[] }) {
  const total     = leads.length;
  const qualified = leads.filter(l => l.leadScore === "A" || l.leadScore === "B").length;
  const pending   = leads.filter(l => l.approvalStatus === "pending").length;
  const approved  = leads.filter(l => l.approvalStatus === "approved").length;
  const highPri   = leads.filter(l => l.leadScore === "A").length;

  return (
    <div className="lh-stats">
      {[
        { label: "Total Leads",        value: total },
        { label: "Qualified Leads",    value: qualified },
        { label: "Pending Approvals",  value: pending },
        { label: "Approved",           value: approved },
        { label: "High Priority",      value: highPri }
      ].map(s => (
        <div key={s.label} className="stat">
          <span>{s.label}</span>
          <strong>{s.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ── Filters ───────────────────────────────────────────────────────────────────

type Filters = { businessLine: string; leadScore: string; approvalStatus: string; search: string };

function FiltersBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const set = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) =>
    onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="lh-filters">
      <select className="lh-filter-select" value={filters.businessLine} onChange={set("businessLine")}>
        <option value="">All Business Lines</option>
        <option value="yacht_sale">Yacht Sale</option>
        <option value="yacht_charter">Yacht Charter</option>
        <option value="car_rental">Car Rental</option>
        <option value="mixed">Mixed</option>
      </select>
      <select className="lh-filter-select" value={filters.leadScore} onChange={set("leadScore")}>
        <option value="">All Scores</option>
        <option value="A">Score A</option>
        <option value="B">Score B</option>
        <option value="C">Score C</option>
      </select>
      <select className="lh-filter-select" value={filters.approvalStatus} onChange={set("approvalStatus")}>
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <input
        className="lh-filter-search"
        placeholder="Search leads…"
        value={filters.search}
        onChange={set("search")}
      />
    </div>
  );
}

// ── Table ─────────────────────────────────────────────────────────────────────

function ResultsTable({ leads, onView }: { leads: LeadResult[]; onView: (l: LeadResult) => void }) {
  if (!leads.length) return <Empty text="No lead candidates match the current filters." />;

  return (
    <div className="lh-table-wrap">
      <table className="lh-table">
        <thead>
          <tr>
            <th>Business Line</th>
            <th>Company / Person</th>
            <th>Lead Category</th>
            <th>Score</th>
            <th>Risk</th>
            <th>Recommendation</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <LeadRow key={lead.id} lead={lead} onView={onView} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LeadRow({ lead, onView }: { lead: LeadResult; onView: (l: LeadResult) => void }) {
  return (
    <tr>
      <td>
        <Badge tone={blTone(lead.businessLine)}>{blLabel(lead.businessLine)}</Badge>
      </td>
      <td>
        <div className="lh-row-person">{lead.companyOrPerson || "—"}</div>
        {lead.snippet && <div className="lh-row-sub">{lead.snippet}</div>}
      </td>
      <td>
        {lead.leadCategory
          ? <Badge>{tc(lead.leadCategory)}</Badge>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        {lead.leadScore
          ? <Badge tone={scoreTone(lead.leadScore)}>{lead.leadScore}</Badge>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        {lead.riskLevel
          ? <Badge tone={riskTone(lead.riskLevel)}>{tc(lead.riskLevel)}</Badge>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        {lead.recommendation
          ? <Badge tone={recTone(lead.recommendation)}>{recLabel(lead.recommendation)}</Badge>
          : <span style={{ color: "#94a3b8" }}>—</span>}
      </td>
      <td>
        <Badge tone={statusTone(lead.approvalStatus)}>{tc(lead.approvalStatus)}</Badge>
      </td>
      <td style={{ whiteSpace: "nowrap", color: "#64748b" }}>
        {relTime(lead.createdAt)}
      </td>
      <td>
        <div className="lh-row-actions">
          <button className="lh-btn-sm" onClick={() => onView(lead)}>View</button>
          <a className="lh-btn-sm lh-btn-link" href="/approvals">Open Approval</a>
          {lead.approvalStatus === "approved" && !lead.caseId && (
            <span className="lh-btn-sm lh-btn-disabled" title="Create Case flow coming soon">Create Case</span>
          )}
          {lead.caseId && (
            <a className="lh-btn-sm lh-btn-link" href={`/cases/${lead.caseId}`}>Open Case</a>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="lh-section">
      <div className="lh-section-label">{label}</div>
      <div className="lh-section-value">{children}</div>
    </div>
  );
}

function LeadDrawer({ lead, onClose }: { lead: LeadResult; onClose: () => void }) {
  const toolRequests: any[] = Array.isArray(lead.toolPlan?.toolRequests) ? lead.toolPlan.toolRequests : [];

  return (
    <>
      <div className="lh-overlay" onClick={onClose} />
      <aside className="lh-drawer">
        <div className="lh-drawer-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="lh-drawer-title">{lead.companyOrPerson || "Lead Detail"}</p>
            <div className="meta" style={{ marginTop: 6 }}>
              <Badge tone={blTone(lead.businessLine)}>{blLabel(lead.businessLine)}</Badge>
              <Badge tone={statusTone(lead.approvalStatus)}>{tc(lead.approvalStatus)}</Badge>
              {lead.leadScore && <Badge tone={scoreTone(lead.leadScore)}>Score {lead.leadScore}</Badge>}
              {lead.riskLevel && <Badge tone={riskTone(lead.riskLevel)}>{tc(lead.riskLevel)} risk</Badge>}
            </div>
          </div>
          <button className="lh-drawer-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="lh-drawer-body">

          {lead.sourceUrl && (
            <Section label="Source URL">
              <a href={lead.sourceUrl} target="_blank" rel="noopener noreferrer">{lead.sourceUrl}</a>
            </Section>
          )}

          {lead.searchQuery && (
            <Section label="Search Query">
              {lead.searchQuery}
            </Section>
          )}

          {lead.candidateSummary && (
            <Section label="AI Summary">
              {lead.candidateSummary}
            </Section>
          )}

          {lead.snippet && (
            <Section label="Web Snippet">
              {lead.snippet}
            </Section>
          )}

          {lead.searchQualityReason && (
            <Section label="Why AI selected this lead">
              {lead.searchQualityReason}
            </Section>
          )}

          {lead.leadScoreReason && (
            <Section label="Lead Score Reasoning">
              {lead.leadScoreReason}
            </Section>
          )}

          {lead.riskReason && (
            <Section label="Risk Reasoning">
              {lead.riskReason}
            </Section>
          )}

          {lead.recommendedNextAction && (
            <Section label="Recommended Next Step">
              {lead.recommendedNextAction}
            </Section>
          )}

          {lead.targetSegment && (
            <Section label="Target Segment">
              {lead.targetSegment}
            </Section>
          )}

          {lead.missingItems.length > 0 && (
            <Section label="Missing Qualification Info">
              <div className="lh-missing">
                {lead.missingItems.map((item, i) => (
                  <Badge key={i}>{item}</Badge>
                ))}
              </div>
            </Section>
          )}

          {lead.draft && (
            <div className="lh-section">
              <div className="lh-section-label">Prepared Outreach Draft</div>
              <pre className="lh-draft-pre">{lead.draft}</pre>
            </div>
          )}

          {toolRequests.length > 0 && (
            <div className="lh-section">
              <div className="lh-section-label">Proposed Tool Plan ({toolRequests.length} action{toolRequests.length !== 1 ? "s" : ""})</div>
              <div className="ops-tool-list" style={{ marginTop: 8 }}>
                {toolRequests.map((req, i) => (
                  <div key={req.id || i} className="ops-tool-row">
                    <div className="ops-check" aria-hidden="true">✓</div>
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

          <Section label="Approval State">
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <Badge tone={statusTone(lead.approvalStatus)}>{tc(lead.approvalStatus)}</Badge>
              <a className="lh-btn-sm lh-btn-link" href="/approvals">Open in Operations Center</a>
            </div>
          </Section>

          <Section label="Business Case">
            {lead.caseId ? (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12 }}>{lead.caseId}</span>
                {lead.caseStatus && <Badge>{tc(lead.caseStatus)}</Badge>}
                <a className="lh-btn-sm lh-btn-link" href={`/cases/${lead.caseId}`}>Open Case</a>
              </div>
            ) : (
              <span style={{ color: "#94a3b8" }}>Not yet created</span>
            )}
          </Section>

          {lead.handoffPending && (
            <Section label="Handoff Pending">
              {lead.handoffPending}
            </Section>
          )}

        </div>
      </aside>
    </>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const DEFAULT_FILTERS: Filters = { businessLine: "", leadScore: "", approvalStatus: "", search: "" };

export function LeadHunterResults() {
  const [leads,    setLeads]    = useState<LeadResult[] | null>(null);
  const [filters,  setFilters]  = useState<Filters>(DEFAULT_FILTERS);
  const [selected, setSelected] = useState<LeadResult | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    api<LeadResult[]>("/api/lead-hunter/search/results")
      .then(setLeads)
      .catch((e: Error) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!leads) return [];
    const q = filters.search.toLowerCase();
    return leads.filter(l => {
      if (filters.businessLine   && l.businessLine   !== filters.businessLine)   return false;
      if (filters.leadScore      && l.leadScore      !== filters.leadScore)       return false;
      if (filters.approvalStatus && l.approvalStatus !== filters.approvalStatus) return false;
      if (q && ![l.companyOrPerson, l.candidateSummary, l.snippet, l.leadCategory, l.targetSegment, l.searchQuery]
              .join(" ").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [leads, filters]);

  if (error) return (
    <>
      <PageHeader title="Lead Hunter Results" subtitle="All discovered lead candidates from public web searches." />
      <Empty text={`Error loading results: ${error}`} />
    </>
  );

  return (
    <>
      <PageHeader
        title="Lead Hunter Results"
        subtitle="All discovered lead candidates from public web search. Review, qualify, and approve before creating Business Cases."
      />

      {leads && <StatsBar leads={leads} />}

      <FiltersBar filters={filters} onChange={setFilters} />

      {!leads
        ? <Empty text="Loading leads…" />
        : leads.length === 0
          ? <Empty text="No lead candidates yet. Run the Lead Hunter to discover commercial opportunities." />
          : <ResultsTable leads={filtered} onView={setSelected} />
      }

      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
