import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, Gauge, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AudioService } from '../../services/audioService';

interface AudioPlayerProps {
  script: string;
  title?: string;
  accent?: string;
  maxReplays?: number;
  onAudioComplete?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  script,
  title = 'Listening Audio Track',
  accent = 'British English',
  maxReplays = 3,
  onAudioComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [replaysUsed, setReplaysUsed] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      AudioService.stop();
    };
  }, [script]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      AudioService.stop();
      setIsPlaying(false);
      return;
    }

    if (replaysUsed >= maxReplays) {
      setErrorMsg(`ครบโควตาการฟัง ${maxReplays} ครั้งแล้ว (ตามกติกาข้อสอบเคมบริดจ์)`);
      return;
    }

    setErrorMsg(null);
    setIsPlaying(true);
    setHasPlayed(true);

    AudioService.speak(script, {
      rate: speed * 0.95,
      lang: 'en-GB',
      onStart: () => setIsPlaying(true),
      onEnd: () => {
        setIsPlaying(false);
        setReplaysUsed((prev) => prev + 1);
        onAudioComplete?.();
      },
      onError: (err) => {
        setIsPlaying(false);
        setErrorMsg('ไม่สามารถเล่นเสียงได้บนเบราว์เซอร์นี้ กรุณาเปิดเสียงของอุปกรณ์');
      },
    });
  };

  const handleSpeedCycle = () => {
    const speeds = [0.75, 1.0, 1.25];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setSpeed(newSpeed);

    if (isPlaying) {
      AudioService.stop();
      setIsPlaying(false);
    }
  };

  const handleResetReplay = () => {
    AudioService.stop();
    setIsPlaying(false);
    setReplaysUsed(0);
    setErrorMsg(null);
  };

  return (
    <div className="w-full rounded-xl bg-card border border-border/60 p-4 transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-primary shrink-0" />
            <h4 className="text-sm font-semibold text-foreground truncate">{title}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">สำเนียง: {accent}</p>
        </div>

        {/* Replay Counter Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border font-medium">
            ฟังแล้ว {replaysUsed}/{maxReplays} ครั้ง
          </span>
          {replaysUsed > 0 && (
            <button
              onClick={handleResetReplay}
              className="text-xs text-muted-foreground hover:text-foreground p-1 touch-target rounded transition-colors"
              title="รีเซ็ตจำนวนครั้งที่ฟัง"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={replaysUsed >= maxReplays && !isPlaying}
            className={`touch-target px-4 py-2 rounded-lg font-medium text-xs sm:text-sm flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-amber-950 hover:bg-amber-400'
                : replaysUsed >= maxReplays
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>หยุดชั่วคราว</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{hasPlayed ? 'ฟังอีกครั้ง' : 'กดเพื่อเริ่มฟัง'}</span>
              </>
            )}
          </button>

          {/* Speed Toggle Button */}
          <button
            onClick={handleSpeedCycle}
            className="touch-target px-2.5 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-medium text-foreground flex items-center gap-1.5 transition-colors"
            title="ปรับความเร็วการเล่นเสียง"
          >
            <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{speed}x</span>
          </button>
        </div>

        {/* Audio Waveform Simulator */}
        <div className="flex items-center gap-1">
          {[16, 24, 12, 32, 20, 28, 14, 22].map((height, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-200 ${
                isPlaying
                  ? 'bg-primary animate-pulse'
                  : 'bg-muted-foreground/30'
              }`}
              style={{
                height: isPlaying ? `${Math.max(8, (height * (i % 2 === 0 ? 1 : 0.7)))}px` : '8px',
                animationDelay: `${i * 120}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Error Message if any */}
      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
