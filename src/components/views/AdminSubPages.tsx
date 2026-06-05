'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  FolderOpen,
  Building2,
  Link2,
  Lock,
  ChevronRight,
  Menu,
  X,
  Star,
  Loader2,
  Upload,
  ImagePlus,
  MessageSquare,
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useRouterStore, type SimplePage } from '@/lib/router';
import { useAdminAuth } from '@/lib/admin-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AffiliateSettingsPage } from '@/components/views/AffiliateSettingsPage';

// ── Types ────────────────────────────────────────────────────────────────────

interface ProductItem {
  id: string;
  slug: string;
  title: string;
  image: string;
  gallery: string[];
  excerpt: string;
  category: string;
  categorySlug: string;
  subcategory: string;
  brand: string;
  brandSlug: string;
  features: Record<string, string>;
  pros: string[];
  cons: string[];
  rating: number;
  ratingBreakdown: Record<string, number>;
  asin: string;
  merchant: string;
  tags: string[];
  updatedAt: string;
  publishedAt: string;
  authorSlug: string;
  reviewStatus: string;
  bestFor: string[];
  summary: string;
  fullReview: string;
  whoIsItFor: string;
  whoShouldSkip: string;
  specifications: Record<string, string>;
  relatedProducts: string[];
}

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  featured: boolean;
}

interface BrandItem {
  slug: string;
  name: string;
  logo: string;
  description: string;
  founded?: string;
  headquarters?: string;
  website?: string;
  categories: string[];
  productCount: number;
}

type AdminTab = 'dashboard' | 'products' | 'categories' | 'brands' | 'affiliate' | 'messages';

const sidebarItems: { id: AdminTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Lock },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'brands', label: 'Brands', icon: Building2 },
  { id: 'affiliate', label: 'Affiliate Settings', icon: Link2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

// Auth guard for admin sub-pages
function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isChecking, checkSession } = useAdminAuth();
  const navigate = useRouterStore((s) => s.navigate);

  useEffect(() => { checkSession(); }, [checkSession]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate({ page: 'admin' });
    return null;
  }

  return <>{children}</>;
}

export function AdminProductsPage() {
  return <AdminAuthGuard><AdminShell activeTab="products" /></AdminAuthGuard>;
}

export function AdminCategoriesPage() {
  return <AdminAuthGuard><AdminShell activeTab="categories" /></AdminAuthGuard>;
}

export function AdminBrandsPage() {
  return <AdminAuthGuard><AdminShell activeTab="brands" /></AdminAuthGuard>;
}

export function AdminAffiliatePage() {
  return <AdminAuthGuard><AdminShell activeTab="affiliate" /></AdminAuthGuard>;
}

export function AdminMessagesPage() {
  return <AdminAuthGuard><AdminShell activeTab="messages" /></AdminAuthGuard>;
}

