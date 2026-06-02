'use client';

import React, { useState, useEffect } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const newProgress = (scrollY / docHeight) * 100;
        setProgress(newProgress);
        setVisible(scrollY > 50);
      } else {
        setProgress(0);
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible || progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 h-[3px]"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll progress"
    >
      <div
        className="h-full transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      >
        <div className="h-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
      </div>
    </div>
  );
}
