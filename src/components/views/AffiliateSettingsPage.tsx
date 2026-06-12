'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  ShoppingBag,
  Store,
  Monitor,
  Target,
  Mountain,
  Camera,
  ExternalLink,
  Save,
  RotateCcw,
  Link2,
  Eye,
  ToggleLeft,
  BarChart3,
  Upload,
  AlertTriangle,
  Check,
  Loader2,
  ChevronUp,
  ChevronDown,
  Lock,
  Settings,
  Download,
  Cloud,
  CloudOff,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  getMerchantConfigs,
  updateMerchantConfig,
  getAffiliateSettings,
  updateAffiliateSettings,
  generateAffiliateUrl,
  generateDirectAffiliateUrl,
  resetMerchantConfigs,
  resetAffiliateSettings,
  type MerchantConfig,
  type AffiliateSettings,
  type LinkStrategy,
} from '@/lib/affiliate-config';
import type { Merchant } from '@/lib/types';

// ── Icon mapping ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  'shopping-bag': ShoppingBag,
  store: Store,
  monitor: Monitor,
  target: Target,
  mountain: Mountain,
  camera: Camera,
};

// ── Sync status ────────────────────────────────────────────────────────────

type SyncStatus = 'unknown' | 'synced' | 'local-only' | 'syncing';

// ── Main Component ─────────────────────────────────────────────────────────

