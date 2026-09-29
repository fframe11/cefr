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
  { id: 'vocabulary', labelEn: 'Vocabulary', labelTh: 'คลังคำศัพท์', icon: BookOpen, section: 'learn' },
  { id: 'grammar', labelEn: 'Grammar', labelTh: 'ไวยากรณ์ไทย-อังกฤษ', icon: Sparkles, section: 'learn' },
  { id: 'reading', labelEn: 'Reading', labelTh: 'อ่านจับใจความ', icon: BookMarked, section: 'learn' },
  { id: 'listening', labelEn: 'Listening', labelTh: 'ทักษะการฟัง', icon: Headphones, section: 'learn' },
  { id: 'writing', labelEn: 'Writing', labelTh: 'ทักษะการเขียน', icon: PenTool, section: 'learn' },
  { id: 'speaking', labelEn: 'Speaking', labelTh: 'การพูดและออกเสียง', icon: Mic, section: 'learn' },
  { id: 'compete', labelEn: 'Vocab Battle', labelTh: 'ประลองคำศัพท์', icon: Swords, badge: '4s Fast', section: 'arena' },
  { id: 'ranking', labelEn: 'League Leaderboard', labelTh: 'ตารางคะแนนลีก', icon: Trophy, badge: 'Top 3', section: 'arena' },
  { id: 'social', labelEn: 'Friends & Squad', labelTh: 'เพื่อนและสังคม', icon: Users, section: 'arena' },
  { id: 'achievements', labelEn: 'Achievements', labelTh: 'เหรียญความสำเร็จ', icon: Award, section: 'arena' },
  { id: 'assessment', labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR', icon: ClipboardCheck, badge: 'A1-C2', section: 'practice' },
  { id: 'mockExam', labelEn: 'Mock Exams', labelTh: 'สอบจำลอง Cambridge', icon: Award, badge: 'KET/PET/FCE', section: 'practice' },
  { id: 'analytics', labelEn: 'Performance', labelTh: 'วิเคราะห์จุดอ่อน', icon: BarChart2, section: 'progress' },
  { id: 'profile', labelEn: 'Profile & Goals', labelTh: 'โปรไฟล์และเป้าหมาย', icon: User, section: 'progress' },
];

interface NavSectionDef {
  id: 'learn' | 'arena' | 'practice' | 'progress';
  labelEn: string;
  labelTh: string;
}

const NAV_SECTIONS: NavSectionDef[] = [
  { id: 'learn', labelEn: 'LEARN', labelTh: 'ทักษะการเรียนรู้' },
  { id: 'arena', labelEn: 'ARENA & SOCIAL', labelTh: 'ประลองและชุมชน' },
  { id: 'practice', labelEn: 'PRACTICE', labelTh: 'ฝึกฝนและวัดผล' },
  { id: 'progress', labelEn: 'PROGRESS', labelTh: 'สถิติและความก้าวหน้า' },
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

      const sectionTitle = language === 'th' ? section.labelTh : section.labelEn;

      return (
        <div key={section.id} className="space-y-1">
          {!collapsedMode ? (
            <div className="px-3 pt-3 pb-1 text-[11px] font-bold tracking-wider uppercase text-muted-foreground/80 select-none">
              {sectionTitle}
            </div>
          ) : (
            <div className="h-px bg-border/40 mx-2 my-2.5" />
          )}

          {sectionItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const itemLabel = t(`nav.${item.id}`);

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
                className={`w-full flex items-center rounded-xl text-sm transition-all group min-h-[44px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]/50 ${
                  collapsedMode
                    ? 'justify-center p-2.5'
                    : 'justify-start px-3.5 py-2.5 gap-3'
                } ${
                  isActive
                    ? 'bg-[#5B5CE2]/12 text-[#5B5CE2] dark:text-indigo-400 font-bold border-l-4 border-l-[#5B5CE2] border-y border-r border-[#5B5CE2]/20 shadow-[0_2px_8px_rgba(91,92,226,0.08)] translate-x-0.5'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[#EDE8DF]/40 dark:hover:bg-muted/50 hover:translate-x-0.5 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#5B5CE2] dark:text-indigo-400' : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                />
                {!collapsedMode && (
                  <span className="truncate text-xs lg:text-sm font-medium flex-1 text-left">
                    {itemLabel}
                  </span>
                )}

                {!collapsedMode && item.badge && (
                  <span className="ml-auto hidden lg:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EDE8DF]/70 dark:bg-muted text-muted-foreground border border-border/40 shrink-0">
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
        className={`hidden md:flex flex-col border-r border-border/40 bg-card/40 shrink-0 select-none py-3 px-2.5 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16 lg:w-[72px]' : 'w-60 lg:w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Top Header & Collapse Toggle */}
        <div className={`flex items-center pb-2 mb-1 border-b border-border/40 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none">
              {t('nav.learning_journey')}
            </span>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
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
        <nav className="flex-1 space-y-3 pt-1">
          {renderNavButtons(isCollapsed)}
        </nav>

        {/* Footer Info Box (Only when expanded) */}
        {!isCollapsed && (
          <div className="pt-3 border-t border-border/40 mt-auto">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40">
              <p className="text-[11px] font-bold text-foreground tracking-tight">Cambridge & CEFR</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                KET (A2) • PET (B1) • FCE (B2) • CAE (C1)
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
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-card border-r border-border p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <GlovaLogo size={28} variant="radiant" ariaLabel="Glova" />
                <span className="font-bold text-base bg-gradient-to-r from-indigo-500 to-amber-500 bg-clip-text text-transparent">
                  Glova
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Sections */}
            <nav className="flex-1 space-y-3">
              {renderNavButtons(false, onCloseMobile)}
            </nav>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-border/40 mt-4">
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/40 text-center">
                <p className="text-[11px] font-bold text-foreground">Cambridge English Alignment</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">CEFR A1–C2 Proficiency</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
