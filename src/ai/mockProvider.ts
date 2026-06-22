import type { AiProvider } from "./aiProviderTypes";

export const mockProvider: AiProvider = {
  name: "mock",
  configured: true,
  async generateText(request) {
    return { provider: "mock", text: `[mock:${request.taskType}] ${request.prompt.slice(0, 220)}`, confidence: 0.55, mocked: true };
  },
  async summarize(request) {
    return { provider: "mock", text: request.prompt.slice(0, 180), confidence: 0.5, mocked: true };
  },
  async classify(request) {
    const lower = request.prompt.toLowerCase();
    const classification = lower.includes("legal") ? "legal_risk" : lower.includes("lead") ? "lead" : "general";
    return { provider: "mock", data: { classification }, confidence: 0.5, mocked: true };
  },
  async extractStructuredData(request) {
    return { provider: "mock", data: { taskType: request.taskType, extracted: false } as never, confidence: 0.4, mocked: true };
  },
  async reviewRisk(request) {
    const risky = /legal|contract|commission|owner|confidential|offer/i.test(request.prompt);
    return { provider: "mock", text: risky ? "Potential high-risk content requires approval." : "No obvious high-risk content detected.", riskLevel: risky ? "high" : "low", requiresApproval: risky, confidence: 0.55, mocked: true };
  }
};
