import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

mt_words = [x for x in univ if x.get('lifecycle_status') == 'MT_TRANSLATED']
th_counts = Counter(x.get('meaning_th') for x in mt_words)

suspicious = set(th for th, c in th_counts.items() if c >= 30 and th in [
    'ช่องสัญญาณ', 'แปรงทาสี', 'ความแหลม', 'แว่นขยาย', 'ความทึบแสง', 
    'เส้นพริ้วไหว', 'สี่เหลี่ยม', 'หมุน & 90', 'เส้นต่อเนื่อง', 'พ.ศ', 
    'เลเยอร์', '& ขาว', 'มุม', 'แก้ไขโครงการหลัก', 'ทําซ้ํา', 'ไม่รวม', 
    'ไบต์', 'ความเข้มสี', 'เส้นทแยง', 'อัตโนมัติ', 'โรคข้ออักเสบ', 
    'บิดเบี้ยว', 'สี', 'ภาษาละตินName', 'ไม่สนใจ', 'ขยาย', 'ตัด', 
    'เครื่องหมาย', 'ความกว้าง', 'ความยาว', 'ความสูง', 'ย้อนกลับ'
])

a1_collapsed = [x for x in mt_words if x.get('meaning_th') in suspicious and x.get('cefr_level') == 'A1']
print(f"Total A1 collapsed words: {len(a1_collapsed)}")

for x in a1_collapsed[:50]:
    print(f"  {x['word']:15} ({x.get('part_of_speech'):8}): EN='{x.get('meaning_en')}' | Current='{x.get('meaning_th')}'")
