#!/usr/bin/env python3
"""
scale_vocabulary_verification.py
=================================
Batch-verifies คำศัพท์จาก vocabulary-extended-universe.json (121,253 คำ)
โดยใช้ Lexitron + Kaikki ทำให้คำที่มี Thai translation ได้รับการ verify

ขั้นตอน:
1. อ่าน extended universe (121,253 คำ)
2. สำหรับแต่ละคำ ค้นหา Thai translation จาก Lexitron → Kaikki
3. คำที่มี Thai source ให้ตั้ง lifecycle_status = VERIFIED_PRODUCTION
   พร้อม meaning_th ที่ถูกต้อง
4. คำที่ไม่มี Thai source → lifecycle_status = PENDING_THAI_TRANSLATION
5. Export เป็น vocabulary-extended-universe-v2.json พร้อม stats

OUTPUT:
- data/vocabulary-extended-universe-v2.json  (full updated)
- reports/scale-verification-stats.json      (stats summary)
"""
import json, sys, io, re, os
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BATCH_SIZE = 5000
REPORT_EVERY = 10000

def load_json(path):
    print(f'Loading {path}...')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_lexitron_th(word, pos, lexitron):
    """Get best Thai translation from Lexitron for word+pos."""
    key = f'{word}|{pos}'
    if key in lexitron:
        entries = lexitron[key]
        # Primary sense = first entry
        return entries[0]['normalized_translation'], 'lexitron'
    # Try without POS constraint (any POS)
    for p in ['noun', 'verb', 'adjective', 'adverb']:
        k = f'{word}|{p}'
        if k in lexitron:
            return lexitron[k][0]['normalized_translation'], f'lexitron_{p}'
    return None, None

def get_kaikki_th(word, pos, kaikki):
    """Get Thai translation from Kaikki Wiktionary for word+pos."""
    if word not in kaikki:
        return None, None
    entries = kaikki[word]
    # Match POS first
    for e in entries:
        if e.get('part_of_speech') == pos and e.get('thai_translation'):
            return e['thai_translation'], 'kaikki'
    # Fallback to any POS
    for e in entries:
        if e.get('thai_translation'):
            return e['thai_translation'], 'kaikki_any_pos'
    return None, None

def verify_word(w, lexitron, kaikki):
    """
    Returns updated word with:
    - meaning_th: best Thai translation
    - meaning_th_source: where it came from
    - lifecycle_status: VERIFIED_PRODUCTION or PENDING_THAI_TRANSLATION
    """
    word = w.get('word', '')
    pos = w.get('part_of_speech', 'noun')
    current_th = w.get('meaning_th', '')
    
    # Already has good Thai (not placeholder)
    has_good_th = (
        bool(current_th) and
        not re.search(r'[a-zA-Z]{3,}\s*\(', current_th) and
        not re.match(r'^[a-zA-Z]{3,}', current_th) and
        not current_th.startswith('No Thai') and
        len(current_th) >= 2
    )
    
    # Try Lexitron first (most authoritative for EN-TH)
    lex_th, lex_src = get_lexitron_th(word, pos, lexitron)
    
    # Try Kaikki
    kaikki_th, kaikki_src = get_kaikki_th(word, pos, kaikki)
    
    updated = dict(w)
    
    if lex_th:
        # Lexitron is primary source of truth
        updated['meaning_th'] = lex_th
        updated['meaning_th_source'] = lex_src
        updated['lifecycle_status'] = 'VERIFIED_PRODUCTION'
    elif kaikki_th:
        updated['meaning_th'] = kaikki_th
        updated['meaning_th_source'] = kaikki_src
        updated['lifecycle_status'] = 'VERIFIED_PRODUCTION'
    elif has_good_th:
        # Keep existing if it looks valid
        updated['meaning_th_source'] = updated.get('meaning_th_source', 'existing')
        updated['lifecycle_status'] = 'VERIFIED_PRODUCTION'
    else:
        updated['lifecycle_status'] = 'PENDING_THAI_TRANSLATION'
        if not current_th or current_th.startswith('No Thai'):
            updated['meaning_th'] = ''
    
    return updated

