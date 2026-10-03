#!/usr/bin/env python3
import json, sys, io, os, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

GARBAGE = ['WordNet', 'Comment=', 'ประสาทสัมผัส', 'World Found', 'bristles แต่ละด้าน']

def is_clean_en(text):
    if not text or len(text) < 10:
        return False
    for g in GARBAGE:
        if g in text:
            return False
    return True

# Check OEWN
oewn_dir = 'data/lexical-sources/oewn'
if os.path.exists(oewn_dir):
    for root, dirs, files in os.walk(oewn_dir):
        for f in files[:15]:
            path = os.path.join(root, f)
            size = os.path.getsize(path)
            print(f'{path} ({size:,} bytes)')
else:
    print('No OEWN dir found')

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    universe = json.load(f)

pending = [w for w in universe if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION']
print(f'\nPending words: {len(pending):,}')

has_clean_en = [w for w in pending if is_clean_en(w.get('meaning_en', ''))]
no_good = [w for w in pending if not is_clean_en(w.get('meaning_en', ''))]
print(f'Has usable meaning_en: {len(has_clean_en):,}')
print(f'No usable meaning_en: {len(no_good):,}')

print('\nSample with usable EN:')
for w in has_clean_en[:8]:
    en = w.get('meaning_en', '')
    print(f'  {w["word"]}: {en[:80]}')

print('\nSample without usable EN (what meaning_en looks like):')
for w in no_good[:8]:
    en = w.get('meaning_en', '')
    print(f'  {w["word"]}: [{en[:60]}]')
