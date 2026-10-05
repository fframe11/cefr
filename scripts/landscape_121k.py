import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

print(f"Total entries: {len(univ):,}")

# Breakdown by source
sources = Counter(x.get('meaning_th_source') for x in univ)
print("\n--- Source of Thai Meaning ---")
for s, c in sources.most_common():
    print(f"  {s}: {c:,} ({c/len(univ)*100:.1f}%)")

# Breakdown by English definition quality
real_en = 0
stub_en = 0
empty_en = 0
for x in univ:
    en = (x.get('meaning_en') or '').strip()
    if not en:
        empty_en += 1
    elif 'WordNet Synset Entry' in en:
        stub_en += 1
    else:
        real_en += 1

print("\n--- English Meaning Breakdown ---")
print(f"  Real English definitions: {real_en:,} ({real_en/len(univ)*100:.1f}%)")
print(f"  Stub 'WordNet Synset Entry': {stub_en:,} ({stub_en/len(univ)*100:.1f}%)")
print(f"  Empty English definitions: {empty_en:,} ({empty_en/len(univ)*100:.1f}%)")

# How many unique words?
unique_words = set(x['word'].lower() for x in univ)
print(f"\n--- Headword Statistics ---")
print(f"  Total records: {len(univ):,}")
print(f"  Unique headwords: {len(unique_words):,}")
print(f"  Duplicate headwords (multiple POS/senses): {len(univ) - len(unique_words):,}")

# Duplicate analysis: what POS are the duplicates?
dup_counter = Counter(x['word'].lower() for x in univ)
most_common_dups = dup_counter.most_common(10)
print("\n  Top 10 words with multiple records:")
for w, c in most_common_dups:
    records = [x for x in univ if x['word'].lower() == w]
    pos_list = [r.get('part_of_speech') for r in records]
    print(f"    {w}: {c} records (POS: {pos_list})")
