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

interface AnalyticsViewProps {
  progress: UserProgressState;
  onNavigate: (view: NavView) => void;
  onStartRemediation: (weakTag: string) => void;
}

const SKILL_COLOR_MAP: Record<string, string> = {
  vocabulary: 'bg-blue-500',
  grammar: 'bg-emerald-500',
  reading: 'bg-purple-500',
  listening: 'bg-amber-500',
  writing: 'bg-rose-500',
  speaking: 'bg-teal-500',
};

const SKILL_LABEL_TH: Record<string, string> = {
  vocabulary: 'คำศัพท์ (Vocabulary)',
  grammar: 'ไวยากรณ์ (Grammar)',
  reading: 'การอ่าน (Reading)',
  listening: 'การฟัง (Listening)',
  writing: 'การเขียน (Writing)',
  speaking: 'การพูด (Speaking)',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  progress,
  onNavigate,
  onStartRemediation,
}) => {
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
      setError(err?.friendlyMessage || err?.message || 'ไม่สามารถโหลดข้อมูลสถิติการเรียนรู้ได้');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

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
      <div className="w-full max-w-5xl mx-auto py-16 text-center space-y-3">
        <LoadingSpinner size="lg" text="กำลังดึงข้อมูลสถิติและการวิเคราะห์เชิงลึกจากเซิร์ฟเวอร์..." />
        <p className="text-xs text-muted-foreground">
          ระบบกำลังประมวลผลความแม่นยำรายทักษะ ประวัติการทำข้อสอบ และจุดอ่อนสะสม
        </p>
      </div>
    );
  }

  // Error State
  if (error && !analytics && status === 'authenticated') {
    return (
      <div className="w-full max-w-5xl mx-auto py-12">
        <ErrorMessage
          title="เกิดข้อผิดพลาดในการโหลดข้อมูลสถิติ"
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
        name: SKILL_LABEL_TH[s.skill] || s.skill,
        score: s.proficiency_score,
        accuracy: s.accuracy_percentage,
        attempted: s.total_attempted,
        pending: s.pending_evaluation_count,
        color: SKILL_COLOR_MAP[s.skill] || 'bg-primary',
      }))
    : [
        { name: 'คำศัพท์ (Vocabulary)', score: progress.skillStats.vocabulary, accuracy: null, attempted: 0, pending: 0, color: 'bg-blue-500' },
        { name: 'ไวยากรณ์ (Grammar)', score: progress.skillStats.grammar, accuracy: null, attempted: 0, pending: 0, color: 'bg-emerald-500' },
        { name: 'การอ่าน (Reading)', score: progress.skillStats.reading, accuracy: null, attempted: 0, pending: 0, color: 'bg-purple-500' },
        { name: 'การฟัง (Listening)', score: progress.skillStats.listening, accuracy: null, attempted: 0, pending: 0, color: 'bg-amber-500' },
        { name: 'การเขียน (Writing)', score: progress.skillStats.writing, accuracy: null, attempted: 0, pending: 0, color: 'bg-rose-500' },
        { name: 'การพูด (Speaking)', score: progress.skillStats.speaking, accuracy: null, attempted: 0, pending: 0, color: 'bg-teal-500' },
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
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner: CEFR & Cambridge Score Summary */}
      <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                CEFR {currentLevel}
              </span>
              <span className="text-xs text-muted-foreground">
                เป้าหมายการสอบ: Cambridge {progress.targetExam}
              </span>
            </div>
            <h1 className="text-fluid-title font-bold text-foreground">
              แดชบอร์ดวิเคราะห์ผลการเรียน (Performance Telemetry)
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              {currentLevelInfo.descriptionTh}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-center shrink-0">
            <span className="text-[11px] text-muted-foreground uppercase font-medium">คะแนนประเมินเทียบเคียง</span>
            <p className="text-3xl font-extrabold text-primary font-mono mt-0.5">
              {estimatedScore}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              สเกลเทียบเคียง 80 - 230 คะแนน
            </span>
          </div>
        </div>

        {/* Can-Do Descriptors at Current CEFR Level */}
        <div className="pt-5 space-y-2">
          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            ความสามารถที่คุณทำได้แล้วในระดับนี้ (Can-Do Descriptors):
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
            {currentLevelInfo.canDoDescriptorsTh.map((desc, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-foreground flex items-start gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cambridge / CEFR Disclaimer */}
        <div className="mt-5 p-3 rounded-xl bg-muted/40 border border-border/50 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <span>
            {analytics?.disclaimer ||
              'คะแนนและการวิเคราะห์ในระบบนี้เป็นค่าประเมินความพร้อมของแพลตฟอร์มเพื่อแนวทางการเรียนรู้เท่านั้น ไม่ใช่ผลสอบรับรองอย่างเป็นทางการจาก Cambridge English Qualifications'}
          </span>
        </div>
      </div>

      {/* Telemetry Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground">คำถามที่ทำทั้งหมด</span>
          <p className="text-2xl font-bold font-mono text-foreground">{totalAttempted}</p>
          <span className="text-[11px] text-muted-foreground">ข้อที่ทำแล้ว</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground">ความแม่นยำรวม (Accuracy)</span>
          {overallAccuracy !== null ? (
            <p className="text-2xl font-bold font-mono text-primary">{overallAccuracy}%</p>
          ) : (
            <p className="text-sm font-medium text-muted-foreground pt-1">ไม่มีข้อมูล</p>
          )}
          <span className="text-[11px] text-muted-foreground">
            {totalCorrect > 0 ? `ตอบถูก ${totalCorrect} ข้อ` : 'ต้องทำแบบฝึกหัดก่อน'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground">จุดอ่อนสะสม</span>
          <p className="text-2xl font-bold font-mono text-amber-500">{weaknessesList.length}</p>
          <span className="text-[11px] text-muted-foreground">หัวข้อที่ควรซ่อม</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground">Mock Exams ที่ส่งแล้ว</span>
          <p className="text-2xl font-bold font-mono text-foreground">
            {analytics?.overview.completed_mock_exams_count ?? 0}
          </p>
          <span className="text-[11px] text-muted-foreground">ชุดข้อสอบจำลอง</span>
        </div>
      </div>

      {/* Grid: 6 Skill Mastery Breakdown & Weakness Detection Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (7 cols): Detailed Skill Proficiency Bars */}
        <div className="lg:col-span-7 rounded-2xl bg-card border border-border/70 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                ความเชี่ยวชาญแยกตาม 6 ทักษะหลัก (Skill Proficiency)
              </h3>
            </div>
            <span className="text-xs text-muted-foreground font-mono">100% Scale</span>
          </div>

          {totalAttempted === 0 && status === 'authenticated' ? (
            <EmptyState
              title="ยังไม่มีข้อมูลประวัติการทำแบบฝึกหัด"
              description="เริ่มฝึกทำข้อสอบรายทักษะเพื่อเปิดระบบวิเคราะห์ความแม่นยำและความเชี่ยวชาญระดับภาษาของคุณ"
              action={
                <button
                  onClick={() => onNavigate('grammar')}
                  className="py-2 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                >
                  เริ่มทำแบบฝึกหัด
                </button>
              }
            />
          ) : (
            <div className="space-y-4 pt-1">
              {skillsData.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-foreground">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.accuracy !== null && item.attempted > 0 && (
                        <span className="text-[11px] text-muted-foreground">
                          ความแม่นยำ {item.accuracy}%
                        </span>
                      )}
                      {item.pending > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          รอตรวจ {item.pending} ข้อ
                        </span>
                      )}
                      <span className="font-mono text-foreground font-semibold">{item.score}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-xl bg-muted/40 border border-border/40 mt-4 text-xs text-muted-foreground flex items-center justify-between">
            <span>คำศัพท์ที่บันทึกว่าจำได้แล้ว:</span>
            <span className="font-mono font-bold text-foreground">
              {progress.masteredWordIds.length} คำ
            </span>
          </div>
        </div>

        {/* Right (5 cols): Targeted Weakness Remediation */}
        <div className="lg:col-span-5 rounded-2xl bg-card border border-border/70 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm sm:text-base text-foreground">
                การวิเคราะห์จุดอ่อน (Weakness Detection)
              </h3>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
              {weaknessesList.length} จุด
            </span>
          </div>

          {weaknessesList.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-medium text-foreground">ไม่พบจุดบกพร่องสะสม</p>
              <p>ทำแบบฝึกหัดเพิ่มเติมเพื่อให้ระบบช่วยตรวจจับจุดที่ทำผิดซ้ำ</p>
            </div>
          ) : (
            <div className="space-y-3">
              {weaknessesList.map((w) => (
                <div
                  key={w.tag}
                  className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2.5"
                >
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-foreground">
                      {w.labelTh}
                    </h4>
                    <p className="text-[11px] text-rose-400 mt-0.5">
                      ทำผิดซ้ำ {w.errorCount} ครั้งล่าสุด
                    </p>
                  </div>

                  <button
                    onClick={() => onStartRemediation(w.tag)}
                    className="w-full py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors touch-target"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>เริ่มฝึกซ่อมจุดนี้ทันที</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mock Exam History (if available) */}
      {analytics && analytics.mock_exam_history.length > 0 && (
        <div className="rounded-2xl bg-card border border-border/70 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <FileText className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm sm:text-base text-foreground">
              ประวัติการทำชุดข้อสอบจำลอง (Mock Exam History)
            </h3>
          </div>

          <div className="divide-y divide-border/40">
            {analytics.mock_exam_history.map((m) => (
              <div key={m.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground text-sm">{m.exam_title}</p>
                  <p className="text-muted-foreground mt-0.5">
                    Cambridge {m.exam_code} • CEFR {m.estimated_cefr_level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-foreground text-sm">{m.percentage_score}%</p>
                  <p className="text-muted-foreground text-[11px]">
                    เทียบเคียง {m.estimated_cambridge_score} คะแนน
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
