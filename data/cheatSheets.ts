/**
 * ==============================================================================
 * GLOVA High-Yield Master Cheat Sheets & Decision Matrices
 * ==============================================================================
 *
 * Synthesized from the core CEFR / OOPT pedagogical guidelines:
 * 1. In / On / At (Time & Place Inverted Pyramid)
 * 2. Play / Do / Go (Sports & Activities Categorization)
 * 3. Do vs. Make (Functional Action & Collocation Matrix)
 * 4. Oxford OOPT Test Architecture & CEFR Scoring Standard (0–120 Scale)
 *
 * Zero plagiarism: 100% original pedagogical design and original examples.
 * Personal health invariant: Verified clean allergen-free content.
 * ==============================================================================
 */

export interface CheatSheetEntry {
  category: string;
  ruleEn: string;
  ruleTh: string;
  examples: Array<{
    en: string;
    th: string;
    note?: string;
  }>;
}

export interface CheatSheetQuizQuestion {
  id: string;
  promptEn: string;
  promptTh: string;
  options: string[];
  correctAnswer: string;
  explanationTh: string;
}

export interface QuickQuizOption {
  key: string;
  text: string;
}

export interface QuickQuizItem {
  id: string;
  stemTh: string;
  stemEn: string;
  options: QuickQuizOption[];
  correctAnswer: string;
  explanationTh: string;
}

export interface MatrixRule {
  category: string;
  ruleTh: string;
  ruleEn: string;
  examples: string[];
  exceptions?: string;
}

export interface LegacyCheatSheetModule {
  id: string;
  titleEn: string;
  titleTh: string;
  summaryTh: string;
  cheatCodeTipTh: string;
  entries: CheatSheetEntry[];
  quiz: CheatSheetQuizQuestion[];
}

export interface CheatSheetModule {
  id: string;
  targetCefr: string;
  titleEn: string;
  titleTh: string;
  summaryTh: string;
  keyTakeawaysTh: string[];
  matrixRules: MatrixRule[];
  quickQuizzes: QuickQuizItem[];
  cheatCodeTipTh?: string;
  entries?: CheatSheetEntry[];
  quiz?: CheatSheetQuizQuestion[];
}

