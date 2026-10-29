-- Migration: 20261029000012_cambridge_c1_c2_ielts_expansion.sql
-- Description: Expand Cambridge Mock Exams to C1 Advanced (CAE), C2 Proficiency (CPE), and IELTS Academic
-- Target Release: v1.2.0

-- 1. Expand exam_code CHECK constraint on public.mock_exams
ALTER TABLE public.mock_exams DROP CONSTRAINT IF EXISTS mock_exams_exam_code_check;
ALTER TABLE public.mock_exams ADD CONSTRAINT mock_exams_exam_code_check 
  CHECK (exam_code IN ('KET', 'PET', 'FCE', 'CAE', 'CPE', 'IELTS', 'C1_ADVANCED', 'C2_PROFICIENCY', 'IELTS_ACADEMIC'));

-- 2. Expand question type CHECK constraint on public.questions
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_type_check;
ALTER TABLE public.questions ADD CONSTRAINT questions_type_check 
  CHECK (type IN (
    'multiple_choice',
    'fill_blank',
    'true_false',
    'matching',
    'ordering',
    'sentence_transformation',
    'keyword_transformation',
    'gapped_text',
    'multiple_matching'
  ));

-- 3. Seed Mock Exams: C1 Advanced (CAE), C2 Proficiency (CPE), and IELTS Academic
INSERT INTO public.mock_exams (
  id,
  exam_code,
  name,
  target_cefr,
  description_th,
  total_duration_minutes,
  passing_score,
  version,
  is_published,
  created_at
) VALUES 
(
  'cae00000-0000-4000-a000-000000000001',
  'CAE',
  'C1 Advanced (CAE) Mock Examination 1',
  'C1',
  'ข้อสอบจำลอง C1 Advanced (CAE) ตามมาตรฐาน Cambridge Assessment English พร้อมระบบประเมิน 160–210 Cambridge Scale และการตรวจ Key Word Transformation',
  130,
  60,
  1,
  TRUE,
  NOW()
),
(
  'cpe00000-0000-4000-a000-000000000001',
  'CPE',
  'C2 Proficiency (CPE) Mock Examination 1',
  'C2',
  'ข้อสอบจำลอง C2 Proficiency (CPE) มาตรฐานระดับสูงสุดของ Cambridge English ครอบคลุม Part 6 Gapped Text และระบบแปลงคะแนน 180–230 Scale',
  130,
  60,
  1,
  TRUE,
  NOW()
),
(
  'iel00000-0000-4000-a000-000000000001',
  'IELTS',
  'IELTS Academic Mock Examination 1',
  'C1',
  'ข้อสอบจำลองเสมือนจริง IELTS Academic ครบส่วน Reading และ Listening พร้อมระบบแปลงคะแนนเป็น Official IELTS 9-Band Scale อย่างแม่นยำ',
  90,
  60,
  1,
  TRUE,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description_th = EXCLUDED.description_th,
  is_published = TRUE;

-- 4. Seed Sections for New Mock Exams
INSERT INTO public.mock_exam_sections (
  id,
  mock_exam_id,
  name,
  skill,
  duration_minutes,
  question_count,
  order_index
) VALUES
-- CAE Sections
(
  'cae-sec1-0000-4000-a000-000000000001',
  'cae00000-0000-4000-a000-000000000001',
  'Reading & Use of English (Parts 1–8)',
  'reading',
  90,
  2,
  1
),
(
  'cae-sec2-0000-4000-a000-000000000002',
  'cae00000-0000-4000-a000-000000000001',
  'Listening (Parts 1–4, Max 2 Plays)',
  'listening',
  40,
  1,
  2
),
-- CPE Sections
(
  'cpe-sec1-0000-4000-a000-000000000001',
  'cpe00000-0000-4000-a000-000000000001',
  'Reading & Use of English (Parts 1–7)',
  'reading',
  90,
  2,
  1
),
(
  'cpe-sec2-0000-4000-a000-000000000002',
  'cpe00000-0000-4000-a000-000000000001',
  'Listening (Parts 1–4, Max 2 Plays)',
  'listening',
  40,
  1,
  2
),
-- IELTS Sections
(
  'iel-sec1-0000-4000-a000-000000000001',
  'iel00000-0000-4000-a000-000000000001',
  'Academic Reading (Passages 1–3)',
  'reading',
  60,
  2,
  1
),
(
  'iel-sec2-0000-4000-a000-000000000002',
  'iel00000-0000-4000-a000-000000000001',
  'Academic Listening (Sections 1–4)',
  'listening',
  30,
  1,
  2
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  duration_minutes = EXCLUDED.duration_minutes;

-- 5. Seed Questions (Key Word Transformation, Gapped Text, Multiple Matching, Listening)
INSERT INTO public.questions (
  id,
  skill,
  cefr_level,
  type,
  prompt_th,
  prompt_en,
  correct_answer_text,
  explanation_th,
  explanation_en,
  weakness_tag,
  difficulty_weight,
  is_active
) VALUES
-- Question 1: C1 Key Word Transformation
(
  'q-kwt-00000-4000-a000-000000000001',
  'reading',
  'C1',
  'keyword_transformation',
  'เปลี่ยนรูปประโยคโดยใช้คำที่กำหนดให้ (3-6 คำ)',
  'Original: Although she was exhausted, Maria completed the marathon.\nKeyword: SPITE\nPrefix: In\nSuffix: of exhaustion, Maria completed the marathon.',
  'spite of her exhaustion | spite of being exhausted',
  'สำนวน In spite of ต้องตามด้วยคำนาม (noun phrase) หรือ Gerund (-ing)',
  'In spite of requires a noun phrase ("her exhaustion") or a gerund ("being exhausted").',
  'c1_keyword_transformation',
  4,
  TRUE
),
-- Question 2: C1 Multiple Matching
(
  'q-mm-000000-4000-a000-000000000002',
  'reading',
  'C1',
  'multiple_matching',
  'จับคู่นักวิจัยกับข้อความที่ระบุ',
  'Which researcher emphasizes that language acquisition occurs most rapidly in socially immersive contexts?',
  'B',
  'นักวิจัยในข้อ B ระบุชัดเจนว่าบริบททางสังคมคือตัวเร่งหลักในการเรียนรู้ภาษา',
  'Researcher B explicitly stresses that social immersion significantly expedites lexical acquisition.',
  'c1_multiple_matching',
  4,
  TRUE
),
-- Question 3: C1 Listening Track (Cambridge Max 2 Plays)
(
  'q-list-00000-4000-a000-000000000003',
  'listening',
  'C1',
  'multiple_choice',
  'ฟังการบรรยายเกี่ยวกับ Quantum Computing แล้วเลือกข้อที่ถูกต้อง',
  'Listen to the lecture on quantum computer engineering. What primary obstacle does Dr. Chen identify regarding scalable error-correction?\nTranscript: Thermal fluctuations in cryogenic dilution refrigerators remain the predominant trigger for rapid phase decoherence before quantum error syndromes can be detected.',
  'B',
  'ดร. เฉินระบุว่าความผันผวนของอุณหภูมิคืออุปสรรคหลัก',
  'Dr. Chen explicitly states that thermal fluctuations in cryogenic dilution refrigerators cause rapid phase decoherence.',
  'c1_listening_comprehension',
  4,
  TRUE
),
-- Question 4: C2 Gapped Text (Part 6)
(
  'q-gap-000000-4000-a000-000000000004',
  'reading',
  'C2',
  'gapped_text',
  'เลือกย่อหน้าที่เหมาะสมที่สุดมาเติมลงในช่องว่างของบทความ',
  'The neurological underpinnings of native-like fluency in late bilinguals have long baffled cognitive linguists. [GAP 1] Consequently, synaptic connectivity in the dorsolateral prefrontal cortex reflects lifelong adaptation rather than innate biological predetermination.',
  'C',
  'ย่อหน้า C เชื่อมโยงบริบทเรื่องการทดลองภาพสะท้อนสมอง (fMRI) และความยืดหยุ่นของระบบประสาท',
  'Paragraph C provides the essential cohesive link documenting fMRI neuroimaging scans showing heightened neuroplasticity.',
  'c2_gapped_text',
  5,
  TRUE
),
-- Question 5: C2 Key Word Transformation
(
  'q-kwt-00000-4000-a000-000000000005',
  'reading',
  'C2',
  'keyword_transformation',
  'เปลี่ยนรูปประโยคระดับ C2 โดยใช้คำที่กำหนดให้ (3-6 คำ)',
  'Original: The manager had no idea that his assistant was embezzling company funds.\nKeyword: DARK\nPrefix: The manager was kept\nSuffix: his assistant''s embezzlement of company funds.',
  'completely in the dark about | entirely in the dark about | in the dark about',
  'สำนวน to be kept in the dark about หมายถึง ไม่ได้รับรู้ข้อมูลหรือถูกปิดบังไว้',
  'The idiomatic structure "to be kept in the dark about something" signifies being deliberately kept uninformed.',
  'c2_keyword_transformation',
  5,
  TRUE
),
-- Question 6: IELTS Academic Reading Multiple Matching
(
  'q-iel-00000-4000-a000-000000000006',
  'reading',
  'C1',
  'multiple_matching',
  'IELTS Reading: จับคู่ข้อความกับย่อหน้า A–D',
  'Which section contains information regarding the comparative life cycle carbon footprint of offshore wind turbines versus solar photovoltaic panels?',
  'D',
  'ย่อหน้า D นำเสนอข้อมูลการวิเคราะห์วงจรชีวิตและการปล่อยคาร์บอนของกังหันลมนอกชายฝั่ง',
  'Section D presents a comprehensive lifecycle cradle-to-grave carbon emission assessment of offshore wind installations.',
  'ielts_reading_matching',
  4,
  TRUE
)
ON CONFLICT (id) DO UPDATE SET
  prompt_en = EXCLUDED.prompt_en,
  correct_answer_text = EXCLUDED.correct_answer_text;

-- 6. Seed Question Options for Multiple Matching, Gapped Text, and Listening Questions
INSERT INTO public.question_options (
  id,
  question_id,
  key,
  text,
  is_correct,
  feedback_th
) VALUES
-- Options for Q2: C1 Multiple Matching (A-D)
('opt-mm-001', 'q-mm-000000-4000-a000-000000000002', 'A', 'Dr. Aris Thorne (Focus: Morphosyntactic processing in lab environments)', FALSE, 'ดร. ทอร์นเน้นการทดลองในห้องปฏิบัติการ ไม่ใช่บริบทสังคม'),
('opt-mm-002', 'q-mm-000000-4000-a000-000000000002', 'B', 'Dr. Elena Vance (Focus: Sociocultural immersion and organic peer interactions)', TRUE, 'ถูกต้อง ดร. แวนซ์เน้นการมีปฏิสัมพันธ์ทางสังคมอย่างเป็นธรรมชาติ'),
('opt-mm-003', 'q-mm-000000-4000-a000-000000000002', 'C', 'Prof. Kenneth Wu (Focus: Computational corpus frequency and word frequency lists)', FALSE, 'ศ. อู๋เน้นความถี่ของคลังข้อมูลคำศัพท์'),
('opt-mm-004', 'q-mm-000000-4000-a000-000000000002', 'D', 'Dr. Miriam Al-Sayed (Focus: Auditory phoneme discrimination in infancy)', FALSE, 'ดร. อัลซาอิดเน้นการจำแนกหน่วยเสียงในวัยทารก'),

-- Options for Q3: C1 Listening
('opt-lis-001', 'q-list-00000-4000-a000-000000000003', 'A', 'Insufficient laser precision in ion-trap manipulation', FALSE, 'ความแม่นยำของเลเซอร์ไม่ใช่สาเหตุหลักที่ดร. เฉินกล่าวถึง'),
('opt-lis-002', 'q-list-00000-4000-a000-000000000003', 'B', 'Thermal fluctuations inducing rapid phase decoherence', TRUE, 'ถูกต้อง ดร. เฉินระบุความผันผวนของอุณหภูมิเป็นตัวเร่งการสูญเสียสภาพความพัวพัน'),
('opt-lis-003', 'q-list-00000-4000-a000-000000000003', 'C', 'Lack of high-level quantum programming algorithms', FALSE, 'อัลกอริทึมไม่ใช่ปัญหาทางฟิสิกส์เชิงฮาร์ดแวร์ในบริบทนี้'),
('opt-lis-004', 'q-list-00000-4000-a000-000000000003', 'D', 'Excessive optical crosstalk across fiber waveguides', FALSE, 'การแทรกสัญญาณในท่อนำแสงไม่ใช่ประเด็นสำคัญ'),

-- Options for Q4: C2 Gapped Text (A-G)
('opt-gap-001', 'q-gap-000000-4000-a000-000000000004', 'A', 'Traditional grammarians held that syntax remained ossified after puberty.', FALSE, 'เนื้อหาไม่เชื่อมโยงกับคำว่า Consequently ในประโยคถัดไป'),
('opt-gap-002', 'q-gap-000000-4000-a000-000000000004', 'B', 'Behavioral metrics alone rarely capture subconscious linguistic reflexes.', FALSE, 'ไม่สอดคล้องกับโครงสร้าง synaptic connectivity'),
('opt-gap-003', 'q-gap-000000-4000-a000-000000000004', 'C', 'Recent high-resolution fMRI investigations revealed pronounced micro-structural remodelling within cerebral gray matter during intensive contextual immersion.', TRUE, 'ถูกต้อง ย่อหน้า C ให้หลักฐานทางสมองที่นำไปสู่ผลในประโยค Consequently'),
('opt-gap-004', 'q-gap-000000-4000-a000-000000000004', 'D', 'Phonological interference from the mother tongue often manifests under psychological fatigue.', FALSE, 'การแทรกแซงทางสัทวิทยาเป็นคนละหัวข้อ'),
('opt-gap-005', 'q-gap-000000-4000-a000-000000000004', 'E', 'Psycholinguists have disputed whether semantic categorization shifts across cultures.', FALSE, 'ประเด็นการจัดหมวดหมู่ความหมายไม่เข้ากับเนื้อหา'),
('opt-gap-006', 'q-gap-000000-4000-a000-000000000004', 'F', 'Educational curricula continue to underestimate early childhood auditory exposure.', FALSE, 'หลักสูตรการศึกษาไม่เกี่ยวกับการถ่ายภาพสมองในผู้ใหญ่'),
('opt-gap-007', 'q-gap-000000-4000-a000-000000000004', 'G', 'Computational neural networks simulate these lexical retrieval pathways with astonishing fidelity.', FALSE, 'โมเดลจำลองคอมพิวเตอร์ไม่ใช่การค้นพบทางประสาทวิทยาในมนุษย์'),

-- Options for Q6: IELTS Reading Matching
('opt-iel-001', 'q-iel-00000-4000-a000-000000000006', 'A', 'Section A: Historical adoption of fossil fuel subsidies in European nations', FALSE, 'Section A กล่าวถึงประวัติศาสตร์การอุดหนุนเชื้อเพลิงฟอสซิล'),
('opt-iel-002', 'q-iel-00000-4000-a000-000000000006', 'B', 'Section B: Technical grid storage challenges with intermittent renewable sources', FALSE, 'Section B กล่าวถึงความท้าทายของระบบกักเก็บพลังงาน'),
('opt-iel-003', 'q-iel-00000-4000-a000-000000000006', 'C', 'Section C: Economic feasibility analysis of community-based microgrid networks', FALSE, 'Section C กล่าวถึงความคุ้มค่าของไมโครกริดชุมชน'),
('opt-iel-004', 'q-iel-00000-4000-a000-000000000006', 'D', 'Section D: Cradle-to-grave lifecycle emissions comparison between marine wind arrays and terrestrial photovoltaic farms', TRUE, 'ถูกต้อง Section D เปรียบเทียบรอยเท้าคาร์บอนตลอดวัฏจักรชีวิต')
ON CONFLICT (id) DO UPDATE SET
  text = EXCLUDED.text,
  is_correct = EXCLUDED.is_correct;

-- 7. Link Questions to Mock Exam Sections in mock_exam_questions
INSERT INTO public.mock_exam_questions (
  id,
  section_id,
  question_id,
  order_index,
  marks
) VALUES
-- CAE Section 1 (Reading): Q1 (KWT) & Q2 (Multiple Matching)
('meq-cae-001', 'cae-sec1-0000-4000-a000-000000000001', 'q-kwt-00000-4000-a000-000000000001', 1, 2),
('meq-cae-002', 'cae-sec1-0000-4000-a000-000000000001', 'q-mm-000000-4000-a000-000000000002', 2, 1),
-- CAE Section 2 (Listening): Q3
('meq-cae-003', 'cae-sec2-0000-4000-a000-000000000002', 'q-list-00000-4000-a000-000000000003', 1, 1),

-- CPE Section 1 (Reading): Q4 (Gapped Text) & Q5 (KWT)
('meq-cpe-001', 'cpe-sec1-0000-4000-a000-000000000001', 'q-gap-000000-4000-a000-000000000004', 1, 2),
('meq-cpe-002', 'cpe-sec1-0000-4000-a000-000000000001', 'q-kwt-00000-4000-a000-000000000005', 2, 2),
-- CPE Section 2 (Listening): Q3
('meq-cpe-003', 'cpe-sec2-0000-4000-a000-000000000002', 'q-list-00000-4000-a000-000000000003', 1, 1),

-- IELTS Section 1 (Reading): Q6 (Multiple Matching) & Q1 (KWT)
('meq-iel-001', 'iel-sec1-0000-4000-a000-000000000001', 'q-iel-00000-4000-a000-000000000006', 1, 1),
('meq-iel-002', 'iel-sec1-0000-4000-a000-000000000001', 'q-kwt-00000-4000-a000-000000000001', 2, 1),
-- IELTS Section 2 (Listening): Q3
('meq-iel-003', 'iel-sec2-0000-4000-a000-000000000002', 'q-list-00000-4000-a000-000000000003', 1, 1)
ON CONFLICT (id) DO UPDATE SET
  order_index = EXCLUDED.order_index,
  marks = EXCLUDED.marks;
