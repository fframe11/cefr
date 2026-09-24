import React, { useState } from 'react';
import { LISTENING_BANK } from '../../data/listeningBank';
import { ListeningExercise } from '../../types';
import { AudioPlayer } from '../common/AudioPlayer';
import { QuestionCard } from '../common/QuestionCard';
import { Headphones, Eye, EyeOff, HelpCircle, FileText } from 'lucide-react';

interface ListeningViewProps {
  onQuestionCompleted: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

export const ListeningView: React.FC<ListeningViewProps> = ({ onQuestionCompleted }) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(LISTENING_BANK[0].id);
  const [showTranscript, setShowTranscript] = useState(false);

  const currentExercise =
    LISTENING_BANK.find((l) => l.id === selectedExerciseId) || LISTENING_BANK[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* Exercise Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {LISTENING_BANK.map((item) => {
          const isSelected = item.id === currentExercise.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedExerciseId(item.id);
                setShowTranscript(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {item.cefrLevel}
              </span>
              <span className="truncate max-w-[200px]">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Listening Card */}
      <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {currentExercise.targetExam} • {currentExercise.cefrLevel}
              </span>
            </div>
            <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
              {currentExercise.title}
            </h2>
          </div>

          <span className="text-xs text-muted-foreground self-start sm:self-auto">
            สำเนียง: {currentExercise.speakerAccents}
          </span>
        </div>

        {/* Audio Player Component */}
        <AudioPlayer
          script={currentExercise.audioScript}
          title={currentExercise.title}
          accent={currentExercise.speakerAccents}
          maxReplays={3}
        />

        {/* Transcript Toggle (Hidden by default to train actual listening) */}
        <div className="pt-2">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1.5 touch-target"
          >
            {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{showTranscript ? 'ซ่อนบทพูดภาษาอังกฤษ (Hide Transcript)' : 'แสดงบทพูดภาษาอังกฤษ (Reveal Transcript)'}</span>
          </button>

          {showTranscript && (
            <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border/60 text-xs sm:text-sm font-mono text-foreground leading-relaxed whitespace-pre-line animate-in fade-in duration-200 break-word-safe">
              {currentExercise.audioScript}
            </div>
          )}
        </div>
      </div>

      {/* Comprehension Questions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>คำถามทดสอบความเข้าใจจากการฟัง (Comprehension Questions)</span>
          </h3>
          <span className="text-xs text-muted-foreground font-mono">
            {currentExercise.questions.length} ข้อ
          </span>
        </div>

        <div className="space-y-4">
          {currentExercise.questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              questionNumber={idx + 1}
              totalQuestions={currentExercise.questions.length}
              showExplanationImmediately={true}
              onAnswer={(selectedKey, isCorrect) => {
                onQuestionCompleted(q.id, isCorrect, q.weaknessTag);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
