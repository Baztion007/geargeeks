import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Merchant } from '@/lib/types';
import type { InValue } from '@libsql/client';

// ── In-memory click tracking ───────────────────────────────────────────────

interface ClickLog {
  merchant: Merchant;
  productId: string;
  timestamp: string;
  userAgent?: string;
  referer?: string;
}

const clickLogs: ClickLog[] = [];

// ── Default merchant configs (used for seeding) ────────────────────────────

interface MerchantConfig {
  id: Merchant;
  name: string;
  affiliateTag: string;
  baseUrl: string;
  urlTemplate: string;
  enabled: boolean;
  priority: number;
  color: string;
  icon: string;
}

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

// ── Environment variable map ───────────────────────────────────────────────

const ENV_TAG_MAP: Record<string, string> = {
  amazon: process.env.NEXT_PUBLIC_AFFILIATE_TAG_AMAZON || '',
  walmart: process.env.NEXT_PUBLIC_AFFILIATE_TAG_WALMART || '',
  bestbuy: process.env.NEXT_PUBLIC_AFFILIATE_TAG_BESTBUY || '',
  target: process.env.NEXT_PUBLIC_AFFILIATE_TAG_TARGET || '',
  rei: process.env.NEXT_PUBLIC_AFFILIATE_TAG_REI || '',
  bhphoto: process.env.NEXT_PUBLIC_AFFILIATE_TAG_BHPHOTO || '',
};

// ── Helper: Apply env var overrides to merchant configs ────────────────────

function applyEnvOverrides(merchants: MerchantConfig[]): MerchantConfig[] {
  return merchants.map((m) => {
    const envTag = ENV_TAG_MAP[m.id];
    if (envTag) {
      return { ...m, affiliateTag: envTag };
    }
    return m;
  });
}

// ── Helper: Convert DB row to MerchantConfig ───────────────────────────────

interface DbMerchantRow {
  id: number;
  merchantId: string;
  name: string;
  affiliateTag: string;
  baseUrl: string;
  urlTemplate: string;
  enabled: number;
  priority: number;
  color: string;
  icon: string;
  updatedAt: string;
}

function dbRowToMerchantConfig(row: Record<string, unknown>): MerchantConfig {
  return {
    id: row.merchantId as Merchant,
    name: row.name as string,
    affiliateTag: row.affiliateTag as string,
    baseUrl: row.baseUrl as string,
    urlTemplate: row.urlTemplate as string,
    enabled: Number(row.enabled) === 1,
    priority: Number(row.priority),
    color: row.color as string,
    icon: row.icon as string,
  };
}

interface DbSettingsRow {
  id: string;
  linkStrategy: string;
  redirectPrefix: string;
  nofollowEnabled: number;
  sponsoredEnabled: number;
  noopenerEnabled: number;
  openInNewTab: number;
  clickTracking: number;
  impressionTracking: number;
  updatedAt: string;
}

function dbRowToSettings(row: Record<string, unknown>) {
  return {
    linkStrategy: row.linkStrategy as 'direct' | 'redirect' | 'cloaked',
    redirectPrefix: row.redirectPrefix as string,
    nofollowEnabled: Number(row.nofollowEnabled) === 1,
    sponsoredEnabled: Number(row.sponsoredEnabled) === 1,
    noopenerEnabled: Number(row.noopenerEnabled) === 1,
    openInNewTab: Number(row.openInNewTab) === 1,
    clickTracking: Number(row.clickTracking) === 1,
    impressionTracking: Number(row.impressionTracking) === 1,
  };
}

const DEFAULT_SETTINGS = {
  linkStrategy: 'direct' as const,
  redirectPrefix: '/go/',
  nofollowEnabled: true,
  sponsoredEnabled: true,
  noopenerEnabled: true,
  openInNewTab: true,
  clickTracking: true,
  impressionTracking: false,
};

// ── Helper: Generate direct affiliate URL ──────────────────────────────────

function generateDirectUrl(merchant: Merchant, productId: string, tag: string): string {
  const config = DEFAULT_MERCHANTS.find((m) => m.id === merchant);
  if (!config) {
    return `https://www.amazon.com/dp/${productId}?tag=${tag}`;
  }
  return config.urlTemplate.replace('{productId}', productId).replace('{tag}', tag);
}

// ── Helper: Get env overrides map ──────────────────────────────────────────

