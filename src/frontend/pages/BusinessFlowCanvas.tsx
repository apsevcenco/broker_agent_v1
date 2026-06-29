import { Fragment, useEffect, useState } from "react";
import { api } from "../services/api";
import { Badge } from "../components/UI";

// ── Types ─────────────────────────────────────────────────────────────────────

type NodeStatus = "active" | "not_configured" | "future" | "manual";

type Counts = {
  pendingApprovals: number | null;
  openCases: number | null;
  leadCandidates: number | null;
  pendingLeads: number | null;
  inboxMessages: number | null;
};

type NodeDef = {
  num: number;
  title: string;
  description: string;
  status: NodeStatus;
  href?: string;
  hrefLabel?: string;
  bullets?: string[];
  countKey?: keyof Counts;
  countLabel?: string;
  extraKey?: keyof Counts;
  extraLabel?: string;
};

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<NodeStatus, string> = {
  active: "Active",
  not_configured: "Not Configured",
  future: "Planned",
  manual: "Manual",
};

const STATUS_TONE: Record<NodeStatus, "neutral" | "green" | "blue"> = {
  active: "green",
  not_configured: "neutral",
  future: "neutral",
  manual: "blue",
};

const NODES: NodeDef[] = [
  {
    num: 1,
    title: "Lead Sources",
    description:
      "Public web is queried via Serper search in 6 languages. Queries are generated per business line and search mode. No manual import in V1.",
    status: "active",
    href: "/agents/client-acquisition",
    hrefLabel: "View Lead Hunter",
    bullets: ["Serper Web Search — active", "Brave Search — planned", "LinkedIn public data — planned"],
  },
  {
    num: 2,
    title: "Lead Hunter",
    description:
      "AI agent that discovers lead candidates from the public web. Four modes: Company Discovery, Demand Discovery, Partner Discovery, Market Intelligence.",
    status: "active",
    href: "/agents/client-acquisition",
    hrefLabel: "View Agent",
    bullets: [
      "Multilingual queries (EN / FR / IT / DE / RU / ES)",
      "Candidates scored A / B / C / D automatically",
      "D-rated results discarded before any approval is created",
    ],
  },
  {
    num: 3,
    title: "Lead Hunter Results",
    description:
      "Scored candidates (A / B / C) are stored as pending approvals. The operator reviews and qualifies each one before any further action.",
    status: "active",
    href: "/lead-hunter-results",
    hrefLabel: "Open Workspace",
    countKey: "leadCandidates",
    countLabel: "candidates",
    extraKey: "pendingLeads",
    extraLabel: "pending review",
  },
  {
    num: 4,
    title: "Inbox",
    description:
      "Incoming messages from clients, brokers, and partners. Each message is classified by topic and business line and surfaced for operator review.",
    status: "active",
    href: "/inbox",
    hrefLabel: "Open Inbox",
    countKey: "inboxMessages",
    countLabel: "messages",
  },
  {
    num: 5,
    title: "Business Cases",
    description:
      "A Case is opened for every qualified opportunity. All agents, decisions, outreach, and activity are linked to a case for full traceability.",
    status: "active",
    href: "/cases",
    hrefLabel: "Open Cases",
    countKey: "openCases",
    countLabel: "open",
    bullets: [
      "Yacht sale opportunities",
      "Charter season bookings",
      "Luxury car rental requests",
    ],
  },
  {
    num: 6,
    title: "Specialist Agent",
    description:
      "A dedicated agent handles each case based on business line. Runs intelligence research, proposes strategy, and prepares outreach drafts.",
    status: "active",
    href: "/agents",
    hrefLabel: "View Agents",
    bullets: [
      "Yacht Broker agent — active",
      "Charter agent — not yet implemented",
      "Car Rental agent — not yet implemented",
    ],
  },
  {
    num: 7,
    title: "Tool Plan",
    description:
      "The agent proposes a set of actions for operator review. Nothing is taken automatically — every proposed action waits for an explicit decision.",
    status: "active",
    href: "/approvals",
    hrefLabel: "View Operations",
    bullets: [
      "Draft outreach message (not sent)",
      "CRM contact create / update",
      "Case status update",
      "Task and follow-up creation",
    ],
  },
  {
    num: 8,
    title: "Approval",
    description:
      "Every proposed action requires explicit operator approval. The operator can approve, reject, or request changes. Nothing executes without a decision.",
    status: "active",
    href: "/approvals",
    hrefLabel: "Review Approvals",
    countKey: "pendingApprovals",
    countLabel: "pending",
  },
  {
    num: 9,
    title: "Manual Execution",
    description:
      "Approved actions are carried out by the operator — message sent, CRM updated, case progressed. All execution is logged in Activity.",
    status: "manual",
    bullets: [
      "Operator sends approved draft messages",
      "CRM updates applied after approval",
      "Activity log records every executed action",
    ],
  },
];

