import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  _prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (!globalForPrisma._prisma) {
    const url =
      process.env.DATABASE_URL ??
      process.env.DATABASE_DATABASE_URL ??
      process.env.POSTGRES_PRISMA_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL environment variable is not set. " +
          "Create a Vercel Postgres database and link it to your project."
      );
    }

    // Prisma Accelerate URL (prisma+postgres://) → use accelerateUrl
    // Direct postgres URL (postgres://) → use Neon adapter
    if (url.startsWith("prisma+postgres://") || url.startsWith("prisma://")) {
      globalForPrisma._prisma = new PrismaClient({ accelerateUrl: url });
    } else {
      const adapter = new PrismaNeon({ connectionString: url });
      globalForPrisma._prisma = new PrismaClient({ adapter });
    }
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
