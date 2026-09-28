import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';
import listeningAudioUrlHandler from '../api/listening/audio-url';

// Mock exercise fixtures
const mockExerciseNullAudio = {
  id: 'd0000000-0000-4001-8000-000000000001',
  title: 'Airport Flight Announcement',
  cefr_level: 'A2',
  target_exam: 'KET',
  speaker_accents: 'British English',
  audio_storage_path: null,
  audio_script: 'Attention all passengers on flight TG 910...',
  speed_options: [0.75, 1.0, 1.25],
  is_active: true,
};

const mockExerciseWithAudio = {
  id: 'd0000000-0000-4001-8000-000000000002',
  title: 'Podcast: Sustainable Architecture for Beginners',
  cefr_level: 'B1',
  target_exam: 'PET',
  speaker_accents: 'Neutral English',
  audio_storage_path: 'exercises/b1_podcast.mp3',
  audio_script: 'Host: Welcome back to EcoDesign Today...',
  speed_options: [0.75, 1.0, 1.25],
  is_active: true,
};

const mockExerciseInactive = {
  id: 'd0000000-0000-4001-8000-000000000003',
  title: 'Draft Inactive Exercise',
  cefr_level: 'B2',
  target_exam: 'FCE',
  speaker_accents: 'American English',
  audio_storage_path: null,
  audio_script: 'Draft script',
  speed_options: [1.0],
  is_active: false,
};

// Mock Supabase service role client
vi.mock('../api/_lib/supabase/client', () => {
  return {
    createServiceRoleClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'listening_exercises') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn((col: string, val: any) => {
                let found: any = null;
                if (val === mockExerciseNullAudio.id) found = mockExerciseNullAudio;
                if (val === mockExerciseWithAudio.id) found = mockExerciseWithAudio;
                if (val === mockExerciseInactive.id) found = mockExerciseInactive;

                return {
                  maybeSingle: vi.fn(async () => ({
                    data: found,
                    error: null,
                  })),
                  single: vi.fn(async () => ({
                    data: found,
                    error: found ? null : new Error('Row not found'),
                  })),
                };
              }),
            })),
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(async () => ({ data: null, error: null })),
              single: vi.fn(async () => ({ data: null, error: new Error('Not found') })),
            })),
          })),
        };
      }),
    })),
  };
});

// Helper to simulate request / response
function invokeHandler(
  handler: any,
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    query?: Record<string, string>;
  } = {}
): Promise<{ status: number; body: any; headers: Record<string, string> }> {
  return new Promise((resolve) => {
    const req: any = new EventEmitter();
    req.method = options.method || 'GET';
    req.url = options.url || '/';
    req.headers = options.headers || {};
    req.body = options.body;
    req.query = options.query;

    let statusCode = 200;
    const resHeaders: Record<string, string> = {};
    let responseBody: any = null;

    const res: any = {
      statusCode,
      setHeader(k: string, v: string) {
        resHeaders[k.toLowerCase()] = v;
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(payload: any) {
        responseBody = payload;
        this.writableEnded = true;
        resolve({ status: this.statusCode, body: responseBody, headers: resHeaders });
      },
      end(payload?: any) {
        if (payload && !responseBody) {
          try {
            responseBody = JSON.parse(payload);
          } catch {
            responseBody = payload;
          }
        }
        this.writableEnded = true;
        resolve({ status: this.statusCode, body: responseBody, headers: resHeaders });
      },
      writableEnded: false,
    };

    handler(req, res);
  });
}

describe('Listening Audio URL API Suite (GET /api/listening/audio-url)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. should return 400 Bad Request when exercise ID is missing', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: '/api/listening/audio-url',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toContain('Exercise ID parameter is required');
  });

  it('2. should return 400 Bad Request when exercise ID is not a valid UUID', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: '/api/listening/audio-url?id=listen-a2-airport',
      query: { id: 'listen-a2-airport' },
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('BAD_REQUEST');
    expect(res.body.error.message).toContain('Invalid exercise ID format. Must be a valid UUID');
  });

  it('3. should return 404 Not Found when UUID does not exist in database', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: '/api/listening/audio-url?id=00000000-0000-4000-8000-000000000099',
      query: { id: '00000000-0000-4000-8000-000000000099' },
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.message).toContain('Listening exercise not found');
  });

  it('4. should return 404 Not Found when exercise exists but is inactive', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: `/api/listening/audio-url?id=${mockExerciseInactive.id}`,
      query: { id: mockExerciseInactive.id },
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('5. should return 200 with audio_url=null and has_audio=false when audio_storage_path is NULL', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: `/api/listening/audio-url?id=${mockExerciseNullAudio.id}`,
      query: { id: mockExerciseNullAudio.id },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exercise_id).toBe(mockExerciseNullAudio.id);
    expect(res.body.data.title).toBe('Airport Flight Announcement');
    expect(res.body.data.audio_url).toBeNull();
    expect(res.body.data.has_audio).toBe(false);
  });

  it('6. should return 200 with public CDN audio_url and has_audio=true when audio_storage_path exists', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: `/api/listening/audio-url?id=${mockExerciseWithAudio.id}`,
      query: { id: mockExerciseWithAudio.id },
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.exercise_id).toBe(mockExerciseWithAudio.id);
    expect(res.body.data.title).toBe('Podcast: Sustainable Architecture for Beginners');
    expect(res.body.data.audio_url).toContain('/storage/v1/object/public/audio-listening/exercises/b1_podcast.mp3');
    expect(res.body.data.has_audio).toBe(true);
  });

  it('7. should reject non-GET HTTP methods with 405 Method Not Allowed', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'POST',
      url: `/api/listening/audio-url?id=${mockExerciseWithAudio.id}`,
      query: { id: mockExerciseWithAudio.id },
    });

    expect(res.status).toBe(405);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('METHOD_NOT_ALLOWED');
  });

  it('8. should allow public unauthenticated access (no 401)', async () => {
    const res = await invokeHandler(listeningAudioUrlHandler, {
      method: 'GET',
      url: `/api/listening/audio-url?id=${mockExerciseNullAudio.id}`,
      query: { id: mockExerciseNullAudio.id },
      headers: {}, // No Authorization header
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
