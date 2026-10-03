#!/usr/bin/env python3
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    universe = json.load(f)

mt_words = [w for w in universe if 'argos_mt' in w.get('meaning_th_source','')]
print(f'Total MT-translated words: {len(mt_words):,}')

# Count by flag reason
from collections import Counter
flags = Counter()
for w in mt_words:
    quality = w.get('mt_quality','')
    flags[quality] += 1

print('\nMT Quality breakdown:')
for k, v in flags.most_common():
    print(f'  {k}: {v:,}')

# Sample FLAGGED_TOO_LONG
flagged_long = [w for w in mt_words if w.get('mt_quality') == 'FLAGGED_TOO_LONG']
print(f'\nSample FLAGGED_TOO_LONG ({len(flagged_long):,} total) — first 10:')
for w in flagged_long[:10]:
    word = w['word']
    th = w.get('meaning_th', '')
    en = w.get('meaning_en', '')
    print(f'  {word}: TH=[{len(th)}chars] {th[:100]}')
    print(f'    EN: {en[:80]}')

# Check: would relaxing threshold to 200 fix most?
would_pass = sum(1 for w in flagged_long if len(w.get('meaning_th','')) <= 200)
print(f'\nWould pass with threshold=200: {would_pass:,}/{len(flagged_long):,}')
would_pass150 = sum(1 for w in flagged_long if len(w.get('meaning_th','')) <= 150)
print(f'Would pass with threshold=150: {would_pass150:,}/{len(flagged_long):,}')

# Check FLAGGED_HAS_ENGLISH
flagged_eng = [w for w in mt_words if w.get('mt_quality') == 'FLAGGED_HAS_ENGLISH']
print(f'\nSample FLAGGED_HAS_ENGLISH ({len(flagged_eng):,} total) — first 5:')
for w in flagged_eng[:5]:
    print(f'  {w["word"]}: {w.get("meaning_th","")[:100]}')
