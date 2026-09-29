'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { GRAMMAR_BANK } from '../../data/grammarBank';
import { GrammarTopic, Question } from '../../types';
import { QuestionCard } from '../common/QuestionCard';
import {
  Sparkles,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { getGrammarTopics, mapGrammarDtoToTopic } from '../../lib/api/content/grammar';
import { getQuestions, mapQuestionDtoToQuestion } from '../../lib/api/questions';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import {
  GlovaSectionHeader,
  GlovaLevelBadge,
  GlovaButton,
  GlovaCard,
  GlovaCardContent,
  GlovaBadge,
} from '../ui';
import { RemotionPlayerWrapper, GrammarTimelineComposition } from '../remotion';
import { useTranslation } from '../../i18n';

interface GrammarViewProps {
  onQuestionCompleted?: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
  activeTopicId?: string;
}

export const GrammarView: React.FC<GrammarViewProps> = ({
  onQuestionCompleted,
  activeTopicId,
}) => {
  const { t } = useTranslation();
  const [topics, setTopics] = useState<GrammarTopic[]>(GRAMMAR_BANK);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    activeTopicId || GRAMMAR_BANK[0]?.id || ''
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topicQuestions, setTopicQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);

  // Fetch topics from API
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGrammarTopics({ page: 1, limit: 50 });
      if (res && res.topics && res.topics.length > 0) {
        const mapped = res.topics.map(mapGrammarDtoToTopic);
        setTopics(mapped);
        if (!selectedTopicId || !mapped.some((t) => t.id === selectedTopicId)) {
          setSelectedTopicId(mapped[0].id);
        }
      } else {
        setTopics(GRAMMAR_BANK);
      }
    } catch (err: any) {
      console.warn('[GrammarView] API fetch failed, falling back to static grammar bank:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดหัวข้อไวยากรณ์จากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      setTopics(GRAMMAR_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedTopicId]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const currentTopic = topics.find((t) => t.id === selectedTopicId) || topics[0] || GRAMMAR_BANK[0];

  // Fetch questions for selected topic
  const fetchQuestionsForTopic = useCallback(async (topicId: string) => {
    if (topicQuestions[topicId]) return;
    setLoadingQuestions(true);
    try {
      const res = await getQuestions({ grammar_topic_id: topicId });
      if (res && res.questions && res.questions.length > 0) {
        const mapped = res.questions.map(mapQuestionDtoToQuestion);
        setTopicQuestions((prev) => ({ ...prev, [topicId]: mapped }));
      } else {
        const staticTopic = GRAMMAR_BANK.find((t) => t.id === topicId);
        setTopicQuestions((prev) => ({ ...prev, [topicId]: staticTopic?.practiceQuestions || [] }));
      }
    } catch (err: any) {
      console.warn('[GrammarView] Failed to fetch questions for topic, using static fallback:', err?.message || err);
      const staticTopic = GRAMMAR_BANK.find((t) => t.id === topicId);
      setTopicQuestions((prev) => ({ ...prev, [topicId]: staticTopic?.practiceQuestions || [] }));
    } finally {
      setLoadingQuestions(false);
    }
  }, [topicQuestions]);

  useEffect(() => {
    if (currentTopic?.id) {
      fetchQuestionsForTopic(currentTopic.id);
      setActiveQuestionIdx(0);
    }
  }, [currentTopic?.id, fetchQuestionsForTopic]);

  const displayedQuestions = (currentTopic && topicQuestions[currentTopic.id]) || currentTopic?.practiceQuestions || [];
  const currentQuestion = displayedQuestions[activeQuestionIdx];

  const handleNextQuestion = () => {
    if (activeQuestionIdx < displayedQuestions.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
    } else {
      // Find next topic
      const currentIndex = topics.findIndex((t) => t.id === currentTopic?.id);
      if (currentIndex !== -1 && currentIndex < topics.length - 1) {
        setSelectedTopicId(topics[currentIndex + 1].id);
      }
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx((prev) => prev - 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GlovaSectionHeader
          eyebrow="GRAMMAR LAB"
          title="ไวยากรณ์และการประยุกต์ใช้"
          description="เข้าใจโครงสร้างประโยค กฎไวยากรณ์ และฝึกฝนด้วยโจทย์จริงพร้อมคำอธิบายละเอียด"
        />

        {currentTopic && (
          <div className="flex items-center gap-2 shrink-0">
            <GlovaLevelBadge level={currentTopic.cefrLevel} size="md" />
            <span className="text-xs font-mono font-medium text-muted-foreground">
              {currentTopic.titleEn}
            </span>
          </div>
        )}
      </div>

      {/* Topic Switcher Pills Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {topics.map((topic) => {
          const isSelected = topic.id === currentTopic?.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => {
                setSelectedTopicId(topic.id);
                setActiveQuestionIdx(0);
              }}
              className={`touch-target px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#5B5CE2] text-white border-[#5B5CE2] shadow-sm shadow-indigo-500/20'
                  : 'bg-white dark:bg-card text-muted-foreground hover:text-foreground border-[#EDE8DF] dark:border-border/60 hover:bg-[#FAF7F2]'
              }`}
            >
              <GlovaLevelBadge level={topic.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">{topic.titleTh}</span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && topics.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="กำลังโหลดหัวข้อไวยากรณ์..." />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchTopics} />
      )}

      {/* 2. Main Learning Activity: 2-Column Responsive Layout */}
      {currentTopic && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (5 cols): Grammar Concept & Rule Blueprint */}
          <div className="lg:col-span-5 space-y-4">
            <GlovaCard
              variant="bubble"
              elevation="bubble"
              className="p-6 sm:p-7 space-y-4 rounded-[28px] bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/40 shadow-[0_8px_30px_-4px_rgba(36,35,58,0.06),0_2px_10px_-2px_rgba(36,35,58,0.04)]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentTopic.cefrLevel} size="sm" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {currentTopic.titleEn}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {currentTopic.titleTh}
                </h3>
              </div>

              {/* Remotion Educational Grammar Timeline Aspect Animation */}
              <div className="pt-1">
                <RemotionPlayerWrapper
                  component={GrammarTimelineComposition}
                  inputProps={{
                    tenseName: currentTopic.titleEn,
                    exampleSentence: currentTopic.rules?.[0]?.exampleEn || 'I have completed the task.',
                    timeframeLabel: `${currentTopic.cefrLevel} Aspect`,
                  }}
                  durationInFrames={90}
                  aspectRatio="16/9"
                  ariaLabel={`Grammar aspect animation for ${currentTopic.titleEn}`}
                />
              </div>

              {currentTopic.summaryTh && (
                <div className="p-4 rounded-[20px] bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-foreground flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed font-semibold">{currentTopic.summaryTh}</span>
                </div>
              )}

              {/* Core Concept */}
              {currentTopic.conceptTh && (
                <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {currentTopic.conceptTh}
                </div>
              )}

              {/* Formulas & Rules */}
              {currentTopic.rules && currentTopic.rules.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" aria-hidden="true" />
                    <span>โครงสร้างและกฎการใช้งาน:</span>
                  </div>

                  <div className="space-y-2.5">
                    {currentTopic.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-[20px] bg-[#FAF7F2] dark:bg-muted/30 border border-[#EDE8DF] dark:border-border/40 space-y-2 shadow-xs"
                      >
                        <div className="font-mono text-xs font-bold text-[#5B5CE2] dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 inline-block break-word-safe">
                          {rule.formula}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {rule.explanationTh}
                        </p>
                        <div className="pt-1.5 border-t border-border/30 text-[11px]">
                          <p className="font-medium text-foreground">{rule.exampleEn}</p>
                          <p className="text-muted-foreground">{rule.exampleTh}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Pitfalls by Thai Learners */}
              {currentTopic.commonMistakes && currentTopic.commonMistakes.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-border/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
                    <span>จุดผิดบ่อยที่ควรระวัง:</span>
                  </div>

                  <div className="space-y-2">
                    {currentTopic.commonMistakes.map((m, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-rose-400 line-through font-mono">
                            {m.incorrect}
                          </span>
                          <span className="text-emerald-500 font-mono font-medium">
                            {m.correct}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{m.reasonTh}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlovaCard>
          </div>

          {/* Right Column (7 cols): Dominant Practice Task with QuestionCard */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  แบบฝึกหัดวัดความเข้าใจ
                </h4>
              </div>

              {displayedQuestions.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  ข้อที่ {activeQuestionIdx + 1} จาก {displayedQuestions.length}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[260px] flex items-center justify-center p-8">
                <LoadingSpinner size="md" text="กำลังโหลดแบบฝึกหัด..." />
              </div>
            )}

            {!loadingQuestions && displayedQuestions.length === 0 && (
              <EmptyState
                title="ยังไม่มีแบบฝึกหัดสำหรับหัวข้อนี้"
                description="ทีมผู้เชี่ยวชาญกำลังจัดเตรียมข้อสอบเพิ่มเติมสำหรับระดับนี้"
              />
            )}

            {currentQuestion && (
              <div className="space-y-4">
                <QuestionCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  questionNumber={activeQuestionIdx + 1}
                  totalQuestions={displayedQuestions.length}
                  onAnswer={(selectedKey, isCorrect) => {
                    onQuestionCompleted?.(currentQuestion.id, isCorrect, currentQuestion.weaknessTag);
                  }}
                  showExplanationImmediately={true}
                />

                {/* Next / Previous Question Action Bar */}
                <div className="flex items-center justify-between pt-2">
                  <GlovaButton
                    variant="secondary"
                    size="sm"
                    leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                  >
                    ข้อก่อนหน้า
                  </GlovaButton>

                  <GlovaButton
                    variant="primary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
                    onClick={handleNextQuestion}
                  >
                    {activeQuestionIdx < displayedQuestions.length - 1 ? 'ข้อถัดไป' : 'หัวข้อถัดไป'}
                  </GlovaButton>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
