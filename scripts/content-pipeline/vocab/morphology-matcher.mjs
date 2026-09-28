/**
 * Phase 6.2.33 — Deterministic Morphology & Inflection Matcher
 *
 * Implements strict, source-backed morphological inflection matching for
 * example sentence verification.
 *
 * Guaranteed Invariants:
 * 1. Zero substring matching / Zero aggressive stemming
 * 2. Zero false-positive derivative matches (e.g. art != article, car != carpet, care != careful, act != action, class != classic)
 * 3. Deterministic irregular verb & noun tables
 * 4. Rich return state: { matched, match_type, matched_token, confidence, reason }
 *    - EXACT_LEMMA
 *    - INFLECTED_FORM
 *    - IRREGULAR_FORM
 *    - NOT_FOUND
 *    - AMBIGUOUS
 * 5. Zero LLM-generated morphology rules
 */

/**
 * Deterministic Irregular Verb Inflection Table (Base -> Set of Past / Participle forms)
 * Backed by standard English lexical grammar (Oxford / Cambridge CEFR standard)
 */
export const IRREGULAR_VERB_MAP = {
  arise: ['arose', 'arisen'],
  be: ['was', 'were', 'been', 'is', 'are', 'am'],
  become: ['became', 'become'],
  begin: ['began', 'begun'],
  bend: ['bent'],
  bite: ['bit', 'bitten'],
  bleed: ['bled'],
  blow: ['blew', 'blown'],
  break: ['broke', 'broken'],
  bring: ['brought'],
  build: ['built'],
  burst: ['burst'],
  buy: ['bought'],
  cast: ['cast'],
  catch: ['caught'],
  choose: ['chose', 'chosen'],
  cling: ['clung'],
  come: ['came', 'come'],
  cost: ['cost'],
  creep: ['crept'],
  cut: ['cut'],
  deal: ['dealt'],
  dig: ['dug'],
  do: ['did', 'done', 'does'],
  draw: ['drew', 'drawn'],
  drink: ['drank', 'drunk'],
  drive: ['drove', 'driven'],
  eat: ['ate', 'eaten'],
  fall: ['fell', 'fallen'],
  feed: ['fed'],
  feel: ['felt'],
  fight: ['fought'],
  find: ['found'],
  flee: ['fled'],
  fly: ['flew', 'flown'],
  forbid: ['forbade', 'forbidden'],
  forget: ['forgot', 'forgotten'],
  forgive: ['forgave', 'forgiven'],
  freeze: ['froze', 'frozen'],
  get: ['got', 'gotten'],
  give: ['gave', 'given'],
  go: ['went', 'gone', 'goes'],
  grow: ['grew', 'grown'],
  hang: ['hung'],
  have: ['had', 'has'],
  hear: ['heard'],
  hide: ['hid', 'hidden'],
  hit: ['hit'],
  hold: ['held'],
  hurt: ['hurt'],
  keep: ['kept'],
  know: ['knew', 'known'],
  lay: ['laid'],
  lead: ['led'],
  leave: ['left'],
  lend: ['lent'],
  let: ['let'],
  lie: ['lay', 'lain'],
  light: ['lit'],
  lose: ['lost'],
  make: ['made'],
  mean: ['meant'],
  meet: ['met'],
  pay: ['paid'],
  put: ['put'],
  quit: ['quit'],
  read: ['read'],
  ride: ['rode', 'ridden'],
  ring: ['rang', 'rung'],
  rise: ['rose', 'risen'],
  run: ['ran', 'run'],
  say: ['said'],
  see: ['saw', 'seen'],
  seek: ['sought'],
  sell: ['sold'],
  send: ['sent'],
  set: ['set'],
  shake: ['shook', 'shaken'],
  shine: ['shone'],
  shoot: ['shot'],
  show: ['showed', 'shown'],
  shut: ['shut'],
  sing: ['sang', 'sung'],
  sink: ['sank', 'sunk'],
  sit: ['sat'],
  sleep: ['slept'],
  slide: ['slid'],
  speak: ['spoke', 'spoken'],
  spend: ['spent'],
  spin: ['spun'],
  spit: ['spat'],
  split: ['split'],
  spread: ['spread'],
  spring: ['sprang', 'sprung'],
  stand: ['stood'],
  steal: ['stole', 'stolen'],
  stick: ['stuck'],
  strike: ['struck'],
  swear: ['swore', 'sworn'],
  sweep: ['swept'],
  swim: ['swam', 'swum'],
  swing: ['swung'],
  take: ['took', 'taken'],
  teach: ['taught'],
  tear: ['tore', 'torn'],
  tell: ['told'],
  think: ['thought'],
  throw: ['threw', 'thrown'],
  thrust: ['thrust'],
  understand: ['understood'],
  wake: ['woke', 'woken'],
  wear: ['wore', 'worn'],
  weave: ['wove', 'woven'],
  weep: ['wept'],
  win: ['won'],
  wind: ['wound'],
  write: ['wrote', 'written']
};

