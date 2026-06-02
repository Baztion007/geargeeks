'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompareStore } from '@/lib/compare';
import { useRouterStore } from '@/lib/router';
import { getProductBySlug } from '@/data/products';
import { X, GitCompare, Coffee } from 'lucide-react';

export function CompareBar() {
  const items = useCompareStore((s) => s.items);
  const removeItem = useCompareStore((s) => s.removeItem);
  const goToPage = useRouterStore((s) => s.goToPage);
  const [dismissed, setDismissed] = useState(false);

  const visible = items.length >= 2 && !dismissed;

  // Reset dismissed when items change
  React.useEffect(() => {
    if (items.length >= 2) {
      setDismissed(false);
    }
  }, [items.length]);

  if (!visible) return null;

  const products = items
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-30 hidden md:block"
        >
          <div className="bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] border-t border-gray-200">
            <div className="max-w-5xl mx-auto px-6 py-3 flex items-center gap-4">
              {/* Compare icon and label */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="bg-amber-100 rounded-full p-2">
                  <GitCompare size={18} className="text-amber-700" />
                </div>
                <span className="text-sm font-semibold text-gray-700">Compare</span>
              </div>

              {/* Product thumbnails */}
              <div className="flex items-center gap-3 flex-1 overflow-x-auto">
                {products.map((product) => (
                  <div
                    key={product!.slug}
                    className="relative flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1 shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0">
                      {product!.image ? (
                        <img
                          src={product!.image}
                          alt={product!.title}
                          className="w-full h-full object-contain p-0.5"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-amber-50">
                          <Coffee size={12} className="text-amber-400" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-700 font-medium max-w-[100px] truncate">
                      {product!.title.split(' ').slice(0, 3).join(' ')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(product!.slug);
                      }}
                      className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center shrink-0 transition-colors"
                      aria-label={`Remove ${product!.title} from compare`}
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Compare Now button */}
              <button
                onClick={() => goToPage('compare')}
                className="bg-[#131921] hover:bg-[#232f3e] text-white font-bold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg shrink-0 text-sm flex items-center gap-2"
              >
                <GitCompare size={16} />
                Compare Now
              </button>

              {/* Dismiss button */}
              <button
                onClick={() => setDismissed(true)}
                className="text-gray-400 hover:text-gray-600 shrink-0 p-1"
                aria-label="Dismiss compare bar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