const DEFAULT_COUNTS: Counts = {
  pendingApprovals: null,
  openCases: null,
  leadCandidates: null,
  pendingLeads: null,
  inboxMessages: null,
};

// ── Sub-components ─────────────────────────────────────────────────────────────

function CountPill({ count, label }: { count: number | null; label: string }) {
  if (count === null) return null;
  return (
    <span className={`bfc-count${count > 0 ? " bfc-count-live" : ""}`}>
      {count} {label}
    </span>
  );
}

function FlowNode({ node, counts }: { node: NodeDef; counts: Counts }) {
  const count = node.countKey ? counts[node.countKey] : null;
  const extra = node.extraKey ? counts[node.extraKey] : null;
  const hasFooter = count !== null || extra !== null || node.href;

  return (
    <div className={`bfc-node bfc-node-${node.status}`}>
      <div className="bfc-node-inner">
        <div className="bfc-node-step" aria-hidden="true">{node.num}</div>
        <div className="bfc-node-body">
          <div className="bfc-node-top">
            <h3 className="bfc-node-title">{node.title}</h3>
            <Badge tone={STATUS_TONE[node.status]}>{STATUS_LABEL[node.status]}</Badge>
          </div>
          <p className="bfc-node-desc">{node.description}</p>
          {node.bullets && (
            <ul className="bfc-node-bullets">
              {node.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          )}
          {hasFooter && (
            <div className="bfc-node-foot">
              <CountPill count={count}  label={node.countLabel  ?? ""} />
              <CountPill count={extra}  label={node.extraLabel  ?? ""} />
              {node.href && (
                <a href={node.href} className="bfc-node-link">
                  {node.hrefLabel ?? "Open"} →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Connector() {
  return (
    <div className="bfc-connector" aria-hidden="true">
      <div className="bfc-connector-line" />
      <div className="bfc-connector-arrow" />
    </div>
  );
}

function Legend() {
  return (
    <div className="bfc-legend">
      {(["active", "manual", "future", "not_configured"] as NodeStatus[]).map(s => (
        <span key={s} className={`bfc-legend-item bfc-legend-${s}`}>
          {STATUS_LABEL[s]}
        </span>
      ))}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function BusinessFlowCanvas() {
  const [counts, setCounts] = useState<Counts>(DEFAULT_COUNTS);

  useEffect(() => {
    Promise.allSettled([
      api<any[]>("/api/approvals"),
      api<any[]>("/api/cases"),
      api<any[]>("/api/lead-hunter/search/results"),
      api<any[]>("/api/inbox"),
    ]).then(([ar, cr, lr, ir]) => {
      const approvals = ar.status === "fulfilled" ? ar.value : [];
      const cases     = cr.status === "fulfilled" ? cr.value : [];
      const leads     = lr.status === "fulfilled" ? lr.value : [];
      const inbox     = ir.status === "fulfilled" ? ir.value : null;

      setCounts({
        pendingApprovals: approvals.filter((a: any) => a.status === "pending").length,
        openCases:        cases.filter((c: any) => ["open", "in_progress", "qualified"].includes(c.status)).length,
        leadCandidates:   leads.length,
        pendingLeads:     leads.filter((l: any) => l.approvalStatus === "pending").length,
        inboxMessages:    inbox !== null ? inbox.length : null,
      });
    });
  }, []);

  return (
    <div className="bfc-page">
      <div className="bfc-header">
        <h1 className="bfc-title">Business Flow Canvas</h1>
        <p className="bfc-subtitle">
          End-to-end map of the EBOS business pipeline — from lead discovery to operator execution.
          Every action requires explicit approval. Nothing runs automatically.
        </p>
        <Legend />
      </div>

      <div className="bfc-canvas">
        <div className="bfc-flow">
          {NODES.map((node, i) => (
            <Fragment key={node.num}>
              <FlowNode node={node} counts={counts} />
              {i < NODES.length - 1 && <Connector />}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
