"use client";

import { useState, useCallback } from "react";
import { Handle, Position, useReactFlow, type NodeProps } from "@xyflow/react";
import { Youtube, Trash2, Link } from "lucide-react";

type YouTubeNodeData = {
  label?: string;
  videoUrl?: string;
  videoTitle?: string;
};

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\s?#]+)/
  );
  return match ? match[1] : null;
}

export function YouTubeNode({ id, data, selected }: NodeProps) {
  const nodeData = data as YouTubeNodeData;
  const [urlInput, setUrlInput] = useState(nodeData.videoUrl || "");
  const [isEditingUrl, setIsEditingUrl] = useState(!nodeData.videoUrl);
  const { setNodes } = useReactFlow();

  const videoId = nodeData.videoUrl
    ? extractVideoId(nodeData.videoUrl)
    : null;

  const handleUrlSubmit = useCallback(() => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setIsEditingUrl(false);
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, videoUrl: trimmed } }
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
        setUrlInput(nodeData.videoUrl || "");
      }
    },
    [handleUrlSubmit, nodeData.videoUrl]
  );

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [id, setNodes]);

  return (
    <div
      className={`w-[340px] rounded-xl border bg-slate-800 shadow-lg transition-all ${
        selected
          ? "border-red-500 shadow-red-500/20"
          : "border-slate-600 hover:border-slate-500"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-slate-800 !bg-red-500"
      />

      <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
        <div className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-400" />
          <span className="truncate text-xs font-medium text-slate-400">
            {nodeData.videoTitle || "YouTube Videó"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {videoId && (
            <button
              onClick={() => setIsEditingUrl(true)}
              className="rounded p-0.5 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
            >
              <Link className="h-3.5 w-3.5" />
            </button>
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

      {isEditingUrl || !videoId ? (
        <div className="p-3">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlSubmit}
            onKeyDown={handleUrlKeyDown}
            placeholder="YouTube URL beillesztése..."
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-red-500"
            autoFocus
          />
          <p className="mt-2 text-[10px] text-slate-500">
            Enter a mentéshez, Escape a mégse
          </p>
        </div>
      ) : (
        <div className="p-2">
          <div className="overflow-hidden rounded-lg">
            <iframe
              width="100%"
              height="190"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={nodeData.videoTitle || "YouTube videó"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
          </div>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-slate-800 !bg-red-500"
      />
    </div>
  );
}