function getEnvOverridesMap(): Record<string, boolean> {
  const envOverrides: Record<string, boolean> = {};
  for (const key of Object.keys(ENV_TAG_MAP)) {
    envOverrides[key] = !!ENV_TAG_MAP[key];
  }
  return envOverrides;
}

// ── Helper: Try model first, fall back to raw SQL ───────────────────

async function getMerchantConfigs(): Promise<MerchantConfig[]> {
  // Try using the model API
  try {
    const rows = await db.affiliateMerchantConfig.findMany({
      orderBy: { priority: 'asc' },
    });
    if (rows.length > 0) {
      return rows.map((r) => dbRowToMerchantConfig(r));
    }
  } catch (error) {
    console.error('Model query failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    const rows = await db.$queryRaw<Record<string, unknown>[]>(
      'SELECT * FROM AffiliateMerchantConfig ORDER BY priority ASC'
    );
    if (rows.length > 0) {
      return rows.map(dbRowToMerchantConfig);
    }
  } catch {
    // Table might not exist yet
  }

  return [...DEFAULT_MERCHANTS];
}

async function getGlobalSettings() {
  // Try model first
  try {
    const row = await db.affiliateGlobalSettings.findUnique({
      where: { id: 'default' },
    });
    if (row) {
      return dbRowToSettings(row);
    }
  } catch (error) {
    console.error('Settings query failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    const rows = await db.$queryRaw<Record<string, unknown>[]>(
      "SELECT * FROM AffiliateGlobalSettings WHERE id = 'default'"
    );
    if (rows.length > 0) {
      return dbRowToSettings(rows[0]);
    }
  } catch {
    // Table might not exist yet
  }

  return DEFAULT_SETTINGS;
}

function toSqlBool(val: unknown): number {
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'number') return val;
  return val ? 1 : 0;
}

async function upsertMerchantConfig(merchantId: string, data: Record<string, unknown>) {
  // Convert boolean fields for SQLite
  const sqlData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'enabled') {
      sqlData[key] = toSqlBool(value);
    } else {
      sqlData[key] = value;
    }
  }

  // Try model API first
  try {
    const existing = await db.affiliateMerchantConfig.findUnique({
      where: { merchantId },
    });
    if (existing) {
      return await db.affiliateMerchantConfig.update({
        where: { merchantId },
        data,
      });
    } else {
      const defaultConfig = DEFAULT_MERCHANTS.find((m) => m.id === merchantId);
      const createData = {
        merchantId,
        name: data.name ?? defaultConfig?.name ?? merchantId,
        affiliateTag: data.affiliateTag ?? defaultConfig?.affiliateTag ?? '',
        baseUrl: data.baseUrl ?? defaultConfig?.baseUrl ?? '',
        urlTemplate: data.urlTemplate ?? defaultConfig?.urlTemplate ?? '',
        enabled: data.enabled ?? 1,
        priority: data.priority ?? defaultConfig?.priority ?? 99,
        color: data.color ?? defaultConfig?.color ?? '#FF9900',
        icon: data.icon ?? defaultConfig?.icon ?? 'shopping-bag',
      };
      return await db.affiliateMerchantConfig.create({
        data: createData,
      });
    }
  } catch (error) {
    console.error('Model upsert failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    const existing = await db.$queryRaw<Record<string, unknown>[]>(
      'SELECT * FROM AffiliateMerchantConfig WHERE merchantId = ?',
      merchantId
    );

    if (existing.length > 0) {
      const setClauses: string[] = ['updatedAt = ?'];
      const values: InValue[] = [new Date().toISOString()];
      for (const [key, value] of Object.entries(sqlData)) {
        setClauses.push(`${key} = ?`);
        values.push(value as InValue);
      }
      values.push(merchantId);
      await db.$executeRawUnsafe(
        `UPDATE AffiliateMerchantConfig SET ${setClauses.join(', ')} WHERE merchantId = ?`,
        ...values
      );
    } else {
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const columns = ['id', 'merchantId', ...Object.keys(sqlData), 'updatedAt'];
      const placeholders = columns.map(() => '?').join(', ');
      const now = new Date().toISOString();
      const values: InValue[] = [id, merchantId, ...Object.values(sqlData) as InValue[], now];
      await db.$executeRawUnsafe(
        `INSERT INTO AffiliateMerchantConfig (${columns.join(', ')}) VALUES (${placeholders})`,
        ...values
      );
    }
  } catch (error) {
    console.error('Raw SQL upsert failed:', error);
    throw error;
  }

  const result = await db.$queryRaw<Record<string, unknown>[]>(
    'SELECT * FROM AffiliateMerchantConfig WHERE merchantId = ?',
    merchantId
  );
  return result[0];
}

