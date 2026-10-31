'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
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
  Lock,
} from 'lucide-react';
import { GlovaLogo } from '../ui/GlovaLogo';
import { useToast } from './Toast';

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
  | 'mock-exam'
  | 'cheatSheets'
  | 'collocations'
  | 'ooptPractice'
  | 'analytics'
  | 'profile'
  | 'compete'
  | 'ranking'
  | 'social'
  | 'achievements';

export interface SidebarProps {
  currentView: NavView;
  pendingView?: NavView | null;
  onSelectView: (view: NavView) => void;
  onPrefetchView?: (view: NavView) => void;
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
  badgeStyle?: 'gold' | 'mint' | 'coral' | 'indigo';
  section: 'learn' | 'arena' | 'practice' | 'progress';
  isLocked?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelEn: 'Overview', labelTh: 'หน้าหลักและสมรรถนะ', icon: LayoutDashboard, section: 'learn' },
  { id: 'reading', labelEn: 'Reading Comprehension', labelTh: 'ทักษะการอ่าน', icon: BookMarked, section: 'learn' },
  { id: 'listening', labelEn: 'Listening Comprehension', labelTh: 'ทักษะการฟัง', icon: Headphones, section: 'learn' },
  { id: 'writing', labelEn: 'Writing Skills (AES)', labelTh: 'ทักษะการเขียน (AES)', icon: PenTool, section: 'learn' },
  { id: 'speaking', labelEn: 'Speaking Lab', labelTh: 'ทักษะการพูด (Lab)', icon: Mic, section: 'learn' },
  { id: 'vocabulary', labelEn: 'Vocabulary & Phrases', labelTh: 'คลังคำศัพท์และกลุ่มคำ', icon: BookOpen, section: 'learn' },
  { id: 'grammar', labelEn: 'Grammar & Rules', labelTh: 'หลักไวยากรณ์และสูตรลัด', icon: Sparkles, section: 'learn' },
  { id: 'mockExam', labelEn: 'Mock Exams (Cambridge & OOPT)', labelTh: 'ศูนย์ข้อสอบจำลอง', icon: GraduationCap, badge: 'KET-CPE', badgeStyle: 'gold', section: 'practice' },
  { id: 'compete', labelEn: 'Arena & Rankings', labelTh: 'สังเวียนประลองและอันดับ', icon: Swords, badge: 'MMR', badgeStyle: 'coral', section: 'practice' },
];

interface NavSectionDef {
  id: 'learn' | 'arena' | 'practice' | 'progress';
  labelEn: string;
  labelTh: string;
}

