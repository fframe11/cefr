import json
from collections import Counter

with open('data/reading-passages.json', 'r', encoding='utf-8') as f:
    passages = json.load(f)

print(f"Total passages: {len(passages)}")
all_q = 0
correct_keys = []
for p in passages:
    for q in p.get('questions', []):
        all_q += 1
        found = None
        for opt in q.get('options', []):
            if opt.get('isCorrect') or opt.get('is_correct'):
                found = opt.get('key')
                break
        if found:
            correct_keys.append(found)

print(f"Total reading questions: {all_q}")
print(f"Distribution: {Counter(correct_keys)}")
