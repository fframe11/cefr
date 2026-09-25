import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { NotFoundError, UnauthorizedError } from '../_lib/errors/api-error';

export interface SkillAnalyticsItem {
  skill: string;
  total_attempted: number;
  total_correct: number;
  accuracy_percentage: number;
  proficiency_score: number;
  current_level: string;
  pending_evaluation_count: number;
}

const ALL_SKILLS = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'] as const;

function proficiencyToCefr(score: number): string {
  if (score >= 90) return 'C2';
  if (score >= 75) return 'C1';
  if (score >= 60) return 'B2';
  if (score >= 45) return 'B1';
  if (score >= 30) return 'A2';
  return 'A1';
}

/**
 * GET /api/user/analytics
 * Provides comprehensive learning analytics, skill breakdown radar metrics,
 * weakness tracking, and performance trajectory.
 */
export default createApiHandler(
  async ({ user }) => {
    if (!user) {
      throw new UnauthorizedError('Authentication required to access analytics.');
    }

    const supabase = createServiceRoleClient();

    // 1. Fetch User Profile
    const { data: profile, error: pError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (pError || !profile) {
      throw new NotFoundError('User profile not found.');
    }

    // 2. Fetch Skill Progress Table Records
    const { data: skillProgressRecords } = await supabase
      .from('user_skill_progress')
      .select('skill, proficiency_score, questions_completed')
      .eq('user_id', user.id);

    const skillProgressMap = new Map<string, { proficiency_score: number; questions_completed: number }>();
    if (skillProgressRecords) {
      for (const rec of skillProgressRecords) {
        skillProgressMap.set(rec.skill, rec);
      }
    }

    // 3. Fetch All Question Attempts with Question Skill Info
    const { data: attempts } = await supabase
      .from('user_question_attempts')
      .select('id, question_id, is_correct, score_awarded, evaluation_status, context_type, attempted_at, questions(skill)')
      .eq('user_id', user.id)
      .order('attempted_at', { ascending: false });

    const totalAttempts = attempts?.length || 0;
    let totalCorrect = 0;
    let evaluatedCount = 0;

    const skillCounts: Record<
      string,
      { attempted: number; correct: number; pending: number }
    > = {};

    for (const s of ALL_SKILLS) {
      skillCounts[s] = { attempted: 0, correct: 0, pending: 0 };
    }

    if (attempts) {
      for (const att of attempts) {
        // Safe skill resolution
        const qSkill = (att.questions as any)?.skill;
        const skillKey = qSkill && skillCounts[qSkill] ? qSkill : null;

        if (att.evaluation_status === 'pending') {
          if (skillKey) {
            skillCounts[skillKey].attempted += 1;
            skillCounts[skillKey].pending += 1;
          }
        } else {
          evaluatedCount += 1;
          if (att.is_correct === true) {
            totalCorrect += 1;
            if (skillKey) {
              skillCounts[skillKey].attempted += 1;
              skillCounts[skillKey].correct += 1;
            }
          } else {
            if (skillKey) {
              skillCounts[skillKey].attempted += 1;
            }
          }
        }
      }
    }

    const overallAccuracy = evaluatedCount > 0 ? Math.round((totalCorrect / evaluatedCount) * 100) : 0;

    // 4. Construct 6-Skill Breakdown
    const skillsBreakdown: SkillAnalyticsItem[] = ALL_SKILLS.map((skillName) => {
      const counts = skillCounts[skillName];
      const prog = skillProgressMap.get(skillName);
      const profScore = prog?.proficiency_score ?? 50;
      const accuracy = counts.attempted > 0 ? Math.round((counts.correct / counts.attempted) * 100) : 0;

      return {
        skill: skillName,
        total_attempted: counts.attempted,
        total_correct: counts.correct,
        accuracy_percentage: accuracy,
        proficiency_score: profScore,
        current_level: proficiencyToCefr(profScore),
        pending_evaluation_count: counts.pending,
      };
    });

    // 5. Fetch Weaknesses Summary
    const { data: weaknesses } = await supabase
      .from('user_weaknesses')
      .select('id, weakness_tag, error_count, last_failed_at')
      .eq('user_id', user.id)
      .order('error_count', { ascending: false })
      .order('last_failed_at', { ascending: false })
      .limit(10);

    // 6. Fetch Completed Mock Exams History
    const { data: mockExams, count: mockCount } = await supabase
      .from('user_mock_exam_attempts')
      .select('id, mock_exam_id, raw_score, total_marks, percentage_score, estimated_cefr_level, estimated_cambridge_score, submitted_at, mock_exams(name, exam_code)', { count: 'exact' })
      .eq('user_id', user.id)
      .in('status', ['submitted', 'timed_out'])
      .order('submitted_at', { ascending: false })
      .limit(10);

    const mockHistory = (mockExams || []).map((m: any) => ({
      id: m.id,
      mock_exam_id: m.mock_exam_id,
      exam_title: m.mock_exams?.name || m.mock_exams?.exam_code || 'Practice Mock Exam',
      exam_code: m.mock_exams?.exam_code || 'PET',
      percentage_score: Number(m.percentage_score) || 0,
      estimated_cambridge_score: m.estimated_cambridge_score || 80,
      estimated_cefr_level: m.estimated_cefr_level || 'A1',
      submitted_at: m.submitted_at,
    }));

    // 7. Recent 10 Activity Attempts
    const recentActivity = (attempts || []).slice(0, 10).map((att: any) => ({
      id: att.id,
      question_id: att.question_id,
      skill: att.questions?.skill || 'general',
      context_type: att.context_type,
      is_correct: att.is_correct,
      score_awarded: att.score_awarded,
      evaluation_status: att.evaluation_status,
      attempted_at: att.attempted_at,
    }));

    return {
      overview: {
        total_questions_attempted: totalAttempts,
        total_questions_correct: totalCorrect,
        overall_accuracy_percentage: overallAccuracy,
        completed_mock_exams_count: mockCount || 0,
        streak_days: profile.streak_days,
        last_active_date: profile.last_active_date,
      },
      skills_breakdown: skillsBreakdown,
      weaknesses_summary: weaknesses || [],
      mock_exam_history: mockHistory,
      diagnostic_placement: {
        assessment_completed: profile.assessment_completed,
        current_cefr_level: profile.current_cefr_level,
        estimated_cambridge_score: profile.estimated_cambridge_score,
      },
      recent_activity: recentActivity,
      is_official: false,
      disclaimer: 'Platform analytics and score estimations are for learning practice only and do not represent official Cambridge English Qualifications certificates.',
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: true,
    rateLimit: {
      action: 'user_analytics',
      maxRequests: 30,
      windowMs: 60_000,
    },
  }
);
