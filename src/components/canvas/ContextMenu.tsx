"use client";

import { useCallback } from "react";
import { FileText, Youtube, ImageIcon } from "lucide-react";

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  flowPosition: { x: number; y: number };
}

const nodeOptions = [
  {
    type: "textNode",
    label: "Szöveges jegyzet",
    icon: FileText,
    color: "text-violet-400",
    hoverBg: "hover:bg-violet-500/10",
  },
  {
    type: "youtubeNode",
    label: "YouTube videó",
    icon: Youtube,
    color: "text-red-400",
    hoverBg: "hover:bg-red-500/10",
  },
  {
    type: "imageNode",
    label: "Kép",
    icon: ImageIcon,
    color: "text-emerald-400",
    hoverBg: "hover:bg-emerald-500/10",
  },
];

export function ContextMenu({
  x,
  y,
  onClose,
  onAddNode,
  flowPosition,
}: ContextMenuProps) {
  const handleAdd = useCallback(
    (type: string) => {
      onAddNode(type, flowPosition);
      onClose();
    },
    [onAddNode, onClose, flowPosition]
  );

  return (
    <div
      className="fixed z-50 min-w-[200px] rounded-xl border border-zinc-700 bg-zinc-900 p-1 shadow-2xl"
      style={{ left: x, top: y }}
    >
      <div className="border-b border-zinc-700 px-3 py-2">
        <p className="text-xs font-semibold text-zinc-400">Node hozzáadása</p>
      </div>
      <div className="py-1">
        {nodeOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleAdd(option.type)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-zinc-300 transition-colors ${option.hoverBg}`}
          >
            <option.icon className={`h-4 w-4 ${option.color}`} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
