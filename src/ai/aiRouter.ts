import type { AiProviderName, AiRoutingSettings, AiTaskType } from "../shared/types";
import type { AiProvider, AiRequest } from "./aiProviderTypes";
import { anthropicProvider } from "./anthropicProvider";
import { geminiProvider } from "./geminiProvider";
import { localProvider } from "./localProvider";
import { mockProvider } from "./mockProvider";
import { openaiProvider } from "./openaiProvider";

const providers: Record<AiProviderName, AiProvider> = {
  openai: openaiProvider,
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  perplexity: { ...mockProvider, name: "perplexity", configured: Boolean(process.env.PERPLEXITY_API_KEY) },
  local: localProvider,
  mock: mockProvider
};

const taskProviders: Record<AiTaskType, AiProviderName[]> = {
  conversation_reply: ["openai", "anthropic", "mock"],
  legal_risk_review: ["anthropic", "openai", "mock"],
  document_analysis: ["gemini", "openai", "mock"],
  market_research: ["perplexity", "openai", "mock"],
  lead_scoring: ["local", "openai", "mock"],
  memory_extraction: ["openai", "local", "mock"],
  support_debug: ["openai", "local", "mock"],
  code_fix_prompt: ["openai", "mock"],
  summarization: ["openai", "gemini", "mock"],
  translation: ["openai", "gemini", "mock"],
  classification: ["local", "mock"]
};

function providerFor(taskType: AiTaskType): AiProvider {
  const candidates = taskProviders[taskType] || ["mock"];
  return candidates.map((name) => providers[name]).find((provider) => provider.configured) || mockProvider;
}

export const aiRouter = {
  settings(): AiRoutingSettings {
    return {
      defaultProvider: "openai",
      fallbackProvider: "mock",
      costPriority: "medium",
      qualityPriority: "high",
      taskProviders,
      providers: Object.values(providers).map((provider) => ({
        provider: provider.name,
        enabled: provider.configured,
        configured: provider.configured,
        strengths: Object.entries(taskProviders).filter(([, names]) => names.includes(provider.name)).map(([task]) => task as AiTaskType)
      }))
    };
  },
  async generateText(request: AiRequest) {
    const primary = providerFor(request.taskType);
    try { return await primary.generateText(request); } catch { return mockProvider.generateText(request); }
  },
  async summarize(request: AiRequest) {
    const primary = providerFor(request.taskType);
    try { return await primary.summarize(request); } catch { return mockProvider.summarize(request); }
  },
  async classify(request: AiRequest) {
    const primary = providerFor(request.taskType);
    try { return await primary.classify(request); } catch { return mockProvider.classify(request); }
  },
  async extractStructuredData(request: AiRequest) {
    const primary = providerFor(request.taskType);
    try { return await primary.extractStructuredData(request); } catch { return mockProvider.extractStructuredData(request); }
  },
  async reviewRisk(request: AiRequest) {
    const primary = providerFor(request.taskType);
    try { return await primary.reviewRisk(request); } catch { return mockProvider.reviewRisk(request); }
  }
};
