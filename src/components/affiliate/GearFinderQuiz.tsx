'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouterStore } from '@/lib/router';
import { useDataStore, useEnsureData, searchProducts } from '@/lib/data-store';
import { getAffiliateUrl, getMerchantName, getAffiliateLinkProps } from '@/lib/affiliate';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Target,
  ChevronRight,
  ChevronLeft,
  Package,
  Award,
  Sparkles,
  RotateCcw,
  Loader2,
  Zap,
  ShieldCheck,
  Feather,
  DollarSign,
  Palette,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Trophy,
  Medal,
  ThumbsUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/types';

// ─── Types ──────────────────────────────────────────────────────────────────
interface QuizAnswers {
  category: string;
  useCase: string;
  priority: string;
  brandPreference: string;
}

interface Recommendation {
  product: Product;
  matchScore: number;
  explanation: string;
  label: string;
}

// ─── Priority options ──────────────────────────────────────────────────────
const PRIORITIES = [
  { id: 'performance', label: 'Performance', icon: Zap, description: 'Top-tier specs & power' },
  { id: 'portability', label: 'Portability', icon: Feather, description: 'Light & compact' },
  { id: 'durability', label: 'Durability', icon: ShieldCheck, description: 'Built to last' },
  { id: 'value', label: 'Value', icon: DollarSign, description: 'Best bang for buck' },
  { id: 'design', label: 'Design', icon: Palette, description: 'Looks & aesthetics' },
];

// ─── Local matching algorithm ──────────────────────────────────────────────
function calculateMatch(product: Product, answers: QuizAnswers): number {
  let score = 0;
  let maxScore = 0;

  // Category match (40 points)
  maxScore += 40;
  if (product.categorySlug === answers.category) {
    score += 40;
  }

  // Use case match via bestFor (25 points)
  maxScore += 25;
  const useCaseLower = answers.useCase.toLowerCase();
  const bestForMatch = product.bestFor.some((bf) =>
    bf.toLowerCase().includes(useCaseLower) || useCaseLower.includes(bf.toLowerCase())
  );
  if (bestForMatch) {
    score += 25;
  } else {
    // Partial match
    const tagsMatch = product.tags.some((t) =>
      t.toLowerCase().includes(useCaseLower) || useCaseLower.includes(t.toLowerCase())
    );
    if (tagsMatch) {
      score += 15;
    }
  }

  // Priority alignment (20 points)
  maxScore += 20;
  const priorityMap: Record<string, string[]> = {
    performance: ['performance', 'power', 'speed', 'fast', 'high-end'],
    portability: ['portable', 'lightweight', 'compact', 'travel', 'mini'],
    durability: ['durable', 'rugged', 'water-resistant', 'military', 'tough'],
    value: ['value', 'affordable', 'budget', 'best-bang', 'reliable'],
    design: ['design', 'premium', 'elegant', 'sleek', 'aesthetic'],
  };
  const priorityKeywords = priorityMap[answers.priority] || [];
  const productText = `${product.title} ${product.excerpt} ${product.tags.join(' ')} ${product.bestFor.join(' ')}`.toLowerCase();
  const priorityHits = priorityKeywords.filter((kw) => productText.includes(kw)).length;
  score += Math.min(20, priorityHits * 7);

  // Brand preference (15 points)
  maxScore += 15;
  if (answers.brandPreference && answers.brandPreference !== 'any') {
    if (product.brandSlug === answers.brandPreference) {
      score += 15;
    }
  } else {
    // No preference = full score (neutral)
    score += 15;
  }

  // Rating bonus (up to 10 points)
  maxScore += 10;
  score += (product.rating / 5) * 10;

  return Math.round((score / maxScore) * 100);
}

function getLocalRecommendations(answers: QuizAnswers, products: Product[]): Recommendation[] {
  const categoryProducts = answers.category
    ? products.filter((p) => p.categorySlug === answers.category)
    : products;

  const scored = categoryProducts.map((product) => ({
    product,
    matchScore: calculateMatch(product, answers),
  }));

  scored.sort((a, b) => b.matchScore - a.matchScore);

  const top3 = scored.slice(0, 3);
  const labels = ['Best Match', 'Runner Up', 'Also Consider'];

  return top3.map((item, idx) => ({
    product: item.product,
    matchScore: Math.min(99, Math.max(60, item.matchScore)),
    explanation: '',
    label: labels[idx],
  }));
}

