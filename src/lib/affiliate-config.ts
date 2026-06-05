import type { Merchant } from '@/lib/types';

// ── Types ──────────────────────────────────────────────────────────────────

export interface MerchantConfig {
  id: Merchant;
  name: string;
  affiliateTag: string;
  baseUrl: string;
  urlTemplate: string; // Template with {productId} and {tag} placeholders
  enabled: boolean;
  priority: number; // Display order (1 = primary)
  color: string; // Brand color for UI
  icon: string; // Icon identifier from lucide-react
}

export type LinkStrategy = 'direct' | 'redirect' | 'cloaked';

export interface AffiliateSettings {
  linkStrategy: LinkStrategy;
  redirectPrefix: string; // e.g., '/go/' for cloaked links
  nofollowEnabled: boolean;
  sponsoredEnabled: boolean;
  noopenerEnabled: boolean;
  openInNewTab: boolean;
  clickTracking: boolean;
  impressionTracking: boolean;
}

// ── Environment Variable Map ───────────────────────────────────────────────

const ENV_TAG_MAP: Record<Merchant, string> = {
  amazon: process.env.NEXT_PUBLIC_AFFILIATE_TAG_AMAZON || '',
  walmart: process.env.NEXT_PUBLIC_AFFILIATE_TAG_WALMART || '',
  bestbuy: process.env.NEXT_PUBLIC_AFFILIATE_TAG_BESTBUY || '',
  target: process.env.NEXT_PUBLIC_AFFILIATE_TAG_TARGET || '',
  rei: process.env.NEXT_PUBLIC_AFFILIATE_TAG_REI || '',
  bhphoto: process.env.NEXT_PUBLIC_AFFILIATE_TAG_BHPHOTO || '',
};

/**
 * Check if a merchant's affiliate tag is set via environment variable.
 * Works on both client and server — env vars prefixed with NEXT_PUBLIC_
 * are inlined at build time and available on the client.
 */
export function isEnvOverride(merchant: Merchant): boolean {
  return !!ENV_TAG_MAP[merchant];
}

// ── Default Data ───────────────────────────────────────────────────────────

const DEFAULT_MERCHANTS: MerchantConfig[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    affiliateTag: 'productreview0b-20',
    baseUrl: 'https://www.amazon.com',
    urlTemplate: 'https://www.amazon.com/dp/{productId}?tag={tag}',
    enabled: true,
    priority: 1,
    color: '#FF9900',
    icon: 'shopping-bag',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    affiliateTag: 'productreview0b',
    baseUrl: 'https://walmart.com',
    urlTemplate: 'https://walmart.com/ip/{productId}?affid={tag}',
    enabled: true,
    priority: 2,
    color: '#0071DC',
    icon: 'store',
  },
  {
    id: 'bestbuy',
    name: 'Best Buy',
    affiliateTag: 'productreview0b',
    baseUrl: 'https://bestbuy.com',
    urlTemplate: 'https://bestbuy.com/site/{productId}?ref={tag}',
    enabled: true,
    priority: 3,
    color: '#0046BE',
    icon: 'monitor',
  },
  {
    id: 'target',
    name: 'Target',
    affiliateTag: 'productreview0b',
    baseUrl: 'https://target.com',
    urlTemplate: 'https://target.com/s?searchTerm={productId}&ref={tag}',
    enabled: true,
    priority: 4,
    color: '#CC0000',
    icon: 'target',
  },
  {
    id: 'rei',
    name: 'REI',
    affiliateTag: 'productreview0b',
    baseUrl: 'https://rei.com',
    urlTemplate: 'https://rei.com/product/{productId}?ref={tag}',
    enabled: true,
    priority: 5,
    color: '#1A5632',
    icon: 'mountain',
  },
  {
    id: 'bhphoto',
    name: 'B&H Photo',
    affiliateTag: 'productreview0b',
    baseUrl: 'https://bhphotovideo.com',
    urlTemplate: 'https://bhpho.to/{productId}',
    enabled: true,
    priority: 6,
    color: '#C41230',
    icon: 'camera',
  },
];