function AdminShell({ activeTab }: { activeTab: AdminTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useRouterStore((s) => s.navigate);
  const goToPage = useRouterStore((s) => s.goToPage);

  const handleTabChange = (tab: AdminTab) => {
    const pageMap: Record<AdminTab, SimplePage> = {
      dashboard: 'admin',
      products: 'admin-products',
      categories: 'admin-categories',
      brands: 'admin-brands',
      affiliate: 'admin-affiliate',
      messages: 'admin-messages',
    };
    goToPage(pageMap[tab]);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
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
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200 border border-transparent'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-amber-500' : ''} />
                {item.label}
                {isActive && <ChevronRight size={14} className="ml-auto text-amber-500" />}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <Button variant="ghost" size="sm" className="w-full text-gray-400 hover:text-white" onClick={() => navigate({ page: 'home' })}>
            ← Back to Site
          </Button>
        </div>
      </aside>
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-800 rounded-lg" aria-label="Open sidebar">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              <Lock size={10} className="mr-1" />
              Admin
            </Badge>
            <h1 className="text-lg font-semibold capitalize">
              {activeTab === 'affiliate' ? 'Affiliate Settings' : activeTab === 'messages' ? 'Contact Messages' : activeTab}
            </h1>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {activeTab === 'products' && <ProductsContent />}
          {activeTab === 'categories' && <CategoriesContent />}
          {activeTab === 'brands' && <BrandsContent />}
          {activeTab === 'affiliate' && (
            <div className="dark">
              <AffiliateSettingsPage />
            </div>
          )}
          {activeTab === 'messages' && <MessagesContent />}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loaders ─────────────────────────────────────────────────────────

function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-800 rounded animate-pulse flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Products Content ─────────────────────────────────────────────────────────

function ProductsContent() {
  const navigate = useRouterStore((s) => s.navigate);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);
  const ITEMS_PER_PAGE = 20;

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/brands'),
      ]);
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = products.filter((p) => {
    const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase()) || p.asin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.categorySlug === filterCategory;
    const matchesBrand = filterBrand === 'all' || p.brandSlug === filterBrand;
    const matchesStatus = filterStatus === 'all' || p.reviewStatus === filterStatus;
    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(paginated.map((p) => p.id)));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: deleteTarget.slug }) });
      fetchData();
    } catch { /* */ }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-48 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <TableSkeleton rows={6} cols={8} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 w-48" />
          <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500">
            <option value="all">All Categories</option>
            {categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}
          </select>
          <select value={filterBrand} onChange={(e) => { setFilterBrand(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500">
            <option value="all">All Brands</option>
            {brands.map((b) => (<option key={b.slug} value={b.slug}>{b.name}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500">
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="updated">Updated</option>
            <option value="new">New</option>
          </select>
        </div>
        <Button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="bg-amber-500 hover:bg-amber-400 text-black font-medium">
          <Package size={16} className="mr-1.5" /> Add Product
        </Button>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-sm text-amber-400">{selectedIds.size} selected</span>
          <Button variant="destructive" size="sm" onClick={() => setSelectedIds(new Set())}>Delete Selected</Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())} className="text-gray-400">Clear</Button>
        </div>
      )}

      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium"><input type="checkbox" checked={paginated.length > 0 && selectedIds.size === paginated.length} onChange={toggleSelectAll} className="rounded border-gray-600 bg-gray-800" /></th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Image</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Title</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Brand</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Rating</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Merchant</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9} className="py-8 text-center text-gray-500">No products found. Seed the database or add a product.</td></tr>
              ) : (
                paginated.map((product, idx) => (
                  <tr key={product.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? 'bg-gray-900/30' : ''} ${selectedIds.has(product.id) ? 'bg-amber-500/5' : ''}`}>
                    <td className="py-2.5 px-4"><input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} className="rounded border-gray-600 bg-gray-800" /></td>
                    <td className="py-2.5 px-4"><div className="w-10 h-10 rounded bg-gray-800 overflow-hidden">{product.image ? <img src={product.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-gray-600" /></div>}</div></td>
                    <td className="py-2.5 px-4"><button onClick={() => navigate({ page: 'product', slug: product.slug })} className="text-white font-medium hover:text-amber-400 transition-colors text-left max-w-[200px] truncate block">{product.title}</button><span className="text-xs text-gray-500 font-mono">{product.asin}</span></td>
                    <td className="py-2.5 px-4 text-gray-400">{product.category}</td>
                    <td className="py-2.5 px-4 text-gray-400">{product.brand}</td>
                    <td className="py-2.5 px-4"><div className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-white">{product.rating}</span></div></td>
                    <td className="py-2.5 px-4"><Badge variant="outline" className="text-[10px] border-gray-700 text-gray-400 capitalize">{product.merchant}</Badge></td>
                    <td className="py-2.5 px-4"><Badge variant="outline" className={`text-[10px] ${product.reviewStatus === 'verified' ? 'border-green-500/30 text-green-400' : product.reviewStatus === 'updated' ? 'border-amber-500/30 text-amber-400' : 'border-blue-500/30 text-blue-400'}`}>{product.reviewStatus}</Badge></td>
                    <td className="py-2.5 px-4"><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-amber-400" onClick={() => { setEditingProduct(product); setShowForm(true); }}>Edit</Button><Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-red-400" onClick={() => setDeleteTarget(product)}>Delete</Button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
          <span className="text-sm text-gray-400">Showing {filtered.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-gray-700 text-gray-400">Prev</Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(page)} className={currentPage === page ? 'bg-amber-500 text-black' : 'border-gray-700 text-gray-400'}>{page}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)} className="border-gray-700 text-gray-400">Next</Button>
          </div>
        </div>
      </Card>

      {showForm && (
        <ProductFormModal
          product={editingProduct}
          categories={categories}
          brands={brands}
          onClose={() => { setShowForm(false); setEditingProduct(null); }}
          saving={saving}
          setSaving={setSaving}
          onSaved={fetchData}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Product</h3>
            <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete &quot;{deleteTarget.title}&quot;?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-gray-700 text-gray-400">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Product Form Modal ───────────────────────────────────────────────────────

function ProductFormModal({ product, categories, brands, onClose, saving, setSaving, onSaved }: {
  product: ProductItem | null;
  categories: CategoryItem[];
  brands: BrandItem[];
  onClose: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    title: product?.title ?? '', slug: product?.slug ?? '', categorySlug: product?.categorySlug ?? '',
    brandSlug: product?.brandSlug ?? '', merchant: product?.merchant ?? 'amazon', asin: product?.asin ?? '',
    excerpt: product?.excerpt ?? '', summary: product?.summary ?? '', fullReview: product?.fullReview ?? '',
    whoIsItFor: product?.whoIsItFor ?? '', whoShouldSkip: product?.whoShouldSkip ?? '',
    rating: product?.rating ?? 4, bestFor: product?.bestFor?.join(', ') ?? '',
    pros: product?.pros?.join('\n') ?? '', cons: product?.cons?.join('\n') ?? '',
    tags: product?.tags?.join(', ') ?? '', reviewStatus: product?.reviewStatus ?? 'new',
    authorSlug: product?.authorSlug ?? 'alex-rivera',
  });
  const [features, setFeatures] = useState<Record<string, string>>(product?.features ?? {});
  const [specifications, setSpecifications] = useState<Record<string, string>>(product?.specifications ?? {});
  const [newFeatureKey, setNewFeatureKey] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Image upload state
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const [galleryImages, setGalleryImages] = useState<string[]>(product?.gallery || []);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  };

  const addFeature = () => { if (newFeatureKey.trim()) { setFeatures((f) => ({ ...f, [newFeatureKey.trim()]: newFeatureValue.trim() })); setNewFeatureKey(''); setNewFeatureValue(''); } };
  const removeFeature = (key: string) => { setFeatures((f) => { const n = { ...f }; delete n[key]; return n; }); };
  const addSpec = () => { if (newSpecKey.trim()) { setSpecifications((s) => ({ ...s, [newSpecKey.trim()]: newSpecValue.trim() })); setNewSpecKey(''); setNewSpecValue(''); } };
  const removeSpec = (key: string) => { setSpecifications((s) => { const n = { ...s }; delete n[key]; return n; }); };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        setImagePreview(data.url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setGalleryUploading(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url);
        }
      }
      setGalleryImages((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error('Gallery upload failed:', err);
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryImage = (idx: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSaving(true);

    // Build the payload with proper field formatting for the API
    const bestForArray = form.bestFor.split(',').map((s) => s.trim()).filter(Boolean);
    const prosArray = form.pros.split('\n').map((s) => s.trim()).filter(Boolean);
    const consArray = form.cons.split('\n').map((s) => s.trim()).filter(Boolean);
    const tagsArray = form.tags.split(',').map((s) => s.trim()).filter(Boolean);

    // Find the category and brand names from slugs
    const categoryObj = categories.find((c) => c.slug === form.categorySlug);
    const brandObj = brands.find((b) => b.slug === form.brandSlug);

    const payload = {
      slug: form.slug,
      title: form.title,
      image: imagePreview || '/images/placeholder.jpg',
      gallery: galleryImages,
      excerpt: form.excerpt,
      category: categoryObj?.name || form.categorySlug,
      categorySlug: form.categorySlug,
      subcategory: '',
      brand: brandObj?.name || form.brandSlug,
      brandSlug: form.brandSlug,
      features: features,
      pros: prosArray,
      cons: consArray,
      rating: Number(form.rating),
      ratingBreakdown: product?.ratingBreakdown || {},
      asin: form.asin,
      merchant: form.merchant,
      tags: tagsArray,
      authorSlug: form.authorSlug,
      reviewStatus: form.reviewStatus,
      bestFor: bestForArray,
      summary: form.summary,
      fullReview: form.fullReview,
      whoIsItFor: form.whoIsItFor,
      whoShouldSkip: form.whoShouldSkip,
      specifications: specifications,
      relatedProducts: product?.relatedProducts || [],
    };

    try {
      if (isEdit && product) {
        await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: product.slug, ...payload }),
        });
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err) {
      console.error('Failed to save product:', err);
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-3xl my-8">
        <div className="flex items-center justify-between p-4 border-b border-gray-800 sticky top-0 bg-gray-900 rounded-t-xl z-10">
          <h3 className="text-lg font-semibold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded" aria-label="Close"><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="p-4 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Basic Information</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className="text-xs text-gray-400 mb-1 block">Title</label><input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">ASIN / Product ID</label><input type="text" value={form.asin} onChange={(e) => setForm((f) => ({ ...f, asin: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Category</label><select value={form.categorySlug} onChange={(e) => setForm((f) => ({ ...f, categorySlug: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"><option value="">Select category</option>{categories.map((c) => (<option key={c.slug} value={c.slug}>{c.name}</option>))}</select></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Brand</label><select value={form.brandSlug} onChange={(e) => setForm((f) => ({ ...f, brandSlug: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"><option value="">Select brand</option>{brands.map((b) => (<option key={b.slug} value={b.slug}>{b.name}</option>))}</select></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Merchant</label><select value={form.merchant} onChange={(e) => setForm((f) => ({ ...f, merchant: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"><option value="amazon">Amazon</option><option value="walmart">Walmart</option><option value="bestbuy">Best Buy</option><option value="target">Target</option><option value="rei">REI</option><option value="bhphoto">B&H Photo</option></select></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Rating (1-5)</label><input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: parseFloat(e.target.value) || 1 }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Product Image</h4>
            <div>
              <div className="flex items-center gap-3">
                {imagePreview && (
                  <div className="w-20 h-20 rounded-lg bg-gray-800 overflow-hidden shrink-0">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-amber-500/20 file:text-amber-400 hover:file:bg-amber-500/30"
                  />
                  {uploading && <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Uploading...</p>}
                </div>
              </div>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Gallery Images</h4>
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {galleryImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-lg bg-gray-800 overflow-hidden group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeGalleryImage(idx)} className="absolute top-0.5 right-0.5 bg-red-500/80 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="text-sm text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
              />
              {galleryUploading && <p className="text-xs text-amber-400 mt-1 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Uploading gallery...</p>}
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Content</h4>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-400 mb-1 block">Excerpt</label><textarea value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Summary</label><textarea value={form.summary} onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Full Review</label><textarea value={form.fullReview} onChange={(e) => setForm((f) => ({ ...f, fullReview: e.target.value }))} rows={6} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-400 mb-1 block">Who Is It For</label><textarea value={form.whoIsItFor} onChange={(e) => setForm((f) => ({ ...f, whoIsItFor: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Who Should Skip</label><textarea value={form.whoShouldSkip} onChange={(e) => setForm((f) => ({ ...f, whoShouldSkip: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              </div>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Tags & Lists</h4>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-400 mb-1 block">Best For (comma separated)</label><input type="text" value={form.bestFor} onChange={(e) => setForm((f) => ({ ...f, bestFor: e.target.value }))} placeholder="e.g., Travelers, Commuters" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" />{form.bestFor && (<div className="flex flex-wrap gap-1 mt-2">{form.bestFor.split(',').map((tag, i) => tag.trim() && <Badge key={i} className="bg-amber-500/20 text-amber-400 text-[10px] border-amber-500/30">{tag.trim()}</Badge>)}</div>)}</div>
              <div><label className="text-xs text-gray-400 mb-1 block">Pros (one per line)</label><textarea value={form.pros} onChange={(e) => setForm((f) => ({ ...f, pros: e.target.value }))} rows={3} placeholder="One pro per line" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Cons (one per line)</label><textarea value={form.cons} onChange={(e) => setForm((f) => ({ ...f, cons: e.target.value }))} rows={3} placeholder="One con per line" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Tags (comma separated)</label><input type="text" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="e.g., wireless, noise-cancelling" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Features</h4>
            <div className="space-y-2">
              {Object.entries(features).map(([key, value]) => (<div key={key} className="flex items-center gap-2"><span className="text-sm text-white font-medium w-40 shrink-0 truncate">{key}</span><span className="text-sm text-gray-400 flex-1 truncate">{value}</span><button onClick={() => removeFeature(key)} className="text-red-400 hover:text-red-300 shrink-0"><X size={14} /></button></div>))}
              <div className="flex items-center gap-2"><input type="text" value={newFeatureKey} onChange={(e) => setNewFeatureKey(e.target.value)} placeholder="Feature name" className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-amber-500" /><input type="text" value={newFeatureValue} onChange={(e) => setNewFeatureValue(e.target.value)} placeholder="Value" className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-amber-500" /><Button variant="outline" size="sm" onClick={addFeature} className="border-gray-700 text-gray-400 shrink-0">Add</Button></div>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Specifications</h4>
            <div className="space-y-2">
              {Object.entries(specifications).map(([key, value]) => (<div key={key} className="flex items-center gap-2"><span className="text-sm text-white font-medium w-40 shrink-0 truncate">{key}</span><span className="text-sm text-gray-400 flex-1 truncate">{value}</span><button onClick={() => removeSpec(key)} className="text-red-400 hover:text-red-300 shrink-0"><X size={14} /></button></div>))}
              <div className="flex items-center gap-2"><input type="text" value={newSpecKey} onChange={(e) => setNewSpecKey(e.target.value)} placeholder="Spec name" className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-amber-500" /><input type="text" value={newSpecValue} onChange={(e) => setNewSpecValue(e.target.value)} placeholder="Value" className="flex-1 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-amber-500" /><Button variant="outline" size="sm" onClick={addSpec} className="border-gray-700 text-gray-400 shrink-0">Add</Button></div>
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Publishing</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-400 mb-1 block">Review Status</label><select value={form.reviewStatus} onChange={(e) => setForm((f) => ({ ...f, reviewStatus: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"><option value="new">New</option><option value="verified">Verified</option><option value="updated">Updated</option></select></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Author</label><select value={form.authorSlug} onChange={(e) => setForm((f) => ({ ...f, authorSlug: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"><option value="alex-rivera">Alex Rivera</option><option value="maya-chen">Maya Chen</option></select></div>
            </div>
          </section>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-800 sticky bottom-0 bg-gray-900">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-400">Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || uploading} className="bg-amber-500 hover:bg-amber-400 text-black font-medium">{saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</Button>
        </div>
      </div>
    </div>
  );
}

// ── Categories Content ──────────────────────────────────────────────────────

function CategoriesContent() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image: '', featured: false, productCount: 0 });

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const openEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, image: cat.image, featured: cat.featured ?? false, productCount: cat.productCount });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingCategory(null);
    setForm({ name: '', slug: '', description: '', image: '', featured: false, productCount: 0 });
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingCategory) {
        await fetch('/api/categories', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: editingCategory.slug, ...form }) });
      } else {
        await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      }
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch('/api/categories', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: deleteTarget.slug }) });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <TableSkeleton rows={5} cols={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{categories.length} categories</p>
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-400 text-black font-medium"><FolderOpen size={16} className="mr-1.5" /> Add Category</Button>
      </div>
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800 bg-gray-900/50"><th className="text-left py-3 px-4 text-gray-400 font-medium">Image</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Slug</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Products</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Featured</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th></tr></thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No categories found. Seed the database or add a category.</td></tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                    <td className="py-2.5 px-4"><div className="w-10 h-10 rounded bg-gray-800 overflow-hidden">{cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><FolderOpen size={16} className="text-gray-600" /></div>}</div></td>
                    <td className="py-2.5 px-4 text-white font-medium">{cat.name}</td>
                    <td className="py-2.5 px-4 text-gray-400 font-mono text-xs">{cat.slug}</td>
                    <td className="py-2.5 px-4 text-gray-400">{cat.productCount}</td>
                    <td className="py-2.5 px-4">{cat.featured ? <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Featured</Badge> : <span className="text-gray-600">—</span>}</td>
                    <td className="py-2.5 px-4"><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-amber-400" onClick={() => openEdit(cat)}>Edit</Button><Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-red-400" onClick={() => setDeleteTarget(cat)}>Delete</Button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-800"><h3 className="text-lg font-semibold text-white">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-800 rounded" aria-label="Close"><X size={20} className="text-gray-400" /></button></div>
            <div className="p-4 sm:p-6 space-y-4">
              <div><label className="text-xs text-gray-400 mb-1 block">Name</label><input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Image URL</label><input type="text" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="/images/category-slug.jpg" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div className="flex items-center gap-3"><label className="text-sm text-gray-300">Featured</label><button onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))} className={`w-10 h-5 rounded-full transition-colors ${form.featured ? 'bg-amber-500' : 'bg-gray-700'} relative`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${form.featured ? 'left-5.5' : 'left-0.5'}`} /></button></div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-800"><Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-700 text-gray-400">Cancel</Button><Button onClick={handleSubmit} disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-black font-medium">{saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}</Button></div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Category</h3>
            <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete &quot;{deleteTarget.name}&quot;?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-gray-700 text-gray-400">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Brands Content ───────────────────────────────────────────────────────────

function BrandsContent() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ slug: '', name: '', logo: '', description: '', founded: '', headquarters: '', website: '', categories: '', productCount: 0 });

  const fetchBrands = useCallback(async () => {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } catch (err) {
      console.error('Failed to fetch brands:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  const openEdit = (brand: BrandItem) => {
    setEditingBrand(brand);
    setForm({
      slug: brand.slug, name: brand.name, logo: brand.logo, description: brand.description,
      founded: brand.founded || '', headquarters: brand.headquarters || '', website: brand.website || '',
      categories: Array.isArray(brand.categories) ? brand.categories.join(', ') : '', productCount: brand.productCount,
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingBrand(null);
    setForm({ slug: '', name: '', logo: '', description: '', founded: '', headquarters: '', website: '', categories: '', productCount: 0 });
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setForm((f) => ({ ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const categoriesArray = form.categories.split(',').map((s) => s.trim()).filter(Boolean);
    const payload = { ...form, categories: categoriesArray };

    try {
      if (editingBrand) {
        await fetch('/api/brands', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: editingBrand.slug, ...payload }) });
      } else {
        await fetch('/api/brands', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      }
      fetchBrands();
    } catch (err) {
      console.error('Failed to save brand:', err);
    }
    setSaving(false);
    setShowForm(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await fetch('/api/brands', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: deleteTarget.slug }) });
      fetchBrands();
    } catch (err) {
      console.error('Failed to delete brand:', err);
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <TableSkeleton rows={5} cols={5} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{brands.length} brands</p>
        <Button onClick={openCreate} className="bg-amber-500 hover:bg-amber-400 text-black font-medium"><Building2 size={16} className="mr-1.5" /> Add Brand</Button>
      </div>
      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-800 bg-gray-900/50"><th className="text-left py-3 px-4 text-gray-400 font-medium">Logo</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Slug</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Products</th><th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th></tr></thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-gray-500">No brands found. Seed the database or add a brand.</td></tr>
              ) : (
                brands.map((brand, idx) => (
                  <tr key={brand.slug} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${idx % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
                    <td className="py-2.5 px-4"><div className="w-10 h-10 rounded bg-gray-800 overflow-hidden">{brand.logo ? <img src={brand.logo} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Building2 size={16} className="text-gray-600" /></div>}</div></td>
                    <td className="py-2.5 px-4 text-white font-medium">{brand.name}</td>
                    <td className="py-2.5 px-4 text-gray-400 font-mono text-xs">{brand.slug}</td>
                    <td className="py-2.5 px-4 text-gray-400">{brand.productCount}</td>
                    <td className="py-2.5 px-4"><div className="flex items-center gap-1"><Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-amber-400" onClick={() => openEdit(brand)}>Edit</Button><Button variant="ghost" size="sm" className="h-7 px-2 text-gray-400 hover:text-red-400" onClick={() => setDeleteTarget(brand)}>Delete</Button></div></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-4 border-b border-gray-800"><h3 className="text-lg font-semibold text-white">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h3><button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-800 rounded" aria-label="Close"><X size={20} className="text-gray-400" /></button></div>
            <div className="p-4 sm:p-6 space-y-4">
              <div><label className="text-xs text-gray-400 mb-1 block">Name</label><input type="text" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Slug</label><input type="text" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Logo URL</label><input type="text" value={form.logo} onChange={(e) => setForm((f) => ({ ...f, logo: e.target.value }))} placeholder="/images/brand-slug.jpg" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 resize-none" /></div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-400 mb-1 block">Founded</label><input type="text" value={form.founded} onChange={(e) => setForm((f) => ({ ...f, founded: e.target.value }))} placeholder="e.g., 1946" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="text-xs text-gray-400 mb-1 block">Headquarters</label><input type="text" value={form.headquarters} onChange={(e) => setForm((f) => ({ ...f, headquarters: e.target.value }))} placeholder="e.g., Tokyo, Japan" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
              </div>
              <div><label className="text-xs text-gray-400 mb-1 block">Website</label><input type="text" value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} placeholder="https://example.com" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-amber-500" /></div>
              <div><label className="text-xs text-gray-400 mb-1 block">Categories (comma separated slugs)</label><input type="text" value={form.categories} onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))} placeholder="e.g., electronics, audio" className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500" /></div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-gray-800"><Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-700 text-gray-400">Cancel</Button><Button onClick={handleSubmit} disabled={saving} className="bg-amber-500 hover:bg-amber-400 text-black font-medium">{saving ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}</Button></div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Brand</h3>
            <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete &quot;{deleteTarget.name}&quot;?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="border-gray-700 text-gray-400">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Messages Content ─────────────────────────────────────────────────────────

interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

function MessagesContent() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const token = useAdminAuth.getState().token;
      const url = token ? `/api/contact?token=${encodeURIComponent(token)}&limit=100` : '/api/contact?limit=100';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const toggleRead = async (id: string, currentIsRead: boolean) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: !currentIsRead }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: !currentIsRead } : m))
        );
      }
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const markAllRead = async () => {
    const unread = messages.filter((m) => !m.isRead);
    for (const msg of unread) {
      await toggleRead(msg.id, false);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncate = (str: string, len: number) =>
    str.length > len ? str.slice(0, len) + '…' : str;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-48 bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-800 rounded-lg animate-pulse" />
        </div>
        <Card className="bg-gray-900 border-gray-800 overflow-hidden">
          <TableSkeleton rows={5} cols={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MessageSquare size={16} />
            <span>{total} message{total !== 1 ? 's' : ''}</span>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            className="border-gray-700 text-gray-400 hover:text-white"
          >
            <RefreshCw size={14} className="mr-1.5" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={markAllRead}
              className="bg-amber-500 hover:bg-amber-400 text-black font-medium"
            >
              <MailOpen size={14} className="mr-1.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-900/50">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Message</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <MessageSquare size={32} className="mx-auto mb-2 text-gray-600" />
                    <p>No messages yet.</p>
                    <p className="text-xs mt-1">Messages from the contact form will appear here.</p>
                  </td>
                </tr>
              ) : (
                messages.map((msg, idx) => (
                  <React.Fragment key={msg.id}>
                    <tr
                      className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer ${
                        idx % 2 === 0 ? 'bg-gray-900/30' : ''
                      } ${!msg.isRead ? 'bg-amber-500/5' : ''}`}
                      onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                    >
                      <td className="py-2.5 px-4">
                        {msg.isRead ? (
                          <MailOpen size={16} className="text-gray-500" />
                        ) : (
                          <Mail size={16} className="text-amber-500" />
                        )}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className={`font-medium ${!msg.isRead ? 'text-white' : 'text-gray-300'}`}>
                          {msg.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-gray-400 text-xs">{msg.email}</td>
                      <td className="py-2.5 px-4 text-gray-300 max-w-[150px] truncate">
                        {msg.subject || <span className="text-gray-600 italic">No subject</span>}
                      </td>
                      <td className="py-2.5 px-4 text-gray-400 max-w-[200px] truncate">
                        {truncate(msg.message, 60)}
                      </td>
                      <td className="py-2.5 px-4 text-gray-500 text-xs whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </td>
                      <td className="py-2.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 px-2 ${msg.isRead ? 'text-gray-400 hover:text-amber-400' : 'text-amber-400 hover:text-amber-300'}`}
                            onClick={() => toggleRead(msg.id, msg.isRead)}
                            title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                          >
                            {msg.isRead ? <Mail size={14} /> : <MailOpen size={14} />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-gray-400 hover:text-red-400"
                            onClick={() => deleteMessage(msg.id)}
                            title="Delete message"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId === msg.id && (
                      <tr className="bg-gray-800/20">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">From:</span>
                              <span className="text-white font-medium">{msg.name}</span>
                              <span className="text-gray-500 text-xs">({msg.email})</span>
                            </div>
                            {msg.subject && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Subject:</span>
                                <span className="text-gray-300">{msg.subject}</span>
                              </div>
                            )}
                            <div>
                              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Message:</span>
                              <p className="text-gray-300 mt-1 whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className={`border-gray-700 ${msg.isRead ? 'text-gray-400' : 'text-amber-400'}`}
                                onClick={() => toggleRead(msg.id, msg.isRead)}
                              >
                                {msg.isRead ? <Mail size={14} className="mr-1" /> : <MailOpen size={14} className="mr-1" />}
                                {msg.isRead ? 'Mark Unread' : 'Mark as Read'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-700 text-gray-400 hover:text-red-400"
                                onClick={() => deleteMessage(msg.id)}
                              >
                                <Trash2 size={14} className="mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
