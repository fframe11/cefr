import { NextRequest, NextResponse } from "next/server";
import { getSentencesByFilter, getAvailableTopics } from "@/lib/speaking/sentence-bank";
import { CEFRLevel, SpeakingMode } from "@/lib/speaking/types";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cefr = (searchParams.get("cefr") as CEFRLevel) || undefined;
    const topic = searchParams.get("topic") || undefined;
    const mode = (searchParams.get("mode") as SpeakingMode) || undefined;

    const sentences = getSentencesByFilter({
      cefrLevel: cefr,
      topic,
      mode,
    });

    const topics = getAvailableTopics(cefr);

    return NextResponse.json(
      {
        success: true,
        data: {
          total: sentences.length,
          sentences,
          topics,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, s-maxage=300",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: err?.message || "Failed to retrieve speaking sentences",
        },
      },
      { status: 500 }
    );
  }
}
