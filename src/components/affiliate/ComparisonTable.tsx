'use client';

import React from 'react';
import { useDataStore, useEnsureData } from '@/lib/data-store';
import { StarRating } from '@/components/affiliate/RatingBar';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Award, CheckCircle, XCircle, Package, Trophy, TrendingUp } from 'lucide-react';
import type { Product } from '@/lib/types';

interface ComparisonTableProps {
  productSlugs: string[];
  onRemoveProduct?: (slug: string) => void;
}

// Determine the winner for a given spec key among the products
function getFeatureWinner(prods: Product[], key: string): number | null {
  if (prods.length < 2) return null;

  const values = prods.map((p) => p.features[key] ?? p.specifications?.[key] ?? '');
  // If all values are identical, no winner
  if (new Set(values).size <= 1) return null;

  // For numeric-like values, the highest wins
  const numericValues = values.map((v) => parseFloat(v.replace(/[^0-9.-]/g, '')));
  const hasNumeric = numericValues.some((v) => !isNaN(v));

  if (hasNumeric) {
    const validIndices = numericValues
      .map((v, i) => ({ v, i }))
      .filter((x) => !isNaN(x.v));
    if (validIndices.length > 1) {
      const maxVal = Math.max(...validIndices.map((x) => x.v));
      const winnerIndex = validIndices.find((x) => x.v === maxVal)?.i;
      if (winnerIndex !== undefined) return winnerIndex;
    }
  }

  return null;
}

