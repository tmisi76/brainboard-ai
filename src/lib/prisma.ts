import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma._prisma) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Set it to your Prisma Accelerate URL (prisma+postgres://accelerate.prisma-data.net/...)"
      );
    }
    globalForPrisma._prisma = new PrismaClient({
      accelerateUrl: url,
    });
  }
  return globalForPrisma._prisma;
}

// Lazy proxy: PrismaClient is only instantiated on first property access (at runtime),
// not at import/module evaluation time (during Next.js build).
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
