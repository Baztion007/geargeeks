'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BookmarkState {
  bookmarks: string[];
  addBookmark: (slug: string) => void;
  removeBookmark: (slug: string) => void;
  isBookmarked: (slug: string) => boolean;
  clearBookmarks: () => void;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (slug: string) =>
        set((state) => ({
          bookmarks: state.bookmarks.includes(slug)
            ? state.bookmarks
            : [slug, ...state.bookmarks],
        })),
      removeBookmark: (slug: string) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((s) => s !== slug),
        })),
      isBookmarked: (slug: string) => get().bookmarks.includes(slug),
      clearBookmarks: () => set({ bookmarks: [] }),
    }),
    {
      name: 'geargeekz-bookmarks',
    }
  )
);
