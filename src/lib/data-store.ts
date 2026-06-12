/**
 * Zustand store for fetching and caching data from the API.
 * 
 * This replaces the static data imports (e.g., `import { brands } from '@/data/brands'`)
 * so that admin changes (add/edit/delete) are reflected on the public website.
 */

'use client';

import React, { useEffect } from 'react';
import { create } from 'zustand';
import type { Product, Category, Brand, BlogPost } from '@/lib/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface DataState {
  // Data
  products: Product[];
  categories: Category[];
  brands: Brand[];
  blogPosts: BlogPost[];

  // Loading states
  productsLoading: boolean;
  categoriesLoading: boolean;
  brandsLoading: boolean;
  blogPostsLoading: boolean;

  // Error states
  productsError: string | null;
  categoriesError: string | null;
  brandsError: string | null;
  blogPostsError: string | null;

  // Fetch timestamps (for cache invalidation)
  productsFetchedAt: number;
  categoriesFetchedAt: number;
  brandsFetchedAt: number;
  blogPostsFetchedAt: number;

  // Actions
  fetchProducts: (force?: boolean) => Promise<void>;
  fetchCategories: (force?: boolean) => Promise<void>;
  fetchBrands: (force?: boolean) => Promise<void>;
  fetchBlogPosts: (force?: boolean) => Promise<void>;
  fetchAll: (force?: boolean) => Promise<void>;

  // Invalidators (call after admin mutations)
  invalidateProducts: () => void;
  invalidateCategories: () => void;
  invalidateBrands: () => void;
  invalidateBlogPosts: () => void;
}

// Cache duration: 2 minutes
const CACHE_DURATION = 2 * 60 * 1000;

function isCacheValid(fetchedAt: number): boolean {
  return fetchedAt > 0 && Date.now() - fetchedAt < CACHE_DURATION;
}

// ─── API Helpers ────────────────────────────────────────────────────────────

async function fetchAPI<T>(endpoint: string): Promise<T> {
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Parse helpers ──────────────────────────────────────────────────────────

function parseProduct(raw: Record<string, unknown>): Product {
  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    image: String(raw.image ?? ''),
    gallery: parseJsonArray(raw.gallery),
    excerpt: String(raw.excerpt ?? ''),
    category: String(raw.category ?? ''),
    categorySlug: String(raw.categorySlug ?? ''),
    subcategory: String(raw.subcategory ?? ''),
    brand: String(raw.brand ?? ''),
    brandSlug: String(raw.brandSlug ?? ''),
    features: parseJsonObj(raw.features),
    pros: parseJsonArray(raw.pros),
    cons: parseJsonArray(raw.cons),
    rating: Number(raw.rating ?? 0),
    ratingBreakdown: parseJsonObj(raw.ratingBreakdown) as Product['ratingBreakdown'],
    asin: String(raw.asin ?? ''),
    merchant: (String(raw.merchant ?? 'amazon')) as Product['merchant'],
    affiliateUrl: String(raw.affiliateUrl ?? ''),
    priceUrl: String(raw.priceUrl ?? ''),
    tags: parseJsonArray(raw.tags),
    updatedAt: String(raw.updatedAt ?? ''),
    publishedAt: String(raw.publishedAt ?? ''),
    authorSlug: String(raw.authorSlug ?? ''),
    reviewStatus: (String(raw.reviewStatus ?? 'new')) as Product['reviewStatus'],
    bestFor: parseJsonArray(raw.bestFor),
    summary: String(raw.summary ?? ''),
    fullReview: String(raw.fullReview ?? ''),
    whoIsItFor: String(raw.whoIsItFor ?? ''),
    whoShouldSkip: String(raw.whoShouldSkip ?? ''),
    specifications: parseJsonObj(raw.specifications),
    relatedProducts: parseJsonArray(raw.relatedProducts),
  };
}

function parseCategory(raw: Record<string, unknown>): Category {
  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    image: String(raw.image ?? ''),
    productCount: Number(raw.productCount ?? 0),
    featured: Boolean(raw.featured),
  };
}

function parseBrand(raw: Record<string, unknown>): Brand {
  return {
    slug: String(raw.slug ?? ''),
    name: String(raw.name ?? ''),
    logo: String(raw.logo ?? ''),
    description: String(raw.description ?? ''),
    founded: raw.founded ? String(raw.founded) : undefined,
    headquarters: raw.headquarters ? String(raw.headquarters) : undefined,
    website: raw.website ? String(raw.website) : undefined,
    categories: parseJsonArray(raw.categories),
    productCount: Number(raw.productCount ?? 0),
  };
}

