export type ExecutionStepType =
  | "create_task"
  | "create_lead"
  | "send_draft"
  | "request_approval"
  | "update_memory"
  | "store_experience";

export interface ExecutionStep {
  type: ExecutionStepType;
  description: string;
  priority: number;
  requiresApproval: boolean;
  data?: Record<string, unknown>;
}

export interface ExecutionPlan {
  steps: ExecutionStep[];
  estimatedDuration?: string;
  blockers?: string[];
}
