import type { ToolRiskLevel } from "./ToolRequest";

export interface ToolExecutionPolicy {
  tool: string;
  canAutoExecute: boolean;
  requiresApproval: boolean;
  allowedRoles: string[];
  riskLevel: ToolRiskLevel;
  description: string;
}

// Default rule: no tool may execute autonomously; all require human approval.
export const SAFE_DEFAULT: Omit<ToolExecutionPolicy, "tool" | "description"> = {
  canAutoExecute:   false,
  requiresApproval: true,
  allowedRoles:     ["admin"],
  riskLevel:        "medium"
};
