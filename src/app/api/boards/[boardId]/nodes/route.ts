import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { type, positionX, positionY, width, height, content } =
      await req.json();

    if (!type) {
      return NextResponse.json(
        { error: "Node típus szükséges." },
        { status: 400 }
      );
    }

    const node = await prisma.node.create({
      data: {
        boardId,
        type,
        positionX: positionX ?? 0,
        positionY: positionY ?? 0,
        width: width ?? 250,
        height: height ?? 150,
        content: content ?? {},
      },
    });

    return NextResponse.json(node, { status: 201 });
  } catch (error) {
    console.error("Node create error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a node létrehozása." },
      { status: 500 }
    );
  }
}
