'use client';

import React, { useState, useRef, useEffect } from 'react';

interface LqipImageProps {
  /** Full-resolution image URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** CSS class for the wrapper div */
  className?: string;
  /** Image class (applied to the full-res <img>) */
  imgClassName?: string;
  /** Blur amount in px for the LQIP phase (default 20) */
  blurAmount?: number;
  /** Transition duration in ms for the fade-in (default 400) */
  transitionDuration?: number;
  /** Loading strategy: 'eager' for above-fold, 'lazy' for below-fold */
  loading?: 'eager' | 'lazy';
  /** Optional aspect ratio class override, e.g. 'aspect-video' */
  aspectClass?: string;
  /** Fallback content when image fails */
  fallback?: React.ReactNode;
}

/**
 * Low-Quality Image Placeholder (LQIP) component.
 *
 * Renders a blurred placeholder while the full-resolution image loads,
 * then smoothly fades in the real image. If the image fails, shows fallback.
 */
export function LqipImage({
  src,
  alt,
  className = '',
  imgClassName = 'w-full h-full object-cover',
  blurAmount = 20,
  transitionDuration = 400,
  loading = 'lazy',
  aspectClass = 'aspect-video',
  fallback,
}: LqipImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If image is already cached, it may fire onload before we attach the listener
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  if (error) {
    return (
      <div className={`${className} ${aspectClass} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
        {fallback || (
          <div className="text-center text-gray-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-40">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} ${aspectClass} relative overflow-hidden bg-gray-100 dark:bg-gray-800`}>
      {/* Blurred placeholder — always rendered, fades out when real image loads */}
      <div
        className="absolute inset-0 transition-opacity"
        style={{
          opacity: loaded ? 0 : 1,
          transitionDuration: `${transitionDuration}ms`,
          zIndex: 1,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: `blur(${blurAmount}px)`,
          transform: 'scale(1.1)', // Prevent blur edge artifacts
        }}
        aria-hidden="true"
      />

      {/* Solid color base layer (visible under the blur) */}
      <div
        className="absolute inset-0 bg-gray-200 dark:bg-gray-700"
        style={{ opacity: loaded ? 0 : 1, transitionDuration: `${transitionDuration}ms` }}
        aria-hidden="true"
      />

      {/* Full-resolution image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${imgClassName} transition-opacity`}
        style={{
          opacity: loaded ? 1 : 0,
          transitionDuration: `${transitionDuration}ms`,
        }}
      />
    </div>
  );
}
