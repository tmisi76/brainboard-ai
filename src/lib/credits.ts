import { AI_MODELS, type AIModelId } from "./ai/config";

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CreditCalculation {
  modelId: AIModelId;
  tokenUsage: TokenUsage;
  creditsUsed: number;
}

export function calculateCredits(
  modelId: AIModelId,
  tokenUsage: TokenUsage
): CreditCalculation {
  const modelConfig = AI_MODELS[modelId];
  const creditsUsed = Math.ceil(
    (tokenUsage.totalTokens / 1000) * modelConfig.creditsPer1kTokens
  );

  return {
    modelId,
    tokenUsage,
    creditsUsed,
  };
}

export async function deductCredits(
  userId: string,
  creditsUsed: number
): Promise<{ success: boolean; remainingCredits: number }> {
  const { prisma } = await import("./prisma");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  if (!user || user.credits < creditsUsed) {
    return {
      success: false,
      remainingCredits: user?.credits ?? 0,
    };
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: creditsUsed } },
    select: { credits: true },
  });

  return {
    success: true,
    remainingCredits: updated.credits,
  };
}

export async function saveAIChatUsage(
  nodeId: string,
  messages: unknown[],
  creditsUsed: number
): Promise<void> {
  const { prisma } = await import("./prisma");

  await prisma.aIChat.create({
    data: {
      nodeId,
      messages: JSON.parse(JSON.stringify(messages)),
      creditsUsed,
    },
  });
}
