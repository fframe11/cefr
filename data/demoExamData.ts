/**
 * GLOVA LEAD DEMO EXAM DATASET
 * =========================================================================
 * Synthetic Cambridge B2 demonstration exam dataset designed specifically
 * for Lead testing and sandbox walk-throughs.
 * 
 * PROVENANCE & ISOLATION INVARIANTS:
 * 1. REAL PRODUCTION DATA IS 100% UNTOUCHED AND NEVER OVERWRITTEN.
 * 2. source = 'demo', dataset = 'lead_demo', environment = 'demo', is_demo = true.
 * 3. Deterministic UUIDs prefixed with 'dddddddd-0000-4000-a000-...'
 * 4. Zero answer leakage: answers & correct keys are held server-side only.
 * =========================================================================
 */

export const LEAD_DEMO_EXAM_ID = 'dddddddd-0000-4000-a000-000000000001';

export interface DemoQuestionOption {
  id: string;
  key: string;
  text: string;
  isCorrect?: boolean;
  feedbackTh?: string;
}

export interface DemoExamQuestion {
  id: string;
  mockExamQuestionId: string;
  orderIndex: number;
  marks: number;
  skill: 'reading' | 'grammar' | 'listening';
  type: 'multiple_choice' | 'fill_blank';
  promptTh: string;
  promptEn: string;
  contextPassage?: string | null;
  audioScript?: string | null;
  correctAnswerText?: string | null;
  weaknessTag: string;
  difficultyWeight: number;
  source: 'demo';
  dataset: 'lead_demo';
  environment: 'demo';
  is_demo: true;
  options: DemoQuestionOption[];
}

export interface DemoExamSection {
  id: string;
  name: string;
  skill: 'reading' | 'listening';
  durationMinutes: number;
  questionCount: number;
  orderIndex: number;
  questions: DemoExamQuestion[];
}

export interface DemoMockExam {
  id: string;
  examCode: 'FCE';
  name: string;
  targetCefr: 'B2';
  descriptionTh: string;
  totalDurationMinutes: number;
  passingScore: number;
  version: number;
  source: 'demo';
  dataset: 'lead_demo';
  environment: 'demo';
  is_demo: true;
  sections: DemoExamSection[];
}

