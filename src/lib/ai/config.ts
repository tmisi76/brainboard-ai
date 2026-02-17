import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export type AIModelId = keyof typeof AI_MODELS;

export const AI_MODELS = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai" as const,
    model: openai("gpt-4o"),
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai" as const,
    model: openai("gpt-4o-mini"),
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet-latest",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic" as const,
    model: anthropic("claude-3-5-sonnet-latest"),
  },
} as const;

export const DEFAULT_MODEL: AIModelId = "gpt-4o-mini";

export const SYSTEM_PROMPT = `Te egy segítőkész AI asszisztens vagy a BrainBoard AI alkalmazásban.
Magyarul válaszolsz, és segítesz a felhasználóknak gondolataik rendszerezésében,
jegyzeteik feldolgozásában és kreatív ötletek kidolgozásában.
Legyél barátságos, tömör és informatív.`;
