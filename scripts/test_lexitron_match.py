import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json', 'r', encoding='utf-8') as f:
    lex = json.load(f)

# Also check lexitron-etlex.json
with open('data/lexical-sources/lexitron/2.0/lexitron-etlex.json', 'r', encoding='utf-8') as f:
    etlex = json.load(f)

print(f"Loaded {len(lex):,} entries from lexitron-usable-index.")
print(f"Loaded {len(etlex):,} entries from lexitron-etlex.")

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

mt_words = [x for x in univ if x.get('lifecycle_status') == 'MT_TRANSLATED']
th_counts = Counter(x.get('meaning_th') for x in mt_words)

suspicious_collapsed = set()
for th, count in th_counts.items():
    if count >= 30 and th in [
        'ช่องสัญญาณ', 'แปรงทาสี', 'ความแหลม', 'แว่นขยาย', 'ความทึบแสง', 
        'เส้นพริ้วไหว', 'สี่เหลี่ยม', 'หมุน & 90', 'เส้นต่อเนื่อง', 'พ.ศ', 
        'เลเยอร์', '& ขาว', 'มุม', 'แก้ไขโครงการหลัก', 'ทําซ้ํา', 'ไม่รวม', 
        'ไบต์', 'ความเข้มสี', 'เส้นทแยง', 'อัตโนมัติ', 'โรคข้ออักเสบ', 
        'บิดเบี้ยว', 'สี', 'ภาษาละตินName', 'ไม่สนใจ', 'ขยาย', 'ตัด', 
        'เครื่องหมาย', 'ความกว้าง', 'ความยาว', 'ความสูง', 'ย้อนกลับ'
    ]:
        suspicious_collapsed.add(th)

affected = [x for x in mt_words if x.get('meaning_th') in suspicious_collapsed]
print(f"Affected collapsed words: {len(affected):,}")

# Build clean index of lexitron entries by (word.lower(), pos) and by word.lower()
lex_dict = {}
for k, v in lex.items():
    parts = k.split('|')
    w = parts[0].lower().strip()
    pos = parts[1].lower().strip() if len(parts) > 1 else ''
    # extract thai translation
    th = ''
    if isinstance(v, dict):
        th = v.get('meaning_th') or v.get('tentry') or v.get('th') or ''
    elif isinstance(v, str):
        th = v
    if th:
        lex_dict[(w, pos)] = th
        if w not in lex_dict:
            lex_dict[w] = th

# Build from etlex if needed
for item in etlex:
    if isinstance(item, dict):
        w = (item.get('eentry') or item.get('word') or '').lower().strip()
        th = item.get('tentry') or item.get('meaning_th') or ''
        pos = (item.get('ecat') or item.get('pos') or '').lower().strip()
        if w and th:
            if (w, pos) not in lex_dict:
                lex_dict[(w, pos)] = th
            if w not in lex_dict:
                lex_dict[w] = th

print(f"Total entries in Lexitron lookup: {len(lex_dict):,}")

matched = 0
for x in affected:
    w = x['word'].lower().strip()
    pos = (x.get('part_of_speech') or '').lower().strip()
    if (w, pos) in lex_dict or w in lex_dict:
        matched += 1

print(f"Affected words matched in Lexitron: {matched:,} ({matched/len(affected)*100:.1f}%)")
