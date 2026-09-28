import fs from 'node:fs';
import path from 'node:path';

const BATCHES_DIR = path.resolve('scripts/content-pipeline/output/batches');

function inspectAllBatches() {
  const batchFiles = fs.readdirSync(BATCHES_DIR)
    .filter(f => f.startsWith('LARGE-') && f.endsWith('.json'))
    .sort();

  console.log(`Found ${batchFiles.length} batch files.`);

  const stats = {
    totalRecords: 0,
    cefr: {
      A1: { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 },
      A2: { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 },
      B1: { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 },
      B2: { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 },
      C1: { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 },
      C2: { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 },
    },
    meaning_en: {
      source_verified: 0,
      ai_draft: 0,
      missing_or_empty: 0,
      short_length: [],
      suspicious: [],
    },
    ipa: {
      source_verified: 0,
      ai_draft: 0,
      missing_or_empty: 0,
      unresolved: 0,
      malformed_or_no_slashes: [],
      suspicious_chars: [],
    },
    meaning_th: {
      ai_draft: 0,
      source_verified: 0,
      template_matches: 0,
      template_samples: [],
      pure_thai_count: 0,
      mixed_or_latin: [],
    },
    example: {
      source_verified: 0,
      ai_draft: 0,
      missing_or_empty: 0,
      short_length_total: 0,
      short_length_under_4: [],
      no_terminal_punct_total: 0,
      no_terminal_punct: [],
      template_fallbacks_total: 0,
      template_fallbacks: [],
    }
  };

  const templateRegexTh = /(สิ่งประดิษฐ์ อุปกรณ์|การปฏิบัติหรือทำให้เกิดผลลัพธ์|ตามนิยามเฉพาะ|อย่างมีลักษณะที่แสดงถึง|สภาวะ คุณลักษณะ หรือความรู้สึก|บุคคลที่มีบทบาท|การแสดงออกหรือการสื่อสาร|สัตว์หรือสิ่งมีชีวิต|พืชหรือส่วนประกอบของพืช|สารหรือวัตถุทางกายภาพ|ปรากฏการณ์ธรรมชาติ|กาลเวลา ช่วงเวลา)/;
  const boilerplateExampleRegex = /(Understanding the role of|helps students discuss|in everyday situations|She spoke .* while explaining how the group)/i;

  for (const file of batchFiles) {
    const raw = fs.readFileSync(path.join(BATCHES_DIR, file), 'utf8');
    const batch = JSON.parse(raw);

    for (const rec of batch.records) {
      stats.totalRecords++;
      const cefr = rec.cefr_level || 'A1';
      if (!stats.cefr[cefr]) {
        stats.cefr[cefr] = { total: 0, en_source_verified: 0, en_ai_draft: 0, en_missing: 0, ipa_source_verified: 0, ipa_ai_draft: 0, ipa_missing: 0 };
      }
      stats.cefr[cefr].total++;

      // Meaning EN
      const en = rec.meaning_en ? rec.meaning_en.trim() : '';
      if (!en) {
        stats.meaning_en.missing_or_empty++;
        stats.cefr[cefr].en_missing++;
      } else {
        if (rec.meaning_review_status === 'SOURCE_VERIFIED') {
          stats.meaning_en.source_verified++;
          stats.cefr[cefr].en_source_verified++;
        } else {
          stats.meaning_en.ai_draft++;
          stats.cefr[cefr].en_ai_draft++;
        }

        if (en.length < 5) {
          stats.meaning_en.short_length.push({ word: rec.word, cefr, en, id: rec.learning_unit_key });
        }
        if (/^(definition|meaning|n\/a|unknown|none)$/i.test(en)) {
          stats.meaning_en.suspicious.push({ word: rec.word, cefr, en, id: rec.learning_unit_key });
        }
      }

      // IPA
      const ipa = rec.phonetic_ipa ? rec.phonetic_ipa.trim() : '';
      if (!ipa || ipa === 'UNRESOLVED' || ipa === '//') {
        stats.ipa.missing_or_empty++;
        stats.cefr[cefr].ipa_missing++;
      } else {
        if (rec.pronunciation_review_status === 'SOURCE_VERIFIED') {
          stats.ipa.source_verified++;
          stats.cefr[cefr].ipa_source_verified++;
        } else {
          stats.ipa.ai_draft++;
          stats.cefr[cefr].ipa_ai_draft++;
        }

        if (!ipa.startsWith('/') || !ipa.endsWith('/')) {
          stats.ipa.malformed_or_no_slashes.push({ word: rec.word, cefr, ipa, id: rec.learning_unit_key });
        }
        if (/[A-Z0-9_\$#@]/.test(ipa.replace(/^\/|\/$/g, ''))) {
          stats.ipa.suspicious_chars.push({ word: rec.word, cefr, ipa, id: rec.learning_unit_key });
        }
      }

      // Meaning TH
      const th = rec.meaning_th ? rec.meaning_th.trim() : '';
      if (rec.meaning_th_review_status === 'SOURCE_VERIFIED') {
        stats.meaning_th.source_verified++;
      } else {
        stats.meaning_th.ai_draft++;
      }
      if (templateRegexTh.test(th)) {
        stats.meaning_th.template_matches++;
        if (stats.meaning_th.template_samples.length < 10) {
          stats.meaning_th.template_samples.push({ word: rec.word, th });
        }
      }
      if (/^[ก-๙\s\(\)\-\,\.\/\'\"0-9]+$/.test(th)) {
        stats.meaning_th.pure_thai_count++;
      } else if (/[a-zA-Z]/.test(th)) {
        if (stats.meaning_th.mixed_or_latin.length < 10) {
          stats.meaning_th.mixed_or_latin.push({ word: rec.word, th });
        }
      }

      // Example sentence
      const ex = rec.example_sentence ? rec.example_sentence.trim() : '';
      if (!ex) {
        stats.example.missing_or_empty++;
      } else {
        if (rec.example_review_status === 'SOURCE_VERIFIED') {
          stats.example.source_verified++;
        } else {
          stats.example.ai_draft++;
        }

        const words = ex.split(/\s+/).filter(Boolean);
        if (words.length < 4) {
          stats.example.short_length_total++;
          if (stats.example.short_length_under_4.length < 15) {
            stats.example.short_length_under_4.push({ word: rec.word, ex, count: words.length });
          }
        }
        if (!/[.!?]["']?$/.test(ex)) {
          stats.example.no_terminal_punct_total++;
          if (stats.example.no_terminal_punct.length < 15) {
            stats.example.no_terminal_punct.push({ word: rec.word, ex });
          }
        }
        if (boilerplateExampleRegex.test(ex)) {
          stats.example.template_fallbacks_total++;
          if (stats.example.template_fallbacks.length < 15) {
            stats.example.template_fallbacks.push({ word: rec.word, ex });
          }
        }
      }
    }
  }

  fs.mkdirSync(path.resolve('reports'), { recursive: true });
  fs.writeFileSync(path.resolve('reports/vocab-en-ipa-audit.json'), JSON.stringify(stats, null, 2), 'utf8');

  console.log('=== VOCABULARY AUDIT ACROSS 10,000 STAGED RECORDS ===');
  console.log(`Total records: ${stats.totalRecords}`);
  console.log('\n--- CEFR Level Distribution & Status ---');
  console.table(Object.entries(stats.cefr).map(([lvl, d]) => ({
    Level: lvl,
    Total: d.total,
    'EN Verified': d.en_source_verified,
    'EN AI Draft': d.en_ai_draft,
    'EN Missing': d.en_missing,
    'IPA Verified': d.ipa_source_verified,
    'IPA AI Draft': d.ipa_ai_draft,
    'IPA Missing': d.ipa_missing,
  })));

  console.log('\n--- Meaning EN ---');
  console.log(`Source Verified: ${stats.meaning_en.source_verified}`);
  console.log(`AI Draft: ${stats.meaning_en.ai_draft}`);
  console.log(`Missing/Empty: ${stats.meaning_en.missing_or_empty}`);
  console.log(`Suspicious/Short: ${stats.meaning_en.short_length.length} short, ${stats.meaning_en.suspicious.length} generic`);

  console.log('\n--- Phonetic IPA ---');
  console.log(`Source Verified: ${stats.ipa.source_verified}`);
  console.log(`AI Draft: ${stats.ipa.ai_draft}`);
  console.log(`Missing/Empty: ${stats.ipa.missing_or_empty}`);
  console.log(`Malformed (no slashes): ${stats.ipa.malformed_or_no_slashes.length}`);
  console.log(`Suspicious characters: ${stats.ipa.suspicious_chars.length}`);

  console.log('\n--- Meaning TH ---');
  console.log(`AI Draft: ${stats.meaning_th.ai_draft}`);
  console.log(`Source Verified: ${stats.meaning_th.source_verified}`);
  console.log(`Template Pattern Matches: ${stats.meaning_th.template_matches} (${((stats.meaning_th.template_matches / stats.totalRecords) * 100).toFixed(2)}%)`);
  console.log(`Pure Thai characters: ${stats.meaning_th.pure_thai_count}`);

  console.log('\n--- Example Sentences ---');
  console.log(`Source Verified: ${stats.example.source_verified}`);
  console.log(`AI Draft: ${stats.example.ai_draft}`);
  console.log(`Missing/Empty: ${stats.example.missing_or_empty}`);
  console.log(`Short (< 4 words): ${stats.example.short_length_total} (${((stats.example.short_length_total / stats.totalRecords) * 100).toFixed(2)}%)`);
  console.log(`Missing terminal punct: ${stats.example.no_terminal_punct_total} (${((stats.example.no_terminal_punct_total / stats.totalRecords) * 100).toFixed(2)}%)`);
  console.log(`Boilerplate template matches: ${stats.example.template_fallbacks_total} (${((stats.example.template_fallbacks_total / stats.totalRecords) * 100).toFixed(2)}%)`);

  return stats;
}

inspectAllBatches();
