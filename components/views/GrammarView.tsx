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
  TactileButton,
  SpotlightCard,
  BorderBeam,
  DecryptedText,
  ShinyText,
  TacticalHudFrame,
} from '../ui/GlovaPrimitives';
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
  const { t, language } = useTranslation();
  const isEn = language === 'en';
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
    <div className="w-full space-y-6 pb-16">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F59E0B]/15 text-[#FDE68A] border border-[#F59E0B]/30">
              <DecryptedText text="GRAMMAR LAB" speed={40} maxIterations={12} revealDirection="start" />
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {isEn ? 'English Grammar Studio & Applications' : 'ไวยากรณ์และการประยุกต์ใช้'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            {isEn
              ? 'Understand sentence structures, grammar rules, and practice with real questions and clear explanations.'
              : 'เข้าใจโครงสร้างประโยค กฎไวยากรณ์ และฝึกฝนด้วยโจทย์จริงพร้อมคำอธิบายละเอียด'}
          </p>
        </div>

        {currentTopic && (
          <div className="flex items-center gap-2 shrink-0">
            <GlovaLevelBadge level={currentTopic.cefrLevel} size="md" />
            <span className="text-xs font-mono font-medium text-slate-400">
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
              className={`touch-target px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                isSelected
                  ? 'bg-[#F59E0B] text-slate-950 border-[#F59E0B] shadow-md shadow-[#F59E0B]/25 font-black'
                  : 'bg-[#070B16]/90 text-slate-400 hover:text-white border-white/10 hover:border-[#F59E0B]/40'
              }`}
            >
              <GlovaLevelBadge level={topic.cefrLevel} size="sm" />
              <span className="truncate max-w-[180px]">
                {isEn ? topic.titleEn : topic.titleTh}
              </span>
            </button>
          );
        })}
      </div>

      {/* Loading state indicator */}
      {loading && topics.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner
            size="lg"
            text={isEn ? 'Loading grammar topics...' : 'กำลังโหลดหัวข้อไวยากรณ์...'}
          />
        </div>
      )}

      {/* Error state */}
      {error && (
        <ErrorMessage message={error} onRetry={fetchTopics} />
      )}

      {/* 2. Main Learning Activity: 2-Column Responsive Layout */}
      {currentTopic && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (6 cols): Grammar Concept & Rule Blueprint */}
          <div className="lg:col-span-6 space-y-4">
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.15)"
              showBorderBeam={true}
              borderBeamProps={{
                colorFrom: '#F59E0B',
                colorTo: '#FDE68A',
                duration: 12,
                size: 220,
              }}
              className="w-full p-6 sm:p-7 space-y-4 rounded-2xl bg-[#070B16]/90 backdrop-blur-md border border-[#F59E0B]/30 shadow-2xl"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentTopic.cefrLevel} size="sm" />
                  <span className="text-xs font-mono text-slate-400">
                    {currentTopic.titleEn}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {isEn ? currentTopic.titleEn : currentTopic.titleTh}
                </h3>
              </div>

              {/* Remotion Educational Grammar Timeline Aspect Animation */}
              <div className="pt-1 w-full overflow-hidden rounded-2xl">
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
                <div className="w-full p-4 rounded-xl bg-[#0B1224] border border-[#F59E0B]/20 text-xs sm:text-sm text-slate-200 flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed font-semibold">{currentTopic.summaryTh}</span>
                </div>
              )}

              {/* Core Concept - Formatted as Full-Width Pedagogical Card without AI markdown symbols */}
              {currentTopic.conceptTh && (
                <div className="w-full p-4 sm:p-5 rounded-xl bg-[#0B1224]/90 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-[#F59E0B] uppercase">
                      {isEn ? 'Core Linguistic Concept' : 'หลักการและบริบทการนำไปใช้'}
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {currentTopic.conceptTh
                      .replace(/\*\*/g, '')
                      .replace(/^\s*-\s+/gm, '')
                      .split('\n\n')
                      .filter((para) => para.trim().length > 0)
                      .map((para, pIdx) => (
                        <p key={pIdx} className="leading-relaxed">
                          {para.trim()}
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {/* Formulas & Rules */}
              {currentTopic.rules && currentTopic.rules.length > 0 && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" aria-hidden="true" />
                    <span>{isEn ? 'Structure & Usage Rules:' : 'โครงสร้างและกฎการใช้งาน:'}</span>
                  </div>

                  <div className="space-y-2.5">
                    {currentTopic.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0B1224]/80 border border-white/10 space-y-2 shadow-inner"
                      >
                        <div className="font-mono text-xs font-bold text-[#FDE68A] bg-[#F59E0B]/15 px-3 py-1 rounded-full border border-[#F59E0B]/30 inline-block break-word-safe">
                          {rule.formula}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {isEn && rule.explanationEn ? rule.explanationEn : rule.explanationTh}
                        </p>
                        <div className="pt-1.5 border-t border-white/10 text-[11px]">
                          <p className="font-semibold text-slate-100">{rule.exampleEn}</p>
                          <p className="text-slate-400">{rule.exampleTh}</p>
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
                    <span>{isEn ? 'Common Mistakes to Avoid:' : 'จุดผิดบ่อยที่ควรระวัง:'}</span>
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
            </SpotlightCard>
          </div>

          {/* Right Column (6 cols): Dominant Practice Task with QuestionCard */}
          <div className="lg:col-span-6 space-y-4">
            <TacticalHudFrame
              agentName="STUDIO // PRACTICE DRILL"
              statusText={displayedQuestions.length > 0 ? `Q ${activeQuestionIdx + 1}/${displayedQuestions.length}` : 'ONLINE'}
              accentColor="emerald"
            >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-semibold text-sm sm:text-base text-foreground">
                  {isEn ? 'Comprehension Practice' : 'แบบฝึกหัดวัดความเข้าใจ'}
                </h4>
              </div>

              {displayedQuestions.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono">
                  {isEn
                    ? `Question ${activeQuestionIdx + 1} of ${displayedQuestions.length}`
                    : `ข้อที่ ${activeQuestionIdx + 1} จาก ${displayedQuestions.length}`}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[260px] flex items-center justify-center p-8">
                <LoadingSpinner
                  size="md"
                  text={isEn ? 'Loading exercises...' : 'กำลังโหลดแบบฝึกหัด...'}
                />
              </div>
            )}

            {!loadingQuestions && displayedQuestions.length === 0 && (
              <EmptyState
                title={isEn ? 'No exercises available for this topic yet' : 'ยังไม่มีแบบฝึกหัดสำหรับหัวข้อนี้'}
                description={
                  isEn
                    ? 'Our academic team is currently preparing practice sets for this CEFR tier.'
                    : 'ทีมผู้เชี่ยวชาญกำลังจัดเตรียมข้อสอบเพิ่มเติมสำหรับระดับนี้'
                }
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
                  <TactileButton
                    variant="neutral"
                    size="sm"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span>{isEn ? 'Previous' : 'ข้อก่อนหน้า'}</span>
                  </TactileButton>

                  <TactileButton
                    variant="primary"
                    size="sm"
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5"
                  >
                    <span>
                      {activeQuestionIdx < displayedQuestions.length - 1
                        ? isEn
                          ? 'Next Question'
                          : 'ข้อถัดไป'
                        : isEn
                        ? 'Next Topic'
                        : 'หัวข้อถัดไป'}
                    </span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </TactileButton>
                </div>
              </div>
            )}
            </TacticalHudFrame>
          </div>
        </div>
      )}
    </div>
  );
};
