import type { AiProvider } from "./aiProviderTypes";
import { mockProvider } from "./mockProvider";

export const openaiProvider: AiProvider = {
  ...mockProvider,
  name: "openai",
  configured: Boolean(process.env.OPENAI_API_KEY)
};
