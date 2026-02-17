"use client";

import { useState, useRef, useEffect } from "react";
import {
  Brain,
  ChevronDown,
  Plus,
  Trash2,
  LayoutDashboard,
  Loader2,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BoardListItem } from "@/types/board";

interface NavbarProps {
  boards: BoardListItem[];
  activeBoardId: string | null;
  loading: boolean;
  onSelectBoard: (boardId: string) => void;
  onCreateBoard: (name: string) => void;
  onDeleteBoard: (boardId: string) => void;
}

export function Navbar({
  boards,
  activeBoardId,
  loading,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
}: NavbarProps) {
  const [boardsOpen, setBoardsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setBoardsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const handleCreateSubmit = () => {
    const trimmed = newBoardName.trim();
    if (!trimmed) return;
    onCreateBoard(trimmed);
    setNewBoardName("");
    setIsCreating(false);
  };

  return (
    <nav className="flex h-12 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-violet-500" />
          <span className="text-lg font-bold text-white">BrainBoard</span>
        </div>

        {/* Boards dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setBoardsOpen(!boardsOpen)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{activeBoard?.name || "Boards"}</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", boardsOpen && "rotate-180")} />
          </button>

          {boardsOpen && (
            <div className="absolute left-0 top-full z-50 mt-1 min-w-[240px] rounded-xl border border-slate-700 bg-slate-900 p-1 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 px-3 py-2">
                <span className="text-xs font-semibold text-slate-400">Boards</span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {isCreating && (
                <div className="border-b border-slate-700 p-2">
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
                    placeholder="Board neve..."
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-500"
                    autoFocus
                  />
                </div>
              )}

              <div className="max-h-[300px] overflow-y-auto py-1">
                {loading ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                  </div>
                ) : boards.length === 0 ? (
                  <p className="px-3 py-2 text-center text-xs text-slate-500">
                    Nincs board. Hozz l&eacute;tre egyet!
                  </p>
                ) : (
                  boards.map((board) => (
                    <div key={board.id} className="group flex items-center">
                      <button
                        onClick={() => {
                          onSelectBoard(board.id);
                          setBoardsOpen(false);
                        }}
                        className={cn(
                          "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                          activeBoardId === board.id
                            ? "bg-violet-600/20 text-violet-300"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        )}
                      >
                        <LayoutDashboard className="h-4 w-4 shrink-0" />
                        <span className="truncate">{board.name}</span>
                        <span className="ml-auto text-xs text-slate-500">
                          {board._count.nodes}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBoard(board.id);
                        }}
                        className="mr-1 hidden rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-400 group-hover:block"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className="px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white">
          Affiliate
        </button>
        <button className="px-3 py-1.5 text-sm text-slate-400 transition-colors hover:text-white">
          Learn
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-400">Welcome</span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600">
          <User className="h-4 w-4 text-white" />
        </div>
      </div>
    </nav>
  );
}
