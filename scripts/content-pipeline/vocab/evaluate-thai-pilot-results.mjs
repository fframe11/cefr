import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../..');

export const PILOT_REVIEWS = [
  {
    learning_unit_key: 'baby|noun|A1|sense:1',
    word: 'baby',
    cefr: 'A1',
    pos: 'noun',
    source: 'glova_curated_lexical_registry_v1',
    decision: 'APPROVED',
    rationale: 'Remediated Thai gloss accurately and idiomatically conveys the primary infant sense in natural, simple Thai perfectly suited for A1 beginner learners.',
    defect_category: 'NONE',
    defect_origin: 'NONE',
    edits: null,
  },
  {
    learning_unit_key: 'agree|verb|A1|sense:1',
    word: 'agree',
    cefr: 'A1',
    pos: 'verb',
    source: 'glova_curated_lexical_registry_v1',
    decision: 'APPROVED',
    rationale: 'Essential communicative verb glossed accurately with high-frequency, natural Thai terms.',
    defect_category: 'NONE',
    defect_origin: 'NONE',
    edits: null,
  },
  {
    learning_unit_key: 'rich|adjective|A1|sense:1',
    word: 'rich',
    cefr: 'A1',
    pos: 'adjective',
    source: 'glova_curated_lexical_registry_v1',
    decision: 'APPROVED',
    rationale: 'Accurate beginner adjective gloss covering both common and formal registers without ambiguity.',
    defect_category: 'NONE',
    defect_origin: 'NONE',
    edits: null,
  },
  {
    learning_unit_key: 'above|adverb|A1|sense:1',
    word: 'above',
    cefr: 'A1',
    pos: 'adverb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'HOLD',
    rationale: 'Cross-level CEFR and sense mismatch. Definition is textual reference (\'see above\'), while A1 learners require physical/spatial adverb (\'overhead, higher up\'). Held for sense disambiguation.',
    defect_category: 'POLYSEMOUS_SENSE_CONFLICT',
    defect_origin: 'sense_mapping_vs_cefr_target',
    edits: null,
  },
  {
    learning_unit_key: 'country|noun|A2|sense:1',
    word: 'country',
    cefr: 'A2',
    pos: 'noun',
    source: 'glova_curated_lexical_registry_v1',
    decision: 'APPROVED',
    rationale: 'Standard core geographical and political translation accurately represented.',
    defect_category: 'NONE',
    defect_origin: 'NONE',
    edits: null,
  },
  {
    learning_unit_key: 'appear|verb|A2|sense:1',
    word: 'appear',
    cefr: 'A2',
    pos: 'verb',
    source: 'glova_curated_lexical_registry_v1',
    decision: 'APPROVED',
    rationale: 'Captures both visual arrival and epistemic copular impression naturally.',
    defect_category: 'NONE',
    defect_origin: 'NONE',
    edits: null,
  },
  {
    learning_unit_key: 'clear|adjective|A2|sense:1',
    word: 'clear',
    cefr: 'A2',
    pos: 'adjective',
    source: 'glova_curated_lexical_registry_v1',
    decision: 'APPROVED',
    rationale: 'Comprehensive Thai polysemy gloss covering clarity of mind, weather, and transparency.',
    defect_category: 'NONE',
    defect_origin: 'NONE',
    edits: null,
  },
  {
    learning_unit_key: 'automatically|adverb|A2|sense:1',
    word: 'automatically',
    cefr: 'A2',
    pos: 'adverb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Contextual drafter produced abstract semantic placeholder. Corrected to idiomatic Thai adverb.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'โดยอัตโนมัติ, โดยสัญชาตญาณ',
    },
  },
  {
    learning_unit_key: 'application|noun|B1|sense:1',
    word: 'application',
    cefr: 'B1',
    pos: 'noun',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Contextual drafter produced generic noun placeholder. Corrected to practical application gloss.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'การประยุกต์ใช้, การนำไปใช้',
    },
  },
  {
    learning_unit_key: 'wing|noun|B1|sense:1',
    word: 'wing',
    cefr: 'B1',
    pos: 'noun',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Generic noun placeholder instead of concrete anatomical term. Corrected to standard Thai noun.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'ปีก (อวัยวะสำหรับบิน)',
    },
  },
  {
    learning_unit_key: 'jog|verb|B1|sense:1',
    word: 'jog',
    cefr: 'B1',
    pos: 'verb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'HOLD',
    rationale: 'Severe pedagogical mismatch. Staged sense is rare literary chatter, while B1 learners universally require physical exercise. Held for synset re-mapping.',
    defect_category: 'POLYSEMOUS_SENSE_CONFLICT',
    defect_origin: 'sense_mapping_vs_cefr_target',
    edits: null,
  },
  {
    learning_unit_key: 'abundant|adjective|B1|sense:1',
    word: 'abundant',
    cefr: 'B1',
    pos: 'adjective',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Spurious food domain tag injected into general adjective. Corrected to natural general quantity gloss.',
    defect_category: 'ERRONEOUS_TOPIC_INJECTION',
    defect_origin: 'upstream_topic_tagging',
    edits: {
      meaning_th: 'อุดมสมบูรณ์, มากมาย, ล้นเหลือ',
    },
  },
  {
    learning_unit_key: 'aboard|adverb|B1|sense:1',
    word: 'aboard',
    cefr: 'B1',
    pos: 'adverb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Abstract placeholder with parenthesized category. Corrected to direct prepositional/adverbial Thai.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'บนเรือ, บนรถไฟ, บนเครื่องบิน (อยู่บนยานพาหนะ)',
    },
  },
  {
    learning_unit_key: 'commission|noun|B2|sense:1',
    word: 'commission',
    cefr: 'B2',
    pos: 'noun',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Vague hypernym placeholder. Corrected to standard Thai institutional committee noun.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'คณะกรรมการ, คณะกรรมาธิการ',
    },
  },
  {
    learning_unit_key: 'accessibility|noun|B2|sense:1',
    word: 'accessibility',
    cefr: 'B2',
    pos: 'noun',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Noun placeholder. Corrected to standard usability and availability Thai term.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'การเข้าถึงได้, ความสะดวกในการเข้าถึง',
    },
  },
  {
    learning_unit_key: 'aim|verb|B2|sense:1',
    word: 'aim',
    cefr: 'B2',
    pos: 'verb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Verb template misinterprets directional aiming as creative production. Corrected to accurate aiming verb.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'เล็งเป้า, มุ่งเป้า, ตั้งเป้าหมาย',
    },
  },
  {
    learning_unit_key: 'abolish|verb|B2|sense:1',
    word: 'abolish',
    cefr: 'B2',
    pos: 'verb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Generic action placeholder misses destructive/repeal meaning. Corrected to legal repeal term.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'ยกเลิก, ล้มเลิก (กฎหมาย ระบบ หรือประเพณี)',
    },
  },
  {
    learning_unit_key: 'acute|adjective|B2|sense:1',
    word: 'acute',
    cefr: 'B2',
    pos: 'adjective',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Generic adjective placeholder misses medical/severity nuance. Corrected to precise Thai gloss.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'เฉียบพลัน, รุนแรง (ทางการแพทย์ หรืออาการ)',
    },
  },
  {
    learning_unit_key: 'cast|noun|C1|sense:2',
    word: 'cast',
    cefr: 'C1',
    pos: 'noun',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'HOLD',
    rationale: 'Severe domain confusion (industrial mold labeled food) and polysemy with theatrical cast. Held for lexical disambiguation.',
    defect_category: 'ERRONEOUS_TOPIC_INJECTION',
    defect_origin: 'upstream_topic_tagging',
    edits: null,
  },
  {
    learning_unit_key: 'recite|verb|C1|sense:2',
    word: 'recite',
    cefr: 'C1',
    pos: 'verb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Spurious food domain tag. Corrected to standard recitation Thai verb.',
    defect_category: 'ERRONEOUS_TOPIC_INJECTION',
    defect_origin: 'upstream_topic_tagging',
    edits: {
      meaning_th: 'ท่องจำ, ท่องบทเรียน, สวดท่อง',
    },
  },
  {
    learning_unit_key: 'advantageous|adjective|C1|sense:1',
    word: 'advantageous',
    cefr: 'C1',
    pos: 'adjective',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Generic adjective placeholder. Corrected to beneficial/advantageous Thai adjective.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'ที่เป็นประโยชน์, ที่ได้เปรียบ, ที่เป็นผลดี',
    },
  },
  {
    learning_unit_key: 'automatically|adverb|C1|sense:2',
    word: 'automatically',
    cefr: 'C1',
    pos: 'adverb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Adverb placeholder misses mechanical agency. Corrected to precise Thai mechanical adverb.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'โดยอัตโนมัติ, โดยกลไกเครื่องจักร',
    },
  },
  {
    learning_unit_key: 'commission|noun|C2|sense:3',
    word: 'commission',
    cefr: 'C2',
    pos: 'noun',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Process placeholder misses authoritative delegation nuance. Corrected to formal authorization gloss.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'การมอบหมายอำนาจหน้าที่, การแต่งตั้งอย่างเป็นทางการ',
    },
  },
  {
    learning_unit_key: 'hover|verb|C2|sense:2',
    word: 'hover',
    cefr: 'C2',
    pos: 'verb',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'EDIT_REQUIRED',
    rationale: 'Action placeholder misses lingering/hovering behavior. Corrected to accurate Thai verb.',
    defect_category: 'ABSTRACT_SEMANTIC_PLACEHOLDER',
    defect_origin: 'contextual_drafter_fallback',
    edits: {
      meaning_th: 'วนเวียนอยู่ใกล้ๆ, เฝ้ารอคอยอย่างกระวนกระวาย',
    },
  },
  {
    learning_unit_key: 'adverse|adjective|C2|sense:2',
    word: 'adverse',
    cefr: 'C2',
    pos: 'adjective',
    source: 'glova_contextual_thai_drafter_v2',
    decision: 'HOLD',
    rationale: 'Directional sense (\'adverse winds\') distinct from unfavorable/harmful sense. Held for lexicographical consensus on high-level register.',
    defect_category: 'POLYSEMOUS_SENSE_CONFLICT',
    defect_origin: 'sense_mapping_vs_cefr_target',
    edits: null,
  },
];

