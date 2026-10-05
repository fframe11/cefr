import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"Total items in vocabulary-production-3860.json: {len(items)}")

# Check target words
target_words = ['able', 'about', 'general', 'common', 'regular', 'normal', 'breathe', 'all', 'any', 'can', 'may', 'will', 'must', 'shall', 'should', 'would', 'could', 'might']
found = {}
for item in items:
    w = item.get('word')
    if w in target_words and w not in found:
        found[w] = item
        print(f"WORD: {w} | POS: {item.get('part_of_speech')} | CEFR: {item.get('cefr_level')}")
        print(f"  TH: {item.get('meaning_th')}")
        print(f"  EN: {item.get('meaning_en')}")
        print(f"  EX_EN: {item.get('example_sentence_en')}")
        print("-" * 50)
