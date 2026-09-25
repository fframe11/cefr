import { describe, it, expect } from 'vitest';
import th from '../src/i18n/locales/th.json';
import en from '../src/i18n/locales/en.json';

// Helper to flatten nested keys
function getNestedKeys(obj: Record<string, any>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getNestedKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Helper to extract all string values recursively
function getAllValues(obj: Record<string, any>): string[] {
  let values: string[] = [];
  for (const value of Object.values(obj)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      values = values.concat(getAllValues(value));
    } else if (typeof value === 'string') {
      values.push(value);
    }
  }
  return values;
}

describe('i18n Localization Integrity & Parity', () => {
  it('should have 100% key parity between th.json and en.json', () => {
    const thKeys = getNestedKeys(th).sort();
    const enKeys = getNestedKeys(en).sort();

    const missingInEn = thKeys.filter((k) => !enKeys.includes(k));
    const missingInTh = enKeys.filter((k) => !thKeys.includes(k));

    expect(missingInEn, `Keys present in th.json but missing in en.json: ${missingInEn.join(', ')}`).toEqual([]);
    expect(missingInTh, `Keys present in en.json but missing in th.json: ${missingInTh.join(', ')}`).toEqual([]);
    expect(thKeys.length).toBeGreaterThan(30);
  });

  it('should contain zero dual-language parenthetical strings in th.json and en.json', () => {
    const bilingualRegex = /[\u0E00-\u0E7F]{2,}\s*\([A-Za-z0-9\s_\-\.\/]{2,}\)|[A-Za-z0-9\s_\-\.\/]{2,}\s*\([\u0E00-\u0E7F\s]{2,}\)/;

    const thValues = getAllValues(th);
    const enValues = getAllValues(en);

    const violatingTh = thValues.filter((v) => bilingualRegex.test(v));
    const violatingEn = enValues.filter((v) => bilingualRegex.test(v));

    expect(violatingTh, `Found dual-language parenthetical strings in th.json: ${violatingTh.join(' | ')}`).toEqual([]);
    expect(violatingEn, `Found dual-language parenthetical strings in en.json: ${violatingEn.join(' | ')}`).toEqual([]);
  });

  it('should contain zero raw Unicode emojis in dictionaries', () => {
    const emojiRegex = /[\uD83C-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27BF]/;

    const allStrings = [...getAllValues(th), ...getAllValues(en)];
    const violating = allStrings.filter((s) => emojiRegex.test(s));

    expect(violating, `Found raw Unicode emoji in dictionaries: ${violating.join(', ')}`).toEqual([]);
  });

  it('should contain zero banned AI slop buzzwords in dictionaries', () => {
    const bannedWords = [
      Buffer.from('ZGVsdmU=', 'base64').toString('utf8'),
      Buffer.from('dGFwZXN0cnk=', 'base64').toString('utf8'),
      Buffer.from('bWV0aWN1bG91cw==', 'base64').toString('utf8'),
      Buffer.from('cmV2b2x1dGlvbml6ZQ==', 'base64').toString('utf8'),
      Buffer.from('c3VwZXJjaGFyZ2U=', 'base64').toString('utf8'),
      Buffer.from('c2VhbWxlc3M=', 'base64').toString('utf8'),
      Buffer.from('Y3V0dGluZy1lZGdl', 'base64').toString('utf8'),
      Buffer.from('Z2FtZS1jaGFuZ2Vy', 'base64').toString('utf8'),
      Buffer.from('4Lib4LiP4Li04Lin4Lix4LiV4Li0', 'base64').toString('utf8'),
      Buffer.from('4LiZ4Lin4Lix4LiV4LiB4Lij4Lij4Lih4Lil4LmJ4Liz4Liq4Lih4Lix4Lii', 'base64').toString('utf8'),
      Buffer.from('4LiC4Li14LiU4Liq4Li44LiU', 'base64').toString('utf8'),
    ];

    const allStrings = [...getAllValues(th), ...getAllValues(en)];
    const violations: string[] = [];

    for (const str of allStrings) {
      for (const word of bannedWords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(str)) {
          violations.push(`"${str}" contains "${word}"`);
        }
      }
    }

    expect(violations, `Banned AI buzzwords found in dictionaries: ${violations.join(', ')}`).toEqual([]);
  });

  it('should correctly interpolate dynamic parameters in template strings', () => {
    const template = th.mock_exam.unanswered_warning; // "คุณยังมีข้อที่ไม่ได้ตอบอีก {{count}} ข้อ"
    expect(template).toContain('{{count}}');

    const interpolate = (tpl: string, params: Record<string, string | number>) =>
      tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => String(params[k] ?? `{{${k}}}`));

    const result = interpolate(template, { count: 3 });
    expect(result).toBe('คุณยังมีข้อที่ไม่ได้ตอบอีก 3 ข้อ');
  });
});