const DEFAULT_SETTINGS: AffiliateSettings = {
  linkStrategy: 'direct',
  redirectPrefix: '/go/',
  nofollowEnabled: true,
  sponsoredEnabled: true,
  noopenerEnabled: true,
  openInNewTab: true,
  clickTracking: true,
  impressionTracking: false,
};

// ── Storage Keys ───────────────────────────────────────────────────────────

const CONFIG_STORAGE_KEY = 'geargeekz-affiliate-config';
const SETTINGS_STORAGE_KEY = 'geargeekz-affiliate-settings';

// ── Helper: localStorage with SSR safety ───────────────────────────────────

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    return JSON.parse(stored) as T;
  } catch {
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error(`Failed to save ${key} to localStorage`);
  }
}

// ── Server-side config cache ───────────────────────────────────────────────

let serverMerchantCache: MerchantConfig[] | null = null;
let serverSettingsCache: AffiliateSettings | null = null;

/**
 * Fetch merchant configs from the server API (client-side only).
 * Falls back gracefully if the fetch fails.
 */
async function fetchMerchantConfigsFromServer(): Promise<MerchantConfig[] | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/affiliate?action=config');
    if (!res.ok) return null;
    const data = await res.json();
    return data.merchants as MerchantConfig[];
  } catch {
    return null;
  }
}

/**
 * Fetch global settings from the server API (client-side only).
 */
async function fetchSettingsFromServer(): Promise<AffiliateSettings | null> {
  if (typeof window === 'undefined') return null;
  try {
    const res = await fetch('/api/affiliate?action=settings');
    if (!res.ok) return null;
    const data = await res.json();
    return data.settings as AffiliateSettings;
  } catch {
    return null;
  }
}

// ── Merchant Config API ────────────────────────────────────────────────────

/**
 * Get merchant configs with the following precedence:
 * 1. Environment variables override the affiliateTag for each merchant
 * 2. Database (via server API on client, or direct Prisma on server)
 * 3. localStorage (client-side only, backward compat)
 * 4. Hardcoded defaults
 */
export function getMerchantConfigs(): MerchantConfig[] {
  let configs: MerchantConfig[];

  if (typeof window === 'undefined') {
    // Server-side: use cache or defaults (API route will use Prisma directly)
    configs = serverMerchantCache ? [...serverMerchantCache] : [...DEFAULT_MERCHANTS];
  } else {
    // Client-side: localStorage fallback
    const stored = getFromStorage<MerchantConfig[] | null>(CONFIG_STORAGE_KEY, null);
    if (!stored) {
      configs = [...DEFAULT_MERCHANTS];
    } else {
      // Merge with defaults to pick up any new merchants added in code
      const storedIds = new Set(stored.map((m) => m.id));
      const merged = [...stored];
      for (const def of DEFAULT_MERCHANTS) {
        if (!storedIds.has(def.id)) {
          merged.push(def);
        }
      }
      configs = merged.sort((a, b) => a.priority - b.priority);
    }
  }

  // Apply env var overrides — these always take precedence
  for (const config of configs) {
    const envTag = ENV_TAG_MAP[config.id];
    if (envTag) {
      config.affiliateTag = envTag;
    }
  }

  return configs;
}

/**
 * Async version that fetches from the server database first.
 * Use this when you want the most up-to-date config.
 */
export async function getMerchantConfigsAsync(): Promise<MerchantConfig[]> {
  // Try server first
  const serverConfigs = await fetchMerchantConfigsFromServer();
  let configs: MerchantConfig[];

  if (serverConfigs && serverConfigs.length > 0) {
    configs = serverConfigs;
    serverMerchantCache = configs;
  } else {
    // Fall back to sync method (localStorage → defaults)
    configs = getMerchantConfigs();
  }

  // Apply env var overrides — these always take precedence
  for (const config of configs) {
    const envTag = ENV_TAG_MAP[config.id];
    if (envTag) {
      config.affiliateTag = envTag;
    }
  }

  return configs;
}

export function updateMerchantConfig(id: Merchant, updates: Partial<MerchantConfig>): MerchantConfig[] {
  const configs = getMerchantConfigs();
  const index = configs.findIndex((m) => m.id === id);
  if (index === -1) return configs;
  configs[index] = { ...configs[index], ...updates };
  setToStorage(CONFIG_STORAGE_KEY, configs);

  // Also sync to server in the background
  if (typeof window !== 'undefined') {
    fetch('/api/affiliate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'merchant', merchantId: id, updates }),
    }).catch(() => {
      // Server sync failed silently — localStorage is the fallback
    });
  }

  return configs;
}

