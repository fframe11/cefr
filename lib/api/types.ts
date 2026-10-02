import { CEFRLevel, CambridgeExamCode } from '../../types';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  timestamp?: string;
  requestId?: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
  timestamp?: string;
  requestId?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface AuthMeUser {
  id: string;
  email: string | null;
  role: string;
}

export interface AuthMeResponse {
  user: AuthMeUser;
}

export interface UserProfileData {
  id: string;
  display_name?: string | null;
  current_cefr_level: CEFRLevel;
  target_exam: CambridgeExamCode;
  estimated_cambridge_score: number;
  streak_days: number;
  daily_goal_minutes: number;
  last_active_date: string | null;
  assessment_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileResponse {
  profile: UserProfileData;
}

export interface UpdateProfileInput {
  target_exam?: CambridgeExamCode;
  daily_goal_minutes?: number;
}

// ==========================================
// Assessment DTOs
// ==========================================

export interface AssessmentAnswerItem {
  question_id: string;
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
}

export interface AssessmentSubmitInput {
  answers: AssessmentAnswerItem[];
}

export interface IdentifiedWeaknessItem {
  tag: string;
  label_th?: string;
  error_count: number;
  last_failed_at?: string;
}

export interface AssessmentResultDTO {
  total_questions?: number;
  correct_count?: number;
  percentage_score?: number;
  estimated_cefr_level: CEFRLevel;
  estimated_cambridge_score: number;
  recommended_exam?: CambridgeExamCode;
  target_exam: string;
  estimation_method: 'platform_diagnostic_heuristic';
  skill_breakdown: Record<string, number>;
  identified_weaknesses: IdentifiedWeaknessItem[];
  is_official: false;
  disclaimer: string;
  submitted_at?: string;
  assessed_at?: string;
  assessment_completed?: boolean;
}

// ==========================================
// Progress DTOs
// ==========================================

export interface SkillProgressSummary {
  proficiency_score: number;
  questions_completed: number;
  accuracy_percentage?: number;
}

export interface UserProgressProfile {
  current_cefr_level: CEFRLevel;
  target_exam: CambridgeExamCode;
  estimated_cambridge_score: number;
  streak_days: number;
  daily_goal_minutes: number;
  last_active_date: string | null;
  assessment_completed: boolean;
  is_official: false;
}

export interface UserTelemetrySummary {
  questions_attempted: number;
  words_mastered: number;
  words_learning: number;
  active_weaknesses: number;
}

export interface MockExamSummary {
  total_completed: number;
  latest_score: number | null;
  latest_cambridge_score: number | null;
  latest_cefr: string | null;
  latest_completed_at: string | null;
}

export interface RecentActivityItem {
  id: string;
  question_id: string;
  is_correct: boolean | null;
  score_awarded: number;
  context_type: string;
  evaluation_status: string;
  attempted_at: string;
}

export interface UserProgressResponse {
  profile: UserProgressProfile;
  skills: Record<string, SkillProgressSummary>;
  telemetry: UserTelemetrySummary;
  mock_exams: MockExamSummary;
  recent_activity: RecentActivityItem[];
  estimation_method: 'platform_diagnostic_heuristic';
  is_official: false;
  disclaimer: string;
}

// ==========================================
// Analytics DTOs
// ==========================================

export interface SkillAnalyticsItem {
  skill: string;
  total_attempted: number;
  total_correct: number;
  accuracy_percentage: number;
  proficiency_score: number;
  current_level: string;
  pending_evaluation_count: number;
}

export interface MockExamHistoryItem {
  id: string;
  mock_exam_id: string;
  exam_title: string;
  exam_code: string;
  percentage_score: number;
  estimated_cambridge_score: number;
  estimated_cefr_level: string;
  submitted_at: string;
}

export interface UserAnalyticsOverview {
  total_questions_attempted: number;
  total_questions_correct: number;
  overall_accuracy_percentage: number;
  completed_mock_exams_count: number;
  streak_days: number;
  last_active_date: string | null;
}

export interface UserAnalyticsResponse {
  overview: UserAnalyticsOverview;
  skills_breakdown: SkillAnalyticsItem[];
  weaknesses_summary: WeaknessItem[];
  mock_exam_history: MockExamHistoryItem[];
  diagnostic_placement: {
    assessment_completed: boolean;
    current_cefr_level: string;
    estimated_cambridge_score: number;
  };
  recent_activity: Array<{
    id: string;
    question_id: string;
    skill: string;
    context_type: string;
    is_correct: boolean | null;
    score_awarded: number;
    evaluation_status: string;
    attempted_at: string;
  }>;
  is_official: false;
  disclaimer: string;
}

// ==========================================
// Weaknesses DTOs
// ==========================================

export interface WeaknessItem {
  id: string;
  weakness_tag: string;
  error_count: number;
  last_failed_at: string;
}

export interface UserWeaknessesQuery {
  limit?: number;
  offset?: number;
}

export interface UserWeaknessesResponse {
  weaknesses: WeaknessItem[];
  total: number;
  limit: number;
  offset: number;
}

// ==========================================
// Vocabulary Mastery DTOs
// ==========================================

export interface VocabularyMasteryRecord {
  id: string;
  vocabulary_id: string;
  mastery_percentage: number;
  review_count: number;
  consecutive_correct: number;
  next_review_at: string | null;
  last_reviewed_at: string | null;
  vocabularies: {
    id: string;
    word: string;
    lemma: string;
    cefr_level: string;
    part_of_speech: string;
    meaning_th: string;
  } | null;
}

export interface VocabularyMasteryQuery {
  status?: 'all' | 'mastered' | 'learning';
  page?: number;
  limit?: number;
}

export interface VocabularyMasteryResponse {
  mastery_records: VocabularyMasteryRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface UpdateVocabularyMasteryInput {
  vocabulary_id: string;
  is_correct: boolean;
}

export interface UpdateVocabularyMasteryResponse {
  message: string;
  mastery: {
    vocabulary_id: string;
    mastery_percentage: number;
    consecutive_correct: number;
    review_count: number;
    next_review_at: string;
    last_reviewed_at: string;
  };
}

// ==========================================
// Guest Sync DTOs
// ==========================================

export interface GuestPracticeAttempt {
  client_attempt_id?: string;
  question_id: string;
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
  context_type?: 'practice' | 'placement';
  attempted_at?: string;
}

export interface SyncGuestInput {
  practice_attempts: GuestPracticeAttempt[];
  timezone_offset_minutes?: number;
}

export interface SyncGuestResponse {
  synced_count: number;
  skipped_duplicate_count: number;
  total_processed: number;
  streak: {
    streak_days: number;
    streak_extended: boolean;
    is_active: boolean;
  };
  is_official: false;
  disclaimer: string;
}

// ==========================================
// Mock Exam DTOs
// ==========================================

export interface MockExamCatalogItemDTO {
  id: string;
  exam_code: string;
  name: string;
  target_cefr: CEFRLevel | string;
  description_th: string;
  description_en?: string;
  total_duration_minutes: number;
  passing_score: number;
  version: number;
}

export interface MockExamCatalogResponse {
  exams: MockExamCatalogItemDTO[];
  total: number;
  disclaimer: string;
}

export interface MockExamStartInput {
  mock_exam_id: string;
}

export interface MockExamStartResponseDTO {
  session_token: string;
  mock_exam_id: string;
  exam_code: string;
  name: string;
  started_at: string;
  expires_at: string;
  duration_minutes: number;
  status: 'in_progress';
  disclaimer: string;
}

export interface SafeMockOptionDTO {
  id: string;
  key: string;
  text: string;
}

export interface SafeMockQuestionDTO {
  id: string;
  mock_exam_question_id: string;
  order_index: number;
  marks: number;
  skill: string;
  type: string;
  prompt_th: string;
  prompt_en: string;
  options: SafeMockOptionDTO[];
  saved_answer?: {
    selected_option_key: string | null;
    text_answer: string | null;
  } | null;
}

export interface MockExamSectionDTO {
  id: string;
  name: string;
  skill: string;
  duration_minutes: number;
  question_count: number;
  order_index: number;
  questions: SafeMockQuestionDTO[];
}

export interface MockExamSessionResponseDTO {
  session_token: string;
  mock_exam: {
    id: string;
    exam_code: string;
    name: string;
    target_cefr: string;
    total_duration_minutes: number;
  };
  status: 'in_progress' | 'submitted' | 'timed_out' | 'abandoned';
  started_at: string;
  expires_at: string;
  remaining_seconds: number;
  sections: MockExamSectionDTO[];
  disclaimer: string;
}

export interface MockExamAutosaveInput {
  session_token: string;
  question_id: string;
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
}

export interface MockExamAutosaveResponse {
  success: boolean;
  question_id: string;
  saved_at: string;
}

export interface MockExamAnswerItem {
  question_id: string;
  selected_option_key?: string | null;
  text_answer?: string | null;
  time_spent_seconds?: number;
}

export interface MockExamSubmitInput {
  session_token: string;
  answers?: MockExamAnswerItem[];
}

export interface MockExamSubmitResponseDTO {
  attempt_id: string;
  session_token: string;
  status: 'submitted' | 'timed_out';
  started_at: string;
  submitted_at: string;
  raw_score: number;
  total_marks: number;
  percentage_score: number;
  objective_score: number;
  objective_total_marks: number;
  objective_percentage: number;
  pending_subjective_marks: number;
  has_pending_subjective: boolean;
  evaluation_status: 'completed' | 'partially_evaluated_pending_subjective';
  estimated_cefr_level: string;
  estimated_cambridge_score: number;
  is_official: false;
  disclaimer: string;
}

export interface MockExamResultResponseDTO {
  attempt_id: string;
  session_token: string;
  exam: {
    id: string;
    exam_code: string;
    name: string;
    target_cefr: string;
    passing_score: number;
    total_duration_minutes: number;
  };
  status: 'submitted' | 'timed_out';
  started_at: string;
  submitted_at: string;
  raw_score: number;
  total_marks: number;
  percentage_score: number;
  objective_score: number;
  objective_total_marks: number;
  objective_percentage: number;
  pending_subjective_marks: number;
  has_pending_subjective: boolean;
  evaluation_status: 'completed' | 'partially_evaluated_pending_subjective';
  is_passed: boolean;
  estimated_cefr_level: string;
  estimated_cambridge_score: number;
  section_breakdown: Record<string, { raw_score: number; total_marks: number; percentage: number }>;
  skill_breakdown: Record<string, { total_questions: number; correct_questions: number; percentage: number }>;
  is_official: false;
  disclaimer: string;
}

// ==========================================
// Error handling class
// ==========================================

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly friendlyMessage: string;

