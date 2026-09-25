import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateAudioUpload,
  sanitizeStorageFilename,
  buildSpeakingStoragePath,
  getPublicAudioUrl,
  MAX_AUDIO_FILE_SIZE_BYTES,
  STORAGE_BUCKETS,
} from '../lib/storage/audio';

// Mock Supabase service role client
vi.mock('../api/_lib/supabase/client', () => {
  const mockUpload = vi.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null });
  const mockCreateSignedUrl = vi.fn().mockResolvedValue({
    data: { signedUrl: 'https://test.supabase.co/storage/v1/object/sign/audio-speaking-submissions/test.webm?token=abc' },
    error: null,
  });
  const mockSelect = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({
        data: {
          id: '11111111-2222-3333-4444-555555555555',
          title_en: 'Introductory Conversation',
          audio_path: 'exercises/a1_intro.mp3',
          duration_seconds: 45,
        },
        error: null,
      }),
    }),
  });

  const mockStorageFrom = vi.fn().mockReturnValue({
    upload: mockUpload,
    createSignedUrl: mockCreateSignedUrl,
  });

  return {
    createServiceRoleClient: vi.fn().mockReturnValue({
      storage: { from: mockStorageFrom },
      from: vi.fn().mockReturnValue({ select: mockSelect }),
    }),
  };
});

describe('Phase 5.5: Storage Audio Helper & Validation Suite', () => {
  describe('validateAudioUpload', () => {
    it('should approve valid audio/webm within size limit', () => {
      const res = validateAudioUpload({
        size: 1024 * 500, // 500 KB
        type: 'audio/webm',
      });
      expect(res.valid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it('should approve valid audio/mpeg (mp3) within size limit', () => {
      const res = validateAudioUpload({
        size: 1024 * 1024 * 3, // 3 MB
        type: 'audio/mpeg',
      });
      expect(res.valid).toBe(true);
    });

    it('should approve valid audio/wav within size limit', () => {
      const res = validateAudioUpload({
        size: 1024 * 1024 * 8, // 8 MB
        type: 'audio/wav',
      });
      expect(res.valid).toBe(true);
    });

    it('should reject file exceeding 10MB limit', () => {
      const res = validateAudioUpload({
        size: MAX_AUDIO_FILE_SIZE_BYTES + 1,
        type: 'audio/webm',
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds the 10MB limit');
    });

    it('should reject 0-byte empty file', () => {
      const res = validateAudioUpload({
        size: 0,
        type: 'audio/webm',
      });
      expect(res.valid).toBe(false);
      expect(res.error).toContain('cannot be empty');
    });

    it('should reject non-audio MIME types (e.g. image, executable, script)', () => {
      const invalidTypes = [
        'image/png',
        'application/pdf',
        'text/html',
        'application/javascript',
        'video/mp4',
      ];
      for (const t of invalidTypes) {
        const res = validateAudioUpload({ size: 1024, type: t });
        expect(res.valid).toBe(false);
        expect(res.error).toContain('Unsupported audio format');
      }
    });

    it('should handle MIME types with codec parameters', () => {
      const res = validateAudioUpload({
        size: 1024 * 100,
        type: 'audio/webm; codecs=opus',
      });
      expect(res.valid).toBe(true);
    });
  });

  describe('sanitizeStorageFilename', () => {
    it('should neutralize directory traversal sequences', () => {
      const sanitized = sanitizeStorageFilename('../../etc/passwd');
      expect(sanitized).not.toContain('..');
      expect(sanitized).toBe('etc_passwd');
    });

    it('should strip special characters and retain alphanumeric with dots and dashes', () => {
      const sanitized = sanitizeStorageFilename('recording#1@user$.mp3');
      expect(sanitized).toBe('recording_1_user_.mp3');
    });
  });

  describe('buildSpeakingStoragePath', () => {
    it('should construct isolated path under the user ID prefix', () => {
      const userId = 'user-uuid-123';
      const promptId = 'prompt-uuid-456';
      const attemptId = 'attempt-uuid-789';

      const path = buildSpeakingStoragePath(userId, promptId, attemptId, 'webm');
      expect(path.startsWith('user-uuid-123/')).toBe(true);
      expect(path).toContain('prompt-uuid-456_attempt-uuid-789_');
      expect(path.endsWith('.webm')).toBe(true);
    });

    it('should sanitize user ID and prevent directory escaping', () => {
      const maliciousUserId = '../evil_user';
      const path = buildSpeakingStoragePath(maliciousUserId, 'p1', 'a1', 'webm');
      expect(path.startsWith('evil_user/')).toBe(true);
      expect(path).not.toContain('..');
    });
  });

  describe('getPublicAudioUrl', () => {
    it('should construct correct public CDN URL format', () => {
      const url = getPublicAudioUrl(
        'https://atmatooytieelwiarffp.supabase.co/',
        STORAGE_BUCKETS.LISTENING,
        '/exercises/a2_test.mp3'
      );
      expect(url).toBe(
        'https://atmatooytieelwiarffp.supabase.co/storage/v1/object/public/audio-listening/exercises/a2_test.mp3'
      );
    });
  });
});
