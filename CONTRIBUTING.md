# 🛠️ คู่มือการทำงานสำหรับทีมพัฒนา (Developer Workflow & Contributing Guide)

> **ข้อกำหนดสำคัญสูงสุด (Non-Negotiable Rule):**  
> **ห้าม Developer ทุกคน Push โค้ดเข้าสู่ Branch `master` หรือ `main` โดยตรงโดยเด็ดขาด**  
> ทุกการส่งมอบโค้ดจะต้องทำผ่าน **Pull Request (PR)** และต้องผ่านการตรวจอัตโนมัติ (Automated CI Verification) ให้เป็นสีเขียวก่อนจึงจะขอรีวิวและ Merge งานได้

---

## 📌 ขั้นตอนการรับงานและส่งมอบโค้ด (Step-by-Step Workflow)

### ขั้นตอนที่ 1: รับ Task จาก Notion
1. เข้าไปที่หน้ารวมศูนย์: [CEFR Platform — Sprint Backlog & Technical Task Handoff](https://app.notion.com/p/407198f6c7e1817d9b6ef839684e2bf9)
2. เลือกงานที่ได้รับมอบหมาย เช่น `TASK-01` ถึง `TASK-05`
3. ศึกษารายละเอียด Technical Specs, API Contract, และ Acceptance Criteria อย่างละเอียด

---

### ขั้นตอนที่ 2: สร้าง Feature Branch จาก Master ล่าสุด
อัปเดตโค้ดในเครื่องให้เป็นเวอร์ชันล่าสุดก่อนเริ่มงานเสมอ:
```bash
# สลับมาที่ master และดึงโค้ดล่าสุด
git checkout master
git pull origin master

# สร้าง Feature Branch ใหม่ตามรหัส Task
# ตัวอย่าง: feat/TASK-01-speaking-engine หรือ feat/TASK-02-writing-rubric
git checkout -b feat/TASK-XX-short-description
```

---

### ขั้นตอนที่ 3: พัฒนาและทดสอบในเครื่อง (Local Verification)
ก่อนส่งงาน นักพัฒนาต้องรันคำสั่งตรวจสอบ 2 คำสั่งนี้ในเครื่องของตนเองและต้องผ่าน 100%:

```bash
# 1. รันชุดทดสอบความถูกต้องและการถดถอยของระบบ (126 tests)
npm run test:ci

# 2. ตรวจสอบการบิลด์ระดับ Production
npm run build
```

---

### ขั้นตอนที่ 4: Commit และ Push เข้าสู่ Feature Branch
Commit โค้ดโดยใช้รูปแบบ Conventional Commits:
```bash
git add .
git commit -m "feat(speaking): implement audio evaluation endpoint and waveform recorder"

# Push งานขึ้นสู่ Branch ของตนเอง (ห้าม push เข้า master)
git push -u origin feat/TASK-XX-short-description
```

---

### ขั้นตอนที่ 5: เปิด Pull Request (PR) เข้าสู่ `master`
1. เข้าไปที่ GitHub Repository ของโปรเจกต์
2. กดปุ่ม **"Compare & pull request"**
3. ตรวจสอบว่า Base Branch ชี้ไปที่ **`master`** และ Compare Branch เป็น Branch ของตนเอง
4. กรอกข้อมูลตาม **Pull Request Template** ที่ระบบแสดงขึ้นมาให้ครบถ้วน:
   - แนบลิงก์ Notion Task ที่เกี่ยวข้อง
   - สรุปสิ่งที่เปลี่ยนแปลง
   - แนบภาพหน้าจอหรือ Log ผลการทดสอบ
   - ติ๊กเครื่องหมายถูกใน Pre-Merge Checklist

---

### ขั้นตอนที่ 6: การตรวจสอบอัตโนมัติ (Automated CI Checks)
เมื่อเปิด PR ระบบ **GitHub Actions** จะรันการตรวจสอบอัตโนมัติทันที:
1. **Automated Vitest Regression Tests (`npm run test:ci`)**: ต้องผ่านครบทุก Test Suites
2. **Next.js Production Build (`npm run build`)**: ตรวจสอบความถูกต้องของ Type และ Page Generation
3. **Security Audit**: สแกนห้ามมี Secret หลุดเข้าไปในโค้ด

> ⚠️ **หากมีจุดใดจุดหนึ่งไม่ผ่าน (CI Failed / กากบาทสีแดง):**  
> ให้แก้ไขโค้ดในเครื่องของตนเอง รันเทสต์จนผ่าน แล้ว Commit/Push ซ้ำลงใน Feature Branch เดิม ระบบจะตรวจซ้ำอัตโนมัติ

---

### ขั้นตอนที่ 7: การรีวิวและ Merge (Lead Code Review)
1. เมื่อ CI ตรวจผ่านเป็น **เครื่องหมายถูกสีเขียว (All checks have passed)** ให้แจ้ง Lead Engineer หรือเพื่อนร่วมทีมเพื่อรีวิวโค้ด
2. เมื่อได้รับการอนุมัติ (Approved) จาก Lead จะทำการ Merge เข้า `master` และระบบจะนำไป Deploy อัตโนมัติขึ้นสู่ Production Edge
