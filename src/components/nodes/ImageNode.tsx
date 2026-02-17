"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ImageIcon } from "lucide-react";

type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  alt?: string;
};

export function ImageNode({ data, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;

  return (
    <div
      className={`w-[280px] rounded-xl border bg-zinc-900 shadow-lg transition-all ${
        selected
          ? "border-emerald-500 shadow-emerald-500/20"
          : "border-zinc-700 hover:border-zinc-600"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-emerald-500"
      />

      <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-2">
        <ImageIcon className="h-4 w-4 text-emerald-400" />
        <span className="truncate text-xs font-medium text-zinc-400">
          {nodeData.label || "Kép"}
        </span>
      </div>

      <div className="p-2">
        {nodeData.imageUrl ? (
          <div className="overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nodeData.imageUrl}
              alt={nodeData.alt || "Kép"}
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>
        ) : (
          <div className="flex h-[160px] items-center justify-center rounded-lg bg-zinc-800">
            <div className="text-center">
              <ImageIcon className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
              <p className="text-xs text-zinc-500">Nincs kép URL megadva</p>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-emerald-500"
      />
    </div>
  );
}
