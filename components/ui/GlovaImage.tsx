'use client';

import React, { useState } from 'react';

export interface GlovaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: 'aspect-video' | 'aspect-square' | 'aspect-[4/3]' | 'aspect-[3/2]' | 'aspect-auto';
  className?: string;
  imageClassName?: string;
  fallbackText?: string;
}

/**
 * Reusable Anti-CLS Image Primitive
 * Guarantees zero Cumulative Layout Shift via fixed geometric aspect-ratio bounds
 * and smooth skeleton loading state.
 */
export const GlovaImage: React.FC<GlovaImageProps> = ({
  src,
  alt,
  aspectRatio = 'aspect-video',
  className = '',
  imageClassName = '',
  fallbackText,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl bg-muted/30 border border-border/40 ${aspectRatio} ${className}`}
    >
      {/* Anti-CLS Skeleton Fallback */}
      {!isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-muted/60"
        />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-muted/40 text-muted-foreground text-xs">
          <span>{fallbackText || 'Image unavailable'}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${imageClassName}`}
          {...props}
        />
      )}
    </div>
  );
};
