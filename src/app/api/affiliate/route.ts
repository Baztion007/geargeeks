import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { Merchant } from '@/lib/types';

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

function dbRowToMerchantConfig(row: DbMerchantRow): MerchantConfig {
  return {
    id: row.merchantId as Merchant,
    name: row.name,
    affiliateTag: row.affiliateTag,
    baseUrl: row.baseUrl,
    urlTemplate: row.urlTemplate,
    enabled: row.enabled === 1,
    priority: row.priority,
    color: row.color,
    icon: row.icon,
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

function dbRowToSettings(row: DbSettingsRow) {
  return {
    linkStrategy: row.linkStrategy as 'direct' | 'redirect' | 'cloaked',
    redirectPrefix: row.redirectPrefix,
    nofollowEnabled: row.nofollowEnabled === 1,
    sponsoredEnabled: row.sponsoredEnabled === 1,
    noopenerEnabled: row.noopenerEnabled === 1,
    openInNewTab: row.openInNewTab === 1,
    clickTracking: row.clickTracking === 1,
    impressionTracking: row.impressionTracking === 1,
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

// ── Helper: Try Prisma model first, fall back to raw SQL ───────────────────

async function getMerchantConfigs(): Promise<MerchantConfig[]> {
  // Try using the Prisma model
  try {
    const rows = await db.affiliateMerchantConfig.findMany({
      orderBy: { priority: 'asc' },
    });
    if (rows.length > 0) {
      return rows.map((r) => ({
        id: r.merchantId as Merchant,
        name: r.name,
        affiliateTag: r.affiliateTag,
        baseUrl: r.baseUrl,
        urlTemplate: r.urlTemplate,
        enabled: r.enabled,
        priority: r.priority,
        color: r.color,
        icon: r.icon,
      }));
    }
  } catch (error) {
    console.error('Prisma model query failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL (works even when Prisma model is stale in dev)
  try {
    const rows = await db.$queryRaw<DbMerchantRow[]>`
      SELECT * FROM AffiliateMerchantConfig ORDER BY priority ASC
    `;
    if (rows.length > 0) {
      return rows.map(dbRowToMerchantConfig);
    }
  } catch {
    // Table might not exist yet
  }

  return [...DEFAULT_MERCHANTS];
}

async function getGlobalSettings() {
  // Try Prisma model first
  try {
    const row = await db.affiliateGlobalSettings.findUnique({
      where: { id: 'default' },
    });
    if (row) {
      return {
        linkStrategy: row.linkStrategy as 'direct' | 'redirect' | 'cloaked',
        redirectPrefix: row.redirectPrefix,
        nofollowEnabled: row.nofollowEnabled,
        sponsoredEnabled: row.sponsoredEnabled,
        noopenerEnabled: row.noopenerEnabled,
        openInNewTab: row.openInNewTab,
        clickTracking: row.clickTracking,
        impressionTracking: row.impressionTracking,
      };
    }
  } catch (error) {
    console.error('Prisma settings query failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    const rows = await db.$queryRaw<DbSettingsRow[]>`
      SELECT * FROM AffiliateGlobalSettings WHERE id = 'default'
    `;
    if (rows.length > 0) {
      return dbRowToSettings(rows[0]);
    }
  } catch {
    // Table might not exist yet
  }

  return DEFAULT_SETTINGS;
}

function toSqlBool(val: any): number {
  if (typeof val === 'boolean') return val ? 1 : 0;
  if (typeof val === 'number') return val;
  return val ? 1 : 0;
}

async function upsertMerchantConfig(merchantId: string, data: Record<string, any>) {
  // Convert boolean fields for SQLite
  const sqlData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'enabled') {
      sqlData[key] = toSqlBool(value);
    } else {
      sqlData[key] = value;
    }
  }

  // Try Prisma model first
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
      // Create requires all non-optional fields — merge with defaults
      const defaultConfig = DEFAULT_MERCHANTS.find((m) => m.id === merchantId);
      const createData = {
        merchantId,
        name: data.name ?? defaultConfig?.name ?? merchantId,
        affiliateTag: data.affiliateTag ?? defaultConfig?.affiliateTag ?? '',
        baseUrl: data.baseUrl ?? defaultConfig?.baseUrl ?? '',
        urlTemplate: data.urlTemplate ?? defaultConfig?.urlTemplate ?? '',
        enabled: data.enabled ?? true,
        priority: data.priority ?? defaultConfig?.priority ?? 99,
        color: data.color ?? defaultConfig?.color ?? '#FF9900',
        icon: data.icon ?? defaultConfig?.icon ?? 'shopping-bag',
      };
      return await db.affiliateMerchantConfig.create({
        data: createData,
      });
    }
  } catch (error) {
    console.error('Prisma merchant upsert failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    // Check if row exists
    const existing = await db.$queryRaw<DbMerchantRow[]>`
      SELECT * FROM AffiliateMerchantConfig WHERE merchantId = ${merchantId}
    `;

    if (existing.length > 0) {
      // UPDATE
      const setClauses: string[] = ['updatedAt = CURRENT_TIMESTAMP'];
      const values: any[] = [];
      for (const [key, value] of Object.entries(sqlData)) {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
      if (setClauses.length > 0) {
        await db.$executeRawUnsafe(
          `UPDATE AffiliateMerchantConfig SET ${setClauses.join(', ')} WHERE merchantId = ?`,
          ...values,
          merchantId
        );
      }
    } else {
      // INSERT — need to generate an ID and set updatedAt since raw SQL doesn't use Prisma defaults
      const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const columns = ['id', 'merchantId', ...Object.keys(sqlData), 'updatedAt'];
      const placeholders = columns.map(() => '?').join(', ');
      const now = new Date().toISOString();
      const values = [id, merchantId, ...Object.values(sqlData), now];
      await db.$executeRawUnsafe(
        `INSERT INTO AffiliateMerchantConfig (${columns.join(', ')}) VALUES (${placeholders})`,
        ...values
      );
    }
  } catch (error) {
    console.error('Raw SQL upsert failed:', error);
    throw error;
  }

  return (await db.$queryRaw<DbMerchantRow[]>`
    SELECT * FROM AffiliateMerchantConfig WHERE merchantId = ${merchantId}
  `)[0];
}

async function upsertGlobalSettings(data: Record<string, any>) {
  // Convert boolean fields for SQLite
  const sqlData: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (['nofollowEnabled', 'sponsoredEnabled', 'noopenerEnabled', 'openInNewTab', 'clickTracking', 'impressionTracking'].includes(key)) {
      sqlData[key] = toSqlBool(value);
    } else {
      sqlData[key] = value;
    }
  }

  // Try Prisma model first
  try {
    return await db.affiliateGlobalSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
  } catch (error) {
    console.error('Prisma settings upsert failed, falling back to raw SQL:', error);
  }

  // Fall back to raw SQL
  try {
    const existing = await db.$queryRaw<DbSettingsRow[]>`
      SELECT * FROM AffiliateGlobalSettings WHERE id = 'default'
    `;

    if (existing.length > 0) {
      const setClauses: string[] = ['updatedAt = CURRENT_TIMESTAMP'];
      const values: any[] = [];
      for (const [key, value] of Object.entries(sqlData)) {
        setClauses.push(`${key} = ?`);
        values.push(value);
      }
      if (setClauses.length > 0) {
        await db.$executeRawUnsafe(
          `UPDATE AffiliateGlobalSettings SET ${setClauses.join(', ')} WHERE id = 'default'`,
          ...values
        );
      }
    } else {
      const columns = ['id', ...Object.keys(sqlData), 'updatedAt'];
      const placeholders = columns.map(() => '?').join(', ');
      const now = new Date().toISOString();
      const values = ['default', ...Object.values(sqlData), now];
      await db.$executeRawUnsafe(
        `INSERT INTO AffiliateGlobalSettings (${columns.join(', ')}) VALUES (${placeholders})`,
        ...values
      );
    }
  } catch (error) {
    console.error('Raw SQL settings upsert failed:', error);
    throw error;
  }

  return (await db.$queryRaw<DbSettingsRow[]>`
    SELECT * FROM AffiliateGlobalSettings WHERE id = 'default'
  `)[0];
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
        const data: Record<string, any> = {};
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
          enabled: true,
          priority: defaultConfig?.priority || 99,
          color: defaultConfig?.color || '#FF9900',
          icon: defaultConfig?.icon || 'shopping-bag',
          ...data,
        });

        const merchant: MerchantConfig = {
          id: merchantId as Merchant,
          name: result.name,
          affiliateTag: result.affiliateTag,
          baseUrl: result.baseUrl,
          urlTemplate: result.urlTemplate,
          enabled: typeof result.enabled === 'number' ? result.enabled === 1 : result.enabled,
          priority: result.priority,
          color: result.color,
          icon: result.icon,
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
        const data: Record<string, any> = {};
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
          settings: {
            linkStrategy: result.linkStrategy,
            redirectPrefix: result.redirectPrefix,
            nofollowEnabled: typeof result.nofollowEnabled === 'number' ? result.nofollowEnabled === 1 : result.nofollowEnabled,
            sponsoredEnabled: typeof result.sponsoredEnabled === 'number' ? result.sponsoredEnabled === 1 : result.sponsoredEnabled,
            noopenerEnabled: typeof result.noopenerEnabled === 'number' ? result.noopenerEnabled === 1 : result.noopenerEnabled,
            openInNewTab: typeof result.openInNewTab === 'number' ? result.openInNewTab === 1 : result.openInNewTab,
            clickTracking: typeof result.clickTracking === 'number' ? result.clickTracking === 1 : result.clickTracking,
            impressionTracking: typeof result.impressionTracking === 'number' ? result.impressionTracking === 1 : result.impressionTracking,
          },
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
        // Check if data already exists using raw SQL
        let existingCount = 0;
        try {
          const countResult = await db.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count FROM AffiliateMerchantConfig
          `;
          // SQLite COUNT returns BigInt in Prisma, convert to Number
          existingCount = Number(countResult[0]?.count ?? 0);
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
