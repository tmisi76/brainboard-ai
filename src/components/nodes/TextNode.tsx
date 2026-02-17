"use client";

import { useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileText } from "lucide-react";

type TextNodeData = {
  label?: string;
  text?: string;
};

export function TextNode({ data, selected }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(nodeData.text || "");

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <div
      className={`min-w-[200px] rounded-xl border bg-zinc-900 shadow-lg transition-all ${
        selected
          ? "border-violet-500 shadow-violet-500/20"
          : "border-zinc-700 hover:border-zinc-600"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-violet-500"
      />

      <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-2">
        <FileText className="h-4 w-4 text-violet-400" />
        <span className="text-xs font-medium text-zinc-400">
          {nodeData.label || "Jegyzet"}
        </span>
      </div>

      <div className="p-3" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <textarea
            className="w-full resize-none bg-transparent text-sm text-zinc-200 outline-none placeholder:text-zinc-600"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            rows={4}
            placeholder="Ide kattints a szerkesztéshez..."
          />
        ) : (
          <p className="min-h-[60px] text-sm text-zinc-300">
            {text || (
              <span className="text-zinc-600">
                Dupla kattintás a szerkesztéshez...
              </span>
            )}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-violet-500"
      />
    </div>
  );
}