export const LEAD_DEMO_EXAM: DemoMockExam = {
  id: LEAD_DEMO_EXAM_ID,
  examCode: 'FCE',
  name: 'B2 First (FCE) Cambridge Practice Exam',
  targetCefr: 'B2',
  descriptionTh: 'ชุดข้อสอบจำลองมาตรฐาน Cambridge B2 First (FCE) ครบทั้ง Reading & Use of English และ Listening Comprehension พร้อมระบบจับเวลาและตรวจคะแนนอัตโนมัติ',
  totalDurationMinutes: 25,
  passingScore: 60,
  version: 1,
  source: 'demo',
  dataset: 'lead_demo',
  environment: 'demo',
  is_demo: true,
  sections: [
    {
      id: 'dddddddd-0000-4000-a000-000000000002',
      name: 'Reading & Use of English',
      skill: 'reading',
      durationMinutes: 15,
      questionCount: 3,
      orderIndex: 1,
      questions: [
        {
          id: 'dddddddd-0000-4000-a000-000000000011',
          mockExamQuestionId: 'dddddddd-0000-4000-a000-000000000021',
          orderIndex: 1,
          marks: 1,
          skill: 'reading',
          type: 'multiple_choice',
          promptTh: 'เลือกคำศัพท์ที่ถูกต้องสำหรับ collocations ในบริบททางธุรกิจ',
          promptEn: 'Choose the correct word to complete the sentence:',
          contextPassage: "The company's newly introduced flexible working policy had an immediate _____ on overall employee productivity.",
          weaknessTag: 'vocabulary_business_collocations',
          difficultyWeight: 2,
          source: 'demo',
          dataset: 'lead_demo',
          environment: 'demo',
          is_demo: true,
          options: [
            { id: 'demo-opt-1a', key: 'A', text: 'impact', isCorrect: true, feedbackTh: 'ถูกต้อง! "have an impact on" เป็น collocation ที่เป็นธรรมชาติ' },
            { id: 'demo-opt-1b', key: 'B', text: 'affect', isCorrect: false, feedbackTh: 'affect เป็นคำกริยา ในช่องว่างนี้ต้องการคำนาม' },
            { id: 'demo-opt-1c', key: 'C', text: 'result', isCorrect: false, feedbackTh: 'result มักใช้กับ "result in" หรือ "as a result of"' },
            { id: 'demo-opt-1d', key: 'D', text: 'outcome', isCorrect: false, feedbackTh: 'outcome ไม่นิยมใช้ใน collocation "have an outcome on"' },
          ],
        },
        {
          id: 'dddddddd-0000-4000-a000-000000000012',
          mockExamQuestionId: 'dddddddd-0000-4000-a000-000000000022',
          orderIndex: 2,
          marks: 1,
          skill: 'grammar',
          type: 'multiple_choice',
          promptTh: 'เลือกโครงสร้าง Third Conditional ที่ถูกต้องเพื่อบอกเหตุการณ์สมมติในอดีต',
          promptEn: 'Select the correct verb structure for the past conditional:',
          contextPassage: 'If she _____ more attentively during the technical briefing, she would not have made those critical configuration errors.',
          weaknessTag: 'third_conditional_past_unreal',
          difficultyWeight: 2,
          source: 'demo',
          dataset: 'lead_demo',
          environment: 'demo',
          is_demo: true,
          options: [
            { id: 'demo-opt-2a', key: 'A', text: 'had listened', isCorrect: true, feedbackTh: 'ถูกต้อง! โครงสร้าง Third Conditional คือ If + Past Perfect, would have + V3' },
            { id: 'demo-opt-2b', key: 'B', text: 'listened', isCorrect: false, feedbackTh: 'listened เป็น Past Simple สำหรับ Second Conditional' },
            { id: 'demo-opt-2c', key: 'C', text: 'would listen', isCorrect: false, feedbackTh: 'would listen ไม่ใช้ใน if-clause' },
            { id: 'demo-opt-2d', key: 'D', text: 'has listened', isCorrect: false, feedbackTh: 'has listened เป็น Present Perfect' },
          ],
        },
        {
          id: 'dddddddd-0000-4000-a000-000000000013',
          mockExamQuestionId: 'dddddddd-0000-4000-a000-000000000023',
          orderIndex: 3,
          marks: 1,
          skill: 'grammar',
          type: 'fill_blank',
          promptTh: 'เติมคำบุพบทเพื่อสร้าง Phrasal Verb ที่หมายถึง "ดำเนินต่อไป"',
          promptEn: 'Complete the sentence with one preposition to form the correct phrasal verb meaning "continue":',
          contextPassage: 'Despite severe supply chain disruptions, the engineering team managed to carry _____ with the cloud database migration.',
          correctAnswerText: 'on',
          weaknessTag: 'phrasal_verbs_carry_on',
          difficultyWeight: 2,
          source: 'demo',
          dataset: 'lead_demo',
          environment: 'demo',
          is_demo: true,
          options: [],
        },
      ],
    },
    {
      id: 'dddddddd-0000-4000-a000-000000000003',
      name: 'Listening Comprehension',
      skill: 'listening',
      durationMinutes: 10,
      questionCount: 2,
      orderIndex: 2,
      questions: [
        {
          id: 'dddddddd-0000-4000-a000-000000000014',
          mockExamQuestionId: 'dddddddd-0000-4000-a000-000000000024',
          orderIndex: 4,
          marks: 1,
          skill: 'listening',
          type: 'multiple_choice',
          promptTh: 'ผู้พูดเสนอแนะวิธีใดในการแก้ปัญหาการประสานงานของทีม?',
          promptEn: 'What does the team leader recommend to streamline project handoffs?',
          audioScript: 'In our quarterly review, several team leads highlighted friction during cross-functional handoffs. Rather than adding lengthy status meetings, I strongly recommend introducing concise daily ten-minute stand-ups.',
          weaknessTag: 'listening_identifying_recommendations',
          difficultyWeight: 2,
          source: 'demo',
          dataset: 'lead_demo',
          environment: 'demo',
          is_demo: true,
          options: [
            { id: 'demo-opt-4a', key: 'A', text: 'Scheduling longer weekly alignment meetings', isCorrect: false, feedbackTh: 'ผู้พูดปฏิเสธการเพิ่มการประชุมที่ยืดเยื้อ' },
            { id: 'demo-opt-4b', key: 'B', text: 'Introducing concise daily ten-minute stand-ups', isCorrect: true, feedbackTh: 'ถูกต้อง! แนะนำการยืนคุยสั้นๆ 10 นาทีทุกวัน' },
            { id: 'demo-opt-4c', key: 'C', text: 'Writing comprehensive daily email reports', isCorrect: false, feedbackTh: 'ไม่ได้กล่าวถึงการเขียนอีเมลรายงาน' },
            { id: 'demo-opt-4d', key: 'D', text: 'Postponing the quarterly review indefinitely', isCorrect: false, feedbackTh: 'ไม่ได้แนะนำให้เลื่อนการทบทวนประจำไตรมาส' },
          ],
        },
        {
          id: 'dddddddd-0000-4000-a000-000000000015',
          mockExamQuestionId: 'dddddddd-0000-4000-a000-000000000025',
          orderIndex: 5,
          marks: 1,
          skill: 'listening',
          type: 'multiple_choice',
          promptTh: 'ทำไมวิทยากรจึงประหลาดใจกับจำนวนผู้เข้าร่วมงาน?',
          promptEn: 'Why was the conference director surprised by the audience turnout?',
          audioScript: 'Given the widespread transit disruption announced earlier this morning, our team anticipated fewer than one hundred participants, so welcoming over three hundred delegates was an extraordinary surprise.',
          weaknessTag: 'listening_interpreting_surprise',
          difficultyWeight: 2,
          source: 'demo',
          dataset: 'lead_demo',
          environment: 'demo',
          is_demo: true,
          options: [
            { id: 'demo-opt-5a', key: 'A', text: 'Because transit disruptions kept all attendees away', isCorrect: false, feedbackTh: 'ตรงกันข้าม มีผู้เข้าร่วมมากกว่าที่คาดไว้มาก' },
            { id: 'demo-opt-5b', key: 'B', text: 'Because over three hundred delegates attended despite transit disruption', isCorrect: true, feedbackTh: 'ถูกต้อง! มีผู้เข้าร่วมเกิน 300 คนแม้ว่าจะมีการหยุดชะงักของการเดินทาง' },
            { id: 'demo-opt-5c', key: 'C', text: 'Because the keynote speaker canceled at the last minute', isCorrect: false, feedbackTh: 'ไม่มีการกล่าวถึงการยกเลิกของวิทยากรหลัก' },
            { id: 'demo-opt-5d', key: 'D', text: 'Because the event had to be relocated online', isCorrect: false, feedbackTh: 'ไม่ได้ย้ายงานไปจัดออนไลน์' },
          ],
        },
      ],
    },
  ],
};