export function AffiliateSettingsPage() {
  const [configs, setConfigs] = useState<MerchantConfig[]>([]);
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [envOverrides, setEnvOverrides] = useState<Record<string, boolean>>({});
  const [clickData, setClickData] = useState<{
    totalClicks: number;
    clicksByMerchant: Record<string, number>;
    topProducts: { merchant: string; productId: string; count: number }[];
    recentClicks: { merchant: Merchant; productId: string; timestamp: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [bulkAmazonTag, setBulkAmazonTag] = useState('');
  const [bulkAllTag, setBulkAllTag] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('unknown');
  const [serverConfigs, setServerConfigs] = useState<MerchantConfig[] | null>(null);

  // Load data on mount — fetch from server first, then fall back to localStorage
  useEffect(() => {
    const init = async () => {
      try {
        // Try to seed the database first if empty
        await fetch('/api/affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'seed' }),
        });

        // Fetch config from server
        const configRes = await fetch('/api/affiliate?action=config');
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.merchants && configData.merchants.length > 0) {
            setConfigs(configData.merchants);
            setServerConfigs(configData.merchants);
            setEnvOverrides(configData.envOverrides || {});
            setSyncStatus('synced');
          } else {
            // No data from server, fall back to localStorage
            const localConfigs = getMerchantConfigs();
            setConfigs(localConfigs);
            setSyncStatus('local-only');
          }
        } else {
          // Server unavailable, use localStorage
          const localConfigs = getMerchantConfigs();
          setConfigs(localConfigs);
          setSyncStatus('local-only');
        }

        // Fetch settings from server
        const settingsRes = await fetch('/api/affiliate?action=settings');
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData.settings);
        } else {
          setSettings(getAffiliateSettings());
        }
      } catch {
        // Network error, fall back to localStorage
        const localConfigs = getMerchantConfigs();
        setConfigs(localConfigs);
        setSettings(getAffiliateSettings());
        setSyncStatus('local-only');
      }
      setLoading(false);
    };
    const fetchClickAnalytics = async () => {
      try {
        const res = await fetch('/api/affiliate?action=clicks');
        if (res.ok) {
          const data = await res.json();
          setClickData(data);
        }
      } catch {
        // Analytics unavailable, show empty state
      }
    };
    init();
    fetchClickAnalytics();
  }, []);

  // Sync from server — pull latest config from database
  const handleSyncFromServer = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const configRes = await fetch('/api/affiliate?action=config');
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.merchants) {
          setConfigs(configData.merchants);
          setServerConfigs(configData.merchants);
          setEnvOverrides(configData.envOverrides || {});
          setSyncStatus('synced');
        }
      }

      const settingsRes = await fetch('/api/affiliate?action=settings');
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings);
      }
    } catch {
      setSyncStatus('local-only');
    }
  }, []);

  // Push to server — push localStorage config to the database
  const handlePushToServer = useCallback(async () => {
    setSyncStatus('syncing');
    try {
      const localConfigs = getMerchantConfigs();
      const localSettings = getAffiliateSettings();

      // Push each merchant config
      for (const config of localConfigs) {
        await fetch('/api/affiliate', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'merchant',
            merchantId: config.id,
            updates: {
              name: config.name,
              affiliateTag: config.affiliateTag,
              baseUrl: config.baseUrl,
              urlTemplate: config.urlTemplate,
              enabled: config.enabled,
              priority: config.priority,
              color: config.color,
              icon: config.icon,
            },
          }),
        });
      }

      // Push settings
      await fetch('/api/affiliate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', updates: localSettings }),
      });

      // Refresh from server to confirm
      const configRes = await fetch('/api/affiliate?action=config');
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.merchants) {
          setConfigs(configData.merchants);
          setServerConfigs(configData.merchants);
          setEnvOverrides(configData.envOverrides || {});
        }
      }

      setSyncStatus('synced');
    } catch {
      setSyncStatus('local-only');
    }
  }, []);

  const handleSaveMerchant = useCallback(async (id: Merchant, updates: Partial<MerchantConfig>) => {
    setSaving(id);
    try {
      // Save to localStorage
      const newConfigs = updateMerchantConfig(id, updates);
      setConfigs([...newConfigs]);

      // Also persist to server database
      await fetch('/api/affiliate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'merchant', merchantId: id, updates }),
      });

      setSaved(id);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // Error handling
    } finally {
      setSaving(null);
    }
  }, []);

  const handleSaveSettings = useCallback(async (updates: Partial<AffiliateSettings>) => {
    setSaving('settings');
    try {
      // Save to localStorage
      const newSettings = updateAffiliateSettings(updates);
      setSettings({ ...newSettings });

      // Also persist to server database
      await fetch('/api/affiliate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'settings', updates }),
      });

      setSaved('settings');
      setTimeout(() => setSaved(null), 2000);
    } catch {
      // Error handling
    } finally {
      setSaving(null);
    }
  }, []);

  const handleResetAll = useCallback(async () => {
    const newConfigs = resetMerchantConfigs();
    const newSettings = resetAffiliateSettings();
    setConfigs([...newConfigs]);
    setSettings({ ...newSettings });
    setSyncStatus('local-only');
  }, []);

  const handleBulkUpdate = useCallback(async (type: 'amazon' | 'all', tag: string) => {
    if (!tag.trim()) return;

    if (type === 'amazon') {
      const newConfigs = updateMerchantConfig('amazon', { affiliateTag: tag.trim() });
      setConfigs([...newConfigs]);
    } else {
      const currentConfigs = getMerchantConfigs();
      for (const config of currentConfigs) {
        updateMerchantConfig(config.id, { affiliateTag: tag.trim() });
      }
      setConfigs(getMerchantConfigs());
    }

    setBulkAmazonTag('');
    setBulkAllTag('');
  }, []);

  const handlePriorityChange = useCallback(async (id: Merchant, direction: 'up' | 'down') => {
    const currentConfigs = getMerchantConfigs();
    const sorted = [...currentConfigs].sort((a, b) => a.priority - b.priority);
    const idx = sorted.findIndex((m) => m.id === id);
    if (idx === -1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Swap priorities
    const tempPriority = sorted[idx].priority;
    await handleSaveMerchant(sorted[idx].id, { priority: sorted[swapIdx].priority });
    await handleSaveMerchant(sorted[swapIdx].id, { priority: tempPriority });
  }, [handleSaveMerchant]);

  if (loading || !settings) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="size-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Lock className="size-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Affiliate Settings
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                Admin
              </Badge>
            </h1>
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure affiliate tags, link strategies, and track performance across all merchants.
        </p>
      </div>

      {/* Sync Status Bar */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          {syncStatus === 'synced' && <Cloud className="size-4 text-green-500" />}
          {syncStatus === 'local-only' && <CloudOff className="size-4 text-amber-500" />}
          {syncStatus === 'syncing' && <Loader2 className="size-4 animate-spin text-blue-500" />}
          {syncStatus === 'unknown' && <Info className="size-4 text-gray-400" />}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {syncStatus === 'synced' && 'Synced with server'}
            {syncStatus === 'local-only' && 'Local only — not synced with server'}
            {syncStatus === 'syncing' && 'Syncing...'}
            {syncStatus === 'unknown' && 'Sync status unknown'}
          </span>
          <Badge
            variant={syncStatus === 'synced' ? 'default' : 'outline'}
            className={
              syncStatus === 'synced'
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] border-green-200 dark:border-green-800'
                : syncStatus === 'local-only'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] border-amber-200 dark:border-amber-800'
                  : 'text-[10px]'
            }
          >
            {syncStatus === 'synced' ? 'SERVER' : syncStatus === 'local-only' ? 'LOCAL' : '...'}
          </Badge>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncFromServer}
            disabled={syncStatus === 'syncing'}
            className="text-xs"
          >
            <Download className="size-3 mr-1" />
            Sync from Server
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePushToServer}
            disabled={syncStatus === 'syncing'}
            className="text-xs"
          >
            <Upload className="size-3 mr-1" />
            Push to Server
          </Button>
        </div>
      </div>

      {/* Section 1: Merchant Configuration */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Merchant Configuration</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="text-gray-600 dark:text-gray-400"
          >
            <RotateCcw className="size-4 mr-1" />
            Reset All
          </Button>
        </div>

        <div className="grid gap-4">
          {configs.map((config) => (
            <MerchantCard
              key={config.id}
              config={config}
              isPrimary={config.priority === 1}
              saving={saving === config.id}
              saved={saved === config.id}
              onSave={handleSaveMerchant}
              onPriorityChange={handlePriorityChange}
              isFirst={config.priority === 1}
              isLast={config.priority === configs.length}
              envOverride={!!envOverrides[config.id]}
            />
          ))}
        </div>
      </section>

      {/* Section 2: Link Strategy */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Link2 className="size-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Link Strategy</h2>
        </div>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <RadioGroup
              value={settings.linkStrategy}
              onValueChange={(val) => handleSaveSettings({ linkStrategy: val as LinkStrategy })}
              className="space-y-4"
            >
              <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
                <RadioGroupItem value="direct" id="direct" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="direct" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                    Direct Links
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Links go directly to the merchant&apos;s site with affiliate parameters.
                  </p>
                  <div className="mt-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                    https://www.amazon.com/dp/B0BSHF7WHW?tag=productreview0b-20
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
                <RadioGroupItem value="redirect" id="redirect" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="redirect" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                    Redirect Links
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Links go through a redirect endpoint that tracks clicks before forwarding to the merchant.
                  </p>
                  <div className="mt-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                    /go/amazon/B0BSHF7WHW
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-600 transition-colors">
                <RadioGroupItem value="cloaked" id="cloaked" className="mt-0.5" />
                <div className="flex-1">
                  <Label htmlFor="cloaked" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                    Cloaked Links
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Links use a friendly URL format that hides the affiliate destination.
                  </p>
                  <div className="mt-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono text-gray-600 dark:text-gray-300 break-all">
                    /recommends/amazon/B0BSHF7WHW
                  </div>
                </div>
              </div>
            </RadioGroup>

            {settings.linkStrategy === 'redirect' && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label htmlFor="redirectPrefix" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Redirect Prefix
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="redirectPrefix"
                    value={settings.redirectPrefix}
                    onChange={(e) => handleSaveSettings({ redirectPrefix: e.target.value })}
                    placeholder="/go/"
                    className="max-w-xs font-mono"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 3: Link Attributes */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="size-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Link Attributes</h2>
        </div>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <ToggleRow
                label="Nofollow"
                description="Tells search engines not to follow this link"
                checked={settings.nofollowEnabled}
                onChange={(val) => handleSaveSettings({ nofollowEnabled: val })}
              />
              <ToggleRow
                label="Sponsored"
                description="Identifies the link as sponsored/affiliate"
                checked={settings.sponsoredEnabled}
                onChange={(val) => handleSaveSettings({ sponsoredEnabled: val })}
              />
              <ToggleRow
                label="Noopener"
                description="Prevents the new page from accessing window.opener"
                checked={settings.noopenerEnabled}
                onChange={(val) => handleSaveSettings({ noopenerEnabled: val })}
              />
              <ToggleRow
                label="Open in New Tab"
                description="Opens affiliate links in a new browser tab"
                checked={settings.openInNewTab}
                onChange={(val) => handleSaveSettings({ openInNewTab: val })}
              />
            </div>

            <Separator className="my-4" />

            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Live Preview</p>
              <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <code className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                  {'<a'}<br />
                  {'  href="'}<span className="text-amber-600 dark:text-amber-400">{generateAffiliateUrl('amazon', 'B0BSHF7WHW')}</span>{'"'}<br />
                  {'  rel="'}<span className="text-green-600 dark:text-green-400">
                    {[
                      settings.nofollowEnabled && 'nofollow',
                      settings.sponsoredEnabled && 'sponsored',
                      settings.noopenerEnabled && 'noopener',
                      'noreferrer',
                    ].filter(Boolean).join(' ')}
                  </span>{'"'}<br />
                  {'  target="'}<span className="text-blue-600 dark:text-blue-400">{settings.openInNewTab ? '_blank' : '_self'}</span>{'"'}<br />
                  {'/>'}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Section 4: Click Analytics */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="size-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Click Analytics</h2>
          <Badge variant="outline" className="text-xs text-gray-500">Last 30 days</Badge>
        </div>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            {clickData && clickData.totalClicks > 0 ? (
              <div className="space-y-6">
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{clickData.totalClicks}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Clicks</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Object.keys(clickData.clicksByMerchant).length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Merchants</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clickData.topProducts.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Products</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {clickData.totalClicks > 0 ? Math.round(clickData.totalClicks / 30 * 10) / 10 : 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg/Day</p>
                  </div>
                </div>

                {/* Clicks by Merchant */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Clicks by Merchant</p>
                  <div className="space-y-2">
                    {configs.map((mc) => {
                      const clicks = clickData.clicksByMerchant[mc.id] || 0;
                      const pct = clickData.totalClicks > 0 ? (clicks / clickData.totalClicks) * 100 : 0;
                      return (
                        <div key={mc.id} className="flex items-center gap-3">
                          <span className="text-sm text-gray-700 dark:text-gray-300 w-24 shrink-0">{mc.name}</span>
                          <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: mc.color }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{clicks}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top Products */}
                {clickData.topProducts.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Top Products by Clicks</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Merchant</th>
                            <th className="text-left py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Product ID</th>
                            <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Clicks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clickData.topProducts.slice(0, 5).map((product, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-2 pr-4 text-gray-700 dark:text-gray-300 capitalize">{product.merchant}</td>
                              <td className="py-2 pr-4 font-mono text-xs text-gray-600 dark:text-gray-400">{product.productId}</td>
                              <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{product.count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="size-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No click data available yet.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Clicks will appear here when visitors use your affiliate links.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Section 5: Bulk Update */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="size-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Update</h2>
        </div>

        <Card className="border-gray-200 dark:border-gray-700">
          <CardContent className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Bulk Amazon */}
              <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-900/50 bg-orange-50/50 dark:bg-orange-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="size-4 text-orange-500" />
                  <Label className="font-medium text-gray-900 dark:text-white">Update Amazon Tag</Label>
                  {envOverrides['amazon'] && (
                    <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] px-1.5 py-0">
                      ENV
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  {envOverrides['amazon']
                    ? 'Tag is set via env var. Change NEXT_PUBLIC_AFFILIATE_TAG_AMAZON instead.'
                    : 'Change only the Amazon affiliate tracking tag.'}
                </p>
                <div className="flex gap-2">
                  <Input
                    value={bulkAmazonTag}
                    onChange={(e) => setBulkAmazonTag(e.target.value)}
                    placeholder="new-tag-20"
                    className="font-mono text-sm"
                    disabled={!!envOverrides['amazon']}
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={!bulkAmazonTag.trim() || !!envOverrides['amazon']}
                        className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                      >
                        Apply
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Amazon Tag Update</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will change the Amazon affiliate tag to &quot;{bulkAmazonTag.trim()}&quot;. This affects all Amazon affiliate links on the site.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkUpdate('amazon', bulkAmazonTag)}>
                          Apply
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Bulk All */}
              <div className="p-4 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <Label className="font-medium text-gray-900 dark:text-white">Update All Tags</Label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Set the same affiliate tag for all merchants.
                </p>
                <div className="flex gap-2">
                  <Input
                    value={bulkAllTag}
                    onChange={(e) => setBulkAllTag(e.target.value)}
                    placeholder="your-tag-name"
                    className="font-mono text-sm"
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        disabled={!bulkAllTag.trim()}
                        className="bg-amber-500 hover:bg-amber-600 text-white shrink-0"
                      >
                        Apply
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Bulk Tag Update</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will change ALL merchant affiliate tags to &quot;{bulkAllTag.trim()}&quot;. This affects every affiliate link on the site across all merchants.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleBulkUpdate('all', bulkAllTag)}>
                          Apply to All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

// ── Merchant Card Sub-component ────────────────────────────────────────────

function MerchantCard({
  config,
  isPrimary,
  saving,
  saved,
  onSave,
  onPriorityChange,
  isFirst,
  isLast,
  envOverride,
}: {
  config: MerchantConfig;
  isPrimary: boolean;
  saving: boolean;
  saved: boolean;
  onSave: (id: Merchant, updates: Partial<MerchantConfig>) => Promise<void>;
  onPriorityChange: (id: Merchant, direction: 'up' | 'down') => Promise<void>;
  isFirst: boolean;
  isLast: boolean;
  envOverride: boolean;
}) {
  const [tagValue, setTagValue] = useState(config.affiliateTag);
  const [templateValue, setTemplateValue] = useState(config.urlTemplate);
  const [enabled, setEnabled] = useState(config.enabled);
  const [hasChanges, setHasChanges] = useState(false);

  const IconComponent = ICON_MAP[config.icon] || ShoppingBag;

  useEffect(() => {
    setTagValue(config.affiliateTag);
    setTemplateValue(config.urlTemplate);
    setEnabled(config.enabled);
    setHasChanges(false);
  }, [config.affiliateTag, config.urlTemplate, config.enabled]);

  const checkChanges = (field: 'tag' | 'template' | 'enabled', value: string | boolean) => {
    if (field === 'tag') setHasChanges(value !== config.affiliateTag || templateValue !== config.urlTemplate || enabled !== config.enabled);
    if (field === 'template') setHasChanges(tagValue !== config.affiliateTag || value !== config.urlTemplate || enabled !== config.enabled);
    if (field === 'enabled') setHasChanges(tagValue !== config.affiliateTag || templateValue !== config.urlTemplate || value !== config.enabled);
  };

  const handleSave = async () => {
    await onSave(config.id, {
      affiliateTag: tagValue,
      urlTemplate: templateValue,
      enabled,
    });
    setHasChanges(false);
  };

  const testLink = generateDirectAffiliateUrl(config.id, 'B0BSHF7WHW');

  return (
    <Card
      className="border-gray-200 dark:border-gray-700 overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: config.color }}
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Merchant Icon & Name */}
          <div className="flex items-center gap-3 sm:w-48 shrink-0">
            <div
              className="size-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${config.color}15` }}
            >
              <IconComponent size={20} className="shrink-0" style={{ color: config.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{config.name}</h3>
                {isPrimary && (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-1.5 py-0">
                    Primary
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Priority #{config.priority}</p>
            </div>
          </div>

          {/* Config Fields */}
          <div className="flex-1 grid sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Label className="text-xs text-gray-500 dark:text-gray-400">Affiliate Tag</Label>
                {envOverride && (
                  <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9px] px-1 py-0 leading-tight">
                    ENV
                  </Badge>
                )}
              </div>
              <Input
                value={tagValue}
                onChange={(e) => {
                  setTagValue(e.target.value);
                  checkChanges('tag', e.target.value);
                }}
                className={`font-mono text-sm ${envOverride ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''}`}
                placeholder="your-affiliate-tag"
                disabled={envOverride}
                readOnly={envOverride}
              />
              {envOverride && (
                <p className="text-[10px] text-purple-500 dark:text-purple-400 mt-1">
                  Set via NEXT_PUBLIC_AFFILIATE_TAG_{config.id.toUpperCase()} env var
                </p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-500 dark:text-gray-400 mb-1">URL Template</Label>
              <Input
                value={templateValue}
                onChange={(e) => {
                  setTemplateValue(e.target.value);
                  checkChanges('template', e.target.value);
                }}
                className="font-mono text-sm"
                placeholder="https://merchant.com/dp/{productId}?tag={tag}"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0">
            <div className="flex items-center gap-2">
              <Label htmlFor={`enabled-${config.id}`} className="text-xs text-gray-500 dark:text-gray-400 sr-only sm:not-sr-only">
                {enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch
                id={`enabled-${config.id}`}
                checked={enabled}
                onCheckedChange={(val) => {
                  setEnabled(val);
                  checkChanges('enabled', val);
                }}
              />
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onPriorityChange(config.id, 'up')}
                disabled={isFirst}
                title="Move up"
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onPriorityChange(config.id, 'down')}
                disabled={isLast}
                title="Move down"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => window.open(testLink, '_blank')}
              title="Test affiliate link"
            >
              <ExternalLink className="size-3 mr-1" />
              Test
            </Button>

            <Button
              size="sm"
              className="text-xs bg-amber-500 hover:bg-amber-600 text-white"
              disabled={!hasChanges || saving}
              onClick={handleSave}
            >
              {saving ? (
                <Loader2 className="size-3 mr-1 animate-spin" />
              ) : saved ? (
                <Check className="size-3 mr-1" />
              ) : (
                <Save className="size-3 mr-1" />
              )}
              {saved ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Disabled overlay indicator */}
        {!enabled && (
          <div className="mt-3 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <ToggleLeft className="size-3.5" />
            This merchant is disabled — affiliate links will not be generated.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Toggle Row Sub-component ───────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
