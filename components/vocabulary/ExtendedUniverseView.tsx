'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Volume2,
  Sparkles,
  ShieldCheck,
  Globe2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  BookOpen,
  Info,
  Layers,
  Cpu,
  RefreshCw,
  GraduationCap,
  Briefcase,
  Award,
  Compass,
} from 'lucide-react';
import { AudioService } from '@/services/audioService';
import { CEFRLevel } from '@/types';
import { GlovaLevelBadge, GlovaButton } from '@/components/ui';
import { StudioMetric } from '@/components/ui/GlovaPrimitives';
import { VOCABULARY_BANK } from '@/data/vocabularyBank';

export interface ExtendedCandidate {
  id: string;
  glova_id?: string | null;
  word: string;
  lemma: string;
  part_of_speech: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  cefr_source?: string;
  cefr_disclaimer?: string;
  meaning_th: string;
  meaning_en: string;
  ipa?: string;
  example_sentence_en?: string;
  example_sentence_th?: string;
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  topic?: string;
  tier?: 'TIER_1_VERIFIED' | 'TIER_2_CANDIDATE';
  production_status?: string;
  validation_status?: string;
  domain?: string;
  source?: string;
  // Exam-specific metadata
  target_exams?: string[];
  ielts_band?: string;
  is_daily_life?: boolean;
  is_exam_core?: boolean;
  is_nawl_academic?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    stats?: any;
  };
  query_ms?: number;
}

interface ExtendedUniverseViewProps {
  onSelectWord?: (word: ExtendedCandidate) => void;
  isEn?: boolean;
}

type DatasetMode = 'EXAM_10K' | 'EXTENDED_121K';

