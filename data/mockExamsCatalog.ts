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
];
