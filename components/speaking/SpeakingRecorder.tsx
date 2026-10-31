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
import { CEFRLevel, SpeakingEvaluationData, SpeakingMode } from "@/lib/speaking/types";

interface SpeakingRecorderProps {
  promptId: string;
  referenceText: string;
  targetCefr: CEFRLevel;
  onEvaluationComplete: (data: SpeakingEvaluationData) => void;
  className?: string;
  mode?: SpeakingMode;
  contextOrQuestion?: string;
  promptTitle?: string;
  targetKeywords?: string[];
  queueProgress?: {
    currentInRound: number;
    totalInRound: number;
    roundNumber: number;
  };
  onNextSentence?: () => void;
}

type RecorderState = "idle" | "recording" | "review" | "processing";

export function SpeakingRecorder({
  promptId,
  referenceText,
  targetCefr,
  onEvaluationComplete,
  className,
  mode = "read_aloud",
  contextOrQuestion,
  promptTitle,
  targetKeywords = [],
  queueProgress,
  onNextSentence,
}: SpeakingRecorderProps) {
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>("");

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

  // Acoustic & Speech Recognition refs
  const speechRecognitionRef = useRef<any>(null);
  const userTranscriptRef = useRef<string>("");
  const acousticStatsRef = useRef({
    sumRms: 0,
    totalFrames: 0,
    silentFrames: 0,
    volumeRms: 0,
    silenceRatio: 0,
    centroidSum: 0,
    centroidSqSum: 0,
    voicedFrames: 0,
    pitchVariance: 0.0,
  });

  const MAX_SECONDS = 90;
  const MIN_SECONDS = 3;

  // Clear timers, animations, and speech recognition on unmount
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
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
    };
  }, [audioUrl]);

  // Real-time canvas waveform visualizer & acoustic energy analyzer
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

      // Acoustic RMS analysis
      let sumSq = 0;
      for (let i = 0; i < bufferLength; i++) {
        const norm = (dataArray[i] - 128) / 128.0;
        sumSq += norm * norm;
      }
      const rms = Math.sqrt(sumSq / bufferLength);

      acousticStatsRef.current.totalFrames += 1;
      acousticStatsRef.current.sumRms += rms;
      if (rms < 0.015) {
        acousticStatsRef.current.silentFrames += 1;
      } else {
        // Compute real-time frequency spectral centroid for pitch dynamics
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(freqData);
        let spectralCentroid = 0;
        let totalMag = 0;
        for (let j = 0; j < freqData.length; j++) {
          spectralCentroid += j * freqData[j];
          totalMag += freqData[j];
        }
        if (totalMag > 0) {
          const centroid = spectralCentroid / totalMag;
          acousticStatsRef.current.centroidSum += centroid;
          acousticStatsRef.current.centroidSqSum += centroid * centroid;
          acousticStatsRef.current.voicedFrames += 1;
        }
      }

      ctx.fillStyle = "rgb(15, 23, 42)"; // Dark slate canvas background
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = rms > 0.02 ? "rgb(16, 185, 129)" : "rgb(100, 116, 139)"; // Green when voice detected, muted gray when silent
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
      setLiveTranscript("");
      userTranscriptRef.current = "";
      acousticStatsRef.current = {
        sumRms: 0,
        totalFrames: 0,
        silentFrames: 0,
        volumeRms: 0,
        silenceRatio: 0,
        centroidSum: 0,
        centroidSqSum: 0,
        voicedFrames: 0,
        pitchVariance: 0.0,
      };
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
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Initialize Web Speech API for real-time speech-to-text
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let transcriptText = "";
            for (let i = 0; i < event.results.length; i++) {
              transcriptText += event.results[i][0].transcript + " ";
            }
            const cleanTranscript = transcriptText.trim();
            userTranscriptRef.current = cleanTranscript;
            setLiveTranscript(cleanTranscript);
          };

          recognition.onerror = () => {};
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {}
      }

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

    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }

    // Finalize acoustic statistics
    const stats = acousticStatsRef.current;
    if (stats.totalFrames > 0) {
      stats.volumeRms = stats.sumRms / stats.totalFrames;
      stats.silenceRatio = stats.silentFrames / stats.totalFrames;
    }
    if (stats.voicedFrames > 1) {
      const meanCentroid = stats.centroidSum / stats.voicedFrames;
      const variance = (stats.centroidSqSum / stats.voicedFrames) - (meanCentroid * meanCentroid);
      stats.pitchVariance = Math.min(1.0, Math.max(0.0, Math.sqrt(Math.max(0, variance)) / 50.0));
    } else {
      stats.pitchVariance = 0.0;
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
    setLiveTranscript("");
    userTranscriptRef.current = "";
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
      const stats = acousticStatsRef.current;
      const formData = new FormData();
      formData.append("audio", audioBlob, "speaking_attempt.webm");
      formData.append("prompt_id", promptId);
      formData.append("reference_text", referenceText);
      formData.append("target_cefr", targetCefr);
      formData.append("duration_sec", elapsedSec.toString());
      formData.append("user_transcript", userTranscriptRef.current.trim());
      formData.append("volume_rms", stats.volumeRms.toFixed(4));
      formData.append("silence_ratio", stats.silenceRatio.toFixed(4));
      formData.append("pitch_variance", stats.pitchVariance.toFixed(4));
      formData.append("mode", mode);

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
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              {mode === "free_speaking" ? "Free Speaking Task" : "Read Aloud Reference"}
            </span>
            {queueProgress && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                ประโยคที่ {queueProgress.currentInRound} / {queueProgress.totalInRound} (รอบที่ {queueProgress.roundNumber})
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            Target CEFR: {targetCefr}
          </span>
        </div>

        {mode === "free_speaking" ? (
          <div className="flex flex-col gap-2 bg-muted/30 p-3.5 rounded-lg border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                โจทย์และสถานการณ์สนทนา:
              </span>
              {onNextSentence && (
                <button
                  type="button"
                  onClick={onNextSentence}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  สุ่มข้อถัดไป
                </button>
              )}
            </div>
            <p className="text-sm text-foreground font-medium leading-relaxed">
              {contextOrQuestion || referenceText}
            </p>
            <details className="mt-1 text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground font-medium select-none">
                💡 ดูตัวอย่างคำตอบแนวทาง (Model Answer)
              </summary>
              <p className="mt-1.5 pl-3 border-l-2 border-primary/40 italic text-foreground/80">
                &ldquo;{referenceText}&rdquo;
              </p>
            </details>
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-muted/30 p-3.5 rounded-lg border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                อ่านออกเสียงตามข้อความนี้อย่างชัดเจน:
              </span>
              {onNextSentence && (
                <button
                  type="button"
                  onClick={onNextSentence}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  ประโยคถัดไป
                </button>
              )}
            </div>
            <p className="text-base text-foreground font-semibold leading-relaxed tracking-wide">
              &ldquo;{referenceText}&rdquo;
            </p>
          </div>
        )}
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

        {/* Live Spoken Text Subtitle */}
        {recorderState === "recording" && liveTranscript && (
          <div className="absolute bottom-2 inset-x-2 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded text-center text-xs text-emerald-300 truncate">
            {liveTranscript}
          </div>
        )}
      </div>

      {/* Spoken Text Feedback during Review */}
      {recorderState === "review" && (
        <div className="mb-4 p-3 rounded-md bg-muted/20 border border-border/30 text-xs">
          <span className="text-muted-foreground font-medium block mb-1">
            ข้อความที่ตรวจพบจากเสียงพูด:
          </span>
          <span className="text-foreground font-medium">
            {userTranscriptRef.current
              ? `"${userTranscriptRef.current}"`
              : "(ไม่พบเสียงพูดที่ตรวจจับได้ หรือพูดไม่ตรงกับภาษาอังกฤษ)"}
          </span>
        </div>
      )}

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
