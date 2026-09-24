import React, { useState, useEffect } from 'react';
import { CAMBRIDGE_MOCK_EXAMS } from '../../data/mockExams';
import { MockExam, Question } from '../../types';
import { QuestionCard } from '../common/QuestionCard';
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
} from 'lucide-react';
import { useToast } from '../common/Toast';
import confetti from 'canvas-confetti';

interface MockExamViewProps {
  onExamSubmitted: (cambridgeScore: number) => void;
}

export const MockExamView: React.FC<MockExamViewProps> = ({ onExamSubmitted }) => {
  const { showToast } = useToast();
  const [selectedExamId, setSelectedExamId] = useState<string>(CAMBRIDGE_MOCK_EXAMS[0].id);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeExam =
    CAMBRIDGE_MOCK_EXAMS.find((e) => e.id === selectedExamId) || CAMBRIDGE_MOCK_EXAMS[0];

  // Flatten all questions across all sections of this mock exam
  const allExamQuestions: Question[] = activeExam.sections.flatMap((s) => s.questions);
  const currentQuestion = allExamQuestions[currentQuestionIdx];

  // Countdown Timer
  useEffect(() => {
    if (!isExamStarted || isSubmitted) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamStarted, isSubmitted]);

  const handleStartExam = () => {
    setIsExamStarted(true);
    setIsSubmitted(false);
    setAnswers({});
    setFlaggedQuestionIds([]);
    setCurrentQuestionIdx(0);
    setSecondsRemaining(activeExam.totalDurationMinutes * 60);
    showToast('เริ่มการทำข้อสอบแล้ว', `เวลาทั้งหมด ${activeExam.totalDurationMinutes} นาที`, 'info');
  };

  const handleSelectOption = (key: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
  };

  const handleToggleFlag = (qId: string) => {
    setFlaggedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);

    // Calculate score
    let correctCount = 0;
    allExamQuestions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = q.options?.find((o) => o.key === selected)?.isCorrect;
      if (isCorrect) correctCount += 1;
    });

    const percent = Math.round((correctCount / allExamQuestions.length) * 100);
    const scaledScore = Math.round(
      activeExam.passingScore - 15 + (percent / 100) * 30
    );

    onExamSubmitted(scaledScore);

    try {
      if (percent >= 70) {
        confetti({ particleCount: 70, spread: 60 });
      }
    } catch (err) {}
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exam Selection Screen
  if (!isExamStarted && !isSubmitted) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
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
        </div>

        {/* Exam Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CAMBRIDGE_MOCK_EXAMS.map((exam) => (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`p-5 rounded-2xl bg-card border cursor-pointer transition-all flex flex-col justify-between shadow-xs ${
                selectedExamId === exam.id
                  ? 'border-primary ring-1 ring-primary bg-primary/5'
                  : 'border-border/60 hover:border-border'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    {exam.examCode} ({exam.targetCefr})
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{exam.totalDurationMinutes} นาที</span>
                  </span>
                </div>

                <h3 className="font-bold text-sm sm:text-base text-foreground mb-1">
                  {exam.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {exam.descriptionTh}
                </p>

                <div className="mt-4 pt-3 border-t border-border/40 space-y-1 text-xs text-muted-foreground">
                  <p>• เกณฑ์ผ่าน: {exam.passingScore} คะแนนขึ้นไป</p>
                  <p>• จำนวนส่วนสอบ: {exam.sections.length} ส่วน ({exam.sections.map((s) => s.name).join(', ')})</p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedExamId(exam.id);
                  handleStartExam();
                }}
                className="mt-5 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all touch-target"
              >
                เริ่มทำข้อสอบชุดนี้
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Exam Results Screen
  if (isSubmitted) {
    let correctCount = 0;
    allExamQuestions.forEach((q) => {
      const selected = answers[q.id];
      const isCorrect = q.options?.find((o) => o.key === selected)?.isCorrect;
      if (isCorrect) correctCount += 1;
    });

    const percent = Math.round((correctCount / allExamQuestions.length) * 100);
    const scaledScore = Math.round(
      activeExam.passingScore - 15 + (percent / 100) * 30
    );
    const isPassed = scaledScore >= activeExam.passingScore;

    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
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
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isPassed
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              {isPassed ? 'ผ่านเกณฑ์มาตรฐาน (Passed)' : 'ยังไม่ผ่านเกณฑ์ (Needs Improvement)'}
            </span>

            <h2 className="text-fluid-title font-bold text-foreground mt-2">
              ผลสอบ Cambridge {activeExam.examCode}: {scaledScore} คะแนน
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              ทำคะแนนได้ {correctCount} จาก {allExamQuestions.length} ข้อ ({percent}%) • เกณฑ์ผ่าน {activeExam.passingScore} คะแนน
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={handleStartExam}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-all touch-target"
            >
              ทำข้อสอบใหม่อีกครั้ง
            </button>
            <button
              onClick={() => {
                setIsExamStarted(false);
                setIsSubmitted(false);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted font-medium text-xs transition-colors touch-target"
            >
              กลับสู่หน้ารายการข้อสอบ
            </button>
          </div>
        </div>

        {/* Detailed Question Review */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span>ตรวจคำตอบและคำอธิบายเฉลยทุกข้อ (Detailed Review)</span>
          </h3>

          <div className="space-y-4">
            {allExamQuestions.map((q, idx) => {
              const selected = answers[q.id];
              const isCorrect = q.options?.find((o) => o.key === selected)?.isCorrect;
              return (
                <div key={q.id} className="relative">
                  <QuestionCard
                    question={q}
                    questionNumber={idx + 1}
                    totalQuestions={allExamQuestions.length}
                    showExplanationImmediately={true}
                    onAnswer={() => {}}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active Exam Simulation Screen
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Exam Header: Title, Timer, Submit Button */}
      <div className="sticky top-16 z-30 flex items-center justify-between gap-3 p-4 rounded-xl bg-card/95 border border-border/80 backdrop-blur-md shadow-xs">
        <div>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {activeExam.examCode} • {activeExam.targetCefr}
          </span>
          <h2 className="text-sm font-bold text-foreground truncate mt-0.5">{activeExam.name}</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer Display */}
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

          <button
            onClick={handleSubmitExam}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-all touch-target"
          >
            ส่งข้อสอบ
          </button>
        </div>
      </div>

      {/* Main Simulation Layout: Question on Left / Navigation Palette on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Current Question */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs text-muted-foreground font-medium">
              ข้อที่ {currentQuestionIdx + 1} จาก {allExamQuestions.length}
            </span>

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

          {/* Current Question View (Non-revealing during exam) */}
          <div className="p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-xs">
            <h3 className="text-sm sm:text-base font-semibold text-foreground break-word-safe">
              {currentQuestion.promptTh}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground break-word-safe">
              {currentQuestion.promptEn}
            </p>

            {currentQuestion.contextPassage && (
              <div className="p-3.5 rounded-lg bg-muted/40 border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap break-word-safe">
                {currentQuestion.contextPassage}
              </div>
            )}

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQuestion.options?.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.key;
                return (
                  <button
                    key={option.key}
                    onClick={() => handleSelectOption(option.key)}
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
                  Math.min(allExamQuestions.length - 1, prev + 1)
                )
              }
              disabled={currentQuestionIdx === allExamQuestions.length - 1}
              className={`px-4 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors touch-target ${
                currentQuestionIdx === allExamQuestions.length - 1
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
              ตอบแล้ว {Object.keys(answers).length}/{allExamQuestions.length}
            </span>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2">
            {allExamQuestions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.id]);
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
    </div>
  );
};
