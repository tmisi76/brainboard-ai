import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_USER_ID = "demo-user";

export async function getOrCreateDemoUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEMO_USER_ID,
        email: "demo@brainboard.ai",
        name: "Demo User",
        credits: 100,
      },
    });
  }

  return user;
}

export async function requireUser() {
  try {
    const user = await getOrCreateDemoUser();
    return { user, error: null };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      user: null,
      error: NextResponse.json(
        { error: "Hitelesítés szükséges." },
        { status: 401 }
      ),
    };
  }
}
