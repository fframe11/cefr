import { ReadingPassage } from '../types';

export const READING_BANK: ReadingPassage[] = [
  // A2 Key (KET) Reading Passage
  {
    id: 'reading-a2-travel',
    title: 'A Green Weekend in the Countryside',
    cefrLevel: 'A2',
    targetExam: 'KET',
    topic: 'Travel & Nature',
    wordCount: 165,
    content: `Last month, my brother and I decided to take a short holiday away from the busy city. We chose a small organic farm in the valley of Chiang Rai. 

We traveled by bus early on Saturday morning. The journey took four hours, but the view of the green mountains through the window was breathtaking. When we arrived at the farm, the owners, Mr. and Mrs. Chai, welcomed us with fresh herbal tea and homemade bread.

In the afternoon, we helped feed the chickens and picked organic strawberries in the garden. In the evening, there was no television, so we sat around a wooden table, played board games, and listened to the sounds of nature. It was much quieter than our apartment in the city. We returned home on Sunday feeling rested and energized.`,
    vocabularyGlossary: [
      { word: 'valley', meaningTh: 'หุบเขา' },
      { word: 'breathtaking', meaningTh: 'สวยจนแทบหยุดหายใจ, งดงามตระการตา' },
      { word: 'organic', meaningTh: 'เกษตรอินทรีย์, ปลอดสารพิษ' },
      { word: 'energized', meaningTh: 'มีพลัง, กระปรี้กระเปร่า' },
    ],
    questions: [
      {
        id: 'read-q-a2-1',
        skill: 'reading',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'ผู้เขียนและพี่ชายเดินทางไปยังฟาร์มด้วยยานพาหนะใด?',
        promptEn: 'How did the writer and their brother travel to the farm?',
        options: [
          { key: 'A', text: 'By public bus', isCorrect: true, feedbackTh: 'ถูกต้อง! ในย่อหน้าที่ 2 ระบุว่า "We traveled by bus early on Saturday morning."' },
          { key: 'B', text: 'By private car', isCorrect: false, feedbackTh: 'ในบทความระบุว่า traveled by bus' },
          { key: 'C', text: 'By train', isCorrect: false, feedbackTh: 'ไม่ได้เดินทางด้วยรถไฟ' },
          { key: 'D', text: 'By airplane', isCorrect: false, feedbackTh: 'ไม่ได้เดินทางด้วยเครื่องบิน' }
        ],
        explanationTh: 'บทความระบุชัดเจนในบรรทัดแรกของย่อหน้าที่สอง: "We traveled by bus early on Saturday morning."',
        explanationEn: 'Paragraph 2 explicitly states: "We traveled by bus early on Saturday morning."',
        weaknessTag: 'locating_factual_details',
        difficultyWeight: 2,
      },
      {
        id: 'read-q-a2-2',
        skill: 'reading',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'พวกเขาทำกิจกรรมใดในช่วงบ่ายที่ฟาร์ม?',
        promptEn: 'What activity did they do in the afternoon?',
        options: [
          { key: 'A', text: 'They watched a film about farming.', isCorrect: false, feedbackTh: 'ในฟาร์มไม่มีโทรทัศน์' },
          { key: 'B', text: 'They fed animals and gathered strawberries.', isCorrect: true, feedbackTh: 'ถูกต้อง! "helped feed the chickens and picked organic strawberries"' },
          { key: 'C', text: 'They repaired the farm fence.', isCorrect: false, feedbackTh: 'ไม่ได้ซ่อมรั้ว' },
          { key: 'D', text: 'They baked bread with the owners.', isCorrect: false, feedbackTh: 'เจ้าของบ้านเสิร์ฟขนมปังที่ทำไว้แล้ว' }
        ],
        explanationTh: 'ในย่อหน้าที่ 3 ระบุว่า "In the afternoon, we helped feed the chickens and picked organic strawberries in the garden."',
        explanationEn: 'The text mentions feeding chickens and picking strawberries in the afternoon.',
        weaknessTag: 'chronological_activity_tracking',
        difficultyWeight: 2,
      },
    ],
  },

  // B1 Preliminary (PET) Reading Passage
  {
    id: 'reading-b1-tech',
    title: 'The Rise of Urban Micro-Farming',
    cefrLevel: 'B1',
    targetExam: 'PET',
    topic: 'Environment & Technology',
    wordCount: 240,
    content: `As metropolitan centers expand worldwide, access to fresh agricultural produce has become increasingly complex. Long transportation networks not only inflate the prices of vegetables but also generate substantial carbon emissions. In response, innovative residents are converting disused rooftops, balconies, and shipping containers into compact, highly productive micro-farms.

Unlike traditional agriculture, which depends on expansive soil acreage and predictable weather patterns, modern urban farming frequently utilizes hydroponic and aeroponic methods. These innovative setups circulate nutrient-enriched water directly to plant roots inside controlled environments. Consequently, crops can grow up to thirty percent faster while utilizing ninety percent less water than conventional outdoor fields.

Nevertheless, urban agriculture is not without significant hurdles. Initial setup expenses for LED lighting arrays and automated sensors remain high, which can deter casual beginners. In addition, high electricity tariffs in certain cities can undermine potential cost savings.

In spite of these economic barriers, city planners view micro-farming as an invaluable community asset. Beyond producing fresh organic food within walking distance of neighborhoods, these green spaces build social connections and educate younger generations on sustainable food systems.`,
    vocabularyGlossary: [
      { word: 'metropolitan', meaningTh: 'เกี่ยวกับเมืองใหญ่หรือมหานคร' },
      { word: 'hydroponic', meaningTh: 'การปลูกพืชไร้ดินโดยใช้น้ำสารละลายธาตุอาหาร' },
      { word: 'conventional', meaningTh: 'แบบดั้งเดิม, ตามแบบแผนปกติ' },
      { word: 'hurdles', meaningTh: 'อุปสรรค, ขวากหนาม' },
      { word: 'tariffs', meaningTh: 'อัตราค่าไฟฟ้า/ภาษีบริการ' },
    ],
    questions: [
      {
        id: 'read-q-b1-1',
        skill: 'reading',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'ข้อดีประการสำคัญของระบบไฮโดรโปนิกส์ที่ระบุในบทความคืออะไร?',
        promptEn: 'What is highlighted as a primary operational benefit of hydroponic farming?',
        options: [
          { key: 'A', text: 'It completely eliminates the need for electricity.', isCorrect: false, feedbackTh: 'บทความระบุว่าต้องใช้ไฟฟ้าและไฟ LED' },
          { key: 'B', text: 'It works best in open countryside soil.', isCorrect: false, feedbackTh: 'นี่คือระบบไร้ดินในเมือง' },
          { key: 'C', text: 'It accelerates crop growth while conserving substantial amounts of water.', isCorrect: true, feedbackTh: 'ถูกต้อง! โตเร็วขึ้น 30% และใช้น้ำน้อยลงถึง 90%' },
          { key: 'D', text: 'It requires zero initial capital investment.', isCorrect: false, feedbackTh: 'ต้นทุนเริ่มต้นยังสูง (Initial setup expenses remain high)' }
        ],
        explanationTh: 'ย่อหน้าที่ 2 ระบุว่า: "crops can grow up to thirty percent faster while utilizing ninety percent less water than conventional outdoor fields."',
        explanationEn: 'Paragraph 2 highlights 30% faster growth and 90% water reduction.',
        weaknessTag: 'comparative_data_comprehension',
        difficultyWeight: 3,
      },
      {
        id: 'read-q-b1-2',
        skill: 'reading',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'อะไรคืออุปสรรคสำคัญที่อาจทำให้ผู้เริ่มต้นลังเลที่จะทำฟาร์มในเมือง?',
        promptEn: 'What challenge is mentioned that might discourage beginner urban farmers?',
        options: [
          { key: 'A', text: 'The complete absence of community interest.', isCorrect: false, feedbackTh: 'ชุมชนให้ความสนใจดี' },
          { key: 'B', text: 'The inferior taste of hydroponically grown greens.', isCorrect: false, feedbackTh: 'ไม่มีการกล่าวว่ารสชาติด้อยกว่า' },
          { key: 'C', text: 'Stringent government bans on rooftop greenery.', isCorrect: false, feedbackTh: 'ไม่ได้ถูกรัฐบาลสั่งห้าม' },
          { key: 'D', text: 'High upfront costs for equipment and elevated electricity tariffs.', isCorrect: true, feedbackTh: 'ถูกต้อง! ค่าอุปกรณ์เริ่มต้นและค่าไฟทำให้ผู้เริ่มต้นลังเล' }
        ],
        explanationTh: 'ย่อหน้าที่ 3 ระบุถึง "Initial setup expenses for LED lighting arrays and automated sensors remain high" และ "high electricity tariffs".',
        explanationEn: 'Paragraph 3 details high upfront costs and energy bills as discouraging factors.',
        weaknessTag: 'identifying_obstacles_and_challenges',
        difficultyWeight: 3,
      },
    ],
  },

  // B2 First (FCE) Reading Passage
  {
    id: 'reading-b2-cognitive',
    title: 'The Psychology of Digital Minimalism',
    cefrLevel: 'B2',
    targetExam: 'FCE',
    topic: 'Psychology & Technology',
    wordCount: 310,
    content: `In an era characterized by hyper-connectivity, our attention spans have become the primary battleground of the global attention economy. Notification chimes, algorithmic feeds, and endless scrolling mechanisms are deliberately calibrated to trigger dopaminergic spikes, drawing users into persistent cycles of checking and reactivity. 

Dr. Cal Newport, a leading scholar on technological habits, advocates for what he terms "Digital Minimalism", a philosophy of technology use in which you focus your online time on a small number of carefully selected and optimized activities that strongly support things you value, and then happily miss out on everything else.

Critics frequently dismiss digital minimalism as an unrealistic retreat into digital asceticism, arguing that modern professionals cannot afford to sever communication channels without endangering career trajectories. However, empirical findings paint a markedly different picture. Practitioners who systematically declutter their digital lives report profound improvements in cognitive depth, sustained focus, and emotional equilibrium. Rather than abandoning modern tools, minimalists merely invert the power dynamic: tools serve explicit human intentions, rather than human consciousness serving algorithmic engagement metrics.

Implementing this philosophy demands rigorous intentionality. It begins with a thirty-day digital declutter period, during which non-essential technologies are temporarily suspended. When this reset concludes, tools are reintroduced only if they satisfy strict operational criteria: they must offer substantial positive benefit to one's core personal values, and there must be a designated protocol governing when and how they are engaged. Ultimately, digital minimalism is not anti-technology; it is pro-autonomy.`,
    vocabularyGlossary: [
      { word: 'calibrated', meaningTh: 'ได้รับการปรับแต่งอย่างละเอียดและแม่นยำ' },
      { word: 'asceticism', meaningTh: 'การสละกิเลส, การใช้ชีวิตอย่างเคร่งครัดสมถะ' },
      { word: 'trajectories', meaningTh: 'เส้นทางความก้าวหน้า (เช่น ในอาชีพการงาน)' },
      { word: 'equilibrium', meaningTh: 'ความสมดุล, ภาวะเสถียรภาพทางอารมณ์' },
      { word: 'pro-autonomy', meaningTh: 'สนับสนุนการมีอิสระในการกำหนดตนเอง' },
    ],
    questions: [
      {
        id: 'read-q-b2-1',
        skill: 'reading',
        cefrLevel: 'B2',
        type: 'multiple_choice',
        promptTh: 'แก่นแท้ของแนวคิด "Digital Minimalism" ตามที่บทความอธิบายคืออะไร?',
        promptEn: 'According to the passage, what is the core philosophy of Digital Minimalism?',
        options: [
          { key: 'A', text: 'Selectively using only digital tools that actively support core values while consciously ignoring the rest.', isCorrect: true, feedbackTh: 'ถูกต้อง! เลือกใช้เฉพาะเครื่องมือที่สนับสนุนคุณค่าสำคัญอย่างแท้จริง และยินดีปล่อยผ่านสิ่งอื่น' },
          { key: 'B', text: 'Completely rejecting all digital devices and returning to analog lifestyles.', isCorrect: false, feedbackTh: 'บทความระบุว่าไม่ใช่การปฏิเสธเทคโนโลยี' },
          { key: 'C', text: 'Checking notifications only during scheduled weekend intervals.', isCorrect: false, feedbackTh: 'นี่เป็นเพียงรายละเอียดปลีกย่อย ไม่ใช่แก่นปรัชญา' },
          { key: 'D', text: 'Switching exclusively to open-source software platforms.', isCorrect: false, feedbackTh: 'ไม่ได้กล่าวถึงประเภทของซอฟต์แวร์' }
        ],
        explanationTh: 'ย่อหน้าที่ 2 นิยามชัดเจน: "focus your online time on a small number of carefully selected and optimized activities that strongly support things you value, and then happily miss out on everything else."',
        explanationEn: 'Digital minimalism prioritizes high-value, carefully chosen activities over constant connectivity.',
        weaknessTag: 'inferring_core_thematic_philosophy',
        difficultyWeight: 4,
      },
      {
        id: 'read-q-b2-2',
        skill: 'reading',
        cefrLevel: 'B2',
        type: 'multiple_choice',
        promptTh: 'ขั้นตอนแรกในการเริ่มต้นปฏิบัติตามแนวคิด Digital Minimalism ตามที่บทความระบุคืออะไร?',
        promptEn: 'According to the passage, what is the initial phase in implementing Digital Minimalism?',
        options: [
          { key: 'A', text: 'Deleting all online profiles and social network accounts permanently.', isCorrect: false, feedbackTh: 'บทความไม่ได้บอกให้ลบบัญชีถาวร' },
          { key: 'B', text: 'A thirty-day digital declutter where non-essential technologies are temporarily suspended.', isCorrect: true, feedbackTh: 'ถูกต้อง! ในย่อหน้าที่ 4 ระบุว่าเริ่มด้วยช่วง 30-day digital declutter โดยระงับเทคโนโลยีที่ไม่จำเป็นชั่วคราว' },
          { key: 'C', text: 'Replacing all digital devices with paper notebooks and pen.', isCorrect: false, feedbackTh: 'ไม่ใช่การเลิกใช้เทคโนโลยีทั้งหมด' },
          { key: 'D', text: 'Restricting internet browsing strictly to morning hours.', isCorrect: false, feedbackTh: 'ไม่ได้ระบุให้จำกัดเวลาแค่ช่วงเช้า' }
        ],
        explanationTh: 'ย่อหน้าที่ 4 ระบุชัดเจน: "It begins with a thirty-day digital declutter period, during which non-essential technologies are temporarily suspended."',
        explanationEn: 'Paragraph 4 states: "It begins with a thirty-day digital declutter period, during which non-essential technologies are temporarily suspended."',
        weaknessTag: 'locating_factual_details',
        difficultyWeight: 4,
      },
    ],
  },
  {
    "id": "reading-a1-library",
    "title": "Riverside Community Library Notice",
    "cefrLevel": "A1",
    "targetExam": "KET",
    "topic": "Daily Life & Community",
    "wordCount": 115,
    "content": "Welcome to the Riverside Community Library! \n\nOur library is open to all students and local residents. You can borrow up to four books for two weeks. We have free high-speed Wi-Fi, computer desks, and a quiet study room on the second floor. \n\nOpening Hours:\nMonday to Friday: 08:30 – 19:30\nSaturday: 09:00 – 16:00\nSunday: Closed for cleaning\n\nPlease remember to keep your mobile phones on silent mode while inside. Food and sweetened drinks are not allowed near the computer stations, but bottled drinking water is welcome. Have a wonderful reading day!",
    "vocabularyGlossary": [
      {
        "word": "residents",
        "meaningTh": "ผู้อยู่อาศัยในท้องถิ่น"
      },
      {
        "word": "borrow",
        "meaningTh": "ยืม (หนังสือ)"
      },
      {
        "word": "silent mode",
        "meaningTh": "โหมดปิดเสียงโทรศัพท์"
      },
      {
        "word": "stations",
        "meaningTh": "จุดบริการคอมพิวเตอร์"
      }
    ],
    "questions": [
      {
        "id": "read-q-a1-lib-1",
        "skill": "reading",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ผู้ใช้บริการสามารถยืมหนังสือได้สูงสุดกี่เล่มในแต่ละครั้ง?",
        "promptEn": "How many books can a member borrow at one time?",
        "options": [
          {
            "key": "A",
            "text": "Two books",
            "isCorrect": false,
            "feedbackTh": "ยืมได้ 2 สัปดาห์ แต่จำนวนคือ 4 เล่ม"
          },
          {
            "key": "B",
            "text": "Six books",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ 6 เล่ม"
          },
          {
            "key": "C",
            "text": "Four books",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ในประกาศระบุว่า: 'borrow up to four books'"
          },
          {
            "key": "D",
            "text": "Ten books",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่ 10 เล่ม"
          }
        ],
        "explanationTh": "ประกาศระบุชัดเจน: 'You can borrow up to four books for two weeks.'",
        "explanationEn": "The notice states: 'You can borrow up to four books for two weeks.'",
        "weaknessTag": "factual_information_retrieval",
        "difficultyWeight": 1
      },
      {
        "id": "read-q-a1-lib-2",
        "skill": "reading",
        "cefrLevel": "A1",
        "type": "multiple_choice",
        "promptTh": "ห้องสมุดปิดทำการในวันใด?",
        "promptEn": "On which day is the community library closed?",
        "options": [
          {
            "key": "A",
            "text": "Every Saturday",
            "isCorrect": false,
            "feedbackTh": "วันเสาร์เปิด 09:00 - 16:00"
          },
          {
            "key": "B",
            "text": "Every Monday morning",
            "isCorrect": false,
            "feedbackTh": "วันจันทร์เปิดตามปกติ"
          },
          {
            "key": "C",
            "text": "Every Friday evening",
            "isCorrect": false,
            "feedbackTh": "วันศุกร์เปิดถึง 19:30"
          },
          {
            "key": "D",
            "text": "Every Sunday",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ในตารางระบุ: 'Sunday: Closed for cleaning'"
          }
        ],
        "explanationTh": "ในตารางเวลาทำการระบุว่า: 'Sunday: Closed for cleaning'",
        "explanationEn": "The schedule clearly marks Sunday as closed for cleaning.",
        "weaknessTag": "timetable_and_schedule_scanning",
        "difficultyWeight": 1
      }
    ]
  },
  {
    "id": "reading-a2-cooking",
    "title": "Teaching Young Children to Cook at Home",
    "cefrLevel": "A2",
    "targetExam": "KET",
    "topic": "Family & Education",
    "wordCount": 175,
    "content": "Do you enjoy cooking? Preparing meals at home is not only an enjoyable activity, but also an essential practical skill for young learners. Many nutritionists and educators encourage parents to invite their children into the kitchen early in life.\n\nEven children aged six or seven can assist with simple, safe kitchen tasks. They can wash crisp green lettuce, peel ripe bananas, measure flour with measuring spoons, or stir pancake batter in a ceramic bowl. These hands-on actions help young children develop fine motor skills and understand basic mathematics through measuring weights and volumes.\n\nMoreover, children who participate in cooking are far more likely to try healthy ingredients. When they assist in chopping sweet bell peppers or preparing a fresh carrot salad, they feel proud of their culinary creation and eat happily. Above all, cooking together provides quality family time without screen distractions, fostering communication and teamwork across generations.",
    "vocabularyGlossary": [
      {
        "word": "essential",
        "meaningTh": "สำคัญยิ่ง, จำเป็น"
      },
      {
        "word": "nutritionists",
        "meaningTh": "นักโภชนาการ"
      },
      {
        "word": "motor skills",
        "meaningTh": "ทักษะการเคลื่อนไหวของกล้ามเนื้อมือ"
      },
      {
        "word": "culinary",
        "meaningTh": "เกี่ยวกับการทำอาหาร"
      }
    ],
    "questions": [
      {
        "id": "read-q-a2-cook-1",
        "skill": "reading",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "การช่วยทำอาหารในครัวช่วยพัฒนาทักษะด้านใดของเด็กเล็กตามที่บทความระบุ?",
        "promptEn": "According to the passage, how does cooking help develop young children's skills?",
        "options": [
          {
            "key": "A",
            "text": "It strengthens fine motor coordination and basic mathematical measurements.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! พัฒนากล้ามเนื้อมือและเข้าใจคณิตศาสตร์จากการตวงวัด"
          },
          {
            "key": "B",
            "text": "It teaches them how to operate complex electrical appliances.",
            "isCorrect": false,
            "feedbackTh": "บทความเน้นกิจกรรมง่ายๆ ที่ปลอดภัย"
          },
          {
            "key": "C",
            "text": "It trains them to become professional hotel head chefs.",
            "isCorrect": false,
            "feedbackTh": "ไม่ใช่เป้าหมายเพื่อเป็นเชฟโรงแรม"
          },
          {
            "key": "D",
            "text": "It replaces regular elementary school classes completely.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้มาแทนที่โรงเรียน"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุชัดเจน: 'develop fine motor skills and understand basic mathematics through measuring weights and volumes.'",
        "explanationEn": "Paragraph 2 states that kitchen tasks develop motor skills and mathematical concepts.",
        "weaknessTag": "detail_comprehension_educational_benefits",
        "difficultyWeight": 2
      },
      {
        "id": "read-q-a2-cook-2",
        "skill": "reading",
        "cefrLevel": "A2",
        "type": "multiple_choice",
        "promptTh": "เหตุใดเด็กที่ช่วยทำอาหารจึงมีแนวโน้มที่จะรับประทานผักและอาหารเพื่อสุขภาพมากขึ้น?",
        "promptEn": "Why are children who cook more inclined to eat healthy foods?",
        "options": [
          {
            "key": "A",
            "text": "Because raw vegetables are sweeter than cooked desserts.",
            "isCorrect": false,
            "feedbackTh": "บทความไม่ได้กล่าวเปรียบเทียบความหวาน"
          },
          {
            "key": "B",
            "text": "Because they feel proud of dishes they actively helped create.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! พวกเขารู้สึกภูมิใจในอาหารที่ตนเองมีส่วนร่วมสร้างสรรค์"
          },
          {
            "key": "C",
            "text": "Because parents promise them expensive digital games afterwards.",
            "isCorrect": false,
            "feedbackTh": "บทความระบุว่าปลอดหน้าจอ ไม่ใช่การให้รางวัลเกม"
          },
          {
            "key": "D",
            "text": "Because school rules strictly mandate vegetable consumption.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เกี่ยวกับกฎโรงเรียน"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 3 ระบุว่า: 'they feel proud of their culinary creation and eat happily.'",
        "explanationEn": "Children take pride in food they prepared themselves, making them eager to eat it.",
        "weaknessTag": "cause_and_effect_inference",
        "difficultyWeight": 2
      }
    ]
  },
  {
    "id": "reading-b1-workplace",
    "title": "The Evolution of Flexible and Hybrid Work Culture",
    "cefrLevel": "B1",
    "targetExam": "PET",
    "topic": "Business & Career",
    "wordCount": 260,
    "content": "The global landscape of employment has undergone an unprecedented transformation over the past decade. Traditional office expectations, once dominated by strict nine-to-five desk routines, have yielded to flexible and hybrid models. Today, millions of professionals split their weekly schedule between domestic workstations and corporate headquarters.\n\nAdvocates of hybrid working emphasize noticeable productivity surges and reduced commuting stress. Avoiding congested highways saves workers hundreds of commuting hours annually, translating directly into improved physical well-being and healthier work-life equilibrium. Furthermore, geographic barriers have dissolved; organizations can now recruit specialized talent from diverse provinces without demanding immediate relocation.\n\nHowever, operating a distributed workforce introduces nuanced managerial challenges. Preserving corporate culture and spontaneous team bonding proves notoriously difficult over video calls. Without face-to-face casual conversations by the water fountain, junior employees may feel isolated, hindering organic mentorship and professional guidance. Additionally, the boundary between professional obligations and personal leisure frequently blurs, culminating in chronic digital burnout when employees feel perpetually compelled to answer evening emails.\n\nTo resolve these tensions, forward-thinking enterprises establish explicit communication covenants. They mandate 'core collaborative hours' for synchronous brainstorming, while dedicating remaining hours to uninterrupted independent focus. Regular in-person team retreats ensure interpersonal bonds stay vibrant, balancing autonomy with camaraderie.",
    "vocabularyGlossary": [
      {
        "word": "unprecedented",
        "meaningTh": "ที่ไม่เคยปรากฏมาก่อน"
      },
      {
        "word": "equilibrium",
        "meaningTh": "ความสมดุล, ดุลยภาพ"
      },
      {
        "word": "spontaneous",
        "meaningTh": "ที่เกิดขึ้นเองตามธรรมชาติโดยไม่วางแผนล่วงหน้า"
      },
      {
        "word": "covenants",
        "meaningTh": "ข้อตกลงร่วมกัน, พันธสัญญาในการทำงาน"
      },
      {
        "word": "camaraderie",
        "meaningTh": "มิตรภาพและความสามัคคีในทีม"
      }
    ],
    "questions": [
      {
        "id": "read-q-b1-work-1",
        "skill": "reading",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ข้อได้เปรียบประการสำคัญของการทำงานแบบไฮบริดสำหรับองค์กรคืออะไร?",
        "promptEn": "What organizational advantage of hybrid working is highlighted in the text?",
        "options": [
          {
            "key": "A",
            "text": "It completely removes the requirement for formal management.",
            "isCorrect": false,
            "feedbackTh": "บทความระบุว่าสร้างความท้าทายให้ฝ่ายจัดการ ไม่ได้ตัดการจัดการออก"
          },
          {
            "key": "B",
            "text": "It reduces employee salaries by thirty percent.",
            "isCorrect": false,
            "feedbackTh": "ไม่มีการระบุเรื่องการลดเงินเดือน"
          },
          {
            "key": "C",
            "text": "It enables recruitment of specialized talent without requiring relocation.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! สามารถจ้างงานคนเก่งจากต่างจังหวัดได้โดยไม่ต้องย้ายที่อยู่"
          },
          {
            "key": "D",
            "text": "It guarantees that junior staff never need mentorship.",
            "isCorrect": false,
            "feedbackTh": "รุ่นน้องยังต้องการการชี้แนะ"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุว่า: 'organizations can now recruit specialized talent from diverse provinces without demanding immediate relocation.'",
        "explanationEn": "The text states companies can hire talent from anywhere without requiring relocation.",
        "weaknessTag": "identifying_organizational_benefits",
        "difficultyWeight": 3
      },
      {
        "id": "read-q-b1-work-2",
        "skill": "reading",
        "cefrLevel": "B1",
        "type": "multiple_choice",
        "promptTh": "ความเสี่ยงหลักสำหรับพนักงานเมื่อทำงานจากที่บ้านคืออะไร?",
        "promptEn": "What primary risk for employees working remotely is mentioned in paragraph 3?",
        "options": [
          {
            "key": "A",
            "text": "Decreased access to home internet connections.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้พูดถึงปัญหาสัญญาณเน็ต"
          },
          {
            "key": "B",
            "text": "A total lack of job openings in the technology sector.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้พูดถึงตำแหน่งงานว่าง"
          },
          {
            "key": "C",
            "text": "Higher commuting costs on public transit.",
            "isCorrect": false,
            "feedbackTh": "การทำงานที่บ้านช่วยลดค่าเดินทาง"
          },
          {
            "key": "D",
            "text": "Blurring boundaries between work and rest leading to digital burnout.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! เส้นแบ่งเวลาทำงานกับเวลาพักผ่อนเลือนรางจนเกิดภาวะหมดไฟ"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 3 ระบุถึง 'the boundary between professional obligations and personal leisure frequently blurs, culminating in chronic digital burnout'.",
        "explanationEn": "Paragraph 3 explicitly warns of blurred work-life boundaries causing chronic burnout.",
        "weaknessTag": "identifying_workplace_risks_and_burnout",
        "difficultyWeight": 3
      }
    ]
  },
  {
    "id": "reading-b2-technology",
    "title": "Artificial Intelligence in Second Language Acquisition",
    "cefrLevel": "B2",
    "targetExam": "FCE",
    "topic": "Technology & Education",
    "wordCount": 320,
    "content": "The integration of artificial intelligence into pedagogical frameworks is fundamentally reshaping language education. Where traditional computer-assisted instruction relied on rigid, rule-based drill matrices, contemporary large language models deliver dynamic, contextually aware linguistic interactions. Learners can now engage in nuanced conversational exchanges, receive instantaneous phonetic critiques, and access bespoke feedback adapted to their exact psychometric proficiency contours.\n\nOne of the most consequential advancements lies in adaptive formative assessment. Conventional standardized examinations often induce test anxiety and capture merely a static snapshot of learner capability. In contrast, AI-driven assessment operates continuously within learning workflows. By evaluating lexical diversity, syntactic sophistication, and conversational hesitation in real time, intelligent tutoring systems estimate ability trajectories using item response theory with remarkable calibration.\n\nNonetheless, applied linguists urge caution regarding over-reliance on synthetic pedagogical agents. While algorithms excel at structural remediation and lexical scaffolding, they lack genuine human empathy and cultural pragmatics. Human communication is saturated with social nuance, subtle humor, body language, and shared emotional resonance—dimensions that current computational architectures cannot authentically replicate. Furthermore, algorithmic bias in automated speech recognition frequently penalizes non-standard regional accents, creating systemic friction for marginalized dialect speakers.\n\nConsequently, educational consensus advocates a synergistic paradigm: 'human-in-the-loop' augmentation. In this model, intelligent software handles diagnostic precision and deliberate repetitive mastery, liberating human educators to orchestrate rich collaborative debates and cultivate genuine intercultural competence.",
    "vocabularyGlossary": [
      {
        "word": "bespoke",
        "meaningTh": "ที่ปรับแต่งมาโดยเฉพาะสำหรับบุคคล"
      },
      {
        "word": "formative",
        "meaningTh": "การประเมินเพื่อพัฒนาการเรียนรู้ในระหว่างทาง"
      },
      {
        "word": "remediation",
        "meaningTh": "การแก้ไขและซ่อมแซมจุดอ่อนทางภาษา"
      },
      {
        "word": "scaffolding",
        "meaningTh": "การเสริมสร้างและประคับประคองการเรียนรู้เป็นขั้นเป็นตอน"
      },
      {
        "word": "synergistic",
        "meaningTh": "ที่ทำงานร่วมกันเพื่อเสริมพลังซึ่งกันและกัน"
      }
    ],
    "questions": [
      {
        "id": "read-q-b2-ai-1",
        "skill": "reading",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "ข้อได้เปรียบของการประเมินแบบ AI เมื่อเทียบกับการสอบวัดผลมาตรฐานแบบเดิมคืออะไร?",
        "promptEn": "What advantage of AI-driven assessment over traditional testing is emphasized in paragraph 2?",
        "options": [
          {
            "key": "A",
            "text": "It continuously tracks proficiency in real time within learning workflows rather than taking static snapshots.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ประเมินพัฒนาการอย่างต่อเนื่องในระหว่างการเรียนรู้ แทนที่จะถ่ายภาพความรู้แบบนิ่งๆ"
          },
          {
            "key": "B",
            "text": "It entirely eliminates the need for mathematical calibration.",
            "isCorrect": false,
            "feedbackTh": "บทความระบุว่าใช้โมเดล Item Response Theory ที่แม่นยำ"
          },
          {
            "key": "C",
            "text": "It guarantees that every student achieves a C2 certification in six weeks.",
            "isCorrect": false,
            "feedbackTh": "ไม่มีการรับประกันระยะเวลา"
          },
          {
            "key": "D",
            "text": "It forces learners to memorize archaic grammatical structures.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้บังคับให้ท่องจำไวยากรณ์โบราณ"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุว่า: 'In contrast, AI-driven assessment operates continuously within learning workflows... estimate ability trajectories using item response theory with remarkable calibration.'",
        "explanationEn": "Paragraph 2 explains continuous real-time assessment compared to static examination snapshots.",
        "weaknessTag": "analytical_synthesis_educational_measurement",
        "difficultyWeight": 4
      },
      {
        "id": "read-q-b2-ai-2",
        "skill": "reading",
        "cefrLevel": "B2",
        "type": "multiple_choice",
        "promptTh": "สิ่งใดที่นักภาษาศาสตร์ประยุกต์ชี้ว่า AI ยังไม่สามารถทดแทนผู้สอนที่เป็นมนุษย์ได้?",
        "promptEn": "What dimension do applied linguists argue AI cannot authentically replicate?",
        "options": [
          {
            "key": "A",
            "text": "Spelling verification and vocabulary quizzes.",
            "isCorrect": false,
            "feedbackTh": "AI ทำการตรวจตัวสะกดและคำศัพท์ได้ดีเยี่ยม"
          },
          {
            "key": "B",
            "text": "Genuine empathy, cultural pragmatics, and shared emotional resonance.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ความเข้าอกเข้าใจอย่างแท้จริง การสื่อสารเชิงวัฒนธรรม และมิติทางอารมณ์ร่วม"
          },
          {
            "key": "C",
            "text": "The speed of calculating syntactic error frequencies.",
            "isCorrect": false,
            "feedbackTh": "AI คำนวณความถี่ข้อผิดพลาดได้เร็วกว่ามนุษย์"
          },
          {
            "key": "D",
            "text": "Generating automated grammar worksheets.",
            "isCorrect": false,
            "feedbackTh": "AI สร้างใบงานได้รวดเร็ว"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 3 ระบุว่า: 'they lack genuine human empathy and cultural pragmatics... shared emotional resonance—dimensions that current computational architectures cannot authentically replicate.'",
        "explanationEn": "Paragraph 3 notes AI lacks empathy, cultural nuance, and emotional resonance.",
        "weaknessTag": "critical_evaluation_of_technological_limitations",
        "difficultyWeight": 4
      }
    ]
  },
  {
    "id": "reading-c1-urban",
    "title": "Biophilic Architecture and Climate Resilience in Tropical Metropolises",
    "cefrLevel": "C1",
    "targetExam": "CAE",
    "topic": "Architecture & Environment",
    "wordCount": 380,
    "content": "The relentless escalation of global surface temperatures, compounded by the urban heat island phenomenon, has precipitated an urgent reevaluation of metropolitan spatial planning across Southeast Asia. High-density urban cores, characterized by vast expanses of impermeable concrete and monolithic glass envelopes, function as thermal batteries, absorbing solar radiation during diurnal peaks and emitting latent heat throughout the night. In response to this compounding vulnerability, progressive architectural consortia are transitioning from purely mechanical climate-control strategies toward biophilic structural integration.\n\nBiophilic architecture operates on the premise that human physiological equilibrium and cognitive vitality are inextricably tethered to immersion in organic ecological systems. Rather than viewing vegetation as a superficial cosmetic facade, modern climate-resilient designs incorporate flora as active thermodynamic infrastructure. Multi-tiered vertical forest facades, extensive green canopy cantilevers, and permeable porous basalt pavements function synergistically to disrupt ambient microclimates. Through the physiological process of evapotranspiration, dense vertical arboretums can depress local surface temperatures by as much as four degrees Celsius, concurrently reducing the cooling loads of interior HVAC systems by up to twenty-five percent.\n\nFurthermore, these green infrastructures execute critical hydraulic mitigation during monsoonal storm events. In legacy urban grids, saturated stormwater drains routinely inundate low-lying urban wards, producing destructive urban flash floods. Biophilic urbanism incorporates bioswales, rain gardens, and subterranean retention aquifers, attenuating peak run-off velocities through natural soil percolation.\n\nNonetheless, transitioning to living architecture imposes substantial structural complexity. The persistent load of wet soil matrices mandates reinforced seismic framing, while aggressive root penetration and high moisture exposure necessitate sophisticated elastomeric waterproofing membranes. Specialized arborists must be perpetually deployed for facade maintenance, escalating recurrent operating budgets. Despite these fiscal hurdles, leading urban theorists argue that the cost of inaction—manifest in catastrophic heat fatalities and deteriorating urban habitability—dwarfs the upfront capital investment required for ecological architectural transitions.",
    "vocabularyGlossary": [
      {
        "word": "inextricably tethered",
        "meaningTh": "ผูกพันกันอย่างแนบแน่นจนไม่อาจแยกขาดได้"
      },
      {
        "word": "evapotranspiration",
        "meaningTh": "การคายระเหยของน้ำจากพืชและดินสู่บรรยากาศ"
      },
      {
        "word": "attenuating",
        "meaningTh": "การลดทอนความรุนแรงหรือชะลอความเร็วลง"
      },
      {
        "word": "bioswales",
        "meaningTh": "ร่องดินปลูกพืชซับน้ำฝนเพื่อชะลอและกรองน้ำหลาก"
      },
      {
        "word": "elastomeric",
        "meaningTh": "วัสดุยืดหยุ่นสูงที่ใช้ในการกันซึมความชื้น"
      }
    ],
    "questions": [
      {
        "id": "read-q-c1-urb-1",
        "skill": "reading",
        "cefrLevel": "C1",
        "type": "multiple_choice",
        "promptTh": "กลไกทางสรีรวิทยาใดของพืชที่ช่วยลดอุณหภูมิพื้นผิวของอาคารลงได้ตามที่บทความระบุ?",
        "promptEn": "What physiological process of vegetation is credited with reducing local surface temperatures?",
        "options": [
          {
            "key": "A",
            "text": "Subterranean percolation through reinforced basalt.",
            "isCorrect": false,
            "feedbackTh": "นี่คือกระบวนการซึมน้ำของดิน ไม่ใช่สรีรวิทยาพืช"
          },
          {
            "key": "B",
            "text": "Diurnal absorption of solar radiation into concrete thermal batteries.",
            "isCorrect": false,
            "feedbackTh": "นี่คือการกักเก็บความร้อนของคอนกรีต"
          },
          {
            "key": "C",
            "text": "Evapotranspiration releasing cooling moisture into the ambient microclimate.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! การคายระเหยน้ำ (evapotranspiration) ช่วยลดอุณหภูมิพื้นผิวได้ถึง 4 องศาเซลเซียส"
          },
          {
            "key": "D",
            "text": "The mechanical circulation of refrigerated freon.",
            "isCorrect": false,
            "feedbackTh": "นี่คือระบบเครื่องปรับอากาศกลไกเดิม"
          }
        ],
        "explanationTh": "ย่อหน้าที่ 2 ระบุชัดเจน: 'Through the physiological process of evapotranspiration, dense vertical arboretums can depress local surface temperatures by as much as four degrees Celsius'.",
        "explanationEn": "Paragraph 2 identifies evapotranspiration as the mechanism that cools local surface temperatures.",
        "weaknessTag": "complex_scientific_mechanism_comprehension",
        "difficultyWeight": 5
      },
      {
        "id": "read-q-c1-urb-2",
        "skill": "reading",
        "cefrLevel": "C1",
        "type": "multiple_choice",
        "promptTh": "ผู้เขียนบทความมีจุดยืนอย่างไรต่อต้นทุนทางการเงินที่สูงของสถาปัตยกรรมแบบชีวภาพ?",
        "promptEn": "What is the author's concluding perspective regarding the high expenditures of biophilic architecture?",
        "options": [
          {
            "key": "A",
            "text": "The expenses make it completely unviable for developing tropical cities.",
            "isCorrect": false,
            "feedbackTh": "ผู้เขียนมองว่าคุ้มค่าเมื่อเทียบกับความเสียหายหากไม่ทำ"
          },
          {
            "key": "B",
            "text": "All maintenance should be eliminated through genetic plant modification.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้เสนอเรื่องการตัดต่อพันธุกรรม"
          },
          {
            "key": "C",
            "text": "Governments should completely ban living facades due to root penetration hazards.",
            "isCorrect": false,
            "feedbackTh": "ไม่ได้สนับสนุนให้สั่งห้าม"
          },
          {
            "key": "D",
            "text": "The cost of inaction and climate vulnerability far outweighs the initial investment required.",
            "isCorrect": true,
            "feedbackTh": "ถูกต้อง! ต้นทุนของการนิ่งเฉยต่อภัยพิบัติและความร้อนสูงกว่าเงินลงทุนเริ่มต้นอย่างมาก"
          }
        ],
        "explanationTh": "ประโยคสุดท้ายของบทความสรุปว่า: 'the cost of inaction—manifest in catastrophic heat fatalities and deteriorating urban habitability—dwarfs the upfront capital investment required'.",
        "explanationEn": "The author concludes that the catastrophic costs of climate inaction far exceed upfront architectural investments.",
        "weaknessTag": "evaluating_authors_concluding_argument",
        "difficultyWeight": 5
      }
    ]
  },
];
