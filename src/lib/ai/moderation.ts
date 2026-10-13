import { groq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { MarketModerationSchema, type MarketModerationOutput } from "@/types/moderation";

export async function moderateMarketIdea(rawSubmission: string): Promise<MarketModerationOutput> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const now = new Date();
  const currentIsoTimestamp = now.toISOString();
  const campusTimezone = "Asia/Kolkata";

  if (!groqApiKey) {
    // ponytail: deterministic mock fallback for offline local dev when GROQ_API_KEY is unset
    return {
      title: rawSubmission.slice(0, 100),
      category: "Campus",
      resolution_criteria: "Campus registrar or official athletic board verification.",
      expiry_date: new Date(now.getTime() + 86400000 * 7).toISOString(),
      is_safe: true,
    };
  }

  const { object } = await generateObject({
    model: groq("llama-3.3-70b-versatile"),
    schema: MarketModerationSchema,
    prompt: `You are a compliance moderator and market structuring agent for "Radar", an on-campus prediction market.
Current Server Timestamp: ${currentIsoTimestamp}
Campus Timezone: ${campusTimezone}

Analyze the following student-submitted market idea:
"${rawSubmission}"

Enforce the following guardrails:
1. Rephrase into a crisp, objective question format if necessary.
2. Formulate objective, clear resolution criteria that leave no room for ambiguity.
3. Calculate expiry_date relative to ${currentIsoTimestamp} in ${campusTimezone}. It MUST be in the future (expiry_date > ${currentIsoTimestamp}) and within 30 days, formatted as ISO-8601.
4. Mark is_safe as false if the market involves harassment, private personal harm, illegal acts, or campus violence, and populate rejection_reason.`,
  });

  const parsedExpiry = new Date(object.expiry_date).getTime();
  const isFutureDate = !isNaN(parsedExpiry) && parsedExpiry > now.getTime();

  return {
    ...object,
    is_safe: object.is_safe && isFutureDate,
    rejection_reason:
      !isFutureDate && object.is_safe
        ? "Computed expiry date must be in the future."
        : object.rejection_reason,
  };
}
