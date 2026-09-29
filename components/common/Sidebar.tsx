'use client';
import React, { useEffect } from 'react';
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
  Award,
  BarChart2,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Swords,
  Trophy,
  Users,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { GlovaLogo } from '../ui/GlovaLogo';

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
  | 'analytics'
  | 'profile'
  | 'compete'
  | 'ranking'
  | 'social'
  | 'achievements';

export interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  assessmentCompleted?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export interface NavItem {
  id: NavView;
  labelEn: string;
  labelTh: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  section: 'learn' | 'arena' | 'practice' | 'progress';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelEn: 'Dashboard', labelTh: 'หน้าหลักการเรียน', icon: LayoutDashboard, section: 'learn' },
  { id: 'vocabulary', labelEn: 'Vocabulary Lab', labelTh: 'คลังคำศัพท์ Oxford', icon: BookOpen, badge: '3,860', section: 'learn' },
  { id: 'grammar', labelEn: 'Grammar Studio', labelTh: 'ไวยากรณ์และไทม์ไลน์', icon: Sparkles, section: 'learn' },
  { id: 'reading', labelEn: 'Reading Lab', labelTh: 'อ่านจับใจความวิชาการ', icon: BookMarked, section: 'learn' },
  { id: 'listening', labelEn: 'Listening Studio', labelTh: 'สตูดิโอการฟังสำเนียง', icon: Headphones, section: 'learn' },
  { id: 'writing', labelEn: 'Writing Workspace', labelTh: 'พื้นที่ฝึกเขียนเรียงความ', icon: PenTool, section: 'learn' },
  { id: 'speaking', labelEn: 'Speaking Lab', labelTh: 'ฝึกการพูดและออกเสียง', icon: Mic, section: 'learn' },
  { id: 'compete', labelEn: 'Ranked Arena 4s', labelTh: 'ประลองคำศัพท์ 4 วินาที', icon: Swords, badge: 'MMR', section: 'arena' },
  { id: 'ranking', labelEn: 'University League', labelTh: 'ตารางคะแนนลีกมหาวิทยาลัย', icon: Trophy, badge: 'Top 3', section: 'arena' },
  { id: 'social', labelEn: 'Study Together', labelTh: 'อ่านหนังสือกับเพื่อน', icon: Users, badge: 'Live', section: 'arena' },
  { id: 'achievements', labelEn: 'Trophy Hall', labelTh: 'เหรียญความสำเร็จ', icon: Award, section: 'arena' },
  { id: 'assessment', labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR แม่นยำ', icon: ClipboardCheck, badge: 'A1-C2', section: 'practice' },
  { id: 'mockExam', labelEn: 'Cambridge Mock Hall', labelTh: 'สอบจำลองเคมบริดจ์', icon: GraduationCap, badge: 'KET-CPE', section: 'practice' },
  { id: 'analytics', labelEn: 'Skill Analytics', labelTh: 'วิเคราะห์ทักษะและจุดอ่อน', icon: BarChart2, section: 'progress' },
  { id: 'profile', labelEn: 'Profile & Dossier', labelTh: 'โปรไฟล์และเป้าหมาย', icon: User, section: 'progress' },
];

interface NavSectionDef {
  id: 'learn' | 'arena' | 'practice' | 'progress';
  labelEn: string;
  labelTh: string;
}

