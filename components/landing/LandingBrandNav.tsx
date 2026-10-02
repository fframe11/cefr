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
  MessageSquare,
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
    { id: 'conversations', labelEn: 'Conversations', labelTh: 'บทสนทนาจำลอง' },
    { id: 'studios', labelEn: '8 Learning Studios', labelTh: '8 สตูดิโอการเรียนรู้' },
    { id: 'framework', labelEn: 'CEFR Journey', labelTh: 'เส้นทาง CEFR' },
    { id: 'exams', labelEn: 'Cambridge Vault', labelTh: 'คลังข้อสอบเคมบริดจ์' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#FAF8F3]/95 dark:bg-[#14121B]/95 backdrop-blur-md border-b border-border/80 shadow-xs'
          : 'bg-[#FAF8F3]/85 dark:bg-[#14121B]/85 backdrop-blur-sm border-b border-border/50'
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
          className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FA5D5D]/50 rounded-xl"
          aria-label="Glova - CEFR English Proficiency Platform"
        >
          <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <GlovaLogo size={38} variant="radiant" ariaLabel="Glova Brand Logo" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-[#FA5D5D] transition-colors font-display">
                Glova<span className="text-[#FA5D5D]">.</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#FA5D5D]/10 text-[#FA5D5D] border border-[#FA5D5D]/20">
                CEFR A1-C2
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-500 dark:text-slate-400 font-sans">
              Language Learning Platform
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Mondly Soft Capsule Navigation) */}
        <nav className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-border/80 shadow-2xs backdrop-blur-md">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#FA5D5D] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
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
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-full border border-border/80 transition-colors cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Sign In / Profile Button */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FA5D5D]/10 dark:bg-[#FA5D5D]/20 text-[#FA5D5D] text-xs font-bold border border-[#FA5D5D]/30 hover:bg-[#FA5D5D]/20 transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[100px] truncate">{userEmail?.split('@')[0] || (isEn ? 'Account' : 'บัญชีผู้ใช้')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : router.push('/login'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#FA5D5D] dark:hover:text-white transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#FA5D5D]" />
              <span>{isEn ? 'Sign In' : 'เข้าสู่ระบบ'}</span>
            </button>
          )}

          {/* Outcrowd Mondly Coral Primary CTA Button */}
          <button
            type="button"
            onClick={() => {
              if (onStartAssessment) {
                onStartAssessment();
              } else {
                router.push('/assessment');
              }
            }}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FA5D5D] hover:bg-[#E84C4C] text-white text-xs font-bold shadow-md shadow-[#FA5D5D]/25 active:scale-[0.98] transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEn ? 'START FREE' : 'เริ่มเรียนฟรี'}</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/10 rounded-xl border border-border transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/80 bg-[#FAF8F3] dark:bg-[#14121B] px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
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

          <div className="pt-2 border-t border-border/80 space-y-2">
            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                  else router.push('/login');
                }}
                className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-white/5 border border-border"
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
              className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-white bg-[#FA5D5D] hover:bg-[#E84C4C] shadow-md shadow-[#FA5D5D]/25"
            >
              {isEn ? 'START FREE ASSESSMENT' : 'เริ่มประเมินฟรี'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
