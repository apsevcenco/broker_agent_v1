import type { AiProvider } from "./aiProviderTypes";
import { mockProvider } from "./mockProvider";

export const anthropicProvider: AiProvider = {
  ...mockProvider,
  name: "anthropic",
  configured: Boolean(process.env.ANTHROPIC_API_KEY)
};