const NAV_SECTIONS: NavSectionDef[] = [
  { id: 'learn', labelEn: 'LEARNING STUDIOS', labelTh: 'สตูดิโอการเรียนรู้' },
  { id: 'arena', labelEn: 'ARENA & SOCIAL', labelTh: 'สมรภูมิและชุมชน' },
  { id: 'practice', labelEn: 'PRACTICE HALL', labelTh: 'ฝึกฝนและข้อสอบจำลอง' },
  { id: 'progress', labelEn: 'STUDY PROGRESS', labelTh: 'ความก้าวหน้าและโปรไฟล์' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { t, language } = useTranslation();
  const isEn = language === 'en';

  // Lock body scroll when mobile off-canvas drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  // Handle escape key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const renderNavButtons = (collapsedMode: boolean, onItemClick?: () => void) => {
    return NAV_SECTIONS.map((section) => {
      const sectionItems = NAV_ITEMS.filter((item) => item.section === section.id);
      if (sectionItems.length === 0) return null;

      const sectionTitle = isEn ? section.labelEn : section.labelTh;

      return (
        <div key={section.id} className="space-y-1">
          {!collapsedMode ? (
            <div className="px-3 pt-3.5 pb-1.5 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/75 font-mono select-none">
              {sectionTitle}
            </div>
          ) : (
            <div className="h-px bg-border/40 mx-2 my-2.5" />
          )}

          {sectionItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const itemLabel = isEn ? item.labelEn : item.labelTh;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  if (onItemClick) onItemClick();
                }}
                title={collapsedMode ? itemLabel : undefined}
                aria-label={itemLabel}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center rounded-xl text-sm transition-all group min-h-[42px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]/50 active:scale-[0.98] ${
                  collapsedMode
                    ? 'justify-center p-2.5'
                    : 'justify-start px-3 py-2 gap-2.5'
                } ${
                  isActive
                    ? 'bg-[#5B5CE2] text-white font-bold shadow-xs shadow-[#5B5CE2]/25'
                    : 'text-[#24233A] dark:text-foreground/80 hover:text-foreground hover:bg-[#E9E5FF]/40 dark:hover:bg-muted/40 font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-muted-foreground group-hover:text-[#5B5CE2] dark:group-hover:text-indigo-400'
                  }`}
                />
                {!collapsedMode && (
                  <span className="truncate text-xs font-display flex-1 text-left">
                    {itemLabel}
                  </span>
                )}

                {!collapsedMode && item.badge && (
                  <span
                    className={`ml-auto inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Live' || item.badge === 'MMR'
                        ? 'bg-[#FF8F82]/15 text-[#FF8F82]'
                        : 'bg-[#EDE8DF]/80 dark:bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* 1. Desktop / Tablet Collapsible Sidebar (>= 768px) */}
      <aside
        className={`hidden md:flex flex-col border-r border-[#EDE8DF] dark:border-border/40 bg-white/70 dark:bg-card/40 backdrop-blur-xs shrink-0 select-none py-3.5 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16 lg:w-[72px]' : 'w-60 lg:w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Top Header & Collapse Toggle */}
        <div className={`flex items-center pb-2.5 mb-1.5 border-b border-[#EDE8DF] dark:border-border/40 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono select-none">
                {isEn ? 'Learning Suite' : 'ห้องเรียนภาษาอังกฤษ'}
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#EDE8DF]/60 dark:hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]/50 active:scale-95"
              title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
              aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-2 pt-0.5">
          {renderNavButtons(isCollapsed)}
        </nav>

        {/* Footer Info Box (Only when expanded) */}
        {!isCollapsed && (
          <div className="pt-3.5 border-t border-[#EDE8DF] dark:border-border/40 mt-auto">
            <div className="p-3 rounded-2xl bg-[#FFFDF8] dark:bg-card border border-[#EDE8DF] dark:border-border/60 shadow-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#5B5CE2]" />
                <span className="text-[11px] font-black text-foreground font-display">Cambridge Scale</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-grotesk leading-snug">
                CEFR A1 to C2 Framework &bull; KET, PET, FCE, CAE, CPE
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (< 768px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#FFFDF8] dark:bg-card border-r border-[#EDE8DF] dark:border-border p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#EDE8DF] dark:border-border/40">
              <div className="flex items-center gap-2.5">
                <GlovaLogo size={28} variant="radiant" ariaLabel="Glova" />
                <div className="flex flex-col">
                  <span className="font-black text-base text-[#5B5CE2] dark:text-indigo-400 font-display">
                    Glova
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
                    University English
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[#EDE8DF]/60 dark:hover:bg-secondary transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 space-y-2">
              {renderNavButtons(false, onCloseMobile)}
            </nav>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-[#EDE8DF] dark:border-border/40 mt-4">
              <div className="p-2.5 rounded-xl bg-white dark:bg-muted/40 border border-[#EDE8DF] dark:border-border/40 text-center">
                <p className="text-[11px] font-bold text-foreground font-display">Cambridge English Alignment</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">CEFR A1 to C2 Framework</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
