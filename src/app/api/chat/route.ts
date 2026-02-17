import { streamText } from "ai";
import {
  AI_MODELS,
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
  type AIModelId,
} from "@/lib/ai/config";
import { calculateCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const { messages, model: modelId } = await req.json();

    const selectedModelId = (modelId as AIModelId) || DEFAULT_MODEL;
    const modelConfig = AI_MODELS[selectedModelId];

    if (!modelConfig) {
      return Response.json(
        { error: `Ismeretlen modell: ${selectedModelId}` },
        { status: 400 }
      );
    }

    const result = streamText({
      model: modelConfig.model,
      system: SYSTEM_PROMPT,
      messages,
      onFinish: async ({ usage }) => {
        if (usage) {
          const inputTokens = usage.inputTokens ?? 0;
          const outputTokens = usage.outputTokens ?? 0;
          const creditResult = calculateCredits(selectedModelId, {
            promptTokens: inputTokens,
            completionTokens: outputTokens,
            totalTokens: inputTokens + outputTokens,
          });
          console.log(
            `[Credits] Model: ${selectedModelId}, Tokens: ${creditResult.tokenUsage.totalTokens}, Credits: ${creditResult.creditsUsed}`
          );
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API hiba:", error);

    if (error instanceof Error && error.message.includes("API key")) {
      return Response.json(
        {
          error:
            "Hiányzó vagy érvénytelen API kulcs. Ellenőrizd a .env.local fájlt.",
        },
        { status: 401 }
      );
    }

    return Response.json(
      { error: "Szerverhiba történt. Próbáld újra később." },
      { status: 500 }
    );
  }
}
