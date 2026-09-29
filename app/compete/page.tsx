'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Swords,
  Flame,
  Clock,
  Award,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';
import {
  startCompetition,
  submitCompetitionAnswer,
  finishCompetition,
} from '../../lib/api/gamification';
import {
  CompetitionQuestionClient,
  CompetitionSummary,
  CompetitionDifficultyStage,
} from '../../types/gamification';

export default function CompetePage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'guest_user';

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'feedback' | 'finished'>('idle');
  const [sessionId, setSessionId] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState<CompetitionQuestionClient | null>(null);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackResult, setFeedbackResult] = useState<{
    correct: boolean;
    isLate: boolean;
    xpEarned: number;
    correctAnswerText: string;
  } | null>(null);
  const [summary, setSummary] = useState<CompetitionSummary | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(4000);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const QUESTION_DURATION_MS = 4000;

  // Handle countdown timer (4 seconds)
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    setTimeLeftMs(QUESTION_DURATION_MS);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, QUESTION_DURATION_MS - elapsed);
      setTimeLeftMs(remaining);

      // Auto-submit late answer when timer expires
      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleAnswerSubmit('__LATE_TIMEOUT__');
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentQuestion?.questionId]);

  const handleStartBattle = async () => {
    try {
      setIsSubmitting(true);
      const res = await startCompetition(userId);
      setSessionId(res.sessionId);
      setCurrentQuestion(res.initialQuestion);
      setScore(0);
      setStreak(0);
      setSummary(null);
      setFeedbackResult(null);
      setSelectedOption(null);
      setGameState('playing');
    } catch (err: any) {
      console.error('Failed to start battle:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (option: string) => {
    if (!currentQuestion || isSubmitting || gameState !== 'playing') return;

    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);
    setSelectedOption(option);

    try {
      const result = await submitCompetitionAnswer({
        sessionId,
        userId,
        questionId: currentQuestion.questionId,
        selectedOption: option,
      });

      setScore(result.newScore);
      setStreak(result.newStreak);
      setFeedbackResult({
        correct: result.correct,
        isLate: result.isLate,
        xpEarned: result.xpEarned,
        correctAnswerText: result.correctAnswerText,
      });
      setGameState('feedback');

      // Short 1.2s feedback before moving to next question or concluding battle
      setTimeout(async () => {
        if (result.nextQuestion) {
          setCurrentQuestion(result.nextQuestion);
          setSelectedOption(null);
          setFeedbackResult(null);
          setGameState('playing');
        } else {
          // Finished battle round
          const finishSummary = await finishCompetition(sessionId, userId);
          setSummary(finishSummary);
          setGameState('finished');
        }
      }, 1200);
    } catch (err: any) {
      console.error('Answer submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const timerPercent = Math.max(0, Math.min(100, (timeLeftMs / QUESTION_DURATION_MS) * 100));
  const timerColor =
    timerPercent > 50 ? 'bg-emerald-500' : timerPercent > 25 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* 1. ARENA HEADER */}
      <section className="rounded-3xl bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/70 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                  {isEn ? 'Vocabulary Battle Arena' : 'สนามประลองคำศัพท์จับเวลา'}
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  4s Speed Quiz
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {isEn
                  ? 'Speed vocab challenges with server-authoritative timer'
                  : 'ประลองความเร็ว ทดสอบคลังคำศัพท์ และไต่ระดับลีกมหาวิทยาลัย'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/ranking"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-background border border-border/70 hover:bg-secondary text-xs font-bold text-foreground transition-all shadow-2xs"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'View Leaderboard' : 'ดูอันดับลีก'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. GAME LOBBY (IDLE STATE) */}
      {gameState === 'idle' && (
        <section className="rounded-3xl bg-card border border-border/70 p-8 sm:p-12 text-center space-y-6 shadow-xs">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-xl font-bold text-foreground">
              {isEn ? 'Adaptive Vocabulary Battle' : 'ประลองคำศัพท์จับเวลา 4 วินาที'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isEn
                ? 'Challenge your recall speed. You have 4 seconds per word. Difficulty scales dynamically as your streak increases!'
                : 'ท้าทายความเร็วในการจำคำศัพท์ มีเวลาคิดข้อละ 4 วินาที ความยากจะปรับขึ้นอัตโนมัติตามสตรีคความแม่นยำของคุณ'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>{isEn ? '4s / Question' : '4 วินาที/ข้อ'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isEn ? 'Think fast. Server-authoritative timer validation.' : 'คิดไว ตอบฉับไว ตรวจสอบเวลาแบบ Server-side'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isEn ? 'Adaptive Tiers' : 'ปรับความยากตามฟอร์ม'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isEn ? 'Starts A1, climbs to C1 when answering correctly.' : 'เริ่ม A1 ไต่ระดับถึง C1 เมื่อตอบถูกต่อเนื่อง'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>{isEn ? 'Review Missed' : 'ทบทวนข้อที่ผิด'}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {isEn ? 'Mistakes feed directly to your review queue.' : 'คำที่ตอบผิดจะถูกบันทึกเข้าคิวทบทวนทันที'}
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleStartBattle}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-black text-sm hover:bg-primary/90 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <Swords className="w-5 h-5" />
              <span>{isEn ? 'Start Battle Now' : 'เริ่มประลองคำศัพท์ทันที'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </section>
      )}

      {/* 3. ACTIVE BATTLE ARENA (PLAYING & FEEDBACK) */}
      {(gameState === 'playing' || gameState === 'feedback') && currentQuestion && (
        <section className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Top HUD: Difficulty Stage, Streak & Score */}
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                {currentQuestion.stageName}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
                <span className="tabular-nums">Streak {streak}</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-secondary text-xs font-black text-foreground tabular-nums">
                Score: {score}
              </div>
            </div>
          </div>

          {/* 4-Second Animated Countdown Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{isEn ? 'Thinking Time' : 'เวลาที่เหลือ'}</span>
              </span>
              <span className="tabular-nums font-black text-foreground">
                {(timeLeftMs / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full ${timerColor} rounded-full transition-all duration-75`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>
          </div>

          {/* Question Word Box */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFDF8] dark:bg-background border border-[#EDE8DF] dark:border-border/60 text-center space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              {currentQuestion.partOfSpeech}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              {currentQuestion.word}
            </h2>
            {currentQuestion.ipa && (
              <p className="text-xs text-muted-foreground font-mono">{currentQuestion.ipa}</p>
            )}
          </div>

          {/* Options Grid (4 Bubble Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isFeedback = gameState === 'feedback';
              const isAnswerCorrect = feedbackResult?.correct && isSelected;
              const isAnswerWrong = !feedbackResult?.correct && isSelected;
              const isActualCorrect = isFeedback && opt === feedbackResult?.correctAnswerText;

              let btnStyle =
                'bg-background hover:bg-secondary/70 border-border/70 text-foreground';

              if (isActualCorrect) {
                btnStyle =
                  'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold';
              } else if (isAnswerWrong) {
                btnStyle =
                  'bg-rose-500/15 border-rose-500 text-rose-800 dark:text-rose-200 line-through';
              } else if (isSelected) {
                btnStyle = 'bg-primary text-primary-foreground border-primary font-bold';
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerSubmit(opt)}
                  disabled={isSubmitting || gameState === 'feedback'}
                  className={`p-4 rounded-2xl border text-left text-xs sm:text-sm transition-all shadow-2xs active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-between ${btnStyle}`}
                >
                  <span className="leading-snug">{opt}</span>
                  {isActualCorrect && <span className="text-emerald-600 font-black text-base">✓</span>}
                  {isAnswerWrong && <span className="text-rose-600 font-black text-base">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Instant Feedback Notice */}
          {gameState === 'feedback' && feedbackResult && (
            <div
              className={`p-3.5 rounded-2xl text-center text-xs font-bold transition-all ${
                feedbackResult.correct
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20'
              }`}
            >
              {feedbackResult.correct ? (
                <span>🎉 ถูกต้อง! +{feedbackResult.xpEarned} XP</span>
              ) : feedbackResult.isLate ? (
                <span>⏱ หมดเวลา 4 วินาที! เฉลย: {feedbackResult.correctAnswerText}</span>
              ) : (
                <span>คำตอบยังไม่ถูกต้อง เฉลย: {feedbackResult.correctAnswerText}</span>
              )}
            </div>
          )}
        </section>
      )}

      {/* 4. SUMMARY & MISTAKE REVIEW MODAL (FINISHED) */}
      {gameState === 'finished' && summary && (
        <section className="rounded-3xl bg-card border border-border/70 p-6 sm:p-10 space-y-6 shadow-md text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground">
              {isEn ? 'Battle Concluded!' : 'การประลองเสร็จสิ้น!'}
            </h2>
            <p className="text-xs text-muted-foreground">สรุปผลการตอบคำถามและความเร็วของคุณ</p>
          </div>

          {/* Stats Metrics 4-Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">คะแนนรวม</span>
              <p className="text-xl font-black text-foreground tabular-nums">{summary.finalScore}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">ความแม่นยำ</span>
              <p className="text-xl font-black text-emerald-600 tabular-nums">
                {summary.accuracyPercent}%
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Max Streak</span>
              <p className="text-xl font-black text-amber-500 tabular-nums">{summary.maxStreak}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-background border border-border/60 space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">XP ที่ได้รับ</span>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                +{summary.totalXpEarned}
              </p>
            </div>
          </div>

          {/* Missed Words Learning Review Section */}
          {summary.missedWords.length > 0 && (
            <div className="text-left p-5 rounded-2xl bg-secondary/50 border border-border/60 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-bold text-foreground">
                  {isEn ? 'Words to Review (Added to Queue)' : 'คำศัพท์ที่ควรทบทวน (บันทึกเข้าคลังแล้ว)'}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {summary.missedWords.map((w, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-background border border-border/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-foreground">{w.word}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">({w.meaningTh})</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary">
                      {w.cefrLevel}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartBattle}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isEn ? 'Play Again' : 'ประลองอีกครั้ง'}</span>
            </button>

            <Link
              href="/ranking"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-background border border-border/70 text-foreground font-bold text-xs hover:bg-secondary transition-all shadow-2xs"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>{isEn ? 'Check Leaderboard' : 'ดูตารางคะแนน'}</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
