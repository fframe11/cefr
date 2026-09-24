import { WritingPrompt } from '../types';

export const WRITING_BANK: WritingPrompt[] = [
  // A2 Key (KET) Writing Task: Email to an English Friend
  {
    id: 'write-a2-email',
    title: 'Informal Email: Planning a Weekend Visit',
    cefrLevel: 'A2',
    targetExam: 'KET',
    taskType: 'Email',
    promptTh: 'เขียนอีเมลสั้นๆ (ประมาณ 25-35 คำ) ถึง Alex เพื่อนชาวต่างชาติ เพื่อตอบรับคำชวนไปเที่ยวช่วงสุดสัปดาห์',
    promptEn: `Read this email from your English friend Alex:
"Hi! Would you like to come to my house this Saturday? We can watch a movie or cook dinner together. What time can you arrive?"
Write an email to Alex answering the questions. Write 25 words or more.`,
    minWords: 25,
    maxWords: 45,
    guidelinesTh: [
      'ตอบรับคำชวนด้วยความยินดี (เช่น I would love to come!)',
      'บอกกิจกรรมที่อยากทำ (ดูหนัง หรือ ทำอาหาร)',
      'ระบุเวลาที่คุณจะเดินทางไปถึงบ้านของ Alex',
      'ใช้คำลงท้ายที่เหมาะสม เช่น See you soon, Best wishes',
    ],
    usefulPhrases: [
      { phrase: 'Thanks for your invitation!', meaningTh: 'ขอบคุณสำหรับคำเชิญนะ!' },
      { phrase: 'I would love to join you.', meaningTh: 'ฉันยินดีและอยากไปร่วมด้วยมากๆ' },
      { phrase: 'I can arrive around 5 PM.', meaningTh: 'ฉันน่าจะไปถึงประมาณ 5 โมงเย็น' },
      { phrase: 'See you on Saturday!', meaningTh: 'เจอกันวันเสาร์นี้นะ!' },
    ],
    sampleModelAnswer: `Hi Alex,
Thanks for the invitation! I would love to visit your house this Saturday. Cooking dinner together sounds fantastic. I can arrive at your place around five in the afternoon. See you soon!`,
    rubrics: [
      { criterion: 'Content', descriptionTh: 'ตอบครบทุกคำถาม: ยินดีไป + เลือกกิจกรรม + ระบุเวลาถึง', maxScore: 5 },
      { criterion: 'Organization', descriptionTh: 'มีคำทักทายขึ้นต้น และคำลงท้ายที่ถูกต้อง', maxScore: 5 },
      { criterion: 'Language', descriptionTh: 'ใช้ไวยากรณ์ Present/Future ง่ายๆ ถูกต้อง สะกดคำศัพท์แม่นยำ', maxScore: 5 },
    ],
  },

  // B1 Preliminary (PET) Writing Task: Article on Hobbies
  {
    id: 'write-b1-article',
    title: 'Magazine Article: A Hobby That Changed My Life',
    cefrLevel: 'B1',
    targetExam: 'PET',
    taskType: 'Article',
    promptTh: 'เขียนบทความลงนิตยสารโรงเรียน/วิทยาลัย (ประมาณ 100 คำ) หัวข้อเกี่ยวกับงานอดิเรกที่ชื่นชอบ',
    promptEn: `You see this announcement on an English-language student website:
"Articles wanted! What is your favorite hobby, and why did you start doing it? How has this activity helped you make new friends or learn new skills?"
Write your article in about 100 words.`,
    minWords: 90,
    maxWords: 120,
    guidelinesTh: [
      'ตั้งชื่อบทความให้น่าสนใจ (Catchy Title)',
      'ย่อหน้า 1: แนะนำงานอดิเรกและบอกจุดเริ่มต้นว่าทำไมจึงสนใจ',
      'ย่อหน้า 2: อธิบายทักษะที่ได้เรียนรู้และมิตรภาพที่เกิดขึ้น',
      'ย่อหน้า 3: สรุปและให้คำแนะนำแก่ผู้อื่นที่สนใจเริ่มต้น',
      'ใช้คำเชื่อม เช่น Although, In addition, Consequently, For instance',
    ],
    usefulPhrases: [
      { phrase: 'I first discovered my passion for...', meaningTh: 'ฉันค้นพบความหลงใหลใน...เป็นครั้งแรกเมื่อ...' },
      { phrase: 'Not only is it enjoyable, but it also...', meaningTh: 'ไม่เพียงแต่สนุกเท่านั้น แต่ยังช่วย...' },
      { phrase: 'It has significantly broadened my horizon.', meaningTh: 'มันช่วยเปิดโลกทัศน์ของฉันอย่างมาก' },
      { phrase: 'I wholeheartedly encourage anyone to...', meaningTh: 'ฉันสนับสนุนอย่างยิ่งให้ทุกคนลอง...' },
    ],
    sampleModelAnswer: `Why Photography Stole My Heart

Three years ago, I received an old digital camera for my birthday. What began as a casual pastime quickly developed into a genuine obsession. 

Photography taught me patience and mindfulness. Rather than rushing through daily life, I began noticing subtle details, golden morning sunlight filtering through trees or genuine smiles on commuters' faces. In addition, joining a local photography club allowed me to connect with creative individuals from diverse generations. 

If you are looking for an inspiring hobby that stimulates both creativity and social bonding, picking up a camera is undoubtedly the ideal adventure!`,
    rubrics: [
      { criterion: 'Content', descriptionTh: 'ครอบคลุมครบ: ชื่องานอดิเรก + เหตุผลที่เริ่ม + ประโยชน์/มิตรภาพ', maxScore: 5 },
      { criterion: 'Communicative Achievement', descriptionTh: 'น้ำเสียงเป็นมิตร ชวนติดตาม เหมาะกับผู้อ่านนิตยสาร', maxScore: 5 },
      { criterion: 'Organization', descriptionTh: 'แบ่งย่อหน้าชัดเจน มีคำเชื่อมร้อยเรียงความคิดอย่างมีระบบ', maxScore: 5 },
      { criterion: 'Language', descriptionTh: 'ใช้ศัพท์หลากหลาย เช่น casual pastime, mindfulness, diverse generations', maxScore: 5 },
    ],
  },

  // B2 First (FCE) Writing Task: Formal Essay
  {
    id: 'write-b2-essay',
    title: 'Opinion Essay: The Impact of Remote Work on Society',
    cefrLevel: 'B2',
    targetExam: 'FCE',
    taskType: 'Essay',
    promptTh: 'เขียนเรียงความเชิงวิชาการ (140-190 คำ) อภิปรายว่าการทำงานระยะไกลส่งผลดีหรือผลเสียต่อสังคมมากกว่ากัน',
    promptEn: `In your English class, you have been talking about modern employment trends. Now, your English teacher has asked you to write an essay.
"Has the transition toward remote work benefited employees and society overall?"
Notes:
Write about:
1. Work-life balance and flexibility
2. Social interaction and teamwork
3. (Your own idea, e.g., environmental impact or local economies)
Write 140-190 words in an appropriate academic style.`,
    minWords: 140,
    maxWords: 190,
    guidelinesTh: [
      'เขียนในสไตล์ที่เป็นทางการ (Formal Tone) หลีกเลี่ยงรูปย่อ เช่น don\'t, can\'t',
      'ย่อหน้า 1: คำนำ (Introduction) เกริ่นนำประเด็นและแสดงข้อคิดเห็นทั่วไป',
      'ย่อหน้า 2: อภิปรายข้อดีเรื่อง Work-life balance และความยืดหยุ่น',
      'ย่อหน้า 3: วิเคราะห์ความท้าทายเรื่องปฏิสัมพันธ์ทางสังคมหรือผลกระทบต่อสิ่งแวดล้อม',
      'ย่อหน้า 4: สรุป (Conclusion) สรุปจุดยืนอย่างชัดเจนและมีน้ำหนัก',
    ],
    usefulPhrases: [
      { phrase: 'It is widely acknowledged that...', meaningTh: 'เป็นที่ยอมรับอย่างกว้างขวางว่า...' },
      { phrase: 'On the one hand,... On the other hand,...', meaningTh: 'ในแง่หนึ่ง... แต่อีกแง่หนึ่ง...' },
      { phrase: 'A compelling argument in favor of...', meaningTh: 'ข้อสนับสนุนที่มีน้ำหนักประการหนึ่งคือ...' },
      { phrase: 'Taking all these factors into consideration,...', meaningTh: 'เมื่อพิจารณาปัจจัยเหล่านี้ทั้งหมดแล้ว...' },
    ],
    sampleModelAnswer: `The shift toward remote employment represents one of the most significant occupational developments of the twenty-first century. While telecommuting introduces notable collaboration dilemmas, its comprehensive benefits for individuals and the global environment remain compelling.

First and foremost, flexible schedules drastically improve work-life balance. By eliminating agonizing daily commutes, employees gain precious hours to dedicate to physical exercise, familial responsibilities, and restful sleep. Consequently, numerous studies indicate an increase in overall job satisfaction and mental well-being.

Nevertheless, critics reasonably point out that prolonged physical isolation can erode spontaneous team cohesion and professional mentoring. When interactions occur exclusively through digital monitors, building authentic workplace camaraderie proves challenging.

However, from an environmental standpoint, reduced transportation significantly mitigates urban traffic congestion and greenhouse gas emissions. 

Taking all these considerations into account, the advantages of remote work unequivocally outweigh its shortcomings, provided organizations implement structured hybrid policies that preserve vital interpersonal touchpoints.`,
    rubrics: [
      { criterion: 'Content', descriptionTh: 'ตอบครบ 3 ประเด็น: work-life balance + social cohesion + environmental impact', maxScore: 5 },
      { criterion: 'Communicative Achievement', descriptionTh: 'ภาษาวิชาการเป็นทางการ ไม่มีรูปย่อ มีการวางเหตุและผล', maxScore: 5 },
      { criterion: 'Organization', descriptionTh: 'มี 4 ย่อหน้าชัดเจน มีคำเชื่อมขั้นสูง เช่น Consequently, Nevertheless, Unequivocally', maxScore: 5 },
      { criterion: 'Language', descriptionTh: 'คลังคำศัพท์ระดับ B2/C1 แม่นยำ เช่น significant developments, mitigate congestion', maxScore: 5 },
    ],
  },
];
