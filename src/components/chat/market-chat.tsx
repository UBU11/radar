"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  handle: string;
  content: string;
  timestamp: string;
}

interface MarketChatProps {
  marketId: string;
}

export function MarketChat({ marketId }: MarketChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      handle: "Anon#492",
      content: "Final exam curve is historically generous for CS 201.",
      timestamp: "10m ago",
    },
    {
      id: "2",
      handle: "Anon#118",
      content: "TA mentioned in lab they might shift grading scale.",
      timestamp: "3m ago",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // ponytail: local append before Supabase broadcast channel is hooked
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      handle: `Anon#${Math.floor(100 + Math.random() * 900)}`,
      content: inputValue.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
  };

  return (
    <Card className="flex flex-col h-full border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neutral-400" />
            <span>LIVE ANONYMOUS CHAT</span>
          </CardTitle>
          <span className="text-[10px] font-mono text-neutral-500 uppercase">POLL #{marketId.slice(0, 4)}</span>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-y-auto space-y-2.5 max-h-64 pr-1">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-[#111111] border border-white/5 p-2 rounded-sm text-xs">
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 mb-1">
              <span className="text-[#00F0FF]">{msg.handle}</span>
              <span>{msg.timestamp}</span>
            </div>
            <p className="text-neutral-200 text-xs leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="mt-3 pt-2 border-t border-white/5 flex gap-2">
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
