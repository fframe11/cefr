'use client';
import React, { useState } from 'react';
import part2Data from '../../data/ooptPart2Meaning.json';
import part3Data from '../../data/ooptPart3Cloze.json';
import {
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  Lightbulb,
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface DialogueLine {
  speaker: string;
  text: string;
}

interface MeaningOption {
  key: string;
  text: string;
  isCorrect: boolean;
  feedbackTh: string;
}

interface MeaningItem {
  id: string;
  part: string;
  titleTh: string;
  cefrLevel: string;
  dialogue: DialogueLine[];
  options: MeaningOption[];
  explanationTh: string;
  explanationEn: string;
  pragmaticFocus: string;
}

interface ClozeGapItem {
  gapNumber: number;
  targetWord: string;
  acceptableAlternatives: string[];
  pos: string;
  explanationTh: string;
}

interface ClozePassage {
  id: string;
  title: string;
  genre: string;
  cefrLevel: string;
  passageWithGaps: string;
  items: ClozeGapItem[];
}

export const OoptPracticeView: React.FC = () => {
  const { language } = useTranslation();
  const isEn = language === 'en';

  const [activeTab, setActiveTab] = useState<'meaning' | 'cloze'>('meaning');

  // Part 2 Meaning State
  const meaningItems = part2Data as MeaningItem[];
  const [currentMeaningIdx, setCurrentMeaningIdx] = useState(0);
  const [selectedMeaningAnswers, setSelectedMeaningAnswers] = useState<Record<string, string>>({});

  // Part 3 Cloze State
  const clozePassages = part3Data as ClozePassage[];
  const [currentClozeIdx, setCurrentClozeIdx] = useState(0);
  const [clozeInputs, setClozeInputs] = useState<Record<string, Record<number, string>>>({});
  const [clozeSubmitted, setClozeSubmitted] = useState<Record<string, boolean>>({});
  const [showClozeHints, setShowClozeHints] = useState(false);

  const currentMeaning = meaningItems[currentMeaningIdx] || meaningItems[0];
  const currentCloze = clozePassages[currentClozeIdx] || clozePassages[0];

  // Part 2 handlers
  const handleSelectMeaningOption = (itemId: string, optionKey: string) => {
    setSelectedMeaningAnswers((prev) => ({
      ...prev,
      [itemId]: optionKey,
    }));
  };

  // Part 3 handlers
  const handleClozeInputChange = (passageId: string, gapNum: number, value: string) => {
    setClozeInputs((prev) => ({
      ...prev,
      [passageId]: {
        ...(prev[passageId] || {}),
        [gapNum]: value,
      },
    }));
  };

  const handleCheckCloze = (passageId: string) => {
    setClozeSubmitted((prev) => ({
      ...prev,
      [passageId]: true,
    }));
  };

  const handleResetCloze = (passageId: string) => {
    setClozeInputs((prev) => ({
      ...prev,
      [passageId]: {},
    }));
    setClozeSubmitted((prev) => ({
      ...prev,
      [passageId]: false,
    }));
  };

  // Render passage with inputs for gaps
  const renderClozePassage = (passage: ClozePassage) => {
    const rawText = passage.passageWithGaps;
    const isChecked = clozeSubmitted[passage.id] || false;
    const userInputs = clozeInputs[passage.id] || {};

    // Split text by gap tokens like [gap_1], [gap_2]
    const parts = rawText.split(/(\[gap_\d+\])/g);

    return (
      <div className="text-sm md:text-base leading-relaxed text-slate-800 dark:text-slate-200 font-sans space-y-3">
        <p className="inline leading-loose">
          {parts.map((part, index) => {
            const gapMatch = part.match(/\[gap_(\d+)\]/);
            if (gapMatch) {
              const gapNum = parseInt(gapMatch[1], 10);
              const gapDef = passage.items.find((it) => it.gapNumber === gapNum);
              const userVal = (userInputs[gapNum] || '').trim();

              const acceptable = [
                gapDef?.targetWord.toLowerCase(),
                ...(gapDef?.acceptableAlternatives.map((a) => a.toLowerCase()) || []),
              ];
              const isCorrect = acceptable.includes(userVal.toLowerCase());

              let inputBorder = 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900';
              if (isChecked) {
                inputBorder = isCorrect
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold'
                  : 'border-rose-500 bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 line-through';
              }

              return (
                <span key={index} className="inline-block mx-1.5 my-1 align-middle">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold inline-flex items-center justify-center">
                      {gapNum}
                    </span>
                    <input
                      type="text"
                      disabled={isChecked}
                      value={userInputs[gapNum] || ''}
                      onChange={(e) =>
                        handleClozeInputChange(passage.id, gapNum, e.target.value)
                      }
                      placeholder={showClozeHints ? gapDef?.pos : '...'}
                      className={`w-28 sm:w-32 px-2.5 py-1 text-xs md:text-sm text-center rounded-md border font-mono shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden transition-all ${inputBorder}`}
                    />
                    {isChecked && !isCorrect && (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono ml-1">
                        [{gapDef?.targetWord}]
                      </span>
                    )}
                  </span>
                </span>
              );
            }
            return <span key={index}>{part}</span>;
          })}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 md:p-8 text-white border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold uppercase tracking-wider">
              {isEn ? 'Oxford OOPT Practice Studio' : 'แบบฝึกหัดเสมือนจริง Oxford OOPT'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white/10 text-slate-300 text-xs font-mono font-medium">
              CEFR A1–B2 Calibration
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {isEn
              ? 'Focus on Meaning & Connected Open Cloze'
              : 'ฝึกทำข้อสอบ OOPT: Part 2 การตีความบทสนทนา และ Part 3 เติมคำในบทความ'}
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            {isEn
              ? 'Practice authentic Oxford Online Placement Test sections: Part 2 focuses on pragmatics, conversational implicatures, and idioms. Part 3 tests structural grammatical cohesion via connected text gap-fills.'
              : 'ฝึกฝน 2 ส่วนสำคัญของ OOPT ที่ไม่มีในข้อสอบทั่วไป: Part 2 วัดความเข้าใจความหมายแฝงและสำนวนในบทสนทนา (20 ข้อ) และ Part 3 วัดไวยากรณ์เชื่อมโยงประโยคผ่านบทความต่อเนื่อง (6 บทความ 42 ช่องว่าง)'}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-3 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 max-w-md border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('meaning')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'meaning'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Part 2: Meaning ({meaningItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('cloze')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs md:text-sm font-bold transition-all ${
            activeTab === 'cloze'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Part 3: Open Cloze ({clozePassages.length})</span>
        </button>
      </div>

      {/* Tab 1: Part 2 Focus on Meaning in Conversation */}
      {activeTab === 'meaning' && (
        <div className="space-y-6">
          {/* Question Carousel Navigator */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setCurrentMeaningIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentMeaningIdx === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isEn ? 'Previous' : 'ข้อย้อนหลัง'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                Item {currentMeaningIdx + 1} of {meaningItems.length}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                {currentMeaning.cefrLevel}
              </span>
            </div>

            <button
              onClick={() =>
                setCurrentMeaningIdx((prev) =>
                  Math.min(meaningItems.length - 1, prev + 1)
                )
              }
              disabled={currentMeaningIdx === meaningItems.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>{isEn ? 'Next' : 'ข้อถัดไป'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dialogue & Question Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Pragmatic Focus: {currentMeaning.pragmaticFocus.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentMeaning.id}
              </span>
            </div>

            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">
              {currentMeaning.titleTh}
            </h3>

            {/* Two-Speaker Dialogue Speech Bubbles */}
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-4">
              {currentMeaning.dialogue.map((line, lIdx) => {
                const isFirst = lIdx === 0;
                return (
                  <div
                    key={lIdx}
                    className={`flex items-start gap-3 ${
                      isFirst ? 'justify-start' : 'justify-start pl-4 md:pl-8'
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isFirst
                          ? 'bg-indigo-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {line.speaker[0]}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl text-sm max-w-xl shadow-xs ${
                        isFirst
                          ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-slate-900 dark:text-indigo-100 border border-indigo-200/60 dark:border-indigo-900/60 rounded-tl-xs'
                      }`}
                    >
                      <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {line.speaker}
                      </span>
                      <p className="font-mono text-sm leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 3-Option Multiple Choice */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {isEn ? 'What does the second speaker mean?' : 'ผู้พูดคนที่สองหมายความว่าอย่างไร?'}
              </span>

              <div className="space-y-2.5">
                {currentMeaning.options.map((opt) => {
                  const selectedKey = selectedMeaningAnswers[currentMeaning.id];
                  const isSelected = selectedKey === opt.key;
                  const isAnswered = !!selectedKey;

                  let optionStyle =
                    'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-indigo-400';

                  if (isAnswered) {
                    if (opt.isCorrect) {
                      optionStyle =
                        'bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs';
                    } else if (isSelected) {
                      optionStyle =
                        'bg-rose-500 text-white border-rose-600 font-bold';
                    } else {
                      optionStyle =
                        'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() =>
                        handleSelectMeaningOption(currentMeaning.id, opt.key)
                      }
                      className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left text-xs md:text-sm transition-all ${optionStyle}`}
                    >
                      <span className="w-6 h-6 rounded-md bg-black/10 dark:bg-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {opt.key}
                      </span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Answer Explanation */}
            {selectedMeaningAnswers[currentMeaning.id] && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs md:text-sm text-slate-700 dark:text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>{isEn ? 'Pragmatic Analysis & Explanation' : 'การวิเคราะห์เจตนาและความหมายแฝง'}</span>
                </div>
                <p className="leading-relaxed">{currentMeaning.explanationTh}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {currentMeaning.explanationEn}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Part 3 Focus on Form (Connected Open Cloze) */}
      {activeTab === 'cloze' && (
        <div className="space-y-6">
          {/* Passage Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {clozePassages.map((p, pIdx) => {
              const isSelected = currentClozeIdx === pIdx;
              const isDone = clozeSubmitted[p.id];
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentClozeIdx(pIdx)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="font-mono">{p.cefrLevel}</span>
                  <span>{p.title}</span>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          {/* Active Cloze Passage Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                    {currentCloze.cefrLevel} Standard
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Genre: {currentCloze.genre}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {currentCloze.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClozeHints((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    showClozeHints
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>{showClozeHints ? 'Hide Hints' : 'Show PoS Hints'}</span>
                </button>

                <button
                  onClick={() => handleResetCloze(currentCloze.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Reset' : 'ล้างคำตอบ'}</span>
                </button>
              </div>
            </div>

            {/* Passage Body with Inline Inputs */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/70">
              {renderClozePassage(currentCloze)}
            </div>

            {/* Check Answers Action Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Type ONE word per gap (grammar glue word: preposition, article, pronoun, auxiliary).'
                  : 'พิมพ์คำตอบ 1 คำต่อช่องว่าง (คำเชื่อม, บุพบท, คำสรรพนาม หรือกริยาช่วย)'}
              </span>

              <button
                onClick={() => handleCheckCloze(currentCloze.id)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs md:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isEn ? 'Check Answers' : 'ตรวจคำตอบทั้งหมด'}</span>
              </button>
            </div>

            {/* Explanations Table after checking */}
            {clozeSubmitted[currentCloze.id] && (
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  {isEn ? 'Detailed Gap-by-Gap Solutions' : 'เฉลยและคำอธิบายไวยากรณ์ทีละช่อง'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentCloze.items.map((gap) => {
                    const userVal = (
                      clozeInputs[currentCloze.id]?.[gap.gapNumber] || ''
                    ).trim();
                    const acceptable = [
                      gap.targetWord.toLowerCase(),
                      ...gap.acceptableAlternatives.map((a) => a.toLowerCase()),
                    ];
                    const isCorrect = acceptable.includes(userVal.toLowerCase());

                    return (
                      <div
                        key={gap.gapNumber}
                        className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                          isCorrect
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            Gap {gap.gapNumber}: Target: &quot;{gap.targetWord}&quot;
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 uppercase">
                            {gap.pos}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 font-sans">
                          {gap.explanationTh}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
