import { createGateway } from "@ai-sdk/gateway";

export const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_URL,
  headers: {
    Authorization: `Bearer ${process.env.AI_GATEWAY_TOKEN}`,
  },
});

export type AIModelId = keyof typeof AI_MODELS;

export const AI_MODELS = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai" as const,
    creditsPer1kTokens: 1,
    model: gateway("openai/gpt-4o"),
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai" as const,
    creditsPer1kTokens: 0.25,
    model: gateway("openai/gpt-4o-mini"),
  },
  "claude-3-5-sonnet": {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic" as const,
    creditsPer1kTokens: 1.2,
    model: gateway("anthropic/claude-3-5-sonnet-latest"),
  },
  "claude-3-haiku": {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "anthropic" as const,
    creditsPer1kTokens: 0.1,
    model: gateway("anthropic/claude-3-haiku-20240307"),
  },
} as const;

export const DEFAULT_MODEL: AIModelId = "gpt-4o-mini";

export const SYSTEM_PROMPT = `Te egy segítőkész AI asszisztens vagy a BrainBoard AI alkalmazásban.
Magyarul válaszolsz, és segítesz a felhasználóknak gondolataik rendszerezésében,
jegyzeteik feldolgozásában és kreatív ötletek kidolgozásában.
Legyél barátságos, tömör és informatív.`;
