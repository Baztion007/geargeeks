'use client';

import { create } from 'zustand';

const SESSION_KEY = 'gs_admin_session';
const TOKEN_KEY = 'gs_admin_token';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdminAuthState {
  isAuthenticated: boolean;
  isChecking: boolean;
  token: string | null;
  loginError: string | null;
  lockoutRemainingMs: number | null;
  login: (password: string) => Promise<{ success: boolean; error?: string; lockoutRemainingMs?: number }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

function clearStoredToken() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

// ─── Idle timeout ──────────────────────────────────────────────────────────────

let idleTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes (matches server-side)

function startIdleTimer(onIdle: () => void) {
  stopIdleTimer();

  const resetTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(onIdle, IDLE_TIMEOUT);
  };

  // Listen for user activity
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach((event) => {
    window.addEventListener(event, resetTimer, { passive: true });
  });

  resetTimer();
}

function stopIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  events.forEach((event) => {
    window.removeEventListener(event, () => {}, false);
  });
}

// ─── Zustand Store ─────────────────────────────────────────────────────────────

export const useAdminAuth = create<AdminAuthState>((set, get) => ({
  isAuthenticated: false,
  isChecking: true,
  token: null,
  loginError: null,
  lockoutRemainingMs: null,

  login: async (password: string) => {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success && data.token) {
        setStoredToken(data.token);
        set({
          isAuthenticated: true,
          token: data.token,
          loginError: null,
          lockoutRemainingMs: null,
        });

        // Start idle timer
        startIdleTimer(() => {
          get().logout();
        });

        return { success: true };
      }

      set({
        loginError: data.error || 'Login failed',
        lockoutRemainingMs: data.lockoutRemainingMs || null,
      });

      return {
        success: false,
        error: data.error || 'Login failed',
        lockoutRemainingMs: data.lockoutRemainingMs,
      };
    } catch {
      set({ loginError: 'Network error — please try again' });
      return { success: false, error: 'Network error — please try again' };
    }
  },

  logout: async () => {
    const token = get().token || getStoredToken();
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
    } catch {
      // ignore network errors on logout
    }

    clearStoredToken();
    stopIdleTimer();
    set({ isAuthenticated: false, token: null, loginError: null, lockoutRemainingMs: null });
  },

  checkSession: async () => {
    const token = getStoredToken();
    if (!token) {
      set({ isAuthenticated: false, isChecking: false, token: null });
      return;
    }

    try {
      const res = await fetch('/api/admin/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.valid) {
        // Update token if refreshed
        if (data.refreshedToken) {
          setStoredToken(data.refreshedToken);
        }
        set({
          isAuthenticated: true,
          token: data.refreshedToken || token,
          isChecking: false,
        });

        // Start idle timer
        startIdleTimer(() => {
          get().logout();
        });
      } else {
        clearStoredToken();
        stopIdleTimer();
        set({ isAuthenticated: false, isChecking: false, token: null });
      }
    } catch {
      // Network error — keep existing token state but mark as checked
      set({ isChecking: false });
    }
  },

  refreshToken: async () => {
    const token = get().token || getStoredToken();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.valid && data.refreshedToken) {
        setStoredToken(data.refreshedToken);
        set({ token: data.refreshedToken });
      }
    } catch {
      // ignore
    }
  },
}));
