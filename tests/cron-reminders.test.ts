import { describe, it, expect, vi } from 'vitest';
import { getUserLocalTime } from '../api/cron/hourly-reminders';

describe('Hourly Cron Reminders & Timezone Engine (AC-5)', () => {
  it('should accurately compute local hour and date for Asia/Bangkok (UTC+7)', () => {
    // 2026-10-30 13:00 UTC = 2026-10-30 20:00 Bangkok
    const utcDate = new Date('2026-10-30T13:00:00Z');
    const { localHour, localDateStr } = getUserLocalTime('Asia/Bangkok', utcDate);

    expect(localHour).toBe(20);
    expect(localDateStr).toBe('2026-10-30');
  });

  it('should accurately compute local hour and date for America/New_York (EDT UTC-4 in late October)', () => {
    // 2026-10-30 13:00 UTC = 2026-10-30 09:00 New York (EDT)
    const utcDate = new Date('2026-10-30T13:00:00Z');
    const { localHour, localDateStr } = getUserLocalTime('America/New_York', utcDate);

    expect(localHour).toBe(9);
    expect(localDateStr).toBe('2026-10-30');
  });

  it('should correctly cross day boundary across timezones', () => {
    // 2026-10-30 23:00 UTC = 2026-10-31 06:00 Bangkok
    const utcMidnight = new Date('2026-10-30T23:00:00Z');
    const { localHour, localDateStr } = getUserLocalTime('Asia/Bangkok', utcMidnight);

    expect(localHour).toBe(6);
    expect(localDateStr).toBe('2026-10-31');
  });

  it('should gracefully fallback to UTC+7 if invalid timezone string is passed', () => {
    const utcDate = new Date('2026-10-30T13:00:00Z');
    const { localHour, localDateStr } = getUserLocalTime('Invalid/Unknown_Zone', utcDate);

    expect(localHour).toBe(20);
    expect(localDateStr).toBe('2026-10-30');
  });
});
