'use client';
import React, { useState, useMemo } from 'react';
import { COLLOCATIONS_BANK, COLLOCATION_PRACTICE_QUESTIONS, CollocationItem } from '../../data/collocationsBank';
import {
  BookOpen,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  GraduationCap,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { GlovaLevelBadge } from '../ui';

export const CollocationsView: React.FC = () => {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  // Filtered collocations
  const filteredCollocations = useMemo(() => {
    return COLLOCATIONS_BANK.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesLevel = selectedLevel === 'all' || item.cefrLevel === selectedLevel;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.collocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.meaningTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.exampleEn.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesLevel && matchesSearch;
    });
  }, [selectedCategory, selectedLevel, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: COLLOCATIONS_BANK.length };
    for (const c of COLLOCATIONS_BANK) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, []);

  const currentQuestion = COLLOCATION_PRACTICE_QUESTIONS[currentQuizIdx];
  const currentAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] : undefined;
  const isCurrentSubmitted = currentQuestion ? !!quizSubmitted[currentQuestion.id] : false;

  const handleSelectOption = (key: string) => {
    if (isCurrentSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: key }));
  };

  const handleSubmitQuestion = () => {
    if (!currentAnswer) return;
    setQuizSubmitted((prev) => ({ ...prev, [currentQuestion.id]: true }));
  };

  const handleNextQuestion = () => {
    if (currentQuizIdx < COLLOCATION_PRACTICE_QUESTIONS.length - 1) {
      setCurrentQuizIdx((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuizIdx > 0) {
      setCurrentQuizIdx((prev) => prev - 1);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted({});
    setCurrentQuizIdx(0);
  };

  const quizScore = useMemo(() => {
    let score = 0;
    for (const q of COLLOCATION_PRACTICE_QUESTIONS) {
      const ans = selectedAnswers[q.id];
      if (ans) {
        const opt = q.options.find((o) => o.key === ans);
        if (opt?.isCorrect) score += 1;
      }
    }
    return score;
  }, [selectedAnswers]);

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
              CEFR A1–B2 High-Yield
            </span>
            <span className="text-xs text-muted-foreground">
              {COLLOCATIONS_BANK.length} {isEn ? 'Essential Collocations' : 'คำคู่ยอดฮิตในข้อสอบ'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isEn ? 'CEFR Collocations & Phrasal Verbs' : 'คลัง 200 Collocations & Phrasal Verbs'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            {isEn
              ? 'Master natural word pairings and prepositional collocations frequently tested in Oxford OOPT and Cambridge examinations.'
              : 'รวบรวมคำที่มักใช้คู่กันอย่างเป็นธรรมชาติและ Phrasal Verbs ที่ออกสอบบ่อยที่สุดในข้อสอบ CEFR พร้อมตัวอย่างประโยคจริง'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'study'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEn ? 'Study Bank (200)' : 'คลังคำศัพท์ (200 คำ)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'Practice Quiz (20)' : 'แบบฝึกหัด (20 ข้อ)'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'study' ? (
        <div className="space-y-5">
          {/* Controls: Category Pills & Search */}
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', labelEn: 'All Types', labelTh: 'ทั้งหมด' },
                { id: 'verb_prep', labelEn: 'Verb + Prep', labelTh: 'กริยา + บุพบท' },
                { id: 'verb_noun', labelEn: 'Verb + Noun', labelTh: 'กริยา + คำนาม' },
                { id: 'adj_prep', labelEn: 'Adj + Prep', labelTh: 'คุณศัพท์ + บุพบท' },
                { id: 'phrasal_verb', labelEn: 'Phrasal Verbs', labelTh: 'กริยาวลี' },
              ].map((cat) => {
                const count = categoryCounts[cat.id] || 0;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{isEn ? cat.labelEn : cat.labelTh}</span>
                    <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & Level Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? 'Search collocation or Thai...' : 'ค้นหาคำศัพท์หรือความหมาย...'}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by CEFR level"
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 focus:outline-hidden"
              >
                <option value="all">Level: All</option>
                <option value="A1">A1</option>
                <option value="A2">A2</option>
                <option value="B1">B1</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="text-xs text-muted-foreground flex items-center justify-between">
            <span>
              {isEn ? 'Showing' : 'แสดง'} <strong>{filteredCollocations.length}</strong> {isEn ? 'items' : 'รายการ'}
            </span>
          </div>

          {/* Collocations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredCollocations.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{item.num}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5">
                        {item.category.replace('_', ' + ')}
                      </span>
                      <GlovaLevelBadge level={item.cefrLevel} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">
                    {item.collocation}
                  </h3>
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {item.meaningTh}
                  </p>

                  <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      "{item.exampleEn}"
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                      {item.exampleTh}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Quiz Mode */
        <div className="max-w-2xl mx-auto space-y-5">
          {/* Progress Header */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-muted-foreground">
                {isEn ? 'Question' : 'ข้อที่'} {currentQuizIdx + 1} / {COLLOCATION_PRACTICE_QUESTIONS.length}
              </span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {isEn ? 'Current Score:' : 'คะแนนที่ได้:'} {quizScore} / {Object.keys(quizSubmitted).length}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Restart Quiz' : 'เริ่มทำใหม่'}</span>
            </button>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xs space-y-5">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-bold font-mono uppercase tracking-wider">
                  CEFR A1–B2 Trap Focus
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-2 leading-relaxed">
                  {currentQuestion.promptEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {currentQuestion.promptTh}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer === opt.key;
                  let optStyle =
                    'border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700';

                  if (isSelected && !isCurrentSubmitted) {
                    optStyle = 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500';
                  }

                  if (isCurrentSubmitted) {
                    if (opt.isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 line-through';
                    } else {
                      optStyle = 'opacity-50 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isCurrentSubmitted}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between text-xs sm:text-sm font-medium transition-all cursor-pointer ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs">
                          {opt.key}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {isCurrentSubmitted && opt.isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                      {isCurrentSubmitted && isSelected && !opt.isCorrect && (
                        <XCircle className="w-4 h-4 text-rose-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit & Next Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={currentQuizIdx === 0}
                  onClick={handlePrevQuestion}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold disabled:opacity-30 cursor-pointer"
                >
                  {isEn ? 'Previous' : 'ข้อย้อนหลัง'}
                </button>

                {!isCurrentSubmitted ? (
                  <button
                    type="button"
                    disabled={!currentAnswer}
                    onClick={handleSubmitQuestion}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    {isEn ? 'Check Answer' : 'ตรวจคำตอบ'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={currentQuizIdx === COLLOCATION_PRACTICE_QUESTIONS.length - 1}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-bold shadow-xs disabled:opacity-40 cursor-pointer"
                  >
                    <span>{isEn ? 'Next Question' : 'ข้อถัดไป'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Feedback Explanation */}
              {isCurrentSubmitted && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-white/10 text-xs space-y-1 animate-fadeIn">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isEn ? 'Pedagogical Explanation' : 'คำอธิบายเชิงไวยากรณ์'}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentQuestion.explanationTh}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                    {currentQuestion.explanationEn}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
