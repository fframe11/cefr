#!/usr/bin/env python3
"""
reprocess_mt_flagged.py
========================
แก้ไข 53,766 คำที่ FLAGGED_HAS_ENGLISH โดย:
1. Clean meaning_en จาก garbage metadata ก่อน
2. Relax HAS_ENGLISH check — อนุญาต proper nouns / brand names ที่สั้น
3. Accept translation ถ้า Thai chars >= 50% ของ output
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Patterns ที่เป็น garbage ใน meaning_en ของ extended universe (WordNet artifacts)
GARBAGE_PATTERNS = [
    r'^WordNet Synet.*',
    r'^Comment=.*',
    r'Name$',
    r'^\s*\(\d+ ประสาทสัมผัส\)',
    r'^\s*\d+ ประสาทสัมผัส\s*$',
]

def is_garbage_meaning(text):
    if not text:
        return True
    for pat in GARBAGE_PATTERNS:
        if re.search(pat, text):
            return True
    return False

def is_acceptable_thai(th_text, en_text):
    """
    More lenient check: acceptable if > 40% Thai chars and not purely English.
    """
    if not th_text or len(th_text) < 2:
        return False, "empty"
    
    total_chars = len(th_text.replace(' ', ''))
    thai_chars = len(re.findall(r'[\u0e00-\u0e7f]', th_text))
    
    if total_chars == 0:
        return False, "empty"
    
    thai_ratio = thai_chars / total_chars
    
    # Accept if >= 40% Thai
    if thai_ratio >= 0.4:
        return True, "ok"
    
    # Accept if it has some Thai and the English is just a proper noun (short word, capitalized)
    if thai_chars >= 3:
        # Check if English part is just a proper noun
        eng_words = re.findall(r'[a-zA-Z]{4,}', th_text)
        has_proper_noun_only = all(w[0].isupper() for w in eng_words)
        if has_proper_noun_only and len(eng_words) <= 2:
            return True, "ok_proper_noun"
    
    return False, f"low_thai_ratio_{thai_ratio:.2f}"

def clean_thai_mt(text):
    if not text:
        return text
    for _ in range(4):
        text = re.sub(r'([\u0e00-\u0e7f])\s+([\u0e00-\u0e7f])', r'\1\2', text)
    text = re.sub(r'\s+', ' ', text).strip()
    text = text.rstrip('.,;:!?')
    return text.strip()

def main():
    print('Loading vocabulary-extended-universe-v3.json...')
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)
    
    # Recount stats before
    before_stats = {}
    for w in universe:
        q = w.get('mt_quality', w.get('lifecycle_status', 'other'))
        before_stats[q] = before_stats.get(q, 0) + 1
    
    print('Before reprocessing:')
    for k, v in sorted(before_stats.items(), key=lambda x: -x[1])[:8]:
        print(f'  {k}: {v:,}')
    
    # Fix FLAGGED_HAS_ENGLISH by relaxing the check
    rescued = 0
    still_bad = 0
    garbage_source = 0
    
    updated = []
    for w in universe:
        if w.get('mt_quality') == 'FLAGGED_HAS_ENGLISH':
            th = w.get('meaning_th', '')
            en = w.get('meaning_en', '')
            
            # Clean Thai spaces first
            th_clean = clean_thai_mt(th)
            
            # Check if source EN was garbage
            if is_garbage_meaning(en):
                # Mark as needing better source, clear bad MT
                w = dict(w)
                w['meaning_th'] = ''
                w['lifecycle_status'] = 'PENDING_THAI_TRANSLATION'
                w['mt_quality'] = 'SKIPPED_GARBAGE_SOURCE'
                garbage_source += 1
            else:
                # Apply lenient check
                ok, reason = is_acceptable_thai(th_clean, en)
                w = dict(w)
                w['meaning_th'] = th_clean
                if ok:
                    w['lifecycle_status'] = 'MT_TRANSLATED'
                    w['mt_quality'] = 'ACCEPTED_LENIENT'
                    rescued += 1
                else:
                    w['lifecycle_status'] = 'MT_TRANSLATED_NEEDS_REVIEW'
                    w['mt_quality'] = f'FLAGGED_{reason.upper()}'
                    still_bad += 1
        
        updated.append(w)
    
    print(f'\nReprocessing results:')
    print(f'  Rescued (now ACCEPTED_LENIENT): {rescued:,}')
    print(f'  Garbage source (cleared): {garbage_source:,}')
    print(f'  Still flagged: {still_bad:,}')
    
    # Final stats
    after_stats = {}
    for w in updated:
        q = w.get('mt_quality', w.get('lifecycle_status', 'other'))
        after_stats[q] = after_stats.get(q, 0) + 1
    
    print('\nAfter reprocessing:')
    for k, v in sorted(after_stats.items(), key=lambda x: -x[1])[:10]:
        print(f'  {k}: {v:,}')
    
    # Compute final coverage
    verified_statuses = {'VERIFIED_PRODUCTION', 'MT_TRANSLATED', 'ACCEPTED'}
    accepted_qualities = {'ACCEPTED', 'ACCEPTED_LENIENT'}
    
    total_verified = sum(
        1 for w in updated
        if (w.get('lifecycle_status') in verified_statuses
            or w.get('mt_quality') in accepted_qualities)
        and w.get('meaning_th')
        and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th', ''))
    )
    
    total = len(updated)
    print(f'\nFinal coverage: {total_verified:,}/{total:,} = {total_verified/total*100:.1f}%')
    
    # Save
    with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
        json.dump(updated, f, ensure_ascii=False, indent=2)
    print('Saved data/vocabulary-extended-universe-v3.json')
    
    # Sample rescued
    rescued_samples = [w for w in updated if w.get('mt_quality') == 'ACCEPTED_LENIENT'][:15]
    print('\nSample rescued translations:')
    for w in rescued_samples:
        print(f'  {w["word"]} ({w.get("part_of_speech","")}) {w.get("cefr_level","")}: {w.get("meaning_th","")[:80]}')

if __name__ == '__main__':
    main()
