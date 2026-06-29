import { useEffect, useState } from "react";
import { api } from "../services/api";

// ── Types ─────────────────────────────────────────────────────────────────────

type Status = "connected" | "not_configured" | "coming_later" | "manual_only";

type ConnectionDef = {
  name: string;
  group: string;
  status: Status | "dynamic";
  agents: string[];
  allowed: string[];
  blocked: string[];
  approvalRequired: boolean;
  note: string;
};

// ── Connection definitions ─────────────────────────────────────────────────────

const CONNECTIONS: ConnectionDef[] = [
  // Search Providers
  {
    name: "Serper",
    group: "Search Providers",
    status: "dynamic",
    agents: ["Lead Hunter"],
    allowed: ["Public web search", "Multilingual queries (EN / FR / IT / DE / RU / ES)", "Read-only result scraping"],
    blocked: ["Sending messages", "Storing personal data", "Authenticated access"],
    approvalRequired: false,
    note: "Requires SERPER_API_KEY in environment. Search is read-only — no data is written to Serper.",
  },
  {
    name: "Brave Search",
    group: "Search Providers",
    status: "coming_later",
    agents: ["Lead Hunter (planned)"],
    allowed: ["Public web search", "Privacy-focused results"],
    blocked: ["Sending messages", "Storing personal data"],
    approvalRequired: false,
    note: "Planned as alternative / supplement to Serper. Phase 4.",
  },
  {
    name: "Bing Search",
    group: "Search Providers",
    status: "coming_later",
    agents: ["Lead Hunter (planned)"],
    allowed: ["Public web search", "News and business search"],
    blocked: ["Sending messages", "Storing personal data"],
    approvalRequired: false,
    note: "Planned as additional search provider. Phase 4.",
  },

  // Communication
  {
    name: "Gmail",
    group: "Communication",
    status: "coming_later",
    agents: ["Marketing Agent (planned)", "Support Agent (planned)"],
    allowed: ["Read inbox with operator permission", "Draft reply (not sent)", "Send with explicit operator approval"],
    blocked: ["Send without approval", "Bulk email", "Auto-reply", "Access contacts without permission"],
    approvalRequired: true,
    note: "OAuth 2.0 integration planned for Phase 4. Every send action requires operator approval.",
  },
  {
    name: "Outlook",
    group: "Communication",
    status: "coming_later",
    agents: ["Marketing Agent (planned)", "Support Agent (planned)"],
    allowed: ["Read inbox with operator permission", "Draft reply (not sent)", "Send with explicit operator approval"],
    blocked: ["Send without approval", "Bulk email", "Auto-reply"],
    approvalRequired: true,
    note: "Microsoft 365 OAuth planned for Phase 4. Every send action requires operator approval.",
  },
  {
    name: "WhatsApp Business",
    group: "Communication",
    status: "coming_later",
    agents: ["Support Agent (planned)"],
    allowed: ["Send pre-approved message templates to opted-in contacts"],
    blocked: ["Bulk messaging", "Unsolicited contact", "Sending without prior opt-in", "Media upload without approval"],
    approvalRequired: true,
    note: "WhatsApp Business API via Meta. Phase 4. Requires opt-in compliance and operator approval per message.",
  },
  {
    name: "Telegram",
    group: "Communication",
    status: "coming_later",
    agents: ["Support Agent (planned)"],
    allowed: ["Send approved messages to existing contacts"],
    blocked: ["Unsolicited contact", "Broadcasting", "Bot commands without approval"],
    approvalRequired: true,
    note: "Telegram Bot API planned for Phase 4. Every outgoing message requires operator approval.",
  },

  // Social
  {
    name: "LinkedIn",
    group: "Social",
    status: "coming_later",
    agents: ["Lead Hunter (planned — read only)"],
    allowed: ["Read public company profiles", "Read public person profiles"],
    blocked: ["Send connection requests", "Send messages (InMail)", "Post content", "Access private data", "Scraping beyond public API limits"],
    approvalRequired: true,
    note: "Public data read only via LinkedIn API. Phase 4. DMs and connection requests are permanently blocked.",
  },
  {
    name: "Instagram",
    group: "Social",
    status: "coming_later",
    agents: ["Marketing Agent (planned — read only)"],
    allowed: ["Read public business profiles", "Monitor brand mentions (public)"],
    blocked: ["Post content", "Send DMs", "Access private accounts", "Auto-follow / auto-like"],
    approvalRequired: true,
    note: "Instagram Graph API planned for Phase 4. Only public read access. No posting without operator approval.",
  },
  {
    name: "Facebook",
    group: "Social",
    status: "coming_later",
    agents: ["Marketing Agent (planned)"],
    allowed: ["Read public business page data", "Post to owned pages with approval"],
    blocked: ["Send messages to individuals", "Access private groups", "Ad management without approval"],
    approvalRequired: true,
    note: "Meta Graph API planned for Phase 4. All page posts require operator approval.",
  },
  {
    name: "X (Twitter)",
    group: "Social",
    status: "coming_later",
    agents: ["Marketing Agent (planned)"],
    allowed: ["Read public posts and mentions", "Post with operator approval"],
    blocked: ["Auto-reply", "Follow / unfollow automation", "DMs without approval"],
    approvalRequired: true,
    note: "X API v2 planned for Phase 4. All posts require operator approval.",
  },

  // Data Providers
  {
    name: "Apollo",
    group: "Data Providers",
    status: "coming_later",
    agents: ["Lead Hunter (planned)", "Yacht Broker (planned)"],
    allowed: ["Enrich company and contact records", "Verify email addresses"],
    blocked: ["Bulk export", "Mass outreach through Apollo", "Accessing data outside business scope"],
    approvalRequired: true,
    note: "B2B lead enrichment API. Phase 4. Used to enrich discovered leads with verified contact data.",
  },
  {
    name: "Clay",
    group: "Data Providers",
    status: "coming_later",
    agents: ["Lead Hunter (planned)"],
    allowed: ["Multi-source lead enrichment", "Company data lookup"],
    blocked: ["Bulk export without approval", "Mass outreach through Clay"],
    approvalRequired: true,
    note: "Data enrichment platform. Phase 4. Aggregates multiple data sources per lead.",
  },
  {
    name: "RocketReach",
    group: "Data Providers",
    status: "coming_later",
    agents: ["Lead Hunter (planned)", "Yacht Broker (planned)"],
    allowed: ["Lookup verified email addresses", "Look up professional profiles"],
    blocked: ["Bulk export", "Accessing personal data outside business context"],
    approvalRequired: true,
    note: "Professional contact data. Phase 4. Used to find verified contact details for approved leads.",
  },
  {
    name: "Hunter.io",
    group: "Data Providers",
    status: "coming_later",
    agents: ["Lead Hunter (planned)"],
    allowed: ["Find email addresses by domain", "Verify email deliverability"],
    blocked: ["Bulk export", "Sending emails through Hunter"],
    approvalRequired: false,
    note: "Email finder API. Phase 4. Read-only — finds contact emails, does not send anything.",
  },

  // Storage
  {
    name: "Google Drive",
    group: "Storage",
    status: "coming_later",
    agents: ["Yacht Broker (planned)", "Charter Agent (planned)"],
    allowed: ["Read case-linked documents with permission", "Save approved documents"],
    blocked: ["Access files outside EBOS folders", "Delete files", "Share files without approval"],
    approvalRequired: true,
    note: "Document storage for case artifacts (NDAs, valuations, surveys). Phase 3.",
  },
  {
    name: "Dropbox",
    group: "Storage",
    status: "coming_later",
    agents: ["Yacht Broker (planned)"],
    allowed: ["Read and save case documents with permission"],
    blocked: ["Access files outside EBOS folders", "Delete files without approval"],
    approvalRequired: true,
    note: "Alternative document storage. Phase 3.",
  },
  {
    name: "OneDrive",
    group: "Storage",
    status: "coming_later",
    agents: ["Yacht Broker (planned)"],
    allowed: ["Read and save case documents with permission"],
    blocked: ["Access files outside EBOS folders", "Delete files without approval"],
    approvalRequired: true,
    note: "Microsoft 365 document storage. Phase 3.",
  },

  // Calendar
  {
    name: "Google Calendar",
    group: "Calendar",
    status: "coming_later",
    agents: ["Yacht Broker (planned)", "Support Agent (planned)"],
    allowed: ["Read available slots with permission", "Create events with operator approval"],
    blocked: ["Delete or modify events without approval", "Access calendars outside EBOS scope"],
    approvalRequired: true,
    note: "Viewing and scheduling calendar events for showings, calls, and handovers. Phase 3.",
  },
  {
    name: "Outlook Calendar",
    group: "Calendar",
    status: "coming_later",
    agents: ["Yacht Broker (planned)", "Support Agent (planned)"],
    allowed: ["Read available slots with permission", "Create events with operator approval"],
    blocked: ["Delete or modify events without approval", "Access calendars outside EBOS scope"],
    approvalRequired: true,
    note: "Microsoft 365 calendar integration. Phase 3.",
  },
];

