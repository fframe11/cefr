'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Sun, Moon, Sparkles, ArrowRight, User, Compass, Swords, Shield, Trophy } from 'lucide-react';
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
    { id: 'overview', labelEn: 'Overview', labelTh: 'ภาพรวม' },
    { id: 'clash', labelEn: 'Clash Arena', labelTh: 'สนามประลอง' },
    { id: 'studios', labelEn: 'Realms & Studios', labelTh: 'ดินแดนฝึกฝน' },
    { id: 'leaderboard', labelEn: 'Champions', labelTh: 'ทำเนียบแชมป์' },
    { id: 'community', labelEn: 'Guild & Lore', labelTh: 'กิลด์และคอมมูนิตี้' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#050814]/95 backdrop-blur-md border-b border-[#F59E0B]/25 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
          : 'bg-[#050814]/85 backdrop-blur-sm border-b border-[#F59E0B]/15'
      }`}
    >
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Rune Realms Emblem */}
        <Link
          href="/landing"
          onClick={(e) => {
            if (window.location.pathname === '/landing') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-3 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/50 rounded-xl"
          aria-label="Rune Realms - CEFR English Platform"
        >
          {/* Ornate Gold Runic Seal */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#F59E0B] via-[#D97706] to-[#78350F] p-0.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] transition-shadow">
            <div className="w-full h-full rounded-[10px] bg-[#0A0F1D] flex items-center justify-center border border-[#FDE68A]/30">
              <span className="font-rune font-black text-xl text-[#FDE68A] tracking-tighter">ᚱ</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-rune font-black text-xl sm:text-2xl tracking-wider text-white group-hover:text-[#FDE68A] transition-colors">
                RUNE <span className="text-[#F59E0B]">REALMS</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-[#F59E0B]/10 text-[#FDE68A] border border-[#F59E0B]/30">
                CEFR A1-C2
              </span>
            </div>
            <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 font-sans">
              Cambridge English Arena
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links (Norse Runic Capsule) */}
        <nav className="hidden lg:flex items-center gap-1 px-4 py-1.5 rounded-full bg-[#0B1224]/80 border border-[#F59E0B]/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md">
          {navLinks.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer select-none ${
                idx === 0
                  ? 'bg-gradient-to-r from-[#F59E0B]/20 to-[#D97706]/20 text-[#FDE68A] border border-[#F59E0B]/40 shadow-xs'
                  : 'text-slate-300 hover:text-[#FDE68A] hover:bg-white/5'
              }`}
            >
              {isEn ? item.labelEn : item.labelTh}
            </button>
          ))}
        </nav>

        {/* Right Action Controls: Language, Theme, & Metallic Gold Button */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={onToggleTheme}
            className="touch-target p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/40"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#FDE68A]" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* User Sign In / Dashboard Shortcut */}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => router.push('/')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-white/5 border border-white/10 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{isEn ? 'Dashboard' : 'สตูดิโอ'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : router.push('/'))}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>{isEn ? 'Login' : 'เข้าสู่ระบบ'}</span>
            </button>
          )}

          {/* Shakuro Rune Realms Gold Metallic Beveled Button: PLAY NOW / ENTER REALM */}
          <button
            type="button"
            onClick={() => {
              if (onStartAssessment) {
                onStartAssessment();
              } else {
                router.push('/assessment');
              }
            }}
            className="rune-gold-btn hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-rune font-bold text-xs uppercase tracking-widest cursor-pointer select-none shrink-0"
          >
            <Swords className="w-4 h-4 text-white" />
            <span>{isEn ? 'PLAY NOW' : 'เริ่มเล่นฟรี'}</span>
          </button>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]/40 shrink-0"
            aria-label={mobileMenuOpen ? 'Close brand menu' : 'Open brand menu'}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas / Dropdown Menu with Runic Dark Styling */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#F59E0B]/20 bg-[#070B14] px-4 py-5 space-y-4 shadow-[0_10px_30px_rgba(0,0,0,0.9)] animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider text-slate-200 hover:text-[#FDE68A] hover:bg-[#0F172A] transition-colors"
              >
                {isEn ? item.labelEn : item.labelTh}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rune-silver-btn w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#F59E0B]" />
                <span>{isEn ? 'Go to Learning Dashboard' : 'ไปยังหน้าเรียนรู้'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                  else router.push('/');
                }}
                className="rune-silver-btn w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4 text-[#F59E0B]" />
                <span>{isEn ? 'Sign In / Account' : 'เข้าสู่ระบบ / บัญชีผู้ใช้'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onStartAssessment) onStartAssessment();
                else router.push('/assessment');
              }}
              className="rune-gold-btn w-full py-3 rounded-lg font-rune font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Swords className="w-4 h-4 text-white" />
              <span>{isEn ? 'START CEFR EXPEDITION' : 'เริ่มทดสอบ CEFR 3 นาที'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
