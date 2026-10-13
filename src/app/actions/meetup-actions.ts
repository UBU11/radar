"use server";

import { createClient } from "@/lib/supabase/server";
import { VerifyMeetupPinSchema, type VerifyMeetupPinInput } from "@/types/meetup";
import { verifyOfflinePin } from "@/lib/crypto/meetup-pin";

export async function verifyMeetupPinAction(input: VerifyMeetupPinInput) {
  const validated = VerifyMeetupPinSchema.safeParse(input);
  if (!validated.success) {
    return { success: false, error: "Invalid PIN payload", details: validated.error.format() };
  }

  const supabase = await createClient();

  const { data: meetup, error: fetchError } = await supabase
    .from("meetups")
    .select("id, user_a_id, user_b_id, pin_hash, salt, meetup_verified, expires_at")
    .eq("id", validated.data.meetupId)
    .single();

  if (fetchError || !meetup) {
    return { success: false, error: "Meetup record not found" };
  }

  if (new Date(meetup.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Meetup protocol expired (24-hour window closed)" };
  }

  const isValidPin = await verifyOfflinePin(validated.data.pin, meetup.id, meetup.salt, meetup.pin_hash);
  if (!isValidPin) {
    return { success: false, error: "Incorrect 4-digit PIN" };
  }

  const { error: updateError } = await supabase
    .from("meetups")
    .update({ meetup_verified: true, status: "verified" })
    .eq("id", meetup.id);

  if (updateError) {
    return { success: false, error: "Failed to persist meetup verification state" };
  }

  // Double-blind privacy: peer profile is queried from user_private_profiles only once verified
  const peerUserId = meetup.user_a_id === validated.data.userId ? meetup.user_b_id : meetup.user_a_id;
  const { data: profile } = await supabase
    .from("user_private_profiles")
    .select("real_name, contact_handle")
    .eq("user_id", peerUserId)
    .maybeSingle();

  return {
    success: true,
    verified: true,
    realName: profile?.real_name ?? null,
    contactHandle: profile?.contact_handle ?? null,
  };
}
