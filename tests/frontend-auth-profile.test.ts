import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '../src/lib/api/client';
import { ApiError } from '../src/lib/api/types';
import { getMe } from '../src/lib/api/auth';
import { getProfile, updateProfile } from '../src/lib/api/profile';
import { supabase } from '../src/lib/supabaseClient';
import * as fs from 'fs';
import * as path from 'path';

// Mock Supabase Auth
vi.mock('../src/lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: {
            subscription: {
              unsubscribe: vi.fn(),
            },
          },
        })),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

describe('Phase 4.8A: Frontend API Client + Auth + Profile Foundation', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('1. Standardized API Client (src/lib/api/client.ts)', () => {
    it('should successfully execute GET and unwrap ApiResponse.data', async () => {
      const mockData = { id: 'test-123', name: 'CEFR Assessment' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockData }),
      });

      (supabase.auth.getSession as any).mockResolvedValue({
        data: { session: null },
      });

      const client = new ApiClient();
      const result = await client.get('/api/test');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should attach Supabase Bearer token when an active session exists', async () => {
      const mockToken = 'mock-supabase-jwt-token-xyz';
      (supabase.auth.getSession as any).mockResolvedValue({
        data: {
          session: {
            access_token: mockToken,
          },
        },
      });

      let capturedHeaders: Headers | undefined;
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        capturedHeaders = init?.headers;
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ success: true, data: { ok: true } }),
        });
      });

      const client = new ApiClient();
      await client.get('/api/auth/me');

      expect(capturedHeaders).toBeDefined();
      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(capturedHeaders?.get('Accept')).toBe('application/json');
    });

    it('should not attach Authorization header when skipAuth is true', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({
        data: {
          session: {
            access_token: 'should-not-attach',
          },
        },
      });

      let capturedHeaders: Headers | undefined;
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        capturedHeaders = init?.headers;
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ success: true, data: { status: 'public' } }),
        });
      });

      const client = new ApiClient();
      await client.get('/api/public/data', { skipAuth: true });

      expect(capturedHeaders?.get('Authorization')).toBeNull();
    });

    it('should correctly format POST request with JSON stringified body and Content-Type header', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });

      let capturedBody: any;
      let capturedContentType: string | null = null;
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        capturedBody = init?.body;
        capturedContentType = init?.headers?.get('Content-Type');
        return Promise.resolve({
          ok: true,
          status: 201,
          text: async () => JSON.stringify({ success: true, data: { id: 'created' } }),
        });
      });

      const client = new ApiClient();
      const payload = { target_exam: 'B2_FIRST', daily_goal_minutes: 30 };
      await client.post('/api/user/profile', payload);

      expect(capturedBody).toBe(JSON.stringify(payload));
      expect(capturedContentType).toBe('application/json');
    });

    it('should support PUT, PATCH, and DELETE helper methods', async () => {
      (supabase.auth.getSession as any).mockResolvedValue({ data: { session: null } });
      const calls: { method?: string; url?: string }[] = [];

      global.fetch = vi.fn().mockImplementation((url, init) => {
        calls.push({ method: init?.method, url: String(url) });
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ success: true, data: {} }),
        });
      });

      const client = new ApiClient();
      await client.put('/api/item', { a: 1 });
      await client.patch('/api/item', { b: 2 });
      await client.delete('/api/item');

      expect(calls[0]).toEqual({ method: 'PUT', url: '/api/item' });
      expect(calls[1]).toEqual({ method: 'PATCH', url: '/api/item' });
      expect(calls[2]).toEqual({ method: 'DELETE', url: '/api/item' });
    });

    it('should throw ApiError with status and parsed server error details on 400 Bad Request', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid daily_goal_minutes',
              details: [{ path: ['daily_goal_minutes'], message: 'Must be >= 5' }],
            },
          }),
      });

      const client = new ApiClient();
      await expect(client.get('/api/test')).rejects.toThrow(ApiError);

      try {
        await client.get('/api/test');
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(400);
        expect(err.code).toBe('VALIDATION_ERROR');
        expect(err.message).toBe('Invalid daily_goal_minutes');
        expect(err.details).toBeDefined();
        expect(err.friendlyMessage).toBe('ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง');
      }
    });

    it('should throw ApiError on 401 Unauthorized with Thai friendly message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'Invalid or missing Bearer token',
            },
          }),
      });

      const client = new ApiClient();
      try {
        await client.get('/api/protected');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(401);
        expect(err.friendlyMessage).toBe('กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ');
      }
    });

    it('should throw ApiError on 403 Forbidden with Thai friendly message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied',
            },
          }),
      });

      const client = new ApiClient();
      try {
        await client.get('/api/admin');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(403);
        expect(err.friendlyMessage).toBe('คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้');
      }
    });

    it('should throw ApiError on 404 Not Found with Thai friendly message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'NOT_FOUND',
              message: 'Resource not found',
            },
          }),
      });

      const client = new ApiClient();
      try {
        await client.get('/api/nonexistent');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(404);
        expect(err.friendlyMessage).toBe('ไม่พบข้อมูลที่ร้องขอ');
      }
    });

    it('should throw ApiError on 409 Conflict with Thai friendly message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'CONFLICT',
              message: 'Session already submitted',
            },
          }),
      });

      const client = new ApiClient();
      try {
        await client.post('/api/mock-exams/submit');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(409);
        expect(err.friendlyMessage).toBe('เกิดข้อขัดแย้งของข้อมูล กรุณาลองใหม่อีกครั้ง');
      }
    });

    it('should throw ApiError on 429 Rate Limit with Thai friendly message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests',
            },
          }),
      });

      const client = new ApiClient();
      try {
        await client.get('/api/user/progress');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(429);
        expect(err.friendlyMessage).toBe('คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่');
      }
    });

    it('should throw ApiError on 500 Server Error with Thai friendly message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () =>
          JSON.stringify({
            success: false,
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Database query failed',
            },
          }),
      });

      const client = new ApiClient();
      try {
        await client.get('/api/user/profile');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(500);
        expect(err.friendlyMessage).toBe('ระบบเซิร์ฟเวอร์เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่ในภายหลัง');
      }
    });

    it('should handle request abort / timeout and convert to ApiError(408, TIMEOUT)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      global.fetch = vi.fn().mockRejectedValue(abortError);

      const client = new ApiClient();
      try {
        await client.get('/api/timeout-test');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(408);
        expect(err.code).toBe('TIMEOUT');
        expect(err.friendlyMessage).toBe('การเชื่อมต่อหมดเวลา');
      }
    });

    it('should handle network connection drop and convert to ApiError(0, NETWORK_ERROR)', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      const client = new ApiClient();
      try {
        await client.get('/api/network-drop');
        expect.fail('Expected ApiError to be thrown');
      } catch (err: any) {
        expect(err.status).toBe(0);
        expect(err.code).toBe('NETWORK_ERROR');
        expect(err.friendlyMessage).toBe('ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
    });
  });

  describe('2. Auth API Integration (src/lib/api/auth.ts)', () => {
    it('should call GET /api/auth/me and return authenticated user details', async () => {
      const mockAuthUser = {
        user: {
          id: 'user-auth-uuid-999',
          email: 'test@example.com',
          role: 'authenticated',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockAuthUser }),
      });

      const response = await getMe();
      expect(response).toEqual(mockAuthUser);
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/me', expect.objectContaining({ method: 'GET' }));
    });
  });

  describe('3. Profile API Integration (src/lib/api/profile.ts)', () => {
    it('should call GET /api/user/profile and return user profile details', async () => {
      const mockProfile = {
        profile: {
          id: 'user-auth-uuid-999',
          current_cefr_level: 'B1',
          target_exam: 'B2_FIRST',
          estimated_cambridge_score: 152,
          streak_days: 7,
          daily_goal_minutes: 20,
          last_active_date: '2026-09-25',
          assessment_completed: true,
          created_at: '2026-09-20T00:00:00Z',
          updated_at: '2026-09-25T00:00:00Z',
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, data: mockProfile }),
      });

      const response = await getProfile();
      expect(response.profile.current_cefr_level).toBe('B1');
      expect(response.profile.target_exam).toBe('B2_FIRST');
      expect(global.fetch).toHaveBeenCalledWith('/api/user/profile', expect.objectContaining({ method: 'GET' }));
    });

    it('should send only whitelisted fields in updateProfile and strip server-owned fields', async () => {
      let sentBody: any;
      global.fetch = vi.fn().mockImplementation((_url, init) => {
        sentBody = JSON.parse(init?.body as string);
        return Promise.resolve({
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              success: true,
              data: {
                profile: {
                  id: 'user-auth-uuid-999',
                  current_cefr_level: 'B1',
                  target_exam: 'C1_ADVANCED',
                  estimated_cambridge_score: 152,
                  streak_days: 7,
                  daily_goal_minutes: 45,
                  last_active_date: '2026-09-25',
                  assessment_completed: true,
                },
              },
            }),
        });
      });

      // Pass input that contains attempts to inject server-owned properties
      const dirtyInput: any = {
        target_exam: 'C1_ADVANCED',
        daily_goal_minutes: 45,
        current_cefr_level: 'C2', // server-owned!
        streak_days: 999, // server-owned!
        estimated_cambridge_score: 230, // server-owned!
        assessment_completed: true, // server-owned!
      };

      await updateProfile(dirtyInput);

      // Verify that only target_exam and daily_goal_minutes reached fetch payload
      expect(sentBody).toEqual({
        target_exam: 'C1_ADVANCED',
        daily_goal_minutes: 45,
      });
      expect(sentBody.current_cefr_level).toBeUndefined();
      expect(sentBody.streak_days).toBeUndefined();
      expect(sentBody.estimated_cambridge_score).toBeUndefined();
    });
  });

  describe('4. Security & Environment Configuration Checks', () => {
    it('should not contain any SUPABASE_SERVICE_ROLE_KEY or service-role secrets in src/', () => {
      const srcDir = path.resolve(__dirname, '../src');

      function scanDir(dir: string): string[] {
        const findings: string[] = [];
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            findings.push(...scanDir(fullPath));
          } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('SUPABASE_SERVICE_ROLE_KEY') || content.includes('service_role')) {
              findings.push(`${fullPath}: contains service role references`);
            }
          }
        }
        return findings;
      }

      const leaks = scanDir(srcDir);
      expect(leaks).toEqual([]);
    });

    it('should ensure src/lib/supabaseClient.ts uses only client-safe public VITE_* environment variables', () => {
      const clientFile = path.resolve(__dirname, '../src/lib/supabaseClient.ts');
      const content = fs.readFileSync(clientFile, 'utf8');

      expect(content).toContain('import.meta.env.VITE_SUPABASE_URL');
      expect(content).toContain('import.meta.env.VITE_SUPABASE_ANON_KEY');
      expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(content).not.toContain('process.env.SUPABASE_SERVICE_ROLE_KEY');
    });

    it('should preserve localStorage compatibility for guest mode in src/services/storageService.ts', () => {
      const storageFile = path.resolve(__dirname, '../src/services/storageService.ts');
      const content = fs.readFileSync(storageFile, 'utf8');

      expect(content).toContain('loadUserProgress');
      expect(content).toContain('saveUserProgress');
      expect(content).toContain('localStorage');
    });
  });
});
