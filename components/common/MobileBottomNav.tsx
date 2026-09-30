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
  const { t, language } = useTranslation();
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-[#17152B] border-t border-[rgba(184,167,255,0.2)] rounded-t-3xl p-5 pb-safe shadow-2xl animate-in slide-in-from-bottom duration-200 text-[#FFF8F2]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[rgba(184,167,255,0.16)] mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B8A7FF]" />
                <span className="font-bold text-sm text-[#FFF8F2] font-display">
                  {isEn ? 'All Digital Garden Studios' : 'ทุกสตูดิโอในสวนการเรียนรู้'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-full text-[#B8B3C7] hover:text-[#FFF8F2] hover:bg-[#211E38] transition-colors"
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
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all text-left active:scale-[0.98] ${
                      isActive
                        ? 'bg-[#B8A7FF] text-[#17152B] font-bold shadow-xs'
                        : 'text-[#FFF8F2] hover:bg-[#211E38] font-medium'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#17152B]' : 'text-[#B8A7FF]'}`} />
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

      {/* Fixed Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#17152B]/95 backdrop-blur-md border-t border-[rgba(184,167,255,0.16)] pb-safe shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-6 items-center h-16 px-1">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all active:scale-95 ${
                  isActive ? 'text-[#B8A7FF] font-bold' : 'text-[#B8B3C7] hover:text-[#FFF8F2]'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? 'scale-115 text-[#B8A7FF]' : ''}`} />
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-full px-0.5 font-display">
                  {isEn ? item.labelEn : item.labelTh}
                </span>
                {isActive && <span className="w-1 h-1 rounded-full bg-[#B8A7FF] mt-0.5" />}
              </button>
            );
          })}

          {/* More Menu Toggle */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all active:scale-95 ${
              drawerOpen || secondaryItems.some((s) => s.id === currentView)
                ? 'text-[#B8A7FF] font-bold'
                : 'text-[#B8B3C7] hover:text-[#FFF8F2]'
            }`}
            aria-label="More navigation options"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[10px] mt-1 font-display">{isEn ? 'More' : 'เพิ่มเติม'}</span>
          </button>
        </div>
      </nav>
    </>
  );
};
