import { Hono } from "hono";
import { z } from "zod";

const BetPayloadSchema = z.object({
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

app.get("/health", (c) => {
  return c.json({ status: "healthy", service: "radar-betting-engine" });
});

app.post("/bets", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parseResult = BetPayloadSchema.safeParse(body);

  if (!parseResult.success) {
    return c.json({ error: "Invalid bet payload", details: parseResult.error.format() }, 400);
  }

  const bet = parseResult.data;
  const queueKey = c.env.BET_QUEUE_KEY || "radar:queue:bets";
  const jobId = crypto.randomUUID();
  const queuedItem = JSON.stringify({
    jobId,
    ...bet,
    queuedAt: Date.now(),
  });

  // Direct REST push to Upstash Redis: isolates PostgreSQL from high-frequency traffic spikes
  const upstashEndpoint = `${c.env.UPSTASH_REDIS_REST_URL}/lpush/${queueKey}/${encodeURIComponent(queuedItem)}`;
  const redisResponse = await fetch(upstashEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${c.env.UPSTASH_REDIS_REST_TOKEN}`,
    },
  });

  if (!redisResponse.ok) {
    return c.json({ error: "Failed to enqueue bet in high-throughput buffer" }, 502);
  }

  return c.json(
    {
      success: true,
      jobId,
      status: "queued",
      marketId: bet.marketId,
      amount: bet.amount,
      outcome: bet.outcome,
    },
    202
  );
});

export default app;
