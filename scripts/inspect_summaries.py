import os
import sys
import io
import fitz

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]

files = [
    'Aj. Plar - CEFR - Use of English - Part 1_2.pdf',
    'สรุปการใช้ in-on-at การใช้ play-do-go และ การใช้ do, make.pdf',
    'Collocations หรือ คำที่มักต้องใช้คู่กันที่พบบ่อย.pdf',
    '-เฉลย + อธิบาลละเอียด Pretest - A2 - อาจารย์ปลา.pdf',
    'Introduction to OOPT.pdf',
    'Use of English_ Part 3.pdf'
]

for filename in files:
    fpath = os.path.join(target_dir, filename)
    if not os.path.exists(fpath):
        continue
    doc = fitz.open(fpath)
    full_text = ''
    for p in doc:
        full_text += p.get_text() + '\n'
    
    print(f"\n==========================================")
    print(f"FILE: {filename}")
    print(f"==========================================")
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    print('\n'.join(lines[:45]))
