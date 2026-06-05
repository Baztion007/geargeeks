import { create } from 'zustand';
import { RoutePath } from '@/lib/types';

// Type for pages that don't require slug or query parameters
export type SimplePage = 'about' | 'contact' | 'privacy' | 'terms' | 'editorial-policy' | 'how-we-test' | 'trending' | 'roundups' | 'wishlist' | 'compare' | 'guides' | 'bookmarks' | 'gear-finder' | 'affiliate-settings' | 'admin' | 'admin-products' | 'admin-categories' | 'admin-brands' | 'admin-affiliate' | 'admin-messages' | 'best-sellers' | 'deals' | 'not-found' | 'home' | 'blog';

interface RouterState {
  route: RoutePath;
  navigate: (route: RoutePath) => void;
  goHome: () => void;
  goToProduct: (slug: string) => void;
  goToCategory: (slug: string) => void;
  goToBrand: (slug: string) => void;
  goToSearch: (query: string) => void;
  goToBuyingGuide: (slug: string) => void;
  goToAuthor: (slug: string) => void;
  goToWishlist: () => void;
  goToCompare: () => void;
  goToBlogPost: (slug: string) => void;
  goToGuides: () => void;
  goToTrending: () => void;
  goToBookmarks: () => void;
  goToGearFinder: () => void;
  goToAffiliateSettings: () => void;
  goToAdmin: () => void;
  goToAdminProducts: () => void;
  goToAdminCategories: () => void;
  goToAdminBrands: () => void;
  goToAdminAffiliate: () => void;
  goToAdminMessages: () => void;
  goToBestSellers: () => void;
  goToDeals: () => void;
  goToPage: (page: SimplePage) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  route: { page: 'home' },

  navigate: (route: RoutePath) => {
    set({ route });
    // Update hash for back button support
    const hash = routeToHash(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#${hash}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  goHome: () => set((state) => {
    const route: RoutePath = { page: 'home' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToProduct: (slug: string) => set((state) => {
    const route: RoutePath = { page: 'product', slug };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#product/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToCategory: (slug: string) => set((state) => {
    const route: RoutePath = { page: 'category', slug };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#category/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToBrand: (slug: string) => set((state) => {
    const route: RoutePath = { page: 'brand', slug };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#brand/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToSearch: (query: string) => set((state) => {
    const route: RoutePath = { page: 'search', query };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#search/${encodeURIComponent(query)}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToBuyingGuide: (slug: string) => set((state) => {
    const route: RoutePath = { page: 'buying-guide', slug };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#guide/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAuthor: (slug: string) => set((state) => {
    const route: RoutePath = { page: 'author', slug };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#author/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToPage: (page: SimplePage) => set((state) => {
    // This is safe because SimplePage only includes pages without required slugs/queries
    const route = { page } as RoutePath;
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#${page}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToWishlist: () => set((state) => {
    const route: RoutePath = { page: 'wishlist' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#wishlist');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToCompare: () => set((state) => {
    const route: RoutePath = { page: 'compare' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#compare');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToBlogPost: (slug: string) => set((state) => {
    const route: RoutePath = { page: 'blog-post', slug };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', `#blog/${slug}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToGuides: () => set((state) => {
    const route: RoutePath = { page: 'guides' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#guides');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToTrending: () => set((state) => {
    const route: RoutePath = { page: 'trending' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#trending');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToBookmarks: () => set((state) => {
    const route: RoutePath = { page: 'bookmarks' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#bookmarks');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToGearFinder: () => set((state) => {
    const route: RoutePath = { page: 'gear-finder' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#gear-finder');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAffiliateSettings: () => set((state) => {
    const route: RoutePath = { page: 'affiliate-settings' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#affiliate-settings');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAdmin: () => set((state) => {
    const route: RoutePath = { page: 'admin' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#admin');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAdminProducts: () => set((state) => {
    const route: RoutePath = { page: 'admin-products' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#admin-products');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAdminCategories: () => set((state) => {
    const route: RoutePath = { page: 'admin-categories' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#admin-categories');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAdminBrands: () => set((state) => {
    const route: RoutePath = { page: 'admin-brands' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#admin-brands');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAdminAffiliate: () => set((state) => {
    const route: RoutePath = { page: 'admin-affiliate' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#admin-affiliate');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToAdminMessages: () => set((state) => {
    const route: RoutePath = { page: 'admin-messages' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#admin-messages');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToBestSellers: () => set((state) => {
    const route: RoutePath = { page: 'best-sellers' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#best-sellers');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),

  goToDeals: () => set((state) => {
    const route: RoutePath = { page: 'deals' };
    if (typeof window !== 'undefined') {
      window.history.pushState({ route }, '', '#deals');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return { route };
  }),
}))

function routeToHash(route: RoutePath): string {
  switch (route.page) {
    case 'home': return '';
    case 'product': return `product/${route.slug}`;
    case 'category': return `category/${route.slug}`;
    case 'brand': return `brand/${route.slug}`;
    case 'search': return `search/${encodeURIComponent(route.query)}`;
    case 'buying-guide': return `guide/${route.slug}`;
    case 'author': return `author/${route.slug}`;
    case 'wishlist': return 'wishlist';
    case 'compare': return 'compare';
    case 'blog': return 'blog';
    case 'blog-post': return `blog/${route.slug}`;
    case 'guides': return 'guides';
    case 'trending': return 'trending';
    case 'bookmarks': return 'bookmarks';
    case 'gear-finder': return 'gear-finder';
    case 'affiliate-settings': return 'affiliate-settings';
    case 'admin': return 'admin';
    case 'admin-products': return 'admin-products';
    case 'admin-categories': return 'admin-categories';
    case 'admin-brands': return 'admin-brands';
    case 'admin-affiliate': return 'admin-affiliate';
    case 'admin-messages': return 'admin-messages';
    case 'best-sellers': return 'best-sellers';
    case 'deals': return 'deals';
    case 'roundups': return 'roundups';
    default: return route.page;
  }
}

export function hashToRoute(hash: string): RoutePath {
  const clean = hash.replace(/^#\/?/, '');
  if (!clean) return { page: 'home' };

  const parts = clean.split('/');
  const [type, ...rest] = parts;

  switch (type) {
    case 'product':
      return { page: 'product', slug: rest.join('/') };
    case 'category':
      return { page: 'category', slug: rest.join('/') };
    case 'brand':
      return { page: 'brand', slug: rest.join('/') };
    case 'search':
      return { page: 'search', query: decodeURIComponent(rest.join('/')) };
    case 'guide':
      return { page: 'buying-guide', slug: rest.join('/') };
    case 'author':
      return { page: 'author', slug: rest.join('/') };
    case 'blog':
      if (rest.length > 0) {
        return { page: 'blog-post', slug: rest.join('/') };
      }
      return { page: 'blog' };
    default:
      if (['about', 'contact', 'privacy', 'terms', 'editorial-policy', 'how-we-test', 'trending', 'roundups', 'wishlist', 'compare', 'guides', 'bookmarks', 'gear-finder', 'affiliate-settings', 'admin', 'admin-products', 'admin-categories', 'admin-brands', 'admin-affiliate', 'admin-messages', 'best-sellers', 'deals', 'not-found'].includes(type)) {
        return { page: type as RoutePath['page'] } as RoutePath;
      }
      return { page: 'not-found' };
  }
}
