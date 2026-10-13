import { z } from "zod";

export const MarketModerationSchema = z.object({
  title: z.string().describe("Cleaned and concise market title suitable for a campus poll"),
  category: z.string().describe("Standardized category (e.g. Campus, Tech, Sports, Academics)"),
  resolution_criteria: z.string().describe("Objective, verifiable condition required to resolve the market"),
  expiry_date: z.string().describe("ISO-8601 formatted datetime when market betting freezes"),
  is_appropriate: z.boolean().describe("Whether this market is compliant with campus safety and non-harassment rules"),
  rejection_reason: z.string().optional().describe("Reason for rejection if flagged as inappropriate"),
});

export type MarketModerationOutput = z.infer<typeof MarketModerationSchema>;
