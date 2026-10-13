import { Redis } from "@upstash/redis";
import type { BetInput } from "@/types/market";

export const BET_QUEUE_KEY = "radar:queue:bets";

export function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL || "https://placeholder-redis.upstash.io";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || "placeholder-token";

  return new Redis({
    url,
    token,
  });
}

export async function pushBetToQueue(betPayload: BetInput): Promise<{ jobId: string; queuedAt: number }> {
  const redis = getRedisClient();
  const jobId = crypto.randomUUID();
  const record = {
    jobId,
    ...betPayload,
    queuedAt: Date.now(),
  };

  // Push to Redis FIFO queue to shield Supabase from connection exhaustion
  await redis.lpush(BET_QUEUE_KEY, JSON.stringify(record));

  return { jobId, queuedAt: record.queuedAt };
}
