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
import {
  TactileButton,
  SpotlightCard,
  BorderBeam,
  DecryptedText,
  ShinyText,
  TacticalHudFrame,
} from '../ui/GlovaPrimitives';
import { RemotionPlayerWrapper, ListeningWaveformComposition } from '../remotion';
import { useTranslation } from '../../i18n';

export const SpeakingView: React.FC = () => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
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
      setError(err?.friendlyMessage || (isEn ? 'Could not load speaking prompts from server. Showing offline bank.' : 'ไม่สามารถโหลดหัวข้อพูดจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง'));
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
      showToast(
        isEn ? 'Recording completed' : 'บันทึกเสียงเสร็จสิ้น',
        isEn ? 'Your spoken response has been recorded for review.' : 'บันทึกคำตอบแล้วเพื่อการฝึกฝน',
        'success'
      );
      return;
    }

    if (!AudioService.isSpeechRecognitionSupported()) {
      showToast(
        isEn ? 'Speech Recognition Unavailable' : 'เบราว์เซอร์นี้ยังไม่รองรับ Web Speech API',
        isEn ? 'We recommend Chrome or Edge for live automatic transcription.' : 'แนะนำให้ใช้งานบน Google Chrome หรือ Microsoft Edge เพื่อตรวจจับคำพูดอัตโนมัติ',
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
    <div className="w-full space-y-6 pb-16">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#5B5CE2]/15 text-[#5B5CE2] dark:text-[#8283FF] border border-[#5B5CE2]/25">
              <DecryptedText text="SPEAKING LAB" speed={40} maxIterations={12} revealDirection="start" />
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            {isEn ? "Interactive Speaking & Pronunciation" : "การพูดและออกเสียงเชิงโต้ตอบ"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
            {isEn ? "Practice responding with fluency and lexical precision with voice recording and target phrase detection." : "ฝึกพูดตอบคำถามตามเกณฑ์ความคล่องแคล่วและการใช้คำศัพท์ พร้อมบันทึกเสียงและตรวจจับวลีเป้าหมาย"}
          </p>
        </div>

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
              className={`touch-target px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#5B5CE2] text-white border-[#5B5CE2] shadow-sm shadow-[#5B5CE2]/20 font-bold'
                  : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-slate-200/80 dark:border-white/10 hover:bg-white dark:bg-[#141A22] dark:hover:bg-[#222E3A]'
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
          <LoadingSpinner size="lg" text={isEn ? "Loading speaking topics..." : "กำลังโหลดหัวข้อการพูด..."} />
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
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.15)"
            showBorderBeam={true}
            borderBeamProps={{
              colorFrom: '#10B981',
              colorTo: '#5B5CE2',
              duration: 12,
              size: 240,
            }}
            className="p-6 sm:p-8 space-y-4 rounded-[30px] bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
                <span className="font-bold text-sm sm:text-base text-foreground">
                  {currentPrompt.title}
                </span>
              </div>

              {/* Sample Audio Button */}
              {currentPrompt.modelAnswer && (
                <GlovaButton
                  variant="outline"
                  size="sm"
                  leftIcon={<Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
                  onClick={handlePlayModel}
                  className="rounded-full"
                >
                  {isPlayingModel ? (isEn ? 'Playing sample...' : 'กำลังเล่นตัวอย่าง...') : (isEn ? 'Listen to Sample' : 'ฟังตัวอย่างคำตอบ')}
                </GlovaButton>
              )}
            </div>

            {/* Prompt Description */}
            <div className="p-5 rounded-[22px] bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 space-y-1.5 shadow-xs">
              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed whitespace-pre-line">
                {currentPrompt.promptEn}
              </p>
              {currentPrompt.promptTh && (
                <p className="text-xs text-muted-foreground leading-relaxed pt-1.5 border-t border-slate-200/80 dark:border-white/10">
                  {currentPrompt.promptTh}
                </p>
              )}
            </div>

            {/* Guiding Questions & Target Phrases */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {currentPrompt.guidingQuestionsTh && currentPrompt.guidingQuestionsTh.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                    <span>{isEn ? 'Guiding Questions & Structure:' : 'แนวทางการตอบ:'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    {currentPrompt.guidingQuestionsTh.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-slate-100 dark:bg-[#1C2430] p-2.5 rounded-[14px] border border-slate-200/80 dark:border-white/10">
                        <span className="font-bold text-[#5B5CE2]">{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentPrompt.targetPhrases && currentPrompt.targetPhrases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                    <span>{isEn ? 'Target Vocabulary & Collocations:' : 'คำศัพท์และสำนวนเป้าหมาย:'}</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPrompt.targetPhrases.map((phrase, idx) => {
                      const isDetected = detectedPhrases.includes(phrase);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-3 py-1 rounded-full font-mono border transition-all ${
                            isDetected
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold'
                              : 'bg-white dark:bg-[#141A22] text-muted-foreground border-slate-200/80 dark:border-white/10'
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
          </SpotlightCard>

          {/* Interactive Recording Station Card */}
          <TacticalHudFrame
            agentName="STUDIO // AUDIO COGNITION"
            statusText={isRecording ? 'LIVE INPUT' : 'STANDBY'}
            accentColor="emerald"
          >
          <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
            {/* Live Recording Timer */}
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-muted-foreground bg-slate-100 dark:bg-[#1C2430] px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10">
              <Clock className="w-4 h-4 text-[#5B5CE2]" aria-hidden="true" />
              <span>
                {Math.floor(recordingSeconds / 60)}:
                {(recordingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Central Recording Button (Calm, Supportive, Tactile) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleToggleRecord}
                className={`touch-target p-6 sm:p-7 rounded-3xl transition-all focus:outline-none focus:ring-4 cursor-pointer select-none ${
                  isRecording
                    ? 'bg-[#E98278] text-white shadow-[0_6px_0_0_#B8574E] border-t-2 border-white/30 active:translate-y-[6px] active:shadow-none ring-4 ring-[#E98278]/20 animate-pulse'
                    : 'bg-[#5B5CE2] text-white hover:bg-[#4E4FD6] shadow-[0_6px_0_0_#38399E] border-t-2 border-white/30 active:translate-y-[6px] active:shadow-none ring-4 ring-[#5B5CE2]/20'
                }`}
                aria-label={isRecording ? (isEn ? 'Stop recording' : 'หยุดบันทึกเสียง') : (isEn ? 'Start speaking' : 'เริ่มบันทึกเสียง')}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
                ) : (
                  <Mic className="w-8 h-8 sm:w-10 sm:h-10" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-base font-bold text-foreground">
                {isRecording ? (isEn ? 'Recording your voice...' : 'กำลังบันทึกเสียงของคุณ...') : (isEn ? 'Tap to Start Speaking' : 'แตะเพื่อเริ่มบันทึกเสียง')}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {isRecording ? (isEn ? 'Speak in English, then tap again to stop' : 'พูดคำตอบเป็นภาษาอังกฤษ จากนั้นแตะอีกครั้งเพื่อหยุด') : (isEn ? 'Follow the guiding points and integrate target collocations' : 'พูดตามแนวทางคำถามและใช้วลีเป้าหมาย')}
              </p>
            </div>

            {/* Remotion Live Speaking Waveform */}
            {isRecording && (
              <div className="w-full max-w-sm pt-2">
                <RemotionPlayerWrapper
                  component={ListeningWaveformComposition}
                  inputProps={{ isPlaying: true }}
                  durationInFrames={90}
                  aspectRatio="21/9"
                  ariaLabel="Live speaking waveform visualization"
                />
              </div>
            )}

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
                    <span>
                      {isEn
                        ? `Detected ${detectedPhrases.length} of ${currentPrompt.targetPhrases.length} target phrases`
                        : `ตรวจพบวลีเป้าหมาย ${detectedPhrases.length} จาก ${currentPrompt.targetPhrases.length} วลี`}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar (Reset) */}
            {transcript && (
              <div className="pt-2">
                <TactileButton
                  variant="neutral"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>{isEn ? 'Practice Again' : 'ฝึกใหม่อีกครั้ง'}</span>
                </TactileButton>
              </div>
            )}
          </div>
          </TacticalHudFrame>

          {/* Sample Model Answer Box */}
          {currentPrompt.modelAnswer && (
            <GlovaCard elevation="subtle" className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" aria-hidden="true" />
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">
                    {isEn ? 'Band 8+ Model Response' : 'ตัวอย่างคำตอบระดับคะแนนเต็ม'}
                  </h4>
                </div>

                <GlovaButton
                  variant="ghost"
                  size="sm"
                  leftIcon={showModelAnswer ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                >
                  {showModelAnswer ? (isEn ? 'Hide Model' : 'ซ่อนตัวอย่าง') : (isEn ? 'View Sample Response' : 'ดูบทความตัวอย่าง')}
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
