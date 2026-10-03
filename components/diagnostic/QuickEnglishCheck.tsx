'use client';

import React, { useState, useEffect } from 'react';
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
  X,
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
  isOpen?: boolean;
  onComplete?: (level?: string) => void;
}

export const QuickEnglishCheck: React.FC<QuickEnglishCheckProps> = ({
  onFinish,
  onClose,
  isModal = false,
  isOpen = true,
  onComplete,
}) => {
  const router = useRouter();
  const { progress, setProgress } = useApp();
  const { status } = useAuth();

  useEffect(() => {
    if (!isModal && !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  if (isOpen === false) return null;

  const renderContainer = (content: React.ReactNode) => {
    if (!isModal && !onClose) return content;

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="แบบวัดระดับด่วน 3 นาที"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget && onClose) {
            onClose();
          }
        }}
      >
        <div className="relative w-full max-w-2xl my-auto">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {content}
        </div>
      </div>
    );
  };

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
        return <MessageSquare className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />;
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-500" aria-hidden="true" />;
      case 'email':
        return <Mail className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />;
      case 'travel':
        return <Plane className="w-4 h-4 text-amber-500" aria-hidden="true" />;
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
    if (onComplete && snapshot) {
      onComplete(snapshot.overallLevel);
    }
    if (onFinish) {
      onFinish();
    } else if (!onComplete) {
      router.push('/dashboard');
    }
  };

  // 1. INTRO SCREEN
  if (step === 'intro') {
    return renderContainer(
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-border/80 shadow-sm text-left space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] text-xs font-mono font-bold border border-[#FDE5BC] dark:border-amber-500/20">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>3-Minute Real-Life English Check</span>
        </div>

        {/* Authentic Outcrowd Mondly Editorial Photo Banner */}
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] rounded-[22px] overflow-hidden border border-[#EAE4D5] dark:border-white/10 shadow-xs bg-slate-100 dark:bg-slate-800">
          <img
            src="/images/learning/assessment_hero.jpg"
            alt="University students engaged in academic English assessment"
            width={800}
            height={340}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-mono font-bold border border-white/30">
              CEFR Diagnostic Placement
            </span>
            <span className="px-3 py-1 rounded-full bg-[#FA5D5D] text-white text-xs font-bold shadow-xs">
              8 Situations • 3 Mins
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            How good is your English, really?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            ไม่ใช่การสอบวัดผลแบบโรงเรียน แต่คือ 8 สถานการณ์จริงที่คุณเจอทุกวันในชีวิต: แชทกับเพื่อน, สั่งกาแฟ, อ่านอีเมลกลุ่ม, และประกาศในสนามบิน
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-2 text-xs font-sans">
          <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">8 สถานการณ์สั้น</p>
              <p className="text-slate-500 dark:text-slate-400">ใช้เวลาประมาณ 3 นาที</p>
            </div>
          </div>

          <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">ไม่กดดันเวลา</p>
              <p className="text-slate-500 dark:text-slate-400">ไม่มีนาฬิกานับถอยหลัง</p>
            </div>
          </div>

          <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">รู้ผลทันที</p>
              <p className="text-slate-500 dark:text-slate-400">ไม่ต้องสมัครสมาชิกล่วงหน้า</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setStep('questions')}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>เริ่มเช็คภาษาทันที (3 นาที)</span>
            <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-border/80 text-slate-600 dark:text-slate-400 hover:text-foreground text-sm font-semibold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
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
    return renderContainer(
      <div className="w-full max-w-2xl mx-auto p-5 sm:p-7 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-border/80 shadow-sm space-y-5 text-left">
        {/* Header with Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span className="font-mono text-slate-900 dark:text-white">
              คำถามที่ {currentIdx + 1} จาก {QUICK_CHECK_QUESTIONS.length}
            </span>
            <span className="font-mono">~{Math.max(1, Math.round((QUICK_CHECK_QUESTIONS.length - currentIdx) * 0.4))} นาทีที่เหลือ</span>
          </div>

          <div className="h-2 w-full bg-[#FAF8F3] dark:bg-[#13111C]/60 rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-[#FA5D5D] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Real-Life Context Card */}
        <div className="p-4 sm:p-5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            {getContextIcon(currentQ.contextType)}
            <span>{currentQ.contextLabel}</span>
            {currentQ.speakerOrSource && (
              <span className="text-slate-400 dark:text-slate-500">• {currentQ.speakerOrSource}</span>
            )}
          </div>

          <div className="p-4 rounded-[18px] bg-white dark:bg-[#1E1B28] border border-border/80 font-sans text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed shadow-xs">
            <p className="italic">"{currentQ.scenarioSnippet}"</p>
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {currentQ.prompt}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Choose the most natural or accurate response:
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOption === opt.key;
            let btnStyle = 'border-border/80 bg-[#FAF8F3] dark:bg-[#13111C]/60 hover:bg-slate-100 dark:hover:bg-[#252233] text-slate-800 dark:text-slate-200';

            if (showFeedback) {
              if (opt.isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold';
              } else if (isSelected && !opt.isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold';
              } else {
                btnStyle = 'border-border/40 opacity-40';
              }
            } else if (isSelected) {
              btnStyle = 'border-[#FA5D5D] bg-[#FA5D5D]/10 text-[#FA5D5D] font-bold shadow-xs';
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={showFeedback}
                onClick={() => handleSelectOption(opt.key)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
              >
                <span className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                  isSelected
                    ? 'bg-[#FA5D5D] text-white border-[#FA5D5D]'
                    : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border-border/80'
                }`}>
                  {opt.key}
                </span>
                <span className="flex-1 leading-snug font-medium pt-0.5">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback & Next Action */}
        {showFeedback && (() => {
          const isUserCorrect = currentQ.options.find((o) => o.key === selectedOption)?.isCorrect;
          const correctOpt = currentQ.options.find((o) => o.isCorrect);

          return (
            <div className="pt-2 space-y-3">
              {!isUserCorrect && correctOpt && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 flex items-start gap-2.5 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                    {correctOpt.key}
                  </div>
                  <div className="flex-1">
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      คำตอบที่ถูกต้องคือ ข้อ {correctOpt.key}:
                    </span>{' '}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      "{correctOpt.text}"
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-sans shadow-xs">
                {currentQ.options.find((o) => o.key === selectedOption)?.feedback}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span>{currentIdx + 1 < QUICK_CHECK_QUESTIONS.length ? 'ข้อถัดไป' : 'ดูผลวิเคราะห์ของคุณ'}</span>
                  <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // 3. PERSONAL ENGLISH SNAPSHOT SCREEN
  if (step === 'snapshot' && snapshot) {
    return renderContainer(
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-border/80 shadow-sm space-y-6 text-left">
        {/* Header */}
        <div className="space-y-1 border-b border-border/80 pb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#FA5D5D] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Your Personal English Snapshot</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            ผลวิเคราะห์ภาษาอังกฤษของคุณ
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            {snapshot.isOfficialDisclaimer}
          </p>
        </div>

        {/* Level & Strengths Card */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80">
          <div className="sm:col-span-4 flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#FA5D5D] text-white font-mono font-black text-2xl flex items-center justify-center shadow-sm shrink-0">
              {snapshot.overallLevel}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">ระดับประเมิน</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">CEFR {snapshot.overallLevel}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">ตอบถูก {snapshot.correctCount} จาก {snapshot.totalCount} สถานการณ์</p>
            </div>
          </div>

          <div className="sm:col-span-8 space-y-1.5 sm:border-l sm:border-border/80 sm:pl-4">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>สิ่งที่คุณทำได้ดีแล้ว:</span>
            </p>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside font-sans">
              {snapshot.strongAreas.map((area, idx) => (
                <li key={idx} className="leading-snug">{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Growth Opportunity Card (No Shame UX) */}
        <div className="p-5 rounded-[22px] bg-[#FEF5E5] dark:bg-[#2B2010] border border-[#FDE5BC] dark:border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#D98200] dark:text-[#FFBA38]" aria-hidden="true" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              จุดที่ฝึกเพิ่มนิดเดียว แล้วจะเห็นผลชัดเจน: {snapshot.growthArea.label}
            </h4>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-amber-200/90 leading-relaxed font-sans">
            {snapshot.growthArea.opportunityNote}
          </p>
        </div>

        {/* Real Life Outcomes */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            ทำไมทักษะนี้จึงสำคัญในชีวิตจริงของคุณ:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {snapshot.lifeOutcomes.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-[18px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 space-y-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.skill}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug font-sans">{item.realWorldValue}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Immediate Next Step & CTAs */}
        <div className="pt-3 border-t border-border/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white">ก้าวถัดไปที่แนะนำ:</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">{snapshot.nextUsefulStep.title}</p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleStartQuickWin}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 mr-1.5 text-amber-300" aria-hidden="true" />
              <span>ลองโจทย์ฝึกด่วน 2 นาที</span>
            </button>

            <button
              type="button"
              onClick={handleGoToDashboard}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-border/80 text-slate-700 dark:text-slate-300 hover:text-foreground text-xs font-bold hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
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
    return renderContainer(
      <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-border/80 shadow-sm space-y-5 text-left">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#D98200] dark:text-[#FFBA38]">
            <Zap className="w-4 h-4" aria-hidden="true" />
            <span>2-Minute Quick Win Activity</span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">1 ข้อจบใน 2 นาที</span>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
            แก้ไข 1 รูปแบบประโยคที่พบบ่อยในการส่งข้อความภาษาอังกฤษ
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            สถานการณ์: {QUICK_WIN_CHALLENGE.situation}
          </p>
        </div>

        <div className="p-4 rounded-[18px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-sm font-medium text-slate-900 dark:text-white shadow-xs font-sans">
          {QUICK_WIN_CHALLENGE.question}
        </div>

        <div className="space-y-2.5">
          {QUICK_WIN_CHALLENGE.options.map((opt) => {
            const isSelected = quickWinSelected === opt.key;
            let style = 'border-border/80 bg-[#FAF8F3] dark:bg-[#13111C]/60 hover:bg-slate-100 dark:hover:bg-[#252233] text-slate-800 dark:text-slate-200';

            if (quickWinAnswered) {
              if (opt.isCorrect) {
                style = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold';
              } else if (isSelected && !opt.isCorrect) {
                style = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 font-bold';
              } else {
                style = 'border-border/40 opacity-40';
              }
            } else if (isSelected) {
              style = 'border-[#FA5D5D] bg-[#FA5D5D]/10 text-[#FA5D5D] font-bold shadow-xs';
            }

            return (
              <button
                key={opt.key}
                type="button"
                disabled={quickWinAnswered}
                onClick={() => handleQuickWinSelect(opt.key)}
                className={`w-full p-3.5 sm:p-4 rounded-2xl border text-left text-sm transition-all flex items-start gap-3 cursor-pointer ${style}`}
              >
                <span className={`w-7 h-7 rounded-xl text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${
                  isSelected
                    ? 'bg-[#FA5D5D] text-white border-[#FA5D5D]'
                    : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border-border/80'
                }`}>
                  {opt.key}
                </span>
                <span className="flex-1 leading-snug font-medium pt-0.5">{opt.text}</span>
              </button>
            );
          })}
        </div>

        {quickWinAnswered && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1 font-sans shadow-xs">
              <p className="font-bold text-slate-900 dark:text-white">
                {QUICK_WIN_CHALLENGE.options.find((o) => o.key === quickWinSelected)?.tip}
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-xs">{QUICK_WIN_CHALLENGE.takeaway}</p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleFinishQuickWin}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
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
  return renderContainer(
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-border/80 shadow-sm space-y-5 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 flex items-center justify-center shadow-xs">
        <BookmarkCheck className="w-8 h-8" aria-hidden="true" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-slate-900 dark:text-white">
          ทำสำเร็จ 1 Quick Win แล้ว!
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
          คุณเข้าใจความแตกต่างของ Present Perfect ในบทสนทนาประจำวันเรียบร้อยแล้ว
        </p>
      </div>

      <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-border/80 text-xs text-slate-600 dark:text-slate-400 text-left space-y-1 font-sans">
        <p className="font-bold text-slate-900 dark:text-white">ก้าวต่อไปบนแดชบอร์ด:</p>
        <p>ระบบได้เตรียมบทเรียน 7 นาทีที่เหมาะกับผลวิเคราะห์ของคุณไว้แล้ว</p>
      </div>

      <button
        type="button"
        onClick={handleGoToDashboard}
        className="w-full py-3.5 px-6 rounded-full bg-[#FA5D5D] hover:bg-[#E84C4C] text-white font-bold text-sm shadow-sm active:scale-95 transition-all cursor-pointer"
      >
        เข้าสู่หน้าหลักการเรียนของคุณ
      </button>
    </div>
  );
};
