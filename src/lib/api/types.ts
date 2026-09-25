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
        return 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่อีกครั้ง';
      case 401:
        return 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ';
      case 403:
        return 'คุณไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้';
      case 404:
        return 'ไม่พบข้อมูลที่ร้องขอ';
      case 409:
        return 'เกิดข้อขัดแย้งของข้อมูล กรุณาลองใหม่อีกครั้ง';
      case 429:
        return 'คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่';
      case 408:
        return 'การเชื่อมต่อหมดเวลา (Request Timeout)';
      case 500:
      case 502:
      case 503:
        return 'ระบบเซิร์ฟเวอร์เกิดข้อผิดพลาดชั่วคราว กรุณาลองใหม่ในภายหลัง';
      case 0:
        return 'ไม่สามารถเชื่อมต่อเครือข่ายได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
      default:
        return rawMessage || 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
    }
  }
}
