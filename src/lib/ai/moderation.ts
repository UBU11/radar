import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { MarketModerationSchema, type MarketModerationOutput } from "@/types/moderation";

export async function moderateMarketIdea(rawSubmission: string): Promise<MarketModerationOutput> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    // ponytail: fallback mock during local test when Mistral key is not set
    return {
      title: rawSubmission.slice(0, 100),
      category: "Campus",
      resolution_criteria: "Campus registrar or official athletic board verification.",
      expiry_date: new Date(Date.now() + 86400000 * 7).toISOString(),
      is_appropriate: true,
    };
  }

  const { object } = await generateObject({
    model: mistral("mistral-large-latest"),
    schema: MarketModerationSchema,
    prompt: `You are a compliance moderator for "Radar", an on-campus prediction market.
Analyze the following student-submitted market idea:
"${rawSubmission}"

Enforce the following guidelines:
1. Rephrase into a crisp, objective question format if necessary.
2. Formulate objective, clear resolution criteria that do not leave room for ambiguity.
3. Mark is_appropriate as false if the market involves harassment, private personal harm, illegal acts, or campus violence.
4. Set an expiry_date within 30 days formatted as ISO-8601.`,
  });

  return object;
}
