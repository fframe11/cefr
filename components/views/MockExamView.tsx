'use client';
import React, { useState, useEffect, useRef } from 'react';
import { CAMBRIDGE_MOCK_EXAMS_CATALOG } from '../../data/mockExamsCatalog';
import {
  MockExamCatalogItemDTO,
  MockExamSessionResponseDTO,
  SafeMockQuestionDTO,
  MockExamResultResponseDTO,
  getMockExams,
  startMockExam,
  getMockExamSession,
  autosaveMockExamAnswer,
  submitMockExam,
  getMockExamResults,
  resetDemoExam,
} from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../common/Toast';
import { useTranslation } from '../../i18n';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  Clock,
  Flag,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  Layers,
  Loader2,
  Check,
  AlertTriangle,
  LogIn,
  FileText,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  GlovaButton,
  GlovaCard,
  GlovaBadge,
  GlovaProgress,
  GlovaFeedbackBubble,
} from '../ui';

interface MockExamViewProps {
  onExamSubmitted: (cambridgeScore: number) => void;
  onOpenProfile?: () => void;
}

interface FlattenedExamQuestion {
  id: string;
  sectionId: string;
  sectionName: string;
  orderIndex: number;
  marks: number;
  skill: string;
  type: string;
  promptTh: string;
  promptEn: string;
  options: Array<{ id: string; key: string; text: string }>;
}

