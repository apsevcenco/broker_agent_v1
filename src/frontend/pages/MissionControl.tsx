import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { Badge } from "../components/UI";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tone = "neutral" | "gold" | "red" | "green" | "blue";

type Approval = {
  id: string;
  title: string;
  status: string;
  riskLevel: string;
  agentId: string;
  type: string;
  createdAt: string;
};

type CaseItem = {
  id: string;
  title: string;
  caseType: string;
  caseProfile: string;
  status: string;
  source: string;
  createdAt: string;
  eventCount: number;
  latestEvent?: { eventType: string; summary: string; createdAt: string };
};

type ActivityEntry = {
  id: string;
  actorType: string;
  action: string;
  details: string;
  agentId?: string;
  createdAt: string;
};

type LeadCandidate = {
  id: string;
  approvalStatus: string;
  riskLevel: string;
  createdAt: string;
  companyOrPerson: string;
  businessLine: string;
  leadScore: string;
  commercialPriority: string | null;
  operatorRecommendation: string | null;
};

type MCData = {
  approvals: Approval[];
  cases: CaseItem[];
  activity: ActivityEntry[];
  leads: LeadCandidate[];
};

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

function ageHours(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 3600000;
}

function trunc(s: string, n: number): string {
  return s && s.length > n ? s.slice(0, n) + "…" : (s || "");
}

function riskTone(r: string): Tone {
  if (r === "high" || r === "critical") return "red";
  if (r === "medium") return "gold";
  if (r === "low") return "green";
  return "neutral";
}

function statusTone(s: string): Tone {
  if (s === "completed" || s === "won")            return "green";
  if (s === "open" || s === "in_progress")         return "blue";
  if (s === "qualified" || s === "waiting")        return "gold";
  if (s === "rejected" || s === "lost")            return "red";
  return "neutral";
}

function blTone(line: string): Tone {
  if (line === "yacht_sale")    return "blue";
  if (line === "yacht_charter") return "green";
  if (line === "car_rental")    return "gold";
  return "neutral";
}

function blLabel(line: string): string {
  const map: Record<string, string> = {
    yacht_sale: "Yacht Sale", yacht_charter: "Charter",
    car_rental: "Car Rental", mixed: "Mixed"
  };
  return map[line] || tc(line);
}

function scoreTone(s: string): Tone {
  if (s === "A") return "green";
  if (s === "B") return "blue";
  if (s === "C") return "gold";
  return "neutral";
}

function actionLabel(action: string): string {
  const map: Record<string, string> = {
    approval_approved:             "Approval approved",
    approval_rejected:             "Approval rejected",
    message_created:               "Message received",
    message_classified:            "Message classified",
    lead_search_candidate_created: "Lead candidate created",
    case_created:                  "Case created",
    case_updated:                  "Case updated",
    memory_created:                "Memory created",
    task_created:                  "Task created"
  };
  return map[action] || tc(action);
}

// ── Urgent Banner ─────────────────────────────────────────────────────────────

type UrgentItem = { key: string; label: string; href: string; tone: "red" | "gold" };

