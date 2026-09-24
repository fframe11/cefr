import { SpeakingPrompt } from '../types';

export const SPEAKING_BANK: SpeakingPrompt[] = [
  // A2 Key (KET) Speaking Part 1: Personal Interview
  {
    id: 'speak-a2-part1',
    title: 'Part 1: Daily Routine & Hometown Interview',
    cefrLevel: 'A2',
    targetExam: 'KET',
    part: 1,
    promptTh: 'การตอบคำถามแนะนำตัว กิจวัตรประจำวัน และสถานที่ที่คุณอาศัยอยู่กับกรรมการสอบ',
    promptEn: 'The examiner asks you personal questions about your daily routine, hometown, and leisure activities. Speak clearly and answer in complete sentences.',
    guidingQuestionsTh: [
      'What is your name and where do you come from? (บอกชื่อและเมืองที่คุณอาศัยอยู่)',
      'What do you usually do on weekends? (เล่ากิจกรรมที่คุณทำในวันเสาร์-อาทิตย์)',
      'Do you enjoy studying English? Why? (ชอบเรียนภาษาอังกฤษไหม เพราะอะไร)',
    ],
    targetPhrases: [
      'My name is... and I live in...',
      'In my free time, I really enjoy...',
      'Because it helps me communicate with people from around the world.',
      'I usually spend time with my family and friends.',
    ],
    modelAnswer: `Hello! My name is Tanawat, and I come from Chiang Mai, a beautiful mountainous city in northern Thailand. 
On weekends, I usually like to wake up early, ride my bicycle around the neighborhood, and meet my friends at a local cafe. 
I really enjoy studying English because it opens up exciting opportunities to travel and converse with international tourists.`,
  },

  // B1 Preliminary (PET) Speaking Part 2: Describing a Photograph
  {
    id: 'speak-b1-part2',
    title: 'Part 2: Describing People in a Public Library',
    cefrLevel: 'B1',
    targetExam: 'PET',
    part: 2,
    promptTh: 'อธิบายภาพถ่ายสถานการณ์ในห้องสมุด (พูดเดี่ยวประมาณ 1 นาที) โดยระบุว่าเห็นใคร ทำอะไร ที่ไหน และบรรยากาศเป็นอย่างไร',
    promptEn: 'Describe what you can see in a photograph depicting university students studying in a modern city library. Speak continuously for about one minute.',
    guidingQuestionsTh: [
      'In the foreground / background... (มีใครอยู่ตรงไหนในภาพบ้าง)',
      'What are they doing? (พวกเขากำลังทำอะไร เช่น พิมพ์แล็ปท็อป อ่านหนังสือ จดโน้ต)',
      'How does the environment feel? (บรรยากาศรอบๆ เช่น เงียบสงบ แสงธรรมชาติส่องสว่าง)',
      'Speculate on their feelings (คาดเดาความรู้สึก เช่น ดูตั้งใจ หรือกำลังเตรียมสอบ)',
    ],
    targetPhrases: [
      'In the center of the picture, there are...',
      'They appear to be preparing for an upcoming examination.',
      'In the background, tall bookshelves are filled with...',
      'The atmosphere looks calm, bright, and studious.',
    ],
    modelAnswer: `In this photograph, I can see three university students sitting around a spacious wooden table in a brightly lit library. 
In the foreground, a young woman with glasses is typing diligently on her laptop, while the young man sitting next to her is highlighting passages in a thick textbook. 
In the background, there are rows of tall bookshelves and large glass windows through which natural afternoon light floods the room. 
They appear to be working collaboratively on a group project, because one student is pointing at a diagram on her tablet. 
The overall atmosphere seems very quiet, focused, and scholarly.`,
  },

  // B2 First (FCE) Speaking Part 3: Collaborative Decision Task
  {
    id: 'speak-b2-part3',
    title: 'Part 3: Promoting Environmental Awareness in Schools',
    cefrLevel: 'B2',
    targetExam: 'FCE',
    part: 3,
    promptTh: 'การสนทนาแลกเปลี่ยนความคิดเห็นกับคู่สอบ (Collaborative Discussion) เพื่อร่วมกันตัดสินใจเลือกวิธีที่ดีที่สุดในการรณรงค์เรื่องสิ่งแวดล้อม',
    promptEn: 'Imagine your high school wants to inspire students to adopt greener habits. Discuss the merits and drawbacks of different campaign ideas, and then agree on which two approaches would be most effective.',
    guidingQuestionsTh: [
      'How would you initiate the discussion? (Shall we start with...?)',
      'How do you invite your partner to speak? (What is your take on this?)',
      'How do you politely disagree or build on an idea? (I see your point, but on the other hand...)',
      'How do you negotiate a joint conclusion? (So, would you agree that our top two picks should be...?)',
    ],
    targetPhrases: [
      'Shall we begin by considering the idea of...',
      'I completely see eye to eye with you on that, however...',
      'Wouldn\'t you agree that practical hands-on workshops have a greater impact than mere lectures?',
      'So, to summarize our consensus, we both feel that...',
    ],
    modelAnswer: `Shall we start by looking at organizing community tree-planting days? 
In my view, getting students directly involved in hands-on activities creates a tangible emotional connection to nature far better than passive lectures. 
What do you think about that? 
I completely agree with your point about practical engagement. However, we should also consider introducing campus-wide recycling competitions. 
Friendly rivalry between classes can generate tremendous enthusiasm and turn waste separation into a daily routine. 
Therefore, if we have to select the two most impactful initiatives, tree planting and recycling challenges would definitely deliver the greatest long-term benefits.`,
  },
];
