import os
import re
import json
from collections import Counter

files_to_check = [
    'data/readingBank.ts',
    'data/listeningBank.ts',
    'data/mockExams.ts',
    'data/diagnosticAssessment.ts',
    'data/quickCheckQuestions.ts',
    'data/grammarBank.ts',
    'data/collocationsBank.ts',
    'data/cheatSheets.ts',
    'data/reading-passages.json',
    'data/grammar-question-bank.json'
]

print("=== AUDIT OF ALL QUESTION BANKS ===")

for fp in files_to_check:
    if not os.path.exists(fp):
        print(f"File not found: {fp}")
        continue
    
    with open(fp, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if fp.endswith('.json'):
        data = json.loads(content)
        answers = []
        if isinstance(data, list):
            items = data
        elif isinstance(data, dict):
            items = data.get('questions', data.get('passages', []))
        
        # Traverse recursively to find correctAnswer or isCorrect
        def extract_answers(obj):
            if isinstance(obj, dict):
                if 'correct_answer' in obj and isinstance(obj['correct_answer'], str):
                    answers.append(obj['correct_answer'])
                elif 'correctAnswer' in obj and isinstance(obj['correctAnswer'], str):
                    answers.append(obj['correctAnswer'])
                elif 'options' in obj and isinstance(obj['options'], list):
                    for opt in obj['options']:
                        if isinstance(opt, dict) and (opt.get('isCorrect') or opt.get('is_correct')):
                            answers.append(opt.get('key', 'unknown'))
                for v in obj.values():
                    extract_answers(v)
            elif isinstance(obj, list):
                for item in obj:
                    extract_answers(item)
        extract_answers(data)
        counts = Counter(answers)
        print(f"{fp:32s}: Total={len(answers):3d}, Distribution={dict(counts)}")
    else:
        # TypeScript file
        # Look for option keys with isCorrect: true
        opt_matches = re.findall(r'key:\s*[\'"]([A-Za-z0-9]+)[\'"]\s*,[^\}]*?isCorrect:\s*true', content)
        # Also look for correctAnswer: 'A'
        ca_matches = re.findall(r'correctAnswer:\s*[\'"]([A-Za-z0-9]+)[\'"]', content)
        
        all_found = opt_matches if len(opt_matches) > len(ca_matches) else ca_matches
        counts = Counter(all_found)
        print(f"{fp:32s}: Total={len(all_found):3d}, Distribution={dict(counts)}")
