import { groq } from "@ai-sdk/groq";
import { mistral } from "@ai-sdk/mistral";
import { generateObject } from "ai";
import { MarketModerationSchema, type MarketModerationOutput } from "@/types/moderation";

export async function moderateMarketIdea(rawSubmission: string): Promise<MarketModerationOutput> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const mistralApiKey = process.env.MISTRAL_API_KEY;

  if (!groqApiKey && !mistralApiKey) {
    // ponytail: fallback mock for local dev when neither Groq nor Mistral API key is set
    return {
      title: rawSubmission.slice(0, 100),
      category: "Campus",
      resolution_criteria: "Campus registrar or official athletic board verification.",
      expiry_date: new Date(Date.now() + 86400000 * 7).toISOString(),
      is_appropriate: true,
    };
  }

  const model = groqApiKey
    ? groq("llama-3.3-70b-versatile")
    : mistral("mistral-large-latest");

  const { object } = await generateObject({
    model,
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
