'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  MessageSquare,
  Coffee,
  Mail,
  Plane,
  Briefcase,
  Share2,
  Building,
  RotateCcw,
  Zap,
  BookmarkCheck,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  QUICK_CHECK_QUESTIONS,
  QuickCheckQuestion,
  evaluateQuickCheckAssessment,
  PersonalEnglishSnapshot,
  QUICK_WIN_CHALLENGE,
} from '../../data/quickCheckQuestions';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { saveUserProgress, saveGuestAttempt } from '../../services/storageService';
import { UserProgressState, CEFRLevel, CambridgeExamCode } from '../../types';

interface QuickEnglishCheckProps {
  onFinish?: () => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const QuickEnglishCheck: React.FC<QuickEnglishCheckProps> = ({
  onFinish,
  onClose,
  isModal = false,
}) => {
  const router = useRouter();
  const { progress, setProgress } = useApp();
  const { status } = useAuth();

  const [step, setStep] = useState<'intro' | 'questions' | 'snapshot' | 'quick_win' | 'win_done'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [snapshot, setSnapshot] = useState<PersonalEnglishSnapshot | null>(null);

  // Quick Win state
  const [quickWinSelected, setQuickWinSelected] = useState<string | null>(null);
  const [quickWinAnswered, setQuickWinAnswered] = useState(false);

  const currentQ = QUICK_CHECK_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / QUICK_CHECK_QUESTIONS.length) * 100);

  const getContextIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-indigo-500" aria-hidden="true" />;
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" aria-hidden="true" />;
      case 'travel':
        return <Plane className="w-4 h-4 text-sky-500" aria-hidden="true" />;
      case 'work':
        return <Briefcase className="w-4 h-4 text-purple-500" aria-hidden="true" />;
      case 'social':
        return <Share2 className="w-4 h-4 text-pink-500" aria-hidden="true" />;
      default:
        return <Building className="w-4 h-4 text-emerald-500" aria-hidden="true" />;
    }
  };

  const handleSelectOption = (key: string) => {
    if (showFeedback) return;
    setSelectedOption(key);
    setShowFeedback(true);

    const newAnswers = { ...answers, [currentQ.id]: key };
    setAnswers(newAnswers);

    // Save guest attempt if not authenticated
    if (status !== 'authenticated') {
      saveGuestAttempt({
        client_attempt_id: `guest-qc-${currentQ.id}-${Date.now()}`,
        question_id: currentQ.id,
        selected_option_key: key,
        time_spent_seconds: 5,
        context_type: 'placement',
        attempted_at: new Date().toISOString(),
      });
    }
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedOption(null);

    if (currentIdx + 1 < QUICK_CHECK_QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Evaluate snapshot
      const finalSnapshot = evaluateQuickCheckAssessment(answers);
      setSnapshot(finalSnapshot);

      // Map to exam code
      let mappedExam: CambridgeExamCode = 'PET';
      if (finalSnapshot.overallLevel === 'A1' || finalSnapshot.overallLevel === 'A2') {
        mappedExam = 'KET';
      } else if (finalSnapshot.overallLevel === 'B1') {
        mappedExam = 'PET';
      } else if (finalSnapshot.overallLevel === 'B2') {
        mappedExam = 'FCE';
      } else {
        mappedExam = 'CAE';
      }

      // Update state without overriding if already higher
      const updated: UserProgressState = {
        ...progress,
        currentLevel: finalSnapshot.overallLevel,
        estimatedCambridgeScore: finalSnapshot.estimatedCambridgeScore,
        targetExam: mappedExam,
        assessmentCompleted: true,
        englishSnapshot: {
          overallLevel: finalSnapshot.overallLevel,
          estimatedCambridgeScore: finalSnapshot.estimatedCambridgeScore,
          strongSkill: finalSnapshot.strongAreas[0] || 'Reading',
          growthArea: finalSnapshot.growthArea.label,
          nextStepRecommendation: finalSnapshot.nextUsefulStep.title,
          completedAt: new Date().toISOString(),
        },
        lastActivity: {
          type: 'assessment',
          title: '3-Minute English Check',
          detail: `Level ${finalSnapshot.overallLevel} • ${finalSnapshot.correctCount}/${finalSnapshot.totalCount} correct`,
          timestamp: new Date().toISOString(),
        },
      };

      setProgress(updated);
      saveUserProgress(updated);
      setStep('snapshot');
    }
  };

  const handleStartQuickWin = () => {
    setStep('quick_win');
  };

  const handleQuickWinSelect = (key: string) => {
    setQuickWinSelected(key);
    setQuickWinAnswered(true);
  };

  const handleFinishQuickWin = () => {
    const updated: UserProgressState = {
      ...progress,
      quickWinCompleted: true,
      minutesStudiedToday: progress.minutesStudiedToday + 2,
      lastActivity: {
        type: 'grammar',
        title: 'Quick Win: Everyday Present Perfect',
        detail: 'Completed 2-minute everyday messaging challenge',
        timestamp: new Date().toISOString(),
      },
    };
    setProgress(updated);
    saveUserProgress(updated);
    setStep('win_done');
  };

  const handleGoToDashboard = () => {
    if (onFinish) {
      onFinish();
    } else {
      router.push('/');
    }
  };

  // 1. INTRO SCREEN
  if (step === 'intro') {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-card rounded-2xl border border-border/50 shadow-sm text-left space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>3-Minute Real-Life English Check</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            How good is your English, really?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            ไม่ใช่การสอบวัดผลแบบโรงเรียน แต่คือ 8 สถานการณ์จริงที่คุณเจอทุกวันในชีวิต: แชทกับเพื่อน, สั่งกาแฟ, อ่านอีเมลกลุ่ม, และประกาศในสนามบิน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 text-xs">
          <div className="p-3.5 rounded-xl bg-background border border-border/40 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">8 สถานการณ์สั้น</p>
              <p className="text-muted-foreground">ใช้เวลาประมาณ 3 นาที</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/40 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">ไม่กดดันเวลา</p>
              <p className="text-muted-foreground">ไม่มีนาฬิกานับถอยหลัง</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-background border border-border/40 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold text-foreground">รู้ผลทันที</p>
              <p className="text-muted-foreground">ไม่ต้องสมัครสมาชิกล่วงหน้า</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep('questions')}
            className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
          >
            <span>เริ่มเช็คภาษาทันที (3 นาที)</span>
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-border/50 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              ไว้ทำภายหลัง
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. QUESTION SCREEN (One by One, Real-Life Context)
  if (step === 'questions') {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-7 bg-card rounded-2xl border border-border/50 shadow-sm space-y-5 text-left">
        {/* Header with Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              คำถามที่ {currentIdx + 1} จาก {QUICK_CHECK_QUESTIONS.length}
            </span>
            <span>~{Math.max(1, Math.round((QUICK_CHECK_QUESTIONS.length - currentIdx) * 0.4))} นาทีที่เหลือ</span>
          </div>

          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Real-Life Context Card */}
        <div className="p-4 sm:p-5 rounded-xl bg-background border border-border/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {getContextIcon(currentQ.contextType)}
            <span>{currentQ.contextLabel}</span>
            {currentQ.speakerOrSource && (
              <span className="text-muted-foreground/60">• {currentQ.speakerOrSource}</span>
            )}
          </div>

          <div className="p-3.5 rounded-lg bg-card border border-border/40 font-sans text-sm sm:text-base text-foreground leading-relaxed">
            <p className="italic">"{currentQ.scenarioSnippet}"</p>
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
            {currentQ.prompt}
          </h3>
          <p className="text-xs text-muted-foreground">
            แตะเลือกคำตอบที่คุณคิดว่าเป็นธรรมชาติหรือถูกต้องที่สุด:
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            let btnStyle = 'border-border/60 bg-card hover:bg-muted/50 text-foreground';

            if (showFeedback) {
              if (opt.isCorrect) {
                btnStyle = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium';
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = 'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300';
              } else {
                btnStyle = 'border-border/40 opacity-50';
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={showFeedback}
                onClick={() => handleSelectOption(opt.key)}
                className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-sm transition-all flex items-start gap-3 ${btnStyle}`}
              >
                <span className="w-6 h-6 rounded-md bg-secondary text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {opt.key}
                </span>
                <span className="flex-1 leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback & Next Action */}
        {showFeedback && (
          <div className="pt-2 space-y-4">
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/40 text-xs sm:text-sm leading-relaxed text-foreground">
              {currentQ.options.find((o) => o.key === selectedOption)?.feedback}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>{currentIdx + 1 < QUICK_CHECK_QUESTIONS.length ? 'ข้อถัดไป' : 'ดูผลวิเคราะห์ของคุณ'}</span>
                <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. PERSONAL ENGLISH SNAPSHOT SCREEN
  if (step === 'snapshot' && snapshot) {
    return (
      <div className="w-full max-w-2xl mx-auto p-5 sm:p-8 bg-card rounded-2xl border border-border/50 shadow-sm space-y-6 text-left">
        {/* Header */}
        <div className="space-y-1 border-b border-border/40 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Your Personal English Snapshot</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            ผลวิเคราะห์ภาษาอังกฤษของคุณ
          </h2>
          <p className="text-xs text-muted-foreground">
            {snapshot.isOfficialDisclaimer}
          </p>
        </div>

        {/* Level & Strengths Card */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-4 sm:p-5 rounded-xl bg-background border border-border/60">
          <div className="sm:col-span-4 flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-3xl flex items-center justify-center shadow-xs">
              {snapshot.overallLevel}
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">ระดับประเมิน</p>
              <p className="text-base font-bold text-foreground">CEFR {snapshot.overallLevel}</p>
              <p className="text-[11px] text-muted-foreground">ตอบถูก {snapshot.correctCount} จาก {snapshot.totalCount} สถานการณ์</p>
            </div>
          </div>

          <div className="sm:col-span-8 space-y-1.5 sm:border-l sm:border-border/40 sm:pl-4">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>สิ่งที่คุณทำได้ดีแล้ว:</span>
            </p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              {snapshot.strongAreas.map((area, idx) => (
                <li key={idx} className="leading-snug">{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Growth Opportunity Card (No Shame UX) */}
        <div className="p-4 sm:p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-500" aria-hidden="true" />
            <h4 className="text-sm font-bold text-foreground">
              จุดที่ฝึกเพิ่มนิดเดียว แล้วจะเห็นผลชัดเจน: {snapshot.growthArea.label}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {snapshot.growthArea.opportunityNote}
          </p>
        </div>

        {/* Real Life Outcomes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            ทำไมทักษะนี้จึงสำคัญในชีวิตจริงของคุณ:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {snapshot.lifeOutcomes.map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-background border border-border/40 space-y-1">
                <p className="text-xs font-semibold text-foreground">{item.skill}</p>
                <p className="text-[11px] text-muted-foreground leading-snug">{item.realWorldValue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Next Step & CTAs */}
        <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-foreground">ก้าวถัดไปที่แนะนำ:</p>
            <p className="text-xs text-muted-foreground">{snapshot.nextUsefulStep.title}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleStartQuickWin}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs sm:text-sm shadow-sm hover:opacity-95 transition-opacity"
            >
              <Zap className="w-4 h-4 mr-1.5 text-amber-300" aria-hidden="true" />
              <span>ลองทำโจทย์ 2 นาที (Quick Win)</span>
            </button>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground text-xs font-medium transition-colors"
            >
              ไปหน้าแดชบอร์ด
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. QUICK WIN ACTIVITY (2 Minutes)
  if (step === 'quick_win') {
    return (
      <div className="w-full max-w-2xl mx-auto p-5 sm:p-8 bg-card rounded-2xl border border-border/50 shadow-sm space-y-5 text-left">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span>2-Minute Quick Win Activity</span>
          </div>
          <span className="text-xs text-muted-foreground">1 ข้อจบใน 2 นาที</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">
            แก้ไข 1 รูปแบบประโยคที่พบบ่อยในการส่งข้อความภาษาอังกฤษ
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            สถานการณ์: {QUICK_WIN_CHALLENGE.situation}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-background border border-border/60 text-sm font-medium text-foreground">
          {QUICK_WIN_CHALLENGE.question}
        </div>

        <div className="space-y-2">
          {QUICK_WIN_CHALLENGE.options.map((opt) => {
            const isSelected = quickWinSelected === opt.key;
            let style = 'border-border/60 bg-card hover:bg-muted/40 text-foreground';

            if (quickWinAnswered) {
              if (opt.isCorrect) {
                style = 'border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-semibold';
              } else if (isSelected && !opt.isCorrect) {
                style = 'border-amber-500/60 bg-amber-500/10 text-amber-800 dark:text-amber-300';
              } else {
                style = 'border-border/30 opacity-50';
              }
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={quickWinAnswered}
                onClick={() => handleQuickWinSelect(opt.key)}
                className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-start gap-3 ${style}`}
              >
                <span className="w-5 h-5 rounded bg-secondary text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {opt.key}
                </span>
                <span className="flex-1 leading-snug">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {quickWinAnswered && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border/40 text-xs sm:text-sm text-foreground space-y-1">
              <p className="font-semibold text-foreground">
                {QUICK_WIN_CHALLENGE.options.find((o) => o.key === quickWinSelected)?.tip}
              </p>
              <p className="text-muted-foreground text-xs">{QUICK_WIN_CHALLENGE.takeaway}</p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFinishQuickWin}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
              >
                <span>บันทึกความสำเร็จนี้</span>
                <ArrowRight className="w-4 h-4 ml-1.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 5. QUICK WIN DONE AFFIRMATION
  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-card rounded-2xl border border-border/50 shadow-sm space-y-5 text-center">
      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        <BookmarkCheck className="w-7 h-7" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-extrabold text-foreground">
          ทำสำเร็จ 1 Quick Win แล้ว!
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          คุณเข้าใจความแตกต่างของ Present Perfect ในบทสนทนาประจำวันเรียบร้อยแล้ว
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-background border border-border/40 text-xs text-muted-foreground text-left space-y-1">
        <p className="font-semibold text-foreground">ก้าวต่อไปบนแดชบอร์ด:</p>
        <p>ระบบได้เตรียมบทเรียน 7 นาทีที่เหมาะกับผลวิเคราะห์ของคุณไว้แล้ว</p>
      </div>

      <button
        type="button"
        onClick={handleGoToDashboard}
        className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-sm hover:opacity-95 transition-opacity"
      >
        เข้าสู่หน้าหลักการเรียนของคุณ
      </button>
    </div>
  );
};
