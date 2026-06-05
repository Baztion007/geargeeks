'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouterStore } from '@/lib/router';
import { getEditorPicks, getTrending, getRecentlyUpdated } from '@/data/products';
import { categories, getFeaturedCategories } from '@/data/categories';
import { brands } from '@/data/brands';
import { buyingGuides } from '@/data/buying-guides';
import { blogPosts } from '@/data/blog-posts';
import { getAffiliateUrl, getMerchantName, siteData } from '@/lib/affiliate';
import { getAffiliateLinkProps } from '@/lib/affiliate';
import { ProductCard } from '@/components/affiliate/ProductCard';

import { StarRating } from '@/components/affiliate/RatingBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Package,
  ShieldCheck,
  Award,
  Microscope,
  HeartHandshake,
  Clock,
  ChevronRight,
  ChevronDown,
  Mail,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Zap,
  Loader2,
  Quote,
  CheckCircle,
  Compass,
  MapPin,
  Headphones,
  Dumbbell,
  Laptop,
  Mountain,
  Speaker,
  Luggage,
  ExternalLink,
  Users,
  Star,
  Sparkles,
  Target,
  Eye,
  UsersRound,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { GuideType } from '@/lib/types';
import { RecentlyViewedWidget } from '@/components/affiliate/RecentlyViewedWidget';

// ─── Category icon map ──────────────────────────────────────────────────────
const categoryIcons: Record<string, React.ReactNode> = {
  'travel-gear': <Luggage className="w-8 h-8" />,
  'travel-gadgets': <Zap className="w-8 h-8" />,
  'electronics': <Headphones className="w-8 h-8" />,
  'home-office': <Laptop className="w-8 h-8" />,
  'fitness': <Dumbbell className="w-8 h-8" />,
  'outdoor': <Mountain className="w-8 h-8" />,
  'audio': <Speaker className="w-8 h-8" />,
  'luggage': <MapPin className="w-8 h-8" />,
};

const categoryGradients: Record<string, string> = {
  'travel-gear': 'from-teal-800 via-teal-700 to-emerald-600',
  'travel-gadgets': 'from-sky-800 via-sky-700 to-cyan-600',
  'electronics': 'from-violet-800 via-violet-700 to-purple-600',
  'home-office': 'from-stone-700 via-stone-600 to-stone-500',
  'fitness': 'from-rose-800 via-rose-700 to-pink-600',
  'outdoor': 'from-emerald-800 via-emerald-700 to-green-600',
  'audio': 'from-amber-800 via-amber-700 to-orange-600',
  'luggage': 'from-slate-700 via-slate-600 to-slate-500',
};

// ─── Guide type badge styling ──────────────────────────────────────────────
function getGuideTypeBadge(type: GuideType) {
  switch (type) {
    case 'best-products':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs"><Award className="w-3 h-3 mr-1" />Best Products</Badge>;
    case 'comparison':
      return <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200 text-xs"><Sparkles className="w-3 h-3 mr-1" />Comparison</Badge>;
    case 'brand-review':
      return <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 text-xs"><Package className="w-3 h-3 mr-1" />Brand Review</Badge>;
    case 'category-guide':
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs"><Compass className="w-3 h-3 mr-1" />Category Guide</Badge>;
    default:
      return null;
  }
}

// ─── Animated Counter Component ──────────────────────────────────────────────
function AnimatedCounter({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const duration = 1500;
    const steps = 40;
    const stepDuration = duration / steps;
    let current = 0;
    const increment = end / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [visible, end]);

  return (
    <div ref={ref} className="text-center counter-animate">
      <div className="text-3xl sm:text-4xl font-extrabold text-white text-shimmer">
        {count}{suffix}
      </div>
      <div className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">{label}</div>
    </div>
  );
}

