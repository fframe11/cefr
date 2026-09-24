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
  X,
} from 'lucide-react';
import { NavView } from './Sidebar';

interface MobileBottomNavProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onSelectView }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const primaryItems = [
    { id: 'dashboard' as NavView, label: 'หน้าหลัก', icon: LayoutDashboard },
    { id: 'vocabulary' as NavView, label: 'คำศัพท์', icon: BookOpen },
    { id: 'grammar' as NavView, label: 'ไวยากรณ์', icon: Sparkles },
    { id: 'reading' as NavView, label: 'การอ่าน', icon: BookMarked },
    { id: 'mockExam' as NavView, label: 'สอบจำลอง', icon: GraduationCap },
  ];

  const secondaryItems = [
    { id: 'assessment' as NavView, labelEn: 'Diagnostic Test', labelTh: 'วัดระดับ CEFR', icon: ClipboardCheck },
    { id: 'listening' as NavView, labelEn: 'Listening Skills', labelTh: 'ทักษะการฟัง', icon: Headphones },
    { id: 'writing' as NavView, labelEn: 'Writing Practice', labelTh: 'ทักษะการเขียน', icon: PenTool },
    { id: 'speaking' as NavView, labelEn: 'Speaking & Pronunciation', labelTh: 'การพูดและออกเสียง', icon: Mic },
    { id: 'analytics' as NavView, labelEn: 'Weakness Analysis', labelTh: 'วิเคราะห์จุดอ่อน', icon: BarChart2 },
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto bg-card border-t border-border rounded-t-2xl p-4 pb-safe animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <span className="font-semibold text-sm text-foreground">เมนูการเรียนรู้เพิ่มเติม</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground touch-target"
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
                    onClick={() => handleSelect(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all touch-target text-left ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                        : 'text-foreground hover:bg-muted/60'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-sm font-medium">{item.labelTh}</span>
                      <span className="block text-xs text-muted-foreground">{item.labelEn}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-md border-t border-border/50 pb-safe shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-6 items-center h-15 px-1">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 transition-all duration-150 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full px-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-all ${
              drawerOpen || secondaryItems.some((s) => s.id === currentView)
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            aria-label="More navigation options"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">เพิ่มเติม</span>
          </button>
        </div>
      </nav>
    </>
  );
};
