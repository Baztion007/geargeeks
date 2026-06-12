'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Building2,
  Link2,
  Lock,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  Star,
  Clock,
  ArrowUpRight,
  Loader2,
  Database,
  LogOut,
  ShieldAlert,
  ShieldCheck,
  Eye,
  AlertTriangle,
  MessageSquare,
  KeyRound,
  Check,
  BookOpen,
} from 'lucide-react';
import { useRouterStore, type SimplePage } from '@/lib/router';
import { useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminTab = 'dashboard' | 'products' | 'categories' | 'brands' | 'blog' | 'affiliate' | 'messages';

const sidebarItems: { id: AdminTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'brands', label: 'Brands', icon: Building2 },
  { id: 'blog', label: 'Blog Posts', icon: BookOpen },
  { id: 'affiliate', label: 'Affiliate Settings', icon: Link2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

interface ProductItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  categorySlug: string;
  brand: string;
  brandSlug: string;
  rating: number;
  reviewStatus: string;
  updatedAt: string;
  asin: string;
  merchant: string;
  affiliateUrl: string;
  priceUrl: string;
}

// ─── Login Gate Component ──────────────────────────────────────────────────────
function AdminLoginGate() {
  const navigate = useRouterStore((s) => s.navigate);
  const { login, loginError, lockoutRemainingMs } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLocalError(null);

    const result = await login(password);
    if (!result.success) {
      setLocalError(result.error || 'Login failed');
    }
    setPassword('');
    setIsSubmitting(false);
  };

  const displayError = localError || loginError;
  const isLocked = !!lockoutRemainingMs && lockoutRemainingMs > 0;
  const lockoutMinutes = lockoutRemainingMs ? Math.ceil(lockoutRemainingMs / 60000) : 0;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="bg-gray-900 border-gray-800 shadow-2xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isLocked ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                <Lock size={28} className={isLocked ? 'text-red-500' : 'text-amber-500'} />
              </div>
              <h1 className="text-xl font-bold text-white">Admin Access</h1>
              <p className="text-sm text-gray-400 mt-1">
                {isLocked ? 'Account temporarily locked' : 'Enter the admin password to continue'}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLocalError(null); }}
                  placeholder="Password"
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                  autoFocus
                  disabled={isLocked || isSubmitting}
                />
                {displayError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <ShieldAlert size={12} />
                    {isLocked
                      ? `Locked for ${lockoutMinutes} minute${lockoutMinutes !== 1 ? 's' : ''} due to too many failed attempts.`
                      : displayError}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLocked || isSubmitting || !password}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-900 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Verifying...</>
                ) : isLocked ? (
                  <><Lock size={16} className="mr-2" /> Locked — Wait {lockoutMinutes}m</>
                ) : (
                  'Unlock Admin Panel'
                )}
              </Button>
            </form>

            {isLocked && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-xs text-center">
                  Security lockout active. Exponential backoff is in effect — each successive lockout doubles the wait time.
                </p>
              </div>
            )}

            <button
              onClick={() => navigate({ page: 'home' })}
              className="w-full text-center text-gray-500 hover:text-gray-300 text-sm mt-4 transition-colors"
            >
              ← Back to site
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Audit Log Card ────────────────────────────────────────────────────────────
function AuditLogCard({ token }: { token: string | null }) {
  const [logs, setLogs] = useState<Array<{ timestamp: number; ip: string; action: string; success: boolean; details?: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      const url = token ? `/api/admin/audit-log?token=${encodeURIComponent(token)}&limit=20` : '/api/admin/audit-log?limit=20';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const getActionColor = (action: string, success: boolean) => {
    if (action === 'LOGIN_SUCCESS') return 'text-emerald-400';
    if (action === 'LOGIN_FAILED' || action === 'LOGIN_LOCKED_OUT' || action === 'IP_BLOCKED') return 'text-red-400';
    if (action === 'LOGOUT') return 'text-blue-400';
    if (action === 'SESSION_INVALID') return 'text-amber-400';
    return success ? 'text-gray-400' : 'text-red-400';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('SUCCESS')) return <ShieldCheck size={12} className="text-emerald-400" />;
    if (action.includes('FAILED') || action.includes('LOCKED') || action.includes('BLOCKED')) return <AlertTriangle size={12} className="text-red-400" />;
    if (action.includes('LOGOUT')) return <LogOut size={12} className="text-blue-400" />;
    return <Eye size={12} className="text-gray-400" />;
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Eye size={16} className="text-amber-500" />
            Audit Log
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs h-6 px-2" onClick={fetchLogs}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 size={16} className="text-amber-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No activity recorded yet</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {logs.slice().reverse().map((log, i) => (
              <div key={i} className="flex items-start gap-2 text-xs py-1.5 border-b border-gray-800/50 last:border-0">
                {getActionIcon(log.action)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${getActionColor(log.action, log.success)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className="text-gray-600 text-[10px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-500 text-[10px]">
                    IP: {log.ip}
                    {log.details && ` · ${log.details}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Change Password Card ────────────────────────────────────────────────────
function ChangePasswordCard() {
  const { token, logout } = useAdminAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (newPassword !== confirmPassword) {
      setResult({ success: false, message: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setResult({ success: false, message: 'New password must be at least 8 characters' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          token,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({ success: true, message: 'Password updated successfully! Use your new password next time you log in.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setResult({ success: false, message: data.error || 'Failed to change password' });
      }
    } catch {
      setResult({ success: false, message: 'Network error — the server may still be starting up, please try again in a moment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <KeyRound size={16} className="text-amber-500" />
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Current Password</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => { setCurrentPassword(e.target.value); setResult(null); }}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20 h-9 text-sm"
              placeholder="Enter current password"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setResult(null); }}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20 h-9 text-sm"
              placeholder="Min. 8 characters"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Confirm New Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setResult(null); }}
              className={`bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20 h-9 text-sm ${
                confirmPassword && newPassword && confirmPassword !== newPassword ? 'border-red-500 focus:border-red-500' : ''
              }`}
              placeholder="Repeat new password"
              disabled={isSubmitting}
              required
            />
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <p className="text-red-400 text-[11px] mt-1">Passwords do not match</p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm h-9"
          >
            {isSubmitting ? (
              <><Loader2 size={14} className="mr-1 animate-spin" /> Updating...</>
            ) : (
              <><KeyRound size={14} className="mr-1" /> Change Password</>
            )}
          </Button>
          {result && (
            <div className={`p-2.5 rounded-lg text-xs flex items-start gap-2 ${
              result.success
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {result.success ? <Check size={14} className="mt-0.5 shrink-0" /> : <AlertTriangle size={14} className="mt-0.5 shrink-0" />}
              {result.message}
            </div>
          )}
          <p className="text-[10px] text-gray-500 leading-relaxed">
            ⚡ Password changes take effect immediately. On Cloudflare Workers, the password resets to the ADMIN_PASSWORD env var on redeployment. Set ADMIN_PASSWORD in your Cloudflare dashboard for a persistent password.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main Admin Page (authenticated) ──────────────────────────────────────────
function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useRouterStore((s) => s.navigate);
  const goToPage = useRouterStore((s) => s.goToPage);
  const { logout } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    brands: 0,
    avgRating: 0,
    blogs: 0,
    customLinks: 0,
    noAsin: 0,
  });
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [updatedCount, setUpdatedCount] = useState(0);
  const [recentProducts, setRecentProducts] = useState<ProductItem[]>([]);

  const fetchStats = useCallback(async () => {
    try {
      const [productsRes, categoriesRes, brandsRes, blogRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/brands'),
        fetch('/api/blog'),
      ]);

      const productsData = productsRes.ok ? await productsRes.json() : { products: [] };
      const categoriesData = categoriesRes.ok ? await categoriesRes.json() : { categories: [] };
      const brandsData = brandsRes.ok ? await brandsRes.json() : { brands: [] };
      const blogData = blogRes.ok ? await blogRes.json() : { posts: [] };

      const products: ProductItem[] = productsData.products || [];
      const categories = categoriesData.categories || [];
      const brands = brandsData.brands || [];
      const blogs = blogData.posts || [];

      const avgRating = products.length > 0
        ? (products.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / products.length).toFixed(1)
        : '0';

      const customLinks = products.filter((p: any) => p.affiliateUrl || p.priceUrl).length;
      const noAsin = products.filter((p: any) => !p.asin).length;

      setStats({
        products: products.length,
        categories: categories.length,
        brands: brands.length,
        avgRating: parseFloat(avgRating),
        blogs: blogs.length,
        customLinks,
        noAsin,
      });

      setVerifiedCount(products.filter((p: any) => p.reviewStatus === 'verified').length);
      setUpdatedCount(products.filter((p: any) => p.reviewStatus === 'updated').length);
      setRecentProducts(
        [...products]
          .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
      );
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleTabChange = (tab: AdminTab) => {
    setSidebarOpen(false);
    const pageMap: Record<AdminTab, SimplePage> = {
      dashboard: 'admin',
      products: 'admin-products',
      categories: 'admin-categories',
      brands: 'admin-brands',
      blog: 'admin-blog',
      affiliate: 'admin-affiliate',
      messages: 'admin-messages',
    };
    goToPage(pageMap[tab]);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSeedResult(`Seeded ${data.totalSeeded} items (${data.result?.products?.seeded || 0} products, ${data.result?.categories?.seeded || 0} categories, ${data.result?.brands?.seeded || 0} brands)`);
        fetchStats();
      } else {
        const data = await res.json();
        setSeedResult(`Error: ${data.error || 'Failed to seed'}`);
      }
    } catch {
      setSeedResult('Error: Failed to connect to seed API');
    } finally {
      setSeeding(false);
    }
  };

  const totalProducts = stats.products;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Lock size={16} className="text-amber-500" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Admin Panel</h2>
              <span className="text-[10px] text-gray-400">GearGeekz</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-800 rounded" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'dashboard'; // AdminPage only renders on dashboard route
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-amber-500' : ''} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto text-amber-500" />}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 space-y-2">
          <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-white" onClick={() => navigate({ page: 'home' })}>
            ← Back to Site
          </Button>
          <Button variant="ghost" size="sm" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { logout(); navigate({ page: 'home' }); }}>
            <LogOut size={14} className="mr-1" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              <Lock size={10} className="mr-1" />
              Admin
            </Badge>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => { logout(); navigate({ page: 'home' }); }}>
              <LogOut size={14} className="mr-1" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Dashboard content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-gray-900 border-gray-800">
                    <CardContent className="p-4 sm:p-6">
                      <div className="h-4 w-16 bg-gray-800 rounded animate-pulse mb-2" />
                      <div className="h-8 w-12 bg-gray-800 rounded animate-pulse mb-1" />
                      <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Package size={20} className="text-amber-500" />
                      <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400">Total</Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.products}</p>
                    <p className="text-sm text-gray-400 mt-1">Products</p>
                    {stats.noAsin > 0 && <p className="text-[10px] text-amber-400 mt-0.5">{stats.noAsin} missing ASIN</p>}
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <FolderOpen size={20} className="text-amber-500" />
                      <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400">Active</Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.categories}</p>
                    <p className="text-sm text-gray-400 mt-1">Categories</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Building2 size={20} className="text-amber-500" />
                      <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400">Partners</Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.brands}</p>
                    <p className="text-sm text-gray-400 mt-1">Brands</p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Star size={20} className="text-amber-500" />
                      <Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400">Avg</Badge>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.avgRating}</p>
                    <p className="text-sm text-gray-400 mt-1">Avg Rating</p>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                      <BookOpen size={18} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{stats.blogs}</p>
                      <p className="text-xs text-gray-400">Blog Posts</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                      <Link2 size={18} className="text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{stats.customLinks}</p>
                      <p className="text-xs text-gray-400">Custom Affiliate Links</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center shrink-0">
                      <TrendingUp size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{stats.products > 0 ? Math.round((verifiedCount / stats.products) * 100) : 0}%</p>
                      <p className="text-xs text-gray-400">Verified Reviews</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Review Status Breakdown */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <TrendingUp size={16} className="text-amber-500" />
                      Review Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Verified</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: totalProducts > 0 ? `${(verifiedCount / totalProducts) * 100}%` : '0%' }} />
                          </div>
                          <span className="text-sm font-medium text-white w-8 text-right">{verifiedCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Updated</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: totalProducts > 0 ? `${(updatedCount / totalProducts) * 100}%` : '0%' }} />
                          </div>
                          <span className="text-sm font-medium text-white w-8 text-right">{updatedCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">New</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: totalProducts > 0 ? `${((totalProducts - verifiedCount - updatedCount) / totalProducts) * 100}%` : '0%' }} />
                          </div>
                          <span className="text-sm font-medium text-white w-8 text-right">{totalProducts - verifiedCount - updatedCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1 bg-gray-800/50 border-gray-700 hover:border-amber-500/50 hover:bg-gray-800" onClick={() => handleTabChange('products')}>
                        <Package size={18} className="text-amber-500" />
                        <span className="text-xs">Add Product</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1 bg-gray-800/50 border-gray-700 hover:border-amber-500/50 hover:bg-gray-800" onClick={() => handleTabChange('categories')}>
                        <FolderOpen size={18} className="text-amber-500" />
                        <span className="text-xs">Add Category</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1 bg-gray-800/50 border-gray-700 hover:border-amber-500/50 hover:bg-gray-800" onClick={() => handleTabChange('brands')}>
                        <Building2 size={18} className="text-amber-500" />
                        <span className="text-xs">Add Brand</span>
                      </Button>
                      <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1 bg-gray-800/50 border-gray-700 hover:border-amber-500/50 hover:bg-gray-800" onClick={() => handleTabChange('messages')}>
                        <MessageSquare size={18} className="text-amber-500" />
                        <span className="text-xs">Messages</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-3 flex flex-col items-center gap-1 bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 hover:bg-amber-500/20"
                        onClick={handleSeed}
                        disabled={seeding}
                      >
                        {seeding ? <Loader2 size={18} className="text-amber-500 animate-spin" /> : <Database size={18} className="text-amber-500" />}
                        <span className="text-xs">{seeding ? 'Seeding...' : 'Seed Database'}</span>
                      </Button>
                    </div>
                    {seedResult && (
                      <div className={`mt-3 p-2 rounded-lg text-xs ${seedResult.startsWith('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                        {seedResult}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recently Updated */}
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Clock size={16} className="text-amber-500" />
                      Recently Updated Products
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-400 text-xs" onClick={() => handleTabChange('products')}>
                      View All <ArrowUpRight size={12} className="ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentProducts.length === 0 ? (
                    <div className="text-center py-6">
                      <Package size={32} className="mx-auto text-gray-600 mb-2" />
                      <p className="text-gray-400 text-sm">No products yet. Seed the database to get started.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-800">
                            <th className="text-left py-2 pr-4 text-gray-400 font-medium">Product</th>
                            <th className="text-left py-2 pr-4 text-gray-400 font-medium">Category</th>
                            <th className="text-left py-2 pr-4 text-gray-400 font-medium">Rating</th>
                            <th className="text-left py-2 text-gray-400 font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentProducts.map((product) => (
                            <tr key={product.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                              <td className="py-2.5 pr-4">
                                <div className="flex items-center gap-2">
                                  {product.image && (
                                    <div className="w-8 h-8 rounded bg-gray-800 overflow-hidden shrink-0">
                                      <img src={product.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <span className="text-white font-medium truncate max-w-[200px]">{product.title}</span>
                                </div>
                              </td>
                              <td className="py-2.5 pr-4 text-gray-400">{product.category}</td>
                              <td className="py-2.5 pr-4">
                                <div className="flex items-center gap-1">
                                  <Star size={12} className="text-amber-500 fill-amber-500" />
                                  <span className="text-white">{product.rating}</span>
                                </div>
                              </td>
                              <td className="py-2.5">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    product.reviewStatus === 'verified' ? 'border-green-500/30 text-green-400'
                                      : product.reviewStatus === 'updated' ? 'border-amber-500/30 text-amber-400'
                                        : 'border-blue-500/30 text-blue-400'
                                  }`}
                                >
                                  {product.reviewStatus}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Security, Password & Audit Log */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <ShieldCheck size={16} className="text-emerald-400" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Server-side Auth</span>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Rate Limiting</span>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">5 attempts</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Lockout Policy</span>
                        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">Exponential</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Idle Timeout</span>
                        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">30 min</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Session Duration</span>
                        <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 text-[10px]">4 hours</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Session Encryption</span>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">AES-256</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">IP Allowlist</span>
                        <Badge className="bg-gray-500/15 text-gray-400 border-gray-500/30 text-[10px]">Open</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Timing Attack Protection</span>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">httpOnly Cookie</span>
                        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">Enabled</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ChangePasswordCard />
                <AuditLogCard token={useAdminAuth.getState().token} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Exported Admin Page (with auth gate) ──────────────────────────────────────
export function AdminPage() {
  const { isAuthenticated, isChecking, checkSession } = useAdminAuth();

  useEffect(() => { checkSession(); }, [checkSession]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginGate />;
  }

  return <AdminDashboard />;
}