// ─── Stats Counter Bar Section ──────────────────────────────────────────────
function StatsCounterBar() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !visible) {
          setVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [visible]);

  const stats = [
    { end: 25, suffix: '+', label: 'Products Reviewed', icon: <Eye className="w-5 h-5 text-amber-400" /> },
    { end: 8, suffix: '', label: 'Categories', icon: <Compass className="w-5 h-5 text-amber-400" /> },
    { end: 6, suffix: '', label: 'Buying Guides', icon: <BookOpen className="w-5 h-5 text-amber-400" /> },
    { end: 12, suffix: '', label: 'Brands', icon: <UsersRound className="w-5 h-5 text-amber-400" /> },
    { end: 2, suffix: '', label: 'Expert Reviewers', icon: <Star className="w-5 h-5 text-amber-400" /> },
  ];

  return (
    <section ref={ref} className="py-8 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                {visible ? (
                  <AnimatedCounter end={stat.end} label={stat.label} suffix={stat.suffix} />
                ) : (
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-extrabold text-white">0{stat.suffix}</div>
                    <div className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wider">{stat.label}</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Gear Finder CTA Banner ────────────────────────────────────────────────
function GearFinderCTA() {
  const navigate = useRouterStore((s) => s.navigate);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 py-8 sm:py-10">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
        }} />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-2 left-[10%] w-8 h-8 rounded-lg bg-white/10 border border-white/10"
          style={{ animation: 'float1 5s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-1 right-[15%] w-6 h-6 rounded-full bg-white/10 border border-white/10"
          style={{ animation: 'float2 6s ease-in-out infinite 1s' }}
        />
        <div
          className="absolute top-3 right-[30%] w-10 h-10 rounded-xl bg-white/5 border border-white/10"
          style={{ animation: 'float1 7s ease-in-out infinite 0.5s' }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg" style={{ animation: 'float1 3s ease-in-out infinite' }}>
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Not sure what to buy?
              </h2>
              <p className="text-amber-100 text-sm mt-0.5">
                Take our 60-second quiz and find the perfect gear for you
              </p>
            </div>
          </div>
          <Button
            onClick={() => navigate({ page: 'gear-finder' } as any)}
            className="bg-white text-amber-700 hover:bg-gray-100 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] text-base shrink-0"
          >
            <Target className="w-5 h-5 mr-2" />
            Find Your Gear
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(8deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-6deg); }
        }
      `}</style>
    </section>
  );
}

// ─── Hero Section: Premium Editorial Hero ──────────────────────────────────────
function HeroSection() {
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);
  const featuredGuide = buyingGuides[0]; // "Best Travel Gadgets of 2026"

  return (
    <section className="relative overflow-hidden hero-mesh-bg min-h-[70vh] flex flex-col justify-center noise-overlay">
      {/* Dot grid particle animation layer */}
      <div className="absolute inset-0 hero-dot-grid pointer-events-none z-0" />

      {/* Decorative floating elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[6%] left-[4%] w-16 h-16 rounded-2xl bg-amber-500/8 border border-amber-500/10 hero-float-1" />
        <div className="absolute top-[12%] right-[8%] w-10 h-10 rounded-full bg-orange-500/8 border border-orange-500/10 hero-float-2" />
        <div className="absolute bottom-[25%] left-[18%] w-12 h-12 rounded-xl bg-amber-400/8 border border-amber-400/10 hero-float-3" />
        <div className="absolute top-[45%] right-[25%] w-8 h-8 rounded-full bg-amber-500/8 border border-amber-500/10 hero-float-slow" />
        <div className="absolute bottom-[40%] right-[6%] w-14 h-14 rounded-2xl bg-orange-400/6 border border-orange-400/8 hero-float-fast" />
        {/* Large decorative rings */}
        <div className="absolute top-8 left-8 w-40 h-40 rounded-full border border-white/[0.04]" />
        <div className="absolute top-24 right-16 w-32 h-32 rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-16 left-1/4 w-24 h-24 rounded-full border border-white/[0.04]" />
        <div className="absolute top-1/3 right-1/3 w-20 h-20 rounded-full border border-white/[0.04]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 z-10 flex-1 flex items-center">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 w-full">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <Badge className="bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 text-sm font-semibold mb-6 px-4 py-1.5 border border-amber-500/20 backdrop-blur-sm">
              <Compass className="w-3.5 h-3.5 mr-1.5" />
              Featured Guide
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Discover the
              <span className="block text-shimmer">Right Gear</span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300/90 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light">
              Expert reviews, honest ratings, and curated buying guides to help you find the perfect gear for every adventure.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              {featuredGuide && (
                <div className="relative">
                  <div
                    className="absolute -inset-1 rounded-xl"
                    style={{ animation: 'pulseGlow 2.5s ease-in-out infinite' }}
                  />
                  <Button
                    onClick={() => goToBuyingGuide(featuredGuide.slug)}
                    className="relative bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0f172a] font-bold text-lg px-8 py-5 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all active:scale-[0.98] h-auto"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Read Guide
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                className="border-gray-500/50 text-gray-300 hover:text-white hover:border-white/80 bg-white/5 backdrop-blur-sm rounded-xl px-6 py-5"
                onClick={() => {
                  const el = document.getElementById('editors-picks');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Reviews
              </Button>
            </div>

            {/* Animated statistics counter */}
            <div className="mt-10 grid grid-cols-3 gap-6 sm:gap-8 max-w-md mx-auto lg:mx-0">
              <AnimatedCounter end={25} suffix="+" label="Products Reviewed" />
              <AnimatedCounter end={8} label="Categories" />
              <AnimatedCounter end={6} label="Buying Guides" />
            </div>

            {/* Trust indicator pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-gray-400">
              <span className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/[0.08]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Independent
              </span>
              <span className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/[0.08]">
                <Microscope className="w-4 h-4 text-emerald-400" />
                Hands-On Tested
              </span>
              <span className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/[0.08]">
                <Award className="w-4 h-4 text-amber-400" />
                Trusted
              </span>
            </div>
          </div>

          {/* Right visual — featured guide card with glass morphism */}
          <div className="flex-shrink-0 w-full max-w-md">
            {featuredGuide && (
              <Card className="glass-card-premium border border-white/15 dark:border-white/15 border-gray-200/60 text-gray-900 dark:text-white overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getGuideTypeBadge(featuredGuide.guideType)}
                    <Badge className="bg-amber-500 text-[#0f172a] text-xs font-bold">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  {/* Guide image */}
                  <div className="w-full aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-white/10 image-shine">
                    {featuredGuide.image ? (
                      <img
                        src={featuredGuide.image}
                        alt={featuredGuide.title}
                        className="w-full h-full object-cover"
                        loading="eager"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-gradient-to-br from-sky-900/60 to-teal-900/60 items-center justify-center"
                      style={{ display: featuredGuide.image ? 'none' : 'flex' }}
                    >
                      <Compass className="w-16 h-16 text-sky-300/60" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{featuredGuide.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300/80 mb-4 line-clamp-2">{featuredGuide.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {featuredGuide.readingTime} min read
                    </span>
                    <span>{featuredGuide.recommendedProducts.length} products</span>
                  </div>
                  <Button
                    onClick={() => goToBuyingGuide(featuredGuide.slug)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-[#0f172a] font-bold rounded-xl h-12 cta-sweep"
                  >
                    Read Full Guide
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator — smooth bounce */}
      <div
        className="absolute bottom-6 left-1/2 scroll-indicator z-10 flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
        onClick={() => {
          const el = document.getElementById('editors-picks');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        <span className="text-white/50 text-[10px] font-medium tracking-[0.2em] uppercase">Scroll</span>
        <ChevronDown className="w-5 h-5 text-amber-400" />
      </div>

      {/* Bottom accent bar — animated gradient */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-orange-500" />

      {/* Inline keyframes for pulseGlow (used by hero CTA) */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.4); }
          50% { box-shadow: 0 0 0 14px rgba(251, 191, 36, 0); }
        }
      `}</style>
    </section>
  );
}

