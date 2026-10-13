import { z } from "zod";

export const SplitKeyVerificationSchema = z.object({
  meetupId: z.string().uuid("Invalid meetup ID"),
  userId: z.string().uuid("Invalid user ID"),
  proofToken: z.string().min(16, "Invalid split-key proof token"),
});
export type SplitKeyVerificationInput = z.infer<typeof SplitKeyVerificationSchema>;

export interface OfflineMeetupRecord {
  id: string;
  market_id: string;
  user_a_id: string;
  user_b_id: string;
  user_b_real_name: string | null;
  split_key_hash_a: string;
  split_key_hash_b: string;
  meetup_verified: number; // 0 or 1 for SQLite CRDT representation
  expires_at: string;
  created_at: string;
}
