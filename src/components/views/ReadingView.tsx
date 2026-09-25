import React, { useState, useEffect, useCallback } from 'react';
import { READING_BANK } from '../../data/readingBank';
import { ReadingPassage, Question } from '../../types';
import { QuestionCard } from '../common/QuestionCard';
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { getReadingPassages, mapReadingDtoToPassage } from '../../lib/api/content/reading';
import { getQuestions, mapQuestionDtoToQuestion } from '../../lib/api/questions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../i18n';

interface ReadingViewProps {
  onQuestionCompleted: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({ onQuestionCompleted }) => {
  const { t } = useTranslation();
  const [passages, setPassages] = useState<ReadingPassage[]>(READING_BANK);
  const [selectedPassageId, setSelectedPassageId] = useState<string>(READING_BANK[0]?.id || '');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [mobilePassageCollapsed, setMobilePassageCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passageQuestions, setPassageQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Fetch passages from API
  const fetchPassages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getReadingPassages({ page: 1, limit: 50 });
      if (res && res.passages && res.passages.length > 0) {
        const mapped = res.passages.map(mapReadingDtoToPassage);
        setPassages(mapped);
        if (!selectedPassageId || !mapped.some((p) => p.id === selectedPassageId)) {
          setSelectedPassageId(mapped[0].id);
        }
      } else {
        setPassages(READING_BANK);
      }
    } catch (err: any) {
      console.warn('[ReadingView] API fetch failed, falling back to static reading bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดบทความอ่านจากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setPassages(READING_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedPassageId]);

  useEffect(() => {
    fetchPassages();
  }, [fetchPassages]);

  const currentPassage = passages.find((p) => p.id === selectedPassageId) || passages[0] || READING_BANK[0];

  // Fetch questions for current passage
  const fetchQuestionsForPassage = useCallback(async (passageId: string) => {
    if (passageQuestions[passageId]) return;
    setLoadingQuestions(true);
    try {
      const res = await getQuestions({ reading_passage_id: passageId });
      if (res && res.questions && res.questions.length > 0) {
        const mapped = res.questions.map(mapQuestionDtoToQuestion);
        setPassageQuestions((prev) => ({ ...prev, [passageId]: mapped }));
      } else {
        const staticPassage = READING_BANK.find((p) => p.id === passageId);
        setPassageQuestions((prev) => ({ ...prev, [passageId]: staticPassage?.questions || [] }));
      }
    } catch (err: any) {
      console.warn('[ReadingView] Failed to fetch questions for passage, using static fallback:', err?.message || err);
      const staticPassage = READING_BANK.find((p) => p.id === passageId);
      setPassageQuestions((prev) => ({ ...prev, [passageId]: staticPassage?.questions || [] }));
    } finally {
      setLoadingQuestions(false);
    }
  }, [passageQuestions]);

  useEffect(() => {
    if (currentPassage?.id) {
      fetchQuestionsForPassage(currentPassage.id);
    }
  }, [currentPassage?.id, fetchQuestionsForPassage]);

  const displayedQuestions = (currentPassage && passageQuestions[currentPassage.id]) || currentPassage?.questions || [];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Passage Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {passages.map((p) => {
          const isSelected = p.id === currentPassage?.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPassageId(p.id);
                setMobilePassageCollapsed(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all touch-target flex items-center gap-2 border ${
                isSelected
                  ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                  : 'bg-card text-muted-foreground hover:text-foreground border-border/60 hover:bg-muted/40'
              }`}
            >
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-black/20 text-current">
                {p.cefrLevel}
              </span>
              <span className="truncate max-w-[200px]">{p.title}</span>
            </button>
          );
        })}
      </div>

      {loading && passages.length === 0 && (
        <div className="p-12 flex justify-center">
          <LoadingSpinner size="lg" text="กำลังโหลดบทอ่าน..." />
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={fetchPassages} />
      )}

      {currentPassage && (
        /* Main Responsive Grid: Split-screen on desktop (lg:grid-cols-12), stacked on mobile */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Reading Passage (7 cols desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-6 shadow-xs space-y-4">
              {/* Passage Meta Bar */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    {currentPassage.targetExam} • {currentPassage.cefrLevel}
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {currentPassage.wordCount} words
                  </span>
                </div>

                {/* Mobile Collapse Toggle to save screen height */}
                <button
                  onClick={() => setMobilePassageCollapsed(!mobilePassageCollapsed)}
                  className="lg:hidden text-xs text-primary font-medium flex items-center gap-1 touch-target"
                >
                  <span>{mobilePassageCollapsed ? 'ขยายเนื้อหาบทความ' : 'ย่อบทความชั่วคราว'}</span>
                  {mobilePassageCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              <h2 className="text-fluid-subtitle font-bold text-foreground tracking-tight">
                {currentPassage.title}
              </h2>

              {/* Passage Body Text */}
              {!mobilePassageCollapsed && (
                <div className="text-sm sm:text-base text-foreground/90 font-serif leading-relaxed whitespace-pre-line space-y-3 pt-1 break-word-safe">
                  {currentPassage.content}
                </div>
              )}

              {/* Vocabulary Glossary Drawer / Box */}
              {currentPassage.vocabularyGlossary && currentPassage.vocabularyGlossary.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/40">
                  <button
                    onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-primary hover:underline touch-target"
                  >
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" />
                      <span>คลังคำศัพท์น่ารู้ในบทความนี้ (Glossary {currentPassage.vocabularyGlossary.length} คำ)</span>
                    </div>
                    {isGlossaryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {isGlossaryOpen && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/30 animate-in fade-in duration-200">
                      {currentPassage.vocabularyGlossary.map((item, idx) => (
                        <div key={idx} className="p-2 rounded-lg bg-muted/40 text-xs border border-border/40">
                          <span className="font-bold text-primary font-mono">{item.word}: </span>
                          <span className="text-foreground">{item.meaningTh}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: Comprehension Quiz (5 cols desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>{t('reading.quiz')}</span>
              </h3>
              <span className="text-xs text-muted-foreground font-mono">
                {displayedQuestions.length} ข้อ
              </span>
            </div>

            {loadingQuestions && displayedQuestions.length === 0 ? (
              <div className="p-8 flex justify-center">
                <LoadingSpinner size="md" text="กำลังโหลดแบบฝึกหัด..." />
              </div>
            ) : displayedQuestions.length > 0 ? (
              <div className="space-y-4">
                {displayedQuestions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    questionNumber={idx + 1}
                    totalQuestions={displayedQuestions.length}
                    showExplanationImmediately={true}
                    onAnswer={(selectedKey, isCorrect) => {
                      onQuestionCompleted(q.id, isCorrect, q.weaknessTag);
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="ยังไม่มีคำถามสำหรับบทอ่านนี้"
                description="เลือกบทอ่านอื่นเพื่อฝึกทำโจทย์"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
