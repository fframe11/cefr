'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { useTranslation } from '../../i18n';

// Crisp Native Timeline Component replacing blurry canvas animations
const NativeGrammarTimeline: React.FC<{
  tenseName: string;
  exampleSentence: string;
  cefrLevel: string;
  isEn: boolean;
}> = ({ tenseName, exampleSentence, cefrLevel, isEn }) => (
  <div className="w-full p-4 sm:p-5 rounded-[22px] bg-slate-900 text-white border border-slate-800 shadow-md space-y-3">
    <div className="flex items-center justify-between text-xs font-mono">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#FA5D5D] animate-pulse" />
        <span className="font-bold text-[#FA5D5D] uppercase tracking-wider text-[11px]">
          {isEn ? 'Grammar Timeline Aspect' : 'เส้นเวลาโครงสร้างไวยากรณ์ (Timeline Aspect)'}
        </span>
      </div>
      <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300 text-[10px] font-bold">
        {cefrLevel} Standard
      </span>
    </div>

    {/* Crisp Native Horizontal Axis */}
    <div className="relative pt-6 pb-2 px-2">
      <div className="w-full h-1 bg-slate-700 rounded-full relative">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between items-center px-4 sm:px-8">
          {/* Past */}
          <div className="flex flex-col items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-slate-900" />
            <span className="text-[10px] font-mono font-bold text-slate-400 mt-1.5 uppercase">Past</span>
          </div>

          {/* Present (Focus Point) */}
          <div className="flex flex-col items-center relative -top-1">
            <span className="w-5 h-5 rounded-full bg-[#FA5D5D] border-3 border-slate-900 shadow-[0_0_12px_#FA5D5D] animate-pulse" />
            <span className="text-[11px] font-mono font-black text-white mt-1 uppercase">Present</span>
            <span className="absolute -top-5 px-2 py-0.5 rounded text-[9px] font-bold bg-[#FA5D5D] text-white shadow-xs whitespace-nowrap">
              Action Point
            </span>
          </div>

          {/* Future */}
          <div className="flex flex-col items-center">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-600 border-2 border-slate-900" />
            <span className="text-[10px] font-mono font-bold text-slate-400 mt-1.5 uppercase">Future</span>
          </div>
        </div>
      </div>
    </div>

    <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
      <span className="font-bold text-amber-300 font-mono truncate">{tenseName}</span>
      <span className="text-[11px] text-slate-300 italic truncate">"{exampleSentence}"</span>
    </div>
  </div>
);

interface GrammarViewProps {
  onQuestionCompleted?: (questionId: string, isCorrect: boolean, weaknessTag: string) => void;
  activeTopicId?: string;
}

