'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SPEAKING_BANK } from '../../data/speakingBank';
import { SpeakingPrompt } from '../../types';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Clock,
  HelpCircle,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useToast } from '../common/Toast';
import { getSpeakingPrompts, mapSpeakingDtoToPrompt } from '../../lib/api/content/speaking';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import {
  GlovaSectionHeader,
  GlovaLevelBadge,
  GlovaButton,
  GlovaCard,
  GlovaBadge,
} from '../ui';
import { useTranslation } from '../../i18n';

export const SpeakingView: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>(SPEAKING_BANK);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(SPEAKING_BANK[0]?.id || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [recognitionObj, setRecognitionObj] = useState<any>(null);
  const [detectedPhrases, setDetectedPhrases] = useState<string[]>([]);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch speaking prompts from API
  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSpeakingPrompts({ page: 1, limit: 50 });
      if (res && res.prompts && res.prompts.length > 0) {
        const mapped = res.prompts.map(mapSpeakingDtoToPrompt);
        setPrompts(mapped);
        if (!selectedPromptId || !mapped.some((p) => p.id === selectedPromptId)) {
          setSelectedPromptId(mapped[0].id);
        }
      } else {
        setPrompts(SPEAKING_BANK);
      }
    } catch (err: any) {
      console.warn('[SpeakingView] API fetch failed, falling back to static speaking bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดหัวข้อพูดจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setPrompts(SPEAKING_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedPromptId]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const currentPrompt = prompts.find((p) => p.id === selectedPromptId) || prompts[0] || SPEAKING_BANK[0];

  // Timer logic for recording
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (recognitionObj) {
        recognitionObj.stop();
      }
      AudioService.stop();
    };
  }, [recognitionObj]);

  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionObj) {
        recognitionObj.stop();
      }
      setIsRecording(false);

      // Check detected target phrases
      if (transcript.length > 3 && currentPrompt.targetPhrases.length > 0) {
        const wordsSpoken = transcript.toLowerCase();
        const matched = currentPrompt.targetPhrases.filter((phrase) =>
          wordsSpoken.includes(phrase.toLowerCase())
        );
        setDetectedPhrases(matched);
      }
      showToast('บันทึกเสียงเสร็จสิ้น', 'บันทึกคำตอบแล้วเพื่อการฝึกฝน', 'success');
      return;
    }

    if (!AudioService.isSpeechRecognitionSupported()) {
      showToast(
        'เบราว์เซอร์นี้ยังไม่รองรับ Web Speech API',
        'แนะนำให้ใช้งานบน Google Chrome หรือ Microsoft Edge เพื่อตรวจจับคำพูดอัตโนมัติ',
        'info'
      );
      // Still allow recording timer mode
      setIsRecording(true);
      return;
    }

    setTranscript('');
    setDetectedPhrases([]);
    const recognition = AudioService.createSpeechRecognizer({
      onResult: (text: string) => {
        setTranscript(text);
      },
      onError: (err: string) => {
        console.warn('[SpeakingView] Speech recognition error:', err);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (recognition) {
      try {
        recognition.start();
        setRecognitionObj(recognition);
        setIsRecording(true);
      } catch (err) {
        console.warn('[SpeakingView] Could not start speech recognition:', err);
        setIsRecording(true);
      }
    } else {
      setIsRecording(true);
    }
  };

  const handlePlayModel = () => {
    if (isPlayingModel) {
      AudioService.stop();
      setIsPlayingModel(false);
      return;
    }

    if (currentPrompt.modelAnswer) {
      setIsPlayingModel(true);
      AudioService.speak(currentPrompt.modelAnswer, {
        lang: 'en-GB',
        rate: 0.9,
        onEnd: () => setIsPlayingModel(false),
      });
    }
  };

  const handleReset = () => {
    if (isRecording && recognitionObj) {
      recognitionObj.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
    setTranscript('');
    setDetectedPhrases([]);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GlovaSectionHeader
          eyebrow="SPEAKING LAB"
          title="การพูดและออกเสียงเชิงโต้ตอบ"
          description="ฝึกพูดตอบคำถามตามเกณฑ์ความคล่องแคล่วและการใช้คำศัพท์ พร้อมบันทึกเสียงและตรวจจับวลีเป้าหมาย"
        />

        {currentPrompt && (
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <GlovaLevelBadge level={currentPrompt.cefrLevel} size="md" />
            <GlovaBadge variant="secondary" size="sm">
              Part {currentPrompt.part}
            </GlovaBadge>
            <GlovaBadge variant="outline" size="sm">
              {currentPrompt.targetExam}
            </GlovaBadge>
          </div>
        )}
      </div>

      {/* Topic Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {prompts.map((p) => {
          const isSelected = p.id === currentPrompt?.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPromptId(p.id);
                handleReset();
                setShowModelAnswer(false);
              }}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-secondary/40'
              }`}
            >
              <GlovaLevelBadge level={p.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && prompts.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="กำลังโหลดหัวข้อการพูด..." />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchPrompts} />
      )}

      {/* 2. Main Learning Activity: Prompt & Recording Station */}
      {currentPrompt && (
        <div className="space-y-6">
          {/* Prompt Guidelines Card */}
          <GlovaCard elevation="subtle" className="p-5 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
                <span className="font-semibold text-sm sm:text-base text-foreground">
                  {currentPrompt.title}
                </span>
              </div>

              {/* Sample Audio Button */}
              {currentPrompt.modelAnswer && (
                <GlovaButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />}
                  onClick={handlePlayModel}
                >
                  {isPlayingModel ? 'กำลังเล่นตัวอย่าง...' : 'ฟังตัวอย่างคำตอบ'}
                </GlovaButton>
              )}
            </div>

            {/* Prompt Description */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-1.5">
              <p className="text-xs sm:text-sm text-foreground font-medium leading-relaxed whitespace-pre-line">
                {currentPrompt.promptEn}
              </p>
              {currentPrompt.promptTh && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/30">
                  {currentPrompt.promptTh}
                </p>
              )}
            </div>

            {/* Guiding Questions & Target Phrases */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {currentPrompt.guidingQuestionsTh && currentPrompt.guidingQuestionsTh.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                    <span>แนวทางการตอบ:</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {currentPrompt.guidingQuestionsTh.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-secondary/30 p-2 rounded-lg border border-border/30">
                        <span className="font-bold text-primary">{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentPrompt.targetPhrases && currentPrompt.targetPhrases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>คำศัพท์และสำนวนเป้าหมาย:</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPrompt.targetPhrases.map((phrase, idx) => {
                      const isDetected = detectedPhrases.includes(phrase);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-2.5 py-1 rounded-lg font-mono border transition-all ${
                            isDetected
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-semibold'
                              : 'bg-secondary/40 text-muted-foreground border-border/40'
                          }`}
                        >
                          {phrase}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </GlovaCard>

          {/* Interactive Recording Station Card */}
          <GlovaCard elevation="subtle" className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
            {/* Live Recording Timer */}
            <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" aria-hidden="true" />
              <span>
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Central Recording Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`touch-target p-6 sm:p-8 rounded-full transition-all focus:outline-none focus:ring-4 ${
                  isRecording
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/25 ring-rose-500/30'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25 ring-primary/20'
                }`}
                aria-label={isRecording ? 'หยุดบันทึกเสียง' : 'เริ่มบันทึกเสียง'}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
                ) : (
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {isRecording ? 'กำลังบันทึกเสียงของคุณ...' : 'แตะเพื่อเริ่มบันทึกเสียง'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isRecording ? 'พูดคำตอบเป็นภาษาอังกฤษ จากนั้นแตะอีกครั้งเพื่อหยุด' : 'พูดตามแนวทางคำถามและใช้วลีเป้าหมาย'}
              </p>
            </div>

            {/* Speech Transcript Output Box */}
            {transcript && (
              <div className="w-full max-w-xl text-left p-4 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm text-foreground/90 space-y-2 animate-in fade-in duration-200">
                <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block">
                  {t('speaking.speech_transcript')}:
                </span>
                <p className="leading-relaxed font-serif">{transcript}</p>

                {detectedPhrases.length > 0 && (
                  <div className="pt-2 border-t border-border/40 text-xs text-emerald-500 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                    <span>ตรวจพบวลีเป้าหมาย {detectedPhrases.length} จาก {currentPrompt.targetPhrases.length} วลี</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar (Reset) */}
            {transcript && (
              <div className="pt-2">
                <GlovaButton
                  variant="outline"
                  size="sm"
                  leftIcon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
                  onClick={handleReset}
                >
                  ฝึกใหม่อีกครั้ง
                </GlovaButton>
              </div>
            )}
          </GlovaCard>

          {/* Sample Model Answer Box */}
          {currentPrompt.modelAnswer && (
            <GlovaCard elevation="subtle" className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">
                    ตัวอย่างคำตอบระดับคะแนนเต็ม
                  </h4>
                </div>

                <GlovaButton
                  variant="ghost"
                  size="sm"
                  leftIcon={showModelAnswer ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                >
                  {showModelAnswer ? 'ซ่อนตัวอย่าง' : 'ดูบทความตัวอย่าง'}
                </GlovaButton>
              </div>

              {showModelAnswer && (
                <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/40 text-xs sm:text-sm text-foreground/90 leading-relaxed font-serif whitespace-pre-line animate-in fade-in duration-200">
                  {currentPrompt.modelAnswer}
                </div>
              )}
            </GlovaCard>
          )}
        </div>
      )}
    </div>
  );
};
