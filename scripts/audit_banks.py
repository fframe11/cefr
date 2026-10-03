import re, os, json

def audit_any_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    dist = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'other': 0, 'missing': 0}
    
    # Match options array
    opt_blocks = re.findall(r'["\']?options["\']?\s*:\s*\[([\s\S]*?)\]\s*[,;\}]', text)
    for block in opt_blocks:
        items = re.findall(r'\{([\s\S]*?)\}', block)
        found_correct = []
        for item in items:
            key_m = re.search(r'["\']?key["\']?\s*:\s*[\'"]([A-Za-z0-9]+)[\'"]', item)
            is_corr_m = re.search(r'["\']?isCorrect["\']?\s*:\s*(true|false)', item) or re.search(r'["\']?is_correct["\']?\s*:\s*(true|false)', item)
            if key_m and is_corr_m and is_corr_m.group(1) == 'true':
                found_correct.append(key_m.group(1).upper())
        
        if found_correct:
            for k in found_correct:
                if k in dist:
                    dist[k] += 1
                else:
                    dist['other'] += 1
        else:
            dist['missing'] += 1

    print(f"{filepath:35s}: OptionsBlocks={len(opt_blocks):3d}, Dist={dist}")

audit_any_file('data/readingBank.ts')
audit_any_file('data/listeningBank.ts')
audit_any_file('data/mockExams.ts')
audit_any_file('data/diagnosticAssessment.ts')
audit_any_file('data/quickCheckQuestions.ts')
audit_any_file('data/grammarBank.ts')
audit_any_file('data/collocationsBank.ts')
audit_any_file('data/cheatSheets.ts')
