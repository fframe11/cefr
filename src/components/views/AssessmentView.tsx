import React, { useState } from 'react';
import {
  DIAGNOSTIC_QUESTIONS,
  evaluateDiagnosticAssessment,
} from '../../data/diagnosticAssessment';
import { QuestionCard } from '../common/QuestionCard';
import {
  Award,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BarChart3,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProgressState } from '../../types';

interface AssessmentViewProps {
  onComplete: (updatedState: Partial<UserProgressState>) => void;
  onNavigateDashboard: () => void;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({
  onComplete,
  onNavigateDashboard,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof evaluateDiagnosticAssessment> | null>(null);

  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / DIAGNOSTIC_QUESTIONS.length) * 100);

  const handleAnswer = (selectedKey: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: selectedKey };
    setAnswers(newAnswers);

    if (currentIdx + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setTimeout(() => {
        setCurrentIdx((prev) => prev + 1);
      }, 700);
    } else {
      // Finished all 18 questions
      const evalResult = evaluateDiagnosticAssessment(newAnswers);
      setResult(evalResult);
      setIsCompleted(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // Safe fallback if canvas-confetti is not loaded
      }

      // Persist results into state
      onComplete({
        currentLevel: evalResult.estimatedLevel,
        estimatedCambridgeScore: evalResult.cambridgeScore,
        targetExam: evalResult.targetExam,
        skillStats: evalResult.skillStats,
        weakTopics: evalResult.identifiedWeaknesses.map((w) => ({
          tag: w.tag,
          labelTh: w.labelTh,
          errorCount: w.errorCount,
          lastFailedAt: new Date().toISOString(),
        })),
        assessmentCompleted: true,
      });
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setIsCompleted(false);
    setResult(null);
  };

  if (isCompleted && result) {
    return (
      <div className="w-full max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
        {/* Results Banner */}
        <div className="rounded-2xl bg-card border border-border/60 p-6 sm:p-8 text-center shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              การประเมินเสร็จสมบูรณ์
            </span>
            <h2 className="text-fluid-title font-bold text-foreground mt-2">
              ระดับภาษาอังกฤษของคุณคือ CEFR {result.estimatedLevel}
            </h2>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              ตอบถูกต้อง {result.correctCount} จาก {result.totalQuestions} ข้อ ({result.percentage}%) เทียบเคียงคะแนนเคมบริดจ์ได้{' '}
              <span className="text-foreground font-semibold font-mono">{result.cambridgeScore}</span> คะแนน
            </p>
          </div>

          {/* Recommended Exam Target */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 inline-flex flex-col sm:flex-row items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono font-bold text-xl shrink-0">
              {result.targetExam}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Cambridge Target Recommended</p>
              <p className="text-sm font-semibold text-foreground">
                แนะนำให้มุ่งเน้นข้อสอบ Cambridge {result.targetExam}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ข้อสอบที่เหมาะสมที่สุดกับทักษะปัจจุบันของคุณ เพื่อพัฒนาไปสู่ระดับถัดไป
              </p>
            </div>
          </div>
        </div>

        {/* Skill Proficiency Breakdown */}
        <div className="rounded-xl bg-card border border-border/60 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              คะแนนแยกตามทักษะ (Skill Breakdown)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(result.skillStats).map(([skill, val]) => (
              <div key={skill} className="p-3 rounded-lg bg-muted/30 border border-border/40 space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="capitalize text-foreground">{skill}</span>
                  <span className="font-mono text-muted-foreground">{val}%</span>
                </div>
                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Learning Path Recommendations */}
        <div className="rounded-xl bg-card border border-border/60 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              แผนการเรียนรู้เฉพาะบุคคล (Personalized Learning Path)
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
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onNavigateDashboard}
            className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-xs hover:bg-primary/90 transition-all touch-target"
          >
            <span>เริ่มเรียนตามแผนการเรียนรู้นี้</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleRestart}
            className="w-full sm:w-auto py-3 px-5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted text-sm font-medium flex items-center justify-center gap-2 transition-colors touch-target"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ทำแบบประเมินอีกครั้ง</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 pb-12">
      {/* Assessment Header & Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">แบบวัดระดับ CEFR Diagnostic Test</span>
            <span className="text-muted-foreground">
              ข้อที่ {currentIdx + 1} จาก {DIAGNOSTIC_QUESTIONS.length}
            </span>
          </div>
          <span className="font-mono text-primary">{progressPercent}%</span>
        </div>

        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
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
    </div>
  );
};
