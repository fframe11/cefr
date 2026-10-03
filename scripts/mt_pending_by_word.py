#!/usr/bin/env python3
"""
mt_pending_by_word.py
======================
Translate the remaining 53,763 pending words using the WORD ITSELF (not meaning_en)
Since meaning_en is garbage placeholder for these words, we translate the word directly.

This gets us simpler translations like:
  'hood -> หมวกคลุม
  a-team -> ทีมที่ดีที่สุด
  email -> อีเมล

Then filter by CEFR priority: A1/A2 first (most important for teaching)
"""
import json, sys, io, re, time, argparse
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import argostranslate.translate as argos

def clean_thai_mt(text):
    if not text:
        return text
    for _ in range(4):
        text = re.sub(r'([\u0e00-\u0e7f])\s+([\u0e00-\u0e7f])', r'\1\2', text)
    return re.sub(r'\s+', ' ', text).strip().rstrip('.,;:!?').strip()

def is_good_direct_translation(th, word):
    """For single-word translation, accept if has Thai chars."""
    if not th or len(th) < 2:
        return False
    has_thai = bool(re.search(r'[\u0e00-\u0e7f]', th))
    not_same = th.lower().strip() != word.lower().strip()
    return has_thai and not_same

def main(dry_run=False, cefr_filter=None):
    print('Loading vocabulary-extended-universe-v3.json...')
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)
    
    pending = [
        (i, w) for i, w in enumerate(universe)
        if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION'
    ]
    
    if cefr_filter:
        pending = [(i, w) for i, w in pending if w.get('cefr_level') in cefr_filter]
    
    print(f'Pending to translate (word-level): {len(pending):,}')
    
    if dry_run:
        pending = pending[:30]
        print(f'DRY RUN: {len(pending)} words')
    
    # Warmup
    print('Warming up Argos model...')
    argos.translate('warmup', 'en', 'th')
    print('Ready.')
    
    updated_universe = list(universe)
    success = 0
    failed = 0
    start = time.time()
    
    for batch_num, (orig_idx, w) in enumerate(pending):
        word = w['word']
        
        # Clean word for translation (remove apostrophes, hyphens)
        clean_word = re.sub(r"['\-]", ' ', word).strip()
        
        th_result = None
        try:
            th_result = argos.translate(clean_word, 'en', 'th')
        except Exception:
            pass
        
        if th_result:
            th_clean = clean_thai_mt(th_result)
            if is_good_direct_translation(th_clean, word):
                w_updated = dict(w)
                w_updated['meaning_th'] = th_clean
                w_updated['meaning_th_source'] = 'argos_mt_word_direct'
                w_updated['lifecycle_status'] = 'MT_TRANSLATED'
                w_updated['mt_quality'] = 'WORD_DIRECT'
                updated_universe[orig_idx] = w_updated
                success += 1
            else:
                failed += 1
        else:
            failed += 1
        
        if (batch_num + 1) % 500 == 0:
            elapsed = time.time() - start
            wps = (batch_num + 1) / elapsed
            eta = (len(pending) - batch_num - 1) / wps / 60
            pct = (batch_num + 1) / len(pending) * 100
            print(f'  [{batch_num+1:,}/{len(pending):,}] {pct:.1f}% | {wps:.1f} w/s | ETA: {eta:.1f}min', flush=True)
        
        if not dry_run and (batch_num + 1) % 5000 == 0:
            with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
                json.dump(updated_universe, f, ensure_ascii=False, indent=2)
            print(f'  ✓ Checkpoint saved at {batch_num+1:,}', flush=True)
    
    elapsed_total = time.time() - start
    print(f'\nDone in {elapsed_total:.1f}s | Success: {success:,} | Failed: {failed:,}')
    
    if dry_run:
        print('\nDRY RUN samples:')
        for i, (orig_idx, _) in enumerate(pending[:20]):
            w = updated_universe[orig_idx]
            print(f'  {w["word"]} ({w.get("cefr_level")}): {w.get("meaning_th","[not translated]")[:60]}')
        return
    
    print('Saving final file...')
    with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
        json.dump(updated_universe, f, ensure_ascii=False, indent=2)
    
    # Final coverage
    total = len(updated_universe)
    covered = sum(1 for w in updated_universe
                  if w.get('meaning_th') and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th', ''))
                  and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION')
    print(f'Final coverage: {covered:,}/{total:,} = {covered/total*100:.1f}%')

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    parser.add_argument('--cefr', nargs='+', help='Filter by CEFR level e.g. A1 A2')
    args = parser.parse_args()
    main(dry_run=args.dry_run, cefr_filter=args.cefr)
