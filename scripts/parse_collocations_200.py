import fitz, os, sys, io, re, json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
target_dir = [d for d in os.listdir('.') if 'เนื้อหาที่ควรมีในเว็บ' in d][0]
doc = fitz.open(os.path.join(target_dir, 'Collocations หรือ คำที่มักต้องใช้คู่กันที่พบบ่อย.pdf'))
text = '\n'.join(p.get_text() for p in doc)
doc.close()

lines = [l.strip() for l in text.split('\n') if l.strip()]

# Mapping of corrupted characters to correct Thai
REPLACEMENTS = {
    'เรŽ่อง': 'เรื่อง',
    'มหาว‹ทยาลัย': 'มหาวิทยาลัย',
    'ชีว‹ต': 'ชีวิต',
    'เปน': 'เป็น',
    'เร’ยน': 'เรียน',
    'ป¢ด': 'ปิด',
    'เป¢ด': 'เปิด',
    'เครŽ่องใช้ไฟฟ£า': 'เครื่องใช้ไฟฟ้า',
    'ปœญหา': 'ปัญหา',
    'คํา': 'คำ',
    'จํากัด': 'จำกัด',
    'ทํา': 'ทำ',
    'สําเร็จ': 'สำเร็จ',
    'จําเปน': 'จำเป็น',
    'จํา': 'จำ',
    'กําลัง': 'กำลัง',
    'นํา': 'นำ',
    'สําหรับ': 'สำหรับ',
    'สําคัญ': 'สำคัญ',
    'ทํางาน': 'ทำงาน',
    'แนะนํา': 'แนะนำ',
    'ตัดสินใจเรŽ่อง': 'ตัดสินใจเรื่อง',
    'คําแนะนํา': 'คำแนะนำ',
    'ความพยายามทํา': 'ความพยายามทำ',
    'ขอโทษเรŽ่อง': 'ขอโทษเรื่อง',
    'ชื่อเสียงเรŽ่อง': 'ชื่อเสียงเรื่อง',
    'กังวลเรŽ่อง': 'กังวลเรื่อง',
    'สนใจเรŽ่อง': 'สนใจเรื่อง',
    'ตื่นเต้นเรŽ่อง': 'ตื่นเต้นเรื่อง',
    'บ่นเรŽ่อง': 'บ่นเรื่อง',
    'กังวลใจเรŽ่อง': 'กังวลใจเรื่อง',
    'คิดเรŽ่อง': 'คิดเรื่อง',
    'พูดเรŽ่อง': 'พูดเรื่อง',
    'คุยเรŽ่อง': 'คุยเรื่อง',
    'เขียนเรŽ่อง': 'เขียนเรื่อง',
    'เป£าหมาย': 'เป้าหมาย',
    'ความค‹ด': 'ความคิด',
    'เข‹ดขวาง': 'กีดขวาง',
    'ค‹ด': 'คิด',
    'ต‹ด': 'ติด',
    'ส‹่ง': 'สิ่ง',
    'ใหม‹': 'ใหม่',
    'ไม‹': 'ไม่',
    'ได‹': 'ได้',
    'ใก‹ล': 'ใกล้',
    'ช‹่วย': 'ช่วย',
    'ใช‹': 'ใช้',
    'ให‹': 'ให้',
    'ไปย‹ง': 'ไปยัง',
    'ขึ‹น': 'ขึ้น',
    'อยู‹': 'อยู่',
    'ผ‹าน': 'ผ่าน',
    'เพ‹่อ': 'เพื่อ',
    'เม‹่อ': 'เมื่อ',
}

def clean_thai(t):
    for k, v in REPLACEMENTS.items():
        t = t.replace(k, v)
    # clean remaining stray non-thai special marks
    t = re.sub(r'[\x00-\x1f\x7f-\x9f\uf700-\uf7ff]', '', t)
    return t.strip()

items = []
i = 0
while i < len(lines):
    line = lines[i]
    if line.isdigit():
        num = int(line)
        if 1 <= num <= 200:
            en = ""
            th = ""
            if i + 1 < len(lines) and not lines[i+1].isdigit() and lines[i+1] != 'Collocation':
                en = lines[i+1]
                if i + 2 < len(lines) and not lines[i+2].isdigit() and lines[i+2] != 'Collocation':
                    th = clean_thai(lines[i+2])
                    i += 2
                else:
                    i += 1
                items.append({'num': num, 'en': en, 'th': th})
    i += 1

# Filter duplicates by num
unique_items = {}
for it in items:
    if it['num'] not in unique_items and it['en'] != 'Preparation For the CEFR A1-A2 Level Test: SUT, 2026':
        unique_items[it['num']] = it

print(f"Total unique parsed: {len(unique_items)}")
with open('data/cleaned_collocations.json', 'w', encoding='utf-8') as f:
    json.dump(list(unique_items.values()), f, ensure_ascii=False, indent=2)

for n in range(1, 21):
    if n in unique_items:
        it = unique_items[n]
        print(f"{it['num']:3d}. {it['en']:<28} -> {it['th']}")
