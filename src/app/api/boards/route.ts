import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const boards = await prisma.board.findMany({
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
    const { name, description, ownerId } = await req.json();

    if (!name || !ownerId) {
      return NextResponse.json(
        { error: "Név és tulajdonos szükséges." },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: { name, description, ownerId },
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
