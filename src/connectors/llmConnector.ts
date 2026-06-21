export interface LlmDraftRequest { instruction: string; context: Record<string, unknown>; }
export async function runLlmDraftPlaceholder(request: LlmDraftRequest) { return { status: "rule_based_v1", request, todo: "Add OpenAI connector later; keep approval workflow mandatory." }; }
