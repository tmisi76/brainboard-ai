"use client";

import { useCallback, useState, useRef } from "react";
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
    id: "welcome",
    type: "textNode",
    position: { x: 250, y: 200 },
    data: {
      label: "Üdvözlő jegyzet",
      text: "Üdvözöl a BrainBoard AI! Jobb klikkel adhatsz hozzá új node-okat a vászonhoz.",
    },
  },
];

const defaultEdges: Edge[] = [];

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
            style: { stroke: "#6d28d9", strokeWidth: 2 },
            animated: true,
          },
          eds
        )
      );
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
      const defaultData: Record<string, Record<string, string>> = {
        textNode: { label: "Új jegyzet", text: "" },
        youtubeNode: { label: "YouTube videó", videoUrl: "", videoTitle: "" },
        imageNode: { label: "Kép", imageUrl: "", alt: "" },
      };

      const newNode: Node = {
        id,
        type,
        position,
        data: defaultData[type] || {},
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        onContextMenu={onContextMenu}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={4}
        defaultEdgeOptions={{
          style: { stroke: "#6d28d9", strokeWidth: 2 },
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-zinc-950"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#27272a"
        />
        <Controls
          className="!rounded-xl !border !border-zinc-700 !bg-zinc-900 [&>button]:!border-zinc-700 [&>button]:!bg-zinc-900 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800"
        />
        <MiniMap
          nodeColor="#6d28d9"
          maskColor="rgba(0, 0, 0, 0.7)"
          className="!rounded-xl !border !border-zinc-700 !bg-zinc-900"
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