def main():
    start = datetime.now()
    print(f'Started at {start.isoformat()}')
    
    universe = load_json('data/vocabulary-extended-universe.json')
    lexitron = load_json('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json')
    kaikki = load_json('data/external-cache/kaikki/kaikki-universe-index.json')
    
    print(f'\nTotal words in extended universe: {len(universe):,}')
    print(f'Lexitron entries: {len(lexitron):,}')
    print(f'Kaikki entries: {len(kaikki):,}')
    print('\nProcessing...')
    
    stats = {
        'total': len(universe),
        'verified_lexitron': 0,
        'verified_kaikki': 0,
        'verified_existing': 0,
        'pending_thai': 0,
        'cefr_breakdown': {},
        'processed_at': start.isoformat()
    }
    
    updated_universe = []
    
    for i, w in enumerate(universe):
        updated = verify_word(w, lexitron, kaikki)
        updated_universe.append(updated)
        
        src = updated.get('meaning_th_source', '')
        status = updated.get('lifecycle_status', '')
        
        if 'lexitron' in src:
            stats['verified_lexitron'] += 1
        elif 'kaikki' in src:
            stats['verified_kaikki'] += 1
        elif status == 'VERIFIED_PRODUCTION':
            stats['verified_existing'] += 1
        else:
            stats['pending_thai'] += 1
        
        cefr = w.get('cefr_level', 'UNKNOWN')
        if cefr not in stats['cefr_breakdown']:
            stats['cefr_breakdown'][cefr] = {'total': 0, 'verified': 0, 'pending': 0}
        stats['cefr_breakdown'][cefr]['total'] += 1
        if status == 'VERIFIED_PRODUCTION':
            stats['cefr_breakdown'][cefr]['verified'] += 1
        else:
            stats['cefr_breakdown'][cefr]['pending'] += 1
        
        if (i + 1) % REPORT_EVERY == 0:
            verified_so_far = stats['verified_lexitron'] + stats['verified_kaikki'] + stats['verified_existing']
            pct = verified_so_far / (i + 1) * 100
            print(f'  Processed {i+1:,}/{len(universe):,} | Verified: {verified_so_far:,} ({pct:.1f}%)')
    
    # Save updated universe
    output_path = 'data/vocabulary-extended-universe-v2.json'
    print(f'\nSaving {output_path}...')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(updated_universe, f, ensure_ascii=False, indent=2)
    
    total_verified = stats['verified_lexitron'] + stats['verified_kaikki'] + stats['verified_existing']
    stats['total_verified'] = total_verified
    stats['verification_rate_pct'] = round(total_verified / stats['total'] * 100, 2)
    
    # Save stats
    stats_path = 'reports/scale-verification-stats.json'
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    end = datetime.now()
    elapsed = (end - start).total_seconds()
    
    print(f'\n{"="*60}')
    print(f'SCALE VERIFICATION COMPLETE')
    print(f'{"="*60}')
    print(f'Total words processed: {stats["total"]:,}')
    print(f'Verified (Lexitron):   {stats["verified_lexitron"]:,}')
    print(f'Verified (Kaikki):     {stats["verified_kaikki"]:,}')
    print(f'Verified (existing):   {stats["verified_existing"]:,}')
    print(f'Pending Thai:          {stats["pending_thai"]:,}')
    print(f'Total Verified:        {total_verified:,} ({stats["verification_rate_pct"]}%)')
    print(f'Elapsed: {elapsed:.1f}s')
    print(f'\nStats: {stats_path}')
    print(f'Output: {output_path}')
    print()
    print('CEFR Breakdown:')
    for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
        if level in stats['cefr_breakdown']:
            d = stats['cefr_breakdown'][level]
            pct = d['verified'] / d['total'] * 100
            print(f'  {level}: {d["verified"]:,}/{d["total"]:,} verified ({pct:.1f}%)')

if __name__ == '__main__':
    main()
