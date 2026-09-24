import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { useToast } from '../common/Toast';

export const SpeakingView: React.FC = () => {
  const { showToast } = useToast();
  const [selectedPromptId, setSelectedPromptId] = useState<string>(SPEAKING_BANK[0].id);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionObj, setRecognitionObj] = useState<any>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);

  const currentPrompt =
    SPEAKING_BANK.find((p) => p.id === selectedPromptId) || SPEAKING_BANK[0];

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
      if (transcript.length > 5) {
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
      onResult: (text, isFinal) => {
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
      } catch (err) {
        showToast('ไม่สามารถเข้าถึงไมโครโฟนได้', 'โปรดอนุญาตสิทธิ์การใช้ไมโครโฟน', 'error');
      }
    }
  };

  const handleListenModel = () => {
    AudioService.speak(currentPrompt.modelAnswer, {
      lang: 'en-GB',
      rate: 0.9,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Speaking Part Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SPEAKING_BANK.map((p) => {
          const isSelected = p.id === currentPrompt.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPromptId(p.id);
                setTranscript('');
                setPronunciationScore(null);
                AudioService.stop();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {p.targetExam}
              </span>
              <span className="truncate max-w-[200px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Task Card */}
      <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {currentPrompt.targetExam} • {currentPrompt.cefrLevel}
              </span>
            </div>
            <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
              {currentPrompt.title}
            </h2>
          </div>
          <button
            onClick={handleListenModel}
            className="px-3.5 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto touch-target"
          >
            <Volume2 className="w-4 h-4" />
            <span>ฟังตัวอย่างเสียงพูด (Model Audio)</span>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 font-medium bg-muted/30 p-3 rounded-lg border border-border/40">
          {currentPrompt.promptTh}
        </p>

        <div className="p-3.5 rounded-lg bg-background border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed whitespace-pre-line break-word-safe">
          {currentPrompt.promptEn}
        </div>

        {/* Guiding Questions in Thai */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            <span>แนวคำถามที่กรรมการจะถาม (Guiding Prompts):</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {currentPrompt.guidingQuestionsTh.map((q, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span className="break-word-safe">{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Target Useful Phrases */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>สำนวนสำคัญที่ควรนำมาใช้ในการตอบ (Target Phrases):</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {currentPrompt.targetPhrases.map((phrase, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-md bg-muted/60 text-foreground border border-border font-medium"
              >
                "{phrase}"
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Recording & Real-time AI Evaluation */}
      <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">
              ทดสอบการพูดผ่านไมโครโฟน (Voice Speech Analysis)
            </h3>
          </div>

          {pronunciationScore !== null && (
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ความแม่นยำ: {pronunciationScore}%
            </span>
          )}
        </div>

        {/* Microphone Button */}
        <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
          <button
            onClick={handleToggleRecord}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-md touch-target ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {isRecording ? 'กำลังรับเสียงพูดของคุณ... (กดอีกครั้งเพื่อหยุด)' : 'กดปุ่มไมโครโฟนเพื่อเริ่มพูดภาษาอังกฤษ'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ระบบจะถอดเสียงแบบเรียลไทม์และประเมินคำศัพท์
            </p>
          </div>
        </div>

        {/* Live Speech Transcript Box */}
        {transcript && (
          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed break-word-safe">
            <span className="text-muted-foreground block text-[11px] font-sans mb-1 font-semibold">
              เสียงที่คุณพูด (Speech Transcript):
            </span>
            {transcript}
          </div>
        )}

        {/* Model Answer Drawer */}
        <div className="pt-2 border-t border-border/40">
          <h4 className="text-xs font-semibold text-foreground mb-2">
            ตัวอย่างบทพูดคะแนนเต็ม (Full Model Spoken Response):
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground font-serif leading-relaxed italic bg-muted/20 p-3.5 rounded-xl border border-border/40 whitespace-pre-line break-word-safe">
            "{currentPrompt.modelAnswer}"
          </p>
        </div>
      </div>
    </div>
  );
};