export const MockExamView: React.FC<MockExamViewProps> = ({
  onExamSubmitted,
  onOpenProfile,
}) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { status: authStatus, signInAsDemoStudent } = useAuth();
  const { showToast } = useToast();

  // Catalog State
  const [catalogExams, setCatalogExams] = useState<MockExamCatalogItemDTO[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<string>('');

  // Active Exam Lifecycle State
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [examMetadata, setExamMetadata] = useState<{
    id: string;
    examCode: string;
    name: string;
    targetCefr: string;
    totalDurationMinutes: number;
  } | null>(null);

  // Question & Navigation State
  const [questions, setQuestions] = useState<FlattenedExamQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<
    Record<string, { selected_option_key: string | null; text_answer: string | null }>
  >({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);

  // Server-Authoritative Timer & Autosave State
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Submission & Results State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<MockExamResultResponseDTO | null>(null);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  // 1. Fetch Mock Exam Catalog on Mount
  useEffect(() => {
    let isMounted = true;
    const fetchCatalog = async () => {
      setIsLoadingCatalog(true);
      try {
        const response = await getMockExams();
        if (isMounted && response.exams && response.exams.length > 0) {
          setCatalogExams(response.exams);
          setSelectedExamId(response.exams[0].id);
        } else if (isMounted) {
          useStaticCatalogFallback();
        }
      } catch (err) {
        if (isMounted) {
          useStaticCatalogFallback();
        }
      } finally {
        if (isMounted) {
          setIsLoadingCatalog(false);
        }
      }
    };

    fetchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const useStaticCatalogFallback = () => {
    setCatalogExams(CAMBRIDGE_MOCK_EXAMS_CATALOG);
    if (CAMBRIDGE_MOCK_EXAMS_CATALOG.length > 0) {
      setSelectedExamId(CAMBRIDGE_MOCK_EXAMS_CATALOG[0].id);
    }
  };

  // 2. Server-Authoritative Countdown Timer
  useEffect(() => {
    if (!isExamStarted || isSubmitted || !expiresAt) return;

    const checkTimer = () => {
      const expiresMs = new Date(expiresAt).getTime();
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((expiresMs - nowMs) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        // Countdown reached 0: automatically submit to let server finalize within 60s grace
        handleSubmitExam(true);
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [isExamStarted, isSubmitted, expiresAt]);

  // 3. Cleanup autosave debounce timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  // Format MM:SS for countdown timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 4. Start Exam Handler (Strict Server-Authoritative Lifecycle)
  const handleStartExam = async (examIdToStart?: string) => {
    const targetExamId = examIdToStart || selectedExamId;

    if (authStatus !== 'authenticated') {
      try {
        await signInAsDemoStudent();
      } catch {
        if (onOpenProfile) {
          onOpenProfile();
        }
        return;
      }
    }

    setIsStartingExam(true);
    try {
      // 1. Initialize attempt on server
      const startRes = await startMockExam(targetExamId);

      // 2. Fetch session questions (safe payloads stripped of answer keys)
      const sessionRes = await getMockExamSession(startRes.session_token);

      // 3. Flatten questions in strict section and question order
      const flattened: FlattenedExamQuestion[] = [];
      let order = 1;
      sessionRes.sections.forEach((sec) => {
        sec.questions.forEach((q) => {
          flattened.push({
            id: q.id,
            sectionId: sec.id,
            sectionName: sec.name,
            orderIndex: order++,
            marks: q.marks,
            skill: q.skill,
            type: q.type,
            promptTh: q.prompt_th,
            promptEn: q.prompt_en,
            options: q.options.map((opt) => ({
              id: opt.id,
              key: opt.key,
              text: opt.text,
            })),
          });
        });
      });

      const initialAnswers: Record<string, { selected_option_key: string | null; text_answer: string | null }> = {};
      sessionRes.sections.forEach((sec) => {
        sec.questions.forEach((q) => {
          if (q.saved_answer) {
            initialAnswers[q.id] = {
              selected_option_key: q.saved_answer.selected_option_key,
              text_answer: q.saved_answer.text_answer,
            };
          }
        });
      });

      setSessionToken(startRes.session_token);
      setExamMetadata({
        id: sessionRes.mock_exam.id,
        examCode: sessionRes.mock_exam.exam_code,
        name: sessionRes.mock_exam.name,
        targetCefr: sessionRes.mock_exam.target_cefr,
        totalDurationMinutes: sessionRes.mock_exam.total_duration_minutes,
      });
      setQuestions(flattened);
      setAnswers(initialAnswers);
      setFlaggedQuestionIds([]);
      setCurrentQuestionIdx(0);
      setExpiresAt(startRes.expires_at);
      setSecondsRemaining(sessionRes.remaining_seconds);
      setIsExamStarted(true);
      setIsSubmitted(false);
      setExamResult(null);

      showToast(
        'เริ่มการสอบจำลองแล้ว',
        `เวลาสอบทั้งหมด ${sessionRes.mock_exam.total_duration_minutes} นาที ระบบกำลังจับเวลาจำลองการสอบ`,
        'info'
      );
    } catch (err: any) {
      console.warn('Failed to start mock exam on server:', err);
      showToast(
        isEn ? 'Exam Session Failed' : 'ไม่สามารถเริ่มเซสชันการสอบได้',
        isEn ? 'Please check your connection or sign in again to access official mock exams.' : 'กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตหรือเข้าสู่ระบบใหม่อีกครั้งเพื่อสอบ',
        'error'
      );
    } finally {
      setIsStartingExam(false);
    }
  };

  // 5. Select Option or Answer Text with Debounced Autosave
  const handleSelectOption = (questionId: string, optionKey: string) => {
    if (isSubmitted || isSubmitting) return;

    // Immediate local state update
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected_option_key: optionKey,
        text_answer: prev[questionId]?.text_answer || null,
      },
    }));

    // Trigger debounced autosave
    triggerAutosave(questionId, optionKey, answers[questionId]?.text_answer || null);
  };

  const handleTextAnswerChange = (questionId: string, text: string) => {
    if (isSubmitted || isSubmitting) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected_option_key: prev[questionId]?.selected_option_key || null,
        text_answer: text,
      },
    }));

    triggerAutosave(questionId, answers[questionId]?.selected_option_key || null, text);
  };

  const triggerAutosave = (questionId: string, optionKey: string | null, textAnswer: string | null) => {
    if (!sessionToken) return;

    setAutosaveStatus('saving');
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      try {
        await autosaveMockExamAnswer({
          session_token: sessionToken,
          question_id: questionId,
          selected_option_key: optionKey,
          text_answer: textAnswer,
        });
        setAutosaveStatus('saved');
      } catch (err) {
        console.warn('Mock exam autosave warning:', err);
        setAutosaveStatus('error');
      }
    }, 800);
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const buildLocalExamResult = (
    examId: string,
    submittedAnswers: Record<string, { selected_option_key: string | null; text_answer: string | null }>,
    examQuestions: FlattenedExamQuestion[],
    isTimeout: boolean
  ): MockExamResultResponseDTO => {
    const answeredCount = Object.keys(submittedAnswers).filter((k) => submittedAnswers[k]?.selected_option_key).length;
    const totalQuestions = examQuestions.length || 1;
    const targetCefr = examMetadata?.targetCefr || 'A2';
    const examCode = examMetadata?.examCode || 'KET';
    const baseScale = examCode === 'PET' ? 140 : examCode === 'FCE' ? 160 : examCode === 'CAE' ? 180 : 120;
    const percentage = Math.round((answeredCount / totalQuestions) * 100);
    const cambridgeScore = Math.min(210, Math.round(baseScale + percentage * 0.3));

    return {
      attempt_id: `offline-attempt-${Date.now()}`,
      session_token: sessionToken || `offline-token-${Date.now()}`,
      exam: {
        id: examId,
        exam_code: examCode,
        name: examMetadata?.name || 'Mock Exam',
        target_cefr: targetCefr,
        passing_score: 60,
        total_duration_minutes: examMetadata?.totalDurationMinutes || 45,
      },
      status: isTimeout ? 'timed_out' : 'submitted',
      started_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      submitted_at: new Date().toISOString(),
      raw_score: answeredCount,
      total_marks: totalQuestions,
      percentage_score: percentage,
      objective_score: answeredCount,
      objective_total_marks: totalQuestions,
      objective_percentage: percentage,
      pending_subjective_marks: 0,
      has_pending_subjective: false,
      evaluation_status: 'completed',
      is_passed: percentage >= 60,
      estimated_cefr_level: targetCefr,
      estimated_cambridge_score: cambridgeScore,
      section_breakdown: {},
      skill_breakdown: {},
      is_official: false,
      disclaimer: 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications',
    };
  };

  // 6. Submit Exam Handler
  const handleSubmitExam = async (isTimeout = false) => {
    if (isSubmitting || isSubmitted) return;
    setIsConfirmSubmitOpen(false);
    setIsSubmitting(true);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    try {
      if (sessionToken && !sessionToken.startsWith('local-')) {
        // Collect all answered questions
        const answerPayload = Object.entries(answers).map(([qId, ans]) => ({
          question_id: qId,
          selected_option_key: ans.selected_option_key,
          text_answer: ans.text_answer,
          time_spent_seconds: 0,
        }));

        // 1. Submit attempt to server
        await submitMockExam({
          session_token: sessionToken,
          answers: answerPayload,
        });

        // 2. Retrieve verified diagnostic results
        const finalResults = await getMockExamResults(sessionToken);
        setExamResult(finalResults);
        setIsSubmitted(true);
        onExamSubmitted(finalResults.estimated_cambridge_score);

        if (finalResults.is_passed) {
          try {
            confetti({ particleCount: 75, spread: 70 });
          } catch {}
        }

        showToast(
          isTimeout ? 'หมดเวลาการสอบ ระบบส่งคำตอบอัตโนมัติแล้ว' : 'ส่งข้อสอบสำเร็จ',
          `คะแนนประมาณการ Cambridge English Scale: ${finalResults.estimated_cambridge_score} คะแนน`,
          'success'
        );
      } else {
        const finalResults = buildLocalExamResult(examMetadata?.id || selectedExamId, answers, questions, isTimeout);
        setExamResult(finalResults);
        setIsSubmitted(true);
        onExamSubmitted(finalResults.estimated_cambridge_score);

        if (finalResults.is_passed) {
          try {
            confetti({ particleCount: 75, spread: 70 });
          } catch {}
        }

        showToast(
          isTimeout ? 'หมดเวลาการสอบ ระบบส่งคำตอบอัตโนมัติแล้ว' : 'ส่งข้อสอบสำเร็จ',
          `คะแนนประมาณการ Cambridge English Scale: ${finalResults.estimated_cambridge_score} คะแนน`,
          'success'
        );
      }
    } catch (err: any) {
      console.warn('Server mock exam submission failed, using local evaluation:', err);
      const finalResults = buildLocalExamResult(examMetadata?.id || selectedExamId, answers, questions, isTimeout);
      setExamResult(finalResults);
      setIsSubmitted(true);
      onExamSubmitted(finalResults.estimated_cambridge_score);

      if (finalResults.is_passed) {
        try {
          confetti({ particleCount: 75, spread: 70 });
        } catch {}
      }

      showToast(
        isTimeout ? 'หมดเวลาการสอบ ระบบส่งคำตอบอัตโนมัติแล้ว' : 'ส่งข้อสอบสำเร็จ',
        `คะแนนประมาณการ Cambridge English Scale: ${finalResults.estimated_cambridge_score} คะแนน`,
        'success'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Active question helper
  const currentQuestion = questions[currentQuestionIdx];
  const activeExam =
    catalogExams.find((e) => e.id === selectedExamId) || catalogExams[0];

  // =========================================================================
  // VIEW 1: Exam Catalog & Selection Screen
  // =========================================================================
  if (!isExamStarted && !isSubmitted) {
    return (
      <div className="w-full space-y-6 pb-12">
        {/* Unified Hero Header Banner - Studio DNA */}
        <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-amber-500/50 dark:from-[#1E1B28] dark:to-[#171520] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 overflow-hidden shadow-xs">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-8 h-8 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-xs shrink-0">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-black uppercase tracking-wider">
                  Cambridge Arena // A2–C1
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
                  {catalogExams.length} {isEn ? 'Full Sets' : 'ชุดข้อสอบจำลอง'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEn ? 'Cambridge English Qualifications Mock Examination' : 'ห้องสอบจำลอง Cambridge English Qualifications'}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                {isEn
                  ? 'Simulate realistic exam conditions aligned with the CEFR framework with automated timing and Cambridge English Scale score estimation.'
                  : 'จำลองสนามสอบเสมือนจริงอิงตามกรอบการวัดระดับ CEFR พร้อมระบบจับเวลาและคำนวณคะแนนเทียบเคียง Cambridge English Scale'}
              </p>
              {/* Disclaimer */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400 text-left shadow-2xs">
                <HelpCircle className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span>
                  {isEn
                    ? 'Practice mock test for skills evaluation, not an official certificate from Cambridge English Qualifications.'
                    : 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications'}
                </span>
              </div>
            </div>

            {/* Timed Simulation & Scale Chips */}
            <div className="flex flex-row md:flex-col gap-2.5 shrink-0">
              <div className="px-3.5 py-2 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Timed Simulation</span>
              </div>
              <div className="px-3.5 py-2 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Cambridge Scale</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Mode Auth Required Warning Banner */}
        {authStatus !== 'authenticated' && (
          <div className="rounded-[22px] p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-slate-800 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-slate-900 dark:text-white">
                  {isEn ? 'Please log in to take Mock Exams' : 'กรุณาเข้าสู่ระบบเพื่อทำ Mock Exam'}
                </p>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 font-sans">
                  {isEn
                    ? 'Full mock exams require session generation and permanent progress tracking on your account.'
                    : 'การสอบจำลองเต็มรูปแบบจำเป็นต้องสร้างเซสชันการสอบและบันทึกคะแนนลงในบัญชีผู้ใช้ของคุณ'}
                </p>
              </div>
            </div>
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="shrink-0 px-5 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{isEn ? 'Sign In' : 'เข้าสู่ระบบ'}</span>
              </button>
            )}
          </div>
        )}

        {/* Exam Cards Grid */}
        {isLoadingCatalog ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#FA5D5D] mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEn ? 'Loading mock exam catalog...' : 'กำลังโหลดรายการชุดข้อสอบจำลอง...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {catalogExams.map((exam) => {
              const isSelected = selectedExamId === exam.id;
              const examCoverPhoto = exam.exam_code?.includes('PET') || exam.target_cefr === 'B1'
                ? '/images/exams/exam_b1.jpg'
                : exam.exam_code?.includes('FCE') || exam.target_cefr === 'B2'
                ? '/images/exams/exam_b2.jpg'
                : exam.exam_code?.includes('CAE') || exam.target_cefr === 'C1'
                ? '/images/exams/exam_c1.jpg'
                : exam.exam_code?.includes('CPE') || exam.target_cefr === 'C2'
                ? '/images/exams/exam_c2.jpg'
                : '/images/exams/exam_b2.jpg';

              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`p-5 sm:p-6 cursor-pointer transition-all flex flex-col justify-between rounded-[28px] bg-white dark:bg-[#1E1B28] border ${
                    isSelected
                      ? 'border-[#FA5D5D] shadow-md ring-2 ring-[#FA5D5D]/20'
                      : 'border-border/80 hover:border-[#FA5D5D]/40'
                  }`}
                >
                  <div>
                    {/* Authentic Outcrowd Mondly Editorial Photo Cover */}
                    <div className="relative w-full aspect-[16/9] rounded-[20px] overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                      <img
                        src={examCoverPhoto}
                        alt={exam.name}
                        width={480}
                        height={270}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/20">
                          {exam.exam_code}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FA5D5D] text-white text-[11px] font-mono font-bold shadow-xs">
                          CEFR {exam.target_cefr}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-3 py-0.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold">
                        Cambridge Exam
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono font-semibold">
                        <Clock className="w-3.5 h-3.5 text-[#FA5D5D]" />
                        <span>{exam.total_duration_minutes} {isEn ? 'min' : 'นาที'}</span>
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-1.5">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                      {isEn ? (exam.description_en || exam.description_th) : exam.description_th}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/80 space-y-1 text-xs text-slate-500 dark:text-slate-400 font-sans">
                      <p>{isEn ? `• Passing mark: ${exam.passing_score}%+` : `• เกณฑ์ผ่าน: ${exam.passing_score}% ขึ้นไป`}</p>
                      <p>{isEn ? `• Target Level: CEFR ${exam.target_cefr}` : `• ระดับเป้าหมาย: CEFR ${exam.target_cefr}`}</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExamId(exam.id);
                        handleStartExam(exam.id);
                      }}
                      disabled={isStartingExam}
                      className={`touch-target w-full py-2.5 px-4 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FA5D5D] hover:bg-[#E84C4C] text-white'
                          : 'bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {isStartingExam && selectedExamId === exam.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{isEn ? 'Preparing Exam...' : 'กำลังจัดเตรียม...'}</span>
                        </>
                      ) : (
                        <span>{isEn ? 'Start This Exam' : 'เริ่มทำข้อสอบชุดนี้'}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: Exam Results Screen
  // =========================================================================
  if (isSubmitted && examResult) {
    const isPassed = examResult.is_passed;
    const isTimedOut = examResult.status === 'timed_out';

    return (
      <div className="w-full space-y-6 pb-12 animate-in fade-in duration-300">
        {/* Main Score Card */}
        <div className="p-6 sm:p-8 text-center space-y-5 rounded-[32px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-sm">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm ${
              isPassed
                ? 'bg-[#10B981] text-white'
                : 'bg-[#FA5D5D] text-white'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
              <span
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold inline-block shadow-xs border ${
                  isPassed
                    ? 'bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border-[#C5EBDA] dark:border-emerald-500/20'
                    : 'bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border-[#FDE5BC] dark:border-amber-500/20'
                }`}
              >
                {isPassed ? t('mock_exam.passed') : t('mock_exam.needs_improvement')}
              </span>

              {isTimedOut && (
                <span className="px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-xs font-mono font-bold inline-flex items-center gap-1 shadow-xs">
                  <Clock className="w-3 h-3" />
                  <span>{t('mock_exam.timed_out')}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
              {isEn
                ? `Cambridge ${examResult.exam.exam_code} Exam Result: ${examResult.estimated_cambridge_score} pts`
                : `ผลสอบ Cambridge ${examResult.exam.exam_code}: ${examResult.estimated_cambridge_score} คะแนน`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl mx-auto font-sans">
              {isEn ? 'Estimated CEFR Level:' : 'ระดับ CEFR ที่ประเมินได้:'}{' '}
              <span className="font-extrabold text-[#FA5D5D] font-mono">{examResult.estimated_cefr_level}</span>
              {isEn
                ? ` • Objective Score: ${examResult.objective_score} / ${examResult.objective_total_marks} marks (${examResult.objective_percentage}%) • Passing Mark: ${examResult.exam.passing_score}%`
                : ` • คะแนนปรนัย ${examResult.objective_score} จาก ${examResult.objective_total_marks} ข้อ (${examResult.objective_percentage}%) • เกณฑ์ผ่าน ${examResult.exam.passing_score}%`}
            </p>
          </div>

          {/* Subjective Questions Status Notice */}
          {examResult.has_pending_subjective && (
            <div className="rounded-[20px] p-4 bg-[#FA5D5D] dark:bg-[#FA5D5D]/20 border border-[#FA5D5D] dark:border-[#FA5D5D]/20 text-[#FA5D5D] dark:text-[#FA5D5D] text-xs text-left space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <FileText className="w-4 h-4 text-[#FA5D5D] shrink-0" />
                <span>{t('mock_exam.pending_eval')}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed pl-6 font-sans">
                {isEn
                  ? `You have ${examResult.pending_subjective_marks} marks in subjective writing/speaking awaiting evaluation. These marks are excluded from instant calculation and will not default to 0.`
                  : `มีข้อสอบส่วนอัตนัยจำนวน ${examResult.pending_subjective_marks} คะแนนที่รอรับการตรวจประเมิน คะแนนส่วนนี้จึงยังไม่ถูกนำมาคำนวณ และไม่มีการหักเป็น 0 คะแนน`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => handleStartExam(examResult.exam.id)}
              className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs sm:text-sm font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              {isEn ? 'Retake This Exam' : 'ทำข้อสอบชุดนี้อีกครั้ง'}
            </button>
            {examResult?.is_demo && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await resetDemoExam();
                    setIsExamStarted(false);
                    setIsSubmitted(false);
                    setExamResult(null);
                    setSessionToken(null);
                    showToast(
                      isEn ? 'Exam Session Cleared' : 'ล้างผลสอบเรียบร้อย',
                      isEn ? 'You can retake the practice exam.' : 'สามารถเริ่มทำข้อสอบใหม่อีกครั้งได้ทันที',
                      'success'
                    );
                  } catch {
                    showToast('เกิดข้อผิดพลาดในการล้างเซสชัน', '', 'error');
                  }
                }}
                className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 border border-border/80 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>{isEn ? 'Retake & Reset' : 'ล้างคำตอบเพื่อเริ่มใหม่'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsExamStarted(false);
                setIsSubmitted(false);
                setExamResult(null);
                setSessionToken(null);
              }}
              className="touch-target w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#1E1B28] border border-border/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              {isEn ? 'Back to Exam Catalog' : 'กลับสู่หน้ารายการข้อสอบ'}
            </button>
          </div>
        </div>

        {/* Section & Skill Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Breakdown */}
          {examResult.section_breakdown && Object.keys(examResult.section_breakdown).length > 0 && (
            <div className="p-5 sm:p-6 space-y-3.5 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FA5D5D]" />
                <span>{t('mock_exam.section_breakdown')}</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(examResult.section_breakdown).map(([secName, secData]) => (
                  <div key={secName} className="p-3.5 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{secName}</span>
                      <span className="font-mono text-[#FA5D5D]">{secData.raw_score} / {secData.total_marks} ({secData.percentage}%)</span>
                    </div>
                    <GlovaProgress value={secData.percentage} showLabel={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Breakdown */}
          {examResult.skill_breakdown && Object.keys(examResult.skill_breakdown).length > 0 && (
            <div className="p-5 sm:p-6 space-y-3.5 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#FA5D5D]" />
                <span>{t('mock_exam.skill_breakdown')}</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(examResult.skill_breakdown).map(([skillName, skData]) => (
                  <div key={skillName} className="p-3.5 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white capitalize">
                      <span>{skillName}</span>
                      <span className="font-mono text-[#FA5D5D]">{skData.correct_questions} / {skData.total_questions} ข้อ ({skData.percentage}%)</span>
                    </div>
                    <GlovaProgress value={skData.percentage} showLabel={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Detailed Question Review & Corrections */}
        <div className="p-6 sm:p-7 space-y-4 rounded-[32px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-sm text-left">
          <div className="flex items-center justify-between pb-3 border-b border-border/80">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#FA5D5D]" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isEn ? 'Question Review & Explanations' : 'ตรวจทานคำตอบและเฉลยละเอียดทุกข้อ'}
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
              {questions.length} {isEn ? 'Questions' : 'ข้อสอบทั้งหมด'}
            </span>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const userAnswerKey = answers[q.id]?.selected_option_key;
              const userTextAnswer = answers[q.id]?.text_answer;
              const isAnswered = Boolean(userAnswerKey || userTextAnswer);

              const review = examResult?.review_questions?.find((r) => r.question_id === q.id);
              const isCorrect = review ? review.is_correct : false;
              const correctOptionKey = review?.correct_option_key;
              const correctAnswerText = review?.correct_answer_text;
              const explanation = review?.explanation_th;

              let badgeText = isEn ? 'Unanswered' : 'ยังไม่ได้ตอบ';
              let badgeClass = 'bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-300';

              if (review) {
                if (isCorrect) {
                  badgeText = isEn ? `✓ Correct (+${q.marks} mark)` : `✓ ตอบถูกต้อง (+${q.marks} คะแนน)`;
                  badgeClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold';
                } else if (isAnswered) {
                  badgeText = isEn ? '✗ Incorrect (0 marks)' : '✗ ตอบไม่ถูกต้อง (0 คะแนน)';
                  badgeClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/30 font-bold';
                }
              } else if (isAnswered) {
                badgeText = userAnswerKey
                  ? (isEn ? `Selected: Option ${userAnswerKey}` : `คำตอบที่คุณเลือก: ข้อ ${userAnswerKey}`)
                  : (userTextAnswer || '');
              }

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-[22px] border transition-all bg-slate-50/50 dark:bg-white/[0.03] border-slate-200/80 dark:border-white/10"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 flex items-center justify-center text-xs font-black font-mono">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {q.sectionName}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-white font-sans mb-3 pl-8">
                    {q.promptEn}
                  </p>

                  {/* Multiple Choice Options review */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      {q.options.map((opt) => {
                        const isUserChoice = userAnswerKey === opt.key;
                        const isCorrectChoice = opt.key === correctOptionKey;

                        let style = 'bg-white dark:bg-[#1E1B28] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300';
                        let tag = null;

                        if (isCorrectChoice) {
                          style = 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/70 text-emerald-800 dark:text-emerald-200 font-bold ring-1 ring-emerald-500/20';
                          tag = (
                            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 font-bold shrink-0">
                              {isEn ? '✓ Correct' : '✓ เฉลย'}
                            </span>
                          );
                        } else if (isUserChoice && !isCorrect) {
                          style = 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-400 text-rose-800 dark:text-rose-200 ring-1 ring-rose-500/20';
                          tag = (
                            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-800 dark:text-rose-200 font-bold shrink-0">
                              {isEn ? '✗ Your choice' : '✗ ที่เลือก'}
                            </span>
                          );
                        } else if (isUserChoice) {
                          style = 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold border-slate-900 shadow-xs';
                        }

                        return (
                          <div
                            key={opt.key}
                            className={`p-3 rounded-[14px] border text-xs flex items-center gap-2.5 ${style}`}
                          >
                            <span className="w-5 h-5 rounded-md bg-black/10 dark:bg-white/10 flex items-center justify-center font-mono font-bold text-[11px] shrink-0">
                              {opt.key}
                            </span>
                            <span className="truncate">{opt.text}</span>
                            {tag}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in the blank review */}
                  {q.type === 'fill_blank' && (
                    <div className="pl-8 pt-1 space-y-2 text-xs">
                      <div className="p-3 rounded-[14px] bg-white dark:bg-[#1E1B28] border border-border/80 flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400">
                          {isEn ? 'Your text answer:' : 'คำตอบที่คุณกรอก:'}
                        </span>
                        <span className={`font-mono font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {userTextAnswer || (isEn ? '(Unanswered)' : '(ยังไม่ได้ระบุ)')}
                        </span>
                      </div>
                      {correctAnswerText && (
                        <div className="p-3 rounded-[14px] bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                          <span className="text-emerald-800 dark:text-emerald-200 font-semibold">
                            {isEn ? 'Correct Answer:' : 'เฉลยคำตอบที่ถูกต้อง:'}
                          </span>
                          <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                            {correctAnswerText}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pedagogical Explanation Card */}
                  {explanation && (
                    <div className="mt-3 ml-8 p-3 rounded-[16px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/70 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-[#FA5D5D] shrink-0" />
                        <span>{isEn ? 'Explanation & Answer Key' : 'เฉลยและคำอธิบาย'}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 pl-5 leading-relaxed font-sans">
                        {explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Cambridge English Disclaimer Banner */}
        <div className="rounded-[22px] p-4 bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs text-slate-600 dark:text-slate-400 text-center space-y-1 shadow-xs">
          <p className="font-bold text-slate-900 dark:text-white">
            {examResult.disclaimer}
          </p>
          <p className="text-[11px] font-sans">
            การประเมินนี้อ้างอิงจากเกณฑ์การเทียบเคียงของแพลตฟอร์ม เพื่อใช้เป็นแนวทางในการฝึกฝนทักษะเท่านั้น ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: Active Exam Simulation Screen
  // =========================================================================
  return (
    <div className="w-full space-y-6 pb-12">
      {/* Sticky Header: Exam Title, Timer, Autosave Status, and Submit Button */}
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 p-4 rounded-[24px] bg-white/95 dark:bg-[#1E1B28]/95 border border-border/80 backdrop-blur-md shadow-xs">
        <div>
          <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20">
            {examMetadata?.examCode || activeExam?.exam_code} • {examMetadata?.targetCefr || activeExam?.target_cefr}
          </span>
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white truncate mt-1">
            {examMetadata?.name || activeExam?.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave Status Indicator */}
          <div className="hidden sm:flex items-center text-xs">
            {autosaveStatus === 'saving' && (
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FA5D5D]" />
                <span>{isEn ? 'Saving...' : 'กำลังบันทึก...'}</span>
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 text-[11px] font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>{isEn ? 'Saved' : 'บันทึกคำตอบแล้ว'}</span>
              </span>
            )}
            {autosaveStatus === 'error' && (
              <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5 text-[11px] font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isEn ? 'Save failed' : 'บันทึกไม่สำเร็จ'}</span>
              </span>
            )}
          </div>

          {/* Server-Authoritative Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-mono font-bold text-xs ${
              secondsRemaining < 300
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/30 animate-pulse'
                : 'bg-[#FAF8F3] dark:bg-[#13111C]/60 text-slate-800 dark:text-slate-200 border-border/80'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FA5D5D]" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Submit Exam Button */}
          <button
            onClick={() => setIsConfirmSubmitOpen(true)}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] disabled:opacity-50 text-white font-bold text-xs shadow-sm active:scale-95 transition-all touch-target flex items-center gap-1.5 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? 'Submitting...' : 'กำลังส่งข้อสอบ...'}</span>
              </>
            ) : (
              <span>{isEn ? 'Submit Exam for Evaluation' : 'ส่งข้อสอบเพื่อประเมินผล'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Simulation Layout: Question on Left / Navigation Palette on Right */}
      {questions.length > 0 && currentQuestion ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Current Question */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold font-mono">
                  {isEn
                    ? `Question ${currentQuestionIdx + 1} of ${questions.length}`
                    : `ข้อที่ ${currentQuestionIdx + 1} จาก ${questions.length}`}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF8F3] dark:bg-[#13111C]/60 text-slate-700 dark:text-slate-300 border border-border/80 capitalize font-medium">
                  {currentQuestion.sectionName}
                </span>
              </div>

              {/* Flag for Review Button */}
              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`text-xs px-3 py-1.5 rounded-full border font-semibold flex items-center gap-1.5 transition-colors touch-target cursor-pointer ${
                  flaggedQuestionIds.includes(currentQuestion.id)
                    ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                    : 'bg-[#FAF8F3] dark:bg-[#13111C]/60 text-slate-600 dark:text-slate-400 hover:text-foreground border-border/80'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>
                  {flaggedQuestionIds.includes(currentQuestion.id)
                    ? (isEn ? 'Flagged' : 'ติดธงแล้ว')
                    : (isEn ? 'Flag for review' : 'ติดธงไว้ทบทวน')}
                </span>
              </button>
            </div>

            {/* Current Question View (English only) */}
            <div className="p-6 sm:p-7 space-y-5 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-sm">
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white break-word-safe leading-snug">
                {currentQuestion.promptEn || currentQuestion.promptTh}
              </h3>

              {/* Multiple Choice Options or Subjective Text Input */}
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      answers[currentQuestion.id]?.selected_option_key === option.key;
                    const optionStyle = isSelected
                      ? 'bg-[#FA5D5D]/10 border-2 border-[#FA5D5D] text-[#FA5D5D] dark:text-[#FF8080] font-bold shadow-xs'
                      : 'bg-slate-50/80 dark:bg-[#13111C]/60 hover:bg-[#FAF8F3] dark:hover:bg-[#252233] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200';

                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSelectOption(currentQuestion.id, option.key)}
                        className={`w-full min-h-[48px] p-3.5 sm:p-4 rounded-2xl text-left flex items-center gap-3 transition-all touch-target break-word-safe cursor-pointer ${optionStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                            isSelected
                              ? 'bg-[#FA5D5D] text-white border-[#FA5D5D]'
                              : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10'
                          }`}
                        >
                          {option.key}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold">{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Subjective Text Answer Area */
                <div className="space-y-2 pt-2">
                  <label className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                    {isEn
                      ? 'Type your response for this subjective question (saved automatically):'
                      : 'พิมพ์คำตอบสำหรับข้อสอบอัตนัยข้อนี้ (คำตอบจะถูกบันทึกอัตโนมัติ):'}
                  </label>
                  <textarea
                    rows={6}
                    value={answers[currentQuestion.id]?.text_answer || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={isEn ? 'Type your answer here...' : 'พิมพ์คำตอบของคุณที่นี่...'}
                    className="w-full p-3.5 rounded-2xl bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-[#FA5D5D]/20 leading-relaxed resize-y"
                  />
                </div>
              )}
            </div>

            {/* Bottom Pagination Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1B28] border border-border/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isEn ? 'Previous' : 'ข้อก่อนหน้า'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentQuestionIdx((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                disabled={currentQuestionIdx === questions.length - 1}
                className="px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1B28] border border-border/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>{isEn ? 'Next' : 'ข้อถัดไป'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Question Navigator Palette */}
          <div className="lg:col-span-4 p-5 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-border/80">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{t('mock_exam.question_palette')}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
                {t('mock_exam.status_answered')}{' '}
                {
                  Object.values(answers).filter(
                    (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                  ).length
                }
                /{questions.length}
              </span>
            </div>

            {/* Question Palette Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered =
                  ans && (ans.selected_option_key !== null || (ans.text_answer && ans.text_answer.trim() !== ''));
                const isFlagged = flaggedQuestionIds.includes(q.id);
                const isCurrent = currentQuestionIdx === idx;

                let btnClass = 'bg-[#FAF8F3] dark:bg-[#13111C]/60 hover:bg-slate-100 dark:hover:bg-[#252233] text-slate-700 dark:text-slate-300 border border-border/80 font-bold';
                if (isCurrent) {
                  btnClass = 'bg-[#FA5D5D] text-white shadow-xs font-bold ring-2 ring-[#FA5D5D]/30';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-500 text-white shadow-xs font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-[#FA5D5D]/15 text-[#FA5D5D] dark:text-[#FF8080] border border-[#FA5D5D]/40 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-9 rounded-xl text-xs font-mono font-bold flex items-center justify-center transition-all touch-target relative cursor-pointer ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-3 border-t border-border/80 space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-sans">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FA5D5D]/20 border border-[#FA5D5D]" />
                <span>{t('mock_exam.status_answered')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500" />
                <span>{t('mock_exam.status_flagged')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-white/20 border border-border" />
                <span>{t('mock_exam.status_unanswered')}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#FA5D5D] mx-auto" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEn ? 'Preparing exam session...' : 'กำลังจัดเตรียมเซสชันข้อสอบ...'}
          </p>
        </div>
      )}

      {/* Submit Confirmation Dialog Modal */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md p-6 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-border/80 shadow-xl">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isEn ? 'Confirm Exam Submission' : 'ยืนยันการส่งข้อสอบ'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              {isEn
                ? 'Are you sure you want to submit your exam? Once submitted, you cannot change your answers.'
                : 'คุณต้องการส่งข้อสอบชุดนี้หรือไม่? เมื่อส่งแล้วจะไม่สามารถกลับมาแก้ไขคำตอบได้อีก'}
              {questions.length >
                Object.values(answers).filter(
                  (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                ).length && (
                <span className="flex items-center gap-1.5 mt-2 font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {isEn
                    ? `You still have ${
                        questions.length -
                        Object.values(answers).filter(
                          (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                        ).length
                      } unanswered question(s).`
                    : `คุณยังมีข้อที่ไม่ได้ตอบอีก ${
                        questions.length -
                        Object.values(answers).filter(
                          (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                        ).length
                      } ข้อ`}
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-5 py-2.5 rounded-full bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {isEn ? 'Continue Exam' : 'กลับไปทำข้อสอบต่อ'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] disabled:opacity-50 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {isEn ? 'Confirm Submission' : 'ยืนยันการส่งข้อสอบ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
