#!/usr/bin/env python3
"""
audit_mt_translations.py
ตรวจสอบคุณภาพคำแปลที่ได้จาก Argos MT ใน vocabulary-extended-universe-v3.json

ปัญหาที่อาจเกิด:
1. แปลแล้วได้ภาษาอังกฤษออกมา (MT ล้มเหลว)
2. แปลแล้วได้คำ transliteration ไม่ใช่ความหมาย (เช่น "กีโตซาน" แทนที่จะเป็น "ไคโตซาน")
3. แปลแล้วยาวเกินไป / สั้นเกินไป
4. Thai ratio ต่ำ (มีภาษาอังกฤษปน)
5. Proper nouns / abbreviations ที่ไม่ควรแปล
6. คำแปลที่ผิดความหมายชัดเจน
"""
import json, sys, io, re
from collections import Counter
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

HAS_THAI = re.compile(r'[\u0e00-\u0e7f]')
HAS_ALPHA = re.compile(r'[a-zA-Z]')

def thai_ratio(text):
    text = text or ''
    total = len(text.replace(' ', '').replace(',', ''))
    thai = len(re.findall(r'[\u0e00-\u0e7f]', text))
    return thai / total if total > 0 else 0

def thai_char_count(text):
    return len(re.findall(r'[\u0e00-\u0e7f]', text or ''))

print('Loading vocabulary-extended-universe-v3.json...')
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    universe = json.load(f)

# Filter to MT-translated words only
mt_words = [w for w in universe if w.get('meaning_th_source') in
            ('argos_mt_word_direct', 'argos_mt_meaning_en', 'MT_TRANSLATED')]
verified = [w for w in universe if w.get('lifecycle_status') == 'VERIFIED_PRODUCTION']
print(f'Total words: {len(universe):,}')
print(f'MT translated: {len(mt_words):,}')
print(f'Lexitron verified: {len(verified):,}')

# ── ISSUE DETECTION ──────────────────────────────────────────────────────────
issues = {
    'no_thai': [],
    'low_thai_ratio': [],
    'too_short': [],
    'too_long': [],
    'all_english': [],
    'likely_wrong': [],
}

for w in mt_words:
    th = w.get('meaning_th', '')
    word = w.get('word', '')
    cefr = w.get('cefr_level', '')

    # No Thai at all
    if not th or not HAS_THAI.search(th):
        issues['no_thai'].append(w)
        continue

    # All English (MT returned English)
    if HAS_ALPHA.search(th) and thai_ratio(th) < 0.3:
        issues['all_english'].append(w)
        continue

    # Too short (< 2 Thai chars)
    if thai_char_count(th) < 2:
        issues['too_short'].append(w)
        continue

    # Too long (> 80 chars — for single-word translations this is too long)
    if len(th) > 80:
        issues['too_long'].append(w)
        continue

    # Low Thai ratio (< 50%)
    if thai_ratio(th) < 0.5:
        issues['low_thai_ratio'].append(w)
        continue

    # Possibly wrong: meaning_th same as word (transliteration)
    if th.lower().strip() == word.lower().strip():
        issues['likely_wrong'].append(w)

# ── SUMMARY ──────────────────────────────────────────────────────────────────
total_issues = sum(len(v) for v in issues.values())
print(f'\n{"="*60}')
print(f'MT TRANSLATION AUDIT — {len(mt_words):,} words')
print(f'{"="*60}')
print(f'Total issues found: {total_issues:,} ({total_issues/len(mt_words)*100:.1f}%)')
print(f'Clean translations: {len(mt_words)-total_issues:,} ({(len(mt_words)-total_issues)/len(mt_words)*100:.1f}%)')

for issue_type, words in issues.items():
    print(f'\n── {issue_type.upper()} ({len(words):,} words) ──')
    for w in words[:15]:
        th = w.get('meaning_th', '')
        print(f'  {w["word"]:25} {w.get("cefr_level","?"):3} | {th[:60]}')
    if len(words) > 15:
        print(f'  ... and {len(words)-15} more')

# ── CEFR BREAKDOWN ───────────────────────────────────────────────────────────
print(f'\n── CEFR BREAKDOWN (MT words only) ──')
issue_set = set(id(w) for v in issues.values() for w in v)
by_cefr = {}
for w in mt_words:
    cefr = w.get('cefr_level', 'UNKNOWN')
    if cefr not in by_cefr:
        by_cefr[cefr] = {'total': 0, 'ok': 0}
    by_cefr[cefr]['total'] += 1
    if id(w) not in issue_set:
        by_cefr[cefr]['ok'] += 1

for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
    if level in by_cefr:
        d = by_cefr[level]
        pct = d['ok']/d['total']*100 if d['total'] else 0
        bar = '█' * int(pct/5) + '░' * (20-int(pct/5))
        print(f'  {level}: [{bar}] {pct:.1f}% ({d["ok"]}/{d["total"]})')

# ── SPOT CHECK: 10 samples per CEFR ─────────────────────────────────────────
print(f'\n── SPOT CHECK (10 clean samples per CEFR) ──')
ok_words = [w for w in mt_words if id(w) not in issue_set]
for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
    level_words = [w for w in ok_words if w.get('cefr_level') == level]
    # Pick spread across alphabet
    step = max(1, len(level_words)//10)
    samples = level_words[::step][:10]
    if samples:
        print(f'\n  {level}:')
        for w in samples:
            print(f'    {w["word"]:25} → {w.get("meaning_th","")[:50]}')

# Save issue list
bad_words = [w for v in issues.values() for w in v]
with open('reports/mt-translation-audit.json', 'w', encoding='utf-8') as f:
    json.dump([{
        'word': w['word'], 'pos': w.get('part_of_speech',''),
        'cefr': w.get('cefr_level',''), 'th': w.get('meaning_th',''),
        'source': w.get('meaning_th_source',''), 'issue': 'check'
    } for w in bad_words], f, ensure_ascii=False, indent=2)
print(f'\nIssue list saved: reports/mt-translation-audit.json ({len(bad_words)} entries)')
