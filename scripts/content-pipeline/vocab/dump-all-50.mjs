import fs from 'fs';

const packet = JSON.parse(fs.readFileSync('reports/phase-6.2.30-human-review-packet.json', 'utf8'));

packet.records.forEach((r, idx) => {
  console.log(`RECORD #${r.sequence}: ${r.learning_unit_key}`);
  console.log(`  Word: "${r.word}" | POS: "${r.part_of_speech}" | CEFR: "${r.cefr_level}" | Sense: ${r.sense_index}`);
  console.log(`  EN: "${r.meaning_en}"`);
  console.log(`  TH: "${r.meaning_th}"`);
  console.log(`  IPA: "${r.phonetic_ipa}"`);
  console.log(`  EX: "${r.example_sentence}"`);
  console.log(`  Synset: ${r.provenance?.oewn_synset_id} | ExSynset: ${r.example_provenance?.candidate_synset_id}`);
  console.log('---');
});
