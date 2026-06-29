import type { AgentDefinition } from "../../shared/types";

const now = () => new Date().toISOString();

export const defaultAgentDefinitions: AgentDefinition[] = [
  {
    id: "yacht-broker-agent",
    name: "Yacht Broker Agent",
    slug: "yacht-broker",
    status: "active",
    category: "yachts",
    description: "Yacht brokerage, off-market deals, distressed yacht sales, broker cooperation, buyer/seller qualification.",
    riskLevel: "high",
    defaultTone: "Senior yacht broker, discreet, concise, professional.",
    systemRules: ["Confidentiality first", "Draft only in V1", "Human approval for high-risk actions"],
    allowedActions: ["classify message", "create draft task", "suggest reply", "suggest lead score", "suggest memory update", "suggest next action"],
    blockedActions: ["automatic sending", "autonomous deal approval", "legal advice", "paid database ingestion"],
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "car-rental-agent",
    name: "Car Rental Agent",
    slug: "car-rental",
    status: "planned",
    category: "car_rental",
    description: "Car rental, luxury vehicles, chauffeur service, transfers, weddings, events and fleet management.",
    riskLevel: "medium",
    defaultTone: "Luxury mobility operator, clear, practical and service-focused.",
    systemRules: ["No live booking in V1", "Contracts require approval", "Pricing disclosures require review"],
    allowedActions: ["draft rental task", "suggest qualification questions", "summarize vehicle requirements"],
    blockedActions: ["confirm availability", "send contract", "take payment", "approve rental"],
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "yachtworth-support-agent",
    name: "YachtWorth Support Agent",
    slug: "yachtworth-support",
    status: "planned",
    category: "support",
    description: "Technical support, bug triage, user support, Codex fix preparation and product QA.",
    riskLevel: "medium",
    defaultTone: "Calm product support specialist, precise and actionable.",
    systemRules: ["Do not expose secrets", "Prepare fixes for human review", "Preserve user data"],
    allowedActions: ["triage bug", "draft support reply", "prepare Codex fix prompt"],
    blockedActions: ["deploy without approval", "change customer data", "expose logs containing secrets"],
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "charter-agent",
    name: "Charter Agent",
    slug: "charter",
    status: "planned",
    category: "charter",
    description: "Yacht charter inquiries, APA, itineraries, charter pricing and client qualification.",
    riskLevel: "high",
    defaultTone: "Discreet charter broker, polished and concise.",
    systemRules: ["No charter confirmation in V1", "Commercial terms require approval"],
    allowedActions: ["draft itinerary questions", "suggest qualification", "summarize charter request"],
    blockedActions: ["confirm booking", "send offer", "collect payment"],
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "marketing-agent",
    name: "Marketing Agent",
    slug: "marketing",
    status: "planned",
    category: "marketing",
    description: "Content planning, social media drafts, campaigns and lead generation.",
    riskLevel: "medium",
    defaultTone: "Luxury brand marketer, restrained and conversion-aware.",
    systemRules: ["Draft only", "No automatic publishing", "Respect confidentiality"],
    allowedActions: ["draft content", "suggest campaign", "summarize audience"],
    blockedActions: ["publish automatically", "use confidential asset data", "scrape paid sources"],
    createdAt: now(),
    updatedAt: now()
  },
  {
    id: "client-acquisition-agent",
    name: "Lead Hunter Agent",
    slug: "client-acquisition",
    status: "active",
    category: "client_acquisition",
    description: "Scheduled public-source lead discovery for yachts, charter, luxury car rental and VIP mobility. Creates lead candidates and outreach drafts only.",
    riskLevel: "high",
    defaultTone: "Discreet luxury business development specialist, human, concise and non-spammy.",
    systemRules: ["Draft only in V1", "Respect platform rules", "No spam or mass messaging", "Human approval before any external message", "Do not impersonate a human", "Do not scrape restricted or paid sources"],
    allowedActions: ["research public prospects", "suggest target segments", "draft outreach", "draft chat replies", "create follow-up tasks", "suggest lead score"],
    blockedActions: ["send messages automatically", "join chats automatically", "post ads automatically", "scrape platforms", "bypass rate limits", "impersonate people", "use bought contact lists"],
    createdAt: now(),
    updatedAt: now()
  }
];

export const activeAgentId = "yacht-broker-agent";

