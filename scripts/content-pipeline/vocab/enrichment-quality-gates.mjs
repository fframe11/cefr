/**
 * enrichment-quality-gates.mjs
 * ==============================================================================
 * Phase 6.2.15 — Deterministic Quality Gates for Vocabulary Enrichment
 *
 * Implements deterministic quality gates to evaluate:
 * 1. Thai Meaning (meaning_th): Rejects synthetic domain templates, boilerplate
 *    phrases, abstract meta-descriptions, and non-Thai noise.
 * 2. Example Sentence (example_sentence): Rejects sentence fragments, missing
 *    terminal punctuation, sub-4-word collocations, boilerplate mad-libs,
 *    and sentences lacking the target word or finite predication.
 * 3. English Meaning (meaning_en): Rejects empty, generic, or truncated definitions.
 * 4. Phonetic IPA (phonetic_ipa): Rejects unresolved, unslashed, or malformed IPA.
 * ==============================================================================
 */

export const BANNED_THAI_TEMPLATE_PREFIXES = [
  'สิ่งประดิษฐ์ อุปกรณ์ หรือโครงสร้างที่ใช้สำหรับ',
  'การปฏิบัติหรือทำให้เกิดผลลัพธ์',
  'ความหมายในบริบทผู้เรียน',
  'อย่างมีลักษณะที่แสดงถึง หรือในทิศทางที่',
  'สภาวะ คุณลักษณะ หรือความรู้สึก',
  'บุคคลหรือผู้ปฏิบัติหน้าที่เกี่ยวข้องกับ',
  'การแสดงออกหรือการสื่อสาร',
  'สัตว์หรือสิ่งมีชีวิต',
  'พืชหรือส่วนประกอบของพืช',
  'สารหรือวัตถุทางกายภาพ',
  'ปรากฏการณ์ธรรมชาติ',
  'กาลเวลา ช่วงเวลา และลำดับเหตุการณ์',
  'กลุ่มคน องค์กร หรือหมวดหมู่ของ',
  'การกระทำหรือกิจกรรมเกี่ยวกับ',
  'อาหาร การปรุงอาหาร และโภชนาการ',
];

export const BANNED_THAI_BOILERPLATE_PHRASES = [
  'ตามนิยามเฉพาะของความหมายนี้',
  'สิ่งของ แนวคิด หรือสภาวะตามนิยามของความหมายนี้',
  'คำนามหมายถึงสิ่งของ แนวคิด หรือสภาวะ',
  'คำกริยาหมายถึงการกระทำ',
  'คำคุณศัพท์หมายถึงลักษณะ',
  'คำวิเศษณ์หมายถึงลักษณะ',
];

export const BANNED_EXAMPLE_PATTERNS = [
  /Understanding the role of .* helps students discuss .* clearly in everyday situations/i,
  /She spoke .* while explaining how the group handled .* yesterday/i,
  /The teacher explained the concept of .* to the class/i,
  /Understanding .* is important for everyday life/i,
];

/**
 * Common English verbal indicators / auxiliaries to help distinguish
 * clausal sentences from bare noun phrases or fragments.
 */
const COMMON_VERB_MARKERS = /(\b(is|are|was|were|has|have|had|do|does|did|can|could|will|would|shall|should|may|might|must|am|been|being)\b|\b[a-z]{3,}(ed|ing)\b|\b(became|become|felt|feel|feels|goes|went|gone|made|make|makes|said|say|says|took|take|takes|came|come|comes|saw|see|sees|gave|give|gives|knew|know|knows|thought|think|thinks|got|get|gets|used|use|uses|found|find|finds|told|tell|tells|asked|ask|asks|seemed|seem|seems|left|leave|leaves|put|puts|brought|bring|brings|kept|keep|keeps|held|hold|holds|turned|turn|turns|began|begin|begins|showed|show|shows|heard|hear|hears|played|play|plays|ran|run|runs|moved|move|moves|liked|like|likes|lived|live|lives|believed|believe|believes|happened|happen|happens|wrote|write|writes|provided|provide|provides|sat|sit|sits|stood|stand|stands|lost|lose|loses|paid|pay|pays|met|meet|meets|care|cared|cares|adopt|adopted|adopts|love|loves|loved|walk|walks|walked|eat|eats|ate|eaten|drink|drinks|drank|drunk)\b)/i;

