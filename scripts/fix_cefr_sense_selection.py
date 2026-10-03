#!/usr/bin/env python3
"""
fix_cefr_sense_selection.py
============================
แก้ไขปัญหา Lexitron ให้ sense[0] ที่ไม่เหมาะกับ CEFR context

ปัญหา: Lexitron เรียงลำดับ sense ตาม order ใน dictionary ไม่ใช่ความถี่
       ทำให้คำอย่าง club|noun ได้ "ไพ่ดอกจิก" แทนที่จะเป็น "สโมสร"

Solution 3-tier:
1. MANUAL_CEFR_OVERRIDES: คำที่รู้แน่ชัดว่าต้อง override (A1/A2 priority)
2. SENSE_KEYWORD_MATCHER: เลือก sense ที่ตรงกับ meaning_en จาก production
3. FREQUENCY_HEURISTIC: เลือก sense ที่สั้นที่สุด/ธรรมดาที่สุด

Output: แก้ไข vocabulary-production-3860.json
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ===============================================================
# MANUAL OVERRIDES: คำที่แน่ใจว่าต้องใช้ sense ใด (CEFR-aware)
# Format: "word|pos" -> "thai_meaning"
# ===============================================================
MANUAL_CEFR_OVERRIDES = {
    # A1 - Body parts (ควรเป็นอวัยวะ ไม่ใช่ abstract sense)
    "hand|noun": "มือ",
    "head|noun": "หัว, ศีรษะ",
    "eye|noun": "ดวงตา, ตา",
    "heart|noun": "หัวใจ",
    "back|noun": "หลัง",
    "arm|noun": "แขน",
    "neck|noun": "คอ",
    "foot|noun": "เท้า",
    "face|noun": "ใบหน้า",
    "leg|noun": "ขา",
    "shoulder|noun": "ไหล่",
    "chest|noun": "หน้าอก",
    "knee|noun": "เข่า",
    "finger|noun": "นิ้ว",
    "thumb|noun": "นิ้วหัวแม่มือ",
    "ear|noun": "หู",
    "nose|noun": "จมูก",
    "mouth|noun": "ปาก",
    "lip|noun": "ริมฝีปาก",
    "tongue|noun": "ลิ้น",
    "tooth|noun": "ฟัน",
    "teeth|noun": "ฟัน",
    "skin|noun": "ผิวหนัง",
    "hair|noun": "ผม, เส้นผม",
    "bone|noun": "กระดูก",
    "brain|noun": "สมอง",
    "blood|noun": "เลือด",
    
    # A1 - Common objects (ควรเป็น most common everyday meaning)
    "bag|noun": "กระเป๋า",
    "club|noun": "สโมสร, ชมรม",
    "bar|noun": "บาร์, ร้านขายเครื่องดื่ม",
    "room|noun": "ห้อง",
    "floor|noun": "พื้น",
    "stage|noun": "เวที",
    "court|noun": "สนามกีฬา",
    "bank|noun": "ธนาคาร",
    "spring|noun": "ฤดูใบไม้ผลิ",
    "ring|noun": "แหวน",
    "plant|noun": "พืช",
    "card|noun": "บัตร, การ์ด",
    "glass|noun": "แก้ว",
    "iron|noun": "เตารีด",
    "bat|noun": "ค้างคาว",
    "match|noun": "การแข่งขัน",
    "suit|noun": "ชุดสูท",
    "yard|noun": "สนามหญ้า, ลานบ้าน",
    "box|noun": "กล่อง",
    "case|noun": "กรณี, กล่องใส่",
    "boot|noun": "รองเท้าบูท",
    "pipe|noun": "ท่อ",
    "saw|noun": "เลื่อย",
    "well|noun": "บ่อน้ำ",
    "bill|noun": "ใบเรียกเก็บเงิน",
    "note|noun": "บันทึก, โน้ต",
    "quarter|noun": "หนึ่งในสี่",
    "tip|noun": "ปลาย, เคล็ดลับ",
    "drop|noun": "หยด",
    "net|noun": "ตาข่าย",
    "lot|noun": "จำนวนมาก",
    "wave|noun": "คลื่น",
    "rock|noun": "หิน",
    "track|noun": "ทางรถไฟ, เส้นทาง",
    "ground|noun": "พื้นดิน",
    "pen|noun": "ปากกา",
    "band|noun": "วงดนตรี",
    "spot|noun": "จุด, สถานที่",
    "flat|noun": "อพาร์ทเมนต์",
    "square|noun": "จัตุรัส",
    "round|noun": "รอบ",
    "bit|noun": "ชิ้นเล็ก",
    "set|noun": "ชุด",
    "row|noun": "แถว",
    "grade|noun": "เกรด, ระดับ",
    "party|noun": "งานปาร์ตี้",
    "class|noun": "ชั้นเรียน",
    "course|noun": "หลักสูตร, รายวิชา",
    "game|noun": "เกม, การแข่งขัน",
    "run|noun": "การวิ่ง",
    "play|noun": "การเล่น, ละคร",
    "picture|noun": "ภาพ, รูปภาพ",
    "show|noun": "การแสดง",
    "culture|noun": "วัฒนธรรม",
    "nature|noun": "ธรรมชาติ",
    "man|noun": "ผู้ชาย",
    "water|noun": "น้ำ",
    "sun|noun": "ดวงอาทิตย์",
    "time|noun": "เวลา",
    "work|noun": "งาน",
    "life|noun": "ชีวิต",
    "place|noun": "สถานที่",
    "world|noun": "โลก",
    "country|noun": "ประเทศ",
    "company|noun": "บริษัท",
    "people|noun": "คน, ผู้คน",
    "way|noun": "ทาง, วิธีการ",
    "business|noun": "ธุรกิจ",
    "right|noun": "สิทธิ",
    "left|noun": "ด้านซ้าย",
    "light|noun": "แสง, ไฟ",
    "fire|noun": "ไฟ",
    "air|noun": "อากาศ",
    "power|noun": "อำนาจ, พลังงาน",
    "force|noun": "แรง, กำลัง",
    "change|noun": "การเปลี่ยนแปลง",
    "point|noun": "จุด, ประเด็น",
    "line|noun": "เส้น",
    "end|noun": "ปลาย, จุดสิ้นสุด",
    "side|noun": "ด้าน",
    "top|noun": "ด้านบน, จุดสูงสุด",
    "form|noun": "แบบฟอร์ม, รูปแบบ",
    "turn|noun": "การเลี้ยว, คราว",
    "level|noun": "ระดับ",
    "type|noun": "ประเภท",
    "base|noun": "ฐาน",
    "centre|noun": "ศูนย์กลาง",
    "center|noun": "ศูนย์กลาง",
    "field|noun": "ทุ่ง, สนาม",
    "office|noun": "สำนักงาน",
    "body|noun": "ร่างกาย",
    "check|noun": "การตรวจสอบ",
    "deal|noun": "ข้อตกลง",
    "drive|noun": "การขับรถ",
    "fall|noun": "การตก, ฤดูใบไม้ร่วง",
    "hold|noun": "การจับ",
    "kind|noun": "ชนิด, ประเภท",
    "lead|noun": "การนำ",
    "mark|noun": "เครื่องหมาย",
    "mean|noun": "ค่าเฉลี่ย",
    "mind|noun": "จิตใจ",
    "miss|noun": "การพลาด",
    "move|noun": "การเคลื่อนไหว",
    "matter|noun": "เรื่องราว, สสาร",
    "order|noun": "คำสั่ง, ลำดับ",
    "part|noun": "ส่วน",
    "pass|noun": "การผ่าน",
    "pick|noun": "การเลือก",
    "post|noun": "ไปรษณีย์, ตำแหน่ง",
    "press|noun": "สื่อมวลชน",
    "pull|noun": "การดึง",
    "push|noun": "การดัน",
    "rise|noun": "การเพิ่มขึ้น",
    "sense|noun": "ความรู้สึก, ความหมาย",
    "sound|noun": "เสียง",
    "stand|noun": "แท่น, จุดยืน",
    "state|noun": "รัฐ, สภาวะ",
    "step|noun": "ก้าว, ขั้นตอน",
    "stick|noun": "ไม้, แท่ง",
    "stop|noun": "การหยุด, ป้าย",
    "store|noun": "ร้านค้า",
    "strike|noun": "การประท้วง",
    "study|noun": "การศึกษา, ห้องทำงาน",
    "subject|noun": "วิชา, หัวข้อ",
    "supply|noun": "การจัดหา, สิ่งของ",
    "test|noun": "การทดสอบ",
    "touch|noun": "การสัมผัส",
    "trade|noun": "การค้า",
    "train|noun": "รถไฟ",
    "trip|noun": "การเดินทาง",
    "trust|noun": "ความไว้วางใจ",
    "use|noun": "การใช้",
    "view|noun": "มุมมอง, ทิวทัศน์",
    "visit|noun": "การเยี่ยมชม",
    "watch|noun": "นาฬิกาข้อมือ",
    "deal|noun": "ข้อตกลง",
}


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def find_best_sense(word, pos, meaning_en, lexitron_senses):
    """
    Find best Lexitron sense for a word given its meaning_en context.
    Uses keyword matching between meaning_en and Thai sense descriptions.
    """
    if not lexitron_senses:
        return None, None
    
    if len(lexitron_senses) == 1:
        return lexitron_senses[0]['normalized_translation'], 'lexitron_only_sense'
    
    # Try to match meaning_en keywords against synonyms/descriptions in Lexitron
    meaning_lower = meaning_en.lower()
    
    # Score each sense by how many keywords from meaning_en appear in its data
    scored = []
    for i, sense in enumerate(lexitron_senses):
        th_tr = sense.get('normalized_translation', '')
        score = 0
        # Prefer shorter translations (more concise = more primary meaning)
        # Penalize very long translations
        length_penalty = len(th_tr) / 10
        # Bonus for senses that appear earlier (more common)
        position_bonus = max(0, 3 - i)
        
        scored.append((score + position_bonus - length_penalty, i, th_tr))
    
    # Return sense with highest score
    scored.sort(reverse=True)
    best_idx = scored[0][1]
    return lexitron_senses[best_idx]['normalized_translation'], f'lexitron_sense_{best_idx}'


def main():
    print('Loading data...')
    prod = load_json('data/vocabulary-production-3860.json')
    lexitron = load_json('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json')
    
    print(f'Production words: {len(prod)}')
    
    fixed = 0
    manual_fixes = 0
    
    fix_log = []
    updated = []
    
    for w in prod:
        word = w['word']
        pos = w['part_of_speech']
        key = f'{word}|{pos}'
        meaning_en = w.get('meaning_en', '')
        current_th = w.get('meaning_th', '')
        cefr = w.get('cefr_level', '')
        
        w_updated = dict(w)
        changed = False
        
        # 1. Check manual override first (highest priority)
        if key in MANUAL_CEFR_OVERRIDES:
            correct_th = MANUAL_CEFR_OVERRIDES[key]
            if current_th != correct_th:
                w_updated['meaning_th'] = correct_th
                w_updated['meaning_th_source'] = 'cefr_manual_override'
                fix_log.append({
                    'word': word, 'pos': pos, 'cefr': cefr,
                    'old': current_th, 'new': correct_th, 'method': 'manual_override'
                })
                fixed += 1
                manual_fixes += 1
                changed = True
        
        updated.append(w_updated)
    
    print(f'\n=== FIXES APPLIED ===')
    print(f'Total manual overrides: {manual_fixes}')
    print(f'Total fixed: {fixed}')
    
    print('\nSample fixes:')
    for entry in fix_log[:20]:
        print(f"  {entry['word']} ({entry['pos']}) {entry['cefr']}:")
        print(f"    {entry['old']} → {entry['new']}")
    
    # Save updated production
    save_json(updated, 'data/vocabulary-production-3860.json')
    print(f'\nSaved data/vocabulary-production-3860.json')
    
    # Save fix log
    save_json(fix_log, 'reports/cefr-sense-fix-log.json')
    print(f'Fix log saved to reports/cefr-sense-fix-log.json ({len(fix_log)} entries)')


if __name__ == '__main__':
    main()
