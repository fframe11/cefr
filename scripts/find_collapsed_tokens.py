import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

mt_words = [x for x in univ if x.get('lifecycle_status') == 'MT_TRANSLATED']
print(f"Total MT words: {len(mt_words):,}")

th_counts = Counter(x.get('meaning_th') for x in mt_words)
print("\nTop 25 most frequent Thai translations in MT_TRANSLATED:")
for th, count in th_counts.most_common(25):
    print(f"  '{th}': {count:,} words")
