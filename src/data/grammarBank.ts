import { GrammarTopic } from '../types';

export const GRAMMAR_BANK: GrammarTopic[] = [
  // A1: Present Simple vs Present Continuous
  {
    id: 'grammar-a1-present-tenses',
    titleEn: 'Present Simple vs. Present Continuous',
    titleTh: 'กาลปัจจุบันทั่วไป vs. กำลังกระทำในขณะนี้',
    cefrLevel: 'A1',
    summaryTh: 'เข้าใจความแตกต่างระหว่างสิ่งที่ทำเป็นประจำ (ความจริง/นิสัย) กับสิ่งที่กำลังเกิดขึ้นในวินาทีนี้',
    conceptTh: `ในภาษาอังกฤษ เมื่อต้องการบอกเล่าเรื่องราว เราต้องเลือกใช้ Tense ให้ตรงกับบริบทเวลา:
1. **Present Simple**: ใช้กับ "ความจริงทั่วไป", "กฎธรรมชาติ", หรือ "กิจวัตรประจำวัน/นิสัย"
   - เช่น ฉันดื่มกาแฟทุกเช้า (ทำเป็นประจำ)
2. **Present Continuous**: ใช้กับเหตุการณ์ที่ "กำลังเกิดขึ้นอยู่ ณ ตอนนี้" หรือ "กำลังดำเนินอยู่ในช่วงนี้"
   - เช่น ฉันกำลังดื่มกาแฟอยู่ (ถือแก้วดื่มอยู่ตอนนี้)`,
    conceptEn: 'Present Simple describes habits, general facts, and routines. Present Continuous describes actions happening right now at the moment of speaking.',
    rules: [
      {
        formula: 'Subject + V.1 (เติม -s/-es เมื่อประธานเป็น He, She, It)',
        explanationTh: 'Present Simple: สังเกตคำบอกความถี่ (always, usually, every day, often)',
        exampleEn: 'He walks to the office every morning.',
        exampleTh: 'เขาเดินไปที่ทำงานทุกเช้า (เป็นกิจวัตร)',
      },
      {
        formula: 'Subject + is/am/are + V.ing',
        explanationTh: 'Present Continuous: สังเกตคำบอกเวลา (now, at the moment, right now, Look!)',
        exampleEn: 'He is walking to the office right now.',
        exampleTh: 'เขากำลังเดินไปที่ทำงานอยู่ ณ ตอนนี้ (กำลังก้าวเดินอยู่)',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'She eat breakfast every day.',
        correct: 'She eats breakfast every day.',
        reasonTh: 'เมื่อประธานเป็นเอกพจน์ (She) ใน Present Simple กริยาต้องเติม -s หรือ -es เสมอ',
      },
      {
        incorrect: 'I am playing football every Sunday.',
        correct: 'I play football every Sunday.',
        reasonTh: 'ทุกวันอาทิตย์เป็นกิจวัตรที่ทำประจำ ต้องใช้ Present Simple ไม่ใช้ Present Continuous',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-a1-1',
        skill: 'grammar',
        cefrLevel: 'A1',
        type: 'multiple_choice',
        promptTh: 'เลือกรูปกริยาที่ถูกต้องสำหรับเหตุการณ์ที่กำลังเกิดขึ้นขณะพูด (Listen!)',
        promptEn: 'Listen! Someone _____ the guitar in the next room.',
        options: [
          { key: 'A', text: 'is playing', isCorrect: true, feedbackTh: 'ถูกต้อง! มีคำเตือน "Listen!" แปลว่ากำลังเกิดขึ้นตรงหน้า จึงใช้ is/am/are + V.ing' },
          { key: 'B', text: 'plays', isCorrect: false, feedbackTh: 'plays แสดงถึงการเล่นเป็นประจำ แต่มีคำว่า Listen! กำลังเกิดขึ้นตอนนี้' },
          { key: 'C', text: 'played', isCorrect: false, feedbackTh: 'played เป็นอดีต' },
          { key: 'D', text: 'play', isCorrect: false, feedbackTh: 'play ผิดทั้ง Tense และ Subject-Verb Agreement' }
        ],
        explanationTh: 'คำว่า "Listen!" (ฟังดูสิ!) เป็นสัญญาณเตือนว่าเหตุการณ์กำลังเกิดขึ้นในขณะนั้น จึงต้องใช้ Present Continuous (is playing).',
        explanationEn: 'Imperatives like "Listen!" signal an action occurring at the present moment, requiring the Present Continuous.',
        weaknessTag: 'present_simple_vs_continuous',
        difficultyWeight: 1,
      },
      {
        id: 'g-q-a1-2',
        skill: 'grammar',
        cefrLevel: 'A1',
        type: 'multiple_choice',
        promptTh: 'เลือกคำที่ถูกต้อง: กิจวัตรของดวงอาทิตย์ (ความจริงทางวิทยาศาสตร์)',
        promptEn: 'The sun _____ in the east and sets in the west.',
        options: [
          { key: 'A', text: 'is rising', isCorrect: false, feedbackTh: 'is rising หมายถึงกำลังขึ้น ณ ตอนนี้เท่านั้น แต่พระอาทิตย์ขึ้นทิศตะวันออกเป็นความจริงถาวร' },
          { key: 'B', text: 'rises', isCorrect: true, feedbackTh: 'ถูกต้อง! ความจริงตามธรรมชาติ (Scientific Fact) ต้องใช้ Present Simple ประธาน The sun เอกพจน์เติม -s' },
          { key: 'C', text: 'rose', isCorrect: false, feedbackTh: 'rose เป็นอดีต' },
          { key: 'D', text: 'risen', isCorrect: false, feedbackTh: 'risen เป็นกริยาช่อง 3 ไม่สามารถอยู่เดี่ยวๆ เป็นกริยาแท้ได้' }
        ],
        explanationTh: 'ปรากฏการณ์ธรรมชาติหรือข้อเท็จจริงสากล ถือเป็น Universal Truth ต้องใช้ Present Simple กริยาเอกพจน์เติม s (rises).',
        explanationEn: 'Universal scientific facts take the Present Simple (rises).',
        weaknessTag: 'present_simple_general_truth',
        difficultyWeight: 1,
      },
    ],
  },

  // A2: Past Simple vs Present Perfect
  {
    id: 'grammar-a2-past-perfect',
    titleEn: 'Past Simple vs. Present Perfect',
    titleTh: 'อดีตจบแล้ว vs. อดีตที่ยังเชื่อมโยงถึงปัจจุบัน',
    cefrLevel: 'A2',
    summaryTh: 'จุดปราบเซียนของผู้เรียนไทย: อดีตที่ระบุเวลาเจาะจง vs. ประสบการณ์หรือสิ่งที่ทำแล้วยังส่งผลต่อปัจจุบัน',
    conceptTh: `คนไทยมักสับสนระหว่าง Past Simple กับ Present Perfect เพราะในภาษาไทยใช้คำว่า "แล้ว" เหมือนกัน:
1. **Past Simple (Subject + V.2)**:
   - ใช้กับเหตุการณ์ที่ "เกิดขึ้นและจบลงไปแล้วในอดีตอย่างเด็ดขาด"
   - มักระบุเวลาชัดเจน เช่น yesterday, last night, 2 years ago, in 2020
   - ตัวอย่าง: I lost my key yesterday. (เมื่อวานทำกุญแจหาย ตอนนี้อาจหาเจอแล้วหรือไม่รู้ แต่เน้นว่าเมื่อวานหาย)
2. **Present Perfect (Subject + have/has + V.3)**:
   - ใช้พูดถึง "เหตุการณ์ในอดีตที่ยังส่งผลหรือยังเกี่ยวข้องกับปัจจุบัน"
   - หรือใช้บอก "ประสบการณ์ชีวิตว่าเคย/ไม่เคยทำ" โดยไม่เน้นเวลา
   - ตัวอย่าง: I have lost my key. (ฉันทำกุญแจหาย และ "ตอนนี้กุญแจก็ยังหายอยู่ เข้าบ้านไม่ได้")`,
    conceptEn: 'Past Simple specifies a finished action at a definite time in the past. Present Perfect connects a past action or experience to the present moment.',
    rules: [
      {
        formula: 'Subject + V.2',
        explanationTh: 'Past Simple: ระบุเวลาที่จบลงแล้วแน่นอน (yesterday, last month, when I was young)',
        exampleEn: 'We visited London in 2022.',
        exampleTh: 'พวกเราไปเที่ยวลอนดอนเมื่อปี 2022 (จบลงแล้วในปี 2022)',
      },
      {
        formula: 'Subject + have / has + V.3',
        explanationTh: 'Present Perfect: เหตุการณ์ตั้งแต่เริ่มในอดีตจนถึงตอนนี้ (since, for, already, yet, ever, never)',
        exampleEn: 'We have lived here for ten years.',
        exampleTh: 'พวกเราอาศัยอยู่ที่นี่มาเป็นเวลา 10 ปีแล้ว (และปัจจุบันก็ยังคงอยู่ที่นี่)',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I have seen him yesterday.',
        correct: 'I saw him yesterday.',
        reasonTh: 'มีคำระบุเวลาอดีตที่แน่นอน (yesterday) ห้ามใช้ Present Perfect ต้องใช้ Past Simple',
      },
      {
        incorrect: 'She lived in Bangkok since 2018.',
        correct: 'She has lived in Bangkok since 2018.',
        reasonTh: 'มีคำว่า "since" (ตั้งแต่) บอกจุดเริ่มต้นของเหตุการณ์ที่ยาวมาถึงปัจจุบัน ต้องใช้ Present Perfect',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-a2-1',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกรูปกริยาที่แสดงถึงประสบการณ์ (ถามว่าเคยไปญี่ปุ่นหรือไม่)',
        promptEn: '_____ you ever _____ to Japan?',
        options: [
          { key: 'A', text: 'Did / go', isCorrect: false, feedbackTh: 'Did you go ถามถึงช่วงเวลาเฉพาะเจาะจงในอดีต ไม่ได้ถามประสบการณ์ตลอดชีวิต' },
          { key: 'B', text: 'Do / go', isCorrect: false, feedbackTh: 'Do you go ถามถึงกิจวัตร' },
          { key: 'C', text: 'Have / been', isCorrect: true, feedbackTh: 'ถูกต้อง! Have you ever been to... เป็นรูปมาตรฐานในการถามว่าเคยไปที่ไหนหรือไม่' },
          { key: 'D', text: 'Were / being', isCorrect: false, feedbackTh: 'ผิดโครงสร้างไวยากรณ์' }
        ],
        explanationTh: 'เมื่อถามถึงประสบการณ์ตลอดชีวิตว่า "เคย...หรือไม่" จะใช้ Present Perfect: "Have you ever been to...?"',
        explanationEn: 'Present Perfect with "ever" is used to inquire about life experiences without referencing a specific time.',
        weaknessTag: 'present_perfect_experience',
        difficultyWeight: 2,
      },
    ],
  },

  // B1: Conditionals (First & Second Conditionals)
  {
    id: 'grammar-b1-conditionals',
    titleEn: 'Conditionals: Real vs. Unreal (Type 1 & 2)',
    titleTh: 'ประโยคเงื่อนไข: สิ่งที่เป็นไปได้จริง vs. สิ่งสมมติในปัจจุบัน',
    cefrLevel: 'B1',
    summaryTh: 'แยกแยะระหว่างเงื่อนไขที่เป็นไปได้จริงในอนาคต (Type 1) กับการจินตนาการสิ่งที่ไม่จริงในปัจจุบัน (Type 2)',
    conceptTh: `If-Clause มีบทบาทสำคัญอย่างยิ่งในการสอบ Cambridge PET และ FCE:
1. **First Conditional (เป็นไปได้จริงในอนาคต)**:
   - โครงสร้าง: If + Present Simple, will + กริยาช่อง 1
   - เช่น If it rains tomorrow, we will cancel the picnic. (ถ้าพรุ่งนี้ฝนตก เราจะยกเลิกการไปปิกนิก)
2. **Second Conditional (สมมติสิ่งที่ไม่จริงในปัจจุบัน / ฝันกลางวัน)**:
   - โครงสร้าง: If + Past Simple, would + กริยาช่อง 1
   - เช่น If I won the lottery, I would travel around the world. (ถ้าฉันถูกรางวัลที่ 1 ฉันจะไปเที่ยวรอบโลก, ตอนนี้ยังไม่ถูก เป็นเรื่องสมมติ)`,
    conceptEn: 'First Conditional deals with likely future events (If + present, will + infinitive). Second Conditional deals with hypothetical or improbable present/future events (If + past, would + infinitive).',
    rules: [
      {
        formula: 'If + Present Simple, will + V.inf',
        explanationTh: 'First Conditional: เหตุและผลที่เป็นไปได้จริงในอนาคต',
        exampleEn: 'If you study hard, you will pass the Cambridge test.',
        exampleTh: 'ถ้าคุณตั้งใจอ่านหนังสือ คุณจะสอบผ่านการสอบเคมบริดจ์แน่นอน',
      },
      {
        formula: 'If + Past Simple, would/could + V.inf',
        explanationTh: 'Second Conditional: สมมติตรงข้ามกับความจริงในปัจจุบัน (กริยา to be นิยมใช้ were กับทุกประธาน)',
        exampleEn: 'If I were you, I would accept the job offer.',
        exampleTh: 'ถ้าฉันเป็นคุณ ฉันจะตอบรับข้อเสนอการทำงานนี้ (ในความเป็นจริงฉันไม่ใช่คุณ)',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'If it will rain tomorrow, I will stay home.',
        correct: 'If it rains tomorrow, I will stay home.',
        reasonTh: 'หลัง If ใน First Conditional ห้ามใส่ will เด็ดขาด ให้ใช้ Present Simple (rains)',
      },
      {
        incorrect: 'If I had money, I will buy a car.',
        correct: 'If I had money, I would buy a car.',
        reasonTh: 'ใน Second Conditional เมื่อประโยคเงื่อนไขเป็น had (Past) ประโยคหลักต้องคู่กับ would ไม่ใช่ will',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-b1-1',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'เลือกคำตอบที่ถูกต้องสำหรับ First Conditional (ระวังเรื่อง will หลัง If)',
        promptEn: 'If the client _____ the contract today, we _____ work immediately.',
        options: [
          { key: 'A', text: 'will sign / start', isCorrect: false, feedbackTh: 'หลัง If ห้ามใช้ will' },
          { key: 'B', text: 'signs / would start', isCorrect: false, feedbackTh: 'Present Simple ต้องคู่กับ will ไม่ใช่ would' },
          { key: 'C', text: 'signed / will start', isCorrect: false, feedbackTh: 'Tense ไม่สอดคล้องกัน (signed เป็นอดีตแต่ใช้ will)' },
          { key: 'D', text: 'signs / will start', isCorrect: true, feedbackTh: 'ถูกต้อง! โครงสร้าง If + Present Simple (signs), will + V.inf (will start)' }
        ],
        explanationTh: 'First Conditional: ประโยคหลัง If ต้องใช้ Present Simple (The client signs) และประโยคผลลัพธ์ใช้ will + base verb (will start).',
        explanationEn: 'First conditional formula: If + present simple, will + bare infinitive.',
        weaknessTag: 'first_conditional_rules',
        difficultyWeight: 3,
      },
    ],
  },

  // B2: Passive Voice & Relative Clauses
  {
    id: 'grammar-b2-passive-relative',
    titleEn: 'Passive Voice & Defining/Non-Defining Relative Clauses',
    titleTh: 'ประธานถูกกระทำ & ประโยคขยายความ (Relative Clauses)',
    cefrLevel: 'B2',
    summaryTh: 'การใช้ภาษาทางการในข้อสอบ B2 First (FCE): เน้นผู้ถูกกระทำ และการขยายคำนามอย่างมีชั้นเชิง',
    conceptTh: `ในระดับ B2 การเขียนและการอ่านจะมีความเป็นทางการ (Formal) และซับซ้อนมากขึ้น:
1. **Passive Voice (ประธานถูกกระทำ)**:
   - โครงสร้าง: Subject + be + V.3
   - นิยมใช้ในรายงานข่าว บทความวิชาการ หรือเมื่อไม่ต้องการเน้นตัวผู้กระทำ
2. **Relative Clauses (ประโยคเชื่อมความ)**:
   - **Defining Clause**: ให้ข้อมูลชี้เฉพาะ ถ้าตัดออกจะสื่อความหมายไม่ครบ (ไม่ต้องใส่เครื่องหมายจุลภาค ,)
   - **Non-Defining Clause**: ให้ข้อมูลเสริม ถ้าตัดออกประโยคหลักก็ยังสมบูรณ์ (ต้องใส่เครื่องหมายจุลภาค , คั่นหน้าหลัง และห้ามใช้ that)`,
    conceptEn: 'Passive Voice highlights the action/receiver rather than the agent. Relative clauses combine ideas smoothly using relative pronouns (who, which, that, where, whose).',
    rules: [
      {
        formula: 'Subject + is/are/was/were/been + V.3 (+ by agent)',
        explanationTh: 'Passive Voice โครงสร้างพื้นฐาน',
        exampleEn: 'The historic bridge was designed by a British engineer in 1895.',
        exampleTh: 'สะพานประวัติศาสตร์แห่งนี้ถูกออกแบบโดยวิศวกรชาวอังกฤษในปี 1895',
      },
      {
        formula: 'Main Clause, [who/which + additional info], ...',
        explanationTh: 'Non-defining relative clause ต้องมี comma และห้ามใช้ that',
        exampleEn: 'Bangkok, which is the capital of Thailand, welcomes millions of tourists annually.',
        exampleTh: 'กรุงเทพฯ ซึ่งเป็นเมืองหลวงของไทย ต้อนรับนักท่องเที่ยวหลายล้านคนต่อปี',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'My car, that I bought last year, is very reliable.',
        correct: 'My car, which I bought last year, is very reliable.',
        reasonTh: 'ใน Non-defining clause (ที่มีเครื่องหมาย comma คั่น) ห้ามใช้ that ให้ใช้ which หรือ who เท่านั้น',
      },
      {
        incorrect: 'The report was wrote yesterday.',
        correct: 'The report was written yesterday.',
        reasonTh: 'Passive Voice ต้องใช้กริยาช่อง 3 (Past Participle: written) เสมอ ไม่ใช่ช่อง 2 (wrote)',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-b2-1',
        skill: 'grammar',
        cefrLevel: 'B2',
        type: 'multiple_choice',
        promptTh: 'เลือกประโยค Relative Clause ที่ถูกต้องตามหลักไวยากรณ์ (สังเกต comma)',
        promptEn: 'Professor Davies, _____ lectures on neurobiology are acclaimed worldwide, will retire this semester.',
        options: [
          { key: 'A', text: 'whose', isCorrect: true, feedbackTh: 'ถูกต้อง! whose แสดงความเป็นเจ้าของ (การบรรยายของศาสตราจารย์เดวิส)' },
          { key: 'B', text: 'who', isCorrect: false, feedbackTh: 'who ใช้แทนประธาน แต่ในที่นี้ต้องการแสดงความเป็นเจ้าของ lectures' },
          { key: 'C', text: 'that', isCorrect: false, feedbackTh: 'ห้ามใช้ that ใน non-defining clause ที่มี comma' },
          { key: 'D', text: 'whom', isCorrect: false, feedbackTh: 'whom ทำหน้าที่เป็นกรรมของบุคคล' }
        ],
        explanationTh: '"whose" เป็น relative pronoun ที่ทำหน้าที่แสดงความเป็นเจ้าของคำนามที่ตามหลัง (whose lectures = การบรรยายของเขา).',
        explanationEn: '"whose" indicates possession relating back to the antecedent noun (Professor Davies).',
        weaknessTag: 'relative_pronoun_possession',
        difficultyWeight: 4,
      },
    ],
  },

  // C1: Negative Inversion & Mixed Conditionals
  {
    id: 'grammar-c1-inversion',
    titleEn: 'Negative Inversion & Mixed Conditionals',
    titleTh: 'การสลับประธานกริยาเพื่อเน้นย้ำ (Inversion) & เงื่อนไขข้ามกาลเวลา',
    cefrLevel: 'C1',
    summaryTh: 'ทักษะไวยากรณ์ระดับสูงสำหรับข้อสอบ C1 Advanced (CAE): สร้างประโยคที่ทรงพลังและแม่นยำทางวาทศิลป์',
    conceptTh: `ในภาษาอังกฤษระดับ C1-C2 โครงสร้างไวยากรณ์จะช่วยเพิ่มพลังความหมายและความสละสลวย:
1. **Negative Inversion (การกลับประโยค)**:
   - เมื่อเรานำคำวิเศษณ์ที่มีความหมายเชิงปฏิเสธหรือจำกัดความ (เช่น Never, Rarely, Seldom, Hardly, Under no circumstances) มาขึ้นต้นประโยค จะต้อง "สลับกริยาช่วย (Auxiliary Verb) มาไว้หน้าประธาน" เหมือนประโยคคำถาม
   - เช่น Rarely have I seen such dedication. (ไม่บ่อยนักที่ฉันเคยเห็นความทุ่มเทเช่นนี้)
2. **Mixed Conditionals (เงื่อนไขผสม)**:
   - เหตุในอดีตส่งผลต่อปัจจุบัน: If + Past Perfect, would + V.inf
   - เช่น If I had accepted that job last year, I would live in London now. (ถ้าปีที่แล้วฉันตกลงรับงานนั้น ปัจจุบันฉันคงอาศัยอยู่ในลอนดอน)`,
    conceptEn: 'Inversion places an auxiliary verb before the subject after negative or restrictive adverbs for emphasis. Mixed conditionals link a past hypothesis with a present consequence or vice versa.',
    rules: [
      {
        formula: 'Negative Word + Auxiliary Verb + Subject + Main Verb',
        explanationTh: 'Inversion หลังคำปฏิเสธ (Never, Seldom, Not only, Hardly...when)',
        exampleEn: 'Not only did they finish on time, but they also exceeded expectations.',
        exampleTh: 'ไม่เพียงแต่พวกเขาจะส่งงานทันเวลาเท่านั้น แต่พวกเขายังทำได้เกินความคาดหวังอีกด้วย',
      },
      {
        formula: 'If + Past Perfect (Had + V.3), would + V.inf (Now)',
        explanationTh: 'Mixed Conditional: อดีตไม่เกิดขึ้น ส่งผลให้ปัจจุบันเป็นอีกแบบหนึ่ง',
        exampleEn: 'If he had taken the medicine yesterday, he would feel better today.',
        exampleTh: 'ถ้าเมื่อวานเขาทานยา วันนี้เขาคงรู้สึกดีขึ้นแล้ว',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'Seldom I have heard such an insightful lecture.',
        correct: 'Seldom have I heard such an insightful lecture.',
        reasonTh: 'เมื่อขึ้นต้นประโยคด้วย Seldom ต้องสลับกริยาช่วย have มาไว้หน้าประธาน I เสมอ',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-c1-1',
        skill: 'grammar',
        cefrLevel: 'C1',
        type: 'multiple_choice',
        promptTh: 'เลือกโครงสร้าง Inversion ที่ถูกต้องเมื่อขึ้นต้นประโยคด้วย "Under no circumstances"',
        promptEn: 'Under no circumstances _____ allowed to access the server room without authorization.',
        options: [
          { key: 'A', text: 'visitors are', isCorrect: false, feedbackTh: 'ขาดการสลับประธานกริยาช่วย' },
          { key: 'B', text: 'are visitors', isCorrect: true, feedbackTh: 'ถูกต้อง! Inversion: Under no circumstances + are (auxiliary) + visitors (subject)' },
          { key: 'C', text: 'visitors were being', isCorrect: false, feedbackTh: 'ไม่ได้ทำ Inversion' },
          { key: 'D', text: 'have visitors', isCorrect: false, feedbackTh: 'have visitors allowed กลายเป็นรูป Active ที่ผิดความหมาย' }
        ],
        explanationTh: 'วลีปฏิเสธอย่างเข้มงวด "Under no circumstances" บังคับให้เกิด Inversion คือ สลับ verb to be หรือ auxiliary verb มาไว้หน้าประธาน.',
        explanationEn: 'Restricting phrases like "Under no circumstances" trigger subject-auxiliary inversion.',
        weaknessTag: 'negative_inversion_modal_auxiliary',
        difficultyWeight: 5,
      },
    ],
  },
];