/**
 * Deterministic Irregular Noun Plural Table (Singular -> Set of Plural forms)
 */
export const IRREGULAR_NOUN_MAP = {
  child: ['children'],
  man: ['men'],
  woman: ['women'],
  person: ['people'],
  foot: ['feet'],
  tooth: ['teeth'],
  goose: ['geese'],
  mouse: ['mice'],
  ox: ['oxen'],
  datum: ['data'],
  crisis: ['crises'],
  thesis: ['theses'],
  analysis: ['analyses'],
  criterion: ['criteria'],
  phenomenon: ['phenomena']
};

/**
 * Explicit Blacklist of Known False Derivatives
 * Guaranteed to NEVER match as inflections of base lemmas
 */
export const FALSE_DERIVATIVE_BLACKLIST = new Set([
  'art:article',
  'car:carpet',
  'care:careful',
  'care:carefully',
  'care:careless',
  'act:action',
  'act:active',
  'act:activity',
  'act:actor',
  'act:actress',
  'class:classic',
  'class:classical',
  'cat:caterpillar',
  'dog:dogma',
  'ear:early',
  'pan:panic',
  'war:warn',
  'bar:bark',
  'bar:barrel',
  'bus:business',
  'fat:father',
  'day:daylight'
]);

/**
 * Tokenize sentence into normalized word tokens with punctuation stripped
 * @param {string} text Example sentence
 * @returns {Array<{ token: string, raw: string, index: number }>}
 */
export function tokenizeSentence(text) {
  if (!text || typeof text !== 'string') return [];
  // Split on word boundary, keeping alphanumeric and apostrophes inside words (e.g. they're, president's)
  const regex = /\b[A-Za-z]+(?:'[A-Za-z]+)?\b/g;
  const tokens = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({
      token: match[0].toLowerCase(),
      raw: match[0],
      index: match.index
    });
  }
  return tokens;
}

/**
 * Check if a token is a valid regular noun plural inflection of a lemma
 * @param {string} lemma Base noun
 * @param {string} token Word token
 * @returns {boolean}
 */
export function isRegularNounPlural(lemma, token) {
  if (!lemma || !token || token.length <= lemma.length) return false;

  // 1. Standard -s plural: e.g. day -> days, book -> books, car -> cars
  if (token === `${lemma}s`) return true;

  // 2. Standard -es plural (after s, x, z, ch, sh): e.g. church -> churches, box -> boxes, bus -> buses
  if (token === `${lemma}es`) {
    const end = lemma.slice(-2);
    const lastChar = lemma.slice(-1);
    if (['s', 'x', 'z'].includes(lastChar) || ['ch', 'sh'].includes(end) || lastChar === 'o') {
      return true;
    }
  }

  // 3. -ies plural (consonant + y -> -ies): e.g. city -> cities, party -> parties
  if (lemma.endsWith('y') && lemma.length > 2) {
    const prevChar = lemma[lemma.length - 2];
    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(prevChar);
    if (!isVowel && token === `${lemma.slice(0, -1)}ies`) {
      return true;
    }
  }

  // 4. -ves plural (f/fe -> -ves): e.g. leaf -> leaves, life -> lives
  if (lemma.endsWith('f') && token === `${lemma.slice(0, -1)}ves`) return true;
  if (lemma.endsWith('fe') && token === `${lemma.slice(0, -2)}ves`) return true;

  return false;
}

