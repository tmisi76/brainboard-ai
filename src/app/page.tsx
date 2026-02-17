"use client";

import { useState, useCallback } from "react";
import { Navbar } from "@/components/navbar/Navbar";
import { Toolbar } from "@/components/toolbar/Toolbar";
import { Canvas } from "@/components/canvas/Canvas";
import { useBoards } from "@/hooks/useBoards";
import type { Board } from "@/types/board";

export default function Home() {
  const { boards, loading, createBoard, deleteBoard, loadBoard } = useBoards();
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  const handleSelectBoard = useCallback(
    async (boardId: string) => {
      setActiveBoardId(boardId);
      const board = await loadBoard(boardId);
      setActiveBoard(board);
    },
    [loadBoard]
  );

  const handleCreateBoard = useCallback(
    async (name: string) => {
      const board = await createBoard(name);
      if (board) {
        setActiveBoardId(board.id);
        setActiveBoard({ ...board, nodes: [], createdAt: "", updatedAt: "" });
      }
    },
    [createBoard]
  );

  const handleDeleteBoard = useCallback(
    async (boardId: string) => {
      await deleteBoard(boardId);
      if (activeBoardId === boardId) {
        setActiveBoardId(null);
        setActiveBoard(null);
      }
    },
    [deleteBoard, activeBoardId]
  );

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <Navbar
        boards={boards}
        activeBoardId={activeBoardId}
        loading={loading}
        onSelectBoard={handleSelectBoard}
        onCreateBoard={handleCreateBoard}
        onDeleteBoard={handleDeleteBoard}
      />
      <div className="flex flex-1 overflow-hidden">
        <Toolbar />
        <main className="flex-1">
          <Canvas board={activeBoard} />
        </main>
      </div>
    </div>
  );
}