const NAV_SECTIONS: NavSectionDef[] = [
  { id: 'learn', labelEn: 'LANGUAGE SKILLS', labelTh: 'ทักษะภาษาอังกฤษ' },
  { id: 'practice', labelEn: 'TESTING & ARENA', labelTh: 'การทดสอบและการประลอง' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  pendingView,
  onSelectView,
  onPrefetchView,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { language } = useTranslation();
  const isEn = language === 'en';
  const { showToast } = useToast();

  useEffect(() => {
    if (isMobileOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isMobileOpen]);

  const renderNavButtons = (collapsedMode: boolean, onItemClick?: () => void) => {
    return NAV_SECTIONS.map((section) => {
      const sectionItems = NAV_ITEMS.filter((item) => item.section === section.id);
      if (sectionItems.length === 0) return null;

      const sectionTitle = isEn ? section.labelEn : section.labelTh;

      return (
        <div key={section.id} className="space-y-1 py-1.5">
          {!collapsedMode && (
            <div className="px-3 pb-1 pt-1.5 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-500 dark:text-[#94A3B8] uppercase select-none">
                {sectionTitle}
              </span>
            </div>
          )}

          {sectionItems.map((item) => {
            const isPending = pendingView === item.id;
            const isActive = currentView === item.id || isPending;
            const Icon = item.icon;
            const itemLabel = isEn ? item.labelEn : item.labelTh;
            const isLocked = Boolean(item.isLocked);

            let badgeClasses = 'bg-amber-500/15 text-amber-700 dark:bg-[#F59E0B]/15 dark:text-[#FDE68A] border border-amber-500/30 dark:border-[#F59E0B]/30';
            if (item.badgeStyle === 'gold') {
              badgeClasses = 'bg-[#FA5D5D] text-white dark:bg-[#FA5D5D] dark:text-white font-black shadow-xs';
            } else if (item.badgeStyle === 'coral') {
              badgeClasses = 'bg-[#FA5D5D]/15 text-[#FA5D5D] dark:bg-[#FA5D5D]/20 dark:text-[#FF7A7A] border border-[#FA5D5D]/30 dark:border-[#FA5D5D]/40';
            } else if (item.badgeStyle === 'mint') {
              badgeClasses = 'bg-emerald-500/15 text-emerald-700 dark:bg-[#10B981]/20 dark:text-[#10B981] border border-emerald-500/30 dark:border-[#10B981]/40';
            }

            const itemRoute =
              item.id === 'dashboard'
                ? '/dashboard'
                : item.id === 'mockExam'
                ? '/mock-exams'
                : item.id === 'cheatSheets'
                ? '/cheat-sheets'
                : item.id === 'collocations'
                ? '/collocations'
                : item.id === 'ooptPractice'
                ? '/oopt-practice'
                : `/${item.id}`;

            const sharedClass = `w-full flex items-center rounded-xl text-xs transition-all group min-h-[36px] xl:min-h-[40px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA5D5D] active:translate-y-0.5 relative cursor-pointer ${
              collapsedMode
                ? 'justify-center p-2'
                : 'justify-start px-2.5 py-1.5 xl:py-2 gap-2 xl:gap-2.5'
            } ${
              isLocked ? 'opacity-75 hover:opacity-95' : ''
            } ${
              isActive
                ? 'bg-[#FA5D5D]/10 dark:bg-[#FA5D5D]/15 border-l-2 border-[#FA5D5D] text-[#FA5D5D] dark:text-[#FF7A7A] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 font-semibold'
            }`;

            const innerContent = (
              <>
                <div className="relative shrink-0">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-[#FA5D5D] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-[#FA5D5D] dark:text-[#FF7A7A]' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    />
                  )}
                  {collapsedMode && isLocked && (
                    <Lock className="w-2.5 h-2.5 text-slate-500 dark:text-slate-400 absolute -top-1 -right-1" />
                  )}
                </div>
                {!collapsedMode && (
                  <span className={`truncate text-xs font-display flex-1 text-left ${isActive ? 'text-[#FA5D5D] dark:text-[#FF7A7A]' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white'}`}>
                    {itemLabel}
                  </span>
                )}

                {!collapsedMode && isLocked && (
                  <span
                    className="ml-auto inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                  >
                    <Lock className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                    <span>{isEn ? 'Locked' : 'ล็อก'}</span>
                  </span>
                )}

                {!collapsedMode && !isLocked && item.badge && !isPending && (
                  <span
                    className={`ml-auto inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      isActive ? 'bg-[#FA5D5D] text-white dark:bg-[#FA5D5D] dark:text-white font-black shadow-xs' : badgeClasses
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            );

            if (isLocked) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    showToast(
                      isEn ? 'This studio is locked' : 'แท็บนี้ถูกล็อกการเข้าถึง',
                      isEn
                        ? 'Currently unavailable. Coming soon.'
                        : 'ยังไม่สามารถใช้งานได้ พบกันเร็วๆนี้',
                      'info'
                    );
                  }}
                  title={collapsedMode ? `${itemLabel} (${isEn ? 'Locked' : 'ล็อก'})` : undefined}
                  aria-label={itemLabel}
                  aria-current={isActive ? 'page' : undefined}
                  className={sharedClass}
                >
                  {innerContent}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={itemRoute}
                prefetch={true}
                onMouseEnter={() => {
                  if (onPrefetchView) {
                    onPrefetchView(item.id);
                  }
                }}
                onClick={() => {
                  onSelectView(item.id);
                  if (onItemClick) onItemClick();
                }}
                title={collapsedMode ? itemLabel : undefined}
                aria-label={itemLabel}
                aria-current={isActive ? 'page' : undefined}
                className={sharedClass}
              >
                {innerContent}
              </Link>
            );
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* 1. Desktop / Tablet Collapsible Sidebar Spacer to preserve flex flow for <main> */}
      <div
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out pointer-events-none ${
          isCollapsed ? 'w-14 lg:w-16' : 'w-56 lg:w-60 xl:w-64'
        }`}
        aria-hidden="true"
      />

      {/* 1. Desktop / Tablet Collapsible Sidebar (>= 768px) - Fixed to bottom edge */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-[#181620]/95 backdrop-blur-2xl shrink-0 select-none py-2.5 xl:py-3.5 px-2.5 xl:px-3 fixed top-14 xl:top-16 bottom-0 left-0 z-30 overflow-y-auto transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.6)] ${
          isCollapsed ? 'w-14 lg:w-16' : 'w-56 lg:w-60 xl:w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Top Header & Collapse Toggle */}
        <div className={`flex items-center pb-2.5 mb-1.5 border-b border-slate-200/80 dark:border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FA5D5D] shadow-[0_0_8px_#FA5D5D]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono select-none">
                {isEn ? 'English Curriculum' : 'หลักสูตรภาษาอังกฤษ'}
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA5D5D] active:scale-95 cursor-pointer"
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
        <nav className="flex-1 space-y-1.5 pt-0.5">
          {renderNavButtons(isCollapsed)}
        </nav>

        {/* Footer Info Box (Only when expanded) */}
        {!isCollapsed && (
          <div className="pt-3.5 border-t border-slate-200/70 dark:border-white/10 mt-auto">
            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#23212C]/80 backdrop-blur-md border border-slate-200/70 dark:border-white/10 shadow-xs space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FA5D5D]" />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    CEFR & Cambridge
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FA5D5D] text-white">
                  VERIFIED
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono leading-snug">
                Oxford Lexicon &bull; 6 Core Skills
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (< 768px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white/95 dark:bg-[#181620]/98 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/10 p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <GlovaLogo size={28} variant="radiant" ariaLabel="Glova" />
                <div className="flex flex-col">
                  <span className="font-black text-base text-slate-900 dark:text-white font-display">
                    Glova
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Cambridge Learning Suite
                  </span>
                </div>
              </div>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close mobile menu"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Mobile Navigation List */}
            <nav className="flex-1 space-y-1">
              {renderNavButtons(false, onCloseMobile)}
            </nav>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 mt-auto text-center">
              <span className="text-[10px] text-slate-400 font-mono">
                Glova &bull; CEFR English Platform
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
