import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

mt_words = [x for x in univ if x.get('lifecycle_status') == 'MT_TRANSLATED']
th_counts = Counter(x.get('meaning_th') for x in mt_words)

# Suspicious UI/Photoshop and collapsed strings that appear >= 30 times
suspicious_collapsed = set()
for th, count in th_counts.items():
    if count >= 30:
        # Check if it's a generic UI string or repetitive artifact
        if th in [
            'ช่องสัญญาณ', 'แปรงทาสี', 'ความแหลม', 'แว่นขยาย', 'ความทึบแสง', 
            'เส้นพริ้วไหว', 'สี่เหลี่ยม', 'หมุน & 90', 'เส้นต่อเนื่อง', 'พ.ศ', 
            'เลเยอร์', '& ขาว', 'มุม', 'แก้ไขโครงการหลัก', 'ทําซ้ํา', 'ไม่รวม', 
            'ไบต์', 'ความเข้มสี', 'เส้นทแยง', 'อัตโนมัติ', 'โรคข้ออักเสบ', 
            'บิดเบี้ยว', 'สี', 'ภาษาละตินName', 'ไม่สนใจ', 'ขยาย', 'ตัด', 
            'เครื่องหมาย', 'ความกว้าง', 'ความยาว', 'ความสูง', 'ย้อนกลับ'
        ]:
            suspicious_collapsed.add(th)

affected_words = [x for x in mt_words if x.get('meaning_th') in suspicious_collapsed]
print(f"Total words affected by collapsed UI tokens: {len(affected_words):,}")

# Sample 20 affected words with their real WordNet definitions
print("\nSample 20 affected words with real WordNet glosses:")
for x in affected_words[:20]:
    print(f"  {x['word']} ({x.get('part_of_speech')}):")
    print(f"    Current Fake TH: '{x.get('meaning_th')}'")
    print(f"    Real EN Gloss:   '{x.get('meaning_en')}'")
