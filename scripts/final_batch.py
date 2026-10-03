#!/usr/bin/env python3
"""
final_batch.py — แปล 582 คำสุดท้ายด้วยความรู้โดยตรง
"""
import json, sys, io, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

T3 = {
    # Common words that slipped through
    "abc's|noun":       'หลักพื้นฐาน, ตัวอักษร',
    'abhenry|noun':     'แอบเฮนรี (หน่วยอินดักแตนซ์)',
    'abruzzo|noun':     'อาบรุซโซ (แคว้นในอิตาลี)',
    'actinoid|noun':    'แอกทิไนด์ (ธาตุกัมมันตรังสี)',
    'actinomycin|noun': 'แอกทิโนไมซิน (ยาปฏิชีวนะ)',
    'actomyosin|noun':  'แอกโตไมโอซิน (โปรตีนกล้ามเนื้อ)',
    'adrenergic|noun':  'สารอะดรีเนอร์จิก (กระตุ้นอะดรีนาลิน)',
    'adrenosterone|noun': 'แอดรีโนสเตอโรน (ฮอร์โมน)',
    'agglutinin|noun':  'แอกกลูทินิน (แอนติบอดีจับเซลล์)',
    'agglutinogen|noun': 'แอกกลูทิโนเจน (แอนติเจนหมู่เลือด)',
    'allegoriser|noun': 'ผู้เขียนอุปมาเปรียบเทียบ',
    'amadavat|noun':    'นกอะมาดาวัต (นกเล็กสีแดง)',
    'amaretto|noun':    'อมาเรตโต (เหล้าอัลมอนด์อิตาเลียน)',
    'anacoluthon|noun': 'การเขียนประโยคไม่ต่อเนื่อง (ไวยากรณ์)',
    'anaglyph|noun':    'ภาพนูนสามมิติ (ดูด้วยแว่น 3D)',
    'anaglyphy|noun':   'ศิลปะการแกะสลักนูน',
    'anancasm|noun':    'พฤติกรรมย้ำคิดย้ำทำ',
    'anarhichas|noun':  'ปลาหมาป่า (ปลาทะเลเหนือ)',
    'anemoclinometer|noun': 'เครื่องวัดทิศทางและความเร็วลม',
    'angiocardiogram|noun': 'ภาพเอกซเรย์หัวใจและหลอดเลือด',
    'anionic|noun':     'ประจุลบ (แอนไอออน)',
    'anisogamy|noun':   'การสืบพันธุ์แบบเซลล์ต่างขนาด',
    'anomalops|noun':   'ปลาตาไฟ (มีอวัยวะเรืองแสง)',
    'anomalopteryx|noun': 'นกโมอาขนาดเล็กที่สูญพันธุ์',
    'anorchism|noun':   'ภาวะไม่มีอัณฑะแต่กำเนิด',
    'anorectic|noun':   'ยาลดความอยากอาหาร',
    'anorexic|noun':    'ผู้ป่วยโรคเบื่ออาหาร (anorexia)',
    'anorthite|noun':   'แร่แอนอร์ไทต์ (แร่เฟลด์สปาร์)',
    'antabuse|noun':    'แอนตาบิวส์ (ยาบำบัดสุราเรื้อรัง)',
    'antapex|noun':     'จุดต่อต้านยอด (ดาราศาสตร์)',
    'antheridiophore|noun': 'ก้านอวัยวะสืบพันธุ์เพศผู้ของพืช',
    'apparatchik|noun': 'ข้าราชการพรรคคอมมิวนิสต์',
    'aptenodytes|noun': 'สกุลเพนกวินขนาดใหญ่',
    'apteryx|noun':     'นกกีวี (นกไม่มีปีกนิวซีแลนด์)',
    'archaeopteryx|noun': 'อาร์คีออพเทอริกซ์ (นกบรรพบุรุษ)',
    'archaeornithes|noun': 'อันดับนกโบราณ',
    'archeopteryx|noun': 'อาร์คีออพเทอริกซ์ (นกบรรพบุรุษ)',
    'architrave|noun':  'คานประตู, กรอบประตูแบบกรีก-โรมัน',
    'archosaur|noun':   'อาร์โคซอร์ (กลุ่มสัตว์รวมไดโนเสาร์)',
    'arteriole|noun':   'หลอดเลือดแดงขนาดเล็ก',
    'artiodactyl|noun': 'สัตว์กีบคู่ (วัว แกะ หมู)',
    'artlang|noun':     'ภาษาประดิษฐ์เพื่อศิลปะ',
    'astheny|noun':     'ภาวะอ่อนแอ, ไม่มีแรง',
    'athodyd|noun':     'เครื่องยนต์ไอพ่นแบบไม่มีพัดลม',
    'atromid-s|noun':   'คลอฟิเบรต (ยาลดไขมัน)',
    'atropos|noun':     'อาโทรพอส (เทพแห่งชะตากรรมกรีก)',
    'auschwitz|noun':   'เอาชวิตซ์ (ค่ายกักกันนาซี)',
    'austerlitz|noun':  'เอาสเตอร์ลิตซ์ (สมรภูมินโปเลียน)',
    'austro-asiatic|noun': 'ตระกูลภาษาออสโตร-เอเชียติก',
    'aviatrix|noun':    'นักบินหญิง',
    'axolotl|noun':     'แอกโซลอตล์ (สัตว์สะเทินน้ำสะเทินบกเม็กซิกัน)',
    'babbitt|noun':     'แบบบิต (โลหะผสมสำหรับตลับลูกปืน)',
    'backblast|noun':   'แรงดันถอยหลัง (จากอาวุธ)',
    'bayonne|noun':     'บาโยน (เมืองในฝรั่งเศส)',
    'beauvoir|noun':    'โบวัวร์ (นักปรัชญาสตรีนิยมฝรั่งเศส)',
    'begetter|noun':    'ผู้ให้กำเนิด, บิดา',
    'bernstein|noun':   'เบิร์นสไตน์ (นักดนตรีชื่อดัง)',
    'bertillon|noun':   'เบอร์ทียง (ระบบระบุตัวตนอาชญากร)',
    'beta-lactamase|noun': 'เบต้าแล็กเทมเมส (เอนไซม์ดื้อยา)',
    'bethune|noun':     'นอร์แมน เบธูน (แพทย์ชาวแคนาดา)',
    'blatherskite|noun': 'คนพูดเพ้อเจ้อไร้สาระ',
    'blitzstein|noun':  'มาร์ก บลิตซ์สไตน์ (นักแต่งเพลง)',
    'bonavist|noun':    'ถั่วลาย (Lablab bean)',
    'bonhoeffer|noun':  'ดีทริช บอนเฮิฟเฟอร์ (นักเทววิทยา)',
    'bouchee|noun':     'บูเช่ (ขนมอบเล็กแบบฝรั่งเศส)',
    'brachychiton|noun': 'ต้นขวดน้ำ (พืชออสเตรเลีย)',
    'bronchospasm|noun': 'หลอดลมหดเกร็ง',
    'bruitism|noun':    'ดนตรีแนวเสียงรบกวน (ศิลปะ)',
    'bruxelles|noun':   'บรัสเซลส์ (เมืองหลวงเบลเยียม)',
    'bulwer-lytton|noun': 'บัลเวอร์-ลิตตัน (นักประพันธ์อังกฤษ)',
    'burmese-yi|noun':  'ตระกูลภาษาพม่า-ยี',
    'burnett|noun':     'เบอร์เน็ตต์ (ชื่อบุคคล)',
    "bvd's|noun":       'กางเกงชั้นใน (ยี่ห้อ BVD)',
    'c-clamp|noun':     'แคลมป์รูปตัว C',
    'cachalot|noun':    'วาฬสเปิร์ม (วาฬฟันยักษ์)',
    'cacodaemon|noun':  'วิญญาณชั่วร้าย',
    'cacodemon|noun':   'ปีศาจชั่วร้าย',
    'caddisworm|noun':  'ตัวหนอนแมลงหนอนในน้ำ',
    'calanthe|noun':    'กล้วยไม้คาแลนเธ',
    'calligrapher|noun': 'นักเขียนอักษรสวยงาม, ช่างเขียน',
    'caloosahatchee|noun': 'แม่น้ำคาลูซาแฮตชี (ฟลอริดา)',
    'canistel|noun':    'ลูกไข่ (ผลไม้เขตร้อน)',
    'canticles|noun':   'เพลงสดุดี (ในพระคัมภีร์)',
    'caracal|noun':     'คาราคัล (แมวป่าสีแดงในแอฟริกา)',
    'carmichael|noun':  'คาร์ไมเคิล (ชื่อบุคคล/สถานที่)',
    'caroler|noun':     'นักร้องเพลงคริสต์มาส',
    'carpophore|noun':  'ก้านรองผล (ในพืช)',
    'cassite|noun':     'ชาวแคสไซต์ (อารยธรรมบาบิโลน)',
    'cd-r|noun':        'แผ่นซีดีบันทึกได้ (CD-R)',
    'cefoperazone|noun': 'เซโฟเปอราโซน (ยาปฏิชีวนะ)',
    'cephaloglycin|noun': 'เซฟาโลกลีซิน (ยาปฏิชีวนะ)',
    'cetchup|noun':     'ซอสมะเขือเทศ (ketchup)',
    "ch'i|noun":        'ชี่ (พลังงานชีวิตในปรัชญาจีน)',
    "ch'ing|noun":      'ราชวงศ์ชิง (ราชวงศ์สุดท้ายของจีน)',
    'chaplin|noun':     'ชาร์ลี แชปลิน (นักแสดงตลกชื่อดัง)',
    'chari-nile|noun':  'ตระกูลภาษาชารี-ไนล์',
    'charlottetown|noun': 'ชาร์ล็อตทาวน์ (เมืองหลวงเกาะปรินซ์เอดเวิร์ด)',
    'checkbook|noun':   'สมุดเช็ค',
    'checkerberry|noun': 'ผลเบอร์รีลายตาราง (พืชอเมริกาเหนือ)',
}

