import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  getAllCampaigns,
  isCampaignActive,
  isCampaignUpcoming,
  getRuntimeCampaignStatus,
  filterAndSortCampaigns,
  getActiveCampaigns,
} from '../lib/campaigns';
import { CampaignBanner } from '../components/dashboard/CampaignBanner';
import { Campaign } from '../types/campaign';

const mockCampaigns: Campaign[] = [
  {
    id: 'camp_test_high',
    campaign_type: 'RANKED',
    titleEn: 'Ranked Season Test',
    titleTh: 'ทดสอบซีซันแรงก์',
    subtitleEn: 'Climb the ladder',
    subtitleTh: 'ไต่อันดับ',
    descriptionEn: 'High priority active campaign description',
    descriptionTh: 'รายละเอียดแคมเปญระดับสูง',
    image: '/assets/ranks/rank-gold.png',
    imageAltEn: 'Gold rank emblem',
    imageAltTh: 'ตราโกลด์',
    badgeEn: 'SEASON 01',
    badgeTh: 'ซีซัน 01',
    rewardEn: '+500 MMR',
    rewardTh: '+500 MMR',
    start_at: '2026-09-01T00:00:00Z',
    end_at: '2026-10-31T23:59:59Z',
    status: 'ACTIVE',
    priority: 'HIGH',
    display_order: 1,
    cta_labelEn: 'Join Ranked',
    cta_labelTh: 'เข้าสู่สมรภูมิ',
    target_route: 'compete',
    show_when_upcoming: true,
  },
  {
    id: 'camp_test_normal',
    campaign_type: 'CHALLENGE',
    titleEn: 'Vocab Challenge Test',
    titleTh: 'ทดสอบภารกิจคำศัพท์',
    subtitleEn: '300 Words',
    subtitleTh: '300 คำ',
    descriptionEn: 'Normal priority active campaign description',
    descriptionTh: 'รายละเอียดแคมเปญระดับปกติ',
    image: '/assets/achievements/achievement-streak-fire.png',
    imageAltEn: 'Fire badge',
    imageAltTh: 'ตราเพลิง',
    badgeEn: 'CHALLENGE',
    badgeTh: 'ภารกิจ',
    rewardEn: '+350 XP',
    rewardTh: '+350 XP',
    start_at: '2026-09-10T00:00:00Z',
    end_at: '2026-10-20T23:59:59Z',
    status: 'ACTIVE',
    priority: 'NORMAL',
    display_order: 2,
    cta_labelEn: 'Start Words',
    cta_labelTh: 'เริ่มจำศัพท์',
    target_route: 'vocabulary',
    show_when_upcoming: true,
  },
  {
    id: 'camp_test_expired',
    campaign_type: 'EVENT',
    titleEn: 'Expired Event Test',
    titleTh: 'กิจกรรมหมดอายุ',
    descriptionEn: 'Should not appear in active banner',
    descriptionTh: 'ต้องไม่แสดงในแบนเนอร์ที่เปิดใช้งาน',
    image: '/assets/trophies/trophy-bronze.png',
    imageAltEn: 'Bronze trophy',
    imageAltTh: 'ถ้วยบรอนซ์',
    start_at: '2026-06-01T00:00:00Z',
    end_at: '2026-08-31T23:59:59Z',
    status: 'EXPIRED',
    priority: 'LOW',
    display_order: 99,
    cta_labelEn: 'Expired',
    cta_labelTh: 'หมดอายุ',
    target_route: 'achievements',
    show_when_upcoming: false,
  },
  {
    id: 'camp_test_upcoming',
    campaign_type: 'EVENT',
    titleEn: 'Upcoming Winter Tournament',
    titleTh: 'ทัวร์นาเมนต์ฤดูหนาวที่กำลังจะมาถึง',
    descriptionEn: 'Starts in November',
    descriptionTh: 'เริ่มพฤศจิกายน',
    image: '/assets/ranks/rank-diamond.png',
    imageAltEn: 'Diamond crest',
    imageAltTh: 'ตราไดมอนด์',
    badgeEn: 'COMING SOON',
    badgeTh: 'เร็วๆ นี้',
    start_at: '2026-11-01T00:00:00Z',
    end_at: '2026-12-31T23:59:59Z',
    status: 'UPCOMING',
    priority: 'LOW',
    display_order: 5,
    cta_labelEn: 'Preview',
    cta_labelTh: 'ดูตัวอย่าง',
    target_route: 'ranking',
    show_when_upcoming: true,
  },
];

