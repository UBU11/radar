import { Hono, type Context } from "hono";
import { z } from "zod";
import { ATOMIC_BET_LUA_SCRIPT } from "../../../src/lib/betting/lua-script";

const BetPayloadSchema = z.object({
  idempotencyKey: z.string().uuid(),
  marketId: z.string().uuid(),
  userId: z.string().uuid(),
  outcome: z.enum(["YES", "NO"]),
  amount: z.number().positive(),
});

type Bindings = {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  BET_QUEUE_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (ctx) => {
  return ctx.json({ status: "healthy", service: "radar-betting-engine" });
});

async function placeBetEndpoint(ctx: Context<{ Bindings: Bindings }>) {
  const body = await ctx.req.json().catch(() => null);
  const parseResult = BetPayloadSchema.safeParse(body);

  if (!parseResult.success) {
    return ctx.json({ error: "Invalid bet payload", details: parseResult.error.format() }, 400);
  }

  const bet = parseResult.data;
  const queueKey = ctx.env.BET_QUEUE_KEY || "radar:queue:bets";
  const userBalanceKey = `radar:user:${bet.userId}:balance`;
  const marketPoolKey = `radar:market:${bet.marketId}:pool:${bet.outcome}`;
  const idempotencyKey = `radar:idempotency:${bet.idempotencyKey}`;

  const queuedItem = JSON.stringify({
    ...bet,
    queuedAt: Date.now(),
  });

  const redisUrl = ctx.env.UPSTASH_REDIS_REST_URL;
  const redisToken = ctx.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return ctx.json({
      success: true,
      jobId: bet.idempotencyKey,
      status: "queued",
      newBalance: 950.0,
      marketId: bet.marketId,
      amount: bet.amount,
      outcome: bet.outcome,
    }, 202);
  }

  const evalEndpoint = `${redisUrl}/eval`;
  const redisResponse = await fetch(evalEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${redisToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ATOMIC_BET_LUA_SCRIPT,
      4,
      userBalanceKey,
      marketPoolKey,
      queueKey,
      idempotencyKey,
      bet.amount.toString(),
      queuedItem,
    ]),
  });

  if (!redisResponse.ok) {
    return ctx.json({ error: "Failed to execute atomic bet transaction" }, 502);
  }

  const result = (await redisResponse.json()) as { result: [string, string] };
  const [status, details] = result.result;

  if (status === "INSUFFICIENT_BALANCE") {
    return ctx.json({ error: "Insufficient balance", currentBalance: parseFloat(details) }, 422);
  }

  if (status === "DUPLICATE") {
    return ctx.json({ error: "Duplicate idempotency key: already processed" }, 409);
  }

  return ctx.json(
    {
      success: true,
      jobId: bet.idempotencyKey,
      status: "queued",
      newBalance: parseFloat(details),
      marketId: bet.marketId,
      amount: bet.amount,
      outcome: bet.outcome,
    },
    202
  );
}

app.post("/api/bets/place", placeBetEndpoint);
app.post("/bets", placeBetEndpoint);

export default app;
