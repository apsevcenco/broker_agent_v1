import { Router } from "express";

const router = Router();

type LeadSourceStatus = "available" | "not configured" | "coming later";
type LeadSourceConnectionMode = "API" | "Manual import" | "Public search" | "CSV" | "Future integration";

type LeadSourceConfig = {
  id: string;
  name: string;
  category: string;
  status: LeadSourceStatus;
  connectionMode: LeadSourceConnectionMode;
  safetyNote: string;
  requiredSetup: string[];
  allowedUse: string[];
  blockedUse: string[];
  notes: string;
};

const commonBlockedUse = [
  "No scraping private or logged-in pages",
  "No auto-DM or mass messaging",
  "No sending without approval",
  "No attachments without approval",
  "No bypassing platform limits or terms"
];

function futureSource(
  id: string,
  name: string,
  category: string,
  connectionMode: LeadSourceConnectionMode,
  notes: string,
  allowedUse: string[] = ["Manual review", "Research planning", "Future approved integration design"]
): LeadSourceConfig {
  return {
    id,
    name,
    category,
    status: "coming later",
    connectionMode,
    safetyNote: "Not connected in V1. Manual workflow only until a legal integration is approved.",
    requiredSetup: ["Future integration design", "Policy review", "Human approval workflow", "Terms-of-service review"],
    allowedUse,
    blockedUse: commonBlockedUse,
    notes
  };
}

router.get("/", (_req, res) => {
  const serperConfigured = Boolean(process.env.SERPER_API_KEY);
  const sources: LeadSourceConfig[] = [
    {
      id: "serper-google-search",
      name: "Serper / Google Search",
      category: "Public Search",
      status: serperConfigured ? "available" : "not configured",
      connectionMode: "Public search",
      safetyNote: "Public web search only. Creates lead candidate approvals; does not contact prospects.",
      requiredSetup: serperConfigured ? ["SERPER_API_KEY configured in backend environment"] : ["Add SERPER_API_KEY to backend environment variables"],
      allowedUse: ["Public web search", "Lead signal discovery", "Result filtering", "Approval-only lead candidate creation"],
      blockedUse: commonBlockedUse,
      notes: serperConfigured
        ? "Ready for Lead Hunter public web search campaigns."
        : "Not configured yet. Add the key in Render backend environment variables, not in the UI."
    },
    futureSource("google-news", "Google News", "News / Public Search", "Future integration", "Future source for public news monitoring and brand-safe research."),
    futureSource("linkedin", "LinkedIn", "Social / Professional Network", "Future integration", "No LinkedIn connection, scraping or messaging exists in V1.", ["Manual research notes", "Future approved API/integration planning"]),
    futureSource("sales-navigator", "Sales Navigator", "Sales Intelligence", "Future integration", "No Sales Navigator connection exists in V1. Requires legal account-based integration review."),
    futureSource("instagram", "Instagram", "Social", "Future integration", "No Instagram connection, scraping, posting or DM flow exists in V1."),
    futureSource("facebook", "Facebook", "Social", "Future integration", "No Facebook connection, group access, scraping, posting or DM flow exists in V1."),
    futureSource("reddit", "Reddit", "Forum / Community", "Future integration", "Future public-source monitoring only; no posting or messaging in V1."),
    futureSource("yacht-portals", "Yacht portals", "Industry Portals", "Manual import", "Manual workflow only in V1. No portal scraping or paid database ingestion."),
    futureSource("broker-websites", "Broker websites", "Industry Websites", "Manual import", "Manual review of public broker websites only in V1."),
    futureSource("family-office-directories", "Family office directories", "Directories", "Manual import", "Manual workflow only. No paid/private directory scraping or contact harvesting."),
    futureSource("concierge-directories", "Concierge directories", "Directories", "Manual import", "Manual workflow only. Use only public and legally accessible directory information."),
    futureSource("wedding-planner-directories", "Wedding planner directories", "Directories", "Manual import", "Manual workflow only for public event and wedding planner sources."),
    futureSource("luxury-travel-directories", "Luxury travel directories", "Directories", "Manual import", "Manual workflow only for public luxury travel and advisor directories."),
    futureSource("apollo-clay-hunter-rocketreach", "Apollo / Clay / Hunter.io / RocketReach", "Data Providers", "API", "No provider connection exists in V1. Requires compliance, consent and vendor policy review before use."),
    futureSource("csv-import", "CSV import", "Import", "CSV", "Coming later. Will require validation, deduplication and consent/source tracking before import.", ["Future controlled import", "Manual file preparation"]),
    futureSource("crm-import", "CRM import", "Import", "Manual import", "Coming later. Will require field mapping, deduplication and case ownership rules.", ["Future controlled import", "Manual CRM export review"])
  ];

  res.json({
    safetyRules: [
      "Public sources only unless connected legally",
      "No scraping private/logged-in pages",
      "No auto-DM",
      "No mass messaging",
      "No sending without approval",
      "No attachments without approval"
    ],
    sources
  });
});

export default router;
