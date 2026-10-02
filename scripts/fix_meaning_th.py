#!/usr/bin/env python3
"""
fix_meaning_th.py - แก้ไข meaning_th ใน vocabulary-production-3860.json
โดยใช้ Lexitron + Kaikki เป็น source of truth

แก้ปัญหา 3 ประเภท:
1. Placeholder English: 'word (ความหมายภาษาไทย)' -> lookup Kaikki/Lexitron
2. Wrong POS (verb บันทึกเป็น adverb meaning 'อย่าง...'): -> lookup Lexitron
3. Lexitron mismatch: replace with Lexitron primary sense

IMPORTANT: บางคำ (four/ten = สี่/สิบ) ที่ต่างกันแค่นิดเดียว ให้ใช้ Lexitron sense
แต่ถ้า Lexitron sense แปลกกว่า (เช่น well=ท่วมท้น) ให้ SKIP และ keep current

Manual overrides สำหรับ special cases ที่ต้องการ human judgment
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# ============================================================
# MANUAL OVERRIDES: คำที่ต้องการ override แบบ explicit
# Key = "word|pos", Value = Thai meaning ที่ถูกต้อง
# ============================================================
MANUAL_OVERRIDES = {
    # Placeholder fixes - ใช้ความหมายที่ถูกต้องตาม CEFR context
    'paradoxical|adjective': 'ซึ่งขัดแย้งในตัวเอง',
    'boiled|adjective': 'ซึ่งต้มแล้ว',
    'camping|noun': 'การตั้งแคมป์',
    'climbing|noun': 'การปีนป่าย',
    'guidebook|noun': 'หนังสือนำเที่ยว',
    'skating|noun': 'การเล่นสเก็ต',
    'divorced|adjective': 'ซึ่งหย่าร้างแล้ว',
    'golfer|noun': 'นักกอล์ฟ',
    'counseling|noun': 'การให้คำปรึกษา',
    'environmental|adjective': 'เกี่ยวกับสิ่งแวดล้อม',
    'evaluation|noun': 'การประเมินผล',
    'recognition|noun': 'การยอมรับ, การรู้จัก',
    'ecological|adjective': 'เกี่ยวกับนิเวศวิทยา',
    'specialty|noun': 'ความชำนาญพิเศษ',
    'transmission|noun': 'การส่งผ่าน, การถ่ายทอด',
    'smoking|noun': 'การสูบบุหรี่',
    'disco|noun': 'ดิสโก้ (สถานที่เต้นรำ)',
    'dressed|adjective': 'ซึ่งแต่งตัวแล้ว',
    'grilled|adjective': 'ซึ่งย่างแล้ว',
    'singing|noun': 'การร้องเพลง',
    'stuck|adjective': 'ซึ่งติดอยู่',
    'addiction|noun': 'การติดยาเสพติด, ความติดใจ',
    'expressive|adjective': 'ซึ่งแสดงออก, ซึ่งบ่งบอก',
    'fictional|adjective': 'ซึ่งเป็นเรื่องสมมติ',
    'funk|noun': 'ดนตรีฟังก์',
    'legendary|adjective': 'ซึ่งเป็นตำนาน, ขึ้นชื่อ',
    'planning|noun': 'การวางแผน',
    'recycling|noun': 'การรีไซเคิล',
    'shooting|noun': 'การยิง, การถ่ายภาพยนตร์',
    'tenderness|noun': 'ความอ่อนโยน',
    'unsuccessful|adjective': 'ซึ่งไม่ประสบความสำเร็จ',
    'wasp|noun': 'ตัวต่อ',
    'criteria|noun': 'เกณฑ์, มาตรฐาน',
    'freezing|adjective': 'ซึ่งแข็งตัวหรือเย็นมาก',
    'ecstatic|adjective': 'ซึ่งปลาบปลื้มมาก',

    # Wrong POS (verb) fixes - ใช้ Lexitron verb meaning
    'wrong|verb': 'ทำผิด, ปฏิบัติไม่ยุติธรรม',
    'least|verb': 'น้อยที่สุด',  # rarely used as verb - keep simple
    'differently|verb': 'ทำให้แตกต่าง',  # adverb masquerading as verb entry
    'free|verb': 'ปลดปล่อย',  # Lexitron correct
    'rapidly|verb': 'เคลื่อนที่อย่างรวดเร็ว',
    'profoundly|verb': 'กระทำอย่างสุดซึ้ง',
    'alone|verb': 'อยู่โดยลำพัง',
    'away|verb': 'จากไป',
    'fast|verb': 'อดอาหาร',  # Lexitron: จำกัดอาหาร -> cleaner: อดอาหาร
    'first|verb': 'ทำก่อน',
    'back|verb': 'ถอยหลัง',   # Lexitron correct - overrides wrong sense
    'forward|verb': 'ส่งต่อ',  # Lexitron correct
    'even|verb': 'ทำให้เท่ากัน',  # Lexitron correct
    'still|verb': 'ทำให้นิ่ง',  # Lexitron correct
    'near|verb': 'ใกล้เข้ามา',  # Lexitron correct
    'last|verb': 'คงอยู่',  # Lexitron correct
    'slow|verb': 'ทำให้ช้าลง',  # cleaner than ฝืดเคือง
    'better|verb': 'ปรับปรุง',  # Lexitron correct
    'please|verb': 'ทำให้พอใจ',  # Lexitron correct
    'well|verb': 'ท่วมท้น',  # Lexitron but rare - keep
    'right|verb': 'ทำให้ถูกต้อง',  # Lexitron correct

    # Number nouns - simplify
    'four|noun': 'สี่',  # current is correct, Lexitron just adds 'จำนวน'
    'ten|noun': 'สิบ',   # same
}

# Words to SKIP (don't auto-fix, human review needed)
SKIP_WORDS = set()

def fix_word(w, lexitron, kaikki):
    """Returns updated word dict, or original if no fix needed."""
    word = w['word']
    pos = w['part_of_speech']
    key = f'{word}|{pos}'
    th = w.get('meaning_th', '')
    
    # Check manual override first
    if key in MANUAL_OVERRIDES:
        fixed = dict(w)
        fixed['meaning_th'] = MANUAL_OVERRIDES[key]
        fixed['meaning_th_source'] = 'manual_cefr_override'
        return fixed, f'manual_override: {th} -> {MANUAL_OVERRIDES[key]}'
    
    # Try Lexitron for any remaining issues
    lex_key = f'{word}|{pos}'
    if lex_key in lexitron:
        lex_entry = lexitron[lex_key][0]
        lex_th = lex_entry['normalized_translation']
        
        # Only auto-apply if current is clearly wrong (placeholder)
        if (re.search(r'[a-zA-Z]{3,}\s*\(', th) or 
            re.match(r'^[a-zA-Z]{3,}', th)):
            fixed = dict(w)
            fixed['meaning_th'] = lex_th
            fixed['meaning_th_source'] = 'lexitron_auto'
            return fixed, f'lexitron_fix: {th} -> {lex_th}'
    
    # Try Kaikki for placeholders where Lexitron has no match
    if (re.search(r'[a-zA-Z]{3,}\s*\(', th) or 
        re.match(r'^[a-zA-Z]{3,}', th)):
        if word in kaikki:
            for e in kaikki[word]:
                if e.get('part_of_speech') == pos and e.get('thai_translation'):
                    kaikki_th = e['thai_translation']
                    fixed = dict(w)
                    fixed['meaning_th'] = kaikki_th
                    fixed['meaning_th_source'] = 'kaikki_auto'
                    return fixed, f'kaikki_fix: {th} -> {kaikki_th}'
    
    return w, None


def main():
    print('Loading data...')
    with open('data/vocabulary-production-3860.json', 'r', encoding='utf-8') as f:
        prod = json.load(f)
    with open('data/lexical-sources/lexitron/2.0/lexitron-usable-index.json', 'r', encoding='utf-8') as f:
        lexitron = json.load(f)
    with open('data/external-cache/kaikki/kaikki-universe-index.json', 'r', encoding='utf-8') as f:
        kaikki = json.load(f)
    
    print(f'Processing {len(prod)} words...')
    
    fixed_words = []
    fix_log = []
    fixed_count = 0
    
    for w in prod:
        updated, msg = fix_word(w, lexitron, kaikki)
        if msg:
            fix_log.append({'word': w['word'], 'pos': w['part_of_speech'], 'change': msg})
            fixed_count += 1
        fixed_words.append(updated)
    
    print(f'\nFixed {fixed_count} meaning_th entries')
    
    # Save updated production file
    output_path = 'data/vocabulary-production-3860.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(fixed_words, f, ensure_ascii=False, indent=2)
    print(f'Saved to {output_path}')
    
    # Save fix log
    log_path = 'reports/meaning-th-fix-log.json'
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump({
            'total_fixed': fixed_count,
            'total_words': len(prod),
            'changes': fix_log
        }, f, ensure_ascii=False, indent=2)
    print(f'Fix log saved to {log_path}')
    
    print('\n=== Changes Applied ===')
    for entry in fix_log:
        print(f'  [{entry["word"]}|{entry["pos"]}] {entry["change"]}')


if __name__ == '__main__':
    main()
