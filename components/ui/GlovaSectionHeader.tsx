import React from 'react';

export interface GlovaSectionHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Section Header enforcing strictly <= 3 typography tiers per viewport
 */
export const GlovaSectionHeader: React.FC<GlovaSectionHeaderProps> = ({
  title,
  eyebrow,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 ${className}`}>
      <div className="flex flex-col gap-1">
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-wider text-[#FA5D5D] select-none">
            {eyebrow}
          </span>
        )}
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 flex items-center">{action}</div>}
    </div>
  );
};
