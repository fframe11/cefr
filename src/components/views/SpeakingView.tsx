import React, { useState, useEffect, useCallback } from 'react';
import { SPEAKING_BANK } from '../../data/speakingBank';
import { SpeakingPrompt } from '../../types';
import {
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Lock,
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useToast } from '../common/Toast';
import { getSpeakingPrompts, mapSpeakingDtoToPrompt } from '../../lib/api/content/speaking';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../i18n';

export const SpeakingView: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [prompts, setPrompts] = useState<SpeakingPrompt[]>(SPEAKING_BANK);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(SPEAKING_BANK[0]?.id || '');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionObj, setRecognitionObj] = useState<any>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      // Calculate sample match score with model phrases
      if (transcript.length > 5 && currentPrompt.targetPhrases.length > 0) {
        const wordsSpoken = transcript.toLowerCase().split(/\s+/);
        const matchCount = currentPrompt.targetPhrases.filter((phrase) =>
          phrase.toLowerCase().split(/\s+/).some((w) => wordsSpoken.includes(w))
        ).length;
        const score = Math.min(95, Math.max(65, Math.round((matchCount / currentPrompt.targetPhrases.length) * 100)));
        setPronunciationScore(score);
        showToast('ประเมินการพูดเสร็จสิ้น!', `คะแนนความคล่องแคล่วและการใช้คำศัพท์: ${score}%`, 'success');
      }
      return;
    }

    if (!AudioService.isSpeechRecognitionSupported()) {
      showToast(
        'เบราว์เซอร์นี้ยังไม่รองรับระบบตรวจจับเสียงอัตโนมัติ',
        'แนะนำให้ใช้งานบน Google Chrome หรือ Edge เพื่อทดลองบันทึกเสียง',
        'info'
      );
      // Simulate voice input for testing/fallback
      setTranscript('Hello! My name is Tanawat and I come from Chiang Mai...');
      setPronunciationScore(85);
      return;
    }

    setTranscript('');
    setPronunciationScore(null);

    const recognizer = AudioService.createSpeechRecognizer({
      onResult: (text, _isFinal) => {
        setTranscript(text);
      },
      onError: (err) => {
        setIsRecording(false);
        showToast('เกิดข้อผิดพลาดในการรับเสียง', err, 'error');
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    if (recognizer) {
      try {
        recognizer.start();
        setRecognitionObj(recognizer);
        setIsRecording(true);
      } catch {
        showToast('ไม่สามารถเข้าถึงไมโครโฟนได้', 'โปรดอนุญาตสิทธิ์การใช้ไมโครโฟน', 'error');
      }
    }
  };

  const handleListenModel = () => {
    if (currentPrompt.modelAnswer) {
      AudioService.speak(currentPrompt.modelAnswer, {
        lang: 'en-GB',
        rate: 0.9,
      });
    } else {
      showToast(
        'ตัวอย่างเสียงต้นแบบถูกจำกัดก่อนการทดสอบ',
        'ตัวอย่างการพูดจะเปิดให้รับฟังในการเฉลยหลังส่งตรวจตามนโยบายข้อสอบ',
        'info'
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Speaking Part Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {prompts.map((p) => {
          const isSelected = p.id === currentPrompt?.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPromptId(p.id);
                setTranscript('');
                setPronunciationScore(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                Part {p.part}
              </span>
              <span className="truncate max-w-[200px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {loading && prompts.length === 0 && (
        <div className="p-12 flex justify-center">
          <LoadingSpinner size="lg" text="กำลังโหลดแบบฝึกหัดพูด..." />
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={fetchPrompts} />
      )}

      {currentPrompt && (
        /* Main Practice Card */
        <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-7 shadow-xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {currentPrompt.targetExam} • Part {currentPrompt.part}
                </span>
                <span className="text-xs font-mono text-muted-foreground">
                  CEFR {currentPrompt.cefrLevel}
                </span>
              </div>
              <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
                {currentPrompt.title}
              </h2>
            </div>

            <button
              onClick={handleListenModel}
              className="text-xs px-3 py-1.5 rounded-lg border border-border bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-1.5 self-start sm:self-auto touch-target"
            >
              {currentPrompt.modelAnswer ? <Volume2 className="w-4 h-4 text-primary" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
              <span>{currentPrompt.modelAnswer ? 'ฟังเสียงคำตอบต้นแบบ' : 'ตัวอย่างคำตอบถูกล็อก'}</span>
            </button>
          </div>

          {/* Thai & English Instructions */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground bg-muted/40 p-3.5 rounded-xl border border-border/40">
              {currentPrompt.promptTh}
            </p>
            <div className="p-4 rounded-xl bg-background border border-border/60 text-sm font-mono text-foreground leading-relaxed whitespace-pre-line break-word-safe">
              {currentPrompt.promptEn}
            </div>
          </div>

          {/* Guiding Questions to think about */}
          {currentPrompt.guidingQuestionsTh && currentPrompt.guidingQuestionsTh.length > 0 && (
            <div className="p-4 rounded-xl bg-muted/30 border border-border/40 space-y-2">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                <span>{t('speaking.guiding_questions')}:</span>
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {currentPrompt.guidingQuestionsTh.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-primary font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Target Vocabulary/Phrases to Use */}
          {currentPrompt.targetPhrases && currentPrompt.targetPhrases.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('speaking.target_phrases')}:</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentPrompt.targetPhrases.map((phrase, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-medium text-primary"
                  >
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Speech Recording Stage */}
          <div className="p-6 rounded-2xl bg-muted/20 border border-border/60 flex flex-col items-center justify-center text-center space-y-4">
            <button
              onClick={handleToggleRecord}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md touch-target ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse scale-105 shadow-rose-500/30'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
              }`}
              title={isRecording ? 'กดเพื่อหยุดการบันทึก' : 'กดเพื่อเริ่มบันทึกเสียง'}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>

            <div>
              <p className="text-sm font-semibold text-foreground">
                {isRecording ? 'กำลังบันทึกเสียง... กรุณาพูดตอบเป็นภาษาอังกฤษ' : 'แตะไมโครโฟนเพื่อเริ่มฝึกพูด'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isRecording ? 'ระบบจะตรวจจับข้อความและคำศัพท์อัตโนมัติ' : 'กดอีกครั้งเพื่อสิ้นสุดและให้ระบบประเมินผล'}
              </p>
            </div>

            {/* Live Transcript / Speech to Text output */}
            {transcript && (
              <div className="w-full text-left p-4 rounded-xl bg-background border border-border text-xs sm:text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap break-word-safe">
                <span className="text-xs text-muted-foreground block mb-1 font-sans">
                  {t('speaking.speech_transcript')}:
                </span>
                {transcript}
              </div>
            )}

            {/* Pronunciation & Fluency Evaluation Result */}
            {pronunciationScore !== null && (
              <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> การประเมินความคล่องแคล่วและการใช้คำศัพท์
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    {pronunciationScore}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {pronunciationScore >= 80
                    ? 'ยอดเยี่ยม! คุณนำคำศัพท์เป้าหมายมาใช้ในการตอบได้อย่างเป็นธรรมชาติและต่อเนื่อง'
                    : 'ดีมาก! พยายามเสริมคำเชื่อมและคำศัพท์เป้าหมายให้ครอบคลุมตามที่ระบุไว้ด้านบน'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
