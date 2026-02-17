"use client";

import { useState, useEffect, useCallback } from "react";
import type { BoardListItem, Board } from "@/types/board";

export function useBoards() {
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/boards");
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Fetch boards error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const createBoard = useCallback(
    async (name: string): Promise<Board | null> => {
      try {
        const res = await fetch("/api/boards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const board = await res.json();
          await fetchBoards();
          return board;
        }
      } catch (error) {
        console.error("Create board error:", error);
      }
      return null;
    },
    [fetchBoards]
  );

  const deleteBoard = useCallback(
    async (boardId: string) => {
      try {
        const res = await fetch(`/api/boards/${boardId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          await fetchBoards();
        }
      } catch (error) {
        console.error("Delete board error:", error);
      }
    },
    [fetchBoards]
  );

  const loadBoard = useCallback(async (boardId: string): Promise<Board | null> => {
    try {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (error) {
      console.error("Load board error:", error);
    }
    return null;
  }, []);

  return { boards, loading, createBoard, deleteBoard, loadBoard, refetch: fetchBoards };
}
