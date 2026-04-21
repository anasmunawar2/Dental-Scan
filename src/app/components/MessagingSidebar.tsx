"use client";
import React, { useEffect, useRef, useState } from "react";
import { MessageResponse, MessagingProps, Sender } from "@/types/messaging";
import { fetchMessages, sendMessage } from "@/apiclients/messagingApi.client";


export default function MessagingSidebar({ threadId, sender }: MessagingProps) {
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  fetchMessages(threadId)
    .then(setMessages)
    .catch(() => setError("Failed to load messages."));
}, [threadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
  if (!input.trim()) return;
  setError(null);
  setSending(true);

  const optimisticMsg: MessageResponse = {
    id: "optimistic-" + Date.now(),
    threadId,
    content: input,
    sender,
    createdAt: new Date().toISOString(),
  };
  setMessages((prev) => [...prev, optimisticMsg]);
  setInput("");

  try {
    const newMsg = await sendMessage({
      threadId,
      content: optimisticMsg.content,
      sender,
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === optimisticMsg.id ? newMsg : m))
    );
  } catch (err: any) {
    setError("Failed to send. Try again.");
    setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
    setInput(optimisticMsg.content);
  } finally {
    setSending(false);
  }
}

  return (
    <aside className="w-80 bg-zinc-900 border-l border-zinc-800 flex flex-col h-full">
      <div className="p-4 border-b border-zinc-800 font-bold text-blue-300">
        Message Your Clinic
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-2">
        {messages.length === 0 && (
          <div className="text-gray-400 text-sm">No messages yet.</div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "patient" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`rounded-lg px-3 py-2 max-w-xs ${
                msg.sender === "patient"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-700 text-gray-100"
              } text-sm`}
            >
              {msg.content}
              <div className="text-xs text-gray-300 mt-1 text-right">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            className="flex-1 px-3 py-2 rounded bg-zinc-800 text-white border border-zinc-700"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-700 rounded text-white disabled:opacity-50"
            disabled={sending || !input.trim()}
          >
            Send
          </button>
        </form>
        {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
      </div>
    </aside>
  );
}