'use client';
import React, { useState } from 'react';
import {
  DIAGNOSTIC_QUESTIONS,
  evaluateDiagnosticAssessment,
} from '../../data/diagnosticAssessment';
import { QuestionCard } from '../common/QuestionCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import {
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ShieldAlert,
  Target,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgressState, CambridgeExamCode, CEFRLevel, UserSkillStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { submitAssessment } from '../../lib/api/assessment';
import { saveGuestAttempt } from '../../services/storageService';
import { useTranslation } from '../../i18n';
import {
  GlovaButton,
  GlovaCard,
  GlovaBadge,
  GlovaProgress,
  GlovaSectionHeader,
  GlovaFeedbackBubble,
} from '../ui';
import { RemotionPlayerWrapper, CefrRevealComposition } from '../remotion';
import { QuickEnglishCheck } from '../diagnostic/QuickEnglishCheck';

function toUserSkillStats(stats?: Record<string, number> | UserSkillStats): UserSkillStats {
  return {
    vocabulary: stats?.vocabulary ?? 50,
    grammar: stats?.grammar ?? 50,
    reading: stats?.reading ?? 50,
    listening: stats?.listening ?? 50,
    writing: stats?.writing ?? 50,
    speaking: stats?.speaking ?? 50,
  };
}

interface AssessmentViewProps {
  onComplete: (updatedState: Partial<UserProgressState>) => void;
  onNavigateDashboard: () => void;
}

