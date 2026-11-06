export interface MockExamCatalogItemDTO {
  id: string;
  exam_code: string;
  name: string;
  target_cefr: string;
  description_th: string;
  total_duration_minutes: number;
  passing_score: number;
  version: number;
}

/**
 * Public catalog metadata for Cambridge Mock Examinations.
 * Contains only non-sensitive catalog information (title, description, duration, CEFR).
 * Zero question content, zero answer keys.
 */
export const CAMBRIDGE_MOCK_EXAMS_CATALOG: MockExamCatalogItemDTO[] = [
  {
    id: 'mock-ket-01',
    exam_code: 'KET',
    name: 'A2 Key (KET) Standard Mock Exam',
    target_cefr: 'A2',
    description_th: 'การสอบจำลองระดับพื้นฐาน A2 Key เหมาะสำหรับนักเรียนที่ต้องการทดสอบความสามารถในการสื่อสารในชีวิตประจำวัน',
    total_duration_minutes: 45,
    passing_score: 60,
    version: 1,
  },
  {
    id: 'mock-pet-01',
    exam_code: 'PET',
    name: 'B1 Preliminary (PET) Standard Mock Exam',
    target_cefr: 'B1',
    description_th: 'การสอบจำลองระดับกลาง B1 Preliminary เหมาะสำหรับผู้เรียนที่ต้องการพัฒนาทักษะภาษาอังกฤษเพื่อการทำงาน การเรียน หรือการท่องเที่ยว',
    total_duration_minutes: 60,
    passing_score: 65,
    version: 1,
  },
  {
    id: 'mock-fce-01',
    exam_code: 'FCE',
    name: 'B2 First (FCE) Standard Mock Exam',
    target_cefr: 'B2',
    description_th: 'การสอบจำลองระดับกลางขั้นสูง B2 First เหมาะสำหรับผู้ที่ต้องการพิสูจน์ทักษะภาษาอังกฤษเพื่อการเรียนต่อในระดับมหาวิทยาลัยหรือทำงานในองค์กรสากล',
    total_duration_minutes: 75,
    passing_score: 60,
    version: 1,
  },
  {
    id: 'mock-cae-01',
    exam_code: 'CAE',
    name: 'C1 Advanced (CAE) Mock Exam 1',
    target_cefr: 'C1',
    description_th: 'การสอบจำลองระดับสูง C1 Advanced (CAE) วัดทักษะ Reading & Use of English และ Listening รวม 86 ข้อ จับเวลา 130 นาที อิงเกณฑ์คะแนน Cambridge English Scale (180–199)',
    total_duration_minutes: 130,
    passing_score: 60,
    version: 1,
  },
  {
    id: 'mock-cpe-01',
    exam_code: 'CPE',
    name: 'C2 Proficiency (CPE) Mock Exam 1',
    target_cefr: 'C2',
    description_th: 'การสอบจำลองระดับสูงสุด C2 Proficiency (CPE) วัดทักษะระดับเจ้าของภาษา Reading & Use of English และ Listening รวม 83 ข้อ จับเวลา 130 นาที อิงเกณฑ์คะแนน Cambridge English Scale (200–230)',
    total_duration_minutes: 130,
    passing_score: 60,
    version: 1,
  },
  {
    id: 'mock-ielts-01',
    exam_code: 'IELTS',
    name: 'IELTS Academic Practice Exam 1',
    target_cefr: 'C1',
    description_th: 'การสอบจำลอง IELTS Academic ครอบคลุม Academic Reading และ Listening รวม 80 ข้อ จับเวลา 90 นาที แปลงผลคะแนนสู่เกณฑ์มาตรฐานสากล IELTS Band 1.0–9.0',
    total_duration_minutes: 90,
    passing_score: 65,
    version: 1,
  },
];
