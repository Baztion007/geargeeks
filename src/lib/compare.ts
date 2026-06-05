import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/hooks/use-toast';

interface CompareState {
  items: string[]; // product slugs (max 4)
  addItem: (slug: string) => void;
  removeItem: (slug: string) => void;
  toggleItem: (slug: string) => void;
  isInCompare: (slug: string) => boolean;
  clearCompare: () => void;
  canAdd: () => boolean;
}

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (slug: string) => {
        const { items } = get();
        if (items.includes(slug)) return;
        if (items.length >= MAX_COMPARE_ITEMS) {
          toast({
            title: 'Compare List Full',
            description: 'You can compare up to 4 products at a time.',
            variant: 'destructive',
          });
          return;
        }
        const updated = [...items, slug];
        set({ items: updated });
        toast({
          title: 'Added to Compare',
          description: 'Product has been added to your comparison list.',
        });
      },

      removeItem: (slug: string) => {
        const { items } = get();
        const updated = items.filter((item) => item !== slug);
        set({ items: updated });
        toast({
          title: 'Removed from Compare',
          description: 'Product has been removed from your comparison list.',
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

      isInCompare: (slug: string) => {
        return get().items.includes(slug);
      },

      clearCompare: () => {
        set({ items: [] });
        toast({
          title: 'Compare List Cleared',
          description: 'All products have been removed from comparison.',
        });
      },

      canAdd: () => {
        return get().items.length < MAX_COMPARE_ITEMS;
      },
    }),
    {
      name: 'geargeekz-compare',
    }
  )
);
