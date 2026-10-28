"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Send,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CEFRLevel, SpeakingEvaluationData } from "@/lib/speaking/types";

interface SpeakingRecorderProps {
  promptId: string;
  referenceText: string;
  targetCefr: CEFRLevel;
  onEvaluationComplete: (data: SpeakingEvaluationData) => void;
  className?: string;
}

type RecorderState = "idle" | "recording" | "review" | "processing";

export function SpeakingRecorder({
  promptId,
  referenceText,
  targetCefr,
  onEvaluationComplete,
  className,
}: SpeakingRecorderProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_SECONDS = 90;
  const MIN_SECONDS = 3;

  // Clear timers and animation frames on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [audioUrl]);

  // Real-time canvas waveform visualizer
  const drawWaveform = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "rgb(15, 23, 42)"; // Dark slate canvas background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgb(16, 185, 129)"; // Emerald wave
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    render();
  }, []);

  // Request mic & Start Recording
  const startRecording = async () => {
    try {
      setWarningMessage(null);
      setErrorMessage(null);
      audioChunksRef.current = [];

      // 16 kHz Mono audio capture constraint
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      mediaStreamRef.current = stream;

      // Initialize Web Audio API for Live Waveform Visualizer
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Browser MediaRecorder setup
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 32000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(fullBlob);

        const newUrl = URL.createObjectURL(fullBlob);
        setAudioUrl(newUrl);

        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close().catch(() => {});
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100); // chunk every 100ms

      setRecorderState("recording");
      setElapsedSec(0);

      // Start elapsed timer
      let seconds = 0;
      timerIntervalRef.current = setInterval(() => {
        seconds += 1;
        setElapsedSec(seconds);

        if (seconds >= MAX_SECONDS) {
          stopRecording();
        }
      }, 1000);

      // Start waveform animation
      drawWaveform();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ไม่สามารถเข้าถึงไมโครโฟนได้";
      setErrorMessage(`Microphone access error: ${msg}. กรุณาตรวจสอบสิทธิ์ไมโครโฟนบนเบราว์เซอร์`);
    }
  };

  // Stop Recording with AC-1 validation
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // AC-1 Validation: Minimum 3 seconds check
    if (elapsedSec < MIN_SECONDS) {
      setWarningMessage(
        `บันทึกเสียงสั้นเกินไป (${elapsedSec} วินาที) ต้องบันทึกเสียงอย่างน้อย ${MIN_SECONDS} วินาทีขึ้นไปเพื่อการประเมินที่แม่นยำ`
      );
      setRecorderState("idle");
      setAudioBlob(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
      return;
    }

    setRecorderState("review");
  };

  // Reset / Re-record
  const resetRecording = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
    }
    setIsPlayingPreview(false);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setElapsedSec(0);
    setWarningMessage(null);
    setErrorMessage(null);
    setRecorderState("idle");
  };

  // Audio Playback Preview toggle
  const togglePlayPreview = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlayingPreview) {
      audioPlayerRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  // Submit audio to API for AI Speech Evaluation
  const submitForEvaluation = async () => {
    if (!audioBlob) {
      setErrorMessage("ไม่พบไฟล์เสียงที่บันทึก กรุณาลองอัดเสียงใหม่อีกครั้ง");
      return;
    }

    setRecorderState("processing");
    setErrorMessage(null);
    setWarningMessage(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "speaking_attempt.webm");
      formData.append("prompt_id", promptId);
      formData.append("reference_text", referenceText);
      formData.append("target_cefr", targetCefr);
      formData.append("duration_sec", elapsedSec.toString());

      const res = await fetch("/api/speaking/evaluate", {
        method: "POST",
        headers: {
          Authorization: "Bearer mock_user_session_token_cefr_v1",
        },
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json?.error?.message || `การประเมินล้มเหลว (Status: ${res.status})`;
        setErrorMessage(errorMsg);
        setRecorderState("review");
        return;
      }

      // Success
      setRecorderState("idle");
      onEvaluationComplete(json.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "การเชื่อมต่อ API ล้มเหลว";
      setErrorMessage(`Network error: ${msg}`);
      setRecorderState("review");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/40 bg-card p-6 shadow-sm",
        className
      )}
    >
      {/* Header and Guidelines */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Speaking Lab Recorder
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            Target CEFR: {targetCefr}
          </span>
        </div>
        <p className="text-sm text-foreground/90 font-medium leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/30">
          &ldquo;{referenceText}&rdquo;
        </p>
      </div>

      {/* Live Waveform Canvas */}
      <div className="relative overflow-hidden rounded-lg border border-border/40 bg-slate-950 mb-4 h-28 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={600}
          height={112}
          className="w-full h-full object-cover"
        />

        {recorderState === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-[1px]">
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Mic className="w-4 h-4 text-emerald-400" />
              พร้อมบันทึกเสียง (กดปุ่มเริ่มพูดด้านล่าง)
            </p>
          </div>
        )}

        {recorderState === "processing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-xs font-medium text-slate-200">
              กำลังวิเคราะห์การออกเสียงและคำนวณคะแนน CEFR...
            </p>
          </div>
        )}

        {/* Live Recording Indicator */}
        {recorderState === "recording" && (
          <div className="absolute top-2 right-2 flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-2 py-0.5 rounded-md text-red-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            REC {formatTime(elapsedSec)}
          </div>
        )}
      </div>

      {/* Time and Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>ความยาวเสียง: {formatTime(elapsedSec)}</span>
          <span>จำกัด: {formatTime(MAX_SECONDS)} (ขั้นต่ำ 3 วินาที)</span>
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              elapsedSec < MIN_SECONDS
                ? "bg-amber-500"
                : elapsedSec > 80
                ? "bg-red-500"
                : "bg-emerald-500"
            )}
            style={{ width: `${Math.min(100, (elapsedSec / MAX_SECONDS) * 100)}%` }}
          />
        </div>
      </div>

      {/* Warning & Error Alerts */}
      {warningMessage && (
        <div className="mb-4 flex items-center gap-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{warningMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 flex items-center gap-2.5 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Audio Player Preview */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onEnded={() => setIsPlayingPreview(false)}
          className="hidden"
        />
      )}

      {/* Action Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {recorderState === "idle" && (
          <button
            type="button"
            onClick={startRecording}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            <Mic className="w-4 h-4" />
            เริ่มบันทึกเสียง
          </button>
        )}

        {recorderState === "recording" && (
          <button
            type="button"
            onClick={stopRecording}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/20"
          >
            <Square className="w-4 h-4 fill-current" />
            หยุดบันทึก ({formatTime(elapsedSec)})
          </button>
        )}

        {recorderState === "review" && (
          <div className="flex items-center gap-2 w-full">
            <button
              type="button"
              onClick={togglePlayPreview}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground bg-background hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {isPlayingPreview ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  หยุดเล่น
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  ฟังเสียง
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetRecording}
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground bg-background hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              อัดใหม่
            </button>

            <button
              type="button"
              onClick={submitForEvaluation}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              ส่งประเมินผล AI
            </button>
          </div>
        )}

        {recorderState === "processing" && (
          <div className="w-full flex items-center justify-center gap-2 rounded-md bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ประมวลผลการออกเสียง...
          </div>
        )}
      </div>
    </div>
  );
}
