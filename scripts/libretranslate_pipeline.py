#!/usr/bin/env python3
"""
libretranslate_pipeline.py
==========================
Full EN->TH translation pipeline using Argos Translate (LibreTranslate engine)
ใช้แปล meaning_th สำหรับคำศัพท์ที่ยังไม่มี Thai translation

Strategy:
  Priority 1: Lexitron lookup (authoritative dictionary) → already done
  Priority 2: Kaikki/Wiktionary lookup → already done  
  Priority 3: Argos Translate EN->TH (this script) → neural MT
  
Quality Control:
  - สำหรับ single-word meaning: translate meaning_en ไม่ใช่ word โดยตรง
  - Post-process: strip trailing punctuation, normalize spaces
  - Flag words where MT result looks suspicious (too long, has English, etc.)
  - Save confidence score ไว้สำหรับ human review prioritization

Input:  data/vocabulary-extended-universe-v2.json (121,253 words)
Output: data/vocabulary-extended-universe-v3.json (with MT translations)
        reports/mt-translation-stats.json

Usage:
  python scripts/libretranslate_pipeline.py
  python scripts/libretranslate_pipeline.py --batch-size 500 --start 0
  python scripts/libretranslate_pipeline.py --dry-run (test first 20 words)
"""
import json, sys, io, re, os, time, argparse
from datetime import datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ============================================================
# Argos Translate setup
# ============================================================
try:
    import argostranslate.translate as argos
    ARGOS_AVAILABLE = True
    print("✓ Argos Translate loaded")
except ImportError:
    ARGOS_AVAILABLE = False
    print("✗ Argos Translate not available")


def get_installed_languages():
    """Check if EN->TH translation works by doing a quick test translate."""
    if not ARGOS_AVAILABLE:
        return False
    try:
        result = argos.translate("test", "en", "th")
        # If result is non-empty and contains Thai chars OR is different from input
        import re
        has_thai = bool(re.search(r'[\u0e00-\u0e7f]', result or ''))
        is_different = (result or '').strip().lower() != 'test'
        return has_thai or is_different
    except Exception as e:
        print(f"Language check error: {e}")
        return False


def translate_en_to_th(text: str) -> str | None:
    """Translate English text to Thai using Argos Translate."""
    if not ARGOS_AVAILABLE:
        return None
    try:
        result = argos.translate(text, "en", "th")
        return result.strip() if result else None
    except Exception as e:
        return None


# ============================================================
# Quality filters
# ============================================================
def is_good_translation(th_text: str, en_text: str) -> tuple[bool, str]:
    """
    Checks if MT translation looks valid.
    Returns (is_good, reason)
    """
    if not th_text or len(th_text) < 2:
        return False, "empty"
    
    # Too long (meaning should be concise)
    if len(th_text) > 80:
        return False, "too_long"
    
    # Still has English (bad MT)
    if re.search(r'[a-zA-Z]{4,}', th_text):
        return False, "has_english"
    
    # Same as input (MT returned English)
    if th_text.lower().strip() == en_text.lower().strip():
        return False, "same_as_input"
    
    # Has Thai characters (required)
    if not re.search(r'[\u0e00-\u0e7f]', th_text):
        return False, "no_thai_chars"
    
    return True, "ok"


def clean_mt_output(th_text: str) -> str:
    """Post-process MT output for clean meaning_th."""
    if not th_text:
        return th_text
    # 1. Remove spurious spaces between Thai characters (Argos Translate artifact)
    #    e.g. 'การ ป้องกัน สิ่ง แวด ล้อม' -> 'การป้องกันสิ่งแวดล้อม'
    for _ in range(4):
        th_text = re.sub(r'([\u0e00-\u0e7f])\s+([\u0e00-\u0e7f])', r'\1\2', th_text)
    # 2. Normalize remaining whitespace
    th_text = re.sub(r'\s+', ' ', th_text).strip()
    # 3. Remove trailing punctuation
    th_text = th_text.rstrip('.,;:!?')
    # 4. Remove leading artifact from MT
    th_text = re.sub(r'^เพื่อ\s+', '', th_text)
    return th_text.strip()


