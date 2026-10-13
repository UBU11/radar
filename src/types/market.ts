import { z } from "zod";

export const BetOutcomeSchema = z.enum(["YES", "NO"]);
export type BetOutcome = z.infer<typeof BetOutcomeSchema>;

export const BetInputSchema = z.object({
  marketId: z.string().uuid("Invalid market ID"),
  userId: z.string().uuid("Invalid user ID"),
  outcome: BetOutcomeSchema,
  amount: z.number().positive("Bet amount must be greater than 0"),
});
export type BetInput = z.infer<typeof BetInputSchema>;

export const CreateMarketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(140),
  category: z.string().min(2).max(50),
  resolutionCriteria: z.string().min(10, "Resolution criteria required"),
  expiryDate: z.string().datetime("Must be a valid ISO datetime"),
});
export type CreateMarketInput = z.infer<typeof CreateMarketSchema>;

export interface MarketOdds {
  yesPrice: number;
  noPrice: number;
  yesProbability: number;
  noProbability: number;
}
