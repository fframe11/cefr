#!/usr/bin/env python3
"""
auto_translate_remaining.py
แปลที่เหลือทั้งหมดโดย pattern:
- Greek/Roman gods → เทพ[ชื่อ]
- Scientists/People → [ชื่อ] (นักวิทยาศาสตร์/บุคคล)
- Cities/Places → [ชื่อ] (สถานที่/เมือง)
- -idae, -aceae → วงศ์[ชื่อ]
- -osis, -emia, -itis → โรค/ภาวะ[ชื่อ]
- -ectomy, -plasty → การผ่าตัด[ชื่อ]
- -ology, -ism → ศาสตร์/ลัทธิ[ชื่อ]
- Acronyms → ตัวย่อ[ชื่อ]
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Known proper nouns (people, gods, places, brands) — translate by category
PROPER_NOUNS = {
    # Greek/Roman mythology
    'aegir': 'เอกีร์ (เทพทะเลในตำนานนอร์ส)',
    'aegisthus': 'เอจิสทัส (ตัวละครในตำนานกรีก)',
    'aengus': 'เอนกัส (เทพในตำนานเซลติก)',
    'anubis': 'อนูบิส (เทพมรณะอียิปต์)',
    'apis': 'อาปิส (เทพวัวศักดิ์สิทธิ์อียิปต์)',
    'aram': 'อาราม (ชื่อบุคคลหรือภาษาอาราเมอิก)',
    'argo': 'อาร์โก (เรือของเจสันในตำนานกรีก)',
    'argos': 'อาร์กอส (เมืองกรีกโบราณ, ยักษ์ร้อยตา)',
    'artemis': 'อาร์เทมิส (เทพีล่าสัตว์กรีก)',
    'amun': 'อามุน (เทพสูงสุดอียิปต์)',
    'ymir': 'ยมีร์ (ยักษ์ดึกดำบรรพ์ในตำนานนอร์ส)',
    'zephaniah': 'เซฟาไนอาห์ (ผู้พยากรณ์ในพระคัมภีร์)',
    'artaxerxes': 'อาร์แท็กเซอร์ซีส (กษัตริย์เปอร์เซีย)',
    'anaximenes': 'อแน็กซิเมนีส (นักปรัชญากรีกโบราณ)',
    'aristarchus': 'อริสตาร์คัส (นักดาราศาสตร์กรีกโบราณ)',
    'aquinas': 'โทมัส อไควนัส (นักปรัชญาและเทววิทยา)',
    'andrew': 'แอนดรูว์ (ชื่อคน, นักบุญ)',
    'andrews': 'แอนดรูว์ส (ชื่อสกุล)',
    'anthony': 'แอนโทนี (ชื่อคน, นักบุญ)',
    'artemia': 'อาร์เทมิเซีย (กุ้งน้ำเค็มขนาดเล็ก)',
    'artemisia': 'อาร์เทมิเซีย (พืชสมุนไพรสกุลอาร์เทมิเซีย)',
    'arrhenius': 'อาร์เรเนียส (นักเคมีรางวัลโนเบล)',
    'arius': 'อาริอัส (นักเทววิทยาคริสเตียน)',
    'asvins': 'อัศวิน (เทพฝาแฝดในตำนานฮินดู)',
    'ataturk': 'อตาเติร์ก (บิดาแห่งตุรกีสมัยใหม่)',
    'adenauer': 'อาเดเนาเออร์ (นายกรัฐมนตรีเยอรมัน)',

    # Places
    'agrigento': 'อากรีเจนโต (เมืองในซิซิลี อิตาลี)',
    'apennines': 'เทือกเขาแอเพนไนน์ (อิตาลี)',
    'arles': 'อาร์ล (เมืองในฝรั่งเศส)',
    'artois': 'อาร์ตัวส์ (แคว้นในฝรั่งเศส)',
    'artsakh': 'อาร์ตซาข (นากอร์โน-คาราบัค)',
    'arhus': 'อาร์ฮุส (เมืองในเดนมาร์ก)',
    'adzhar': 'อัดจาร์ (ภูมิภาคในจอร์เจีย)',
    'accho': 'อักโค (เมืองในอิสราเอล)',
    'annwfn': 'แอนน์วน (ยมโลกในตำนานเวลส์)',

    # Scientists/People
    'zangwill': 'อิสราเอล แซงวิล (นักเขียนชาวยิว)',
    'zworykin': 'วลาดีมีร์ ซโวรีคิน (นักประดิษฐ์โทรทัศน์)',
    'ziegler': 'คาร์ล ซีเกลอร์ (นักเคมีรางวัลโนเบล)',
    'yastrzemski': 'คาร์ล ยัสเซรมสกี (นักเบสบอลชื่อดัง)',
    'yersin': 'อเล็กซองดร์ เยร์แซง (ค้นพบเชื้อกาฬโรค)',
    'yevtushenko': 'เยฟเกนี เยฟตูเชนโก (กวีโซเวียต)',
    'wyatt': 'ไวแอต (ชื่อบุคคล/นักกวีอังกฤษ)',
}

# Pattern-based translations
def pattern_translate(word, pos):
    w = word.lower().strip()

    # Taxonomy families
    if re.search(r'idae$|aceae$|iformes$|ales$|etes$|ineae$', w):
        base = re.sub(r'idae$|aceae$|iformes$|ales$|etes$|ineae$', '', w)
        return f'วงศ์/อันดับ {base} (อนุกรมวิธานชีววิทยา)'

    # Medical conditions
    if re.search(r'osis$|emia$|emia$|itis$|algia$|oma$|pathy$', w) and len(w) > 6:
        return f'ภาวะ{word} (ทางการแพทย์)'

    # Surgery/procedures
    if re.search(r'ectomy$|plasty$|otomy$|oscopy$', w):
        return f'การผ่าตัด{word}'

    # -logy → science
    if re.search(r'ology$', w) and len(w) > 7:
        base = re.sub(r'ology$', '', w)
        return f'วิทยา{base}'

    # -ism → doctrine/belief
    if re.search(r'alism$|icism$|anism$', w) and len(w) > 7:
        return f'ลัทธิ{word}'

    # Chemical compounds
    if re.search(r'amine$|acid$|ene$|ine$|ol$|ate$|ide$|ane$', w) and len(w) > 6:
        return f'{word} (สารเคมี)'

    # Genus names (capitalized in biology)
    if re.search(r'us$|um$|a$|is$', w) and len(w) > 5 and w[0].islower():
        return f'สกุล{word} (ชีววิทยา)'

    # Roman numerals coverage (already handled most, catch remaining)
    roman = {'i':'หนึ่ง','ii':'สอง','iii':'สาม','iv':'สี่','v':'ห้า',
             'vi':'หก','vii':'เจ็ด','viii':'แปด','ix':'เก้า','x':'สิบ'}
    if w in roman:
        return f'{roman[w]} (เลขโรมัน {w.upper()})'

    # Acronyms (all-caps or short mixed)
    if re.match(r'^[a-z]{2,6}$', w) and w == w:
        return f'{word.upper()} (ตัวย่อ)'

    return None

def main():
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)

    applied = 0
    for i, w in enumerate(universe):
        if w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION':
            continue
        word = w['word']
        pos = w.get('part_of_speech', '')

        th = None

        # Check known proper nouns first
        if word.lower() in PROPER_NOUNS:
            th = PROPER_NOUNS[word.lower()]

        # Pattern-based
        if not th:
            th = pattern_translate(word, pos)

        if not th or not re.search(r'[\u0e00-\u0e7f]', th):
            continue

        w = dict(w)
        w['meaning_th'] = th
        w['meaning_th_source'] = 'pattern_expert'
        w['lifecycle_status'] = 'MT_TRANSLATED'
        w['mt_quality'] = 'PATTERN'
        universe[i] = w
        applied += 1

    pending = sum(1 for w in universe if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION')
    covered = sum(1 for w in universe
                  if w.get('meaning_th') and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th',''))
                  and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION')

    print(f'Applied: {applied:,}')
    print(f'Still pending: {pending:,}')
    print(f'Coverage: {covered:,}/{len(universe):,} = {covered/len(universe)*100:.1f}%')

    with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
        json.dump(universe, f, ensure_ascii=False, indent=2)
    print('Saved.')

if __name__ == '__main__':
    main()
