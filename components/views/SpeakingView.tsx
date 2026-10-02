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
      {/* 1. TOP SUB-NAV BAR (EduMaster Style) */}
      <nav
        aria-label="Speaking sub-navigation"
        className="w-full bg-[#FAF8F3] dark:bg-[#1E1B28] backdrop-blur-md rounded-[28px] p-3 sm:p-4 border border-[#EAE4D5] dark:border-white/10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 shadow-sm"
      >
        {/* Brand & Studio Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-sm shrink-0">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Speaking Studio
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                SPEAKING LAB // CEFR
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block mx-1" />

          {currentPrompt && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
              <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Part {currentPrompt.part}
              </span>
            </div>
          )}
        </div>

        {/* Counter and Status Chips */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Mic className="w-3.5 h-3.5" />
            <span>{isEn ? `${prompts.length} Speaking Prompts` : `${prompts.length} หัวข้อการพูด`}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Voice Cognition</span>
          </div>
        </div>
      </nav>

      {/* Main Title & Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEn ? "Interactive Speaking & Pronunciation" : "การพูดและออกเสียงเชิงโต้ตอบ"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-sans">
          {isEn ? "Practice responding with fluency and lexical precision with voice recording and target phrase detection." : "ฝึกพูดตอบคำถามตามเกณฑ์ความคล่องแคล่วและการใช้คำศัพท์ พร้อมบันทึกเสียงและตรวจจับวลีเป้าหมาย"}
        </p>
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
              className={`touch-target px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FA5D5D] text-white shadow-sm font-black'
                  : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
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
          <div className="p-6 sm:p-8 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE4D5] dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentPrompt.cefrLevel} size="sm" />
                <span className="font-extrabold text-base text-slate-900 dark:text-white">
                  {currentPrompt.title}
                </span>
              </div>

              {/* Sample Audio Button */}
              {currentPrompt.modelAnswer && (
                <button
                  type="button"
                  onClick={handlePlayModel}
                  className="touch-target px-4 py-2 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />
                  <span>
                    {isPlayingModel ? (isEn ? 'Playing sample...' : 'กำลังเล่นตัวอย่าง...') : (isEn ? 'Listen to Sample' : 'ฟังตัวอย่างคำตอบ')}
                  </span>
                </button>
              )}
            </div>

            {/* Contextual Editorial Speaking Photography */}
            <div className="overflow-hidden rounded-[22px] border border-[#EAE4D5] dark:border-white/10 shadow-xs relative">
              <img
                src="/images/learning/speaking_hero.jpg"
                alt="Professional speech coach engaged in speaking consultation"
                width={800}
                height={380}
                className="w-full max-h-48 object-cover"
              />
              <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/20 flex items-center gap-1.5">
                <Mic className="w-3 h-3 text-[#FA5D5D]" />
                <span>Conversational Studio Ready</span>
              </div>
            </div>

            {/* Prompt Description */}
            <div className="p-5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-1.5 shadow-xs">
              <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold leading-relaxed whitespace-pre-line font-sans">
                {currentPrompt.promptEn}
              </p>
            </div>

            {/* Guiding Questions & Target Phrases */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {currentPrompt.guidingQuestionsTh && currentPrompt.guidingQuestionsTh.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-[#FA5D5D]" aria-hidden="true" />
                    <span>{isEn ? 'Guiding Questions & Structure:' : 'แนวทางการตอบ:'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {currentPrompt.guidingQuestionsTh.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#FAF8F3] dark:bg-[#252131] p-3 rounded-[18px] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                        <span className="font-bold text-[#FA5D5D]">{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentPrompt.targetPhrases && currentPrompt.targetPhrases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D98200] dark:text-[#FFBA38]" aria-hidden="true" />
                    <span>{isEn ? 'Target Vocabulary & Collocations:' : 'คำศัพท์และสำนวนเป้าหมาย:'}</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentPrompt.targetPhrases.map((phrase, idx) => {
                      const isDetected = detectedPhrases.includes(phrase);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-3.5 py-1.5 rounded-full font-mono border transition-all shadow-xs ${
                            isDetected
                              ? 'bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border-[#C5EBDA] dark:border-emerald-500/20 font-bold'
                              : 'bg-[#FAF8F3] dark:bg-[#252131] text-slate-700 dark:text-slate-300 border-[#EAE4D5] dark:border-white/10'
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
          </div>

          {/* Interactive Recording Station Card */}
          <div className="w-full p-6 sm:p-7 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
              {/* Live Recording Timer */}
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-slate-700 dark:text-slate-300 bg-[#FAF8F3] dark:bg-[#252131] px-4 py-1.5 rounded-full border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                <Clock className="w-4 h-4 text-[#D98200] dark:text-[#FFBA38]" aria-hidden="true" />
                <span>
                  {Math.floor(recordingSeconds / 60)}:
                  {(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              {/* Central Recording Button (EduMaster Soft Coral Circle) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleToggleRecord}
                  className={`touch-target w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all focus:outline-none focus:ring-4 cursor-pointer select-none shadow-md ${
                    isRecording
                      ? 'bg-rose-500 text-white ring-4 ring-rose-300 dark:ring-rose-900/50 animate-pulse'
                      : 'bg-[#FA5D5D] hover:bg-[#ff4747] text-white ring-4 ring-[#FA5D5D]/20 active:scale-95'
                  }`}
                  aria-label={isRecording ? (isEn ? 'Stop recording' : 'หยุดบันทึกเสียง') : (isEn ? 'Start speaking' : 'เริ่มบันทึกเสียง')}
                >
                  {isRecording ? (
                    <MicOff className="w-9 h-9 sm:w-11 sm:h-11" aria-hidden="true" />
                  ) : (
                    <Mic className="w-9 h-9 sm:w-11 sm:h-11" aria-hidden="true" />
                  )}
                </button>
              </div>

              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  {isRecording ? (isEn ? 'Recording your voice...' : 'กำลังบันทึกเสียงของคุณ...') : (isEn ? 'Tap to Start Speaking' : 'แตะเพื่อเริ่มบันทึกเสียง')}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isRecording ? (isEn ? 'Speak in English, then tap again to stop' : 'พูดคำตอบเป็นภาษาอังกฤษ จากนั้นแตะอีกครั้งเพื่อหยุด') : (isEn ? 'Follow the guiding points and integrate target collocations' : 'พูดตามแนวทางคำถามและใช้วลีเป้าหมาย')}
                </p>
              </div>

              {/* Remotion Live Speaking Waveform */}
              {isRecording && (
                <div className="w-full max-w-sm pt-2 rounded-[22px] overflow-hidden">
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
                <div className="w-full max-w-xl text-left p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2 animate-in fade-in duration-200 shadow-xs">
                  <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-mono">
                    {t('speaking.speech_transcript')}:
                  </span>
                  <p className="leading-relaxed font-serif">{transcript}</p>

                  {detectedPhrases.length > 0 && (
                    <div className="pt-2 border-t border-[#EAE4D5] dark:border-white/10 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
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
                  <button
                    type="button"
                    onClick={handleReset}
                    className="touch-target px-5 py-2.5 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    <span>{isEn ? 'Practice Again' : 'ฝึกใหม่อีกครั้ง'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sample Model Answer Box */}
          {currentPrompt.modelAnswer && (
            <div className="p-5 sm:p-6 space-y-3 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D98200] dark:text-[#FFBA38]" aria-hidden="true" />
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {isEn ? 'Band 8+ Model Response' : 'ตัวอย่างคำตอบระดับคะแนนเต็ม'}
                  </h4>
                </div>

                <button
                  type="button"
                  onClick={() => setShowModelAnswer(!showModelAnswer)}
                  className="touch-target px-4 py-2 rounded-full bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  {showModelAnswer ? <EyeOff className="w-3.5 h-3.5" aria-hidden="true" /> : <Eye className="w-3.5 h-3.5" aria-hidden="true" />}
                  <span>{showModelAnswer ? (isEn ? 'Hide Model' : 'ซ่อนตัวอย่าง') : (isEn ? 'View Sample Response' : 'ดูบทความตัวอย่าง')}</span>
                </button>
              </div>

              {showModelAnswer && (
                <div className="mt-3 p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif whitespace-pre-line animate-in fade-in duration-200 shadow-xs">
                  {currentPrompt.modelAnswer}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