# ============================================================
# Main pipeline
# ============================================================
def run_pipeline(args):
    start_time = datetime.now()
    print(f"Started at {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Check Argos is ready
    if not ARGOS_AVAILABLE:
        print("ERROR: argostranslate not installed. Run: pip install argostranslate")
        sys.exit(1)
    
    has_en_th = get_installed_languages()
    if not has_en_th:
        print("ERROR: EN->TH language pack not installed.")
        print("Run: python scripts/setup_argos_en_th.py")
        sys.exit(1)
    
    print("✓ EN->TH language pack ready")
    
    # Load data
    input_path = 'data/vocabulary-extended-universe-v2.json'
    print(f"Loading {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        universe = json.load(f)
    
    print(f"Total words: {len(universe):,}")
    
    # Filter: only words that need MT translation
    pending = [
        (i, w) for i, w in enumerate(universe)
        if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION'
        and w.get('meaning_en')  # must have English definition to translate
    ]
    
    print(f"Words needing MT: {len(pending):,}")
    
    if args.dry_run:
        pending = pending[:20]
        print(f"DRY RUN: processing first {len(pending)} words only")
    elif args.limit:
        pending = pending[args.start:args.start + args.limit]
        print(f"Processing slice [{args.start}:{args.start + args.limit}] = {len(pending)} words")
    
    # Stats
    stats = {
        'total_pending': len(pending),
        'mt_success': 0,
        'mt_failed': 0,
        'mt_low_quality': 0,
        'quality_issues': [],
        'elapsed_seconds': 0,
        'words_per_second': 0,
        'started_at': start_time.isoformat()
    }
    
    updated_universe = list(universe)  # mutable copy
    
    print(f"\nTranslating {len(pending)} words...")
    batch_start = time.time()
    
    for batch_num, (orig_idx, w) in enumerate(pending):
        word = w.get('word', '')
        meaning_en = w.get('meaning_en', '').strip()
        pos = w.get('part_of_speech', '')
        
        # Smart source text selection:
        # 1. If meaning_en is short (≤ 6 words), translate it directly
        # 2. If meaning_en is long (> 10 words), translate just the first clause
        # 3. If no meaning_en, translate the word itself
        if meaning_en:
            words_in_meaning = meaning_en.split()
            if len(words_in_meaning) <= 10:
                text_to_translate = meaning_en
            else:
                # Truncate: take first clause (up to first ';' or ',') or first 8 words
                first_clause = meaning_en.split(';')[0].split(',')[0]
                if len(first_clause.split()) <= 3:
                    first_clause = ' '.join(words_in_meaning[:8])
                text_to_translate = first_clause.strip()
        else:
            text_to_translate = word
        
        th_result = translate_en_to_th(text_to_translate)

        
        if th_result:
            th_clean = clean_mt_output(th_result)
            is_good, reason = is_good_translation(th_clean, text_to_translate)
            
            updated = dict(w)
            
            if is_good:
                updated['meaning_th'] = th_clean
                updated['meaning_th_source'] = 'argos_mt_en_th'
                updated['lifecycle_status'] = 'MT_TRANSLATED'
                updated['mt_quality'] = 'ACCEPTED'
                stats['mt_success'] += 1
            else:
                updated['meaning_th'] = th_clean or ''
                updated['meaning_th_source'] = 'argos_mt_en_th_flagged'
                updated['lifecycle_status'] = 'MT_TRANSLATED_NEEDS_REVIEW'
                updated['mt_quality'] = f'FLAGGED_{reason.upper()}'
                stats['mt_low_quality'] += 1
                if len(stats['quality_issues']) < 500:  # cap list size
                    stats['quality_issues'].append({
                        'word': word, 'pos': pos,
                        'meaning_en': meaning_en[:60],
                        'mt_result': th_clean,
                        'reason': reason
                    })
            
            updated_universe[orig_idx] = updated
        else:
            stats['mt_failed'] += 1
        
        # Progress report every 500 words
        if (batch_num + 1) % 500 == 0:
            elapsed = time.time() - batch_start
            wps = (batch_num + 1) / elapsed
            remaining = (len(pending) - batch_num - 1) / wps if wps > 0 else 0
            pct = (batch_num + 1) / len(pending) * 100
            print(f"  [{batch_num+1:,}/{len(pending):,}] {pct:.1f}% | "
                  f"{wps:.1f} words/s | ETA: {remaining/60:.1f}min", flush=True)
        
        # Checkpoint save every 5000 words
        if not args.dry_run and (batch_num + 1) % 5000 == 0:
            checkpoint_path = f'data/vocabulary-extended-universe-v3-checkpoint.json'
            with open(checkpoint_path, 'w', encoding='utf-8') as f:
                json.dump(updated_universe, f, ensure_ascii=False, indent=2)
            print(f"  ✓ Checkpoint saved at {batch_num+1:,} words", flush=True)
    
    elapsed_total = time.time() - batch_start
    stats['elapsed_seconds'] = round(elapsed_total, 1)
    stats['words_per_second'] = round(len(pending) / elapsed_total, 2) if elapsed_total > 0 else 0
    stats['finished_at'] = datetime.now().isoformat()
    
    # Save results
    if not args.dry_run:
        output_path = 'data/vocabulary-extended-universe-v3.json'
        print(f"\nSaving {output_path}...")
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(updated_universe, f, ensure_ascii=False, indent=2)
        print(f"Saved {output_path}")
    else:
        output_path = 'DRY_RUN (not saved)'
    
    # Final stats
    stats_path = 'reports/mt-translation-stats.json'
    with open(stats_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)
    
    print(f"\n{'='*60}")
    print(f"MT TRANSLATION PIPELINE COMPLETE")
    print(f"{'='*60}")
    print(f"Processed:         {len(pending):,}")
    print(f"✓ MT Success:      {stats['mt_success']:,}")
    print(f"⚠ MT Flagged:      {stats['mt_low_quality']:,}")
    print(f"✗ MT Failed:       {stats['mt_failed']:,}")
    print(f"Speed:             {stats['words_per_second']:.1f} words/s")
    print(f"Elapsed:           {stats['elapsed_seconds']:.1f}s")
    print(f"Output:            {output_path}")
    
    if args.dry_run:
        print("\n=== DRY RUN SAMPLES ===")
        for i, (orig_idx, _) in enumerate(pending[:10]):
            w = updated_universe[orig_idx]
            print(f"  {w['word']} ({w['part_of_speech']}) -> '{w.get('meaning_th', '')}' "
                  f"[{w.get('mt_quality', '')}]")
    
    return stats


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='LibreTranslate EN->TH pipeline for vocabulary')
    parser.add_argument('--dry-run', action='store_true', help='Test with first 20 words only')
    parser.add_argument('--limit', type=int, default=0, help='Max words to process (0=all)')
    parser.add_argument('--start', type=int, default=0, help='Start offset in pending list')
    parser.add_argument('--batch-size', type=int, default=1000, help='Checkpoint every N words')
    args = parser.parse_args()
    
    run_pipeline(args)