interface FormattedAssessmentResult {
  totalQuestions: number;
  correctCount: number;
  percentage: number;
  estimatedLevel: CEFRLevel;
  cambridgeScore: number;
  recommendedExam: CambridgeExamCode;
  targetExam: CambridgeExamCode;
  skillStats: UserSkillStats;
  identifiedWeaknesses: Array<{ tag: string; labelTh: string; errorCount: number }>;
  learningPathRecommendations: string[];
  isOfficial: false;
  disclaimer: string;
  estimationMethod: string;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  onComplete,
  onNavigateDashboard,
}) => {
  const { t } = useTranslation();
  const { status, profile } = useAuth();
  const [assessmentMode, setAssessmentMode] = useState<'quick' | 'full'>('quick');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<FormattedAssessmentResult | null>(null);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  const processAndSubmitAnswers = async (finalAnswers: Record<string, string>) => {
    setIsSubmitting(true);
    setSubmitError(null);

    // Compute local fallback result
    const localEval = evaluateDiagnosticAssessment(finalAnswers);
    const userTargetExam = profile?.target_exam || 'PET';

    // If guest, record attempts for subsequent sync and use local evaluation
    if (status !== 'authenticated') {
      // Record guest attempts
      Object.entries(finalAnswers).forEach(([qid, optionKey]) => {
        saveGuestAttempt({
          client_attempt_id: `guest-diag-${qid}-${Date.now()}`,
          question_id: qid,
          selected_option_key: optionKey,
          time_spent_seconds: 15,
          context_type: 'placement',
          attempted_at: new Date().toISOString(),
        });
      });

      const formattedLocal: FormattedAssessmentResult = {
        totalQuestions: localEval.totalQuestions,
        correctCount: localEval.correctCount,
        percentage: localEval.percentage,
        estimatedLevel: localEval.estimatedLevel,
        cambridgeScore: localEval.cambridgeScore,
        recommendedExam: localEval.targetExam,
        targetExam: userTargetExam,
        skillStats: toUserSkillStats(localEval.skillStats),
        identifiedWeaknesses: localEval.identifiedWeaknesses.map((w) => ({
          tag: w.tag,
          labelTh: w.labelTh,
          errorCount: w.errorCount,
        })),
        learningPathRecommendations: localEval.learningPathRecommendations,
        isOfficial: false,
        disclaimer:
          'คะแนนประเมินของแพลตฟอร์มตามเกณฑ์จำลองความสามารถทางภาษา (ไม่ใช่ผลสอบรับรองทางการจาก Cambridge English หรือใบรับรอง CEFR)',
        estimationMethod: 'platform_diagnostic_heuristic',
      };

      setResult(formattedLocal);
      setIsCompleted(true);
      setIsSubmitting(false);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Safe fallback
      }

      onComplete({
        currentLevel: formattedLocal.estimatedLevel,
        estimatedCambridgeScore: formattedLocal.cambridgeScore,
        skillStats: formattedLocal.skillStats,
        weakTopics: formattedLocal.identifiedWeaknesses.map((w) => ({
          tag: w.tag,
          labelTh: w.labelTh,
          errorCount: w.errorCount,
          lastFailedAt: new Date().toISOString(),
        })),
        assessmentCompleted: true,
      });
      return;
    }

    // Authenticated user: Submit to Server API
    try {
      const serverPayload = {
        answers: Object.entries(finalAnswers).map(([qid, optionKey]) => ({
          question_id: qid,
          selected_option_key: optionKey,
          time_spent_seconds: 15,
        })),
      };

      const serverRes = await submitAssessment(serverPayload);

      const formattedServer: FormattedAssessmentResult = {
        totalQuestions: serverRes.total_questions || localEval.totalQuestions,
        correctCount: serverRes.correct_count ?? localEval.correctCount,
        percentage: serverRes.percentage_score ?? localEval.percentage,
        estimatedLevel: serverRes.estimated_cefr_level || localEval.estimatedLevel,
        cambridgeScore: serverRes.estimated_cambridge_score || localEval.cambridgeScore,
        recommendedExam: (serverRes.recommended_exam as CambridgeExamCode) || localEval.targetExam,
        targetExam: (profile?.target_exam as CambridgeExamCode) || userTargetExam,
        skillStats: toUserSkillStats(serverRes.skill_breakdown || localEval.skillStats),
        identifiedWeaknesses: (serverRes.identified_weaknesses || []).map((w) => ({
          tag: w.tag,
          labelTh: w.label_th || w.tag,
          errorCount: w.error_count,
        })),
        learningPathRecommendations: localEval.learningPathRecommendations,
        isOfficial: false,
        disclaimer:
          serverRes.disclaimer ||
          'Platform diagnostic estimate based on internal placement heuristics; not an official Cambridge English examination result or CEFR certificate.',
        estimationMethod: serverRes.estimation_method || 'platform_diagnostic_heuristic',
      };

      setResult(formattedServer);
      setIsCompleted(true);

      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {
        // Safe fallback
      }

      onComplete({
        currentLevel: formattedServer.estimatedLevel,
        estimatedCambridgeScore: formattedServer.cambridgeScore,
        skillStats: formattedServer.skillStats,
        weakTopics: formattedServer.identifiedWeaknesses.map((w) => ({
          tag: w.tag,
          labelTh: w.labelTh,
          errorCount: w.errorCount,
          lastFailedAt: new Date().toISOString(),
        })),
        assessmentCompleted: true,
      });
    } catch (err: any) {
      console.error('Failed to submit assessment to server:', err);
      setSubmitError(err?.message || 'ไม่สามารถส่งผลการประเมินไปยังเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswer = (selectedKey: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: selectedKey };
    setAnswers(newAnswers);

    if (currentIdx + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
      }, 700);
    } else {
      // Completed all questions
      processAndSubmitAnswers(newAnswers);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);
    setResult(null);
    setSubmitError(null);
  };

  // Submitting Spinner State
  if (isSubmitting) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 text-center space-y-4">
        <LoadingSpinner size="lg" text="กำลังตรวจและประมวลผลระดับภาษาผ่านระบบเซิร์ฟเวอร์..." />
        <p className="text-xs text-muted-foreground">
          ระบบกำลังวิเคราะห์ความเชี่ยวชาญทั้ง 6 ทักษะ และจุดอ่อนสะสมตามมาตรฐาน CEFR
        </p>
      </div>
    );
  }

  // Error State
  if (submitError && !isCompleted) {
    return (
      <div className="w-full max-w-xl mx-auto py-12 space-y-4">
        <ErrorMessage
          title="เกิดข้อผิดพลาดในการประมวลผล"
          message={submitError}
          onRetry={() => processAndSubmitAnswers(answers)}
        />
        <div className="text-center pt-2">
          <button
            onClick={handleRestart}
            className="text-xs text-muted-foreground hover:text-foreground underline touch-target"
          >
            เริ่มทำแบบประเมินใหม่อีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (isCompleted && result) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        {/* Results Banner */}
        <GlovaCard variant="elevated" className="p-6 sm:p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <GlovaBadge variant="success" size="md">
              การประเมินเสร็จสมบูรณ์
            </GlovaBadge>
            <h2 className="text-fluid-title font-bold text-foreground mt-3">
              ระดับภาษาอังกฤษของคุณคือ CEFR {result.estimatedLevel}
            </h2>

            {/* Remotion CEFR Calibration Reveal Animation */}
            <div className="pt-2 max-w-lg mx-auto">
              <RemotionPlayerWrapper
                component={CefrRevealComposition}
                inputProps={{
                  targetLevel: result.estimatedLevel,
                  cambridgeScore: result.cambridgeScore,
                  confidencePct: result.percentage,
                }}
                durationInFrames={90}
                aspectRatio="16/9"
                ariaLabel="CEFR placement calibration reveal"
              />
            </div>

            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              ตอบถูกต้อง {result.correctCount} จาก {result.totalQuestions} ข้อ ({result.percentage}%) คะแนนประเมินของแพลตฟอร์มเทียบเคียงได้{' '}
              <span className="text-foreground font-semibold font-mono">{result.cambridgeScore}</span> คะแนน
            </p>
          </div>

          {/* Exam Targets: Recommended Exam vs Target Exam explicitly separated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            {/* Platform Recommended Exam */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono font-bold text-base shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase">
                  {t('assessment.recommended')}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  Cambridge {result.recommendedExam}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ระดับข้อสอบที่เหมาะสมที่สุดกับทักษะปัจจุบันของคุณ
                </p>
              </div>
            </div>

            {/* User Target Exam Preference */}
            <div className="p-4 rounded-xl bg-muted/40 border border-border/60 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center font-mono font-bold text-base shrink-0">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium uppercase">
                  {t('assessment.target_exam')}
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  Cambridge {result.targetExam}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  เป้าหมายส่วนตัวของคุณ สามารถปรับเปลี่ยนได้ในการตั้งค่า
                </p>
              </div>
            </div>
          </div>

          {/* Official Disclaimer Banner (Non-negotiable CEFR/Cambridge rule) */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold text-amber-300">ข้อควรทราบเกี่ยวกับผลประเมิน: </span>
              {result.disclaimer}
            </div>
          </div>
        </GlovaCard>

        {/* Skill Proficiency Breakdown */}
        <GlovaCard variant="interactive" className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              {t('assessment.skill_breakdown')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(result.skillStats).map(([skill, val]) => (
              <div key={skill} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="capitalize text-foreground">{t(`skills.${skill}`)}</span>
                  <span className="font-mono text-muted-foreground">{val}%</span>
                </div>
                <GlovaProgress value={val} max={100} size="sm" />
              </div>
            ))}
          </div>
        </GlovaCard>

        {/* Personalized Learning Path Recommendations */}
        <GlovaCard variant="interactive" className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              {t('assessment.personalized_path')}
            </h3>
          </div>

          <div className="space-y-2.5">
            {result.learningPathRecommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/40 text-xs sm:text-sm text-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{rec}</span>
              </div>
            ))}
          </div>
        </GlovaCard>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <GlovaButton
            onClick={onNavigateDashboard}
            variant="primary"
            size="lg"
            className="w-full sm:flex-1"
          >
            <span>เริ่มเรียนตามแผนการเรียนรู้นี้</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </GlovaButton>

          <GlovaButton
            onClick={handleRestart}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            <span>ทำแบบประเมินอีกครั้ง</span>
          </GlovaButton>
        </div>

        <GlovaFeedbackBubble currentSkill="diagnostic" />
      </div>
    );
  }

  // Active Test Screen
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* Mode Switcher: 3-Minute Quick Check vs Comprehensive Diagnostic */}
      <div className="flex items-center justify-center gap-2 p-1.5 rounded-xl bg-secondary/50 border border-border/40 max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setAssessmentMode('quick')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            assessmentMode === 'quick'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          3-Minute Check (8 ข้อ)
        </button>
        <button
          type="button"
          onClick={() => setAssessmentMode('full')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            assessmentMode === 'full'
              ? 'bg-card text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Full Diagnostic (24 ข้อ)
        </button>
      </div>

      {assessmentMode === 'quick' ? (
        <QuickEnglishCheck onFinish={onNavigateDashboard} />
      ) : (
        <>
          {/* Assessment Header & Progress Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <GlovaBadge variant="accent" size="sm">CEFR Diagnostic</GlovaBadge>
                <span className="text-muted-foreground">
                  ข้อที่ {currentIdx + 1} จาก {DIAGNOSTIC_QUESTIONS.length}
                </span>
              </div>
              <span className="font-mono text-primary font-semibold">{progressPercent}%</span>
            </div>

            <GlovaProgress value={progressPercent} max={100} size="md" />
          </div>

          {/* Render Current Question */}
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentIdx + 1}
            totalQuestions={DIAGNOSTIC_QUESTIONS.length}
            onAnswer={handleAnswer}
            showExplanationImmediately={true}
          />
        </>
      )}

      <GlovaFeedbackBubble currentSkill="diagnostic" />
    </div>
  );
};