async function upsertGlobalSettings(data: Record<string, unknown>) {
  // Convert boolean fields for SQLite
  const sqlData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (['nofollowEnabled', 'sponsoredEnabled', 'noopenerEnabled', 'openInNewTab', 'clickTracking', 'impressionTracking'].includes(key)) {
      sqlData[key] = toSqlBool(value);
    } else {
      sqlData[key] = value;
    }
  }

  // Try model API first
  try {
    return await db.affiliateGlobalSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
  } catch (error) {
    console.error('Settings upsert failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    const existing = await db.$queryRaw<Record<string, unknown>[]>(
      "SELECT * FROM AffiliateGlobalSettings WHERE id = 'default'"
    );

    if (existing.length > 0) {
      const setClauses: string[] = ['updatedAt = ?'];
      const values: InValue[] = [new Date().toISOString()];
      for (const [key, value] of Object.entries(sqlData)) {
        setClauses.push(`${key} = ?`);
        values.push(value as InValue);
      }
      await db.$executeRawUnsafe(
        `UPDATE AffiliateGlobalSettings SET ${setClauses.join(', ')} WHERE id = 'default'`,
        ...values
      );
    } else {
      const columns = ['id', ...Object.keys(sqlData), 'updatedAt'];
      const placeholders = columns.map(() => '?').join(', ');
      const now = new Date().toISOString();
      const values: InValue[] = ['default', ...Object.values(sqlData) as InValue[], now];
      await db.$executeRawUnsafe(
        `INSERT INTO AffiliateGlobalSettings (${columns.join(', ')}) VALUES (${placeholders})`,
        ...values
      );
    }
  } catch (error) {
    console.error('Raw SQL settings upsert failed:', error);
    throw error;
  }

  const result = await db.$queryRaw<Record<string, unknown>[]>(
    "SELECT * FROM AffiliateGlobalSettings WHERE id = 'default'"
  );
  return result[0];
}

// ── GET /api/affiliate ─────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  // GET /api/affiliate?action=clicks — Get click analytics
  if (action === 'clicks') {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentClicks = clickLogs.filter(
      (log) => new Date(log.timestamp) >= thirtyDaysAgo
    );

    const clicksByMerchant: Record<string, number> = {};
    const clicksByProduct: Record<string, { merchant: string; productId: string; count: number }> = {};

    for (const click of recentClicks) {
      clicksByMerchant[click.merchant] = (clicksByMerchant[click.merchant] || 0) + 1;
      const key = `${click.merchant}:${click.productId}`;
      if (!clicksByProduct[key]) {
        clicksByProduct[key] = { merchant: click.merchant, productId: click.productId, count: 0 };
      }
      clicksByProduct[key].count++;
    }

    const topProducts = Object.values(clicksByProduct)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return NextResponse.json({
      totalClicks: recentClicks.length,
      clicksByMerchant,
      topProducts,
      recentClicks: recentClicks.slice(-50).reverse(),
    });
  }

  // GET /api/affiliate?action=config — Get merchant configs from database
  if (action === 'config') {
    try {
      const merchants = applyEnvOverrides(await getMerchantConfigs());
      return NextResponse.json({ merchants, envOverrides: getEnvOverridesMap() });
    } catch (error) {
      console.error('Failed to fetch merchant configs:', error);
      return NextResponse.json({
        merchants: applyEnvOverrides([...DEFAULT_MERCHANTS]),
        envOverrides: getEnvOverridesMap(),
      });
    }
  }

  // GET /api/affiliate?action=settings — Get global settings from database
  if (action === 'settings') {
    try {
      const settings = await getGlobalSettings();
      return NextResponse.json({ settings });
    } catch (error) {
      console.error('Failed to fetch global settings:', error);
      return NextResponse.json({ settings: DEFAULT_SETTINGS });
    }
  }

  // Default: return merchant configs + settings (backward compat)
  try {
    const merchants = applyEnvOverrides(await getMerchantConfigs());
    const settings = await getGlobalSettings();
    return NextResponse.json({ merchants, settings });
  } catch {
    return NextResponse.json({
      merchants: applyEnvOverrides([...DEFAULT_MERCHANTS]),
      settings: DEFAULT_SETTINGS,
    });
  }
}

