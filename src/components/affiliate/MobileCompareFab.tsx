'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import { useCompareStore } from '@/lib/compare';
import { useRouterStore } from '@/lib/router';

export function MobileCompareFab() {
  const items = useCompareStore((s) => s.items);
  const goToCompare = useRouterStore((s) => s.goToCompare);

  if (items.length < 2) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, x: 50, y: 50 }}
        animate={{ scale: 1, x: 0, y: 0 }}
        exit={{ scale: 0, x: 50, y: 50 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={goToCompare}
        className="fixed bottom-20 right-4 z-30 md:hidden w-14 h-14 rounded-full bg-[#febd69] shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        aria-label={`Compare ${items.length} products`}
      >
        <BarChart3 size={24} className="text-[#131921]" />
        {/* Count badge */}
        <span className="absolute -top-1 -right-1 bg-[#131921] text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
          {items.length}
        </span>
      </motion.button>
    </AnimatePresence>
  );
}
