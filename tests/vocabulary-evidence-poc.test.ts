import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CefrJAdapter,
  OewnAdapter,
  LexitronAdapter,
  CmudictAdapter,
  FrequencyAdapter,
} from '../scripts/content-pipeline/vocab/evidence-adapters.mjs';
import {
  evaluateUnitEvidence,
  runEvidencePocPipeline,
  DECISION_GATES,
  REASON_CODES,
  BANNED_THAI_TEMPLATES,
  BANNED_EXAMPLE_SYNTHETIC,
} from '../scripts/content-pipeline/vocab/evidence-pipeline-poc.mjs';
import {
  verifyPhase6231EvidencePoc,
  REQUIRED_MANIFEST_FIELDS,
  REQUIRED_REPORT_RECORD_FIELDS,
} from '../scripts/content-pipeline/vocab/verify-phase-6231-evidence-poc.mjs';

const projectRoot = path.resolve(__dirname, '..');

describe('Phase 6.2.31 — Evidence-First Vocabulary Alignment POC (100 words)', () => {
  const adapters = {
    cefrj: new CefrJAdapter(projectRoot),
    oewn: new OewnAdapter(projectRoot),
    lexitron: new LexitronAdapter(projectRoot),
    cmudict: new CmudictAdapter(projectRoot),
    freq: new FrequencyAdapter(projectRoot),
  };

  it('1. exact match: verifies 5-source exact match produces complete evidence matrix', () => {
    const cj = adapters.cefrj.getEvidence('car', 'noun');
    expect(cj.matched).toBe(true);
    expect(cj.evidence.cefr_level).toBe('A1');
    expect(cj.provenance.license).toBe('TUFS-CEFR-J-Permissive');

    const oewn = adapters.oewn.getEvidence('car', 'noun', '03005594-n');
    expect(oewn.matched).toBe(true);
    expect(oewn.evidence.synset_id).toBe('03005594-n');
    expect(oewn.provenance.license).toBe('CC-BY-4.0');

    const lex = adapters.lexitron.getEvidence('car', 'noun');
    expect(lex.matched).toBe(true);
    expect(lex.evidence.pos_matched).toBe(true);
    expect(lex.evidence.translations).toContain('รถยนต์');

    const cmu = adapters.cmudict.getEvidence('car');
    expect(cmu.matched).toBe(true);
    expect(cmu.evidence.phonetic_ipa).toBe('/kɑːɹ/');

    const freq = adapters.freq.getEvidence('car');
    expect(freq.matched).toBe(true);
    expect(freq.evidence.list_name).toBe('NGSL');
    expect(freq.evidence.rank).toBe(260);
  });

  it('2. POS mismatch: detects mismatch between headword POS and source category', () => {
    // 'car' is a noun, not a verb
    const cj = adapters.cefrj.getEvidence('car', 'verb');
    expect(cj.matched).toBe(false);
    expect(cj.reason).toBe('NOT_FOUND');

    const lex = adapters.lexitron.getEvidence('car', 'verb');
    expect(lex.evidence.pos_matched).toBe(false);
  });

  it('3. CEFR mismatch: detects discrepancy between staged CEFR level and CEFR-J evidence', () => {
    const mockManifest = {
      sequence: 999,
      learning_unit_key: 'car|noun|C2|sense:1',
      word: 'car',
      part_of_speech: 'noun',
      cefr_level: 'C2', // artificially elevated to C2
      sense_index: 1,
      source_batch: 'LARGE-015',
    };
    const mockFullRecord = {
      word: 'car',
      part_of_speech: 'noun',
      meaning_th: 'รถยนต์',
      phonetic_ipa: '/kɑːɹ/',
      example_sentence: 'he needs a car to get around',
      provenance: { source: 'cefr_j', source_version: '1.5', license: 'TUFS' },
    };

    const evaluated = evaluateUnitEvidence(mockManifest, mockFullRecord, adapters);
    expect(evaluated.evidence_matrix.cefr_j.status).toBe('CONFLICT');
    expect(evaluated.confidence_decision).toBe(DECISION_GATES.HOLD);
    expect(evaluated.reason_codes).toContain(REASON_CODES.CEFR_CONFLICT);
  });

  it('4. sense mismatch: detects theological, biographical, or cross-domain sense corruptions', () => {
    // 4.1 'father' with Catholic priest sense
    const fatherMock = {
      sequence: 1,
      learning_unit_key: 'father|noun|A1|sense:1',
      word: 'father',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-001',
    };
    const fatherRec = {
      word: 'father',
      part_of_speech: 'noun',
      oewn_synset_id: '10261566-n', // priest title
      meaning_th: 'สิ่ง มโนทัศน์ หรือหัวข้อที่กล่าวถึง',
      phonetic_ipa: '/ˈfɑːðəɹ/',
      example_sentence: 'hear our prayers, Heavenly Father',
      provenance: { source: 'cefr_j', source_version: '1.5', license: 'TUFS' },
    };
    const evalFather = evaluateUnitEvidence(fatherMock, fatherRec, adapters);
    expect(evalFather.alignment_results.sense).toBe('SENSE_CONFLICT');
    expect(evalFather.confidence_decision).toBe(DECISION_GATES.HOLD);
    expect(evalFather.reason_codes).toContain(REASON_CODES.SENSE_CONFLICT);

    // 4.2 'day' with Clarence Day biographical author sense
    const dayMock = {
      sequence: 2,
      learning_unit_key: 'day|noun|A1|sense:1',
      word: 'day',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-001',
    };
    const dayRec = {
      word: 'day',
      part_of_speech: 'noun',
      oewn_synset_id: '11137648-n', // Clarence Day
      meaning_th: 'วัน, เวลา 24 ชั่วโมง',
      phonetic_ipa: '/deɪ/',
      example_sentence: 'seven days in a week',
      provenance: { source: 'cefr_j', source_version: '1.5', license: 'TUFS' },
    };
    const evalDay = evaluateUnitEvidence(dayMock, dayRec, adapters);
    expect(evalDay.alignment_results.sense).toBe('SENSE_CONFLICT');
    expect(evalDay.confidence_decision).toBe(DECISION_GATES.HOLD);
  });

  it('5. LEXiTRON missing: handles words not present in LEXiTRON without guessing', () => {
    const lex = adapters.lexitron.getEvidence('nonexistentlexicaltokenxyz', 'noun');
    expect(lex.matched).toBe(false);
    expect(lex.reason).toBe('NOT_FOUND');
  });

  it('6. multiple Thai translations: flags THAI_MULTI_SENSE when word has >=3 distinct glosses', () => {
    // 'run' has multiple senses in Lexitron
    const lex = adapters.lexitron.getEvidence('run', 'verb');
    expect(lex.matched).toBe(true);
    expect(lex.evidence.translations.length).toBeGreaterThanOrEqual(3);

    const runMock = {
      sequence: 3,
      learning_unit_key: 'run|verb|A1|sense:1',
      word: 'run',
      part_of_speech: 'verb',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-001',
    };
    const runRec = {
      word: 'run',
      part_of_speech: 'verb',
      meaning_th: 'วิ่ง',
      phonetic_ipa: '/ɹʌn/',
      example_sentence: 'he can run fast',
      provenance: { source: 'cefr_j', source_version: '1.5', license: 'TUFS' },
    };
    const evalRun = evaluateUnitEvidence(runMock, runRec, adapters);
    expect(evalRun.alignment_results.thai).toBe('THAI_MULTI_SENSE');
    expect(evalRun.reason_codes).toContain(REASON_CODES.THAI_MULTI_SENSE);
  });

  it('7. CMUdict multiple pronunciation: flags IPA_MULTI_VARIANT or IPA_AMBIGUOUS on heteronyms', () => {
    const readMock = {
      sequence: 4,
      learning_unit_key: 'read|verb|A1|sense:1',
      word: 'read',
      part_of_speech: 'verb',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-001',
    };
    const readRec = {
      word: 'read',
      part_of_speech: 'verb',
      meaning_th: 'อ่าน',
      phonetic_ipa: '/ɹiːd/',
      example_sentence: 'she can read books',
      provenance: { source: 'cefr_j', source_version: '1.5', license: 'TUFS' },
    };
    const evalRead = evaluateUnitEvidence(readMock, readRec, adapters);
    expect(evalRead.alignment_results.ipa).toBe('IPA_AMBIGUOUS');
    expect(evalRead.confidence_decision).toBe(DECISION_GATES.REVIEW_REQUIRED);
    expect(evalRead.reason_codes).toContain(REASON_CODES.IPA_AMBIGUOUS);
  });

  it('8. example conflict: flags synthetic boilerplate or missing target word', () => {
    const mock = {
      sequence: 5,
      learning_unit_key: 'college|noun|A1|sense:1',
      word: 'college',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-001',
    };
    const recSynthetic = {
      word: 'college',
      part_of_speech: 'noun',
      meaning_th: 'วิทยาลัย',
      phonetic_ipa: '/ˈkɑːlɪdʒ/',
      example_sentence: 'The institution serves as a representative example of college within higher education.',
      provenance: { source: 'cefr_j', source_version: '1.5', license: 'TUFS' },
    };
    const evalSyn = evaluateUnitEvidence(mock, recSynthetic, adapters);
    expect(evalSyn.alignment_results.example).toBe('EXAMPLE_CONFLICT');
    expect(evalSyn.confidence_decision).toBe(DECISION_GATES.HOLD);
    expect(evalSyn.reason_codes).toContain(REASON_CODES.EXAMPLE_CONFLICT);

    // Missing target word
    const recNoWord = {
      ...recSynthetic,
      example_sentence: 'The students attended lectures every morning.',
    };
    const evalNoWord = evaluateUnitEvidence(mock, recNoWord, adapters);
    expect(evalNoWord.alignment_results.example).toBe('EXAMPLE_CONFLICT');
  });

  it('9. provenance missing: flags incomplete source traceability as HOLD', () => {
    const mock = {
      sequence: 6,
      learning_unit_key: 'car|noun|A1|sense:1',
      word: 'car',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-015',
    };
    const recNoProv = {
      word: 'car',
      part_of_speech: 'noun',
      meaning_th: 'รถยนต์',
      phonetic_ipa: '/kɑːɹ/',
      example_sentence: 'he needs a car to get around',
      provenance: null, // missing provenance
    };
    const evalProv = evaluateUnitEvidence(mock, recNoProv, adapters);
    expect(evalProv.confidence_decision).toBe(DECISION_GATES.HOLD);
    expect(evalProv.reason_codes).toContain(REASON_CODES.PROVENANCE_INCOMPLETE);
  });

  it('10. source unavailable or malformed record: fail-closed safety invariant', () => {
    const mock = {
      sequence: 7,
      learning_unit_key: 'ghost|noun|A1|sense:1',
      word: 'ghost',
      part_of_speech: 'noun',
      cefr_level: 'A1',
      sense_index: 1,
      source_batch: 'LARGE-999',
    };
    const evalMalformed = evaluateUnitEvidence(mock, null, adapters);
    expect(evalMalformed.confidence_decision).toBe(DECISION_GATES.HOLD);
    expect([DECISION_GATES.HOLD, DECISION_GATES.REVIEW_REQUIRED]).toContain(evalMalformed.confidence_decision);
    expect(evalMalformed.confidence_decision).not.toBe(DECISION_GATES.AUTO_READY);
  });

  it('11. verifies full 100-record POC manifest and report parity and gate PASS', () => {
    const result = verifyPhase6231EvidencePoc({ projectRoot });
    expect(result.passed).toBe(true);
    expect(result.metrics.totalRecords).toBe(100);
    expect(result.metrics.oewnCoverage).toBe(100);
    expect(result.metrics.cmudictCoverage).toBe(100);
    expect(result.metrics.frequencyCoverage).toBe(100);
    expect(result.metrics.lexitronCoverage).toBeGreaterThanOrEqual(90);
    expect(result.metrics.cefrjCoverage).toBeGreaterThanOrEqual(90);
    expect(result.metrics.gate).toBe('PASS');
    expect(result.metrics.safetyVerified).toBe(true);
  });

  it('12. verifies production safety invariants: zero DB writes, zero lifecycle changes, learner-ready = 83', () => {
    const reportPath = path.join(projectRoot, 'reports/phase-6.2.31-evidence-poc-report.json');
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    const safety = report.production_safety_invariants;

    expect(safety.production_db_writes).toBe(0);
    expect(safety.supabase_writes).toBe(0);
    expect(safety.lifecycle_mutations).toBe(0);
    expect(safety.is_active_mutations).toBe(0);
    expect(safety.review_ledger_writes).toBe(0);
    expect(safety.learner_ready_units_unchanged).toBe(83);
    expect(safety.readiness_overall_status_unchanged).toBe('NOT_READY');
    expect(safety.user_testing_authorized_unchanged).toBe(false);
  });
});
