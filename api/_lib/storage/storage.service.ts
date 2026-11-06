import { createServiceRoleClient, createPublicServerClient } from '../supabase/client';
import { STORAGE_BUCKETS, type StorageBucketType, type PresignedUploadResult } from './types';
import { AppError } from '../errors/api-error';
import { ErrorCode } from '../errors/error-codes';
import { logger } from '../logger';

export class StorageService {
  /**
   * Generates a presigned upload URL for direct browser-to-bucket upload.
   * Speaking audio files (5-10MB) must NEVER pass through Vercel serverless memory.
   */
  public async createPresignedUploadUrl(
    bucket: StorageBucketType,
    storagePath: string,
    expiresInSeconds = 900 // 15 minutes default
  ): Promise<PresignedUploadResult> {
    try {
      const supabase = createServiceRoleClient();
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(storagePath);

      if (error || !data) {
        throw new AppError(
          500,
          ErrorCode.STORAGE_ERROR,
          `Failed to create signed upload URL: ${error?.message || 'Unknown storage error'}`
        );
      }

      return {
        uploadUrl: data.signedUrl,
        storagePath,
        expiresInSeconds,
      };
    } catch (err) {
      logger.error('Storage presigned URL generation failed', err, { bucket, storagePath });
      throw err;
    }
  }

  /**
   * Generates a public CDN URL for listening exercises audio.
   */
  public getPublicAudioUrl(storagePath: string): string {
    const supabase = createPublicServerClient();
    if (!supabase) {
      return storagePath.startsWith('http') ? storagePath : `/audio/${storagePath}`;
    }
    const { data } = supabase.storage
      .from(STORAGE_BUCKETS.LISTENING_AUDIO)
      .getPublicUrl(storagePath);

    return data.publicUrl;
  }

  /**
   * Generates a presigned read URL with expiration for private student speaking submissions.
   */
  public async createPresignedDownloadUrl(
    storagePath: string,
    expiresInSeconds = 300 // 5 minutes default
  ): Promise<string> {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.SPEAKING_SUBMISSIONS)
      .createSignedUrl(storagePath, expiresInSeconds);

    if (error || !data) {
      throw new AppError(
        500,
        ErrorCode.STORAGE_ERROR,
        `Failed to create signed download URL: ${error?.message}`
      );
    }

    return data.signedUrl;
  }

  /**
   * Constructs the canonical storage path for student speaking audio submissions:
   * Format: user/{userId}/attempt/${attemptId}/part_{part}.webm
   */
  public buildSpeakingSubmissionPath(userId: string, attemptId: string, part: number): string {
    return `user/${userId}/attempt/${attemptId}/part_${part}.webm`;
  }

  /**
   * Constructs the canonical storage path for static listening exercises:
   * Format: exercises/{exerciseId}.mp3
   */
  public buildListeningAudioPath(exerciseId: string): string {
    return `exercises/${exerciseId}.mp3`;
  }
}

export const storageService = new StorageService();