// ── PATCH /api/affiliate ───────────────────────────────────────────────────

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, merchantId, updates } = body;

    if (type === 'merchant' && merchantId) {
      // Check for env var override — don't allow updating tag if set via env
      if (updates.affiliateTag && ENV_TAG_MAP[merchantId]) {
        return NextResponse.json(
          { error: `Affiliate tag for ${merchantId} is set via environment variable and cannot be changed in the UI. Update the NEXT_PUBLIC_AFFILIATE_TAG_${merchantId.toUpperCase()} env var instead.` },
          { status: 403 }
        );
      }

      try {
        const defaultConfig = DEFAULT_MERCHANTS.find((m) => m.id === merchantId);
        const data: Record<string, unknown> = {};
        if (updates.name !== undefined) data.name = updates.name;
        if (updates.affiliateTag !== undefined) data.affiliateTag = updates.affiliateTag;
        if (updates.baseUrl !== undefined) data.baseUrl = updates.baseUrl;
        if (updates.urlTemplate !== undefined) data.urlTemplate = updates.urlTemplate;
        if (updates.enabled !== undefined) data.enabled = updates.enabled ? 1 : 0;
        if (updates.priority !== undefined) data.priority = updates.priority;
        if (updates.color !== undefined) data.color = updates.color;
        if (updates.icon !== undefined) data.icon = updates.icon;

        const result = await upsertMerchantConfig(merchantId, {
          name: defaultConfig?.name || merchantId,
          affiliateTag: defaultConfig?.affiliateTag || '',
          baseUrl: defaultConfig?.baseUrl || '',
          urlTemplate: defaultConfig?.urlTemplate || '',
          enabled: 1,
          priority: defaultConfig?.priority || 99,
          color: defaultConfig?.color || '#FF9900',
          icon: defaultConfig?.icon || 'shopping-bag',
          ...data,
        });

        const merchant: MerchantConfig = {
          id: merchantId as Merchant,
          name: result.name as string,
          affiliateTag: result.affiliateTag as string,
          baseUrl: result.baseUrl as string,
          urlTemplate: result.urlTemplate as string,
          enabled: typeof result.enabled === 'number' ? Number(result.enabled) === 1 : !!result.enabled,
          priority: Number(result.priority),
          color: result.color as string,
          icon: result.icon as string,
        };

        // Apply env override
        const envTag = ENV_TAG_MAP[merchantId];
        if (envTag) merchant.affiliateTag = envTag;

        return NextResponse.json({ success: true, merchant });
      } catch (error) {
        console.error('Failed to update merchant config in DB:', error);
        return NextResponse.json(
          { error: 'Failed to update merchant configuration in database' },
          { status: 500 }
        );
      }
    }

    if (type === 'settings') {
      try {
        const data: Record<string, unknown> = {};
        if (updates.linkStrategy !== undefined) data.linkStrategy = updates.linkStrategy;
        if (updates.redirectPrefix !== undefined) data.redirectPrefix = updates.redirectPrefix;
        if (updates.nofollowEnabled !== undefined) data.nofollowEnabled = updates.nofollowEnabled ? 1 : 0;
        if (updates.sponsoredEnabled !== undefined) data.sponsoredEnabled = updates.sponsoredEnabled ? 1 : 0;
        if (updates.noopenerEnabled !== undefined) data.noopenerEnabled = updates.noopenerEnabled ? 1 : 0;
        if (updates.openInNewTab !== undefined) data.openInNewTab = updates.openInNewTab ? 1 : 0;
        if (updates.clickTracking !== undefined) data.clickTracking = updates.clickTracking ? 1 : 0;
        if (updates.impressionTracking !== undefined) data.impressionTracking = updates.impressionTracking ? 1 : 0;

        const result = await upsertGlobalSettings(data);

        return NextResponse.json({
          success: true,
          settings: dbRowToSettings(result),
        });
      } catch (error) {
        console.error('Failed to update global settings in DB:', error);
        return NextResponse.json(
          { error: 'Failed to update global settings in database' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid update type. Use "merchant" or "settings"' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

// ── POST /api/affiliate ────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchant, productId, action: clickAction } = body;

    // POST /api/affiliate with { type: 'seed' } — Seed database with defaults
    if (body.type === 'seed') {
      try {
        // Check if data already exists
        let existingCount = 0;
        try {
          const countResult = await db.$queryRaw<Record<string, unknown>[]>(
            'SELECT COUNT(*) as cnt FROM AffiliateMerchantConfig'
          );
          existingCount = Number(countResult[0]?.cnt ?? 0);
        } catch {
          // Table doesn't exist yet — need to create it
          try {
            await db.$executeRawUnsafe(`
              CREATE TABLE IF NOT EXISTS AffiliateMerchantConfig (
                id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)) || '-' || hex(randomblob(4)) || '-4' || substr(hex(randomblob(4)),2) || '-' || substr('89ab',abs(random()) % 4 + 1,1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))) NOT NULL,
                merchantId TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                affiliateTag TEXT NOT NULL,
                baseUrl TEXT NOT NULL,
                urlTemplate TEXT NOT NULL,
                enabled BOOLEAN NOT NULL DEFAULT 1,
                priority INTEGER NOT NULL DEFAULT 1,
                color TEXT NOT NULL DEFAULT '#FF9900',
                icon TEXT NOT NULL DEFAULT 'shopping-bag',
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
              )
            `);
          } catch {
            // Table might already exist from Prisma push
          }

          try {
            await db.$executeRawUnsafe(`
              CREATE TABLE IF NOT EXISTS AffiliateGlobalSettings (
                id TEXT PRIMARY KEY DEFAULT 'default',
                linkStrategy TEXT NOT NULL DEFAULT 'direct',
                redirectPrefix TEXT NOT NULL DEFAULT '/go/',
                nofollowEnabled BOOLEAN NOT NULL DEFAULT 1,
                sponsoredEnabled BOOLEAN NOT NULL DEFAULT 1,
                noopenerEnabled BOOLEAN NOT NULL DEFAULT 1,
                openInNewTab BOOLEAN NOT NULL DEFAULT 1,
                clickTracking BOOLEAN NOT NULL DEFAULT 1,
                impressionTracking BOOLEAN NOT NULL DEFAULT 0,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
              )
            `);
          } catch {
            // Table might already exist
          }
        }

        if (existingCount === 0) {
          const now = new Date().toISOString();
          for (const def of DEFAULT_MERCHANTS) {
            const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
            await db.$executeRawUnsafe(
              `INSERT OR IGNORE INTO AffiliateMerchantConfig (id, merchantId, name, affiliateTag, baseUrl, urlTemplate, enabled, priority, color, icon, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              id, def.id, def.name, def.affiliateTag, def.baseUrl, def.urlTemplate, def.enabled ? 1 : 0, def.priority, def.color, def.icon, now
            );
          }
        }

        // Upsert default settings
        const settingsNow = new Date().toISOString();
        await db.$executeRawUnsafe(
          `INSERT OR IGNORE INTO AffiliateGlobalSettings (id, updatedAt) VALUES ('default', ?)`,
          settingsNow
        );

        const merchants = applyEnvOverrides(await getMerchantConfigs());

        return NextResponse.json({
          success: true,
          seeded: existingCount === 0,
          merchantCount: merchants.length,
          merchants,
        });
      } catch (error) {
        console.error('Failed to seed affiliate config:', error);
        return NextResponse.json(
          { error: 'Failed to seed affiliate configuration' },
          { status: 500 }
        );
      }
    }

    if (clickAction === 'track') {
      const log: ClickLog = {
        merchant: merchant as Merchant,
        productId: productId || 'unknown',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || undefined,
        referer: request.headers.get('referer') || undefined,
      };
      clickLogs.push(log);

      return NextResponse.json({ success: true, logged: true });
    }

    if (clickAction === 'redirect') {
      const log: ClickLog = {
        merchant: merchant as Merchant,
        productId: productId || 'unknown',
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || undefined,
        referer: request.headers.get('referer') || undefined,
      };
      clickLogs.push(log);

      let tag = 'productreview0b-20';
      try {
        const configs = await getMerchantConfigs();
        const config = configs.find((c) => c.id === merchant);
        if (config) {
          tag = ENV_TAG_MAP[merchant as string] || config.affiliateTag;
          const redirectUrl = config.urlTemplate.replace('{productId}', productId).replace('{tag}', tag);
          return NextResponse.json({ redirectUrl });
        }
      } catch {
        // Fall through to default
      }

      const redirectUrl = generateDirectUrl(merchant as Merchant, productId, tag);
      return NextResponse.json({ redirectUrl });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "track", "redirect", or type "seed"' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
