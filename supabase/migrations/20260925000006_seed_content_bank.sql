-- ==============================================================================
-- Migration: 20260925000006_seed_content_bank.sql
-- Description: Production Content-Only Seed Migration
-- Scope: 21 Vocabularies, 58 Collocations, 5 Grammar Topics, 3 Reading Passages,
--        3 Listening Exercises, 3 Writing Prompts, 3 Speaking Prompts,
--        33 Questions (18 Diagnostic + 6 Grammar + 5 Reading + 4 Listening),
--        132 Question Options.
-- Excluded: Mock Exams, Sections, and Mock Exam Questions (Semantic Blocker).
-- Characteristic: 100% Deterministic UUIDs, Idempotent ON CONFLICT clauses.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Seed Vocabularies (21 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.vocabularies (
  id, word, lemma, cefr_level, part_of_speech, ipa, meaning_th, meaning_en,
  example_sentence_en, example_sentence_th, topic, synonyms, antonyms, is_active
)
VALUES
  (
    'a0000000-0000-4001-8000-000000000001', 'schedule', 'schedule', 'A1',
    'noun', '/ˈʃedʒ.uːl/', 'ตารางเวลา, กำหนดการ', 'A plan that lists tasks, events, or times when they will occur.',
    'I need to check my work schedule for tomorrow morning.', 'ฉันจำเป็นต้องตรวจสอบตารางเวลาทำงานสำหรับเช้าวันพรุ่งนี้', 'Daily Routine',
    '{"timetable","agenda","planner"}'::text[], '{}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000002', 'borrow', 'borrow', 'A1',
    'verb', '/ˈbɒr.əʊ/', 'ขอยืม (นำมาใช้ชั่วคราวแล้วคืน)', 'To take and use something belonging to someone else with the intention of returning it.',
    'Can I borrow your pencil for the math exam?', 'ฉันขอยืมดินสอของคุณสำหรับสอบวิชาคณิตศาสตร์หน่อยได้ไหม?', 'School & Study',
    '{"take on loan"}'::text[], '{"lend","return"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000003', 'journey', 'journey', 'A1',
    'noun', '/ˈdʒɜː.ni/', 'การเดินทาง', 'An act of traveling from one place to another.',
    'The train journey from Bangkok to Chiang Mai takes about ten hours.', 'การเดินทางด้วยรถไฟจากกรุงเทพฯ ไปเชียงใหม่ใช้เวลาประมาณ 10 ชั่วโมง', 'Travel',
    '{"trip","voyage","travel"}'::text[], '{}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000004', 'delicious', 'delicious', 'A1',
    'adjective', '/dɪˈlɪʃ.əs/', 'อร่อย, รสชาติดีมาก', 'Having a very pleasant taste or smell.',
    'My grandmother cooked a delicious noodle soup for lunch.', 'คุณยายของฉันปรุงก๋วยเตี๋ยวต้มยำรสชาติอร่อยมากสำหรับมื้อกลางวัน', 'Food & Dining',
    '{"tasty","flavorful","yummy"}'::text[], '{"disgusting","bland"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000005', 'convenient', 'convenient', 'A2',
    'adjective', '/kənˈviː.ni.ənt/', 'สะดวกสบาย, เหมาะสมกับเวลาหรือการใช้งาน', 'Fitting in well with a person''s needs, activities, and plans.',
    'Living near a subway station is extremely convenient for office workers.', 'การอาศัยอยู่ใกล้สถานีรถไฟฟ้าใต้ดินสะดวกสบายอย่างยิ่งสำหรับคนทำงานออฟฟิศ', 'Urban Life',
    '{"handy","accessible","practical"}'::text[], '{"inconvenient","troublesome"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000006', 'complain', 'complain', 'A2',
    'verb', '/kəmˈpleɪn/', 'บ่น, ร้องเรียน', 'To say that you are not satisfied with a situation, product, or service.',
    'Customers complained about the slow internet connection in the hotel lobby.', 'ลูกค้าได้ร้องเรียนเกี่ยวกับความเร็วอินเทอร์เน็ตที่ช้าในบริเวณล็อบบี้โรงแรม', 'Customer Service',
    '{"grumble","protest","criticize"}'::text[], '{"praise","commend"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000007', 'environment', 'environment', 'A2',
    'noun', '/ɪnˈvaɪ.rən.mənt/', 'สิ่งแวดล้อม, สภาพแวดล้อม', 'The surroundings or conditions in which a person, animal, or plant lives.',
    'We must reduce plastic usage to protect the natural environment.', 'พวกเราต้องลดการใช้พลาสติกเพื่อปกป้องสิ่งแวดล้อมทางธรรมชาติ', 'Nature & Environment',
    '{"surroundings","ecosystem","habitat"}'::text[], '{}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000008', 'achieve', 'achieve', 'B1',
    'verb', '/əˈtʃiːv/', 'บรรลุเป้าหมาย, ประสบความสำเร็จ', 'To successfully reach a goal, especially through hard work and determination.',
    'With consistent practice, you can achieve a high score in your CEFR exam.', 'ด้วยการฝึกฝนอย่างสม่ำเสมอ คุณสามารถบรรลุคะแนนสูงในการสอบ CEFR ของคุณได้', 'Success & Goals',
    '{"accomplish","attain","fulfill"}'::text[], '{"fail","abandon"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000009', 'recommend', 'recommend', 'B1',
    'verb', '/ˌrek.əˈmend/', 'แนะนำ (สิ่งที่ดีหรือเหมาะสมให้ผู้อื่น)', 'To suggest that someone or something would be good or suitable for a particular purpose.',
    'The teacher recommended reading English news daily to expand vocabulary.', 'คุณครูแนะนำให้อ่านข่าวภาษาอังกฤษทุกวันเพื่อเพิ่มพูนคลังคำศัพท์', 'Advice & Opinions',
    '{"suggest","advise","propose"}'::text[], '{"discourage","warn against"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000010', 'opportunity', 'opportunity', 'B1',
    'noun', '/ˌɒp.əˈtʃuː.nə.ti/', 'โอกาส (จังหวะที่ดีในการทำสิ่งใดสิ่งหนึ่ง)', 'A set of circumstances that makes it possible to do something desirable.',
    'Studying abroad presents an exceptional opportunity to experience different cultures.', 'การไปเรียนต่อต่างประเทศมอบโอกาสอันยอดเยี่ยมในการสัมผัสวัฒนธรรมที่แตกต่าง', 'Education & Career',
    '{"chance","opening","possibility"}'::text[], '{"misfortune","obstacle"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000011', 'hesitate', 'hesitate', 'B1',
    'verb', '/ˈhez.ɪ.teɪt/', 'ลังเล, ชะงักงัน', 'To pause before saying or doing something, often because you are uncertain or nervous.',
    'Please do not hesitate to contact our customer support team if you have questions.', 'โปรดอย่าลังเลที่จะติดต่อทีมบริการลูกค้าของเราหากคุณมีข้อสงสัย', 'Feelings & Behavior',
    '{"waver","dither","pause"}'::text[], '{"proceed","decide promptly"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000012', 'substantial', 'substantial', 'B2',
    'adjective', '/səbˈstæn.ʃəl/', 'มากมาย, มีเนื้อหาสาระสำคัญ, เป็นชิ้นเป็นอัน', 'Of considerable importance, size, or worth.',
    'The government allocated a substantial sum of money to renewable energy projects.', 'รัฐบาลได้จัดสรรงบประมาณจำนวนมากให้แก่โครงการพลังงานหมุนเวียน', 'Economics & Policy',
    '{"significant","considerable","sizeable"}'::text[], '{"negligible","minor","trivial"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000013', 'inevitable', 'inevitable', 'B2',
    'adjective', '/ɪnˈev.ɪ.tə.bəl/', 'ซึ่งหลีกเลี่ยงไม่ได้, ต้องเกิดขึ้นอย่างแน่นอน', 'Certain to happen; unavoidable.',
    'With rapid technological progress, automation in manufacturing is inevitable.', 'ด้วยความก้าวหน้าอย่างรวดเร็วทางเทคโนโลยี การใช้ระบบอัตโนมัติในโรงงานจึงเป็นสิ่งที่หลีกเลี่ยงไม่ได้', 'Technology & Society',
    '{"unavoidable","inescapable","fated"}'::text[], '{"avoidable","preventable","uncertain"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000014', 'collaborate', 'collaborate', 'B2',
    'verb', '/kəˈlæb.ə.reɪt/', 'ร่วมมือกันทำงาน, ประสานงานร่วมกัน', 'To work jointly on an activity or project to produce something.',
    'Engineers and designers must collaborate closely to craft intuitive digital experiences.', 'วิศวกรและนักออกแบบต้องร่วมมือกันอย่างใกล้ชิดเพื่อสร้างสรรค์ประสบการณ์ดิจิทัลที่ใช้งานง่าย', 'Workplace & Teams',
    '{"cooperate","team up","join forces"}'::text[], '{"work independently","oppose"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000015', 'controversy', 'controversy', 'B2',
    'noun', '/ˈkɒn.trə.vɜː.si/', 'ข้อถกเถียง, ข้อขัดแย้งในสังคม', 'Prolonged public disagreement or heated discussion.',
    'The proposal to construct a highway through the forest sparked intense controversy.', 'ข้อเสนอในการสร้างทางหลวงตัดผ่านผืนป่าจุดชนวนข้อถกเถียงอันดุเดือดในสังคม', 'Current Affairs',
    '{"dispute","debate","contention"}'::text[], '{"agreement","consensus","harmony"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000016', 'lucid', 'lucid', 'C1',
    'adjective', '/ˈluː.sɪd/', 'ชัดเจนแจ่มแจ้ง, เข้าใจง่าย, มีสติสัมปชัญญะสมบูรณ์', 'Expressed clearly; easy to understand, or showing ability to think clearly.',
    'The professor gave a remarkably lucid explanation of quantum mechanics.', 'ศาสตราจารย์ได้อธิบายวิชากลศาสตร์ควอนตัมได้อย่างชัดเจนแจ่มแจ้งและเข้าใจง่ายอย่างยิ่ง', 'Academia & Science',
    '{"coherent","articulate","luminous","transparent"}'::text[], '{"obscure","confusing","vague","muddled"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000017', 'scrutinize', 'scrutinize', 'C1',
    'verb', '/ˈskruː.tɪ.naɪz/', 'ตรวจสอบอย่างละเอียดถี่ถ้วน, พินิจพิเคราะห์', 'To examine or inspect closely and thoroughly.',
    'Financial auditors diligently scrutinized every transaction recorded in the ledger.', 'ผู้ตรวจสอบบัญชีได้พินิจพิเคราะห์ทุกรายการธุรกรรมที่บันทึกไว้ในบัญชีแยกประเภทอย่างละเอียดถี่ถ้วน', 'Finance & Law',
    '{"examine","inspect","dissect","audit"}'::text[], '{"glance at","overlook","skim"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000018', 'pragmatic', 'pragmatic', 'C1',
    'adjective', '/præɡˈmæt.ɪk/', 'เน้นการปฏิบัติจริง, ยึดผลลัพธ์ที่เป็นรูปธรรมมากกว่าทฤษฎี', 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.',
    'Faced with supply shortages, the project manager adopted a pragmatic approach to meet deadlines.', 'เมื่อต้องเผชิญกับภาวะขาดแคลนวัตถุดิบ ผู้จัดการโครงการจึงเลือกใช้แนวทางที่เน้นปฏิบัติจริงเพื่อให้ทันกำหนดเวลา', 'Management & Strategy',
    '{"practical","realistic","utilitarian","sensible"}'::text[], '{"idealistic","theoretical","impractical"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000019', 'ephemeral', 'ephemeral', 'C2',
    'adjective', '/ɪˈfem.ər.əl/', 'มีอายุสั้นมาก, ชั่วประเดี๋ยวเดียว, ไม่จีรัง', 'Lasting for a very short time; transitory.',
    'Social media fame is often ephemeral, vanishing as soon as the next algorithm shift occurs.', 'ชื่อเสียงในโลกโซเชียลมักเป็นสิ่งที่ไม่จีรังและเลือนหายไปทันทีที่อัลกอริทึมเปลี่ยนไป', 'Philosophy & Culture',
    '{"fleeting","transitory","evanescent","fugitive"}'::text[], '{"perpetual","eternal","enduring","permanent"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000020', 'juxtapose', 'juxtapose', 'C2',
    'verb', '/ˌdʒʌk.stəˈpəʊz/', 'วางเคียงคู่กันเพื่อเปรียบเทียบความแตกต่าง', 'To place different things close together, especially to display contrasting effects or to compare them.',
    'The documentary deliberately juxtaposed opulent penthouses with adjacent slum settlements.', 'สารคดีเรื่องนี้จงใจวางภาพเพนต์เฮาส์อันหรูหราเคียงคู่กับชุมชนแออัดข้างเคียงเพื่อสะท้อนความเหลื่อมล้ำที่ตัดกันชัดเจน', 'Arts & Criticism',
    '{"contrast","collocate","set side by side"}'::text[], '{"isolate","separate"}'::text[], true
  ),
  (
    'a0000000-0000-4001-8000-000000000021', 'obsequious', 'obsequious', 'C2',
    'adjective', '/əbˈsiː.kwi.əs/', 'ประจบสอพลอ, นอบน้อมยอมตามอย่างเกินเหตุ', 'Obedient or attentive to an excessive or servile degree.',
    'The monarch was surrounded by obsequious courtiers who flattered him rather than offering truthful advice.', 'กษัตริย์ถูกห้อมล้อมด้วยเหล่าข้าราชบริพารที่ประจบสอพลอซึ่งคอยแต่ยกยอแทนที่จะทูลคำแนะนำตามความจริง', 'Literature & Character',
    '{"servile","sycophantic","fawning","subservient"}'::text[], '{"assertive","defiant","uncompromising"}'::text[], true
  )
ON CONFLICT (id) DO UPDATE SET
  word = EXCLUDED.word, lemma = EXCLUDED.lemma, cefr_level = EXCLUDED.cefr_level,
  part_of_speech = EXCLUDED.part_of_speech, ipa = EXCLUDED.ipa, meaning_th = EXCLUDED.meaning_th,
  meaning_en = EXCLUDED.meaning_en, example_sentence_en = EXCLUDED.example_sentence_en,
  example_sentence_th = EXCLUDED.example_sentence_th, topic = EXCLUDED.topic,
  synonyms = EXCLUDED.synonyms, antonyms = EXCLUDED.antonyms, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 2. Seed Vocabulary Collocations (58 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.vocabulary_collocations (id, vocabulary_id, collocation_text)
VALUES
  ('a0000000-0000-4002-8000-000000000001', 'a0000000-0000-4001-8000-000000000001', 'tight schedule'),
  ('a0000000-0000-4002-8000-000000000002', 'a0000000-0000-4001-8000-000000000001', 'busy schedule'),
  ('a0000000-0000-4002-8000-000000000003', 'a0000000-0000-4001-8000-000000000001', 'on schedule'),
  ('a0000000-0000-4002-8000-000000000004', 'a0000000-0000-4001-8000-000000000002', 'borrow from'),
  ('a0000000-0000-4002-8000-000000000005', 'a0000000-0000-4001-8000-000000000002', 'borrow books'),
  ('a0000000-0000-4002-8000-000000000006', 'a0000000-0000-4001-8000-000000000003', 'long journey'),
  ('a0000000-0000-4002-8000-000000000007', 'a0000000-0000-4001-8000-000000000003', 'safe journey'),
  ('a0000000-0000-4002-8000-000000000008', 'a0000000-0000-4001-8000-000000000003', 'train journey'),
  ('a0000000-0000-4002-8000-000000000009', 'a0000000-0000-4001-8000-000000000004', 'delicious meal'),
  ('a0000000-0000-4002-8000-000000000010', 'a0000000-0000-4001-8000-000000000004', 'delicious aroma'),
  ('a0000000-0000-4002-8000-000000000011', 'a0000000-0000-4001-8000-000000000005', 'convenient location'),
  ('a0000000-0000-4002-8000-000000000012', 'a0000000-0000-4001-8000-000000000005', 'convenient time'),
  ('a0000000-0000-4002-8000-000000000013', 'a0000000-0000-4001-8000-000000000005', 'convenient store'),
  ('a0000000-0000-4002-8000-000000000014', 'a0000000-0000-4001-8000-000000000006', 'complain about'),
  ('a0000000-0000-4002-8000-000000000015', 'a0000000-0000-4001-8000-000000000006', 'complain to someone'),
  ('a0000000-0000-4002-8000-000000000016', 'a0000000-0000-4001-8000-000000000006', 'make a complaint'),
  ('a0000000-0000-4002-8000-000000000017', 'a0000000-0000-4001-8000-000000000007', 'natural environment'),
  ('a0000000-0000-4002-8000-000000000018', 'a0000000-0000-4001-8000-000000000007', 'protect the environment'),
  ('a0000000-0000-4002-8000-000000000019', 'a0000000-0000-4001-8000-000000000007', 'work environment'),
  ('a0000000-0000-4002-8000-000000000020', 'a0000000-0000-4001-8000-000000000008', 'achieve a goal'),
  ('a0000000-0000-4002-8000-000000000021', 'a0000000-0000-4001-8000-000000000008', 'achieve success'),
  ('a0000000-0000-4002-8000-000000000022', 'a0000000-0000-4001-8000-000000000008', 'achieve results'),
  ('a0000000-0000-4002-8000-000000000023', 'a0000000-0000-4001-8000-000000000009', 'highly recommend'),
  ('a0000000-0000-4002-8000-000000000024', 'a0000000-0000-4001-8000-000000000009', 'recommend doing something'),
  ('a0000000-0000-4002-8000-000000000025', 'a0000000-0000-4001-8000-000000000009', 'recommend someone for'),
  ('a0000000-0000-4002-8000-000000000026', 'a0000000-0000-4001-8000-000000000010', 'golden opportunity'),
  ('a0000000-0000-4002-8000-000000000027', 'a0000000-0000-4001-8000-000000000010', 'seize an opportunity'),
  ('a0000000-0000-4002-8000-000000000028', 'a0000000-0000-4001-8000-000000000010', 'equal opportunity'),
  ('a0000000-0000-4002-8000-000000000029', 'a0000000-0000-4001-8000-000000000011', 'hesitate to do'),
  ('a0000000-0000-4002-8000-000000000030', 'a0000000-0000-4001-8000-000000000011', 'hesitate before speaking'),
  ('a0000000-0000-4002-8000-000000000031', 'a0000000-0000-4001-8000-000000000012', 'substantial amount'),
  ('a0000000-0000-4002-8000-000000000032', 'a0000000-0000-4001-8000-000000000012', 'substantial increase'),
  ('a0000000-0000-4002-8000-000000000033', 'a0000000-0000-4001-8000-000000000012', 'substantial evidence'),
  ('a0000000-0000-4002-8000-000000000034', 'a0000000-0000-4001-8000-000000000013', 'inevitable outcome'),
  ('a0000000-0000-4002-8000-000000000035', 'a0000000-0000-4001-8000-000000000013', 'inevitable consequence'),
  ('a0000000-0000-4002-8000-000000000036', 'a0000000-0000-4001-8000-000000000014', 'collaborate with someone'),
  ('a0000000-0000-4002-8000-000000000037', 'a0000000-0000-4001-8000-000000000014', 'collaborate on a project'),
  ('a0000000-0000-4002-8000-000000000038', 'a0000000-0000-4001-8000-000000000015', 'spark controversy'),
  ('a0000000-0000-4002-8000-000000000039', 'a0000000-0000-4001-8000-000000000015', 'surrounded by controversy'),
  ('a0000000-0000-4002-8000-000000000040', 'a0000000-0000-4001-8000-000000000015', 'bitter controversy'),
  ('a0000000-0000-4002-8000-000000000041', 'a0000000-0000-4001-8000-000000000016', 'lucid explanation'),
  ('a0000000-0000-4002-8000-000000000042', 'a0000000-0000-4001-8000-000000000016', 'lucid moment'),
  ('a0000000-0000-4002-8000-000000000043', 'a0000000-0000-4001-8000-000000000016', 'lucid style'),
  ('a0000000-0000-4002-8000-000000000044', 'a0000000-0000-4001-8000-000000000017', 'closely scrutinize'),
  ('a0000000-0000-4002-8000-000000000045', 'a0000000-0000-4001-8000-000000000017', 'scrutinize data'),
  ('a0000000-0000-4002-8000-000000000046', 'a0000000-0000-4001-8000-000000000017', 'come under scrutiny'),
  ('a0000000-0000-4002-8000-000000000047', 'a0000000-0000-4001-8000-000000000018', 'pragmatic approach'),
  ('a0000000-0000-4002-8000-000000000048', 'a0000000-0000-4001-8000-000000000018', 'pragmatic solution'),
  ('a0000000-0000-4002-8000-000000000049', 'a0000000-0000-4001-8000-000000000018', 'pragmatic view'),
  ('a0000000-0000-4002-8000-000000000050', 'a0000000-0000-4001-8000-000000000019', 'ephemeral nature'),
  ('a0000000-0000-4002-8000-000000000051', 'a0000000-0000-4001-8000-000000000019', 'ephemeral pleasures'),
  ('a0000000-0000-4002-8000-000000000052', 'a0000000-0000-4001-8000-000000000019', 'ephemeral trend'),
  ('a0000000-0000-4002-8000-000000000053', 'a0000000-0000-4001-8000-000000000020', 'juxtapose with'),
  ('a0000000-0000-4002-8000-000000000054', 'a0000000-0000-4001-8000-000000000020', 'boldly juxtaposed'),
  ('a0000000-0000-4002-8000-000000000055', 'a0000000-0000-4001-8000-000000000020', 'stark juxtaposition'),
  ('a0000000-0000-4002-8000-000000000056', 'a0000000-0000-4001-8000-000000000021', 'obsequious manner'),
  ('a0000000-0000-4002-8000-000000000057', 'a0000000-0000-4001-8000-000000000021', 'obsequious smile'),
  ('a0000000-0000-4002-8000-000000000058', 'a0000000-0000-4001-8000-000000000021', 'obsequious devotion')
ON CONFLICT (id) DO UPDATE SET
  vocabulary_id = EXCLUDED.vocabulary_id,
  collocation_text = EXCLUDED.collocation_text;

-- ------------------------------------------------------------------------------
-- 3. Seed Grammar Topics (5 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.grammar_topics (
  id, slug, title_en, title_th, cefr_level, summary_th, concept_th, concept_en, rules, common_mistakes, is_active
)
VALUES
  (
    'b0000000-0000-4001-8000-000000000001', 'grammar-a1-present-tenses', 'Present Simple vs. Present Continuous', 'กาลปัจจุบันทั่วไป vs. กำลังกระทำในขณะนี้',
    'A1', 'เข้าใจความแตกต่างระหว่างสิ่งที่ทำเป็นประจำ (ความจริง/นิสัย) กับสิ่งที่กำลังเกิดขึ้นในวินาทีนี้', 'ในภาษาอังกฤษ เมื่อต้องการบอกเล่าเรื่องราว เราต้องเลือกใช้ Tense ให้ตรงกับบริบทเวลา:
1. **Present Simple**: ใช้กับ "ความจริงทั่วไป", "กฎธรรมชาติ", หรือ "กิจวัตรประจำวัน/นิสัย"
   - เช่น ฉันดื่มกาแฟทุกเช้า (ทำเป็นประจำ)
2. **Present Continuous**: ใช้กับเหตุการณ์ที่ "กำลังเกิดขึ้นอยู่ ณ ตอนนี้" หรือ "กำลังดำเนินอยู่ในช่วงนี้"
   - เช่น ฉันกำลังดื่มกาแฟอยู่ (ถือแก้วดื่มอยู่ตอนนี้)', 'Present Simple describes habits, general facts, and routines. Present Continuous describes actions happening right now at the moment of speaking.',
    '[{"formula":"Subject + V.1 (เติม -s/-es เมื่อประธานเป็น He, She, It)","explanationTh":"Present Simple: สังเกตคำบอกความถี่ (always, usually, every day, often)","exampleEn":"He walks to the office every morning.","exampleTh":"เขาเดินไปที่ทำงานทุกเช้า (เป็นกิจวัตร)"},{"formula":"Subject + is/am/are + V.ing","explanationTh":"Present Continuous: สังเกตคำบอกเวลา (now, at the moment, right now, Look!)","exampleEn":"He is walking to the office right now.","exampleTh":"เขากำลังเดินไปที่ทำงานอยู่ ณ ตอนนี้ (กำลังก้าวเดินอยู่)"}]'::jsonb, '[{"incorrect":"She eat breakfast every day.","correct":"She eats breakfast every day.","reasonTh":"เมื่อประธานเป็นเอกพจน์ (She) ใน Present Simple กริยาต้องเติม -s หรือ -es เสมอ"},{"incorrect":"I am playing football every Sunday.","correct":"I play football every Sunday.","reasonTh":"ทุกวันอาทิตย์เป็นกิจวัตรที่ทำประจำ ต้องใช้ Present Simple ไม่ใช้ Present Continuous"}]'::jsonb, true
  ),
  (
    'b0000000-0000-4001-8000-000000000002', 'grammar-a2-past-perfect', 'Past Simple vs. Present Perfect', 'อดีตจบแล้ว vs. อดีตที่ยังเชื่อมโยงถึงปัจจุบัน',
    'A2', 'จุดปราบเซียนของผู้เรียนไทย: อดีตที่ระบุเวลาเจาะจง vs. ประสบการณ์หรือสิ่งที่ทำแล้วยังส่งผลต่อปัจจุบัน', 'คนไทยมักสับสนระหว่าง Past Simple กับ Present Perfect เพราะในภาษาไทยใช้คำว่า "แล้ว" เหมือนกัน:
1. **Past Simple (Subject + V.2)**:
   - ใช้กับเหตุการณ์ที่ "เกิดขึ้นและจบลงไปแล้วในอดีตอย่างเด็ดขาด"
   - มักระบุเวลาชัดเจน เช่น yesterday, last night, 2 years ago, in 2020
   - ตัวอย่าง: I lost my key yesterday. (เมื่อวานทำกุญแจหาย ตอนนี้อาจหาเจอแล้วหรือไม่รู้ แต่เน้นว่าเมื่อวานหาย)
2. **Present Perfect (Subject + have/has + V.3)**:
   - ใช้พูดถึง "เหตุการณ์ในอดีตที่ยังส่งผลหรือยังเกี่ยวข้องกับปัจจุบัน"
   - หรือใช้บอก "ประสบการณ์ชีวิตว่าเคย/ไม่เคยทำ" โดยไม่เน้นเวลา
   - ตัวอย่าง: I have lost my key. (ฉันทำกุญแจหาย และ "ตอนนี้กุญแจก็ยังหายอยู่ เข้าบ้านไม่ได้")', 'Past Simple specifies a finished action at a definite time in the past. Present Perfect connects a past action or experience to the present moment.',
    '[{"formula":"Subject + V.2","explanationTh":"Past Simple: ระบุเวลาที่จบลงแล้วแน่นอน (yesterday, last month, when I was young)","exampleEn":"We visited London in 2022.","exampleTh":"พวกเราไปเที่ยวลอนดอนเมื่อปี 2022 (จบลงแล้วในปี 2022)"},{"formula":"Subject + have / has + V.3","explanationTh":"Present Perfect: เหตุการณ์ตั้งแต่เริ่มในอดีตจนถึงตอนนี้ (since, for, already, yet, ever, never)","exampleEn":"We have lived here for ten years.","exampleTh":"พวกเราอาศัยอยู่ที่นี่มาเป็นเวลา 10 ปีแล้ว (และปัจจุบันก็ยังคงอยู่ที่นี่)"}]'::jsonb, '[{"incorrect":"I have seen him yesterday.","correct":"I saw him yesterday.","reasonTh":"มีคำระบุเวลาอดีตที่แน่นอน (yesterday) ห้ามใช้ Present Perfect ต้องใช้ Past Simple"},{"incorrect":"She lived in Bangkok since 2018.","correct":"She has lived in Bangkok since 2018.","reasonTh":"มีคำว่า \"since\" (ตั้งแต่) บอกจุดเริ่มต้นของเหตุการณ์ที่ยาวมาถึงปัจจุบัน ต้องใช้ Present Perfect"}]'::jsonb, true
  ),
  (
    'b0000000-0000-4001-8000-000000000003', 'grammar-b1-conditionals', 'Conditionals: Real vs. Unreal (Type 1 & 2)', 'ประโยคเงื่อนไข: สิ่งที่เป็นไปได้จริง vs. สิ่งสมมติในปัจจุบัน',
    'B1', 'แยกแยะระหว่างเงื่อนไขที่เป็นไปได้จริงในอนาคต (Type 1) กับการจินตนาการสิ่งที่ไม่จริงในปัจจุบัน (Type 2)', 'If-Clause มีบทบาทสำคัญอย่างยิ่งในการสอบ Cambridge PET และ FCE:
1. **First Conditional (เป็นไปได้จริงในอนาคต)**:
   - โครงสร้าง: If + Present Simple, will + กริยาช่อง 1
   - เช่น If it rains tomorrow, we will cancel the picnic. (ถ้าพรุ่งนี้ฝนตก เราจะยกเลิกการไปปิกนิก)
2. **Second Conditional (สมมติสิ่งที่ไม่จริงในปัจจุบัน / ฝันกลางวัน)**:
   - โครงสร้าง: If + Past Simple, would + กริยาช่อง 1
   - เช่น If I won the lottery, I would travel around the world. (ถ้าฉันถูกรางวัลที่ 1 ฉันจะไปเที่ยวรอบโลก, ตอนนี้ยังไม่ถูก เป็นเรื่องสมมติ)', 'First Conditional deals with likely future events (If + present, will + infinitive). Second Conditional deals with hypothetical or improbable present/future events (If + past, would + infinitive).',
    '[{"formula":"If + Present Simple, will + V.inf","explanationTh":"First Conditional: เหตุและผลที่เป็นไปได้จริงในอนาคต","exampleEn":"If you study hard, you will pass the Cambridge test.","exampleTh":"ถ้าคุณตั้งใจอ่านหนังสือ คุณจะสอบผ่านการสอบเคมบริดจ์แน่นอน"},{"formula":"If + Past Simple, would/could + V.inf","explanationTh":"Second Conditional: สมมติตรงข้ามกับความจริงในปัจจุบัน (กริยา to be นิยมใช้ were กับทุกประธาน)","exampleEn":"If I were you, I would accept the job offer.","exampleTh":"ถ้าฉันเป็นคุณ ฉันจะตอบรับข้อเสนอการทำงานนี้ (ในความเป็นจริงฉันไม่ใช่คุณ)"}]'::jsonb, '[{"incorrect":"If it will rain tomorrow, I will stay home.","correct":"If it rains tomorrow, I will stay home.","reasonTh":"หลัง If ใน First Conditional ห้ามใส่ will เด็ดขาด ให้ใช้ Present Simple (rains)"},{"incorrect":"If I had money, I will buy a car.","correct":"If I had money, I would buy a car.","reasonTh":"ใน Second Conditional เมื่อประโยคเงื่อนไขเป็น had (Past) ประโยคหลักต้องคู่กับ would ไม่ใช่ will"}]'::jsonb, true
  ),
  (
    'b0000000-0000-4001-8000-000000000004', 'grammar-b2-passive-relative', 'Passive Voice & Defining/Non-Defining Relative Clauses', 'ประธานถูกกระทำ & ประโยคขยายความ (Relative Clauses)',
    'B2', 'การใช้ภาษาทางการในข้อสอบ B2 First (FCE): เน้นผู้ถูกกระทำ และการขยายคำนามอย่างมีชั้นเชิง', 'ในระดับ B2 การเขียนและการอ่านจะมีความเป็นทางการ (Formal) และซับซ้อนมากขึ้น:
1. **Passive Voice (ประธานถูกกระทำ)**:
   - โครงสร้าง: Subject + be + V.3
   - นิยมใช้ในรายงานข่าว บทความวิชาการ หรือเมื่อไม่ต้องการเน้นตัวผู้กระทำ
2. **Relative Clauses (ประโยคเชื่อมความ)**:
   - **Defining Clause**: ให้ข้อมูลชี้เฉพาะ ถ้าตัดออกจะสื่อความหมายไม่ครบ (ไม่ต้องใส่เครื่องหมายจุลภาค ,)
   - **Non-Defining Clause**: ให้ข้อมูลเสริม ถ้าตัดออกประโยคหลักก็ยังสมบูรณ์ (ต้องใส่เครื่องหมายจุลภาค , คั่นหน้าหลัง และห้ามใช้ that)', 'Passive Voice highlights the action/receiver rather than the agent. Relative clauses combine ideas smoothly using relative pronouns (who, which, that, where, whose).',
    '[{"formula":"Subject + is/are/was/were/been + V.3 (+ by agent)","explanationTh":"Passive Voice โครงสร้างพื้นฐาน","exampleEn":"The historic bridge was designed by a British engineer in 1895.","exampleTh":"สะพานประวัติศาสตร์แห่งนี้ถูกออกแบบโดยวิศวกรชาวอังกฤษในปี 1895"},{"formula":"Main Clause, [who/which + additional info], ...","explanationTh":"Non-defining relative clause ต้องมี comma และห้ามใช้ that","exampleEn":"Bangkok, which is the capital of Thailand, welcomes millions of tourists annually.","exampleTh":"กรุงเทพฯ ซึ่งเป็นเมืองหลวงของไทย ต้อนรับนักท่องเที่ยวหลายล้านคนต่อปี"}]'::jsonb, '[{"incorrect":"My car, that I bought last year, is very reliable.","correct":"My car, which I bought last year, is very reliable.","reasonTh":"ใน Non-defining clause (ที่มีเครื่องหมาย comma คั่น) ห้ามใช้ that ให้ใช้ which หรือ who เท่านั้น"},{"incorrect":"The report was wrote yesterday.","correct":"The report was written yesterday.","reasonTh":"Passive Voice ต้องใช้กริยาช่อง 3 (Past Participle: written) เสมอ ไม่ใช่ช่อง 2 (wrote)"}]'::jsonb, true
  ),
  (
    'b0000000-0000-4001-8000-000000000005', 'grammar-c1-inversion', 'Negative Inversion & Mixed Conditionals', 'การสลับประธานกริยาเพื่อเน้นย้ำ (Inversion) & เงื่อนไขข้ามกาลเวลา',
    'C1', 'ทักษะไวยากรณ์ระดับสูงสำหรับข้อสอบ C1 Advanced (CAE): สร้างประโยคที่ทรงพลังและแม่นยำทางวาทศิลป์', 'ในภาษาอังกฤษระดับ C1-C2 โครงสร้างไวยากรณ์จะช่วยเพิ่มพลังความหมายและความสละสลวย:
1. **Negative Inversion (การกลับประโยค)**:
   - เมื่อเรานำคำวิเศษณ์ที่มีความหมายเชิงปฏิเสธหรือจำกัดความ (เช่น Never, Rarely, Seldom, Hardly, Under no circumstances) มาขึ้นต้นประโยค จะต้อง "สลับกริยาช่วย (Auxiliary Verb) มาไว้หน้าประธาน" เหมือนประโยคคำถาม
   - เช่น Rarely have I seen such dedication. (ไม่บ่อยนักที่ฉันเคยเห็นความทุ่มเทเช่นนี้)
2. **Mixed Conditionals (เงื่อนไขผสม)**:
   - เหตุในอดีตส่งผลต่อปัจจุบัน: If + Past Perfect, would + V.inf
   - เช่น If I had accepted that job last year, I would live in London now. (ถ้าปีที่แล้วฉันตกลงรับงานนั้น ปัจจุบันฉันคงอาศัยอยู่ในลอนดอน)', 'Inversion places an auxiliary verb before the subject after negative or restrictive adverbs for emphasis. Mixed conditionals link a past hypothesis with a present consequence or vice versa.',
    '[{"formula":"Negative Word + Auxiliary Verb + Subject + Main Verb","explanationTh":"Inversion หลังคำปฏิเสธ (Never, Seldom, Not only, Hardly...when)","exampleEn":"Not only did they finish on time, but they also exceeded expectations.","exampleTh":"ไม่เพียงแต่พวกเขาจะส่งงานทันเวลาเท่านั้น แต่พวกเขายังทำได้เกินความคาดหวังอีกด้วย"},{"formula":"If + Past Perfect (Had + V.3), would + V.inf (Now)","explanationTh":"Mixed Conditional: อดีตไม่เกิดขึ้น ส่งผลให้ปัจจุบันเป็นอีกแบบหนึ่ง","exampleEn":"If he had taken the medicine yesterday, he would feel better today.","exampleTh":"ถ้าเมื่อวานเขาทานยา วันนี้เขาคงรู้สึกดีขึ้นแล้ว"}]'::jsonb, '[{"incorrect":"Seldom I have heard such an insightful lecture.","correct":"Seldom have I heard such an insightful lecture.","reasonTh":"เมื่อขึ้นต้นประโยคด้วย Seldom ต้องสลับกริยาช่วย have มาไว้หน้าประธาน I เสมอ"}]'::jsonb, true
  )
ON CONFLICT (slug) DO UPDATE SET
  title_en = EXCLUDED.title_en, title_th = EXCLUDED.title_th, cefr_level = EXCLUDED.cefr_level,
  summary_th = EXCLUDED.summary_th, concept_th = EXCLUDED.concept_th, concept_en = EXCLUDED.concept_en,
  rules = EXCLUDED.rules, common_mistakes = EXCLUDED.common_mistakes, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 4. Seed Reading Passages (3 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.reading_passages (
  id, title, cefr_level, target_exam, topic, content, word_count, vocabulary_glossary, is_active
)
VALUES
  (
    'c0000000-0000-4001-8000-000000000001', 'A Green Weekend in the Countryside', 'A2', 'KET',
    'Travel & Nature', 'Last month, my brother and I decided to take a short holiday away from the busy city. We chose a small organic farm in the valley of Chiang Rai. 

We traveled by bus early on Saturday morning. The journey took four hours, but the view of the green mountains through the window was breathtaking. When we arrived at the farm, the owners, Mr. and Mrs. Chai, welcomed us with fresh herbal tea and homemade bread.

In the afternoon, we helped feed the chickens and picked organic strawberries in the garden. In the evening, there was no television, so we sat around a wooden table, played board games, and listened to the sounds of nature. It was much quieter than our apartment in the city. We returned home on Sunday feeling rested and energized.', 165,
    '[{"word":"valley","meaningTh":"หุบเขา"},{"word":"breathtaking","meaningTh":"สวยจนแทบหยุดหายใจ, งดงามตระการตา"},{"word":"organic","meaningTh":"เกษตรอินทรีย์, ปลอดสารพิษ"},{"word":"energized","meaningTh":"มีพลัง, กระปรี้กระเปร่า"}]'::jsonb, true
  ),
  (
    'c0000000-0000-4001-8000-000000000002', 'The Rise of Urban Micro-Farming', 'B1', 'PET',
    'Environment & Technology', 'As metropolitan centers expand worldwide, access to fresh agricultural produce has become increasingly complex. Long transportation networks not only inflate the prices of vegetables but also generate substantial carbon emissions. In response, innovative residents are converting disused rooftops, balconies, and shipping containers into compact, highly productive micro-farms.

Unlike traditional agriculture, which depends on expansive soil acreage and predictable weather patterns, modern urban farming frequently utilizes hydroponic and aeroponic methods. These innovative setups circulate nutrient-enriched water directly to plant roots inside controlled environments. Consequently, crops can grow up to thirty percent faster while utilizing ninety percent less water than conventional outdoor fields.

Nevertheless, urban agriculture is not without significant hurdles. Initial setup expenses for LED lighting arrays and automated sensors remain high, which can deter casual beginners. In addition, high electricity tariffs in certain cities can undermine potential cost savings.

In spite of these economic barriers, city planners view micro-farming as an invaluable community asset. Beyond producing fresh organic food within walking distance of neighborhoods, these green spaces build social connections and educate younger generations on sustainable food systems.', 240,
    '[{"word":"metropolitan","meaningTh":"เกี่ยวกับเมืองใหญ่หรือมหานคร"},{"word":"hydroponic","meaningTh":"การปลูกพืชไร้ดินโดยใช้น้ำสารละลายธาตุอาหาร"},{"word":"conventional","meaningTh":"แบบดั้งเดิม, ตามแบบแผนปกติ"},{"word":"hurdles","meaningTh":"อุปสรรค, ขวากหนาม"},{"word":"tariffs","meaningTh":"อัตราค่าไฟฟ้า/ภาษีบริการ"}]'::jsonb, true
  ),
  (
    'c0000000-0000-4001-8000-000000000003', 'The Psychology of Digital Minimalism', 'B2', 'FCE',
    'Psychology & Technology', 'In an era characterized by hyper-connectivity, our attention spans have become the primary battleground of the global attention economy. Notification chimes, algorithmic feeds, and endless scrolling mechanisms are deliberately calibrated to trigger dopaminergic spikes, drawing users into persistent cycles of checking and reactivity. 

Dr. Cal Newport, a leading scholar on technological habits, advocates for what he terms "Digital Minimalism", a philosophy of technology use in which you focus your online time on a small number of carefully selected and optimized activities that strongly support things you value, and then happily miss out on everything else.

Critics frequently dismiss digital minimalism as an unrealistic retreat into digital asceticism, arguing that modern professionals cannot afford to sever communication channels without endangering career trajectories. However, empirical findings paint a markedly different picture. Practitioners who systematically declutter their digital lives report profound improvements in cognitive depth, sustained focus, and emotional equilibrium. Rather than abandoning modern tools, minimalists merely invert the power dynamic: tools serve explicit human intentions, rather than human consciousness serving algorithmic engagement metrics.

Implementing this philosophy demands rigorous intentionality. It begins with a thirty-day digital declutter period, during which non-essential technologies are temporarily suspended. When this reset concludes, tools are reintroduced only if they satisfy strict operational criteria: they must offer substantial positive benefit to one''s core personal values, and there must be a designated protocol governing when and how they are engaged. Ultimately, digital minimalism is not anti-technology; it is pro-autonomy.', 310,
    '[{"word":"calibrated","meaningTh":"ได้รับการปรับแต่งอย่างละเอียดและแม่นยำ"},{"word":"asceticism","meaningTh":"การสละกิเลส, การใช้ชีวิตอย่างเคร่งครัดสมถะ"},{"word":"trajectories","meaningTh":"เส้นทางความก้าวหน้า (เช่น ในอาชีพการงาน)"},{"word":"equilibrium","meaningTh":"ความสมดุล, ภาวะเสถียรภาพทางอารมณ์"},{"word":"pro-autonomy","meaningTh":"สนับสนุนการมีอิสระในการกำหนดตนเอง"}]'::jsonb, true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, cefr_level = EXCLUDED.cefr_level, target_exam = EXCLUDED.target_exam,
  topic = EXCLUDED.topic, content = EXCLUDED.content, word_count = EXCLUDED.word_count,
  vocabulary_glossary = EXCLUDED.vocabulary_glossary, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 5. Seed Listening Exercises (3 items - audio_storage_path NULL)
-- ------------------------------------------------------------------------------
INSERT INTO public.listening_exercises (
  id, title, cefr_level, target_exam, speaker_accents, audio_storage_path, audio_script, speed_options, is_active
)
VALUES
  (
    'd0000000-0000-4001-8000-000000000001', 'Airport Flight Announcement', 'A2', 'KET',
    'British English (Female Announcer)', NULL, 'Attention all passengers on flight TG 910 to London Heathrow. 
We regret to inform you that due to heavy fog over Europe, departure has been delayed by forty-five minutes. 
The revised boarding time is now ten fifteen at Gate B4. 
Passengers requiring special assistance or traveling with small infants are requested to approach the customer care desk at Gate B2. 
We sincerely apologize for any inconvenience caused to your journey today. Thank you for your patience.',
    '{0.75, 1, 1.25}'::numeric(3,2)[], true
  ),
  (
    'd0000000-0000-4001-8000-000000000002', 'Podcast: Sustainable Architecture for Beginners', 'B1', 'PET',
    'Neutral English (Host & Architect)', NULL, 'Host: Welcome back to EcoDesign Today. With us in the studio is Mark Reynolds, an eco-architect who renovates standard suburban homes into energy-neutral dwellings. Mark, what is the single biggest misconception homeowners hold about going green?

Mark: Well, Sarah, most people mistakenly believe that sustainability requires installing costly solar panels or high-tech underground heat pumps right on day one. In reality, the most cost-effective first step is simply sealing thermal leaks around windows and door frames and upgrading insulation in the roof. 

Host: Really? Just insulation?

Mark: Absolutely! A house that is thoroughly insulated retains up to forty percent more heat in winter and stays cooler during humid summer afternoons. If your building shell leaks heat, even the most expensive solar installation won''t save you money. Fix the leaks first, and consider renewable equipment later.',
    '{0.75, 1, 1.25}'::numeric(3,2)[], true
  ),
  (
    'd0000000-0000-4001-8000-000000000003', 'University Lecture: The Evolutionary Psychology of Cooperation', 'B2', 'FCE',
    'Academic English (Male Lecturer)', NULL, 'Good morning, everyone. In evolutionary biology, classical Darwinian competition suggests that selfish organisms prioritize individual survival and reproductive genetic propagation above all else. 
Yet when we observe human civilizations across ten thousand years of history, cooperative mutualism emerges as our defining evolutionary superpower. 

How did natural selection cultivate altruism when selfish freeloaders could theoretically exploit generosity without reciprocating? 
The mathematical resolution lies in what evolutionary biologists term ''Indirect Reciprocity''. In human tribes, an individual''s reputation acts as a universal social currency. 
When you assist a fellow member without expecting an immediate payoff, other observers witness your civic generosity. 
They subsequently reward you with heightened social trust, alliance opportunities, and communal protection during times of scarcity. 
In essence, human morality evolved as an ingenious reputation-management mechanism that made long-term cooperation far more biologically advantageous than transient deceit.',
    '{0.75, 1, 1.25}'::numeric(3,2)[], true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, cefr_level = EXCLUDED.cefr_level, target_exam = EXCLUDED.target_exam,
  speaker_accents = EXCLUDED.speaker_accents, audio_storage_path = EXCLUDED.audio_storage_path,
  audio_script = EXCLUDED.audio_script, speed_options = EXCLUDED.speed_options, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 6. Seed Writing Prompts (3 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.writing_prompts (
  id, title, cefr_level, target_exam, task_type, prompt_th, prompt_en, min_words, max_words,
  guidelines_th, useful_phrases, sample_model_answer, rubrics, is_active
)
VALUES
  (
    'e0000000-0000-4001-8000-000000000001', 'Informal Email: Planning a Weekend Visit', 'A2', 'KET',
    'Email', 'เขียนอีเมลสั้นๆ (ประมาณ 25-35 คำ) ถึง Alex เพื่อนชาวต่างชาติ เพื่อตอบรับคำชวนไปเที่ยวช่วงสุดสัปดาห์', 'Read this email from your English friend Alex:
"Hi! Would you like to come to my house this Saturday? We can watch a movie or cook dinner together. What time can you arrive?"
Write an email to Alex answering the questions. Write 25 words or more.',
    25, 45, '{"ตอบรับคำชวนด้วยความยินดี (เช่น I would love to come!)","บอกกิจกรรมที่อยากทำ (ดูหนัง หรือ ทำอาหาร)","ระบุเวลาที่คุณจะเดินทางไปถึงบ้านของ Alex","ใช้คำลงท้ายที่เหมาะสม เช่น See you soon, Best wishes"}'::text[],
    '[{"phrase":"Thanks for your invitation!","meaningTh":"ขอบคุณสำหรับคำเชิญนะ!"},{"phrase":"I would love to join you.","meaningTh":"ฉันยินดีและอยากไปร่วมด้วยมากๆ"},{"phrase":"I can arrive around 5 PM.","meaningTh":"ฉันน่าจะไปถึงประมาณ 5 โมงเย็น"},{"phrase":"See you on Saturday!","meaningTh":"เจอกันวันเสาร์นี้นะ!"}]'::jsonb, 'Hi Alex,
Thanks for the invitation! I would love to visit your house this Saturday. Cooking dinner together sounds fantastic. I can arrive at your place around five in the afternoon. See you soon!',
    '[{"criterion":"Content","descriptionTh":"ตอบครบทุกคำถาม: ยินดีไป + เลือกกิจกรรม + ระบุเวลาถึง","maxScore":5},{"criterion":"Organization","descriptionTh":"มีคำทักทายขึ้นต้น และคำลงท้ายที่ถูกต้อง","maxScore":5},{"criterion":"Language","descriptionTh":"ใช้ไวยากรณ์ Present/Future ง่ายๆ ถูกต้อง สะกดคำศัพท์แม่นยำ","maxScore":5}]'::jsonb, true
  ),
  (
    'e0000000-0000-4001-8000-000000000002', 'Magazine Article: A Hobby That Changed My Life', 'B1', 'PET',
    'Article', 'เขียนบทความลงนิตยสารโรงเรียน/วิทยาลัย (ประมาณ 100 คำ) หัวข้อเกี่ยวกับงานอดิเรกที่ชื่นชอบ', 'You see this announcement on an English-language student website:
"Articles wanted! What is your favorite hobby, and why did you start doing it? How has this activity helped you make new friends or learn new skills?"
Write your article in about 100 words.',
    90, 120, '{"ตั้งชื่อบทความให้น่าสนใจ (Catchy Title)","ย่อหน้า 1: แนะนำงานอดิเรกและบอกจุดเริ่มต้นว่าทำไมจึงสนใจ","ย่อหน้า 2: อธิบายทักษะที่ได้เรียนรู้และมิตรภาพที่เกิดขึ้น","ย่อหน้า 3: สรุปและให้คำแนะนำแก่ผู้อื่นที่สนใจเริ่มต้น","ใช้คำเชื่อม เช่น Although, In addition, Consequently, For instance"}'::text[],
    '[{"phrase":"I first discovered my passion for...","meaningTh":"ฉันค้นพบความหลงใหลใน...เป็นครั้งแรกเมื่อ..."},{"phrase":"Not only is it enjoyable, but it also...","meaningTh":"ไม่เพียงแต่สนุกเท่านั้น แต่ยังช่วย..."},{"phrase":"It has significantly broadened my horizon.","meaningTh":"มันช่วยเปิดโลกทัศน์ของฉันอย่างมาก"},{"phrase":"I wholeheartedly encourage anyone to...","meaningTh":"ฉันสนับสนุนอย่างยิ่งให้ทุกคนลอง..."}]'::jsonb, 'Why Photography Stole My Heart

Three years ago, I received an old digital camera for my birthday. What began as a casual pastime quickly developed into a genuine obsession. 

Photography taught me patience and mindfulness. Rather than rushing through daily life, I began noticing subtle details, golden morning sunlight filtering through trees or genuine smiles on commuters'' faces. In addition, joining a local photography club allowed me to connect with creative individuals from diverse generations. 

If you are looking for an inspiring hobby that stimulates both creativity and social bonding, picking up a camera is undoubtedly the ideal adventure!',
    '[{"criterion":"Content","descriptionTh":"ครอบคลุมครบ: ชื่องานอดิเรก + เหตุผลที่เริ่ม + ประโยชน์/มิตรภาพ","maxScore":5},{"criterion":"Communicative Achievement","descriptionTh":"น้ำเสียงเป็นมิตร ชวนติดตาม เหมาะกับผู้อ่านนิตยสาร","maxScore":5},{"criterion":"Organization","descriptionTh":"แบ่งย่อหน้าชัดเจน มีคำเชื่อมร้อยเรียงความคิดอย่างมีระบบ","maxScore":5},{"criterion":"Language","descriptionTh":"ใช้ศัพท์หลากหลาย เช่น casual pastime, mindfulness, diverse generations","maxScore":5}]'::jsonb, true
  ),
  (
    'e0000000-0000-4001-8000-000000000003', 'Opinion Essay: The Impact of Remote Work on Society', 'B2', 'FCE',
    'Essay', 'เขียนเรียงความเชิงวิชาการ (140-190 คำ) อภิปรายว่าการทำงานระยะไกลส่งผลดีหรือผลเสียต่อสังคมมากกว่ากัน', 'In your English class, you have been talking about modern employment trends. Now, your English teacher has asked you to write an essay.
"Has the transition toward remote work benefited employees and society overall?"
Notes:
Write about:
1. Work-life balance and flexibility
2. Social interaction and teamwork
3. (Your own idea, e.g., environmental impact or local economies)
Write 140-190 words in an appropriate academic style.',
    140, 190, '{"เขียนในสไตล์ที่เป็นทางการ (Formal Tone) หลีกเลี่ยงรูปย่อ เช่น don't, can't","ย่อหน้า 1: คำนำ (Introduction) เกริ่นนำประเด็นและแสดงข้อคิดเห็นทั่วไป","ย่อหน้า 2: อภิปรายข้อดีเรื่อง Work-life balance และความยืดหยุ่น","ย่อหน้า 3: วิเคราะห์ความท้าทายเรื่องปฏิสัมพันธ์ทางสังคมหรือผลกระทบต่อสิ่งแวดล้อม","ย่อหน้า 4: สรุป (Conclusion) สรุปจุดยืนอย่างชัดเจนและมีน้ำหนัก"}'::text[],
    '[{"phrase":"It is widely acknowledged that...","meaningTh":"เป็นที่ยอมรับอย่างกว้างขวางว่า..."},{"phrase":"On the one hand,... On the other hand,...","meaningTh":"ในแง่หนึ่ง... แต่อีกแง่หนึ่ง..."},{"phrase":"A compelling argument in favor of...","meaningTh":"ข้อสนับสนุนที่มีน้ำหนักประการหนึ่งคือ..."},{"phrase":"Taking all these factors into consideration,...","meaningTh":"เมื่อพิจารณาปัจจัยเหล่านี้ทั้งหมดแล้ว..."}]'::jsonb, 'The shift toward remote employment represents one of the most significant occupational developments of the twenty-first century. While telecommuting introduces notable collaboration dilemmas, its comprehensive benefits for individuals and the global environment remain compelling.

First and foremost, flexible schedules drastically improve work-life balance. By eliminating agonizing daily commutes, employees gain precious hours to dedicate to physical exercise, familial responsibilities, and restful sleep. Consequently, numerous studies indicate an increase in overall job satisfaction and mental well-being.

Nevertheless, critics reasonably point out that prolonged physical isolation can erode spontaneous team cohesion and professional mentoring. When interactions occur exclusively through digital monitors, building authentic workplace camaraderie proves challenging.

However, from an environmental standpoint, reduced transportation significantly mitigates urban traffic congestion and greenhouse gas emissions. 

Taking all these considerations into account, the advantages of remote work unequivocally outweigh its shortcomings, provided organizations implement structured hybrid policies that preserve vital interpersonal touchpoints.',
    '[{"criterion":"Content","descriptionTh":"ตอบครบ 3 ประเด็น: work-life balance + social cohesion + environmental impact","maxScore":5},{"criterion":"Communicative Achievement","descriptionTh":"ภาษาวิชาการเป็นทางการ ไม่มีรูปย่อ มีการวางเหตุและผล","maxScore":5},{"criterion":"Organization","descriptionTh":"มี 4 ย่อหน้าชัดเจน มีคำเชื่อมขั้นสูง เช่น Consequently, Nevertheless, Unequivocally","maxScore":5},{"criterion":"Language","descriptionTh":"คลังคำศัพท์ระดับ B2/C1 แม่นยำ เช่น significant developments, mitigate congestion","maxScore":5}]'::jsonb, true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, cefr_level = EXCLUDED.cefr_level, target_exam = EXCLUDED.target_exam,
  task_type = EXCLUDED.task_type, prompt_th = EXCLUDED.prompt_th, prompt_en = EXCLUDED.prompt_en,
  min_words = EXCLUDED.min_words, max_words = EXCLUDED.max_words, guidelines_th = EXCLUDED.guidelines_th,
  useful_phrases = EXCLUDED.useful_phrases, sample_model_answer = EXCLUDED.sample_model_answer,
  rubrics = EXCLUDED.rubrics, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 7. Seed Speaking Prompts (3 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.speaking_prompts (
  id, title, cefr_level, target_exam, part, prompt_th, prompt_en, guiding_questions_th, target_phrases, model_answer, is_active
)
VALUES
  (
    'f0000000-0000-4001-8000-000000000001', 'Part 1: Daily Routine & Hometown Interview', 'A2', 'KET',
    1, 'การตอบคำถามแนะนำตัว กิจวัตรประจำวัน และสถานที่ที่คุณอาศัยอยู่กับกรรมการสอบ', 'The examiner asks you personal questions about your daily routine, hometown, and leisure activities. Speak clearly and answer in complete sentences.',
    '{"What is your name and where do you come from? (บอกชื่อและเมืองที่คุณอาศัยอยู่)","What do you usually do on weekends? (เล่ากิจกรรมที่คุณทำในวันเสาร์-อาทิตย์)","Do you enjoy studying English? Why? (ชอบเรียนภาษาอังกฤษไหม เพราะอะไร)"}'::text[], '{"My name is... and I live in...","In my free time, I really enjoy...","Because it helps me communicate with people from around the world.","I usually spend time with my family and friends."}'::text[],
    'Hello! My name is Tanawat, and I come from Chiang Mai, a beautiful mountainous city in northern Thailand. 
On weekends, I usually like to wake up early, ride my bicycle around the neighborhood, and meet my friends at a local cafe. 
I really enjoy studying English because it opens up exciting opportunities to travel and converse with international tourists.', true
  ),
  (
    'f0000000-0000-4001-8000-000000000002', 'Part 2: Describing People in a Public Library', 'B1', 'PET',
    2, 'อธิบายภาพถ่ายสถานการณ์ในห้องสมุด (พูดเดี่ยวประมาณ 1 นาที) โดยระบุว่าเห็นใคร ทำอะไร ที่ไหน และบรรยากาศเป็นอย่างไร', 'Describe what you can see in a photograph depicting university students studying in a modern city library. Speak continuously for about one minute.',
    '{"In the foreground / background... (มีใครอยู่ตรงไหนในภาพบ้าง)","What are they doing? (พวกเขากำลังทำอะไร เช่น พิมพ์แล็ปท็อป อ่านหนังสือ จดโน้ต)","How does the environment feel? (บรรยากาศรอบๆ เช่น เงียบสงบ แสงธรรมชาติส่องสว่าง)","Speculate on their feelings (คาดเดาความรู้สึก เช่น ดูตั้งใจ หรือกำลังเตรียมสอบ)"}'::text[], '{"In the center of the picture, there are...","They appear to be preparing for an upcoming examination.","In the background, tall bookshelves are filled with...","The atmosphere looks calm, bright, and studious."}'::text[],
    'In this photograph, I can see three university students sitting around a spacious wooden table in a brightly lit library. 
In the foreground, a young woman with glasses is typing diligently on her laptop, while the young man sitting next to her is highlighting passages in a thick textbook. 
In the background, there are rows of tall bookshelves and large glass windows through which natural afternoon light floods the room. 
They appear to be working collaboratively on a group project, because one student is pointing at a diagram on her tablet. 
The overall atmosphere seems very quiet, focused, and scholarly.', true
  ),
  (
    'f0000000-0000-4001-8000-000000000003', 'Part 3: Promoting Environmental Awareness in Schools', 'B2', 'FCE',
    3, 'การสนทนาแลกเปลี่ยนความคิดเห็นกับคู่สอบ (Collaborative Discussion) เพื่อร่วมกันตัดสินใจเลือกวิธีที่ดีที่สุดในการรณรงค์เรื่องสิ่งแวดล้อม', 'Imagine your high school wants to inspire students to adopt greener habits. Discuss the merits and drawbacks of different campaign ideas, and then agree on which two approaches would be most effective.',
    '{"How would you initiate the discussion? (Shall we start with...?)","How do you invite your partner to speak? (What is your take on this?)","How do you politely disagree or build on an idea? (I see your point, but on the other hand...)","How do you negotiate a joint conclusion? (So, would you agree that our top two picks should be...?)"}'::text[], '{"Shall we begin by considering the idea of...","I completely see eye to eye with you on that, however...","Wouldn't you agree that practical hands-on workshops have a greater impact than mere lectures?","So, to summarize our consensus, we both feel that..."}'::text[],
    'Shall we start by looking at organizing community tree-planting days? 
In my view, getting students directly involved in hands-on activities creates a tangible emotional connection to nature far better than passive lectures. 
What do you think about that? 
I completely agree with your point about practical engagement. However, we should also consider introducing campus-wide recycling competitions. 
Friendly rivalry between classes can generate tremendous enthusiasm and turn waste separation into a daily routine. 
Therefore, if we have to select the two most impactful initiatives, tree planting and recycling challenges would definitely deliver the greatest long-term benefits.', true
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title, cefr_level = EXCLUDED.cefr_level, target_exam = EXCLUDED.target_exam,
  part = EXCLUDED.part, prompt_th = EXCLUDED.prompt_th, prompt_en = EXCLUDED.prompt_en,
  guiding_questions_th = EXCLUDED.guiding_questions_th, target_phrases = EXCLUDED.target_phrases,
  model_answer = EXCLUDED.model_answer, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 8. Seed Questions (33 items: 18 Diagnostic + 6 Grammar + 5 Reading + 4 Listening)
-- ------------------------------------------------------------------------------
INSERT INTO public.questions (
  id, skill, cefr_level, type, prompt_th, prompt_en, context_passage, audio_script,
  audio_storage_path, correct_answer_text, explanation_th, explanation_en,
  weakness_tag, difficulty_weight, grammar_topic_id, reading_passage_id,
  listening_exercise_id, metadata, is_active
)
VALUES
  (
    '10000000-0000-4001-8000-000000000001', 'grammar', 'A1', 'multiple_choice',
    'เลือกคำกริยาที่ถูกต้องสำหรับประธาน "She" (Present Simple)', 'Choose the correct verb form for "She" (Present Simple):',
    'Every morning, she _____ a cup of tea before work.', NULL, NULL,
    'drinks', 'ใน Present Simple Tense เมื่อประธานเป็นเอกพจน์บุรุษที่ 3 (He, She, It หรือชื่อคนคนเดียว) กริยาจะต้องเติม -s หรือ -es เสมอ เช่น She drinks tea.', 'In Present Simple, when the subject is third-person singular (He/She/It), add -s or -es to the base verb.',
    'present_simple_subject_verb_agreement', 1,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000002', 'vocabulary', 'A1', 'multiple_choice',
    'คำศัพท์ใดหมายถึง "แพทย์/หมอ"?', 'Which word means someone who treats sick people?',
    'When you are sick, you should see a _____.', NULL, NULL,
    'doctor', 'Doctor แปลว่า แพทย์ ทำหน้าที่รักษาผู้ป่วย เป็นคำศัพท์พื้นฐานระดับ A1 ในหมวดอาชีพ (Professions).', 'A doctor is a qualified practitioner of medicine who treats illness.',
    'basic_professions_vocabulary', 1,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000003', 'listening', 'A1', 'multiple_choice',
    'ฟังหรืออ่านบทสนทนา แล้วตอบว่ารถไฟจะออกเวลากี่โมง?', 'What time does the train depart?',
    NULL, 'Passenger: Excuse me, what time is the next train to London? Staff: It leaves at quarter past eight, platform 3.', NULL,
    '8:15', '"Quarter past" หมายถึง ผ่านมาแล้ว 15 นาที ดังนั้น "quarter past eight" จึงหมายถึง 8:15 น.', '"Quarter past eight" means 15 minutes after 8:00 (8:15).',
    'telling_time_and_numbers', 1,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000004', 'grammar', 'A2', 'multiple_choice',
    'เลือกคำบอกเวลาหรือคำเชื่อมที่ถูกต้องสำหรับ Past Simple', 'Choose the correct form to complete the past event:',
    'We _____ to Chiang Mai last December and visited several ancient temples.', NULL, NULL,
    'went', 'เมื่อมีคำบอกเวลาอดีตที่ชัดเจน เช่น "last December" ต้องใช้ Past Simple Tense (กริยาช่อง 2: went).', 'Specific past time expressions like "last December" require the Past Simple (went).',
    'past_simple_irregular_verbs', 2,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000005', 'reading', 'A2', 'multiple_choice',
    'อ่านป้ายประกาศนี้ แล้วตอบว่าป้ายนี้แจ้งอะไรแก่นักท่องเที่ยว?', 'Read the museum sign and answer what visitors must do:',
    '[MUSEUM NOTICE]
Photography is allowed in the sculpture gallery, but FLASH is strictly prohibited. Bags larger than 30cm must be left at the cloakroom.', NULL, NULL,
    'Visitors can take photos without flash and must store big bags.', 'ป้ายอนุญาตให้ถ่ายรูปได้ (Photography is allowed) แต่ห้ามใช้แฟลช (FLASH is strictly prohibited) และกระเป๋าขนาดใหญ่กว่า 30 ซม. ต้องฝากไว้ที่ห้องฝากของ.', 'Photos are permitted without flash, and large bags must be deposited in the cloakroom.',
    'reading_notices_and_rules', 2,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000006', 'vocabulary', 'A2', 'multiple_choice',
    'เลือกคำบุพบท (Preposition) ที่ถูกต้องสำหรับวันในสัปดาห์', 'Select the correct preposition for days of the week:',
    'The conference will take place _____ Friday afternoon.', NULL, NULL,
    'on', 'กฎการใช้บุพบทบอกเวลา: วันในสัปดาห์ (Friday, Monday) หรือวันที่เจาะจง ใช้ "on" เสมอ.', 'We use the preposition "on" for days of the week and specific dates.',
    'prepositions_of_time', 2,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000007', 'grammar', 'B1', 'multiple_choice',
    'เปรียบเทียบระหว่าง Past Simple กับ Present Perfect', 'Choose the sentence that correctly uses the Present Perfect:',
    'Sarah is an experienced engineer. She _____ at this technology firm for five years, and she still works here today.', NULL, NULL,
    'has worked', 'Present Perfect (has/have + V.3) ใช้กับเหตุการณ์ที่เริ่มต้นในอดีตและยังคงดำเนินอยู่จนถึงปัจจุบัน โดยมักใช้ร่วมกับ "for" หรือ "since".', 'Present Perfect is used for actions that began in the past and continue into the present.',
    'present_perfect_vs_past_simple', 3,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000008', 'grammar', 'B1', 'multiple_choice',
    'ประโยคเงื่อนไขแบบที่ 2 (Second Conditional) สำหรับสถานการณ์สมมติ', 'Select the correct verb forms for an imaginary situation (Second Conditional):',
    'If I _____ more free time, I _____ learn how to play the piano.', NULL, NULL,
    'had / would', 'Second Conditional ใช้สมมติสิ่งที่ไม่เป็นจริงในปัจจุบัน โครงสร้าง: If + Subject + V.2 (Past Simple), Subject + would + V.1 (Base Form).', 'The Second Conditional expresses hypothetical or unlikely situations: If + past simple, would + bare infinitive.',
    'second_conditional', 3,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000009', 'reading', 'B1', 'multiple_choice',
    'อ่านข้อความเกี่ยวกับการปรับตัวในที่ทำงาน แล้วหาข้อสรุปที่ถูกต้อง', 'Read the short excerpt on workplace adaptation and identify the main conclusion:',
    'Many employees find remote work initially convenient because it eliminates the daily commute. However, over several months, the lack of boundary between personal living space and job duties frequently leads to subtle fatigue. Establishing a dedicated workspace and adhering strictly to set working hours is essential to prevent burnout.', NULL, NULL,
    'Clear routines and designated physical zones help sustain long-term remote productivity.', 'ประเด็นหลักของข้อความคือการแนะนำให้พนักงานแยกพื้นที่ทำงาน (dedicated workspace) และรักษากรอบเวลา (set working hours) เพื่อไม่ให้เกิดภาวะหมดไฟในการทำงานระยะไกล.', 'The passage highlights the importance of setting boundaries and dedicated workspaces to avoid fatigue in remote work.',
    'identifying_main_ideas_and_solutions', 3,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000010', 'vocabulary', 'B2', 'multiple_choice',
    'เลือกคำศัพท์หรือ Collocation ระดับ B2 ที่สอดคล้องกับบริบททางธุรกิจ', 'Choose the most appropriate collocation for business and decision making:',
    'After analyzing the quarterly financial records, the board decided to _____ the new product launch until market volatility subsided.', NULL, NULL,
    'postpone', 'คำว่า "postpone" (เลื่อนออกไป) เข้ากับบริบทที่บอร์ดตัดสินใจเลื่อนการเปิดตัวสินค้าจนกว่าความผันผวนของตลาดจะลดลง (until market volatility subsided).', '"Postpone" means to delay an event or activity until a later time.',
    'formal_business_vocabulary', 4,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000011', 'grammar', 'B2', 'multiple_choice',
    'การแปลงประโยค Passive Voice ซับซ้อน (Impersonal Passive)', 'Select the grammatically correct passive reporting structure:',
    'The climate committee _____ that renewable energy costs will decline further over the next decade.', NULL, NULL,
    'is widely believed', 'Impersonal Passive เช่น "is widely believed / reported / estimated" นิยมใช้ในข้อสอบระดับ B2 เพื่อรายงานข้อเท็จจริงทางวิชาการโดยไม่เจาะจงตัวบุคคล.', 'Passive reporting verbs like "is widely believed that..." indicate shared opinions in formal contexts.',
    'passive_voice_reporting_verbs', 4,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000012', 'listening', 'B2', 'multiple_choice',
    'ฟังหรือวิเคราะห์คำพูดเพื่อจับเจตนาและน้ำเสียงของผู้พูด (Attitude & Tone)', 'Analyze the speaker''s tone and implicit perspective:',
    NULL, 'Speaker: "Well, the architect''s proposal is certainly bold and visually striking. Whether the city council actually has the fiscal reserves to sustain its maintenance over thirty years is another matter entirely."', NULL,
    'The speaker admires the aesthetic design but harbors doubts regarding long-term financial viability.', 'ผู้พูดชื่นชมความกล้าหาญและความโดดเด่นทางสายตา (bold and visually striking) แต่แสดงความคลางแคลงใจเรื่องงบประมาณในการดูแลรักษาในระยะ 30 ปีข้างหน้า.', 'The speaker contrasts the visual strengths of the proposal with practical budgetary skepticism.',
    'inferring_attitude_and_implicit_meaning', 4,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000013', 'grammar', 'C1', 'multiple_choice',
    'การสลับประธานและกริยาช่วย (Inversion) เมื่อขึ้นต้นประโยคด้วยคำที่มีความหมายเชิงปฏิเสธ', 'Select the correct inversion structure following a negative adverbial:',
    'Seldom _____ such an exquisite synthesis of empirical precision and artistic elegance.', NULL, NULL,
    'does one witness', 'กฎ Negative Inversion: เมื่อประโยคขึ้นต้นด้วยคำปฏิเสธหรือจำกัดความ เช่น Seldom, Rarely, Never, Scarcely จะต้องสลับกริยาช่วย (Auxiliary Verb) มาไว้หน้าประธานเสมอ เช่น Seldom does one witness...', 'Negative adverbs at the beginning of a sentence require inversion (auxiliary + subject + main verb).',
    'negative_inversion', 5,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000014', 'vocabulary', 'C1', 'multiple_choice',
    'เลือกคำศัพท์ระดับ C1 ที่มีความหมายตรงข้ามกับ "superficial" (ผิวเผิน)', 'Identify the word synonymous with thorough, deep, and intellectually rigorous:',
    'Far from providing a merely cursory overview, the scholar conducted a _____ investigation into the socio-economic causes of the reform.', NULL, NULL,
    'exhaustive', '"Exhaustive" หมายถึง อย่างละเอียดครอบคลุมทุกแง่มุม (thorough and comprehensive) ซึ่งตรงข้ามกับ "cursory" (ผิวเผิน/ลวกๆ) ในโจทย์.', '"Exhaustive" means examining, including, or considering all elements or aspects fully.',
    'advanced_academic_lexis', 5,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000015', 'reading', 'C1', 'multiple_choice',
    'วิเคราะห์โครงสร้างความหมายระดับจุลภาคและความเชื่อมโยงตรรกะในข้อเขียนทางวิชาการ', 'Evaluate the rhetorical transition and logical coherence:',
    'Technological determinism posits that media infrastructure unilaterally sculpts human cognitive patterns. _____, recent ethnographic studies suggest that local communities routinely repurpose digital tools in ways completely unanticipated by their silicon architects, demonstrating active human agency.', NULL, NULL,
    'Notwithstanding this premise', '"Notwithstanding this premise" ทำหน้าที่เป็นคำเชื่อมระดับสูงที่แสดงการโต้แย้งอย่างเป็นทางการ (qualifying concession) เหมาะสมกับการหักล้างทฤษฎี Technological determinism.', '"Notwithstanding this premise" acts as a formal concessive marker contrasting theoretical claims with empirical counter-evidence.',
    'advanced_discourse_markers', 5,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000016', 'vocabulary', 'C2', 'multiple_choice',
    'เลือกสำนวนภาษาอังกฤษระดับสูง (Idiomatic Nuance) ที่สื่อถึงการกระทำโดยไม่ทันระวังตัวหรือไม่คาดคิด', 'Choose the sophisticated idiom meaning to catch someone completely unprepared:',
    'The aggressive regulatory audit caught the compliance department completely _____, exposing vulnerabilities that had lain dormant for decades.', NULL, NULL,
    'on the hop', 'สำนวน "catch someone on the hop" (ระดับ C2) หมายถึง เล่นงานหรือตรวจพบในจังหวะที่อีกฝ่ายไม่ทันตั้งตัวหรือไม่พร้อม.', '"To catch someone on the hop" is a British idiom meaning to surprise someone because they are not prepared.',
    'idiomatic_nuance_and_phrasal_depth', 5,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000017', 'grammar', 'C2', 'multiple_choice',
    'การใช้ Subjunctive Mood และประโยคเงื่อนไขขั้นสูงที่ละ If', 'Identify the grammatically impeccable inverted conditional expressing remote past contingency:',
    '_____ for the timely intervention of the maritime rescue authorities, the vessel would undoubtedly have foundered in the hurricane.', NULL, NULL,
    'Had it not been', '"Had it not been for..." เป็นโครงสร้าง Inversion ของ Third Conditional ที่สละสลวย ใช้แทน "If it had not been for..." เมื่อพูดถึงเหตุการณ์ในอดีตที่ส่งผลกระทบต่อเนื่อง.', '"Had it not been for..." is an inverted third conditional construction indicating that without a past event, another consequence would have occurred.',
    'inverted_third_conditionals_subjunctive', 5,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '10000000-0000-4001-8000-000000000018', 'reading', 'C2', 'multiple_choice',
    'การอ่านวิเคราะห์ความลึกซึ้งของการใช้สำนวนโวหารและเจตนาซ่อนเร้นในวรรณกรรม/บทความปรัชญา', 'Infer the subtle satirical subtext in the author''s commentary on modern bureaucracy:',
    '"The institutional apparatus excelled in the manufacture of procedural inertia: every urgent query was met not with rejection, but with an invitation to join a sub-committee specifically consecrated to contemplating the feasibility of drafting a preliminary agenda."', NULL, NULL,
    'The author satirizes how institutional processes disguise systemic procrastination as productive deliberation.', 'ผู้เขียนใช้โวหารประชดประชัน (satirical subtext) บรรยายถึง "procedural inertia" (ความเฉื่อยชาตามขั้นตอน) ที่แปลงการผัดผ่อนให้ดูมีแบบแผนโดยการตั้งคณะอนุกรรมการขึ้นมาพิจารณาความเป็นไปได้ในการร่างวาระการประชุม.', 'The passage satirizes institutional procrastination masked as methodical bureaucratic diligence.',
    'literary_satire_and_philosophical_subtext', 5,
    NULL, NULL, NULL, '{}'::jsonb, true
  ),
  (
    '20000000-0000-4001-8000-000000000001', 'grammar', 'A1', 'multiple_choice',
    'เลือกรูปกริยาที่ถูกต้องสำหรับเหตุการณ์ที่กำลังเกิดขึ้นขณะพูด (Listen!)', 'Listen! Someone _____ the guitar in the next room.',
    NULL, NULL, NULL,
    'is playing', 'คำว่า "Listen!" (ฟังดูสิ!) เป็นสัญญาณเตือนว่าเหตุการณ์กำลังเกิดขึ้นในขณะนั้น จึงต้องใช้ Present Continuous (is playing).', 'Imperatives like "Listen!" signal an action occurring at the present moment, requiring the Present Continuous.',
    'present_simple_vs_continuous', 1,
    'b0000000-0000-4001-8000-000000000001', NULL, NULL, '{}'::jsonb, true
  ),
  (
    '20000000-0000-4001-8000-000000000002', 'grammar', 'A1', 'multiple_choice',
    'เลือกคำที่ถูกต้อง: กิจวัตรของดวงอาทิตย์ (ความจริงทางวิทยาศาสตร์)', 'The sun _____ in the east and sets in the west.',
    NULL, NULL, NULL,
    'rises', 'ปรากฏการณ์ธรรมชาติหรือข้อเท็จจริงสากล ถือเป็น Universal Truth ต้องใช้ Present Simple กริยาเอกพจน์เติม s (rises).', 'Universal scientific facts take the Present Simple (rises).',
    'present_simple_general_truth', 1,
    'b0000000-0000-4001-8000-000000000001', NULL, NULL, '{}'::jsonb, true
  ),
  (
    '20000000-0000-4001-8000-000000000003', 'grammar', 'A2', 'multiple_choice',
    'เลือกรูปกริยาที่แสดงถึงประสบการณ์ (ถามว่าเคยไปญี่ปุ่นหรือไม่)', '_____ you ever _____ to Japan?',
    NULL, NULL, NULL,
    'Have / been', 'เมื่อถามถึงประสบการณ์ตลอดชีวิตว่า "เคย...หรือไม่" จะใช้ Present Perfect: "Have you ever been to...?"', 'Present Perfect with "ever" is used to inquire about life experiences without referencing a specific time.',
    'present_perfect_experience', 2,
    'b0000000-0000-4001-8000-000000000002', NULL, NULL, '{}'::jsonb, true
  ),
  (
    '20000000-0000-4001-8000-000000000004', 'grammar', 'B1', 'multiple_choice',
    'เลือกคำตอบที่ถูกต้องสำหรับ First Conditional (ระวังเรื่อง will หลัง If)', 'If the client _____ the contract today, we _____ work immediately.',
    NULL, NULL, NULL,
    'signs / will start', 'First Conditional: ประโยคหลัง If ต้องใช้ Present Simple (The client signs) และประโยคผลลัพธ์ใช้ will + base verb (will start).', 'First conditional formula: If + present simple, will + bare infinitive.',
    'first_conditional_rules', 3,
    'b0000000-0000-4001-8000-000000000003', NULL, NULL, '{}'::jsonb, true
  ),
  (
    '20000000-0000-4001-8000-000000000005', 'grammar', 'B2', 'multiple_choice',
    'เลือกประโยค Relative Clause ที่ถูกต้องตามหลักไวยากรณ์ (สังเกต comma)', 'Professor Davies, _____ lectures on neurobiology are acclaimed worldwide, will retire this semester.',
    NULL, NULL, NULL,
    'whose', '"whose" เป็น relative pronoun ที่ทำหน้าที่แสดงความเป็นเจ้าของคำนามที่ตามหลัง (whose lectures = การบรรยายของเขา).', '"whose" indicates possession relating back to the antecedent noun (Professor Davies).',
    'relative_pronoun_possession', 4,
    'b0000000-0000-4001-8000-000000000004', NULL, NULL, '{}'::jsonb, true
  ),
  (
    '20000000-0000-4001-8000-000000000006', 'grammar', 'C1', 'multiple_choice',
    'เลือกโครงสร้าง Inversion ที่ถูกต้องเมื่อขึ้นต้นประโยคด้วย "Under no circumstances"', 'Under no circumstances _____ allowed to access the server room without authorization.',
    NULL, NULL, NULL,
    'are visitors', 'วลีปฏิเสธอย่างเข้มงวด "Under no circumstances" บังคับให้เกิด Inversion คือ สลับ verb to be หรือ auxiliary verb มาไว้หน้าประธาน.', 'Restricting phrases like "Under no circumstances" trigger subject-auxiliary inversion.',
    'negative_inversion_modal_auxiliary', 5,
    'b0000000-0000-4001-8000-000000000005', NULL, NULL, '{}'::jsonb, true
  ),
  (
    '30000000-0000-4001-8000-000000000001', 'reading', 'A2', 'multiple_choice',
    'ผู้เขียนและพี่ชายเดินทางไปยังฟาร์มด้วยยานพาหนะใด?', 'How did the writer and their brother travel to the farm?',
    NULL, NULL, NULL,
    'By public bus', 'บทความระบุชัดเจนในบรรทัดแรกของย่อหน้าที่สอง: "We traveled by bus early on Saturday morning."', 'Paragraph 2 explicitly states: "We traveled by bus early on Saturday morning."',
    'locating_factual_details', 2,
    NULL, 'c0000000-0000-4001-8000-000000000001', NULL, '{}'::jsonb, true
  ),
  (
    '30000000-0000-4001-8000-000000000002', 'reading', 'A2', 'multiple_choice',
    'พวกเขาทำกิจกรรมใดในช่วงบ่ายที่ฟาร์ม?', 'What activity did they do in the afternoon?',
    NULL, NULL, NULL,
    'They fed animals and gathered strawberries.', 'ในย่อหน้าที่ 3 ระบุว่า "In the afternoon, we helped feed the chickens and picked organic strawberries in the garden."', 'The text mentions feeding chickens and picking strawberries in the afternoon.',
    'chronological_activity_tracking', 2,
    NULL, 'c0000000-0000-4001-8000-000000000001', NULL, '{}'::jsonb, true
  ),
  (
    '30000000-0000-4001-8000-000000000003', 'reading', 'B1', 'multiple_choice',
    'ข้อดีประการสำคัญของระบบไฮโดรโปนิกส์ที่ระบุในบทความคืออะไร?', 'What is highlighted as a primary operational benefit of hydroponic farming?',
    NULL, NULL, NULL,
    'It accelerates crop growth while conserving substantial amounts of water.', 'ย่อหน้าที่ 2 ระบุว่า: "crops can grow up to thirty percent faster while utilizing ninety percent less water than conventional outdoor fields."', 'Paragraph 2 highlights 30% faster growth and 90% water reduction.',
    'comparative_data_comprehension', 3,
    NULL, 'c0000000-0000-4001-8000-000000000002', NULL, '{}'::jsonb, true
  ),
  (
    '30000000-0000-4001-8000-000000000004', 'reading', 'B1', 'multiple_choice',
    'อะไรคืออุปสรรคสำคัญที่อาจทำให้ผู้เริ่มต้นลังเลที่จะทำฟาร์มในเมือง?', 'What challenge is mentioned that might discourage beginner urban farmers?',
    NULL, NULL, NULL,
    'High upfront costs for equipment and elevated electricity tariffs.', 'ย่อหน้าที่ 3 ระบุถึง "Initial setup expenses for LED lighting arrays and automated sensors remain high" และ "high electricity tariffs".', 'Paragraph 3 details high upfront costs and energy bills as discouraging factors.',
    'identifying_obstacles_and_challenges', 3,
    NULL, 'c0000000-0000-4001-8000-000000000002', NULL, '{}'::jsonb, true
  ),
  (
    '30000000-0000-4001-8000-000000000005', 'reading', 'B2', 'multiple_choice',
    'แก่นแท้ของแนวคิด "Digital Minimalism" ตามที่บทความอธิบายคืออะไร?', 'According to the passage, what is the core philosophy of Digital Minimalism?',
    NULL, NULL, NULL,
    'Selectively using only digital tools that actively support core values while consciously ignoring the rest.', 'ย่อหน้าที่ 2 นิยามชัดเจน: "focus your online time on a small number of carefully selected and optimized activities that strongly support things you value, and then happily miss out on everything else."', 'Digital minimalism prioritizes high-value, carefully chosen activities over constant connectivity.',
    'inferring_core_thematic_philosophy', 4,
    NULL, 'c0000000-0000-4001-8000-000000000003', NULL, '{}'::jsonb, true
  ),
  (
    '40000000-0000-4001-8000-000000000001', 'listening', 'A2', 'multiple_choice',
    'สาเหตุที่เที่ยวบินล่าช้าคืออะไร?', 'What is the reason for the flight delay?',
    NULL, NULL, NULL,
    'Adverse weather conditions (heavy fog)', 'ผู้ประกาศแจ้งชัดเจนว่า: "due to heavy fog over Europe" (เนื่องจากหมอกหนาจัดทั่วยุโรป).', 'The announcement states the delay is "due to heavy fog over Europe".',
    'identifying_cause_in_announcements', 2,
    NULL, NULL, 'd0000000-0000-4001-8000-000000000001', '{}'::jsonb, true
  ),
  (
    '40000000-0000-4001-8000-000000000002', 'listening', 'A2', 'multiple_choice',
    'เวลาขึ้นเครื่องใหม่ (Revised boarding time) คือเวลาใด และที่ประตูใด?', 'What is the revised boarding time and gate number?',
    NULL, NULL, NULL,
    '10:15 at Gate B4', 'ข้อความในประกาศระบุว่า: "The revised boarding time is now ten fifteen at Gate B4."', 'The revised boarding time is ten fifteen (10:15) at Gate B4.',
    'listening_for_times_and_numbers', 2,
    NULL, NULL, 'd0000000-0000-4001-8000-000000000001', '{}'::jsonb, true
  ),
  (
    '40000000-0000-4001-8000-000000000003', 'listening', 'B1', 'multiple_choice',
    'ความเข้าใจผิดที่พบบ่อยที่สุดของเจ้าของบ้านตามที่สถาปนิกกล่าวคืออะไร?', 'According to Mark, what is the primary misconception homeowners have?',
    NULL, NULL, NULL,
    'That going green immediately requires expensive high-tech gear like solar panels.', 'มาร์กอธิบายว่า: "most people mistakenly believe that sustainability requires installing costly solar panels or high-tech underground heat pumps right on day one."', 'Mark explains the misconception that green homes immediately require expensive renewable hardware.',
    'identifying_misconceptions_and_opinions', 3,
    NULL, NULL, 'd0000000-0000-4001-8000-000000000002', '{}'::jsonb, true
  ),
  (
    '40000000-0000-4001-8000-000000000004', 'listening', 'B2', 'multiple_choice',
    'กลไกใดที่ช่วยให้การช่วยเหลือผู้อื่น (Altruism) มีความได้เปรียบทางวิวัฒนาการตามการบรรยาย?', 'According to the lecturer, how did indirect reciprocity make cooperation biologically advantageous?',
    NULL, NULL, NULL,
    'By allowing generosity to build public reputation and social trust that yields future communal support.', 'ผู้บรรยายอธิบายว่า "Indirect Reciprocity" ทำให้การช่วยเหลือผู้อื่นสร้างชื่อเสียง (social currency) ซึ่งทำให้ผู้สังเกตการณ์มอบความไว้วางใจและการปกป้องช่วยเหลือในอนาคต.', 'Indirect reciprocity enables cooperative acts to build social reputation, conferring survival advantages during scarcity.',
    'comprehending_complex_theoretical_arguments', 4,
    NULL, NULL, 'd0000000-0000-4001-8000-000000000003', '{}'::jsonb, true
  )
ON CONFLICT (id) DO UPDATE SET
  skill = EXCLUDED.skill, cefr_level = EXCLUDED.cefr_level, type = EXCLUDED.type,
  prompt_th = EXCLUDED.prompt_th, prompt_en = EXCLUDED.prompt_en, context_passage = EXCLUDED.context_passage,
  audio_script = EXCLUDED.audio_script, audio_storage_path = EXCLUDED.audio_storage_path,
  correct_answer_text = EXCLUDED.correct_answer_text, explanation_th = EXCLUDED.explanation_th,
  explanation_en = EXCLUDED.explanation_en, weakness_tag = EXCLUDED.weakness_tag,
  difficulty_weight = EXCLUDED.difficulty_weight, grammar_topic_id = EXCLUDED.grammar_topic_id,
  reading_passage_id = EXCLUDED.reading_passage_id, listening_exercise_id = EXCLUDED.listening_exercise_id,
  metadata = EXCLUDED.metadata, is_active = EXCLUDED.is_active;

-- ------------------------------------------------------------------------------
-- 9. Seed Question Options (132 items)
-- ------------------------------------------------------------------------------
INSERT INTO public.question_options (id, question_id, key, text, is_correct, feedback_th)
VALUES
  ('00000000-0000-4020-8000-000000000001', '10000000-0000-4001-8000-000000000001', 'A', 'drink', false, 'drink ใช้กับ I, You, We, They'),
  ('00000000-0000-4020-8000-000000000002', '10000000-0000-4001-8000-000000000001', 'B', 'drinks', true, 'ถูกต้อง! ประธานเอกพจน์บุรุษที่ 3 (He, She, It) กริยาต้องเติม -s หรือ -es'),
  ('00000000-0000-4020-8000-000000000003', '10000000-0000-4001-8000-000000000001', 'C', 'drinking', false, 'drinking ต้องมี verb to be นำหน้า (is drinking)'),
  ('00000000-0000-4020-8000-000000000004', '10000000-0000-4001-8000-000000000001', 'D', 'drank', false, 'drank เป็นกริยาช่อง 2 (Past Simple) แต่อันนี้เป็นกิจวัตรประจำวัน'),
  ('00000000-0000-4020-8000-000000000005', '10000000-0000-4001-8000-000000000002', 'A', 'teacher', false, 'teacher แปลว่า ครูอาจารย์'),
  ('00000000-0000-4020-8000-000000000006', '10000000-0000-4001-8000-000000000002', 'B', 'doctor', true, 'ถูกต้อง! doctor หมายถึง แพทย์ หรือ หมอ'),
  ('00000000-0000-4020-8000-000000000007', '10000000-0000-4001-8000-000000000002', 'C', 'driver', false, 'driver แปลว่า คนขับรถ'),
  ('00000000-0000-4020-8000-000000000008', '10000000-0000-4001-8000-000000000002', 'D', 'cook', false, 'cook แปลว่า พ่อครัว/คนทำอาหาร'),
  ('00000000-0000-4020-8000-000000000009', '10000000-0000-4001-8000-000000000003', 'A', '7:45', false, '7:45 คือ quarter to eight'),
  ('00000000-0000-4020-8000-000000000010', '10000000-0000-4001-8000-000000000003', 'B', '8:15', true, 'ถูกต้อง! "quarter past eight" หมายถึง 8 โมง 15 นาที'),
  ('00000000-0000-4020-8000-000000000011', '10000000-0000-4001-8000-000000000003', 'C', '8:30', false, '8:30 คือ half past eight'),
  ('00000000-0000-4020-8000-000000000012', '10000000-0000-4001-8000-000000000003', 'D', '8:45', false, '8:45 คือ quarter to nine'),
  ('00000000-0000-4020-8000-000000000013', '10000000-0000-4001-8000-000000000004', 'A', 'go', false, 'go เป็นรูปปัจจุบัน (ช่อง 1)'),
  ('00000000-0000-4020-8000-000000000014', '10000000-0000-4001-8000-000000000004', 'B', 'went', true, 'ถูกต้อง! went เป็นกริยาช่อง 2 ของ go ใช้เล่าเรื่องที่จบแล้วในอดีต (last December)'),
  ('00000000-0000-4020-8000-000000000015', '10000000-0000-4001-8000-000000000004', 'C', 'have gone', false, 'have gone เป็น Present Perfect ไม่นิยมใช้ระบุเวลาที่สิ้นสุดไปแล้วอย่างเจาะจง'),
  ('00000000-0000-4020-8000-000000000016', '10000000-0000-4001-8000-000000000004', 'D', 'was going', false, 'was going ใช้กับเหตุการณ์ที่กำลังดำเนินอยู่ในอดีต'),
  ('00000000-0000-4020-8000-000000000017', '10000000-0000-4001-8000-000000000005', 'A', 'Visitors cannot take any photos at all.', false, 'ถ่ายรูปได้ (Photography is allowed) แต่ห้ามเปิดแฟลช'),
  ('00000000-0000-4020-8000-000000000018', '10000000-0000-4001-8000-000000000005', 'B', 'Visitors can take photos without flash and must store big bags.', true, 'ถูกต้อง! ถ่ายรูปได้โดยไม่ใช้แฟลช และกระเป๋าใหญ่ต้องฝากไว้'),
  ('00000000-0000-4020-8000-000000000019', '10000000-0000-4001-8000-000000000005', 'C', 'Visitors must pay extra to bring small bags inside.', false, 'ไม่ได้กล่าวถึงการเก็บเงินค่ากระเป๋าเล็ก'),
  ('00000000-0000-4020-8000-000000000020', '10000000-0000-4001-8000-000000000005', 'D', 'The sculpture gallery is closed today.', false, 'แกลเลอรีไม่ได้ปิด'),
  ('00000000-0000-4020-8000-000000000021', '10000000-0000-4001-8000-000000000006', 'A', 'in', false, 'in ใช้กับเดือน ปี หรือฤดูกาล เช่น in July, in 2026'),
  ('00000000-0000-4020-8000-000000000022', '10000000-0000-4001-8000-000000000006', 'B', 'on', true, 'ถูกต้อง! วันในสัปดาห์และวันที่เจาะจงต้องใช้ "on"'),
  ('00000000-0000-4020-8000-000000000023', '10000000-0000-4001-8000-000000000006', 'C', 'at', false, 'at ใช้กับเวลาที่ระบุนาฬิกา เช่น at 3 PM'),
  ('00000000-0000-4020-8000-000000000024', '10000000-0000-4001-8000-000000000006', 'D', 'by', false, 'by หมายถึง ภายในเวลา...'),
  ('00000000-0000-4020-8000-000000000025', '10000000-0000-4001-8000-000000000007', 'A', 'worked', false, 'worked เป็น Past Simple แปลว่าปัจจุบันไม่ได้ทำงานที่นี่แล้ว'),
  ('00000000-0000-4020-8000-000000000026', '10000000-0000-4001-8000-000000000007', 'B', 'has worked', true, 'ถูกต้อง! เหตุการณ์เริ่มต้นในอดีตและยังดำเนินต่อมาถึงปัจจุบัน (for five years + still works here)'),
  ('00000000-0000-4020-8000-000000000027', '10000000-0000-4001-8000-000000000007', 'C', 'had worked', false, 'had worked เป็น Past Perfect ต้องใช้คู่กับอีกเหตุการณ์หนึ่งในอดีต'),
  ('00000000-0000-4020-8000-000000000028', '10000000-0000-4001-8000-000000000007', 'D', 'works', false, 'ขาดมิติของการเชื่อมโยงระยะเวลา 5 ปีจากอดีตถึงปัจจุบัน'),
  ('00000000-0000-4020-8000-000000000029', '10000000-0000-4001-8000-000000000008', 'A', 'have / will', false, 'นี่คือ First Conditional (เหตุการณ์ที่เป็นไปได้จริง)'),
  ('00000000-0000-4020-8000-000000000030', '10000000-0000-4001-8000-000000000008', 'B', 'had / would', true, 'ถูกต้อง! โครงสร้าง Second Conditional คือ If + Past Simple, would + V.inf'),
  ('00000000-0000-4020-8000-000000000031', '10000000-0000-4001-8000-000000000008', 'C', 'had / will', false, 'จับคู่ Tense ไม่ถูกต้อง (had ไม่คู่กับ will)'),
  ('00000000-0000-4020-8000-000000000032', '10000000-0000-4001-8000-000000000008', 'D', 'would have / did', false, 'โครงสร้างสลับตำแหน่งกริยาช่วย'),
  ('00000000-0000-4020-8000-000000000033', '10000000-0000-4001-8000-000000000009', 'A', 'Remote work should be banned because everyone suffers from burnout.', false, 'บทความไม่ได้บอกให้ยกเลิก แค่เตือนให้ระวังความเหนื่อยล้า'),
  ('00000000-0000-4020-8000-000000000034', '10000000-0000-4001-8000-000000000009', 'B', 'Clear routines and designated physical zones help sustain long-term remote productivity.', true, 'ถูกต้อง! การกำหนดเวลาทำงานที่ชัดเจนและแยกพื้นที่ทำงานช่วยป้องกันภาวะหมดไฟได้'),
  ('00000000-0000-4020-8000-000000000035', '10000000-0000-4001-8000-000000000009', 'C', 'Commuting to an office is proven to be healthier than staying at home.', false, 'บทความไม่ได้เปรียบเทียบสุขภาพจากการเดินทาง'),
  ('00000000-0000-4020-8000-000000000036', '10000000-0000-4001-8000-000000000009', 'D', 'Employees work faster when they do not take breaks.', false, 'ตรงข้ามกับสาระสำคัญของบทความ'),
  ('00000000-0000-4020-8000-000000000037', '10000000-0000-4001-8000-000000000010', 'A', 'postpone', true, 'ถูกต้อง! postpone แปลว่า เลื่อนออกไปอย่างเป็นทางการ'),
  ('00000000-0000-4020-8000-000000000038', '10000000-0000-4001-8000-000000000010', 'B', 'cancel out', false, 'cancel out หมายถึง หักล้างผลกัน'),
  ('00000000-0000-4020-8000-000000000039', '10000000-0000-4001-8000-000000000010', 'C', 'give up', false, 'give up หมายถึง ยอมแพ้หรือล้มเลิกโดยสิ้นเชิง'),
  ('00000000-0000-4020-8000-000000000040', '10000000-0000-4001-8000-000000000010', 'D', 'run down', false, 'run down หมายถึง วิ่งชน หรือวิพากษ์วิจารณ์'),
  ('00000000-0000-4020-8000-000000000041', '10000000-0000-4001-8000-000000000011', 'A', 'is widely believed', true, 'ถูกต้อง! "It is widely believed that..." หรือ Subject + is believed to...'),
  ('00000000-0000-4020-8000-000000000042', '10000000-0000-4001-8000-000000000011', 'B', 'widely believes', false, ' committee ในที่นี้ต้องใช้รูป Passive หรือถ้า Active ต้องมีกรรมรองรับที่สมบูรณ์'),
  ('00000000-0000-4020-8000-000000000043', '10000000-0000-4001-8000-000000000011', 'C', 'is been believed', false, 'ไวยากรณ์ผิดรูป (is been ไม่มีในภาษาอังกฤษ)'),
  ('00000000-0000-4020-8000-000000000044', '10000000-0000-4001-8000-000000000011', 'D', 'has widely believing', false, 'has + V.ing เป็นรูปที่ผิดหลัก'),
  ('00000000-0000-4020-8000-000000000045', '10000000-0000-4001-8000-000000000012', 'A', 'The speaker wholeheartedly endorses the architect''s plan without reservation.', false, 'ผู้พูดไม่ได้เห็นชอบทั้งหมด'),
  ('00000000-0000-4020-8000-000000000046', '10000000-0000-4001-8000-000000000012', 'B', 'The speaker admires the aesthetic design but harbors doubts regarding long-term financial viability.', true, 'ถูกต้อง! ชมว่า bold and visually striking แต่ตั้งคำถามเรื่องงบประมาณระยะยาว (fiscal reserves)'),
  ('00000000-0000-4020-8000-000000000047', '10000000-0000-4001-8000-000000000012', 'C', 'The speaker believes the city council will reject the design immediately due to ugliness.', false, 'ผู้พูดชมว่าสวยสะดุดตา ไม่ได้บอกว่าน่าเกลียด'),
  ('00000000-0000-4020-8000-000000000048', '10000000-0000-4001-8000-000000000012', 'D', 'The speaker is indifferent to both aesthetics and financial concerns.', false, 'ผู้พูดมีความเห็นชัดเจน ไม่ได้วางเฉย'),
  ('00000000-0000-4020-8000-000000000049', '10000000-0000-4001-8000-000000000013', 'A', 'one witnesses', false, 'เมื่อขึ้นต้นด้วย Seldom ต้องสลับกริยาช่วยมาหน้าประธาน'),
  ('00000000-0000-4020-8000-000000000050', '10000000-0000-4001-8000-000000000013', 'B', 'does one witness', true, 'ถูกต้อง! Inversion: Seldom + auxiliary (does) + subject (one) + base verb (witness)'),
  ('00000000-0000-4020-8000-000000000051', '10000000-0000-4001-8000-000000000013', 'C', 'witnessed one', false, 'ในภาษาอังกฤษปัจจุบันต้องใช้กริยาช่วย do/does/did ไม่ย้าย main verb มาหน้าประธานโดยตรง'),
  ('00000000-0000-4020-8000-000000000052', '10000000-0000-4001-8000-000000000013', 'D', 'one has witnessed', false, 'ขาดโครงสร้าง Inversion'),
  ('00000000-0000-4020-8000-000000000053', '10000000-0000-4001-8000-000000000014', 'A', 'exhaustive', true, 'ถูกต้อง! exhaustive แปลว่า ละเอียดถี่ถ้วน ครบถ้วนทุกแง่มุม'),
  ('00000000-0000-4020-8000-000000000054', '10000000-0000-4001-8000-000000000014', 'B', 'fleeting', false, 'fleeting แปลว่า ชั่วคราว หรือผ่านไปอย่างรวดเร็ว'),
  ('00000000-0000-4020-8000-000000000055', '10000000-0000-4001-8000-000000000014', 'C', 'monotonous', false, 'monotonous แปลว่า ซ้ำซากจำเจ น่าเบื่อ'),
  ('00000000-0000-4020-8000-000000000056', '10000000-0000-4001-8000-000000000014', 'D', 'provisional', false, 'provisional แปลว่า ชั่วคราว หรือมีเงื่อนไข'),
  ('00000000-0000-4020-8000-000000000057', '10000000-0000-4001-8000-000000000015', 'A', 'Besides this', false, 'Besides this ใช้เสริมความคล้อยตาม ไม่ได้ใช้ขัดแย้ง'),
  ('00000000-0000-4020-8000-000000000058', '10000000-0000-4001-8000-000000000015', 'B', 'Notwithstanding this premise', true, 'ถูกต้อง! "Notwithstanding this premise" (แม้จะมีสมมติฐานดังกล่าวก็ตาม) เชื่อมโยงความขัดแย้งระหว่างทฤษฎีกับผลการศึกษาจริงได้อย่างสละสลวย'),
  ('00000000-0000-4020-8000-000000000059', '10000000-0000-4001-8000-000000000015', 'C', 'In a similar vein', false, 'In a similar vein หมายถึง ในทำนองเดียวกัน (แสดงความคล้อยตาม)'),
  ('00000000-0000-4020-8000-000000000060', '10000000-0000-4001-8000-000000000015', 'D', 'Consequently', false, 'Consequently แสดงผลลัพธ์ แต่ประโยคหลังเป็นข้อโต้แย้ง'),
  ('00000000-0000-4020-8000-000000000061', '10000000-0000-4001-8000-000000000016', 'A', 'on the hop', true, 'ถูกต้อง! "catch someone on the hop" เป็นสำนวนระดับ C2 แปลว่า ทำให้ประหลาดใจหรือไม่ทันตั้งตัว'),
  ('00000000-0000-4020-8000-000000000062', '10000000-0000-4001-8000-000000000016', 'B', 'in the clear', false, 'in the clear แปลว่า พ้นข้อกล่าวหา/พ้นอันตราย'),
  ('00000000-0000-4020-8000-000000000063', '10000000-0000-4001-8000-000000000016', 'C', 'at a premium', false, 'at a premium แปลว่า หายากและมีมูลค่าสูง'),
  ('00000000-0000-4020-8000-000000000064', '10000000-0000-4001-8000-000000000016', 'D', 'under the weather', false, 'under the weather เป็นสำนวนระดับพื้นฐานแปลว่า รู้สึกไม่สบาย'),
  ('00000000-0000-4020-8000-000000000065', '10000000-0000-4001-8000-000000000017', 'A', 'Had it not been', true, 'ถูกต้อง! Had it not been for... เป็นรูปละ If ของ If it had not been for... (Third Conditional Inversion)'),
  ('00000000-0000-4020-8000-000000000066', '10000000-0000-4001-8000-000000000017', 'B', 'Were it not', false, 'Were it not for... ใช้กับปัจจุบัน (Second Conditional) แต่เหตุการณ์นี้เป็นอดีต (would have foundered)'),
  ('00000000-0000-4020-8000-000000000067', '10000000-0000-4001-8000-000000000017', 'C', 'Should it be', false, 'Should it be ใช้กับอนาคตหรือความเป็นไปได้ในปัจจุบัน'),
  ('00000000-0000-4020-8000-000000000068', '10000000-0000-4001-8000-000000000017', 'D', 'If had it not been', false, 'ห้ามใส่ If ซ้ำซ้อนกับ Had ที่สลับตำแหน่งมาแล้ว'),
  ('00000000-0000-4020-8000-000000000069', '10000000-0000-4001-8000-000000000018', 'A', 'The organization is lauded for its democratic decision-making and comprehensive consultation.', false, 'ผู้เขียนไม่ได้ชื่นชม แต่กำลังประชดประชันความล่าช้า'),
  ('00000000-0000-4020-8000-000000000070', '10000000-0000-4001-8000-000000000018', 'B', 'The author satirizes how institutional processes disguise systemic procrastination as productive deliberation.', true, 'ถูกต้อง! ผู้เขียนเสียดสีว่ากระบวนการตั้งคณะทำงานย่อยเป็นเพียงเครื่องบังหน้าในการผัดวันประกันพรุ่ง (procedural inertia)'),
  ('00000000-0000-4020-8000-000000000071', '10000000-0000-4001-8000-000000000018', 'C', 'The author recommends dissolving all sub-committees immediately.', false, 'บทความวิจารณ์เชิงปรัชญา ไม่ได้ระบุข้อเสนอแนะโดยตรง'),
  ('00000000-0000-4020-8000-000000000072', '10000000-0000-4001-8000-000000000018', 'D', 'The system has proven highly effective at producing fast executive resolutions.', false, 'ตรงข้ามกับความหมายโดยสิ้นเชิง'),
  ('00000000-0000-4020-8000-000000000073', '20000000-0000-4001-8000-000000000001', 'A', 'plays', false, 'plays แสดงถึงการเล่นเป็นประจำ แต่มีคำว่า Listen! กำลังเกิดขึ้นตอนนี้'),
  ('00000000-0000-4020-8000-000000000074', '20000000-0000-4001-8000-000000000001', 'B', 'is playing', true, 'ถูกต้อง! มีคำเตือน "Listen!" แปลว่ากำลังเกิดขึ้นตรงหน้า จึงใช้ is/am/are + V.ing'),
  ('00000000-0000-4020-8000-000000000075', '20000000-0000-4001-8000-000000000001', 'C', 'played', false, 'played เป็นอดีต'),
  ('00000000-0000-4020-8000-000000000076', '20000000-0000-4001-8000-000000000001', 'D', 'play', false, 'play ผิดทั้ง Tense และ Subject-Verb Agreement'),
  ('00000000-0000-4020-8000-000000000077', '20000000-0000-4001-8000-000000000002', 'A', 'rises', true, 'ถูกต้อง! ความจริงตามธรรมชาติ (Scientific Fact) ต้องใช้ Present Simple ประธาน The sun เอกพจน์เติม -s'),
  ('00000000-0000-4020-8000-000000000078', '20000000-0000-4001-8000-000000000002', 'B', 'is rising', false, 'is rising หมายถึงกำลังขึ้น ณ ตอนนี้เท่านั้น แต่พระอาทิตย์ขึ้นทิศตะวันออกเป็นความจริงถาวร'),
  ('00000000-0000-4020-8000-000000000079', '20000000-0000-4001-8000-000000000002', 'C', 'rose', false, 'rose เป็นอดีต'),
  ('00000000-0000-4020-8000-000000000080', '20000000-0000-4001-8000-000000000002', 'D', 'risen', false, 'risen เป็นกริยาช่อง 3 ไม่สามารถอยู่เดี่ยวๆ เป็นกริยาแท้ได้'),
  ('00000000-0000-4020-8000-000000000081', '20000000-0000-4001-8000-000000000003', 'A', 'Did / go', false, 'Did you go ถามถึงช่วงเวลาเฉพาะเจาะจงในอดีต ไม่ได้ถามประสบการณ์ตลอดชีวิต'),
  ('00000000-0000-4020-8000-000000000082', '20000000-0000-4001-8000-000000000003', 'B', 'Have / been', true, 'ถูกต้อง! Have you ever been to... เป็นรูปมาตรฐานในการถามว่าเคยไปที่ไหนหรือไม่'),
  ('00000000-0000-4020-8000-000000000083', '20000000-0000-4001-8000-000000000003', 'C', 'Do / go', false, 'Do you go ถามถึงกิจวัตร'),
  ('00000000-0000-4020-8000-000000000084', '20000000-0000-4001-8000-000000000003', 'D', 'Were / being', false, 'ผิดโครงสร้างไวยากรณ์'),
  ('00000000-0000-4020-8000-000000000085', '20000000-0000-4001-8000-000000000004', 'A', 'will sign / start', false, 'หลัง If ห้ามใช้ will'),
  ('00000000-0000-4020-8000-000000000086', '20000000-0000-4001-8000-000000000004', 'B', 'signs / will start', true, 'ถูกต้อง! โครงสร้าง If + Present Simple (signs), will + V.inf (will start)'),
  ('00000000-0000-4020-8000-000000000087', '20000000-0000-4001-8000-000000000004', 'C', 'signed / will start', false, 'Tense ไม่สอดคล้องกัน (signed เป็นอดีตแต่ใช้ will)'),
  ('00000000-0000-4020-8000-000000000088', '20000000-0000-4001-8000-000000000004', 'D', 'signs / would start', false, 'Present Simple ต้องคู่กับ will ไม่ใช่ would'),
  ('00000000-0000-4020-8000-000000000089', '20000000-0000-4001-8000-000000000005', 'A', 'who', false, 'who ใช้แทนประธาน แต่ในที่นี้ต้องการแสดงความเป็นเจ้าของ lectures'),
  ('00000000-0000-4020-8000-000000000090', '20000000-0000-4001-8000-000000000005', 'B', 'whose', true, 'ถูกต้อง! whose แสดงความเป็นเจ้าของ (การบรรยายของศาสตราจารย์เดวิส)'),
  ('00000000-0000-4020-8000-000000000091', '20000000-0000-4001-8000-000000000005', 'C', 'that', false, 'ห้ามใช้ that ใน non-defining clause ที่มี comma'),
  ('00000000-0000-4020-8000-000000000092', '20000000-0000-4001-8000-000000000005', 'D', 'whom', false, 'whom ทำหน้าที่เป็นกรรมของบุคคล'),
  ('00000000-0000-4020-8000-000000000093', '20000000-0000-4001-8000-000000000006', 'A', 'visitors are', false, 'ขาดการสลับประธานกริยาช่วย'),
  ('00000000-0000-4020-8000-000000000094', '20000000-0000-4001-8000-000000000006', 'B', 'are visitors', true, 'ถูกต้อง! Inversion: Under no circumstances + are (auxiliary) + visitors (subject)'),
  ('00000000-0000-4020-8000-000000000095', '20000000-0000-4001-8000-000000000006', 'C', 'visitors were being', false, 'ไม่ได้ทำ Inversion'),
  ('00000000-0000-4020-8000-000000000096', '20000000-0000-4001-8000-000000000006', 'D', 'have visitors', false, 'have visitors allowed กลายเป็นรูป Active ที่ผิดความหมาย'),
  ('00000000-0000-4020-8000-000000000097', '30000000-0000-4001-8000-000000000001', 'A', 'By private car', false, 'ในบทความระบุว่า traveled by bus'),
  ('00000000-0000-4020-8000-000000000098', '30000000-0000-4001-8000-000000000001', 'B', 'By public bus', true, 'ถูกต้อง! ในย่อหน้าที่ 2 ระบุว่า "We traveled by bus early on Saturday morning."'),
  ('00000000-0000-4020-8000-000000000099', '30000000-0000-4001-8000-000000000001', 'C', 'By train', false, 'ไม่ได้เดินทางด้วยรถไฟ'),
  ('00000000-0000-4020-8000-000000000100', '30000000-0000-4001-8000-000000000001', 'D', 'By airplane', false, 'ไม่ได้เดินทางด้วยเครื่องบิน'),
  ('00000000-0000-4020-8000-000000000101', '30000000-0000-4001-8000-000000000002', 'A', 'They watched a film about farming.', false, 'ในฟาร์มไม่มีโทรทัศน์'),
  ('00000000-0000-4020-8000-000000000102', '30000000-0000-4001-8000-000000000002', 'B', 'They fed animals and gathered strawberries.', true, 'ถูกต้อง! "helped feed the chickens and picked organic strawberries"'),
  ('00000000-0000-4020-8000-000000000103', '30000000-0000-4001-8000-000000000002', 'C', 'They repaired the farm fence.', false, 'ไม่ได้ซ่อมรั้ว'),
  ('00000000-0000-4020-8000-000000000104', '30000000-0000-4001-8000-000000000002', 'D', 'They baked bread with the owners.', false, 'เจ้าของบ้านเสิร์ฟขนมปังที่ทำไว้แล้ว'),
  ('00000000-0000-4020-8000-000000000105', '30000000-0000-4001-8000-000000000003', 'A', 'It completely eliminates the need for electricity.', false, 'บทความระบุว่าต้องใช้ไฟฟ้าและไฟ LED'),
  ('00000000-0000-4020-8000-000000000106', '30000000-0000-4001-8000-000000000003', 'B', 'It accelerates crop growth while conserving substantial amounts of water.', true, 'ถูกต้อง! โตเร็วขึ้น 30% และใช้น้ำน้อยลงถึง 90%'),
  ('00000000-0000-4020-8000-000000000107', '30000000-0000-4001-8000-000000000003', 'C', 'It works best in open countryside soil.', false, 'นี่คือระบบไร้ดินในเมือง'),
  ('00000000-0000-4020-8000-000000000108', '30000000-0000-4001-8000-000000000003', 'D', 'It requires zero initial capital investment.', false, 'ต้นทุนเริ่มต้นยังสูง (Initial setup expenses remain high)'),
  ('00000000-0000-4020-8000-000000000109', '30000000-0000-4001-8000-000000000004', 'A', 'The complete absence of community interest.', false, 'ชุมชนให้ความสนใจดี'),
  ('00000000-0000-4020-8000-000000000110', '30000000-0000-4001-8000-000000000004', 'B', 'High upfront costs for equipment and elevated electricity tariffs.', true, 'ถูกต้อง! ค่าอุปกรณ์เริ่มต้นและค่าไฟทำให้ผู้เริ่มต้นลังเล'),
  ('00000000-0000-4020-8000-000000000111', '30000000-0000-4001-8000-000000000004', 'C', 'Stringent government bans on rooftop greenery.', false, 'ไม่ได้ถูกรัฐบาลสั่งห้าม'),
  ('00000000-0000-4020-8000-000000000112', '30000000-0000-4001-8000-000000000004', 'D', 'The inferior taste of hydroponically grown greens.', false, 'ไม่มีการกล่าวว่ารสชาติด้อยกว่า'),
  ('00000000-0000-4020-8000-000000000113', '30000000-0000-4001-8000-000000000005', 'A', 'Completely rejecting all digital devices and returning to analog lifestyles.', false, 'บทความระบุว่าไม่ใช่การปฏิเสธเทคโนโลยี'),
  ('00000000-0000-4020-8000-000000000114', '30000000-0000-4001-8000-000000000005', 'B', 'Selectively using only digital tools that actively support core values while consciously ignoring the rest.', true, 'ถูกต้อง! เลือกใช้เฉพาะเครื่องมือที่สนับสนุนคุณค่าสำคัญอย่างแท้จริง และยินดีปล่อยผ่านสิ่งอื่น'),
  ('00000000-0000-4020-8000-000000000115', '30000000-0000-4001-8000-000000000005', 'C', 'Checking notifications only during scheduled weekend intervals.', false, 'นี่เป็นเพียงรายละเอียดปลีกย่อย ไม่ใช่แก่นปรัชญา'),
  ('00000000-0000-4020-8000-000000000116', '30000000-0000-4001-8000-000000000005', 'D', 'Switching exclusively to open-source software platforms.', false, 'ไม่ได้กล่าวถึงประเภทของซอฟต์แวร์'),
  ('00000000-0000-4020-8000-000000000117', '40000000-0000-4001-8000-000000000001', 'A', 'Mechanical difficulties on the aircraft', false, 'ไม่ได้เกิดจากปัญหาเครื่องยนต์'),
  ('00000000-0000-4020-8000-000000000118', '40000000-0000-4001-8000-000000000001', 'B', 'Adverse weather conditions (heavy fog)', true, 'ถูกต้อง! ในประกาศระบุว่า "due to heavy fog over Europe"'),
  ('00000000-0000-4020-8000-000000000119', '40000000-0000-4001-8000-000000000001', 'C', 'A missing cabin crew member', false, 'ไม่ได้กล่าวถึงลูกเรือ'),
  ('00000000-0000-4020-8000-000000000120', '40000000-0000-4001-8000-000000000001', 'D', 'Airport terminal maintenance', false, 'ไม่ได้กล่าวถึงการซ่อมบำรุงอาคาร'),
  ('00000000-0000-4020-8000-000000000121', '40000000-0000-4001-8000-000000000002', 'A', '09:30 at Gate B4', false, 'ไม่ใช่ 9:30'),
  ('00000000-0000-4020-8000-000000000122', '40000000-0000-4001-8000-000000000002', 'B', '10:15 at Gate B4', true, 'ถูกต้อง! ประกาศระบุว่า "ten fifteen at Gate B4"'),
  ('00000000-0000-4020-8000-000000000123', '40000000-0000-4001-8000-000000000002', 'C', '10:45 at Gate B2', false, 'Gate B2 เป็นโต๊ะให้ความช่วยเหลือพิเศษ'),
  ('00000000-0000-4020-8000-000000000124', '40000000-0000-4001-8000-000000000002', 'D', '11:15 at Gate A1', false, 'ข้อมูลเวลาและประตูไม่ถูกต้อง'),
  ('00000000-0000-4020-8000-000000000125', '40000000-0000-4001-8000-000000000003', 'A', 'That green buildings cannot withstand harsh winter storms.', false, 'ไม่ได้กล่าวถึงความทนทานต่อพายุ'),
  ('00000000-0000-4020-8000-000000000126', '40000000-0000-4001-8000-000000000003', 'B', 'That going green immediately requires expensive high-tech gear like solar panels.', true, 'ถูกต้อง! คนส่วนใหญ่เข้าใจผิดว่าต้องเริ่มจากการติดโซลาร์เซลล์ราคาแพงทันที'),
  ('00000000-0000-4020-8000-000000000127', '40000000-0000-4001-8000-000000000003', 'C', 'That insulation has no effect on room temperature.', false, 'มาร์กชี้ว่าฉนวนกันความร้อนมีผลสำคัญมาก'),
  ('00000000-0000-4020-8000-000000000128', '40000000-0000-4001-8000-000000000003', 'D', 'That architects charge too much for thermal audits.', false, 'ไม่ได้พูดถึงค่าบริการของสถาปนิก'),
  ('00000000-0000-4020-8000-000000000129', '40000000-0000-4001-8000-000000000004', 'A', 'By genetically eliminating selfish individuals from early tribal populations.', false, 'ไม่ได้กำจัดทางพันธุกรรมโดยตรง'),
  ('00000000-0000-4020-8000-000000000130', '40000000-0000-4001-8000-000000000004', 'B', 'By allowing generosity to build public reputation and social trust that yields future communal support.', true, 'ถูกต้อง! การช่วยเหลือสร้างชื่อเสียง (Reputation) และความไว้ใจ ทำให้ได้รับการช่วยเหลือกลับคืนในยามขาดแคลน'),
  ('00000000-0000-4020-8000-000000000131', '40000000-0000-4001-8000-000000000004', 'C', 'By requiring monetary deposits before tribe members engaged in trade.', false, 'ยุคดึกดำบรรพ์ยังไม่มีระบบเงินตรา'),
  ('00000000-0000-4020-8000-000000000132', '40000000-0000-4001-8000-000000000004', 'D', 'By forcing all individuals to live in isolated family clusters.', false, 'ขัดแย้งกับการอยู่ร่วมกันเป็นเผ่า')
ON CONFLICT (question_id, key) DO UPDATE SET
  text = EXCLUDED.text,
  is_correct = EXCLUDED.is_correct,
  feedback_th = EXCLUDED.feedback_th;
