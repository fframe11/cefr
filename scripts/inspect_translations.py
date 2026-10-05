import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

words_to_inspect = [
    'about', 'able', 'general', 'common', 'universal', 'typical', 'standard',
    'popular', 'public', 'normal', 'regular', 'broad', 'overall', 'breathe',
    'across', 'along', 'behind', 'below', 'around', 'near', 'all', 'can', 'may',
    'will', 'how', 'else', 'that', 'since', 'small', 'tall', 'ordinary'
]

for w in words_to_inspect:
    matches = [i for i in items if i.get('word') == w]
    for m in matches:
        print(f"WORD: {m.get('word')} | POS: {m.get('part_of_speech')} | CEFR: {m.get('cefr_level')}")
        print(f"  TH: {m.get('meaning_th')}")
        print(f"  EN: {m.get('meaning_en')}")
        print(f"  EX: {m.get('example_sentence_en')}")
        print(f"  EX_TH: {m.get('example_sentence_th')}")
        print("-" * 60)
