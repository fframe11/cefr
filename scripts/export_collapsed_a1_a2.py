import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

suspicious = set([
    'ช่องสัญญาณ', 'แปรงทาสี', 'ความแหลม', 'แว่นขยาย', 'ความทึบแสง', 
    'เส้นพริ้วไหว', 'สี่เหลี่ยม', 'หมุน & 90', 'เส้นต่อเนื่อง', 'พ.ศ', 
    'เลเยอร์', '& ขาว', 'มุม', 'แก้ไขโครงการหลัก', 'ทําซ้ํา', 'ไม่รวม', 
    'ไบต์', 'ความเข้มสี', 'เส้นทแยง', 'อัตโนมัติ', 'โรคข้ออักเสบ', 
    'บิดเบี้ยว', 'สี', 'ภาษาละตินName', 'ไม่สนใจ', 'ขยาย', 'ตัด', 
    'เครื่องหมาย', 'ความกว้าง', 'ความยาว', 'ความสูง', 'ย้อนกลับ'
])

targets = [
    {
        'id': x['id'],
        'word': x['word'],
        'pos': x.get('part_of_speech'),
        'cefr': x.get('cefr_level'),
        'en': x.get('meaning_en'),
        'old_th': x.get('meaning_th')
    }
    for x in univ
    if x.get('meaning_th') in suspicious and x.get('cefr_level') in ['A1', 'A2']
]

print(f"Total target words in A1/A2: {len(targets)}")
with open('scripts/collapsed_a1_a2.json', 'w', encoding='utf-8') as f:
    json.dump(targets, f, ensure_ascii=False, indent=2)

print("Exported to scripts/collapsed_a1_a2.json")
