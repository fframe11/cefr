#!/usr/bin/env python3
"""
reprocess_mt_flagged_v2.py
Fixes garbage source detection — properly identifies WordNet metadata artifacts
and separates good MT from junk.
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

GARBAGE_PATTERNS = [
    r'WordNet Synet',
    r'Comment=',
    r'ประสาทสัมผัส\)',
    r'^\s*\(\d+\s*ประสาทสัมผัส',
    r'World Found',        # "World Wide Web" artifact
    r'bristles แต่ละด้าน', # bearded seal artifact
]

def is_garbage_thai(th_text):
    """Check if Thai MT output is garbage (contains WordNet metadata artifacts)."""
    if not th_text:
        return True, "empty"
    for pat in GARBAGE_PATTERNS:
        if re.search(pat, th_text):
            return True, "garbage_artifact"
    return False, "ok"

def is_acceptable_thai(th_text):
    """Check if Thai translation is usable — needs >= 50% Thai chars."""
    if not th_text or len(th_text) < 2:
        return False, "empty"
    total_chars = len(th_text.replace(' ', ''))
    thai_chars = len(re.findall(r'[\u0e00-\u0e7f]', th_text))
    if total_chars == 0:
        return False, "empty"
    thai_ratio = thai_chars / total_chars
    if thai_ratio >= 0.5:
        return True, "ok"
    return False, f"low_thai_{thai_ratio:.2f}"

def clean_thai_mt(text):
    if not text:
        return text
    for _ in range(4):
        text = re.sub(r'([\u0e00-\u0e7f])\s+([\u0e00-\u0e7f])', r'\1\2', text)
    return re.sub(r'\s+', ' ', text).strip().rstrip('.,;:!?').strip()

def main():
    print('Loading vocabulary-extended-universe-v3.json...')
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)
    
    rescued = 0
    garbage_cleared = 0
    still_flagged = 0
    
    updated = []
    for w in universe:
        quality = w.get('mt_quality', '')
        
        if quality in ('FLAGGED_HAS_ENGLISH', 'ACCEPTED_LENIENT'):
            th = w.get('meaning_th', '')
            th_clean = clean_thai_mt(th)
            
            w = dict(w)
            
            # First check: is the output garbage (WordNet artifact)?
            is_garbage, _ = is_garbage_thai(th_clean)
            if is_garbage:
                w['meaning_th'] = ''
                w['lifecycle_status'] = 'PENDING_THAI_TRANSLATION'
                w['mt_quality'] = 'CLEARED_GARBAGE_OUTPUT'
                garbage_cleared += 1
            else:
                # Check Thai ratio
                ok, reason = is_acceptable_thai(th_clean)
                w['meaning_th'] = th_clean
                if ok:
                    w['lifecycle_status'] = 'MT_TRANSLATED'
                    w['mt_quality'] = 'ACCEPTED'
                    rescued += 1
                else:
                    w['lifecycle_status'] = 'MT_TRANSLATED_NEEDS_REVIEW'
                    w['mt_quality'] = f'FLAGGED_{reason.upper()}'
                    still_flagged += 1
        
        updated.append(w)
    
    print(f'Rescued (ACCEPTED): {rescued:,}')
    print(f'Garbage cleared:    {garbage_cleared:,}')
    print(f'Still flagged:      {still_flagged:,}')
    
    # Final coverage count
    total = len(updated)
    has_good_thai = sum(
        1 for w in updated
        if w.get('meaning_th')
        and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th', ''))
        and w.get('mt_quality', '') not in ('CLEARED_GARBAGE_OUTPUT',)
        and w.get('lifecycle_status', '') not in ('PENDING_THAI_TRANSLATION',)
    )
    
    print(f'\nFinal coverage: {has_good_thai:,}/{total:,} = {has_good_thai/total*100:.1f}%')
    
    # Status breakdown
    by_status = {}
    for w in updated:
        s = w.get('lifecycle_status', 'unknown')
        by_status[s] = by_status.get(s, 0) + 1
    print('\nBy lifecycle_status:')
    for k, v in sorted(by_status.items(), key=lambda x: -x[1]):
        print(f'  {k}: {v:,}')
    
    # CEFR breakdown with coverage
    by_cefr = {}
    for w in updated:
        cefr = w.get('cefr_level', 'UNKNOWN')
        if cefr not in by_cefr:
            by_cefr[cefr] = {'total': 0, 'has_thai': 0}
        by_cefr[cefr]['total'] += 1
        th = w.get('meaning_th', '')
        if th and re.search(r'[\u0e00-\u0e7f]', th) and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION':
            by_cefr[cefr]['has_thai'] += 1
    
    print('\nCEFR Coverage:')
    for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
        if level in by_cefr:
            d = by_cefr[level]
            pct = d['has_thai'] / d['total'] * 100
            bar = '█' * int(pct / 5) + '░' * (20 - int(pct / 5))
            print(f'  {level}: [{bar}] {pct:.1f}% ({d["has_thai"]:,}/{d["total"]:,})')
    
    # Sample good rescued
    good_samples = [w for w in updated if w.get('mt_quality') == 'ACCEPTED'
                    and w.get('meaning_th_source') == 'argos_mt_en_th'][:12]
    print('\nSample good MT translations:')
    for w in good_samples:
        print(f'  {w["word"]} ({w.get("cefr_level","")}): {w.get("meaning_th","")[:70]}')
    
    # Save
    print('\nSaving...')
    with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
        json.dump(updated, f, ensure_ascii=False, indent=2)
    print('Done.')

if __name__ == '__main__':
    main()
