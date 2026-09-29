import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { getRankEmblemAssets, getAssetByKey } from '../lib/assets/asset-registry';
import { RankEmblem } from '../components/ranked/RankEmblem';
import { RankTier } from '../types/ranked';

describe('Rank Emblems & Asset Registry Integration', () => {
  const TIERS: RankTier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master'];

  it('contains all 6 heraldic rank emblems in the backend Asset Registry', () => {
    const emblems = getRankEmblemAssets();
    expect(emblems).toHaveLength(6);

    for (const tier of TIERS) {
      const assetKey = `rank.emblem.${tier.toLowerCase()}`;
      const found = getAssetByKey(assetKey);
      expect(found).toBeDefined();
      expect(found?.category).toBe('RANK_EMBLEM');
      expect(found?.license).toBeTruthy();
      expect(found?.status).toBe('VERIFIED');
      expect(found?.assetUrl).toContain(tier.toLowerCase());
    }
  });

  it('renders SVG crests cleanly via React SSR for all 6 competitive rank tiers', () => {
    for (const tier of TIERS) {
      const html = renderToString(React.createElement(RankEmblem, { tier, size: 'lg' }));

      expect(html).toContain('<svg');
      expect(html).toContain('viewBox="0 0 100 100"');
      expect(html).toContain('linearGradient');

      // Each tier has custom distinctive heraldic elements
      if (tier === 'Bronze') {
        expect(html).toContain('bronze_shield');
      } else if (tier === 'Silver') {
        expect(html).toContain('silver_shield');
      } else if (tier === 'Gold') {
        expect(html).toContain('gold_crown');
      } else if (tier === 'Platinum') {
        expect(html).toContain('plat_aegis');
      } else if (tier === 'Diamond') {
        expect(html).toContain('diamond_nebula');
      } else if (tier === 'Master') {
        expect(html).toContain('master_fire');
      }
    }
  });

  it('supports different sizes without layout thrashing', () => {
    const smHtml = renderToString(React.createElement(RankEmblem, { tier: 'Gold', size: 'sm' }));
    const xlHtml = renderToString(React.createElement(RankEmblem, { tier: 'Master', size: 'xl' }));

    expect(smHtml).toContain('w-[32px]');
    expect(xlHtml).toContain('w-[92px]');
  });
});
