import os
import sys
import io
import fitz

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]

files_to_deep_dive = [
    'Aj. Plar - CEFR - Use of English - Part 1_2.pdf',
    '(1-26) NOTE CEFR - Use of English - Part 2 - Aj Plar.pdf',
    'Use of English_ Part 3.pdf',
    '-เฉลย + อธิบาลละเอียด Pretest - A2 - อาจารย์ปลา.pdf',
    'สรุปการใช้ in-on-at การใช้ play-do-go และ การใช้ do, make.pdf',
    'Collocations หรือ คำที่มักต้องใช้คู่กันที่พบบ่อย.pdf',
    'OOPT Part 1 Collocations  Phrasal Verbs.pdf',
    'OOPT Part 1 Verb Ex.1.pdf',
    'OOPT Part 1 N  Pron.pdf',
    'OOPT Part 1 Adj_Adv_Conj.pdf',
    'Pre-English Part 2 Meaning A.pdf',
    'Pre-English Part 2 Meaning B.pdf',
    'Pre-English Listening A.pdf',
    'Pre-English Listening B.pdf',
    'Pre-English Listening C.pdf',
    'CEFR Reading TEST (1-2).pdf',
]

print("=== DEEP DIVE INTO GUIDELINES CURRICULUM ===")

for filename in files_to_deep_dive:
    fpath = os.path.join(target_dir, filename)
    if not os.path.exists(fpath):
        continue
    doc = fitz.open(fpath)
    full_text = ''
    for p in doc:
        full_text += p.get_text() + '\n'
    
    print(f"\n==========================================")
    print(f"FILE: {filename} ({len(doc)} pages, {len(full_text.split())} words)")
    print(f"==========================================")
    
    # Print the first 1200 characters of meaningful text
    lines = [l.strip() for l in full_text.split('\n') if l.strip()]
    content_sample = '\n'.join(lines[:35])
    print(content_sample)
