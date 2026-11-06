import { describe, it, expect, vi, beforeEach } from 'vitest';
import webpush from 'web-push';
import {
  getVapidPublicKey,
  getVapidKeys,
  sendWebPushNotification,
} from '../api/_lib/notifications/web-push';

describe('Web Push Delivery & Key Lifecycle (AC-1 & AC-2)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should generate or return valid VAPID keys with a non-empty public key', () => {
    const keys = getVapidKeys();
    expect(keys.publicKey).toBeDefined();
    expect(typeof keys.publicKey).toBe('string');
    expect(keys.publicKey.length).toBeGreaterThan(20);
    expect(keys.privateKey).toBeDefined();
    expect(keys.subject).toContain('mailto:');

    const pubKey = getVapidPublicKey();
    expect(pubKey).toBe(keys.publicKey);
  });

  it('should successfully send a Web Push notification to a valid subscription', async () => {
    vi.spyOn(webpush, 'sendNotification').mockResolvedValue({
      statusCode: 201,
      body: '',
      headers: {},
    } as any);

    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/test-token-123',
      p256dh_key: 'test-p256dh-key',
      auth_key: 'test-auth-key',
    };

    const payload = {
      title: 'GLOVA Practice Reminder',
      body: 'Keep your 5-day streak alive!',
      url: '/dashboard',
    };

    const result = await sendWebPushNotification(subscription, payload);
    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);
  });

  it('should automatically cull dead subscriptions (HTTP 410 Gone / 404 Not Found) from database', async () => {
    const goneError = {
      statusCode: 410,
      message: 'push subscription has unsubscribed or expired',
    };
    vi.spyOn(webpush, 'sendNotification').mockRejectedValue(goneError);

    const deleteMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ data: null, error: null });

    const mockSupabase = {
      from: (table: string) => {
        expect(table).toBe('user_push_subscriptions');
        return {
          delete: () => {
            deleteMock();
            return {
              eq: (col: string, val: string) => {
                expect(col).toBe('endpoint');
                expect(val).toBe('https://fcm.googleapis.com/fcm/send/dead-endpoint');
                return eqMock();
              },
            };
          },
        };
      },
    } as any;

    const subscription = {
      endpoint: 'https://fcm.googleapis.com/fcm/send/dead-endpoint',
      p256dh_key: 'test-p256dh-key',
      auth_key: 'test-auth-key',
    };

    const result = await sendWebPushNotification(
      subscription,
      { title: 'Test', body: 'Test' },
      mockSupabase
    );

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(410);
    expect(result.culled).toBe(true);
    expect(deleteMock).toHaveBeenCalled();
  });
});
