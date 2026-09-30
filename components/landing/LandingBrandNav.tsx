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
    { id: 'story', labelEn: 'Brand Story', labelTh: 'เกี่ยวกับ Glova' },
    { id: 'studios', labelEn: 'The 8 Studios', labelTh: '8 สตูดิโอทักษะ' },
    { id: 'journey', labelEn: 'Learning Journey', labelTh: 'เส้นทางการเรียนรู้' },
    { id: 'arena', labelEn: 'Ranked Arena', labelTh: 'สมรภูมิประลอง' },
    { id: 'cambridge', labelEn: 'Cambridge Scale', labelTh: 'มาตรฐาน CEFR' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D1117]/95 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] shadow-xs text-[#EDEBE8]'
          : 'bg-[#0D1117]/80 backdrop-blur-xs border-b border-transparent text-[#EDEBE8]'
      }`}
    >
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Entry Point */}
        <Link
          href="/landing"
          onClick={(e) => {
            if (window.location.pathname === '/landing') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="flex items-center gap-2.5 shrink-0 group rounded-xl p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]"
          aria-label="Glova - Product Brand Showcase"
        >
          <div className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
            <GlovaLogo size={36} variant="radiant" ariaLabel="Glova Brand Logo" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#EDEBE8] group-hover:text-[#5B5CE2] dark:group-hover:text-[#A5A6F6] transition-colors font-display">
                Glova
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5B5CE2]/10 dark:bg-[#5B5CE2]/20 text-[#5B5CE2] dark:text-[#A5A6F6] border border-[#5B5CE2]/20">
                Learning Studio
              </span>
            </div>
            <span className="text-[10px] text-[#6E6870] dark:text-[#94A3B8] font-semibold -mt-0.5 hidden md:block">
              {isEn ? 'Your English Grows With You' : 'โลกแห่งการเรียนรู้ภาษาอังกฤษระดับมหาวิทยาลัย'}
            </span>
          </div>
        </Link>

        {/* Desktop Editorial Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6E6870] dark:text-[#94A3B8] hover:text-[#EDEBE8] dark:hover:text-[#EDEBE8] hover:bg-[#141A22]/50 dark:hover:bg-[#222E3A]/50 transition-colors cursor-pointer select-none"
            >
              {isEn ? item.labelEn : item.labelTh}
            </button>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSwitcher />

          <button
            type="button"
            onClick={onToggleTheme}
            className="touch-target p-2 text-[#6E6870] dark:text-[#94A3B8] hover:text-[#EDEBE8] dark:hover:text-[#EDEBE8] hover:bg-[#141A22]/50 dark:hover:bg-[#222E3A]/50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-[#E98278]" /> : <Moon className="w-4 h-4 text-[#5B5CE2]" />}
          </button>

          {/* User Sign In / Dashboard Shortcut */}
          {isAuthenticated ? (
            <TactileButton
              variant="surface"
              size="sm"
              onClick={() => router.push('/')}
              className="hidden sm:inline-flex text-xs font-bold"
              leftIcon={<Compass className="w-3.5 h-3.5 text-[#5B5CE2]" />}
            >
              {isEn ? 'Dashboard' : 'สตูดิโอการเรียน'}
            </TactileButton>
          ) : (
            <TactileButton
              variant="ghost"
              size="sm"
              onClick={() => (onOpenAuthModal ? onOpenAuthModal() : router.push('/'))}
              className="hidden sm:inline-flex text-xs font-bold hover:bg-[#141A22]/50"
              leftIcon={<User className="w-3.5 h-3.5" />}
            >
              {isEn ? 'Sign In' : 'เข้าสู่ระบบ'}
            </TactileButton>
          )}

          {/* Primary Brand CTA */}
          <TactileButton
            variant="primary"
            size="sm"
            onClick={() => {
              if (onStartAssessment) {
                onStartAssessment();
              } else {
                router.push('/assessment');
              }
            }}
            className="text-xs font-bold px-4 py-2 font-display tracking-wide shadow-xs shadow-[#5B5CE2]/25"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            {isEn ? 'English Check' : 'วัดระดับ CEFR'}
          </TactileButton>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden touch-target p-2 text-[#6E6870] dark:text-[#94A3B8] hover:text-[#EDEBE8] dark:hover:text-[#EDEBE8] hover:bg-[#141A22]/50 dark:hover:bg-[#222E3A]/50 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B5CE2]"
            aria-label={mobileMenuOpen ? 'Close brand menu' : 'Open brand menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Off-Canvas / Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[rgba(255,255,255,0.08)] bg-[#141A22] px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200 text-[#EDEBE8]">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-[#EDEBE8] hover:bg-[#141A22]/50 dark:hover:bg-[#222E3A]/50 transition-colors"
              >
                {isEn ? item.labelEn : item.labelTh}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-2.5">
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
