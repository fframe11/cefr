'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Swords,
  Flame,
  Clock,
  Trophy,
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Bot,
  User,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  BattleOpponent,
  ClientQuestionNext,
  MatchFoundEvent,
  RoundEndedEvent,
  ScoreTickEvent,
  SpeedBattleState,
} from '@/lib/ranked/speed-battle-types';
import { cn } from '@/lib/utils';

interface SpeedBattleArenaProps {
  currentUserId?: string;
  currentUsername?: string;
  currentUserElo?: number;
}

export const SpeedBattleArena: React.FC<SpeedBattleArenaProps> = ({
  currentUserId = 'usr_guest_speed',
  currentUsername = 'You',
  currentUserElo = 1150,
}) => {
  const [gameState, setGameState] = useState<SpeedBattleState>('LOBBY');
  const [matchmakingSeconds, setMatchmakingSeconds] = useState<number>(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(3);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState<number>(60);
  const [roomId, setRoomId] = useState<string>('');
  const [opponent, setOpponent] = useState<BattleOpponent | null>(null);

  // Active question & answer state
  const [currentQuestion, setCurrentQuestion] = useState<ClientQuestionNext | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState<boolean>(false);
  const [answerFeedback, setAnswerFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

  // Live Scores
  const [myScore, setMyScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [myStreak, setMyStreak] = useState<number>(0);
  const [opponentStreak, setOpponentStreak] = useState<number>(0);

  // Match Summary & Rewards
  const [matchResult, setMatchResult] = useState<RoundEndedEvent | null>(null);

  // Timers
  const matchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const matchmakingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch next question from server
  const fetchNextQuestion = useCallback(async (rId: string) => {
    try {
      const res = await fetch(`/api/ranked/speed-battle/question?roomId=${rId}&userId=${currentUserId}`);
      const data = await res.json();
      if (data.success && data.question) {
        setCurrentQuestion(data.question);
        setSelectedOption(null);
        setHasAnswered(false);
        setAnswerFeedback(null);
        setQuestionStartTime(Date.now());
      } else {
        // Recovery unlock: if question fetch returns non-success, reset lock
        console.warn('[SpeedBattle] Question fetch unsuccessful, unlocking UI');
        setHasAnswered(false);
        setSelectedOption(null);
        setAnswerFeedback(null);
      }
    } catch (err) {
      console.error('[SpeedBattle] Failed to fetch question:', err);
      setHasAnswered(false);
      setSelectedOption(null);
      setAnswerFeedback(null);
    }
  }, [currentUserId]);

  // Handle Matchmaking Search
  const handleStartMatchmaking = async () => {
    setGameState('MATCHMAKING');
    setMatchmakingSeconds(0);
    setMyScore(0);
    setOpponentScore(0);
    setMyStreak(0);
    setOpponentStreak(0);
    setMatchResult(null);

    try {
      const res = await fetch('/api/ranked/speed-battle/matchmake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enqueue',
          userId: currentUserId,
          username: currentUsername,
          elo: currentUserElo,
        }),
      });
      const data = await res.json();

      if (data.status === 'MATCH_FOUND' && data.matchEvent) {
        startMatchFound(data.matchEvent);
      } else {
        // Start polling queue
        let waitSec = 0;
        matchmakingIntervalRef.current = setInterval(async () => {
          waitSec += 1;
          setMatchmakingSeconds(waitSec);

          const pollRes = await fetch('/api/ranked/speed-battle/matchmake', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'poll',
              userId: currentUserId,
            }),
          });
          const pollData = await pollRes.json();

          if (pollData.status === 'MATCH_FOUND' && pollData.matchEvent) {
            if (matchmakingIntervalRef.current) clearInterval(matchmakingIntervalRef.current);
            startMatchFound(pollData.matchEvent);
          }
        }, 1000);
      }
    } catch (err) {
      console.error('[SpeedBattle] Enqueue failed:', err);
      setGameState('LOBBY');
    }
  };

  const handleCancelMatchmaking = async () => {
    if (matchmakingIntervalRef.current) clearInterval(matchmakingIntervalRef.current);
    try {
      await fetch('/api/ranked/speed-battle/matchmake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', userId: currentUserId }),
      });
    } finally {
      setGameState('LOBBY');
    }
  };

  // Match Found Transition -> 3s Countdown -> Round Active
  const startMatchFound = (matchEvent: MatchFoundEvent) => {
    setRoomId(matchEvent.room_id);
    setOpponent(matchEvent.opponent);
    setGameState('COUNTDOWN');
    setCountdownSeconds(3);

    let count = 3;
    const countTimer = setInterval(() => {
      count -= 1;
      setCountdownSeconds(count);
      if (count <= 0) {
        clearInterval(countTimer);
        startRound(matchEvent.room_id);
      }
    }, 1000);
  };

  // Round Active 60s
  const startRound = (rId: string) => {
    setGameState('ROUND_ACTIVE');
    setRoundSecondsLeft(60);
    fetchNextQuestion(rId);

    // 60-Second Server-Synced Countdown
    matchTimerRef.current = setInterval(() => {
      setRoundSecondsLeft((prev) => {
        if (prev <= 1) {
          if (matchTimerRef.current) clearInterval(matchTimerRef.current);
          handleFinishMatch(rId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Heartbeat Ping & Disconnect Watchdog
    heartbeatTimerRef.current = setInterval(async () => {
      try {
        const beatRes = await fetch('/api/ranked/speed-battle/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomId: rId, userId: currentUserId }),
        });
        const beatData = await beatRes.json();

        if (beatData.isWalkoverWin) {
          if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
          if (matchTimerRef.current) clearInterval(matchTimerRef.current);
          handleFinishMatch(rId);
        } else if (beatData.scores) {
          setMyScore(beatData.scores.player_1);
          setOpponentScore(beatData.scores.player_2);
        }
      } catch (err) {
        console.warn('[SpeedBattle] Heartbeat sync ping failed:', err);
      }
    }, 2000);
  };

  // Submit Answer
  const handleSelectOption = async (optionIndex: number) => {
    if (hasAnswered || !currentQuestion || gameState !== 'ROUND_ACTIVE') return;

    setHasAnswered(true);
    setSelectedOption(optionIndex);
    const responseTimeMs = Date.now() - questionStartTime;

    try {
      const res = await fetch('/api/ranked/speed-battle/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId,
          userId: currentUserId,
          questionIndex: currentQuestion.question_index,
          selectedOptionIndex: optionIndex,
          responseTimeMs,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setAnswerFeedback(data.isCorrect ? 'correct' : 'wrong');
        const scoreTick: ScoreTickEvent = data.scoreTick;
        setMyScore(scoreTick.scores.player_1);
        setOpponentScore(scoreTick.scores.player_2);
        setMyStreak(scoreTick.streak.player_1);
        setOpponentStreak(scoreTick.streak.player_2);

        // Fetch next question after brief feedback delay (300ms)
        setTimeout(() => {
          fetchNextQuestion(roomId);
        }, 350);
      } else {
        console.warn('[SpeedBattle] Submit rejected, unlocking UI');
        setTimeout(() => fetchNextQuestion(roomId), 300);
      }
    } catch (err) {
      console.error('[SpeedBattle] Answer submission failed:', err);
      setTimeout(() => fetchNextQuestion(roomId), 300);
    } finally {
      // Safety unlock watchdog: guarantees UI never permanently freezes
      setTimeout(() => {
        setHasAnswered((prev) => {
          if (prev) {
            setSelectedOption(null);
            setAnswerFeedback(null);
            return false;
          }
          return prev;
        });
      }, 1000);
    }
  };

  // Finalize Match & Show Results
  const handleFinishMatch = async (rId: string) => {
    if (matchTimerRef.current) clearInterval(matchTimerRef.current);
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);

    try {
      const res = await fetch('/api/ranked/speed-battle/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: rId }),
      });
      const data = await res.json();
      if (data.success && data.event) {
        setMatchResult(data.event);
        setGameState('ROUND_ENDED');
      }
    } catch (err) {
      console.error('[SpeedBattle] Finalize match failed:', err);
      setGameState('LOBBY');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (matchTimerRef.current) clearInterval(matchTimerRef.current);
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      if (matchmakingIntervalRef.current) clearInterval(matchmakingIntervalRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      {/* ================= STATE 1: LOBBY ================= */}
      {gameState === 'LOBBY' && (
        <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          {/* Header Profile & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
                <Swords className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-foreground">Speed Battle Studio</h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    60s Realtime
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Synchronous 1v1 Vocabulary Sprint • Oxford 3860 Academic Lexicon
                </p>
              </div>
            </div>

            {/* Elo Card */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-muted/60 border border-border/40">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Rating (Elo)
                </div>
                <div className="text-base font-bold text-foreground">
                  {currentUserElo} <span className="text-xs text-emerald-500 font-semibold">Tier Gold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rules & Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm">
                <Clock className="w-4 h-4" />
                <span>60 วินาที ตัดสิน</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ตอบคำศัพท์ให้ได้มากที่สุดใน 60 วินาที ทุกข้อมีผลต่อการแย่งชิงอันดับ Elo
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/30 p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-sm">
                <Flame className="w-4 h-4" />
                <span>Combo Streaks</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ตอบถูกต่อเนื่องรับคะแนนพิเศษ Combo Bonus สูงสุด +10 คะแนนต่อข้อ
              </p>
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/30 p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-indigo-500 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>Server-Authoritative</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                คำถามส่งทีละข้อ ไร้เฉลยรั่วไหล พร้อมระบบ Walkover หากคู่แข่งหลุดเกิน 5 วิ
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              ⚡ Matchmaking อัตโนมัติ (หากไม่มีผู้เล่นใน 10 วินาที จะสลับดวลกับ AI Bot ทันที)
            </div>
            <button
              onClick={handleStartMatchmaking}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4" />
              <span>ค้นหาคู่ประลอง (Start Match)</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= STATE 2: MATCHMAKING ================= */}
      {gameState === 'MATCHMAKING' && (
        <div className="rounded-2xl border border-border/40 bg-card p-10 sm:p-14 shadow-sm flex flex-col items-center justify-center text-center gap-6">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Swords className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold text-foreground">กำลังค้นหาคู่ประลองที่เหมาะสม...</h3>
            <p className="text-xs text-muted-foreground">
              ค้นหาคู่แข่งในระดับ Elo ใกล้เคียง ({currentUserElo} ± 120 MMR)
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/60 border border-border/40 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span>รอมาแล้ว: 00:{matchmakingSeconds.toString().padStart(2, '0')}</span>
            <span className="text-muted-foreground">/ 10s (Bot Fallback)</span>
          </div>

          <button
            onClick={handleCancelMatchmaking}
            className="px-5 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
          >
            ยกเลิกการค้นหา
          </button>
        </div>
      )}

      {/* ================= STATE 3: COUNTDOWN ================= */}
      {gameState === 'COUNTDOWN' && opponent && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 sm:p-12 shadow-sm flex flex-col items-center justify-center text-center gap-8">
          <div className="flex items-center justify-center gap-8 sm:gap-14 w-full">
            {/* Player 1 */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center text-indigo-600">
                <User className="w-8 h-8" />
              </div>
              <div className="text-sm font-bold text-foreground">{currentUsername}</div>
              <div className="text-xs text-muted-foreground font-mono">{currentUserElo} Elo</div>
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-2xl font-black text-rose-500 tracking-widest animate-bounce">
                VS
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">READY</span>
            </div>

            {/* Player 2 */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-600">
                {opponent.is_bot ? <Bot className="w-8 h-8" /> : <User className="w-8 h-8" />}
              </div>
              <div className="text-sm font-bold text-foreground flex items-center gap-1">
                <span>{opponent.username}</span>
                {opponent.is_bot && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-semibold">
                    BOT
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground font-mono">{opponent.elo} Elo</div>
            </div>
          </div>

          {/* Big Countdown Number */}
          <div className="flex flex-col items-center gap-2">
            <div className="text-6xl sm:text-7xl font-black text-foreground animate-ping duration-700">
              {countdownSeconds > 0 ? countdownSeconds : 'BATTLE!'}
            </div>
            <div className="text-xs text-muted-foreground font-medium">รอบการแข่งขันกำลังจะเริ่มขึ้น...</div>
          </div>
        </div>
      )}

      {/* ================= STATE 4: ROUND ACTIVE ================= */}
      {gameState === 'ROUND_ACTIVE' && opponent && (
        <div className="flex flex-col gap-6">
          {/* Top Live Dual Score Bar */}
          <div className="rounded-2xl border border-border/40 bg-card p-4 sm:p-6 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              {/* You */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  P1
                </div>
                <div>
                  <span className="text-foreground">{currentUsername}</span>
                  {myStreak >= 2 && (
                    <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" /> {myStreak}x
                    </span>
                  )}
                </div>
              </div>

              {/* Timer Pill */}
              <div
                className={cn(
                  'px-3.5 py-1 rounded-full font-mono font-bold text-xs flex items-center gap-1.5 border',
                  roundSecondsLeft <= 10
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse'
                    : 'bg-muted/60 text-foreground border-border/40'
                )}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>00:{roundSecondsLeft.toString().padStart(2, '0')}</span>
              </div>

              {/* Opponent */}
              <div className="flex items-center gap-2">
                <div>
                  {opponentStreak >= 2 && (
                    <span className="mr-2 inline-flex items-center gap-0.5 text-xs text-amber-500 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" /> {opponentStreak}x
                    </span>
                  )}
                  <span className="text-foreground">{opponent.username}</span>
                </div>
                <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs">
                  {opponent.is_bot ? 'BOT' : 'P2'}
                </div>
              </div>
            </div>

            {/* Score Numbers & Tug-of-war Bar */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between font-mono font-black text-2xl">
                <span className="text-indigo-600">{myScore}</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-sans">
                  SCORE RACE
                </span>
                <span className="text-rose-600">{opponentScore}</span>
              </div>

              {/* Dynamic Score Bar (<200ms latency sync) */}
              <div className="h-3 w-full rounded-full bg-muted/60 overflow-hidden flex border border-border/40">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-200"
                  style={{
                    width: `${
                      myScore + opponentScore === 0
                        ? 50
                        : Math.max(10, Math.min(90, (myScore / (myScore + opponentScore)) * 100))
                    }%`,
                  }}
                />
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-rose-600 transition-all duration-200 flex-1"
                />
              </div>
            </div>
          </div>

          {/* Active Question Card */}
          {currentQuestion && (
            <div className="rounded-2xl border border-border/40 bg-card p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  QUESTION #{currentQuestion.question_index}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Oxford Academic
                </span>
              </div>

              <div className="flex flex-col items-center justify-center text-center py-4">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                  {currentQuestion.word}
                </h3>
                <p className="text-xs text-muted-foreground">
                  เลือกความหมายภาษาไทยที่ถูกต้องเร็วที่สุดเพื่อรับโบนัสสปีด
                </p>
              </div>

              {/* 4 Interactive Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = isSelected && answerFeedback === 'correct';
                  const isWrong = isSelected && answerFeedback === 'wrong';

                  return (
                    <button
                      key={idx}
                      disabled={hasAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={cn(
                        'px-5 py-4 rounded-xl text-sm font-medium border text-left transition-all flex items-center justify-between gap-3',
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                            : isWrong
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20'
                            : 'bg-primary/10 border-primary text-foreground'
                          : 'bg-muted/30 border-border/40 text-foreground hover:bg-muted/70 hover:border-border active:scale-[0.99]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-md bg-muted/80 text-muted-foreground flex items-center justify-center text-xs font-bold">
                          {['A', 'B', 'C', 'D'][idx]}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isSelected && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {isSelected && isWrong && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= STATE 5: ROUND ENDED & REWARDS ================= */}
      {gameState === 'ROUND_ENDED' && matchResult && opponent && (
        <div className="rounded-2xl border border-border/40 bg-card p-8 sm:p-10 shadow-sm flex flex-col items-center text-center gap-6">
          {/* Victory / Defeat Header */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                'h-18 w-18 p-4 rounded-2xl flex items-center justify-center shadow-lg',
                matchResult.winner_id === currentUserId
                  ? 'bg-gradient-to-tr from-amber-500 to-emerald-500 text-white'
                  : matchResult.winner_id === null
                  ? 'bg-slate-500 text-white'
                  : 'bg-rose-500 text-white'
              )}
            >
              <Trophy className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-black text-foreground">
              {matchResult.winner_id === currentUserId
                ? matchResult.is_walkover
                  ? 'WALKOVER VICTORY! 🎉'
                  : 'VICTORY! 🎉'
                : matchResult.winner_id === null
                ? 'DRAW GAME! 🤝'
                : 'DEFEAT'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {matchResult.is_walkover
                ? 'คู่แข่งตัดการเชื่อมต่อไปเกิน 5 วินาที ระบบตัดสินให้คุณชนะแบบ Walkover'
                : 'การแข่งขันสปีด 60 วินาทีสิ้นสุดลง'}
            </p>
          </div>

          {/* Scores Comparison */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-md py-2">
            <div className="rounded-xl border border-border/40 bg-muted/40 p-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">{currentUsername}</span>
              <span className="text-3xl font-extrabold text-indigo-600 font-mono">
                {matchResult.final_scores.player_1}
              </span>
            </div>
            <div className="rounded-xl border border-border/40 bg-muted/40 p-4 flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">{opponent.username}</span>
              <span className="text-3xl font-extrabold text-rose-600 font-mono">
                {matchResult.final_scores.player_2}
              </span>
            </div>
          </div>

          {/* Elo Adjustment Card (AC-4 Parity) */}
          <div className="w-full max-w-md rounded-xl border border-border/40 bg-muted/20 p-4 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs font-semibold text-muted-foreground">ELO RATING UPDATE</div>
              <div className="text-sm font-bold text-foreground">
                {matchResult.elo_updates.player1_old_elo} →{' '}
                <span className="text-primary">{matchResult.elo_updates.player1_new_elo}</span>
              </div>
            </div>

            <div
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-bold font-mono',
                matchResult.elo_updates.player1_delta >= 0
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              )}
            >
              {matchResult.elo_updates.player1_delta >= 0 ? '+' : ''}
              {matchResult.elo_updates.player1_delta} Elo
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md pt-2">
            <button
              onClick={handleStartMatchmaking}
              className="w-full sm:flex-1 px-6 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground shadow hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ประลองอีกครั้ง</span>
            </button>
            <button
              onClick={() => setGameState('LOBBY')}
              className="w-full sm:flex-1 px-6 py-3 rounded-xl font-medium text-sm border border-border/40 text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
            >
              <span>กลับสู่ล็อบบี้</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
