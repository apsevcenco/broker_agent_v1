export type ToolCategory =
  | "CRM"
  | "EMAIL"
  | "SOCIAL"
  | "SEARCH"
  | "DOCUMENT"
  | "KNOWLEDGE"
  | "MEMORY"
  | "TASK"
  | "CALENDAR"
  | "TRANSLATION"
  | "MEDIA"
  | "ANALYTICS"
  | "INTERNAL";

export type ToolRequestStatus   = "proposed" | "approved" | "rejected" | "executed" | "failed";
export type ToolRequestPriority = "low" | "medium" | "high" | "critical";
export type ToolRiskLevel       = "low" | "medium" | "high";

export interface ToolRequest {
  id: string;
  tool: string;
  category: ToolCategory;
  reason: string;
  priority: ToolRequestPriority;
  approvalRequired: boolean;
  status: ToolRequestStatus;
  input: Record<string, unknown>;
  expectedOutput?: string;
  riskLevel?: ToolRiskLevel;
  createdAt: string;
}
