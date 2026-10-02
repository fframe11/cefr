'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
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
  Database,
  CheckCircle2,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { AudioService } from '@/services/audioService';
import { CEFRLevel } from '@/types';
import { GlovaLevelBadge, GlovaBadge, GlovaButton } from '@/components/ui';
import { StudioMetric } from '@/components/ui/GlovaPrimitives';

export interface ExtendedCandidate {
  id: string;
  glova_id: string | null;
  word: string;
  lemma: string;
  part_of_speech: string;
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  cefr_source: string;
  cefr_disclaimer: string;
  meaning_th: string;
  meaning_en: string;
  ipa?: string;
  example_sentence_en?: string;
  example_sentence_th?: string;
  collocations?: string[];
  synonyms?: string[];
  antonyms?: string[];
  topic?: string;
  tier: 'TIER_1_VERIFIED' | 'TIER_2_CANDIDATE';
  production_status: 'VERIFIED_PRODUCTION' | 'EXTENDED_CANDIDATE';
  validation_status: 'VALIDATED_READY' | 'PENDING_HUMAN_QA';
  domain: string;
  source: string;
}

interface UniverseApiResponse {
  success: boolean;
  data: {
    items: ExtendedCandidate[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    stats: {
      tier1VerifiedCount: number;
      tier2CandidateCount: number;
      totalUniverseCount: number;
    };
  };
  query_ms?: number;
}

interface ExtendedUniverseViewProps {
  onSelectWord?: (word: ExtendedCandidate) => void;
  isEn?: boolean;
}

export const ExtendedUniverseView: React.FC<ExtendedUniverseViewProps> = ({
  onSelectWord,
  isEn = false,
}) => {
  const [items, setItems] = useState<ExtendedCandidate[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(121253);
  const [stats, setStats] = useState({
    tier1VerifiedCount: 3813,
    tier2CandidateCount: 117440,
    totalUniverseCount: 121253,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [level, setLevel] = useState<string>('ALL');
  const [pos, setPos] = useState<string>('ALL');
  const [tier, setTier] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<ExtendedCandidate | null>(null);

  // Debounce search input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUniverse = useCallback(async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '24');
      if (debouncedSearch.trim()) params.set('q', debouncedSearch.trim());
      if (level !== 'ALL') params.set('cefr', level);
      if (pos !== 'ALL') params.set('pos', pos.toLowerCase());
      if (tier !== 'ALL') params.set('tier', tier);

      const res = await fetch(`/api/content/vocabulary/universe?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: UniverseApiResponse = await res.json();

      if (json.success && json.data) {
        setItems(json.data.items);
        setTotalPages(json.data.totalPages);
        setTotalCount(json.data.total);
        if (json.data.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error('[ExtendedUniverseView] fetch failed:', err);
    } finally {
      const elapsed = Math.round(performance.now() - startTime);
      setQueryTime(elapsed);
      setLoading(false);
    }
  }, [page, debouncedSearch, level, pos, tier]);

  useEffect(() => {
    fetchUniverse();
  }, [fetchUniverse]);

  const handleSpeak = (word: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    AudioService.speak(word, { lang: 'en-GB', rate: 1.0 });
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* 1. Telemetry Bar: Obsidian Physical Chassis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StudioMetric
          label={isEn ? 'UNIVERSE CANDIDATES' : 'คลังจักรวาลศัพท์รวม'}
          value={stats.totalUniverseCount.toLocaleString()}
          delta="121k Total"
          variant="gold"
          icon={<Globe2 className="w-4 h-4 text-[#E5A93C]" />}
        />
        <StudioMetric
          label={isEn ? 'TIER 1 VERIFIED' : 'ระดับ 1 ยืนยันสมบูรณ์'}
          value={stats.tier1VerifiedCount.toLocaleString()}
          delta="Authoritative"
          variant="mint"
          icon={<ShieldCheck className="w-4 h-4 text-[#10B981]" />}
        />
        <StudioMetric
          label={isEn ? 'TIER 2 EXTENDED' : 'ระดับ 2 ฐานศัพท์ขยาย'}
          value={stats.tier2CandidateCount.toLocaleString()}
          delta="Corpus Scaled"
          variant="indigo"
          icon={<Layers className="w-4 h-4 text-[#5B5CE2]" />}
        />
        <StudioMetric
          label={isEn ? 'INDEX LATENCY' : 'ความเร็วค้นหาอินเด็กซ์'}
          value={queryTime !== null ? `${queryTime}ms` : '<15ms'}
          delta="Trie Indexed"
          variant="neutral"
          icon={<Cpu className="w-4 h-4 text-[#94A3B8]" />}
        />
      </div>

      {/* 2. Platform Scientific Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-[#141A22] border border-amber-200/80 dark:border-white/10 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-amber-600 dark:text-[#E5A93C] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed space-y-1">
          <p className="font-semibold text-slate-900 dark:text-[#EDEBE8]">
            {isEn
              ? 'Multi-Tier Lexical Engine (Dual-Classification Architecture)'
              : 'สถาปัตยกรรมคำศัพท์ 2 ระดับ (Dual-Classification System)'}
          </p>
          <p>
            {isEn
              ? 'Tier 1 units (3,860) are verified Cambridge-curated seed items used for authoritative test generation. Tier 2 items (117,440) are candidate universe entries cross-referenced against Open English WordNet 2024, Lexitron 2.0, Kaikki Wiktionary, and Glova Collocations with algorithmic CEFR profile estimates.'
              : 'คำศัพท์ระดับที่ 1 (3,860 คำ) เป็นคลังคำที่ผ่านการตรวจสอบสมบูรณ์ตามมาตรฐาน Cambridge สำหรับแบบทดสอบ ส่วนระดับที่ 2 (117,440 คำ) เป็นคลังคำศัพท์ขยายจาก OEWN 2024, Lexitron 2.0 และ Kaikki เพื่อรองรับการค้นหาที่ครอบคลุม พร้อมการประมาณการระดับ CEFR ตามความถี่การใช้งาน'}
          </p>
        </div>
      </div>

      {/* 3. Instrument Filter & Search Bar */}
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
                isEn
                  ? 'Search across 121,253 words, Thai meanings, collocations...'
                  : 'ค้นหาคำศัพท์จาก 121,253 คำ ความหมายภาษาไทย หรือวลีสัมพันธ์...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-[#EDEBE8] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-[#EDEBE8] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">{isEn ? 'All Parts of Speech' : 'ทุกชนิดคำ'}</option>
              <option value="noun">{isEn ? 'Noun' : 'คำนาม'}</option>
              <option value="verb">{isEn ? 'Verb' : 'คำกริยา'}</option>
              <option value="adjective">{isEn ? 'Adjective' : 'คำคุณศัพท์'}</option>
              <option value="adverb">{isEn ? 'Adverb' : 'คำกริยาวิเศษณ์'}</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tier}
              onChange={(e) => {
                setTier(e.target.value);
                setPage(1);
              }}
              aria-label={isEn ? 'Filter by tier' : 'กรองตามระดับคลัง'}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0F141C] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-[#EDEBE8] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            >
              <option value="ALL">{isEn ? 'All Tiers (121k)' : 'ทุกระดับ (121k)'}</option>
              <option value="TIER_1_VERIFIED">{isEn ? 'Tier 1: Verified (3.8k)' : 'ระดับ 1: ผ่านการตรวจสอบ (3.8k)'}</option>
              <option value="TIER_2_CANDIDATE">{isEn ? 'Tier 2: Candidate (117k)' : 'ระดับ 2: คลังขยาย (117k)'}</option>
            </select>
          </div>
        </div>

        {/* CEFR Level Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-slate-600 dark:text-[#94A3B8] font-bold mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>{isEn ? 'Profile Level:' : 'ระดับ CEFR:'}</span>
          </span>
          {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => {
                setLevel(lvl);
                setPage(1);
              }}
              className={`touch-target px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                level === lvl
                  ? 'bg-[#2155E6] text-white shadow-[0_2px_0_0_#143DB8] border-t border-white/20'
                  : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-[#101A30] dark:hover:bg-[#15203B] text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318]'
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
            ? `Displaying ${items.length} of ${totalCount.toLocaleString()} candidate entries (Page ${page} of ${totalPages})`
            : `กำลังแสดง ${items.length} จาก ${totalCount.toLocaleString()} รายการ (หน้า ${page} / ${totalPages})`}
        </span>
        <button
          type="button"
          onClick={() => fetchUniverse()}
          className="flex items-center gap-1 text-[#2155E6] dark:text-[#6893FF] hover:text-[#1C4AC9] font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isEn ? 'Refresh' : 'รีเฟรช'}</span>
        </button>
      </div>

      {/* 5. Candidate Cards Grid */}
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
            {isEn ? 'No candidates match your filters' : 'ไม่พบคำศัพท์ที่ตรงกับเงื่อนไขการค้นหา'}
          </p>
          <p className="text-xs text-slate-600 dark:text-[#94A3B8]">
            {isEn
              ? 'Try clearing the search query or selecting "All Levels".'
              : 'ลองล้างคำค้นหาหรือเลือกดูทุกระดับ CEFR'}
          </p>
          <GlovaButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearch('');
              setLevel('ALL');
              setPos('ALL');
              setTier('ALL');
            }}
          >
            {isEn ? 'Reset All Filters' : 'ล้างตัวกรองทั้งหมด'}
          </GlovaButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {items.map((candidate) => {
            const isTier1 = candidate.tier === 'TIER_1_VERIFIED';
            return (
              <div
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className="group relative p-4 rounded-2xl bg-white hover:bg-indigo-50/40 dark:bg-[#141A22] dark:hover:bg-[#18202A] border border-slate-200/90 hover:border-indigo-300 dark:border-white/10 dark:hover:border-white/20 shadow-[0_2px_0_0_#E2E8F0] dark:shadow-[0_2px_0_0_#0D1318] transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                {/* Card Top: Badges & Tier */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <GlovaLevelBadge level={candidate.cefr_level} size="sm" />
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1C2430] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
                      {candidate.part_of_speech}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      isTier1
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-indigo-500/10 text-indigo-700 dark:text-[#A5A6F6] border-indigo-500/25'
                    }`}
                  >
                    {isTier1 ? 'TIER 1 • VERIFIED' : 'TIER 2 • CANDIDATE'}
                  </span>
                </div>

                {/* Word & Pronunciation */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black font-sans text-slate-900 dark:text-[#EDEBE8] tracking-tight group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                      {candidate.word}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => handleSpeak(candidate.word, e)}
                      aria-label={`Pronounce ${candidate.word}`}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-indigo-100 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-800 dark:text-[#EDEBE8] flex items-center justify-center transition-all shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318] active:translate-y-[2px] active:shadow-none border border-slate-200 dark:border-white/10 shrink-0"
                    >
                      <Volume2 className="w-4 h-4 text-[#2155E6] dark:text-[#6893FF]" />
                    </button>
                  </div>
                  {candidate.ipa && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-[#64748B]">
                      {candidate.ipa}
                    </div>
                  )}
                </div>

                {/* Bilingual Meanings */}
                <div className="space-y-1 pt-1">
                  <p className="text-sm font-bold text-[#2155E6] dark:text-[#6893FF]">
                    {candidate.meaning_th}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-[#94A3B8] line-clamp-2 leading-relaxed">
                    {candidate.meaning_en}
                  </p>
                </div>

                {/* Example or Collocations Preview */}
                {candidate.collocations && candidate.collocations.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-white/10 flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[10px] text-slate-500 dark:text-[#64748B] font-mono shrink-0">Colloc:</span>
                    <div className="flex items-center gap-1 overflow-x-hidden text-[10px] text-slate-600 dark:text-[#94A3B8] font-mono">
                      {candidate.collocations.slice(0, 2).map((c, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-[#0F141C] border border-slate-200/80 dark:border-white/10 truncate">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pagination Controls: Tactical Studio Control Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200/90 dark:border-white/10 shadow-xs flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage(1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318]"
              aria-label="First page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318]"
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
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318]"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(totalPages)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] disabled:opacity-30 disabled:pointer-events-none text-slate-800 dark:text-[#EDEBE8] border border-slate-200 dark:border-white/10 shadow-[0_2px_0_0_#CBD5E1] dark:shadow-[0_2px_0_0_#0D1318]"
              aria-label="Last page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 7. Detailed Candidate Inspection Drawer / Modal */}
      {selectedCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedCandidate(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#141A22] border border-slate-200 dark:border-white/15 p-6 sm:p-7 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <GlovaLevelBadge level={selectedCandidate.cefr_level} size="md" />
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#1C2430] text-slate-600 dark:text-[#94A3B8] border border-slate-200 dark:border-white/10">
                  {selectedCandidate.part_of_speech}
                </span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                    selectedCandidate.tier === 'TIER_1_VERIFIED'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-700 dark:text-[#A5A6F6] border-indigo-500/25'
                  }`}
                >
                  {selectedCandidate.tier === 'TIER_1_VERIFIED'
                    ? 'Tier 1: Production Seed'
                    : 'Tier 2: Candidate Universe'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1C2430] dark:hover:bg-[#253040] text-slate-700 dark:text-[#EDEBE8] flex items-center justify-center border border-slate-200 dark:border-white/10"
              >
                ✕
              </button>
            </div>

            {/* Word Central Focus */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-[#EDEBE8]">
                  {selectedCandidate.word}
                </h2>
                <button
                  type="button"
                  onClick={() => handleSpeak(selectedCandidate.word)}
                  className="px-4 py-2 rounded-xl bg-[#2155E6] hover:bg-[#1C4AC9] dark:bg-[#2155E6] dark:hover:bg-[#1C4AC9] text-white font-bold flex items-center gap-2 shadow-[0_2.5px_0_0_#143DB8] dark:shadow-[0_2.5px_0_0_#143DB8] border-t border-white/20"
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
            <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-[#0B1224] border border-indigo-200/80 dark:border-white/10 space-y-2">
              <div className="text-xs uppercase font-mono font-bold text-[#2155E6] dark:text-[#6893FF]">
                {isEn ? 'Thai Meaning' : 'ความหมายภาษาไทย'}
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

            {/* Example Sentences */}
            {(selectedCandidate.example_sentence_en || selectedCandidate.example_sentence_th) && (
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-[#1C2430] border border-emerald-200/80 dark:border-white/10 space-y-1.5">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-[#10B981]">
                  {isEn ? 'Context Example:' : 'ตัวอย่างบริบทการใช้งาน:'}
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

            {/* Source & Metadata Attribution */}
            <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#64748B]">
              <span>Source: {selectedCandidate.source}</span>
              <span>Domain: {selectedCandidate.domain}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
