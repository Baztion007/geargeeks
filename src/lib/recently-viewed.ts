import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentlyViewedState {
  items: string[]; // product slugs (max 10)
  addView: (slug: string) => void;
  clearHistory: () => void;
}

const MAX_RECENTLY_VIEWED = 10;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],

      addView: (slug: string) => {
        const { items } = get();
        // Remove duplicate if exists
        const filtered = items.filter((item) => item !== slug);
        // Add to front
        const updated = [slug, ...filtered].slice(0, MAX_RECENTLY_VIEWED);
        set({ items: updated });
      },

      clearHistory: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'brewhub-recently-viewed',
    }
  )
);
