#!/usr/bin/env python3
"""
mt_word_direct_resume.py
Resumes word-direct MT from where it stopped.
Skips words that already have 'argos_mt_word_direct' source.
"""
import json, sys, io, re, time
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import argostranslate.translate as argos

def clean_thai(text):
    if not text:
        return text
    for _ in range(4):
        text = re.sub(r'([\u0e00-\u0e7f])\s+([\u0e00-\u0e7f])', r'\1\2', text)
    return re.sub(r'\s+', ' ', text).strip().rstrip('.,;:!?').strip()

def is_good_thai(th, word):
    if not th or len(th) < 2:
        return False
    has_thai = bool(re.search(r'[\u0e00-\u0e7f]', th))
    not_same = th.lower().strip() != word.lower().strip()
    not_garbage = not any(g in th for g in ['WordNet', 'Synset', 'Comment='])
    return has_thai and not_same and not_garbage

def main():
    print('Loading vocabulary-extended-universe-v3.json...')
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)

    # Find all words still PENDING (not yet word-direct translated)
    pending = [
        (i, w) for i, w in enumerate(universe)
        if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION'
        and w.get('meaning_th_source') != 'argos_mt_word_direct'
    ]

    already_done = sum(1 for w in universe if w.get('meaning_th_source') == 'argos_mt_word_direct')
    print(f'Already word-direct translated: {already_done:,}')
    print(f'Still pending: {len(pending):,}')

    print('Warming up Argos...')
    argos.translate('resume', 'en', 'th')
    print('Ready. Starting...')

    success = 0
    failed = 0
    start = time.time()
    updated_universe = list(universe)

    for batch_num, (orig_idx, w) in enumerate(pending):
        word = w['word']
        clean_word = re.sub(r"['\-]", ' ', word).strip()

        th_result = None
        try:
            th_result = argos.translate(clean_word, 'en', 'th')
        except Exception:
            pass

        if th_result:
            th_clean = clean_thai(th_result)
            if is_good_thai(th_clean, word):
                w_up = dict(w)
                w_up['meaning_th'] = th_clean
                w_up['meaning_th_source'] = 'argos_mt_word_direct'
                w_up['lifecycle_status'] = 'MT_TRANSLATED'
                w_up['mt_quality'] = 'WORD_DIRECT'
                updated_universe[orig_idx] = w_up
                success += 1
            else:
                failed += 1
        else:
            failed += 1

        if (batch_num + 1) % 500 == 0:
            elapsed = time.time() - start
            wps = (batch_num + 1) / elapsed
            eta = (len(pending) - batch_num - 1) / max(wps, 0.01) / 60
            pct = (batch_num + 1) / len(pending) * 100
            print(f'  [{batch_num+1:,}/{len(pending):,}] {pct:.1f}% | {wps:.1f} w/s | ETA: {eta:.1f}min', flush=True)

        if (batch_num + 1) % 5000 == 0:
            with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
                json.dump(updated_universe, f, ensure_ascii=False, indent=2)
            print(f'  ✓ Checkpoint at {batch_num+1:,}', flush=True)

    elapsed_total = time.time() - start
    print(f'\nDone in {elapsed_total/60:.1f}min | Success: {success:,} | Failed: {failed:,}')

    print('Saving final...')
    with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
        json.dump(updated_universe, f, ensure_ascii=False, indent=2)

    total = len(updated_universe)
    covered = sum(
        1 for w in updated_universe
        if w.get('meaning_th') and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th', ''))
        and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION'
    )
    print(f'Final coverage: {covered:,}/{total:,} = {covered/total*100:.1f}%')

if __name__ == '__main__':
    main()
