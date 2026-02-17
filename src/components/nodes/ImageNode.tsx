"use client";

import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { ImageIcon, Trash2, Link, Maximize2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";

type ImageNodeData = {
  label?: string;
  imageUrl?: string;
  alt?: string;
};

export function ImageNode({ id, data, selected }: NodeProps) {
  const nodeData = data as ImageNodeData;
  const [urlInput, setUrlInput] = useState(nodeData.imageUrl || "");
  const [isEditingUrl, setIsEditingUrl] = useState(!nodeData.imageUrl);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setIsEditingUrl(false);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, imageUrl: trimmed } }
          : n
      )
    );
  }, [id, urlInput, setNodes]);

  const handleUrlKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleUrlSubmit();
      }
      if (e.key === "Escape") {
        setIsEditingUrl(false);
        setUrlInput(nodeData.imageUrl || "");
      }
    },
    [handleUrlSubmit, nodeData.imageUrl]
  );

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [id, setNodes]);

  return (
    <>
      <div
        className={`w-[300px] rounded-xl border bg-slate-800 shadow-lg transition-all ${
          selected
            ? "border-emerald-500 shadow-emerald-500/20"
            : "border-slate-600 hover:border-slate-500"
        }`}
      >
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3 !w-3 !border-2 !border-slate-800 !bg-emerald-500"
        />

        <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-emerald-400" />
            <span className="truncate text-xs font-medium text-slate-400">
              {nodeData.label || "Kép"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {nodeData.imageUrl && (
              <>
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingUrl(true)}
                  className="rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                >
                  <Link className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {selected && (
              <button
                onClick={handleDelete}
                className="rounded p-0.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {isEditingUrl || !nodeData.imageUrl ? (
          <div className="p-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlSubmit}
              onKeyDown={handleUrlKeyDown}
              placeholder="Kép URL beillesztése..."
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-emerald-500"
              autoFocus
            />
            <p className="mt-2 text-[10px] text-slate-500">
              Enter a mentéshez, Escape a mégse
            </p>
          </div>
        ) : (
          <div className="p-2">
            <div
              className="cursor-pointer overflow-hidden rounded-lg"
              onClick={() => setLightboxOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={nodeData.imageUrl}
                alt={nodeData.alt || "Kép"}
                className="h-auto max-h-[200px] w-full rounded-lg object-cover transition-transform hover:scale-[1.02]"
              />
            </div>
          </div>
        )}

        <Handle
          type="source"
          position={Position.Right}
          className="!h-3 !w-3 !border-2 !border-slate-800 !bg-emerald-500"
        />
      </div>

      {nodeData.imageUrl && (
        <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)}>
          <div className="p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={nodeData.imageUrl}
              alt={nodeData.alt || "Kép"}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain"
            />
          </div>
        </Dialog>
      )}
    </>
  );
}
