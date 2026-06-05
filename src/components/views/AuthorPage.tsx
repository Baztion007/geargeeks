'use client';

import React, { useState } from 'react';
import { Breadcrumbs } from '@/components/affiliate/Breadcrumbs';
import { ProductCard } from '@/components/affiliate/ProductCard';
import { getAuthorBySlug } from '@/data/authors';
import { products } from '@/data/products';
import { useRouterStore } from '@/lib/router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  BookOpen,
  Star,
  Twitter,
  Linkedin,
  ExternalLink,
  Mail,
  Award,
  Package,
  Send,
  BarChart3,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Skill bar data — maps expertise areas to proficiency percentages
const expertiseLevels: Record<string, number> = {
  'Travel Gear': 95,
  'Electronics': 90,
  'Audio': 88,
  'Fitness': 85,
  'Home Office': 92,
  'Outdoor': 80,
  'Luggage': 87,
  'Travel Gadgets': 93,
};

// Contact form storage
const CONTACT_MESSAGES_KEY = 'geargeekz-contact-messages';

interface ContactMessage {
  authorSlug: string;
  name: string;
  email: string;
  message: string;
  timestamp: number;
}

function ContactAuthorDialog({ authorSlug, authorName }: { authorSlug: string; authorName: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const msg: ContactMessage = {
      authorSlug,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      timestamp: Date.now(),
    };

    try {
      const existing: ContactMessage[] = JSON.parse(localStorage.getItem(CONTACT_MESSAGES_KEY) || '[]');
      existing.push(msg);
      localStorage.setItem(CONTACT_MESSAGES_KEY, JSON.stringify(existing));

      toast({ title: 'Message sent!', description: `Your message to ${authorName} has been saved.` });
      setName('');
      setEmail('');
      setMessage('');
      setIsOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to send message. Please try again.', variant: 'destructive' });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold w-full">
          <Mail size={14} className="mr-2" />
          Contact Author
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail size={18} className="text-amber-500" />
            Contact {authorName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div>
            <label htmlFor="contact-name" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Your Name
            </label>
            <input
              id="contact-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="contact-email" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Your Email
            </label>
            <input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              maxLength={100}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Message
            </label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write a message for ${authorName}...`}
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-colors resize-none"
            />
            <p className="text-[10px] text-gray-400 mt-1 text-right">{message.length}/1000</p>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Send size={14} />
                Send Message
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AuthorPageProps {
  authorSlug: string;
}

export function AuthorPage({ authorSlug }: AuthorPageProps) {
  const navigate = useRouterStore((s) => s.navigate);

  const author = getAuthorBySlug(authorSlug);

  if (!author) {
    return (
      <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Author Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The author you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => navigate({ page: 'home' } as any)} className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921]">
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const authorProducts = products.filter((p) => p.authorSlug === authorSlug);
  const avgRating =
    authorProducts.length > 0
      ? authorProducts.reduce((sum, p) => sum + p.rating, 0) / authorProducts.length
      : 0;

  // Get the latest 5 reviewed products (sorted by updated date)
  const recentReviews = [...authorProducts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Categories covered
  const categoriesCovered = Array.from(new Set(authorProducts.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-[#eaeded] dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <Breadcrumbs items={[{ label: author.name }]} />

        {/* Author Hero */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#131921] to-[#37475a] p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Author photo placeholder */}
              <div className="w-28 h-28 shrink-0 rounded-full bg-white/10 border-4 border-[#febd69] flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {author.photo ? (
                  <img src={author.photo} alt={author.name} className="w-full h-full object-cover" />
                ) : (
                  author.name.split(' ').map((n) => n[0]).join('')
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{author.name}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                  <Badge className="bg-[#febd69] text-[#131921] hover:bg-[#f3a847]">
                    <BookOpen size={12} className="mr-1" />
                    {author.reviewCount} Reviews
                  </Badge>
                  <Badge className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30">
                    <Star size={12} className="mr-1 fill-current" />
                    {avgRating.toFixed(1)} Avg Rating
                  </Badge>
                  <Badge className="bg-white/10 text-white hover:bg-white/20">
                    <Award size={12} className="mr-1" />
                    Verified Reviewer
                  </Badge>
                </div>
                {/* Social media links */}
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#1da1f2] transition-colors flex items-center gap-1.5 text-sm group"
                    aria-label={`${author.name} on Twitter`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-sky-500/10 flex items-center justify-center transition-colors">
                      <Twitter size={16} />
                    </div>
                    <span className="hidden sm:inline">Twitter</span>
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#0077b5] transition-colors flex items-center gap-1.5 text-sm group"
                    aria-label={`${author.name} on LinkedIn`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center transition-colors">
                      <Linkedin size={16} />
                    </div>
                    <span className="hidden sm:inline">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Full Biography */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-[#c7511f]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About {author.name.split(' ')[0]}</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{author.bio}</p>
            </div>

            {/* Expertise Areas with Skill Bars */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Expertise Areas</h2>
              </div>
              <div className="space-y-4">
                {author.expertise.map((exp) => {
                  const level = expertiseLevels[exp] ?? 75;
                  return (
                    <div key={exp}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{exp}</span>
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{level}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 ease-out shadow-sm shadow-amber-500/20"
                          style={{ width: `${level}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-amber-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Recent Reviews
                </h2>
              </div>
              {recentReviews.length > 0 ? (
                <div className="space-y-3">
                  {recentReviews.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => navigate({ page: 'product', slug: product.slug } as any)}
                      className="block w-full text-left group"
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
                        <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                          {product.image ? (
                            <img src={product.image} alt={product.title} className="w-full h-full object-contain p-1" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#c7511f] transition-colors line-clamp-1">
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-amber-600 font-medium">★ {product.rating.toFixed(1)}</span>
                            <span className="text-[10px] text-gray-400">·</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{product.category}</span>
                            <span className="text-[10px] text-gray-400">·</span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">
                              {new Date(product.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                          {product.bestFor.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {product.bestFor.slice(0, 2).map((bf) => (
                                <Badge key={bf} className="text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 px-1 py-0">
                                  {bf}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <ExternalLink size={14} className="text-gray-300 dark:text-gray-500 group-hover:text-amber-500 transition-colors shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No recent reviews yet.
                </p>
              )}
            </div>

            {/* Published Reviews */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-[#c7511f]" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Published Reviews ({authorProducts.length})
                </h2>
              </div>
              {authorProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {authorProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No published reviews yet.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-amber-500" />
                  Author Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</span>
                    <span className="font-bold text-gray-900 dark:text-white">{authorProducts.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg Rating Given</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{avgRating.toFixed(1)} ★</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Categories Covered</span>
                    <span className="font-bold text-gray-900 dark:text-white">{categoriesCovered.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Verified Reviews</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {authorProducts.filter((p) => p.reviewStatus === 'verified').length}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Highest Rated</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {authorProducts.length > 0 ? Math.max(...authorProducts.map((p) => p.rating)).toFixed(1) : '0'} ★
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Brands Reviewed</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {new Set(authorProducts.map((p) => p.brand)).size}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Categories Reviewed */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Categories Reviewed</h3>
                <div className="space-y-2">
                  {categoriesCovered.map((category) => {
                    const catProduct = authorProducts.find((p) => p.category === category);
                    return (
                      <button
                        key={category}
                        onClick={() => catProduct && navigate({ page: 'category', slug: catProduct.categorySlug } as any)}
                        className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-[#c7511f]">{category}</span>
                        <span className="text-xs text-gray-400">
                          {authorProducts.filter((p) => p.category === category).length} review{authorProducts.filter((p) => p.category === category).length !== 1 ? 's' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Contact Author CTA */}
            <Card className="border border-gray-200 bg-gradient-to-br from-[#131921] to-[#37475a]">
              <CardContent className="p-6 text-center">
                <Mail className="w-8 h-8 text-[#febd69] mx-auto mb-3" />
                <h3 className="font-bold text-white mb-2">Get in Touch</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Have a question for {author.name.split(' ')[0]}?
                </p>
                <ContactAuthorDialog authorSlug={authorSlug} authorName={author.name} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
