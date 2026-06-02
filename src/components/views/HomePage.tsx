'use client';

import React, { useState } from 'react';
import { useRouterStore } from '@/lib/router';
import { getBestSellers, getDeals, getRecentlyUpdated } from '@/data/products';
import { categories } from '@/data/categories';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { Disclosure } from '@/components/affiliate/Disclosure';
import { CheckPriceButton } from '@/components/affiliate/AffiliateLink';
import { StarRating } from '@/components/affiliate/RatingBar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Coffee,
  ShoppingBag,
  Star,
  ShieldCheck,
  Award,
  Microscope,
  HeartHandshake,
  Clock,
  ChevronRight,
  Mail,
  Percent,
  Flame,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Zap,
} from 'lucide-react';

// ─── Category icon map ──────────────────────────────────────────────────────
const categoryIcons: Record<string, React.ReactNode> = {
  'espresso-machines': <Coffee className="w-8 h-8" />,
  'coffee-grinders': <Zap className="w-8 h-8" />,
  'pour-over-drip': <BookOpen className="w-8 h-8" />,
  'kettles': <Flame className="w-8 h-8" />,
  'french-press': <Coffee className="w-8 h-8" />,
};

const categoryGradients: Record<string, string> = {
  'espresso-machines': 'from-amber-800 via-amber-700 to-yellow-800',
  'coffee-grinders': 'from-stone-700 via-stone-600 to-stone-500',
  'pour-over-drip': 'from-sky-800 via-sky-700 to-sky-600',
  'kettles': 'from-rose-800 via-rose-700 to-rose-600',
  'french-press': 'from-emerald-800 via-emerald-700 to-emerald-600',
};

