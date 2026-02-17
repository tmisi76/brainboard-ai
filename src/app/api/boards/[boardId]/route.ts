import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { boardId } = await params;
    const board = await prisma.board.findUnique({
      where: { id: boardId, ownerId: user!.id },
      include: {
        nodes: {
          include: {
            sourceConnections: true,
            targetConnections: true,
          },
        },
      },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Tábla nem található." },
        { status: 404 }
      );
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Board get error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a tábla lekérése." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { boardId } = await params;
    const { name, description } = await req.json();

    const board = await prisma.board.update({
      where: { id: boardId, ownerId: user!.id },
      data: { ...(name && { name }), ...(description !== undefined && { description }) },
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("Board update error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a tábla frissítése." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const { boardId } = await params;
    await prisma.board.delete({
      where: { id: boardId, ownerId: user!.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Board delete error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a tábla törlése." },
      { status: 500 }
    );
  }
}
