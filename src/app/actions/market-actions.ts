"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateMarketSchema, BetInputSchema, type CreateMarketInput, type BetInput } from "@/types/market";
import { executeAtomicBet } from "@/lib/betting/queue";

export async function createMarketAction(input: CreateMarketInput) {
  const validated = CreateMarketSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Validation failed", details: validated.error.format() };
  }

  const supabase = await createClient();
  const { data: createdMarket, error: insertError } = await supabase
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

  if (insertError || !createdMarket) {
    return { success: false, error: insertError?.message || "Failed to create market" };
  }

  return { success: true, marketId: createdMarket.id };
}

export async function submitBetToQueueAction(input: BetInput) {
  const validated = BetInputSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid bet input", details: validated.error.format() };
  }

  try {
    const result = await executeAtomicBet(validated.data);
    if (!result.success) {
      return { success: false, error: result.error || "Failed to place bet" };
    }

    return {
      success: true,
      jobId: result.jobId,
      newBalance: result.newBalance,
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
