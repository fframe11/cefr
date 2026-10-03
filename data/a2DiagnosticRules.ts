/**
 * ==============================================================================
 * GLOVA CEFR A2 Diagnostic High-Yield Grammar Rules & Practice (Aj. Plar Guidelines)
 * ==============================================================================
 *
 * Sourced and synthesized from "-เฉลย + อภิบายละเอียด Pretest - A2 - อาจารย์ปลา.pdf"
 * Covers high-frequency exam traps in CEFR A2 placement tests (SUT & OOPT).
 * Invariant: 100% original pedagogical text (Zero allergen / zero plagiarism).
 * ==============================================================================
 */

export interface DiagnosticRule {
  id: string;
  ruleTitleEn: string;
  ruleTitleTh: string;
  summaryTh: string;
  structure: string;
  examples: Array<{ en: string; th: string; isCorrect: boolean; note?: string }>;
  examTrapTh: string;
}

export interface DiagnosticQuestion {
  id: string;
  ruleId: string;
  cefrLevel: 'A2';
  promptEn: string;
  promptTh: string;
  options: Array<{ key: string; text: string; isCorrect: boolean }>;
  explanationTh: string;
  explanationEn: string;
  trapType: string;
}

export const A2_DIAGNOSTIC_RULES_LIST: DiagnosticRule[] = [
  {
    id: 'rule-let-vs-allow',
    ruleTitleEn: 'Permission Verbs: "Let" vs "Allow"',
    ruleTitleTh: 'คำกริยาแสดงการอนุญาต: "Let" vs "Allow"',
    summaryTh: 'ทั้งสองคำแปลว่า "อนุญาต/ปล่อยให้" แต่มีโครงสร้างไวยากรณ์ตามหลังที่แตกต่างกันอย่างสิ้นเชิง',
    structure: '• let + คน/สัตว์ + V.inf (กริยาไม่เปลี่ยนรูป ไม่มี to)\n• allow + คน/สัตว์ + to + V.inf (ต้องมี to นำหน้า)',
    examples: [
      { en: 'They let the puppies play in the living room.', th: 'พวกเขาปล่อยให้ลูกสุนัขเล่นในห้องนั่งเล่น', isCorrect: true },
      { en: 'They let the puppies to play in the garden.', th: 'ผิด! หลัง let ต้องไม่มี to', isCorrect: false, note: 'หลัง let ห้ามใช้ to + verb' },
      { en: 'The university allows students to borrow five books at a time.', th: 'มหาวิทยาลัยอนุญาตให้นักศึกษายืมหนังสือได้ครั้งละ 5 เล่ม', isCorrect: true },
      { en: 'The manager allowed us leave early.', th: 'ผิด! หลัง allow ต้องมี to', isCorrect: false, note: 'หลัง allow ต้องมี to นำหน้ากริยาเสมอ' },
    ],
    examTrapTh: 'ข้อสอบมักจะหลอกโดยเอา "let + to V" หรือ "allow + V ไม่เติม to" มาให้เลือก จำง่ายๆ: "Let ไม่มี to, Allow ต้องมี to"',
  },
  {
    id: 'rule-some-vs-any',
    ruleTitleEn: 'Quantifiers: "Some" vs "Any" (Exceptions & Offers)',
    ruleTitleTh: 'คำบอกปริมาณ: "Some" vs "Any" (และข้อยกเว้นการยื่นข้อเสนอ)',
    summaryTh: 'กฎพื้นฐาน: some ใช้บอกเล่า, any ใช้ปฏิเสธและคำถาม แต่มีข้อยกเว้นสำคัญในการสอบ CEFR',
    structure: '• some: ประโยคบอกเล่า + ประโยคคำถามที่ยื่นข้อเสนอ/ขอร้อง (Would you like some...?)\n• any: ประโยคปฏิเสธ (don\'t have any...) + ประโยคคำถามทั่วไปเพื่อถามว่ามีหรือไม่ (Are there any...?)',
    examples: [
      { en: 'I have some interesting news for you.', th: 'ฉันมีข่าวที่น่าสนใจจะบอกคุณ (บอกเล่า)', isCorrect: true },
      { en: 'Would you like some fresh orange juice?', th: 'คุณอยากรับน้ำส้มคั้นสักหน่อยไหม? (คำถามยื่นข้อเสนอ -> ใช้ some)', isCorrect: true },
      { en: 'Could I have some more time to finish the exam?', th: 'ขอเวลาทำข้อสอบเพิ่มอีกสักหน่อยได้ไหม? (คำถามขอร้อง -> ใช้ some)', isCorrect: true },
      { en: 'We do not have any extra chairs in this room.', th: 'พวกเราไม่มีเก้าอี้เสริมในห้องนี้เลย (ปฏิเสธ -> ใช้ any)', isCorrect: true },
      { en: 'Do you have any questions regarding the schedule?', th: 'คุณมีคำถามใดๆ เกี่ยวกับตารางเวลาหรือไม่? (คำถามทั่วไป -> ใช้ any)', isCorrect: true },
    ],
    examTrapTh: 'ถ้าเห็นประโยคขึ้นต้นด้วย "Would you like...?" หรือ "Could I have...?" แม้จะมีเครื่องหมาย ? ก็ต้องเลือก "some" ห้ามเลือก "any"',
  },
  {
    id: 'rule-by-myself-on-my-own',
    ruleTitleEn: 'Idiomatic Independence: "By myself" vs "On my own"',
    ruleTitleTh: 'การบอกว่า "ด้วยตนเอง / ตามลำพัง": "By myself" vs "On my own"',
    summaryTh: 'ภาษาอังกฤษมีสำนวนบอกว่าทำสิ่งใดด้วยตนเองหรืออยู่ตามลำพัง 2 แบบหลัก ห้ามนำมารวมกัน',
    structure: '• by + reflexive pronoun (by myself / by yourself / by himself)\n• on + possessive + own (on my own / on your own / on their own)',
    examples: [
      { en: 'She completed the entire project by herself.', th: 'เธอทำโครงงานทั้งหมดให้เสร็จด้วยตัวเธอเอง', isCorrect: true },
      { en: 'He has lived on his own since moving to university.', th: 'เขาใช้ชีวิตอยู่ตามลำพังคนเดียวตั้งแต่ย้ายมาเรียนมหาวิทยาลัย', isCorrect: true },
      { en: 'I solved the puzzle by on my own.', th: 'ผิดอย่างยิ่ง! นำ by มารวมกับ on my own', isCorrect: false, note: 'ห้ามเขียน by on my own ซ้ำซ้อน' },
    ],
    examTrapTh: 'ถ้าโจทย์มีคำว่า "by" อยู่หน้าช่องว่างแล้ว ช้อยส์จะหลอกใส่ "my own" มา ถ้าตอบจะกลายเป็น "by on my own" ซึ่งผิด ต้องเลือก "myself"',
  },
  {
    id: 'rule-possessive-apostrophe-vs-of',
    ruleTitleEn: 'Possession: Apostrophe S (\'s) vs Preposition "Of"',
    ruleTitleTh: 'การแสดงความเป็นเจ้าของ: การใช้ \'s vs การใช้ of',
    summaryTh: 'สิ่งมีชีวิตนิยมใช้ \'s ส่วนสิ่งไม่มีชีวิต สถานที่ หรือนามธรรมนิยมใช้ of',
    structure: '• คน/สัตว์ (สิ่งมีชีวิต): เจ้าของ + \'s + สิ่งที่ครอบครอง (David\'s laptop, the cat\'s food)\n• สิ่งของ/สถานที่ (สิ่งไม่มีชีวิต): สิ่งที่ครอบครอง + of + เจ้าของ (the capital of Thailand, the leg of the table)',
    examples: [
      { en: "David's laptop is on the study desk.", th: "แล็ปท็อปของเดวิดอยู่บนโต๊ะหนังสือ (คน -> ใช้ 's)", isCorrect: true },
      { en: 'Bangkok is the capital of Thailand.', th: 'กรุงเทพฯ เป็นเมืองหลวงของประเทศไทย (สถานที่ -> ใช้ of)', isCorrect: true },
      { en: "The table's leg is broken.", th: 'ไม่เป็นธรรมชาติ! สิ่งของควรใช้ the leg of the table', isCorrect: false, note: 'สิ่งของไม่มีชีวิตนิยมใช้ of' },
    ],
    examTrapTh: 'ระวังข้อสอบที่มีคำนามอยู่หลังช่องว่าง เช่น "... phone" จะต้องเลือก Possessive Adjective เช่น his, her, their ไปขยายคำนาม',
  },
  {
    id: 'rule-articles-a-an-the',
    ruleTitleEn: 'Articles: Indefinite (A/An) vs Definite (The)',
    ruleTitleTh: 'คำนำหน้านาม: ทั่วไป (a/an) vs ชี้เฉพาะ (the)',
    summaryTh: 'a/an ใช้กับนามนับได้เอกพจน์เมื่อกล่าวถึงลอยๆ ครั้งแรก ส่วน the ใช้เมื่อชี้เฉพาะหรือผู้ฟังทราบอยู่แล้ว',
    structure: '• a/an: สิ่งของ 1 ชิ้น ทั่วไป ผู้ฟังยังไม่รู้ว่าเป็นชิ้นไหน (I saw a white cat.)\n• the: นามชี้เฉพาะ หรือกล่าวซ้ำเป็นครั้งที่สอง (The cat was very friendly.)',
    examples: [
      { en: 'I bought a new book yesterday. The book is about artificial intelligence.', th: 'ฉันซื้อหนังสือใหม่ 1 เล่มเมื่อวานนี้ หนังสือเล่มนั้นเกี่ยวกับปัญญาประดิษฐ์', isCorrect: true },
      { en: 'Can you pass me the salt on the table, please?', th: 'ช่วยส่งขวดเกลือที่อยู่บนโต๊ะนั้นให้หน่อยได้ไหม? (ชี้เฉพาะขวดบนโต๊ะ -> ใช้ the)', isCorrect: true },
    ],
    examTrapTh: 'ถ้าสิ่งนั้นมีเพียงสิ่งเดียวในโลก (the sun, the moon, the internet) หรือมีคำขยายระบุตำแหน่งชัดเจน (the books on the shelf) ต้องใช้ "the"',
  },
  {
    id: 'rule-enough-word-order',
    ruleTitleEn: 'Word Order: "Enough" with Adjectives vs Nouns',
    ruleTitleTh: 'ลำดับคำ: ตำแหน่งของ "Enough" ร่วมกับคุณศัพท์และคำนาม',
    summaryTh: 'คำว่า enough มีตำแหน่งการวางที่ตรงกันข้ามกันอย่างสิ้นเชิงระหว่าง Adjective กับ Noun',
    structure: '• Adjective + enough (วางไว้หลังคุณศัพท์): tall enough, warm enough, fast enough\n• enough + Noun (วางไว้หน้าคำนาม): enough time, enough money, enough chairs',
    examples: [
      { en: 'Is the room warm enough for you?', th: 'ห้องนี้อุ่นพอสำหรับคุณไหม? (หลัง adjective)', isCorrect: true },
      { en: 'Is the room enough warm for you?', th: 'ผิด! enough ต้องอยู่หลัง warm', isCorrect: false, note: 'ห้ามวาง enough ไว้หน้า adjective' },
      { en: 'We do not have enough chairs for all attendees.', th: 'พวกเราไม่มีเก้าอี้เพียงพอสำหรับผู้เข้าร่วมทุกคน (หน้า noun)', isCorrect: true },
    ],
    examTrapTh: 'ข้อสอบ OOPT ชอบออกคำว่า "enough" หลอกมาก จำแม่นๆ: "คุณศัพท์มาก่อน enough, แต่นามอยู่หลัง enough"',
  },
];

