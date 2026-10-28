export const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // 10MB
export const MIN_DURATION_SECONDS = 3.0;
export const MAX_DURATION_SECONDS = 90.0;

export const SUPPORTED_AUDIO_MIME_TYPES = [
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/mp4",
  "audio/x-m4a",
  "audio/mpeg",
];

export interface AudioValidationResult {
  valid: boolean;
  durationSec: number;
  format: string;
  sizeBytes: number;
  errorCode?: "TOO_SHORT" | "TOO_LONG" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_FORMAT" | "CORRUPTED_FILE";
  errorMessage?: string;
}

/**
 * Parses WAV duration directly from RIFF header.
 * Pure TypeScript / Web API without C++ bindings (Cloudflare Workers & Edge compatible).
 */
export function parseWavDuration(buffer: Uint8Array): number | null {
  if (buffer.length < 44) return null;

  // Check 'RIFF' signature (0x52494646) and 'WAVE' (0x57415645)
  const isRiff =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  const isWave =
    buffer[8] === 0x57 && buffer[9] === 0x41 && buffer[10] === 0x56 && buffer[11] === 0x45;

  if (!isRiff || !isWave) return null;

  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  let offset = 12;
  let byteRate = 0;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const chunkId = String.fromCharCode(
      buffer[offset],
      buffer[offset + 1],
      buffer[offset + 2],
      buffer[offset + 3]
    );
    const chunkSize = view.getUint32(offset + 4, true);

    if (chunkId === "fmt " && chunkSize >= 16) {
      byteRate = view.getUint32(offset + 16, true);
    } else if (chunkId === "data") {
      dataSize = chunkSize;
      break;
    }

    offset += 8 + chunkSize;
  }

  if (byteRate > 0 && dataSize > 0) {
    return dataSize / byteRate;
  }

  return null;
}

/**
 * Estimates WebM/Opus audio duration in seconds.
 * Inspects EBML Duration tag if present, or falls back to Opus bit-rate heuristic.
 */
export function parseWebmDuration(buffer: Uint8Array): number {
  if (buffer.length < 16) return 0;

  // Look for EBML Segment Info Duration element (ID: 0x4489)
  for (let i = 0; i < Math.min(buffer.length - 8, 4096); i++) {
    if (buffer[i] === 0x44 && buffer[i + 1] === 0x89) {
      const view = new DataView(buffer.buffer, buffer.byteOffset + i + 2, 8);
      // Duration is either 4-byte or 8-byte float
      const val4 = view.getFloat32(0, false);
      if (val4 > 0 && val4 < 3600000) {
        // usually in milliseconds or timecode scale
        return val4 > 1000 ? val4 / 1000 : val4;
      }
    }
  }

  // WebM Opus recording from standard browser MediaRecorder is typically ~32 kbps (4,000 bytes/sec)
  const estimatedSeconds = buffer.length / 4000;
  return Math.max(0, parseFloat(estimatedSeconds.toFixed(2)));
}

/**
 * Validates audio file headers, duration, and payload size.
 */
export function validateAudioFile(
  buffer: Uint8Array,
  mimeType: string,
  clientDurationSec?: number
): AudioValidationResult {
  const sizeBytes = buffer.length;

  if (sizeBytes > MAX_AUDIO_BYTES) {
    return {
      valid: false,
      durationSec: 0,
      format: mimeType,
      sizeBytes,
      errorCode: "PAYLOAD_TOO_LARGE",
      errorMessage: `ขนาดไฟล์เกินขีดจำกัดสูงสุด 10MB (${(sizeBytes / (1024 * 1024)).toFixed(2)} MB)`,
    };
  }

  // Normalize mime type
  const baseMime = mimeType.split(";")[0].toLowerCase().trim();
  const isSupported =
    SUPPORTED_AUDIO_MIME_TYPES.some((t) => t.startsWith(baseMime)) ||
    baseMime === "audio/webm" ||
    baseMime === "audio/wav" ||
    baseMime === "audio/ogg";

  if (!isSupported) {
    return {
      valid: false,
      durationSec: 0,
      format: mimeType,
      sizeBytes,
      errorCode: "UNSUPPORTED_FORMAT",
      errorMessage: `รูปแบบไฟล์ ${mimeType} ไม่ได้รับการสนับสนุน รองรับเฉพาะ WebM (Opus) และ WAV`,
    };
  }

  // Determine duration
  let durationSec = clientDurationSec ?? 0;

  if (baseMime.includes("wav")) {
    const parsedWav = parseWavDuration(buffer);
    if (parsedWav !== null && parsedWav > 0) {
      durationSec = parsedWav;
    }
  } else if (baseMime.includes("webm") && durationSec <= 0) {
    durationSec = parseWebmDuration(buffer);
  }

  // Fallback heuristic if duration is still uncalculated
  if (durationSec <= 0 && sizeBytes > 0) {
    durationSec = sizeBytes / 4000;
  }

  if (durationSec < MIN_DURATION_SECONDS) {
    return {
      valid: false,
      durationSec,
      format: mimeType,
      sizeBytes,
      errorCode: "TOO_SHORT",
      errorMessage: `ไฟล์เสียงสั้นเกินไป (${durationSec.toFixed(1)} วินาที) ต้องบันทึกอย่างน้อย ${MIN_DURATION_SECONDS} วินาทีขึ้นไป`,
    };
  }

  if (durationSec > MAX_DURATION_SECONDS) {
    return {
      valid: false,
      durationSec,
      format: mimeType,
      sizeBytes,
      errorCode: "TOO_LONG",
      errorMessage: `ไฟล์เสียงยาวเกินไป (${durationSec.toFixed(1)} วินาที) สูงสุดไม่เกิน ${MAX_DURATION_SECONDS} วินาที`,
    };
  }

  return {
    valid: true,
    durationSec: parseFloat(durationSec.toFixed(2)),
    format: mimeType,
    sizeBytes,
  };
}