// ─── Hero Banner ────────────────────────────────────────────────────────────
function HeroBanner() {
  const goToProduct = useRouterStore((s) => s.goToProduct);
  const bestSellers = getBestSellers();
  const featured = bestSellers[0]; // top-rated product

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-r from-[#131921] via-[#1a2f3e] to-[#232f3e]"
      style={{
        backgroundSize: '200% 200%',
        animation: 'gradientShift 8s ease infinite',
      }}
    >
      {/* Injected keyframes for animated gradient & floating beans */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes floatBean1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(15deg); }
        }
        @keyframes floatBean2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(-10deg); }
        }
        @keyframes floatBean3 {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50% { transform: translateY(-22px) rotate(-20deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(254, 189, 105, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(254, 189, 105, 0); }
        }
      `}</style>

      {/* Decorative floating coffee beans */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[8%] left-[6%] w-8 h-5 rounded-full bg-amber-700/15"
          style={{ animation: 'floatBean1 6s ease-in-out infinite' }}
        />
        <div
          className="absolute top-[18%] right-[12%] w-6 h-4 rounded-full bg-amber-600/10"
          style={{ animation: 'floatBean2 7s ease-in-out infinite 1s' }}
        />
        <div
          className="absolute bottom-[20%] left-[22%] w-7 h-4 rounded-full bg-amber-800/12"
          style={{ animation: 'floatBean3 8s ease-in-out infinite 0.5s' }}
        />
        <div
          className="absolute top-[40%] right-[30%] w-5 h-3 rounded-full bg-amber-700/8"
          style={{ animation: 'floatBean1 9s ease-in-out infinite 2s' }}
        />
        <div
          className="absolute bottom-[12%] right-[8%] w-9 h-5 rounded-full bg-amber-600/10"
          style={{ animation: 'floatBean2 7.5s ease-in-out infinite 1.5s' }}
        />
        {/* Original decorative circles */}
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white/5" />
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full border-2 border-white/5" />
        <div className="absolute bottom-10 left-1/4 w-20 h-20 rounded-full border-2 border-white/5" />
        <div className="absolute top-1/3 right-1/3 w-16 h-16 rounded-full border-2 border-white/5" />
        <div className="absolute bottom-20 right-10 w-28 h-28 rounded-full border border-white/5" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left">
            <Badge className="bg-[#febd69] text-[#131921] hover:bg-[#f3a847] text-sm font-semibold mb-5 px-3 py-1">
              <Star className="w-3 h-3 mr-1 fill-[#131921]" />
              #1 Rated Coffee Equipment Reviews
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-5">
              Find Your Perfect
              <span className="block text-[#febd69]">Coffee Setup</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Expert reviews, honest ratings, and side-by-side comparisons to help you brew better coffee at home.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              {/* Shop Now button with pulsing glow */}
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
                />
                <Button
                  onClick={() => featured && goToProduct(featured.slug)}
                  className="relative bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98] h-auto"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Shop Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="border-gray-500 text-gray-300 hover:text-white hover:border-white bg-transparent"
                onClick={() => {
                  const el = document.getElementById('top-picks');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See Top Picks
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Independent Reviews
              </span>
              <span className="flex items-center gap-1.5">
                <Microscope className="w-4 h-4 text-emerald-400" />
                Lab-Tested
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-400" />
                100+ Products
              </span>
            </div>
          </div>

          {/* Right visual — featured product card */}
          <div className="flex-shrink-0 w-full max-w-sm">
            {featured && (
              <Card className="bg-white/10 backdrop-blur-sm border border-white/20 text-white overflow-hidden shadow-2xl">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-emerald-500 text-white text-xs">Top Rated</Badge>
                    <Badge className="bg-[#febd69] text-[#131921] text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Best Seller
                    </Badge>
                  </div>
                  {/* Product image */}
                  <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-white/10">
                    {featured.image ? (
                      <img
                        src={featured.image}
                        alt={featured.title}
                        className="w-full h-full object-contain"
                        loading="eager"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-900/40 to-amber-700/40 flex items-center justify-center">
                        <Coffee className="w-16 h-16 text-amber-300/60" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-base leading-tight mb-2 line-clamp-2">{featured.title}</h3>
                  <StarRating rating={featured.rating} size="sm" showValue />
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#febd69]">{featured.price}</span>
                    {featured.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">{featured.originalPrice}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-2 line-clamp-2">{featured.excerpt}</p>
                  <Button
                    onClick={() => goToProduct(featured.slug)}
                    className="w-full mt-4 bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold"
                  >
                    Read Full Review
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="h-1 bg-gradient-to-r from-[#febd69] via-[#f90] to-[#febd69]" />
    </section>
  );
}

// ─── Product Categories Section ─────────────────────────────────────────────
function CategoriesSection() {
  const goToCategory = useRouterStore((s) => s.goToCategory);

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#131921]">Shop by Category</h2>
            <p className="text-gray-500 mt-1 text-sm">Find the right equipment for your brewing style</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Card
              key={cat.id}
              className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white"
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
                  {categoryIcons[cat.slug] || <Coffee className="w-8 h-8" />}
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm text-[#131921] group-hover:text-[#c7511f] transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                <div className="mt-2 flex items-center text-xs text-[#007185] font-medium group-hover:underline">
                  {cat.productCount} Products
                  <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Top Picks Section ──────────────────────────────────────────────────────
function TopPicksSection() {
  const bestSellers = getBestSellers();

  return (
    <section id="top-picks" className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#131921]">
              <Star className="w-7 h-7 inline-block text-[#f90] mr-2 -mt-1" />
              Top Picks for You
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Our highest-rated coffee equipment, tried and tested</p>
          </div>
        </div>

        <Disclosure />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {bestSellers.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
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
      title: 'Lab-Tested Reviews',
      description: 'Every product is hands-on tested in our coffee lab for at least 2 weeks before publishing.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
      title: 'Editorial Independence',
      description: 'Affiliate commissions never influence our ratings or rankings. Our opinions are our own.',
    },
    {
      icon: <Award className="w-8 h-8 text-emerald-600" />,
      title: 'Expert Reviewers',
      description: 'Our team includes certified baristas, coffee roasters, and equipment specialists.',
    },
    {
      icon: <HeartHandshake className="w-8 h-8 text-emerald-600" />,
      title: 'Honest & Transparent',
      description: 'We publish both pros and cons, and always disclose our affiliate relationships clearly.',
    },
  ];

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-[#eaeded] to-[#e3e6e6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#131921]">Why Trust Us?</h2>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto text-sm">
            We take our reviews seriously. Here&apos;s what sets BrewHub Reviews apart from other affiliate sites.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item, idx) => (
            <Card
              key={idx}
              className="border border-emerald-100 bg-white hover:shadow-lg transition-shadow text-center"
            >
              <CardContent className="p-6 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-bold text-[#131921] text-base mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Editorial Independence Statement */}
        <div className="mt-8 bg-white border border-emerald-200 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-[#131921] text-lg mb-2">Our Editorial Pledge</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                BrewHub Reviews operates with complete editorial independence. While we earn commissions through
                Amazon&apos;s affiliate program, this never affects which products we recommend or how we rate them.
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

// ─── Recently Updated Section ───────────────────────────────────────────────
function RecentlyUpdatedSection() {
  const recentlyUpdated = getRecentlyUpdated();
  const goToProduct = useRouterStore((s) => s.goToProduct);

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#131921]">
              <Clock className="w-7 h-7 inline-block text-[#007185] mr-2 -mt-1" />
              Recently Updated
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Fresh reviews and re-evaluations from our team</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentlyUpdated.slice(0, 6).map((product) => (
            <Card
              key={product.id}
              className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all border border-gray-200 bg-white"
              onClick={() => goToProduct(product.slug)}
            >
              <CardContent className="p-4 flex gap-4">
                {/* Product image */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-gray-50">
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
                    className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-200 items-center justify-center"
                    style={{ display: product.image ? 'none' : 'flex' }}
                  >
                    <Coffee className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {product.reviewStatus === 'updated' && (
                      <Badge className="bg-blue-100 text-blue-700 text-[10px] hover:bg-blue-100">Updated</Badge>
                    )}
                    {product.reviewStatus === 'verified' && (
                      <Badge className="bg-emerald-100 text-emerald-700 text-[10px] hover:bg-emerald-100">Verified</Badge>
                    )}
                    {product.reviewStatus === 'new' && (
                      <Badge className="bg-purple-100 text-purple-700 text-[10px] hover:bg-purple-100">New</Badge>
                    )}
                    <span className="text-[11px] text-gray-400">
                      {new Date(product.updatedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-[#131921] group-hover:text-[#c7511f] transition-colors line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  <StarRating rating={product.rating} size="sm" showValue />
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-bold text-gray-900">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{product.originalPrice}</span>
                    )}
                  </div>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-r from-[#232f3e] to-[#131921]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left flex-1">
            <Mail className="w-10 h-10 text-[#febd69] mx-auto lg:mx-0 mb-3" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Never Miss a Review
            </h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto lg:mx-0">
              Get our latest reviews, deals, and buying guides delivered straight to your inbox. No spam, unsubscribe anytime.
            </p>
          </div>

          <div className="w-full max-w-md">
            {submitted ? (
              <Card className="bg-emerald-900/30 border border-emerald-500/30">
                <CardContent className="p-6 text-center">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <h3 className="text-white font-bold text-lg">You&apos;re In!</h3>
                  <p className="text-emerald-200 text-sm mt-1">
                    Check your inbox for a confirmation email.
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
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-white/10 border-gray-600 text-white placeholder:text-gray-500 focus:border-[#febd69] focus:ring-[#febd69] h-12"
                />
                <Button
                  type="submit"
                  className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] font-bold h-12 px-6 shrink-0"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4 ml-2" />
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

// ─── Today's Deals Section ──────────────────────────────────────────────────
function DealsSection() {
  const deals = getDeals();
  const goToProduct = useRouterStore((s) => s.goToProduct);

  const calculateDiscount = (price: string, originalPrice: string): number => {
    const p = parseFloat(price.replace(/[^0-9.]/g, ''));
    const o = parseFloat(originalPrice.replace(/[^0-9.]/g, ''));
    if (o === 0 || isNaN(p) || isNaN(o)) return 0;
    return Math.round(((o - p) / o) * 100);
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#131921]">
              <Percent className="w-7 h-7 inline-block text-red-500 mr-2 -mt-1" />
              Today&apos;s Deals
            </h2>
            <p className="text-gray-500 mt-1 text-sm">Save big on top-rated coffee equipment</p>
          </div>
        </div>

        <Disclosure />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {deals.map((product) => {
            const discount = product.originalPrice
              ? calculateDiscount(product.price, product.originalPrice)
              : 0;

            return (
              <Card
                key={product.id}
                className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white"
              >
                {/* Deal image */}
                <div
                  className="relative cursor-pointer bg-gray-50 aspect-square overflow-hidden"
                  onClick={() => goToProduct(product.slug)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center p-4 group-hover:scale-105 transition-transform duration-500">
                      <div className="w-full h-full rounded-lg bg-gradient-to-br from-red-50 to-amber-50 flex items-center justify-center">
                        <Coffee className="w-14 h-14 text-amber-400" />
                      </div>
                    </div>
                  )}

                  {/* Discount badge */}
                  {discount > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-600 text-white hover:bg-red-700 text-sm font-bold px-2.5 py-1">
                      -{discount}%
                    </Badge>
                  )}

                  {/* Deal badge */}
                  <Badge className="absolute top-2 right-2 bg-[#f90] text-white hover:bg-[#e68a00] text-xs font-bold">
                    <Flame className="w-3 h-3 mr-1" />
                    Deal
                  </Badge>
                </div>

                <CardContent className="p-4">
                  <button
                    onClick={() => goToProduct(product.slug)}
                    className="text-xs text-[#007185] hover:text-[#c7511f] hover:underline mb-1 text-left"
                  >
                    {product.category}
                  </button>
                  <h3
                    className="font-semibold text-sm text-gray-900 leading-tight mb-2 cursor-pointer hover:text-[#c7511f] line-clamp-2"
                    onClick={() => goToProduct(product.slug)}
                  >
                    {product.title}
                  </h3>
                  <StarRating rating={product.rating} size="sm" />

                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-red-600">{product.price}</span>
                    <span className="text-sm text-gray-400 line-through">{product.originalPrice}</span>
                  </div>

                  {/* Savings amount */}
                  {product.originalPrice && (
                    <p className="text-xs text-emerald-700 font-medium mt-1">
                      {`You save $${(
                        parseFloat(product.originalPrice.replace(/[^0-9.]/g, '')) -
                        parseFloat(product.price.replace(/[^0-9.]/g, ''))
                      ).toFixed(2)}`}
                    </p>
                  )}

                  <div className="mt-3">
                    <Disclosure compact />
                    <CheckPriceButton asin={product.asin} size="sm" className="w-full mt-2" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Main HomePage Component ────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="bg-[#eaeded] min-h-screen">
      <HeroBanner />
      <CategoriesSection />
      <TopPicksSection />
      <TrustBlock />
      <RecentlyUpdatedSection />
      <NewsletterCTA />
      <DealsSection />
    </div>
  );
}
