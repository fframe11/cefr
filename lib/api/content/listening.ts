import { apiClient } from '../client';
import { CEFRLevel, CambridgeExamCode, ListeningExercise } from '../../../types';

export interface ListeningQueryParams {
  cefr_level?: CEFRLevel;
  target_exam?: CambridgeExamCode;
  page?: number;
  limit?: number;
}

export interface ListeningExerciseDTO {
  id: string;
  title: string;
  cefr_level: CEFRLevel;
  target_exam: CambridgeExamCode;
  speaker_accents: string;
  audio_storage_path: string | null;
  speed_options?: number[];
  audio_script: string;
}

export interface ListeningPaginationDTO {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ListeningResponseDTO {
  exercises: ListeningExerciseDTO[];
  pagination: ListeningPaginationDTO;
}

/**
 * Adapter function mapping backend ListeningExerciseDTO to frontend ListeningExercise model
 */
export function mapListeningDtoToExercise(dto: ListeningExerciseDTO): ListeningExercise {
  return {
    id: dto.id,
    title: dto.title,
    cefrLevel: dto.cefr_level,
    targetExam: dto.target_exam,
    speakerAccents: dto.speaker_accents || 'British English',
    audioScript: dto.audio_script || '',
    audioSpeedOptions: dto.speed_options || [0.8, 1.0, 1.2],
    audioUrl: dto.audio_storage_path || undefined,
    questions: [], // Loaded dynamically via Questions API
  };
}

/**
 * GET /api/content/listening
 * Fetches listening exercises with optional CEFR and target exam filters.
 */
export async function getListeningExercises(params: ListeningQueryParams = {}): Promise<ListeningResponseDTO> {
  const queryParts: string[] = [];
  if (params.cefr_level) queryParts.push(`cefr_level=${encodeURIComponent(params.cefr_level)}`);
  if (params.target_exam) queryParts.push(`target_exam=${encodeURIComponent(params.target_exam)}`);
  if (params.page !== undefined) queryParts.push(`page=${params.page}`);
  if (params.limit !== undefined) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
  return apiClient.get<ListeningResponseDTO>(`/api/content/listening${queryString}`, { skipAuth: true });
}
