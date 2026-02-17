import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DATABASE_DATABASE_URL: !!process.env.DATABASE_DATABASE_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
    },
  });
}
