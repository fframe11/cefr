import os
import sys
import io
import json
import fitz # PyMuPDF
import zipfile
import xml.etree.ElementTree as ET

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]
files = sorted(os.listdir(target_dir))

print(f"Total files in folder: {len(files)}")

# Let's inspect each file
file_stats = []
for idx, fname in enumerate(files):
    fpath = os.path.join(target_dir, fname)
    size = os.path.getsize(fpath)
    ext = os.path.splitext(fname)[1].lower()
    
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
            text = f"ERROR: {e}"
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
        except Exception as e:
            text = f"ERROR: {e}"

    char_count = len(text.strip())
    word_count = len(text.strip().split())
    
    file_stats.append({
        'index': idx + 1,
        'filename': fname,
        'size_kb': round(size / 1024, 1),
        'pages': pages,
        'chars': char_count,
        'words': word_count,
        'has_text': char_count > 100,
        'snippet': text.strip()[:150].replace('\n', ' ') if char_count > 0 else "EMPTY"
    })

print(f"\n{'#':<3} | {'Filename':<48} | {'Pages':<5} | {'Words':<7} | {'Has Text':<8} | Snippet")
print("-" * 110)
for s in file_stats:
    print(f"{s['index']:<3} | {s['filename'][:48]:<48} | {s['pages']:<5} | {s['words']:<7} | {str(s['has_text']):<8} | {s['snippet'][:40]}")

with open('reports/audit_56_files_summary.json', 'w', encoding='utf-8') as f:
    json.dump(file_stats, f, ensure_ascii=False, indent=2)
