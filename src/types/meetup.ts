import { z } from "zod";

export const VerifyMeetupPinSchema = z.object({
  meetupId: z.string().uuid("Invalid meetup ID"),
  userId: z.string().uuid("Invalid user ID"),
  pin: z.string().length(4, "Meetup PIN must be exactly 4 digits").regex(/^\d{4}$/, "PIN must be numeric"),
});
export type VerifyMeetupPinInput = z.infer<typeof VerifyMeetupPinSchema>;

export interface OfflineMeetupRecord {
  id: string;
  market_id: string;
  user_a_id: string;
  user_b_id: string;
  status: "pending" | "verified" | "expired";
  meetup_verified: number; // 0 or 1 for SQLite CRDT representation
  pin_hash: string;
  salt: string;
  expires_at: string;
  created_at: string;
}

export interface UserPrivateProfile {
  user_id: string;
  real_name: string;
  contact_handle: string;
  created_at: string;
}
