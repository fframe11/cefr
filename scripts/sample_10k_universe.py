import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print("Sample 30 words from 10k universe across A1 to C2:")
for x in items[::330][:30]:
    lvl = x.get('cefr_level')
    w = x.get('word')
    pos = x.get('part_of_speech')
    th = x.get('meaning_th')
    en = (x.get('meaning_en') or '')[:40]
    top = x.get('topic')
    print(f"  [{lvl:2}] {w:20} ({pos:8}): TH='{th:25}' | Topic='{top}'")
