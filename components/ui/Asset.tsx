'use client';

import React from 'react';
import { getAsset, AssetRecord } from '@/lib/assets/asset-registry';
import {
  Shield,
  Award,
  Zap,
  Gem,
  Crown,
  Sparkles,
  Trophy,
  Swords,
  Flame,
  BookOpen,
  Users,
  Image as ImageIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  Award,
  Zap,
  Gem,
  Crown,
  Sparkles,
  Trophy,
  Swords,
  Flame,
  BookOpen,
  Users,
};

interface AssetProps {
  assetKey: string;
  className?: string;
  size?: number | string;
  alt?: string;
  fallback?: React.ReactNode;
}

/**
 * Universal Frontend Asset Component.
 * Resolves assets purely by semantic assetKey through the backend Asset Registry.
 * Frontend never receives arbitrary external URLs.
 */
export const Asset: React.FC<AssetProps> = ({
  assetKey,
  className = '',
  size = 24,
  alt = 'Asset',
  fallback = null,
}) => {
  const record = getAsset(assetKey);

  if (!record || record.status !== 'VERIFIED') {
    return <>{fallback || <ImageIcon className={`w-5 h-5 text-muted-foreground/40 ${className}`} />}</>;
  }

  // If asset has a mapped Lucide icon in metadata, render vector directly for crisp rendering
  if (record.metadata?.icon && ICON_MAP[record.metadata.icon]) {
    const IconComponent = ICON_MAP[record.metadata.icon];
    const color = record.metadata.color || 'currentColor';
    return (
      <IconComponent
        className={className}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          color,
        }}
      />
    );
  }

  // Render standard verified image/SVG
  return (
    <img
      src={record.assetUrl}
      alt={alt || record.metadata?.nameEn || record.assetKey}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }}
      loading="lazy"
    />
  );
};