function UrgentBanner({ items }: { items: UrgentItem[] }) {
  if (!items.length) return null;
  return (
    <div className="mc-urgent">
      <span className="mc-urgent-label">Needs attention now</span>
      <div className="mc-urgent-list">
        {items.map(item => (
          <a key={item.key} href={item.href} className={`mc-urgent-item mc-urgent-${item.tone}`}>
            {item.label}
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Stats Row ─────────────────────────────────────────────────────────────────

function StatsRow({ data }: { data: MCData }) {
  const pending   = data.approvals.filter(a => a.status === "pending").length;
  const openCases = data.cases.filter(c => c.status === "open" || c.status === "in_progress").length;
  const totalLeads = data.leads.length;
  const highPri   = data.leads.filter(l => l.leadScore === "A" || l.commercialPriority === "immediate").length;
  const todayAI   = data.activity.filter(a => ageHours(a.createdAt) <= 24).length;

  const stats = [
    { label: "Pending Approvals", value: pending,   valueTone: pending > 0   ? "mc-val-gold" : "",    href: "/approvals" },
    { label: "Open Cases",        value: openCases, valueTone: "mc-val-blue",                          href: "/cases" },
    { label: "Lead Candidates",   value: totalLeads, valueTone: "",                                    href: "/lead-hunter/results" },
    { label: "High Priority",     value: highPri,   valueTone: highPri > 0   ? "mc-val-red" : "",     href: "/lead-hunter/results" },
    { label: "AI Actions Today",  value: todayAI,   valueTone: "",                                    href: "/activity" }
  ];

  return (
    <div className="mc-stats">
      {stats.map(s => (
        <a key={s.label} href={s.href} className="mc-stat">
          <span>{s.label}</span>
          <strong className={`mc-stat-value ${s.valueTone}`}>{s.value}</strong>
        </a>
      ))}
    </div>
  );
}

// ── Quick Actions ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Find Buyers",             sub: "Yacht sale discovery",        href: "/lead-hunter/results" },
  { label: "Find Charter Clients",    sub: "Demand discovery — charter",  href: "/lead-hunter/results" },
  { label: "Find Car Rental Clients", sub: "Demand discovery — cars",     href: "/lead-hunter/results" },
  { label: "Review Approvals",        sub: "AI Operations Center",        href: "/approvals" },
  { label: "Open Active Cases",       sub: "All business cases",          href: "/cases" }
];

function QuickActions() {
  return (
    <div className="mc-quick-actions">
      {QUICK_ACTIONS.map(a => (
        <a key={a.label} href={a.href} className="mc-quick-card">
          <strong>{a.label}</strong>
          <span>{a.sub}</span>
        </a>
      ))}
    </div>
  );
}

// ── Section Wrapper ───────────────────────────────────────────────────────────

function Section({
  title, count, href, footer, children
}: {
  title: string; count?: number; href?: string; footer?: React.ReactNode; children: React.ReactNode
}) {
  return (
    <div className="mc-section">
      <div className="mc-section-header">
        <span className="mc-section-title">{title}</span>
        {count !== undefined && <span className="mc-section-count">{count}</span>}
        {href && <a href={href} className="mc-section-link">View all →</a>}
      </div>
      {children}
      {footer && <div className="mc-section-footer">{footer}</div>}
    </div>
  );
}

function MCEmpty({ text }: { text: string }) {
  return <div className="mc-empty">{text}</div>;
}

// ── Pending Approvals ─────────────────────────────────────────────────────────

function PendingApprovals({ approvals }: { approvals: Approval[] }) {
  const all     = approvals.filter(a => a.status === "pending");
  const visible = all.slice(0, 6);

  return (
    <Section title="Pending Approvals" count={all.length} href="/approvals">
      {visible.length === 0
        ? <MCEmpty text="No pending approvals — all clear." />
        : (
          <div className="mc-list">
            {visible.map(a => (
              <a key={a.id} href="/approvals" className="mc-list-item">
                <div className="mc-list-item-main">
                  <span className="mc-list-item-title">{trunc(a.title, 62)}</span>
                  <div className="mc-list-item-meta">
                    <Badge tone={riskTone(a.riskLevel)}>{tc(a.riskLevel)} risk</Badge>
                    <Badge>{tc(a.type)}</Badge>
                  </div>
                </div>
                <span className="mc-list-item-time">{relTime(a.createdAt)}</span>
              </a>
            ))}
          </div>
        )
      }
    </Section>
  );
}

// ── Active Cases ──────────────────────────────────────────────────────────────

function ActiveCases({ cases }: { cases: CaseItem[] }) {
  const active  = cases.filter(c => c.status === "open" || c.status === "in_progress" || c.status === "qualified");
  const visible = active.slice(0, 5);

  return (
    <Section title="Active Cases" count={active.length} href="/cases">
      {visible.length === 0
        ? <MCEmpty text="No active cases. Approve a lead candidate to open one." />
        : (
          <div className="mc-list">
            {visible.map(c => (
              <a key={c.id} href={`/cases/${c.id}`} className="mc-list-item">
                <div className="mc-list-item-main">
                  <span className="mc-list-item-title">{trunc(c.title, 55)}</span>
                  <div className="mc-list-item-meta">
                    <Badge tone="blue">{c.caseProfile}</Badge>
                    <Badge tone={statusTone(c.status)}>{tc(c.status)}</Badge>
                    {c.eventCount > 0 && (
                      <Badge tone="neutral">{c.eventCount} event{c.eventCount !== 1 ? "s" : ""}</Badge>
                    )}
                  </div>
                  {c.latestEvent && (
                    <span className="mc-list-item-sub">{trunc(c.latestEvent.summary, 65)}</span>
                  )}
                </div>
                <span className="mc-list-item-time">{relTime(c.createdAt)}</span>
              </a>
            ))}
          </div>
        )
      }
    </Section>
  );
}

// ── Recent AI Decisions ───────────────────────────────────────────────────────

function RecentDecisions({ activity }: { activity: ActivityEntry[] }) {
  const todayCount = activity.filter(a => ageHours(a.createdAt) <= 24).length;
  const visible    = activity.slice(0, 10);

  return (
    <Section title="Recent AI Decisions" count={todayCount} href="/activity">
      {visible.length === 0
        ? <MCEmpty text="No agent activity yet. Run Lead Hunter or send a message to start." />
        : (
          <div className="mc-list">
            {visible.map(entry => (
              <div key={entry.id} className="mc-list-item mc-list-item-plain">
                <div className="mc-list-item-main">
                  <span className="mc-list-item-title">{actionLabel(entry.action)}</span>
                  {entry.details && (
                    <span className="mc-list-item-sub">{trunc(entry.details, 68)}</span>
                  )}
                  {entry.agentId && (
                    <div className="mc-list-item-meta">
                      <Badge tone="blue">{tc(entry.agentId.replace(/-agent$/, ""))}</Badge>
                    </div>
                  )}
                </div>
                <span className="mc-list-item-time">{relTime(entry.createdAt)}</span>
              </div>
            ))}
          </div>
        )
      }
    </Section>
  );
}

// ── Lead Candidates ───────────────────────────────────────────────────────────

function LeadCandidates({ leads }: { leads: LeadCandidate[] }) {
  const visible      = leads.slice(0, 6);
  const pendingCount = leads.filter(l => l.approvalStatus === "pending").length;

  return (
    <Section
      title="Lead Candidates"
      count={leads.length}
      href="/lead-hunter/results"
      footer={pendingCount > 0
        ? <a href="/approvals" className="mc-footer-cta">{pendingCount} lead approval{pendingCount !== 1 ? "s" : ""} pending review →</a>
        : undefined
      }
    >
      {visible.length === 0
        ? <MCEmpty text="No lead candidates yet. Run a search from Lead Hunter Results." />
        : (
          <div className="mc-list">
            {visible.map(l => (
              <a key={l.id} href="/lead-hunter/results" className="mc-list-item">
                <div className="mc-list-item-main">
                  <span className="mc-list-item-title">{trunc(l.companyOrPerson, 55)}</span>
                  <div className="mc-list-item-meta">
                    <Badge tone={blTone(l.businessLine)}>{blLabel(l.businessLine)}</Badge>
                    {l.leadScore && <Badge tone={scoreTone(l.leadScore)}>Score {l.leadScore}</Badge>}
                    {l.operatorRecommendation && (
                      <Badge tone="gold">{trunc(l.operatorRecommendation, 20)}</Badge>
                    )}
                    <Badge tone={l.approvalStatus === "pending" ? "gold" : l.approvalStatus === "approved" ? "green" : "red"}>
                      {tc(l.approvalStatus)}
                    </Badge>
                  </div>
                </div>
                <span className="mc-list-item-time">{relTime(l.createdAt)}</span>
              </a>
            ))}
          </div>
        )
      }
    </Section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function MissionControl() {
  const [data, setData] = useState<MCData | null>(null);

  useEffect(() => {
    Promise.allSettled([
      api<Approval[]>("/api/approvals"),
      api<CaseItem[]>("/api/cases"),
      api<ActivityEntry[]>("/api/activity"),
      api<LeadCandidate[]>("/api/lead-hunter/search/results")
    ]).then(([ar, cr, actr, lr]) => {
      setData({
        approvals: ar.status   === "fulfilled" ? ar.value   : [],
        cases:     cr.status   === "fulfilled" ? cr.value   : [],
        activity:  actr.status === "fulfilled" ? actr.value : [],
        leads:     lr.status   === "fulfilled" ? lr.value   : []
      });
    });
  }, []);

  const urgentItems = useMemo<UrgentItem[]>(() => {
    if (!data) return [];
    const items: UrgentItem[] = [];

    data.approvals
      .filter(a => a.status === "pending" && (a.riskLevel === "high" || a.riskLevel === "critical"))
      .slice(0, 3)
      .forEach(a => {
        items.push({
          key: `hr-${a.id}`,
          label: `High-risk approval pending: ${trunc(a.title, 42)}`,
          href: "/approvals",
          tone: "red"
        });
      });

    const stale = data.approvals.filter(
      a => a.status === "pending" && ageHours(a.createdAt) > 2 && a.riskLevel !== "high" && a.riskLevel !== "critical"
    );
    if (stale.length > 0) {
      items.push({
        key: "stale",
        label: `${stale.length} approval${stale.length !== 1 ? "s" : ""} waiting more than 2 hours`,
        href: "/approvals",
        tone: "gold"
      });
    }

    const immLeads = data.leads.filter(l => l.commercialPriority === "immediate" && l.approvalStatus === "pending");
    if (immLeads.length > 0) {
      items.push({
        key: "imm-leads",
        label: `${immLeads.length} urgent demand signal${immLeads.length !== 1 ? "s" : ""} ready for review`,
        href: "/lead-hunter/results",
        tone: "gold"
      });
    }

    return items;
  }, [data]);

  if (!data) {
    return <div className="mc-loading">Loading Mission Control…</div>;
  }

  return (
    <>
      <header className="mc-header">
        <h1 className="mc-title">Mission Control</h1>
        <p className="mc-date">
          {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </header>

      <UrgentBanner items={urgentItems} />

      <StatsRow data={data} />

      <QuickActions />

      <div className="mc-grid">
        <div className="mc-col-main">
          <PendingApprovals approvals={data.approvals} />
          <ActiveCases      cases={data.cases} />
        </div>
        <div className="mc-col-side">
          <RecentDecisions activity={data.activity} />
          <LeadCandidates  leads={data.leads} />
        </div>
      </div>
    </>
  );
}