// 1. IN / ON / AT MASTER MATRIX
export const IN_ON_AT_CHEAT_SHEET: LegacyCheatSheetModule = {
  id: 'in-on-at',
  titleEn: 'Prepositions Matrix: In, On, At',
  titleTh: 'สรุปคัมภีร์บุพบท: In, On, At (เวลาและสถานที่)',
  summaryTh: 'หลักการจำพีระมิดคว่ำ: จากกว้างใหญ่ (IN) สู่พื้นผิว/วัน (ON) สู่จุดเจาะจง/เวลาเป๊ะ (AT)',
  cheatCodeTipTh: 'จำง่ายๆ: IN = ใหญ่/กว้าง (เดือน, ปี, ประเทศ) | ON = แบน/วัน (ถนน, วันที่, พื้นผิว) | AT = เล็ก/เป๊ะ (โมง, ป้าย, บ้านเลขที่)',
  entries: [
    {
      category: 'Time: IN (ขอบเขตกว้าง)',
      ruleEn: 'Used for centuries, decades, years, seasons, months, and general parts of the day.',
      ruleTh: 'ใช้กับศตวรรษ, ทศวรรษ, ปี, ฤดูกาล, เดือนเดี่ยวๆ และช่วงเวลาของวัน',
      examples: [
        { en: 'in 2026', th: 'ในปี 2026' },
        { en: 'in July', th: 'ในเดือนกรกฎาคม' },
        { en: 'in summer', th: 'ในฤดูร้อน' },
        { en: 'in the morning', th: 'ในตอนเช้า' },
        { en: 'in the 21st century', th: 'ในศตวรรษที่ 21' },
      ],
    },
    {
      category: 'Time: ON (วันและวันที่)',
      ruleEn: 'Used for days of the week, specific calendar dates, holidays with "day", and day parts with a named day.',
      ruleTh: 'ใช้กับวันในสัปดาห์, วันที่ที่มีตัวเลข, วันหยุดที่มีคำว่า Day, และช่วงเวลาที่มีชื่อวันนำหน้า',
      examples: [
        { en: 'on Friday', th: 'ในวันศุกร์' },
        { en: 'on 12th August', th: 'ในวันที่ 12 สิงหาคม' },
        { en: 'on New Year\'s Day', th: 'ในวันขึ้นปีใหม่' },
        { en: 'on Monday afternoon', th: 'ในบ่ายวันจันทร์ (มี Monday กฎวันชนะ)' },
        { en: 'on my birthday', th: 'ในวันเกิดของฉัน' },
      ],
    },
    {
      category: 'Time: AT (จุดเวลาเจาะจง)',
      ruleEn: 'Used for exact clock times, midnight, noon, and specific meal times/night.',
      ruleTh: 'ใช้กับเวลาตามหน้าปัดนาฬิกา, เที่ยงวัน, เที่ยงคืน, มื้ออาหาร และคำว่า night',
      examples: [
        { en: 'at 8:30 AM', th: 'เวลา 8 โมงครึ่ง' },
        { en: 'at noon / at midday', th: 'ตอนเที่ยงวัน' },
        { en: 'at midnight', th: 'ตอนเที่ยงคืน' },
        { en: 'at night', th: 'ตอนกลางคืน' },
        { en: 'at lunchtime', th: 'ในเวลามื้อกลางวัน' },
      ],
    },
    {
      category: 'Place: IN (พื้นที่ 3 มิติ / เมือง / ประเทศ)',
      ruleEn: 'Used for enclosed physical spaces, rooms, cities, regions, and countries.',
      ruleTh: 'ใช้กับพื้นที่ปิด 3 มิติ, ภายในห้อง, นคร, จังหวัด, และประเทศ',
      examples: [
        { en: 'in Bangkok', th: 'ในกรุงเทพมหานคร' },
        { en: 'in Thailand', th: 'ในประเทศไทย' },
        { en: 'in the kitchen', th: 'ในห้องครัว' },
        { en: 'in a taxi / in a car', th: 'ในรถแท็กซี่ / ในรถยนต์ส่วนบุคคล' },
        { en: 'in a garden', th: 'ในสวน' },
      ],
    },
    {
      category: 'Place: ON (พื้นผิว 2 มิติ / ถนน / รถสาธารณะ)',
      ruleEn: 'Used for surfaces, street names without building numbers, and public transit where you can walk.',
      ruleTh: 'ใช้กับบนพื้นผิว, ชื่อถนน (ไม่มีเลขที่), และระบบขนส่งสาธารณะขนาดใหญ่ที่ลุกเดินได้',
      examples: [
        { en: 'on Sukhumvit Road', th: 'บนถนนสุขุมวิท' },
        { en: 'on the third floor', th: 'บนชั้น 3' },
        { en: 'on the table', th: 'บนโต๊ะ' },
        { en: 'on the train / on the bus', th: 'บนรถไฟ / บนรถเมล์' },
        { en: 'on the airplane', th: 'บนเครื่องบิน' },
      ],
    },
    {
      category: 'Place: AT (จุดพิกัดเฉพาะ / ป้าย / เลขที่)',
      ruleEn: 'Used for specific target points, door numbers with street names, bus stops, and venues for an activity.',
      ruleTh: 'ใช้กับพิกัดเฉพาะจุด, ที่อยู่พร้อมเลขที่บ้าน, ป้ายรถเมล์, และสถานที่เพื่อทำกิจกรรม',
      examples: [
        { en: 'at 45 Silom Road', th: 'ที่เลขที่ 45 ถนนสีลม (มีเลขที่ใช้ at)' },
        { en: 'at the bus stop', th: 'ที่ป้ายรถประจำทาง' },
        { en: 'at the airport', th: 'ที่สนามบิน' },
        { en: 'at the entrance', th: 'ที่บริเวณทางเข้า' },
        { en: 'at home / at university', th: 'ที่บ้าน / ที่มหาวิทยาลัย' },
      ],
    },
  ],
  quiz: [
    {
      id: 'quiz-inon-1',
      promptEn: 'The international climate summit starts _____ 9:00 AM sharp tomorrow.',
      promptTh: 'การประชุมสุดยอดสภาพภูมิอากาศเริ่มเวลา 9 โมงเช้าตรงในวันพรุ่งนี้',
      options: ['at', 'in', 'on', 'to'],
      correctAnswer: 'at',
      explanationTh: 'เวลาบนหน้าปัดนาฬิกา (9:00 AM) ต้องใช้ preposition "at"',
    },
    {
      id: 'quiz-inon-2',
      promptEn: 'She was born _____ an island in southern Thailand _____ 2004.',
      promptTh: 'เธอเกิดบนเกาะทางตอนใต้ของประเทศไทยในปี 2004',
      options: ['on / in', 'in / on', 'at / in', 'on / at'],
      correctAnswer: 'on / in',
      explanationTh: 'เกาะ (พื้นผิว) ใช้ "on an island" และปี (ช่วงเวลากว้าง) ใช้ "in 2004"',
    },
    {
      id: 'quiz-inon-3',
      promptEn: 'Our final exam is scheduled _____ Tuesday morning.',
      promptTh: 'การสอบปลายภาคกำหนดไว้ในเช้าวันอังคาร',
      options: ['on', 'in', 'at', 'by'],
      correctAnswer: 'on',
      explanationTh: 'เมื่อมีชื่อวัน (Tuesday) นำหน้าช่วงเวลา กฎของ "วัน" (on) มีลำดับความสำคัญสูงสุด',
    },
    {
      id: 'quiz-inon-4',
      promptEn: 'The new tech startup is located _____ 102 Wireless Road in Bangkok.',
      promptTh: 'บริษัทสตาร์ทอัพตั้งอยู่ที่เลขที่ 102 ถนนวิทยุ กรุงเทพฯ',
      options: ['at', 'on', 'in', 'to'],
      correctAnswer: 'at',
      explanationTh: 'มีเลขที่อาคารระบุอยู่หน้าชื่อถนน (102 Wireless Road) ถือเป็นพิกัดเฉพาะ ต้องใช้ "at"',
    },
  ],
};

