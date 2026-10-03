import os
import sys
import io
import json
import fitz
import zipfile
import xml.etree.ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]
files = sorted(os.listdir(target_dir))

categorization = {
    '1. Oxford OOPT Overview & Strategy (แนวทางและโครงสร้าง OOPT)': [],
    '2. Use of English - Part 1 Form (Verbs, Nouns, Adj/Adv/Prep)': [],
    '3. Use of English - Part 1 Collocations & Phrasal Verbs': [],
    '4. Use of English - Part 2 Meaning (Dialogues 3-options)': [],
    '5. Use of English - Part 3 Open Cloze': [],
    '6. Listening Comprehension (บทสนทนาและการฟัง)': [],
    '7. Reading Comprehension (การอ่านและบทความ)': [],
    '8. Pretest / Diagnostic Tests (แบบทดสอบวัดระดับ)': [],
    '9. Reference & Summary Sheets (สรุปไวยากรณ์และสูตรลัด)': []
}

file_details = []

for f in files:
    fpath = os.path.join(target_dir, f)
    ext = os.path.splitext(f)[1].lower()
    text = ""
    pages = 0
    if ext == '.pdf':
        try:
            doc = fitz.open(fpath)
            pages = len(doc)
            for page in doc:
                text += page.get_text() + "\n"
            doc.close()
        except Exception as e:
            text = ""
    elif ext == '.pptx':
        try:
            with zipfile.ZipFile(fpath, 'r') as z:
                slide_files = [n for n in z.namelist() if n.startswith('ppt/slides/slide') and n.endswith('.xml')]
                pages = len(slide_files)
                for s in slide_files:
                    xml_content = z.read(s)
                    tree = ET.fromstring(xml_content)
                    for elem in tree.iter():
                        if elem.tag.endswith('}t') and elem.text:
                            text += elem.text + " "
                    text += "\n"
        except:
            pass

    words = len(text.strip().split())
    fl = f.lower()

    cat = '1. Oxford OOPT Overview & Strategy (แนวทางและโครงสร้าง OOPT)'
    if 'collocation' in fl or 'phrasal' in fl:
        cat = '3. Use of English - Part 1 Collocations & Phrasal Verbs'
    elif 'part 2' in fl or 'meaning' in fl:
        cat = '4. Use of English - Part 2 Meaning (Dialogues 3-options)'
    elif 'part 3' in fl or 'cloze' in fl:
        cat = '5. Use of English - Part 3 Open Cloze'
    elif 'listening' in fl:
        cat = '6. Listening Comprehension (บทสนทนาและการฟัง)'
    elif 'reading' in fl:
        cat = '7. Reading Comprehension (การอ่านและบทความ)'
    elif 'pretest' in fl or 'a2' in fl and 'test' in fl:
        cat = '8. Pretest / Diagnostic Tests (แบบทดสอบวัดระดับ)'
    elif 'สรุป' in fl or 'in-on-at' in fl or 'play-do-go' in fl:
        cat = '9. Reference & Summary Sheets (สรุปไวยากรณ์และสูตรลัด)'
    elif any(k in fl for k in ['verb', 'noun', 'adj', 'adv', 'pron', 'part 1']):
        cat = '2. Use of English - Part 1 Form (Verbs, Nouns, Adj/Adv/Prep)'
    
    categorization[cat].append({
        'filename': f,
        'pages': pages,
        'words': words,
        'is_duplicate': ' (1)' in f or '- no key' in fl or '- no Key' in fl or ' 20.pdf' in f or 'do-make' in f
    })

print("================================================================================")
print("AUDIT REPORT: 56 GUIDELINE FILES BREAKDOWN BY CATEGORY")
print("================================================================================")
for cat, items in categorization.items():
    print(f"\n### {cat} ({len(items)} files):")
    total_words = sum(it['words'] for it in items)
    dups = sum(1 for it in items if it['is_duplicate'])
    print(f"    Total words: {total_words:,} | Potential duplicates / no-key pairs: {dups}")
    for it in items:
        dup_tag = " [DUPLICATE/NO-KEY]" if it['is_duplicate'] else ""
        print(f"    - {it['filename']} ({it['pages']} pp, {it['words']} words){dup_tag}")
