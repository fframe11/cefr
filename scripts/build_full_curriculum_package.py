import fitz, os, sys, io, re, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]

# ==============================================================================
# 1. PARSE & CLEAN 200 COLLOCATIONS
# ==============================================================================
colloc_doc = fitz.open(os.path.join(target_dir, 'Collocations หรือ คำที่มักต้องใช้คู่กันที่พบบ่อย.pdf'))
colloc_text = '\n'.join(p.get_text() for p in colloc_doc)
colloc_doc.close()

char_map = {
    '\x8e': 'ื',
    '\x8d': 'ื',
    '\x92': 'ี',
    '\x91': 'ิ',
    '\x8c': 'ึ',
    '\x0c': '็',
    '\u2039': 'ิ',
    '\u2019': 'ี',
    '\u0153': 'ั',
    '\xa3': '้',
    '\xa2': 'ิ',
    'คํา': 'คำ',
    'ทํา': 'ทำ',
    'จํา': 'จำ',
    'สํา': 'สำ',
    'กํา': 'กำ',
    'นํา': 'นำ',
}

for k, v in char_map.items():
    colloc_text = colloc_text.replace(k, v)

lines = [l.strip() for l in colloc_text.split('\n') if l.strip()]

collocations_raw = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.isdigit():
        num = int(line)
        if 1 <= num <= 200:
            en = ""
            th = ""
            if i + 1 < len(lines) and not lines[i+1].isdigit() and lines[i+1] != 'Collocation':
                en = lines[i+1]
                if i + 2 < len(lines) and not lines[i+2].isdigit() and lines[i+2] != 'Collocation':
                    th = lines[i+2]
                    i += 2
                else:
                    i += 1
                collocations_raw.append({'num': num, 'en': en, 'th': th})
    i += 1

unique_collocs = {}
for it in collocations_raw:
    if it['num'] not in unique_collocs and it['en'] != 'Preparation For the CEFR A1-A2 Level Test: SUT, 2026':
        unique_collocs[it['num']] = it

print(f"Loaded {len(unique_collocs)} unique collocations from guideline PDF.")

# Save temporary json for inspection
with open('reports/parsed_collocations_cleaned.json', 'w', encoding='utf-8') as f:
    json.dump(list(unique_collocs.values()), f, ensure_ascii=False, indent=2)
