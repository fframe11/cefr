import os
import sys
import io
import fitz

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]

files_to_check = [
    'Collocations หรือ คำที่มักต้องใช้คู่กันที่พบบ่อย.pdf',
    '-เฉลย + อธิบาลละเอียด Pretest - A2 - อาจารย์ปลา.pdf',
    'CEFR Reading TEST (1-2).pdf',
]

for fname in files_to_check:
    fpath = os.path.join(target_dir, fname)
    if not os.path.exists(fpath):
        continue
    doc = fitz.open(fpath)
    print(f"\n==================== {fname} (Pages: {len(doc)}) ====================")
    full_text = ""
    for page in doc:
        full_text += page.get_text() + "\n"
    doc.close()
    lines = [line.strip() for line in full_text.split('\n') if line.strip()]
    print(f"Total lines: {len(lines)}")
    print("\n--- SAMPLE CONTENT (First 40 lines) ---")
    for l in lines[:40]:
        print(l)
