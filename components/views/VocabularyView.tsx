'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
import { getVocabulary, mapVocabularyDtoToWord } from '../../lib/api/content/vocabulary';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../i18n';

interface VocabularyViewProps {
  masteredWordIds: string[];
  onToggleMastery: (wordId: string, isMastered: boolean) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  masteredWordIds,
  onToggleMastery,
}) => {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'flashcard'>('cards');
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Content API State
  const [words, setWords] = useState<VocabularyWord[]>(VOCABULARY_BANK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabularyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVocabulary({
        cefr_level: selectedLevel === 'ALL' ? undefined : selectedLevel,
        search: searchQuery.trim() || undefined,
        page: 1,
        limit: 100,
      });

      if (res && res.items && res.items.length > 0) {
        const mapped = res.items.map((dto) => mapVocabularyDtoToWord(dto, masteredWordIds));
        setWords(mapped);
      } else {
        // Fallback to static bank with applied filters if API has no records yet
        const fallback = VOCABULARY_BANK.filter((w) => {
          const matchesLevel = selectedLevel === 'ALL' || w.cefrLevel === selectedLevel;
          const q = searchQuery.toLowerCase();
          const matchesSearch =
            !q ||
            w.word.toLowerCase().includes(q) ||
            w.meaningTh.toLowerCase().includes(q) ||
            w.topic.toLowerCase().includes(q);
          return matchesLevel && matchesSearch;
        });
        setWords(fallback);
      }
    } catch (err: any) {
      console.warn('[VocabularyView] API fetch failed, falling back to static vocabulary:', err?.message || err);
      setError(err?.friendlyMessage || 'ไม่สามารถโหลดข้อมูลคำศัพท์จากเซิร์ฟเวอร์ได้ กำลังแสดงข้อมูลสำรอง');
      // Graceful offline fallback
      setWords(VOCABULARY_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, searchQuery, masteredWordIds]);

  useEffect(() => {
    fetchVocabularyData();
  }, [fetchVocabularyData]);

  // Filter words
  const filteredWords = words.filter((w) => {
    const matchesLevel = selectedLevel === 'ALL' || w.cefrLevel === selectedLevel;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
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
    setFlashcardIdx((prev) => (prev + 1) % Math.max(1, filteredWords.length));
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

      {/* Loading state indicator */}
      {loading && words.length === 0 && (
        <div className="p-12 flex justify-center">
          <LoadingSpinner size="lg" text="กำลังโหลดคลังคำศัพท์..." />
        </div>
      )}

      {/* Error notification banner */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchVocabularyData}
        />
      )}

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
                  ({t('vocabulary.card_hint')})
                </p>
              </div>
            ) : (
              <div className="my-auto space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-xl font-bold text-primary">{currentFlashcard.meaningTh}</h4>
                  <button
                    onClick={(e) => handleSpeak(currentFlashcard.word, e)}
                    className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors touch-target"
                    title="ฟังเสียงคำอ่าน"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{currentFlashcard.meaningEn}</p>
                <div className="pt-2 text-xs text-left bg-muted/40 p-3 rounded-xl border border-border/40">
                  <p className="font-medium text-foreground">{currentFlashcard.exampleSentenceEn}</p>
                  <p className="text-muted-foreground mt-1">{currentFlashcard.exampleSentenceTh}</p>
                </div>
              </div>
            )}

            <div className="w-full flex items-center justify-between pt-4 border-t border-border/40">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMastery(currentFlashcard.id, !masteredWordIds.includes(currentFlashcard.id));
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors touch-target ${
                  masteredWordIds.includes(currentFlashcard.id)
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{masteredWordIds.includes(currentFlashcard.id) ? 'จำได้แล้ว' : 'ยังจำไม่ได้'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextFlashcard();
                }}
                className="text-xs px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-1 shadow-xs hover:bg-primary/90 transition-colors touch-target"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>คำถัดไป</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Card Grid View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((w) => {
            const isMastered = masteredWordIds.includes(w.id);
            return (
              <div
                key={w.id}
                className="p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {w.cefrLevel}
                    </span>
                    <span className="text-[11px] text-muted-foreground capitalize font-medium">
                      {w.partOfSpeech} • {w.topic}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-foreground font-mono tracking-tight">
                      {w.word}
                    </h3>
                    <button
                      onClick={() => handleSpeak(w.word)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors touch-target"
                      title="ฟังเสียงคำอ่าน"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mb-2">{w.ipa}</p>

                  <p className="text-sm font-semibold text-foreground">{w.meaningTh}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{w.meaningEn}</p>

                  <div className="mt-3 pt-2.5 border-t border-border/40 text-xs space-y-1">
                    <p className="text-foreground/90 font-medium line-clamp-2">{w.exampleSentenceEn}</p>
                    <p className="text-muted-foreground line-clamp-1">{w.exampleSentenceTh}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <button
                    onClick={() => onToggleMastery(w.id, !isMastered)}
                    className={`text-xs px-2.5 py-1 rounded-md border font-medium flex items-center gap-1 transition-colors touch-target ${
                      isMastered
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-muted text-muted-foreground hover:text-foreground border-border'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{isMastered ? 'จำได้แล้ว' : 'ทำเครื่องหมายว่าจำได้'}</span>
                  </button>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    {isMastered ? 'Mastered' : 'Learning'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mode 3: Dense Table View */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-border/70 overflow-hidden bg-card shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium text-xs">
                <tr>
                  <th className="py-3 px-4">{t('vocabulary.word')}</th>
                  <th className="py-3 px-3">CEFR</th>
                  <th className="py-3 px-3">{t('vocabulary.pos')}</th>
                  <th className="py-3 px-4">{t('vocabulary.meaning')}</th>
                  <th className="py-3 px-4 hidden md:table-cell">{t('vocabulary.example')}</th>
                  <th className="py-3 px-4 text-right">{t('common.status')}</th>
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

      {!loading && filteredWords.length === 0 && (
        <EmptyState
          title="ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา"
          description="ลองปรับระดับ CEFR หรือคำค้นหาใหม่เพื่อดูคำศัพท์อื่นๆ"
          icon={<BookOpen className="w-8 h-8 text-muted-foreground" />}
        />
      )}
    </div>
  );
};
