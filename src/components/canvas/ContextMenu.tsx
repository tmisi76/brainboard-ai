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
    description: "Szerkeszthető szöveges node",
    icon: FileText,
    color: "text-violet-400",
    hoverBg: "hover:bg-violet-500/10",
  },
  {
    type: "youtubeNode",
    label: "YouTube videó",
    description: "Videó embed lejátszóval",
    icon: Youtube,
    color: "text-red-400",
    hoverBg: "hover:bg-red-500/10",
  },
  {
    type: "imageNode",
    label: "Kép",
    description: "Kép megjelenítés URL-ből",
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
      className="fixed z-50 min-w-[220px] rounded-xl border border-slate-700 bg-slate-800 p-1 shadow-2xl"
      style={{ left: x, top: y }}
    >
      <div className="border-b border-slate-700 px-3 py-2">
        <p className="text-xs font-semibold text-slate-400">Node hozzáadása</p>
      </div>
      <div className="py-1">
        {nodeOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => handleAdd(option.type)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${option.hoverBg}`}
          >
            <option.icon className={`h-4 w-4 shrink-0 ${option.color}`} />
            <div>
              <p className="text-sm text-slate-300">{option.label}</p>
              <p className="text-[10px] text-slate-500">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
