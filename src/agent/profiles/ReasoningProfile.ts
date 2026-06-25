import type { IntelligenceContext } from "../core/IntelligenceContext";
import type { IntelligenceResponse } from "../core/IntelligenceResponse";

export interface ReasoningProfile {
  // Unique identifier — used by CIE to look up and route to this profile
  id: string;

  // Human-readable display name
  name: string;

  // Business domain this profile operates in
  domain: string;

  // Semantic version
  version: string;

  // Short description of this profile's capabilities and scope
  description: string;

  // The main reasoning entry point.
  // Receives a fully-prepared IntelligenceContext and must return
  // a complete IntelligenceResponse in the shared structure.
  execute(context: IntelligenceContext): Promise<IntelligenceResponse>;
}
