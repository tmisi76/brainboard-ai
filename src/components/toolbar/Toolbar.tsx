"use client";

import {
  Mic,
  Scissors,
  Link2,
  Video,
  Type,
  ImageIcon,
  Settings,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tools = [
  { id: "textNode", icon: Type, label: "Szöveg", draggable: true },
  { id: "youtubeNode", icon: Video, label: "YouTube", draggable: true },
  { id: "imageNode", icon: ImageIcon, label: "Kép", draggable: true },
  { id: "chatNode", icon: MessageSquare, label: "Chat", draggable: true },
  { id: "divider", icon: null, label: "", draggable: false },
  { id: "mic", icon: Mic, label: "Hangfelvétel", draggable: false },
  { id: "clip", icon: Scissors, label: "Kivágás", draggable: false },
  { id: "link", icon: Link2, label: "Hivatkozás", draggable: false },
];

interface ToolbarProps {
  className?: string;
}

export function Toolbar({ className }: ToolbarProps) {
  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={cn(
        "flex w-12 flex-col items-center gap-1 border-r border-slate-800 bg-slate-950 py-3",
        className
      )}
    >
      {tools.map((tool) => {
        if (tool.id === "divider") {
          return (
            <div key="divider" className="my-1 h-px w-6 bg-slate-700" />
          );
        }

        const Icon = tool.icon!;

        if (tool.draggable) {
          return (
            <div
              key={tool.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tool.id)}
              className="flex h-9 w-9 cursor-grab items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white active:cursor-grabbing"
              title={tool.label}
            >
              <Icon className="h-[18px] w-[18px]" />
            </div>
          );
        }

        return (
          <button
            key={tool.id}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
            title={tool.label}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        );
      })}

      <div className="mt-auto">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
          title="Beállítások"
        >
          <Settings className="h-[18px] w-[18px]" />
        </button>
      </div>
    </aside>
  );
}
