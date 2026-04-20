"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MessageInput({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/messages/${threadId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: body.trim() }),
      });
      setBody("");
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSend} className="shrink-0 border-t border-border p-3">
      <div className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border-[1.5px] border-border-light bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-text-tertiary focus:border-green-400 focus:outline-none"
        />
        <Button type="submit" size="icon" disabled={!body.trim() || sending}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