function parseBlogPost(raw: Record<string, unknown>): BlogPost {
  return {
    id: String(raw.id ?? ''),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    excerpt: String(raw.excerpt ?? ''),
    image: String(raw.image ?? ''),
    category: String(raw.category ?? ''),
    content: String(raw.content ?? ''),
    publishedAt: String(raw.publishedAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    authorSlug: String(raw.authorSlug ?? ''),
    tags: parseJsonArray(raw.tags),
    readingTime: Number(raw.readingTime ?? 5),
  };
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseJsonObj(val: unknown): Record<string, string> {
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return val as Record<string, string>;
  }
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  }
  return {};
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useDataStore = create<DataState>((set, get) => ({
  // Initial data
  products: [],
  categories: [],
  brands: [],
  blogPosts: [],

  // Loading states
  productsLoading: false,
  categoriesLoading: false,
  brandsLoading: false,
  blogPostsLoading: false,

  // Error states
  productsError: null,
  categoriesError: null,
  brandsError: null,
  blogPostsError: null,

  // Fetch timestamps
  productsFetchedAt: 0,
  categoriesFetchedAt: 0,
  brandsFetchedAt: 0,
  blogPostsFetchedAt: 0,

  // ─── Fetch Products ────────────────────────────────────────────────────
  fetchProducts: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.productsFetchedAt) && state.products.length > 0) return;
    if (state.productsLoading) return;

    set({ productsLoading: true, productsError: null });
    try {
      const data = await fetchAPI<{ products: Record<string, unknown>[] }>('/api/products');
      const products = data.products.map(parseProduct);
      set({ products, productsLoading: false, productsFetchedAt: Date.now() });
    } catch (error) {
      set({ productsError: error instanceof Error ? error.message : 'Failed to fetch products', productsLoading: false });
    }
  },

  // ─── Fetch Categories ──────────────────────────────────────────────────
  fetchCategories: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.categoriesFetchedAt) && state.categories.length > 0) return;
    if (state.categoriesLoading) return;

    set({ categoriesLoading: true, categoriesError: null });
    try {
      const data = await fetchAPI<{ categories: Record<string, unknown>[] }>('/api/categories');
      const categories = data.categories.map(parseCategory);
      set({ categories, categoriesLoading: false, categoriesFetchedAt: Date.now() });
    } catch (error) {
      set({ categoriesError: error instanceof Error ? error.message : 'Failed to fetch categories', categoriesLoading: false });
    }
  },

  // ─── Fetch Brands ──────────────────────────────────────────────────────
  fetchBrands: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.brandsFetchedAt) && state.brands.length > 0) return;
    if (state.brandsLoading) return;

    set({ brandsLoading: true, brandsError: null });
    try {
      const data = await fetchAPI<{ brands: Record<string, unknown>[] }>('/api/brands');
      const brands = data.brands.map(parseBrand);
      set({ brands, brandsLoading: false, brandsFetchedAt: Date.now() });
    } catch (error) {
      set({ brandsError: error instanceof Error ? error.message : 'Failed to fetch brands', brandsLoading: false });
    }
  },

  // ─── Fetch Blog Posts ──────────────────────────────────────────────────
  fetchBlogPosts: async (force = false) => {
    const state = get();
    if (!force && isCacheValid(state.blogPostsFetchedAt) && state.blogPosts.length > 0) return;
    if (state.blogPostsLoading) return;

    set({ blogPostsLoading: true, blogPostsError: null });
    try {
      const data = await fetchAPI<{ posts: Record<string, unknown>[] }>('/api/blog');
      const blogPosts = data.posts.map(parseBlogPost);
      set({ blogPosts, blogPostsLoading: false, blogPostsFetchedAt: Date.now() });
    } catch (error) {
      set({ blogPostsError: error instanceof Error ? error.message : 'Failed to fetch blog posts', blogPostsLoading: false });
    }
  },

  // ─── Fetch All ─────────────────────────────────────────────────────────
  fetchAll: async (force = false) => {
    await Promise.all([
      get().fetchProducts(force),
      get().fetchCategories(force),
      get().fetchBrands(force),
      get().fetchBlogPosts(force),
    ]);
  },

  // ─── Invalidators ──────────────────────────────────────────────────────
  invalidateProducts: () => set({ productsFetchedAt: 0, products: [], productsLoading: false }),
  invalidateCategories: () => set({ categoriesFetchedAt: 0, categories: [], categoriesLoading: false }),
  invalidateBrands: () => set({ brandsFetchedAt: 0, brands: [], brandsLoading: false }),
  invalidateBlogPosts: () => set({ blogPostsFetchedAt: 0, blogPosts: [], blogPostsLoading: false }),
}));

// ─── Derived data helpers (match the old static data function signatures) ───

export function getEditorPicks(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
}

export function getBestSellers(products: Product[]): Product[] {
  return [...products].sort((a, b) => b.rating - a.rating);
}

export function getTrending(products: Product[]): Product[] {
  return [...products]
    .filter((p) => p.rating >= 4.3)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);
}

export function getRecentlyUpdated(products: Product[]): Product[] {
  return [...products].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getProductsByCategory(products: Product[], categorySlug: string): Product[] {
  return products.filter((p) => p.categorySlug === categorySlug);
}

export function getProductsByBrand(products: Product[], brandSlug: string): Product[] {
  return products.filter((p) => p.brandSlug === brandSlug);
}

export function getFeaturedCategories(categories: Category[]): Category[] {
  return categories.filter((c) => c.featured);
}

export function getBrandBySlug(brands: Brand[], slug: string): Brand | undefined {
  return brands.find((b) => b.slug === slug);
}

export function getBlogPostBySlug(posts: BlogPost[], slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getRelatedPosts(posts: BlogPost[], currentSlug: string, limit = 3): BlogPost[] {
  const current = getBlogPostBySlug(posts, currentSlug);
  if (!current) return posts.slice(0, limit);

  const scored = posts
    .filter((p) => p.slug !== currentSlug)
    .map((p) => {
      let score = 0;
      if (p.category === current.category) score += 3;
      score += p.tags.filter((t) => current.tags.includes(t)).length;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.post);
}

export function searchProducts(products: Product[], query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q)
    );
  });
}

// ─── Convenience hooks ──────────────────────────────────────────────────────

/** Fetch all data on mount if not already loaded */
export function useEnsureData() {
  const fetchAll = useDataStore((s) => s.fetchAll);
  const productsLoading = useDataStore((s) => s.productsLoading);
  const categoriesLoading = useDataStore((s) => s.categoriesLoading);
  const brandsLoading = useDataStore((s) => s.brandsLoading);
  const blogPostsLoading = useDataStore((s) => s.blogPostsLoading);

  // Trigger fetch on first render
  React.useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    isLoading: productsLoading || categoriesLoading || brandsLoading || blogPostsLoading,
  };
}
