"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { FileText, Trash2 } from "lucide-react";

type TextNodeData = {
  label?: string;
  text?: string;
};

export function TextNode({ id, data, selected }: NodeProps) {
  const nodeData = data as TextNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(nodeData.text || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { setNodes } = useReactFlow();

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const saveText = useCallback(() => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, text } } : n
      )
    );
  }, [id, text, setNodes]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") saveText();
    },
    [saveText]
  );

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [id, setNodes]);

  return (
    <div
      className={`min-w-[220px] max-w-[400px] rounded-xl border bg-slate-800 shadow-lg transition-all ${
        selected
          ? "border-violet-500 shadow-violet-500/20"
          : "border-slate-600 hover:border-slate-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-slate-800 !bg-violet-500"
      />

      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-violet-400" />
          <span className="text-xs font-medium text-slate-400">
            {nodeData.label || "Jegyzet"}
          </span>
        </div>
        {selected && (
          <button
            onClick={handleDelete}
            className="rounded p-0.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="p-3" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            className="w-full resize-none bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={saveText}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder="Ide írj..."
          />
        ) : (
          <p className="min-h-[60px] whitespace-pre-wrap text-sm text-slate-300">
            {text || (
              <span className="text-slate-600">
                Dupla kattintás a szerkesztéshez...
              </span>
            )}
          </p>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-slate-800 !bg-violet-500"
      />
    </div>
  );
}
