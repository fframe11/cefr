import { describe, it, expect } from "vitest";
import {
  validateAudioFile,
  parseWavDuration,
  parseWebmDuration,
  MAX_AUDIO_BYTES,
  MIN_DURATION_SECONDS,
} from "@/lib/speaking/audio";

describe("Audio Format & Duration Validation", () => {
  // Helper to create synthetic WAV header for testing
  function createSyntheticWav(sampleRate: number, channels: number, bitsPerSample: number, durationSec: number): Uint8Array {
    const byteRate = (sampleRate * channels * bitsPerSample) / 8;
    const dataSize = Math.floor(byteRate * durationSec);
    const buffer = new Uint8Array(44 + dataSize);
    const view = new DataView(buffer.buffer);

    // 'RIFF'
    buffer[0] = 0x52; buffer[1] = 0x49; buffer[2] = 0x46; buffer[3] = 0x46;
    view.setUint32(4, 36 + dataSize, true);
    // 'WAVE'
    buffer[8] = 0x57; buffer[9] = 0x41; buffer[10] = 0x56; buffer[11] = 0x45;
    // 'fmt '
    buffer[12] = 0x66; buffer[13] = 0x6d; buffer[14] = 0x74; buffer[15] = 0x20;
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, (channels * bitsPerSample) / 8, true);
    view.setUint16(34, bitsPerSample, true);
    // 'data'
    buffer[36] = 0x64; buffer[37] = 0x61; buffer[38] = 0x74; buffer[39] = 0x61;
    view.setUint32(40, dataSize, true);

    return buffer;
  }

  it("parses WAV audio duration accurately from RIFF header", () => {
    // 16 kHz, 1 channel (Mono), 16-bit, 5.0 seconds
    const wav = createSyntheticWav(16000, 1, 16, 5.0);
    const duration = parseWavDuration(wav);

    expect(duration).not.toBeNull();
    expect(duration).toBeCloseTo(5.0, 1);
  });

  it("rejects files exceeding 10MB limit with PAYLOAD_TOO_LARGE", () => {
    const hugeBuffer = new Uint8Array(MAX_AUDIO_BYTES + 1024);
    const result = validateAudioFile(hugeBuffer, "audio/webm", 10);

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("PAYLOAD_TOO_LARGE");
    expect(result.errorMessage).toContain("10MB");
  });

  it("rejects audio shorter than 3 seconds with TOO_SHORT error", () => {
    // 16 kHz Mono, 2.0 seconds
    const shortWav = createSyntheticWav(16000, 1, 16, 2.0);
    const result = validateAudioFile(shortWav, "audio/wav", 2.0);

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("TOO_SHORT");
    expect(result.durationSec).toBeLessThan(MIN_DURATION_SECONDS);
  });

  it("accepts valid 16 kHz Mono audio >= 3 seconds", () => {
    // 16 kHz Mono, 4.5 seconds
    const validWav = createSyntheticWav(16000, 1, 16, 4.5);
    const result = validateAudioFile(validWav, "audio/wav");

    expect(result.valid).toBe(true);
    expect(result.durationSec).toBeCloseTo(4.5, 1);
  });

  it("rejects unsupported MIME types", () => {
    const buffer = new Uint8Array(5000);
    const result = validateAudioFile(buffer, "application/pdf", 5);

    expect(result.valid).toBe(false);
    expect(result.errorCode).toBe("UNSUPPORTED_FORMAT");
  });

  it("estimates WebM duration appropriately without native binary", () => {
    // 20,000 bytes at ~4000 bytes/sec should estimate to ~5 seconds
    const mockWebm = new Uint8Array(20000);
    const estimated = parseWebmDuration(mockWebm);

    expect(estimated).toBeGreaterThanOrEqual(4);
    expect(estimated).toBeLessThanOrEqual(6);
  });
});
