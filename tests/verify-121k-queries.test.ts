import { describe, it, expect } from 'vitest';
import { queryExtendedUniverse } from '@/lib/vocabulary/extended-universe';

describe('121k Extended Vocabulary Universe Query Verification', () => {
  it('correctly returns clean pedagogical translation for animal', () => {
    const res = queryExtendedUniverse({ q: 'animal', pos: 'noun' });
    expect(res.total).toBeGreaterThan(0);
    const item = res.items.find(i => i.word.toLowerCase() === 'animal');
    expect(item).toBeDefined();
    expect(item?.meaning_th).toContain('สัตว์');
    expect(item?.meaning_th).not.toContain('หยาบคาย');
  });

  it('correctly returns clean pedagogical translation for dog', () => {
    const res = queryExtendedUniverse({ q: 'dog', pos: 'noun' });
    expect(res.total).toBeGreaterThan(0);
    const item = res.items.find(i => i.word.toLowerCase() === 'dog');
    expect(item).toBeDefined();
    expect(item?.meaning_th).toContain('สุนัข');
    expect(item?.meaning_th).not.toContain('น่าเบื่อ');
  });

  it('correctly returns clean pedagogical translation for cat', () => {
    const res = queryExtendedUniverse({ q: 'cat', pos: 'noun' });
    expect(res.total).toBeGreaterThan(0);
    const item = res.items.find(i => i.word.toLowerCase() === 'cat');
    expect(item).toBeDefined();
    expect(item?.meaning_th).toContain('แมว');
    expect(item?.meaning_th).not.toContain('คนผู้ชาย');
  });

  it('correctly returns clean pedagogical translation for about', () => {
    const res = queryExtendedUniverse({ q: 'about' });
    expect(res.total).toBeGreaterThan(0);
    const item = res.items.find(i => i.word.toLowerCase() === 'about' && i.part_of_speech === 'preposition');
    expect(item).toBeDefined();
    expect(item?.meaning_th).toContain('เกี่ยวกับ');
  });

  it('correctly returns clean pedagogical translation for general', () => {
    const res = queryExtendedUniverse({ q: 'general', pos: 'adjective' });
    expect(res.total).toBeGreaterThan(0);
    const item = res.items.find(i => i.word.toLowerCase() === 'general');
    expect(item).toBeDefined();
    expect(item?.meaning_th).toContain('ทั่วไป');
  });

  it('correctly returns clean pedagogical translation for common', () => {
    const res = queryExtendedUniverse({ q: 'common', pos: 'adjective' });
    expect(res.total).toBeGreaterThan(0);
    const item = res.items.find(i => i.word.toLowerCase() === 'common');
    expect(item).toBeDefined();
    expect(item?.meaning_th).toContain('ทั่วไป');
  });

  it('correctly resolves previously collapsed MT words (clayware, pumpernickel, angler, hyperextend)', () => {
    const claywareRes = queryExtendedUniverse({ q: 'clayware' });
    const clayware = claywareRes.items.find(i => i.word.toLowerCase() === 'clayware');
    expect(clayware?.meaning_th).toContain('เครื่องปั้นดินเผา');
    expect(clayware?.meaning_th).not.toContain('ซอฟต์แวร์');

    const pumpernickelRes = queryExtendedUniverse({ q: 'pumpernickel' });
    const pumpernickel = pumpernickelRes.items.find(i => i.word.toLowerCase() === 'pumpernickel');
    expect(pumpernickel?.meaning_th).toContain('ขนมปัง');
    expect(pumpernickel?.meaning_th).not.toContain('เครื่องสูบลม');

    const anglerRes = queryExtendedUniverse({ q: 'angler' });
    const angler = anglerRes.items.find(i => i.word.toLowerCase() === 'angler');
    expect(angler?.meaning_th).toContain('ปลา');
    expect(angler?.meaning_th).not.toContain('ช่องสัญญาณ');

    const hyperextendRes = queryExtendedUniverse({ q: 'hyperextend' });
    const hyperextend = hyperextendRes.items.find(i => i.word.toLowerCase() === 'hyperextend');
    expect(hyperextend?.meaning_th).toContain('เหยียด');
    expect(hyperextend?.meaning_th).not.toContain('ความทึบแสง');
  });

  it('has over 120,000 total items in the stats', () => {
    const res = queryExtendedUniverse({ page: 1, pageSize: 5 });
    expect(res.stats.totalUniverseCount).toBeGreaterThan(120000);
    expect(res.stats.tier1VerifiedCount).toBeGreaterThan(3800);
  });
});