// ─── Step indicator ────────────────────────────────────────────────────────
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center flex-1">
          <div
            className={`h-1.5 rounded-full transition-all duration-500 flex-1 ${
              i < current
                ? 'bg-amber-500'
                : i === current
                ? 'bg-amber-500/60'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        </div>
      ))}
      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
        {current + 1}/{total}
      </span>
    </div>
  );
}

// ─── Match percentage circle ───────────────────────────────────────────────
function MatchCircle({ score, size = 80 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 85
      ? 'text-emerald-500'
      : score >= 70
      ? 'text-amber-500'
      : 'text-orange-500';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="4"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          className={colorClass}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold text-lg ${colorClass}`}>{score}%</span>
      </div>
    </div>
  );
}

// ─── Recommendation card ───────────────────────────────────────────────────
function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const labelIcons: Record<string, React.ReactNode> = {
    'Best Match': <Trophy className="w-4 h-4 text-amber-500" />,
    'Runner Up': <Medal className="w-4 h-4 text-gray-400" />,
    'Also Consider': <ThumbsUp className="w-4 h-4 text-orange-400" />,
  };
  const labelColors: Record<string, string> = {
    'Best Match': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    'Runner Up': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'Also Consider': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
    >
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow rounded-xl">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Match circle */}
            <div className="flex-shrink-0">
              <MatchCircle score={rec.matchScore} size={90} />
            </div>

            {/* Product info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${labelColors[rec.label]} text-xs font-semibold gap-1`}>
                  {labelIcons[rec.label]}
                  {rec.label}
                </Badge>
              </div>

              <h3
                className="font-bold text-gray-900 dark:text-white text-base mb-1 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2"
                onClick={() => goToProduct(rec.product.slug)}
              >
                {rec.product.title}
              </h3>

              <div className="flex items-center gap-2 mb-2">
                <StarRating rating={rec.product.rating} size="sm" showValue />
                <span className="text-xs text-gray-400">{rec.product.category}</span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {rec.product.excerpt}
              </p>

              {rec.explanation && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <CheckPriceButton
                  merchant={rec.product.merchant}
                  productId={rec.product.asin}
                  customUrl={rec.product.priceUrl || rec.product.affiliateUrl || undefined}
                  size="sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => goToProduct(rec.product.slug)}
                  className="text-[#007185] dark:text-[#5cc7d4] hover:underline"
                >
                  Read Review
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Main Quiz Component ───────────────────────────────────────────────────
export function GearFinderQuiz() {
  useEnsureData();
  const products = useDataStore((s) => s.products);
  const categories = useDataStore((s) => s.categories);
  const brands = useDataStore((s) => s.brands);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({
    category: '',
    useCase: '',
    priority: '',
    brandPreference: '',
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [llmLoading, setLlmLoading] = useState(false);
  const [llmDone, setLlmDone] = useState(false);
  const goHome = useRouterStore((s) => s.goHome);

  const totalSteps = 4;

  // Get use cases for selected category
  const useCases = useMemo(() => {
    if (!answers.category) return [];
    const categoryProducts = products.filter((p) => p.categorySlug === answers.category);
    const allBestFor = categoryProducts.flatMap((p) => p.bestFor);
    return [...new Set(allBestFor)];
  }, [answers.category]);

  // Get brands for selected category
  const categoryBrands = useMemo(() => {
    if (!answers.category) return [];
    return brands.filter((b) => b.categories.includes(answers.category));
  }, [answers.category]);

  const handleAnswer = useCallback(
    (field: keyof QuizAnswers, value: string) => {
      setAnswers((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      // Calculate recommendations
      const recs = getLocalRecommendations(answers, products);
      setRecommendations(recs);
      setStep(totalSteps); // Results step

      // Then fetch LLM explanations
      setLlmLoading(true);
      fetch('/api/gear-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: answers.category,
          useCase: answers.useCase,
          priority: answers.priority,
          brandPreference: answers.brandPreference || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.recommendations) {
            setRecommendations((prev) =>
              prev.map((rec, idx) => {
                const llmRec = data.recommendations.find(
                  (r: { productSlug: string }) => r.productSlug === rec.product.slug
                );
                if (llmRec) {
                  return {
                    ...rec,
                    explanation: llmRec.explanation || rec.explanation,
                    matchScore: llmRec.matchScore || rec.matchScore,
                    label: llmRec.label || rec.label,
                  };
                }
                return rec;
              })
            );
          }
        })
        .catch(() => {
          // LLM failed, keep local recommendations
        })
        .finally(() => {
          setLlmLoading(false);
          setLlmDone(true);
        });
    }
  }, [step, answers]);

  const handleBack = useCallback(() => {
    if (step > 0 && step <= totalSteps) {
      setStep((prev) => prev - 1);
    }
  }, [step]);

  const handleReset = useCallback(() => {
    setStep(0);
    setAnswers({ category: '', useCase: '', priority: '', brandPreference: '' });
    setRecommendations([]);
    setLlmLoading(false);
    setLlmDone(false);
  }, []);

  const canProceed = useMemo(() => {
    switch (step) {
      case 0:
        return !!answers.category;
      case 1:
        return !!answers.useCase;
      case 2:
        return !!answers.priority;
      case 3:
        return true; // brand preference is optional
      default:
        return false;
    }
  }, [step, answers]);

  // Animation variants
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 200 : -200,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 200 : -200,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(1);

  const goNext = () => {
    setDirection(1);
    handleNext();
  };

  const goBack = () => {
    setDirection(-1);
    handleBack();
  };

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg shadow-amber-500/25">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Gear Finder Quiz
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Answer a few questions and we&apos;ll recommend the perfect gear for you
          </p>
        </div>

        {/* Quiz Card */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            {step < totalSteps ? (
              <>
                <StepIndicator current={step} total={totalSteps} />

                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {/* Step 1: Category */}
                    {step === 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          What type of gear are you looking for?
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Choose the category that best fits what you need
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {categories.map((cat) => {
                            const isSelected = answers.category === cat.slug;
                            return (
                              <button
                                key={cat.slug}
                                onClick={() => handleAnswer('category', cat.slug)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
                                }`}
                              >
                                <div className="font-semibold text-sm text-gray-900 dark:text-white mb-1">
                                  {cat.name}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {cat.productCount} products
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-amber-500 mt-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Use Case */}
                    {step === 1 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          What&apos;s your primary use case?
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          How will you primarily use this gear?
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {useCases.map((uc) => {
                            const isSelected = answers.useCase === uc;
                            return (
                              <button
                                key={uc}
                                onClick={() => handleAnswer('useCase', uc)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                                    {uc}
                                  </span>
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-amber-500 ml-auto" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Priority */}
                    {step === 2 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          What matters most to you?
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Select your top priority when choosing gear
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {PRIORITIES.map((p) => {
                            const Icon = p.icon;
                            const isSelected = answers.priority === p.id;
                            return (
                              <button
                                key={p.id}
                                onClick={() => handleAnswer('priority', p.id)}
                                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm'
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                    {p.label}
                                  </div>
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                    {p.description}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-amber-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Step 4: Brand Preference */}
                    {step === 3 && (
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Any specific brand preference?
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                          Optional — select a brand you prefer, or skip to see all
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <button
                            onClick={() => handleAnswer('brandPreference', 'any')}
                            className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                              answers.brandPreference === 'any' || !answers.brandPreference
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                                : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700'
                            }`}
                          >
                            <div className="font-semibold text-sm text-gray-900 dark:text-white">
                              No Preference
                            </div>
                            <div className="text-[11px] text-gray-500 dark:text-gray-400">
                              Show me all brands
                            </div>
                            {(answers.brandPreference === 'any' || !answers.brandPreference) && (
                              <CheckCircle className="w-5 h-5 text-amber-500 mx-auto mt-2" />
                            )}
                          </button>
                          {categoryBrands.map((brand) => {
                            const isSelected = answers.brandPreference === brand.slug;
                            return (
                              <button
                                key={brand.slug}
                                onClick={() => handleAnswer('brandPreference', brand.slug)}
                                className={`p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                                  isSelected
                                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-md'
                                    : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-700'
                                }`}
                              >
                                <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                  {brand.name}
                                </div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {brand.productCount} product{brand.productCount !== 1 ? 's' : ''}
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-amber-500 mx-auto mt-2" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    onClick={goBack}
                    disabled={step === 0}
                    className="text-gray-600 dark:text-gray-400"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </Button>
                  <Button
                    onClick={goNext}
                    disabled={!canProceed}
                    className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {step === totalSteps - 1 ? (
                      <>
                        <Target className="w-4 h-4 mr-1" />
                        Get Recommendations
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              /* Results Step */
              <div>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 mb-3 shadow-lg">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Gear Recommendations
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Based on your preferences, here are our top picks
                  </p>
                  {llmLoading && (
                    <div className="flex items-center justify-center gap-2 mt-3 text-amber-600 dark:text-amber-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Getting AI-powered insights...</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <RecommendationCard key={rec.product.id} rec={rec} index={idx} />
                  ))}
                </div>

                {recommendations.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No products found for your criteria. Try different options.
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Take Quiz Again
                  </Button>
                  <Button
                    onClick={goHome}
                    className="bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold"
                  >
                    Browse All Reviews
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Affiliate disclosure */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Recommendations are based on our editorial reviews and your preferences.
            GearGeekz earns commissions from qualifying purchases through affiliate links.
          </p>
        </div>
      </div>
    </div>
  );
}
