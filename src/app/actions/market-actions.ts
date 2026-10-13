"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateMarketSchema, BetInputSchema, type CreateMarketInput, type BetInput } from "@/types/market";
import { pushBetToQueue } from "@/lib/betting/queue";

export async function createMarketAction(input: CreateMarketInput) {
  const validated = CreateMarketSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Validation failed", details: validated.error.format() };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("markets")
    .insert({
      title: validated.data.title,
      category: validated.data.category,
      resolution_criteria: validated.data.resolutionCriteria,
      expiry_date: validated.data.expiryDate,
      status: "open",
      total_pool_yes: 0,
      total_pool_no: 0,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, marketId: data.id };
}

export async function submitBetToQueueAction(input: BetInput) {
  const validated = BetInputSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid bet input", details: validated.error.format() };
  }

  try {
    // Bet queue buffer: prevents direct high-frequency load on PostgreSQL connection pool
    const result = await pushBetToQueue(validated.data);
    return { success: true, jobId: result.jobId, queuedAt: result.queuedAt };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