/**
 * Check if a token is a valid regular verb inflection of a lemma
 * @param {string} lemma Base verb
 * @param {string} token Word token
 * @returns {boolean}
 */
export function isRegularVerbInflection(lemma, token) {
  if (!lemma || !token || token.length < lemma.length) return false;

  // 1. 3rd-person singular -s / -es: e.g. dance -> dances, run -> runs, catch -> catches
  if (token === `${lemma}s`) return true;
  if (token === `${lemma}es`) {
    const end = lemma.slice(-2);
    const lastChar = lemma.slice(-1);
    if (['s', 'x', 'z'].includes(lastChar) || ['ch', 'sh'].includes(end) || lastChar === 'o') {
      return true;
    }
  }
  if (lemma.endsWith('y') && lemma.length > 2) {
    const prevChar = lemma[lemma.length - 2];
    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(prevChar);
    if (!isVowel && token === `${lemma.slice(0, -1)}ies`) return true;
  }

  // 2. Past / Past Participle -ed / -d: e.g. purchase -> purchased, dance -> danced, detect -> detected
  if (lemma.endsWith('e') && token === `${lemma}d`) return true;
  if (token === `${lemma}ed`) return true;
  if (lemma.endsWith('y') && lemma.length > 2) {
    const prevChar = lemma[lemma.length - 2];
    const isVowel = ['a', 'e', 'i', 'o', 'u'].includes(prevChar);
    if (!isVowel && token === `${lemma.slice(0, -1)}ied`) return true;
  }

  // 3. Consonant doubling + ed: e.g. stop -> stopped, plan -> planned, rob -> robbed
  if (lemma.length >= 3) {
    const last = lemma[lemma.length - 1];
    const secondLast = lemma[lemma.length - 2];
    const thirdLast = lemma[lemma.length - 3];
    const isVowel = (c) => ['a', 'e', 'i', 'o', 'u'].includes(c);
    if (!isVowel(last) && !['w', 'x', 'y'].includes(last) && isVowel(secondLast) && !isVowel(thirdLast)) {
      if (token === `${lemma}${last}ed`) return true;
      if (token === `${lemma}${last}ing`) return true;
    }
  }

  // 4. Progressive -ing: e.g. drink -> drinking, go -> going
  if (token === `${lemma}ing`) return true;
  // Silent -e dropped + ing: e.g. dance -> dancing, come -> coming, write -> writing
  if (lemma.endsWith('e') && !lemma.endsWith('ee') && token === `${lemma.slice(0, -1)}ing`) return true;
  // -ie -> -ying: e.g. lie -> lying, die -> dying
  if (lemma.endsWith('ie') && token === `${lemma.slice(0, -2)}ying`) return true;

  return false;
}

/**
 * Deterministic lemma-in-example matcher with morphological and false-positive safety
 *
 * @param {Object} params
 * @param {string} params.lemma The base headword lemma (e.g. "car", "day", "dance", "feel")
 * @param {string} params.pos Part of speech ("noun", "verb", "adjective", "adverb")
 * @param {string} params.example Example sentence text
 * @returns {Object} { matched: boolean, match_type: string, matched_token: string | null, confidence: string, reason: string }
 */
