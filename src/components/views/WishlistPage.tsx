'use client';

import React, { useMemo } from 'react';
import { useWishlistStore } from '@/lib/wishlist';
import { useRouterStore } from '@/lib/router';
import { products, getProductBySlug } from '@/data/products';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';

export function WishlistPage() {
  const wishlistItems = useWishlistStore((s) => s.items);
  const clearWishlist = useWishlistStore((s) => s.clearWishlist);
  const goHome = useRouterStore((s) => s.goHome);
  const goToPage = useRouterStore((s) => s.goToPage);

  const wishlistedProducts = useMemo(() => {
    return wishlistItems
      .map((slug) => getProductBySlug(slug))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [wishlistItems]);

  if (wishlistedProducts.length === 0) {
    return (
      <div className="min-h-screen bg-[#eaeded]">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <Breadcrumbs items={[{ label: 'Wishlist' }]} />

          <div className="bg-white rounded-lg shadow-sm p-12 md:p-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Save your favorite coffee equipment here so you can easily find them later. 
              Click the heart icon on any product to add it to your wishlist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={goHome}
                className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-8 py-3 h-auto"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
              <Button
                onClick={() => goToPage('best-sellers')}
                variant="outline"
                className="border-[#131921] text-[#131921] hover:bg-[#131921] hover:text-white font-bold px-8 py-3 h-auto"
              >
                View Best Sellers
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: 'Wishlist' }]} />

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-10 h-10 text-red-400 fill-red-400" />
              <h1 className="text-3xl md:text-4xl font-bold">My Wishlist</h1>
            </div>
            <p className="text-lg text-gray-300 max-w-3xl">
              Your saved coffee equipment. Click the heart icon to remove items, or browse more products to add.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <span className="text-sm text-[#febd69] font-medium">
                {wishlistedProducts.length} item{wishlistedProducts.length !== 1 ? 's' : ''} saved
              </span>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">
            Saved Items ({wishlistedProducts.length})
          </h2>
          <Button
            onClick={clearWishlist}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500 mb-4">Looking for more coffee gear?</p>
          <Button
            onClick={goHome}
            className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold px-8 py-3 h-auto"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
}