// 2. PLAY / DO / GO MATRIX
export const SPORTS_VERBS_CHEAT_SHEET: LegacyCheatSheetModule = {
  id: 'play-do-go',
  titleEn: 'Sports & Activities Matrix: Play, Do, Go',
  titleTh: 'สูตรพิชิตกริยากีฬา: Play vs. Do vs. Go',
  summaryTh: 'จัดกลุ่มแม่นยำ: กีฬาลูกบอล/ทีม = PLAY | ศิลปะการต่อสู้/เดี่ยว = DO | กิจกรรมลงท้าย -ing = GO',
  cheatCodeTipTh: 'สูตรลับ: มีบอล/มีแข่ง = PLAY | ไม่มีบอล/ออกแรงเดี่ยว/ต่อสู้ = DO | คำศัพท์มี -ING = GO',
  entries: [
    {
      category: 'PLAY (ลูกบอล / แข่งขัน / กติกาแพ้ชนะ)',
      ruleEn: 'Used for team sports, games played with a ball or other equipment, and competitive board games.',
      ruleTh: 'ใช้กับกีฬาที่มีลูกบอล กีฬาประเภททีม และเกมที่มีกติกาการแข่งขันแพ้ชนะ',
      examples: [
        { en: 'play football / play tennis', th: 'เล่นฟุตบอล / เล่นเทนนิส' },
        { en: 'play badminton / play volleyball', th: 'เล่นแบดมินตัน / เล่นวอลเลย์บอล' },
        { en: 'play basketball / play golf', th: 'เล่นบาสเกตบอล / เล่นกอล์ฟ' },
        { en: 'play chess / play board games', th: 'เล่นหมากรุก / เล่นบอร์ดเกม' },
        { en: 'play table tennis (ping-pong)', th: 'เล่นปิงปอง' },
      ],
    },
    {
      category: 'DO (ศิลปะการต่อสู้ / การออกกำลังกายเดี่ยว)',
      ruleEn: 'Used for individual non-team activities, martial arts, fitness exercises, and yoga without balls.',
      ruleTh: 'ใช้กับกีฬาเดี่ยว ศิลปะการต่อสู้ และการบริหารร่างกายที่ไม่มีลูกบอล',
      examples: [
        { en: 'do yoga / do Pilates', th: 'เล่นโยคะ / เล่นพิลาทิส' },
        { en: 'do karate / do taekwondo', th: 'เล่นคาราเต้ / เล่นเทควันโด' },
        { en: 'do judo / do martial arts', th: 'เล่นยูโด / ฝึกศิลปะการต่อสู้' },
        { en: 'do gymnastics / do aerobics', th: 'เล่นยิมนาสติก / เต้นแอโรบิก' },
        { en: 'do athletics / do crossfit', th: 'เล่นกรีฑา / ฝึกครอสฟิต' },
      ],
    },
    {
      category: 'GO (กิจกรรมกีฬาที่ลงท้ายด้วย -ING)',
      ruleEn: 'Used for sports, outdoor recreation, and movement activities whose names end in -ing.',
      ruleTh: 'ใช้กับกิจกรรมกีฬาหรือการพักผ่อนกลางแจ้งที่รูปคำลงท้ายด้วย -ing',
      examples: [
        { en: 'go swimming', th: 'ไปว่ายน้ำ' },
        { en: 'go running / go jogging', th: 'ไปวิ่ง / ไปวิ่งเหยาะๆ' },
        { en: 'go cycling', th: 'ไปปั่นจักรยาน' },
        { en: 'go hiking / go trekking', th: 'ไปเดินป่า / ไปปีนเขา' },
        { en: 'go skiing / go snowboarding', th: 'ไปเล่นสกี / ไปเล่นสโนว์บอร์ด' },
      ],
    },
  ],
  quiz: [
    {
      id: 'quiz-pdg-1',
      promptEn: 'Tanakorn loves to _____ judo on Tuesday and _____ swimming on Friday.',
      promptTh: 'ธนากรชอบเล่นยูโดในวันอังคาร และไปว่ายน้ำในวันศุกร์',
      options: ['do / go', 'play / go', 'do / play', 'play / do'],
      correctAnswer: 'do / go',
      explanationTh: 'judo เป็นศิลปะการต่อสู้ ใช้ "do" | swimming ลงท้ายด้วย -ing ใช้ "go"',
    },
    {
      id: 'quiz-pdg-2',
      promptEn: 'Our family often _____ badminton in the backyard after work.',
      promptTh: 'ครอบครัวของเรามักเล่นแบดมินตันในสวนหลังบ้านหลังเลิกงาน',
      options: ['plays', 'does', 'goes', 'makes'],
      correctAnswer: 'plays',
      explanationTh: 'badminton เป็นกีฬาแข่งขันตีลูกขนไก่ ใช้กริยา "play"',
    },
  ],
};

