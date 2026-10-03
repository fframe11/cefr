#!/usr/bin/env python3
"""
fix_all_flagged_words.py
แก้ทุกคำที่ flagged ใน production-3860 ให้ถูกต้องตาม:
1. CEFR level (A1 ควรได้ความหมายหลักที่พบบ่อยที่สุดในชีวิตประจำวัน)
2. meaning_en จริงในไฟล์ (เพื่อให้ตรงกับ sense ที่ต้องการสอน)
3. Lexitron เป็น reference แต่ CEFR context มาก่อนเสมอ
"""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ═══════════════════════════════════════════════════════════
# VERIFIED FIXES — ตรวจสอบทีละคำ ตาม CEFR + meaning_en + Lexitron
# Format: "word|pos" -> "Thai meaning ที่ถูกต้อง"
# ═══════════════════════════════════════════════════════════
VERIFIED_FIXES = {

    # ── TOO_SHORT: คำที่ถูกต้องแต่สั้นเกิน → เพิ่ม context ──────────────
    "drug|noun":        "ยา, สารเสพติด",           # A2 - ยา (ทั้ง medicine และ drug)
    "neck|noun":        "คอ",                        # A1 - ถูกต้อง (short but correct)
    "cough|verb":       "ไอ, ไอจาม",               # B1 - เพิ่ม context
    "rain|noun":        "ฝน, น้ำฝน",               # A1 - เพิ่ม น้ำฝน
    "ant|noun":         "มด",                        # B1 - ถูกต้อง
    "black|adjective":  "สีดำ",                     # A1 - ระบุว่าเป็นสี
    "find|verb":        "ค้นพบ, พบ",               # A1 - ค้นพบ ชัดกว่า พบ
    "make|verb":        "ทำ, สร้าง, ผลิต",         # A1 - ครอบคลุมทุก sense
    "note|verb":        "จดบันทึก, สังเกต",         # A1 - ชัดเจนกว่า จด
    "paint|noun":       "สี, สีทา",                 # A1 - paint = สีทา (ไม่ใช่ color ทั่วไป)
    "well|adjective":   "สบายดี, ดี",              # A1 - well = healthy/okay
    "bear|verb":        "อดทน, ทนทาน",             # A2 - bear = endure
    "close|verb":       "ปิด",                      # A1 - close = shut (ไม่ใช่ end)
    "drop|verb":        "ทำหล่น, ตก, ลดลง",       # A1 - drop = let fall / decrease
    "fine|adjective":   "สบายดี, โอเค, ดี",        # A1 - I'm fine
    "good|adjective":   "ดี, เก่ง",                # A1 - good quality/skill
    "watch|verb":       "ดู, เฝ้าดู, สังเกต",      # A1 - watch = observe
    "press|verb":       "กด, กดดัน",                # B1 - press a button / pressurize
    "funny|adjective":  "ตลก, ขบขัน",              # A1 - funny = amusing
    "fresh|adjective":  "สด, สดชื่น",              # A2 - fresh food / fresh air
    "pour|verb":        "เท, รินน้ำ",              # A2 - pour liquid
    "snow|verb":        "ตกหิมะ",                  # A2 - it's snowing
    "sink|verb":        "จม, ทำให้จม",             # B1 - sink / cause to sink
    "slow|verb":        "ทำให้ช้าลง, ลดความเร็ว", # B1 - slow down
    "spill|verb":       "หก, ทำให้หก",             # A2 - spill liquid
    "bitter|adjective": "ขม, ขมขื่น",              # B1 - bitter taste / feeling
    "punch|verb":       "ชก, ต่อย",               # B2 - punch with fist
    "shrink|verb":      "หดตัว, ย่อเล็กลง",       # B2 - clothes shrink / shrink back
    "slap|verb":        "ตบ, ตบหน้า",              # B2 - slap someone
    "stagger|verb":     "เดินโซเซ, โซเซ",          # C1 - stagger = walk unsteadily
    "strike|verb":      "ตี, หยุดงานประท้วง",     # B1 - strike = hit / industrial strike
    "bird|noun":        "นก",                       # A1 - ถูกต้อง (iconic short word)
    "flag|noun":        "ธง",                       # A1 - ถูกต้อง
    "hole|noun":        "รู, ช่อง",                # A1 - hole in something
    "leg|noun":         "ขา",                       # A1 - ถูกต้อง
    "ear|noun":         "หู",                       # A1 - ถูกต้อง (Lexitron sense[0] ผิด!)
    "wind|noun":        "ลม",                       # A1 - ถูกต้อง
    "ghost|noun":       "ผี, วิญญาณ",             # A1 - ghost/spirit
    "snake|noun":       "งู",                       # A1 - ถูกต้อง
    "frog|noun":        "กบ",                       # A1 - ถูกต้อง
    "fire|noun":        "ไฟ, เปลวไฟ",             # A1 - fire/flame

    # ── LEXITRON_MISMATCH: ตรวจสอบตาม meaning_en จริง ─────────────────────

    # A1 - CEFR overrides ที่เราทำไว้ถูกต้อง
    "bar|noun":         "บาร์, ร้านขายเครื่องดื่ม",  # A1: night bar (collocation = night club, bar)
    "case|noun":        "กรณี, เรื่องราว",           # A1: a case = situation/matter
    "party|noun":       "งานปาร์ตี้, งานเลี้ยง",   # A1: party = celebration (both valid)
    "game|noun":        "เกม, การแข่งขัน",           # A1: game = game/match
    "picture|noun":     "รูปภาพ, ภาพ",              # A1: picture = photo/image
    "flat|noun":        "อพาร์ทเมนต์",              # A1 BrE: flat = apartment (collocation = flat)
    "card|noun":        "บัตร, การ์ด",              # A1: card = greeting card / ID card
    "change|noun":      "การเปลี่ยนแปลง, เงินทอน", # A1: change (money) + change (transformation)
    "end|noun":         "ตอนจบ, ส่วนปลาย",         # A1: end of story / end of stick
    "fast|verb":        "อดอาหาร",                  # A1: to fast = abstain from food
    "field|noun":       "ทุ่งนา, สนาม",             # A1: field (land) / playing field
    "ground|noun":      "พื้นดิน, พื้น",            # A1: ground = earth / floor
    "light|noun":       "แสงสว่าง, ไฟ",            # A1: light = brightness / lamp
    "miss|noun":        "นางสาว",                   # A1: Miss (title) — EN = Miss Smith
    "company|noun":     "บริษัท",                   # A2: company = organization (most common A2 sense)
    "sense|noun":       "ประสาทสัมผัส, ความรู้สึก", # A2: 5 senses / sense of humor
    "state|noun":       "รัฐ, สภาพ",               # A2: state (country part) / state of mind
    "track|noun":       "รางรถไฟ, เส้นทาง, เพลง",  # A2: train track / music track
    "view|noun":        "ทิวทัศน์, มุมมอง",        # A2: scenic view / point of view
    "lead|noun":        "ตำแหน่งนำ, ผู้นำ",        # A2: in the lead / take the lead
    "press|noun":       "สื่อมวลชน, หนังสือพิมพ์", # B1: the press = media
    "push|noun":        "การผลัก, การกดดัน",        # B1: a push = a shove
    "suit|noun":        "ชุดสูท",                   # A2: suit = formal clothing (most common A2)
    "tip|noun":         "เคล็ดลับ, ปลาย",          # A2: a tip = hint / tip of finger
    "stick|noun":       "ไม้, ไม้เท้า",            # B2: a stick = a rod/cane
    "trust|noun":       "ความไว้วางใจ, ความเชื่อใจ", # B2: trust = confidence (Lexitron ='ความเชื่อใจ' ✓)

    # Additional corrections from mismatch list
    "supply|noun":      "การจัดหา, อุปทาน",        # B1: supply and demand
}

