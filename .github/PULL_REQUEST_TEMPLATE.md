## 📌 รายละเอียดการส่งงาน (PR Description)

### 1. ลิงก์งานที่เกี่ยวข้อง (Linked Notion Task)
- **Notion Task ID:** `TASK-0X`
- **Notion Task URL:** [ใส่ลิงก์หน้างานใน Notion ที่นี่]

### 2. สรุปสิ่งที่พัฒนา / เปลี่ยนแปลง (What Changed?)
<!-- อธิบายสั้นๆ เกี่ยวกับฟังก์ชันที่เพิ่มเข้ามา หรือบั๊กที่แก้ไข -->
- 

### 3. ประเภทของงาน (Type of Change)
- [ ] 🚀 New Feature (ฟังก์ชันใหม่ตาม Task)
- [ ] 🐛 Bugfix (แก้ไขข้อผิดพลาด)
- [ ] ⚡ Performance Optimization (ปรับปรุงประสิทธิภาพ)
- [ ] 🔒 Security Hardening (ความปลอดภัย)
- [ ] 📝 Documentation / Tests (เอกสารหรือชุดทดสอบ)

---

## 🧪 ผลการทดสอบ (Testing Evidence)

- [ ] รันชุดทดสอบผ่านในเครื่อง: `npm run test:ci` (126/126 tests passed)
- [ ] ตรวจสอบการบิลด์ผ่าน: `npm run build`
- [ ] ตรวจสอบ Edge Runtime: ไม่มี Node.js Native C++ Bindings ที่กระทบ Cloudflare Workers
- [ ] ตรวจสอบความปลอดภัย: ไม่มีเฉลยคำตอบ (Answer Key) หลุดออกไปใน API ฝั่ง Client

### ภาพถ่ายหน้าจอ / หลักฐานการทดสอบ (Screenshots & Logs):
<!-- แนบภาพหน้าจอ Desktop (1440px) และ Mobile (375px) หรือ Log ผลการทดสอบ -->

---

## ✅ รายการตรวจสอบก่อน Merge (Pre-Merge Checklist)

- [ ] ไม่ได้ทำการ Push เข้า `master` หรือ `main` โดยตรง (ทำงานบน Branch ของตนเอง)
- [ ] โค้ดผ่านการจัด Format และไม่มี Syntax / Type Error
- [ ] สีและธีมตรงตาม Cosmic Dark Theme (`#23212C`)
- [ ] มี Unit Test สำหรับฟังก์ชันที่เพิ่มเข้ามาใหม่
- [ ] GitHub Actions CI Automated Check ขึ้นสถานะเขียว (Passed) ทั้งหมด
