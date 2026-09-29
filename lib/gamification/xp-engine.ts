import { XPEvent, XPEventSource } from '../../types/gamification';

/**
 * Legitimate Base XP rewards per learning action
 */
export const XP_RULES: Record<XPEventSource, { base: number; maxPerDay: number }> = {
  vocabulary: { base: 10, maxPerDay: 250 },
  grammar: { base: 12, maxPerDay: 300 },
  reading: { base: 15, maxPerDay: 300 },
  listening: { base: 15, maxPerDay: 300 },
  writing: { base: 20, maxPerDay: 200 },
  speaking: { base: 20, maxPerDay: 200 },
  mockExam: { base: 60, maxPerDay: 240 },
  competition: { base: 15, maxPerDay: 400 },
  daily_goal: { base: 25, maxPerDay: 25 },
  achievement: { base: 50, maxPerDay: 500 },
};

// Server-side XP Event In-Memory Ledger (persisted in SQLite/Postgres in prod)
const xpEventsLedger: XPEvent[] = [];

/**
 * Record a verified XP event with idempotency, validation, and anti-farming daily caps.
 */
export function recordXPEvent(params: {
  userId: string;
  source: XPEventSource;
  sourceId?: string;
  multiplier?: number;
  bonus?: number;
  metadata?: Record<string, any>;
}): { success: boolean; event?: XPEvent; message?: string } {
  const { userId, source, sourceId, multiplier = 1, bonus = 0, metadata } = params;

  if (!userId || !source) {
    return { success: false, message: 'Invalid user or source' };
  }

  const rule = XP_RULES[source];
  if (!rule) {
    return { success: false, message: 'Unrecognized XP source' };
  }

  // Idempotency check: prevent duplicate reward within 5 seconds for the same sourceId
  if (sourceId) {
    const fiveSecondsAgo = Date.now() - 5000;
    const isDuplicate = xpEventsLedger.some(
      (ev) =>
        ev.userId === userId &&
        ev.source === source &&
        ev.sourceId === sourceId &&
        new Date(ev.createdAt).getTime() > fiveSecondsAgo
    );
    if (isDuplicate) {
      return { success: false, message: 'Duplicate XP event blocked by idempotency gate' };
    }
  }

  // Anti-farming check: ensure daily cap for this source is not exceeded
  const todayStr = new Date().toISOString().slice(0, 10);
  const userDailySourceXp = xpEventsLedger
    .filter((ev) => ev.userId === userId && ev.source === source && ev.createdAt.startsWith(todayStr))
    .reduce((sum, ev) => sum + ev.amount, 0);

  if (userDailySourceXp >= rule.maxPerDay) {
    return {
      success: false,
      message: `Daily XP cap reached for ${source} (${rule.maxPerDay} XP/day max)`,
    };
  }

  const safeMultiplier = Math.min(3, Math.max(1, multiplier));
  const calculatedAmount = Math.min(
    rule.maxPerDay - userDailySourceXp,
    Math.round(rule.base * safeMultiplier + bonus)
  );

  if (calculatedAmount <= 0) {
    return { success: false, message: 'No XP awarded' };
  }

  const event: XPEvent = {
    id: `xpe_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    source,
    sourceId,
    amount: calculatedAmount,
    metadata,
    createdAt: new Date().toISOString(),
  };

  xpEventsLedger.push(event);

  return { success: true, event };
}

/**
 * Retrieve total XP for a user from the event ledger
 */
export function getUserTotalXP(userId: string): number {
  return xpEventsLedger
    .filter((ev) => ev.userId === userId)
    .reduce((sum, ev) => sum + ev.amount, 0);
}

/**
 * Retrieve weekly XP for the current calendar week (Monday to Sunday)
 */
export function getUserWeeklyXP(userId: string): number {
  const now = new Date();
  const dayOfWeek = (now.getUTCDay() + 6) % 7; // Monday = 0
  const startOfWeek = new Date(now);
  startOfWeek.setUTCDate(now.getUTCDate() - dayOfWeek);
  startOfWeek.setUTCHours(0, 0, 0, 0);

  return xpEventsLedger
    .filter((ev) => ev.userId === userId && new Date(ev.createdAt) >= startOfWeek)
    .reduce((sum, ev) => sum + ev.amount, 0);
}

/**
 * Retrieve recent XP events for ledger review
 */
export function getUserXPEvents(userId: string, limit = 20): XPEvent[] {
  return xpEventsLedger
    .filter((ev) => ev.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
