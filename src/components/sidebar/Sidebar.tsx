"use client";

import { useState } from "react";
import {
  Brain,
  Plus,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  FileText,
  Youtube,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BoardItem {
  id: string;
  name: string;
}

const demoBoards: BoardItem[] = [
  { id: "1", name: "Kutatási projekt" },
  { id: "2", name: "Marketing terv" },
  { id: "3", name: "Tanulási jegyzet" },
];

const nodeToolbox = [
  { type: "textNode", label: "Szöveg", icon: FileText, color: "text-violet-400" },
  { type: "youtubeNode", label: "YouTube", icon: Youtube, color: "text-red-400" },
  { type: "imageNode", label: "Kép", icon: ImageIcon, color: "text-emerald-400" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [boards] = useState<BoardItem[]>(demoBoards);

  const handleDragStart = (
    event: React.DragEvent,
    nodeType: string
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 p-4">
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-all",
            collapsed && "w-0"
          )}
        >
          <Brain className="h-6 w-6 shrink-0 text-violet-500" />
          <span className="whitespace-nowrap text-lg font-bold text-zinc-100">
            BrainBoard
          </span>
        </div>
        {collapsed && (
          <Brain className="mx-auto h-6 w-6 text-violet-500" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Boards section */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Táblák
              </h3>
              <button className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <ul className="space-y-1">
              {boards.map((board) => (
                <li key={board.id}>
                  <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200">
                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                    <span className="truncate">{board.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Node toolbox */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Elemek
            </h3>
            <div className="space-y-1">
              {nodeToolbox.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className="flex cursor-grab items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-200 active:cursor-grabbing"
                >
                  <item.icon className={cn("h-4 w-4 shrink-0", item.color)} />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed icons */}
      {collapsed && (
        <div className="flex flex-col items-center gap-2 p-2">
          {nodeToolbox.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => handleDragStart(e, item.type)}
              className="cursor-grab rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 active:cursor-grabbing"
              title={item.label}
            >
              <item.icon className={cn("h-5 w-5", item.color)} />
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
