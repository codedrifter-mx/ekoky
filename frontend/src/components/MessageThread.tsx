"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Message {
  id: string;
  offerId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; address: string };
}

interface MessageThreadProps {
  offerId: string;
  receiverId: string;
}

export function MessageThread({ offerId, receiverId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchMessages() {
      try {
        const data = await api.get<Message[]>(`/api/messages?offerId=${offerId}`);
        if (cancelled) return;
        setMessages(data);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load messages");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [offerId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const message = await api.post<Message>("/api/messages", {
        offerId,
        receiverId,
        content: content.trim(),
      });
      setMessages((prev) => [...prev, message]);
      setContent("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border p-6">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Messages</h3>

      {messages.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No messages yet. Start the conversation!
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border-b border-gray-100 pb-3 last:border-0"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm text-gray-800">
                  {msg.sender.name}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2 pt-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
