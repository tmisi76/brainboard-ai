import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const boards = await prisma.board.findMany({
      where: { ownerId: user!.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { nodes: true } } },
    });
    return NextResponse.json(boards);
  } catch (error) {
    console.error("Board list error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a táblák lekérése." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: "Tábla név szükséges." },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: { name, description, ownerId: user!.id },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("Board create error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a tábla létrehozása." },
      { status: 500 }
    );
  }
}
