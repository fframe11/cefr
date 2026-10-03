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
    ],
  },
];
