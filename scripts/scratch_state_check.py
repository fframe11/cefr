#!/usr/bin/env python3
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def has_good_thai(w):
    th = w.get('meaning_th', '')
    return (
        bool(th) and
        re.search(r'[\u0e00-\u0e7f]', th) and
        w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION' and
        w.get('mt_quality', '') != 'CLEARED_GARBAGE_OUTPUT'
    )

# Check v3 (where word-direct MT was writing to)
with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    v3 = json.load(f)

# Check checkpoint (last save before server restart)
with open('data/vocabulary-extended-universe-v3-checkpoint.json', 'r', encoding='utf-8') as f:
    ckpt = json.load(f)

by_status_v3 = {}
for w in v3:
    s = w.get('lifecycle_status', 'unknown')
    by_status_v3[s] = by_status_v3.get(s, 0) + 1

by_status_ckpt = {}
for w in ckpt:
    s = w.get('lifecycle_status', 'unknown')
    by_status_ckpt[s] = by_status_ckpt.get(s, 0) + 1

covered_v3 = sum(1 for w in v3 if has_good_thai(w))
covered_ckpt = sum(1 for w in ckpt if has_good_thai(w))

print('=== vocabulary-extended-universe-v3.json ===')
print(f'Total: {len(v3):,}')
print(f'Has good Thai: {covered_v3:,} ({covered_v3/len(v3)*100:.1f}%)')
for k, v in sorted(by_status_v3.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v:,}')

print()
print('=== checkpoint.json (last save before restart) ===')
print(f'Total: {len(ckpt):,}')
print(f'Has good Thai: {covered_ckpt:,} ({covered_ckpt/len(ckpt)*100:.1f}%)')
for k, v in sorted(by_status_ckpt.items(), key=lambda x: -x[1]):
    print(f'  {k}: {v:,}')

print()
# Figure out how many word-direct MT words exist in v3 vs checkpoint
mt_word_v3 = sum(1 for w in v3 if w.get('meaning_th_source') == 'argos_mt_word_direct')
mt_word_ckpt = sum(1 for w in ckpt if w.get('meaning_th_source') == 'argos_mt_word_direct')
print(f'Word-direct MT in v3: {mt_word_v3:,}')
print(f'Word-direct MT in checkpoint: {mt_word_ckpt:,}')

# CEFR breakdown for v3
print('\nCEFR Coverage in v3:')
by_cefr = {}
for w in v3:
    cefr = w.get('cefr_level', 'UNKNOWN')
    if cefr not in by_cefr:
        by_cefr[cefr] = {'total': 0, 'covered': 0}
    by_cefr[cefr]['total'] += 1
    if has_good_thai(w):
        by_cefr[cefr]['covered'] += 1

for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
    if level in by_cefr:
        d = by_cefr[level]
        pct = d['covered'] / d['total'] * 100
        bar = '█' * int(pct / 5) + '░' * (20 - int(pct / 5))
        print(f'  {level}: [{bar}] {pct:.1f}% ({d["covered"]:,}/{d["total"]:,})')
