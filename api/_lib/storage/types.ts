export const STORAGE_BUCKETS = {
  LISTENING_AUDIO: 'audio-listening',
  SPEAKING_SUBMISSIONS: 'audio-speaking-submissions',
} as const;

export type StorageBucketType = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface PresignedUploadResult {
  uploadUrl: string;
  storagePath: string;
  expiresInSeconds: number;
}
