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
      <div className="border border-border rounded-[8px] p-6">
        <p className="text-muted text-sm font-mono">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-[8px] p-6 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider">Messages</h3>

      {messages.length === 0 ? (
        <p className="text-muted text-sm leading-relaxed">
          No messages yet. Start the conversation.
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="border-b border-border pb-3 last:border-0"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">
                  {msg.sender.name}
                </span>
                <span className="text-[10px] font-mono text-muted tracking-wider">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed">{msg.content}</p>
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
          className="flex-1 border border-border bg-surface rounded-[4px] px-4 py-2 text-sm focus:border-accent"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-accent text-white px-4 py-2 rounded-[4px] text-sm hover:bg-[#333333] disabled:bg-muted/30 transition-colors font-medium tracking-wide"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {error && <p className="text-pale-red-text text-xs font-mono">{error}</p>}
    </div>
  );
}