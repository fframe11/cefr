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
      {/* Top Header Banner - Unified Studio DNA */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-sky-50/50 dark:from-[#1E1B28] dark:to-[#171520] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 overflow-hidden shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 text-xs font-black uppercase tracking-wider">
              CEFR A1–B2 High-Yield
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold">
              {COLLOCATIONS_BANK.length} {isEn ? 'Essential Collocations' : 'คำคู่ยอดฮิตในข้อสอบ'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isEn ? 'CEFR Collocations & Phrasal Verbs' : 'คลัง 200 Collocations & Phrasal Verbs'}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            {isEn
              ? 'Master natural word pairings and prepositional collocations frequently tested in Oxford OOPT and Cambridge examinations.'
              : 'รวบรวมคำที่มักใช้คู่กันอย่างเป็นธรรมชาติและ Phrasal Verbs ที่ออกสอบบ่อยที่สุดในข้อสอบ CEFR พร้อมตัวอย่างประโยคจริง'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center bg-white dark:bg-[#1E1B28] p-1.5 rounded-full border border-slate-200/80 dark:border-white/10 shadow-2xs self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('study')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'study'
                ? 'bg-[#3B82F6] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isEn ? 'Study Bank (200)' : 'คลังคำศัพท์ (200 คำ)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-[#3B82F6] text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#3B82F6] text-white border-[#3B82F6] shadow-xs'
                        : 'bg-white dark:bg-[#1E1B28] text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5'
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
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isEn ? 'Search collocation or Thai...' : 'ค้นหาคำศัพท์หรือความหมาย...'}
                  className="w-full pl-9 pr-3.5 py-2 rounded-full bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#3B82F6]/20 shadow-2xs font-sans"
                />
              </div>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                aria-label="Filter by CEFR level"
                className="px-3.5 py-2 rounded-full bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden shadow-2xs cursor-pointer"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCollocations.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs hover:border-[#3B82F6]/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      #{item.num}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                        {item.category.replace('_', ' + ')}
                      </span>
                      <GlovaLevelBadge level={item.cefrLevel} size="sm" />
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {item.collocation}
                  </h3>
                  <p className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] mt-0.5">
                    {item.meaningTh}
                  </p>

                  <div className="mt-3 p-3 rounded-[16px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-slate-200/60 dark:border-white/10 text-xs space-y-1">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-mono text-[11px] sm:text-xs">
                      &quot;{item.exampleEn}&quot;
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-sans">
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
          <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                {isEn ? 'Question' : 'ข้อที่'} {currentQuizIdx + 1} / {COLLOCATION_PRACTICE_QUESTIONS.length}
              </span>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                {isEn ? 'Current Score:' : 'คะแนนที่ได้:'} {quizScore} / {Object.keys(quizSubmitted).length}
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetQuiz}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200/80 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isEn ? 'Restart Quiz' : 'เริ่มทำใหม่'}</span>
            </button>
          </div>

          {/* Question Card */}
          {currentQuestion && (
            <div className="p-6 sm:p-7 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[11px] font-black font-mono uppercase tracking-wider">
                  CEFR A1–B2 Trap Focus
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-2 leading-relaxed">
                  {currentQuestion.promptEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
                  {currentQuestion.promptTh}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer === opt.key;
                  let optStyle =
                    'border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#1E1B28] hover:border-[#3B82F6] shadow-2xs';

                  if (isSelected && !isCurrentSubmitted) {
                    optStyle = 'border-[#3B82F6] bg-blue-50/40 dark:bg-blue-950/20 text-slate-900 dark:text-blue-100 ring-2 ring-[#3B82F6]/20';
                  }

                  if (isCurrentSubmitted) {
                    if (opt.isCorrect) {
                      optStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (isSelected && !opt.isCorrect) {
                      optStyle = 'border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-300 line-through';
                    } else {
                      optStyle = 'opacity-50 border-slate-200/60 dark:border-white/5';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      type="button"
                      disabled={isCurrentSubmitted}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full p-3.5 rounded-[16px] border text-left flex items-center justify-between text-xs sm:text-sm font-medium transition-all cursor-pointer ${optStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center font-bold font-mono text-xs">
                          {opt.key}
                        </span>
                        <span className="font-sans leading-relaxed">{opt.text}</span>
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  disabled={currentQuizIdx === 0}
                  onClick={handlePrevQuestion}
                  className="px-4 py-2 rounded-full border border-slate-200/80 dark:border-white/10 text-xs font-bold disabled:opacity-30 cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  {isEn ? 'Previous' : 'ข้อย้อนหลัง'}
                </button>

                {!isCurrentSubmitted ? (
                  <button
                    type="button"
                    disabled={!currentAnswer}
                    onClick={handleSubmitQuestion}
                    className="px-5 py-2 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 text-white text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                  >
                    {isEn ? 'Check Answer' : 'ตรวจคำตอบ'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    disabled={currentQuizIdx === COLLOCATION_PRACTICE_QUESTIONS.length - 1}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold shadow-xs disabled:opacity-40 cursor-pointer active:scale-95"
                  >
                    <span>{isEn ? 'Next Question' : 'ข้อถัดไป'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Feedback Explanation */}
              {isCurrentSubmitted && (
                <div className="p-4 rounded-[18px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-slate-200/80 dark:border-white/10 text-xs space-y-1 shadow-2xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#3B82F6] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>{isEn ? 'Pedagogical Explanation' : 'คำอธิบายเชิงไวยากรณ์'}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {currentQuestion.explanationTh}
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed font-mono pt-1 border-t border-slate-200/40 dark:border-white/5">
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