// 3. DO VS. MAKE MATRIX
export const DO_MAKE_CHEAT_SHEET: LegacyCheatSheetModule = {
  id: 'do-vs-make',
  titleEn: 'Action & Creation Matrix: Do vs. Make',
  titleTh: 'คัมภีร์ตัดคะแนน: Do vs. Make',
  summaryTh: 'DO ใช้กับหน้าที่ ภาระงาน และการกระทำทั่วไป | MAKE ใช้กับการสร้าง ผลิตผลลัพธ์ การตัดสินใจ และการสื่อสาร',
  cheatCodeTipTh: 'สูตรลับ: DO = ปฏิบัติงาน/งานบ้าน (homework, research, dishes) | MAKE = สร้างใหม่/ตัดสินใจ (decision, mistake, appointment, money)',
  entries: [
    {
      category: 'DO: งานบ้าน หน้าที่ และกระบวนการค้นคว้า',
      ruleEn: 'Used for obligations, household chores, general work, and academic research.',
      ruleTh: 'ใช้กับหน้าที่ประจำ งานบ้าน งานอาชีพ และการค้นคว้าที่ไม่ก่อให้เกิดวัตถุชิ้นใหม่ทางกายภาพ',
      examples: [
        { en: 'do homework / do coursework', th: 'ทำการบ้าน / ทำรายงานการเรียน' },
        { en: 'do research / do an experiment', th: 'ทำงานวิจัย / ทำการทดลอง' },
        { en: 'do business', th: 'ทำธุรกิจ' },
        { en: 'do the dishes / do the laundry', th: 'ล้างจาน / ซักผ้า' },
        { en: 'do someone a favor', th: 'ช่วยสงเคราะห์/ช่วยเหลือใครสักคน' },
        { en: 'do one\'s best', th: 'พยายามอย่างสุดความสามารถ' },
      ],
    },
    {
      category: 'MAKE: การผลิต การตัดสินใจ ข้อตกลง และเสียง',
      ruleEn: 'Used for creating tangible objects, formulating plans, speech acts, and critical decisions.',
      ruleTh: 'ใช้กับการประดิษฐ์ ผลิตอาหาร การตัดสินใจ การตกลงนัดหมาย และการส่งเสียง',
      examples: [
        { en: 'make a decision', th: 'ตัดสินใจ' },
        { en: 'make a mistake', th: 'ทำข้อผิดพลาด' },
        { en: 'make an appointment', th: 'ทำนัดหมาย' },
        { en: 'make a phone call', th: 'โทรศัพท์' },
        { en: 'make friends / make money', th: 'ผูกมิตรสร้างเพื่อน / หาเงิน' },
        { en: 'make a suggestion / make a speech', th: 'ให้ข้อเสนอแนะ / กล่าวสุนทรพจน์' },
        { en: 'make dinner / make a cake', th: 'ทำอาหารเย็น / อบเค้ก' },
      ],
    },
  ],
  quiz: [
    {
      id: 'quiz-domake-1',
      promptEn: 'Before you _____ a final decision, you should _____ more research.',
      promptTh: 'ก่อนที่คุณจะตัดสินใจขั้นสุดท้าย คุณควรจะค้นคว้าข้อมูลเพิ่มเติม',
      options: ['make / do', 'do / make', 'make / make', 'do / do'],
      correctAnswer: 'make / do',
      explanationTh: 'decision ใช้คู่กับ "make a decision" | research ใช้คู่กับ "do research"',
    },
    {
      id: 'quiz-domake-2',
      promptEn: 'Can you please _____ me a favor and help me _____ this phone call?',
      promptTh: 'คุณช่วยอะไรฉันสักอย่าง และช่วยฉันต่อสายโทรศัพท์นี้ได้ไหม?',
      options: ['do / make', 'make / do', 'do / do', 'make / make'],
      correctAnswer: 'do / make',
      explanationTh: 'favor ใช้คู่กับ "do someone a favor" | phone call ใช้คู่กับ "make a phone call"',
    },
  ],
};

