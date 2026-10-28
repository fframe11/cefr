import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { evaluateEssay, EssayEvaluationError } from "@/lib/writing/evaluator";
import { CEFRBand } from "@/lib/writing/types";

export const runtime = "edge";

const WritingEvaluateSchema = z.object({
  prompt_id: z.string().min(1, "prompt_id is required"),
  essay_type: z.enum(["essay", "letter", "report", "article", "review"]).optional(),
  target_cefr: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]),
  submission_text: z.string().min(1, "submission_text is required"),
  min_words: z.number().int().positive().optional(),
  max_words: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Validate Content-Type
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Content-Type must be application/json",
          },
        },
        { status: 400 }
      );
    }

    // 2. Parse & Validate Payload
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Invalid or empty JSON body",
          },
        },
        { status: 400 }
      );
    }

    const parseResult = WritingEvaluateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const payload = parseResult.data;

    // 3. Evaluate Essay using the AES NLP Engine
    const evaluation = evaluateEssay({
      prompt_id: payload.prompt_id,
      essay_type: payload.essay_type,
      target_cefr: payload.target_cefr as CEFRBand,
      submission_text: payload.submission_text,
      min_words: payload.min_words,
      max_words: payload.max_words,
    });

    // 4. Return 200 OK Response matching the Notion specification contract
    return NextResponse.json(
      {
        success: true,
        data: evaluation,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    if (err instanceof EssayEvaluationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: err.code === "TOO_SHORT" ? "WORD_COUNT_TOO_LOW" : "BAD_REQUEST",
            message: err.message,
          },
        },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "Unexpected evaluation failure";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      },
      { status: 500 }
    );
  }
}
