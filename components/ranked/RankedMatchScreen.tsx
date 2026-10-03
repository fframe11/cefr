'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ClientRankedQuestion,
  RankedMatchPlayer,
  QuestionSubmissionResult,
} from '@/types/ranked';
import { RankedTierBadge } from './RankedTierBadge';
import { GlovaAvatarWithFrame } from '../gamification/RankFrame';
import { Flame, Clock, Zap, CheckCircle2, XCircle } from 'lucide-react';

interface RankedMatchScreenProps {
  player1: RankedMatchPlayer;
  player2: RankedMatchPlayer;
  currentQuestion: ClientRankedQuestion;
  onSubmitAnswer: (chosenIndex: number) => Promise<QuestionSubmissionResult | null>;
  onMatchComplete: () => void;
}

export const RankedMatchScreen: React.FC<RankedMatchScreenProps> = ({
  player1,
  player2,
  currentQuestion,
  onSubmitAnswer,
  onMatchComplete,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(4.0);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<QuestionSubmissionResult | null>(null);
  const [liveP1Score, setLiveP1Score] = useState<number>(player1.score);
  const [liveP2Score, setLiveP2Score] = useState<number>(player2.score);
  const [liveP1Streak, setLiveP1Streak] = useState<number>(player1.streak);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(4.0);
    setHasAnswered(false);
    setSelectedOption(null);
    setSubmissionResult(null);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 4.0 - elapsedSec);
      setTimeLeft(parseFloat(remaining.toFixed(1)));

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimeout();
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion.id]);

  const handleTimeout = async () => {
    if (hasAnswered) return;
    setHasAnswered(true);
    setSelectedOption(-1); // Unanswered / timeout

    const res = await onSubmitAnswer(-1);
    if (res) {
      handleSubmissionFeedback(res);
    }
  };

  const handleSelect = async (index: number) => {
    if (hasAnswered) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setHasAnswered(true);
    setSelectedOption(index);

    const res = await onSubmitAnswer(index);
    if (res) {
      handleSubmissionFeedback(res);
    }
  };

  const handleSubmissionFeedback = (res: QuestionSubmissionResult) => {
    setSubmissionResult(res);
    setLiveP1Score(res.playerScore);
    setLiveP2Score(res.opponentScore);
    setLiveP1Streak(res.currentStreak);

    // Brief 800ms reveal before moving to next question or ending
    setTimeout(() => {
      if (res.isMatchFinished) {
        onMatchComplete();
      }
    }, 850);
  };

  // Timer color transition
  let timerColor = 'from-emerald-500 to-teal-500';
  let timerTextColor = 'text-emerald-600 dark:text-emerald-400';
  if (timeLeft <= 1.2) {
    timerColor = 'from-rose-500 to-red-600';
    timerTextColor = 'text-rose-600 dark:text-rose-400 animate-pulse';
  } else if (timeLeft <= 2.5) {
    timerColor = 'from-amber-500 to-orange-500';
    timerTextColor = 'text-amber-600 dark:text-amber-400';
  }

  const timerPercent = (timeLeft / 4.0) * 100;

  return (
    <div className="relative mx-auto max-w-3xl rounded-3xl border border-border/50 bg-card p-6 shadow-xl">
      {/* 1v1 VS Header Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-5">
        {/* Player 1 (You) */}
        <div className="flex items-center gap-3">
          <GlovaAvatarWithFrame
            avatarUrl={player1.avatar}
            username={player1.username}
            frameId={player1.rankFrame as any}
            size="md"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{player1.username}</span>
              {liveP1Streak > 1 && (
                <span className="inline-flex items-center gap-0.5 text-xs font-black text-rose-500">
                  <Flame className="h-3 w-3 fill-rose-500" />
                  {liveP1Streak}
                </span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2">
              <RankedTierBadge tier={player1.tier} division={player1.division} size="xs" />
              <span className="text-xs font-semibold text-muted-foreground">{player1.rating} MMR</span>
            </div>
            <div className="mt-1 text-sm font-black text-amber-500">{liveP1Score.toLocaleString()} PTS</div>
          </div>
        </div>

        {/* VS Center Badge */}
        <div className="flex flex-col items-center">
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400 border border-amber-500/20">
            VS
          </span>
          <span className="mt-1 text-[11px] font-semibold text-muted-foreground">
            ข้อ {currentQuestion.questionIndex + 1}/{currentQuestion.totalQuestions}
          </span>
        </div>

        {/* Player 2 (Challenger) */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-bold text-foreground">{player2.username}</span>
            </div>
            <div className="mt-0.5 flex items-center justify-end gap-2">
              <span className="text-xs font-semibold text-muted-foreground">{player2.rating} MMR</span>
              <RankedTierBadge tier={player2.tier} division={player2.division} size="xs" />
            </div>
            <div className="mt-1 text-sm font-black text-[#FA5D5D]">{liveP2Score.toLocaleString()} PTS</div>
          </div>
          <GlovaAvatarWithFrame
            avatarUrl={player2.avatar}
            username={player2.username}
            frameId={player2.rankFrame as any}
            size="md"
          />
        </div>
      </div>

      {/* 4.0-Second Timer Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>เวลาตอบคำถาม</span>
          </div>
          <span className={`text-base font-black ${timerTextColor}`}>{timeLeft.toFixed(1)}s</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted/60 p-0.5">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-75`}
            style={{ width: `${timerPercent}%` }}
          />
        </div>
      </div>

      {/* Question Container */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#FA5D5D]/10 px-3 py-1 text-xs font-bold text-[#FA5D5D] dark:text-[#FA5D5D]">
          <Zap className="h-3 w-3" />
          ระดับ CEFR {currentQuestion.cefrLevel}
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
          {currentQuestion.prompt}
        </h2>
        <div className="mt-2 text-2xl font-black text-amber-500 sm:text-3xl tracking-wide">
          "{currentQuestion.targetWord}"
        </div>
      </div>

      {/* 4 Interactive Option Buttons */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {currentQuestion.options.map((option, idx) => {
          let btnStyle = 'border-border/60 bg-card hover:border-amber-500/50 hover:bg-amber-500/[0.04] text-foreground';

          if (hasAnswered) {
            if (submissionResult) {
              if (idx === submissionResult.correctIndex) {
                // Correct option
                btnStyle = 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 font-bold';
              } else if (idx === selectedOption) {
                // User picked wrong option
                btnStyle = 'border-rose-500 bg-rose-500/15 text-rose-800 dark:text-rose-200 line-through';
              } else {
                btnStyle = 'opacity-40 border-border/40';
              }
            } else if (idx === selectedOption) {
              btnStyle = 'border-amber-500 bg-amber-500/20 text-foreground';
            }
          }

          return (
            <button
              key={`${currentQuestion.id}_opt_${idx}`}
              type="button"
              disabled={hasAnswered}
              onClick={() => handleSelect(idx)}
              className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left font-medium transition-all active:scale-[0.98] ${btnStyle}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-muted/60 text-xs font-bold text-muted-foreground">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-semibold">{option}</span>
              </div>

              {hasAnswered && submissionResult && (
                <div>
                  {idx === submissionResult.correctIndex && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  )}
                  {idx === selectedOption && idx !== submissionResult.correctIndex && (
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Opponent Realtime Reaction Tag */}
      {submissionResult && (
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
          <span>{player2.username}: </span>
          {submissionResult.opponentChoseCorrect ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ตอบถูก ({((4000 - submissionResult.opponentResponseTimeMs) / 1000).toFixed(1)}s)
            </span>
          ) : (
            <span className="text-rose-500 flex items-center gap-1">
              <XCircle className="h-3.5 w-3.5" />
              ตอบผิด
            </span>
          )}
        </div>
      )}
    </div>
  );
};
