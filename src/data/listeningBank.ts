import { ListeningExercise } from '../types';

export const LISTENING_BANK: ListeningExercise[] = [
  // A2 Key (KET) Listening Task
  {
    id: 'listen-a2-airport',
    title: 'Airport Flight Announcement',
    cefrLevel: 'A2',
    targetExam: 'KET',
    speakerAccents: 'British English (Female Announcer)',
    audioSpeedOptions: [0.75, 1.0, 1.25],
    audioScript: `Attention all passengers on flight TG 910 to London Heathrow. 
We regret to inform you that due to heavy fog over Europe, departure has been delayed by forty-five minutes. 
The revised boarding time is now ten fifteen at Gate B4. 
Passengers requiring special assistance or traveling with small infants are requested to approach the customer care desk at Gate B2. 
We sincerely apologize for any inconvenience caused to your journey today. Thank you for your patience.`,
    questions: [
      {
        id: 'listen-q-a2-1',
        skill: 'listening',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'สาเหตุที่เที่ยวบินล่าช้าคืออะไร?',
        promptEn: 'What is the reason for the flight delay?',
        options: [
          { key: 'A', text: 'Adverse weather conditions (heavy fog)', isCorrect: true, feedbackTh: 'ถูกต้อง! ในประกาศระบุว่า "due to heavy fog over Europe"' },
          { key: 'B', text: 'Mechanical difficulties on the aircraft', isCorrect: false, feedbackTh: 'ไม่ได้เกิดจากปัญหาเครื่องยนต์' },
          { key: 'C', text: 'A missing cabin crew member', isCorrect: false, feedbackTh: 'ไม่ได้กล่าวถึงลูกเรือ' },
          { key: 'D', text: 'Airport terminal maintenance', isCorrect: false, feedbackTh: 'ไม่ได้กล่าวถึงการซ่อมบำรุงอาคาร' }
        ],
        explanationTh: 'ผู้ประกาศแจ้งชัดเจนว่า: "due to heavy fog over Europe" (เนื่องจากหมอกหนาจัดทั่วยุโรป).',
        explanationEn: 'The announcement states the delay is "due to heavy fog over Europe".',
        weaknessTag: 'identifying_cause_in_announcements',
        difficultyWeight: 2,
      },
      {
        id: 'listen-q-a2-2',
        skill: 'listening',
        cefrLevel: 'A2',
        type: 'multiple_choice',
        promptTh: 'เวลาขึ้นเครื่องใหม่ (Revised boarding time) คือเวลาใด และที่ประตูใด?',
        promptEn: 'What is the revised boarding time and gate number?',
        options: [
          { key: 'A', text: '09:30 at Gate B4', isCorrect: false, feedbackTh: 'ไม่ใช่ 9:30' },
          { key: 'B', text: '10:15 at Gate B4', isCorrect: true, feedbackTh: 'ถูกต้อง! ประกาศระบุว่า "ten fifteen at Gate B4"' },
          { key: 'C', text: '10:45 at Gate B2', isCorrect: false, feedbackTh: 'Gate B2 เป็นโต๊ะให้ความช่วยเหลือพิเศษ' },
          { key: 'D', text: '11:15 at Gate A1', isCorrect: false, feedbackTh: 'ข้อมูลเวลาและประตูไม่ถูกต้อง' }
        ],
        explanationTh: 'ข้อความในประกาศระบุว่า: "The revised boarding time is now ten fifteen at Gate B4."',
        explanationEn: 'The revised boarding time is ten fifteen (10:15) at Gate B4.',
        weaknessTag: 'listening_for_times_and_numbers',
        difficultyWeight: 2,
      },
    ],
  },

  // B1 Preliminary (PET) Listening Task
  {
    id: 'listen-b1-interview',
    title: 'Podcast: Sustainable Architecture for Beginners',
    cefrLevel: 'B1',
    targetExam: 'PET',
    speakerAccents: 'Neutral English (Host & Architect)',
    audioSpeedOptions: [0.75, 1.0, 1.25],
    audioScript: `Host: Welcome back to EcoDesign Today. With us in the studio is Mark Reynolds, an eco-architect who renovates standard suburban homes into energy-neutral dwellings. Mark, what is the single biggest misconception homeowners hold about going green?

Mark: Well, Sarah, most people mistakenly believe that sustainability requires installing costly solar panels or high-tech underground heat pumps right on day one. In reality, the most cost-effective first step is simply sealing thermal leaks around windows and door frames and upgrading insulation in the roof. 

Host: Really? Just insulation?

Mark: Absolutely! A house that is thoroughly insulated retains up to forty percent more heat in winter and stays cooler during humid summer afternoons. If your building shell leaks heat, even the most expensive solar installation won't save you money. Fix the leaks first, and consider renewable equipment later.`,
    questions: [
      {
        id: 'listen-q-b1-1',
        skill: 'listening',
        cefrLevel: 'B1',
        type: 'multiple_choice',
        promptTh: 'ความเข้าใจผิดที่พบบ่อยที่สุดของเจ้าของบ้านตามที่สถาปนิกกล่าวคืออะไร?',
        promptEn: 'According to Mark, what is the primary misconception homeowners have?',
        options: [
          { key: 'A', text: 'That green buildings cannot withstand harsh winter storms.', isCorrect: false, feedbackTh: 'ไม่ได้กล่าวถึงความทนทานต่อพายุ' },
          { key: 'B', text: 'That insulation has no effect on room temperature.', isCorrect: false, feedbackTh: 'มาร์กชี้ว่าฉนวนกันความร้อนมีผลสำคัญมาก' },
          { key: 'C', text: 'That going green immediately requires expensive high-tech gear like solar panels.', isCorrect: true, feedbackTh: 'ถูกต้อง! คนส่วนใหญ่เข้าใจผิดว่าต้องเริ่มจากการติดโซลาร์เซลล์ราคาแพงทันที' },
          { key: 'D', text: 'That architects charge too much for thermal audits.', isCorrect: false, feedbackTh: 'ไม่ได้พูดถึงค่าบริการของสถาปนิก' }
        ],
        explanationTh: 'มาร์กอธิบายว่า: "most people mistakenly believe that sustainability requires installing costly solar panels or high-tech underground heat pumps right on day one."',
        explanationEn: 'Mark explains the misconception that green homes immediately require expensive renewable hardware.',
        weaknessTag: 'identifying_misconceptions_and_opinions',
        difficultyWeight: 3,
      },
    ],
  },

  // B2 First (FCE) Listening Task
  {
    id: 'listen-b2-lecture',
    title: 'University Lecture: The Evolutionary Psychology of Cooperation',
    cefrLevel: 'B2',
    targetExam: 'FCE',
    speakerAccents: 'Academic English (Male Lecturer)',
    audioSpeedOptions: [0.75, 1.0, 1.25],
    audioScript: `Good morning, everyone. In evolutionary biology, classical Darwinian competition suggests that selfish organisms prioritize individual survival and reproductive genetic propagation above all else. 
Yet when we observe human civilizations across ten thousand years of history, cooperative mutualism emerges as our defining evolutionary superpower. 

How did natural selection cultivate altruism when selfish freeloaders could theoretically exploit generosity without reciprocating? 
The mathematical resolution lies in what evolutionary biologists term 'Indirect Reciprocity'. In human tribes, an individual's reputation acts as a universal social currency. 
When you assist a fellow member without expecting an immediate payoff, other observers witness your civic generosity. 
They subsequently reward you with heightened social trust, alliance opportunities, and communal protection during times of scarcity. 
In essence, human morality evolved as an ingenious reputation-management mechanism that made long-term cooperation far more biologically advantageous than transient deceit.`,
    questions: [
      {
        id: 'listen-q-b2-1',
        skill: 'listening',
        cefrLevel: 'B2',
        type: 'multiple_choice',
        promptTh: 'กลไกใดที่ช่วยให้การช่วยเหลือผู้อื่น (Altruism) มีความได้เปรียบทางวิวัฒนาการตามการบรรยาย?',
        promptEn: 'According to the lecturer, how did indirect reciprocity make cooperation biologically advantageous?',
        options: [
          { key: 'A', text: 'By genetically eliminating selfish individuals from early tribal populations.', isCorrect: false, feedbackTh: 'ไม่ได้กำจัดทางพันธุกรรมโดยตรง' },
          { key: 'B', text: 'By forcing all individuals to live in isolated family clusters.', isCorrect: false, feedbackTh: 'ขัดแย้งกับการอยู่ร่วมกันเป็นเผ่า' },
          { key: 'C', text: 'By requiring monetary deposits before tribe members engaged in trade.', isCorrect: false, feedbackTh: 'ยุคดึกดำบรรพ์ยังไม่มีระบบเงินตรา' },
          { key: 'D', text: 'By allowing generosity to build public reputation and social trust that yields future communal support.', isCorrect: true, feedbackTh: 'ถูกต้อง! การช่วยเหลือสร้างชื่อเสียง (Reputation) และความไว้ใจ ทำให้ได้รับการช่วยเหลือกลับคืนในยามขาดแคลน' }
        ],
        explanationTh: 'ผู้บรรยายอธิบายว่า "Indirect Reciprocity" ทำให้การช่วยเหลือผู้อื่นสร้างชื่อเสียง (social currency) ซึ่งทำให้ผู้สังเกตการณ์มอบความไว้วางใจและการปกป้องช่วยเหลือในอนาคต.',
        explanationEn: 'Indirect reciprocity enables cooperative acts to build social reputation, conferring survival advantages during scarcity.',
        weaknessTag: 'comprehending_complex_theoretical_arguments',
        difficultyWeight: 4,
      },
    ],
  },
];
