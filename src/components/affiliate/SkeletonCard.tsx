'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function SkeletonCard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="overflow-hidden bg-white border border-gray-200 rounded-lg">
          {/* Image area */}
          <div className="aspect-square skeleton-shimmer" />

          {/* Content */}
          <CardContent className="p-3 sm:p-4 space-y-3">
            {/* Category placeholder */}
            <div className="h-4 w-16 skeleton-shimmer rounded-full" />

            {/* Title lines */}
            <div className="space-y-1.5">
              <div className="h-4 w-full skeleton-shimmer rounded" />
              <div className="h-4 w-3/4 skeleton-shimmer rounded" />
            </div>

            {/* Rating placeholder */}
            <div className="h-4 w-28 skeleton-shimmer rounded" />

            {/* Price placeholder */}
            <div className="h-6 w-20 skeleton-shimmer rounded" />

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Buttons placeholder */}
            <div className="flex gap-3">
              <div className="h-4 w-16 skeleton-shimmer rounded" />
              <div className="h-4 w-16 skeleton-shimmer rounded" />
            </div>

            {/* CTA button placeholder */}
            <div className="h-9 w-full skeleton-shimmer rounded-md" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
