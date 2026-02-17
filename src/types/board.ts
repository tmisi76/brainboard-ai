export type NodeType = "YOUTUBE" | "TEXT" | "PDF" | "IMAGE" | "AUDIO" | "LINK";

export interface BoardNode {
  id: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  content: Record<string, unknown>;
  sourceConnections?: BoardConnection[];
  targetConnections?: BoardConnection[];
}

export interface BoardConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string | null;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  nodes: BoardNode[];
  createdAt: string;
  updatedAt: string;
}

export interface BoardListItem {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  _count: { nodes: number };
}
