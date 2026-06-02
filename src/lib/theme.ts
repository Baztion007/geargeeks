'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  _applyTheme: (resolved: ResolvedTheme) => void;
  _resolveTheme: (theme: Theme) => ResolvedTheme;
}

const applyThemeToDocument = (resolved: ResolvedTheme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

const getSystemPreference = (): ResolvedTheme => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      _resolveTheme: (theme: Theme): ResolvedTheme => {
        if (theme === 'system') {
          return getSystemPreference();
        }
        return theme;
      },

      _applyTheme: (resolved: ResolvedTheme) => {
        applyThemeToDocument(resolved);
        set({ resolvedTheme: resolved });
      },

      setTheme: (theme: Theme) => {
        const resolved = get()._resolveTheme(theme);
        set({ theme, resolvedTheme: resolved });
        applyThemeToDocument(resolved);
      },

      toggleTheme: () => {
        const { theme } = get();
        const cycle: Theme[] = ['light', 'dark', 'system'];
        const currentIndex = cycle.indexOf(theme);
        const nextTheme = cycle[(currentIndex + 1) % cycle.length];
        get().setTheme(nextTheme);
      },
    }),
    {
      name: 'brewhub-theme',
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => {
        return (state) => {
          if (state) {
            const resolved = state._resolveTheme(state.theme);
            state._applyTheme(resolved);
          }

          // Listen for system preference changes
          if (typeof window !== 'undefined') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => {
              const currentState = get();
              if (currentState.theme === 'system') {
                const resolved = getSystemPreference();
                currentState._applyTheme(resolved);
              }
            };
            mediaQuery.addEventListener('change', handleChange);
          }
        };
      },
    }
  )
);