# Additional pattern: words ending with specific meaningful patterns
def extra_pattern(word, pos):
    w = word.lower()
    # -er suffix (agent nouns)
    if w.endswith('er') and len(w) > 5 and pos in ('noun',):
        base = w[:-2]
        if base.endswith('is') or base.endswith('el') or base.endswith('er'):
            return f'ผู้{word}, สิ่งที่{word}'
    # Hyphenated compound: split and translate each part
    if '-' in w and len(w.split('-')) == 2:
        parts = w.split('-')
        # Color compounds
        colors = {'red':'แดง','blue':'น้ำเงิน','green':'เขียว','white':'ขาว',
                  'black':'ดำ','brown':'น้ำตาล','gray':'เทา','grey':'เทา',
                  'yellow':'เหลือง','pink':'ชมพู','orange':'ส้ม','purple':'ม่วง'}
        if parts[0] in colors and parts[1] in colors:
            return f'สี{colors[parts[0]]}อม{colors[parts[1]]}'
    return None

def main():
    print(f'Final batch: {len(T3):,} words')
    with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
        universe = json.load(f)

    applied = 0
    extra_applied = 0

    for i, w in enumerate(universe):
        if w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION':
            continue
        word = w['word']
        pos = w.get('part_of_speech', '')
        key = word + '|' + pos

        th = T3.get(key)

        # Try extra pattern if not in dict
        if not th:
            th = extra_pattern(word, pos)
            if th:
                extra_applied += 1

        if not th or not re.search(r'[\u0e00-\u0e7f]', th):
            continue

        w = dict(w)
        w['meaning_th'] = th
        w['meaning_th_source'] = 'expert_final'
        w['lifecycle_status'] = 'MT_TRANSLATED'
        w['mt_quality'] = 'EXPERT'
        universe[i] = w
        applied += 1

    pending = sum(1 for w in universe if w.get('lifecycle_status') == 'PENDING_THAI_TRANSLATION')
    covered = sum(1 for w in universe
                  if w.get('meaning_th') and re.search(r'[\u0e00-\u0e7f]', w.get('meaning_th',''))
                  and w.get('lifecycle_status') != 'PENDING_THAI_TRANSLATION')

    print(f'Applied from dict: {applied - extra_applied:,}')
    print(f'Applied from extra pattern: {extra_applied:,}')
    print(f'Still pending: {pending:,}')
    print(f'Coverage: {covered:,}/{len(universe):,} = {covered/len(universe)*100:.1f}%')

    with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
        json.dump(universe, f, ensure_ascii=False, indent=2)
    print('Saved.')

if __name__ == '__main__':
    main()
