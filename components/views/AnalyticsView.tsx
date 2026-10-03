'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { UserProgressState, CEFRLevel } from '../../types';
import { CEFR_LEVELS } from '../../data/cefrLevels';
import {
  TrendingUp,
  AlertTriangle,
  Play,
  CheckCircle2,
  ShieldAlert,
  Clock,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { NavView } from '../common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { getUserAnalytics } from '../../lib/api/analytics';
import { UserAnalyticsResponse } from '../../lib/api/types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorMessage } from '../common/ErrorMessage';
import { EmptyState } from '../common/EmptyState';
import { useTranslation } from '../../i18n';
import {
  GlovaButton,
  GlovaCard,
  GlovaBadge,
  GlovaProgress,
  GlovaFeedbackBubble,
} from '../ui';
import {
  TactileButton,
  SpotlightCard,
  BorderBeam,
  BentoGrid,
  BentoCard,
  DecryptedText,
  ShinyText,
  AnimatedNumber,
  TacticalHudFrame,
} from '../ui/GlovaPrimitives';

interface AnalyticsViewProps {
  progress: UserProgressState;
  onNavigate: (view: NavView) => void;
  onStartRemediation: (weakTag: string) => void;
}

const SKILL_COLOR_MAP: Record<string, string> = {
  vocabulary: 'bg-[#FA5D5D]',
  grammar: 'bg-emerald-500',
  reading: 'bg-purple-500',
  listening: 'bg-amber-500',
  writing: 'bg-rose-500',
  speaking: 'bg-teal-500',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  progress,
  onNavigate,
  onStartRemediation,
}) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const { status } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(status === 'authenticated');
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getUserAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.warn('Failed to fetch server analytics:', err);
      setError(err?.friendlyMessage || err?.message || (isEn ? 'Failed to load analytics data' : 'ไม่สามารถโหลดข้อมูลสถิติการเรียนรู้ได้'));
    } finally {
      setIsLoading(false);
    }
  }, [status, isEn]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const currentLevel = (analytics?.diagnostic_placement?.current_cefr_level as CEFRLevel) || progress.currentLevel;
  const currentLevelInfo =
    CEFR_LEVELS.find((l) => l.level === currentLevel) || CEFR_LEVELS[0];

  const estimatedScore =
    analytics?.diagnostic_placement?.estimated_cambridge_score ?? progress.estimatedCambridgeScore;

  // Loading State
  if (isLoading) {
    return (
      <div className="w-full py-16 text-center space-y-3">
        <LoadingSpinner
          size="lg"
          text={isEn ? "Retrieving analytics and diagnostic breakdown from server..." : "กำลังดึงข้อมูลสถิติและการวิเคราะห์เชิงลึกจากเซิร์ฟเวอร์..."}
        />
        <p className="text-xs text-muted-foreground">
          {isEn
            ? "Processing multi-skill accuracy, mock test histories, and identified learning gaps."
            : "ระบบกำลังประมวลผลความแม่นยำรายทักษะ ประวัติการทำข้อสอบ และจุดอ่อนสะสม"}
        </p>
      </div>
    );
  }

  // Error State
  if (error && !analytics && status === 'authenticated') {
    return (
      <div className="w-full max-w-5xl mx-auto py-12">
        <ErrorMessage
          title={isEn ? "Unable to load telemetry analytics" : "ไม่สามารถโหลดข้อมูลสถิติได้ในขณะนี้"}
          message={error}
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  // Determine overview stats
  const totalAttempted = analytics?.overview.total_questions_attempted ?? progress.completedQuestionIds.length;
  const totalCorrect = analytics?.overview.total_questions_correct ?? 0;
  const overallAccuracy = analytics?.overview.overall_accuracy_percentage ?? null;

  // Skills data
  const skillsData = analytics
    ? analytics.skills_breakdown.map((s) => ({
        name: t(`skills.${s.skill}`),
        score: s.proficiency_score,
        accuracy: s.accuracy_percentage,
        attempted: s.total_attempted,
        pending: s.pending_evaluation_count,
        color: SKILL_COLOR_MAP[s.skill] || 'bg-primary',
      }))
    : [
        { name: t('skills.vocabulary'), score: progress.skillStats.vocabulary, accuracy: null, attempted: 0, pending: 0, color: 'bg-[#FA5D5D]' },
        { name: t('skills.grammar'), score: progress.skillStats.grammar, accuracy: null, attempted: 0, pending: 0, color: 'bg-emerald-500' },
        { name: t('skills.reading'), score: progress.skillStats.reading, accuracy: null, attempted: 0, pending: 0, color: 'bg-purple-500' },
        { name: t('skills.listening'), score: progress.skillStats.listening, accuracy: null, attempted: 0, pending: 0, color: 'bg-amber-500' },
        { name: t('skills.writing'), score: progress.skillStats.writing, accuracy: null, attempted: 0, pending: 0, color: 'bg-rose-500' },
        { name: t('skills.speaking'), score: progress.skillStats.speaking, accuracy: null, attempted: 0, pending: 0, color: 'bg-teal-500' },
      ];

  // Weaknesses data
  const weaknessesList = analytics
    ? analytics.weaknesses_summary.map((w) => ({
        tag: w.weakness_tag,
        labelTh: w.weakness_tag.replace(/_/g, ' '),
        errorCount: w.error_count,
      }))
    : progress.weakTopics.map((w) => ({
        tag: w.tag,
        labelTh: w.labelTh,
        errorCount: w.errorCount,
      }));

  return (
    <div className="w-full space-y-6 pb-12">
      {/* 1. Unified Studio Hero Diagnostic Banner */}
      <div className="relative rounded-[32px] bg-gradient-to-r from-slate-50 via-white to-amber-500/50 dark:from-[#1E1B28] dark:to-[#171520] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 overflow-hidden shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-white/10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-8 h-8 rounded-full bg-[#FA5D5D] text-white flex items-center justify-center shadow-xs shrink-0">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="px-3 py-1 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20 text-xs font-black uppercase tracking-wider">
                CEFR {currentLevel} Diagnostic Telemetry
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                {isEn ? `Exam Target: Cambridge ${progress.targetExam}` : `เป้าหมายการสอบ: Cambridge ${progress.targetExam}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('analytics.title')}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {isEn ? (currentLevelInfo.descriptionEn || currentLevelInfo.descriptionTh) : currentLevelInfo.descriptionTh}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Telemetry Chips */}
            <div className="flex flex-col gap-2">
              <div className="px-3.5 py-1.5 rounded-full bg-[#E3F6ED] dark:bg-[#102B22] text-[#1E7E52] dark:text-emerald-300 border border-[#C5EBDA] dark:border-emerald-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Cambridge Score: {estimatedScore}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{weaknessesList.length} Learning Gaps</span>
              </div>
            </div>

            {/* Score Highlight Card */}
            <div className="p-4 sm:p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 text-center shadow-xs min-w-[170px]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold font-mono">
                {isEn ? 'Estimated Cambridge Score' : 'คะแนนประเมินเทียบเคียง'}
              </span>
              <p className="text-3xl font-black text-[#FA5D5D] font-mono mt-0.5">
                <AnimatedNumber value={estimatedScore} />
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">
                {isEn ? 'Scale: 80 - 230 marks' : 'สเกล 80 - 230 คะแนน'}
              </span>
            </div>
          </div>
        </div>

        <GlovaFeedbackBubble
          currentSkill="analytics"
          customTip={
            isEn
              ? 'Diagnostic engine analyzes cross-skill performance, calculates accuracy, and clusters accumulated learning gaps for focused remediation.'
              : 'ระบบวิเคราะห์ผลลัพธ์การเรียนรู้รายทักษะ คำนวณความแม่นยำ และจัดกลุ่มจุดบกพร่องสะสมเพื่อแนะนำการฝึกซ่อมจุดอ่อนได้อย่างตรงจุด'
          }
        />

        {/* Can-Do Descriptors at Current CEFR Level */}
        <div className="pt-2 space-y-2">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">
            {t('analytics.can_do_descriptors')}:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {currentLevelInfo.canDoDescriptorsTh.map((desc, i) => (
              <div
                key={i}
                className="p-3.5 rounded-[18px] bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-sans">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cambridge / CEFR Disclaimer */}
        <div className="mt-2 p-3.5 rounded-[22px] bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2.5 text-xs text-slate-600 dark:text-amber-200/90 shadow-2xs font-sans">
          <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <span>
            {analytics?.disclaimer ||
              (isEn
                ? 'Scores and analytics in this platform are estimation benchmarks for learning guidance, not an official certification from Cambridge English Qualifications.'
                : 'คะแนนและการวิเคราะห์ในระบบนี้เป็นค่าประเมินความพร้อมของแพลตฟอร์มเพื่อแนวทางการเรียนรู้เท่านั้น ไม่ใช่ผลสอบรับรองอย่างเป็นทางการจาก Cambridge English Qualifications')}
          </span>
        </div>
      </div>

      {/* Telemetry Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {isEn ? 'Total Questions' : 'คำถามที่ทำทั้งหมด'}
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            <AnimatedNumber value={totalAttempted} />
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-sans">
            {isEn ? 'Questions completed' : 'ข้อที่ทำแล้ว'}
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">{t('analytics.accuracy')}</span>
          {overallAccuracy !== null ? (
            <p className="text-2xl sm:text-3xl font-black font-mono text-[#FA5D5D]">
              <AnimatedNumber value={overallAccuracy} />%
            </p>
          ) : (
            <p className="text-sm font-semibold text-slate-400 pt-1 font-sans">
              {isEn ? 'No data' : 'ไม่มีข้อมูล'}
            </p>
          )}
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-sans">
            {totalCorrect > 0
              ? (isEn ? `${totalCorrect} correct` : `ตอบถูก ${totalCorrect} ข้อ`)
              : (isEn ? 'Requires practice sessions' : 'ต้องทำแบบฝึกหัดก่อน')}
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {isEn ? 'Learning Gaps' : 'จุดอ่อนสะสม'}
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-amber-500">
            <AnimatedNumber value={weaknessesList.length} />
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-sans">
            {isEn ? 'Areas to reinforce' : 'หัวข้อที่ควรซ่อม'}
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 space-y-1 shadow-xs">
          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            {isEn ? 'Completed Mock Exams' : 'Mock Exams ที่ส่งแล้ว'}
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
            <AnimatedNumber value={analytics?.overview.completed_mock_exams_count ?? 0} />
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-sans">
            {isEn ? 'Mock exam sets' : 'ชุดข้อสอบจำลอง'}
          </span>
        </div>
      </div>

      {/* Grid: 6 Skill Mastery Breakdown & Weakness Detection Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Detailed Skill Proficiency Bars */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-5 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                {t('analytics.skill_proficiency')}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono font-bold">100% Scale</span>
          </div>

          {totalAttempted === 0 && status === 'authenticated' ? (
            <EmptyState
              title={isEn ? "No practice history recorded yet" : "ยังไม่มีประวัติการทำแบบฝึกหัด"}
              description={isEn ? "Start practicing skill modules to unlock personalized accuracy telemetry and proficiency analytics." : "ยังไม่มีประวัติการทำแบบฝึกหัด เริ่มทำแบบฝึกหัดแรกของคุณเพื่อเปิดระบบวิเคราะห์ความเชี่ยวชาญระดับภาษา"}
              action={
                <GlovaButton
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('grammar')}
                  className="rounded-full bg-[#FA5D5D] hover:bg-[#ff4747] text-white"
                >
                  {isEn ? "Start Your First Exercise" : "เริ่มทำแบบฝึกหัดแรกของคุณ"}
                </GlovaButton>
              }
            />
          ) : (
            <div className="space-y-4 pt-1">
              {skillsData.map((item) => (
                <div key={item.name} className="space-y-1.5 p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-slate-200/60 dark:border-white/10 shadow-2xs">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.accuracy !== null && item.attempted > 0 && (
                        <span className="text-[11px] text-slate-500 font-mono">
                          {isEn ? `Accuracy ${item.accuracy}%` : `ความแม่นยำ ${item.accuracy}%`}
                        </span>
                      )}
                      {item.pending > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-bold">
                          {isEn ? `Pending ${item.pending}` : `รอตรวจ ${item.pending} ข้อ`}
                        </span>
                      )}
                      <span className="font-mono text-slate-900 dark:text-white font-black">{item.score}%</span>
                    </div>
                  </div>
                  <GlovaProgress value={item.score} showLabel={false} />
                </div>
              ))}
            </div>
          )}

          <div className="p-4 rounded-[20px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-slate-200/60 dark:border-white/10 mt-4 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between shadow-2xs">
            <span className="font-bold font-sans">{isEn ? 'Mastered vocabulary saved:' : 'คำศัพท์ที่บันทึกว่าจำได้แล้ว:'}</span>
            <span className="font-mono font-black text-slate-900 dark:text-white">
              {progress.masteredWordIds.length} {isEn ? 'words' : 'คำ'}
            </span>
          </div>
        </div>

        {/* Right (5 cols): Targeted Weakness Remediation */}
        <div className="lg:col-span-5 p-6 sm:p-8 space-y-5 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
                {t('analytics.weakness_detection')}
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#FEF5E5] dark:bg-[#2B2010] text-[#D98200] dark:text-[#FFBA38] border border-[#FDE5BC] dark:border-amber-500/20 text-xs font-mono font-bold">
              {weaknessesList.length} {isEn ? 'areas' : 'จุด'}
            </span>
          </div>

          {weaknessesList.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {isEn ? 'No recurring learning gaps detected' : 'ไม่พบจุดบกพร่องสะสม'}
              </p>
              <p className="font-sans">
                {isEn ? 'Complete additional exercises to allow the system to detect recurring error patterns.' : 'ทำแบบฝึกหัดเพิ่มเติมเพื่อให้ระบบช่วยตรวจจับจุดที่ทำผิดซ้ำ'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weaknessesList.map((w) => (
                <div
                  key={w.tag}
                  className="p-4 rounded-[22px] bg-[#FAF8F3] dark:bg-[#13111C]/60 border border-slate-200/60 dark:border-white/10 space-y-3 shadow-2xs"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-sans">
                      {w.labelTh}
                    </h4>
                    <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-0.5 font-mono font-semibold">
                      {isEn ? `Missed ${w.errorCount} time(s) recently` : `ทำผิดซ้ำ ${w.errorCount} ครั้งล่าสุด`}
                    </p>
                  </div>

                  <GlovaButton
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => onStartRemediation(w.tag)}
                    className="rounded-full bg-white hover:bg-slate-50 dark:bg-white/10 dark:hover:bg-white/15 border border-slate-200/80 dark:border-white/10 text-slate-800 dark:text-slate-200 font-bold shadow-2xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current mr-1.5 text-[#FA5D5D]" />
                    <span>{t('analytics.remediation_action')}</span>
                  </GlovaButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mock Exam History (if available) */}
      {analytics && analytics.mock_exam_history.length > 0 && (
        <div className="p-6 sm:p-8 space-y-4 rounded-[28px] bg-white dark:bg-[#1E1B28] border border-slate-200/80 dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-white/10">
            <div className="w-8 h-8 rounded-full bg-[#FA5D5D]/10 text-[#FA5D5D] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-black text-base text-slate-900 dark:text-white tracking-tight">
              {t('analytics.mock_exam_history')}
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {analytics.mock_exam_history.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{m.exam_title}</p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                    Cambridge {m.exam_code} • CEFR {m.estimated_cefr_level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-black text-slate-900 dark:text-white text-sm">{m.percentage_score}%</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono">
                    {isEn ? `Equivalent ${m.estimated_cambridge_score} pts` : `เทียบเคียง ${m.estimated_cambridge_score} คะแนน`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
