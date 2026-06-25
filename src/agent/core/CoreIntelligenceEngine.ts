import type { IntelligenceContext } from "./IntelligenceContext";
import type { IntelligenceResponse } from "./IntelligenceResponse";
import type { ReasoningProfile } from "../profiles/ReasoningProfile";
import { YachtBrokerProfile } from "../profiles/yachtBroker/YachtBrokerProfile";

// ---------------------------------------------------------------------------
// Profile registry
// To add a new profile: import it and add an entry to this map.
// CIE knows nothing about the profile's domain — it only orchestrates.
// ---------------------------------------------------------------------------
const PROFILES = new Map<string, ReasoningProfile>([
  ["yacht-broker", YachtBrokerProfile]
  // Future profiles are registered here, e.g.:
  // ["charter",     CharterProfile],
  // ["marketing",   MarketingProfile],
  // ["lead-hunter", LeadHunterProfile],
]);

function validate(response: IntelligenceResponse): IntelligenceResponse {
  if (!response.profileId)  throw new Error("[CIE] Response missing profileId");
  if (!response.perception) throw new Error("[CIE] Response missing perception layer");
  if (!response.reasoning)  throw new Error("[CIE] Response missing reasoning layer");
  if (!response.decision)   throw new Error("[CIE] Response missing decision layer");
  if (!response.planning)   throw new Error("[CIE] Response missing planning layer");
  if (!response.execution)  throw new Error("[CIE] Response missing execution layer");
  if (!response.learning)   throw new Error("[CIE] Response missing learning layer");
  if (!response.draft)      throw new Error("[CIE] Response missing draft layer");

  const plan = response.execution.toolPlan;
  if (plan !== undefined) {
    if (!Array.isArray(plan.toolRequests)) {
      throw new Error("[CIE] toolPlan.toolRequests must be an array");
    }
    if (typeof plan.summary !== "string") {
      throw new Error("[CIE] toolPlan.summary must be a string");
    }
    console.log(
      `[CIE] ToolPlan: ${plan.toolRequests.length} request(s),` +
      ` highestRisk=${plan.highestRiskLevel},` +
      ` requiresApproval=${plan.requiresApproval}`
    );
  }

  return response;
}

export const CoreIntelligenceEngine = {
  // Execute a named reasoning profile against the prepared context.
  async execute(profileId: string, context: IntelligenceContext): Promise<IntelligenceResponse> {
    const profile = PROFILES.get(profileId);
    if (!profile) {
      throw new Error(`[CIE] No reasoning profile registered for id: "${profileId}". Registered: ${[...PROFILES.keys()].join(", ")}`);
    }
    const response = await profile.execute(context);
    return validate(response);
  },

  // List registered profiles (used by admin and future routing logic).
  listProfiles(): Array<{ id: string; name: string; domain: string; version: string }> {
    return [...PROFILES.values()].map(p => ({
      id:      p.id,
      name:    p.name,
      domain:  p.domain,
      version: p.version
    }));
  }
};
