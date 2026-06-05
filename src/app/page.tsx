'use client';

import React, { useEffect } from 'react';
import { Package } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouterStore, hashToRoute } from '@/lib/router';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BackToTop } from '@/components/affiliate/Breadcrumbs';
import { generateOrganizationJsonLd } from '@/lib/affiliate';

// View imports
import HomePage from '@/components/views/HomePage';
import ProductDetailPage from '@/components/views/ProductDetailPage';
import { CategoryPage } from '@/components/views/CategoryPage';
import { SearchPage } from '@/components/views/SearchPage';
import { BuyingGuidePage } from '@/components/views/BuyingGuidePage';
import { AuthorPage } from '@/components/views/AuthorPage';
import { AboutPage } from '@/components/views/AboutPage';
import { ContactPage } from '@/components/views/ContactPage';
import { PrivacyPage } from '@/components/views/PrivacyPage';
import { TermsPage } from '@/components/views/TermsPage';
import { EditorialPolicyPage } from '@/components/views/EditorialPolicyPage';
import { HowWeTestPage } from '@/components/views/HowWeTestPage';
import { WishlistPage } from '@/components/views/WishlistPage';
import { ComparePage } from '@/components/views/ComparePage';
import { BlogPage } from '@/components/views/BlogPage';
import { BlogPostPage } from '@/components/views/BlogPostPage';
import { GuidesPage } from '@/components/views/GuidesPage';
import { RoundupsPage } from '@/components/views/RoundupsPage';
import { BrandPage } from '@/components/views/BrandPage';
import { TrendingPage } from '@/components/views/TrendingPage';
import { BookmarksPage } from '@/components/views/BookmarksPage';
import { GearFinderQuiz } from '@/components/affiliate/GearFinderQuiz';
import { AffiliateSettingsPage } from '@/components/views/AffiliateSettingsPage';
import { AdminPage } from '@/components/views/AdminPage';
import { AdminProductsPage, AdminCategoriesPage, AdminBrandsPage, AdminAffiliatePage } from '@/components/views/AdminSubPages';
import { CompareBar } from '@/components/affiliate/CompareBar';
import { useThemeStore } from '@/lib/theme';
import { MobileCompareFab } from '@/components/affiliate/MobileCompareFab';
import { ReadingProgressBar } from '@/components/affiliate/ReadingProgressBar';
import { KeyboardShortcuts } from '@/components/affiliate/KeyboardShortcuts';
import { BackToTopButton } from '@/components/affiliate/BackToTopButton';

export default function Home() {
  const route = useRouterStore((s) => s.route);
  const navigate = useRouterStore((s) => s.navigate);

  // Initialize theme on mount
  useEffect(() => {
    const { theme, _resolveTheme, _applyTheme } = useThemeStore.getState();
    const resolved = _resolveTheme(theme);
    _applyTheme(resolved);
  }, []);

  // Handle browser back/forward and initial hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const newRoute = hashToRoute(hash);
      navigate(newRoute);
    };

    // Initial route from hash
    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate]);

  // Render the appropriate view based on route
  const renderView = () => {
    switch (route.page) {
      case 'home':
        return <HomePage />;
      case 'product':
        return <ProductDetailPage productSlug={route.slug} />;
      case 'category':
        return <CategoryPage categorySlug={route.slug} />;
      case 'brand':
        return <BrandPage brandSlug={route.slug} />;
      case 'search':
        return <SearchPage query={route.query} />;
      case 'buying-guide':
        return <BuyingGuidePage guideSlug={route.slug} />;
      case 'author':
        return <AuthorPage authorSlug={route.slug} />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'terms':
        return <TermsPage />;
      case 'editorial-policy':
        return <EditorialPolicyPage />;
      case 'how-we-test':
        return <HowWeTestPage />;
      case 'trending':
        return <TrendingPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'compare':
        return <ComparePage />;
      case 'roundups':
        return <RoundupsPage />;
      case 'blog':
        return <BlogPage />;
      case 'blog-post':
        return <BlogPostPage postSlug={route.slug} />;
      case 'guides':
        return <GuidesPage />;
      case 'bookmarks':
        return <BookmarksPage />;
      case 'gear-finder':
        return <GearFinderQuiz />;
      case 'affiliate-settings':
        return <AffiliateSettingsPage />;
      case 'admin':
        return <AdminPage />;
      case 'admin-products':
        return <AdminProductsPage />;
      case 'admin-categories':
        return <AdminCategoriesPage />;
      case 'admin-brands':
        return <AdminBrandsPage />;
      case 'admin-affiliate':
        return <AdminAffiliatePage />;
      case 'not-found':
        return <NotFoundPage />;
      default:
        return <HomePage />;
    }
  };

  // Check if current page is an admin page
  const isAdminPage = route.page === 'admin' || route.page === 'admin-products' || route.page === 'admin-categories' || route.page === 'admin-brands' || route.page === 'admin-affiliate';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* JSON-LD Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationJsonLd()),
        }}
      />

      {!isAdminPage && <ReadingProgressBar />}
      {!isAdminPage && <Header />}

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={route.page === 'product' ? `product-${route.slug}` : route.page === 'category' ? `cat-${route.slug}` : route.page === 'brand' ? `brand-${route.slug}` : route.page === 'search' ? `search-${route.query}` : route.page === 'blog-post' ? `blog-${route.slug}` : route.page === 'buying-guide' ? `guide-${route.slug}` : route.page}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isAdminPage && <Footer />}
      {!isAdminPage && <BackToTop />}
      {!isAdminPage && <BackToTopButton />}
      {!isAdminPage && <CompareBar />}
      {!isAdminPage && <MobileCompareFab />}
      {!isAdminPage && <KeyboardShortcuts />}
    </div>
  );
}

function NotFoundPage() {
  const goHome = useRouterStore((s) => s.goHome);

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-xl p-12 shadow-sm">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <Package size={32} className="text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          We couldn&apos;t find the page you&apos;re looking for. Let us help you find your way back.
        </p>
        <button
          onClick={goHome}
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#0f172a] font-bold px-8 py-3 rounded-lg transition-all hover:shadow-lg"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
}
