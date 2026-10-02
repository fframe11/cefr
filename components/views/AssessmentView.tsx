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
import {
  TactileButton,
  SpotlightCard,
  BorderBeam,
  DecryptedText,
  ShinyText,
  TacticalHudFrame,
} from '../ui/GlovaPrimitives';
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
  const { t, language } = useTranslation();
  const isEn = language === 'en';
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
      <div className="w-full py-16 text-center space-y-4">
        <LoadingSpinner
          size="lg"
          text={isEn ? "Evaluating and computing language proficiency via server..." : "กำลังตรวจและประมวลผลระดับภาษาผ่านระบบเซิร์ฟเวอร์..."}
        />
        <p className="text-xs text-muted-foreground">
          {isEn
            ? "Analyzing multi-skill proficiency and learning gaps against CEFR standards."
            : "ระบบกำลังวิเคราะห์ความเชี่ยวชาญทั้ง 6 ทักษะ และจุดอ่อนสะสมตามมาตรฐาน CEFR"}
        </p>
      </div>
    );
  }

  // Error State
  if (submitError && !isCompleted) {
    return (
      <div className="w-full py-12 space-y-4">
        <ErrorMessage
          title={isEn ? "Assessment Processing Error" : "เกิดข้อผิดพลาดในการประมวลผล"}
          message={submitError}
          onRetry={() => processAndSubmitAnswers(answers)}
        />
        <div className="text-center pt-2">
          <button
            onClick={handleRestart}
            className="text-xs text-muted-foreground hover:text-foreground underline touch-target"
          >
            {isEn ? "Restart Assessment" : "เริ่มทำแบบประเมินใหม่อีกครั้ง"}
          </button>
        </div>
      </div>
    );
  }

  // Results Screen
  if (isCompleted && result) {
    return (
      <div className="w-full space-y-6 pb-12 animate-in fade-in duration-300">
        {/* Results Banner */}
        <div className="p-6 sm:p-8 text-center space-y-4 rounded-[28px] bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md border border-[#EAE4D5] dark:border-white/10 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8 text-white" />
          </div>

          <div>
            <span className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold inline-block shadow-xs">
              {isEn ? 'Assessment Complete' : 'การประเมินเสร็จสมบูรณ์'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
              {isEn
                ? `Your estimated English level is CEFR ${result.estimatedLevel}`
                : `ระดับภาษาอังกฤษของคุณคือ CEFR ${result.estimatedLevel}`}
            </h2>

            {/* Remotion CEFR Calibration Reveal Animation */}
            <div className="pt-2 max-w-lg mx-auto rounded-[22px] overflow-hidden">
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

            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto font-sans">
              {isEn
                ? `Answered ${result.correctCount} of ${result.totalQuestions} questions correctly (${result.percentage}%). Platform equivalent score: `
                : `ตอบถูกต้อง ${result.correctCount} จาก ${result.totalQuestions} ข้อ (${result.percentage}%) คะแนนประเมินของแพลตฟอร์มเทียบเคียงได้ `}
              <span className="text-slate-900 dark:text-white font-extrabold font-mono">{result.cambridgeScore}</span> {isEn ? 'pts' : 'คะแนน'}
            </p>
          </div>

          {/* Exam Targets: Recommended Exam vs Target Exam explicitly separated */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
            {/* Platform Recommended Exam */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 flex items-start gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase">
                  {t('assessment.recommended')}
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Cambridge {result.recommendedExam}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn
                    ? 'Optimal exam tier aligned with your current proficiency'
                    : 'ระดับข้อสอบที่เหมาะสมที่สุดกับทักษะปัจจุบันของคุณ'}
                </p>
              </div>
            </div>

            {/* User Target Exam Preference */}
            <div className="p-4 sm:p-5 rounded-[22px] bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 flex items-start gap-3 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-[#D98200] dark:text-[#FFBA38]" />
              </div>
              <div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-bold uppercase">
                  {t('assessment.target_exam')}
                </p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Cambridge {result.targetExam}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn
                    ? 'Your personal target, customizable in profile settings'
                    : 'เป้าหมายส่วนตัวของคุณ สามารถปรับเปลี่ยนได้ในการตั้งค่า'}
                </p>
              </div>
            </div>
          </div>

          {/* Official Disclaimer Banner (Non-negotiable CEFR/Cambridge rule) */}
          <div className="p-4 rounded-[22px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-left flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-amber-200/90 leading-relaxed font-sans">
              <span className="font-bold text-amber-800 dark:text-amber-300">
                {isEn ? 'Important assessment notice: ' : 'ข้อควรทราบเกี่ยวกับผลประเมิน: '}
              </span>
              {result.disclaimer}
            </div>
          </div>
        </div>

        {/* Skill Proficiency Breakdown */}
        <div className="p-6 sm:p-7 space-y-4 rounded-[28px] bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md border border-[#EAE4D5] dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE4D5] dark:border-white/10">
            <BarChart3 className="w-4 h-4 text-[#FA5D5D]" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('assessment.skill_breakdown')}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(result.skillStats).map(([skill, val]) => (
              <div key={skill} className="p-4 rounded-[22px] bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 space-y-2 shadow-xs">
                <div className="flex justify-between text-xs font-bold">
                  <span className="capitalize text-slate-900 dark:text-white">{t(`skills.${skill}`)}</span>
                  <span className="font-mono text-[#FA5D5D]">{val}%</span>
                </div>
                <GlovaProgress value={val} max={100} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Learning Path Recommendations */}
        <div className="p-6 sm:p-7 space-y-4 rounded-[28px] bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md border border-[#EAE4D5] dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE4D5] dark:border-white/10">
            <Sparkles className="w-4 h-4 text-[#FA5D5D]" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t('assessment.personalized_path')}
            </h3>
          </div>

          <div className="space-y-2.5">
            {result.learningPathRecommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-[18px] bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-sans">{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="touch-target w-full sm:flex-1 py-3 px-6 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-sm font-black flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>{isEn ? 'Start Learning with This Plan' : 'เริ่มเรียนตามแผนการเรียนรู้นี้'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="touch-target w-full sm:w-auto py-3 px-6 rounded-full bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isEn ? 'Retake Assessment' : 'ทำแบบประเมินอีกครั้ง'}</span>
          </button>
        </div>

        <GlovaFeedbackBubble currentSkill="diagnostic" />
      </div>
    );
  }

  // Active Test Screen
  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. TOP SUB-NAV BAR (EduMaster Style) */}
      <nav
        aria-label="Diagnostic sub-navigation"
        className="w-full bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md rounded-[28px] p-3 sm:p-4 border border-[#EAE4D5] dark:border-white/10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 shadow-sm"
      >
        {/* Brand & Studio Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-sm shrink-0">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Diagnostic Test
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                CEFR PLACEMENT // A1-C2
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block mx-1" />

          {/* Mode Switcher Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white dark:bg-[#0B1224] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
            <button
              type="button"
              onClick={() => setAssessmentMode('quick')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                assessmentMode === 'quick'
                  ? 'bg-[#FA5D5D] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isEn ? '3-Min Check • 8 Qs' : 'เช็กด่วน 3 นาที • 8 ข้อ'}
            </button>
            <button
              type="button"
              onClick={() => setAssessmentMode('full')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                assessmentMode === 'full'
                  ? 'bg-[#FA5D5D] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isEn ? 'Full Diagnostic • 24 Qs' : 'ประเมินเต็มรูปแบบ • 24 ข้อ'}
            </button>
          </div>
        </div>

        {/* Counter and Status Chips */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Compass className="w-3.5 h-3.5" />
            <span>{assessmentMode === 'quick' ? 'Quick Diagnostic' : 'Comprehensive Evaluation'}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Calibration</span>
          </div>
        </div>
      </nav>

      {assessmentMode === 'quick' ? (
        <QuickEnglishCheck onFinish={onNavigateDashboard} />
      ) : (
        <div className="space-y-4">
          {/* Assessment Header & Progress Bar */}
          <div className="p-5 rounded-[28px] bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md border border-[#EAE4D5] dark:border-white/10 space-y-3 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 font-mono text-xs">
                  CEFR Diagnostic
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-mono">
                  {isEn
                    ? `Question ${currentIdx + 1} of ${DIAGNOSTIC_QUESTIONS.length}`
                    : `ข้อที่ ${currentIdx + 1} จาก ${DIAGNOSTIC_QUESTIONS.length}`}
                </span>
              </div>
              <span className="font-mono text-[#FA5D5D] font-black">{progressPercent}%</span>
            </div>

            <GlovaProgress value={progressPercent} max={100} size="md" />
          </div>

          {/* Render Current Question inside EduMaster Chassis */}
          <div className="w-full p-6 sm:p-7 space-y-4 rounded-[28px] bg-[#FAF8F3] dark:bg-[#070B16]/90 backdrop-blur-md border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={currentIdx + 1}
              totalQuestions={DIAGNOSTIC_QUESTIONS.length}
              onAnswer={handleAnswer}
              showExplanationImmediately={true}
            />
          </div>
        </div>
      )}

      <GlovaFeedbackBubble currentSkill="diagnostic" />
    </div>
  );
};
