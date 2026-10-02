'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  ArrowRight,
  User,
  Compass,
  BookOpen,
  Award,
  GraduationCap,
  Trophy,
} from 'lucide-react';
import { GlovaLogo } from '../ui/GlovaLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { useTranslation } from '../../i18n';

interface LandingBrandNavProps {
  onOpenAuthModal?: () => void;
  onStartAssessment?: () => void;
  isAuthenticated?: boolean;
  userEmail?: string | null;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const LandingBrandNav: React.FC<LandingBrandNavProps> = ({
  onOpenAuthModal,
  onStartAssessment,
  isAuthenticated = false,
  userEmail,
  isDark,
  onToggleTheme,
}) => {
  const router = useRouter();
  const { t, language } = useTranslation();
  const isEn = language === 'en';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { id: 'studios', labelEn: '8 Learning Studios', labelTh: '8 สตูดิโอการเรียนรู้' },
    { id: 'framework', labelEn: 'CEFR Standards', labelTh: 'มาตรฐาน CEFR' },
    { id: 'exams', labelEn: 'Cambridge Vault', labelTh: 'คลังข้อสอบเคมบริดจ์' },
    { id: 'achievements', labelEn: 'Top Learners', labelTh: 'ทำเนียบผู้เรียน' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF8F3]/95 dark:bg-[#141A22]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 shadow-xs'
          : 'bg-[#FAF8F3]/85 dark:bg-[#141A22]/85 backdrop-blur-sm border-b border-slate-200/50 dark:border-white/5'
      }`}
    >
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Glova Radiant Emblem */}
        <Link
          href="/landing"
          onClick={(e) => {
            if (window.location.pathname === '/landing') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-xl"
          aria-label="Glova - CEFR English Proficiency Platform"
        >
          <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <GlovaLogo size={38} variant="radiant" ariaLabel="Glova Brand Logo" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-display">
                Glova<span className="text-[#FA5D5D]">.</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                CEFR A1-C2
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Cambridge English Preparation
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Clean EduMaster Capsule Navigation) */}
        <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-2xs backdrop-blur-md">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isEn ? item.labelEn : item.labelTh}
            </button>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-full border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Sign In / Profile Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-500/30 hover:bg-indigo-500/20 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[100px] truncate">{userEmail?.split('@')[0] || (isEn ? 'Account' : 'บัญชีผู้ใช้')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : router.push('/login'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-white transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isEn ? 'Sign In' : 'เข้าสู่ระบบ'}</span>
            </button>
          )}

          {/* EduMaster Primary CTA Button: START ASSESSMENT */}
          <button
            type="button"
            onClick={() => {
              if (onStartAssessment) {
                onStartAssessment();
              } else {
                router.push('/assessment');
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 dark:bg-[#5B5CE2] hover:bg-indigo-700 dark:hover:bg-[#4E4FD6] text-white text-xs font-bold shadow-[0_2px_0_#3730A3] dark:shadow-[0_2px_0_#3839A0] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'START ASSESSMENT' : 'วัดระดับ CEFR ฟรี'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-white/10 bg-[#FAF8F3] dark:bg-[#141A22] px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                {isEn ? item.labelEn : item.labelTh}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 space-y-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                  else router.push('/login');
                }}
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                {isEn ? 'Sign In' : 'เข้าสู่ระบบ'}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onStartAssessment) onStartAssessment();
                else router.push('/assessment');
              }}
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white bg-indigo-600 dark:bg-[#5B5CE2] shadow-xs"
            >
              {isEn ? 'START FREE ASSESSMENT' : 'วัดระดับ CEFR ฟรี'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
