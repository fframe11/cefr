import json
import sys
import io
from collections import Counter

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-universe-10k.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total items in 10k dataset: {len(items):,}")

levels = Counter(x.get('cefr_level') for x in items)
print("\nCEFR Levels in 10k dataset:")
for lvl, c in sorted(levels.items()):
    print(f"  {lvl}: {c:,} ({c/len(items)*100:.1f}%)")

topics = Counter(x.get('topic') for x in items)
print(f"\nUnique topics: {len(topics)}")
for top, c in topics.most_common(10):
    print(f"  {top}: {c:,}")

# Check provenance
provs = Counter()
for x in items:
    p = x.get('provenance', {})
    if isinstance(p, dict):
        provs[p.get('source_dataset', 'unknown')] += 1
    else:
        provs[str(p)] += 1

print("\nProvenance / Sources:")
for prov, c in provs.most_common():
    print(f"  {prov}: {c:,}")

# Check completeness
empty_th = sum(1 for x in items if not (x.get('meaning_th') or '').strip())
empty_en = sum(1 for x in items if not (x.get('meaning_en') or '').strip())
empty_ipa = sum(1 for x in items if not (x.get('ipa') or '').strip())
empty_ex_en = sum(1 for x in items if not (x.get('example_sentence_en') or '').strip())
empty_ex_th = sum(1 for x in items if not (x.get('example_sentence_th') or '').strip())

print("\nCompleteness:")
print(f"  Empty meaning_th: {empty_th}")
print(f"  Empty meaning_en: {empty_en}")
print(f"  Empty ipa: {empty_ipa}")
print(f"  Empty example_sentence_en: {empty_ex_en}")
print(f"  Empty example_sentence_th: {empty_ex_th}")
