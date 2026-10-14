"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { usePowerSyncQuery } from "@/lib/powersync/hooks";
import { getPowerSyncClient } from "@/lib/powersync/client";
import { generateUuidV7 } from "@/lib/utils/uuidv7";
import { MessageSquare, Send } from "lucide-react";

interface MessageRow {
  id: string;
  idempotency_key: string;
  market_id: string;
  anonymous_handle: string;
  content: string;
  created_at: string;
}

interface AnonymousChatProps {
  marketId: string;
}

const FALLBACK_MESSAGES: MessageRow[] = [
  {
    id: "1",
    idempotency_key: "0192e123-4567-7890-abcd-ef0123456789",
    market_id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    anonymous_handle: "Anon#492",
    content: "Final exam curve is historically generous for CS 201.",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "2",
    idempotency_key: "0192e123-4567-7890-abcd-ef0123456790",
    market_id: "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
    anonymous_handle: "Anon#118",
    content: "TA mentioned in lab they might shift grading scale.",
    created_at: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
  },
];

export function AnonymousChat({ marketId }: AnonymousChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<MessageRow[]>([]);

  const { records: dbMessages } = usePowerSyncQuery<MessageRow>(
    "SELECT id, idempotency_key, market_id, anonymous_handle, content, created_at FROM market_messages WHERE market_id = ? ORDER BY created_at ASC",
    [marketId],
    FALLBACK_MESSAGES
  );

  const displayedMessages = [...dbMessages, ...optimisticMessages];

  const dispatchChatMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    const messageId = generateUuidV7();
    const idempotencyKey = generateUuidV7();
    const userTag = `Anon#${Math.floor(100 + Math.random() * 900)}`;
    const content = inputValue.trim();
    const createdAt = new Date().toISOString();

    const newMessage: MessageRow = {
      id: messageId,
      idempotency_key: idempotencyKey,
      market_id: marketId,
      anonymous_handle: userTag,
      content,
      created_at: createdAt,
    };

    setInputValue("");

    try {
      const db = getPowerSyncClient();
      await db.execute(
        "INSERT INTO market_messages (id, idempotency_key, market_id, anonymous_handle, content, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [messageId, idempotencyKey, marketId, userTag, content, createdAt]
      );
    } catch {
      setOptimisticMessages((prev) => [...prev, newMessage]);
    }
  };

  return (
    <Card className="flex flex-col h-full border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-400" />
            <span>LIVE ANONYMOUS CHAT</span>
          </CardTitle>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">
            POLL #{marketId.slice(0, 4)}
          </span>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-64 pr-1">
        {displayedMessages.map((msg) => (
          <div key={msg.id} className="bg-[#111111] border border-white/5 p-2 rounded-sm text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 mb-1">
              <span className="text-[#00F0FF]">{msg.anonymous_handle}</span>
              <span className="tabular-nums">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-neutral-200 text-xs leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={dispatchChatMessage} className="mt-3 pt-2 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Transmit anonymous message..."
          className="flex-1 bg-[#111111] border border-white/10 rounded-sm px-2.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 font-sans"
        />
        <Button type="submit" size="sm" variant="terminal" className="px-3">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </Card>
  );
}
