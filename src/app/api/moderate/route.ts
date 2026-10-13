import { NextResponse } from "next/server";
import { z } from "zod";
import { moderateMarketIdea } from "@/lib/ai/moderation";

const ModerateRequestSchema = z.object({
  submission: z.string().min(5, "Submission prompt is too short").max(500),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parseResult = ModerateRequestSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const moderated = await moderateMarketIdea(parseResult.data.submission);
    return NextResponse.json(moderated);
  } catch (error) {
    return NextResponse.json(
      { error: "Moderation pipeline failed", message: (error as Error).message },
      { status: 500 }
    );
  }
}
