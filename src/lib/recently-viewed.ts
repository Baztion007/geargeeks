'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
  recentlyViewed: string[];
  addRecentlyViewed: (slug: string) => void;
  clearRecentlyViewed: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      recentlyViewed: [],
      addRecentlyViewed: (slug: string) =>
        set((state) => {
          const filtered = state.recentlyViewed.filter((s) => s !== slug);
          return {
            recentlyViewed: [slug, ...filtered].slice(0, 10),
          };
        }),
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),
    }),
    {
      name: 'geargeekz-recently-viewed',
    }
  )
);
