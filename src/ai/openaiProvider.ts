import OpenAI from "openai";
import type { AiProvider, AiRequest, AiRiskResult, AiStructuredResult, AiTextResult } from "./aiProviderTypes";
import type { RiskLevel } from "../shared/types";

const HIGH_QUALITY_TASKS = new Set([
  "conversation_reply",
  "legal_risk_review",
  "document_analysis",
  "code_fix_prompt"
]);

function modelFor(taskType: string): string {
  return HIGH_QUALITY_TASKS.has(taskType) ? "gpt-4o" : "gpt-4o-mini";
}

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

type MessageParam = OpenAI.Chat.ChatCompletionMessageParam;

async function complete(model: string, userPrompt: string, systemPrompt?: string): Promise<string> {
  const messages: MessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });
  const res = await getClient().chat.completions.create({ model, messages, max_tokens: 1500, temperature: 0.3 });
  return res.choices[0]?.message?.content ?? "";
}

async function completeJson<T>(model: string, userPrompt: string, systemPrompt?: string): Promise<T> {
  const messages: MessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: userPrompt });
  const res = await getClient().chat.completions.create({
    model,
    messages,
    response_format: { type: "json_object" },
    max_tokens: 800,
    temperature: 0.1
  });
  return JSON.parse(res.choices[0]?.message?.content ?? "{}") as T;
}

const VALID_RISK_LEVELS: RiskLevel[] = ["low", "medium", "high", "critical"];

export const openaiProvider: AiProvider = {
  name: "openai",
  configured: Boolean(process.env.OPENAI_API_KEY),

  async generateText(request: AiRequest): Promise<AiTextResult> {
    const text = await complete(modelFor(request.taskType), request.prompt);
    return { provider: "openai", text, confidence: 0.9, mocked: false };
  },

  async summarize(request: AiRequest): Promise<AiTextResult> {
    const text = await complete(
      "gpt-4o-mini",
      request.prompt,
      "Summarize the following content concisely. Return only the summary text."
    );
    return { provider: "openai", text, confidence: 0.88, mocked: false };
  },

  async classify(request: AiRequest): Promise<AiStructuredResult<{ classification: string }>> {
    const data = await completeJson<{ classification: string }>(
      "gpt-4o-mini",
      request.prompt,
      'Classify the following content. Return JSON with a single "classification" field containing a short label.'
    );
    return { provider: "openai", data, confidence: 0.87, mocked: false };
  },

  async extractStructuredData<T = Record<string, unknown>>(request: AiRequest): Promise<AiStructuredResult<T>> {
    const data = await completeJson<T>(
      "gpt-4o-mini",
      request.prompt,
      "Extract structured data from the following. Return a valid JSON object."
    );
    return { provider: "openai", data, confidence: 0.85, mocked: false };
  },

  async reviewRisk(request: AiRequest): Promise<AiRiskResult> {
    const result = await completeJson<{ riskLevel: string; requiresApproval: boolean; explanation: string }>(
      "gpt-4o",
      request.prompt,
      `You are a risk review agent for a luxury mobility brokerage system.
Assess the risk of the following content.
Return JSON with:
- "riskLevel": one of "low", "medium", "high", "critical"
- "requiresApproval": true if human approval is required before any action
- "explanation": one sentence explaining the assessment`
    );
    const riskLevel: RiskLevel = VALID_RISK_LEVELS.includes(result.riskLevel as RiskLevel)
      ? (result.riskLevel as RiskLevel)
      : "medium";
    return {
      provider: "openai",
      text: result.explanation ?? "Risk assessment complete.",
      riskLevel,
      requiresApproval: result.requiresApproval ?? (riskLevel === "high" || riskLevel === "critical"),
      confidence: 0.9,
      mocked: false
    };
  }
};
