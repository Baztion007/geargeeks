'use client';

import React, { useState, useEffect } from 'react';
import { useBookmarkStore } from '@/lib/bookmarks';
import { useDataStore, useEnsureData } from '@/lib/data-store';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { useRouterStore } from '@/lib/router';
import { Bookmark, Trash2, Package, Share2, Copy, Clock, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface BookmarkWithTimestamp {
  slug: string;
  addedAt: number;
}

function getBookmarkTimestamps(): BookmarkWithTimestamp[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('geargeekz-bookmark-timestamps');
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return [];
}

function saveBookmarkTimestamps(timestamps: BookmarkWithTimestamp[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('geargeekz-bookmark-timestamps', JSON.stringify(timestamps));
  } catch {
    // ignore
  }
}

export function BookmarksPage() {
  useEnsureData();
  const products = useDataStore((s) => s.products);
  const bookmarks = useBookmarkStore((s) => s.bookmarks);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const clearBookmarks = useBookmarkStore((s) => s.clearBookmarks);
  const addBookmark = useBookmarkStore((s) => s.addBookmark);

  const [timestamps, setTimestamps] = useState<BookmarkWithTimestamp[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimestamps(getBookmarkTimestamps());
  }, []);

  // Keep timestamps in sync with bookmarks
  useEffect(() => {
    const existing = getBookmarkTimestamps();
    const updated = bookmarks.map((slug) => {
      const existingTs = existing.find((t) => t.slug === slug);
      return existingTs || { slug, addedAt: Date.now() };
    });
    // Remove timestamps for bookmarks that no longer exist
    const filtered = updated.filter((t) => bookmarks.includes(t.slug));
    saveBookmarkTimestamps(filtered);
    setTimestamps(filtered);
  }, [bookmarks]);

  // Override addBookmark to track timestamps
  const handleAddBookmark = (slug: string) => {
    addBookmark(slug);
    const existing = getBookmarkTimestamps();
    if (!existing.find((t) => t.slug === slug)) {
      const updated = [...existing, { slug, addedAt: Date.now() }];
      saveBookmarkTimestamps(updated);
      setTimestamps(updated);
    }
  };

  const prods = bookmarks
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);

  // Recently bookmarked: sort by timestamp descending, take top 5
  const recentlyBookmarked = [...timestamps]
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 5)
    .map((t) => {
      const product = products.find((p) => p.slug === t.slug);
      return product ? { product, addedAt: t.addedAt } : null;
    })
    .filter((item): item is { product: Product; addedAt: number } => item !== null);

  // Share bookmarks via generated link
  const handleShareCollection = async () => {
    const slugs = bookmarks.join(',');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/#bookmarks?items=${encodeURIComponent(slugs)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Share Link Copied!',
        description: 'Your bookmark collection link has been copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy share link.',
        variant: 'destructive',
      });
    }
  };

  // Export bookmarks as formatted text
  const handleExportBookmarks = async () => {
    const lines = prods.map((p, i) => {
      return `${i + 1}. ${p.title} — ${p.category} — Rating: ${p.rating.toFixed(1)}/5 — ${p.brand}`;
    });
    const formatted = `GearGeekz Bookmarks (${prods.length} items)\n${'='.repeat(40)}\n\n${lines.join('\n')}`;
    try {
      await navigator.clipboard.writeText(formatted);
      toast({
        title: 'Bookmarks Exported!',
        description: 'Your bookmarks have been copied as a formatted list.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to export bookmarks.',
        variant: 'destructive',
      });
    }
  };

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Bookmarks' },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-amber-500" />
            My Bookmarks
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            {mounted ? prods.length : '—'} saved product{prods.length !== 1 ? 's' : ''}
            {mounted && prods.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                {prods.length} total
              </Badge>
            )}
          </p>
        </div>
        {prods.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareCollection}
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 border-amber-300 dark:border-amber-700"
            >
              <Share2 className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportBookmarks}
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <Copy className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Bookmarks?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {prods.length} bookmarked product{prods.length !== 1 ? 's' : ''} from your collection. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearBookmarks}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {/* Recently Bookmarked Section */}
      {mounted && recentlyBookmarked.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Recently Bookmarked
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x snap-mandatory">
            {recentlyBookmarked.map(({ product, addedAt }) => (
              <button
                key={product.id}
                onClick={() => useRouterStore.getState().goToProduct(product.slug)}
                className="group shrink-0 snap-start"
              >
                <Card className="w-44 hover:shadow-lg transition-all border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 card-hover-lift">
                  <CardContent className="p-3">
                    <div className="w-full aspect-square rounded-lg bg-gray-50 dark:bg-gray-700 overflow-hidden mb-2">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-300 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {product.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
                      <Clock size={10} />
                      {formatTimeAgo(addedAt)}
                    </span>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {prods.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Bookmark className="w-10 h-10 text-gray-300 dark:text-gray-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No Bookmarks Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
            Save products you&apos;re interested in by clicking the bookmark icon on any product card. They&apos;ll appear here for easy access.
          </p>
          <Button
            onClick={() => useRouterStore.getState().goHome()}
            className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {prods.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBookmark(product.slug);
                }}
                className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/30"
                title="Remove bookmark"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
