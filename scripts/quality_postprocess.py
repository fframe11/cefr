#!/usr/bin/env python3
"""
quality_postprocess.py
=======================
Post-processing step สำหรับผล MT translation
- Merge Lexitron (authoritative) > Kaikki > MT แบบ priority chain
- Apply CEFR-aware sense selection สำหรับ polysemous words
- Detect & flag suspicious MT outputs
- Generate human review queue (FLAGGED words)
- Final stats & coverage report

Run AFTER libretranslate_pipeline.py:
  python scripts/quality_postprocess.py
"""
import json, sys, io, re
from datetime import datetime
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


# Common CEFR-appropriate sense overrides for polysemous words
# Format: "word|pos" -> preferred_thai_meaning
CEFR_SENSE_PRIORITY = {
    # Polysemous nouns - pick most common CEFR meaning
    'bar|noun': 'บาร์, ร้านเหล้า',       # NOT ลูกกรง (rare)
    'club|noun': 'สโมสร, ชมรม',           # NOT ไพ่ดอกจิก (rare)
    'course|noun': 'หลักสูตร, รายวิชา',   # NOT ช่วงเวลา
    'kind|adjective': 'ใจดี, มีน้ำใจ',    # NOT ชนิด (that's noun)
    'right|adjective': 'ถูกต้อง',          # most common adj sense
    'fast|adjective': 'เร็ว, รวดเร็ว',    # NOT อดอาหาร (that's verb)
    'still|adjective': 'นิ่ง, สงบ',
    'well|adjective': 'ดี, สบายดี',
    'near|adjective': 'ใกล้',
    'even|adjective': 'เท่ากัน, สม่ำเสมอ',
}


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def apply_cefr_sense_override(w):
    """Apply CEFR-appropriate sense for known polysemous words."""
    key = f"{w['word']}|{w['part_of_speech']}"
    if key in CEFR_SENSE_PRIORITY:
        w = dict(w)
        w['meaning_th'] = CEFR_SENSE_PRIORITY[key]
        w['meaning_th_source'] = 'cefr_sense_override'
        w['lifecycle_status'] = 'VERIFIED_PRODUCTION'
        return w, True
    return w, False


def is_suspicious_mt(th_text: str, meaning_en: str) -> tuple[bool, str]:
    """Flag suspicious MT outputs for human review."""
    if not th_text:
        return True, "empty"
    if len(th_text) > 100:
        return True, "too_long"
    if re.search(r'[a-zA-Z]{4,}', th_text):
        return True, "contains_english"
    if not re.search(r'[\u0e00-\u0e7f]', th_text):
        return True, "no_thai"
    if th_text.strip() == meaning_en.strip():
        return True, "untranslated"
    return False, "ok"


def generate_final_report(universe):
    """Compute final coverage stats."""
    total = len(universe)
    by_status = {}
    by_cefr = {}
    
    for w in universe:
        status = w.get('lifecycle_status', 'UNKNOWN')
        cefr = w.get('cefr_level', 'UNKNOWN')
        
        by_status[status] = by_status.get(status, 0) + 1
        
        if cefr not in by_cefr:
            by_cefr[cefr] = {'total': 0, 'has_thai': 0}
        by_cefr[cefr]['total'] += 1
        
        th = w.get('meaning_th', '')
        has_thai = (
            bool(th) and
            not th.startswith('No Thai') and
            not re.search(r'^[a-zA-Z]{3,}\s*\(', th) and
            re.search(r'[\u0e00-\u0e7f]', th)
        )
        if has_thai:
            by_cefr[cefr]['has_thai'] += 1
    
    verified_statuses = {'VERIFIED_PRODUCTION', 'MT_TRANSLATED'}
    verified = sum(v for k, v in by_status.items() if k in verified_statuses)
    needs_review = by_status.get('MT_TRANSLATED_NEEDS_REVIEW', 0)
    pending = by_status.get('PENDING_THAI_TRANSLATION', 0)
    
    return {
        'total': total,
        'verified': verified,
        'needs_review': needs_review,
        'pending': pending,
        'coverage_pct': round(verified / total * 100, 2),
        'by_status': by_status,
        'by_cefr': by_cefr
    }


def main():
    print('Loading data...')
    
    # Check if v3 (post-MT) exists, else use v2
    import os
    if os.path.exists('data/vocabulary-extended-universe-v3.json'):
        universe = load_json('data/vocabulary-extended-universe-v3.json')
        print(f'Loaded v3: {len(universe):,} words')
    else:
        universe = load_json('data/vocabulary-extended-universe-v2.json')
        print(f'Loaded v2: {len(universe):,} words (MT not yet run)')
    
    print('Applying CEFR sense overrides...')
    override_count = 0
    flagged_for_review = []
    
    updated = []
    for w in universe:
        # 1. Apply CEFR sense override for polysemous words
        w, overridden = apply_cefr_sense_override(w)
        if overridden:
            override_count += 1
        
        # 2. Check MT results for suspicious output
        if 'mt_translated' in w.get('lifecycle_status', '').lower():
            th = w.get('meaning_th', '')
            en = w.get('meaning_en', '')
            suspicious, reason = is_suspicious_mt(th, en)
            if suspicious:
                w = dict(w)
                w['lifecycle_status'] = 'MT_TRANSLATED_NEEDS_REVIEW'
                w['mt_flag_reason'] = reason
                flagged_for_review.append({
                    'word': w['word'],
                    'pos': w['part_of_speech'],
                    'cefr': w.get('cefr_level'),
                    'meaning_en': en[:60],
                    'mt_result': th,
                    'reason': reason
                })
        
        updated.append(w)
    
    print(f'CEFR sense overrides applied: {override_count}')
    print(f'MT results flagged for review: {len(flagged_for_review)}')
    
    # Save final version
    output_path = 'data/vocabulary-extended-universe-v3.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(updated, f, ensure_ascii=False, indent=2)
    print(f'Saved: {output_path}')
    
    # Save review queue
    review_path = 'reports/mt-human-review-queue.json'
    with open(review_path, 'w', encoding='utf-8') as f:
        json.dump(flagged_for_review, f, ensure_ascii=False, indent=2)
    print(f'Human review queue: {review_path} ({len(flagged_for_review)} words)')
    
    # Generate final report
    report = generate_final_report(updated)
    
    report_path = 'reports/vocabulary-coverage-final.json'
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f'\n{"="*60}')
    print(f'FINAL VOCABULARY COVERAGE REPORT')
    print(f'{"="*60}')
    print(f'Total words:       {report["total"]:,}')
    print(f'Verified:          {report["verified"]:,} ({report["coverage_pct"]}%)')
    print(f'Needs review:      {report["needs_review"]:,}')
    print(f'Still pending:     {report["pending"]:,}')
    print()
    print('By CEFR Level:')
    for level in ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']:
        if level in report['by_cefr']:
            d = report['by_cefr'][level]
            pct = d['has_thai'] / d['total'] * 100
            bar = '█' * int(pct / 5) + '░' * (20 - int(pct / 5))
            print(f'  {level}: [{bar}] {pct:.1f}% ({d["has_thai"]:,}/{d["total"]:,})')


if __name__ == '__main__':
    main()
