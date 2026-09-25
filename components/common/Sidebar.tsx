'use client';
import React from 'react';
import { useTranslation } from '../../i18n';
import {
  LayoutDashboard,
  ClipboardCheck,
  BookOpen,
  Sparkles,
  BookMarked,
  Headphones,
  PenTool,
  Mic,
  GraduationCap,
  BarChart2,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'assessment'
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'listening'
  | 'writing'
  | 'speaking'
  | 'mockExam'
  | 'analytics';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  assessmentCompleted: boolean;
}

interface NavItem {
  id: NavView;
  labelEn: string;
  labelTh: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelEn: 'Dashboard', labelTh: 'หน้าหลักการเรียน', icon: LayoutDashboard },
  { id: 'assessment', labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR', icon: ClipboardCheck, badge: 'A1-C2' },
  { id: 'vocabulary', labelEn: 'Vocabulary', labelTh: 'คลังคำศัพท์', icon: BookOpen },
  { id: 'grammar', labelEn: 'Grammar', labelTh: 'ไวยากรณ์ไทย-อังกฤษ', icon: Sparkles },
  { id: 'reading', labelEn: 'Reading', labelTh: 'อ่านจับใจความ', icon: BookMarked },
  { id: 'listening', labelEn: 'Listening', labelTh: 'ทักษะการฟัง', icon: Headphones },
  { id: 'writing', labelEn: 'Writing', labelTh: 'ทักษะการเขียน', icon: PenTool },
  { id: 'speaking', labelEn: 'Speaking', labelTh: 'การพูดและออกเสียง', icon: Mic },
  { id: 'mockExam', labelEn: 'Mock Exams', labelTh: 'สอบจำลอง Cambridge', icon: GraduationCap, badge: 'KET/PET/FCE' },
  { id: 'analytics', labelEn: 'Performance', labelTh: 'วิเคราะห์จุดอ่อน', icon: BarChart2 },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSelectView }) => {
  const { t } = useTranslation();

  return (
    <aside
      className="hidden md:flex flex-col w-56 lg:w-64 border-r border-border/40 bg-card/40 shrink-0 select-none py-4 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
      aria-label="Desktop Navigation"
    >
      <div className="px-3 pb-3 mb-2 border-b border-border/40">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t('nav.learning_journey')}
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group touch-target text-left ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                <div className="truncate">
                  <span className="block truncate text-xs lg:text-sm font-medium">
                    {t(`nav.${item.id}`)}
                  </span>
                </div>
              </div>

              {item.badge && (
                <span className="hidden lg:inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold bg-muted text-muted-foreground border border-border">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      <div className="pt-4 border-t border-border/40 mt-auto">
        <div className="p-3 rounded-lg bg-muted/40 border border-border/40">
          <p className="text-[11px] font-medium text-foreground">Cambridge Framework</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            KET (A2) • PET (B1) • FCE (B2) • CAE (C1)
          </p>
        </div>
      </div>
    </aside>
  );
};
