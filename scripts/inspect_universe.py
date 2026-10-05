import json
import sys

files = [
    'data/vocabulary-extended-universe.json',
    'data/vocabulary-extended-universe-v2.json',
    'data/vocabulary-extended-universe-v3.json',
    'data/vocabulary-universe-10k.json',
    'data/vocabulary-production-3860.json'
]

for path in files:
    try:
        with open(path, 'r', encoding='utf-8') as fp:
            data = json.load(fp)
            print(f"{path}: {len(data)} items")
            if data:
                s = data[0]
                print(f"  Word: {s.get('word')}, POS: {s.get('part_of_speech')}, CEFR: {s.get('cefr_level')}")
                print(f"  Tier: {s.get('tier')}, Validation: {s.get('validation_status')}")
    except Exception as e:
        print(f"{path}: error {e}")
