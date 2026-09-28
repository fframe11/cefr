'use client';

import React, { useState } from 'react';

export interface GlovaTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const GlovaTooltip: React.FC<GlovaTooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const id = React.useId();

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position];

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <div aria-describedby={isVisible ? id : undefined}>
        {children}
      </div>

      {isVisible && (
        <div
          id={id}
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1 text-xs font-medium text-white bg-slate-900 border border-slate-700/80 rounded-md shadow-md pointer-events-none whitespace-nowrap animate-in fade-in-0 zoom-in-95 duration-150 ${positionStyles}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
