import fs from 'fs';

const packet = JSON.parse(fs.readFileSync('reports/phase-6.2.30-human-review-packet.json', 'utf8'));

const TEMPLATE_REGEX = /สิ่ง มโนทัศน์|ดำเนินการ หรือกระทำการ|ผู้มีความเชี่ยวชาญ|กลุ่มบุคคล|สถานที่ พื้นที่|กระบวนการ การปฏิบัติ|ซึ่งมีลักษณะหรือคุณสมบัติ|สื่อสาร แจ้งข้อมูล|สัมผัส เชื่อมต่อ|เคลื่อนที่ เดินทาง|แสดงความรู้สึก|ทำให้เกิดการเปลี่ยนแปลง|ใช้ความคิด|ปรับเปลี่ยน หรือแปรสภาพ|ช่วงเวลา ระยะเวลา/;

console.log('=== Records where synsets matched ===');
for (const r of packet.records) {
  const mSynset = r.provenance.oewn_synset_id;
  const exSynset = r.example_provenance?.candidate_synset_id;
  if (mSynset === exSynset) {
    const isTemplate = TEMPLATE_REGEX.test(r.meaning_th);
    console.log(`[#${r.sequence}] ${r.learning_unit_key}`);
    console.log(`  EN: "${r.meaning_en}"`);
    console.log(`  TH: "${r.meaning_th}" ${isTemplate ? '<<< TEMPLATE' : '<<< NATURAL THAI'}`);
    console.log(`  EX: "${r.example_sentence}"`);
    console.log('---');
  }
}
