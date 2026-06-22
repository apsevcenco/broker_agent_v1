import type { AiProvider } from "./aiProviderTypes";
import { mockProvider } from "./mockProvider";

export const geminiProvider: AiProvider = {
  ...mockProvider,
  name: "gemini",
  configured: Boolean(process.env.GEMINI_API_KEY)
};
