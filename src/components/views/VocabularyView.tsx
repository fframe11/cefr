import React, { useState } from 'react';
import { VOCABULARY_BANK } from '../../data/vocabularyBank';
import { VocabularyWord, CEFRLevel } from '../../types';
import {
  Volume2,
  Search,
  Filter,
  CheckCircle,
  RotateCw,
  LayoutGrid,
  ListFilter,
  Layers,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { AudioService } from '../../services/audioService';

interface VocabularyViewProps {
  masteredWordIds: string[];
  onToggleMastery: (wordId: string, isMastered: boolean) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  masteredWordIds,
  onToggleMastery,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'flashcard'>('cards');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Filter words
  const filteredWords = VOCABULARY_BANK.filter((w) => {
    const matchesLevel = selectedLevel === 'ALL' || w.cefrLevel === selectedLevel;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      w.word.toLowerCase().includes(q) ||
      w.meaningTh.toLowerCase().includes(q) ||
      w.topic.toLowerCase().includes(q);
    return matchesLevel && matchesSearch;
  });

  const handleSpeak = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    AudioService.speak(word, { lang: 'en-GB', rate: 0.9 });
  };

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIdx((prev) => (prev + 1) % filteredWords.length);
  };

  const currentFlashcard = filteredWords[flashcardIdx] || filteredWords[0];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Controls: Search, Level Filter, View Mode Toggle */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาคำศัพท์ ความหมายภาษาไทย หรือหมวดหมู่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 self-end md:self-auto border border-border rounded-lg p-1 bg-muted/30">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors touch-target ${
              viewMode === 'cards'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">การ์ด</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors touch-target ${
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ตาราง</span>
          </button>
          <button
            onClick={() => setViewMode('flashcard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors touch-target ${
              viewMode === 'flashcard'
                ? 'bg-card text-foreground shadow-xs border border-border'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>
        </div>
      </div>

      {/* CEFR Level Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs text-muted-foreground font-medium shrink-0 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> ระดับ:
        </span>
        {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => {
              setSelectedLevel(lvl);
              setFlashcardIdx(0);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors touch-target border ${
              selectedLevel === lvl
                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                : 'bg-muted/40 text-muted-foreground hover:text-foreground border-border/60'
            }`}
          >
            {lvl === 'ALL' ? 'ทั้งหมด' : `CEFR ${lvl}`}
          </button>
        ))}
      </div>

      {/* Mode 1: Flashcard Spaced Repetition Mode */}
      {viewMode === 'flashcard' && currentFlashcard && (
        <div className="max-w-md mx-auto space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[280px] p-6 rounded-2xl bg-card border border-border/80 shadow-md flex flex-col justify-between items-center text-center transition-all hover:border-primary/50 relative select-none"
          >
            <div className="w-full flex items-center justify-between text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold font-mono">
                {currentFlashcard.cefrLevel}
              </span>
              <span>
                {flashcardIdx + 1} จาก {filteredWords.length}
              </span>
            </div>

            {!isFlipped ? (
              <div className="my-auto space-y-2">
                <h3 className="text-3xl font-bold text-foreground tracking-tight font-mono">
                  {currentFlashcard.word}
                </h3>
                <p className="text-xs text-muted-foreground">{currentFlashcard.ipa}</p>
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                  {currentFlashcard.partOfSpeech}
                </span>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  (แตะการ์ดเพื่อดูความหมายและตัวอย่างประโยค)
                </p>
              </div>
            ) : (
              <div className="my-auto space-y-3 animate-in fade-in duration-200">
                <h4 className="text-xl font-bold text-primary">{currentFlashcard.meaningTh}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {currentFlashcard.meaningEn}
                </p>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs text-left">
                  <p className="font-medium text-foreground">{currentFlashcard.exampleSentenceEn}</p>
                  <p className="text-muted-foreground mt-1">{currentFlashcard.exampleSentenceTh}</p>
                </div>
              </div>
            )}

            <div className="w-full flex items-center justify-between pt-4 border-t border-border/40">
              <button
                onClick={(e) => handleSpeak(currentFlashcard.word, e)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted touch-target"
                title="ฟังการออกเสียง"
              >
                <Volume2 className="w-5 h-5 text-primary" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastery(
                    currentFlashcard.id,
                    !masteredWordIds.includes(currentFlashcard.id)
                  );
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors touch-target ${
                  masteredWordIds.includes(currentFlashcard.id)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {masteredWordIds.includes(currentFlashcard.id) ? 'จำได้แล้ว' : 'ทำเครื่องหมายว่าจำได้'}
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={handleNextFlashcard}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-xs hover:bg-primary/90 transition-all touch-target"
          >
            คำถัดไป
          </button>
        </div>
      )}

      {/* Mode 2: Responsive Card Grid (Ideal on Mobile & Tablet) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => {
            const isMastered = masteredWordIds.includes(word.id);
            return (
              <div
                key={word.id}
                className={`p-4 rounded-xl bg-card border transition-all flex flex-col justify-between shadow-xs ${
                  isMastered ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/60 hover:border-border'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {word.cefrLevel}
                    </span>
                    <span className="text-[11px] text-muted-foreground capitalize">
                      {word.partOfSpeech} • {word.topic}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-bold text-foreground font-mono">{word.word}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{word.ipa}</span>
                    <button
                      onClick={() => handleSpeak(word.word)}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors touch-target"
                      title="ฟังเสียงคำศัพท์"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-primary mt-1">{word.meaningTh}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{word.meaningEn}</p>

                  {/* Example Sentence Box */}
                  <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/40 text-xs">
                    <p className="font-medium text-foreground">{word.exampleSentenceEn}</p>
                    <p className="text-muted-foreground mt-0.5">{word.exampleSentenceTh}</p>
                  </div>

                  {/* Collocations */}
                  {word.collocations && word.collocations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {word.collocations.map((c, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    ระดับความจำ: {isMastered ? '100%' : `${word.masteryPercentage}%`}
                  </span>
                  <button
                    onClick={() => onToggleMastery(word.id, !isMastered)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-colors touch-target ${
                      isMastered
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isMastered ? 'จำได้แล้ว' : 'จำได้'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: Desktop Responsive Table (adapts gracefully) */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 border-b border-border/60 text-xs text-muted-foreground font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">คำศัพท์ (Word)</th>
                  <th className="py-3 px-3">CEFR</th>
                  <th className="py-3 px-3">ชนิดคำ (POS)</th>
                  <th className="py-3 px-4">ความหมาย (Meaning)</th>
                  <th className="py-3 px-4 hidden md:table-cell">ตัวอย่างประโยค (Example)</th>
                  <th className="py-3 px-4 text-right">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredWords.map((w) => {
                  const isMastered = masteredWordIds.includes(w.id);
                  return (
                    <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <span>{w.word}</span>
                          <button
                            onClick={() => handleSpeak(w.word)}
                            className="p-1 text-muted-foreground hover:text-primary transition-colors touch-target"
                            title="ฟังเสียง"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-normal font-sans block">
                          {w.ipa}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {w.cefrLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground capitalize">
                        {w.partOfSpeech}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-foreground block">{w.meaningTh}</span>
                        <span className="text-xs text-muted-foreground">{w.meaningEn}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-xs leading-relaxed max-w-xs">
                        <p className="text-foreground">{w.exampleSentenceEn}</p>
                        <p className="text-muted-foreground">{w.exampleSentenceTh}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onToggleMastery(w.id, !isMastered)}
                          className={`text-xs px-2.5 py-1 rounded-md border font-medium inline-flex items-center gap-1 transition-colors touch-target ${
                            isMastered
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isMastered ? 'จำได้' : 'ยังไม่จำ'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredWords.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p>ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา</p>
        </div>
      )}
    </div>
  );
};
