import { describe, it, expect } from 'vitest';
import { queryExtendedUniverse, getCandidateById } from '../lib/vocabulary/extended-universe';
import { getAllProductionVocabulary } from '../lib/vocabulary/production-vocabulary';

describe('GLOVA Tiered Vocabulary Scale-Up & Integrity Gate', () => {
  it('preserves the 3,860 verified production seed without regression', () => {
    const seed = getAllProductionVocabulary();
    expect(seed).toBeDefined();
    expect(seed.length).toBe(3860);
    // Spot check a known verified item
    const schedule = seed.find((item) => item.word.toLowerCase() === 'schedule');
    expect(schedule).toBeDefined();
    expect(schedule?.lifecycle_status).toBe('VERIFIED_PRODUCTION');
  });

  it('provides access to the extended candidate universe (> 100,000 candidates)', () => {
    const res = queryExtendedUniverse({ page: 1, pageSize: 10 });
    expect(res).toBeDefined();
    expect(res.stats.totalUniverseCount).toBeGreaterThanOrEqual(100000);
    expect(res.stats.tier1VerifiedCount).toBeGreaterThanOrEqual(3800);
    expect(res.stats.tier2CandidateCount).toBeGreaterThanOrEqual(100000);
    expect(res.items.length).toBe(10);
  });

  it('filters by CEFR level platform estimate without claiming official Cambridge status', () => {
    const b2Res = queryExtendedUniverse({ cefr: 'B2', pageSize: 5 });
    expect(b2Res.items.length).toBeGreaterThan(0);
    for (const item of b2Res.items) {
      expect(item.cefr_level).toBe('B2');
      expect(item.cefr_disclaimer).toBeDefined();
      if (item.tier === 'TIER_2_CANDIDATE') {
        expect(item.cefr_disclaimer).toContain('Platform Classification Estimate');
      }
    }
  });

  it('supports prefix and keyword search across headword and lemmas', () => {
    const searchRes = queryExtendedUniverse({ q: 'journey', pageSize: 5 });
    expect(searchRes.items.length).toBeGreaterThan(0);
    const found = searchRes.items.some((item) => item.word.toLowerCase().includes('journey'));
    expect(found).toBe(true);
  });

  it('supports domain and part of speech filtering', () => {
    const verbRes = queryExtendedUniverse({ pos: 'verb', pageSize: 5 });
    expect(verbRes.items.length).toBe(5);
    for (const item of verbRes.items) {
      expect(item.part_of_speech).toBe('verb');
    }
  });
});
