import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

mt_a1 = [x for x in univ if x.get('lifecycle_status') == 'MT_TRANSLATED' and x.get('cefr_level') == 'A1']
print(f"MT A1 words: {len(mt_a1):,}")

for x in mt_a1[:25]:
    w = x['word']
    pos = x.get('part_of_speech')
    th = x.get('meaning_th')
    en = (x.get('meaning_en') or '')[:40]
    print(f"  {w:20} ({pos:8}): TH='{th}' | EN='{en}'")
