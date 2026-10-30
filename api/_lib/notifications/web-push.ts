import webpush from 'web-push';
import { SupabaseClient } from '@supabase/supabase-js';

// Global cache for development/test environment if VAPID keys are not explicitly provided in env
let cachedVapidKeys: { publicKey: string; privateKey: string } | null = null;

export function getVapidKeys(): { publicKey: string; privateKey: string; subject: string } {
  const envPublic = process.env.VAPID_PUBLIC_KEY;
  const envPrivate = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@glova.app';

  if (envPublic && envPrivate) {
    return { publicKey: envPublic, privateKey: envPrivate, subject };
  }

  if (!cachedVapidKeys) {
    // Generate stable VAPID keypair in memory for development & testing
    cachedVapidKeys = webpush.generateVAPIDKeys();
  }

  return {
    publicKey: cachedVapidKeys.publicKey,
    privateKey: cachedVapidKeys.privateKey,
    subject,
  };
}

export function getVapidPublicKey(): string {
  return getVapidKeys().publicKey;
}

export function configureWebPush(): void {
  const { publicKey, privateKey, subject } = getVapidKeys();
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

export interface SendPushResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  culled?: boolean;
}

/**
 * Sends a Web Push notification to a single subscription.
 * Automatically removes dead/expired subscriptions (HTTP 404 or 410 Gone) from Supabase.
 */
export async function sendWebPushNotification(
  subscription: PushSubscriptionRecord,
  payload: PushNotificationPayload,
  supabase?: SupabaseClient
): Promise<SendPushResult> {
  try {
    configureWebPush();

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key,
      },
    };

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/dashboard',
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-192x192.png',
      tag: payload.tag || 'glova-streak-reminder',
    });

    const response = await webpush.sendNotification(pushSubscription, payloadString);

    return {
      success: true,
      statusCode: response.statusCode,
    };
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    const statusCode = error.statusCode;

    let culled = false;
    // 404 (Not Found) or 410 (Gone) indicates the subscription is no longer valid or unsubscribed
    if ((statusCode === 404 || statusCode === 410) && supabase) {
      await supabase
        .from('user_push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint);
      culled = true;
    }

    return {
      success: false,
      statusCode,
      error: error.message || 'Unknown Web Push error',
      culled,
    };
  }
}
