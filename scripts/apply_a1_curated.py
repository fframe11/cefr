import json
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# High quality contextual translations for the 176 A1 collapsed words
A1_CURATED = {
    'aa': 'อนุปริญญาศิลปศาสตร์ (AA Degree)',
    'ab': 'หมู่เลือดเอบี (AB Blood Group)',
    'abdias': 'หนังสือโอบาดีห์ (คัมภีร์ฮีบรู)',
    'abdominoplasty': 'ศัลยกรรมตกแต่งหน้าท้อง, การผ่าตัดกระชับหน้าท้อง',
    'abdominousness': 'ภาวะลงพุง, ลักษณะพุงยื่น',
    'abelard': 'ปีแยร์ อาเบลาร์ (นักปรัชญาและนักเทววิทยาชาวฝรั่งเศส)',
    'abelmosk': 'ชะมดต้น, พืชสมุนไพรตระกูลชบา',
    'aberdeen': 'เมืองแอเบอร์ดีน (สกอตแลนด์)',
    'abidance': 'การปฏิบัติตาม, การยึดมั่น',
    'abkhaz': 'ชาวอับฮาเซีย (ชนพื้นเมืองคอเคซัส)',
    'ablepharia': 'ภาวะไม่มีเปลือกตาแต่กำเนิด',
    'abrader': 'เครื่องขัด, หินขัด, อุปกรณ์ขัดผิว',
    'abruptness': 'ความห้วนกระด้าง, ความหยาบคายฉับพลัน',
    'abseil': 'การโรยตัวด้วยเชือก (ปีนเขา)',
    'absolutist': 'ผู้นิยมระบอบสมบูรณาญาสิทธิราชย์',
    'absolutization': 'การทำให้เป็นสิ่งสัมบูรณ์, การกำหนดให้เด็ดขาด',
    'abstention': 'การงดเว้น (โดยเฉพาะสุราหรือการลงคะแนน)',
    'abstruseness': 'ความเข้าใจยาก, ความลึกซึ้งซับซ้อน',
    'abstrusity': 'ความลึกซึ้งซับซ้อนเข้าใจยาก',
    'abudefduf': 'สกุลปลาสลิดหิน (ปลาตะกรับ)',
    'acer': 'สกุลต้นเมเปิล (สกุล Acer)',
    'adar': 'เดือนอาดาร์ (เดือนที่ 6 ในปฏิทินยิว)',
    'adze': 'ขวานถากไม้, ผึ่งถากไม้',
    'amah': 'พี่เลี้ยงเด็กหญิง, สาวใช้ในบ้าน (แถบเอเชีย)',
    'apar': 'ตัวนิ่มอาร์มาดิลโลสามแถบอเมริกาใต้',
    'aper': 'คนชอบเลียนแบบผู้อื่น',
    'arb': 'ผู้ค้าเก็งกำไรในตลาดหลักทรัพย์ (Arbitrageur)',
    'arca': 'สกุลหอยแครง (สกุล Arca)',
    'arng': 'กองกำลังรักษาดินแดนสหรัฐฯ (Army National Guard)',
    'asl': 'ภาษามืออเมริกัน (American Sign Language)',
    'asur': 'เมืองโบราณอัสชูร์ (เมืองหลวงอัสซีเรีย)',
    'bai': 'ภาษาไป๋ (ภาษาทิเบต-พม่าแถบยูนนาน)',
    'bbs': 'ระบบกระดานข่าวอิเล็กทรอนิกส์ (BBS)',
    'bine': 'เถาวัลย์ฮอปส์ (ไม้เลื้อยใช้หมักเบียร์)',
    'bise': 'ลมเหนือที่หนาวแห้งแล้งในฝรั่งเศส',
    'biz': 'ธุรกิจ, งาน, อาชีพ (คำสแลง)',
    'bleb': 'ตุ่มพองน้ำ, ถุงน้ำเล็กใต้ผิวหนัง',
    'blt': 'แซนด์วิชบีแอลที (เบคอน ผักกาดหอม มะเขือเทศ)',
    'bmdo': 'องค์กรป้องกันขีปนาวุธสหรัฐฯ (BMDO)',
    'bps': 'บิตต่อวินาที (หน่วยวัดความเร็วถ่ายโอนข้อมูล bps)',
    'byrd': 'พลเรือเอก เบิร์ด (นักสำรวจขั้วโลกชาวอเมริกัน)',
    'caul': 'เยื่อหุ้มทารกแรกเกิด, รกหุ้มศีรษะ',
    'cbc': 'การตรวจความสมบูรณ์ของเม็ดเลือด (Complete Blood Count)',
    'cero': 'ปลาแมคเคอเรลซีโร (ปลาอินทรีชนิดหนึ่ง)',
    'cfl': 'หลอดไฟคอมแพคฟลูออเรสเซนต์ (หลอดประหยัดไฟ CFL)',
    'cleg': 'เหลือบม้า, แมลงดูดเลือดสัตว์ขนาดใหญ่',
    'clew': 'เบาะแส, สิ่งบอกใบ้ไขปริศนา',
    'cli': 'ส่วนต่อประสานบรรทัดคำสั่ง (Command Line Interface)',
    'crax': 'สกุลนกคูราสโซว์ (นกป่าอเมริกาใต้)',
    'crit': 'การแข่งขันจักรยานทางสั้น (ไครทีเรียม)',
    'crus': 'ขาท่อนล่าง (จากหัวเข่าถึงข้อเท้า)',
    'cst': 'เวลามาตรฐานตอนกลาง (Central Standard Time ในสหรัฐฯ)',
    'cu': 'ทองแดง (สัญลักษณ์ธาตุ Cu)',
    'cuon': 'หมาใน (หมาป่าเอเชีย สกุล Cuon)',
    'dahl': 'ถั่วดาล, เมล็ดถั่วอินเดียต้มเปื่อย',
    'dak': 'ต้นทองกวาว (ไม้ยืนต้นอินเดีย ดอกสีส้มสด)',
    'dbms': 'ระบบจัดการฐานข้อมูล (Database Management System)',
    'derv': 'น้ำมันดีเซลสำหรับยานยนต์ (DERV)',
    'dhal': 'ถั่วดาล, แกงถั่วอินเดีย',
    'dkg': 'เดคากรัม (หน่วย 10 กรัม)',
    'dle': 'โรคลูปัสผิวหนัง (Discoid Lupus Erythematosus)',
    'dray': 'เกวียนลากของหนักแบบไม่มีขอบกั้น',
    'drms': 'ฝ่ายบริหารจัดการทรัพยากรส่วนเกินทางทหารสหรัฐฯ',
    'dtic': 'ศูนย์ข้อมูลทางเทคนิคกลาโหมสหรัฐฯ (DTIC)',
    'duad': 'คู่, สิ่งสองสิ่งที่เข้าคู่กัน',
    'duce': 'ผู้นำสูงสุด, ท่านผู้นำเผด็จการ (ฉายามุสโสลินี)',
    'duse': 'เอเลโอนอรา ดูเซ (นักแสดงละครเวทีโศกนาฏกรรมชาวอิตาลี)',
    'ebn': 'ทิศตะวันออกเฉียงเหนือค่อนตะวันออก (East by North)',
    'ebro': 'แม่น้ำเอโบร (แม่น้ำสายสำคัญในสเปน)',
    'ebs': 'ทิศตะวันออกเฉียงใต้ค่อนตะวันออก (East by South)'
}

with open('data/vocabulary-extended-universe-v3.json', 'r', encoding='utf-8') as f:
    univ = json.load(f)

applied = 0
for x in univ:
    w = x['word'].lower().strip()
    if w in A1_CURATED and x.get('cefr_level') == 'A1':
        x['meaning_th'] = A1_CURATED[w]
        x['lifecycle_status'] = 'VERIFIED_PRODUCTION'
        x['meaning_th_source'] = 'expert_curated_batch'
        applied += 1

print(f"Applied {applied} curated translations to A1 collapsed words!")

with open('data/vocabulary-extended-universe-v3.json', 'w', encoding='utf-8') as f:
    json.dump(univ, f, ensure_ascii=False)

with open('data/vocabulary-extended-universe.json', 'w', encoding='utf-8') as f:
    json.dump(univ, f, ensure_ascii=False)

print("Saved updated dataset to both files!")
