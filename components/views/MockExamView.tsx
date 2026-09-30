'use client';
import React, { useState, useEffect, useRef } from 'react';
import { CAMBRIDGE_MOCK_EXAMS } from '../../data/mockExams';
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
  const { status: authStatus } = useAuth();
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
    const fallbackList: MockExamCatalogItemDTO[] = CAMBRIDGE_MOCK_EXAMS.map((e) => ({
      id: e.id,
      exam_code: e.examCode,
      name: e.name,
      target_cefr: e.targetCefr,
      description_th: e.descriptionTh,
      total_duration_minutes: e.totalDurationMinutes,
      passing_score: e.passingScore,
      version: 1,
    }));
    setCatalogExams(fallbackList);
    if (fallbackList.length > 0) {
      setSelectedExamId(fallbackList[0].id);
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

  // 4. Start Exam Handler (Server-Authoritative Lifecycle)
  const handleStartExam = async (examIdToStart?: string) => {
    const targetExamId = examIdToStart || selectedExamId;

    if (authStatus !== 'authenticated') {
      showToast(
        'กรุณาเข้าสู่ระบบเพื่อทำ Mock Exam',
        'การสอบจำลองมาตรฐานจำเป็นต้องสร้างเซสชันการสอบและบันทึกคะแนนลงในบัญชีผู้ใช้ของคุณ',
        'info'
      );
      if (onOpenProfile) onOpenProfile();
      return;
    }

    setIsStartingExam(true);
    try {
      // 1. Initialize attempt on server
      const startRes = await startMockExam(targetExamId);

      // 2. Fetch session questions (safe payloads stripped of answer keys)
      const sessionRes = await getMockExamSession(startRes.session_token);

      // 3. Flatten questions in strict section and question order
      const flattened: FlattenedExamQuestion[] = [];
      const initialAnswers: Record<string, { selected_option_key: string | null; text_answer: string | null }> = {};

      sessionRes.sections.forEach((section) => {
        section.questions.forEach((q) => {
          flattened.push({
            id: q.id,
            sectionId: section.id,
            sectionName: section.name,
            orderIndex: q.order_index,
            marks: q.marks,
            skill: q.skill,
            type: q.type,
            promptTh: q.prompt_th,
            promptEn: q.prompt_en,
            options: q.options || [],
          });

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
        `เวลาสอบทั้งหมด ${sessionRes.mock_exam.total_duration_minutes} นาที ระบบกำลังจับเวลาอย่างเป็นทางการ`,
        'info'
      );
    } catch (err: any) {
      console.error('Failed to start mock exam:', err);
      showToast(
        'ไม่สามารถเริ่มการสอบได้',
        err.friendlyMessage || err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์',
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

  // 6. Submit Exam Handler
  const handleSubmitExam = async (isTimeout = false) => {
    if (isSubmitting || isSubmitted) return;
    setIsConfirmSubmitOpen(false);
    setIsSubmitting(true);

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    try {
      if (sessionToken) {
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
        // Safe fallback: If an exam ran without an active server session token, prevent silent fake submission
        showToast(
          t('mock_exam.offline_preview'),
          'ไม่พบเซสชันการสอบบนเซิร์ฟเวอร์ การสอบนี้ทำงานในโหมดตัวอย่างและไม่มีการบันทึกคะแนน',
          'info'
        );
        setIsExamStarted(false);
        setIsSubmitted(false);
      }
    } catch (err: any) {
      console.error('Failed to submit mock exam:', err);
      showToast(
        'การส่งข้อสอบขัดข้อง',
        err.friendlyMessage || err.message || 'กรุณาลองกดส่งใหม่อีกครั้ง',
        'error'
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
        {/* Header Hero Banner */}
        <GlovaCard variant="elevated" className="p-6 sm:p-8 text-center space-y-4 relative overflow-hidden">
          {/* Authentic Examination Setting Backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-15 overflow-hidden" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80"
              alt="Structured exam desk with question paper and stationery"
              className="w-full h-full object-cover"
              loading="lazy"
              width={1600}
              height={900}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-transparent" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-fluid-title font-bold text-foreground">
                {isEn ? 'Cambridge English Qualifications Mock Examination' : 'ห้องสอบจำลอง Cambridge English Qualifications'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
                {isEn
                  ? 'Simulate authentic exam conditions according to CEFR standards with automated timing and Cambridge English Scale calculations.'
                  : 'จำลองสนามสอบเสมือนจริงตามมาตรฐานการวัดระดับ CEFR พร้อมระบบจับเวลาและคำนวณคะแนน Cambridge English Scale'}
              </p>
            </div>

          <GlovaFeedbackBubble
            currentSkill="reading"
            customTip={
              isEn
                ? 'Practice mock tests to evaluate test readiness and estimate your Cambridge English Scale score. All test sessions are automatically logged.'
                : 'แบบทดสอบจำลองเพื่อประเมินความพร้อมและคำนวณคะแนนเทียบเคียง Cambridge English Scale ทุกข้อสอบจะมีการบันทึกประวัติการสอบอัตโนมัติ'
            }
          />

          {/* Official Cambridge Disclaimer */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground text-left max-w-xl mx-auto">
            <HelpCircle className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>
              {isEn
                ? 'Practice mock test for skills evaluation, not an official certificate from Cambridge English Qualifications.'
                : 'แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications'}
            </span>
          </div>
          </div>
        </GlovaCard>

        {/* Guest Mode Auth Required Warning Banner */}
        {authStatus !== 'authenticated' && (
          <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-foreground">
                  {isEn ? 'Please log in to take Mock Exams' : 'กรุณาเข้าสู่ระบบเพื่อทำ Mock Exam'}
                </p>
                <p className="text-muted-foreground mt-0.5">
                  {isEn
                    ? 'Standard mock exams require session generation and permanent progress tracking on your account.'
                    : 'การสอบจำลองมาตรฐานจำเป็นต้องสร้างเซสชันการสอบและบันทึกคะแนนลงในบัญชีผู้ใช้ของคุณ'}
                </p>
              </div>
            </div>
            {onOpenProfile && (
              <GlovaButton
                variant="primary"
                size="md"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={onOpenProfile}
                className="shrink-0 px-5"
              >
                {isEn ? 'Sign In' : 'เข้าสู่ระบบ'}
              </GlovaButton>
            )}
          </div>
        )}

        {/* Exam Cards Grid */}
        {isLoadingCatalog ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">
              {isEn ? 'Loading mock exam catalog...' : 'กำลังโหลดรายการชุดข้อสอบจำลอง...'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {catalogExams.map((exam) => {
              const isSelected = selectedExamId === exam.id;
              return (
                <GlovaCard
                  key={exam.id}
                  variant={isSelected ? 'elevated' : 'interactive'}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`p-5 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40 bg-primary/5'
                      : ''
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <GlovaBadge variant="accent">
                          {exam.exam_code}
                        </GlovaBadge>
                        <GlovaBadge variant="outline">
                          CEFR {exam.target_cefr}
                        </GlovaBadge>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{exam.total_duration_minutes} {isEn ? 'min' : 'นาที'}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isEn ? (exam.description_en || exam.description_th) : exam.description_th}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/40 space-y-1 text-xs text-muted-foreground">
                      <p>{isEn ? `• Passing mark: ${exam.passing_score}%+` : `• เกณฑ์ผ่าน: ${exam.passing_score}% ขึ้นไป`}</p>
                      <p>{isEn ? `• Target Level: CEFR ${exam.target_cefr}` : `• มาตรฐานเป้าหมาย: CEFR ${exam.target_cefr}`}</p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <GlovaButton
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedExamId(exam.id);
                        handleStartExam(exam.id);
                      }}
                      disabled={isStartingExam}
                      isLoading={isStartingExam && selectedExamId === exam.id}
                    >
                      {isEn ? 'Start This Exam' : 'เริ่มทำข้อสอบชุดนี้'}
                    </GlovaButton>
                  </div>
                </GlovaCard>
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
        <GlovaCard variant="elevated" className="p-6 sm:p-8 text-center space-y-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
              isPassed
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
            }`}
          >
            <Award className="w-8 h-8" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
              <GlovaBadge variant={isPassed ? 'success' : 'warning'}>
                {isPassed ? t('mock_exam.passed') : t('mock_exam.needs_improvement')}
              </GlovaBadge>

              {isTimedOut && (
                <GlovaBadge variant="danger">
                  <Clock className="w-3 h-3 inline mr-1" />
                  <span>{t('mock_exam.timed_out')}</span>
                </GlovaBadge>
              )}
            </div>

            <h2 className="text-fluid-title font-bold text-foreground mt-2">
              {isEn
                ? `Cambridge ${examResult.exam.exam_code} Exam Result: ${examResult.estimated_cambridge_score} pts`
                : `ผลสอบ Cambridge ${examResult.exam.exam_code}: ${examResult.estimated_cambridge_score} คะแนน`}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {isEn ? 'Estimated CEFR Level:' : 'ระดับ CEFR ที่ประเมินได้:'}{' '}
              <span className="font-bold text-primary">{examResult.estimated_cefr_level}</span>
              {isEn
                ? ` • Objective Score: ${examResult.objective_score} / ${examResult.objective_total_marks} marks (${examResult.objective_percentage}%) • Passing Mark: ${examResult.exam.passing_score}%`
                : ` • คะแนนปรนัย ${examResult.objective_score} จาก ${examResult.objective_total_marks} ข้อ (${examResult.objective_percentage}%) • เกณฑ์ผ่าน ${examResult.exam.passing_score}%`}
            </p>
          </div>

          {/* Subjective Questions Status Notice */}
          {examResult.has_pending_subjective && (
            <div className="rounded-xl p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs text-left space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>{t('mock_exam.pending_eval')}</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-6">
                {isEn
                  ? `You have ${examResult.pending_subjective_marks} marks in subjective writing/speaking awaiting evaluation. These marks are excluded from instant calculation and will not default to 0.`
                  : `มีข้อสอบส่วนอัตนัยจำนวน ${examResult.pending_subjective_marks} คะแนนที่รอรับการตรวจประเมิน คะแนนส่วนนี้จึงยังไม่ถูกนำมาคำนวณ และไม่มีการหักเป็น 0 คะแนน`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <GlovaButton
              variant="primary"
              size="md"
              onClick={() => handleStartExam(examResult.exam.id)}
            >
              {isEn ? 'Retake This Exam' : 'ทำข้อสอบชุดนี้อีกครั้ง'}
            </GlovaButton>
            <GlovaButton
              variant="outline"
              size="md"
              onClick={() => {
                setIsExamStarted(false);
                setIsSubmitted(false);
                setExamResult(null);
                setSessionToken(null);
              }}
            >
              {isEn ? 'Back to Exam Catalog' : 'กลับสู่หน้ารายการข้อสอบ'}
            </GlovaButton>
          </div>
        </GlovaCard>

        {/* Section & Skill Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Breakdown */}
          {examResult.section_breakdown && Object.keys(examResult.section_breakdown).length > 0 && (
            <GlovaCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>{t('mock_exam.section_breakdown')}</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(examResult.section_breakdown).map(([secName, secData]) => (
                  <div key={secName} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center justify-between font-medium text-foreground mb-1">
                      <span>{secName}</span>
                      <span className="font-mono">{secData.raw_score} / {secData.total_marks} ({secData.percentage}%)</span>
                    </div>
                    <GlovaProgress value={secData.percentage} showLabel={false} />
                  </div>
                ))}
              </div>
            </GlovaCard>
          )}

          {/* Skill Breakdown */}
          {examResult.skill_breakdown && Object.keys(examResult.skill_breakdown).length > 0 && (
            <GlovaCard className="p-5 space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>{t('mock_exam.skill_breakdown')}</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(examResult.skill_breakdown).map(([skillName, skData]) => (
                  <div key={skillName} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center justify-between font-medium text-foreground mb-1 capitalize">
                      <span>{skillName}</span>
                      <span className="font-mono">{skData.correct_questions} / {skData.total_questions} ข้อ ({skData.percentage}%)</span>
                    </div>
                    <GlovaProgress value={skData.percentage} showLabel={false} />
                  </div>
                ))}
              </div>
            </GlovaCard>
          )}
        </div>

        {/* Cambridge English Disclaimer Banner */}
        <div className="rounded-xl p-4 bg-muted/40 border border-border/60 text-xs text-muted-foreground text-center space-y-1">
          <p className="font-semibold text-foreground">
            {examResult.disclaimer}
          </p>
          <p className="text-[11px]">
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
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 p-4 rounded-xl bg-card/95 border border-border/80 backdrop-blur-md shadow-xs">
        <div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {examMetadata?.examCode || activeExam?.exam_code} • {examMetadata?.targetCefr || activeExam?.target_cefr}
          </span>
          <h2 className="text-sm font-bold text-foreground truncate mt-0.5">
            {examMetadata?.name || activeExam?.name}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Autosave Status Indicator */}
          <div className="hidden sm:flex items-center text-xs">
            {autosaveStatus === 'saving' && (
              <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>{isEn ? 'Saving...' : 'กำลังบันทึก...'}</span>
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>{isEn ? 'Saved' : 'บันทึกคำตอบแล้ว'}</span>
              </span>
            )}
            {autosaveStatus === 'error' && (
              <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{isEn ? 'Save failed' : 'บันทึกไม่สำเร็จ'}</span>
              </span>
            )}
          </div>

          {/* Server-Authoritative Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-bold text-sm ${
              secondsRemaining < 300
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                : 'bg-muted/60 text-foreground border-border'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Submit Exam Button */}
          <button
            onClick={() => setIsConfirmSubmitOpen(true)}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-2xl bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white font-bold text-xs shadow-[0_3px_0_0_#047857] active:translate-y-[3px] active:shadow-none transition-all touch-target flex items-center gap-1.5 border-t border-white/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEn ? 'Submitting...' : 'กำลังส่ง...'}</span>
              </>
            ) : (
              <span>{isEn ? 'Submit Exam' : 'ส่งข้อสอบ'}</span>
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
                <span className="text-xs text-muted-foreground font-medium">
                  {isEn
                    ? `Question ${currentQuestionIdx + 1} of ${questions.length}`
                    : `ข้อที่ ${currentQuestionIdx + 1} จาก ${questions.length}`}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50 capitalize">
                  {currentQuestion.sectionName}
                </span>
              </div>

              {/* Flag for Review Button */}
              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1.5 transition-colors touch-target ${
                  flaggedQuestionIds.includes(currentQuestion.id)
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border'
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

            {/* Current Question View */}
            <GlovaCard variant="elevated" className="p-5 space-y-4">
              <h3 className="text-sm sm:text-base font-semibold text-foreground break-word-safe">
                {currentQuestion.promptTh}
              </h3>
              {currentQuestion.promptEn && (
                <p className="text-xs sm:text-sm text-muted-foreground break-word-safe">
                  {currentQuestion.promptEn}
                </p>
              )}

              {/* Multiple Choice Options or Subjective Text Input */}
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      answers[currentQuestion.id]?.selected_option_key === option.key;
                    const optionStyle = isSelected
                      ? 'bg-[#5B5CE2]/15 border-2 border-[#5B5CE2] text-[#5B5CE2] dark:text-[#A5A6F6] font-bold ring-2 ring-[#5B5CE2]/20 shadow-[0_3.5px_0_0_#5B5CE2] active:translate-y-[3.5px] active:shadow-none'
                      : 'bg-slate-100 dark:bg-[#1C2430] hover:bg-[#253040] border-2 border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-[#EDEBE8] shadow-[0_3.5px_0_0_#0D1318] active:translate-y-[3.5px] active:shadow-none';

                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSelectOption(currentQuestion.id, option.key)}
                        className={`w-full min-h-[48px] p-3.5 rounded-2xl text-left flex items-center gap-3 transition-all touch-target break-word-safe cursor-pointer ${optionStyle}`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 border ${
                            isSelected
                              ? 'bg-[#5B5CE2] text-white border-[#5B5CE2]'
                              : 'bg-slate-100 dark:bg-[#1C2430] text-slate-900 dark:text-[#EDEBE8] border-slate-200/80 dark:border-white/10'
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
                  <label className="text-xs text-muted-foreground font-medium">
                    {isEn
                      ? 'Type your response for this subjective question (saved automatically):'
                      : 'พิมพ์คำตอบสำหรับข้อสอบอัตนัยข้อนี้ (คำตอบจะถูกบันทึกอัตโนมัติ):'}
                  </label>
                  <textarea
                    rows={6}
                    value={answers[currentQuestion.id]?.text_answer || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder={isEn ? 'Type your answer here...' : 'พิมพ์คำตอบของคุณที่นี่...'}
                    className="w-full p-3 rounded-xl bg-background border border-border/70 text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                  />
                </div>
              )}
            </GlovaCard>

            {/* Bottom Pagination Buttons */}
            <div className="flex items-center justify-between pt-2">
              <GlovaButton
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>{isEn ? 'Previous' : 'ข้อก่อนหน้า'}</span>
              </GlovaButton>

              <GlovaButton
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentQuestionIdx((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                disabled={currentQuestionIdx === questions.length - 1}
              >
                <span>{isEn ? 'Next' : 'ข้อถัดไป'}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </GlovaButton>
            </div>
          </div>

          {/* Right Column: Question Navigator Palette */}
          <GlovaCard className="lg:col-span-4 p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">{t('mock_exam.question_palette')}</span>
              <span className="text-xs text-muted-foreground font-mono">
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

                let btnClass = 'bg-slate-100 dark:bg-[#1C2430] hover:bg-[#253040] text-slate-900 dark:text-[#EDEBE8] border border-slate-200/80 dark:border-white/10 shadow-[0_2px_0_0_#0D1318] active:translate-y-[2px] active:shadow-none';
                if (isCurrent) {
                  btnClass = 'bg-[#5B5CE2] text-white border-t border-white/20 shadow-[0_2.5px_0_0_#38399E] active:translate-y-[2.5px] active:shadow-none font-bold ring-2 ring-[#5B5CE2]/30';
                } else if (isFlagged) {
                  btnClass = 'bg-[#E5A83B] text-white border-t border-white/20 shadow-[0_2px_0_0_#A86E12] active:translate-y-[2px] active:shadow-none font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-[#5B5CE2]/15 text-[#5B5CE2] dark:text-[#A5A6F6] border border-[#5B5CE2]/40 shadow-[0_2px_0_0_rgba(91,92,226,0.3)] active:translate-y-[2px] active:shadow-none font-bold';
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
            <div className="pt-3 border-t border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary" />
                <span>{t('mock_exam.status_answered')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500" />
                <span>{t('mock_exam.status_flagged')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-muted border border-border" />
                <span>{t('mock_exam.status_unanswered')}</span>
              </div>
            </div>
          </GlovaCard>
        </div>
      ) : (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">
            {isEn ? 'Preparing exam session...' : 'กำลังจัดเตรียมเซสชันข้อสอบ...'}
          </p>
        </div>
      )}

      {/* Submit Confirmation Dialog Modal */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <GlovaCard variant="elevated" className="w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-foreground">
                {isEn ? 'Confirm Exam Submission' : 'ยืนยันการส่งข้อสอบ'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isEn
                ? 'Are you sure you want to submit your exam? Once submitted, you cannot change your answers.'
                : 'คุณต้องการส่งข้อสอบชุดนี้หรือไม่? เมื่อส่งแล้วจะไม่สามารถกลับมาแก้ไขคำตอบได้อีก'}
              {questions.length >
                Object.values(answers).filter(
                  (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                ).length && (
                <span className="flex items-center gap-1.5 mt-2 font-semibold text-amber-500">
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
              <GlovaButton
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmSubmitOpen(false)}
              >
                {isEn ? 'Continue Exam' : 'กลับไปทำต่อ'}
              </GlovaButton>
              <GlovaButton
                variant="success"
                size="sm"
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isEn ? 'Confirm Submission' : 'ยืนยันส่งข้อสอบ'}
              </GlovaButton>
            </div>
          </GlovaCard>
        </div>
      )}
    </div>
  );
};
