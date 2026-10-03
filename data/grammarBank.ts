import { GrammarTopic } from '../types';

export const GRAMMAR_BANK: GrammarTopic[] = [
  // 1. A1: Present Simple vs Present Continuous
  {
    id: 'grammar-a1-present-tenses',
    titleEn: 'Present Simple vs. Present Continuous',
    titleTh: 'กาลปัจจุบันทั่วไป vs. กำลังกระทำในขณะนี้',
    cefrLevel: 'A1',
    summaryTh: 'เข้าใจความแตกต่างระหว่างสิ่งที่ทำเป็นประจำ (ความจริง/นิสัย) กับสิ่งที่กำลังเกิดขึ้นในวินาทีนี้',
    conceptTh: `หัวใจสำคัญของการเลือกใช้สองกาลนี้อยู่ที่มิติของเวลาและความถี่ในการกระทำ

ข้อแรก Present Simple ใช้บอกเล่าเรื่องราวที่เป็นความจริงทั่วไป กฎเกณฑ์ตามธรรมชาติ หรือพฤติกรรมและกิจวัตรประจำวัน ตัวอย่างเช่น การดื่มกาแฟทุกเช้าเป็นนิสัยประจำตัว

ข้อสอง Present Continuous ใช้กับเหตุการณ์ที่กำลังเกิดขึ้นอยู่ต่อหน้าในขณะพูด หรือกำลังดำเนินอยู่ในช่วงเวลานี้ ตัวอย่างเช่น การกำลังถือแก้วกาแฟดื่มอยู่ในวินาทีนี้`,
    conceptEn: 'Present Simple describes habits, general facts, and routines. Present Continuous describes actions happening right now at the moment of speaking.',
    rules: [
      {
        formula: 'Subject + V.1 (เติม -s/-es เมื่อประธานเป็น He, She, It)',
        explanationTh: 'Present Simple: สังเกตคำบอกความถี่ เช่น always, usually, every day, often',
        exampleEn: 'He walks to the office every morning.',
        exampleTh: 'เขาเดินไปที่ทำงานทุกเช้า เป็นกิจวัตร',
      },
      {
        formula: 'Subject + is/am/are + V.ing',
        explanationTh: 'Present Continuous: สังเกตคำบอกเวลา เช่น now, at the moment, right now, Look!',
        exampleEn: 'He is walking to the office right now.',
        exampleTh: 'เขากำลังเดินไปที่ทำงานอยู่ ณ ตอนนี้ กำลังก้าวเดินอยู่',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'She eat breakfast every day.',
        correct: 'She eats breakfast every day.',
        reasonTh: 'เมื่อประธานเป็นเอกพจน์ (She) ใน Present Simple กริยาต้องเติม s หรือ es เสมอ',
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
          { key: 'A', text: 'plays', isCorrect: false, feedbackTh: 'plays แสดงถึงการเล่นเป็นประจำ แต่มีคำว่า Listen! กำลังเกิดขึ้นตอนนี้' },
          { key: 'B', text: 'is playing', isCorrect: true, feedbackTh: 'ถูกต้อง! มีคำเตือน "Listen!" แปลว่ากำลังเกิดขึ้นตรงหน้า จึงใช้ is/am/are + V.ing' },
          { key: 'C', text: 'played', isCorrect: false, feedbackTh: 'played เป็นอดีต' },
          { key: 'D', text: 'play', isCorrect: false, feedbackTh: 'play ผิดทั้ง Tense และ Subject-Verb Agreement' },
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
        promptTh: 'เลือกรูปกริยาที่แสดงกิจวัตรประจำวันที่เกิดขึ้นเป็นประจำ (every weekend)',
        promptEn: 'My brother usually _____ his bicycle in the park every weekend.',
        options: [
          { key: 'A', text: 'rides', isCorrect: true, feedbackTh: 'ถูกต้อง! ประธาน My brother (เอกพจน์บุรุษที่ 3) กับกิจวัตรประจำวัน กริยา ride เติม -s เป็น rides' },
          { key: 'B', text: 'is riding', isCorrect: false, feedbackTh: 'is riding ใช้กับเหตุการณ์ที่กำลังทำในขณะนี้ ไม่ใช่กิจวัตรประจำสัปดาห์' },
          { key: 'C', text: 'ride', isCorrect: false, feedbackTh: 'ride ไม่เติม s ขัดกับประธานเอกพจน์' },
          { key: 'D', text: 'rode', isCorrect: false, feedbackTh: 'rode เป็นอดีต แต่โจทย์ระบุ usually ... every weekend' },
        ],
        explanationTh: 'มีคำว่า usually และ every weekend แสดงถึงนิสัยหรือกิจวัตร ประธานเอกพจน์จึงใช้ Present Simple (rides).',
        explanationEn: 'Adverbs of frequency like "usually" and periodic markers like "every weekend" require Present Simple.',
        weaknessTag: 'present_simple_habits',
        difficultyWeight: 1,
      },
    ],
  },

  // 2. A1: Prepositions of Time and Place (In, On, At) [From Aj. Plar Guideline]
  {
    id: 'grammar-a1-prepositions-time-place',
    titleEn: 'Prepositions of Time & Place: In, On, At',
    titleTh: 'บุพบทบอกเวลาและสถานที่: In, On, At',
    cefrLevel: 'A1',
    summaryTh: 'หลักการจำพีระมิด In-On-At: จากขอบเขตกว้างใหญ่ (In) สู่พื้นผิว/วัน (On) สู่จุดเจาะจง/เวลาเป๊ะ (At)',
    conceptTh: `การใช้ In, On, At สามารถจำได้ง่ายผ่าน "พีระมิดคว่ำ" (จากกว้างไปแคบ):

1. มิติของเวลา (Time):
- IN (กว้างที่สุด): เดือน, ปี, ทศวรรษ, ฤดูกาล, ช่วงเวลาของวัน (in July, in 2026, in summer, in the morning)
- ON (แคบลงมา): วันในสัปดาห์, วันที่เฉพาะเจาะจง, วันสำคัญ (on Monday, on 15th April, on my birthday)
- AT (เจาะจงที่สุด): จุดเวลาบนหน้าปัดนาฬิกา, เวลาเฉพาะ (at 7:30 AM, at noon, at midnight, at night)

2. มิติของสถานที่ (Place):
- IN (พื้นที่ 3 มิติ / ขอบเขตกว้าง): เมือง, ประเทศ, ในห้อง, ในอาคาร (in Bangkok, in Thailand, in the kitchen)
- ON (พื้นผิว 2 มิติ / ถนน): บนพื้นผิว, บนถนน, บนยานพาหนะสาธารณะขนาดใหญ่ (on the table, on Sukhumvit Road, on the train)
- AT (จุดพิกัดเฉพาะ): สถานที่ระบุเจาะจง, เลขที่บ้าน, ป้ายรถเมล์ (at the bus stop, at home, at the airport, at 124 Main Street)`,
    conceptEn: 'In, On, and At follow a pyramid from general/broad to specific. For time: In (months/years) -> On (days/dates) -> At (clock times). For place: In (enclosed spaces/cities) -> On (surfaces/streets) -> At (specific points).',
    rules: [
      {
        formula: 'Time: In + Month/Year/Season | On + Day/Date | At + Specific Time',
        explanationTh: 'เวลา: In July / In 2026, On Friday / On 5th May, At 8:00 AM / At noon',
        exampleEn: 'The meeting starts at 9:00 AM on Monday in July.',
        exampleTh: 'การประชุมเริ่มเวลา 9 โมงเช้า ในวันจันทร์ เดือนกรกฎาคม',
      },
      {
        formula: 'Place: In + City/Country/Room | On + Street/Surface | At + Specific Spot',
        explanationTh: 'สถานที่: In Paris, On Silom Road / On the desk, At the station / At the entrance',
        exampleEn: 'She is waiting at the bus stop on Green Street in London.',
        exampleTh: 'เธอกำลังรออยู่ที่ป้ายรถเมล์ บนถนนกรีนสตรีท ในลอนดอน',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I will see you in Monday morning.',
        correct: 'I will see you on Monday morning.',
        reasonTh: 'แม้จะมีคำว่า morning แต่เมื่อมีวันระบุข้างหน้า (Monday morning) กฎของ "วัน" (On) จะชนะเสมอ',
      },
      {
        incorrect: 'The package arrived at July.',
        correct: 'The package arrived in July.',
        reasonTh: 'ชื่อเดือนโดดๆ โดยไม่มีวันที่ ต้องใช้ In เสมอ (เช่น in July, in December)',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-inon-1',
        skill: 'grammar',
        cefrLevel: 'A1',
        type: 'multiple_choice',
        promptTh: 'เลือกบุพบทที่ถูกต้องสำหรับวันที่ระบุชัดเจน',
        promptEn: 'Our final English examination will take place _____ 14th November.',
        options: [
          { key: 'A', text: 'on', isCorrect: true, feedbackTh: 'ถูกต้อง! มีวันที่ระบุ (14th November) ต้องใช้ on' },
          { key: 'B', text: 'in', isCorrect: false, feedbackTh: 'in ใช้กับชื่อเดือนลอยๆ ที่ไม่มีวันที่' },
          { key: 'C', text: 'at', isCorrect: false, feedbackTh: 'at ใช้กับเวลาบนหน้าปัดนาฬิกา' },
          { key: 'D', text: 'to', isCorrect: false, feedbackTh: 'to ไม่ใช่บุพบทบอกวัน' },
        ],
        explanationTh: 'เมื่อระบุวันที่มีตัวเลข (Date) ต้องใช้ preposition "on" เสมอ.',
        explanationEn: 'Specific calendar dates take the preposition "on".',
        weaknessTag: 'preposition_of_time',
        difficultyWeight: 1,
      },
      {
        id: 'g-q-inon-2',
        skill: 'grammar',
        cefrLevel: 'A1',
        type: 'multiple_choice',
        promptTh: 'เลือกบุพบทที่ถูกต้องสำหรับจุดพิกัดสถานที่เฉพาะ',
        promptEn: 'Let us meet _____ the entrance of the public library tomorrow.',
        options: [
          { key: 'A', text: 'at', isCorrect: true, feedbackTh: 'ถูกต้อง! the entrance เป็นจุดนัดพบพิกัดเจาะจง ใช้ at' },
          { key: 'B', text: 'on', isCorrect: false, feedbackTh: 'on ใช้กับพื้นผิวหรือถนน' },
          { key: 'C', text: 'in', isCorrect: false, feedbackTh: 'in ใช้กับภายในตัวอาคารหรือห้องปิด' },
          { key: 'D', text: 'under', isCorrect: false, feedbackTh: 'under แปลว่าข้างใต้ ไม่เข้ากับบริบท' },
        ],
        explanationTh: 'จุดนัดพบที่เจาะจงตำแหน่ง (point in space) เช่น the entrance, the bus stop ต้องใช้ "at".',
        explanationEn: 'Specific target points and entrances take the preposition "at".',
        weaknessTag: 'preposition_of_place',
        difficultyWeight: 1,
      },
    ],
  },

  // 3. A2: Past Simple vs Present Perfect
  {
    id: 'grammar-a2-past-vs-perfect',
    titleEn: 'Past Simple vs. Present Perfect',
    titleTh: 'อดีตจบสิ้นสมบูรณ์ vs. กาลเชื่อมโยงปัจจุบัน',
    cefrLevel: 'A2',
    summaryTh: 'แยกแยะระหว่างเหตุการณ์ที่มีเวลาในอดีตระบุชัดเจน (จบไปแล้ว) กับประสบการณ์หรือผลลัพธ์ที่ยังส่งผลถึงปัจจุบัน',
    conceptTh: `กุญแจสำคัญคือการดูว่า "เวลาจบสิ้นไปแล้วหรือยัง"

1. Past Simple: ใช้กับเหตุการณ์ที่เกิดขึ้นและสิ้นสุดลงแล้วอย่างเด็ดขาดในอดีต มักมีตัวบอกเวลาชัดเจน เช่น yesterday, last week, two years ago, in 2020

2. Present Perfect: ใช้กับประสบการณ์ในชีวิตที่ไม่ระบุเวลาแน่ชัด หรือเหตุการณ์ที่เริ่มในอดีตแต่ยังดำเนินอยู่จนถึงตอนนี้ หรือเพิ่งเสร็จสิ้นและมีผลปรากฏชัดในปัจจุบัน มักพบคำว่า since, for, already, yet, ever, never, just`,
    conceptEn: 'Past Simple is used for completed actions at a specific time in the past. Present Perfect connects the past to the present (experiences, unfinished time, or recent results).',
    rules: [
      {
        formula: 'Past Simple: Subject + V.2',
        explanationTh: 'ใช้เมื่อมีคำระบุเวลาอดีตชัดเจน (yesterday, in 2019, ago, last...)',
        exampleEn: 'We visited Chiang Mai last winter.',
        exampleTh: 'พวกเราไปเที่ยวเชียงใหม่เมื่อฤดูหนาวที่แล้ว (จบไปแล้ว)',
      },
      {
        formula: 'Present Perfect: Subject + have/has + V.3',
        explanationTh: 'ใช้เมื่อไม่ระบุเวลาที่แน่นอน เน้นผลลัพธ์หรือประสบการณ์ (since, for, already, yet)',
        exampleEn: 'We have visited Chiang Mai three times.',
        exampleTh: 'พวกเราเคยไปเที่ยวเชียงใหม่มาแล้วสามครั้ง (นับเป็นประสบการณ์ถึงปัจจุบัน)',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I have seen him yesterday.',
        correct: 'I saw him yesterday.',
        reasonTh: 'เมื่อมีคำบอกเวลาอดีตชัดเจนอย่าง yesterday ห้ามใช้ Present Perfect ต้องใช้ Past Simple (saw)',
      },
      {
        incorrect: 'She lived here since 2021.',
        correct: 'She has lived here since 2021.',
        reasonTh: 'มีคำว่า since (ตั้งแต่) แสดงว่าเริ่มในอดีตและยังอาศัยอยู่ถึงตอนนี้ ต้องใช้ Present Perfect',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-a2-1',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกโครงสร้างกริยาที่ถูกต้องเมื่อมีคำระบุเวลาอดีตชัดเจน (two days ago)',
        promptEn: 'Tanakorn _____ his mobile phone two days ago while walking in the park.',
        options: [
          { key: 'A', text: 'lost', isCorrect: true, feedbackTh: 'ถูกต้อง! มีเวลาชัดเจน two days ago จึงใช้ Past Simple (lost)' },
          { key: 'B', text: 'has lost', isCorrect: false, feedbackTh: 'ห้ามใช้ has lost กับเวลาอดีตที่ระบุแน่นอนเช่น two days ago' },
          { key: 'C', text: 'loses', isCorrect: false, feedbackTh: 'loses เป็นกาลปัจจุบัน' },
          { key: 'D', text: 'is losing', isCorrect: false, feedbackTh: 'is losing เป็นเหตุการณ์กำลังทำในปัจจุบัน' },
        ],
        explanationTh: 'คำบอกเวลา "two days ago" เป็นอดีตสมบูรณ์ จึงต้องใช้ Past Simple (lost).',
        explanationEn: 'Specific past time indicators like "two days ago" mandate the simple past tense.',
        weaknessTag: 'past_simple_vs_present_perfect',
        difficultyWeight: 2,
      },
    ],
  },

  // 4. A2: Sports & Activities: Play vs. Do vs. Go [From Aj. Plar Guideline]
  {
    id: 'grammar-a2-sports-play-do-go',
    titleEn: 'Sports & Activities: Play vs. Do vs. Go',
    titleTh: 'คำกริยากับกิจกรรมกีฬา: Play vs. Do vs. Go',
    cefrLevel: 'A2',
    summaryTh: 'หลักการจัดกลุ่มกีฬา: Play ใช้กับเกมลูกบอล/ทีม, Do ใช้กับศิลปะการต่อสู้/เดี่ยว, Go ใช้กับกิจกรรมที่ลงท้ายด้วย -ing',
    conceptTh: `ในภาษาอังกฤษ กิจกรรมกีฬาไม่ได้ใช้คำว่า play ทั้งหมด แต่แบ่งตามลักษณะอย่างเป็นระบบ:

1. PLAY: ใช้กับกีฬาที่มี "ลูกบอล" (Ball games), กีฬาที่มีการแข่งขันเป็นทีม, หรือเกมกระดานที่มีกติกาแพ้ชนะ
- ตัวอย่าง: play football, play tennis, play basketball, play badminton, play volleyball, play chess, play golf

2. DO: ใช้กับกีฬาประเภท "ศิลปะการต่อสู้" (Martial arts), การออกกำลังกายเดี่ยวที่ไม่ต้องมีลูกบอล, หรือกิจกรรมฝึกร่างกาย
- ตัวอย่าง: do yoga, do karate, do judo, do gymnastics, do aerobics, do martial arts, do Pilates

3. GO: ใช้กับกิจกรรมกีฬาและการเคลื่อนไหวที่คำศัพท์ลงท้ายด้วย "-ING" (มักเป็นการออกไปทำข้างนอก)
- ตัวอย่าง: go swimming, go running, go cycling, go jogging, go hiking, go skiing, go sailing, go fishing`,
    conceptEn: 'Play is used for ball games, team sports, and competitive games with rules. Do is used for individual sports, exercises, and martial arts. Go is used for activities ending in -ing.',
    rules: [
      {
        formula: 'PLAY + Ball games / Competitive sports / Board games',
        explanationTh: 'play football, play tennis, play chess, play badminton',
        exampleEn: 'They play badminton every Tuesday afternoon.',
        exampleTh: 'พวกเขาเล่นแบดมินตันทุกบ่ายวันอังคาร',
      },
      {
        formula: 'DO + Martial arts / Non-ball individual exercises',
        explanationTh: 'do yoga, do karate, do aerobics, do gymnastics',
        exampleEn: 'She does yoga at home to reduce stress.',
        exampleTh: 'เธอเล่นโยคะที่บ้านเพื่อผ่อนคลายความเครียด',
      },
      {
        formula: 'GO + Activities ending in -ING',
        explanationTh: 'go swimming, go cycling, go jogging, go hiking',
        exampleEn: 'We often go hiking in the national park.',
        exampleTh: 'พวกเราไปเดินป่าปีนเขาในอุทยานแห่งชาติบ่อยๆ',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I play swimming every morning.',
        correct: 'I go swimming every morning.',
        reasonTh: 'swimming ลงท้ายด้วย -ing ต้องใช้กริยา go เสมอ ห้ามใช้ play swimming',
      },
      {
        incorrect: 'She plays yoga on weekends.',
        correct: 'She does yoga on weekends.',
        reasonTh: 'yoga ไม่มีลูกบอลและไม่ใช่เกมแข่งขัน ต้องใช้กริยา do เสมอ',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-playdogo-1',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกคำกริยาที่ใช้คู่กับศิลปะการต่อสู้ (taekwondo)',
        promptEn: 'My younger sister started to _____ taekwondo when she was eight years old.',
        options: [
          { key: 'A', text: 'do', isCorrect: true, feedbackTh: 'ถูกต้อง! ศิลปะการต่อสู้ (Martial arts) ใช้กริยา do' },
          { key: 'B', text: 'play', isCorrect: false, feedbackTh: 'play ใช้กับกีฬาที่มีลูกบอลหรือการแข่งขันทีม' },
          { key: 'C', text: 'go', isCorrect: false, feedbackTh: 'go ใช้กับกิจกรรมที่ลงท้ายด้วย -ing' },
          { key: 'D', text: 'make', isCorrect: false, feedbackTh: 'make ไม่ใช้กับกีฬา' },
        ],
        explanationTh: 'กีฬาประเภทศิลปะการต่อสู้ เช่น karate, judo, taekwondo ต้องใช้กริยา "do".',
        explanationEn: 'Martial arts activities take the verb "do".',
        weaknessTag: 'collocation_sports_verbs',
        difficultyWeight: 2,
      },
      {
        id: 'g-q-playdogo-2',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกคำกริยาที่ใช้คู่กับกิจกรรมที่ลงท้ายด้วย -ing (cycling)',
        promptEn: 'Every Sunday morning, my friends and I _____ cycling around the lake.',
        options: [
          { key: 'A', text: 'go', isCorrect: true, feedbackTh: 'ถูกต้อง! กิจกรรมกีฬาที่ลงท้ายด้วย -ing ใช้กริยา go' },
          { key: 'B', text: 'play', isCorrect: false, feedbackTh: 'play cycling ผิดหลักไวยากรณ์' },
          { key: 'C', text: 'do', isCorrect: false, feedbackTh: 'do ไม่ใช้กับกีฬาที่ลงท้ายด้วย -ing' },
          { key: 'D', text: 'have', isCorrect: false, feedbackTh: 'have cycling ไม่มีความหมายในภาษาอังกฤษ' },
        ],
        explanationTh: 'กีฬาหรือกิจกรรมการเคลื่อนไหวที่ลงท้ายด้วย -ing เช่น cycling, running, swimming ใช้คู่กับ "go".',
        explanationEn: 'Recreational activities ending in "-ing" pair with "go".',
        weaknessTag: 'collocation_sports_verbs',
        difficultyWeight: 2,
      },
    ],
  },

  // 5. A2: Do vs. Make: Collocations & Essential Distinction [From Aj. Plar Guideline]
  {
    id: 'grammar-a2-action-do-make',
    titleEn: 'Do vs. Make: Collocations & Differences',
    titleTh: 'การใช้ Do vs. Make และกลุ่มคำคู่ที่พบบ่อย',
    cefrLevel: 'A2',
    summaryTh: 'Do ใช้กับการปฏิบัติงาน หน้าที่ และงานบ้าน | Make ใช้กับการสร้าง ผลิต ทำให้เกิดสิ่งใหม่ หรือการตัดสินใจ',
    conceptTh: `ความแตกต่างระหว่าง DO และ MAKE เป็นจุดตัดคะแนนสำคัญในการสอบ CEFR / OOPT:

1. DO (เน้น "การลงมือปฏิบัติ / หน้าที่ / งานประจำ"):
- งานบ้านและภาระงาน: do homework, do housework, do the dishes, do the laundry, do chores
- งานทั่วไปหรือการกระทำ: do business, do research, do an experiment, do an exercise, do a job
- การช่วยเหลือและความพยายาม: do someone a favor, do one's best, do good, do harm

2. MAKE (เน้น "การสร้างสิ่งใหม่ / ก่อให้เกิดผลลัพธ์ / การตัดสินใจ / เสียง"):
- การผลิตหรือทำอาหาร: make a cake, make coffee, make dinner, make a cup of tea
- การสื่อสารและการออกเสียง: make a phone call, make noise, make a speech, make a suggestion
- การวางแผนและการตัดสินใจ: make a decision, make a mistake, make an appointment, make an excuse, make money, make friends`,
    conceptEn: 'DO is used for actions, obligations, chores, and repetitive work. MAKE is used for creating, producing, originating something new, plans, and decisions.',
    rules: [
      {
        formula: 'DO + Homework / Research / Business / Chores / Best / Favor',
        explanationTh: 'ใช้กับงานที่เป็นหน้าที่ การกระทำที่ไม่ได้สร้างวัตถุใหม่',
        exampleEn: 'Could you please do me a favor?',
        exampleTh: 'คุณช่วยอะไรฉันสักอย่างได้ไหม?',
      },
      {
        formula: 'MAKE + Mistake / Decision / Appointment / Phone call / Money / Friends',
        explanationTh: 'ใช้กับการสร้าง ผลิต ก่อให้เกิดผล หรือการตัดสินใจ',
        exampleEn: 'I need to make an appointment with the doctor.',
        exampleTh: 'ฉันจำเป็นต้องนัดหมายกับคุณหมอ',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I did a lot of mistakes in the test.',
        correct: 'I made a lot of mistakes in the test.',
        reasonTh: 'mistake (ข้อผิดพลาด) ต้องใช้คู่กับ make เสมอ เป็น make a mistake / make mistakes',
      },
      {
        incorrect: 'Can you make your homework before dinner?',
        correct: 'Can you do your homework before dinner?',
        reasonTh: 'homework (การบ้าน) เป็นภาระหน้าที่ ต้องใช้ do homework เสมอ',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-domake-1',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกกริยาที่ใช้คู่กับคำว่า decision (การตัดสินใจ)',
        promptEn: 'After thinking carefully, the committee decided to _____ a final decision today.',
        options: [
          { key: 'A', text: 'make', isCorrect: true, feedbackTh: 'ถูกต้อง! การตัดสินใจใช้ make a decision' },
          { key: 'B', text: 'do', isCorrect: false, feedbackTh: 'do a decision ผิด collocation' },
          { key: 'C', text: 'take', isCorrect: false, feedbackTh: 'ในภาษาอังกฤษมาตรฐานใช้ make a decision' },
          { key: 'D', text: 'have', isCorrect: false, feedbackTh: 'have a decision ไม่เป็นที่นิยม' },
        ],
        explanationTh: 'คำว่า decision เป็นผลจากการเลือก ต้องใช้คู่กับกริยา "make" (make a decision).',
        explanationEn: 'The noun "decision" collocates with "make".',
        weaknessTag: 'collocation_do_vs_make',
        difficultyWeight: 2,
      },
      {
        id: 'g-q-domake-2',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกกริยาที่ใช้คู่กับการวิจัยทางวิทยาศาสตร์ (research)',
        promptEn: 'University professors must _____ extensive research before publishing their papers.',
        options: [
          { key: 'A', text: 'do', isCorrect: true, feedbackTh: 'ถูกต้อง! การทำวิจัยเป็นกระบวนการค้นคว้า ใช้ do research' },
          { key: 'B', text: 'make', isCorrect: false, feedbackTh: 'make research เป็นข้อผิดพลาดที่พบบ่อยมาก ต้องใช้ do research' },
          { key: 'C', text: 'create', isCorrect: false, feedbackTh: 'create research ไม่ใช้ในภาษาทางการ' },
          { key: 'D', text: 'build', isCorrect: false, feedbackTh: 'build research ผิดความหมาย' },
        ],
        explanationTh: 'คำว่า research (การวิจัย) เป็นคำนามนับไม่ได้ และต้องใช้คู่กับกริยา "do" (do research).',
        explanationEn: 'The academic noun "research" pairs with "do" (do research).',
        weaknessTag: 'collocation_do_vs_make',
        difficultyWeight: 2,
      },
    ],
  },

  // 6. A2: Countable vs. Uncountable Nouns & Quantifiers [From Pretest A2]
  {
    id: 'grammar-a2-nouns-quantifiers',
    titleEn: 'Countable vs. Uncountable Nouns & Quantifiers',
    titleTh: 'คำนามนับได้ vs. นับไม่ได้ และการใช้คำบอกปริมาณ',
    cefrLevel: 'A2',
    summaryTh: 'หลักการแยกคำนามที่คนไทยมักสับสน เช่น advice, information, furniture และการใช้ some/any, much/many',
    conceptTh: `คำนามในภาษาอังกฤษส่งผลโดยตรงต่อการเลือกใช้กริยาและคำบอกปริมาณ:

1. คำนามนับไม่ได้ยอดฮิตในข้อสอบ (ห้ามเติม -s และห้ามใช้ a/an นำหน้า):
- information (ข้อมูล), advice (คำแนะนำ), furniture (เฟอร์นิเจอร์), luggage / baggage (สัมภาระ), equipment (อุปกรณ์), homework (การบ้าน), news (ข่าว - ลงท้าย s แต่เป็นเอกพจน์)

2. กฎการเลือกคำบอกปริมาณ (Quantifiers):
- นับได้พหูพจน์: many, a few, few, a number of
- นับไม่ได้: much, a little, little, an amount of
- ใช้ได้ทั้งสองแบบ: some, any, a lot of, plenty of

3. ข้อยกเว้นสำคัญของการใช้ SOME ในประโยคคำถาม:
- ตามปกติ ANY ใช้ในประโยคปฏิเสธและคำถาม
- แต่ถ้าเป็นคำถามเชิง "ยื่นข้อเสนอ" (Offering) หรือ "ขอร้อง" (Requesting) เช่น พนักงานถามว่ารับเครื่องดื่มเพิ่มไหม ต้องใช้ SOME!
  ตัวอย่าง: "Would you like some tea?" (ไม่ใช่ any)`,
    conceptEn: 'Uncountable nouns (advice, information, luggage, furniture) never take -s or "a/an". Use "many/few" for countable plural, "much/little" for uncountable. "Some" is used in offers and requests.',
    rules: [
      {
        formula: 'Many / A few / Few + Countable Plural Nouns',
        explanationTh: 'many books, a few students, few apples',
        exampleEn: 'She has many friends in London.',
        exampleTh: 'เธอมีเพื่อนหลายคนในลอนดอน',
      },
      {
        formula: 'Much / A little / Little + Uncountable Nouns',
        explanationTh: 'much information, a little advice, little water',
        exampleEn: 'The doctor gave me some helpful advice.',
        exampleTh: 'คุณหมอให้คำแนะนำที่เป็นประโยชน์แก่ฉัน (advice ไม่เติม s)',
      },
      {
        formula: 'Would you like + SOME + Noun? (Offering Exception)',
        explanationTh: 'ใช้ some ในประโยคคำถามเมื่อเป็นการเสนอให้หรือขอร้อง',
        exampleEn: 'Would you like some fresh water?',
        exampleTh: 'คุณต้องการดื่มน้ำเปล่าสักหน่อยไหม?',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'He gave me many good advices.',
        correct: 'He gave me a lot of good advice.',
        reasonTh: 'advice เป็นคำนามนับไม่ได้ ห้ามเติม -s และห้ามใช้ many (ต้องใช้ a lot of advice หรือ pieces of advice)',
      },
      {
        incorrect: 'Would you like any dessert after lunch?',
        correct: 'Would you like some dessert after lunch?',
        reasonTh: 'ประโยคเสนอสิ่งของให้ผู้ฟัง (Offering) ต้องใช้ some ไม่ใช่ any',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-noun-1',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกคำตอบที่ถูกต้องสำหรับการยื่นข้อเสนอของหวานในร้านอาหาร',
        promptEn: 'Waiter: "Would you like _____ dessert before we bring the bill?"',
        options: [
          { key: 'A', text: 'some', isCorrect: true, feedbackTh: 'ถูกต้อง! เป็นประโยคเสนอของให้ (Offering) ต้องใช้ some' },
          { key: 'B', text: 'any', isCorrect: false, feedbackTh: 'any ใช้ในคำถามถามหาทั่วไป ไม่ใช้ในการเสนอของเลี้ยง/เชิญชวน' },
          { key: 'C', text: 'many', isCorrect: false, feedbackTh: 'dessert เป็นนามนับไม่ได้ในบริบทนี้' },
          { key: 'D', text: 'few', isCorrect: false, feedbackTh: 'few แปลว่าแทบไม่มี และใช้กับนามนับได้' },
        ],
        explanationTh: 'แม้จะเป็นประโยคคำถาม แต่เมื่อจุดประสงค์คือการยื่นข้อเสนอ (Offering) ต้องใช้ "some".',
        explanationEn: 'Offers and invitations in question format take "some" rather than "any".',
        weaknessTag: 'quantifiers_some_any',
        difficultyWeight: 2,
      },
      {
        id: 'g-q-noun-2',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกรูปคำนามนับไม่ได้ที่ถูกต้องสำหรับการเดินทาง',
        promptEn: 'Passengers are not allowed to carry too much _____ onto the cabin.',
        options: [
          { key: 'A', text: 'luggage', isCorrect: true, feedbackTh: 'ถูกต้อง! luggage เป็นนามนับไม่ได้ ไม่เติม -s และใช้คู่กับ too much' },
          { key: 'B', text: 'luggages', isCorrect: false, feedbackTh: 'luggage ห้ามเติม -s' },
          { key: 'C', text: 'bag', isCorrect: false, feedbackTh: 'much ใช้กับนามนับไม่ได้ ถ้าใช้ bag ต้องเป็น too many bags' },
          { key: 'D', text: 'suitcases', isCorrect: false, feedbackTh: 'suitcases เป็นนามนับได้พหูพจน์ ต้องใช้ too many' },
        ],
        explanationTh: 'คำว่า "much" ต้องนำหน้านามนับไม่ได้ และ "luggage" เป็นนามนับไม่ได้เสมอ.',
        explanationEn: 'Uncountable nouns like "luggage" pair with "much" and take no plural suffix.',
        weaknessTag: 'countable_uncountable_nouns',
        difficultyWeight: 2,
      },
    ],
  },

  // 7. A2: Reflexive Pronouns & Common Patterns [From Pretest A2]
  {
    id: 'grammar-a2-pronouns-reflexive',
    titleEn: 'Reflexive Pronouns & Idiomatic Use',
    titleTh: 'สรรพนามสะท้อน (Reflexive) และสำนวนด้วยตนเอง',
    cefrLevel: 'A2',
    summaryTh: 'ความแตกต่างของ "by myself" vs "on my own" และข้อห้ามซ้ำซ้อน "by on my own"',
    conceptTh: `สรรพนามสะท้อนตนเอง (Reflexive Pronouns) เช่น myself, yourself, himself, herself, itself, ourselves, themselves มีจุดออกสอบสำคัญ 2 ประเด็น:

1. ใช้เมื่อประธานและกรรมเป็นบุคคลเดียวกัน (Action reflects back to the subject):
- He cut himself while preparing lunch. (เขาทำมีดบาดตัวเอง)
- She looked at herself in the mirror. (เธอมองดูตัวเองในกระจก)

2. สำนวนบอกว่า "ทำด้วยตนเอง / ตามลำพัง" (Alone / Without help):
- สูตรที่ 1: BY + Reflexive Pronoun (by myself, by yourself, by himself, by themselves)
- สูตรที่ 2: ON + Possessive + OWN (on my own, on your own, on his own, on their own)

ข้อควรระวังขั้นเด็ดขาด:
ห้ามนำสองสูตรนี้มารวมกันเด็ดขาด! ห้ามพูดว่า "by on my own" หากมีคำว่า by มาให้ข้างหน้าแล้ว ต้องตอบ myself เสมอ`,
    conceptEn: 'Reflexive pronouns indicate the subject and object are the same. To mean "alone/independently", use either "by myself" OR "on my own". Never combine them as "by on my own".',
    rules: [
      {
        formula: 'BY + myself / yourself / himself / herself / ourselves / themselves',
        explanationTh: 'ทำด้วยตัวเองตามลำพัง โดยมี by นำหน้า',
        exampleEn: 'I fixed the bicycle by myself.',
        exampleTh: 'ฉันซ่อมจักรยานคันนั้นด้วยตัวฉันเอง',
      },
      {
        formula: 'ON + my / your / his / her / our / their + OWN',
        explanationTh: 'ทำด้วยตัวเองตามลำพัง โดยไม่มี by ข้างหน้า',
        exampleEn: 'She lives on her own in an apartment.',
        exampleTh: 'เธออาศัยอยู่ตามลำพังในอพาร์ตเมนต์',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I completed the project by on my own.',
        correct: 'I completed the project by myself. (หรือ on my own)',
        reasonTh: 'ห้ามใช้ by on my own เด็ดขาด ให้เลือกระหว่าง by myself หรือ on my own',
      },
      {
        incorrect: 'The little boy dressed him.',
        correct: 'The little boy dressed himself.',
        reasonTh: 'เด็กชายแต่งตัวให้ตัวเอง ประธานและกรรมเป็นคนเดียวกัน ต้องใช้ reflexive pronoun (himself)',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-pron-1',
        skill: 'grammar',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เลือกคำตอบที่ถูกต้องเมื่อมีคำว่า by อยู่หน้าช่องว่าง',
        promptEn: 'Although the assignment was challenging, Narong managed to finish it by _____.',
        options: [
          { key: 'A', text: 'himself', isCorrect: true, feedbackTh: 'ถูกต้อง! มี by อยู่แล้ว ต้องตามด้วย reflexive pronoun: by himself' },
          { key: 'B', text: 'on his own', isCorrect: false, feedbackTh: 'ถ้าตอบ on his own จะกลายเป็น by on his own ซึ่งผิดไวยากรณ์' },
          { key: 'C', text: 'his own', isCorrect: false, feedbackTh: 'by his own ผิดหลักภาษา' },
          { key: 'D', text: 'him', isCorrect: false, feedbackTh: 'by him หมายถึงโดยเขา ไม่ได้แปลว่าด้วยตนเอง' },
        ],
        explanationTh: 'เมื่อโจทย์มีคำว่า "by" กำกับอยู่ข้างหน้าแล้ว คำที่ถูกต้องคือ "himself" (by himself).',
        explanationEn: 'Following the preposition "by", the reflexive pronoun "himself" expresses independent action.',
        weaknessTag: 'reflexive_pronouns',
        difficultyWeight: 2,
      },
    ],
  },

  // 8. B1: Causative & Permission Patterns [From Pretest A2/B1 Guideline]
  {
    id: 'grammar-b1-causative-permission',
    titleEn: 'Causative & Permission: Let, Make, Allow, Help',
    titleTh: 'โครงสร้างกริยาขออนุญาตและบังคับ: Let, Make, Allow, Help',
    cefrLevel: 'B1',
    summaryTh: 'กฎเหล็กของโครงสร้างกริยา: let/make ตามด้วย V.infinitive เสมอ ส่วน allow/permit ต้องตามด้วย to + V.1',
    conceptTh: `ข้อสอบมาตรฐาน CEFR มักนำกริยาที่แปลว่า "อนุญาต" หรือ "ทำให้" มาทดสอบโครงสร้างกริยาตามหลัง:

1. LET (อนุญาตให้ / ปล่อยให้):
- โครงสร้าง: LET + Someone / Something + V.infinitive (กริยาช่อง 1 แท้ ไม่ผัน ไม่เติม to / -ing / -s)
- ตัวอย่าง: "They let the children play outside." (ห้ามใช้ let them to play)

2. MAKE (บังคับให้ / สั่งให้ทำ):
- โครงสร้าง: MAKE + Someone + V.infinitive (กริยาช่อง 1 แท้ ไม่ผัน ไม่เติม to)
- ตัวอย่าง: "The strict teacher made the students rewrite their essays."

3. ALLOW / PERMIT (อนุญาตให้ - รูปทางการ):
- โครงสร้าง: ALLOW + Someone + TO + V.1 (ต้องมี TO เสมอ!)
- ตัวอย่าง: "The manager allowed us to leave early."

4. HELP (ช่วยเหลือ):
- โครงสร้าง: HELP + Someone + (to) + V.1 (สามารถใส่ to หรือไม่ใส่ก็ได้)
- ตัวอย่าง: "She helped me (to) carry the heavy luggage."`,
    conceptEn: 'Let and Make are followed by bare infinitive (let/make someone DO something). Allow and Permit require to-infinitive (allow someone TO DO something). Help can take either.',
    rules: [
      {
        formula: 'LET / MAKE + Person + V.inf (Bare Infinitive - ไม่มี to)',
        explanationTh: 'let someone do / make someone do',
        exampleEn: 'My parents do not let me stay out late.',
        exampleTh: 'พ่อแม่ไม่อนุญาตให้ฉันอยู่นอกบ้านดึก',
      },
      {
        formula: 'ALLOW / PERMIT + Person + TO + V.1',
        explanationTh: 'allow someone to do / permit someone to do',
        exampleEn: 'The museum does not allow visitors to take photos.',
        exampleTh: 'พิพิธภัณฑ์ไม่อนุญาตให้ผู้เข้าชมถ่ายภาพ',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'The security officer let us to enter the hall.',
        correct: 'The security officer let us enter the hall.',
        reasonTh: 'let ต้องตามด้วยกริยา infinitive ไม่มี to เสมอ (let us enter)',
      },
      {
        incorrect: 'The university allows students park here.',
        correct: 'The university allows students to park here.',
        reasonTh: 'allow ต้องมี to ตามหลังเสมอ (allow students to park)',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-letallow-1',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'เลือกโครงสร้างกริยาที่ถูกต้องตามหลังกริยา let',
        promptEn: 'The hotel management does not let guests _____ pets into the guest rooms.',
        options: [
          { key: 'A', text: 'bring', isCorrect: true, feedbackTh: 'ถูกต้อง! let + someone + V.inf (bring ไม่ต้องมี to)' },
          { key: 'B', text: 'to bring', isCorrect: false, feedbackTh: 'let ห้ามตามด้วย to + V' },
          { key: 'C', text: 'bringing', isCorrect: false, feedbackTh: 'let ไม่ตามด้วย V-ing' },
          { key: 'D', text: 'brought', isCorrect: false, feedbackTh: 'brought เป็นอดีต' },
        ],
        explanationTh: 'กริยา "let" บังคับโครงสร้าง: let + object + bare infinitive (bring).',
        explanationEn: 'The causative/permission verb "let" requires a bare infinitive without "to".',
        weaknessTag: 'causative_verbs',
        difficultyWeight: 3,
      },
      {
        id: 'g-q-letallow-2',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'เลือกกริยาที่ถูกต้องเมื่อโครงสร้างมีคำว่า "to submit"',
        promptEn: 'The professor _____ the students to submit their research proposals by Friday.',
        options: [
          { key: 'A', text: 'allowed', isCorrect: true, feedbackTh: 'ถูกต้อง! allowed + person + TO submit เข้ากับโครงสร้าง' },
          { key: 'B', text: 'made', isCorrect: false, feedbackTh: 'made ต้องตามด้วย bare infinitive ไม่มี to' },
          { key: 'C', text: 'let', isCorrect: false, feedbackTh: 'let ต้องตามด้วย bare infinitive ไม่มี to' },
          { key: 'D', text: 'had', isCorrect: false, feedbackTh: 'had someone do something ไม่มี to' },
        ],
        explanationTh: 'เพราะข้างหลังมีคำว่า "to submit" จึงต้องใช้กริยา "allowed" (allowed someone to do).',
        explanationEn: 'Only "allow" among the choices takes an object followed by a to-infinitive.',
        weaknessTag: 'causative_verbs',
        difficultyWeight: 3,
      },
    ],
  },

  // 9. B1: Common Collocations & Phrasal Verbs [From Collocations Guidelines]
  {
    id: 'grammar-b1-collocations-phrasal-verbs',
    titleEn: 'High-Yield Collocations & Phrasal Verbs',
    titleTh: 'กลุ่มคำที่ใช้คู่กันและกริยาวลีที่ออกสอบบ่อย',
    cefrLevel: 'B1',
    summaryTh: 'รวมคำคู่ที่ออกสอบ OOPT บ่อยที่สุด: take place, pay attention, look forward to + V-ing, run out of',
    conceptTh: `Collocations (คำที่ต้องใช้คู่กัน) และ Phrasal Verbs (กริยาวลี) เป็นหัวใจสำคัญของข้อสอบ Use of English Part 1:

1. High-Yield Collocations:
- take place = เกิดขึ้น / จัดขึ้น (เช่น The festival will take place in March.)
- pay attention (to) = ตั้งใจฟัง / ให้ความสนใจ
- catch a cold = เป็นหวัด
- break a habit = เลิกนิสัยเดิม
- keep a promise = รักษาสัญญา
- save time / save money = ประหยัดเวลา / ประหยัดเงิน

2. Essential Phrasal Verbs:
- look forward to + V-ing = ตั้งตารอคอย (ระวัง: to ตัวนี้เป็น preposition ต้องตามด้วย V-ing เสมอ!)
- run out of = หมด (เช่น run out of petrol / run out of time)
- put off = เลื่อนออกไป (postpone)
- call off = ยกเลิก (cancel)
- look after = ดูแลเอาใจใส่ (take care of)
- turn down = ปฏิเสธข้อเสนอ หรือ หรี่เสียง
- give up = ยอมแพ้ หรือ เลิกทำ`,
    conceptEn: 'Collocations are fixed word combinations (take place, pay attention). Phrasal verbs combine verbs with particles (look forward to + V-ing, put off, run out of).',
    rules: [
      {
        formula: 'look forward to + V-ing / Noun (ไม่ใช่ V.inf!)',
        explanationTh: 'เช่น I look forward to hearing from you soon.',
        exampleEn: 'We look forward to meeting your new business partner.',
        exampleTh: 'พวกเราตั้งตารอคอยที่จะได้พบหุ้นส่วนธุรกิจคนใหม่ของคุณ',
      },
      {
        formula: 'take place = occur / happen (เป็นคำตายตัว ไม่ใช้ take time)',
        explanationTh: 'เช่น The conference takes place next week.',
        exampleEn: 'The international seminar will take place at the Grand Convention Hall.',
        exampleTh: 'การสัมมนาระดับนานาชาติจะจัดขึ้นที่ห้องประชุมใหญ่',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I look forward to meet you tomorrow.',
        correct: 'I look forward to meeting you tomorrow.',
        reasonTh: 'to ใน look forward to เป็นบุพบท (preposition) กริยาที่ตามหลังต้องเป็น Gerund (V-ing) เสมอ',
      },
      {
        incorrect: 'The sports tournament will make place this weekend.',
        correct: 'The sports tournament will take place this weekend.',
        reasonTh: 'สำนวนแปลว่า "จัดขึ้น/เกิดขึ้น" คือ take place ไม่ใช่ make place',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-colloc-1',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'เลือกรูปกริยาที่ถูกต้องตามหลังสำนวน look forward to',
        promptEn: 'All team members are truly looking forward to _____ our keynote speaker.',
        options: [
          { key: 'A', text: 'welcoming', isCorrect: true, feedbackTh: 'ถูกต้อง! look forward to ต้องตามด้วย V-ing (welcoming)' },
          { key: 'B', text: 'welcome', isCorrect: false, feedbackTh: 'ข้อผิดพลาดยอดฮิต! to ตัวนี้เป็น preposition ต้องตามด้วย V-ing' },
          { key: 'C', text: 'welcomed', isCorrect: false, feedbackTh: 'welcomed เป็นรูปอดีต' },
          { key: 'D', text: 'have welcomed', isCorrect: false, feedbackTh: 'have welcomed ผิดรูปไวยากรณ์' },
        ],
        explanationTh: 'สำนวน "look forward to" ต้องตามหลังด้วยคำนามหรือ Gerund (V-ing) เสมอ.',
        explanationEn: 'The phrase "look forward to" takes a gerund (-ing form), not a bare infinitive.',
        weaknessTag: 'phrasal_verbs',
        difficultyWeight: 3,
      },
      {
        id: 'g-q-colloc-2',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'เลือกคำที่ถูกต้องในสำนวนที่แปลว่า "จัดขึ้น/เกิดขึ้น"',
        promptEn: 'The annual science exhibition will _____ place in the university auditorium.',
        options: [
          { key: 'A', text: 'take', isCorrect: true, feedbackTh: 'ถูกต้อง! take place แปลว่าจัดขึ้น/เกิดขึ้น' },
          { key: 'B', text: 'make', isCorrect: false, feedbackTh: 'make place ผิดสำนวน' },
          { key: 'C', text: 'have', isCorrect: false, feedbackTh: 'have place ผิดสำนวน' },
          { key: 'D', text: 'do', isCorrect: false, feedbackTh: 'do place ผิดสำนวน' },
        ],
        explanationTh: 'กลุ่มคำคู่คงที่ (Fixed Collocation) ที่แปลว่าจัดขึ้น คือ "take place".',
        explanationEn: 'The idiom meaning to happen or be held is "take place".',
        weaknessTag: 'collocations',
        difficultyWeight: 3,
      },
    ],
  },

  // 10. B1: Conditionals: Real vs. Unreal (Type 1 & 2)
  {
    id: 'grammar-b1-conditionals',
    titleEn: 'Conditionals: Real vs. Unreal (Type 1 & 2)',
    titleTh: 'ประโยคเงื่อนไข: เป็นไปได้จริง vs. จินตนาการสมมุติ',
    cefrLevel: 'B1',
    summaryTh: 'เข้าใจเงื่อนไขแบบที่ 1 (เป็นไปได้ในอนาคต) และแบบที่ 2 (สมมุติตรงข้ามกับความจริงในปัจจุบัน)',
    conceptTh: `ประโยคเงื่อนไขแบ่งตามความน่าจะเป็นจริง:

1. First Conditional (Type 1 - เป็นไปได้จริงในอนาคต):
- If + Present Simple, Future Simple (will + V.1)
- ใช้กับเหตุการณ์ที่มีโอกาสเกิดขึ้นจริงเมื่อเงื่อนไขเป็นไปตามนั้น เช่น ฝนตกจะอยู่บ้าน

2. Second Conditional (Type 2 - จินตนาการ / ตรงข้ามความจริงปัจจุบัน):
- If + Past Simple, would + V.1
- ใช้สมมุติเรื่องที่ไม่จริงในขณะนี้ หรือความฝัน เช่น ถ้าฉันถูกหวยรางวัลที่หนึ่ง
- หมายเหตุ: ในภาษาทางการ รูปกริยา to be ใน If-clause จะใช้ were กับประธานทุกตัว (If I were you, ...)`,
    conceptEn: 'First Conditional is for real possibilities in the future (If + Present, will + V). Second Conditional is for unreal or imaginary situations in the present/future (If + Past, would + V).',
    rules: [
      {
        formula: 'First Conditional: If + Subject + V.1, Subject + will + V.inf',
        explanationTh: 'เป็นไปได้จริงในอนาคต',
        exampleEn: 'If it rains this evening, we will stay at home.',
        exampleTh: 'ถ้าเย็นนี้ฝนตก พวกเราจะอยู่บ้าน',
      },
      {
        formula: 'Second Conditional: If + Subject + V.2 (were), Subject + would + V.inf',
        explanationTh: 'สมมุติฝันกลางวัน ตรงข้ามกับความจริงปัจจุบัน',
        exampleEn: 'If I had more free time, I would travel around Europe.',
        exampleTh: 'ถ้าฉันมีเวลาว่างมากกว่านี้ ฉันคงจะไปเที่ยวรอบยุโรป (ความจริงคือไม่มีเวลา)',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'If I will win the lottery, I will buy a car.',
        correct: 'If I win the lottery, I will buy a car.',
        reasonTh: 'ในประโยคย่อยหลัง If (If-clause) ห้ามใส่ will เด็ดขาด ต้องใช้ Present Simple',
      },
      {
        incorrect: 'If I was you, I would take that offer.',
        correct: 'If I were you, I would take that offer.',
        reasonTh: 'ในภาษาเขียนและข้อสอบมาตรฐาน ประโยคสมมุติตรงข้ามความจริงใช้ were กับประธานทุกตัวรวมทั้ง I',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-b1-1',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'เลือกโครงสร้างที่ถูกต้องสำหรับประโยคสมมุติตรงข้ามความจริงปัจจุบัน (Type 2)',
        promptEn: 'If Tanakorn _____ the director of this academy, he would upgrade all computer labs.',
        options: [
          { key: 'A', text: 'were', isCorrect: true, feedbackTh: 'ถูกต้อง! Second conditional ใช้ were กับประธานทุกตัวใน if-clause' },
          { key: 'B', text: 'is', isCorrect: false, feedbackTh: 'is เป็น Type 1 แต่ main clause ใช้ would upgrade' },
          { key: 'C', text: 'will be', isCorrect: false, feedbackTh: 'ห้ามใช้ will ใน if-clause' },
          { key: 'D', text: 'has been', isCorrect: false, feedbackTh: 'has been เป็น Present Perfect' },
        ],
        explanationTh: 'Main clause ใช้ "would upgrade" แสดงว่าเป็น Second Conditional ประธานเอกพจน์ใน If-clause ใช้ "were".',
        explanationEn: 'The modal "would upgrade" signals a second conditional, requiring the past subjunctive "were".',
        weaknessTag: 'conditionals_type_2',
        difficultyWeight: 3,
      },
    ],
  },

  // 11. B1: Conversational Pragmatics & Idiomatic Implicatures [From OOPT Part 2 Guideline]
  {
    id: 'grammar-b1-conversational-meaning',
    titleEn: 'Conversational Pragmatics & Meaning in Context',
    titleTh: 'การทำความเข้าใจความหมายแฝงและสำนวนในบทสนทนา',
    cefrLevel: 'B1',
    summaryTh: 'ถอดรหัสข้อสอบ OOPT Part 2: สิ่งที่ผู้พูดพูดตรงตัว vs. ความหมายที่แท้จริงเบื้องหลังบทสนทนา',
    conceptTh: `ข้อสอบ OOPT Use of English Part 2 ไม่ได้วัดแค่ไวยากรณ์ แต่ทดสอบ "Pragmatic Competence" (การเข้าใจเจตนาที่แท้จริงของผู้พูด):

1. การตอบรับแบบไม่พูดตรงๆ:
- "Why not?" = ผู้พูดไม่ได้สงสัยว่าทำไม แต่แปลว่า "เห็นด้วย / ไปสิ / เข้าท่าดี"
- "I wouldn't say no." = "ฉันยินดีรับข้อเสนออย่างยิ่ง"

2. สำนวนแสดงความรู้สึกและข้อจำกัด:
- "gets on my nerves" = ทำให้ฉันรำคาญใจ (annoys me)
- "I'm hopeless at..." = ฉันทำสิ่งนั้นไม่เก่งเอาเสียเลย (not good at)
- "I have to leave in five minutes." = ฉันมีเวลาคุยกับคุณได้แค่สั้นๆ เท่านั้น (limited time)
- "under the weather" = รู้สึกไม่ค่อยสบาย / ป่วยเล็กน้อย
- "sleep on it" = ขอเวลาคิดทบทวนคืนหนึ่งก่อนตัดสินใจ
- "call it a day" = จบการทำงานสำหรับวันนี้กันเถอะ

3. การตีความหมาย:
ผู้สอบต้องอ่านทั้งสองบทสนทนา (Speaker 1 + Speaker 2) แล้วจับใจความว่าตัวเลือก A, B, หรือ C ข้อใดถอดความหมาย (Paraphrase) ได้ตรงกับความตั้งใจจริงของผู้พูดมากที่สุด`,
    conceptEn: 'Pragmatics tests conversational implicatures. Literal words often convey indirect communicative intentions, idioms, polite refusals, and understated agreements.',
    rules: [
      {
        formula: `"Why not?" = Agreement / Enthusiastic acceptance ("I agree" / "Let's do it")`,
        explanationTh: 'ไม่ใช่คำถามเชิงเหตุผล แต่เป็นการตอบตกลง',
        exampleEn: 'Man: "Do you fancy a cinema trip?" Woman: "Why not!" -> She wants to go.',
        exampleTh: 'ผู้ชาย: ไปดูหนังกันไหม? ผู้หญิง: ทำไมจะไม่ล่ะ! -> แปลว่าเธออยากไป',
      },
      {
        formula: `"gets on someone's nerves" = annoys / irritates someone`,
        explanationTh: 'แปลว่าทำให้รำคาญใจ ประสาทเสีย',
        exampleEn: 'That loud music gets on my nerves -> It annoys me.',
        exampleTh: 'เสียงเพลงดังนั่นกวนประสาทฉันเหลือเกิน -> แปลว่าทำให้รำคาญ',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'Interpreting "Why not?" as asking for an explanation of why someone cannot do something.',
        correct: 'Recognizing "Why not?" as a colloquial expression of agreement.',
        reasonTh: '"Why not?" ในบทสนทนาตอบรับแปลว่า "เอาสิ / เห็นด้วย" ไม่ใช่การถามหาเหตุผล',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-mean-1',
        skill: 'grammar',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'อ่านบทสนทนาแล้วตอบว่าผู้พูดหมายความว่าอย่างไร',
        promptEn: 'Man: "The continuous barking from next door really gets on my nerves." \\nWoman: "I know, it has been going on for hours." \\n\\nWhat does the man mean?',
        options: [
          { key: 'A', text: 'The barking annoys and frustrates him.', isCorrect: true, feedbackTh: 'ถูกต้อง! gets on my nerves แปลว่า ทำให้รำคาญ/หงุดหงิด (annoys him)' },
          { key: 'B', text: 'The barking makes him feel terrified.', isCorrect: false, feedbackTh: 'สำนวนนี้ไม่ได้แปลว่ากลัว' },
          { key: 'C', text: 'He is worried about the dog health.', isCorrect: false, feedbackTh: 'ไม่ได้แสดงความเป็นห่วงสุขภาพสุนัข' },
          { key: 'D', text: 'He wants to buy a guard dog himself.', isCorrect: false, feedbackTh: 'นอกเรื่องบริบท' },
        ],
        explanationTh: 'สำนวน "gets on my nerves" หมายถึง ทำให้รำคาญหรือหงุดหงิดใจ (annoys me).',
        explanationEn: `The idiom "gets on one's nerves" means to irritate or annoy someone.`,
        weaknessTag: 'pragmatic_meaning',
        difficultyWeight: 3,
      },
    ],
  },

  // 12. B2: Passive Voice & Relative Clauses
  {
    id: 'grammar-b2-passive-relative',
    titleEn: 'Passive Voice & Relative Clauses',
    titleTh: 'โครงสร้างถูกกระทำและประโยคความซ้อนขยายนาม',
    cefrLevel: 'B2',
    summaryTh: 'การใช้ Passive Voice เมื่อเน้นผู้ถูกกระทำ และการเลือก Relative Pronoun (who, which, that, whose, where)',
    conceptTh: `ในระดับ B2 ผู้เรียนต้องเข้าใจโครงสร้างที่ซับซ้อนขึ้น:

1. Passive Voice (Subject + be + V.3):
- ใช้เมื่อต้องการเน้น "ผู้ถูกกระทำ" หรือเมื่อไม่ทราบ/ไม่จำเป็นต้องระบุว่าใครเป็นผู้กระทำ เช่น ในรายงานวิทยาศาสตร์หรือข่าวสารทางการ
- ตัวอย่าง: "The new bridge was constructed in 2024."

2. Relative Clauses (อนุประโยคขยายคำนาม):
- Defining (ชี้เฉพาะ จำเป็นต่อใจความ ไม่มีเครื่องหมายจุลภาค): "The student who won the scholarship studies medicine."
- Non-defining (ให้ข้อมูลเสริม มีเครื่องหมายจุลภาคคั่น ห้ามใช้ that!): "Bangkok, which is the capital of Thailand, has many historic temples."
- การเลือกสรรพนาม: who (คน), which (สิ่งของ/สถานที่เมื่อทำหน้าที่ประธานหรือกรรม), where (สถานที่เมื่อบอกตำแหน่งที่เกิดเหตุการณ์), whose (แสดงความเป็นเจ้าของ)`,
    conceptEn: 'Passive Voice highlights the receiver of the action. Relative clauses provide essential (defining) or extra (non-defining) information using who, which, whose, or where.',
    rules: [
      {
        formula: 'Passive: Subject + Form of "BE" + Past Participle (V.3)',
        explanationTh: 'is/am/are/was/were/been/being + V.3',
        exampleEn: 'The ancient manuscript was discovered by archeologists.',
        exampleTh: 'เอกสารโบราณถูกค้นพบโดยนักโบราณคดี',
      },
      {
        formula: 'Non-defining Relative Clause: Noun, which/who ..., verb (ห้ามใช้ that เด็ดขาด)',
        explanationTh: 'เมื่อมีเครื่องหมายจุลภาค (Comma) ขยายสิ่งของ ต้องใช้ which ห้ามใช้ that',
        exampleEn: 'The historic library, which was built in 1890, attracts many tourists.',
        exampleTh: 'ห้องสมุดประวัติศาสตร์ ซึ่งสร้างขึ้นในปี 1890 ดึงดูดนักท่องเที่ยวจำนวนมาก',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'The palace, that was restored last year, is open to the public.',
        correct: 'The palace, which was restored last year, is open to the public.',
        reasonTh: 'ใน Non-defining relative clause (มีจุลภาคคั่น) ห้ามใช้ that ขยายสิ่งของ ต้องใช้ which',
      },
      {
        incorrect: 'The email was send yesterday.',
        correct: 'The email was sent yesterday.',
        reasonTh: 'หลัง Verb to be ในโครงสร้าง Passive Voice กริยาต้องอยู่ในรูปช่อง 3 (sent ไม่ใช่ send)',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-b2-1',
        skill: 'grammar',
        cefrLevel: 'B2',
        type: 'multiple_choice',
        promptTh: 'เลือก Relative Pronoun ที่ถูกต้องในอนุประโยคที่มีเครื่องหมายจุลภาค',
        promptEn: 'Chiang Mai University, _____ was founded in 1964, is renowned for its academic excellence.',
        options: [
          { key: 'A', text: 'which', isCorrect: true, feedbackTh: 'ถูกต้อง! Non-defining relative clause มีจุลภาคคั่น ใช้ which ขยายสถานที่ในฐานะประธาน' },
          { key: 'B', text: 'that', isCorrect: false, feedbackTh: 'ห้ามใช้ that หลังเครื่องหมาย comma เด็ดขาด' },
          { key: 'C', text: 'where', isCorrect: false, feedbackTh: 'where ต้องตามด้วย Subject + Verb ไม่ใช่ was founded' },
          { key: 'D', text: 'whose', isCorrect: false, feedbackTh: 'whose ใช้แสดงความเป็นเจ้าของ' },
        ],
        explanationTh: 'ใน Non-defining relative clause ที่มีเครื่องหมายจุลภาค ห้ามใช้ "that" และเมื่อทำหน้าที่เป็นประธานของกริยา was founded ต้องใช้ "which".',
        explanationEn: 'In non-restrictive relative clauses set off by commas, "which" is required; "that" is ungrammatical.',
        weaknessTag: 'relative_clauses',
        difficultyWeight: 4,
      },
    ],
  },

  // 13. B2: Gerund vs. Infinitive with Meaning Shift [From Verbs Guidelines]
  {
    id: 'grammar-b2-gerund-infinitive-shift',
    titleEn: 'Gerund vs. Infinitive with Meaning Shift',
    titleTh: 'กริยาตามด้วย V-ing vs. to + V.1 ที่เปลี่ยนความหมาย',
    cefrLevel: 'B2',
    summaryTh: 'วิเคราะห์กริยากลุ่ม stop, remember, forget, regret, try ซึ่งความหมายเปลี่ยนไปโดยสิ้นเชิงขึ้นกับรูปแบบที่ตามหลัง',
    conceptTh: `กริยาบางคำในภาษาอังกฤษสามารถตามด้วย Gerund (V-ing) หรือ To-Infinitive (to + V.1) ก็ได้ แต่ "ความหมายจะเปลี่ยนไปคนละเรื่อง":

1. STOP:
- stop + V-ing = "เลิก / หยุดทำสิ่งนั้นเด็ดขาด" (He stopped smoking. = เขาเลิกสูบบุหรี่แล้ว)
- stop + to V.1 = "หยุดกิจกรรมเดิม เพื่อที่จะไปทำสิ่งใหม่" (He stopped to smoke. = เขาหยุดเดินเพื่อจุดบุหรี่สูบ)

2. REMEMBER / FORGET:
- remember + to V.1 = "จำได้ว่าต้องทำ (หน้าที่ในอนาคต)" (Remember to lock the door. = อย่าลืมล็อคประตูนะ)
- remember + V-ing = "จำภาพความทรงจำในอดีตได้" (I remember locking the door. = ฉันจำภาพได้ว่าตอนนั้นฉันล็อคไปแล้ว)

3. TRY:
- try + to V.1 = "พยายามอย่างยากลำบากเพื่อเอาชนะอุปสรรค" (He tried to lift the heavy stone.)
- try + V-ing = "ทดลองทำดูเพื่อดูผลลัพธ์" (Try drinking some warm milk if you cannot sleep.)

4. REGRET:
- regret + to V.1 = "เสียใจที่ต้องแจ้งข่าวร้ายต่อไปนี้" (We regret to inform you that your application was unsuccessful.)
- regret + V-ing = "เสียใจกับสิ่งที่ตนเองได้ทำลงไปในอดีต" (I regret saying those rude words.)`,
    conceptEn: 'Certain verbs alter their meaning depending on whether they take a gerund or to-infinitive (stop doing = cease; stop to do = pause to perform an action; remember to do = remember a duty; remember doing = recall a past memory).',
    rules: [
      {
        formula: 'stop + V-ing (quit action) vs. stop + to V.1 (pause to do another action)',
        explanationTh: 'stop eating = หยุดกิน | stop to eat = หยุดพักเพื่อไปกินข้าว',
        exampleEn: 'During our road trip, we stopped to admire the mountain view.',
        exampleTh: 'ระหว่างการเดินทาง พวกเราหยุดรถเพื่อชมทิวทัศน์ภูเขา',
      },
      {
        formula: 'remember + to V.1 (duty/task) vs. remember + V-ing (past memory)',
        explanationTh: 'remember to call = อย่าลืมโทร | remember calling = จำได้ว่าเคยโทรไปแล้ว',
        exampleEn: 'Please remember to turn off the lights before leaving.',
        exampleTh: 'โปรดอย่าลืมปิดไฟก่อนออกจากห้อง',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'I stopped drinking coffee because I felt sleepy.',
        correct: 'I stopped to drink coffee because I felt sleepy.',
        reasonTh: 'ถ้ารู้สึกง่วง แสดงว่าหยุดพักเพื่อจะไปดื่มกาแฟ ต้องใช้ stop to drink ไม่ใช่ stop drinking (เลิกดื่ม)',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-shift-1',
        skill: 'grammar',
        cefrLevel: 'B2',
        type: 'multiple_choice',
        promptTh: 'เลือกรูปกริยาที่แสดงหน้าที่หรือภารกิจที่ต้องทำ (duty)',
        promptEn: 'Before submitting the online visa application, make sure you remember _____ all passport details.',
        options: [
          { key: 'A', text: 'to double-check', isCorrect: true, feedbackTh: 'ถูกต้อง! เป็นภารกิจที่ต้องทำในอนาคต ใช้ remember + to V.1' },
          { key: 'B', text: 'double-checking', isCorrect: false, feedbackTh: 'double-checking แปลว่าระลึกภาพความหลังในอดีต' },
          { key: 'C', text: 'double-checked', isCorrect: false, feedbackTh: 'remember ไม่ตามด้วย V.2' },
          { key: 'D', text: 'to have checked', isCorrect: false, feedbackTh: 'โครงสร้างเยิ่นเย้อเกินจำเป็น' },
        ],
        explanationTh: 'การเตือนให้จำได้ว่าต้องทำหน้าที่ในอนาคต ใช้โครงสร้าง "remember + to V.1" (to double-check).',
        explanationEn: 'Remembering a task or obligation requires "remember + to-infinitive".',
        weaknessTag: 'gerund_vs_infinitive',
        difficultyWeight: 4,
      },
    ],
  },

  // 14. C1: Negative Inversion & Mixed Conditionals
  {
    id: 'grammar-c1-inversion-mixed',
    titleEn: 'Negative Inversion & Mixed Conditionals',
    titleTh: 'การสลับประธานกริยาและเงื่อนไขแบบผสมชั้นสูง',
    cefrLevel: 'C1',
    summaryTh: 'โครงสร้างภาษาอังกฤษขั้นสูง: นำคำปฏิเสธขึ้นต้นประโยคเพื่อเน้นย้ำ และการผสมผสานอดีตส่งผลถึงปัจจุบัน',
    conceptTh: `โครงสร้างระดับ C1 มักพบในงานเขียนวิชาการและข้อสอบวัดระดับขั้นสูง:

1. Negative Inversion (การสลับกริยาช่วยมาหน้าประธานเมื่อขึ้นต้นด้วยคำปฏิเสธ):
- นำคำที่มีความหมายเชิงลบหรือจำกัดขอบเขตขึ้นต้นประโยค เช่น Seldom, Rarely, Never, Scarcely, Hardly, Little, Not only... but also...
- โครงสร้าง: Negative Word + Auxiliary Verb (กริยาช่วย) + Subject + Main Verb
- ตัวอย่าง: "Rarely have I witnessed such profound dedication." (แทนที่ I have rarely witnessed...)

2. Mixed Conditionals (เงื่อนไขผสมข้ามมิติเวลา):
- Type Past-Present (เงื่อนไขอดีต ส่งผลถึงสภาพในปัจจุบัน):
  If + Past Perfect (Had + V.3), Subject + would + V.1 (ปัจจุบัน)
  ตัวอย่าง: "If I had accepted that scholarship three years ago, I would be a physician today." (ถ้าตอนนั้นรับทุน ตอนนี้คงเป็นหมออยู่)`,
    conceptEn: 'Negative inversion fronts restrictive adverbs (rarely, seldom, scarcely) followed by auxiliary-subject inversion. Mixed conditionals combine past conditions with present outcomes.',
    rules: [
      {
        formula: 'Seldom / Rarely / Never + Auxiliary (have/do/is) + Subject + Main Verb',
        explanationTh: 'เน้นย้ำความหายากหรือแทบไม่เคยเกิดขึ้น',
        exampleEn: 'Seldom does a researcher uncover such compelling historical evidence.',
        exampleTh: 'นานทีปีหนอย่างยิ่งที่นักวิจัยคนหนึ่งจะค้นพบหลักฐานทางประวัติศาสตร์ที่หนักแน่นเช่นนี้',
      },
      {
        formula: 'Mixed Conditional: If + had + V.3, Subject + would + V.inf (now / today)',
        explanationTh: 'ถ้าในอดีตได้ทำสิ่งนั้น ปัจจุบันสภาพชีวิตคงเป็นอีกอย่างหนึ่ง',
        exampleEn: 'If she had taken the train, she would be in the meeting right now.',
        exampleTh: 'ถ้าเธอขึ้นรถไฟขบวนนั้น ตอนนี้เธอก็คงนั่งอยู่ในห้องประชุมเรียบร้อยแล้ว',
      },
    ],
    commonMistakes: [
      {
        incorrect: 'Rarely I have seen such a breathtaking sunset.',
        correct: 'Rarely have I seen such a breathtaking sunset.',
        reasonTh: 'เมื่อนำ Rarely ขึ้นต้นประโยค ต้องสลับกริยาช่วย have มาไว้หน้าประธาน I ทันที',
      },
      {
        incorrect: 'If I had won the prize yesterday, I would have been rich today.',
        correct: 'If I had won the prize yesterday, I would be rich today.',
        reasonTh: 'ผลลัพธ์อยู่ในปัจจุบัน (today) ต้องใช้ would be ไม่ใช่ would have been',
      },
    ],
    practiceQuestions: [
      {
        id: 'g-q-c1-1',
        skill: 'grammar',
        cefrLevel: 'C1',
        type: 'multiple_choice',
        promptTh: 'เลือกโครงสร้าง Inversion ที่ถูกต้องเมื่อขึ้นต้นประโยคด้วยคำปฏิเสธ (Not only)',
        promptEn: 'Not only _____ to meet the project deadline, but they also exceeded revenue forecasts.',
        options: [
          { key: 'A', text: 'did the team manage', isCorrect: true, feedbackTh: 'ถูกต้อง! Inversion ในอดีต: did + Subject + V.inf' },
          { key: 'B', text: 'the team managed', isCorrect: false, feedbackTh: 'ลืมสลับกริยาช่วยมาหน้าประธาน' },
          { key: 'C', text: 'managed the team', isCorrect: false, feedbackTh: 'ห้ามนำกริยาแท้มาวางหน้าประธาน ต้องใช้กริยาช่วย did' },
          { key: 'D', text: 'was the team managed', isCorrect: false, feedbackTh: 'กลายเป็น Passive Voice ความหมายเปลี่ยน' },
        ],
        explanationTh: 'เมื่อขึ้นต้นด้วย "Not only" ในรูปอดีต ต้องใช้ Inversion ด้วยกริยาช่วย: "did the team manage".',
        explanationEn: 'Fronting the negative correlative "Not only" triggers auxiliary inversion with "did".',
        weaknessTag: 'negative_inversion',
        difficultyWeight: 5,
      },
    ],
  },
];