describe('Glova Promotional Campaign Banner Suite', () => {
  const fixedNow = new Date('2026-09-30T00:00:00Z');

  describe('1. Campaign Time-Aware Logic & Helper Functions', () => {
    it('accurately verifies active campaigns within start and end boundaries', () => {
      expect(isCampaignActive(mockCampaigns[0], fixedNow)).toBe(true);
      expect(isCampaignActive(mockCampaigns[1], fixedNow)).toBe(true);
    });

    it('correctly filters out expired campaigns', () => {
      expect(isCampaignActive(mockCampaigns[2], fixedNow)).toBe(false);
      expect(getRuntimeCampaignStatus(mockCampaigns[2], fixedNow)).toBe('EXPIRED');
    });

    it('identifies upcoming campaigns configured for preview', () => {
      expect(isCampaignActive(mockCampaigns[3], fixedNow)).toBe(false);
      expect(isCampaignUpcoming(mockCampaigns[3], fixedNow)).toBe(true);
      expect(getRuntimeCampaignStatus(mockCampaigns[3], fixedNow)).toBe('UPCOMING');
    });

    it('sorts campaigns by priority: HIGH before NORMAL before LOW', () => {
      const sorted = filterAndSortCampaigns(mockCampaigns, { now: fixedNow, includeUpcoming: true });
      expect(sorted.length).toBe(3); // excludes expired
      expect(sorted[0].priority).toBe('HIGH');
      expect(sorted[1].priority).toBe('NORMAL');
      expect(sorted[2].priority).toBe('LOW');
      expect(sorted.map((c) => c.id)).not.toContain('camp_test_expired');
    });

    it('filters campaigns by type when requested', () => {
      const rankedOnly = filterAndSortCampaigns(mockCampaigns, { now: fixedNow, type: 'RANKED' });
      expect(rankedOnly.length).toBe(1);
      expect(rankedOnly[0].campaign_type).toBe('RANKED');
    });

    it('reads and validates production campaign registry dataset', () => {
      const all = getAllCampaigns();
      expect(all.length).toBeGreaterThan(0);
      const active = getActiveCampaigns({ now: fixedNow });
      expect(active.length).toBeGreaterThan(0);

      active.forEach((camp) => {
        expect(camp.titleEn).toBeTruthy();
        expect(camp.titleTh).toBeTruthy();
        expect(camp.cta_labelEn).toBeTruthy();
        expect(camp.cta_labelTh).toBeTruthy();
        expect(camp.image).toMatch(/^\/assets\//);
        expect(camp.target_route).toBeTruthy();
      });
    });
  });

  describe('2. CampaignBanner Component Server/Client Rendering & Accessibility', () => {
    it('renders active campaign content, badge, reward, and transparent image', () => {
      const html = renderToString(<CampaignBanner campaigns={[mockCampaigns[0]]} />);

      expect(html).toContain('role="region"');
      expect(html).toContain('aria-roledescription="carousel"');
      expect(html).toMatch(/Ranked Season Test|ทดสอบซีซันแรงก์/);
      expect(html).toContain('+500 MMR');
      expect(html).toMatch(/Join Ranked|เข้าสู่สมรภูมิ/);
      expect(html).toContain('src="/assets/ranks/rank-gold.png"');
      expect(html).toMatch(/alt="Gold rank emblem"|alt="ตราโกลด์"/);
    });

    it('renders controls toolbar when multiple campaigns exist', () => {
      const testList = [mockCampaigns[0], mockCampaigns[1]];
      const html = renderToString(<CampaignBanner campaigns={testList} />);

      expect(html).toContain('role="tablist"');
      expect(html).toMatch(/Previous Campaign|แคมเปญก่อนหน้า/);
      expect(html).toMatch(/Next Campaign|แคมเปญถัดไป/);
      expect(html).toMatch(/1.*\/.*2/);
    });

    it('renders empty markup gracefully when campaigns array is empty', () => {
      const html = renderToString(<CampaignBanner campaigns={[]} />);
      expect(html).toBe('');
    });
  });
});
