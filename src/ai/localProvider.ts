import type { AiProvider } from "./aiProviderTypes";
import { mockProvider } from "./mockProvider";

export const localProvider: AiProvider = {
  ...mockProvider,
  name: "local",
  configured: true,
  async classify(request) {
    const text = request.prompt.toLowerCase();
    const classification = text.includes("charter") ? "charter" : text.includes("car") || text.includes("vehicle") ? "car_rental" : text.includes("yacht") ? "yacht_brokerage" : "general";
    return { provider: "local", data: { classification }, confidence: 0.65, mocked: true };
  }
};
