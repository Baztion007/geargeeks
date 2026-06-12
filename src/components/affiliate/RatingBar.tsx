'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { RatingBreakdown } from '@/lib/types';

interface StarRatingProps {
  rating: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
}

export function StarRating({ rating, size = 'md', showValue = true, count }: StarRatingProps) {
  const sizeMap = { xs: 10, sm: 14, md: 18, lg: 24 };
  const iconSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, rating - (star - 1)));
          return (
            <div key={star} className="relative" style={{ width: iconSize, height: iconSize }}>
              <Star
                size={iconSize}
                className="text-gray-300 absolute inset-0"
              />
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  size={iconSize}
                  className="text-amber-500 fill-amber-500"
                />
              </div>
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={`font-semibold text-gray-700 dark:text-gray-200 ${size === 'xs' ? 'text-[10px]' : size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-gray-400 text-xs">({count})</span>
      )}
    </div>
  );
}

interface RatingBreakdownBarProps {
  label: string;
  value: number;
}

export function RatingBreakdownBar({ label, value }: RatingBreakdownBarProps) {
  const safeValue = value ?? 0;
  const percentage = (safeValue / 5) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 animate-fill-bar"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{(value ?? 0).toFixed(1)}</span>
    </div>
  );
}

interface RatingBreakdownDisplayProps {
  breakdown: RatingBreakdown;
}

export function RatingBreakdownDisplay({ breakdown }: RatingBreakdownDisplayProps) {
  return (
    <div className="space-y-2">
      <RatingBreakdownBar label="Overall" value={breakdown.overall} />
      <RatingBreakdownBar label="Performance" value={breakdown.performance} />
      <RatingBreakdownBar label="Ease of Use" value={breakdown.easeOfUse} />
      <RatingBreakdownBar label="Value" value={breakdown.value} />
      <RatingBreakdownBar label="Build Quality" value={breakdown.buildQuality} />
      <RatingBreakdownBar label="Features" value={breakdown.features} />
    </div>
  );
}
