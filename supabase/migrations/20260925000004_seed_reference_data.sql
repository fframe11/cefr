-- ==============================================================================
-- Migration: 20260925000004_seed_reference_data.sql
-- Description: Deterministic Reference Data Seed for cefr_levels and skills
-- Source of Truth: Phase 2.2 Table 1-2 & src/data/cefrData.ts
-- ==============================================================================

-- 1. Seed Master Skills (6 core skills)
INSERT INTO public.skills (code, name_en, name_th, icon_name, order_index)
VALUES 
  ('vocabulary', 'Vocabulary', 'คำศัพท์', 'BookOpen', 1),
  ('grammar', 'Grammar', 'ไวยากรณ์', 'FileText', 2),
  ('reading', 'Reading', 'การอ่าน', 'BookMarked', 3),
  ('listening', 'Listening', 'การฟัง', 'Headphones', 4),
  ('writing', 'Writing', 'การเขียน', 'PenTool', 5),
  ('speaking', 'Speaking', 'การพูด', 'Mic', 6)
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  icon_name = EXCLUDED.icon_name,
  order_index = EXCLUDED.order_index;

-- 2. Seed Master CEFR Levels (A1 to C2)
INSERT INTO public.cefr_levels (
  code, name_en, name_th, cambridge_equivalent, 
  cambridge_scale_min, cambridge_scale_max, 
  description_th, description_en, 
  can_do_descriptors_th, order_index
)
VALUES 
  (
    'A1', 'Beginner', 'ผู้ใช้ภาษาขั้นเริ่มต้น', 'Pre-A1 / A1 Movers', 
    80, 99, 
    'เข้าใจและใช้ประโยคง่ายๆ ในชีวิตประจำวัน แนะนำตัวเองและถามตอบข้อมูลส่วนตัวพื้นฐานได้', 
    'Can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of needs of a concrete type.',
    '["เข้าใจและใช้วลีง่ายๆ ในชีวิตประจำวันได้", "แนะนำตัวเองและผู้อื่นได้", "ถามตอบคำถามเกี่ยวกับรายละเอียดส่วนตัว เช่น ที่อยู่อาศัย คนที่รู้จัก"]'::jsonb,
    1
  ),
  (
    'A2', 'Elementary', 'ผู้ใช้ภาษาขั้นพื้นฐาน', 'A2 Key (KET)', 
    100, 119, 
    'เข้าใจประโยคและสำนวนที่พบบ่อย สื่อสารในสถานการณ์ประจำวัน แลกเปลี่ยนข้อมูลง่ายๆ ได้', 
    'Can understand sentences and frequently used expressions related to areas of most immediate relevance.',
    '["เข้าใจประโยคและสำนวนที่เกี่ยวข้องกับชีวิตประจำวัน", "สื่อสารในภารกิจที่ง่ายและเป็นกิจวัตร", "อธิบายความเป็นมา สภาพแวดล้อม และสิ่งจำเป็นเร่งด่วนได้"]'::jsonb,
    2
  ),
  (
    'B1', 'Intermediate', 'ผู้ใช้ภาษาอิสระระดับต้น', 'B1 Preliminary (PET)', 
    120, 139, 
    'เข้าใจประเด็นหลักของเรื่องที่คุ้นเคย จัดการกับสถานการณ์ส่วนใหญ่ระหว่างเดินทาง เขียนข้อความเชื่อมโยงเรียบง่ายได้', 
    'Can understand the main points of clear standard input on familiar matters regularly encountered in work, school, leisure, etc.',
    '["เข้าใจประเด็นหลักในเรื่องที่คุ้นเคยในที่ทำงาน โรงเรียน การพักผ่อน", "รับมือกับสถานการณ์ส่วนใหญ่ที่อาจเกิดขึ้นขณะเดินทาง", "เขียนข้อความเชื่อมโยงเรียบง่ายในหัวข้อที่คุ้นเคยหรือสนใจ"]'::jsonb,
    3
  ),
  (
    'B2', 'Upper Intermediate', 'ผู้ใช้ภาษาอิสระระดับสูง', 'B2 First (FCE)', 
    140, 159, 
    'เข้าใจใจความสำคัญของข้อความซับซ้อน สื่อสารได้อย่างคล่องแคล่วและเป็นธรรมชาติกับเจ้าของภาษา', 
    'Can understand the main ideas of complex text on both concrete and abstract topics, including technical discussions in their field of specialization.',
    '["เข้าใจใจความสำคัญของข้อความซับซ้อนทั้งรูปธรรมและนามธรรม", "สื่อสารอย่างคล่องแคล่วเป็นธรรมชาติกับเจ้าของภาษาโดยไม่เกร็ง", "เขียนข้อความที่ชัดเจนละเอียดในหัวข้อที่หลากหลาย"]'::jsonb,
    4
  ),
  (
    'C1', 'Advanced', 'ผู้ใช้ภาษาชำนาญการ', 'C1 Advanced (CAE)', 
    160, 179, 
    'เข้าใจข้อความยาวและยากที่หลากหลาย ใช้ภาษาได้อย่างยืดหยุ่นและมีประสิทธิภาพเพื่อสังคม วิชาการ และวิชาชีพ', 
    'Can understand a wide range of demanding, longer texts, and recognise implicit meaning.',
    '["เข้าใจข้อความยาวและยากที่หลากหลาย รวมถึงความหมายแฝง", "แสดงออกได้อย่างคล่องแคล่วเป็นธรรมชาติโดยไม่ต้องค้นหาคำศัพท์", "ใช้ภาษาอย่างยืดหยุ่นและมีประสิทธิภาพเพื่อสังคม วิชาการ และการทำงาน"]'::jsonb,
    5
  ),
  (
    'C2', 'Proficiency', 'ผู้ใช้ภาษาเชี่ยวชาญสูงสุด', 'C2 Proficiency (CPE)', 
    180, 230, 
    'เข้าใจสิ่งที่ได้ยินหรืออ่านได้อย่างง่ายดาย สรุปข้อมูลจากแหล่งต่างๆ และสร้างข้อโต้แย้งอย่างสอดคล้อง', 
    'Can understand with ease virtually everything heard or read.',
    '["เข้าใจสิ่งที่ได้ยินหรืออ่านแทบทุกอย่างได้อย่างง่ายดาย", "สรุปข้อมูลจากแหล่งข้อความและการพูดที่แตกต่างกัน", "แสดงออกอย่างเป็นธรรมชาติ แม่นยำ และแยกแยะความหมายที่ละเอียดอ่อนได้"]'::jsonb,
    6
  )
ON CONFLICT (code) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_th = EXCLUDED.name_th,
  cambridge_equivalent = EXCLUDED.cambridge_equivalent,
  cambridge_scale_min = EXCLUDED.cambridge_scale_min,
  cambridge_scale_max = EXCLUDED.cambridge_scale_max,
  description_th = EXCLUDED.description_th,
  description_en = EXCLUDED.description_en,
  can_do_descriptors_th = EXCLUDED.can_do_descriptors_th,
  order_index = EXCLUDED.order_index;
