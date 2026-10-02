#!/usr/bin/env python3
"""
Audit meaning_th quality in vocabulary-production-3860.json
Compares against Lexitron (source of truth) and Kaikki.
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod = json.load(f)

with open('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json', 'r', encoding='utf-8') as f:
    lexitron = json.load(f)

with open('data/external-cache/kaikki/kaikki-universe-index.json', 'r', encoding='utf-8') as f:
    kaikki = json.load(f)

issues = {
    'placeholder_english': [],
    'wrong_pos_adverb': [],
    'lexitron_mismatch': [],
    'ok': 0
}

for w in prod:
    word = w['word']
    pos = w['part_of_speech']
    th = w.get('meaning_th', '')

    # 1. Placeholder pattern: 'word (ความหมายภาษาไทย)' or starts with English
    if re.search(r'[a-zA-Z]{3,}\s*\(', th) or (re.match(r'^[a-zA-Z]', th) and pos != 'noun'):
        issues['placeholder_english'].append({'word': word, 'pos': pos, 'th': th})
        continue

    # Also check pure english word in meaning_th for nouns
    if re.match(r'^[a-zA-Z]', th):
        issues['placeholder_english'].append({'word': word, 'pos': pos, 'th': th})
        continue

    # 2. Verb with adverb-style Thai meaning
    if pos == 'verb' and (th.startswith('อย่าง') or th.startswith('โดย')):
        lex_key = word + '|' + pos
        lex_th = None
        if lex_key in lexitron:
            lex_th = lexitron[lex_key][0]['normalized_translation']
        issues['wrong_pos_adverb'].append({'word': word, 'pos': pos, 'current_th': th, 'lexitron_th': lex_th})
        continue

    # 3. Lexitron mismatch
    lex_key = word + '|' + pos
    if lex_key in lexitron:
        lex_th = lexitron[lex_key][0]['normalized_translation']
        if lex_th != th:
            kaikki_th = None
            if word in kaikki:
                for e in kaikki[word]:
                    if e.get('part_of_speech') == pos:
                        kaikki_th = e.get('thai_translation')
                        break
            issues['lexitron_mismatch'].append({
                'word': word, 'pos': pos,
                'current': th, 'lexitron': lex_th, 'kaikki': kaikki_th
            })
            continue

    issues['ok'] += 1

print('=== MEANING_TH AUDIT (3860 production words) ===')
print(f'OK (Lexitron-aligned or no issues): {issues["ok"]}')
print(f'Placeholder English in meaning_th: {len(issues["placeholder_english"])}')
print(f'Wrong POS (verb with adverb meaning): {len(issues["wrong_pos_adverb"])}')
print(f'Differs from Lexitron: {len(issues["lexitron_mismatch"])}')
total_issues = (len(issues['placeholder_english']) + 
                len(issues['wrong_pos_adverb']) + 
                len(issues['lexitron_mismatch']))
print(f'TOTAL NEEDING FIX: {total_issues} / 3860')

print('\n=== Placeholder examples (first 10) ===')
for ex in issues['placeholder_english'][:10]:
    print(f'  {ex["word"]} ({ex["pos"]}) -> {ex["th"]}')

print('\n=== Wrong POS examples (first 10) ===')
for ex in issues['wrong_pos_adverb'][:10]:
    print(f'  {ex["word"]} ({ex["pos"]}) current: {ex["current_th"]} | lexitron: {ex["lexitron_th"]}')

print('\n=== Lexitron mismatch (first 15) ===')
for ex in issues['lexitron_mismatch'][:15]:
    print(f'  {ex["word"]} ({ex["pos"]}) current: {ex["current"]} | lexitron: {ex["lexitron"]}')

# Save full report
report = {
    'total_words': len(prod),
    'ok': issues['ok'],
    'placeholder_english': issues['placeholder_english'],
    'wrong_pos_adverb': issues['wrong_pos_adverb'],
    'lexitron_mismatch': issues['lexitron_mismatch']
}
with open('reports/meaning-th-audit.json', 'w', encoding='utf-8') as f:
    json.dump(report, f, ensure_ascii=False, indent=2)
print('\nFull audit saved to reports/meaning-th-audit.json')
