import React from 'react';

export interface GlovaLogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: 'radiant' | 'monochrome' | 'light' | 'dark';
  size?: number;
  className?: string;
  showSpark?: boolean;
  ariaLabel?: string;
}

/**
 * Glova Logo Mark
 * The Radiant Prism: Open continuous growth arc with central clarity spark.
 * Vector implementation strictly derived from docs/design/glova-brand-foundation.md
 */
export const GlovaLogo: React.FC<GlovaLogoProps> = ({
  variant = 'radiant',
  size = 32,
  className = '',
  showSpark = true,
  ariaLabel = 'Glova Logo',
  ...props
}) => {
  const gradientId = React.useId();
  const sparkId = React.useId();

  // Determine stroke styles based on active variant
  const getStroke = () => {
    switch (variant) {
      case 'monochrome':
        return 'currentColor';
      case 'dark':
        return '#F8FAFC';
      case 'light':
        return '#0F172A';
      case 'radiant':
      default:
        return `url(#${gradientId})`;
    }
  };

  const getSparkStroke = () => {
    switch (variant) {
      case 'monochrome':
        return 'currentColor';
      case 'dark':
        return '#FDE68A';
      case 'light':
        return '#D97706';
      case 'radiant':
      default:
        return `url(#${sparkId})`;
    }
  };

  const getSparkCenterFill = () => {
    switch (variant) {
      case 'monochrome':
        return 'currentColor';
      case 'dark':
        return '#FDE68A';
      case 'light':
        return '#D97706';
      case 'radiant':
      default:
        return '#FBBF24';
    }
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={`shrink-0 transition-transform ${className}`}
      {...props}
    >
      <title>{ariaLabel}</title>
      <defs>
        <linearGradient id={gradientId} x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" /> {/* Radiant Indigo */}
          <stop offset="50%" stopColor="#8B5CF6" /> {/* Electric Violet */}
          <stop offset="100%" stopColor="#F59E0B" /> {/* Warm Sun Amber */}
        </linearGradient>
        <linearGradient id={sparkId} x1="20" y1="12" x2="32" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#F43F5E" />
        </linearGradient>
      </defs>

      {/* Continuous Growth Arc (Outer Loop) */}
      <path
        d="M24 6C14.0589 6 6 14.0589 6 24C6 33.9411 14.0589 42 24 42C30.4285 42 36.0887 38.6293 39.2942 33.5682C39.9866 32.4754 39.4215 31.0267 38.1631 30.7121C36.9048 30.3976 35.6322 31.3853 34.9398 32.4781C32.4208 36.4552 27.9715 38.8 24 38.8C15.826 38.8 9.2 32.174 9.2 24C9.2 15.826 15.826 9.2 24 9.2C32.174 9.2 38.8 15.826 38.8 24V26C38.8 27.7673 37.3673 29.2 35.6 29.2C33.8327 29.2 32.4 27.7673 32.4 26V24C32.4 19.361 28.639 15.6 24 15.6C19.361 15.6 15.6 19.361 15.6 24C15.6 28.639 19.361 32.4 24 32.4C26.3195 32.4 28.4144 31.4586 29.9197 29.9372"
        stroke={getStroke()}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* The Radiance Spark (Central Luminescence) */}
      {showSpark && (
        <>
          <path
            d="M24 18.5V21.5M24 26.5V29.5M18.5 24H21.5M26.5 24H29.5"
            stroke={getSparkStroke()}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="24" cy="24" r="1.5" fill={getSparkCenterFill()} />
        </>
      )}
    </svg>
  );
};

export interface GlovaWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

/**
 * Glova Wordmark Typography
 */
export const GlovaWordmark: React.FC<GlovaWordmarkProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const sizeClasses = {
    sm: 'text-lg font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
  }[size];

  return (
    <div className={`flex flex-col leading-none ${className}`}>
      <span className={`${sizeClasses} bg-gradient-to-r from-[#FA5D5D] via-purple-500 to-amber-500 bg-clip-text text-transparent select-none`}>
        Glova
      </span>
      {showSubtitle && (
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/80 font-medium mt-0.5 select-none">
          English Fluency
        </span>
      )}
    </div>
  );
};

export interface GlovaCompactLogoProps {
  size?: number;
  className?: string;
  showSubtitle?: boolean;
}

/**
 * Combined Logo Lockup: Icon + Wordmark
 */
export const GlovaCompactLogo: React.FC<GlovaCompactLogoProps> = ({
  size = 32,
  className = '',
  showSubtitle = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <GlovaLogo size={size} variant="radiant" />
      <GlovaWordmark size="md" showSubtitle={showSubtitle} />
    </div>
  );
};

/**
 * 24x24 / 32x32 Optimized Favicon/App Icon Mark
 */
export const GlovaFavicon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => {
  return <GlovaLogo size={size} variant="radiant" showSpark={false} className={className} />;
};
