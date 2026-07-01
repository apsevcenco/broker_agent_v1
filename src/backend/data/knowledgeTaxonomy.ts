export interface AgentKnowledgeCategory {
  id: string;
  label: string;
  description: string;
  tags: string[];
  risk: "low" | "medium" | "high" | "critical";
}

export interface AgentKnowledgeTaxonomy {
  agentId: string;
  slug: string;
  categories: AgentKnowledgeCategory[];
}

export const knowledgeTaxonomies: AgentKnowledgeTaxonomy[] = [
  {
    agentId: "yacht-broker-agent",
    slug: "yacht-broker",
    categories: [
      { id: "brokerage-process", label: "Brokerage Process", description: "Inquiry, qualification, NDA, disclosure, offers, survey, closing and handover.", tags: ["brokerage", "sales", "closing"], risk: "high" },
      { id: "contracts", label: "Contracts and Deal Flow", description: "LOI, MOA, SPA, escrow, deposits, conditions, inspection and acceptance workflow.", tags: ["loi", "moa", "spa", "escrow"], risk: "critical" },
      { id: "flags-registration", label: "Flags and Registration", description: "Flag state selection, vessel registration, ownership evidence and private or commercial registration implications.", tags: ["flag", "registration", "registry"], risk: "critical" },
      { id: "tax-vat-customs", label: "Tax, VAT and Customs", description: "High-level VAT, customs, import/export and temporary admission awareness with legal-review boundaries.", tags: ["vat", "customs", "tax"], risk: "critical" },
      { id: "classification-survey", label: "Classification and Survey", description: "Class societies, condition surveys, sea trials, statutory certificates and technical due diligence.", tags: ["class", "survey", "certificates"], risk: "high" },
      { id: "safety-compliance", label: "Safety and Compliance", description: "SOLAS/MARPOL/MLC/ISM/ISPS awareness and yacht code references where relevant.", tags: ["solas", "marpol", "mlc", "ism", "isps"], risk: "critical" },
      { id: "charter", label: "Charter Operations", description: "Private versus commercial use, charter compliance, operational limits, crew and insurance implications.", tags: ["charter", "commercial", "private"], risk: "high" },
      { id: "crew-operations", label: "Crew and Operations", description: "Crew, management, safety management, operational readiness, handover and ongoing ownership support.", tags: ["crew", "management", "operations"], risk: "high" },
      { id: "insurance-risk", label: "Insurance and Risk", description: "Insurance placement, warranties, navigation limits, claims awareness and disclosure risks.", tags: ["insurance", "risk", "warranty"], risk: "high" },
      { id: "valuation-market", label: "Valuation and Market", description: "Comparable sales, asking strategy, condition impact, refit history, depreciation and market positioning.", tags: ["valuation", "market", "pricing"], risk: "medium" },
      { id: "refit-technical", label: "Refit and Technical", description: "Refit planning, maintenance records, shipyard history, technical red flags and lifecycle costs.", tags: ["refit", "maintenance", "technical"], risk: "medium" },
      { id: "kyc-aml-sanctions", label: "KYC, AML and Sanctions", description: "Client identification, beneficial ownership, sanctions screening and enhanced diligence triggers.", tags: ["kyc", "aml", "sanctions"], risk: "critical" },
      { id: "marinas-berthing", label: "Marinas and Berthing", description: "Berthing, cruising region constraints, seasonal demand, permits and operational logistics.", tags: ["marina", "berth", "logistics"], risk: "medium" },
      { id: "advisory-boundaries", label: "Advisory Boundaries", description: "Where the agent must stay high-level and require legal, tax, flag, class, insurance or broker approval.", tags: ["approval", "legal-review", "boundaries"], risk: "critical" }
    ]
  },
  {
    agentId: "car-rental-agent",
    slug: "car-rental",
    categories: [
      { id: "fleet", label: "Fleet and Availability", description: "Vehicle profiles, availability, delivery, pickup and utilization.", tags: ["fleet", "availability"], risk: "medium" },
      { id: "contracts", label: "Rental Contracts", description: "Deposits, insurance, driver eligibility, mileage, damages and approval flow.", tags: ["contract", "deposit", "insurance"], risk: "high" }
    ]
  },
  {
    agentId: "client-acquisition-agent",
    slug: "client-acquisition",
    categories: [
      { id: "commercial-search", label: "Commercial Search", description: "Search strategy, query construction, boolean operators, multilingual expansion and public source prioritisation.", tags: ["search", "query", "boolean", "multilingual"], risk: "low" },
      { id: "demand-discovery", label: "Demand Discovery", description: "Active demand signals, RFQ detection, booking requests, tender notices, urgency indicators and buyer intent.", tags: ["demand", "rfq", "booking", "urgency", "intent"], risk: "medium" },
      { id: "company-discovery", label: "Company Discovery", description: "Family office identification, yacht brokerage, charter company, concierge, hotel, villa management and luxury travel advisor signals.", tags: ["company", "family-office", "broker", "concierge", "hotel"], risk: "medium" },
      { id: "partner-discovery", label: "Partner Discovery", description: "Referral partner detection, commission opportunities, strategic partnerships and high-value partner profiles.", tags: ["partner", "referral", "commission", "partnership"], risk: "medium" },
      { id: "market-intelligence", label: "Market Intelligence", description: "Fleet changes, builder news, marina activity, new hotels, competitor monitoring and industry expansion signals.", tags: ["market", "competitor", "fleet", "builder", "marina"], risk: "low" },
      { id: "classification", label: "Classification", description: "Rules for classifying results as company lead, partner lead, active demand, market intelligence, provider page, job ad, directory, SEO page or unclear.", tags: ["classification", "provider", "job-ad", "directory", "seo"], risk: "medium" },
      { id: "freshness", label: "Freshness", description: "Determining whether a result is today, tomorrow, this week, this month, recent, expired, historical or archived.", tags: ["freshness", "date", "stale", "urgency", "recent"], risk: "low" },
      { id: "geography", label: "Geography", description: "Commercial territory rules including French Riviera, Monaco, Mediterranean, airport terminology, marina terminology and luxury travel hotspots.", tags: ["geography", "monaco", "riviera", "mediterranean", "airport"], risk: "low" },
      { id: "commercial-scoring", label: "Commercial Scoring", description: "Opportunity score (A–D), confidence, urgency, commercial potential and decision priority framework.", tags: ["scoring", "opportunity", "confidence", "urgency", "priority"], risk: "medium" },
      { id: "rejection-rules", label: "Rejection Rules", description: "Provider detection, SEO content, job advertisement, duplicate, directory and spam rejection rules with false-positive prevention.", tags: ["rejection", "provider", "spam", "duplicate", "seo"], risk: "medium" },
      { id: "evidence-rules", label: "Evidence Rules", description: "Minimum evidence requirements before creating approvals, business cases or recommendations.", tags: ["evidence", "approval", "confidence", "minimum"], risk: "high" },
      { id: "communication-awareness", label: "Communication Awareness", description: "Recognising commercial language, RFQs, booking requests, quotation language and intent signals without writing outreach.", tags: ["communication", "rfq", "booking", "intent", "language"], risk: "medium" },
      { id: "policy", label: "Policy", description: "Operational policies governing Lead Hunter behaviour: never invent leads, never auto-contact, never fabricate urgency, approval before execution.", tags: ["policy", "compliance", "approval", "boundary"], risk: "high" }
    ]
  }
];

export function findKnowledgeTaxonomy(slug: string) {
  return knowledgeTaxonomies.find((taxonomy) => taxonomy.slug === slug) || null;
}
