"use client";

import { useState, useRef, useEffect, useMemo, useCallback, type FormEvent } from "react";
import { Handle, Position, useReactFlow, useEdges, useNodes, type NodeProps } from "@xyflow/react";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  Plus,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { DEFAULT_MODEL, type AIModelId } from "@/lib/ai/config";
import { cn } from "@/lib/utils";

type ChatNodeData = {
  label?: string;
};

function getConnectedNodeContext(
  chatNodeId: string,
  allNodes: ReturnType<typeof useNodes>,
  allEdges: ReturnType<typeof useEdges>
): string {
  const connectedNodeIds = new Set<string>();

  for (const edge of allEdges) {
    if (edge.source === chatNodeId) connectedNodeIds.add(edge.target);
    if (edge.target === chatNodeId) connectedNodeIds.add(edge.source);
  }

  const contextParts: string[] = [];

  for (const node of allNodes) {
    if (!connectedNodeIds.has(node.id)) continue;
    const data = node.data as Record<string, unknown>;

    if (node.type === "textNode") {
      const text = data.text as string | undefined;
      if (text) contextParts.push(`[Jegyzet: "${data.label || "Jegyzet"}"]\n${text}`);
    } else if (node.type === "youtubeNode") {
      const url = data.videoUrl as string | undefined;
      if (url) contextParts.push(`[YouTube: "${data.videoTitle || "Videó"}"] ${url}`);
    } else if (node.type === "imageNode") {
      const url = data.imageUrl as string | undefined;
      if (url) contextParts.push(`[Kép: "${data.label || "Kép"}"] ${url}`);
    }
  }

  return contextParts.join("\n---\n");
}

export function ChatNode({ id, data, selected }: NodeProps) {
  const nodeData = data as ChatNodeData;
  const [selectedModel, setSelectedModel] = useState<AIModelId>(DEFAULT_MODEL);
  const [chatKey, setChatKey] = useState(0);
  const [input, setInput] = useState("");
  const [showPrevious, setShowPrevious] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setNodes } = useReactFlow();
  const allNodes = useNodes();
  const allEdges = useEdges();

  const nodeContext = useMemo(
    () => getConnectedNodeContext(id, allNodes, allEdges),
    [id, allNodes, allEdges]
  );

  const connectedCount = useMemo(() => {
    const ids = new Set<string>();
    for (const edge of allEdges) {
      if (edge.source === id) ids.add(edge.target);
      if (edge.target === id) ids.add(edge.source);
    }
    return ids.size;
  }, [id, allEdges]);

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: {
          model: selectedModel,
          ...(nodeContext ? { nodeContext } : {}),
        },
      }),
    [selectedModel, nodeContext]
  );

  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: `chat-node-${id}-${chatKey}`,
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isLoading) return;
      sendMessage({ text: trimmed });
      setInput("");
    },
    [input, isLoading, sendMessage]
  );

  const handleQuickAction = useCallback(
    (action: string) => {
      if (isLoading) return;
      sendMessage({ text: action });
    },
    [isLoading, sendMessage]
  );

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setChatKey((prev) => prev + 1);
  }, [setMessages]);

  const handleModelChange = useCallback((modelId: AIModelId) => {
    setSelectedModel(modelId);
    setChatKey((prev) => prev + 1);
  }, []);

  const handleDelete = useCallback(() => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
  }, [id, setNodes]);

  const textParts = useCallback(
    (parts: (typeof messages)[number]["parts"]) =>
      parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join(""),
    []
  );

  return (
    <div
      className={cn(
        "w-[360px] rounded-2xl border bg-slate-900 shadow-2xl transition-all",
        selected
          ? "border-violet-500 shadow-violet-500/20"
          : "border-slate-600 hover:border-slate-500"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !border-2 !border-slate-900 !bg-violet-500"
      />

      {/* Header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-700 bg-slate-800 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">
            {nodeData.label || "AI Chat"}
          </span>
          {connectedCount > 0 && (
            <span className="rounded-full bg-violet-600/30 px-2 py-0.5 text-[10px] text-violet-300">
              {connectedCount} kapcsolt
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selected && (
            <button
              onClick={handleDelete}
              className="rounded p-1 text-slate-500 hover:bg-red-500/20 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Model selector + New chat */}
      <div className="flex items-center gap-2 border-b border-slate-700 px-3 py-2">
        <ModelSelector
          value={selectedModel}
          onChange={handleModelChange}
          disabled={isLoading}
        />
        <button
          onClick={handleNewChat}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500"
        >
          <Plus className="h-3 w-3" />
          Új Chat
        </button>
      </div>

      {/* Previous chats toggle */}
      <button
        onClick={() => setShowPrevious(!showPrevious)}
        className="flex w-full items-center justify-between border-b border-slate-700/50 px-4 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-800/50"
      >
        <span>Korábbi beszélgetések</span>
        {showPrevious ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {showPrevious && (
        <div className="border-b border-slate-700/50 px-4 py-2">
          <p className="text-[10px] text-slate-500 italic">
            Az aktuális beszélgetés a node-on belül van.
          </p>
        </div>
      )}

      {/* Connected nodes info */}
      {connectedCount > 0 && (
        <div className="flex items-center gap-1.5 border-b border-slate-700/50 px-4 py-1.5">
          <FileText className="h-3 w-3 text-violet-400" />
          <span className="text-[10px] text-slate-400">
            {connectedCount} összekötött elem kontextusa aktív
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="nowheel h-[250px] overflow-y-auto p-3">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-2 h-8 w-8 text-slate-700" />
              <p className="text-xs text-slate-500">
                Kösd össze a chat-et más node-okkal,
              </p>
              <p className="text-xs text-slate-500">
                majd kérdezz bármit!
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600">
                  <Bot className="h-3 w-3 text-white" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-xl px-3 py-1.5 text-xs",
                  message.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-200"
                )}
              >
                <p className="whitespace-pre-wrap">{textParts(message.parts)}</p>
              </div>
              {message.role === "user" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-700">
                  <User className="h-3 w-3 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages.at(-1)?.role !== "assistant" && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-600">
                <Bot className="h-3 w-3 text-white" />
              </div>
              <div className="rounded-xl bg-slate-800 px-3 py-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mt-2 rounded-lg border border-red-800 bg-red-900/20 px-2 py-1.5 text-[10px] text-red-400">
            {error.message}
          </div>
        )}
      </div>

      {/* Quick actions */}
      {messages.length === 0 && connectedCount > 0 && (
        <div className="flex gap-2 border-t border-slate-700/50 px-3 py-2">
          <button
            onClick={() => handleQuickAction("Foglald össze a kapcsolt tartalmakat!")}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:bg-slate-700"
          >
            <Sparkles className="h-3 w-3 text-violet-400" />
            Összefoglalás
          </button>
          <button
            onClick={() => handleQuickAction("Mi a fő mondanivalója a kapcsolt tartalmaknak? Emeld ki a kulcsgondolatokat!")}
            className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-[10px] text-slate-300 transition-colors hover:bg-slate-700"
          >
            <Sparkles className="h-3 w-3 text-violet-400" />
            Kulcsgondolatok
          </button>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-700 p-2.5">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kérdezz valamit..."
            disabled={isLoading}
            className="nowheel flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-lg bg-violet-600 p-1.5 text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </button>
        </form>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !border-2 !border-slate-900 !bg-violet-500"
      />
    </div>
  );
}
