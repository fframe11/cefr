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
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Sparkles,
  Check,
} from 'lucide-react';
import { AudioService } from '../../services/audioService';
import { getVocabulary, mapVocabularyDtoToWord } from '../../lib/api/content/vocabulary';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import {
  GlovaSectionHeader,
  GlovaLevelBadge,
  GlovaButton,
  GlovaIconButton,
  GlovaBadge,
  GlovaCard,
  GlovaCardContent,
  GlovaImage,
} from '../ui';
import { RemotionPlayerWrapper, PhoneticStressComposition } from '../remotion';
import { useTranslation } from '../../i18n';

interface VocabularyViewProps {
  masteredWordIds?: string[];
  onToggleMastery?: (wordId: string, isMastered: boolean) => void;
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  masteredWordIds = [],
  onToggleMastery,
}) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'study' | 'browse'>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Content API State
  const [words, setWords] = useState<VocabularyWord[]>(VOCABULARY_BANK);
  const [loading, setLoading] = useState(false);
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
        // Fallback to static bank with applied filters
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
      setWords(VOCABULARY_BANK);
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, searchQuery, masteredWordIds]);

  useEffect(() => {
    fetchVocabularyData();
  }, [fetchVocabularyData]);

  // Filtered words based on current selection
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

  const currentWord = filteredWords[currentIndex] || filteredWords[0];
  const isMastered = currentWord ? masteredWordIds.includes(currentWord.id) : false;

  const handleSpeak = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    AudioService.speak(word, { lang: 'en-GB', rate: 0.9 });
  };

  const handleNext = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, filteredWords.length));
  };

  const handlePrev = () => {
    setIsRevealed(false);
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, filteredWords.length)) % Math.max(1, filteredWords.length));
  };

  // Keyboard navigation for active study
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'study') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsRevealed((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredWords.length]);

  return (
    <div className="w-full max-w-[1536px] mx-auto space-y-6 pb-16 px-4 sm:px-6">
      {/* 1. Learning Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <GlovaSectionHeader
          eyebrow="ACTIVE VOCABULARY LAB"
          title={isEn ? 'CEFR Vocabulary Lab & Spaced Repetition' : 'คลังคำศัพท์และการจำแบบ Spaced Repetition'}
          description={
            isEn
              ? 'Master CEFR vocabulary with authentic audio, real-world context, and memory retention tracking.'
              : 'ฝึกฝนคำศัพท์ตามกรอบมาตรฐาน CEFR พร้อมเสียงอ่าน บริบทการใช้งาน และสถิติความจำจริง'
          }
        />

        {/* Real Progress Context */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border/60 text-xs font-medium text-foreground flex items-center gap-2 shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span>{isEn ? 'Mastered:' : 'เชี่ยวชาญแล้ว:'}</span>
            <span className="font-bold text-emerald-500">
              {isEn ? `${masteredWordIds.length} words` : `${masteredWordIds.length} คำ`}
            </span>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('study')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'study'
                  ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={isEn ? 'Study Flashcards' : 'โหมดฝึกคำศัพท์'}
            >
              <Layers className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Flashcards' : 'โหมดฝึกจำ'}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('browse')}
              className={`touch-target px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === 'browse'
                  ? 'bg-card text-foreground font-semibold shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label={isEn ? 'Browse Word Bank' : 'โหมดค้นหารายการ'}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{isEn ? 'Word Bank' : 'คลังรายการ'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Level Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-card border border-border/60 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{isEn ? 'Level:' : 'ระดับ:'}</span>
          </span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setSelectedLevel(lvl);
                setCurrentIndex(0);
                setIsRevealed(false);
              }}
              className={`touch-target px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                selectedLevel === lvl
                  ? 'bg-primary text-primary-foreground border-primary font-semibold shadow-xs'
                  : 'bg-secondary/40 text-muted-foreground hover:text-foreground border-border/40 hover:bg-secondary'
              }`}
            >
              {lvl === 'ALL' ? (isEn ? 'All' : 'ทั้งหมด') : `CEFR ${lvl}`}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentIndex(0);
            }}
            placeholder={isEn ? 'Search vocabulary or meanings...' : 'ค้นหาคำศัพท์หรือความหมาย...'}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-background border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && words.length === 0 && (
        <div className="min-h-[320px] flex items-center justify-center p-12">
          <LoadingSpinner size="lg" text="กำลังโหลดคลังคำศัพท์..." />
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchVocabularyData}
        />
      )}

      {/* Empty State */}
      {!loading && filteredWords.length === 0 && (
        <EmptyState
          title={isEn ? 'No matching vocabulary found' : 'ไม่พบคำศัพท์ที่ตรงกับการค้นหา'}
          description={
            isEn
              ? 'Try adjusting your CEFR level filter or search keywords.'
              : 'ลองปรับตัวกรองระดับ CEFR หรือคำค้นหาเพื่อเข้าถึงคำศัพท์อื่น'
          }
          action={
            <GlovaButton
              variant="secondary"
              size="sm"
              onClick={() => {
                setSelectedLevel('ALL');
                setSearchQuery('');
              }}
            >
              {isEn ? 'Reset Filter' : 'ล้างตัวกรอง'}
            </GlovaButton>
          }
        />
      )}

      {/* 2. Main Learning Activity: Active Study Mode (DOMINANT) */}
      {!loading && viewMode === 'study' && currentWord && (
        <div className="max-w-2xl mx-auto space-y-4">
          <GlovaCard
            variant="bubble"
            elevation="bubble"
            className="min-h-[400px] p-6 sm:p-9 flex flex-col justify-between transition-all relative overflow-hidden"
          >
            {/* Card Header Context */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#EDE8DF] dark:border-border/40">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={currentWord.cefrLevel} size="sm" />
                <GlovaBadge variant="secondary" size="sm" className="capitalize rounded-full px-2.5">
                  {currentWord.partOfSpeech}
                </GlovaBadge>
                {currentWord.topic && (
                  <span className="text-xs text-muted-foreground hidden sm:inline font-medium">
                    {isEn ? `Topic: ${currentWord.topic}` : `หมวด: ${currentWord.topic}`}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono font-semibold text-muted-foreground bg-[#FAF7F2] dark:bg-muted/40 px-3 py-1 rounded-full border border-[#EDE8DF] dark:border-border/30">
                {isEn
                  ? `Word ${currentIndex + 1} of ${filteredWords.length}`
                  : `คำที่ ${currentIndex + 1} / ${filteredWords.length}`}
              </div>
            </div>

            {/* Word Central Area - Word as the Hero */}
            <div className="py-6 text-center space-y-4">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <h2 className="text-4xl sm:text-5xl font-black text-[#24233A] dark:text-foreground tracking-tight font-sans">
                  {currentWord.word}
                </h2>
                <button
                  type="button"
                  onClick={(e) => handleSpeak(currentWord.word, e)}
                  aria-label={
                    isEn
                      ? `Listen to pronunciation for ${currentWord.word}`
                      : `ฟังการออกเสียงคำว่า ${currentWord.word}`
                  }
                  className="touch-target w-12 h-12 rounded-full bg-[#E9E5FF] dark:bg-indigo-950/40 hover:bg-[#DDD7FF] dark:hover:bg-indigo-900/50 text-[#5B5CE2] dark:text-indigo-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
                >
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              {currentWord.ipa && (
                <div className="inline-block px-3.5 py-1 rounded-full bg-[#FAF7F2] dark:bg-muted/30 text-xs font-mono font-medium text-muted-foreground border border-[#EDE8DF] dark:border-border/30">
                  {currentWord.ipa}
                </div>
              )}

              {/* Reveal Toggle Card */}
              {!isRevealed ? (
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={() => setIsRevealed(true)}
                    className="touch-target px-6 py-3 rounded-full bg-[#5B5CE2]/10 hover:bg-[#5B5CE2]/15 text-xs sm:text-sm font-bold text-[#5B5CE2] transition-all border border-[#5B5CE2]/25 inline-flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" aria-hidden="true" />
                    <span>
                      {isEn
                        ? 'Tap to reveal meaning & sentence context'
                        : 'แตะเพื่อแสดงความหมายและตัวอย่างประโยค'}
                    </span>
                  </button>
                  <p className="text-[11px] text-muted-foreground mt-2.5 font-medium">
                    {isEn
                      ? '(or press Spacebar to flip card)'
                      : '(หรือกดแป้น Spacebar เพื่อเปิดความหมาย)'}
                  </p>
                </div>
              ) : (
                <div className="pt-4 space-y-4 animate-in fade-in duration-200">
                  <div className="p-5 rounded-[22px] bg-[#FAF7F2] dark:bg-muted/30 border border-[#EDE8DF] dark:border-border/40 space-y-1.5 text-center shadow-xs">
                    <h3 className="text-2xl sm:text-3xl font-black text-[#5B5CE2] dark:text-indigo-400">
                      {currentWord.meaningTh}
                    </h3>
                    {currentWord.meaningEn && (
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                        {currentWord.meaningEn}
                      </p>
                    )}
                  </div>

                  {/* Remotion Phonetic Cadence & Stress Animation */}
                  <div className="pt-1">
                    <RemotionPlayerWrapper
                      component={PhoneticStressComposition}
                      inputProps={{
                        word: currentWord.word,
                        cefrLevel: currentWord.cefrLevel,
                      }}
                      durationInFrames={60}
                      aspectRatio="16/9"
                      ariaLabel={`Phonetic cadence animation for ${currentWord.word}`}
                    />
                  </div>

                  {/* Example in Context */}
                  {(currentWord.exampleSentenceEn || currentWord.exampleSentenceTh) && (
                    <div className="p-5 rounded-[22px] bg-white dark:bg-card/80 border border-[#EDE8DF] dark:border-border/40 text-left space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {isEn ? 'Example sentence in context:' : 'ตัวอย่างประโยคในบริบท:'}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed">
                        {currentWord.exampleSentenceEn}
                      </p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {currentWord.exampleSentenceTh}
                      </p>
                    </div>
                  )}

                  {/* Collocations if present */}
                  {currentWord.collocations && currentWord.collocations.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold mr-1">Collocations:</span>
                      {currentWord.collocations.map((c, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-white dark:bg-card text-xs font-mono font-medium text-foreground border border-[#EDE8DF] dark:border-border/40 shadow-xs"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions: Mastery & Navigation */}
            <div className="pt-4 border-t border-[#EDE8DF] dark:border-border/40 flex items-center justify-between gap-3 flex-wrap">
              <GlovaButton
                variant={isMastered ? 'primary' : 'outline'}
                size="sm"
                leftIcon={isMastered ? <Check className="w-4 h-4 text-white" aria-hidden="true" /> : <CheckCircle className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
                onClick={() => onToggleMastery?.(currentWord.id, !isMastered)}
                className="rounded-full"
              >
                {isMastered
                  ? isEn
                    ? 'Mastered'
                    : 'จำได้แล้ว'
                  : isEn
                  ? 'Mark as Mastered'
                  : 'ทำเครื่องหมายว่าจำได้'}
              </GlovaButton>

              <div className="flex items-center gap-2">
                <GlovaButton
                  variant="secondary"
                  size="sm"
                  leftIcon={<ChevronLeft className="w-4 h-4" aria-hidden="true" />}
                  onClick={handlePrev}
                  aria-label={isEn ? 'Previous word' : 'คำก่อนหน้า'}
                  className="rounded-full"
                >
                  <span className="hidden sm:inline">{isEn ? 'Previous' : 'ก่อนหน้า'}</span>
                </GlovaButton>
                <GlovaButton
                  variant="primary"
                  size="sm"
                  rightIcon={<ChevronRight className="w-4 h-4" aria-hidden="true" />}
                  onClick={handleNext}
                  aria-label={isEn ? 'Next word' : 'คำถัดไป'}
                  className="rounded-full"
                >
                  <span>{isEn ? 'Next Word' : 'คำถัดไป'}</span>
                </GlovaButton>
              </div>
            </div>
          </GlovaCard>
        </div>
      )}

      {/* 3. Secondary Browse Library Mode */}
      {!loading && viewMode === 'browse' && filteredWords.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWords.map((w) => {
            const mastered = masteredWordIds.includes(w.id);
            return (
              <GlovaCard
                key={w.id}
                elevation="subtle"
                interactive
                className="p-4 flex flex-col justify-between"
              >
                <GlovaCardContent className="p-0 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <GlovaLevelBadge level={w.cefrLevel} size="sm" />
                      <span className="text-[11px] text-muted-foreground capitalize">
                        {w.partOfSpeech}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleMastery?.(w.id, !mastered)}
                      className={`min-h-[44px] min-w-[44px] p-2.5 flex items-center justify-center rounded-md transition-colors ${
                        mastered ? 'text-emerald-500' : 'text-muted-foreground/40 hover:text-muted-foreground'
                      }`}
                      aria-label={
                        mastered
                          ? isEn
                            ? 'Mark as unmastered'
                            : 'บันทึกว่ายังจำไม่ได้'
                          : isEn
                          ? 'Mark as mastered'
                          : 'บันทึกว่าจำได้แล้ว'
                      }
                      title={
                        mastered
                          ? isEn
                            ? 'Mastered word'
                            : 'คำศัพท์ที่จำได้แล้ว'
                          : isEn
                          ? 'Click to mark as mastered'
                          : 'คลิกเพื่อบันทึกว่าจำได้'
                      }
                    >
                      <CheckCircle className="w-4 h-4 fill-current/10" aria-hidden="true" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-foreground">
                        {w.word}
                      </span>
                      <GlovaIconButton
                        icon={<Volume2 className="w-3.5 h-3.5 text-primary" aria-hidden="true" />}
                        ariaLabel={
                          isEn ? `Listen to pronunciation for ${w.word}` : `ฟังเสียงคำว่า ${w.word}`
                        }
                        size="sm"
                        variant="ghost"
                        onClick={(e) => handleSpeak(w.word, e)}
                      />
                    </div>
                    {w.ipa && (
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {w.ipa}
                      </p>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-primary">
                    {isEn && w.meaningEn ? w.meaningEn : w.meaningTh}
                  </p>

                  {w.exampleSentenceEn && (
                    <p className="text-[11px] text-muted-foreground line-clamp-2 pt-1 border-t border-border/30">
                      {w.exampleSentenceEn}
                    </p>
                  )}
                </GlovaCardContent>
              </GlovaCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
