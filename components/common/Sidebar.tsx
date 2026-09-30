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
  { id: 'vocabulary', labelEn: 'Vocabulary Garden', labelTh: 'สวนคำศัพท์ Oxford', icon: BookOpen, badge: '3,860', section: 'learn' },
  { id: 'grammar', labelEn: 'Grammar Grove', labelTh: 'พฤกษาไวยากรณ์', icon: Sparkles, section: 'learn' },
  { id: 'reading', labelEn: 'Reading Meadow', labelTh: 'ทุ่งการอ่านวิชาการ', icon: BookMarked, section: 'learn' },
  { id: 'listening', labelEn: 'Listening Pond', labelTh: 'สระสายธารแห่งเสียง', icon: Headphones, section: 'learn' },
  { id: 'writing', labelEn: 'Writing Sanctuary', labelTh: 'เรือนเขียนเรียงความ', icon: PenTool, section: 'learn' },
  { id: 'speaking', labelEn: 'Speaking Grove', labelTh: 'ลานฝึกสำเนียงและพูด', icon: Mic, section: 'learn' },
  { id: 'compete', labelEn: 'Ranked Arena 4s', labelTh: 'สมรภูมิประลองคำศัพท์', icon: Swords, badge: 'MMR', section: 'arena' },
  { id: 'ranking', labelEn: 'University League', labelTh: 'ตารางคะแนนลีกมหาวิทยาลัย', icon: Trophy, badge: 'Top 3', section: 'arena' },
  { id: 'social', labelEn: 'Study Garden Friends', labelTh: 'ร่วมบ่มเพาะกับเพื่อน', icon: Users, badge: 'Live', section: 'arena' },
  { id: 'achievements', labelEn: 'Trophy & Flower Sanctuary', labelTh: 'สวนบุปผาและเกียรติยศ', icon: Award, section: 'arena' },
  { id: 'assessment', labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR แม่นยำ', icon: ClipboardCheck, badge: 'A1-C2', section: 'practice' },
  { id: 'mockExam', labelEn: 'Cambridge Mock Hall', labelTh: 'สอบจำลองเคมบริดจ์', icon: GraduationCap, badge: 'KET-CPE', section: 'practice' },
  { id: 'analytics', labelEn: 'Skill Analytics', labelTh: 'วิเคราะห์ทักษะและจุดอ่อน', icon: BarChart2, section: 'progress' },
  { id: 'profile', labelEn: 'My Digital Garden', labelTh: 'สวนอังกฤษของฉัน', icon: User, section: 'progress' },
];

interface NavSectionDef {
  id: 'learn' | 'arena' | 'practice' | 'progress';
  labelEn: string;
  labelTh: string;
}

const NAV_SECTIONS: NavSectionDef[] = [
  { id: 'learn', labelEn: 'DIGITAL GARDEN GROVES', labelTh: 'อุทยานการเรียนรู้' },
  { id: 'arena', labelEn: 'ARENA & COMPETITION', labelTh: 'สมรภูมิและเกียรติยศ' },
  { id: 'practice', labelEn: 'MILESTONE & EXAMS', labelTh: 'ศิลาหลักชัยและข้อสอบ' },
  { id: 'progress', labelEn: 'SANCTUARY & PROFILE', labelTh: 'สวนส่วนตัวและสถิติ' },
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
                className={`w-full flex items-center rounded-xl text-sm transition-all group min-h-[42px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A7FF]/50 active:scale-[0.98] ${
                  collapsedMode
                    ? 'justify-center p-2.5'
                    : 'justify-start px-3 py-2 gap-2.5'
                } ${
                  isActive
                    ? 'bg-[#B8A7FF] text-[#17152B] font-black shadow-xs shadow-[#B8A7FF]/30'
                    : 'text-[#B8B3C7] hover:text-[#FFF8F2] hover:bg-[#211E38] font-medium'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-[#17152B]' : 'text-[#B8A7FF]/70 group-hover:text-[#B8A7FF]'
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
                        ? 'bg-[#17152B]/20 text-[#17152B]'
                        : item.badge === 'Live' || item.badge === 'MMR'
                        ? 'bg-[#FF8F82]/20 text-[#FF8F82] border border-[#FF8F82]/30'
                        : 'bg-[#292544] text-[#B8A7FF] border border-[rgba(184,167,255,0.2)]'
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
        className={`hidden md:flex flex-col border-r border-[rgba(184,167,255,0.16)] bg-[#17152B]/95 backdrop-blur-md shrink-0 select-none py-3.5 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-16 lg:w-[72px]' : 'w-60 lg:w-64'
        }`}
        aria-label="Desktop Navigation"
      >
        {/* Top Header & Collapse Toggle */}
        <div className={`flex items-center pb-2.5 mb-1.5 border-b border-[rgba(184,167,255,0.16)] ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8DE0BE] animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8B3C7] font-mono select-none">
                {isEn ? 'Garden Suite' : 'อุทยานการเรียนรู้'}
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-[#B8B3C7] hover:text-[#FFF8F2] hover:bg-[#211E38] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8A7FF]/50 active:scale-95"
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
          <div className="pt-3.5 border-t border-[rgba(184,167,255,0.16)] mt-auto">
            <div className="p-3 rounded-2xl bg-[#211E38] border border-[rgba(184,167,255,0.16)] shadow-xs space-y-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#B8A7FF]" />
                <span className="text-[11px] font-black text-[#FFF8F2] font-display">Cambridge Scale</span>
              </div>
              <p className="text-[10px] text-[#B8B3C7] font-grotesk leading-snug">
                CEFR A1 to C2 Framework &bull; KET, PET, FCE, CAE, CPE
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
            className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-[#17152B] border-r border-[rgba(184,167,255,0.16)] p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200 overflow-y-auto text-[#FFF8F2]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-[rgba(184,167,255,0.16)]">
              <div className="flex items-center gap-2.5">
                <GlovaLogo size={28} variant="radiant" ariaLabel="Glova" />
                <div className="flex flex-col">
                  <span className="font-black text-base text-[#B8A7FF] font-display">
                    Glova
                  </span>
                  <span className="text-[9px] font-mono text-[#B8B3C7] uppercase tracking-wider">
                    Digital Garden
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-[#B8B3C7] hover:text-[#FFF8F2] hover:bg-[#211E38] transition-colors"
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
            <div className="pt-3 border-t border-[rgba(184,167,255,0.16)] mt-4">
              <div className="p-2.5 rounded-xl bg-[#211E38] border border-[rgba(184,167,255,0.16)] text-center">
                <p className="text-[11px] font-bold text-[#FFF8F2] font-display">Cambridge English Alignment</p>
                <p className="text-[10px] text-[#B8B3C7] font-mono mt-0.5">CEFR A1 to C2 Framework</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
