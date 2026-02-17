"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, useCallback, type FormEvent } from "react";
import { Send, Bot, User, Loader2, X, Sparkles } from "lucide-react";
import { ModelSelector } from "@/components/ModelSelector";
import { DEFAULT_MODEL, type AIModelId } from "@/lib/ai/config";
import { cn } from "@/lib/utils";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeContext?: string;
}

export function AIChatPanel({ isOpen, onClose, nodeContext }: AIChatPanelProps) {
  const [selectedModel, setSelectedModel] = useState<AIModelId>(DEFAULT_MODEL);
  const [chatKey, setChatKey] = useState(0);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const { messages, sendMessage, status, error } = useChat({
    id: `canvas-chat-${chatKey}`,
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

  const handleModelChange = useCallback((modelId: AIModelId) => {
    setSelectedModel(modelId);
    setChatKey((prev) => prev + 1);
  }, []);

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
        "absolute right-0 top-0 z-40 flex h-full w-[380px] flex-col border-l border-slate-700 bg-slate-900 shadow-2xl transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-slate-200">AI Asszisztens</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Model selector */}
      <div className="border-b border-slate-700 px-4 py-2">
        <ModelSelector
          value={selectedModel}
          onChange={handleModelChange}
          disabled={isLoading}
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-3 h-10 w-10 text-slate-700" />
              <p className="text-sm text-slate-500">
                Kérdezz bármit a vásznodról!
              </p>
              <p className="mt-1 text-xs text-slate-600">
                Segítek rendszerezni a gondolataidat.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  message.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-200"
                )}
              >
                <p className="whitespace-pre-wrap">{textParts(message.parts)}</p>
              </div>

              {message.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages.at(-1)?.role !== "assistant" && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-600">
                <Bot className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="rounded-xl bg-slate-800 px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mt-3 rounded-lg border border-red-800 bg-red-900/20 px-3 py-2 text-xs text-red-400">
            {error.message}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700 p-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kérdezz valamit..."
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 rounded-lg bg-violet-600 p-2 text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