// 4. OXFORD OOPT & CEFR TEST ARCHITECTURE GUIDE
export const OOPT_ARCHITECTURE_GUIDE = {
  titleEn: 'Oxford Online Placement Test (OOPT) Complete Architecture Guide',
  titleTh: 'คู่มือโครงสร้างข้อสอบ Oxford Online Placement Test (OOPT) และมาตรฐาน CEFR',
  overviewTh: 'OOPT เป็นแบบทดสอบวัดระดับภาษาอังกฤษเชิงปรับเหมาะด้วยคอมพิวเตอร์ (Computer-Adaptive Test) โดยสำนักพิมพ์มหาวิทยาลัยอ็อกซ์ฟอร์ด เพื่อวัดระดับ CEFR อย่างแม่นยำในเวลาสั้น',
  scoreScale: [
    { range: '0 คะแนน', level: 'Below A1', descriptionTh: 'ระดับต่ำกว่า A1 ยังไม่สามารถสื่อสารภาษาอังกฤษเบื้องต้นได้' },
    { range: '1–20 คะแนน', level: 'A1 (Breakthrough)', descriptionTh: 'เข้าใจและใช้สำนวนพื้นฐานในชีวิตประจำวัน แนะนำตัวง่ายๆ ได้' },
    { range: '21–40 คะแนน', level: 'A2 (Waystage)', descriptionTh: 'สื่อสารเรื่องกิจวัตร ข้อมูลครอบครัว ช้อปปิ้ง และทิศทางได้' },
    { range: '41–60 คะแนน', level: 'B1 (Threshold)', descriptionTh: 'เข้าใจประเด็นหลักในงาน โรงเรียน ชีวิตประจำวัน และเล่าเรื่องราวความฝันได้' },
    { range: '61–80 คะแนน', level: 'B2 (Vantage)', descriptionTh: 'เข้าใจใจความสำคัญของข้อความซับซ้อน สื่อสารคล่องแคล่วกับเจ้าของภาษา' },
    { range: '81–100 คะแนน', level: 'C1 (Effective Proficiency)', descriptionTh: 'เข้าใจบทความยาวและยาก ใช้ภาษาอย่างยืดหยุ่นในทางวิชาการและวิชาชีพ' },
    { range: '> 100 คะแนน (ถึง 120)', level: 'C2 (Mastery)', descriptionTh: 'เชี่ยวชาญเทียบเท่าเจ้าของภาษาที่มีการศึกษาสูง ถ่ายทอดความหมายได้แม่นยำ' },
  ],
  sections: [
    {
      nameEn: 'Use of English',
      nameTh: 'ส่วนที่ 1: การใช้ภาษาอังกฤษ (Use of English)',
      duration: 'ประมาณ 30–35 นาที (30 ข้อ)',
      subparts: [
        {
          name: 'Part 1: Short Dialogues - Focus on Form',
          descriptionTh: 'บทสนทนาสั้น 2 บรรทัด วัดไวยากรณ์ กาล (Tenses), รูปกริยา, บุพบท, สรรพนาม, Collocations และ Phrasal Verbs (ตัวเลือก 4 ช้อยส์ A, B, C, D)',
        },
        {
          name: 'Part 2: Focus on Meaning in Conversation',
          descriptionTh: 'บทสนทนา 2 บรรทัด วัดการตีความหมายแฝง เจตนาที่แท้จริงของผู้พูด และสำนวนภาษาอังกฤษในบริบท (ตัวเลือก 3 ช้อยส์ A, B, C เช่น "What does the woman mean?")',
        },
        {
          name: 'Part 3: Open Cloze (Gap-Fill in Connected Text)',
          descriptionTh: 'บทอ่านสั้น 1–2 ย่อหน้า (อีเมล, บันทึก, บทความ) เติมคำศัพท์ทางไวยากรณ์ 1 คำในแต่ละช่องว่าง วัดคำเชื่อม, บุพบท, คำนำหน้านาม, และกริยาช่วย',
        },
      ],
    },
    {
      nameEn: 'Listening',
      nameTh: 'ส่วนที่ 2: ทักษะการฟัง (Listening Comprehension)',
      duration: 'ประมาณ 15–20 นาที (15 ข้อ)',
      subparts: [
        {
          name: 'Short Conversations & Monologues',
          descriptionTh: 'ฟังบทสนทนาสั้นและประกาศในชีวิตประจำวัน (ประกาศสถานีรถไฟ, การจองโต๊ะอาหาร, นัดหมายแพทย์, สัมภาษณ์) ฟังได้ 2 รอบเพื่อตอบคำถาม 4 ตัวเลือก',
        },
      ],
    },
  ],
  catExplanationTh: `ระบบ Computer-Adaptive Testing (CAT) ทำงานอย่างไร?
ระบบจะเริ่มจากข้อสอบระดับกลาง (B1) หากผู้สอบตอบถูก ข้อสอบข้อถัดไปจะปรับความยากขึ้นทันทีตามทฤษฎี Item Response Theory (IRT) หากตอบผิด ระบบจะปรับลดระดับความยากลงมา เพื่อค้นหา "จุดความสามารถที่แท้จริง" (Theta) ของผู้สอบอย่างแม่นยำที่สุดโดยไม่ต้องทำข้อสอบเป็นร้อยๆ ข้อ`,
};

