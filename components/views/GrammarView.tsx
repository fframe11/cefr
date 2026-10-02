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
  GlovaLevelBadge,
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
      {/* 1. TOP SUB-NAV BAR (EduMaster Style) */}
      <nav
        aria-label="Grammar sub-navigation"
        className="w-full bg-[#FAF8F3] dark:bg-[#1E1B28] backdrop-blur-md rounded-[28px] p-3 sm:p-4 border border-[#EAE4D5] dark:border-white/10 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 sm:gap-4 shadow-sm"
      >
        {/* Brand & Studio Identity */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Grammar Studio
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                GRAMMAR LAB // A1-C2
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-300 dark:bg-white/10 hidden sm:block mx-1" />

          {/* Current Active Topic Indicator */}
          {currentTopic && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 shadow-xs">
              <GlovaLevelBadge level={currentTopic.cefrLevel} size="sm" />
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {currentTopic.titleEn}
              </span>
            </div>
          )}
        </div>

        {/* Cambridge Badge & Topic Counter */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end flex-wrap">
          <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEn ? `${topics.length} Grammar Topics` : `${topics.length} หัวข้อไวยากรณ์`}</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Grammar</span>
          </div>
        </div>
      </nav>

      {/* Main Title & Description */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {isEn ? 'English Grammar Studio & Applications' : 'ไวยากรณ์และการประยุกต์ใช้'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl font-sans">
          {isEn
            ? 'Understand sentence structures, grammar rules, and practice with real questions and clear explanations.'
            : 'เข้าใจโครงสร้างประโยค กฎไวยากรณ์ และฝึกฝนด้วยโจทย์จริงพร้อมคำอธิบายละเอียด'}
        </p>
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
              className={`touch-target px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-[#FA5D5D] text-white shadow-sm font-black'
                  : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-[#EAE4D5] dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
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
            <div className="w-full p-6 sm:p-7 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentTopic.cefrLevel} size="sm" />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {currentTopic.titleEn}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isEn ? currentTopic.titleEn : currentTopic.titleTh}
                </h3>
              </div>

              {/* Contextual Editorial Grammar Photography */}
              <div className="overflow-hidden rounded-[22px] border border-[#EAE4D5] dark:border-white/10 shadow-xs relative">
                <img
                  src="/images/learning/grammar_hero.jpg"
                  alt="Student mastering English grammar structures and sentence patterns"
                  width={800}
                  height={380}
                  className="w-full max-h-44 object-cover"
                />
              </div>

              {/* Remotion Educational Grammar Timeline Aspect Animation */}
              <div className="pt-1 w-full overflow-hidden rounded-[22px]">
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
                <div className="w-full p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2.5 shadow-xs">
                  <Lightbulb className="w-4 h-4 text-[#FA5D5D] shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="leading-relaxed font-semibold">{currentTopic.summaryTh}</span>
                </div>
              )}

              {/* Core Concept - Formatted as Full-Width Pedagogical Card without AI markdown symbols */}
              {currentTopic.conceptTh && (
                <div className="w-full p-4 sm:p-5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FA5D5D]" />
                    <span className="text-[11px] font-mono font-bold tracking-wider text-[#FA5D5D] uppercase">
                      {isEn ? 'Core Linguistic Concept' : 'หลักการและบริบทการนำไปใช้'}
                    </span>
                  </div>
                  <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
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
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                    <Sparkles className="w-3.5 h-3.5 text-[#FA5D5D]" aria-hidden="true" />
                    <span>{isEn ? 'Structure & Usage Rules:' : 'โครงสร้างและกฎการใช้งาน:'}</span>
                  </div>

                  <div className="space-y-2.5">
                    {currentTopic.rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-2 shadow-xs"
                      >
                        <div className="font-mono text-xs font-bold text-[#D98200] dark:text-[#FFBA38] bg-[#FEF5E5] dark:bg-[#2B2010] border border-[#FDE5BC] dark:border-amber-500/20 px-3 py-1 rounded-full inline-block break-word-safe">
                          {rule.formula}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {isEn && rule.explanationEn ? rule.explanationEn : rule.explanationTh}
                        </p>
                        <div className="pt-1.5 border-t border-[#EAE4D5] dark:border-white/10 text-[11px]">
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{rule.exampleEn}</p>
                          <p className="text-slate-500 dark:text-slate-400">{rule.exampleTh}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Common Pitfalls by Thai Learners */}
              {currentTopic.commonMistakes && currentTopic.commonMistakes.length > 0 && (
                <div className="pt-2 space-y-2 border-t border-[#EAE4D5] dark:border-white/10">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                    <span>{isEn ? 'Common Mistakes to Avoid:' : 'จุดผิดบ่อยที่ควรระวัง:'}</span>
                  </div>

                  <div className="space-y-2">
                    {currentTopic.commonMistakes.map((m, idx) => (
                      <div key={idx} className="p-3.5 rounded-[18px] bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600 dark:text-rose-400 line-through font-mono">
                            {m.incorrect}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                            {m.correct}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.reasonTh}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (6 cols): Dominant Practice Task with QuestionCard */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-1 px-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#FA5D5D]" aria-hidden="true" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isEn ? 'Comprehension Practice' : 'แบบฝึกหัดวัดความเข้าใจ'}
                </h4>
              </div>

              {displayedQuestions.length > 0 && (
                <span className="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold bg-white dark:bg-[#1E1B28] px-3.5 py-1 rounded-full border border-[#EAE4D5] dark:border-white/10 shadow-xs">
                  {isEn
                    ? `Question ${activeQuestionIdx + 1} of ${displayedQuestions.length}`
                    : `ข้อที่ ${activeQuestionIdx + 1} จาก ${displayedQuestions.length}`}
                </span>
              )}
            </div>

            {loadingQuestions && displayedQuestions.length === 0 && (
              <div className="min-h-[260px] flex items-center justify-center p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-[#EAE4D5] dark:border-white/10">
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
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={activeQuestionIdx === 0}
                    className="touch-target px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span>{isEn ? 'Previous' : 'ข้อก่อนหน้า'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="touch-target px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
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
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
