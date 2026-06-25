import type { ToolCategory, ToolRiskLevel } from "./ToolRequest";
import type { ToolExecutionPolicy } from "./ToolExecutionPolicy";

interface RegistryEntry {
  tool: string;
  category: ToolCategory;
  description: string;
  defaultPolicy: Pick<ToolExecutionPolicy, "canAutoExecute" | "requiresApproval" | "allowedRoles" | "riskLevel">;
}

function safeEntry(
  tool: string,
  category: ToolCategory,
  description: string,
  riskLevel: ToolRiskLevel = "medium"
): RegistryEntry {
  return {
    tool,
    category,
    description,
    defaultPolicy: {
      canAutoExecute:   false,
      requiresApproval: true,
      allowedRoles:     ["admin"],
      riskLevel
    }
  };
}

const REGISTRY: RegistryEntry[] = [
  safeEntry("crm.createLead",              "CRM",         "Create a new lead record from an incoming enquiry.",                      "low"),
  safeEntry("crm.updateLead",              "CRM",         "Update qualification data on an existing CRM lead.",                      "low"),
  safeEntry("task.create",                 "TASK",        "Create a follow-up or qualification task in the task queue.",             "low"),
  safeEntry("calendar.proposeMeeting",     "CALENDAR",    "Propose a meeting slot to a contact. Draft only — never sent without approval.", "low"),
  safeEntry("email.prepareDraft",          "EMAIL",       "Prepare an email draft for admin review before send.",                    "medium"),
  safeEntry("document.requestNda",         "DOCUMENT",    "Prepare and route an NDA request. Legal document — requires admin approval before contact.", "high"),
  safeEntry("knowledge.proposeEntry",      "KNOWLEDGE",   "Propose a new knowledge base entry from conversation content.",           "low"),
  safeEntry("memory.proposeUpdate",        "MEMORY",      "Propose an update to the relationship memory for a contact.",             "low"),
  safeEntry("search.webResearch",          "SEARCH",      "Conduct public web research on a contact, company, or vessel.",           "medium"),
  safeEntry("social.searchLead",           "SOCIAL",      "Search public social profiles for lead qualification signals. No scraping, no contact.", "medium"),
  safeEntry("translation.translateDocument","TRANSLATION", "Translate a message or document. No external transmission.",             "low"),
  safeEntry("media.generateAsset",         "MEDIA",       "Generate a media asset (listing image, teaser doc) for admin review. Not published without approval.", "medium"),
];

const REGISTRY_MAP = new Map<string, RegistryEntry>(REGISTRY.map(e => [e.tool, e]));

export function lookupTool(tool: string): RegistryEntry | null {
  return REGISTRY_MAP.get(tool) ?? null;
}

// Returns the full execution policy for a tool.
// Unknown tools are treated as INTERNAL with the highest caution.
export function resolvePolicy(tool: string): ToolExecutionPolicy {
  const entry = REGISTRY_MAP.get(tool);
  if (entry) {
    return { tool, ...entry.defaultPolicy, description: entry.description };
  }
  return {
    tool,
    canAutoExecute:   false,
    requiresApproval: true,
    allowedRoles:     ["admin"],
    riskLevel:        "high",
    description:      "Unknown tool — treated as INTERNAL. Manual admin approval required."
  };
}

export { REGISTRY };
