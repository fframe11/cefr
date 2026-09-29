import { describe, it, expect } from 'vitest';
import {
  getAsset,
  getAssetsByCategory,
  getInitialRankFrames,
  resolveDiceBearAvatar,
  getAssetRegistryAudit,
} from '../lib/assets/asset-registry';

describe('GLOVA Asset Registry & License Safety Invariants', () => {
  it('guarantees 100% of production assets have verified licenses and commercial use permissions', () => {
    const audit = getAssetRegistryAudit();
    expect(audit.totalRegistered).toBeGreaterThanOrEqual(15);
    expect(audit.reviewCount).toBe(0);
    expect(audit.isProductionSafe).toBe(true);

    const approvedProviders = [
      'Glova Native Design',
      'Kenney / Lucide',
      'DiceBear (Pablo Stanley)',
      'DiceBear (Lisa Wischofsky)',
      'DiceBear (Dennis Hickman)',
      'LottieFiles / Lottie Open Source',
    ];
    for (const provider of audit.providers) {
      expect(approvedProviders).toContain(provider);
    }
  });

  it('resolves exactly 6 initial rank frames with cute and gaming themes', () => {
    const initialFrames = getInitialRankFrames();
    expect(initialFrames).toHaveLength(6);

    const cuteFrames = initialFrames.filter((f) => f.metadata?.theme === 'cute');
    const gamingFrames = initialFrames.filter((f) => f.metadata?.theme === 'gaming');

    expect(cuteFrames).toHaveLength(3);
    expect(gamingFrames).toHaveLength(3);

    // Cute rank tiers 1, 2, 3
    expect(cuteFrames.map((f) => f.metadata?.rankTier).sort()).toEqual([1, 2, 3]);
    // Gaming rank tiers 1, 2, 3
    expect(gamingFrames.map((f) => f.metadata?.rankTier).sort()).toEqual([1, 2, 3]);
  });

  it('blocks unverified or non-existent asset keys', () => {
    const fake = getAsset('random.unapproved.url');
    expect(fake).toBeNull();
  });

  it('generates safe, structured DiceBear avatar URLs and blocks arbitrary url injection', () => {
    const avatarUrl = resolveDiceBearAvatar('lorelei', 'Student_456', { backgroundColor: 'b6e3f4' });
    expect(avatarUrl).toContain('https://api.dicebear.com/9.x/lorelei/svg');
    expect(avatarUrl).toContain('seed=Student_456');
    expect(avatarUrl).toContain('backgroundColor=b6e3f4');

    // Unapproved style defaults safely to lorelei
    const fallbackUrl = resolveDiceBearAvatar('malicious-injection-style', 'safeSeed');
    expect(fallbackUrl).toContain('https://api.dicebear.com/9.x/lorelei/svg');
  });

  it('resolves rank emblems for all 6 competitive tiers from approved vectors', () => {
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
    for (const tier of tiers) {
      const emblem = getAsset(`rank.emblem.${tier}`);
      expect(emblem).not.toBeNull();
      expect(emblem?.status).toBe('VERIFIED');
      expect(emblem?.commercialUseAllowed).toBe(true);
    }
  });
});