export const CHEAT_SHEET_MODULES: CheatSheetModule[] = [
  {
    id: 'in-on-at-time-place',
    targetCefr: 'A1–B1',
    titleTh: 'สรุปคัมภีร์บุพบท: In, On, At (เวลาและสถานที่)',
    titleEn: 'Prepositions Matrix: In, On, At',
    summaryTh: 'หลักการจำพีระมิดคว่ำ: จากกว้างใหญ่ (IN) สู่พื้นผิว/วัน (ON) สู่จุดเจาะจง/เวลาเป๊ะ (AT)',
    keyTakeawaysTh: [
      'IN: เวลาขอบเขตกว้าง (ปี, เดือน, ฤดูกาล) และสถานที่ในพื้นที่ปิด/เมือง/ประเทศ',
      'ON: วันในสัปดาห์, วันที่, วันสำคัญที่มี "Day" และพื้นผิว/ชื่อถนน',
      'AT: จุดเวลาแน่นอนบนหน้าปัดนาฬิกา และพิกัดเจาะจงที่มีบ้านเลขที่',
    ],
    matrixRules: [
      {
        category: 'IN (กว้างใหญ่)',
        ruleTh: 'ใช้กับศตวรรษ, ทศวรรษ, ปี, ฤดูกาล, เดือนเดี่ยวๆ และช่วงเวลาของวัน',
        ruleEn: 'Centuries, decades, years, seasons, months, and general parts of the day.',
        examples: ['in 2026', 'in July', 'in summer', 'in the morning', 'in the 21st century'],
      },
      {
        category: 'ON (แบน/วัน)',
        ruleTh: 'ใช้กับวันในสัปดาห์, วันที่ที่มีตัวเลข, วันหยุดที่มีคำว่า Day, และช่วงเวลาที่มีชื่อวันนำหน้า',
        ruleEn: 'Days of the week, specific calendar dates, holidays with "day", and named day parts.',
        examples: ['on Friday', 'on 12th August', "on New Year's Day", 'on Monday afternoon', 'on my birthday'],
      },
      {
        category: 'AT (เล็ก/เป๊ะ)',
        ruleTh: 'ใช้กับเวลาตามเข็มนาฬิกา, เวลาเฉพาะเจาะจง, จุดเทศกาลที่ไม่มีคำว่า day',
        ruleEn: 'Clock times, precise moments, holiday seasons without "day", and exact street numbers.',
        examples: ['at 9:00 AM', 'at noon', 'at night', 'at Christmas', 'at 102 Wireless Road'],
        exceptions: 'at night (แต่ in the morning/afternoon/evening)',
      },
    ],
    quickQuizzes: [
      {
        id: 'quiz-inon-1',
        stemTh: 'การประชุมสุดยอดสภาพภูมิอากาศเริ่มเวลา 9 โมงเช้าตรงในวันพรุ่งนี้',
        stemEn: 'The international climate summit starts _____ 9:00 AM sharp tomorrow.',
        options: [
          { key: 'A', text: 'at' },
          { key: 'B', text: 'in' },
          { key: 'C', text: 'on' },
          { key: 'D', text: 'to' },
        ],
        correctAnswer: 'A',
        explanationTh: 'เวลาบนหน้าปัดนาฬิกา (9:00 AM) ต้องใช้ preposition "at"',
      },
      {
        id: 'quiz-inon-2',
        stemTh: 'เธอเกิดบนเกาะทางตอนใต้ของประเทศไทยในปี 2004',
        stemEn: 'She was born _____ an island in southern Thailand _____ 2004.',
        options: [
          { key: 'A', text: 'on / in' },
          { key: 'B', text: 'in / on' },
          { key: 'C', text: 'at / in' },
          { key: 'D', text: 'on / at' },
        ],
        correctAnswer: 'A',
        explanationTh: 'เกาะ (พื้นผิว) ใช้ "on an island" และปี (ช่วงเวลากว้าง) ใช้ "in 2004"',
      },
      {
        id: 'quiz-inon-3',
        stemTh: 'การสอบปลายภาคกำหนดไว้ในเช้าวันอังคาร',
        stemEn: 'Our final exam is scheduled _____ Tuesday morning.',
        options: [
          { key: 'A', text: 'on' },
          { key: 'B', text: 'in' },
          { key: 'C', text: 'at' },
          { key: 'D', text: 'by' },
        ],
        correctAnswer: 'A',
        explanationTh: 'เมื่อมีชื่อวัน (Tuesday) นำหน้าช่วงเวลา กฎของ "วัน" (on) มีลำดับความสำคัญสูงสุด',
      },
      {
        id: 'quiz-inon-4',
        stemTh: 'บริษัทสตาร์ทอัพตั้งอยู่ที่เลขที่ 102 ถนนวิทยุ กรุงเทพฯ',
        stemEn: 'The new tech startup is located _____ 102 Wireless Road in Bangkok.',
        options: [
          { key: 'A', text: 'at' },
          { key: 'B', text: 'on' },
          { key: 'C', text: 'in' },
          { key: 'D', text: 'to' },
        ],
        correctAnswer: 'A',
        explanationTh: 'มีเลขที่อาคารระบุอยู่หน้าชื่อถนน (102 Wireless Road) ถือเป็นพิกัดเฉพาะ ต้องใช้ "at"',
      },
    ],
  },
  {
    id: 'play-do-go-sports',
    targetCefr: 'A1–B1',
    titleTh: 'สูตรพิชิตกริยากีฬา: Play vs. Do vs. Go',
    titleEn: 'Sports & Activities Matrix: Play, Do, Go',
    summaryTh: 'จัดกลุ่มแม่นยำ: กีฬาลูกบอล/ทีม = PLAY | ศิลปะการต่อสู้/เดี่ยว = DO | กิจกรรมลงท้าย -ing = GO',
    keyTakeawaysTh: [
      'PLAY: กีฬาที่มีลูกบอล, กีฬาประเภททีม, การแข่งขันที่มีกติกาแพ้ชนะ และบอร์ดเกม',
      'DO: ศิลปะการต่อสู้, การออกกำลังกายเดี่ยว/ไม่ใช้อุปกรณ์ลูกบอล',
      'GO: กิจกรรมกีฬาหรือนันทนาการที่คำศัพท์ลงท้ายด้วย -ing และต้องมีการเคลื่อนที่',
    ],
    matrixRules: [
      {
        category: 'PLAY (ลูกบอล / แข่งขัน)',
        ruleTh: 'ใช้กับกีฬาที่มีลูกบอล กีฬาประเภททีม และเกมที่มีกติกาการแข่งขันแพ้ชนะ',
        ruleEn: 'Team sports, ball games, and competitive board games.',
        examples: ['play football', 'play tennis', 'play badminton', 'play basketball', 'play chess'],
      },
      {
        category: 'DO (ต่อสู้ / เดี่ยว)',
        ruleTh: 'ใช้กับศิลปะการต่อสู้ การออกกำลังกายที่ไม่ใช้อุปกรณ์บอล และกิจกรรมเพื่อสุขภาพส่วนบุคคล',
        ruleEn: 'Martial arts, individual exercise, and non-ball recreational training.',
        examples: ['do karate', 'do taekwondo', 'do judo', 'do gymnastics', 'do aerobics'],
      },
      {
        category: 'GO (-ING / เคลื่อนที่)',
        ruleTh: 'ใช้กับกิจกรรมกีฬาหรือการพักผ่อนกลางแจ้งที่รูปคำลงท้ายด้วย -ing',
        ruleEn: 'Sports, outdoor recreation, and movement activities ending in -ing.',
        examples: ['go swimming', 'go running', 'go cycling', 'go hiking', 'go skiing'],
      },
    ],
    quickQuizzes: [
      {
        id: 'quiz-pdg-1',
        stemTh: 'ธนากรชอบเล่นยูโดในวันอังคาร และไปว่ายน้ำในวันศุกร์',
        stemEn: 'Tanakorn loves to _____ judo on Tuesday and _____ swimming on Friday.',
        options: [
          { key: 'A', text: 'do / go' },
          { key: 'B', text: 'play / go' },
          { key: 'C', text: 'do / play' },
          { key: 'D', text: 'play / do' },
        ],
        correctAnswer: 'A',
        explanationTh: 'judo เป็นศิลปะการต่อสู้ ใช้ "do" | swimming ลงท้ายด้วย -ing ใช้ "go"',
      },
      {
        id: 'quiz-pdg-2',
        stemTh: 'ครอบครัวของเรามักเล่นแบดมินตันในสวนหลังบ้านหลังเลิกงาน',
        stemEn: 'Our family often _____ badminton in the backyard after work.',
        options: [
          { key: 'A', text: 'plays' },
          { key: 'B', text: 'does' },
          { key: 'C', text: 'goes' },
          { key: 'D', text: 'makes' },
        ],
        correctAnswer: 'A',
        explanationTh: 'badminton เป็นกีฬาแข่งขันตีลูกขนไก่ ใช้กริยา "play"',
      },
    ],
  },
  {
    id: 'do-vs-make',
    targetCefr: 'A2–B2',
    titleTh: 'คัมภีร์ตัดคะแนน: Do vs. Make',
    titleEn: 'Action & Creation Matrix: Do vs. Make',
    summaryTh: 'DO ใช้กับหน้าที่ ภาระงาน และการกระทำทั่วไป | MAKE ใช้กับการสร้าง ผลิตผลลัพธ์ การตัดสินใจ และการสื่อสาร',
    keyTakeawaysTh: [
      'DO: งานบ้าน หน้าที่ประจำ งานอาชีพ และการค้นคว้าที่ไม่ก่อให้เกิดวัตถุชิ้นใหม่ทางกายภาพ',
      'MAKE: การประดิษฐ์ ผลิตอาหาร การตัดสินใจ การตกลงนัดหมาย และการส่งเสียง/การสื่อสาร',
      'สูตรลัด: DO the job, MAKE a change!',
    ],
    matrixRules: [
      {
        category: 'DO (หน้าที่ / งาน)',
        ruleTh: 'ใช้กับหน้าที่ประจำ งานบ้าน งานอาชีพ และการค้นคว้า',
        ruleEn: 'Obligations, household chores, general work, and academic research.',
        examples: ['do homework', 'do research', 'do business', 'do the dishes', "do one's best"],
      },
      {
        category: 'MAKE (สร้างใหม่ / ตัดสินใจ)',
        ruleTh: 'ใช้กับการประดิษฐ์ ผลิตอาหาร การตัดสินใจ การตกลงนัดหมาย และการส่งเสียง',
        ruleEn: 'Creating tangible objects, formulating plans, speech acts, and critical decisions.',
        examples: ['make a decision', 'make a mistake', 'make an appointment', 'make a phone call', 'make money'],
      },
    ],
    quickQuizzes: [
      {
        id: 'quiz-domake-1',
        stemTh: 'ก่อนที่คุณจะตัดสินใจขั้นสุดท้าย คุณควรจะค้นคว้าข้อมูลเพิ่มเติม',
        stemEn: 'Before you _____ a final decision, you should _____ more research.',
        options: [
          { key: 'A', text: 'make / do' },
          { key: 'B', text: 'do / make' },
          { key: 'C', text: 'make / make' },
          { key: 'D', text: 'do / do' },
        ],
        correctAnswer: 'A',
        explanationTh: 'decision ใช้คู่กับ "make a decision" | research ใช้คู่กับ "do research"',
      },
      {
        id: 'quiz-domake-2',
        stemTh: 'คุณช่วยอะไรฉันสักอย่าง และช่วยฉันต่อสายโทรศัพท์นี้ได้ไหม?',
        stemEn: 'Can you please _____ me a favor and help me _____ this phone call?',
        options: [
          { key: 'A', text: 'do / make' },
          { key: 'B', text: 'make / do' },
          { key: 'C', text: 'do / do' },
          { key: 'D', text: 'make / make' },
        ],
        correctAnswer: 'A',
        explanationTh: 'favor ใช้คู่กับ "do someone a favor" | phone call ใช้คู่กับ "make a phone call"',
      },
    ],
  },
  {
    id: 'oopt-cefr-score-architecture',
    targetCefr: 'A1–C2',
    titleTh: 'โครงสร้างข้อสอบ OOPT & ตารางคะแนน CEFR 0–120',
    titleEn: 'Oxford Online Placement Test (OOPT) Complete Architecture Guide',
    summaryTh: 'คู่มือโครงสร้างข้อสอบ Computer-Adaptive Test (CAT) และสเกลคะแนนเทียบเคียงระดับ CEFR',
    keyTakeawaysTh: [
      'Use of English (30 ข้อ): วัด Part 1 Form, Part 2 Meaning in Conversation, Part 3 Open Cloze',
      'Listening (15 ข้อ): วัดความเข้าใจบทสนทนาและประกาศในชีวิตประจำวัน',
      'คะแนน 0–120: 1–20 (A1), 21–40 (A2), 41–60 (B1), 61–80 (B2), 81–100 (C1), >100 (C2)',
    ],
    matrixRules: [
      {
        category: 'Part 1: Use of English',
        ruleTh: 'สั้น 2 บรรทัด วัดไวยากรณ์, กาล, บุพบท, Collocations และ Phrasal Verbs',
        ruleEn: 'Short Dialogues focusing on grammatical form and collocations.',
        examples: ['Tense agreement', 'Prepositions', 'Conditionals', 'Passive forms'],
      },
      {
        category: 'Part 2: Meaning in Context',
        ruleTh: 'วัดการตีความหมายแฝง เจตนาที่แท้จริงของผู้พูด และสำนวนในบทสนทนา',
        ruleEn: 'Focus on pragmatic meaning and conversational nuance.',
        examples: ['What does she mean?', 'Idiomatic nuance', 'Indirect requests'],
      },
      {
        category: 'Part 3: Open Cloze',
        ruleTh: 'บทอ่านสั้น 1–2 ย่อหน้า เติมคำศัพท์ทางไวยากรณ์ 1 คำในแต่ละช่องว่าง',
        ruleEn: 'Gap-fill in connected text focusing on function words.',
        examples: ['Articles (a, an, the)', 'Prepositions (in, on, at)', 'Relative pronouns (which, that)'],
      },
    ],
    quickQuizzes: [
      {
        id: 'quiz-oopt-1',
        stemTh: 'ข้อใดคือช่วงคะแนน OOPT ที่เทียบเท่าระดับ B2 (Vantage)?',
        stemEn: 'Which score range on the Oxford Online Placement Test corresponds to CEFR B2?',
        options: [
          { key: 'A', text: '61–80 คะแนน' },
          { key: 'B', text: '41–60 คะแนน' },
          { key: 'C', text: '81–100 คะแนน' },
          { key: 'D', text: '21–40 คะแนน' },
        ],
        correctAnswer: 'A',
        explanationTh: 'ระดับ B2 (Vantage) บน Oxford Scale มีช่วงคะแนนอยู่ที่ 61–80 คะแนน',
      },
      {
        id: 'quiz-oopt-2',
        stemTh: 'ข้อใดถูกต้องเกี่ยวกับระบบ Computer-Adaptive Testing (CAT) ใน OOPT?',
        stemEn: 'Which statement accurately describes the Computer-Adaptive Testing (CAT) algorithm in OOPT?',
        options: [
          { key: 'A', text: 'ปรับความยากตามคำตอบของผู้สอบทันทีเพื่อหาจุดความสามารถที่แท้จริง' },
          { key: 'B', text: 'สุ่มข้อสอบ 100 ข้อแบบคงที่ไม่เปลี่ยนแปลง' },
          { key: 'C', text: 'ให้เวลาเท่ากันทุกข้อโดยไม่มีการปรับความยาก' },
          { key: 'D', text: 'ตรวจเฉพาะข้อที่ตอบถูกโดยไม่หักคะแนนข้อที่ตอบผิด' },
        ],
        correctAnswer: 'A',
        explanationTh: 'CAT จะปรับระดับความยากตามการตอบถูก/ผิดของผู้สอบแบบเรียลไทม์เพื่อระบุระดับความสามารถ (Theta) อย่างแม่นยำ',
      },
    ],
  },
];
