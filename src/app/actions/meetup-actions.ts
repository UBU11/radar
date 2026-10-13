"use server";

import { createClient } from "@/lib/supabase/server";
import { SplitKeyVerificationSchema, type SplitKeyVerificationInput } from "@/types/meetup";

export async function verifyMeetupSplitKeyAction(input: SplitKeyVerificationInput) {
  const validated = SplitKeyVerificationSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid split-key payload", details: validated.error.format() };
  }

  const supabase = await createClient();

  const { data: meetup, error: fetchError } = await supabase
    .from("meetups")
    .select("id, user_a_id, user_b_id, split_key_hash_b, meetup_verified, expires_at")
    .eq("id", validated.data.meetupId)
    .single();

  if (fetchError || !meetup) {
    return { success: false, error: "Meetup record not found" };
  }

  if (new Date(meetup.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Meetup protocol expired (24-hour window closed)" };
  }

  // ponytail: constant-time hash comparison placeholder for split-key proof
  const isKeyValid = validated.data.proofToken === meetup.split_key_hash_b;
  if (!isKeyValid) {
    return { success: false, error: "Split-key cryptographic proof mismatch" };
  }

  const { error: updateError } = await supabase
    .from("meetups")
    .update({ meetup_verified: true })
    .eq("id", meetup.id);

  if (updateError) {
    return { success: false, error: "Failed to persist meetup verification state" };
  }

  // Once verified, query secure view to retrieve user_b_real_name
  const { data: verifiedView } = await supabase
    .from("meetups")
    .select("id, meetup_verified, user_b_real_name")
    .eq("id", meetup.id)
    .single();

  return {
    success: true,
    verified: true,
    realName: verifiedView?.user_b_real_name ?? null,
  };
}
