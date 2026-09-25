/**
 * Audio Storage Helper Module
 * Provides path generation, MIME validation, and URL construction for Supabase Storage.
 */

export const ALLOWED_AUDIO_MIME_TYPES = [
  'audio/webm',
  'audio/wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
] as const;

export type AllowedAudioMimeType = typeof ALLOWED_AUDIO_MIME_TYPES[number];

export const MAX_AUDIO_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export const STORAGE_BUCKETS = {
  LISTENING: 'audio-listening',
  SPEAKING_SUBMISSIONS: 'audio-speaking-submissions',
} as const;

/**
 * Validates audio file upload metadata (MIME type and byte size).
 */
export function validateAudioUpload(file: {
  size: number;
  type: string;
}): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'File is required' };
  }

  if (file.size <= 0) {
    return { valid: false, error: 'File cannot be empty' };
  }

  if (file.size > MAX_AUDIO_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`,
    };
  }

  const normalizedType = file.type.toLowerCase().split(';')[0].trim();
  if (!ALLOWED_AUDIO_MIME_TYPES.includes(normalizedType as AllowedAudioMimeType)) {
    return {
      valid: false,
      error: `Unsupported audio format: ${file.type}. Allowed formats: webm, wav, mp3, ogg, mp4`,
    };
  }

  return { valid: true };
}

/**
 * Sanitizes a filename to prevent directory traversal or malicious injection.
 */
export function sanitizeStorageFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '_')
    .replace(/^_+/, '');
}

/**
 * Constructs a secure storage path for student speaking submissions.
 * Pattern: {userId}/{promptId}_{attemptId}_{timestamp}.{ext}
 */
export function buildSpeakingStoragePath(
  userId: string,
  promptId: string,
  attemptId: string,
  extension: string = 'webm'
): string {
  const cleanUserId = sanitizeStorageFilename(userId);
  const cleanPromptId = sanitizeStorageFilename(promptId);
  const cleanAttemptId = sanitizeStorageFilename(attemptId);
  const cleanExt = sanitizeStorageFilename(extension).replace(/^\./, '');
  const timestamp = Date.now();

  return `${cleanUserId}/${cleanPromptId}_${cleanAttemptId}_${timestamp}.${cleanExt}`;
}

/**
 * Generates a public CDN URL for public assets in Supabase Storage.
 */
export function getPublicAudioUrl(
  supabaseUrl: string,
  bucket: string,
  storagePath: string
): string {
  const cleanPath = storagePath.replace(/^\/+/, '');
  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
