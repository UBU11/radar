"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatOddsMultiplier, formatCredits } from "@/lib/utils/format";
import { generateUuidV7 } from "@/lib/utils/uuidv7";
import { CheckCircle2, Loader2, Zap } from "lucide-react";

interface BettingPanelProps {
  marketId: string;
  marketTitle: string;
  yesMultiplier?: number;
  noMultiplier?: number;
}

export function BettingPanel({
  marketId,
  marketTitle,
  yesMultiplier = 1.85,
  noMultiplier = 2.15,
}: BettingPanelProps) {
  const [outcome, setOutcome] = useState<"YES" | "NO">("YES");
  const [amount, setAmount] = useState<number>(50);
  const [isPending, startTransition] = useTransition();
  const [receipt, setReceipt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeMultiplier = outcome === "YES" ? yesMultiplier : noMultiplier;
  const potentialPayout = amount * activeMultiplier;

  const submitBetOrder = () => {
    setReceipt(null);
    setErrorMessage(null);

    startTransition(async () => {
      const dummyUserId = "00000000-0000-0000-0000-000000000001";
      const idempotencyKey = generateUuidV7();

      try {
        const response = await fetch("/api/bets/place", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idempotencyKey,
            marketId,
            userId: dummyUserId,
            outcome,
            amount,
          }),
        });

        const orderResult = await response.json();
        if (!response.ok || !orderResult.success) {
          setErrorMessage(orderResult.error || "Failed to place bet");
          return;
        }

        setReceipt(orderResult.jobId || idempotencyKey);
      } catch (err) {
        setErrorMessage((err as Error).message);
      }
    });
  };

  return (
    <Card className="border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00F0FF]" />
            <span>ORDER ENTRY</span>
          </CardTitle>
          <span className="text-[10px] font-mono text-neutral-400">ATOMIC LUA BUFFER</span>
        </div>
        <p className="text-xs text-neutral-300 truncate mt-1">{marketTitle}</p>
      </CardHeader>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setOutcome("YES")}
            className={`p-2.5 rounded-sm border font-mono text-xs flex flex-col items-center justify-center transition-colors ${
              outcome === "YES"
                ? "bg-white/10 border-white text-white font-bold"
                : "bg-black border-white/10 text-neutral-400 hover:border-white/20"
            }`}
          >
            <span>YES</span>
            <span className="text-[11px] tabular-nums text-[#00F0FF]">
              {formatOddsMultiplier(yesMultiplier)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOutcome("NO")}
            className={`p-2.5 rounded-sm border font-mono text-xs flex flex-col items-center justify-center transition-colors ${
              outcome === "NO"
                ? "bg-white/10 border-white text-white font-bold"
                : "bg-black border-white/10 text-neutral-400 hover:border-white/20"
            }`}
          >
            <span>NO</span>
            <span className="text-[11px] tabular-nums text-[#00F0FF]">
              {formatOddsMultiplier(noMultiplier)}
            </span>
          </button>
        </div>

        <div>
          <div className="flex justify-between text-xs text-neutral-400 font-mono mb-1.5">
            <span>STAKE AMOUNT</span>
            <span className="text-white tabular-nums">${formatCredits(amount)}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[10, 25, 50, 100].map((preset) => (
              <Button
                key={preset}
                size="sm"
                variant={amount === preset ? "terminal" : "ghost"}
                className={`font-mono tabular-nums text-xs ${amount === preset ? "border-white/40 text-white" : ""}`}
                onClick={() => setAmount(preset)}
              >
                ${preset}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] border border-white/10 p-2.5 rounded-sm space-y-1 font-mono text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>POTENTIAL PAYOUT</span>
            <span className="text-white tabular-nums font-bold">
              ${formatCredits(potentialPayout)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-neutral-500">
            <span>EST. NET PROFIT</span>
            <span className="text-[#00F0FF] tabular-nums">
              +${formatCredits(potentialPayout - amount)}
            </span>
          </div>
        </div>

        {receipt && (
          <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded-sm text-xs font-mono tabular-nums text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">TX QUEUED: {receipt.slice(0, 12)}...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2 bg-red-950/30 border border-red-500/30 rounded-sm text-xs font-mono text-red-400">
            {errorMessage}
          </div>
        )}

        <Button
          variant="accent"
          className="w-full font-mono text-xs tracking-wider"
          onClick={submitBetOrder}
          disabled={isPending}
        >
          {isPending ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>TRANSMITTING TO QUEUE...</span>
            </span>
          ) : (
            `PLACE BET // $${amount} ON ${outcome}`
          )}
        </Button>
      </div>
    </Card>
  );
}
