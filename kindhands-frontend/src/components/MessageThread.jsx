// src/components/MessageThread.jsx
import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { listMessages, sendMessage } from "../services/orderService";

const POLL_MS = 6000; // simple polling — no websocket server set up for this pass

export default function MessageThread({ orderId, myRole }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      listMessages(orderId)
        .then((msgs) => !cancelled && setMessages(msgs))
        .catch((err) => !cancelled && setError(err.message));
    };
    load();
    const interval = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    setError("");
    try {
      const message = await sendMessage(orderId, draft.trim());
      setMessages((prev) => [...prev, message]);
      setDraft("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-80 rounded-xl outline outline-1 outline-line bg-surface overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && <p className="text-sm text-ink-muted text-center mt-6">No messages yet.</p>}
        {messages.map((m) => {
          const isSystem = m.senderRole === "system";
          const isMine = m.senderRole === myRole;
          if (isSystem) {
            return (
              <div key={m.id} className="flex justify-center">
                <span className="text-xs text-ink-muted bg-paper rounded-full px-3 py-1 text-center">{m.body}</span>
              </div>
            );
          }
          return (
            <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <span className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${isMine ? "bg-pine text-white" : "bg-paper text-ink"}`}>
                {m.body}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          maxLength={1000}
          className="flex-1 rounded-full bg-paper px-3.5 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-pine"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pine text-white disabled:opacity-50"
        >
          <Send size={16} />
        </button>
      </form>
      {error && <p className="px-3 pb-2 text-xs text-clay">{error}</p>}
    </div>
  );
}
