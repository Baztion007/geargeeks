'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouterStore } from '@/lib/router';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const route = useRouterStore((s) => s.route);
  const isActiveRef = useRef(false);

  // Only show on product detail and blog post pages
  const isActive = route.page === 'product' || route.page === 'blog-post';

  useEffect(() => {
    isActiveRef.current = isActive;
    if (!isActive) {
      setVisible(false);
      setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const handleScroll = () => {
      if (!isActiveRef.current) return;
      const scrollY = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const newProgress = (scrollY / docHeight) * 100;
        setProgress(Math.min(100, Math.max(0, newProgress)));
        setVisible(scrollY > 30);
      } else {
        setProgress(0);
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isActive]);

  if (!isActive || !visible || progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-1"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div
        className="h-full bg-gradient-to-r from-amber-400/0 via-amber-500/40 to-orange-500/0 absolute top-0 left-0 transition-[width] duration-100 ease-out blur-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
