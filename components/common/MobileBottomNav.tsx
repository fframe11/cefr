'use client';
import React, { useState } from 'react';
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
} from 'lucide-react';
import { NavView } from './Sidebar';
import { useTranslation } from '../../i18n';

interface MobileBottomNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onSelectView }) => {
  const { language } = useTranslation();
  const isEn = language === 'en';
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primaryItems = [
    { id: 'dashboard' as NavView, icon: LayoutDashboard, labelEn: 'Home', labelTh: 'หน้าหลัก' },
    { id: 'vocabulary' as NavView, icon: BookOpen, labelEn: 'Vocab', labelTh: 'คำศัพท์' },
    { id: 'compete' as NavView, icon: Swords, labelEn: 'Arena', labelTh: 'ประลอง' },
    { id: 'mockExam' as NavView, icon: GraduationCap, labelEn: 'Exams', labelTh: 'ข้อสอบ' },
    { id: 'profile' as NavView, icon: User, labelEn: 'Profile', labelTh: 'โปรไฟล์' },
  ];

  const secondaryItems = [
    { id: 'grammar' as NavView, icon: Sparkles, labelEn: 'Grammar Studio', labelTh: 'สตูดิโอไวยากรณ์' },
    { id: 'reading' as NavView, icon: BookMarked, labelEn: 'Reading Lab', labelTh: 'อ่านจับใจความ' },
    { id: 'listening' as NavView, icon: Headphones, labelEn: 'Listening Studio', labelTh: 'สตูดิโอการฟัง' },
    { id: 'writing' as NavView, icon: PenTool, labelEn: 'Writing Workspace', labelTh: 'ฝึกการเขียน' },
    { id: 'speaking' as NavView, icon: Mic, labelEn: 'Speaking Lab', labelTh: 'ฝึกการออกเสียง' },
    { id: 'ranking' as NavView, icon: Trophy, labelEn: 'University League', labelTh: 'ลีกมหาวิทยาลัย' },
    { id: 'social' as NavView, icon: Users, labelEn: 'Study Together', labelTh: 'อ่านหนังสือกับเพื่อน' },
    { id: 'achievements' as NavView, icon: Award, labelEn: 'Trophy Hall', labelTh: 'เหรียญความสำเร็จ' },
    { id: 'assessment' as NavView, icon: ClipboardCheck, labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR' },
    { id: 'analytics' as NavView, icon: BarChart2, labelEn: 'Skill Analytics', labelTh: 'วิเคราะห์ทักษะ' },
  ];

  const handleSelect = (view: NavView) => {
    onSelectView(view);
    setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden animate-in fade-in duration-150"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-[#0B1224] border-t border-slate-800 rounded-t-3xl p-5 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-200 text-[#EDEBE8]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] shadow-[0_0_10px_#FFE600]" />
                <span className="font-bold text-sm text-white font-display">
                  {isEn ? 'All Learning Studios' : 'ทุกสตูดิโอการเรียนรู้'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left active:translate-y-0.5 ${
                      isActive
                        ? 'bg-[#2155E6] text-white font-bold shadow-[0_4px_16px_rgba(33,85,230,0.4)]'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#60A5FA]'}`} />
                    <span className="text-xs font-display flex-1">
                      {isEn ? item.labelEn : item.labelTh}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Gaming Dock Bottom Bar */}
      <nav
        className="fixed bottom-3 left-3 right-3 z-40 md:hidden bg-[#0B1224]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] pb-safe"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const label = isEn ? item.labelEn : item.labelTh;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] transition-all min-w-[54px] active:scale-95 ${
                  isActive
                    ? 'bg-[#2155E6] text-white font-bold shadow-[0_0_16px_rgba(33,85,230,0.45)] ring-1 ring-white/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="mt-0.5 font-display tracking-tight text-[10px]">{label}</span>
              </button>
            );
          })}

          {/* More trigger button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium text-slate-400 hover:text-white transition-all min-w-[54px] active:scale-95"
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
