'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AudioService } from '../../services/audioService';

export interface ListeningAudioPlayerProps {
  audioUrl?: string;
  script?: string;
  title?: string;
  accent?: string;
  maxPlays?: number; // Defaults to 2 per Cambridge Exam Guidelines
  onPlayComplete?: () => void;
  onPlayLimitReached?: () => void;
  className?: string;
}

export const ListeningAudioPlayer: React.FC<ListeningAudioPlayerProps> = ({
  audioUrl,
  script,
  title = 'Cambridge Examination Audio Track',
  accent = 'British English (RP)',
  maxPlays = 2,
  onPlayComplete,
  onPlayLimitReached,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setPlayCount((prev) => {
          const updated = prev + 1;
          if (updated >= maxPlays) {
            onPlayLimitReached?.();
          }
          return updated;
        });
        onPlayComplete?.();
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setErrorMessage('ไม่สามารถโหลดไฟล์เสียงได้ กำลังใช้ระบบสำรอง Text-to-Speech');
      };

      return () => {
        audio.pause();
        audio.src = '';
        audioRef.current = null;
      };
    } else {
      if (script) {
        const words = script.trim().split(/\s+/).length;
        setDuration(Math.max(10, Math.round((words / 140) * 60)));
      }
      return () => {
        AudioService.stop();
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
    }
  }, [audioUrl, script, maxPlays, onPlayComplete, onPlayLimitReached]);

  const handleTogglePlay = () => {
    if (playCount >= maxPlays && !isPlaying) {
      setErrorMessage(`โควตาการฟังถูกจำกัดไว้ที่ ${maxPlays} ครั้งตามระเบียบการสอบ Cambridge ESOL`);
      return;
    }

    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      } else {
        AudioService.stop();
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
      setIsPlaying(false);
      return;
    }

    setErrorMessage(null);
    setIsPlaying(true);

    if (audioRef.current && !errorMessage) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
        setErrorMessage('โปรดแตะบนหน้าจอเพื่ออนุญาตให้เล่นเสียง');
      });
    } else if (script) {
      const startTime = Date.now();
      const initialCurrent = currentTime;
      const expectedDurationSec = duration || 30;

      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const newTime = Math.min(expectedDurationSec, initialCurrent + elapsed);
        setCurrentTime(newTime);
        if (newTime >= expectedDurationSec) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      }, 250);

      AudioService.speak(script, {
        rate: 0.95,
        lang: 'en-GB',
        onStart: () => setIsPlaying(true),
        onEnd: () => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setPlayCount((prev) => {
            const updated = prev + 1;
            if (updated >= maxPlays) {
              onPlayLimitReached?.();
            }
            return updated;
          });
          onPlayComplete?.();
        },
        onError: () => {
          setIsPlaying(false);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
          setErrorMessage('ไม่สามารถเล่นเสียงได้บนเบราว์เซอร์นี้');
        },
      });
    } else {
      setIsPlaying(false);
      setErrorMessage('ไม่มีข้อมูลแทร็กเสียงสำหรับข้อนี้');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isLockedOut = playCount >= maxPlays && !isPlaying;

  return (
    <div
      className={`rounded-xl border border-border/70 bg-card p-4 transition-all shadow-xs ${className}`}
      data-testid="listening-audio-player"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-tight">{title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">Accent: {accent}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-border" />
              <span className="text-xs font-mono text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Cambridge Max 2 Plays Quota Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isLockedOut
                ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                : playCount === 1
                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
            }`}
            data-testid="play-count-badge"
          >
            {isLockedOut ? (
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>
              {isLockedOut
                ? `ครบโควตา (${playCount}/${maxPlays} ครั้ง)`
                : `ฟังได้อีก ${maxPlays - playCount} ครั้ง (${playCount}/${maxPlays})`}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3.5 mb-2">
        <div className="w-full h-1.5 rounded-full bg-secondary/80 overflow-hidden relative">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTogglePlay}
            disabled={isLockedOut}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              isLockedOut
                ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                : isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs'
            }`}
            data-testid="audio-play-button"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>หยุดชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {playCount === 0
                    ? 'เริ่มฟังข้อความ (Play 1/2)'
                    : playCount === 1
                    ? 'ฟังซ้ำรอบที่สอง (Play 2/2)'
                    : 'ครบโควตาการฟังแล้ว'}
                </span>
              </>
            )}
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground italic hidden sm:block">
          Cambridge Examination Rule: Candidates hear each track twice only.
        </p>
      </div>

      {/* Error or Quota Warning */}
      {errorMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-md border border-rose-500/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default ListeningAudioPlayer;
