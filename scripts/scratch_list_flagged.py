#!/usr/bin/env python3
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('reports/production-translation-audit.json', 'r', encoding='utf-8') as f:
    issues = json.load(f)

with open('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json', 'r', encoding='utf-8') as f:
    lex = json.load(f)

print(f'Total flagged: {len(issues)}')
for e in issues:
    key = e['word'] + '|' + e['pos']
    senses = [s['normalized_translation'] for s in lex.get(key, [])[:6]]
    issue_types = ','.join(e.get('issues', []))
    print(f'  WORD={e["word"]} POS={e["pos"]} CEFR={e["cefr"]} ISSUE={issue_types}')
    print(f'    CURRENT_TH: {e["th"]}')
    print(f'    EN_MEANING: {e["en"][:70]}')
    print(f'    LEX_SENSES: {senses}')
