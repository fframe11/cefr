import os
import sys
import io
import fitz
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]
doc = fitz.open(os.path.join(target_dir, 'Collocations หรือ คำที่มักต้องใช้คู่กันที่พบบ่อย.pdf'))

pages_text = []
for p in doc:
    pages_text.append(p.get_text())
doc.close()

full_text = "\n".join(pages_text)
lines = [l.strip() for l in full_text.split('\n') if l.strip()]

# Parse the table: number -> collocation (en) -> thai meaning
items = []
current_num = None
current_en = ""
current_th = ""

i = 0
while i < len(lines):
    line = lines[i]
    if line.isdigit() and 1 <= int(line) <= 200:
        num = int(line)
        # next line might be english
        if i + 1 < len(lines):
            en = lines[i+1]
            th = ""
            if i + 2 < len(lines) and not lines[i+2].isdigit() and lines[i+2] != 'Collocation':
                th = lines[i+2]
                i += 2
            else:
                i += 1
            items.append({
                'id': f"colloc_{num:03d}",
                'num': num,
                'collocation': en,
                'meaning_th': th
            })
    i += 1

print(f"Extracted collocations: {len(items)}")
for it in items[:15]:
    print(f"{it['num']:3d}. {it['collocation']} -> {it['meaning_th']}")
print("...")
for it in items[-10:]:
    print(f"{it['num']:3d}. {it['collocation']} -> {it['meaning_th']}")

with open('data/raw_collocations_200.json', 'w', encoding='utf-8') as f:
    json.dump(items, f, ensure_ascii=False, indent=2)