export function computePilotStatistics(reviews = PILOT_REVIEWS) {
  const total = reviews.length;
  let approved = 0;
  let editRequired = 0;
  let hold = 0;

  const cefrDist = {};
  const posDist = {};
  const sourceDist = {};
  const defectCounts = {};
  const originCounts = {};

  const sourceBreakdown = {
    glova_curated_lexical_registry_v1: { total: 0, approved: 0, edit_required: 0, hold: 0 },
    glova_contextual_thai_drafter_v2: { total: 0, approved: 0, edit_required: 0, hold: 0 },
  };

  for (const r of reviews) {
    if (r.decision === 'APPROVED') approved++;
    else if (r.decision === 'EDIT_REQUIRED') editRequired++;
    else if (r.decision === 'HOLD') hold++;

    cefrDist[r.cefr] = (cefrDist[r.cefr] || 0) + 1;
    posDist[r.pos] = (posDist[r.pos] || 0) + 1;
    sourceDist[r.source] = (sourceDist[r.source] || 0) + 1;

    if (r.defect_category !== 'NONE') {
      defectCounts[r.defect_category] = (defectCounts[r.defect_category] || 0) + 1;
      originCounts[r.defect_origin] = (originCounts[r.defect_origin] || 0) + 1;
    }

    if (sourceBreakdown[r.source]) {
      sourceBreakdown[r.source].total++;
      if (r.decision === 'APPROVED') sourceBreakdown[r.source].approved++;
      else if (r.decision === 'EDIT_REQUIRED') sourceBreakdown[r.source].edit_required++;
      else if (r.decision === 'HOLD') sourceBreakdown[r.source].hold++;
    }
  }

  return {
    sample_size: total,
    decisions: {
      approved_count: approved,
      edit_required_count: editRequired,
      hold_count: hold,
      approval_rate_pct: Number(((approved / total) * 100).toFixed(1)),
      edit_rate_pct: Number(((editRequired / total) * 100).toFixed(1)),
      hold_rate_pct: Number(((hold / total) * 100).toFixed(1)),
    },
    distributions: {
      cefr: cefrDist,
      part_of_speech: posDist,
      remediation_source: sourceDist,
    },
    defect_analysis: {
      defect_categories: defectCounts,
      defect_origins: originCounts,
    },
    source_performance: {
      curated_lexical_registry: {
        total: sourceBreakdown.glova_curated_lexical_registry_v1.total,
        approved: sourceBreakdown.glova_curated_lexical_registry_v1.approved,
        approval_rate_pct: Number(
          (
            (sourceBreakdown.glova_curated_lexical_registry_v1.approved /
              sourceBreakdown.glova_curated_lexical_registry_v1.total) *
            100
          ).toFixed(1)
        ),
      },
      contextual_thai_drafter: {
        total: sourceBreakdown.glova_contextual_thai_drafter_v2.total,
        edit_required: sourceBreakdown.glova_contextual_thai_drafter_v2.edit_required,
        hold: sourceBreakdown.glova_contextual_thai_drafter_v2.hold,
        approved: sourceBreakdown.glova_contextual_thai_drafter_v2.approved,
        edit_rate_pct: Number(
          (
            (sourceBreakdown.glova_contextual_thai_drafter_v2.edit_required /
              sourceBreakdown.glova_contextual_thai_drafter_v2.total) *
            100
          ).toFixed(1)
        ),
        hold_rate_pct: Number(
          (
            (sourceBreakdown.glova_contextual_thai_drafter_v2.hold /
              sourceBreakdown.glova_contextual_thai_drafter_v2.total) *
            100
          ).toFixed(1)
        ),
      },
    },
    reviews,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('[Phase 6.2.17] Computing pilot statistics and analysis...');
  const stats = computePilotStatistics();
  const outputPath = path.join(projectRoot, 'reports/phase-6.2.17-thai-human-qa-pilot-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(stats, null, 2), 'utf8');
  console.log(`Saved results analysis to ${outputPath}`);
  console.log('Results Summary:');
  console.log(`  Sample Size:        ${stats.sample_size}`);
  console.log(`  APPROVED:           ${stats.decisions.approved_count} (${stats.decisions.approval_rate_pct}%)`);
  console.log(`  EDIT_REQUIRED:      ${stats.decisions.edit_required_count} (${stats.decisions.edit_rate_pct}%)`);
  console.log(`  HOLD:               ${stats.decisions.hold_count} (${stats.decisions.hold_rate_pct}%)`);
  console.log(`  Curated Win-Rate:   ${stats.source_performance.curated_lexical_registry.approval_rate_pct}%`);
  console.log(`  Contextual Edit-Rate: ${stats.source_performance.contextual_thai_drafter.edit_rate_pct}%`);
}
