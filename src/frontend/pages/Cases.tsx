import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Badge, Empty, PageHeader } from "../components/UI";

type LatestEvent = {
  eventType: string;
  summary: string;
  createdAt: string;
};

type CaseListItem = {
  id: string;
  title: string;
  caseType: string;
  caseProfile: string;
  status: string;
  source: string;
  primaryContactName?: string;
  primaryContactEmail?: string;
  createdAt: string;
  updatedAt: string;
  eventCount: number;
  participantCount: number;
  latestEvent?: LatestEvent;
};

type Tone = "neutral" | "gold" | "red" | "green" | "blue";

function tc(s: string): string {
  return s ? s.replace(/[_-]+/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "";
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

const EVENT_LABELS: Record<string, string> = {
  "message.received":       "Message received",
  "intelligence.generated": "Intelligence generated",
  "decision.proposed":      "Decision proposed",
  "toolplan.created":       "Tool plan created",
  "approval.created":       "Approval created"
};

function eventLabel(type: string): string {
  return EVENT_LABELS[type] ?? tc(type);
}

function statusTone(status: string): Tone {
  if (status === "completed") return "green";
  if (status === "qualified" || status === "waiting") return "gold";
  if (status === "open" || status === "in_progress") return "blue";
  return "neutral";
}

function CaseCard({ c }: { c: CaseListItem }) {
  return (
    <article className="case-card">
      <div className="case-card-row">
        <h3 className="case-card-title">{c.title}</h3>
        <span className="case-card-time">{relativeTime(c.createdAt)}</span>
      </div>
      <div className="meta">
        <Badge tone="blue">{c.caseProfile}</Badge>
        <Badge>{tc(c.caseType)}</Badge>
        <Badge>{c.source}</Badge>
        <Badge tone={statusTone(c.status)}>{tc(c.status)}</Badge>
      </div>
      <div className="case-card-meta">
        {c.primaryContactName && <span>{c.primaryContactName}</span>}
        {c.primaryContactName && <span aria-hidden>·</span>}
        <span>{c.eventCount} event{c.eventCount !== 1 ? "s" : ""}</span>
        <span aria-hidden>·</span>
        <span>{c.participantCount} participant{c.participantCount !== 1 ? "s" : ""}</span>
      </div>
      {c.latestEvent && (
        <div className="case-card-latest">
          <span className="case-latest-type">{eventLabel(c.latestEvent.eventType)}</span>
          <span className="case-latest-sep">—</span>
          <span className="case-latest-summary">{trunc(c.latestEvent.summary, 90)}</span>
        </div>
      )}
    </article>
  );
}

export function Cases() {
  const [cases, setCases] = useState<CaseListItem[] | null>(null);

  useEffect(() => {
    api<CaseListItem[]>("/api/cases")
      .then(setCases)
      .catch(() => setCases([]));
  }, []);

  return (
    <>
      <PageHeader
        title="Cases"
        subtitle="Active business cases recorded from inbox messages via Case Runtime."
      />
      {cases === null
        ? <Empty text="Loading cases…" />
        : cases.length === 0
          ? <Empty text="Cases will appear here when inbox messages are linked to Case Runtime." />
          : cases.map(c => <CaseCard key={c.id} c={c} />)
      }
    </>
  );
}
