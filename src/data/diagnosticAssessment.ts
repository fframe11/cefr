import { Question, CEFRLevel, CambridgeExamCode, UserSkillStats } from '../types';

export const DIAGNOSTIC_QUESTIONS: Question[] = [
  // A1 Level Questions
  {
    id: 'diag-a1-1',
    skill: 'grammar',
    cefrLevel: 'A1',
    type: 'multiple_choice',
    promptTh: 'เลือกคำกริยาที่ถูกต้องสำหรับประธาน "She" (Present Simple)',
    promptEn: 'Choose the correct verb form for "She" (Present Simple):',
    contextPassage: 'Every morning, she _____ a cup of tea before work.',
    options: [
      { key: 'A', text: 'drink', isCorrect: false, feedbackTh: 'drink ใช้กับ I, You, We, They' },
      { key: 'B', text: 'drinks', isCorrect: true, feedbackTh: 'ถูกต้อง! ประธานเอกพจน์บุรุษที่ 3 (He, She, It) กริยาต้องเติม -s หรือ -es' },
      { key: 'C', text: 'drinking', isCorrect: false, feedbackTh: 'drinking ต้องมี verb to be นำหน้า (is drinking)' },
      { key: 'D', text: 'drank', isCorrect: false, feedbackTh: 'drank เป็นกริยาช่อง 2 (Past Simple) แต่อันนี้เป็นกิจวัตรประจำวัน' },
    ],
    explanationTh: 'ใน Present Simple Tense เมื่อประธานเป็นเอกพจน์บุรุษที่ 3 (He, She, It หรือชื่อคนคนเดียว) กริยาจะต้องเติม -s หรือ -es เสมอ เช่น She drinks tea.',
    explanationEn: 'In Present Simple, when the subject is third-person singular (He/She/It), add -s or -es to the base verb.',
    weaknessTag: 'present_simple_subject_verb_agreement',
    difficultyWeight: 1,
  },
  {
    id: 'diag-a1-2',
    skill: 'vocabulary',
    cefrLevel: 'A1',
    type: 'multiple_choice',
    promptTh: 'คำศัพท์ใดหมายถึง "แพทย์/หมอ"?',
    promptEn: 'Which word means someone who treats sick people?',
    contextPassage: 'When you are sick, you should see a _____.',
    options: [
      { key: 'A', text: 'teacher', isCorrect: false, feedbackTh: 'teacher แปลว่า ครูอาจารย์' },
      { key: 'B', text: 'doctor', isCorrect: true, feedbackTh: 'ถูกต้อง! doctor หมายถึง แพทย์ หรือ หมอ' },
      { key: 'C', text: 'driver', isCorrect: false, feedbackTh: 'driver แปลว่า คนขับรถ' },
      { key: 'D', text: 'cook', isCorrect: false, feedbackTh: 'cook แปลว่า พ่อครัว/คนทำอาหาร' },
    ],
    explanationTh: 'Doctor แปลว่า แพทย์ ทำหน้าที่รักษาผู้ป่วย เป็นคำศัพท์พื้นฐานระดับ A1 ในหมวดอาชีพ (Professions).',
    explanationEn: 'A doctor is a qualified practitioner of medicine who treats illness.',
    weaknessTag: 'basic_professions_vocabulary',
    difficultyWeight: 1,
  },
  {
    id: 'diag-a1-3',
    skill: 'listening',
    cefrLevel: 'A1',
    type: 'multiple_choice',
    promptTh: 'ฟังหรืออ่านบทสนทนา แล้วตอบว่ารถไฟจะออกเวลากี่โมง?',
    promptEn: 'What time does the train depart?',
    audioScript: 'Passenger: Excuse me, what time is the next train to London? Staff: It leaves at quarter past eight, platform 3.',
    options: [
      { key: 'A', text: '7:45', isCorrect: false, feedbackTh: '7:45 คือ quarter to eight' },
      { key: 'B', text: '8:15', isCorrect: true, feedbackTh: 'ถูกต้อง! "quarter past eight" หมายถึง 8 โมง 15 นาที' },
      { key: 'C', text: '8:30', isCorrect: false, feedbackTh: '8:30 คือ half past eight' },
      { key: 'D', text: '8:45', isCorrect: false, feedbackTh: '8:45 คือ quarter to nine' },
    ],
    explanationTh: '"Quarter past" หมายถึง ผ่านมาแล้ว 15 นาที ดังนั้น "quarter past eight" จึงหมายถึง 8:15 น.',
    explanationEn: '"Quarter past eight" means 15 minutes after 8:00 (8:15).',
    weaknessTag: 'telling_time_and_numbers',
    difficultyWeight: 1,
  },

  // A2 Level Questions
  {
    id: 'diag-a2-1',
    skill: 'grammar',
    cefrLevel: 'A2',
    type: 'multiple_choice',
    promptTh: 'เลือกคำบอกเวลาหรือคำเชื่อมที่ถูกต้องสำหรับ Past Simple',
    promptEn: 'Choose the correct form to complete the past event:',
    contextPassage: 'We _____ to Chiang Mai last December and visited several ancient temples.',
    options: [
      { key: 'A', text: 'go', isCorrect: false, feedbackTh: 'go เป็นรูปปัจจุบัน (ช่อง 1)' },
      { key: 'B', text: 'went', isCorrect: true, feedbackTh: 'ถูกต้อง! went เป็นกริยาช่อง 2 ของ go ใช้เล่าเรื่องที่จบแล้วในอดีต (last December)' },
      { key: 'C', text: 'have gone', isCorrect: false, feedbackTh: 'have gone เป็น Present Perfect ไม่นิยมใช้ระบุเวลาที่สิ้นสุดไปแล้วอย่างเจาะจง' },
      { key: 'D', text: 'was going', isCorrect: false, feedbackTh: 'was going ใช้กับเหตุการณ์ที่กำลังดำเนินอยู่ในอดีต' },
    ],
    explanationTh: 'เมื่อมีคำบอกเวลาอดีตที่ชัดเจน เช่น "last December" ต้องใช้ Past Simple Tense (กริยาช่อง 2: went).',
    explanationEn: 'Specific past time expressions like "last December" require the Past Simple (went).',
    weaknessTag: 'past_simple_irregular_verbs',
    difficultyWeight: 2,
  },
  {
    id: 'diag-a2-2',
    skill: 'reading',
    cefrLevel: 'A2',
    type: 'multiple_choice',
    promptTh: 'อ่านป้ายประกาศนี้ แล้วตอบว่าป้ายนี้แจ้งอะไรแก่นักท่องเที่ยว?',
    promptEn: 'Read the museum sign and answer what visitors must do:',
    contextPassage: '[MUSEUM NOTICE]\nPhotography is allowed in the sculpture gallery, but FLASH is strictly prohibited. Bags larger than 30cm must be left at the cloakroom.',
    options: [
      { key: 'A', text: 'Visitors cannot take any photos at all.', isCorrect: false, feedbackTh: 'ถ่ายรูปได้ (Photography is allowed) แต่ห้ามเปิดแฟลช' },
      { key: 'B', text: 'Visitors can take photos without flash and must store big bags.', isCorrect: true, feedbackTh: 'ถูกต้อง! ถ่ายรูปได้โดยไม่ใช้แฟลช และกระเป๋าใหญ่ต้องฝากไว้' },
      { key: 'C', text: 'Visitors must pay extra to bring small bags inside.', isCorrect: false, feedbackTh: 'ไม่ได้กล่าวถึงการเก็บเงินค่ากระเป๋าเล็ก' },
      { key: 'D', text: 'The sculpture gallery is closed today.', isCorrect: false, feedbackTh: 'แกลเลอรีไม่ได้ปิด' },
    ],
    explanationTh: 'ป้ายอนุญาตให้ถ่ายรูปได้ (Photography is allowed) แต่ห้ามใช้แฟลช (FLASH is strictly prohibited) และกระเป๋าขนาดใหญ่กว่า 30 ซม. ต้องฝากไว้ที่ห้องฝากของ.',
    explanationEn: 'Photos are permitted without flash, and large bags must be deposited in the cloakroom.',
    weaknessTag: 'reading_notices_and_rules',
    difficultyWeight: 2,
  },
  {
    id: 'diag-a2-3',
    skill: 'vocabulary',
    cefrLevel: 'A2',
    type: 'multiple_choice',
    promptTh: 'เลือกคำบุพบท (Preposition) ที่ถูกต้องสำหรับวันในสัปดาห์',
    promptEn: 'Select the correct preposition for days of the week:',
    contextPassage: 'The conference will take place _____ Friday afternoon.',
    options: [
      { key: 'A', text: 'in', isCorrect: false, feedbackTh: 'in ใช้กับเดือน ปี หรือฤดูกาล เช่น in July, in 2026' },
      { key: 'B', text: 'on', isCorrect: true, feedbackTh: 'ถูกต้อง! วันในสัปดาห์และวันที่เจาะจงต้องใช้ "on"' },
      { key: 'C', text: 'at', isCorrect: false, feedbackTh: 'at ใช้กับเวลาที่ระบุนาฬิกา เช่น at 3 PM' },
      { key: 'D', text: 'by', isCorrect: false, feedbackTh: 'by หมายถึง ภายในเวลา...' },
    ],
    explanationTh: 'กฎการใช้บุพบทบอกเวลา: วันในสัปดาห์ (Friday, Monday) หรือวันที่เจาะจง ใช้ "on" เสมอ.',
    explanationEn: 'We use the preposition "on" for days of the week and specific dates.',
    weaknessTag: 'prepositions_of_time',
    difficultyWeight: 2,
  },

  // B1 Level Questions (Cambridge PET level)
  {
    id: 'diag-b1-1',
    skill: 'grammar',
    cefrLevel: 'B1',
    type: 'multiple_choice',
    promptTh: 'เปรียบเทียบระหว่าง Past Simple กับ Present Perfect',
    promptEn: 'Choose the sentence that correctly uses the Present Perfect:',
    contextPassage: 'Sarah is an experienced engineer. She _____ at this technology firm for five years, and she still works here today.',
    options: [
      { key: 'A', text: 'worked', isCorrect: false, feedbackTh: 'worked เป็น Past Simple แปลว่าปัจจุบันไม่ได้ทำงานที่นี่แล้ว' },
      { key: 'B', text: 'has worked', isCorrect: true, feedbackTh: 'ถูกต้อง! เหตุการณ์เริ่มต้นในอดีตและยังดำเนินต่อมาถึงปัจจุบัน (for five years + still works here)' },
      { key: 'C', text: 'had worked', isCorrect: false, feedbackTh: 'had worked เป็น Past Perfect ต้องใช้คู่กับอีกเหตุการณ์หนึ่งในอดีต' },
      { key: 'D', text: 'works', isCorrect: false, feedbackTh: 'ขาดมิติของการเชื่อมโยงระยะเวลา 5 ปีจากอดีตถึงปัจจุบัน' },
    ],
    explanationTh: 'Present Perfect (has/have + V.3) ใช้กับเหตุการณ์ที่เริ่มต้นในอดีตและยังคงดำเนินอยู่จนถึงปัจจุบัน โดยมักใช้ร่วมกับ "for" หรือ "since".',
    explanationEn: 'Present Perfect is used for actions that began in the past and continue into the present.',
    weaknessTag: 'present_perfect_vs_past_simple',
    difficultyWeight: 3,
  },
  {
    id: 'diag-b1-2',
    skill: 'grammar',
    cefrLevel: 'B1',
    type: 'multiple_choice',
    promptTh: 'ประโยคเงื่อนไขแบบที่ 2 (Second Conditional) สำหรับสถานการณ์สมมติ',
    promptEn: 'Select the correct verb forms for an imaginary situation (Second Conditional):',
    contextPassage: 'If I _____ more free time, I _____ learn how to play the piano.',
    options: [
      { key: 'A', text: 'have / will', isCorrect: false, feedbackTh: 'นี่คือ First Conditional (เหตุการณ์ที่เป็นไปได้จริง)' },
      { key: 'B', text: 'had / would', isCorrect: true, feedbackTh: 'ถูกต้อง! โครงสร้าง Second Conditional คือ If + Past Simple, would + V.inf' },
      { key: 'C', text: 'had / will', isCorrect: false, feedbackTh: 'จับคู่ Tense ไม่ถูกต้อง (had ไม่คู่กับ will)' },
      { key: 'D', text: 'would have / did', isCorrect: false, feedbackTh: 'โครงสร้างสลับตำแหน่งกริยาช่วย' },
    ],
    explanationTh: 'Second Conditional ใช้สมมติสิ่งที่ไม่เป็นจริงในปัจจุบัน โครงสร้าง: If + Subject + V.2 (Past Simple), Subject + would + V.1 (Base Form).',
    explanationEn: 'The Second Conditional expresses hypothetical or unlikely situations: If + past simple, would + bare infinitive.',
    weaknessTag: 'second_conditional',
    difficultyWeight: 3,
  },
  {
    id: 'diag-b1-3',
    skill: 'reading',
    cefrLevel: 'B1',
    type: 'multiple_choice',
    promptTh: 'อ่านข้อความเกี่ยวกับการปรับตัวในที่ทำงาน แล้วหาข้อสรุปที่ถูกต้อง',
    promptEn: 'Read the short excerpt on workplace adaptation and identify the main conclusion:',
    contextPassage: 'Many employees find remote work initially convenient because it eliminates the daily commute. However, over several months, the lack of boundary between personal living space and job duties frequently leads to subtle fatigue. Establishing a dedicated workspace and adhering strictly to set working hours is essential to prevent burnout.',
    options: [
      { key: 'A', text: 'Remote work should be banned because everyone suffers from burnout.', isCorrect: false, feedbackTh: 'บทความไม่ได้บอกให้ยกเลิก แค่เตือนให้ระวังความเหนื่อยล้า' },
      { key: 'B', text: 'Clear routines and designated physical zones help sustain long-term remote productivity.', isCorrect: true, feedbackTh: 'ถูกต้อง! การกำหนดเวลาทำงานที่ชัดเจนและแยกพื้นที่ทำงานช่วยป้องกันภาวะหมดไฟได้' },
      { key: 'C', text: 'Commuting to an office is proven to be healthier than staying at home.', isCorrect: false, feedbackTh: 'บทความไม่ได้เปรียบเทียบสุขภาพจากการเดินทาง' },
      { key: 'D', text: 'Employees work faster when they do not take breaks.', isCorrect: false, feedbackTh: 'ตรงข้ามกับสาระสำคัญของบทความ' },
    ],
    explanationTh: 'ประเด็นหลักของข้อความคือการแนะนำให้พนักงานแยกพื้นที่ทำงาน (dedicated workspace) และรักษากรอบเวลา (set working hours) เพื่อไม่ให้เกิดภาวะหมดไฟในการทำงานระยะไกล.',
    explanationEn: 'The passage highlights the importance of setting boundaries and dedicated workspaces to avoid fatigue in remote work.',
    weaknessTag: 'identifying_main_ideas_and_solutions',
    difficultyWeight: 3,
  },

  // B2 Level Questions (Cambridge FCE level)
  {
    id: 'diag-b2-1',
    skill: 'vocabulary',
    cefrLevel: 'B2',
    type: 'multiple_choice',
    promptTh: 'เลือกคำศัพท์หรือ Collocation ระดับ B2 ที่สอดคล้องกับบริบททางธุรกิจ',
    promptEn: 'Choose the most appropriate collocation for business and decision making:',
    contextPassage: 'After analyzing the quarterly financial records, the board decided to _____ the new product launch until market volatility subsided.',
    options: [
      { key: 'A', text: 'postpone', isCorrect: true, feedbackTh: 'ถูกต้อง! postpone แปลว่า เลื่อนออกไปอย่างเป็นทางการ' },
      { key: 'B', text: 'cancel out', isCorrect: false, feedbackTh: 'cancel out หมายถึง หักล้างผลกัน' },
      { key: 'C', text: 'give up', isCorrect: false, feedbackTh: 'give up หมายถึง ยอมแพ้หรือล้มเลิกโดยสิ้นเชิง' },
      { key: 'D', text: 'run down', isCorrect: false, feedbackTh: 'run down หมายถึง วิ่งชน หรือวิพากษ์วิจารณ์' },
    ],
    explanationTh: 'คำว่า "postpone" (เลื่อนออกไป) เข้ากับบริบทที่บอร์ดตัดสินใจเลื่อนการเปิดตัวสินค้าจนกว่าความผันผวนของตลาดจะลดลง (until market volatility subsided).',
    explanationEn: '"Postpone" means to delay an event or activity until a later time.',
    weaknessTag: 'formal_business_vocabulary',
    difficultyWeight: 4,
  },
  {
    id: 'diag-b2-2',
    skill: 'grammar',
    cefrLevel: 'B2',
    type: 'multiple_choice',
    promptTh: 'การแปลงประโยค Passive Voice ซับซ้อน (Impersonal Passive)',
    promptEn: 'Select the grammatically correct passive reporting structure:',
    contextPassage: 'The climate committee _____ that renewable energy costs will decline further over the next decade.',
    options: [
      { key: 'A', text: 'is widely believed', isCorrect: true, feedbackTh: 'ถูกต้อง! "It is widely believed that..." หรือ Subject + is believed to...' },
      { key: 'B', text: 'widely believes', isCorrect: false, feedbackTh: ' committee ในที่นี้ต้องใช้รูป Passive หรือถ้า Active ต้องมีกรรมรองรับที่สมบูรณ์' },
      { key: 'C', text: 'is been believed', isCorrect: false, feedbackTh: 'ไวยากรณ์ผิดรูป (is been ไม่มีในภาษาอังกฤษ)' },
      { key: 'D', text: 'has widely believing', isCorrect: false, feedbackTh: 'has + V.ing เป็นรูปที่ผิดหลัก' },
    ],
    explanationTh: 'Impersonal Passive เช่น "is widely believed / reported / estimated" นิยมใช้ในข้อสอบระดับ B2 เพื่อรายงานข้อเท็จจริงทางวิชาการโดยไม่เจาะจงตัวบุคคล.',
    explanationEn: 'Passive reporting verbs like "is widely believed that..." indicate shared opinions in formal contexts.',
    weaknessTag: 'passive_voice_reporting_verbs',
    difficultyWeight: 4,
  },
  {
    id: 'diag-b2-3',
    skill: 'listening',
    cefrLevel: 'B2',
    type: 'multiple_choice',
    promptTh: 'ฟังหรือวิเคราะห์คำพูดเพื่อจับเจตนาและน้ำเสียงของผู้พูด (Attitude & Tone)',
    promptEn: 'Analyze the speaker\'s tone and implicit perspective:',
    audioScript: 'Speaker: "Well, the architect\'s proposal is certainly bold and visually striking. Whether the city council actually has the fiscal reserves to sustain its maintenance over thirty years is another matter entirely."',
    options: [
      { key: 'A', text: 'The speaker wholeheartedly endorses the architect\'s plan without reservation.', isCorrect: false, feedbackTh: 'ผู้พูดไม่ได้เห็นชอบทั้งหมด' },
      { key: 'B', text: 'The speaker admires the aesthetic design but harbors doubts regarding long-term financial viability.', isCorrect: true, feedbackTh: 'ถูกต้อง! ชมว่า bold and visually striking แต่ตั้งคำถามเรื่องงบประมาณระยะยาว (fiscal reserves)' },
      { key: 'C', text: 'The speaker believes the city council will reject the design immediately due to ugliness.', isCorrect: false, feedbackTh: 'ผู้พูดชมว่าสวยสะดุดตา ไม่ได้บอกว่าน่าเกลียด' },
      { key: 'D', text: 'The speaker is indifferent to both aesthetics and financial concerns.', isCorrect: false, feedbackTh: 'ผู้พูดมีความเห็นชัดเจน ไม่ได้วางเฉย' },
    ],
    explanationTh: 'ผู้พูดชื่นชมความกล้าหาญและความโดดเด่นทางสายตา (bold and visually striking) แต่แสดงความคลางแคลงใจเรื่องงบประมาณในการดูแลรักษาในระยะ 30 ปีข้างหน้า.',
    explanationEn: 'The speaker contrasts the visual strengths of the proposal with practical budgetary skepticism.',
    weaknessTag: 'inferring_attitude_and_implicit_meaning',
    difficultyWeight: 4,
  },

  // C1 Level Questions (Cambridge CAE level)
  {
    id: 'diag-c1-1',
    skill: 'grammar',
    cefrLevel: 'C1',
    type: 'multiple_choice',
    promptTh: 'การสลับประธานและกริยาช่วย (Inversion) เมื่อขึ้นต้นประโยคด้วยคำที่มีความหมายเชิงปฏิเสธ',
    promptEn: 'Select the correct inversion structure following a negative adverbial:',
    contextPassage: 'Seldom _____ such an exquisite synthesis of empirical precision and artistic elegance.',
    options: [
      { key: 'A', text: 'one witnesses', isCorrect: false, feedbackTh: 'เมื่อขึ้นต้นด้วย Seldom ต้องสลับกริยาช่วยมาหน้าประธาน' },
      { key: 'B', text: 'does one witness', isCorrect: true, feedbackTh: 'ถูกต้อง! Inversion: Seldom + auxiliary (does) + subject (one) + base verb (witness)' },
      { key: 'C', text: 'witnessed one', isCorrect: false, feedbackTh: 'ในภาษาอังกฤษปัจจุบันต้องใช้กริยาช่วย do/does/did ไม่ย้าย main verb มาหน้าประธานโดยตรง' },
      { key: 'D', text: 'one has witnessed', isCorrect: false, feedbackTh: 'ขาดโครงสร้าง Inversion' },
    ],
    explanationTh: 'กฎ Negative Inversion: เมื่อประโยคขึ้นต้นด้วยคำปฏิเสธหรือจำกัดความ เช่น Seldom, Rarely, Never, Scarcely จะต้องสลับกริยาช่วย (Auxiliary Verb) มาไว้หน้าประธานเสมอ เช่น Seldom does one witness...',
    explanationEn: 'Negative adverbs at the beginning of a sentence require inversion (auxiliary + subject + main verb).',
    weaknessTag: 'negative_inversion',
    difficultyWeight: 5,
  },
  {
    id: 'diag-c1-2',
    skill: 'vocabulary',
    cefrLevel: 'C1',
    type: 'multiple_choice',
    promptTh: 'เลือกคำศัพท์ระดับ C1 ที่มีความหมายตรงข้ามกับ "superficial" (ผิวเผิน)',
    promptEn: 'Identify the word synonymous with thorough, deep, and intellectually rigorous:',
    contextPassage: 'Far from providing a merely cursory overview, the scholar conducted a _____ investigation into the socio-economic causes of the reform.',
    options: [
      { key: 'A', text: 'exhaustive', isCorrect: true, feedbackTh: 'ถูกต้อง! exhaustive แปลว่า ละเอียดถี่ถ้วน ครบถ้วนทุกแง่มุม' },
      { key: 'B', text: 'fleeting', isCorrect: false, feedbackTh: 'fleeting แปลว่า ชั่วคราว หรือผ่านไปอย่างรวดเร็ว' },
      { key: 'C', text: 'monotonous', isCorrect: false, feedbackTh: 'monotonous แปลว่า ซ้ำซากจำเจ น่าเบื่อ' },
      { key: 'D', text: 'provisional', isCorrect: false, feedbackTh: 'provisional แปลว่า ชั่วคราว หรือมีเงื่อนไข' },
    ],
    explanationTh: '"Exhaustive" หมายถึง อย่างละเอียดครอบคลุมทุกแง่มุม (thorough and comprehensive) ซึ่งตรงข้ามกับ "cursory" (ผิวเผิน/ลวกๆ) ในโจทย์.',
    explanationEn: '"Exhaustive" means examining, including, or considering all elements or aspects fully.',
    weaknessTag: 'advanced_academic_lexis',
    difficultyWeight: 5,
  },
  {
    id: 'diag-c1-3',
    skill: 'reading',
    cefrLevel: 'C1',
    type: 'multiple_choice',
    promptTh: 'วิเคราะห์โครงสร้างความหมายระดับจุลภาคและความเชื่อมโยงตรรกะในข้อเขียนทางวิชาการ',
    promptEn: 'Evaluate the rhetorical transition and logical coherence:',
    contextPassage: 'Technological determinism posits that media infrastructure unilaterally sculpts human cognitive patterns. _____, recent ethnographic studies suggest that local communities routinely repurpose digital tools in ways completely unanticipated by their silicon architects, demonstrating active human agency.',
    options: [
      { key: 'A', text: 'Besides this', isCorrect: false, feedbackTh: 'Besides this ใช้เสริมความคล้อยตาม ไม่ได้ใช้ขัดแย้ง' },
      { key: 'B', text: 'Notwithstanding this premise', isCorrect: true, feedbackTh: 'ถูกต้อง! "Notwithstanding this premise" (แม้จะมีสมมติฐานดังกล่าวก็ตาม) เชื่อมโยงความขัดแย้งระหว่างทฤษฎีกับผลการศึกษาจริงได้อย่างสละสลวย' },
      { key: 'C', text: 'In a similar vein', isCorrect: false, feedbackTh: 'In a similar vein หมายถึง ในทำนองเดียวกัน (แสดงความคล้อยตาม)' },
      { key: 'D', text: 'Consequently', isCorrect: false, feedbackTh: 'Consequently แสดงผลลัพธ์ แต่ประโยคหลังเป็นข้อโต้แย้ง' },
    ],
    explanationTh: '"Notwithstanding this premise" ทำหน้าที่เป็นคำเชื่อมระดับสูงที่แสดงการโต้แย้งอย่างเป็นทางการ (qualifying concession) เหมาะสมกับการหักล้างทฤษฎี Technological determinism.',
    explanationEn: '"Notwithstanding this premise" acts as a formal concessive marker contrasting theoretical claims with empirical counter-evidence.',
    weaknessTag: 'advanced_discourse_markers',
    difficultyWeight: 5,
  },

  // C2 Level Questions (Cambridge CPE level)
  {
    id: 'diag-c2-1',
    skill: 'vocabulary',
    cefrLevel: 'C2',
    type: 'multiple_choice',
    promptTh: 'เลือกสำนวนภาษาอังกฤษระดับสูง (Idiomatic Nuance) ที่สื่อถึงการกระทำโดยไม่ทันระวังตัวหรือไม่คาดคิด',
    promptEn: 'Choose the sophisticated idiom meaning to catch someone completely unprepared:',
    contextPassage: 'The aggressive regulatory audit caught the compliance department completely _____, exposing vulnerabilities that had lain dormant for decades.',
    options: [
      { key: 'A', text: 'on the hop', isCorrect: true, feedbackTh: 'ถูกต้อง! "catch someone on the hop" เป็นสำนวนระดับ C2 แปลว่า ทำให้ประหลาดใจหรือไม่ทันตั้งตัว' },
      { key: 'B', text: 'in the clear', isCorrect: false, feedbackTh: 'in the clear แปลว่า พ้นข้อกล่าวหา/พ้นอันตราย' },
      { key: 'C', text: 'at a premium', isCorrect: false, feedbackTh: 'at a premium แปลว่า หายากและมีมูลค่าสูง' },
      { key: 'D', text: 'under the weather', isCorrect: false, feedbackTh: 'under the weather เป็นสำนวนระดับพื้นฐานแปลว่า รู้สึกไม่สบาย' },
    ],
    explanationTh: 'สำนวน "catch someone on the hop" (ระดับ C2) หมายถึง เล่นงานหรือตรวจพบในจังหวะที่อีกฝ่ายไม่ทันตั้งตัวหรือไม่พร้อม.',
    explanationEn: '"To catch someone on the hop" is a British idiom meaning to surprise someone because they are not prepared.',
    weaknessTag: 'idiomatic_nuance_and_phrasal_depth',
    difficultyWeight: 5,
  },
  {
    id: 'diag-c2-2',
    skill: 'grammar',
    cefrLevel: 'C2',
    type: 'multiple_choice',
    promptTh: 'การใช้ Subjunctive Mood และประโยคเงื่อนไขขั้นสูงที่ละ If',
    promptEn: 'Identify the grammatically impeccable inverted conditional expressing remote past contingency:',
    contextPassage: '_____ for the timely intervention of the maritime rescue authorities, the vessel would undoubtedly have foundered in the hurricane.',
    options: [
      { key: 'A', text: 'Had it not been', isCorrect: true, feedbackTh: 'ถูกต้อง! Had it not been for... เป็นรูปละ If ของ If it had not been for... (Third Conditional Inversion)' },
      { key: 'B', text: 'Were it not', isCorrect: false, feedbackTh: 'Were it not for... ใช้กับปัจจุบัน (Second Conditional) แต่เหตุการณ์นี้เป็นอดีต (would have foundered)' },
      { key: 'C', text: 'Should it be', isCorrect: false, feedbackTh: 'Should it be ใช้กับอนาคตหรือความเป็นไปได้ในปัจจุบัน' },
      { key: 'D', text: 'If had it not been', isCorrect: false, feedbackTh: 'ห้ามใส่ If ซ้ำซ้อนกับ Had ที่สลับตำแหน่งมาแล้ว' },
    ],
    explanationTh: '"Had it not been for..." เป็นโครงสร้าง Inversion ของ Third Conditional ที่สละสลวย ใช้แทน "If it had not been for..." เมื่อพูดถึงเหตุการณ์ในอดีตที่ส่งผลกระทบต่อเนื่อง.',
    explanationEn: '"Had it not been for..." is an inverted third conditional construction indicating that without a past event, another consequence would have occurred.',
    weaknessTag: 'inverted_third_conditionals_subjunctive',
    difficultyWeight: 5,
  },
  {
    id: 'diag-c2-3',
    skill: 'reading',
    cefrLevel: 'C2',
    type: 'multiple_choice',
    promptTh: 'การอ่านวิเคราะห์ความลึกซึ้งของการใช้สำนวนโวหารและเจตนาซ่อนเร้นในวรรณกรรม/บทความปรัชญา',
    promptEn: 'Infer the subtle satirical subtext in the author\'s commentary on modern bureaucracy:',
    contextPassage: '"The institutional apparatus excelled in the manufacture of procedural inertia: every urgent query was met not with rejection, but with an invitation to join a sub-committee specifically consecrated to contemplating the feasibility of drafting a preliminary agenda."',
    options: [
      { key: 'A', text: 'The organization is lauded for its democratic decision-making and comprehensive consultation.', isCorrect: false, feedbackTh: 'ผู้เขียนไม่ได้ชื่นชม แต่กำลังประชดประชันความล่าช้า' },
      { key: 'B', text: 'The author satirizes how institutional processes disguise systemic procrastination as productive deliberation.', isCorrect: true, feedbackTh: 'ถูกต้อง! ผู้เขียนเสียดสีว่ากระบวนการตั้งคณะทำงานย่อยเป็นเพียงเครื่องบังหน้าในการผัดวันประกันพรุ่ง (procedural inertia)' },
      { key: 'C', text: 'The author recommends dissolving all sub-committees immediately.', isCorrect: false, feedbackTh: 'บทความวิจารณ์เชิงปรัชญา ไม่ได้ระบุข้อเสนอแนะโดยตรง' },
      { key: 'D', text: 'The system has proven highly effective at producing fast executive resolutions.', isCorrect: false, feedbackTh: 'ตรงข้ามกับความหมายโดยสิ้นเชิง' },
    ],
    explanationTh: 'ผู้เขียนใช้โวหารประชดประชัน (satirical subtext) บรรยายถึง "procedural inertia" (ความเฉื่อยชาตามขั้นตอน) ที่แปลงการผัดผ่อนให้ดูมีแบบแผนโดยการตั้งคณะอนุกรรมการขึ้นมาพิจารณาความเป็นไปได้ในการร่างวาระการประชุม.',
    explanationEn: 'The passage satirizes institutional procrastination masked as methodical bureaucratic diligence.',
    weaknessTag: 'literary_satire_and_philosophical_subtext',
    difficultyWeight: 5,
  },
];

