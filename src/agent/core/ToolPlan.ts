import type { ToolRequest, ToolRiskLevel } from "./ToolRequest";

export interface ToolPlan {
  toolRequests: ToolRequest[];
  summary: string;
  requiresApproval: boolean;
  highestRiskLevel: ToolRiskLevel;
}

const RISK_RANK: Record<string, number> = { low: 0, medium: 1, high: 2 };

export function buildToolPlan(requests: ToolRequest[], summary: string): ToolPlan {
  const requiresApproval = requests.length === 0 || requests.some(r => r.approvalRequired);

  const highestRiskLevel = requests.reduce<ToolRiskLevel>((max, r) => {
    const rank = RISK_RANK[r.riskLevel ?? "low"] ?? 0;
    return rank > (RISK_RANK[max] ?? 0) ? (r.riskLevel as ToolRiskLevel) : max;
  }, "low");

  return { toolRequests: requests, summary, requiresApproval, highestRiskLevel };
}
