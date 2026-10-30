import { describe, it, expect, vi } from 'vitest';
import {
  calculateNewStreak,
  updateStreakOnActivity,
  STREAK_MILESTONES,
} from '../api/_lib/assessment/streak';

describe('Streak & Retention Engine (AC-4)', () => {
  describe('calculateNewStreak pure function', () => {
    it('should initialize streak to 1 on first ever activity', () => {
      const now = new Date('2026-10-30T10:00:00Z');
      const result = calculateNewStreak(0, null, now);

      expect(result.streak_days).toBe(1);
      expect(result.last_active_date).toBe('2026-10-30');
      expect(result.is_new_day).toBe(true);
      expect(result.freeze_used).toBe(false);
    });

    it('should be idempotent on same calendar day', () => {
      const date1 = new Date('2026-10-30T08:00:00Z');
      const date2 = new Date('2026-10-30T20:00:00Z');

      const initial = calculateNewStreak(5, '2026-10-29', date1);
      expect(initial.streak_days).toBe(6);
      expect(initial.is_new_day).toBe(true);

      const repeat = calculateNewStreak(initial.streak_days, initial.last_active_date, date2);
      expect(repeat.streak_days).toBe(6);
      expect(repeat.is_new_day).toBe(false);
      expect(repeat.freeze_used).toBe(false);
    });

    it('should increment streak on consecutive day practice (diffDays === 1)', () => {
      const now = new Date('2026-10-30T10:00:00Z');
      const result = calculateNewStreak(14, '2026-10-29', now);

      expect(result.streak_days).toBe(15);
      expect(result.last_active_date).toBe('2026-10-30');
      expect(result.is_new_day).toBe(true);
      expect(result.freeze_used).toBe(false);
    });

    it('should preserve and increment streak when 1 day is missed and streak freeze is available', () => {
      // Last active 2026-10-28, today is 2026-10-30 (missed Oct 29, diffDays = 2)
      const now = new Date('2026-10-30T12:00:00Z');
      const result = calculateNewStreak(10, '2026-10-28', now, {
        streakFreezeAvailable: 1,
      });

      expect(result.streak_days).toBe(11);
      expect(result.last_active_date).toBe('2026-10-30');
      expect(result.is_new_day).toBe(true);
      expect(result.freeze_used).toBe(true);
    });

    it('should reset streak to 1 when 1 day is missed and NO streak freeze is available', () => {
      const now = new Date('2026-10-30T12:00:00Z');
      const result = calculateNewStreak(10, '2026-10-28', now, {
        streakFreezeAvailable: 0,
      });

      expect(result.streak_days).toBe(1);
      expect(result.last_active_date).toBe('2026-10-30');
      expect(result.is_new_day).toBe(true);
      expect(result.freeze_used).toBe(false);
    });

    it('should reset streak to 1 when 2+ consecutive days are missed even if freeze is available', () => {
      // Last active 2026-10-25, today 2026-10-30 (missed 5 days, diffDays = 5)
      const now = new Date('2026-10-30T12:00:00Z');
      const result = calculateNewStreak(25, '2026-10-25', now, {
        streakFreezeAvailable: 1,
      });

      expect(result.streak_days).toBe(1);
      expect(result.last_active_date).toBe('2026-10-30');
      expect(result.is_new_day).toBe(true);
      expect(result.freeze_used).toBe(false);
    });

    it('should award milestone badges and XP at 7, 30, and 100 days', () => {
      const now = new Date('2026-10-30T10:00:00Z');

      // 7-day milestone
      const day7 = calculateNewStreak(6, '2026-10-29', now);
      expect(day7.streak_days).toBe(7);
      expect(day7.milestone).toEqual({
        days: 7,
        badge: 'Weekly Warrior',
        xp: 100,
      });

      // 30-day milestone
      const day30 = calculateNewStreak(29, '2026-10-29', now);
      expect(day30.streak_days).toBe(30);
      expect(day30.milestone).toEqual({
        days: 30,
        badge: 'Monthly Master',
        xp: 500,
      });

      // 100-day milestone
      const day100 = calculateNewStreak(99, '2026-10-29', now);
      expect(day100.streak_days).toBe(100);
      expect(day100.milestone).toEqual({
        days: 100,
        badge: 'Century Polyglot',
        xp: 2000,
      });

      // Non-milestone day (e.g. 15 days)
      const day15 = calculateNewStreak(14, '2026-10-29', now);
      expect(day15.streak_days).toBe(15);
      expect(day15.milestone).toBeNull();
    });

    it('should respect client timezone offset minutes correctly', () => {
      // UTC 2026-10-30 18:00 is Bangkok (UTC+7, offset -420) 2026-10-31 01:00
      const utcEvening = new Date('2026-10-30T18:00:00Z');
      const bkkOffsetMinutes = -420;

      const result = calculateNewStreak(3, '2026-10-30', utcEvening, bkkOffsetMinutes);
      expect(result.last_active_date).toBe('2026-10-31');
      expect(result.streak_days).toBe(4);
      expect(result.is_new_day).toBe(true);
    });
  });

  describe('updateStreakOnActivity database integration', () => {
    it('should consume streak freeze from settings when freeze is activated', async () => {
      const mockProfile = { streak_days: 12, last_active_date: '2026-10-28' };
      const mockSettings = {
        streak_freeze_available: 1,
        streak_freeze_used_this_month: 0,
        last_freeze_reset_at: '2026-10-01T00:00:00Z',
      };

      const updateProfileMock = vi.fn().mockReturnThis();
      const updateSettingsMock = vi.fn().mockReturnThis();
      const eqMock = vi.fn().mockResolvedValue({ data: null, error: null });

      const mockSupabase = {
        from: (table: string) => {
          if (table === 'user_profiles') {
            return {
              select: () => ({
                eq: () => ({
                  single: async () => ({ data: mockProfile, error: null }),
                }),
              }),
              update: (payload: any) => {
                updateProfileMock(payload);
                return { eq: eqMock };
              },
            };
          }
          if (table === 'user_notification_settings') {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: mockSettings, error: null }),
                }),
              }),
              update: (payload: any) => {
                updateSettingsMock(payload);
                return { eq: eqMock };
              },
            };
          }
          return {};
        },
      } as any;

      const now = new Date('2026-10-30T10:00:00Z');
      const res = await updateStreakOnActivity(mockSupabase, 'user-123', now);

      expect(res.streak_days).toBe(13);
      expect(res.freeze_used).toBe(true);
      expect(updateProfileMock).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_days: 13,
          last_active_date: '2026-10-30',
        })
      );
      expect(updateSettingsMock).toHaveBeenCalledWith(
        expect.objectContaining({
          streak_freeze_available: 0,
          streak_freeze_used_this_month: 1,
        })
      );
    });
  });
});
