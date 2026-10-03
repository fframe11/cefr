#!/usr/bin/env python3
"""
apply_audit_fixes.py
แก้ไขปัญหาที่พบจาก full_translation_audit:
1. TOO_SHORT ที่ผิดจริง: asleep=ชา (ควรเป็น หลับ), snow(verb)=ตก (ควรเป็น ตกหิมะ)
2. meaning_th ที่สั้นเกินและไม่สมบูรณ์ — เพิ่ม context
3. close(verb)=จบ ควรเป็น ปิด
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

FIXES = {
    # word|pos -> correct_meaning_th
    "asleep|adjective": "หลับอยู่, นอนหลับ",
    "snow|verb": "ตกหิมะ",
    "close|verb": "ปิด, ปิดกั้น",
    "drop|verb": "ตก, หล่น, ทำตก",
    "note|verb": "จดบันทึก, สังเกต",
    "find|verb": "พบ, ค้นพบ",
    "watch|verb": "ดู, เฝ้าดู",
    "make|verb": "ทำ, สร้าง",
    "press|verb": "กด, กดดัน",
    "sink|verb": "จม, ทำให้จม",
    "spill|verb": "หก, ทำให้หก",
    "bear|verb": "ทนทาน, อดทน",
    "pour|verb": "เท, รินน้ำ",
    "paint|noun": "สี, สีทา",
    "well|adjective": "ดี, สบายดี",
    "fine|adjective": "ดี, โอเค",
    "good|adjective": "ดี, เก่ง",
    "funny|adjective": "ตลก, ขบขัน",
    "fresh|adjective": "สด, สดชื่น",
    "bitter|adjective": "ขม, ขมขื่น",
    "drink|verb": "ดื่ม",  # keep as-is but ensure it's there
    "slow|verb": "ช้าลง, ทำให้ช้าลง",
}

with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
    prod = json.load(f)

fixed = 0
fix_log = []

updated = []
for w in prod:
    word = w['word']
    pos  = w['part_of_speech']
    key  = f'{word}|{pos}'
    
    if key in FIXES:
        old = w.get('meaning_th', '')
        new = FIXES[key]
        if old != new:
            w = dict(w)
            w['meaning_th'] = new
            w['meaning_th_source'] = 'audit_fix_v1'
            fix_log.append({'word': word, 'pos': pos, 'old': old, 'new': new})
            fixed += 1
    
    updated.append(w)

print(f'Fixed {fixed} words:')
for f in fix_log:
    print(f'  {f["word"]} ({f["pos"]}): [{f["old"]}] → [{f["new"]}]')

with open('data/vocabulary-production-3860.json', 'w', encoding='utf-8') as f2:
    json.dump(updated, f2, ensure_ascii=False, indent=2)

with open('reports/audit-fix-log.json', 'w', encoding='utf-8') as f2:
    json.dump(fix_log, f2, ensure_ascii=False, indent=2)

print(f'\nSaved. Run audit again to verify.')