/**
 * Validates the quality of a Thai definition.
 */
export function validateThaiMeaningQuality(meaningTh, partOfSpeech = null, options = {}) {
  const issues = [];
  let isTemplate = false;

  if (typeof meaningTh !== 'string' || !meaningTh.trim()) {
    return {
      isValid: false,
      issues: ['Thai meaning is empty or not a string'],
      isTemplate: false,
    };
  }

  const trimmed = meaningTh.trim();

  // Length limits
  if (trimmed.length < 2) {
    issues.push(`Thai meaning is too short (${trimmed.length} chars)`);
  }
  if (trimmed.length > 250) {
    issues.push(`Thai meaning is excessively long (${trimmed.length} chars)`);
  }

  // Check banned prefixes
  for (const prefix of BANNED_THAI_TEMPLATE_PREFIXES) {
    if (trimmed.startsWith(prefix) || trimmed.includes(prefix)) {
      issues.push(`Contains banned synthetic domain template prefix: "${prefix}"`);
      isTemplate = true;
      break;
    }
  }

  // Check banned boilerplate phrases
  for (const phrase of BANNED_THAI_BOILERPLATE_PHRASES) {
    if (trimmed.includes(phrase)) {
      issues.push(`Contains banned synthetic boilerplate phrase: "${phrase}"`);
      isTemplate = true;
      break;
    }
  }

  // Must contain Thai characters
  if (!/[\u0E00-\u0E7F]/.test(trimmed)) {
    issues.push('Thai meaning does not contain any Thai characters');
  }

  // Unexplained Latin words check (allow common punctuation and brackets for idioms)
  const nonThaiLatin = trimmed.match(/[a-zA-Z]{3,}/g);
  if (nonThaiLatin && !options.allowEnglishPhrasing) {
    // Check if it's enclosed in parentheses or an idiom explanation
    const hasParentheticalEnglish = /\([a-zA-Z\s\']+\)/.test(trimmed);
    if (!hasParentheticalEnglish) {
      issues.push(`Contains unparenthesized Latin words: "${nonThaiLatin.slice(0, 3).join(', ')}"`);
    }
  }

  // POS alignment heuristics
  if (partOfSpeech) {
    const pos = partOfSpeech.toLowerCase();
    if (pos === 'verb' && (trimmed.startsWith('สิ่งของ') || trimmed.startsWith('อุปกรณ์') || trimmed.startsWith('บุคคล'))) {
      issues.push(`PoS mismatch: word is verb but Thai definition starts with nominal category`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    isTemplate,
  };
}

/**
 * Deterministic detection for bad/synthetic Thai meanings.
 * Detects known synthetic prefixes, suffixes, repeated boilerplate,
 * empty/placeholder values, and PoS structural mismatch.
 */
export function detectBadThaiMeaning(meaningTh, partOfSpeech = null) {
  const quality = validateThaiMeaningQuality(meaningTh, partOfSpeech);
  return {
    isBad: !quality.isValid || quality.isTemplate,
    isTemplate: quality.isTemplate,
    reasons: quality.issues,
  };
}

/**
 * Validates the quality of an example sentence.
 */
export function validateExampleSentenceQuality(sentence, targetWord = null, options = {}) {
  const issues = [];
  let isFragment = false;
  let isBoilerplate = false;

  if (typeof sentence !== 'string' || !sentence.trim()) {
    return {
      isValid: false,
      issues: ['Example sentence is empty or not a string'],
      isFragment: true,
      isBoilerplate: false,
    };
  }

  const trimmed = sentence.trim();

  // Word count check
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 4) {
    issues.push(`Example sentence has fewer than 4 words (${words.length} words: "${trimmed}")`);
    isFragment = true;
  }

  // Terminal punctuation check
  if (!/[.!?]["']?$/.test(trimmed)) {
    issues.push(`Missing terminal punctuation (. ? !): "${trimmed}"`);
    isFragment = true;
  }

  // Capitalization of first character (if standard Latin)
  const firstChar = trimmed.charAt(0);
  if (/[a-z]/.test(firstChar)) {
    issues.push(`First character is lowercase: "${firstChar}"`);
  }

  // Boilerplate templates check
  for (const pattern of BANNED_EXAMPLE_PATTERNS) {
    if (pattern.test(trimmed)) {
      issues.push(`Matches banned synthetic boilerplate pattern: ${pattern}`);
      isBoilerplate = true;
      break;
    }
  }

  // Target word presence check
  if (targetWord && typeof targetWord === 'string' && targetWord.trim()) {
    const cleanTarget = targetWord.trim().toLowerCase();
    // Normalize punctuation for matching
    const normalizedSent = trimmed.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const sentTokens = normalizedSent.split(/\s+/).filter(Boolean);

    // Simple stem/prefix match for inflected forms (e.g. 'walk' in 'walking', 'walks', 'walked')
    const targetRoot = cleanTarget.length > 4 ? cleanTarget.slice(0, 4) : cleanTarget;
    const hasWord = sentTokens.some(token => token === cleanTarget || token.startsWith(targetRoot));

    if (!hasWord && !options.skipTargetWordCheck) {
      issues.push(`Target word "${targetWord}" is not present in example sentence`);
    }
  }

  // Finite predication check
  if (!COMMON_VERB_MARKERS.test(trimmed) && !options.skipVerbCheck) {
    // If it lacks verb markers, it might be a bare noun phrase
    issues.push(`Sentence lacks finite verb or clausal structure (probable phrase fragment): "${trimmed}"`);
    isFragment = true;
  }

  return {
    isValid: issues.length === 0,
    issues,
    isFragment,
    isBoilerplate,
  };
}

/**
 * Validates English definition quality.
 */
export function validateEnglishMeaningQuality(meaningEn) {
  const issues = [];
  if (typeof meaningEn !== 'string' || !meaningEn.trim()) {
    return {
      isValid: false,
      issues: ['English meaning is empty or missing'],
    };
  }

  const trimmed = meaningEn.trim();
  if (trimmed.length < 3) {
    issues.push(`English meaning is too short (${trimmed.length} chars)`);
  }

  if (/^(unknown|n\/a|none|meaning|definition)$/i.test(trimmed)) {
    issues.push(`English meaning is a generic placeholder: "${trimmed}"`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Validates Phonetic IPA quality.
 */
export function validatePhoneticIpaQuality(ipa) {
  const issues = [];
  if (typeof ipa !== 'string' || !ipa.trim()) {
    return {
      isValid: false,
      issues: ['Phonetic IPA is empty or missing'],
    };
  }

  const trimmed = ipa.trim();
  if (trimmed === 'UNRESOLVED' || trimmed === '//') {
    issues.push(`Phonetic IPA is unresolved or empty slashes: "${trimmed}"`);
  }

  if (!trimmed.startsWith('/') || !trimmed.endsWith('/')) {
    issues.push(`Phonetic IPA must start and end with slashes: "${trimmed}"`);
  }

  if (trimmed.length < 3) {
    issues.push(`Phonetic IPA is too short: "${trimmed}"`);
  }

  if (/[A-Z0-9_\$#@]/.test(trimmed.replace(/^\/|\/$/g, ''))) {
    issues.push(`Phonetic IPA contains unexpected uppercase or raw characters: "${trimmed}"`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

/**
 * Evaluates all 4 quality gates on a vocabulary unit record.
 */
export function evaluateRecordQualityGates(record) {
  const thaiResult = validateThaiMeaningQuality(record.meaning_th, record.part_of_speech);
  const exampleResult = validateExampleSentenceQuality(record.example_sentence, record.word || record.lemma);
  const englishResult = validateEnglishMeaningQuality(record.meaning_en);
  const ipaResult = validatePhoneticIpaQuality(record.phonetic_ipa);

  const passesAll = thaiResult.isValid && exampleResult.isValid && englishResult.isValid && ipaResult.isValid;
  const flaggedReasons = [
    ...thaiResult.issues,
    ...exampleResult.issues,
    ...englishResult.issues,
    ...ipaResult.issues,
  ];

  return {
    passesAll,
    gates: {
      thai: thaiResult,
      example: exampleResult,
      english: englishResult,
      ipa: ipaResult,
    },
    flaggedReasons,
  };
}
