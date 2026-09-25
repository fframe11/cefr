import React from 'react';
import { Languages } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'th' ? 'en' : 'th');
  };

  if (variant === 'full') {
    return (
      <div
        className={`inline-flex items-center rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs font-medium ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('th')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            language === 'th'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-pressed={language === 'th'}
        >
          <span>ไทย</span>
        </button>
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
            language === 'en'
              ? 'bg-background text-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
          aria-pressed={language === 'en'}
        >
          <span>EN</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`touch-target flex items-center gap-1.5 px-2 py-1.5 rounded-md border border-border/60 bg-muted/40 hover:bg-muted/70 text-xs font-medium text-foreground transition-colors ${className}`}
      title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
      aria-label="Switch language"
    >
      <Languages className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="font-semibold uppercase tracking-wider text-[11px]">
        {language === 'th' ? 'TH' : 'EN'}
      </span>
    </button>
  );
};
