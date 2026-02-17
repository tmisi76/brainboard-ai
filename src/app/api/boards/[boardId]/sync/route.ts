import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface SyncNode {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  content: Record<string, unknown>;
}

interface SyncEdge {
  source: string;
  target: string;
  label?: string;
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    const { boardId } = await params;
    const { nodes, edges } = (await req.json()) as {
      nodes: SyncNode[];
      edges: SyncEdge[];
    };

    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json(
        { error: "Tábla nem található." },
        { status: 404 }
      );
    }

    const nodeTypeMap: Record<string, string> = {
      textNode: "TEXT",
      youtubeNode: "YOUTUBE",
      imageNode: "IMAGE",
    };

    await prisma.$transaction(async (tx) => {
      await tx.connection.deleteMany({ where: { source: { boardId } } });
      await tx.node.deleteMany({ where: { boardId } });

      for (const node of nodes) {
        const dbType = nodeTypeMap[node.type] || "TEXT";
        await tx.node.create({
          data: {
            id: node.id,
            boardId,
            type: dbType as "TEXT" | "YOUTUBE" | "IMAGE" | "PDF" | "AUDIO" | "LINK",
            positionX: node.positionX,
            positionY: node.positionY,
            content: node.content as object,
          },
        });
      }

      const nodeIds = new Set(nodes.map((n) => n.id));
      for (const edge of edges) {
        if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
          await tx.connection.create({
            data: {
              sourceId: edge.source,
              targetId: edge.target,
              label: edge.label,
            },
          });
        }
      }
    });

    await prisma.board.update({
      where: { id: boardId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Board sync error:", error);
    return NextResponse.json(
      { error: "Nem sikerült a tábla szinkronizálása." },
      { status: 500 }
    );
  }
}
