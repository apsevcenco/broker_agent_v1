import type { AiProviderName, AiTaskType, RiskLevel } from "../shared/types";

export interface AiRequest {
  taskType: AiTaskType;
  prompt: string;
  context?: Record<string, unknown>;
}

export interface AiTextResult {
  provider: AiProviderName;
  text: string;
  confidence: number;
  mocked: boolean;
}

export interface AiStructuredResult<T = Record<string, unknown>> {
  provider: AiProviderName;
  data: T;
  confidence: number;
  mocked: boolean;
}

export interface AiRiskResult extends AiTextResult {
  riskLevel: RiskLevel;
  requiresApproval: boolean;
}

export interface AiProvider {
  name: AiProviderName;
  configured: boolean;
  generateText(request: AiRequest): Promise<AiTextResult>;
  summarize(request: AiRequest): Promise<AiTextResult>;
  classify(request: AiRequest): Promise<AiStructuredResult<{ classification: string }>>;
  extractStructuredData<T = Record<string, unknown>>(request: AiRequest): Promise<AiStructuredResult<T>>;
  reviewRisk(request: AiRequest): Promise<AiRiskResult>;
}
