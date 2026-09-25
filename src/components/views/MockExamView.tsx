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
        // Fallback for static mock mode
        setIsSubmitted(true);
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
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header Hero Banner */}
        <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-fluid-title font-bold text-foreground">
              ห้องสอบจำลอง Cambridge English Qualifications
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-lg mx-auto">
              จำลองสนามสอบเสมือนจริงตามมาตรฐานการวัดระดับ CEFR พร้อมระบบจับเวลาและคำนวณคะแนน Cambridge English Scale
            </p>
          </div>

          {/* Official Cambridge Disclaimer */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground text-left max-w-xl mx-auto">
            <HelpCircle className="w-4 h-4 shrink-0 text-muted-foreground" />
            <span>
              แบบทดสอบจำลองเพื่อการฝึกฝนทักษะ ไม่ใช่ผลสอบทางการหรือใบรับรองจาก Cambridge English Qualifications
            </span>
          </div>
        </div>

        {/* Guest Mode Auth Required Warning Banner */}
        {authStatus !== 'authenticated' && (
          <div className="rounded-xl p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-foreground">กรุณาเข้าสู่ระบบเพื่อทำ Mock Exam</p>
                <p className="text-muted-foreground mt-0.5">
                  การสอบจำลองมาตรฐานจำเป็นต้องสร้างเซสชันการสอบและบันทึกคะแนนลงในบัญชีผู้ใช้ของคุณ
                </p>
              </div>
            </div>
            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold shrink-0 hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 touch-target shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ / สมัครสมาชิก</span>
              </button>
            )}
          </div>
        )}

        {/* Exam Cards Grid */}
        {isLoadingCatalog ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs text-muted-foreground">กำลังโหลดรายการชุดข้อสอบจำลอง...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {catalogExams.map((exam) => {
              const isSelected = selectedExamId === exam.id;
              return (
                <div
                  key={exam.id}
                  onClick={() => setSelectedExamId(exam.id)}
                  className={`p-5 rounded-2xl bg-card border cursor-pointer transition-all flex flex-col justify-between shadow-xs ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary bg-primary/5'
                      : 'border-border/60 hover:border-border'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {exam.exam_code} ({exam.target_cefr})
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{exam.total_duration_minutes} นาที</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">
                      {exam.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {exam.description_th}
                    </p>

                    <div className="mt-4 pt-3 border-t border-border/40 space-y-1 text-xs text-muted-foreground">
                      <p>• เกณฑ์ผ่าน: {exam.passing_score} คะแนนขึ้นไป</p>
                      <p>• มาตรฐาน CEFR: ระดับ {exam.target_cefr}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExamId(exam.id);
                      handleStartExam(exam.id);
                    }}
                    disabled={isStartingExam}
                    className="mt-5 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all touch-target flex items-center justify-center gap-2"
                  >
                    {isStartingExam && selectedExamId === exam.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>กำลังจัดเตรียมข้อสอบ...</span>
                      </>
                    ) : (
                      <span>เริ่มทำข้อสอบชุดนี้</span>
                    )}
                  </button>
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
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        {/* Main Score Card */}
        <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-8 text-center shadow-xs space-y-4">
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
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  isPassed
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}
              >
                {isPassed ? 'ผ่านเกณฑ์มาตรฐาน (Passed)' : 'ยังไม่ผ่านเกณฑ์ (Needs Improvement)'}
              </span>

              {isTimedOut && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>หมดเวลาสอบ (Timed Out)</span>
                </span>
              )}
            </div>

            <h2 className="text-fluid-title font-bold text-foreground mt-2">
              ผลสอบ Cambridge {examResult.exam.exam_code}: {examResult.estimated_cambridge_score} คะแนน
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              ระดับ CEFR ที่ประเมินได้: <span className="font-bold text-primary">{examResult.estimated_cefr_level}</span> • 
              คะแนนปรนัย {examResult.objective_score} จาก {examResult.objective_total_marks} ข้อ ({examResult.objective_percentage}%) • 
              เกณฑ์ผ่าน {examResult.exam.passing_score} คะแนน
            </p>
          </div>

          {/* Subjective Questions Status Notice */}
          {examResult.has_pending_subjective && (
            <div className="rounded-xl p-3.5 bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-300 text-xs text-left space-y-1">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>ข้อสอบอัตนัย Writing / Speaking: รอการประเมิน (Pending Evaluation)</span>
              </div>
              <p className="text-muted-foreground leading-relaxed pl-6">
                มีข้อสอบส่วนอัตนัยจำนวน {examResult.pending_subjective_marks} คะแนนที่รอรับการตรวจประเมิน คะแนนส่วนนี้จึงยังไม่ถูกนำมาคำนวณ และไม่มีการหักเป็น 0 คะแนน
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={() => handleStartExam(examResult.exam.id)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all touch-target"
            >
              ทำข้อสอบชุดนี้อีกครั้ง
            </button>
            <button
              onClick={() => {
                setIsExamStarted(false);
                setIsSubmitted(false);
                setExamResult(null);
                setSessionToken(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-xs transition-colors touch-target"
            >
              กลับสู่หน้ารายการข้อสอบ
            </button>
          </div>
        </div>

        {/* Section & Skill Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Section Breakdown */}
          {examResult.section_breakdown && Object.keys(examResult.section_breakdown).length > 0 && (
            <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>คะแนนแยกตามส่วนสอบ (Section Breakdown)</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(examResult.section_breakdown).map(([secName, secData]) => (
                  <div key={secName} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center justify-between font-medium text-foreground mb-1">
                      <span>{secName}</span>
                      <span>{secData.raw_score} / {secData.total_marks} ({secData.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, secData.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Breakdown */}
          {examResult.skill_breakdown && Object.keys(examResult.skill_breakdown).length > 0 && (
            <div className="rounded-2xl bg-card border border-border/70 p-5 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>ความแม่นยำรายทักษะ (Skill Breakdown)</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(examResult.skill_breakdown).map(([skillName, skData]) => (
                  <div key={skillName} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center justify-between font-medium text-foreground mb-1 capitalize">
                      <span>{skillName}</span>
                      <span>{skData.correct_questions} / {skData.total_questions} ข้อ ({skData.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, skData.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cambridge English Disclaimer Banner */}
        <div className="rounded-xl p-4 bg-muted/40 border border-border/60 text-xs text-muted-foreground text-center space-y-1">
          <p className="font-semibold text-foreground">
            {examResult.disclaimer}
          </p>
          <p className="text-[11px]">
            การประเมินนี้อ้างอิงจากเกณฑ์การเทียบเคียงของแพลตฟอร์ม (is_official: false) เพื่อใช้เป็นแนวทางในการฝึกฝนทักษะเท่านั้น
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: Active Exam Simulation Screen
  // =========================================================================
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
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
                <span>กำลังบันทึก...</span>
              </span>
            )}
            {autosaveStatus === 'saved' && (
              <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5" />
                <span>บันทึกคำตอบแล้ว</span>
              </span>
            )}
            {autosaveStatus === 'error' && (
              <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1.5 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>บันทึกไม่สำเร็จ</span>
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
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-all touch-target flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>กำลังส่ง...</span>
              </>
            ) : (
              <span>ส่งข้อสอบ</span>
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
                  ข้อที่ {currentQuestionIdx + 1} จาก {questions.length}
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
                  {flaggedQuestionIds.includes(currentQuestion.id) ? 'ติดธงแล้ว' : 'ติดธงไว้ทบทวน'}
                </span>
              </button>
            </div>

            {/* Current Question View */}
            <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-xs">
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
                <div className="space-y-2.5 pt-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected =
                      answers[currentQuestion.id]?.selected_option_key === option.key;
                    return (
                      <button
                        key={option.key}
                        onClick={() => handleSelectOption(currentQuestion.id, option.key)}
                        className={`w-full min-h-[44px] p-3 rounded-xl border text-left flex items-center gap-3 transition-all touch-target break-word-safe ${
                          isSelected
                            ? 'bg-primary/10 border-primary text-primary font-medium'
                            : 'border-border/60 hover:bg-muted/40 text-foreground'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border ${
                            isSelected
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {option.key}
                        </span>
                        <span className="text-xs sm:text-sm">{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Subjective Text Answer Area */
                <div className="space-y-2 pt-2">
                  <label className="text-xs text-muted-foreground font-medium">
                    พิมพ์คำตอบสำหรับข้อสอบอัตนัยข้อนี้ (คำตอบจะถูกบันทึกอัตโนมัติ):
                  </label>
                  <textarea
                    rows={6}
                    value={answers[currentQuestion.id]?.text_answer || ''}
                    onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                    placeholder="พิมพ์คำตอบของคุณที่นี่..."
                    className="w-full p-3 rounded-xl bg-background border border-border/70 text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                  />
                </div>
              )}
            </div>

            {/* Bottom Pagination Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIdx === 0}
                className={`px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors touch-target ${
                  currentQuestionIdx === 0
                    ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                    : 'hover:bg-muted text-foreground border-border'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ข้อก่อนหน้า</span>
              </button>

              <button
                onClick={() =>
                  setCurrentQuestionIdx((prev) =>
                    Math.min(questions.length - 1, prev + 1)
                  )
                }
                disabled={currentQuestionIdx === questions.length - 1}
                className={`px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors touch-target ${
                  currentQuestionIdx === questions.length - 1
                    ? 'opacity-40 cursor-not-allowed border-border text-muted-foreground'
                    : 'hover:bg-muted text-foreground border-border'
                }`}
              >
                <span>ข้อถัดไป</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Question Navigator Palette */}
          <div className="lg:col-span-4 rounded-xl bg-card border border-border/70 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-semibold text-foreground">ผังข้อสอบ (Question Palette)</span>
              <span className="text-xs text-muted-foreground font-mono">
                ตอบแล้ว{' '}
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

                let btnClass = 'bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted';
                if (isCurrent) {
                  btnClass = 'ring-2 ring-primary border-primary text-foreground font-bold';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
                } else if (isAnswered) {
                  btnClass = 'bg-primary/10 text-primary border-primary/20 font-medium';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`h-9 rounded-lg border text-xs font-mono flex items-center justify-center transition-all touch-target relative ${btnClass}`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette Legend */}
            <div className="pt-3 border-t border-border/40 space-y-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-primary/20 border border-primary" />
                <span>ตอบแล้ว (Answered)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500" />
                <span>ติดธงทบทวน (Flagged)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded bg-muted border border-border" />
                <span>ยังไม่ตอบ (Unanswered)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">กำลังจัดเตรียมเซสชันข้อสอบ...</p>
        </div>
      )}

      {/* Submit Confirmation Dialog Modal */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-foreground">ยืนยันการส่งข้อสอบ</h3>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              คุณต้องการส่งข้อสอบชุดนี้หรือไม่? เมื่อส่งแล้วจะไม่สามารถกลับมาแก้ไขคำตอบได้อีก
              {questions.length >
                Object.values(answers).filter(
                  (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                ).length && (
                <span className="block mt-2 font-semibold text-amber-500">
                  ⚠️ คุณยังมีข้อที่ไม่ได้ตอบอีก{' '}
                  {questions.length -
                    Object.values(answers).filter(
                      (a) => a.selected_option_key !== null || (a.text_answer && a.text_answer.trim() !== '')
                    ).length}{' '}
                  ข้อ
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted text-xs font-medium transition-colors touch-target"
              >
                กลับไปทำต่อ
              </button>
              <button
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all touch-target flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>กำลังส่งข้อสอบ...</span>
                  </>
                ) : (
                  <span>ยืนยันส่งข้อสอบ</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
