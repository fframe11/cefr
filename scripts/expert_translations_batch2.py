#!/usr/bin/env python3
"""
expert_translations_batch2.py — แปล 1,662 คำที่เหลือ batch 2
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

T2 = {
# ── ACRONYMS / ABBREVIATIONS (batch 2) ─────────────────────────
    'wlan|noun':    'เครือข่ายไร้สาย (WLAN)',
    'wmd|noun':     'อาวุธทำลายล้างสูง (WMD)',
    'wmo|noun':     'องค์การอุตุนิยมวิทยาโลก (WMO)',
    'wnw|noun':     'ทิศตะวันตก-ตะวันตกเฉียงเหนือ',
    'wpm|noun':     'คำต่อนาที (WPM)',
    'wsw|noun':     'ทิศตะวันตก-ตะวันตกเฉียงใต้',
    'wtc|noun':     'ศูนย์การค้าโลก (World Trade Center)',
    'wto|noun':     'องค์การการค้าโลก (WTO)',
    'wtv|noun':     'โทรทัศน์ไร้สาย',
    'wv|noun':      'เวสต์เวอร์จิเนีย (รัฐในสหรัฐฯ)',
    'www|noun':     'เวิลด์ไวด์เว็บ (อินเทอร์เน็ต)',
    'wy|noun':      'ไวโอมิง (รัฐในสหรัฐฯ)',
    'xc|noun':      'เก้าสิบ (เลขโรมัน XC), ครอสคันทรี',
    'xe|noun':      'ซีนอน (ธาตุก๊าซเฉื่อย Xe)',
    'xi|noun':      'ไซ (อักษรกรีก ξ)',
    'xii|noun':     'สิบสอง (เลขโรมัน XII)',
    'xiii|noun':    'สิบสาม (เลขโรมัน XIII)',
    'xiv|noun':     'สิบสี่ (เลขโรมัน XIV)',
    'xix|noun':     'สิบเก้า (เลขโรมัน XIX)',
    'xt|noun':      'คริสต์ (Christ ย่อ)',
    'xtc|noun':     'ยาเอ็กซ์ตาซี (ยาเสพติด)',
    'xv|noun':      'สิบห้า (เลขโรมัน XV)',
    'xvi|noun':     'สิบหก (เลขโรมัน XVI)',
    'xx|noun':      'ยี่สิบ (เลขโรมัน XX)',
    'xxi|noun':     'ยี่สิบเอ็ด (เลขโรมัน XXI)',
    'xxii|noun':    'ยี่สิบสอง (เลขโรมัน XXII)',
    'xxiv|noun':    'ยี่สิบสี่ (เลขโรมัน XXIV)',
    'xxix|noun':    'ยี่สิบเก้า (เลขโรมัน XXIX)',
    'xxv|noun':     'ยี่สิบห้า (เลขโรมัน XXV)',
    'xxvi|noun':    'ยี่สิบหก (เลขโรมัน XXVI)',
    'xxy|noun':     'กลุ่มอาการ XXY (Klinefelter)',
    'xy|noun':      'โครโมโซม XY (เพศชาย)',
    'xyy|noun':     'กลุ่มอาการ XYY (โครโมโซม)',
    'yi|noun':      'ภาษายี (ชนกลุ่มน้อยจีน)',
    'ymir|noun':    'ยมีร์ (ยักษ์ในตำนานนอร์ส)',
    'yottabyte|noun': 'ยอตตะไบต์ (หน่วยข้อมูลขนาดใหญ่มาก)',
    'yottaflop|noun': 'ยอตตะฟลอป (ความเร็วคอมพิวเตอร์)',
    'yue|noun':     'ภาษากวางตุ้ง (ภาษาจีนกวางตุ้ง)',
    'yus|noun':     'ยัส (ตัวอักษรสลาฟเก่า)',
    'zed|noun':     'ซี (ตัวอักษร Z ในภาษาอังกฤษแบบอังกฤษ)',
    'zettaflop|noun': 'เซตตะฟลอป (หน่วยความเร็วประมวลผล)',
    'eq|noun':      'อีคิว (ระดับเชาวน์อารมณ์, ตัวปรับเสียง)',
    'geb|noun':     'เกบ (เทพดินในอียิปต์โบราณ)',
    'bmdo|noun':    'องค์กรป้องกันขีปนาวุธ',
    'dod|noun':     'กระทรวงกลาโหมสหรัฐฯ (DoD)',
    'mals|noun':    'โรคดูดซึมผิดปกติ',
    'ochs|noun':    'อ็อคส์ (นักดนตรีโฟล์ก)',
    'rhd|noun':     'โรคหัวใจจากไขข้ออักเสบ',
    'teth|noun':    'เทต (อักษรฮีบรู ט)',
    'zbit|noun':    'เซบิต (หน่วยข้อมูล)',

# ── PROPER NOUNS: PEOPLE / BRANDS ────────────────────────────────
    'wyat|noun':    'ไวแอต (ชื่อคน)',
    'wyatt|noun':   'ไวแอต (ชื่อคนหรือสถานที่)',
    'xanax|noun':   'แซแน็กซ์ (ยาคลายกังวล)',
    'xi\'an|noun':  'ซีอาน (เมืองในจีน)',
    'xian|noun':    'ซีอาน (เมืองในจีน)',
    'xyris|noun':   'ไซริส (พืชน้ำสกุล Xyris)',
    'yastrzemski|noun': 'ยัสเซรมสกี (นักเบสบอล)',
    'yersin|noun':  'เยร์แซง (นักวิทยาศาสตร์ค้นพบเชื้อกาฬโรค)',
    'yevtushenko|noun': 'เยฟตูเชนโก (กวีรัสเซีย)',
    'yukon|noun':   'ยูคอน (ดินแดนในแคนาดา)',
    'yuman|noun':   'ภาษายูมัน (ตระกูลภาษาอเมริกันพื้นเมือง)',
    'wurlitzer|noun': 'เวิร์ลิตเซอร์ (เปียโนไฟฟ้าชื่อดัง)',
    'wurzburg|noun': 'เวิร์ซบูร์ก (เมืองในเยอรมนี)',
    'zangwill|noun': 'แซงวิล (นักเขียนชาวยิว)',
    'zantac|noun':  'แซนแทก (ยาลดกรดในกระเพาะ)',
    'zend-avesta|noun': 'เซนด์-อเวสตา (คัมภีร์โซโรแอสเตอร์)',
    'zephaniah|noun': 'เซฟาไนอาห์ (หนังสือพระคัมภีร์)',
    'zestril|noun': 'เซสทริล (ยาลดความดัน)',
    'ziegler|noun': 'ซีเกลอร์ (นักเคมีรางวัลโนเบล)',
    'zinger|noun':  'คำพูดคมคาย, ประโยคเด็ด',
    'zirbanit|noun': 'ซีร์บานิต (เทพในตำนานบาบิโลน)',
    'zocor|noun':   'โซคอร์ (ยาลดไขมันในเลือด)',
    'zoril|noun':   'โซริล (สัตว์คล้ายสกั๊งค์ในแอฟริกา)',
    'zumbooruck|noun': 'ซัมบูรัก (ปืนใหญ่บนหลังอูฐ)',
    'zworykin|noun': 'ซโวรีคิน (นักประดิษฐ์โทรทัศน์)',
    'zygnemales|noun': 'สาหร่ายสีเขียวสกุลไซกนีมา',
    'zygomycetes|noun': 'เชื้อราไซโกไมซีส',
    'zaglossus|noun': 'ตุ่นปากเป็ดหนามขนาดใหญ่',
    'yucatec|noun': 'ภาษายูกาเทก (ภาษามายัน)',
    'yucateco|noun': 'ภาษายูกาเทก (ภาษามายัน)',

# ── VERBS ──────────────────────────────────────────────────────
    'aby|verb':         'ไถ่โทษ, ชดเชย',
    'advect|verb':      'พาพาหะ (การเคลื่อนที่ของมวลอากาศ)',
    'aggrade|verb':     'ทับถม, สะสมตะกอน',
    'alkalinise|verb':  'ทำให้เป็นด่าง',
    'anatomise|verb':   'ผ่าชำแหละ, วิเคราะห์ละเอียด',
    'arborize|verb':    'แตกแขนงเหมือนต้นไม้',
    'archaize|verb':    'ทำให้มีรูปแบบโบราณ',
    'babbitt|verb':     'บุด้วยโลหะแบบบิต',
    'bechance|verb':    'เกิดขึ้นโดยบังเอิญ',
    'bedaze|verb':      'ทำให้งงงวย, ทำให้มึนงง',
    'bejewel|verb':     'ประดับด้วยอัญมณี',
    'bemuse|verb':      'ทำให้งุนงง, ทำให้สับสน',
    'besmear|verb':     'ทาหรือเปื้อนด้วยสิ่งสกปรก',
    'besot|verb':       'ทำให้หลงใหลจนมืดบอด',
    'besprinkle|verb':  'โรยปกคลุม, พรมน้ำ',
    'bruit|verb':       'เผยแพร่ข่าว, บอกต่อ',
    'burl|verb':        'เอาปุ่มออกจากผ้า',
    'ca-ca|verb':       'อุจจาระ (ภาษาเด็ก)',
    'caracole|verb':    'ขี่ม้าเดินวงกลมครึ่ง',
    'carburize|verb':   'เพิ่มคาร์บอนให้เหล็ก',
    'cark|verb':        'วิตกกังวล, ทำให้เป็นห่วง',
    'checkrow|verb':    'ปลูกพืชเป็นแถวตรง',
    'coconspire|verb':  'สมคบคิดร่วมกัน',
    'coldcock|verb':    'ต่อยจนหมดสติ',
    'conglobe|verb':    'รวมกันเป็นก้อนกลม',
    'dj|verb':          'เป็นดีเจ, เปิดเพลง',
    'enrol|verb':       'ลงทะเบียน, สมัครเข้าร่วม',
    'exhume|verb':      'ขุดศพขึ้นมา',
    'foredoom|verb':    'กำหนดโชคชะตาล่วงหน้า',
    'forfend|verb':     'ป้องกัน, พิทักษ์รักษา',
    'fundraise|verb':   'ระดมทุน, หาเงิน',
    'gi|verb':          'ทำความสะอาดให้ดูแลอย่างดี',
    'hulk|verb':        'เดินหรือยืนอย่างใหญ่โต',
    'immingle|verb':    'ผสมเข้าด้วยกัน',
    'immix|verb':       'ผสม, รวมเข้าด้วยกัน',
    'introject|verb':   'นำคุณลักษณะภายนอกเข้าในตัว',
    'librate|verb':     'แกว่งไปมา, ชั่งน้ำหนัก',
    'netmail|verb':     'ส่งอีเมล',
    'outshout|verb':    'ตะโกนดังกว่า',
    'overgorge|verb':   'กินมากเกินไป, อิ่มจนล้น',
    'philosophize|verb':'ปรัชญา, ครุ่นคิดเชิงปรัชญา',
    'rase|verb':        'ขูด, ลบออก (คำโบราณ)',
    'readapt|verb':     'ปรับตัวใหม่, ดัดแปลงอีกครั้ง',
    'remilitarise|verb':'สร้างกองทัพขึ้นใหม่',
    'sovietize|verb':   'เปลี่ยนเป็นระบบโซเวียต',
    'spondaise|verb':   'เขียนเป็นจังหวะสปอนดี',
    'spoof|verb':       'ล้อเลียน, แกล้งทำเป็น',
    'sudate|verb':      'เหงื่อออก, ขับเหงื่อ',
    'troat|verb':       'ร้อง (เสียงกวาง)',
    'velcro|verb':      'ติดด้วยเวลโคร',
    'wawl|verb':        'ร้องไห้คร่ำครวญ',
    'windsurf|verb':    'เล่นวินด์เซิร์ฟ',

# ── COMPOUND ADJECTIVES ──────────────────────────────────────────
    'acid-loving|adjective':    'ที่ชอบสภาพกรด (ดินกรด)',
    'almond-scented|adjective': 'ที่มีกลิ่นอัลมอนด์',
    'avant-garde|adjective':    'ล้ำสมัย, แนวหน้า',
    'bluish-gray|adjective':    'สีน้ำเงินอมเทา',
    'bluish-grey|adjective':    'สีน้ำเงินอมเทา',
    'brown-gray|adjective':     'สีน้ำตาลอมเทา',
    'dust-covered|adjective':   'ปกคลุมด้วยฝุ่น',
    'fawn-colored|adjective':   'สีน้ำตาลอ่อน (สีกวาง)',
    'five-petalled|adjective':  'ที่มีห้ากลีบดอก',
    'garnet-coloured|adjective':'สีแดงทับทิม',
    'gray-white|adjective':     'สีเทาอมขาว',
    'greyish-white|adjective':  'สีเทาอมขาว',
    'mint-scented|adjective':   'ที่มีกลิ่นมิ้นต์',
    'n-th|adjective':           'ลำดับที่ n, มากที่สุด',
    'open-hearth|adjective':    'เตาเผาแบบเปิด (ถลุงเหล็ก)',
    'pearly-white|adjective':   'สีขาวมุก',
    'three-d|adjective':        'สามมิติ (3D)',
    'twenty-fifth|adjective':   'ที่ยี่สิบห้า',
    'umbel-like|adjective':     'คล้ายช่อดอกแบบซี่ร่ม',
    'prickly-leaved|adjective': 'ที่มีใบมีหนาม',
    'macrencephalic|adjective': 'ที่มีสมองใหญ่ผิดปกติ',

# ── ADVERBS ──────────────────────────────────────────────────────
    'breast-high|adverb':   'สูงระดับอก',
    'vis-a-vis|adverb':     'เมื่อเปรียบเทียบกับ, ตรงข้าม',

# ── MISC NOUNS ───────────────────────────────────────────────────
    'wurlitzer|noun':   'เวิร์ลิตเซอร์ (เครื่องดนตรีไฟฟ้า)',
    'xanax|noun':       'แซแน็กซ์ (ยาคลายกังวล)',
    'xanthophyl|noun':  'แซนโทฟิล (สีเหลืองในพืช)',
    'xanthophyll|noun': 'แซนโทฟิลล์ (รงควัตถุสีเหลืองในพืช)',
    'xanthopsia|noun':  'การมองเห็นเป็นสีเหลืองผิดปกติ',
    'zocor|noun':       'โซคอร์ (ยาลดไขมันซิมวาสแตติน)',
    'zantac|noun':      'แซนแทก (ยาลดกรดราไนทิดีน)',
    'zestril|noun':     'เซสทริล (ยาความดันลิซิโนพริล)',
    'spoof|noun':       'การล้อเลียน, การแกล้งทำเป็น',
    'avant-garde|noun': 'แนวหน้า, กลุ่มล้ำสมัย',
    'vis-a-vis|noun':   'คู่เปรียบเทียบ, ผู้อยู่ตรงข้าม',
    'zinger|noun':      'คำพูดคมคาย, ประโยคเด็ด',

# ── NUMBER ORDINALS ───────────────────────────────────────────────
    'twenty-fifth|noun':    'ยี่สิบห้า, ที่ยี่สิบห้า',
    'one-sixteenth|noun':   'หนึ่งในสิบหก',
    'quarter-century|noun': 'ยี่สิบห้าปี, หนึ่งในสี่ศตวรรษ',
    'mid-twenties|noun':    'ช่วงอายุกลางๆ ยี่สิบ (24-26 ปี)',
}

def main():
    print(f'Batch 2 translations: {len(T2):,}')
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)

    applied = 0
    for i, w in enumerate(universe):
        if w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION':
            continue
        key = w['word'] + '|' + w.get('part_of_speech', '')
        if key not in T2:
            continue
        th = T2[key]
        if not th or not re.search(r'[\u0e00-\u0e7f]', th):
            continue
        w = dict(w)
        w['meaning_th'] = th
        w['meaning_th_source'] = 'expert_manual'
        w['lifecycle_status'] = 'MT_TRANSLATED'
        w['mt_quality'] = 'EXPERT'
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
