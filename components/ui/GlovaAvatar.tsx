import React from 'react';

export interface GlovaAvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'active' | 'learning' | 'offline';
  className?: string;
}

export const GlovaAvatar: React.FC<GlovaAvatarProps> = ({
  name,
  src,
  size = 'md',
  status,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }[size];

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'GL';
  };

  const statusColor = {
    active: 'bg-emerald-500',
    learning: 'bg-amber-500',
    offline: 'bg-slate-400',
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <div
        className={`rounded-full overflow-hidden flex items-center justify-center font-bold tracking-tight bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 border border-indigo-500/30 select-none ${sizeStyles}`}
        aria-label={name}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-background ${statusColor[status]}`}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
