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
  badgeStyle?: 'gold' | 'mint' | 'coral' | 'indigo';
  section: 'learn' | 'arena' | 'practice' | 'progress';
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelEn: 'Dashboard', labelTh: 'หน้าหลักการเรียน', icon: LayoutDashboard, section: 'learn' },
  { id: 'vocabulary', labelEn: 'Vocabulary Studio', labelTh: 'คลังคำศัพท์ Oxford & Scale', icon: BookOpen, badge: '3.8k + 121k', badgeStyle: 'gold', section: 'learn' },
  { id: 'grammar', labelEn: 'Grammar Studio', labelTh: 'ไวยากรณ์โครงสร้าง', icon: Sparkles, section: 'learn' },
  { id: 'reading', labelEn: 'Reading Studio', labelTh: 'การอ่านเชิงวิชาการ', icon: BookMarked, section: 'learn' },
  { id: 'listening', labelEn: 'Listening Studio', labelTh: 'การฟังสำเนียงจริง', icon: Headphones, section: 'learn' },
  { id: 'writing', labelEn: 'Writing Studio', labelTh: 'การเขียนและเรียบเรียง', icon: PenTool, section: 'learn' },
  { id: 'speaking', labelEn: 'Speaking Studio', labelTh: 'การพูดและออกเสียง', icon: Mic, section: 'learn' },
  { id: 'compete', labelEn: 'Ranked Arena 4s', labelTh: 'สมรภูมิประลองคำศัพท์', icon: Swords, badge: 'MMR', badgeStyle: 'coral', section: 'arena' },
  { id: 'ranking', labelEn: 'University League', labelTh: 'ตารางคะแนนลีกมหาวิทยาลัย', icon: Trophy, badge: 'Top 3', badgeStyle: 'gold', section: 'arena' },
  { id: 'social', labelEn: 'Study Circles', labelTh: 'กลุ่มเพื่อนร่วมเรียน', icon: Users, badge: 'Live', badgeStyle: 'mint', section: 'arena' },
  { id: 'achievements', labelEn: 'Achievements & Trophies', labelTh: 'เกียรติยศและเหรียญรางวัล', icon: Award, section: 'arena' },
  { id: 'assessment', labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR แม่นยำ', icon: ClipboardCheck, badge: 'A1-C2', badgeStyle: 'indigo', section: 'practice' },
  { id: 'mockExam', labelEn: 'Cambridge Mock Exams', labelTh: 'สอบจำลองเคมบริดจ์', icon: GraduationCap, badge: 'KET-CPE', badgeStyle: 'gold', section: 'practice' },
  { id: 'analytics', labelEn: 'Skill Analytics', labelTh: 'วิเคราะห์ทักษะและจุดอ่อน', icon: BarChart2, section: 'progress' },
  { id: 'profile', labelEn: 'User Profile', labelTh: 'โปรไฟล์ของฉัน', icon: User, section: 'progress' },
];

interface NavSectionDef {
  id: 'learn' | 'arena' | 'practice' | 'progress';
  labelEn: string;
  labelTh: string;
}

const NAV_SECTIONS: NavSectionDef[] = [
  { id: 'learn', labelEn: 'LEARNING STUDIOS', labelTh: 'สตูดิโอการเรียนรู้' },
  { id: 'arena', labelEn: 'RANKED & COMMUNITY', labelTh: 'แรงก์และคอมมูนิตี้' },
  { id: 'practice', labelEn: 'EXAMS & CERTIFICATION', labelTh: 'สอบและวัดระดับ' },
  { id: 'progress', labelEn: 'PROGRESS & PROFILE', labelTh: 'โปรไฟล์และความก้าวหน้า' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { language } = useTranslation();
  const isEn = language === 'en';

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
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase select-none">
                {sectionTitle}
              </span>
            </div>
          )}

          {sectionItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            const itemLabel = isEn ? item.labelEn : item.labelTh;

            let badgeClasses = 'bg-[#5B5CE2]/15 text-[#5B5CE2] border border-[#5B5CE2]/30';
            if (item.badgeStyle === 'gold') {
              badgeClasses = 'bg-amber-500/15 text-[#E5A93C] border border-amber-500/30';
            } else if (item.badgeStyle === 'coral') {
              badgeClasses = 'bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30';
            } else if (item.badgeStyle === 'mint') {
              badgeClasses = 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30';
            }

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
                className={`w-full flex items-center rounded-xl text-xs transition-all group min-h-[40px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] active:translate-y-0.5 ${
                  collapsedMode
                    ? 'justify-center p-2.5'
                    : 'justify-start px-3 py-2 gap-2.5'
                } ${
                  isActive
                    ? 'bg-[#5B5CE2] text-white font-bold shadow-[0_2px_0_#3839A0]'
                    : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#EDEBE8] hover:bg-slate-100 dark:hover:bg-[#1C2430] font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-[#EDEBE8]'
                  }`}
                />
                {!collapsedMode && (
                  <span className={`truncate text-xs font-display flex-1 text-left ${isActive ? 'text-white' : 'text-slate-700 dark:text-[#EDEBE8]'}`}>
                    {itemLabel}
                  </span>
                )}

                {!collapsedMode && item.badge && (
                  <span
                    className={`ml-auto inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : badgeClasses
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
        className={`hidden md:flex flex-col border-r border-slate-200/90 dark:border-white/10 bg-white dark:bg-[#141A22] shrink-0 select-none py-3.5 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out shadow-xs dark:shadow-[2px_0_12px_rgba(0,0,0,0.4)] ${
          isCollapsed ? 'w-16 lg:w-[72px]' : 'w-60 lg:w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Top Header & Collapse Toggle */}
        <div className={`flex items-center pb-2.5 mb-1.5 border-b border-slate-200/90 dark:border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] font-mono select-none">
                {isEn ? 'Studio Suite' : 'สตูดิโอการเรียนรู้'}
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:text-[#EDEBE8] dark:hover:bg-[#1C2430] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2] active:scale-95"
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
          <div className="pt-3.5 border-t border-slate-200/90 dark:border-white/10 mt-auto">
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-[#1C2430] border border-indigo-200/80 dark:border-white/10 shadow-xs dark:shadow-inner space-y-1">
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF4655]" />
                  <span className="text-[11px] font-black text-slate-900 dark:text-[#EDEBE8] font-display">
                    Tri-Hybrid Engine
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-[#FF4655] text-white">
                  5 SITES
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-[#94A3B8] font-mono leading-snug">
                Terraria Biome &bull; Valorant HUD &bull; Duolingo 3D
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* 2. Mobile Off-Canvas Drawer (< 768px) */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#141A22] border-r border-slate-200 dark:border-white/10 p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto text-slate-900 dark:text-[#EDEBE8]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <GlovaLogo size={28} variant="radiant" ariaLabel="Glova" />
                <div className="flex flex-col">
                  <span className="font-black text-base text-slate-900 dark:text-[#EDEBE8] font-display">
                    Glova
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-mono">
                    Cambridge Learning Suite
                  </span>
                </div>
              </div>
              {onCloseMobile && (
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-[#94A3B8] dark:hover:text-[#EDEBE8] dark:hover:bg-[#1C2430] transition-colors"
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
            <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] mt-auto text-center">
              <span className="text-[10px] text-[#94A3B8] font-mono">
                Glova &bull; CEFR English Platform
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
