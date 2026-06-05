import { create } from 'zustand';
import { toast } from '@/hooks/use-toast';

const WISHLIST_STORAGE_KEY = 'geargeekz-wishlist';

function loadWishlist(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveWishlist(items: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silently fail if localStorage is not available
  }
}

interface WishlistState {
  items: string[];
  addItem: (slug: string) => void;
  removeItem: (slug: string) => void;
  toggleItem: (slug: string) => void;
  isInWishlist: (slug: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: loadWishlist(),

  addItem: (slug: string) => {
    const { items } = get();
    if (items.includes(slug)) return;
    const updated = [...items, slug];
    saveWishlist(updated);
    set({ items: updated });
    toast({
      title: 'Added to Wishlist',
      description: 'Item has been added to your wishlist.',
    });
  },

  removeItem: (slug: string) => {
    const { items } = get();
    const updated = items.filter((item) => item !== slug);
    saveWishlist(updated);
    set({ items: updated });
    toast({
      title: 'Removed from Wishlist',
      description: 'Item has been removed from your wishlist.',
    });
  },

  toggleItem: (slug: string) => {
    const { items } = get();
    if (items.includes(slug)) {
      get().removeItem(slug);
    } else {
      get().addItem(slug);
    }
  },

  isInWishlist: (slug: string) => {
    return get().items.includes(slug);
  },

  clearWishlist: () => {
    saveWishlist([]);
    set({ items: [] });
    toast({
      title: 'Wishlist Cleared',
      description: 'All items have been removed from your wishlist.',
    });
  },
}));
