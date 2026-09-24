import React from 'react';
import { UserProgressState, CEFRLevel } from '../../types';
import { CEFR_LEVELS } from '../../data/cefrLevels';
import {
  BarChart2,
  TrendingUp,
  AlertTriangle,
  Play,
  Award,
  Calendar,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { NavView } from '../common/Sidebar';

interface AnalyticsViewProps {
  progress: UserProgressState;
  onNavigate: (view: NavView) => void;
  onStartRemediation: (weakTag: string) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  progress,
  onNavigate,
  onStartRemediation,
}) => {
  const currentLevelInfo =
    CEFR_LEVELS.find((l) => l.level === progress.currentLevel) || CEFR_LEVELS[0];

  const skillsData = [
    { name: 'คำศัพท์ (Vocabulary)', score: progress.skillStats.vocabulary, color: 'bg-blue-500' },
    { name: 'ไวยากรณ์ (Grammar)', score: progress.skillStats.grammar, color: 'bg-emerald-500' },
    { name: 'การอ่าน (Reading)', score: progress.skillStats.reading, color: 'bg-purple-500' },
    { name: 'การฟัง (Listening)', score: progress.skillStats.listening, color: 'bg-amber-500' },
    { name: 'การเขียน (Writing)', score: progress.skillStats.writing, color: 'bg-rose-500' },
    { name: 'การพูด (Speaking)', score: progress.skillStats.speaking, color: 'bg-teal-500' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner: CEFR & Cambridge Score Summary */}
      <div className="rounded-2xl bg-card border border-border/70 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                CEFR {progress.currentLevel}
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
            <span className="text-[11px] text-muted-foreground uppercase font-medium">คะแนนเทียบเคียงเคมบริดจ์</span>
            <p className="text-3xl font-extrabold text-primary font-mono mt-0.5">
              {progress.estimatedCambridgeScore}
            </p>
            <span className="text-[10px] text-muted-foreground block">
              สเกล 80 - 230 คะแนน
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

          <div className="space-y-4 pt-1">
            {skillsData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-foreground">{item.name}</span>
                  <span className="font-mono text-muted-foreground">{item.score}%</span>
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
              {progress.weakTopics.length} จุด
            </span>
          </div>

          {progress.weakTopics.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-medium text-foreground">ไม่พบจุดบกพร่องสะสม</p>
              <p>ทำแบบฝึกหัดเพิ่มเติมเพื่อวิเคราะห์เชิงลึก</p>
            </div>
          ) : (
            <div className="space-y-3">
              {progress.weakTopics.map((w) => (
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
    </div>
  );
};
