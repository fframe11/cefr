// @vitest-environment node
import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/speaking/evaluate/route";
import { NextRequest } from "next/server";

describe("POST /api/speaking/evaluate Route Handler", () => {
  it("returns 401 UNAUTHORIZED when Authorization header is missing", async () => {
    const req = new NextRequest(
      new Request("http://localhost:3000/api/speaking/evaluate", {
        method: "POST",
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 BAD_REQUEST when Content-Type is not multipart/form-data", async () => {
    const req = new NextRequest(
      new Request("http://localhost:3000/api/speaking/evaluate", {
        method: "POST",
        headers: {
          authorization: "Bearer valid_test_token",
          "content-type": "application/json",
        },
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("returns 400 BAD_REQUEST when required form fields are missing", async () => {
    const formData = new FormData();
    formData.append("prompt_id", "p001");
    // Missing audio, reference_text, target_cefr

    const req = new NextRequest(
      new Request("http://localhost:3000/api/speaking/evaluate", {
        method: "POST",
        headers: {
          authorization: "Bearer valid_test_token",
        },
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("returns 400 BAD_REQUEST when audio is too short (< 3 seconds)", async () => {
    // 16 kHz Mono, 1.5 seconds dummy data
    const shortAudioBytes = new Uint8Array(16000 * 2 * 1.5);
    const blob = new Blob([shortAudioBytes], { type: "audio/webm" });

    const formData = new FormData();
    formData.append("audio", blob, "test_short.webm");
    formData.append("prompt_id", "p001");
    formData.append("reference_text", "I enjoy studying English.");
    formData.append("target_cefr", "B2");
    formData.append("duration_sec", "1.5");

    const req = new NextRequest(
      new Request("http://localhost:3000/api/speaking/evaluate", {
        method: "POST",
        headers: {
          authorization: "Bearer valid_test_token",
        },
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
    expect(json.error.message).toContain("สั้นเกินไป");
  });

  it("evaluates successfully with 200 OK and valid Notion response contract", async () => {
    // 16 kHz Mono, 5 seconds dummy data
    const validAudioBytes = new Uint8Array(16000 * 2 * 5);
    const blob = new Blob([validAudioBytes], { type: "audio/webm" });

    const formData = new FormData();
    formData.append("audio", blob, "test_valid.webm");
    formData.append("prompt_id", "p001");
    formData.append(
      "reference_text",
      "I enjoy studying English because it helps me communicate globally."
    );
    formData.append("target_cefr", "B2");
    formData.append("duration_sec", "5.0");

    const req = new NextRequest(
      new Request("http://localhost:3000/api/speaking/evaluate", {
        method: "POST",
        headers: {
          authorization: "Bearer valid_test_token_success",
        },
        body: formData,
      })
    );

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.attempt_id).toMatch(/^spk_/);
    expect(json.data.completeness_score).toBeGreaterThan(0);
    expect(json.data.pronunciation_result).toBeDefined();
    expect(["scored", "not_ready", "abstained"]).toContain(
      json.data.pronunciation_result.status
    );
    expect(json.data.words_analysis.length).toBeGreaterThan(0);
    expect(json.data.feedback_th).toBeDefined();
  });
});
