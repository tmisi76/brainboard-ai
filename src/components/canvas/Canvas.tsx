"use client";

import { useCallback, useState, useRef, type DragEvent } from "react";
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
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TextNode } from "@/components/nodes/TextNode";
import { YouTubeNode } from "@/components/nodes/YouTubeNode";
import { ImageNode } from "@/components/nodes/ImageNode";
import { ContextMenu } from "./ContextMenu";

const nodeTypes = {
  textNode: TextNode,
  youtubeNode: YouTubeNode,
  imageNode: ImageNode,
};

const defaultNodes: Node[] = [
  {
    id: "welcome-1",
    type: "textNode",
    position: { x: 100, y: 150 },
    data: {
      label: "Üdvözlünk!",
      text: "Ez a BrainBoard AI vászon.\n\n- Jobb klikk: új node hozzáadása\n- Sidebar-ból húzz elemeket\n- Node-ok összekötése: húzd a csatlakozókat\n- Dupla katt: szerkesztés",
    },
  },
  {
    id: "welcome-2",
    type: "youtubeNode",
    position: { x: 500, y: 100 },
    data: { label: "Bemutató", videoUrl: "", videoTitle: "" },
  },
  {
    id: "welcome-3",
    type: "imageNode",
    position: { x: 500, y: 350 },
    data: { label: "Inspiráció", imageUrl: "", alt: "" },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "e-welcome-1-2",
    source: "welcome-1",
    target: "welcome-2",
    animated: true,
    style: { stroke: "#6d28d9", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6d28d9" },
  },
  {
    id: "e-welcome-1-3",
    source: "welcome-1",
    target: "welcome-3",
    animated: true,
    style: { stroke: "#6d28d9", strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: "#6d28d9" },
  },
];

const defaultDataForType: Record<string, Record<string, string>> = {
  textNode: { label: "Új jegyzet", text: "" },
  youtubeNode: { label: "YouTube videó", videoUrl: "", videoTitle: "" },
  imageNode: { label: "Kép", imageUrl: "", alt: "" },
};

export function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    flowPosition: { x: number; y: number };
  } | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: "#6d28d9", strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#6d28d9" },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onEdgeDoubleClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    [setEdges]
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
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
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
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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
          style: { stroke: "#6d28d9", strokeWidth: 2 },
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
