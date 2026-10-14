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

  const { data: meetupRecord, error: fetchError } = await supabase
    .from("meetups")
    .select("id, user_a_id, user_b_id, pin_hash, salt, meetup_verified, expires_at")
    .eq("id", validated.data.meetupId)
    .single();

  if (fetchError || !meetupRecord) {
    return { success: false, error: "Meetup record not found" };
  }

  if (new Date(meetupRecord.expires_at).getTime() < Date.now()) {
    return { success: false, error: "Meetup protocol expired (24-hour window closed)" };
  }

  const isValidPin = await verifyOfflinePin(
    validated.data.pin,
    meetupRecord.id,
    meetupRecord.salt,
    meetupRecord.pin_hash
  );
  if (!isValidPin) {
    return { success: false, error: "Incorrect 4-digit PIN" };
  }

  const { error: updateError } = await supabase
    .from("meetups")
    .update({ meetup_verified: true, status: "verified" })
    .eq("id", meetupRecord.id);

  if (updateError) {
    return { success: false, error: "Failed to persist meetup verification state" };
  }

  // Double-blind privacy: peer profile is queried from user_private_profiles only once verified
  const peerUserId =
    meetupRecord.user_a_id === validated.data.userId
      ? meetupRecord.user_b_id
      : meetupRecord.user_a_id;

  const { data: peerPrivateProfile } = await supabase
    .from("user_private_profiles")
    .select("real_name, contact_handle")
    .eq("user_id", peerUserId)
    .maybeSingle();

  return {
    success: true,
    verified: true,
    realName: peerPrivateProfile?.real_name ?? null,
    contactHandle: peerPrivateProfile?.contact_handle ?? null,
  };
}
