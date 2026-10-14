import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const SyncMutationSchema = z.object({
  table: z.enum(["market_messages", "meetups", "meetup_messages"]),
  op: z.enum(["PUT", "PATCH", "DELETE"]),
  mutationRecord: z.record(z.unknown()),
  flushedAt: z.string().optional(),
});

export async function POST(request: Request) {
  const jsonPayload = await request.json().catch(() => null);
  const parseResult = SyncMutationSchema.safeParse(jsonPayload);

  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid sync mutation payload", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const { table, op, mutationRecord } = parseResult.data;
  const supabase = await createClient();

  if (table === "market_messages" && op === "PUT") {
    const { error: insertError } = await supabase
      .from("market_messages")
      .upsert(mutationRecord as never, { onConflict: "idempotency_key" });

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  if (table === "meetups" && (op === "PATCH" || op === "PUT")) {
    const meetupId = mutationRecord.id as string | undefined;
    if (!meetupId) {
      return NextResponse.json({ error: "Missing meetup ID" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("meetups")
      .update(mutationRecord as never)
      .eq("id", meetupId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  if (table === "meetup_messages" && op === "PUT") {
    const { error: insertError } = await supabase
      .from("meetup_messages")
      .insert(mutationRecord as never);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, table, op });
}