/**
 * Diagnostic Evaluation Engine
 * Maps total correct answers & skill performance to CEFR Level & Cambridge Score
 */
export function evaluateDiagnosticAssessment(answers: Record<string, string>): {
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  estimatedLevel: CEFRLevel;
  cambridgeScore: number;
  targetExam: CambridgeExamCode;
  skillStats: UserSkillStats;
  identifiedWeaknesses: { tag: string; labelTh: string; errorCount: number }[];
  learningPathRecommendations: string[];
} {
  let correctCount = 0;
  const skillScores: Record<string, { correct: number; total: number }> = {
    vocabulary: { correct: 0, total: 0 },
    grammar: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 },
    listening: { correct: 0, total: 0 },
  };

  const weaknessMap: Record<string, { labelTh: string; count: number }> = {};

  DIAGNOSTIC_QUESTIONS.forEach((q) => {
    const selected = answers[q.id];
    const isCorrect = q.options?.find((opt) => opt.key === selected)?.isCorrect ?? false;

    if (skillScores[q.skill]) {
      skillScores[q.skill].total += 1;
      if (isCorrect) skillScores[q.skill].correct += 1;
    }

    if (isCorrect) {
      correctCount += 1;
    } else {
      if (!weaknessMap[q.weaknessTag]) {
        weaknessMap[q.weaknessTag] = {
          labelTh: q.promptTh.slice(0, 50),
          count: 1,
        };
      } else {
        weaknessMap[q.weaknessTag].count += 1;
      }
    }
  });

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Calibration curve for CEFR Level Estimation based on 18 questions
  let estimatedLevel: CEFRLevel = 'A1';
  let cambridgeScore = 105;
  let targetExam: CambridgeExamCode = 'KET';

  if (correctCount <= 3) {
    estimatedLevel = 'A1';
    cambridgeScore = 100 + Math.round(correctCount * 5);
    targetExam = 'KET';
  } else if (correctCount <= 6) {
    estimatedLevel = 'A2';
    cambridgeScore = 120 + Math.round((correctCount - 3) * 6);
    targetExam = 'KET';
  } else if (correctCount <= 10) {
    estimatedLevel = 'B1';
    cambridgeScore = 140 + Math.round((correctCount - 6) * 5);
    targetExam = 'PET';
  } else if (correctCount <= 14) {
    estimatedLevel = 'B2';
    cambridgeScore = 160 + Math.round((correctCount - 10) * 5);
    targetExam = 'FCE';
  } else if (correctCount <= 16) {
    estimatedLevel = 'C1';
    cambridgeScore = 180 + Math.round((correctCount - 14) * 8);
    targetExam = 'CAE';
  } else {
    estimatedLevel = 'C2';
    cambridgeScore = 205 + Math.round((correctCount - 16) * 10);
    targetExam = 'CAE';
  }

  const calcSkillPercent = (key: string) => {
    const s = skillScores[key];
    if (!s || s.total === 0) return 60;
    return Math.round((s.correct / s.total) * 100);
  };

  const skillStats: UserSkillStats = {
    vocabulary: calcSkillPercent('vocabulary'),
    grammar: calcSkillPercent('grammar'),
    reading: calcSkillPercent('reading'),
    listening: calcSkillPercent('listening'),
    writing: Math.max(30, Math.min(95, percentage - 5)), // Estimated starting baseline
    speaking: Math.max(30, Math.min(95, percentage - 10)),
  };

  const identifiedWeaknesses = Object.entries(weaknessMap).map(([tag, data]) => ({
    tag,
    labelTh: data.labelTh,
    errorCount: data.count,
  }));

  const recommendations: string[] = [];
  if (skillStats.grammar < 60) {
    recommendations.push('ทบทวนไวยากรณ์โครงสร้างหลัก (Tense และ Subject-Verb Agreement) พร้อมคำอธิบายภาษาไทย');
  }
  if (skillStats.vocabulary < 60) {
    recommendations.push(`ฝึกคลังคำศัพท์ระดับ ${estimatedLevel} ผ่านระบบบัตรคำ Flashcards พร้อมตัวอย่างประโยค`);
  }
  if (skillStats.reading < 60) {
    recommendations.push('ฝึกการอ่านจับใจความ (Skimming & Scanning) โดยใช้เครื่องมือช่วยแปลศัพท์เฉพาะคำ');
  }
  if (skillStats.listening < 60) {
    recommendations.push('ฝึกฟังบทสนทนาประจำวันและข้อสอบจำลอง พร้อมปรับความเร็วเสียงเป็น 0.75x');
  }
  recommendations.push(`เริ่มต้นฝึกฝนชุดข้อสอบแนว ${targetExam} เพื่อทำความคุ้นเคยกับรูปแบบโจทย์จริง`);

  return {
    totalQuestions,
    correctCount,
    percentage,
    estimatedLevel,
    cambridgeScore,
    targetExam,
    skillStats,
    identifiedWeaknesses,
    learningPathRecommendations: recommendations,
  };
}
