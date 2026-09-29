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
  Trophy,
  Zap,
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
} from '../../types/gamification';

// Ranked Mode imports
import {
  fetchRankedProfile,
  startRankedMatchmaking,
  pollRankedMatchmaking,
  cancelRankedMatchmaking,
  fetchRankedQuestion,
  submitRankedAnswer,
  finishRankedMatch,
} from '@/lib/api/ranked';
import {
  RankedProfile,
  ClientRankedQuestion,
  RankedMatchPlayer,
  RankedMatchResult,
  QuestionSubmissionResult,
} from '@/types/ranked';
import { RankedLobbyCard } from '@/components/ranked/RankedLobbyCard';
import { RankedMatchScreen } from '@/components/ranked/RankedMatchScreen';
import { RankedResultModal } from '@/components/ranked/RankedResultModal';
import { RankedMistakeReviewModal } from '@/components/ranked/RankedMistakeReviewModal';

export default function CompetePage() {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { user } = useAuth();
  const userId = user?.id || 'user_current';

  // Main Compete Mode: 'ranked' vs 'quick'
  const [competeMode, setCompeteMode] = useState<'ranked' | 'quick'>('ranked');

  // ================= RANKED MODE STATE =================
  const [rankedProfile, setRankedProfile] = useState<RankedProfile | null>(null);
  const [isSearchingRanked, setIsSearchingRanked] = useState<boolean>(false);
  const [searchTimerSec, setSearchTimerSec] = useState<number>(0);
  const [rankedGameState, setRankedGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [activeRankedMatchId, setActiveRankedMatchId] = useState<string | null>(null);
  const [activeSessionToken, setActiveSessionToken] = useState<string | null>(null);
  const [rankedPlayer1, setRankedPlayer1] = useState<RankedMatchPlayer | null>(null);
  const [rankedPlayer2, setRankedPlayer2] = useState<RankedMatchPlayer | null>(null);
  const [currentRankedQuestion, setCurrentRankedQuestion] = useState<ClientRankedQuestion | null>(null);
  const [rankedMatchResult, setRankedMatchResult] = useState<RankedMatchResult | null>(null);
  const [showMistakeReview, setShowMistakeReview] = useState<boolean>(false);

  const searchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial ranked profile
  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    const data = await fetchRankedProfile(userId);
    if (data) {
      setRankedProfile(data.profile);
    }
  };

  // Matchmaking Search Loop
  const handleStartRankedMatchmaking = async () => {
    setIsSearchingRanked(true);
    setSearchTimerSec(0);

    const initRes = await startRankedMatchmaking('vocabulary', userId);
    if (initRes?.status === 'MATCHED' && initRes.match) {
      launchRankedMatch(initRes.match);
      return;
    }

    // Poll queue every 1 second
    searchIntervalRef.current = setInterval(async () => {
      setSearchTimerSec((prev) => {
        const next = prev + 1;
        return next;
      });

      const pollRes = await pollRankedMatchmaking(userId);
      if (pollRes?.status === 'MATCHED' && pollRes.match) {
        if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
        launchRankedMatch(pollRes.match);
      }
    }, 1000);
  };

  const handleCancelRankedMatchmaking = async () => {
    if (searchIntervalRef.current) clearInterval(searchIntervalRef.current);
    await cancelRankedMatchmaking(userId);
    setIsSearchingRanked(false);
    setSearchTimerSec(0);
  };

  const launchRankedMatch = async (matchData: any) => {
    setIsSearchingRanked(false);
    setActiveRankedMatchId(matchData.matchId);
    setActiveSessionToken(matchData.sessionToken);
    setRankedPlayer1(matchData.player1);
    setRankedPlayer2(matchData.player2);

    // Fetch initial question
    const q = await fetchRankedQuestion(matchData.matchId, userId);
    if (q) {
      setCurrentRankedQuestion(q);
      setRankedGameState('playing');
    }
  };

  const handleRankedSubmitAnswer = async (chosenIndex: number): Promise<QuestionSubmissionResult | null> => {
    if (!activeRankedMatchId || !activeSessionToken) return null;

    const res = await submitRankedAnswer({
      matchId: activeRankedMatchId,
      chosenIndex,
      sessionToken: activeSessionToken,
      userId,
    });

    if (res?.nextQuestion) {
      setCurrentRankedQuestion(res.nextQuestion);
    }
    return res;
  };

  const handleRankedMatchComplete = async () => {
    if (!activeRankedMatchId) return;
    const result = await finishRankedMatch(activeRankedMatchId, userId);
    if (result) {
      setRankedMatchResult(result);
      setRankedGameState('result');
      loadProfile(); // refresh rating & tier in background
    }
  };

  // ================= QUICK PLAY MODE STATE (CASUAL) =================
  const [quickGameState, setQuickGameState] = useState<'idle' | 'playing' | 'feedback' | 'finished'>('idle');
  const [quickSessionId, setQuickSessionId] = useState<string>('');
  const [quickQuestion, setQuickQuestion] = useState<CompetitionQuestionClient | null>(null);
  const [quickScore, setQuickScore] = useState<number>(0);
  const [quickStreak, setQuickStreak] = useState<number>(0);
  const [quickSelectedOption, setQuickSelectedOption] = useState<string | null>(null);
  const [quickFeedbackResult, setQuickFeedbackResult] = useState<{
    correct: boolean;
    isLate: boolean;
    xpEarned: number;
    correctAnswerText: string;
  } | null>(null);
  const [quickSummary, setQuickSummary] = useState<CompetitionSummary | null>(null);
  const [quickTimeLeftMs, setQuickTimeLeftMs] = useState<number>(4000);
  const [isQuickSubmitting, setIsQuickSubmitting] = useState<boolean>(false);

  const quickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const quickStartTimeRef = useRef<number>(Date.now());

  // Quick Play Timer (4s)
  useEffect(() => {
    if (quickGameState !== 'playing') {
      if (quickTimerRef.current) clearInterval(quickTimerRef.current);
      return;
    }

    quickStartTimeRef.current = Date.now();
    setQuickTimeLeftMs(4000);

    quickTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - quickStartTimeRef.current;
      const remaining = Math.max(0, 4000 - elapsed);
      setQuickTimeLeftMs(remaining);

      if (remaining <= 0) {
        if (quickTimerRef.current) clearInterval(quickTimerRef.current);
        handleQuickAnswerSubmit('__LATE_TIMEOUT__');
      }
    }, 50);

    return () => {
      if (quickTimerRef.current) clearInterval(quickTimerRef.current);
    };
  }, [quickGameState, quickQuestion?.questionId]);

  const handleStartQuickBattle = async () => {
    try {
      setIsQuickSubmitting(true);
      const res = await startCompetition(userId);
      setQuickSessionId(res.sessionId);
      setQuickQuestion(res.initialQuestion);
      setQuickScore(0);
      setQuickStreak(0);
      setQuickSummary(null);
      setQuickFeedbackResult(null);
      setQuickSelectedOption(null);
      setQuickGameState('playing');
    } catch (err: any) {
      console.error('Failed to start quick battle:', err);
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const handleQuickAnswerSubmit = async (chosenOption: string) => {
    if (isQuickSubmitting || !quickSessionId || !quickQuestion) return;
    try {
      setIsQuickSubmitting(true);
      if (quickTimerRef.current) clearInterval(quickTimerRef.current);
      setQuickSelectedOption(chosenOption);

      const res = await submitCompetitionAnswer({
        sessionId: quickSessionId,
        questionId: quickQuestion.questionId,
        selectedOption: chosenOption,
        userId,
      });

      setQuickFeedbackResult({
        correct: res.correct,
        isLate: res.isLate,
        xpEarned: res.xpEarned,
        correctAnswerText: res.correctAnswerText,
      });
      setQuickScore(res.newScore);
      setQuickStreak(res.newStreak);
      setQuickGameState('feedback');

      setTimeout(() => {
        if (res.nextQuestion) {
          setQuickQuestion(res.nextQuestion);
          setQuickSelectedOption(null);
          setQuickFeedbackResult(null);
          setQuickGameState('playing');
        } else {
          handleFinishQuickBattle();
        }
      }, 750);
    } catch (err: any) {
      console.error('Answer submission failed:', err);
    } finally {
      setIsQuickSubmitting(false);
    }
  };

  const handleFinishQuickBattle = async () => {
    try {
      const summaryRes = await finishCompetition(quickSessionId, userId);
      setQuickSummary(summaryRes);
      setQuickGameState('finished');
    } catch (err: any) {
      console.error('Failed to finish quick battle:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16">
      {/* 1. TOP MODE SWITCHER: RANKED VS QUICK PLAY */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Swords className="w-6 h-6 text-amber-500" />
            {isEn ? 'Arena Competition' : 'สมรภูมิแข่งขันภาษาอังกฤษ'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {competeMode === 'ranked'
              ? (isEn ? 'Official Ranked Mode: Performance changes your Rank Rating (MMR).' : 'โหมดจัดอันดับจริงจัง: ผลการแข่งมีผลต่อ Rank Rating โดยตรง แยกจากแต้ม XP')
              : (isEn ? 'Quick Play: Practice speed vocabulary battle with zero rating risk.' : 'โหมดเล่นเร็ว: ฝึกซ้อมประลองความเร็ว ไม่กระทบต่อ Rank Rating')}
          </p>
        </div>

        {/* Binary Mode Switch */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/40 p-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setCompeteMode('ranked')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              competeMode === 'ranked'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Trophy className="h-4 w-4" />
            Ranked Battle (แรงก์)
          </button>
          <button
            type="button"
            onClick={() => setCompeteMode('quick')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              competeMode === 'quick'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Zap className="h-4 w-4" />
            Quick Play (ซ้อมฟรี)
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* VIEW A: RANKED BATTLE MODE */}
      {/* ========================================================= */}
      {competeMode === 'ranked' && (
        <section className="space-y-6">
          {rankedGameState === 'lobby' && rankedProfile && (
            <RankedLobbyCard
              profile={rankedProfile}
              isSearching={isSearchingRanked}
              searchDurationSec={searchTimerSec}
              onStartMatchmaking={handleStartRankedMatchmaking}
              onCancelMatchmaking={handleCancelRankedMatchmaking}
            />
          )}

          {rankedGameState === 'playing' && rankedPlayer1 && rankedPlayer2 && currentRankedQuestion && (
            <RankedMatchScreen
              player1={rankedPlayer1}
              player2={rankedPlayer2}
              currentQuestion={currentRankedQuestion}
              onSubmitAnswer={handleRankedSubmitAnswer}
              onMatchComplete={handleRankedMatchComplete}
            />
          )}

          {rankedGameState === 'result' && rankedMatchResult && (
            <>
              <RankedResultModal
                result={rankedMatchResult}
                onPlayAgain={() => {
                  setRankedGameState('lobby');
                  handleStartRankedMatchmaking();
                }}
                onReviewMistakes={() => setShowMistakeReview(true)}
              />

              {showMistakeReview && (
                <RankedMistakeReviewModal
                  missedWords={rankedMatchResult.missedWords}
                  onClose={() => setShowMistakeReview(false)}
                />
              )}
            </>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW B: QUICK PLAY MODE (CASUAL WARM-UP) */}
      {/* ========================================================= */}
      {competeMode === 'quick' && (
        <section className="space-y-6">
          {/* Quick Play Lobby Card */}
          {quickGameState === 'idle' && (
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.06] via-background to-teal-500/[0.05] p-6 sm:p-8 text-center shadow-xs">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Zap className="h-7 w-7" />
              </div>
              <h2 className="mt-4 text-2xl font-black text-foreground">
                {isEn ? 'Vocabulary Speed Battle (Quick Play)' : 'ประลองคำศัพท์จับเวลา 4 วินาที (เล่นเร็ว)'}
              </h2>
              <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-muted-foreground">
                {isEn
                  ? 'Practice answering vocabulary under 4 seconds across 5 adaptive CEFR stages. Earn learning XP without affecting your Rank Rating!'
                  : 'ฝึกตอบคำศัพท์ภายใน 4 วินาที ไต่ระดับความยาก Stage 1 (A1) ถึง Stage 5 (C1) รับแต้ม XP ปกติ ไม่กระทบต่อ Rank Rating'}
              </p>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleStartQuickBattle}
                  disabled={isQuickSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-500/25 transition-all hover:brightness-105 active:scale-[0.98]"
                >
                  <Swords className="h-4 w-4" />
                  {isEn ? 'Start Quick Battle' : 'เริ่มประลองความเร็ว (Quick Play)'}
                </button>
              </div>

              <div className="mt-6 border-t border-border/40 pt-4 text-xs text-muted-foreground">
                <span>โหมดนี้มอบแต้ม XP สำหรับกระดาน League แต่จะไม่เปลี่ยนแปลงคะแนน Rank Rating (MMR)</span>
              </div>
            </div>
          )}

          {/* Quick Play Match Active */}
          {(quickGameState === 'playing' || quickGameState === 'feedback') && quickQuestion && (
            <div className="relative mx-auto max-w-2xl rounded-3xl border border-border/60 bg-card p-6 shadow-xl">
              {/* Quick Play Header */}
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    {quickQuestion.stageName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {quickStreak > 1 && (
                    <span className="flex items-center gap-1 text-xs font-black text-rose-500">
                      <Flame className="h-4 w-4 fill-rose-500" />
                      {quickStreak} STREAK
                    </span>
                  )}
                  <span className="text-sm font-black text-amber-500">{quickScore} XP</span>
                </div>
              </div>

              {/* 4s Timer Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-muted-foreground">เวลาตอบ:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    {(quickTimeLeftMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-75"
                    style={{ width: `${(quickTimeLeftMs / 4000) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="mt-6 text-center">
                <h3 className="text-lg font-bold text-foreground">{quickQuestion.prompt}</h3>
                <div className="mt-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  "{quickQuestion.word}"
                </div>
              </div>

              {/* Options */}
              <div className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {quickQuestion.options.map((opt, idx) => {
                  let style = 'border-border/60 bg-card hover:bg-muted/40 text-foreground';
                  if (quickGameState === 'feedback') {
                    if (opt === quickFeedbackResult?.correctAnswerText) {
                      style = 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold';
                    } else if (opt === quickSelectedOption) {
                      style = 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200 line-through';
                    } else {
                      style = 'opacity-40';
                    }
                  }

                  return (
                    <button
                      key={`quick_${idx}`}
                      type="button"
                      disabled={quickGameState === 'feedback'}
                      onClick={() => handleQuickAnswerSubmit(opt)}
                      className={`flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-xs sm:text-sm font-semibold transition-all ${style}`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Play Summary */}
          {quickGameState === 'finished' && quickSummary && (
            <div className="mx-auto max-w-lg rounded-3xl border border-border/60 bg-card p-6 text-center shadow-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <Trophy className="h-7 w-7" />
              </div>
              <h2 className="mt-3 text-xl font-black text-foreground">จบการประลอง Quick Play!</h2>
              <p className="mt-1 text-xs text-muted-foreground">คุณทำคะแนนได้ {quickSummary.finalScore} XP ในแมตช์นี้</p>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground">คะแนนรวม</span>
                  <div className="mt-1 text-sm font-bold text-foreground">{quickSummary.finalScore} XP</div>
                </div>
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground">ความแม่นยำ</span>
                  <div className="mt-1 text-sm font-bold text-foreground">{quickSummary.accuracyPercent}%</div>
                </div>
                <div className="rounded-xl border border-border/40 bg-muted/30 p-3">
                  <span className="text-[10px] text-muted-foreground">คอมโบสูงสุด</span>
                  <div className="mt-1 text-sm font-bold text-foreground">{quickSummary.maxStreak}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleStartQuickBattle}
                  className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white transition-all hover:bg-indigo-700"
                >
                  เล่น Quick Play อีกรอบ
                </button>
                <button
                  type="button"
                  onClick={() => setCompeteMode('ranked')}
                  className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-700 dark:text-amber-300 transition-all hover:bg-amber-500/20"
                >
                  ลองเข้าเล่นโหมดจัดอันดับ (Ranked Battle)
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