export const ExtendedUniverseView: React.FC<ExtendedUniverseViewProps> = ({
  onSelectWord,
  isEn = false,
}) => {
  const [datasetMode, setDatasetMode] = useState<DatasetMode>('EXAM_10K');
  const [items, setItems] = useState<ExtendedCandidate[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [level, setLevel] = useState<string>('ALL');
  const [pos, setPos] = useState<string>('ALL');
  const [examTarget, setExamTarget] = useState<string>('ALL'); // 'ALL' | 'DAILY' | 'IELTS' | 'TOEIC' | 'TOEFL' | 'CEFR'
  const [tier, setTier] = useState<string>('ALL');

  const [loading, setLoading] = useState(true);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate | null>(null);

  // Live Statistics
  const [examStats, setExamStats] = useState({
    totalExamWords: 10021,
    cefrCount: 10021,
    ieltsCount: 7510,
    toeicCount: 6994,
    toeflCount: 5678,
    dailyLifeCount: 3154,
  });

  const [universeStats, setUniverseStats] = useState({
    tier1VerifiedCount: 3864,
    tier2CandidateCount: 117389,
    totalUniverseCount: 121253,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch words based on mode and filters
  const fetchData = useCallback(async () => {
    setLoading(true);
    const startTime = performance.now();

    try {
      if (datasetMode === 'EXAM_10K') {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('pageSize', '24');
        if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
        if (level !== 'ALL') params.set('cefr', level);
        if (pos !== 'ALL') params.set('pos', pos.toLowerCase());
        if (examTarget === 'DAILY') {
          params.set('daily', 'true');
        } else if (examTarget !== 'ALL') {
          params.set('exam', examTarget);
        }

        const res = await fetch(`/api/content/vocabulary/exam?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse<ExtendedCandidate> = await res.json();

        if (json.success && json.data && json.data.total > 0) {
          setItems(json.data.items);
          setTotalPages(json.data.totalPages);
          setTotalCount(json.data.total);
          if (json.data.stats) {
            setExamStats(json.data.stats);
          }
        } else {
          // Direct CDN asset fallback (zero latency, edge cached)
          const assetRes = await fetch('/data/vocabulary-exam-compact.json');
          if (assetRes.ok) {
            const raw = (await assetRes.json()) as ExtendedCandidate[];
            let filtered = raw;
            if (debouncedSearch.trim()) {
              const q = debouncedSearch.trim().toLowerCase();
              filtered = filtered.filter(
                (item) =>
                  item.word.toLowerCase().includes(q) ||
                  item.meaning_th.includes(q) ||
                  item.meaning_en.toLowerCase().includes(q)
              );
            }
            if (level !== 'ALL') {
              filtered = filtered.filter((item) => item.cefr_level === level);
            }
            if (pos !== 'ALL') {
              filtered = filtered.filter((item) => item.part_of_speech.toLowerCase() === pos.toLowerCase());
            }
            if (examTarget === 'DAILY') {
              filtered = filtered.filter((item) => item.is_daily_life);
            } else if (examTarget !== 'ALL') {
              filtered = filtered.filter((item) => item.target_exams?.includes(examTarget));
            }
            const offset = (page - 1) * 24;
            setItems(filtered.slice(offset, offset + 24));
            setTotalPages(Math.max(1, Math.ceil(filtered.length / 24)));
            setTotalCount(filtered.length);
          }
        }
      } else {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '24');
        if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
        if (level !== 'ALL') params.set('cefr', level);
        if (pos !== 'ALL') params.set('pos', pos.toLowerCase());
        if (tier !== 'ALL') params.set('tier', tier);

        const res = await fetch(`/api/content/vocabulary/universe?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ApiResponse<ExtendedCandidate> = await res.json();

        if (json.success && json.data) {
          setItems(json.data.items);
          setTotalPages(json.data.totalPages);
          setTotalCount(json.data.total);
          if (json.data.stats) {
            setUniverseStats(json.data.stats);
          }
        }
      }
    } catch (err) {
      console.warn('[ExtendedUniverseView] fetch failed, falling back to local catalog:', err);
      const fallback = VOCABULARY_BANK.map((w, idx) => ({
        id: w.id || `candidate-${idx}`,
        word: w.word,
        lemma: w.lemma,
        part_of_speech: w.partOfSpeech,
        cefr_level: w.cefrLevel as any,
        meaning_th: w.meaningTh,
        meaning_en: w.meaningEn,
        ipa: w.ipa,
        example_sentence_en: w.exampleSentenceEn,
        example_sentence_th: w.exampleSentenceTh,
        collocations: w.collocations,
        topic: w.topic,
        target_exams: ['CEFR', 'IELTS', 'TOEIC', 'TOEFL'],
        is_daily_life: true,
      }));

      let filtered = fallback;
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.trim().toLowerCase();
        filtered = filtered.filter(
          (item) =>
            item.word.toLowerCase().includes(q) ||
            item.meaning_th.includes(q) ||
            item.meaning_en.toLowerCase().includes(q)
        );
      }
      if (level !== 'ALL') {
        filtered = filtered.filter((item) => item.cefr_level === level);
      }
      const offset = (page - 1) * 24;
      setItems(filtered.slice(offset, offset + 24));
      setTotalPages(Math.max(1, Math.ceil(filtered.length / 24)));
      setTotalCount(filtered.length);
    } finally {
      const elapsed = Math.round(performance.now() - startTime);
      setQueryTime(elapsed);
      setLoading(false);
    }
  }, [datasetMode, page, debouncedSearch, level, pos, examTarget, tier]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSpeak = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    AudioService.speak(word, { lang: 'en-GB', rate: 1.0 });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Mode Switcher & Telemetry Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-[#0F141C] border border-slate-200/80 dark:border-white/5">
          <button
            type="button"
            onClick={() => {
              setDatasetMode('EXAM_10K');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              datasetMode === 'EXAM_10K'
                ? 'bg-[#FA5D5D] text-white shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{isEn ? 'Exam & Daily Life (10,021 Words)' : 'คลังคำศัพท์สอบ & ชีวิตประจำวัน (10,021 คำ)'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDatasetMode('EXTENDED_121K');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              datasetMode === 'EXTENDED_121K'
                ? 'bg-[#FA5D5D] text-white shadow-xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4 text-amber-500" />
            <span>{isEn ? 'Full Universe (121,253 Words)' : 'คลังจักรวาลศัพท์รวม (121,253 คำ)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-[#94A3B8] font-mono">
          <Cpu className="w-3.5 h-3.5 text-amber-500" />
          <span>{isEn ? 'Engine Latency:' : 'ความเร็วประมวลผล:'}</span>
          <span className="font-bold text-slate-900 dark:text-[#EDEBE8]">{queryTime !== null ? `${queryTime}ms` : '<10ms'}</span>
        </div>
      </div>

      {/* 2. Statistical HUD Cards */}
      {datasetMode === 'EXAM_10K' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-1 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] uppercase block">
              {isEn ? 'Total Exam Words' : 'รวมคำศัพท์สอบ'}
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-[#EDEBE8] font-sans">
              {examStats.totalExamWords.toLocaleString()}
            </p>
            <span className="text-[10px] text-amber-600 dark:text-[#E5A93C] font-semibold">100% Attested</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-1 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] uppercase block">
              {isEn ? 'Daily Life' : 'ชีวิตประจำวัน'}
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
              {examStats.dailyLifeCount.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">A1–B1 Essential</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-1 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] uppercase block">
              IELTS Academic
            </span>
            <p className="text-xl font-black text-[#FA5D5D] font-sans">
              {examStats.ieltsCount.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Band 3.0–9.0</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-1 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] uppercase block">
              TOEIC Business
            </span>
            <p className="text-xl font-black text-amber-600 dark:text-amber-400 font-sans">
              {examStats.toeicCount.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Workplace & Office</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-1 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] uppercase block">
              TOEFL Lectures
            </span>
            <p className="text-xl font-black text-purple-600 dark:text-purple-400 font-sans">
              {examStats.toeflCount.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">Science & Arts</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 space-y-1 shadow-xs">
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#94A3B8] uppercase block">
              CEFR Framework
            </span>
            <p className="text-xl font-black text-slate-900 dark:text-[#EDEBE8] font-sans">
              {examStats.cefrCount.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-[#94A3B8]">A1 to C2 Mastery</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StudioMetric
            label={isEn ? 'UNIVERSE TOTAL' : 'คลังจักรวาลศัพท์รวม'}
            value={universeStats.totalUniverseCount.toLocaleString()}
            delta="121,253 Words"
            variant="gold"
            icon={<Globe2 className="w-4 h-4 text-[#E5A93C]" />}
          />
          <StudioMetric
            label={isEn ? 'TIER 1 VERIFIED' : 'ระดับ 1 ยืนยันสมบูรณ์'}
            value={universeStats.tier1VerifiedCount.toLocaleString()}
            delta="Curated Standard"
            variant="mint"
            icon={<ShieldCheck className="w-4 h-4 text-[#10B981]" />}
          />
          <StudioMetric
            label={isEn ? 'TIER 2 EXTENDED' : 'ระดับ 2 ฐานศัพท์ขยาย'}
            value={universeStats.tier2CandidateCount.toLocaleString()}
            delta="OEWN + Lexitron"
            variant="gold"
            icon={<Layers className="w-4 h-4 text-[#E5A93C]" />}
          />
          <StudioMetric
            label={isEn ? 'INDEX LATENCY' : 'ความเร็วค้นหาอินเด็กซ์'}
            value={queryTime !== null ? `${queryTime}ms` : '<15ms'}
            delta="Trie Indexed"
            variant="neutral"
            icon={<Cpu className="w-4 h-4 text-[#94A3B8]" />}
          />
        </div>
      )}

      {/* 3. Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                datasetMode === 'EXAM_10K'
                  ? isEn
                    ? 'Search 10,021 exam words, Thai definitions, collocations...'
                    : 'ค้นหาคำศัพท์สอบ 10,021 คำ ความหมายไทย วลีสัมพันธ์...'
                  : isEn
                  ? 'Search across 121,253 words in the lexical universe...'
                  : 'ค้นหาคำศัพท์จาก 121,253 คำในคลังจักรวาลศัพท์...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-[#EDEBE8] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/40"
            />
          </div>

          {/* Quick Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* POS Filter */}
            <select
              value={pos}
              onChange={(e) => {
                setPos(e.target.value);
                setPage(1);
              }}
              aria-label={isEn ? 'Filter by part of speech' : 'กรองชนิดคำ'}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-[#EDEBE8] focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/40 cursor-pointer"
            >
              <option value="ALL">{isEn ? 'All Parts of Speech' : 'ทุกชนิดคำ'}</option>
              <option value="noun">{isEn ? 'Noun' : 'คำนาม'}</option>
              <option value="verb">{isEn ? 'Verb' : 'คำกริยา'}</option>
              <option value="adjective">{isEn ? 'Adjective' : 'คำคุณศัพท์'}</option>
              <option value="adverb">{isEn ? 'Adverb' : 'คำกริยาวิเศษณ์'}</option>
            </select>

            {/* Mode-specific secondary filter */}
            {datasetMode === 'EXTENDED_121K' && (
              <select
                value={tier}
                onChange={(e) => {
                  setTier(e.target.value);
                  setPage(1);
                }}
                aria-label={isEn ? 'Filter by tier' : 'กรองตามระดับคลัง'}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-[#EDEBE8] focus:outline-none focus:ring-2 focus:ring-[#FA5D5D]/40 cursor-pointer"
              >
                <option value="ALL">{isEn ? 'All Tiers (121k)' : 'ทุกระดับ (121k)'}</option>
                <option value="TIER_1_VERIFIED">{isEn ? 'Tier 1: Verified (3.8k)' : 'ระดับ 1: ยืนยันสมบูรณ์ (3.8k)'}</option>
                <option value="TIER_2_CANDIDATE">{isEn ? 'Tier 2: Candidate (117k)' : 'ระดับ 2: คลังขยาย (117k)'}</option>
              </select>
            )}
          </div>
        </div>

        {/* Exam Focus Target Selector (When in EXAM_10K mode) */}
        {datasetMode === 'EXAM_10K' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-white/5 pt-2.5">
            <span className="text-xs text-slate-600 dark:text-[#94A3B8] font-bold mr-1 shrink-0 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>{isEn ? 'Target Category:' : 'เป้าหมายการสอบ & ใช้งาน:'}</span>
            </span>
            {[
              { id: 'ALL', label: isEn ? 'All Exam Words (10k)' : 'คำศัพท์ทั้งหมด (10,021)' },
              { id: 'DAILY', label: isEn ? 'Daily Life (3.1k)' : 'ชีวิตประจำวัน (3,154)' },
              { id: 'IELTS', label: isEn ? 'IELTS Academic (7.5k)' : 'สอบ IELTS (7,510)' },
              { id: 'TOEIC', label: isEn ? 'TOEIC Business (7.0k)' : 'สอบ TOEIC (6,994)' },
              { id: 'TOEFL', label: isEn ? 'TOEFL Lectures (5.7k)' : 'สอบ TOEFL (5,678)' },
              { id: 'CEFR', label: isEn ? 'CEFR Standard (10k)' : 'มาตรฐาน CEFR (10,021)' },
            ].map((tgt) => (
              <button
                key={tgt.id}
                type="button"
                onClick={() => {
                  setExamTarget(tgt.id);
                  setPage(1);
                }}
                className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  examTarget === tgt.id
                    ? 'bg-[#FA5D5D] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#101A30] dark:hover:bg-[#15203B] text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10'
                }`}
              >
                {tgt.label}
              </button>
            ))}
          </div>
        )}

        {/* CEFR Level Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-white/5 pt-2.5">
          <span className="text-xs text-slate-600 dark:text-[#94A3B8] font-bold mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>{isEn ? 'CEFR Level:' : 'ระดับ CEFR:'}</span>
          </span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setLevel(lvl);
                setPage(1);
              }}
              className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                level === lvl
                  ? 'bg-[#FA5D5D] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#101A30] dark:hover:bg-[#15203B] text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10'
              }`}
            >
              {lvl === 'ALL' ? (isEn ? 'All Levels' : 'ทุกระดับ') : `CEFR ${lvl}`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Results Header & Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-[#94A3B8] px-1">
        <span>
          {isEn
            ? `Displaying ${items.length} of ${totalCount.toLocaleString()} vocabulary entries (Page ${page} of ${totalPages})`
            : `กำลังแสดง ${items.length} จาก ${totalCount.toLocaleString()} รายการ (หน้า ${page} / ${totalPages})`}
        </span>
        <button
          type="button"
          onClick={() => fetchData()}
          className="flex items-center gap-1 text-[#FA5D5D] hover:text-[#E04848] font-medium cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isEn ? 'Refresh' : 'รีเฟรช'}</span>
        </button>
      </div>

      {/* 5. Vocabulary Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 animate-pulse p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-slate-200 dark:bg-[#1C2430] rounded-md" />
                <div className="h-5 w-20 bg-slate-200 dark:bg-[#1C2430] rounded-md" />
              </div>
              <div className="h-6 w-32 bg-slate-200 dark:bg-[#1C2430] rounded-md" />
              <div className="h-4 w-48 bg-slate-200 dark:bg-[#1C2430] rounded-md" />
              <div className="h-4 w-full bg-slate-200 dark:bg-[#1C2430] rounded-md" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/80 dark:border-white/10 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-400 dark:text-[#64748B] mx-auto" />
          <p className="text-base font-bold text-slate-900 dark:text-[#EDEBE8]">
            {isEn ? 'No vocabulary entries match your filters' : 'ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา'}
          </p>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
            {isEn
              ? 'Try clearing the search query or selecting "All Levels".'
              : 'ลองล้างคำค้นหาหรือเลือกดูทุกระดับการสอบ'}
          </p>
          <GlovaButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch('');
              setLevel('ALL');
              setPos('ALL');
              setExamTarget('ALL');
              setTier('ALL');
            }}
          >
            {isEn ? 'Reset All Filters' : 'ล้างตัวกรองทั้งหมด'}
          </GlovaButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((word) => {
            const isDaily = word.is_daily_life;
            const exams = word.target_exams || [];

            return (
              <div
                key={word.id}
                onClick={() => setSelectedCandidate(word)}
                className="group relative p-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#141A22] dark:hover:bg-[#18202A] border border-slate-200/90 hover:border-[#FA5D5D]/60 dark:border-white/10 dark:hover:border-white/25 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                {/* Card Top: Badges & Exam Targets */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <GlovaLevelBadge level={word.cefr_level} size="sm" />
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1C2430] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
                      {word.part_of_speech}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {isDaily && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-[#E5A93C] border border-amber-500/20">
                        DAILY LIFE
                      </span>
                    )}
                    {exams.includes('IELTS') && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20">
                        IELTS
                      </span>
                    )}
                    {exams.includes('TOEIC') && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        TOEIC
                      </span>
                    )}
                    {exams.includes('TOEFL') && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                        TOEFL
                      </span>
                    )}
                  </div>
                </div>

                {/* Word & Pronunciation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black font-sans text-slate-900 dark:text-[#EDEBE8] tracking-tight group-hover:text-[#FA5D5D] transition-colors">
                      {word.word}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(word.word, e)}
                      aria-label={`Pronounce ${word.word}`}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-[#FA5D5D] hover:text-white dark:bg-[#1C2430] dark:hover:bg-[#FA5D5D] text-slate-700 dark:text-[#EDEBE8] flex items-center justify-center transition-all border border-slate-200 dark:border-white/10 shrink-0 cursor-pointer shadow-xs active:scale-95"
                    >
                      <Volume2 className="w-4 h-4 text-[#FA5D5D] group-hover:text-white" />
                    </button>
                  </div>
                  {word.ipa && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-[#64748B]">
                      {word.ipa}
                    </div>
                  )}
                </div>

                {/* Meaning: Bilingual, Accurate and Sensible */}
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-bold text-[#FA5D5D]">
                    {word.meaning_th}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {word.meaning_en}
                  </p>
                </div>

                {/* Collocations or Example preview */}
                {word.collocations && word.collocations.length > 0 ? (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[10px] text-slate-400 dark:text-[#64748B] font-mono shrink-0">Colloc:</span>
                    <div className="flex items-center gap-1 overflow-x-hidden text-[10px] text-slate-600 dark:text-[#94A3B8] font-mono">
                      {word.collocations.slice(0, 2).map((c, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-[#0F141C] border border-slate-200/80 dark:border-white/10 truncate">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : word.topic ? (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center gap-1 text-[10px] text-slate-400 dark:text-[#64748B] font-mono">
                    <span>Topic:</span>
                    <span className="text-slate-600 dark:text-[#94A3B8]">{word.topic}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 shadow-xs flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage(1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 cursor-pointer"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-900 dark:text-[#EDEBE8]">
            {isEn
              ? `Page ${page.toLocaleString()} of ${totalPages.toLocaleString()}`
              : `หน้า ${page.toLocaleString()} / ${totalPages.toLocaleString()}`}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(totalPages)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 cursor-pointer"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7. Detailed Word Inspection Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200 dark:border-white/15 p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2 flex-wrap">
                <GlovaLevelBadge level={selectedCandidate.cefr_level} size="md" />
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1C2430] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
                  {selectedCandidate.part_of_speech}
                </span>
                {selectedCandidate.ielts_band && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20">
                    {selectedCandidate.ielts_band}
                  </span>
                )}
                {selectedCandidate.is_daily_life && (
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-[#E5A93C] border border-amber-500/20">
                    Daily Life
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-700 dark:text-[#EDEBE8] flex items-center justify-center border border-slate-200 dark:border-white/10 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Word Central Focus */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-[#EDEBE8] tracking-tight">
                  {selectedCandidate.word}
                </h2>
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedCandidate.word)}
                  className="px-4 py-2 rounded-xl bg-[#FA5D5D] hover:bg-[#E04848] text-white font-bold flex items-center gap-2 shadow-[0_2.5px_0_0_#B83232] border-t border-white/20 cursor-pointer active:translate-y-0.5"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{isEn ? 'Listen' : 'ฟังเสียง'}</span>
                </button>
              </div>

              {selectedCandidate.ipa && (
                <div className="text-sm font-mono text-slate-500 dark:text-[#64748B]">
                  {selectedCandidate.ipa}
                </div>
              )}
            </div>

            {/* Meanings */}
            <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-[#0B1224] border border-amber-500/20 dark:border-white/10 space-y-2">
              <div className="text-xs uppercase font-mono font-bold text-[#FA5D5D]">
                {isEn ? 'Thai Meaning' : 'ความหมายภาษาไทย (บริบทการใช้งานจริง)'}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-[#EDEBE8]">
                {selectedCandidate.meaning_th}
              </p>
              <div className="pt-2 text-xs uppercase font-mono font-bold text-slate-500 dark:text-[#94A3B8]">
                {isEn ? 'English Definition' : 'คำนิยามภาษาอังกฤษ'}
              </div>
              <p className="text-sm text-slate-700 dark:text-[#94A3B8] leading-relaxed">
                {selectedCandidate.meaning_en}
              </p>
            </div>

            {/* Target Exams Registered */}
            {selectedCandidate.target_exams && selectedCandidate.target_exams.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-[#94A3B8]">
                  {isEn ? 'Appears in Exams:' : 'พบในข้อสอบมาตรฐาน:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.target_exams.map((ex) => (
                    <span
                      key={ex}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-[#1C2430] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-[#EDEBE8]"
                    >
                      {ex === 'CEFR'
                        ? `CEFR ${selectedCandidate.cefr_level}`
                        : ex === 'IELTS'
                        ? `IELTS (${selectedCandidate.ielts_band || 'Academic'})`
                        : ex === 'TOEIC'
                        ? 'TOEIC (Business & Workplace)'
                        : 'TOEFL (Academic Lectures)'}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Example Sentences */}
            {(selectedCandidate.example_sentence_en || selectedCandidate.example_sentence_th) && (
              <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-[#1C2430] border border-emerald-500/20 dark:border-white/10 space-y-1.5">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {isEn ? 'Context Example:' : 'ตัวอย่างประโยคในบริบทจริง:'}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-[#EDEBE8]">
                  {selectedCandidate.example_sentence_en}
                </p>
                {selectedCandidate.example_sentence_th && (
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
                    {selectedCandidate.example_sentence_th}
                  </p>
                )}
              </div>
            )}

            {/* Collocations */}
            {selectedCandidate.collocations && selectedCandidate.collocations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-slate-600 dark:text-[#94A3B8]">
                  {isEn ? 'Frequent Collocations:' : 'กลุ่มคำสัมพันธ์ (Collocations):'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.collocations.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-[#EDEBE8]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Attribution */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#64748B]">
              <span>Topic: {selectedCandidate.topic || 'General English'}</span>
              <span>ID: {selectedCandidate.id}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
