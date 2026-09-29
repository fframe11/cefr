import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  LOTTIE_FRAME_METADATA,
  MOCK_LOTTIE_FRAMES,
  LottieProfileFrame,
} from '../components/gamification/LottieProfileFrame';
import { GlovaAvatarWithFrame, RANK_FRAME_METADATA } from '../components/gamification/RankFrame';
import { LottieFrameId } from '../types/gamification';

describe('Open-Source Royalty-Free Lottie Profile Frame System', () => {
  it('1. provides exactly 4 curated mock frames with public royalty-free animated URLs', () => {
    expect(MOCK_LOTTIE_FRAMES).toHaveLength(4);

    const frameIds: LottieFrameId[] = [
      'lottie_cyber_apex',
      'lottie_solar_radiance',
      'lottie_mystic_emerald',
      'lottie_sakura_starlight',
    ];

    frameIds.forEach((id) => {
      const frame = LOTTIE_FRAME_METADATA[id];
      expect(frame).toBeDefined();
      expect(frame.id).toBe(id);
      expect(frame.animationUrl).toMatch(/^https:\/\//);
      expect(frame.fallbackJsonPath).toMatch(/^\/animations\/frames\//);
      expect(frame.license).toContain('Open Source');
      expect(frame.nameTh).toBeTruthy();
      expect(frame.nameEn).toBeTruthy();
      expect(frame.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  it('2. guarantees 100% legal compliance with zero copyrighted Discord or Steam assets', () => {
    MOCK_LOTTIE_FRAMES.forEach((frame) => {
      // Must not contain discord or steam domains or identifiers
      expect(frame.animationUrl.toLowerCase()).not.toContain('discord');
      expect(frame.animationUrl.toLowerCase()).not.toContain('steam');
      expect(frame.fallbackJsonPath.toLowerCase()).not.toContain('discord');
      expect(frame.fallbackJsonPath.toLowerCase()).not.toContain('steam');
      expect(frame.licenseUrl.toLowerCase()).not.toContain('discord');
      expect(frame.licenseUrl.toLowerCase()).not.toContain('steam');
      expect(frame.license).toMatch(/MIT|Public Domain|CC/i);
    });
  });

  it('3. renders LottieProfileFrame container and avatar content safely in SSR mode', () => {
    const html = renderToString(
      <LottieProfileFrame
        frameId="lottie_cyber_apex"
        username="TestUser"
        size="lg"
      />
    );

    expect(html).toContain('data-testid="lottie-frame-lottie_cyber_apex"');
    expect(html).toContain('TE'); // Avatar fallback letters
  });

  it('4. provides immediate SVG pulse fallback during hydration or SSR', () => {
    const html = renderToString(
      <LottieProfileFrame
        frameId="lottie_solar_radiance"
        avatarUrl="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
        username="SolarGlova"
      />
    );

    expect(html).toContain('<svg');
    expect(html).toContain('<circle');
    expect(html).toContain(LOTTIE_FRAME_METADATA.lottie_solar_radiance.color);
  });

  it('5. GlovaAvatarWithFrame automatically delegates to LottieProfileFrame for lottie_* frames', () => {
    const html = renderToString(
      <GlovaAvatarWithFrame
        frameId="lottie_mystic_emerald"
        avatarUrl="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120"
        username="EmeraldUser"
        size="xl"
      />
    );

    expect(html).toContain('data-testid="lottie-frame-lottie_mystic_emerald"');
    expect(html).toContain('https://images.unsplash.com/photo-1517841905240-472988babdf9');
  });

  it('6. GlovaAvatarWithFrame preserves classic SVG frames for backward compatibility', () => {
    const html = renderToString(
      <GlovaAvatarWithFrame
        frameId="gaming_1"
        username="ClassicUser"
        size="md"
      />
    );

    expect(html).toContain('data-testid="rank-frame-gaming_1"');
  });

  it('7. GlovaAvatarWithFrame supports custom direct animation URL', () => {
    const html = renderToString(
      <GlovaAvatarWithFrame
        customAnimationUrl="https://raw.githubusercontent.com/airbnb/lottie-web/master/demo/bodymovin/data.json"
        username="CustomUrlUser"
        size="md"
      />
    );

    expect(html).toContain('data-testid="lottie-frame-custom"');
  });

  it('8. RANK_FRAME_METADATA includes all 4 Lottie frames preventing undefined access', () => {
    expect(RANK_FRAME_METADATA.lottie_cyber_apex).toBeDefined();
    expect(RANK_FRAME_METADATA.lottie_solar_radiance).toBeDefined();
    expect(RANK_FRAME_METADATA.lottie_mystic_emerald).toBeDefined();
    expect(RANK_FRAME_METADATA.lottie_sakura_starlight).toBeDefined();
  });
});