const GROUPS = ["Search Providers", "Communication", "Social", "Data Providers", "Storage", "Calendar"] as const;

// ── Utilities ─────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<Status, string> = {
  connected: "Connected",
  not_configured: "Not Configured",
  coming_later: "Coming Later",
  manual_only: "Manual Only",
};

function statusClass(s: Status): string {
  return `cc-status cc-status-${s.replace("_", "-")}`;
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ConnectionCard({ conn, serperConnected }: { conn: ConnectionDef; serperConnected: boolean | null }) {
  const resolvedStatus: Status =
    conn.status === "dynamic"
      ? serperConnected === null
        ? "not_configured"
        : serperConnected
          ? "connected"
          : "not_configured"
      : conn.status;

  return (
    <div className={`cc-card cc-card-${resolvedStatus.replace("_", "-")}`}>
      <div className="cc-card-head">
        <div className="cc-card-name">{conn.name}</div>
        <span className={statusClass(resolvedStatus)}>{STATUS_LABEL[resolvedStatus]}</span>
      </div>

      <div className="cc-card-group">{conn.group}</div>

      {conn.agents.length > 0 && (
        <div className="cc-card-row">
          <span className="cc-row-label">Used by</span>
          <span className="cc-row-val">{conn.agents.join(", ")}</span>
        </div>
      )}

      {conn.allowed.length > 0 && (
        <div className="cc-card-section">
          <div className="cc-section-label">Allowed</div>
          <ul className="cc-list cc-list-allowed">
            {conn.allowed.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}

      {conn.blocked.length > 0 && (
        <div className="cc-card-section">
          <div className="cc-section-label">Blocked</div>
          <ul className="cc-list cc-list-blocked">
            {conn.blocked.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        </div>
      )}

      <div className="cc-card-foot">
        <div className="cc-approval">
          <span className={`cc-approval-dot${conn.approvalRequired ? " cc-approval-yes" : " cc-approval-no"}`} />
          {conn.approvalRequired ? "Approval required before every action" : "No approval required (read-only)"}
        </div>
        <div className="cc-note">{conn.note}</div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function ConnectionsPage() {
  const [serperConnected, setSerperConnected] = useState<boolean | null>(null);

  useEffect(() => {
    api<{ serper: boolean }>("/api/connections/status")
      .then(r => setSerperConnected(r.serper))
      .catch(() => setSerperConnected(false));
  }, []);

  const connectedCount = CONNECTIONS.filter(c =>
    c.status === "dynamic" ? serperConnected === true : c.status === "connected"
  ).length;

  const notConfiguredCount = CONNECTIONS.filter(c =>
    c.status === "dynamic" && serperConnected === false
  ).length;

  return (
    <div className="cc-page">
      <div className="cc-header">
        <div>
          <h1 className="cc-title">Connection Center</h1>
          <p className="cc-subtitle">
            External services that EBOS agents may use. Every integration is read-only or requires
            explicit operator approval before any action is taken.
          </p>
        </div>
        <div className="cc-summary">
          <div className="cc-summary-item cc-summary-connected">
            <span className="cc-summary-num">{connectedCount}</span>
            <span>Active</span>
          </div>
          <div className="cc-summary-item cc-summary-not-configured">
            <span className="cc-summary-num">{notConfiguredCount > 0 ? notConfiguredCount : CONNECTIONS.filter(c => c.status === "not_configured").length}</span>
            <span>Not Configured</span>
          </div>
          <div className="cc-summary-item cc-summary-coming">
            <span className="cc-summary-num">{CONNECTIONS.filter(c => c.status === "coming_later").length}</span>
            <span>Coming Later</span>
          </div>
        </div>
      </div>

      <div className="cc-safety-bar">
        <strong>Safety guarantee:</strong> No connection can send, post, or contact anyone automatically.
        Every write or send action requires explicit operator approval before it executes.
      </div>

      <div className="cc-body">
        {GROUPS.map(group => {
          const items = CONNECTIONS.filter(c => c.group === group);
          return (
            <section key={group} className="cc-group">
              <h2 className="cc-group-title">{group}</h2>
              <div className="cc-grid">
                {items.map(conn => (
                  <ConnectionCard key={conn.name} conn={conn} serperConnected={serperConnected} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
