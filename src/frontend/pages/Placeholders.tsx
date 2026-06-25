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

export function Cases() {
  return (
    <PlaceholderPage
      title="Cases"
      subtitle="The operational unit of business execution."
      body="Case Runtime V1 is already active — every suggested reply is linked to a Case in the background. The full Case management interface (list, timeline, participants, decisions) is the next major UI milestone."
      note="Case data is being recorded now. Architecture: docs/architecture/runtime/R01_CASE_RUNTIME.md"
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
