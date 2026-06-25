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
      { id: "safe-outreach", label: "Safe Outreach", description: "Compliant prospect research, drafting, approval and anti-spam boundaries.", tags: ["outreach", "compliance", "approval"], risk: "high" },
      { id: "prospect-research", label: "Prospect Research", description: "Public-source research, segmentation and relationship-first lead development.", tags: ["prospecting", "research", "lead"], risk: "medium" }
    ]
  }
];

export function findKnowledgeTaxonomy(slug: string) {
  return knowledgeTaxonomies.find((taxonomy) => taxonomy.slug === slug) || null;
}
