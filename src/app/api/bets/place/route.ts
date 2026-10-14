import { NextResponse } from "next/server";
import { BetInputSchema } from "@/types/market";
import { executeAtomicBet } from "@/lib/betting/queue";

export async function POST(request: Request) {
  const jsonPayload = await request.json().catch(() => null);
  const parseResult = BetInputSchema.safeParse(jsonPayload);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid bet payload", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const workerUrl = process.env.CLOUDFLARE_WORKER_URL || process.env.NEXT_PUBLIC_BETTING_WORKER_URL;

  if (workerUrl) {
    try {
      const workerResponse = await fetch(`${workerUrl}/api/bets/place`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      const workerResult = await workerResponse.json();
      return NextResponse.json(workerResult, { status: workerResponse.status });
    } catch {
      // Fall through to local atomic execution if worker proxy is unreachable
    }
  }

  const atomicResult = await executeAtomicBet(parseResult.data);
  if (!atomicResult.success) {
    return NextResponse.json(
      { error: atomicResult.error || "Failed to execute atomic bet transaction" },
      { status: 422 }
    );
  }

  return NextResponse.json(
    {
      success: true,
      jobId: atomicResult.jobId,
      status: "queued",
      newBalance: atomicResult.newBalance,
      marketId: parseResult.data.marketId,
      amount: parseResult.data.amount,
      outcome: parseResult.data.outcome,
    },
    { status: 202 }
  );
}