export function matchLemmaInExample({ lemma, pos, example }) {
  if (!lemma || typeof lemma !== 'string') {
    return {
      matched: false,
      match_type: 'NOT_FOUND',
      matched_token: null,
      confidence: 'MISSING',
      reason: 'Missing or invalid lemma parameter'
    };
  }

  if (!example || typeof example !== 'string') {
    return {
      matched: false,
      match_type: 'NOT_FOUND',
      matched_token: null,
      confidence: 'MISSING',
      reason: 'Missing or empty example sentence'
    };
  }

  const normLemma = lemma.trim().toLowerCase();
  const normPos = (pos || '').trim().toLowerCase();
  const tokens = tokenizeSentence(example);

  if (tokens.length === 0) {
    return {
      matched: false,
      match_type: 'NOT_FOUND',
      matched_token: null,
      confidence: 'MISSING',
      reason: 'No tokens extracted from example'
    };
  }

  // 1. Exact Lemma Match
  const exactToken = tokens.find((t) => t.token === normLemma);
  if (exactToken) {
    return {
      matched: true,
      match_type: 'EXACT_LEMMA',
      matched_token: exactToken.raw,
      confidence: 'CONFIRMED',
      reason: `Exact lemma "${normLemma}" matches token "${exactToken.raw}"`
    };
  }

  // 2. Irregular Table Lookup
  if (normPos === 'verb' && IRREGULAR_VERB_MAP[normLemma]) {
    const irregularForms = IRREGULAR_VERB_MAP[normLemma];
    const matchedIrr = tokens.find((t) => irregularForms.includes(t.token));
    if (matchedIrr) {
      return {
        matched: true,
        match_type: 'IRREGULAR_FORM',
        matched_token: matchedIrr.raw,
        confidence: 'CONFIRMED',
        reason: `Irregular verb inflection "${matchedIrr.raw}" of lemma "${normLemma}" confirmed in attested table`
      };
    }
  }

  if (normPos === 'noun' && IRREGULAR_NOUN_MAP[normLemma]) {
    const irregularForms = IRREGULAR_NOUN_MAP[normLemma];
    const matchedIrr = tokens.find((t) => irregularForms.includes(t.token));
    if (matchedIrr) {
      return {
        matched: true,
        match_type: 'IRREGULAR_FORM',
        matched_token: matchedIrr.raw,
        confidence: 'CONFIRMED',
        reason: `Irregular noun plural "${matchedIrr.raw}" of lemma "${normLemma}" confirmed in attested table`
      };
    }
  }

  // 3. Regular Morphological Inflection Checks
  for (const t of tokens) {
    // Defense: False-derivative check
    const blacklistKey = `${normLemma}:${t.token}`;
    if (FALSE_DERIVATIVE_BLACKLIST.has(blacklistKey)) {
      continue; // Blocked: Derivative false positive
    }

    if (normPos === 'noun') {
      if (isRegularNounPlural(normLemma, t.token)) {
        return {
          matched: true,
          match_type: 'INFLECTED_FORM',
          matched_token: t.raw,
          confidence: 'CONFIRMED',
          reason: `Regular noun plural inflection "${t.raw}" matches lemma "${normLemma}"`
        };
      }
    } else if (normPos === 'verb') {
      if (isRegularVerbInflection(normLemma, t.token)) {
        return {
          matched: true,
          match_type: 'INFLECTED_FORM',
          matched_token: t.raw,
          confidence: 'CONFIRMED',
          reason: `Regular verb inflection "${t.raw}" matches lemma "${normLemma}"`
        };
      }
    } else if (normPos === 'adjective' || normPos === 'adverb') {
      // Comparative -er / superlative -est for monosyllabic/disyllabic adjectives
      if (t.token === `${normLemma}er` || t.token === `${normLemma}est`) {
        return {
          matched: true,
          match_type: 'INFLECTED_FORM',
          matched_token: t.raw,
          confidence: 'CONFIRMED',
          reason: `Adjective comparative/superlative inflection "${t.raw}" matches lemma "${normLemma}"`
        };
      }
      if (normLemma.endsWith('e') && (t.token === `${normLemma}r` || t.token === `${normLemma}st`)) {
        return {
          matched: true,
          match_type: 'INFLECTED_FORM',
          matched_token: t.raw,
          confidence: 'CONFIRMED',
          reason: `Adjective comparative/superlative inflection "${t.raw}" matches lemma "${normLemma}"`
        };
      }
    }
  }

  // 4. Check if a false derivative token was present
  const derivativeFound = tokens.find((t) => FALSE_DERIVATIVE_BLACKLIST.has(`${normLemma}:${t.token}`));
  if (derivativeFound) {
    return {
      matched: false,
      match_type: 'NOT_FOUND',
      matched_token: derivativeFound.raw,
      confidence: 'CONFLICT',
      reason: `Blocked false derivative "${derivativeFound.raw}" is not a valid inflection of "${normLemma}"`
    };
  }

  return {
    matched: false,
    match_type: 'NOT_FOUND',
    matched_token: null,
    confidence: 'MISSING',
    reason: `Lemma "${normLemma}" and its valid inflections not found in example tokens`
  };
}
