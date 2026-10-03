import re, json
from collections import Counter

with open('data/listeningBank.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# remove typescript prefix
m = re.search(r'export const LISTENING_BANK:\s*ListeningExercise\[\]\s*=\s*(\[[\s\S]*\]);?\s*$', text)
if m:
    json_str = m.group(1)
    exercises = json.loads(json_str)
    print(f"Total exercises: {len(exercises)}")
    all_q = 0
    correct_keys = []
    missing = 0
    for ex in exercises:
        for q in ex.get('questions', []):
            all_q += 1
            found = None
            for opt in q.get('options', []):
                if opt.get('isCorrect') or opt.get('is_correct'):
                    found = opt.get('key')
                    break
            if found:
                correct_keys.append(found)
            else:
                missing += 1
    print(f"Total listening questions: {all_q}")
    print(f"Distribution: {Counter(correct_keys)}")
    print(f"Missing: {missing}")
else:
    print("Could not match LISTENING_BANK")
