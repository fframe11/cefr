import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

stubs = [x for x in univ if 'WordNet Synset Entry' in (x.get('meaning_en') or '')]
print(f"Total stub words: {len(stubs):,}")

levels = Counter(x.get('cefr_level') for x in stubs)
print("\nCEFR Levels of stub words:")
for lvl, c in sorted(levels.items()):
    print(f"  {lvl}: {c:,} ({c/len(stubs)*100:.1f}%)")

# How many are in Lexitron or other dictionary sources?
lexitron_match = 0
with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    u10k = json.load(f)

u10k_th = {x['word'].lower(): x.get('meaning_th') for x in u10k if x.get('meaning_th')}

in_10k = sum(1 for x in stubs if x['word'].lower() in u10k_th)
print(f"\nStub words that appear in vocabulary-universe-10k: {in_10k:,}")
