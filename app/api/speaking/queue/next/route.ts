import { NextRequest, NextResponse } from "next/server";
import {
  initPracticeQueueState,
  popNextPracticeSentence,
} from "@/lib/speaking/queue-engine";
import { CEFRLevel, PracticeQueueState, SpeakingMode } from "@/lib/speaking/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cefrLevel = (body.cefrLevel as CEFRLevel) || "B1";
    const topic = body.topic || "all";
    const mode = (body.mode as SpeakingMode) || "read_aloud";
    const currentState = body.currentState as PracticeQueueState | undefined;

    const stateToUse =
      currentState &&
      currentState.cefrLevel === cefrLevel &&
      currentState.topic === topic &&
      currentState.mode === mode
        ? currentState
        : initPracticeQueueState(cefrLevel, topic, mode);

    const result = popNextPracticeSentence(stateToUse);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: err?.message || "Failed to pop next sentence from queue",
        },
      },
      { status: 500 }
    );
  }
}
