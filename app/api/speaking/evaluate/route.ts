import { NextRequest, NextResponse } from "next/server";
import { validateAudioFile, MAX_AUDIO_BYTES } from "@/lib/speaking/audio";
import { evaluateSpeech } from "@/lib/speaking/evaluator";
import { CEFRLevel, SpeakingMode } from "@/lib/speaking/types";

export const runtime = "edge";

// In-memory sliding window rate limiter for edge runtime (e.g. 60 requests per hour per user/IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization Guard
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Missing or invalid Authorization header (Bearer token required)",
          },
        },
        { status: 401 }
      );
    }

    const sessionToken = authHeader.substring(7).trim();
    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication token is empty",
          },
        },
        { status: 401 }
      );
    }

    // 2. Rate Limiting Check
    const clientIdentifier = sessionToken.slice(-10) || req.headers.get("x-forwarded-for") || "default_client";
    if (!checkRateLimit(clientIdentifier)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TOO_MANY_REQUESTS",
            message: "เรียกใช้งานเกินโควตาต่อชั่วโมง กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
          },
        },
        { status: 429 }
      );
    }

    // 3. Payload Content-Type & Size validation
    const contentType = req.headers.get("content-type");
    if (contentType && !contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Content-Type must be multipart/form-data",
          },
        },
        { status: 400 }
      );
    }

    const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
    if (contentLength > MAX_AUDIO_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PAYLOAD_TOO_LARGE",
            message: "ขนาดไฟล์เสียงเกิน 10MB",
          },
        },
        { status: 413 }
      );
    }

    // 4. Parse FormData
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const promptId = formData.get("prompt_id") as string | null;
    const referenceText = formData.get("reference_text") as string | null;
    const targetCefr = formData.get("target_cefr") as CEFRLevel | null;
    const clientDurationStr = formData.get("duration_sec") as string | null;
    const clientDuration = clientDurationStr ? parseFloat(clientDurationStr) : undefined;
    const userTranscript = (formData.get("user_transcript") as string | null) ?? undefined;
    const volumeRmsStr = formData.get("volume_rms") as string | null;
    const silenceRatioStr = formData.get("silence_ratio") as string | null;
    const pitchVarianceStr = formData.get("pitch_variance") as string | null;
    const mode = (formData.get("mode") as SpeakingMode | null) || "read_aloud";
    const targetKeywordsRaw = formData.get("target_keywords") as string | null;
    const targetKeywords = targetKeywordsRaw ? targetKeywordsRaw.split(",").map(k => k.trim()) : [];

    const acousticMetrics = {
      volume_rms: volumeRmsStr ? parseFloat(volumeRmsStr) : undefined,
      silence_ratio: silenceRatioStr ? parseFloat(silenceRatioStr) : undefined,
      pitch_variance: pitchVarianceStr ? parseFloat(pitchVarianceStr) : undefined,
    };

    // Validate presence of required fields
    if (!audioFile || !promptId || !referenceText || !targetCefr) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Missing required fields: audio, prompt_id, reference_text, target_cefr",
          },
        },
        { status: 400 }
      );
    }

    // 5. Audio Buffer & Format Validation
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = new Uint8Array(arrayBuffer);

    const validation = validateAudioFile(audioBuffer, audioFile.type || "audio/webm", clientDuration);
    if (!validation.valid) {
      const isPayloadTooLarge = validation.errorCode === "PAYLOAD_TOO_LARGE";
      return NextResponse.json(
        {
          success: false,
          error: {
            code: isPayloadTooLarge ? "PAYLOAD_TOO_LARGE" : "BAD_REQUEST",
            message: validation.errorMessage || "ไฟล์เสียงไม่ผ่านการตรวจสอบ",
            details: {
              duration: validation.durationSec,
              format: validation.format,
              size: validation.sizeBytes,
            },
          },
        },
        { status: isPayloadTooLarge ? 413 : 400 }
      );
    }

    // 6. Call Python Pronunciation Inference Service (if running)
    let externalPronunciationResult: any = undefined;
    try {
      const pythonServiceUrl = process.env.PRONUNCIATION_SERVICE_URL || "http://127.0.0.1:8000/v1/assess";
      const pyFormData = new FormData();
      pyFormData.append("audio", new Blob([audioBuffer], { type: audioFile.type || "audio/wav" }), "audio.wav");
      pyFormData.append("reference_text", referenceText);

      const controller = new AbortController();
      const timeoutMs = parseInt(process.env.PRONUNCIATION_TIMEOUT_MS || "8000", 10);
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const pyRes = await fetch(pythonServiceUrl, {
        method: "POST",
        body: pyFormData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (pyRes.ok) {
        externalPronunciationResult = await pyRes.json();
      }
    } catch {
      // Python inference service offline or timed out; evaluateSpeech handles benchmark status
    }

    // 7. Run Evaluation Engine
    const evaluation = await evaluateSpeech({
      audioBuffer,
      referenceText,
      targetCefr,
      promptId,
      clientDurationSec: validation.durationSec,
      userTranscript,
      acousticMetrics,
      externalPronunciationResult,
      mode,
      targetKeywords,
    });

    // 7. Return 200 OK Response matching the exact Notion specification contract
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
