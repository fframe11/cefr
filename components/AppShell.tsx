'use client';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Header } from './common/Header';
import { LandingBrandNav } from './landing/LandingBrandNav';
import { Sidebar, NavView } from './common/Sidebar';
import { MobileBottomNav } from './common/MobileBottomNav';
import { ProfileModal } from './common/ProfileModal';
import { GlovaFeedbackBubble } from './ui/GlovaFeedbackBubble';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from './common/Toast';
import { saveUserProgress } from '../services/storageService';
import { UserProgressState } from '../types';
import { CEFRTier } from '@/lib/design-tokens/tokens';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();
  const {
    progress,
    setProgress,
    isDark,
    toggleTheme,
    isProfileModalOpen,
    setIsProfileModalOpen,
  } = useApp();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0) {
      return window.innerWidth < 1024;
    }
    return false;
  });

  const [pendingView, setPendingView] = React.useState<NavView | null>(null);

  React.useEffect(() => {
    setPendingView(null);
  }, [pathname]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Background Prefetching: Pre-cache primary learning studios into browser memory during idle
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(() => {
        const studios = [
          '/dashboard',
          '/vocabulary',
          '/grammar',
          '/reading',
          '/listening',
          '/writing',
          '/speaking',
          '/mock-exams',
          '/assessment',
        ];
        studios.forEach((r) => {
          try {
            router.prefetch(r);
          } catch {}
        });
      });
      return () => window.cancelIdleCallback(handle);
    }
  }, [router]);

  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState<boolean>(false);

  // Map pathname to NavView
  const currentView: NavView = React.useMemo(() => {
    if (!pathname || pathname.startsWith('/dashboard') || pathname.startsWith('/analytics') || pathname.startsWith('/assessment')) return 'dashboard';
    if (pathname.startsWith('/reading')) return 'reading';
    if (pathname.startsWith('/listening')) return 'listening';
    if (pathname.startsWith('/writing')) return 'writing';
    if (pathname.startsWith('/speaking')) return 'speaking';
    if (pathname.startsWith('/vocabulary') || pathname.startsWith('/collocations')) return 'vocabulary';
    if (pathname.startsWith('/grammar') || pathname.startsWith('/cheat-sheets')) return 'grammar';
    if (pathname.startsWith('/mock-exams') || pathname.startsWith('/oopt-practice')) return 'mockExam';
    if (pathname.startsWith('/compete') || pathname.startsWith('/ranking') || pathname.startsWith('/social')) return 'compete';
    return 'dashboard';
  }, [pathname]);

  const { showToast } = useToast();

  const LOCKED_VIEWS: NavView[] = [];

  const getViewRoute = React.useCallback((view: NavView): string => {
    return view === 'dashboard'
      ? '/dashboard'
      : view === 'mockExam'
      ? '/mock-exams'
      : view === 'cheatSheets'
      ? '/cheat-sheets'
      : view === 'collocations'
      ? '/collocations'
      : view === 'ooptPractice'
      ? '/oopt-practice'
      : `/${view}`;
  }, []);

  const handlePrefetchView = React.useCallback(
    (view: NavView) => {
      if (LOCKED_VIEWS.includes(view)) return;
      const targetRoute = getViewRoute(view);
      try {
        router.prefetch(targetRoute);
      } catch {}
    },
    [router, getViewRoute]
  );

  const handleSelectView = (view: NavView) => {
    if (LOCKED_VIEWS.includes(view)) {
      showToast(
        'แท็บนี้ถูกล็อกการเข้าถึง',
        'ยังไม่สามารถใช้งานได้ พบกันเร็วๆนี้',
        'info'
      );
      return;
    }
    const route = getViewRoute(view);
    if (pathname === route) return;

    setPendingView(view);
    router.push(route);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const isLandingRoute = !pathname || pathname === '/' || pathname === '/landing';
  const isAuthRoute = pathname === '/login' || pathname === '/signup';

  if (isAuthRoute) {
    return (
      <div className="min-h-screen bg-game-canvas text-foreground">
        {children}
      </div>
    );
  }

  if (isLandingRoute) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col overflow-x-hidden selection:bg-primary/20 selection:text-primary">
        <LandingBrandNav
          onOpenAuthModal={() => setIsProfileModalOpen(true)}
          onStartAssessment={() => router.push('/dashboard')}
          isAuthenticated={status === 'authenticated'}
          userEmail={user?.email || null}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 w-full min-w-0 max-w-full overflow-x-hidden">
          {children}
        </main>
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentLocalTargetExam={progress.targetExam}
          currentLocalDailyGoal={progress.dailyGoalMinutes}
          onProfileUpdated={({ targetExam, dailyGoalMinutes }) => {
            const updated: UserProgressState = {
              ...progress,
              targetExam,
              dailyGoalMinutes,
            };
            setProgress(updated);
            if (status !== 'authenticated') {
              saveUserProgress(updated);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-slate-900 dark:text-slate-100 flex flex-col overflow-x-clip selection:bg-[#FA5D5D]/25 selection:text-white relative">
      {/* Top Transition Progress Indicator */}
      {pendingView && (
        <div
          role="progressbar"
          aria-label="Navigating"
          className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] bg-[#FA5D5D] shadow-[0_0_12px_#FA5D5D] animate-pulse pointer-events-none"
        />
      )}

      {/* Top Universal Header */}
      <Header
        currentLevel={progress.currentLevel}
        streakDays={progress.streakDays}
        minutesStudiedToday={progress.minutesStudiedToday}
        dailyGoalMinutes={progress.dailyGoalMinutes}
        targetExam={progress.targetExam}
        onRetakeAssessment={() => router.push('/assessment')}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isAuthenticated={status === 'authenticated'}
        userEmail={user?.email || null}
        onOpenMobileNav={() => setIsMobileNavOpen(true)}
      />

      <div className="flex-1 flex w-full min-h-[calc(100vh-4rem)]">
        {/* Desktop / Tablet Sidebar (>= 768px) & Mobile Drawer (< 768px) */}
        <Sidebar
          currentView={currentView}
          pendingView={pendingView}
          onSelectView={handleSelectView}
          onPrefetchView={handlePrefetchView}
          assessmentCompleted={progress.assessmentCompleted}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
        />

        {/* Main Content Area: Fluid width expanding naturally when sidebar is collapsed */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 w-full overflow-x-hidden pb-24 md:pb-8 transition-all duration-300">
          <div className="w-full max-w-[1500px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation (< 768px) */}
      <MobileBottomNav
        currentView={currentView}
        pendingView={pendingView}
        onSelectView={handleSelectView}
        onPrefetchView={handlePrefetchView}
      />

      {/* User Profile & Authentication Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentLocalTargetExam={progress.targetExam}
        currentLocalDailyGoal={progress.dailyGoalMinutes}
        onProfileUpdated={({ targetExam, dailyGoalMinutes }) => {
          const updated: UserProgressState = {
            ...progress,
            targetExam,
            dailyGoalMinutes,
          };
          setProgress(updated);
          if (status !== 'authenticated') {
            saveUserProgress(updated);
          }
        }}
      />

      {/* Persistent Glova Feedback Bubble */}
      <GlovaFeedbackBubble
        currentView={currentView}
        cefrLevel={progress.currentLevel as CEFRTier}
        targetExam={progress.targetExam}
      />
    </div>
  );
};
