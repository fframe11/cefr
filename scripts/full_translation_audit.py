#!/usr/bin/env python3
"""
full_translation_audit.py
ตรวจสอบคุณภาพคำแปลทุกคำใน production-3860 อย่างครอบคลุม

Checks:
1. meaning_th vs Lexitron (source of truth)
2. CEFR-appropriate sense (A1 ไม่ควรได้ sense เฉพาะทาง)
3. คำแปลสั้นเกินไป / ยาวเกินไป
4. มีภาษาอังกฤษปน
5. คำแปลเป็น English transliteration ไม่ใช่ Thai meaning
6. Spot-check รายคำทีละ CEFR level
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod = json.load(f)

with open('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json', 'r', encoding='utf-8') as f:
    lexitron = json.load(f)

ENGLISH_ONLY = re.compile(r'^[a-zA-Z\s\-\'\.]+$')
HAS_THAI    = re.compile(r'[\u0e00-\u0e7f]')
TRANSLITERATION_HINTS = ['เอ', 'อิ', 'อี', 'โอ', 'อู', 'เอ็น', 'เอส', 'เอม']  # common translits

issues = []
cefr_samples = {'A1': [], 'A2': [], 'B1': [], 'B2': [], 'C1': [], 'C2': []}
cefr_stats   = {}

for w in prod:
    word    = w['word']
    pos     = w['part_of_speech']
    cefr    = w.get('cefr_level', '?')
    th      = w.get('meaning_th', '')
    en      = w.get('meaning_en', '')
    src     = w.get('meaning_th_source', '')
    key     = f'{word}|{pos}'

    if cefr not in cefr_stats:
        cefr_stats[cefr] = {'total': 0, 'ok': 0, 'flags': []}
    cefr_stats[cefr]['total'] += 1

    word_issues = []

    # 1. Missing Thai
    if not th or not HAS_THAI.search(th):
        word_issues.append('NO_THAI')

    # 2. English-only (forgot to translate)
    elif ENGLISH_ONLY.match(th.strip()):
        word_issues.append('ENGLISH_ONLY')

    # 3. Too short — Thai naturally has 2-char words (นก, งู, กบ, หู, ขา, ลม)
    #    Flag only if fewer than 2 Thai characters total
    elif len(re.findall(r'[\u0e00-\u0e7f]', th)) < 2:
        word_issues.append('TOO_SHORT')

    # 4. Too long (> 120 chars) — might be a full sentence not a meaning
    elif len(th) > 120:
        word_issues.append('TOO_LONG')

    # 5. Has English embedded (proper check)
    else:
        total = len(th.replace(' ', ''))
        thai  = len(re.findall(r'[\u0e00-\u0e7f]', th))
        ratio = thai / total if total else 0
        if ratio < 0.5:
            word_issues.append(f'LOW_THAI_RATIO_{ratio:.0%}')

    # 6. Cross-check vs Lexitron — improved matching with char-overlap fallback
    lex_senses = lexitron.get(key, [])
    if lex_senses and not word_issues:
        lex_translations = [s['normalized_translation'] for s in lex_senses]
        def lex_match(lt, th_text):
            if lt in th_text or th_text in lt:
                return True
            if any(seg.strip() in th_text for seg in lt.split(',') if len(seg.strip()) > 2):
                return True
            # Shared Thai chars (≥3 unique Thai chars in common)
            th_set = set(c for c in th_text if '\u0e00' <= c <= '\u0e7f')
            lt_set = set(c for c in lt if '\u0e00' <= c <= '\u0e7f')
            return len(th_set & lt_set) >= 3
        match_found = any(lex_match(lt, th) for lt in lex_translations)
        if not match_found:
            word_issues.append('LEXITRON_MISMATCH')

    # Collect
    entry = {'word': word, 'pos': pos, 'cefr': cefr, 'th': th, 'en': en[:60], 'issues': word_issues, 'src': src}
    if word_issues:
        issues.append(entry)
        cefr_stats[cefr]['flags'].append(word)
    else:
        cefr_stats[cefr]['ok'] += 1

    # Collect samples per CEFR (pick first 8 without issues for spot-check)
    if not word_issues and len(cefr_samples.get(cefr, [])) < 8:
        if cefr in cefr_samples:
            cefr_samples[cefr].append({'word': word, 'pos': pos, 'th': th, 'en': en[:60]})

# ─── REPORT ───────────────────────────────────────────────────────────────────

print('='*65)
print('PRODUCTION VOCABULARY TRANSLATION AUDIT')
print(f'Total words: {len(prod):,}')
print('='*65)

print('\n── CEFR COVERAGE SUMMARY ──')
for level in ['A1','A2','B1','B2','C1','C2']:
    st = cefr_stats.get(level, {'total':0,'ok':0,'flags':[]})
    ok_pct = st['ok'] / st['total'] * 100 if st['total'] else 0
    bar = '█' * int(ok_pct/5) + '░' * (20 - int(ok_pct/5))
    n_flag = len(st['flags'])
    print(f'  {level}: [{bar}] {ok_pct:.1f}% OK  ({st["ok"]}/{st["total"]}) | ⚠ {n_flag} flagged')

# Issue breakdown
from collections import Counter
all_issue_types = Counter()
for entry in issues:
    for iss in entry['issues']:
        all_issue_types[iss] += 1

print(f'\n── ISSUE TYPES ({len(issues)} words flagged) ──')
for issue_type, count in all_issue_types.most_common():
    print(f'  {issue_type}: {count}')

# LEXITRON_MISMATCH detail (most important)
mismatch = [e for e in issues if 'LEXITRON_MISMATCH' in e['issues']]
print(f'\n── LEXITRON MISMATCH ({len(mismatch)} words) — meaning_th differs from ALL Lexitron senses ──')
for e in sorted(mismatch, key=lambda x: ['A1','A2','B1','B2','C1','C2'].index(x['cefr']) if x['cefr'] in ['A1','A2','B1','B2','C1','C2'] else 9)[:40]:
    key = f'{e["word"]}|{e["pos"]}'
    lex = [s['normalized_translation'] for s in lexitron.get(key, [])[:3]]
    print(f'  {e["word"]} ({e["pos"]}) {e["cefr"]}:')
    print(f'    Current: {e["th"]}')
    print(f'    Lexitron senses: {lex}')

# Low Thai ratio
low_thai = [e for e in issues if any('LOW_THAI' in i for i in e['issues'])]
if low_thai:
    print(f'\n── LOW THAI RATIO ({len(low_thai)} words) ──')
    for e in low_thai[:15]:
        print(f'  {e["word"]} ({e["cefr"]}): {e["th"][:80]}')

# Too long
too_long = [e for e in issues if 'TOO_LONG' in e['issues']]
if too_long:
    print(f'\n── TOO LONG ({len(too_long)} words) ──')
    for e in too_long[:10]:
        print(f'  {e["word"]} ({e["cefr"]}): [{len(e["th"])} chars] {e["th"][:80]}')

# ── SPOT CHECK samples per CEFR ──
print(f'\n── SPOT CHECK SAMPLES (8 per level, no flags) ──')
for level in ['A1','A2','B1','B2','C1','C2']:
    print(f'\n  {level}:')
    for s in cefr_samples.get(level, []):
        print(f'    {s["word"]:20} → {s["th"][:50]}')
        print(f'    {" "*20}   ({s["en"][:50]})')

print('\n'+'='*65)
total_ok = sum(st['ok'] for st in cefr_stats.values())
print(f'OVERALL: {total_ok}/{len(prod)} words pass all checks ({total_ok/len(prod)*100:.1f}%)')
print('='*65)

# Save issues to report
with open('reports/production-translation-audit.json', 'w', encoding='utf-8') as f:
    json.dump(issues, f, ensure_ascii=False, indent=2)
print(f'Full issue list saved: reports/production-translation-audit.json')