  constructor(status: number, message: string, code = 'API_ERROR', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.friendlyMessage = ApiError.resolveFriendlyMessage(status, code, message);
  }

  private static resolveFriendlyMessage(status: number, code: string, rawMessage: string): string {
    switch (status) {
      case 400:
        return 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบข้อมูลที่กรอกแล้วลองอีกครั้ง';
      case 401:
        return 'เซสชันหมดอายุหรือไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่อีกครั้งเพื่อดำเนินการต่อ';
      case 403:
        return 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้ กรุณาติดต่อผู้ดูแลระบบหากต้องการสิทธิ์ใช้งาน';
      case 404:
        return 'ไม่พบข้อมูลที่ต้องการ กรุณาตรวจสอบเงื่อนไขการค้นหาแล้วลองอีกครั้ง';
      case 409:
        return 'ไม่สามารถบันทึกข้อมูลได้เนื่องจากข้อมูลซ้ำซ้อน กรุณาตรวจสอบแล้วลองอีกครั้ง';
      case 429:
        return 'มีการส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วกดลองใหม่อีกครั้ง';
      case 408:
        return 'การเชื่อมต่อหมดเวลา กรุณาตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง';
      case 500:
      case 502:
      case 503:
        return 'ระบบเซิร์ฟเวอร์เกิดข้อขัดข้องชั่วคราว กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
      case 0:
        return 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบสัญญาณอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง';
      default:
        return rawMessage || 'ไม่สามารถโหลดข้อมูลได้ในขณะนี้ กรุณาตรวจสอบการเชื่อมต่อแล้วลองใหม่อีกครั้ง';
    }
  }
}
