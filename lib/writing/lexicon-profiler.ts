import { CEFRBand, LexicalDistribution } from './types';
import compactLexicon from './cefr-lexicon-compact.json';

// Type-safe lookup map for the 3,345 verified production vocabulary words
const CEFR_LEXICON_MAP: Record<string, string> = compactLexicon as Record<string, string>;

// Additional C1/C2 Academic Words for high-level recognition
const C1_C2_WORDS = new Set([
  'ubiquitous', 'meticulous', 'unprecedented', 'exacerbate', 'exponential',
  'paradigm', 'imperative', 'predominantly', 'intrinsic', 'proliferation',
  'scrutiny', 'mitigate', 'disseminate', 'unequivocal', 'ubiquity',
  'dichotomy', 'tangible', 'resilience', 'ephemeral', 'cohesive',
  'plausible', 'detrimental', 'inevitable', 'ambiguous', 'indispensable',
  'profound', 'substantiate', 'adversely', 'alleviate', 'coherent',
  'diminish', 'exemplify', 'feasible', 'fluctuate', 'hierarchy',
  'impending', 'lucrative', 'manifest', 'negligible', 'omnipresent',
  'pervasive', 'quintessential', 'redundant', 'scrutinize', 'transient',
  'unfathomable', 'viable', 'voracious', 'whimsical', 'zenith',
  'expediting', 'intricate', 'therapeutic', 'opacity', 'formidable'
]);

// Common lower-level words and their high-tier academic upgrades
const UPGRADE_DICTIONARY: Record<string, { suggestions: string[]; cefr: 'B2' | 'C1' | 'C2' }> = {
  good: { suggestions: ['compelling', 'effective', 'beneficial', 'advantageous'], cefr: 'B2' },
  bad: { suggestions: ['detrimental', 'unfavorable', 'adverse', 'deleterious'], cefr: 'C1' },
  big: { suggestions: ['substantial', 'considerable', 'immense', 'prominent'], cefr: 'B2' },
  small: { suggestions: ['negligible', 'marginal', 'diminutive'], cefr: 'C1' },
  important: { suggestions: ['crucial', 'vital', 'imperative', 'paramount'], cefr: 'B2' },
  help: { suggestions: ['facilitate', 'assist', 'bolster'], cefr: 'B2' },
  show: { suggestions: ['demonstrate', 'illustrate', 'exemplify', 'manifest'], cefr: 'B2' },
  change: { suggestions: ['transform', 'revolutionize', 'modify', 'alter'], cefr: 'B2' },
  make: { suggestions: ['generate', 'produce', 'establish', 'fabricate'], cefr: 'B2' },
  hard: { suggestions: ['challenging', 'arduous', 'formidable'], cefr: 'C1' },
  easy: { suggestions: ['straightforward', 'accessible', 'effortless'], cefr: 'B2' },
  problem: { suggestions: ['obstacle', 'predicament', 'dilemma', 'complication'], cefr: 'B2' },
  stop: { suggestions: ['halt', 'curtail', 'terminate', 'cease'], cefr: 'C1' },
  think: { suggestions: ['contemplate', 'postulate', 'conclude', 'deem'], cefr: 'C1' },
  many: { suggestions: ['numerous', 'copious', 'myriad', 'plethora of'], cefr: 'C1' },
  start: { suggestions: ['initiate', 'commence', 'embark on'], cefr: 'B2' }
};

export function profileLexicon(text: string): LexicalDistribution {
  if (!text || text.trim().length === 0) {
    return {
      a1_a2_percent: 100,
      b1_b2_percent: 0,
      c1_c2_percent: 0,
      advanced_words_found: [],
      suggested_upgrades: []
    };
  }

  // Tokenize words (strip numbers, punctuation)
  const tokens = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !/^\d+$/.test(w));

  if (tokens.length === 0) {
    return {
      a1_a2_percent: 100,
      b1_b2_percent: 0,
      c1_c2_percent: 0,
      advanced_words_found: [],
      suggested_upgrades: []
    };
  }

  let a1A2Count = 0;
  let b1B2Count = 0;
  let c1C2Count = 0;

  const advancedWordsFound = new Set<string>();
  const suggestedUpgradesMap = new Map<string, { original: string; suggestions: string[]; cefr: 'B2' | 'C1' | 'C2' }>();

  for (const token of tokens) {
    // 1. Check compact Oxford 3860 verified vocabulary
    const level = CEFR_LEXICON_MAP[token]?.toUpperCase();

    if (level === 'C1' || level === 'C2' || C1_C2_WORDS.has(token)) {
      c1C2Count++;
      advancedWordsFound.add(token);
    } else if (level === 'B1' || level === 'B2') {
      b1B2Count++;
      if (level === 'B2') {
        advancedWordsFound.add(token);
      }
    } else {
      a1A2Count++;
    }

    // Check upgrade opportunities
    if (UPGRADE_DICTIONARY[token] && !suggestedUpgradesMap.has(token)) {
      suggestedUpgradesMap.set(token, {
        original: token,
        suggestions: UPGRADE_DICTIONARY[token].suggestions,
        cefr: UPGRADE_DICTIONARY[token].cefr
      });
    }
  }

  const total = tokens.length;
  const a1_a2_percent = Number(((a1A2Count / total) * 100).toFixed(1));
  const b1_b2_percent = Number(((b1B2Count / total) * 100).toFixed(1));
  const c1_c2_percent = Number((Math.max(0, 100 - a1_a2_percent - b1_b2_percent)).toFixed(1));

  return {
    a1_a2_percent,
    b1_b2_percent,
    c1_c2_percent,
    advanced_words_found: Array.from(advancedWordsFound).slice(0, 10),
    suggested_upgrades: Array.from(suggestedUpgradesMap.values()).slice(0, 5)
  };
}
