'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon, Sparkles, ArrowRight, User, Compass } from 'lucide-react';
import { GlovaLogo } from '../ui/GlovaLogo';
import { TactileButton } from '../ui/GlovaPrimitives';
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
    { id: 'story', labelEn: 'About us', labelTh: 'เกี่ยวกับเรา' },
    { id: 'why-glova', labelEn: 'Why Glova', labelTh: 'ทำไมต้อง Glova' },
    { id: 'studios', labelEn: '8 Studios', labelTh: 'คลัง 8 สตูดิโอ' },
    { id: 'leaderboard', labelEn: 'Best Players', labelTh: 'ทำเนียบอันดับ' },
    { id: 'contact', labelEn: 'Contact', labelTh: 'ติดต่อสอบถาม' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#1845C2]/95 dark:bg-[#12369E]/95 backdrop-blur-md border-b border-white/10 shadow-lg text-white'
          : 'bg-[#2155E6] dark:bg-[#1A48C8] text-white border-b border-white/10'
      }`}
    >
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Entry Point (Dribbble STPlay / Glova Style) */}
        <Link
          href="/landing"
          onClick={(e) => {
            if (window.location.pathname === '/landing') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2.5 shrink-0 group rounded-xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          aria-label="Glova STPlay - Product Brand Showcase"
        >
          <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <GlovaLogo size={36} variant="radiant" ariaLabel="Glova Brand Logo" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-white group-hover:text-[#FFC533] transition-colors font-display">
                Glova<span className="text-[#FFC533]">Play</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20">
                CEFR Stream
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Pill Navigation Links (Dribbble Capsule Style) */}
        <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
          {navLinks.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                idx === 0
                  ? 'bg-white text-[#1845C2] shadow-sm'
                  : 'text-white/90 hover:text-white hover:bg-white/15'
              }`}
            >
              {idx === 0 ? '◉ ' : '• '}
              {isEn ? item.labelEn : item.labelTh}
            </button>
          ))}
        </nav>

        {/* Right Action Controls (Dribbble Style Login + Sunburst Yellow Sign Up Button) */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={onToggleTheme}
            className="touch-target p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FFC533]" /> : <Moon className="w-4 h-4 text-white" />}
          </button>

          {/* User Sign In / Dashboard Shortcut */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white hover:bg-white/15 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#FFC533]" />
              <span>{isEn ? 'Dashboard' : 'สตูดิโอ'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : router.push('/'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/90 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>{isEn ? 'Login' : 'เข้าสู่ระบบ'}</span>
            </button>
          )}

          {/* Sunburst Yellow Sign Up > CTA Button (Matching Dribbble Shot) */}
          <button
            type="button"
            onClick={() => {
              if (onStartAssessment) {
                onStartAssessment();
              } else {
                router.push('/assessment');
              }
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#FFC533] hover:bg-[#FFB814] text-[#1E293B] font-extrabold text-xs tracking-wide shadow-md shadow-[#FFC533]/25 active:translate-y-0.5 transition-all cursor-pointer select-none shrink-0"
          >
            <span>{isEn ? 'Sign Up' : 'วัดระดับฟรี'}</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/15 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 shrink-0"
            aria-label={mobileMenuOpen ? 'Close brand menu' : 'Open brand menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-[rgba(255,255,255,0.08)] bg-white dark:bg-[#141A22] px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200 text-slate-900 dark:text-[#EDEBE8]">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-[#EDEBE8] hover:bg-slate-100 dark:hover:bg-[#222E3A]/50 transition-colors"
              >
                {isEn ? item.labelEn : item.labelTh}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-[rgba(255,255,255,0.08)] flex flex-col gap-2.5">
            {isAuthenticated ? (
              <TactileButton
                variant="surface"
                size="md"
                fullWidth
                onClick={() => router.push('/')}
                leftIcon={<Compass className="w-4 h-4 text-[#5B5CE2]" />}
              >
                {isEn ? 'Go to Learning Dashboard' : 'ไปยังหน้าเรียนรู้'}
              </TactileButton>
            ) : (
              <TactileButton
                variant="surface"
                size="md"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                  else router.push('/');
                }}
                leftIcon={<User className="w-4 h-4" />}
              >
                {isEn ? 'Sign In / Account' : 'เข้าสู่ระบบ / บัญชีผู้ใช้'}
              </TactileButton>
            )}

            <TactileButton
              variant="primary"
              size="md"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                if (onStartAssessment) onStartAssessment();
                else router.push('/assessment');
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isEn ? 'Start 3-Minute English Check' : 'เริ่มแบบวัดระดับ 3 นาที'}
            </TactileButton>
          </div>
        </div>
      )}
    </header>
  );
};
