"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const transport = new TextStreamChatTransport({
  api: "/api/chat",
});

export function ChatTest() {
  const { messages, sendMessage, status, error } = useChat({ transport });
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInput("");
  };

  const textParts = (parts: typeof messages[number]["parts"]) =>
    parts
      .filter((p) => p.type === "text")
      .map((p) => p.text)
      .join("");

  return (
    <Card className="flex h-[600px] w-full max-w-2xl flex-col border-zinc-800 bg-slate-900">
      <CardHeader className="border-b border-zinc-800">
        <CardTitle className="flex items-center gap-2 text-zinc-100">
          <Bot className="h-5 w-5 text-violet-400" />
          BrainBoard AI Chat
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
              <p className="text-sm text-zinc-500">
                Kezdj el beszélgetni az AI asszisztenssel!
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                Írj egy üzenetet lent, és nyomj Enter-t.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  message.role === "user"
                    ? "bg-violet-600 text-white"
                    : "bg-zinc-800 text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{textParts(message.parts)}</p>
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                  <User className="h-4 w-4 text-zinc-300" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages.at(-1)?.role !== "assistant" && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="rounded-2xl bg-zinc-800 px-4 py-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-800 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            Hiba: {error.message}
          </div>
        )}
      </CardContent>

      <div className="border-t border-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Írj egy üzenetet..."
            disabled={isLoading}
            className="flex-1 border-zinc-700 bg-zinc-800 text-zinc-100 placeholder:text-zinc-500"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
}