export const GrammarView: React.FC<GrammarViewProps> = ({
  onQuestionCompleted,
  activeTopicId,
}) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const [topics, setTopics] = useState<GrammarTopic[]>(GRAMMAR_BANK);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    activeTopicId || GRAMMAR_BANK[0]?.id || ''
  );
  const [activeGrammarTab, setActiveGrammarTab] = useState<'test' | 'study'>('test');
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
      {/* Top Header: Topic Selector Pills Carousel & Test/Study Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-white/10">
        {/* Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1 max-w-full">
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
                className={`touch-target px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#3B82F6] dark:bg-[#3B82F6] text-white shadow-xs font-black'
                    : 'bg-white dark:bg-[#1E1B28] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <GlovaLevelBadge level={topic.cefrLevel} size="sm" />
                <span className="truncate max-w-[170px]">
                  {isEn ? topic.titleEn : topic.titleTh}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab Switcher: Test vs Study */}
        {currentTopic && (
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveGrammarTab('test')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGrammarTab === 'test'
                  ? 'bg-[#3B82F6] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isEn ? 'Practice Test' : 'ทำแบบทดสอบ'}</span>
              {displayedQuestions.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeGrammarTab === 'test'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                }`}>
                  {displayedQuestions.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveGrammarTab('study')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeGrammarTab === 'study'
                  ? 'bg-[#3B82F6] text-white shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isEn ? 'Learn Concept' : 'เรียนรู้เนื้อหา'}</span>
            </button>
          </div>
        )}
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
      {error && topics.length === 0 && (
        <ErrorMessage message={error} onRetry={fetchTopics} />
      )}

      {/* 2. Main View Mode: Dedicated Test Tab (Matching Reference Images 1 & 2) */}
      {currentTopic && activeGrammarTab === 'test' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {/* Top Lesson Unit Header */}
          <div className="flex items-center justify-between pb-1 px-1">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Unit {topics.findIndex((t) => t.id === currentTopic.id) + 1 || 1}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {currentTopic.titleEn}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const nextIdx = (topics.findIndex((t) => t.id === currentTopic.id) + 1) % topics.length;
                setSelectedTopicId(topics[nextIdx].id);
                setActiveQuestionIdx(0);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer group"
            >
              <span>{isEn ? 'Next lesson' : 'บทเรียนถัดไป'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Hero Concept Card Banner with Orbiting Ellipse Art & Cosmic Swirl (from Image 2) */}
          <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-sky-50/50 dark:from-[#1E1B28] dark:to-[#171520] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 overflow-hidden shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              {/* Left Column: Headline + Orbiting Ellipse Artwork + Feature Pills */}
              <div className="space-y-6 max-w-lg">
                <div className="relative inline-block">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
                    One small word,<br />one big difference<br />in meaning
                  </h3>

                  {/* Playful orbiting ellipse SVG and colored dots matching reference screenshot */}
                  <svg
                    className="absolute -top-3 -left-4 w-64 h-32 pointer-events-none select-none opacity-85"
                    viewBox="0 0 256 128"
                    fill="none"
                    aria-hidden="true"
                  >
                    <ellipse cx="120" cy="64" rx="105" ry="46" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" transform="rotate(-7 120 64)" />
                    <ellipse cx="120" cy="64" rx="114" ry="40" stroke="#60A5FA" strokeWidth="1.2" strokeOpacity="0.4" transform="rotate(12 120 64)" />
                    <circle cx="230" cy="54" r="5" fill="#38BDF8" />
                    <circle cx="16" cy="88" r="4.5" fill="#FA5D5D" />
                    <circle cx="196" cy="106" r="3.5" fill="#FA5D5D" />
                    <circle cx="100" cy="18" r="3" fill="#38BDF8" />
                  </svg>
                </div>

                {/* Feature Micro-Badges: G, V, P */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
                    <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-extrabold flex items-center justify-center text-[10px]">
                      G
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {currentTopic.titleEn.split(' ')[0] || 'Articles'}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-extrabold flex items-center justify-center text-[10px] border border-slate-200 dark:border-white/10">
                      V
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Collocation: word pairs
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-white/10 border border-slate-200/80 dark:border-white/10 shadow-xs text-xs">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-extrabold flex items-center justify-center text-[10px] border border-slate-200 dark:border-white/10">
                      P
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Sentence stress
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Character Vector Art with Cosmic Wave (from Image 2) */}
              <div className="shrink-0 relative w-60 h-44 sm:w-72 sm:h-48 flex items-center justify-center select-none pointer-events-none">
                <svg width="250" height="180" viewBox="0 0 250 180" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path
                    d="M25 45 C65 15, 125 50, 155 85 C185 120, 235 115, 245 80 C255 45, 225 15, 190 20 C155 25, 135 60, 105 95 C75 130, 15 145, 10 105 C5 65, 0 60, 25 45 Z"
                    fill="#1E2235"
                  />
                  <circle cx="45" cy="50" r="14" fill="#3B82F6" />
                  <circle cx="45" cy="50" r="7.5" fill="#F8FAFC" />
                  <ellipse cx="45" cy="50" rx="20" ry="7.5" stroke="#93C5FD" strokeWidth="1.2" transform="rotate(-25 45 50)" />
                  <circle cx="210" cy="40" r="3" fill="#FA5D5D" />
                  <circle cx="225" cy="72" r="2" fill="#FFFFFF" />
                  <circle cx="175" cy="105" r="2.5" fill="#38BDF8" />
                  <circle cx="85" cy="125" r="2" fill="#FFFFFF" />
                  <rect x="120" y="65" width="28" height="42" rx="9" fill="#3B82F6" />
                  <rect x="122" y="105" width="11" height="38" rx="3.5" fill="#1E293B" />
                  <rect x="136" y="105" width="11" height="38" rx="3.5" fill="#1E293B" />
                  <rect x="119" y="141" width="15" height="5.5" rx="2.5" fill="#FFFFFF" />
                  <rect x="135" y="141" width="15" height="5.5" rx="2.5" fill="#FFFFFF" />
                  <circle cx="134" cy="48" r="10" fill="#FBCFE8" />
                  <path d="M124 45 C124 38, 144 38, 144 45 Z" fill="#1E293B" />
                  <rect x="130" y="74" width="8" height="14" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
                </svg>
              </div>
            </div>
          </div>

          {/* Skill Navigation Tabs with Blue Underline Indicator (from Image 1 & 2) */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto border-b border-slate-200/80 dark:border-white/10 pb-0.5 scrollbar-none pt-1">
            {[
              { key: 'reading', label: 'Reading', route: '/reading' },
              { key: 'grammar', label: 'Grammar', route: '/grammar' },
              { key: 'pronunciation', label: 'Pronunciation', route: '/speaking' },
              { key: 'listening', label: 'Listening', route: '/listening' },
              { key: 'vocabulary', label: 'Vocabulary', route: '/vocabulary' },
              { key: 'speaking', label: 'Speaking', route: '/speaking' },
            ].map((skill) => {
              const isActive = skill.key === 'grammar';
              return (
                <button
                  key={skill.key}
                  type="button"
                  onClick={() => {
                    if (!isActive && skill.route) {
                      router.push(skill.route);
                    }
                  }}
                  className={`relative pb-3 text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-slate-900 dark:text-white font-extrabold'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{skill.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Task / Instruction Header (from Image 1 & 2) */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#2563EB] dark:text-blue-400 font-extrabold text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                Grammar Application
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium pl-8.5">
              <span className="font-extrabold text-slate-900 dark:text-white mr-2">A</span>
              Choose the correct form to complete each sentence according to grammar rules.
            </p>
          </div>

          {loadingQuestions && displayedQuestions.length === 0 && (
            <div className="min-h-[280px] flex items-center justify-center p-8 bg-white dark:bg-[#1E1B28] rounded-[28px] border border-[#EAE4D5] dark:border-white/10">
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
                  ? 'Our academic team is currently preparing practice sets for this tier. Please select another grammar topic from the sidebar to continue.'
                  : 'ยังไม่มีแบบฝึกหัดสำหรับหัวข้อนี้ในขณะนี้ กรุณาเลือกหัวข้อไวยากรณ์หรือระดับ CEFR อื่นจากเมนูด้านซ้ายเพื่อเริ่มฝึกฝน'
              }
            />
          )}

          {/* Stacked Question Cards matching Image 1 & Image 2 (Question 1, Question 2 ...) */}
          {displayedQuestions.length > 0 && (
            <div className="space-y-5">
              {displayedQuestions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  questionNumber={idx + 1}
                  totalQuestions={displayedQuestions.length}
                  onAnswer={(selectedKey, isCorrect) => {
                    onQuestionCompleted?.(q.id, isCorrect, q.weaknessTag);
                  }}
                  showExplanationImmediately={true}
                />
              ))}

              {/* Action Bar for Progression */}
              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => {
                    const prevIdx = (topics.findIndex((t) => t.id === currentTopic.id) - 1 + topics.length) % topics.length;
                    setSelectedTopicId(topics[prevIdx].id);
                    setActiveQuestionIdx(0);
                  }}
                  className="touch-target px-5 py-2.5 rounded-full bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                  <span>{isEn ? 'Previous Topic' : 'หัวข้อก่อนหน้า'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextIdx = (topics.findIndex((t) => t.id === currentTopic.id) + 1) % topics.length;
                    setSelectedTopicId(topics[nextIdx].id);
                    setActiveQuestionIdx(0);
                  }}
                  className="touch-target px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  <span>{isEn ? 'Next Topic' : 'หัวข้อถัดไป'}</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. Main View Mode: Dedicated Study Tab (Pedagogical Concepts & Rules Only) */}
      {currentTopic && activeGrammarTab === 'study' && (
        <div className="max-w-4xl mx-auto w-full space-y-6">
          <div className="w-full p-6 sm:p-8 space-y-6 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-[#EAE4D5] dark:border-white/10 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE4D5] dark:border-white/10 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GlovaLevelBadge level={currentTopic.cefrLevel} size="sm" />
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {currentTopic.titleEn}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isEn ? currentTopic.titleEn : currentTopic.titleTh}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveGrammarTab('test')}
                className="px-5 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-2 transition-all shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <span>{isEn ? 'Start Practice Test' : 'ไปทำแบบทดสอบ'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Contextual Editorial Photography */}
            <div className="overflow-hidden rounded-[22px] border border-[#EAE4D5] dark:border-white/10 shadow-xs relative">
              <img
                src="/images/learning/grammar_hero.jpg"
                alt="Student mastering English grammar structures and sentence patterns"
                width={800}
                height={380}
                className="w-full max-h-52 object-cover"
              />
            </div>

            {/* Crisp Native Grammar Timeline Aspect */}
            <NativeGrammarTimeline
              tenseName={currentTopic.titleEn}
              exampleSentence={currentTopic.rules?.[0]?.exampleEn || 'I have completed the task.'}
              cefrLevel={currentTopic.cefrLevel}
              isEn={isEn}
            />

            {currentTopic.summaryTh && (
              <div className="w-full p-4.5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 text-xs sm:text-sm text-slate-700 dark:text-slate-200 flex items-start gap-2.5 shadow-xs">
                <Lightbulb className="w-4 h-4 text-[#FA5D5D] shrink-0 mt-0.5" aria-hidden="true" />
                <span className="leading-relaxed font-semibold">{currentTopic.summaryTh}</span>
              </div>
            )}

            {/* Core Concept - Formatted as Full-Width Pedagogical Card */}
            {currentTopic.conceptTh && (
              <div className="w-full p-5 sm:p-6 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FA5D5D]" />
                  <span className="text-[11px] font-mono font-bold tracking-wider text-[#FA5D5D] uppercase">
                    {isEn ? 'Core Linguistic Concept' : 'หลักการและบริบทการนำไปใช้'}
                  </span>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentTopic.rules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-4.5 rounded-[22px] bg-[#FAF8F3] dark:bg-[#252131] border border-[#EAE4D5] dark:border-white/10 space-y-2.5 shadow-xs"
                    >
                      <div className="font-mono text-xs font-bold text-[#D98200] dark:text-[#FFBA38] bg-[#FEF5E5] dark:bg-[#2B2010] border border-[#FDE5BC] dark:border-amber-500/20 px-3 py-1 rounded-full inline-block break-word-safe">
                        {rule.formula}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {isEn && rule.explanationEn ? rule.explanationEn : rule.explanationTh}
                      </p>
                      <div className="pt-2 border-t border-[#EAE4D5] dark:border-white/10 text-[11px] space-y-0.5">
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
              <div className="pt-2 space-y-3 border-t border-[#EAE4D5] dark:border-white/10">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" aria-hidden="true" />
                  <span>{isEn ? 'Common Mistakes to Avoid:' : 'จุดผิดบ่อยที่ควรระวัง:'}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentTopic.commonMistakes.map((m, idx) => (
                    <div key={idx} className="p-4 rounded-[18px] bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 text-xs space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-rose-600 dark:text-rose-400 line-through font-mono">
                          {m.incorrect}
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          {m.correct}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{m.reasonTh}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready to Practice Call-To-Action Banner */}
            <div className="pt-4 border-t border-[#EAE4D5] dark:border-white/10">
              <div className="p-5 rounded-[22px] bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border border-rose-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {isEn ? 'Understood the rules?' : 'เข้าใจหลักการและโครงสร้างแล้วใช่ไหม?'}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {isEn
                      ? 'Test your understanding with targeted CEFR exercises right now.'
                      : 'ทดสอบความเข้าใจด้วยชุดโจทย์วัดระดับ CEFR ประจำหัวข้อนี้ได้ทันที'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGrammarTab('test')}
                  className="px-6 py-2.5 rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEn ? 'Start Practice Test' : 'เริ่มทำแบบทดสอบเลย'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
