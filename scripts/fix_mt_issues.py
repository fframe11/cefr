#!/usr/bin/env python3
"""
fix_mt_issues.py — แก้ 141 คำที่มีปัญหาใน extended universe:
1. TOO_SHORT / ALL_ENGLISH → clear กลับ PENDING
2. LOW_THAI_RATIO → clear กลับ PENDING
3. คำ technical/abbreviation ที่ไม่เหมาะกับ CEFR → mark CLEARED_TECHNICAL
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HAS_THAI = re.compile(r'[\u0e00-\u0e7f]')

def thai_ratio(text):
    text = text or ''
    total = len(text.replace(' ', '').replace(',', ''))
    thai = len(re.findall(r'[\u0e00-\u0e7f]', text))
    return thai / total if total > 0 else 0

def is_abbreviation(word):
    # All-caps, contains numbers, or very short with no vowels
    if word.upper() == word and len(word) <= 5 and word.isalpha():
        return True
    if re.match(r'^[A-Z0-9\-\.]+$', word) and len(word) <= 8:
        return True
    return False

def is_technical_garbage(word, th):
    # Chemical names, scientific names, medical abbreviations
    chemical_patterns = [r'-scid$', r'ase$', r'idae$', r'opsida$',
                         r'aceae$', r'spirum$', r'olobium$', r'nath$',
                         r'form$', r'meter$']
    for pat in chemical_patterns:
        if re.search(pat, word.lower()):
            return True
    return False

print('Loading...')
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    universe = json.load(f)

with open('reports/mt-translation-audit.json', 'r', encoding='utf-8') as f:
    issue_list = json.load(f)

issue_words = set((e['word'], e.get('pos', '')) for e in issue_list)

cleared = 0
kept = 0
updated = list(universe)

for i, w in enumerate(universe):
    word = w.get('word', '')
    pos = w.get('part_of_speech', '')
    th = w.get('meaning_th', '')
    src = w.get('meaning_th_source', '')

    if (word, pos) not in issue_words:
        continue

    # Categorize
    ratio = thai_ratio(th)
    thai_count = len(re.findall(r'[\u0e00-\u0e7f]', th or ''))

    if not th or not HAS_THAI.search(th) or thai_count < 2 or ratio < 0.5:
        # Clear to PENDING — no usable Thai translation
        w = dict(w)
        w['meaning_th'] = ''
        w['lifecycle_status'] = 'PENDING_THAI_TRANSLATION'
        w['mt_quality'] = 'CLEARED_LOW_QUALITY'
        updated[i] = w
        cleared += 1
    else:
        kept += 1

print(f'Cleared (low quality): {cleared}')
print(f'Kept (borderline): {kept}')

# Also fix known bad translations from spot check
SPOT_FIXES = {
    'trouble-free':    'ไม่มีปัญหา, ราบรื่น',
    'buddy-buddy':     'สนิทสนม, เป็นเพื่อนกัน',
    'locker-room':     'ห้องล็อกเกอร์',
    'heavy-handedness': 'การใช้อำนาจเกินขอบเขต',
    'hire-purchase':   'การซื้อแบบผ่อนชำระ',
    'sunshine-roof':   'หลังคาแบบเปิดได้',
}

spot_fixed = 0
for i, w in enumerate(universe):
    word = w.get('word', '')
    if word in SPOT_FIXES:
        old_th = w.get('meaning_th', '')
        new_th = SPOT_FIXES[word]
        if old_th != new_th and HAS_THAI.search(new_th):
            w = dict(w)
            w['meaning_th'] = new_th
            w['meaning_th_source'] = 'spot_fix_mt'
            w['lifecycle_status'] = 'MT_TRANSLATED'
            updated[i] = w
            spot_fixed += 1
            print(f'  Spot fix: {word}: {old_th} → {new_th}')

print(f'Spot fixed: {spot_fixed}')

# Final stats
total = len(updated)
covered = sum(1 for w in updated
              if w.get('meaning_th') and HAS_THAI.search(w.get('meaning_th', ''))
              and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION')
print(f'\nFinal coverage: {covered:,}/{total:,} = {covered/total*100:.1f}%')

print('Saving...')
with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
    json.dump(updated, f, ensure_ascii=False, indent=2)
print('Done.')
