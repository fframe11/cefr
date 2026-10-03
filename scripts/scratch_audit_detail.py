#!/usr/bin/env python3
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('reports/production-translation-audit.json', 'r', encoding='utf-8') as f:
    issues = json.load(f)

with open('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json', 'r', encoding='utf-8') as f:
    lexitron = json.load(f)

too_short = [e for e in issues if 'TOO_SHORT' in e.get('issues', [])]
print(f'TOO_SHORT words ({len(too_short)}):')
for e in too_short:
    key = f'{e["word"]}|{e["pos"]}'
    lex = [s['normalized_translation'] for s in lexitron.get(key, [])[:3]]
    print(f'  {e["word"]:20} ({e["pos"]:6}) {e["cefr"]} | th=[{repr(e["th"])}] | lex={lex}')

print()
# LEXITRON_MISMATCH — classify real vs false positive
mismatch = [e for e in issues if 'LEXITRON_MISMATCH' in e.get('issues', [])]
print(f'LEXITRON_MISMATCH detailed ({len(mismatch)}):')
real_issues = []
false_positives = []
for e in mismatch:
    key = f'{e["word"]}|{e["pos"]}'
    lex = [s['normalized_translation'] for s in lexitron.get(key, [])[:3]]
    th = e['th']
    # False positive if: our meaning is semantically close (same root concept)
    # e.g. party=งานปาร์ตี้ vs lex=งานเลี้ยง — same concept
    # Real issue if our meaning is completely unrelated
    
    # Simple heuristic: check if any Lexitron sense shares Thai root chars
    our_chars = set(th.replace(' ','').replace(',',''))
    any_overlap = any(
        len(set(l.replace(' ','')).intersection(our_chars)) >= 2
        for l in lex
    )
    
    if any_overlap:
        false_positives.append(e)
    else:
        real_issues.append(e)
        print(f'  REAL ISSUE: {e["word"]} ({e["pos"]}) {e["cefr"]}')
        print(f'    Current: {th}')
        print(f'    Lexitron: {lex}')
        print(f'    EN: {e["en"]}')

print(f'\nFalse positives (same concept, different phrasing): {len(false_positives)}')
print(f'Real issues needing fix: {len(real_issues)}')
