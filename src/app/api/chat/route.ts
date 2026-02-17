import { streamText } from "ai";
import {
  AI_MODELS,
  DEFAULT_MODEL,
  SYSTEM_PROMPT,
  type AIModelId,
} from "@/lib/ai/config";
import { calculateCredits, deductCredits } from "@/lib/credits";

export async function POST(req: Request) {
  try {
    const { messages, model: modelId, userId, nodeContext } = await req.json();

    const selectedModelId = (modelId as AIModelId) || DEFAULT_MODEL;
    const modelConfig = AI_MODELS[selectedModelId];

    if (!modelConfig) {
      return Response.json(
        { error: `Ismeretlen modell: ${selectedModelId}` },
        { status: 400 }
      );
    }

    const systemPrompt = nodeContext
      ? `${SYSTEM_PROMPT}\n\nAktuális kontextus a felhasználó vásznáról:\n${nodeContext}`
      : SYSTEM_PROMPT;

    const result = streamText({
      model: modelConfig.model,
      system: systemPrompt,
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

          if (userId) {
            const deduction = await deductCredits(userId, creditResult.creditsUsed);
            console.log(
              `[Credits] Model: ${selectedModelId}, Tokens: ${creditResult.tokenUsage.totalTokens}, Credits: ${creditResult.creditsUsed}, Remaining: ${deduction.remainingCredits}`
            );
          } else {
            console.log(
              `[Credits] Model: ${selectedModelId}, Tokens: ${creditResult.tokenUsage.totalTokens}, Credits: ${creditResult.creditsUsed} (no user)`
            );
          }
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
