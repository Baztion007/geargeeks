'use client';

import React, { useEffect, useState } from 'react';

interface ScoreBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

function getColorClass(rating: number): { ring: string; bg: string; text: string; glow: string } {
  if (rating >= 4.5) {
    return {
      ring: 'border-emerald-400 dark:border-emerald-500',
      bg: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-300',
      glow: 'shadow-emerald-500/30',
    };
  }
  if (rating >= 4.0) {
    return {
      ring: 'border-amber-400 dark:border-amber-500',
      bg: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-300',
      glow: 'shadow-amber-500/30',
    };
  }
  if (rating >= 3.5) {
    return {
      ring: 'border-orange-400 dark:border-orange-500',
      bg: 'bg-orange-500',
      text: 'text-orange-700 dark:text-orange-300',
      glow: 'shadow-orange-500/30',
    };
  }
  return {
    ring: 'border-red-400 dark:border-red-500',
    bg: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
    glow: 'shadow-red-500/30',
  };
}

export function ScoreBadge({ rating, size = 'md' }: ScoreBadgeProps) {
  const [animated, setAnimated] = useState(false);
  const colors = getColorClass(rating);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const percentage = Math.min(100, Math.max(0, (rating / 5) * 100));

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'w-12 h-12',
      text: 'text-sm font-bold',
      strokeWidth: 3,
      radius: 18,
    },
    md: {
      container: 'w-16 h-16',
      text: 'text-lg font-bold',
      strokeWidth: 4,
      radius: 24,
    },
    lg: {
      container: 'w-24 h-24',
      text: 'text-2xl font-bold',
      strokeWidth: 5,
      radius: 36,
    },
  };

  const config = sizeConfig[size];
  const svgSize = size === 'sm' ? 48 : size === 'md' ? 64 : 96;
  const center = svgSize / 2;
  const circumference = 2 * Math.PI * config.radius;
  const dashOffset = circumference - (animated ? (percentage / 100) * circumference : 0);

  return (
    <div className={`${config.container} relative inline-flex items-center justify-center`}>
      {/* SVG Ring Gauge */}
      <svg
        width={svgSize}
        height={svgSize}
        className="absolute inset-0 -rotate-90"
        aria-hidden="true"
      >
        {/* Background ring */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={config.strokeWidth}
        />
        {/* Animated progress ring */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          className={colors.bg === 'bg-emerald-500' ? 'stroke-emerald-500' : colors.bg === 'bg-amber-500' ? 'stroke-amber-500' : colors.bg === 'bg-orange-500' ? 'stroke-orange-500' : 'stroke-red-500'}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 3px ${colors.bg === 'bg-emerald-500' ? 'rgba(16,185,129,0.4)' : colors.bg === 'bg-amber-500' ? 'rgba(245,158,11,0.4)' : colors.bg === 'bg-orange-500' ? 'rgba(249,115,22,0.4)' : 'rgba(239,68,68,0.4)'})`,
          }}
        />
      </svg>
      {/* Score text */}
      <span className={`relative z-10 ${config.text} ${colors.text}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