export const A2_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'diag-q-1',
    ruleId: 'rule-let-vs-allow',
    cefrLevel: 'A2',
    promptEn: 'The flight attendant _____ passengers use portable electronics after takeoff.',
    promptTh: 'พนักงานต้อนรับบนเครื่องบิน_____ผู้โดยสารใช้อุปกรณ์อิเล็กทรอนิกส์พกพาหลังเครื่องขึ้น',
    options: [
      { key: 'A', text: 'lets', isCorrect: true },
      { key: 'B', text: 'allows to', isCorrect: false },
      { key: 'C', text: 'permits to', isCorrect: false },
      { key: 'D', text: 'let to', isCorrect: false },
    ],
    explanationTh: 'หลังช่องว่างมีกริยาช่อง 1 ที่ไม่มี to ("use") ดังนั้นต้องเลือก "lets" (let + someone + V.inf)',
    explanationEn: 'The base verb "use" follows without "to", so "lets" is grammatically required.',
    trapType: 'let_vs_allow_syntax',
  },
  {
    id: 'diag-q-2',
    ruleId: 'rule-let-vs-allow',
    cefrLevel: 'A2',
    promptEn: 'Our building policy does not allow residents _____ bicycles in the main hallway.',
    promptTh: 'กฎระเบียบของอาคารไม่อนุญาตให้ผู้อยู่อาศัย_____จักรยานในโถงทางเดินหลัก',
    options: [
      { key: 'A', text: 'park', isCorrect: false },
      { key: 'B', text: 'to park', isCorrect: true },
      { key: 'C', text: 'parking', isCorrect: false },
      { key: 'D', text: 'parked', isCorrect: false },
    ],
    explanationTh: 'เมื่อประโยคใช้กริยา "allow" กริยาที่ตามหลังกรรมต้องอยู่ในรูป "to + V.inf" เสมอ คือ "to park"',
    explanationEn: 'The verb "allow" requires an object followed by a to-infinitive ("to park").',
    trapType: 'allow_to_infinitive',
  },
  {
    id: 'diag-q-3',
    ruleId: 'rule-some-vs-any',
    cefrLevel: 'A2',
    promptEn: 'Would you like _____ homemade cookies with your hot green tea?',
    promptTh: 'คุณอยากรับคุกกี้โฮมเมดสักหน่อยทานคู่กับชาเขียวร้อนไหม?',
    options: [
      { key: 'A', text: 'any', isCorrect: false },
      { key: 'B', text: 'some', isCorrect: true },
      { key: 'C', text: 'much', isCorrect: false },
      { key: 'D', text: 'little', isCorrect: false },
    ],
    explanationTh: 'แม้จะเป็นประโยคคำถาม แต่เป็นการยื่นข้อเสนอ (Offering) อย่างสุภาพ จึงต้องใช้ "some" เสมอ',
    explanationEn: 'In polite offers beginning with "Would you like...?", "some" is used instead of "any".',
    trapType: 'some_polite_offer_exception',
  },
  {
    id: 'diag-q-4',
    ruleId: 'rule-some-vs-any',
    cefrLevel: 'A2',
    promptEn: 'I searched the kitchen cabinet, but there wasn’t _____ honey left for our tea.',
    promptTh: 'ฉันค้นตู้ในครัวดูแล้ว แต่ไม่มีน้ำผึ้งเหลือสำหรับชาของเราเลย',
    options: [
      { key: 'A', text: 'some', isCorrect: false },
      { key: 'B', text: 'any', isCorrect: true },
      { key: 'C', text: 'a few', isCorrect: false },
      { key: 'D', text: 'many', isCorrect: false },
    ],
    explanationTh: 'ประโยคนี้เป็นประโยคปฏิเสธ ("wasn’t") คำนามนับไม่ได้ ("honey") ต้องใช้คู่กับ "any"',
    explanationEn: 'Negative clauses ("wasn’t") take "any" for uncountable quantities.',
    trapType: 'any_negative_sentence',
  },
  {
    id: 'diag-q-5',
    ruleId: 'rule-by-myself-on-my-own',
    cefrLevel: 'A2',
    promptEn: 'Since her roommate was visiting family, Sunee studied in the quiet library by _____.',
    promptTh: 'เนื่องจากรูมเมทของเธอไปเยี่ยมครอบครัว สุนีย์จึงอ่านหนังสือในห้องสมุดอันเงียบสงบด้วยตัวเธอเอง',
    options: [
      { key: 'A', text: 'her own', isCorrect: false },
      { key: 'B', text: 'herself', isCorrect: true },
      { key: 'C', text: 'on herself', isCorrect: false },
      { key: 'D', text: 'her', isCorrect: false },
    ],
    explanationTh: 'มีคำว่า "by" อยู่หน้าช่องว่างแล้ว ต้องตามด้วย reflexive pronoun คือ "herself" (หากตอบ her own จะกลายเป็น by her own ซึ่งผิด)',
    explanationEn: 'The preposition "by" precedes the blank, requiring the reflexive pronoun "herself".',
    trapType: 'by_myself_vs_on_my_own',
  },
  {
    id: 'diag-q-6',
    ruleId: 'rule-enough-word-order',
    cefrLevel: 'A2',
    promptEn: 'We should hurry; do you think we have _____ time to catch the express train?',
    promptTh: 'พวกเราควรรีบหน่อย คุณคิดว่าพวกเรามีเวลาเพียงพอที่จะขึ้นรถไฟด่วนทันไหม?',
    options: [
      { key: 'A', text: 'enough', isCorrect: true },
      { key: 'B', text: 'too enough', isCorrect: false },
      { key: 'C', text: 'enough of', isCorrect: false },
      { key: 'D', text: 'sufficiently', isCorrect: false },
    ],
    explanationTh: 'คำว่า "time" เป็นคำนาม ตำแหน่งของ enough เมื่อใช้กับคำนามจะวางไว้หน้าคำนาม ("enough time")',
    explanationEn: '"enough" precedes nouns directly ("enough time").',
    trapType: 'enough_noun_position',
  },
];

export const A2_DIAGNOSTIC_RULES = {
  rules: A2_DIAGNOSTIC_RULES_LIST,
  diagnosticQuestions: A2_DIAGNOSTIC_QUESTIONS,
};

