"use client";

import { useCallback, useState, useRef, useEffect, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type Node,
  type Edge,
  BackgroundVariant,
  type ReactFlowInstance,
  type EdgeMouseHandler,
  type NodeChange,
  type EdgeChange,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TextNode } from "@/components/nodes/TextNode";
import { YouTubeNode } from "@/components/nodes/YouTubeNode";
import { ImageNode } from "@/components/nodes/ImageNode";
import { ChatNode } from "@/components/nodes/ChatNode";
import { ContextMenu } from "./ContextMenu";
import { useBoardSync } from "@/hooks/useBoardSync";
import type { Board } from "@/types/board";

const nodeTypes = {
  textNode: TextNode,
  youtubeNode: YouTubeNode,
  imageNode: ImageNode,
  chatNode: ChatNode,
};

const welcomeNodes: Node[] = [
  {
    id: "welcome-1",
    type: "textNode",
    position: { x: 100, y: 150 },
    data: {
      label: "Kezdjük!",
      text: "Üdvözlünk a BrainBoard AI-ban!\n\n1. Válassz vagy hozz létre egy board-ot fent\n2. Húzz elemeket a bal oldali eszköztárból\n3. Jobb klikk: új node hozzáadása\n4. Kösd össze a Chat node-ot más elemekkel\n5. Az AI az összekötött tartalmakkal dolgozik",
    },
  },
];

const welcomeEdges: Edge[] = [];

const defaultDataForType: Record<string, Record<string, string>> = {
  textNode: { label: "Új jegyzet", text: "" },
  youtubeNode: { label: "YouTube videó", videoUrl: "", videoTitle: "" },
  imageNode: { label: "Kép", imageUrl: "", alt: "" },
  chatNode: { label: "AI Chat" },
};

const dbTypeToFlowType: Record<string, string> = {
  TEXT: "textNode",
  YOUTUBE: "youtubeNode",
  IMAGE: "imageNode",
  PDF: "textNode",
  AUDIO: "textNode",
  LINK: "textNode",
};

function boardToFlow(board: Board): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = board.nodes.map((n) => ({
    id: n.id,
    type: dbTypeToFlowType[n.type] || "textNode",
    position: { x: n.positionX, y: n.positionY },
    data: n.content as Record<string, unknown>,
  }));

  const edgeSet = new Set<string>();
  const edges: Edge[] = [];

  for (const node of board.nodes) {
    for (const conn of node.sourceConnections ?? []) {
      const key = `${conn.sourceId}-${conn.targetId}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({
          id: conn.id,
          source: conn.sourceId,
          target: conn.targetId,
          label: conn.label ?? undefined,
          animated: true,
          style: { stroke: "#6d28d9", strokeWidth: 2, strokeDasharray: "8 4" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6d28d9" },
        });
      }
    }
  }

  return { nodes, edges };
}

interface CanvasProps {
  board: Board | null;
}

export function Canvas({ board }: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(welcomeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(welcomeEdges);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    flowPosition: { x: number; y: number };
  } | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const { scheduleSave } = useBoardSync(board?.id ?? null);
  const loadedBoardRef = useRef<string | null>(null);

  useEffect(() => {
    if (board && board.id !== loadedBoardRef.current) {
      loadedBoardRef.current = board.id;
      const { nodes: boardNodes, edges: boardEdges } = boardToFlow(board);
      setNodes(boardNodes.length > 0 ? boardNodes : welcomeNodes);
      setEdges(boardEdges);
      setTimeout(() => reactFlowInstance.current?.fitView(), 100);
    } else if (!board && loadedBoardRef.current) {
      loadedBoardRef.current = null;
      setNodes(welcomeNodes);
      setEdges(welcomeEdges);
    }
  }, [board, setNodes, setEdges]);

  const triggerSave = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (board) scheduleSave(updatedNodes, updatedEdges);
    },
    [board, scheduleSave]
  );

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      if (board) {
        setTimeout(() => {
          setNodes((n) => {
            setEdges((e) => {
              triggerSave(n, e);
              return e;
            });
            return n;
          });
        }, 0);
      }
    },
    [onNodesChange, board, triggerSave, setNodes, setEdges]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (board) {
        setTimeout(() => {
          setNodes((n) => {
            setEdges((e) => {
              triggerSave(n, e);
              return e;
            });
            return n;
          });
        }, 0);
      }
    },
    [onEdgesChange, board, triggerSave, setNodes, setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) => {
        const newEdges = addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#6d28d9", strokeWidth: 2, strokeDasharray: "8 4" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6d28d9" },
          },
          eds
        );
        if (board) {
          setNodes((n) => {
            triggerSave(n, newEdges);
            return n;
          });
        }
        return newEdges;
      });
    },
    [setEdges, setNodes, board, triggerSave]
  );

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      setEdges((eds) => {
        const newEdges = eds.filter((e) => e.id !== edge.id);
        if (board) {
          setNodes((n) => {
            triggerSave(n, newEdges);
            return n;
          });
        }
        return newEdges;
      });
    },
    [setEdges, setNodes, board, triggerSave]
  );

  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      if (!reactFlowInstance.current) return;

      const flowPosition = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setContextMenu({
        x: event.clientX,
        y: event.clientY,
        flowPosition,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onAddNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const id = `${type}-${Date.now()}`;
      const newNode: Node = {
        id,
        type,
        position,
        data: { ...(defaultDataForType[type] || {}) },
      };
      setNodes((nds) => {
        const updated = [...nds, newNode];
        if (board) {
          setEdges((e) => {
            triggerSave(updated, e);
            return e;
          });
        }
        return updated;
      });
    },
    [setNodes, setEdges, board, triggerSave]
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      onAddNode(type, position);
    },
    [onAddNode]
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={onEdgeDoubleClick}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onContextMenu={onContextMenu}
        onPaneClick={onPaneClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode={["Delete", "Backspace"]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: "#6d28d9", strokeWidth: 2, strokeDasharray: "8 4" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#6d28d9" },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-slate-900"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />
        <Controls
          className="!rounded-xl !border !border-slate-700 !bg-slate-800 [&>button]:!border-slate-700 [&>button]:!bg-slate-800 [&>button]:!text-slate-400 [&>button:hover]:!bg-slate-700"
        />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case "textNode":
                return "#7c3aed";
              case "youtubeNode":
                return "#ef4444";
              case "imageNode":
                return "#10b981";
              case "chatNode":
                return "#8b5cf6";
              default:
                return "#6d28d9";
            }
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!rounded-xl !border !border-slate-700 !bg-slate-800"
        />
      </ReactFlow>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          flowPosition={contextMenu.flowPosition}
          onClose={() => setContextMenu(null)}
          onAddNode={onAddNode}
        />
      )}
    </div>
  );
}
