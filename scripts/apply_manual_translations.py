#!/usr/bin/env python3
"""
apply_manual_translations.py
Reads MY_TRANSLATIONS from my_translations_part1.py as raw text,
fixes apostrophe/quote issues, then applies to extended universe.
"""
import json, sys, io, re, ast
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Read the raw script and extract the dict content safely
with open('scripts/my_translations_part1.py', 'r', encoding='utf-8') as f:
    raw = f.read()

# Extract everything between MY_TRANSLATIONS = { ... }
m = re.search(r'MY_TRANSLATIONS\s*=\s*\{(.+?)\}\s*(?:import|\Z)', raw, re.DOTALL)
if not m:
    # Try to find just the dict block
    start = raw.find('MY_TRANSLATIONS = {')
    end = raw.rfind('}')
    dict_body = raw[start:end+1]
else:
    dict_body = 'MY_TRANSLATIONS = {' + m.group(1) + '}'

# Parse line by line — more robust than ast.literal_eval on broken strings
translations = {}
lines = raw.split('\n')
in_dict = False
for line in lines:
    line = line.strip()
    if 'MY_TRANSLATIONS' in line and '=' in line:
        in_dict = True
        continue
    if not in_dict:
        continue
    if line in ('}', '},' ) or (line.startswith('}') and 'import' in raw[raw.find(line):raw.find(line)+50]):
        if line == '}':
            in_dict = False
        continue
    # Match key: value pattern — handle apostrophes in keys
    # Pattern: '...key...' : '...value...'
    m2 = re.match(r"^\s*'(.+?)'\s*:\s*'(.*?)'\s*,?\s*$", line)
    if m2:
        key = m2.group(1)
        val = m2.group(2)
        translations[key] = val
    else:
        # Try double quote value
        m3 = re.match(r'^\s*\'(.+?)\'\s*:\s*"(.*?)"\s*,?\s*$', line)
        if m3:
            translations[m3.group(1)] = m3.group(2)

print(f'Parsed {len(translations):,} translations from script')

# Sample
for i, (k, v) in enumerate(list(translations.items())[:20]):
    print(f'  {k} -> {v}')

# Apply to extended universe
print('\nLoading vocabulary-extended-universe-v3.json...')
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    universe = json.load(f)

applied = 0
skipped_no_thai = 0

for i, w in enumerate(universe):
    if w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION':
        continue
    key = w['word'] + '|' + w.get('part_of_speech', '')
    if key not in translations:
        continue
    th = translations[key]
    # Must have Thai characters
    if not th or not re.search(r'[\u0e00-\u0e7f]', th):
        skipped_no_thai += 1
        continue
    # Skip if it's just a transliteration placeholder like "xxx (คำนาม)"
    # Real translations should have meaningful Thai content
    placeholder_pattern = re.match(r'^[a-z\-\d\.\s\']+\s*\(คำ', th, re.IGNORECASE)
    if placeholder_pattern:
        skipped_no_thai += 1
        continue

    w = dict(w)
    w['meaning_th'] = th
    w['meaning_th_source'] = 'manual_expert'
    w['lifecycle_status'] = 'MT_TRANSLATED'
    w['mt_quality'] = 'MANUAL'
    universe[i] = w
    applied += 1

print(f'Applied: {applied:,}')
print(f'Skipped (no Thai / placeholder): {skipped_no_thai:,}')

still_pending = sum(1 for w in universe if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION')
total = len(universe)
covered = sum(1 for w in universe
              if w.get('meaning_th') and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th',''))
              and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION')

print(f'Still pending: {still_pending:,}')
print(f'Coverage: {covered:,}/{total:,} = {covered/total*100:.1f}%')

print('Saving...')
with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
    json.dump(universe, f, ensure_ascii=False, indent=2)
print('Done.')