// ─── Popular Categories Section ─────────────────────────────────────────────
function CategoriesSection() {
  const goToCategory = useRouterStore((s) => s.goToCategory);
  const featuredCats = getFeaturedCategories();

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-900 section-divider-wave">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight accent-underline">Popular Categories</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Find the right gear for your lifestyle</p>
          </div>
          <Button
            variant="ghost"
            className="text-amber-600 hover:text-amber-700 hidden sm:flex items-center gap-1"
            onClick={() => {
              const el = document.getElementById('all-categories');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            All Categories
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
          {featuredCats.map((cat) => (
            <Card
              key={cat.id}
              className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200/60 dark:border-gray-600/40 glass-card-premium card-hover-lift rounded-xl"
              onClick={() => goToCategory(cat.slug)}
            >
              {/* Category image */}
              <div className="aspect-[4/3] overflow-hidden relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }}
                />
                <div
                  className={`w-full h-full absolute inset-0 bg-gradient-to-br ${
                    categoryGradients[cat.slug] || 'from-gray-700 to-gray-600'
                  } items-center justify-center text-white/70`}
                  style={{ display: 'none' }}
                >
                  {categoryIcons[cat.slug] || <Package className="w-8 h-8" />}
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-sm text-white drop-shadow-lg">{cat.name}</h3>
                </div>
              </div>
              <CardContent className="p-3 sm:p-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#007185] dark:text-[#5cc7d4] font-medium">
                    {cat.productCount} Products
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Editor's Picks Section ──────────────────────────────────────────────
function EditorsPicksSection() {
  const editorPicks = getEditorPicks();

  return (
    <section id="editors-picks" className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 relative dot-pattern section-divider-wave-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight accent-underline">
              <Award className="w-7 h-7 inline-block text-amber-500 mr-2 -mt-1" />
              Editor&apos;s Picks
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Our top-rated gear, handpicked by the editorial team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {editorPicks.slice(0, 4).map((product, index) => (
            <div key={product.id} className="relative">
              {index === 0 && (
                <div className="featured-ribbon">
                  <Sparkles size={10} />
                  Featured
                </div>
              )}
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Trending Products Section ──────────────────────────────────────────────
function TrendingSection() {
  const editorPicks = getEditorPicks();
  const editorPickIds = new Set(editorPicks.slice(0, 4).map((p) => p.id));
  const trending = getTrending().filter((p) => !editorPickIds.has(p.id));

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-900 section-divider-wave">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight accent-underline">
              <TrendingUp className="w-7 h-7 inline-block text-amber-500 mr-2 -mt-1" />
              Trending Now
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Recently updated and highly rated by our team</p>
          </div>
        </div>

        {/* Mobile: horizontal scroll, Desktop: grid */}
        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x snap-mandatory">
          {trending.slice(0, 5).map((product) => (
            <div key={product.id} className="min-w-[280px] lg:min-w-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Recently Updated Reviews Section ───────────────────────────────────────
function RecentlyUpdatedSection() {
  const recentlyUpdated = getRecentlyUpdated();
  const goToProduct = useRouterStore((s) => s.goToProduct);

  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 section-divider-wave-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight accent-underline">
              <Clock className="w-7 h-7 inline-block text-sky-600 mr-2 -mt-1" />
              Recently Updated Reviews
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Fresh reviews and re-evaluations from our team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyUpdated.slice(0, 6).map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 timeline-border relative"
              onClick={() => goToProduct(product.slug)}
            >
              <CardContent className="p-4 flex gap-4">
                {/* Product image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-600 dark:to-gray-700 items-center justify-center"
                    style={{ display: product.image ? 'none' : 'flex' }}
                  >
                    <Package className="w-8 h-8 text-slate-400 dark:text-slate-300" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {product.reviewStatus === 'updated' && (
                      <Badge className="bg-sky-100 text-sky-700 text-[10px] hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-300">Updated</Badge>
                    )}
                    {product.reviewStatus === 'verified' && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px] hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300">Verified</Badge>
                    )}
                    {product.reviewStatus === 'new' && (
                      <Badge className="bg-violet-100 text-violet-700 text-[10px] hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300">New</Badge>
                    )}
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      {new Date(product.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  <StarRating rating={product.rating} size="sm" showValue />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{product.excerpt}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Best Product Roundups Section ────────────────────────────────────────
function BuyingGuidesSection() {
  const goToBuyingGuide = useRouterStore((s) => s.goToBuyingGuide);

  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-gray-900 section-divider-wave">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight accent-underline">
              <Compass className="w-7 h-7 inline-block text-amber-500 mr-2 -mt-1" />
              Best Product Roundups
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">In-depth guides to help you choose the right gear</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {buyingGuides.map((guide) => (
            <Card
              key={guide.id}
              className="group cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 card-hover-lift rounded-xl"
              onClick={() => goToBuyingGuide(guide.slug)}
            >
              {/* Guide image */}
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                  }}
                />
                <div
                  className={`w-full h-full items-center justify-center bg-gradient-to-br ${
                    categoryGradients[guide.categorySlug] || 'from-gray-700 to-gray-600'
                  }`}
                  style={{ display: 'none' }}
                >
                  <Compass className="w-12 h-12 text-white/50" />
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                {/* Guide type badge */}
                <div className="absolute top-3 left-3">
                  {getGuideTypeBadge(guide.guideType)}
                </div>
                {/* Reading time */}
                <div className="absolute bottom-3 right-3">
                  <Badge className="bg-black/50 text-white text-xs backdrop-blur-sm">
                    <Clock className="w-3 h-3 mr-1" />
                    {guide.readingTime} min
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                  {guide.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#007185] dark:text-[#5cc7d4] font-medium">
                    {guide.recommendedProducts.length} products compared
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Brands Section ────────────────────────────────────────────────
function FeaturedBrandsSection() {
  const goToBrand = useRouterStore((s) => s.goToBrand);

  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 section-divider-wave-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight accent-underline">
              <Users className="w-7 h-7 inline-block text-amber-500 mr-2 -mt-1" />
              Featured Brands
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm font-medium">Trusted names we review and recommend</p>
          </div>
        </div>

        {/* Horizontal scrollable brand strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {brands.map((brand) => (
            <Card
              key={brand.slug}
              className="group cursor-pointer shrink-0 w-44 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 card-hover-lift rounded-xl border-glow hover:border-[#febd69]/40"
              onClick={() => goToBrand(brand.slug)}
            >
              <CardContent className="p-5 flex flex-col items-center text-center">
                {/* Brand logo/placeholder */}
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3 overflow-hidden ring-2 ring-gray-200/50 dark:ring-gray-600/30 group-hover:ring-[#febd69]/30 transition-all duration-300 brand-ring-hover">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-600 dark:to-gray-700"
                    style={{ display: brand.logo ? 'none' : 'flex' }}
                  >
                    <span className="text-xl font-bold text-slate-400 dark:text-slate-300 group-hover:text-[#febd69] transition-colors duration-300">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200">
                  {brand.name}
                </h3>
                <span className="text-[10px] text-gray-500 dark:text-gray-300 mt-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{brand.productCount} product{brand.productCount !== 1 ? 's' : ''}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Why Trust Us Block ─────────────────────────────────────────────────────
function TrustBlock() {
  const trustItems = [
    {
      icon: <Microscope className="w-8 h-8 text-emerald-600" />,
      title: 'Hands-On Testing',
      description: 'Every product is tested in real-world conditions for at least 2 weeks before we publish our review.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: 'Editorial Independence',
      description: 'Affiliate commissions never influence our ratings or rankings. Our opinions are our own.',
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      title: 'Expert Reviewers',
      description: 'Our team includes tech journalists, travel experts, and gear specialists with decades of experience.',
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-emerald-600" />,
      title: 'Honest & Transparent',
      description: 'We publish both pros and cons, and always disclose our affiliate relationships clearly.',
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-gray-900 section-divider-wave">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Why Trust GearScope?</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-emerald-400 to-emerald-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-2xl mx-auto text-sm font-medium">
            We take our reviews seriously. Here&apos;s what sets GearScope apart from other review sites.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {trustItems.map((item, idx) => (
            <Card
              key={idx}
              className="border border-emerald-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 text-center card-hover-lift rounded-xl"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 flex items-center justify-center mb-3">
                  {React.cloneElement(item.icon as React.ReactElement, { className: 'w-6 h-6 text-emerald-600' })}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Editorial Independence Statement */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-emerald-200 dark:border-gray-700 rounded-xl p-5 sm:p-6 max-w-3xl mx-auto shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1.5">Our Editorial Pledge</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                GearScope operates with complete editorial independence. While we earn commissions through
                affiliate programs, this never affects which products we recommend or how we rate them.
                Our reviews are based on hands-on testing, expert evaluation, and genuine user feedback. We will
                always publish both pros and cons, and we will never accept payment for positive coverage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials Section ────────────────────────────────────────────────────
function TestimonialsSection() {
  const testimonials = [
    {
      text: "GearScope's travel gadget guide saved me from buying the wrong power bank. The Anker 737 has been a game-changer for my international trips.",
      author: 'Michael R.',
      role: 'Frequent Traveler',
      rating: 5,
    },
    {
      text: 'Finally, a review site that actually tests products instead of just listing specs. The headphone comparison was incredibly detailed and honest.',
      author: 'Sarah K.',
      role: 'Audio Enthusiast',
      rating: 5,
    },
    {
      text: 'The home office setup guide helped me choose the right standing desk and chair. My back pain has improved significantly since following their recommendations.',
      author: 'David L.',
      role: 'Remote Worker',
      rating: 5,
    },
    {
      text: "I've bought three products based on GearScope recommendations and they've all been spot-on. Trust this site for honest, thorough reviews!",
      author: 'Emily T.',
      role: 'Tech Enthusiast',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/50 section-divider-wave-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Quote className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">What Our Readers Say</h2>
          </div>
          <div className="w-16 h-1 bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mt-4 rounded-full" />
          <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-2xl mx-auto text-sm font-medium">
            Join thousands of gear enthusiasts who trust our reviews
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {testimonials.map((testimonial, idx) => (
            <Card
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-5 sm:p-6 border border-gray-100 dark:border-gray-700 card-hover-lift relative overflow-hidden"
            >
              <CardContent className="p-0 relative z-10 dramatic-quote">
                <Quote className="w-10 h-10 text-amber-400/50 mb-3 relative z-10" />
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4 relative z-10">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <StarRating rating={testimonial.rating} size="sm" showValue={false} />
                <div className="mt-3 flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">{testimonial.author}</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{testimonial.role}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter CTA ─────────────────────────────────────────────────────────
function NewsletterCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('This email is already subscribed.');
          toast({
            title: 'Already subscribed',
            description: 'This email is already on our newsletter list.',
            variant: 'destructive',
          });
        } else {
          setError(data.error || 'Something went wrong.');
          toast({
            title: 'Error',
            description: data.error || 'Failed to subscribe. Please try again.',
            variant: 'destructive',
          });
        }
        return;
      }

      setSubmitted(true);
      setEmail('');
      toast({
        title: 'Subscribed!',
        description: data.message || 'You\'ve been subscribed to our newsletter.',
      });
    } catch {
      setError('Network error. Please try again.');
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden dark:from-[#0b1120] dark:via-[#162033] dark:to-[#0b1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left flex-1">
            <Mail className="w-10 h-10 text-amber-400 mx-auto lg:mx-0 mb-3 gentle-float" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
              Never Miss a Review
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto lg:mx-0">
              Get the latest gear reviews, buying guides, and product recommendations from GearScope delivered to your inbox. No spam, unsubscribe anytime.
            </p>
          </div>

          <div className="w-full max-w-md">
            {submitted ? (
              <Card className="bg-emerald-900/30 border border-emerald-500/30 rounded-xl">
                <CardContent className="p-6 text-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-white font-bold text-lg">You&apos;re In!</h3>
                  <p className="text-emerald-200 text-sm mt-1">
                    Check your inbox for a confirmation email from GearScope.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 border-emerald-500/50 text-emerald-300 hover:text-white hover:border-emerald-400 bg-transparent"
                    onClick={() => setSubmitted(false)}
                  >
                    Subscribe another email
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    required
                    disabled={loading}
                    className="bg-white/10 border-gray-600 text-white placeholder:text-gray-500 focus:border-amber-400 focus:ring-amber-400 h-12 disabled:opacity-50"
                  />
                  {error && (
                    <p className="text-red-400 text-xs mt-1">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-[#febd69] via-[#f3a847] to-[#febd69] hover:from-[#f3a847] hover:to-[#e8a23a] text-[#0f172a] font-bold h-12 px-6 shrink-0 disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-amber-500/20 rounded-lg cta-shimmer"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Subscribe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
            <p className="text-xs text-gray-500 mt-3 text-center lg:text-left">
              By subscribing, you agree to our privacy policy. We respect your inbox.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Browse All Categories Section ─────────────────────────────────────────
function BrowseAllCategoriesSection() {
  const goToCategory = useRouterStore((s) => s.goToCategory);

  const allCategoryIcons: Record<string, React.ReactNode> = {
    'travel-gear': <Luggage className="w-6 h-6" />,
    'travel-gadgets': <Zap className="w-6 h-6" />,
    'electronics': <Headphones className="w-6 h-6" />,
    'home-office': <Laptop className="w-6 h-6" />,
    'fitness': <Dumbbell className="w-6 h-6" />,
    'outdoor': <Mountain className="w-6 h-6" />,
    'audio': <Speaker className="w-6 h-6" />,
    'luggage': <MapPin className="w-6 h-6" />,
  };

  const allCategoryColors: Record<string, string> = {
    'travel-gear': 'from-teal-500 to-emerald-600',
    'travel-gadgets': 'from-sky-500 to-cyan-600',
    'electronics': 'from-violet-500 to-purple-600',
    'home-office': 'from-stone-500 to-stone-600',
    'fitness': 'from-rose-500 to-pink-600',
    'outdoor': 'from-emerald-500 to-green-600',
    'audio': 'from-amber-500 to-orange-600',
    'luggage': 'from-slate-500 to-slate-600',
  };

  return (
    <section id="all-categories" className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            <Compass className="w-7 h-7 inline-block text-amber-500 mr-2 -mt-1" />
            Browse All Categories
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Explore all {categories.length} product categories on GearScope
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 card-hover-lift rounded-xl"
              onClick={() => goToCategory(cat.slug)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${allCategoryColors[cat.slug] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {allCategoryIcons[cat.slug] || <Package className="w-6 h-6" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {cat.productCount} product{cat.productCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <HeroSection />
      <CategoriesSection />
      <EditorsPicksSection />
      <TrendingSection />
      <RecentlyUpdatedSection />
      <BuyingGuidesSection />
      <FeaturedBrandsSection />
      <TrustBlock />
      <TestimonialsSection />
      <BrowseAllCategoriesSection />
      <RecentlyViewedWidget />
      <NewsletterCTA />
    </div>
  );
}
