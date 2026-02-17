"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Youtube } from "lucide-react";

type YouTubeNodeData = {
  label?: string;
  videoUrl?: string;
  videoTitle?: string;
};

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YouTubeNode({ data, selected }: NodeProps) {
  const nodeData = data as YouTubeNodeData;
  const videoId = nodeData.videoUrl
    ? extractVideoId(nodeData.videoUrl)
    : null;

  return (
    <div
      className={`w-[320px] rounded-xl border bg-zinc-900 shadow-lg transition-all ${
        selected
          ? "border-red-500 shadow-red-500/20"
          : "border-zinc-700 hover:border-zinc-600"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-red-500"
      />

      <div className="flex items-center gap-2 border-b border-zinc-700 px-3 py-2">
        <Youtube className="h-4 w-4 text-red-400" />
        <span className="truncate text-xs font-medium text-zinc-400">
          {nodeData.label || nodeData.videoTitle || "YouTube Videó"}
        </span>
      </div>

      <div className="p-2">
        {videoId ? (
          <div className="overflow-hidden rounded-lg">
            <iframe
              width="100%"
              height="180"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={nodeData.videoTitle || "YouTube videó"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="border-0"
            />
          </div>
        ) : (
          <div className="flex h-[180px] items-center justify-center rounded-lg bg-zinc-800">
            <div className="text-center">
              <Youtube className="mx-auto mb-2 h-8 w-8 text-zinc-600" />
              <p className="text-xs text-zinc-500">
                Nincs videó URL megadva
              </p>
            </div>
          </div>
        )}
      </div>

      {nodeData.videoTitle && (
        <div className="border-t border-zinc-700 px-3 py-2">
          <p className="truncate text-xs text-zinc-400">
            {nodeData.videoTitle}
          </p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-zinc-900 !bg-red-500"
      />
    </div>
  );
}