export function resetMerchantConfigs(): MerchantConfig[] {
  setToStorage(CONFIG_STORAGE_KEY, DEFAULT_MERCHANTS);
  return [...DEFAULT_MERCHANTS];
}

export function getMerchantConfig(id: Merchant): MerchantConfig | undefined {
  const configs = getMerchantConfigs();
  return configs.find((m) => m.id === id);
}

// ── Affiliate Settings API ─────────────────────────────────────────────────

export function getAffiliateSettings(): AffiliateSettings {
  if (typeof window === 'undefined') {
    // Server-side: use cache or defaults
    return serverSettingsCache || DEFAULT_SETTINGS;
  }
  return getFromStorage<AffiliateSettings>(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
}

/**
 * Async version that fetches from the server database first.
 */
export async function getAffiliateSettingsAsync(): Promise<AffiliateSettings> {
  const serverSettings = await fetchSettingsFromServer();
  if (serverSettings) {
    serverSettingsCache = serverSettings;
    return serverSettings;
  }
  return getAffiliateSettings();
}

export function updateAffiliateSettings(updates: Partial<AffiliateSettings>): AffiliateSettings {
  const current = getAffiliateSettings();
  const updated = { ...current, ...updates };
  setToStorage(SETTINGS_STORAGE_KEY, updated);

  // Also sync to server in the background
  if (typeof window !== 'undefined') {
    fetch('/api/affiliate', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'settings', updates }),
    }).catch(() => {
      // Server sync failed silently
    });
  }

  return updated;
}

export function resetAffiliateSettings(): AffiliateSettings {
  setToStorage(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS };
}

// ── URL Generation ─────────────────────────────────────────────────────────

export function generateAffiliateUrl(merchant: Merchant, productId: string): string {
  const config = getMerchantConfig(merchant);
  const settings = getAffiliateSettings();

  if (!config || !config.enabled) {
    // Fallback: generate a basic URL even if disabled
    const tag = config?.affiliateTag || 'productreview0b';
    const template = config?.urlTemplate || 'https://www.amazon.com/dp/{productId}?tag={tag}';
    return template.replace('{productId}', productId).replace('{tag}', tag);
  }

  const directUrl = config.urlTemplate
    .replace('{productId}', productId)
    .replace('{tag}', config.affiliateTag);

  switch (settings.linkStrategy) {
    case 'redirect':
      return `${settings.redirectPrefix}${merchant}/${productId}`;
    case 'cloaked':
      return `/recommends/${merchant}/${productId}`;
    case 'direct':
    default:
      return directUrl;
  }
}

export function generateDirectAffiliateUrl(merchant: Merchant, productId: string): string {
  const config = getMerchantConfig(merchant);
  if (!config) {
    return `https://www.amazon.com/dp/${productId}?tag=productreview0b-20`;
  }
  return config.urlTemplate
    .replace('{productId}', productId)
    .replace('{tag}', config.affiliateTag);
}

// ── Link Attributes ────────────────────────────────────────────────────────

export function getLinkAttributes(): { rel: string; target: string } {
  const settings = getAffiliateSettings();
  const relParts: string[] = [];
  if (settings.nofollowEnabled) relParts.push('nofollow');
  if (settings.sponsoredEnabled) relParts.push('sponsored');
  if (settings.noopenerEnabled) relParts.push('noopener');
  relParts.push('noreferrer');

  return {
    rel: relParts.join(' '),
    target: settings.openInNewTab ? '_blank' : '_self',
  };
}

// ── Server-side helpers (used by API routes) ───────────────────────────────

/**
 * Set the server-side cache from database data.
 * Call this from API routes after reading from Prisma.
 */
export function setServerMerchantCache(configs: MerchantConfig[]): void {
  serverMerchantCache = configs;
}

export function setServerSettingsCache(settings: AffiliateSettings): void {
  serverSettingsCache = settings;
}
