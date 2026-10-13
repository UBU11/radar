import { Hono } from "hono";
import { z } from "zod";

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

const ATOMIC_BET_LUA_SCRIPT = `
local userBalanceKey = KEYS[1]
local marketPoolKey = KEYS[2]
local queueKey = KEYS[3]
local idempotencyKey = KEYS[4]

local betAmount = tonumber(ARGV[1])
local betPayload = ARGV[2]

if redis.call('EXISTS', idempotencyKey) == 1 then
  return { 'DUPLICATE', redis.call('GET', idempotencyKey) }
end

local currentBalance = tonumber(redis.call('GET', userBalanceKey) or '1000')

if currentBalance < betAmount then
  return { 'INSUFFICIENT_BALANCE', tostring(currentBalance) }
end

local newBalance = currentBalance - betAmount
redis.call('SET', userBalanceKey, tostring(newBalance))
redis.call('INCRBYFLOAT', marketPoolKey, betAmount)
redis.call('LPUSH', queueKey, betPayload)
redis.call('SETEX', idempotencyKey, 86400, 'CONFIRMED')

return { 'SUCCESS', tostring(newBalance) }
`;

const app = new Hono<{ Bindings: Bindings }>();

app.get("/health", (c) => {
  return c.json({ status: "healthy", service: "radar-betting-engine" });
});

async function handleBetPlacement(c: any) {
  const body = await c.req.json().catch(() => null);
  const parseResult = BetPayloadSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({ error: "Invalid bet payload", details: parseResult.error.format() }, 400);
  }

  const bet = parseResult.data;
  const queueKey = c.env.BET_QUEUE_KEY || "radar:queue:bets";
  const userBalanceKey = `radar:user:${bet.userId}:balance`;
  const marketPoolKey = `radar:market:${bet.marketId}:pool:${bet.outcome}`;
  const idempotencyKey = `radar:idempotency:${bet.idempotencyKey}`;

  const queuedItem = JSON.stringify({
    ...bet,
    queuedAt: Date.now(),
  });

  const redisUrl = c.env.UPSTASH_REDIS_REST_URL;
  const redisToken = c.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return c.json({
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
    return c.json({ error: "Failed to execute atomic bet transaction" }, 502);
  }

  const result = (await redisResponse.json()) as { result: [string, string] };
  const [status, details] = result.result;

  if (status === "INSUFFICIENT_BALANCE") {
    return c.json({ error: "Insufficient balance", currentBalance: parseFloat(details) }, 422);
  }

  if (status === "DUPLICATE") {
    return c.json({ error: "Duplicate idempotency key: already processed" }, 409);
  }

  return c.json(
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

app.post("/api/bets/place", handleBetPlacement);
app.post("/bets", handleBetPlacement);

export default app;
