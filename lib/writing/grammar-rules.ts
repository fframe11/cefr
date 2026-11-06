import { GrammarIssue } from './types';

interface GrammarRulePattern {
  id: string;
  regex: RegExp;
  getReplacement: (match: RegExpExecArray) => string;
  getExplanationTh: (match: RegExpExecArray) => string;
}

const GRAMMAR_RULES: GrammarRulePattern[] = [
  // 1. Subject-Verb Agreement (Plural Noun + Singular Verb)
  {
    id: 'SUBJECT_VERB_AGREEMENT',
    regex: /\b(technologies|devices|students|people|children|scientists|governments|problems|solutions|factors|reasons)\s+(has|is|was|does)\b/gi,
    getReplacement: (m) => {
      const noun = m[1];
      const verb = m[2].toLowerCase();
      const newVerb = verb === 'has' ? 'have' : verb === 'is' ? 'are' : verb === 'was' ? 'were' : 'do';
      return `${noun} ${newVerb}`;
    },
    getExplanationTh: (m) => `ประธาน '${m[1]}' เป็นรูปพหูพจน์ กริยาช่วยต้องใช้รูปพหูพจน์ที่สอดคล้องกัน`
  },
  // 2. Subject-Verb Agreement (Singular/Pronoun + 'have' instead of 'has')
  {
    id: 'SUBJECT_VERB_AGREEMENT',
    regex: /\b(he|she|it|everyone|everybody|nobody|each|technology|society|government)\s+(have)\b/gi,
    getReplacement: (m) => `${m[1]} has`,
    getExplanationTh: (m) => `ประธานเอกพจน์บุรุษที่ 3 '${m[1]}' ต้องใช้กริยาช่วย 'has' ในรูป Present Simple`
  },
  // 3. Double Modals: can able to
  {
    id: 'MODAL_VERB_REDUNDANCY',
    regex: /\b(can\s+able\s+to)\b/gi,
    getReplacement: () => 'can',
    getExplanationTh: () => "'can' และ 'able to' มีความหมายแสดงความสามารถซ้ำซ้อนกัน ให้เลือกใช้ 'can' หรือ 'is/are able to'"
  },
  // 4. Modal + to infinitive: must to, should to
  {
    id: 'MODAL_INFINITIVE_ERROR',
    regex: /\b(must|should|could|would|might)\s+to\s+([a-z]+)\b/gi,
    getReplacement: (m) => `${m[1]} ${m[2]}`,
    getExplanationTh: (m) => `กริยาช่วย Modal verb '${m[1]}' ต้องตามด้วย Bare Infinitive (กริยาไม่ผันและไม่มี to)`
  },
  // 5. Preposition: depend of -> depend on
  {
    id: 'PREPOSITION_COLLOCATION',
    regex: /\b(depend|depends|depended|depending)\s+of\b/gi,
    getReplacement: (m) => `${m[1]} on`,
    getExplanationTh: () => "กริยา 'depend' ต้องใช้คู่กับบุพบท 'on' หรือ 'upon' เสมอ (depend on)"
  },
  // 6. Preposition: interested for -> interested in
  {
    id: 'PREPOSITION_COLLOCATION',
    regex: /\b(interested)\s+for\b/gi,
    getReplacement: () => 'interested in',
    getExplanationTh: () => "คุณศัพท์ 'interested' ต้องใช้คู่กับบุพบท 'in' (interested in)"
  },
  // 7. Preposition: discuss about -> discuss
  {
    id: 'VERB_TRANSITIVITY_ERROR',
    regex: /\b(discuss|discusses|discussed|discussing)\s+about\b/gi,
    getReplacement: (m) => m[1],
    getExplanationTh: () => "กริยา 'discuss' เป็น Transitive verb (สกรรมกริยา) สามารถตามด้วยกรรมได้ทันทีโดยไม่ต้องมี 'about'"
  },
  // 8. Fixed Phrase: in the other hand -> on the other hand
  {
    id: 'IDIOMATIC_USAGE',
    regex: /\b(in\s+the\s+other\s+hand)\b/gi,
    getReplacement: () => 'on the other hand',
    getExplanationTh: () => "สำนวนคำเชื่อมเปรียบเทียบที่ถูกต้องตามมาตรฐานคือ 'on the other hand'"
  },
  // 9. Uncountable Nouns: many informations / many advices
  {
    id: 'UNCOUNTABLE_NOUN_ERROR',
    regex: /\b(many\s+informations?)\b/gi,
    getReplacement: () => 'a lot of information',
    getExplanationTh: () => "'information' เป็นคำนามนับไม่ได้ (uncountable) ห้ามเติม -s หรือใช้กับ 'many'"
  },
  {
    id: 'UNCOUNTABLE_NOUN_ERROR',
    regex: /\b(many\s+advices?)\b/gi,
    getReplacement: () => 'a lot of advice',
    getExplanationTh: () => "'advice' เป็นคำนามนับไม่ได้ ห้ามเติม -s ควรใช้ 'a lot of advice' หรือ 'pieces of advice'"
  },
  // 10. Article a/an phonetics: an unique -> a unique
  {
    id: 'ARTICLE_PHONETICS',
    regex: /\b(an)\s+(unique|universal|university|useful|uniform)\b/gi,
    getReplacement: (m) => `a ${m[2]}`,
    getExplanationTh: (m) => `คำว่า '${m[2]}' ขึ้นต้นด้วยเสียงพยัญชนะ /j/ (y-sound) จึงต้องใช้ article 'a' ไม่ใช่ 'an'`
  },
  // 11. Article a/an phonetics: a honest -> an honest
  {
    id: 'ARTICLE_PHONETICS',
    regex: /\b(a)\s+(honest|hour|honor|honourable)\b/gi,
    getReplacement: (m) => `an ${m[2]}`,
    getExplanationTh: (m) => `คำว่า '${m[2]}' ตัว 'h' ไม่ออกเสียง (Silent h) เริ่มต้นด้วยเสียงสระ จึงต้องใช้ article 'an'`
  },
  // 12. Gerund after preposition: look forward to + V.ing
  {
    id: 'GERUND_PREPOSITION',
    regex: /\b(look\s+forward\s+to)\s+([a-z]+(?<!ing))\b/gi,
    getReplacement: (m) => {
      const verb = m[2];
      // Basic ing conversion
      const ingVerb = verb.endsWith('e') ? `${verb.slice(0, -1)}ing` : `${verb}ing`;
      return `look forward to ${ingVerb}`;
    },
    getExplanationTh: () => "สำนวน 'look forward to' คำว่า 'to' เป็น Preposition จึงต้องตามด้วย Gerund (V.ing) หรือคำนาม"
  },
  // 13. Thai-English Transfer: open/close the light
  {
    id: 'L1_TRANSFER_COLLOCATION',
    regex: /\b(open|close)\s+the\s+(light|lights)\b/gi,
    getReplacement: (m) => {
      const action = m[1].toLowerCase() === 'open' ? 'turn on' : 'turn off';
      return `${action} the ${m[2]}`;
    },
    getExplanationTh: (m) => `การเปิด/ปิดอุปกรณ์ไฟฟ้าในภาษาอังกฤษใช้ '${m[1].toLowerCase() === 'open' ? 'turn on' : 'turn off'}' แทน 'open/close'`
  }
];

export function detectGrammarIssues(text: string): GrammarIssue[] {
  if (!text || text.trim().length === 0) return [];

  const issues: GrammarIssue[] = [];

  for (const rule of GRAMMAR_RULES) {
    const rx = new RegExp(rule.regex.source, rule.regex.flags);
    let match: RegExpExecArray | null;

    while ((match = rx.exec(text)) !== null) {
      issues.push({
        offset: match.index,
        length: match[0].length,
        original_text: match[0],
        replacement: rule.getReplacement(match),
        rule_id: rule.id,
        explanation_th: rule.getExplanationTh(match)
      });
    }
  }

  // Sort issues by offset ascending
  return issues.sort((a, b) => (a.offset ?? 0) - (b.offset ?? 0));
}
