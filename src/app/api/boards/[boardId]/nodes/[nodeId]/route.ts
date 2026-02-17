import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ boardId: string; nodeId: string }> }
) {
  try {
    const { nodeId } = await params;
    const data = await req.json();

    const node = await prisma.node.update({
      where: { id: nodeId },
      data,
    });

    return NextResponse.json(node);
  } catch (error) {
    console.error("Node update error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a node frissítése." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ boardId: string; nodeId: string }> }
) {
  try {
    const { nodeId } = await params;
    await prisma.node.delete({ where: { id: nodeId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Node delete error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a node törlése." },
      { status: 500 }
    );
  }
}
