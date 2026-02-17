export type NodeType = "YOUTUBE" | "TEXT" | "PDF" | "IMAGE" | "AUDIO" | "LINK";

export interface BoardNode {
  id: string;
  type: NodeType;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  content: Record<string, unknown>;
}

export interface Board {
  id: string;
  name: string;
  description: string | null;
  nodes: BoardNode[];
}
