'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  BookMarked,
  GraduationCap,
  MoreHorizontal,
  Headphones,
  PenTool,
  Mic,
  BarChart2,
  ClipboardCheck,
  User,
  X,
  Swords,
  Trophy,
  Users,
  Award,
  Lock,
} from 'lucide-react';
import { NavView } from './Sidebar';
import { useTranslation } from '../../i18n';
import { useToast } from './Toast';

const LOCKED_VIEWS: NavView[] = [];

interface MobileBottomNavProps {
  currentView: NavView;
  pendingView?: NavView | null;
  onSelectView: (view: NavView) => void;
  onPrefetchView?: (view: NavView) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  pendingView,
  onSelectView,
  onPrefetchView,
}) => {
  const { language } = useTranslation();
  const isEn = language === 'en';
  const { showToast } = useToast();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primaryItems = [
    { id: 'dashboard' as NavView, icon: LayoutDashboard, labelEn: 'Home', labelTh: 'หน้าหลัก' },
    { id: 'reading' as NavView, icon: BookMarked, labelEn: 'Reading', labelTh: 'การอ่าน' },
    { id: 'writing' as NavView, icon: PenTool, labelEn: 'Writing', labelTh: 'การเขียน' },
    { id: 'speaking' as NavView, icon: Mic, labelEn: 'Speaking', labelTh: 'การพูด' },
    { id: 'compete' as NavView, icon: Swords, labelEn: 'Arena', labelTh: 'ประลอง' },
  ];

  const secondaryItems = [
    { id: 'listening' as NavView, icon: Headphones, labelEn: 'Listening Comprehension', labelTh: 'ทักษะการฟัง' },
    { id: 'vocabulary' as NavView, icon: BookOpen, labelEn: 'Vocabulary & Phrases', labelTh: 'คลังคำศัพท์และกลุ่มคำ' },
    { id: 'grammar' as NavView, icon: Sparkles, labelEn: 'Grammar & Rules', labelTh: 'หลักไวยากรณ์และสูตรลัด' },
    { id: 'mockExam' as NavView, icon: GraduationCap, labelEn: 'Mock Exams (Cambridge & OOPT)', labelTh: 'ศูนย์ข้อสอบจำลอง' },
  ];

  const getItemRoute = (id: NavView): string => {
    return id === 'dashboard'
      ? '/dashboard'
      : id === 'mockExam'
      ? '/mock-exams'
      : id === 'cheatSheets'
      ? '/cheat-sheets'
      : id === 'collocations'
      ? '/collocations'
      : id === 'ooptPractice'
      ? '/oopt-practice'
      : `/${id}`;
  };

  const handleSelect = (view: NavView) => {
    if (LOCKED_VIEWS.includes(view)) {
      showToast(
        isEn ? 'This section is restricted' : 'แท็บนี้ถูกล็อกการเข้าถึง',
        isEn
          ? 'Currently unavailable. Coming soon.'
          : 'ยังไม่สามารถใช้งานได้ พบกันเร็วๆนี้',
        'info'
      );
      return;
    }
    onSelectView(view);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-white/95 dark:bg-[#23212C]/98 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 rounded-t-3xl p-5 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-200 text-slate-900 dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FA5D5D] shadow-[0_0_10px_#FA5D5D]" />
                <span className="font-bold text-sm text-slate-900 dark:text-white font-display">
                  {isEn ? 'All Learning Modules' : 'หมวดวิชาและทักษะทั้งหมด'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {secondaryItems.map((item) => {
                const isPending = pendingView === item.id;
                const isActive = currentView === item.id || isPending;
                const Icon = item.icon;
                const itemRoute = getItemRoute(item.id);

                return (
                  <Link
                    key={item.id}
                    href={itemRoute}
                    prefetch={true}
                    onMouseEnter={() => {
                      if (onPrefetchView) onPrefetchView(item.id);
                    }}
                    onClick={() => {
                      onSelectView(item.id);
                      setDrawerOpen(false);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl text-left transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-[#FA5D5D] text-white font-bold shadow-[0_4px_16px_rgba(250,93,93,0.35)]'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`}
                  >
                    {isPending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#FA5D5D]'}`} />
                    )}
                    <span className="text-xs font-display flex-1">
                      {isEn ? item.labelEn : item.labelTh}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Dock Bottom Bar */}
      <nav
        className="fixed bottom-3 left-3 right-3 z-40 md:hidden bg-white/90 dark:bg-[#181620]/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-2xl p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] pb-safe"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const isPending = pendingView === item.id;
            const Icon = item.icon;
            const isActive = currentView === item.id || isPending;
            const label = isEn ? item.labelEn : item.labelTh;
            const itemRoute = getItemRoute(item.id);

            return (
              <Link
                key={item.id}
                href={itemRoute}
                prefetch={true}
                onMouseEnter={() => {
                  if (onPrefetchView) onPrefetchView(item.id);
                }}
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] transition-all min-w-[54px] active:scale-95 relative cursor-pointer ${
                  isActive
                    ? 'bg-[#FA5D5D] text-white font-bold shadow-[0_2px_12px_rgba(250,93,93,0.35)] ring-1 ring-[#FA5D5D]/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white font-medium'
                }`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : (
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                  )}
                </div>
                <span className="mt-0.5 font-display tracking-tight text-[10px]">{label}</span>
              </Link>
            );
          })}

          {/* More trigger button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all min-w-[54px] active:scale-95 cursor-pointer"
            aria-label={isEn ? 'More' : 'เพิ่มเติม'}
            aria-expanded={drawerOpen}
          >
            <MoreHorizontal className="w-4 h-4 shrink-0" />
            <span className="mt-0.5 font-display tracking-tight text-[10px]">
              {isEn ? 'More' : 'เพิ่มเติม'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