export function ComparisonTable({ productSlugs, onRemoveProduct }: ComparisonTableProps) {
  useEnsureData();
  const allProducts = useDataStore((s) => s.products);
  const prods = productSlugs
    .map((slug) => allProducts.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);

  if (prods.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No products to compare. Add products using the compare feature.</p>
      </div>
    );
  }

  // Find highest rated
  const maxRating = Math.max(...prods.map((p) => p.rating));
  const topRatedIndex = prods.findIndex((p) => p.rating === maxRating);

  // Count "wins" per product across all features
  const winCounts = prods.map(() => 0);

  // Gather all feature keys
  const allFeatureKeys = new Set<string>();
  prods.forEach((p) => {
    Object.keys(p.features).forEach((key) => allFeatureKeys.add(key));
  });
  const featureKeys = Array.from(allFeatureKeys);

  featureKeys.forEach((key) => {
    const winnerIdx = getFeatureWinner(prods, key);
    if (winnerIdx !== null) {
      winCounts[winnerIdx]++;
    }
  });

  // Also count spec wins
  const allSpecKeys = new Set<string>();
  prods.forEach((p) => {
    if (p.specifications) {
      Object.keys(p.specifications).forEach((key) => allSpecKeys.add(key));
    }
  });
  const specKeys = Array.from(allSpecKeys);

  specKeys.forEach((key) => {
    const winnerIdx = getFeatureWinner(prods, key);
    if (winnerIdx !== null) {
      winCounts[winnerIdx]++;
    }
  });

  // Overall winner: most wins + highest rating as tiebreaker
  const maxWins = Math.max(...winCounts);
  const overallWinnerIndex = winCounts.reduce((best, count, idx) => {
    if (count > winCounts[best]) return idx;
    if (count === winCounts[best] && prods[idx].rating > prods[best].rating) return idx;
    return best;
  }, 0);

  // Quick verdict text
  const getQuickVerdict = () => {
    if (prods.length < 2) return null;
    const winner = prods[overallWinnerIndex];
    const winReasons: string[] = [];
    if (winner.rating === maxRating) winReasons.push('highest rating');
    if (winCounts[overallWinnerIndex] > 0) winReasons.push(`wins in ${winCounts[overallWinnerIndex]} spec categor${winCounts[overallWinnerIndex] > 1 ? 'ies' : 'y'}`);
    const reasonStr = winReasons.length > 0 ? ` — ${winReasons.join(' and ')}` : '';
    return { winner, reasonStr };
  };

  const verdict = getQuickVerdict();

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[600px]">
          {/* Product headers — sticky */}
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="p-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80 sticky left-0 z-10 min-w-[120px] backdrop-blur-sm">
                Feature
              </th>
              {prods.map((product, idx) => (
                <th
                  key={product.id}
                  className={`p-4 text-center min-w-[200px] ${
                    idx === overallWinnerIndex && prods.length > 1
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'bg-white dark:bg-gray-800/80 backdrop-blur-sm'
                  }`}
                >
                  {/* Remove button */}
                  {onRemoveProduct && (
                    <button
                      onClick={() => onRemoveProduct(product.slug)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Remove ${product.title} from comparison`}
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                  {/* Product image */}
                  <div className="w-24 h-24 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                    {product.title}
                  </h3>
                  {idx === overallWinnerIndex && prods.length > 1 && (
                    <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] mb-1">
                      <Trophy className="w-3 h-3 mr-1" />
                      Top Pick
                    </Badge>
                  )}
                  {product.rating === maxRating && idx !== overallWinnerIndex && prods.length > 1 && (
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-[10px] mb-1">
                      <Award className="w-3 h-3 mr-1" />
                      Top Rated
                    </Badge>
                  )}
                  <StarRating rating={product.rating} size="sm" showValue />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Best For row */}
            <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800">
              <td className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 sticky left-0 z-[5]">
                Best For
              </td>
              {prods.map((product) => (
                <td
                  key={product.id}
                  className={`p-3 text-center ${
                    product.rating === maxRating && prods.length > 1
                      ? 'bg-amber-50/50 dark:bg-amber-900/10'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap gap-1 justify-center">
                    {product.bestFor.slice(0, 3).map((bf) => (
                      <Badge
                        key={bf}
                        variant="secondary"
                        className="text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      >
                        {bf}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Feature rows with highlight indicators */}
            {featureKeys.map((key, idx) => {
              const winnerIdx = getFeatureWinner(prods, key);
              return (
                <tr
                  key={key}
                  className={`border-b border-gray-100 dark:border-gray-700/50 ${
                    idx % 2 === 0
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-gray-50/50 dark:bg-gray-800/30'
                  }`}
                >
                  <td className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 sticky left-0 z-[5]">
                    {key}
                  </td>
                  {prods.map((product, pIdx) => {
                    const isWinner = winnerIdx === pIdx;
                    const isLoser = winnerIdx !== null && winnerIdx !== pIdx;
                    return (
                      <td
                        key={product.id}
                        className={`p-3 text-sm text-center relative ${
                          isWinner
                            ? 'bg-emerald-50/50 dark:bg-emerald-900/10'
                            : isLoser
                            ? ''
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {isWinner && (
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                          )}
                          {isLoser && winnerIdx !== null && (
                            <XCircle className="w-4 h-4 text-red-400 shrink-0 opacity-40" />
                          )}
                          <span className={isWinner ? 'text-emerald-700 dark:text-emerald-300 font-semibold' : 'text-gray-700 dark:text-gray-300'}>
                            {product.features[key] || '—'}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {/* Pros row */}
            <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/20">
              <td className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 sticky left-0 z-[5]">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Pros
                </span>
              </td>
              {prods.map((product) => (
                <td
                  key={product.id}
                  className={`p-3 ${
                    product.rating === maxRating
                      ? 'bg-amber-50/30 dark:bg-amber-900/5'
                      : ''
                  }`}
                >
                  <ul className="space-y-1">
                    {product.pros.slice(0, 3).map((pro) => (
                      <li
                        key={pro}
                        className="text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-1"
                      >
                        <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Cons row */}
            <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800">
              <td className="p-3 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 sticky left-0 z-[5]">
                <span className="flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Cons
                </span>
              </td>
              {prods.map((product) => (
                <td
                  key={product.id}
                  className={`p-3 ${
                    product.rating === maxRating
                      ? 'bg-amber-50/30 dark:bg-amber-900/5'
                      : ''
                  }`}
                >
                  <ul className="space-y-1">
                    {product.cons.slice(0, 3).map((con) => (
                      <li
                        key={con}
                        className="text-xs text-red-700 dark:text-red-400 flex items-start gap-1"
                      >
                        <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{con}</span>
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Quick Verdict row */}
            {verdict && prods.length > 1 && (
              <tr className="border-b border-gray-100 dark:border-gray-700/50 bg-gradient-to-r from-amber-50/80 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/10">
                <td className="p-4 text-sm font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 sticky left-0 z-[5] flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  Quick Verdict
                </td>
                {prods.map((product, idx) => (
                  <td
                    key={product.id}
                    className={`p-4 text-center ${
                      idx === overallWinnerIndex
                        ? 'bg-amber-100/60 dark:bg-amber-900/30'
                        : ''
                    }`}
                  >
                    {idx === overallWinnerIndex ? (
                      <div className="flex flex-col items-center gap-1">
                        <Badge className="bg-amber-500 text-white text-xs font-bold">
                          <Trophy className="w-3 h-3 mr-1" />
                          Recommended
                        </Badge>
                        <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium">
                          Best overall choice{verdict.reasonStr}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Good alternative
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            )}

            {/* CTA row */}
            <tr>
              <td className="p-3 bg-gray-50 dark:bg-gray-800/50 sticky left-0 z-[5]" />
              {prods.map((product) => (
                <td
                  key={product.id}
                  className={`p-3 text-center bg-white dark:bg-gray-800`}
                >
                  <CheckPriceButton
                    merchant={product.merchant}
                    productId={product.asin}
                    customUrl={product.priceUrl || product.affiliateUrl || undefined}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
