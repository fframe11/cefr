import os
import sys
import io
import json
import fitz

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]
files = sorted(os.listdir(target_dir))

catalog = []

for f in files:
    fpath = os.path.join(target_dir, f)
    item = {'filename': f, 'size': os.path.getsize(fpath)}
    if f.endswith('.pdf'):
        try:
            doc = fitz.open(fpath)
            item['pages'] = len(doc)
            pages_text = []
            for p in doc:
                pages_text.append(p.get_text())
            full_text = '\n'.join(pages_text)
            item['char_count'] = len(full_text)
            item['word_count'] = len(full_text.split())
            lines = [l.strip() for l in full_text.split('\n') if l.strip()]
            item['headings'] = lines[:15]
            item['sample'] = ' '.join(full_text[:500].split())
        except Exception as e:
            item['error'] = str(e)
    elif f.endswith('.pptx'):
        item['type'] = 'pptx'
    catalog.append(item)

output_path = 'reports/guidelines_catalog.json'
with open(output_path, 'w', encoding='utf-8') as fp:
    json.dump(catalog, fp, ensure_ascii=False, indent=2)

print(f"Catalogged {len(catalog)} files to {output_path}")
for c in catalog:
    pages = c.get('pages', c.get('type', '?'))
    words = c.get('word_count', 0)
    print(f"- {c['filename']} ({pages} pgs, {words} words)")
