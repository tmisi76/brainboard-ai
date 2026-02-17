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
  Trash2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardListItem } from "@/types/board";

const nodeToolbox = [
  { type: "textNode", label: "Szöveg", icon: FileText, color: "text-violet-400" },
  { type: "youtubeNode", label: "YouTube", icon: Youtube, color: "text-red-400" },
  { type: "imageNode", label: "Kép", icon: ImageIcon, color: "text-emerald-400" },
];

interface SidebarProps {
  boards: BoardListItem[];
  activeBoardId: string | null;
  loading: boolean;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export function Sidebar({
  boards,
  activeBoardId,
  loading,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const handleDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleCreateSubmit = () => {
    const trimmed = newBoardName.trim();
    if (!trimmed) return;
    onCreateBoard(trimmed);
    setNewBoardName("");
    setIsCreating(false);
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div
          className={cn(
            "flex items-center gap-2 overflow-hidden transition-all",
            collapsed && "w-0"
          )}
        >
          <Brain className="h-6 w-6 shrink-0 text-violet-500" />
          <span className="whitespace-nowrap text-lg font-bold text-slate-100">
            BrainBoard
          </span>
        </div>
        {collapsed && (
          <Brain className="mx-auto h-6 w-6 text-violet-500" />
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {/* Boards section */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Táblák
              </h3>
              <button
                onClick={() => setIsCreating(true)}
                className="rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {isCreating && (
              <div className="mb-2">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateSubmit();
                    if (e.key === "Escape") {
                      setIsCreating(false);
                      setNewBoardName("");
                    }
                  }}
                  onBlur={() => {
                    if (!newBoardName.trim()) setIsCreating(false);
                  }}
                  placeholder="Tábla neve..."
                  className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-500"
                  autoFocus
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              </div>
            ) : boards.length === 0 ? (
              <p className="py-2 text-center text-xs text-slate-600">
                Nincs tábla. Hozz létre egyet!
              </p>
            ) : (
              <ul className="space-y-0.5">
                {boards.map((board) => (
                  <li key={board.id} className="group">
                    <button
                      onClick={() => onSelectBoard(board.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        activeBoardId === board.id
                          ? "bg-violet-600/20 text-violet-300"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span className="truncate">{board.name}</span>
                      </div>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBoard(board.id);
                        }}
                        className="hidden cursor-pointer rounded p-0.5 text-slate-500 hover:bg-red-500/20 hover:text-red-400 group-hover:block"
                      >
                        <Trash2 className="h-3 w-3" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Node toolbox */}
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Elemek
            </h3>
            <div className="space-y-1">
              {nodeToolbox.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.type)}
                  className="flex cursor-grab items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-slate-200 active:cursor-grabbing"
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
              className="cursor-grab rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 active:cursor-grabbing"
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
