import { PageHeader } from "../components/UI";

function PlaceholderPage({ title, subtitle, body, note }: { title: string; subtitle: string; body: string; note?: string }) {
  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="panel" style={{ maxWidth: 640 }}>
        <p style={{ margin: "0 0 12px" }}>{body}</p>
        {note && <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>{note}</p>}
      </div>
    </>
  );
}

export function Goals() {
  return (
    <PlaceholderPage
      title="Goals"
      subtitle="Business objectives that justify Cases and measure strategic progress."
      body="The Goal Engine connects company strategy to operational execution. Every Case will be linked to a Goal that justifies its existence and defines measurable success criteria."
      note="Architecture: docs/architecture/03_GOAL_ENGINE.md"
    />
  );
}

export function Experience() {
  return (
    <PlaceholderPage
      title="Experience"
      subtitle="Company learning derived from completed Cases."
      body="The Experience Engine will convert closed Cases and recorded Outcomes into organizational learning — negotiation patterns, deal insights, and commercial intelligence that improves future AI reasoning."
      note="Architecture: docs/architecture/02_BUSINESS_DOMAIN_MODEL.md"
    />
  );
}

export function Documents() {
  return (
    <PlaceholderPage
      title="Documents"
      subtitle="Business artifacts linked to Cases and participants."
      body="Documents will manage NDAs, SPAs, MOAs, valuations, surveys, passports, and other business artifacts — each version-controlled and connected to its parent Case and relevant participants."
    />
  );
}

export function SalesPage() {
  return (
    <PlaceholderPage
      title="Yacht Sales"
      subtitle="Active yacht sale opportunities, qualified buyers, and deal pipeline."
      body="This workspace will show every active yacht sale case — buyer qualification status, offer stage, deal value, and agent assignment. Linked to the Yacht Broker agent and Business Cases."
      note="Planned for Phase 3. Use Cases and Lead Hunter Results in the meantime."
    />
  );
}

export function CharterPage() {
  return (
    <PlaceholderPage
      title="Charter Pipeline"
      subtitle="Yacht charter bookings, qualified charter clients, and seasonal planning."
      body="This workspace will show charter enquiries, season availability, client qualification, and booking status. Linked to the Charter Agent and Business Cases."
      note="Planned for Phase 3. Use Cases and Lead Hunter Results in the meantime."
    />
  );
}

export function CarRentalPage() {
  return (
    <PlaceholderPage
      title="Car Rental"
      subtitle="Luxury car rental requests, active bookings, and client pipeline."
      body="This workspace will show inbound rental requests, availability, client qualification, and booking status. Linked to the Car Rental Agent and Business Cases."
      note="Planned for Phase 3. Use Cases and Lead Hunter Results in the meantime."
    />
  );
}

export function ConnectionsPage() {
  return (
    <PlaceholderPage
      title="Connections"
      subtitle="External service integrations used by EBOS agents."
      body="The Connection Center will show every integrated service — search providers, communication channels, CRM systems, and data enrichment tools. Each connection will display its status, the agents that use it, and the approval rules that govern its use."
      note="Currently active: Serper Web Search (used by Lead Hunter). Planned integrations: Gmail, LinkedIn, WhatsApp Business, Apollo, Clay."
    />
  );
}