export const LEAD_DEMO_EXAM_CATALOG_ITEM = {
  id: LEAD_DEMO_EXAM.id,
  exam_code: LEAD_DEMO_EXAM.examCode,
  name: LEAD_DEMO_EXAM.name,
  target_cefr: LEAD_DEMO_EXAM.targetCefr,
  description_th: LEAD_DEMO_EXAM.descriptionTh,
  total_duration_minutes: LEAD_DEMO_EXAM.totalDurationMinutes,
  passing_score: LEAD_DEMO_EXAM.passingScore,
  version: LEAD_DEMO_EXAM.version,
  source: LEAD_DEMO_EXAM.source,
  dataset: LEAD_DEMO_EXAM.dataset,
  environment: LEAD_DEMO_EXAM.environment,
  is_demo: true,
};

/**
 * Returns safe demo sections with answers, correct keys, and explanations STRICTLY STRIPPED.
 */
export function getSanitizedDemoSections() {
  return LEAD_DEMO_EXAM.sections.map((section) => ({
    id: section.id,
    name: section.name,
    skill: section.skill,
    duration_minutes: section.durationMinutes,
    question_count: section.questionCount,
    order_index: section.orderIndex,
    questions: section.questions.map((q) => ({
      id: q.id,
      mock_exam_question_id: q.mockExamQuestionId,
      order_index: q.orderIndex,
      marks: q.marks,
      skill: q.skill,
      type: q.type,
      prompt_th: q.promptTh,
      prompt_en: q.promptEn,
      context_passage: q.contextPassage || null,
      audio_script: q.audioScript || null,
      options: q.options.map((opt) => ({
        id: opt.id,
        key: opt.key,
        text: opt.text,
      })),
      saved_answer: null,
    })),
  }));
}
