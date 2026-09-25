'use client';
import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  label?: string;
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  label,
  text,
  className = '',
  size = 'md',
}) => {
  const displayLabel = label || text;
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-4 gap-2.5 text-muted-foreground ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      {displayLabel && <p className="text-xs sm:text-sm font-medium">{displayLabel}</p>}
    </div>
  );
};
