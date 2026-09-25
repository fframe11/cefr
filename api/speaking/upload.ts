import { z } from 'zod';
import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { validateBody } from '../_lib/validation/validator';
import { BadRequestError, UnauthorizedError } from '../_lib/errors/api-error';
import {
  validateAudioUpload,
  buildSpeakingStoragePath,
  STORAGE_BUCKETS,
  ALLOWED_AUDIO_MIME_TYPES,
} from '../../lib/storage/audio';

export const speakingUploadSchema = z.object({
  prompt_id: z.string().uuid('Invalid prompt ID'),
  attempt_id: z.string().uuid('Invalid attempt ID'),
  audio_base64: z.string().min(1, 'Audio payload is required'),
  mime_type: z.enum(ALLOWED_AUDIO_MIME_TYPES as unknown as [string, ...string[]]),
  file_name: z.string().optional(),
});

export default createApiHandler(
  async ({ req, user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to upload speaking recordings.');
    }

    const body = validateBody(speakingUploadSchema, req.body);

    // Decode base64 to buffer to verify size
    const buffer = Buffer.from(body.audio_base64, 'base64');
    const validation = validateAudioUpload({
      size: buffer.byteLength,
      type: body.mime_type,
    });

    if (!validation.valid) {
      throw new BadRequestError(validation.error || 'Invalid audio upload.');
    }

    // Determine extension from mime type
    const extMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/ogg': 'ogg',
      'audio/mp4': 'mp4',
      'audio/x-m4a': 'm4a',
    };
    const extension = extMap[body.mime_type] || 'webm';

    // Build secure storage path: {userId}/{promptId}_{attemptId}_{timestamp}.{ext}
    const storagePath = buildSpeakingStoragePath(user.id, body.prompt_id, body.attempt_id, extension);

    const supabase = createServiceRoleClient();
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.SPEAKING_SUBMISSIONS)
      .upload(storagePath, buffer, {
        contentType: body.mime_type,
        upsert: true,
      });

    if (uploadError) {
      throw new BadRequestError(`Storage upload failed: ${uploadError.message}`);
    }

    // Create a 1-hour signed URL for playback
    const { data: signedData } = await supabase.storage
      .from(STORAGE_BUCKETS.SPEAKING_SUBMISSIONS)
      .createSignedUrl(storagePath, 3600);

    return {
      storage_path: storagePath,
      bucket: STORAGE_BUCKETS.SPEAKING_SUBMISSIONS,
      signed_url: signedData?.signedUrl || null,
      size_bytes: buffer.byteLength,
      mime_type: body.mime_type,
    };
  },
  {
    allowedMethods: ['POST'],
    requireAuth: true,
  }
);
