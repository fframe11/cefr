import os, sys, json, re

def inspect_all_data():
    files = {
        'diagnostic': 'data/diagnosticAssessment.ts',
        'mockExams': 'data/mockExams.ts',
        'grammar': 'data/grammarBank.ts',
        'reading': 'data/readingBank.ts',
        'listening': 'data/listeningBank.ts',
        'writing': 'data/writingBank.ts',
        'speaking': 'data/speakingBank.ts',
        'vocabulary': 'data/vocabularyBank.ts'
    }
    
    counts = {}
    for name, path in files.items():
        if os.path.exists(path):
            text = open(path, 'r', encoding='utf-8').read()
            # find all 'id: ...'
            ids = re.findall(r"id:\s*['\"]([^'\"]+)['\"]", text)
            counts[name] = {
                'total_ids': len(ids),
                'sample_ids': ids[:5]
            }
            if name == 'diagnostic':
                diag_ids = [i for i in ids if i.startswith('diag-')]
                counts[name]['diagnostic_questions'] = len(diag_ids)
            elif name == 'mockExams':
                mock_ids = [i for i in ids if i.startswith('mock-')]
                sec_ids = [i for i in ids if '-sec-' in i]
                q_ids = [i for i in ids if '-q' in i]
                counts[name]['exams'] = len(mock_ids)
                counts[name]['sections'] = len(sec_ids)
                counts[name]['questions'] = len(q_ids)
            elif name == 'grammar':
                topics = [i for i in ids if i.startswith('grammar-')]
                counts[name]['topics'] = len(topics)
            elif name == 'reading':
                passages = [i for i in ids if i.startswith('reading-')]
                counts[name]['passages'] = len(passages)
            elif name == 'listening':
                exercises = [i for i in ids if i.startswith('listening-')]
                counts[name]['exercises'] = len(exercises)
            elif name == 'writing':
                prompts = [i for i in ids if i.startswith('writing-')]
                counts[name]['prompts'] = len(prompts)
            elif name == 'speaking':
                prompts = [i for i in ids if i.startswith('speaking-')]
                counts[name]['prompts'] = len(prompts)
            elif name == 'vocabulary':
                words = [i for i in ids if i.startswith('vocab-')]
                counts[name]['words'] = len(words)
    print(json.dumps(counts, indent=2))

if __name__ == '__main__':
    inspect_all_data()
