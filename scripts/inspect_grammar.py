import json
from collections import Counter

with open('data/grammar-question-bank.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Data type: {type(data)}, length: {len(data)}")
sample = data[0] if isinstance(data, list) else data
print(f"Sample keys: {list(sample.keys())}")

total_q = 0
correct_keys = []
missing_correct = 0

for item in data:
    questions = item.get('questions', [item] if 'options' in item else [])
    for q in questions:
        total_q += 1
        found_key = None
        for opt in q.get('options', []):
            if opt.get('is_correct') is True or opt.get('isCorrect') is True:
                found_key = opt.get('key')
                break
            elif opt.get('text') and opt.get('text') == q.get('correct_answer'):
                found_key = opt.get('key')
                break
        if found_key:
            correct_keys.append(found_key)
        else:
            missing_correct += 1

print(f"Total questions: {total_q}")
print(f"Distribution: {Counter(correct_keys)}")
print(f"Missing correct: {missing_correct}")
