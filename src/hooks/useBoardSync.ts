"use client";

import { useCallback, useRef } from "react";
import type { Node, Edge } from "@xyflow/react";

const DEBOUNCE_MS = 2000;

export function useBoardSync(boardId: string | null) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);

  const saveNow = useCallback(
    async (nodes: Node[], edges: Edge[]) => {
      if (!boardId || isSavingRef.current) return;

      isSavingRef.current = true;
      try {
        const syncNodes = nodes.map((n) => ({
          id: n.id,
          type: n.type ?? "textNode",
          positionX: n.position.x,
          positionY: n.position.y,
          content: n.data as Record<string, unknown>,
        }));

        const syncEdges = edges.map((e) => ({
          source: e.source,
          target: e.target,
          label: typeof e.label === "string" ? e.label : undefined,
        }));

        await fetch(`/api/boards/${boardId}/sync`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes: syncNodes, edges: syncEdges }),
        });
      } catch (error) {
        console.error("Board sync error:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [boardId]
  );

  const scheduleSave = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!boardId) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => saveNow(nodes, edges), DEBOUNCE_MS);
    },
    [boardId, saveNow]
  );

  return { saveNow, scheduleSave };
}