def main():
    print('Loading production-3860.json...')
    with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
        prod = json.load(f)

    print(f'Total words: {len(prod)}')
    fixed = 0
    fix_log = []

    updated = []
    for w in prod:
        word = w['word']
        pos  = w['part_of_speech']
        key  = word + '|' + pos

        if key in VERIFIED_FIXES:
            old_th = w.get('meaning_th', '')
            new_th = VERIFIED_FIXES[key]
            if old_th != new_th:
                w = dict(w)
                w['meaning_th'] = new_th
                w['meaning_th_source'] = 'verified_fix_v2'
                fix_log.append({
                    'word': word, 'pos': pos,
                    'cefr': w.get('cefr_level', ''),
                    'old': old_th, 'new': new_th
                })
                fixed += 1

        updated.append(w)

    print(f'\nFixed: {fixed} words')
    for entry in fix_log:
        print(f'  {entry["word"]:20} ({entry["pos"]:10}) {entry["cefr"]}')
        print(f'    {entry["old"]} → {entry["new"]}')

    with open('data/vocabulary-production-3860.json', 'w', encoding='utf-8') as f:
        json.dump(updated, f, ensure_ascii=False, indent=2)

    with open('reports/verified-fix-v2-log.json', 'w', encoding='utf-8') as f:
        json.dump(fix_log, f, ensure_ascii=False, indent=2)

    print(f'\nSaved. Fix log: reports/verified-fix-v2-log.json ({len(fix_log)} entries)')

if __name__ == '__main__':
    main()
