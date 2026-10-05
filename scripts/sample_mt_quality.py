import json
import sys
import io
import random

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

mt_words = [x for x in univ if x.get('lifecycle_status') == 'MT_TRANSLATED']
print(f"Total MT_TRANSLATED words: {len(mt_words):,}")

random.seed(42)
sample_a1_b1 = [x for x in mt_words if x.get('cefr_level') in ['A1', 'A2', 'B1']]
sample_c1_c2 = [x for x in mt_words if x.get('cefr_level') in ['C1', 'C2']]

print(f"\n--- 10 Random Samples from A1-B1 (Total: {len(sample_a1_b1):,}) ---")
for x in random.sample(sample_a1_b1, 10):
    en = (x.get('meaning_en') or '')[:50]
    print(f"  {x['word']} ({x.get('part_of_speech')}) [{x.get('cefr_level')}]:")
    print(f"    TH: {x.get('meaning_th')}")
    print(f"    EN: {en}")

print(f"\n--- 10 Random Samples from C1-C2 (Total: {len(sample_c1_c2):,}) ---")
for x in random.sample(sample_c1_c2, 10):
    en = (x.get('meaning_en') or '')[:50]
    print(f"  {x['word']} ({x.get('part_of_speech')}) [{x.get('cefr_level')}]:")
    print(f"    TH: {x.get('meaning_th')}")
    print(f"    EN: {en}")
