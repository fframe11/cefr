import { apiClient } from './client';
import { CEFRLevel, SkillType, QuestionType, Question } from '../../types';

export interface QuestionsQueryParams {
  id?: string;
  skill?: SkillType;
  cefr?: CEFRLevel;
  question_type?: QuestionType;
  weakness_tag?: string;
  grammar_topic_id?: string;
  reading_passage_id?: string;
  listening_exercise_id?: string;
  page?: number;
  limit?: number;
}

export interface SanitizedOptionDTO {
  id: string;
  key: string;
  text: string;
}

export interface SanitizedQuestionDTO {
  id: string;
  skill: string;
  cefrLevel: string;
  questionType: string;
  prompt_th: string;
  prompt_en: string;
  contextPassage: string | null;
  audioStoragePath: string | null;
  difficultyWeight: number;
  weaknessTag: string;
  grammarTopicId?: string | null;
  readingPassageId?: string | null;
  listeningExerciseId?: string | null;
  options: SanitizedOptionDTO[];
}

export interface QuestionsPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface QuestionsResponseDTO {
  questions: SanitizedQuestionDTO[];
  pagination: QuestionsPaginationDTO;
}

export interface SingleQuestionResponseDTO {
  question: SanitizedQuestionDTO;
}

/**
 * Adapter function mapping SanitizedQuestionDTO to frontend Question model.
 * 
 * SECURITY INVARIANT:
 * Questions received from the API intentionally do NOT expose answer keys or correct choices.
 * isCorrect and feedbackTh are populated only after grading response from /api/practice/submit.
 */
export function mapQuestionDtoToQuestion(dto: SanitizedQuestionDTO): Question {
  return {
    id: dto.id,
    skill: dto.skill as SkillType,
    cefrLevel: dto.cefrLevel as CEFRLevel,
    type: dto.questionType as QuestionType,
    promptTh: dto.prompt_th,
    promptEn: dto.prompt_en,
    contextPassage: dto.contextPassage || undefined,
    audioUrl: dto.audioStoragePath || undefined,
    weaknessTag: dto.weaknessTag || 'general',
    difficultyWeight: dto.difficultyWeight || 1,
    explanationTh: '', // Populated post-submission via /api/practice/submit
    explanationEn: '',
    options: (dto.options || []).map((opt) => ({
      key: opt.key,
      text: opt.text,
      isCorrect: false, // Server authoritative grading
      feedbackTh: '',
    })),
  };
}

/**
 * GET /api/questions
 * Fetches practice questions filtered by skill, CEFR, topic, passage, or exercise.
 */
export async function getQuestions(params: QuestionsQueryParams = {}): Promise<QuestionsResponseDTO> {
  const queryParts: string[] = [];
  if (params.id) queryParts.push(`id=${encodeURIComponent(params.id)}`);
  if (params.skill) queryParts.push(`skill=${encodeURIComponent(params.skill)}`);
  if (params.cefr) queryParts.push(`cefr=${encodeURIComponent(params.cefr)}`);
  if (params.question_type) queryParts.push(`question_type=${encodeURIComponent(params.question_type)}`);
  if (params.weakness_tag) queryParts.push(`weakness_tag=${encodeURIComponent(params.weakness_tag)}`);
  if (params.grammar_topic_id) queryParts.push(`grammar_topic_id=${encodeURIComponent(params.grammar_topic_id)}`);
  if (params.reading_passage_id) queryParts.push(`reading_passage_id=${encodeURIComponent(params.reading_passage_id)}`);
  if (params.listening_exercise_id) queryParts.push(`listening_exercise_id=${encodeURIComponent(params.listening_exercise_id)}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<QuestionsResponseDTO>(`/api/questions${queryString}`, { skipAuth: true });
}

/**
 * GET /api/questions?id=:id
 * Fetches a single practice question by ID.
 */
export async function getQuestionById(id: string): Promise<SingleQuestionResponseDTO> {
  return apiClient.get<SingleQuestionResponseDTO>(`/api/questions?id=${encodeURIComponent(id)}`, { skipAuth: true });
}
