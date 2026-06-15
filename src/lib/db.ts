/**
 * Database layer using @libsql/client directly.
 *
 * This replaces Prisma ORM to work reliably on Cloudflare Workers.
 * Prisma's WASM engine + driver adapter combination has persistent bundling
 * issues on Workers. @libsql/client works natively via HTTP.
 *
 * KEY INSIGHT for Cloudflare Workers:
 * - Must use `@libsql/client/web` import (not `@libsql/client/http`)
 * - `/web` uses fetch() which works in Workers; `/http` uses Node.js http which doesn't
 * - Must use HTTPS URL (not libsql:// WebSocket URL)
 * - The default `@libsql/client` import has conditional exports that auto-resolve
 *   to `/web` for `workerd` runtime, but explicit `/web` is more reliable with bundlers
 *
 * CRITICAL FIX: We only import `@libsql/client/web` at the top level.
 * The Node.js `@libsql/client` (default import) is loaded via dynamic import
 * ONLY for local file: databases in development. This prevents the bundler
 * from including Node.js-specific code in the Cloudflare Worker bundle,
 * which was causing "no products" issues on Cloudflare.
 *
 * The API is designed to be a drop-in replacement for the Prisma `db` export,
 * so existing route handlers need minimal changes.
 */

// Only import the web client at top level — this works on Cloudflare Workers
import { createClient as createWebClient, type Client, type InValue } from '@libsql/client/web'

// ─── Client singleton ──────────────────────────────────────────────────────────

const globalForDb = globalThis as unknown as {
  _libsqlClient: Client | undefined
  _libsqlClientType: 'web' | 'local' | undefined
}

let _cachedClient: Client | null = null

/**
 * Get the database client synchronously.
 * For remote (Turso) databases, returns the web client immediately.
 * For local (file:) databases, returns the cached client if already initialized,
 * or creates one via the web client as a fallback (won't work for file: but
 * the async getClientAsync handles proper initialization).
 */
function getClient(): Client {
  // In development, cache on globalThis to survive HMR
  if (process.env.NODE_ENV !== 'production') {
    if (globalForDb._libsqlClient) {
      return globalForDb._libsqlClient
    }
  }

  // In production (Workers), cache for the Worker instance lifetime
  if (_cachedClient) {
    return _cachedClient
  }

  const client = createLibsqlClient()

  if (process.env.NODE_ENV !== 'production') {
    globalForDb._libsqlClient = client
  } else {
    _cachedClient = client
  }
  return client
}

/**
 * Async version of getClient that properly handles local SQLite via dynamic import.
 * For remote (Turso) databases, this is effectively the same as getClient().
 * For local (file:) databases, this dynamically imports @libsql/client to
 * avoid bundling Node.js code into the Cloudflare Worker bundle.
 */
async function getClientAsync(): Promise<Client> {
  // Check cache first
  if (process.env.NODE_ENV !== 'production' && globalForDb._libsqlClient && globalForDb._libsqlClientType === 'local') {
    return globalForDb._libsqlClient
  }
  if (_cachedClient) {
    return _cachedClient
  }

  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'

  // Remote database — web client works synchronously
  if (!databaseUrl.startsWith('file:')) {
    const client = createLibsqlClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForDb._libsqlClient = client
      globalForDb._libsqlClientType = 'web'
    } else {
      _cachedClient = client
    }
    return client
  }

  // Local file: database — need dynamic import of Node.js client
  try {
    const libsqlModule = await import('@libsql/client')
    const client = libsqlModule.createClient({ url: databaseUrl }) as Client
    if (process.env.NODE_ENV !== 'production') {
      globalForDb._libsqlClient = client
      globalForDb._libsqlClientType = 'local'
    } else {
      _cachedClient = client
    }
    return client
  } catch (error) {
    console.error('[db] Failed to dynamically import @libsql/client for local SQLite:', error)
    // Fallback to web client (won't work for file: but provides a clear error)
    const client = createLibsqlClient()
    if (process.env.NODE_ENV !== 'production') {
      globalForDb._libsqlClient = client
      globalForDb._libsqlClientType = 'web'
    } else {
      _cachedClient = client
    }
    return client
  }
}

function createLibsqlClient(): Client {
  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
  const authToken = process.env.DATABASE_AUTH_TOKEN

  // Remote database (Turso): Use web client (fetch-based) with HTTPS URL
  if (!databaseUrl.startsWith('file:')) {
    // Convert libsql:// URL to https:// for the web client
    let httpUrl = databaseUrl
    if (httpUrl.startsWith('libsql://')) {
      httpUrl = 'https://' + httpUrl.slice('libsql://'.length)
    }

    return createWebClient({
      url: httpUrl,
      authToken: authToken || undefined,
    }) as Client
  }

  // Local file: database in development — use web client as bridge
  // The getClientAsync() will replace this with the proper local client
  return createWebClient({
    url: databaseUrl,
  }) as Client
}

/**
 * Test the database connection by running a simple query.
 * Returns connection status and error info if it fails.
 */
export async function testConnection(): Promise<{ ok: boolean; error?: string; url?: string; latencyMs?: number }> {
  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'
  const maskedUrl = databaseUrl.startsWith('file:')
    ? databaseUrl
    : databaseUrl.substring(0, 30) + '...'

  try {
    const client = await getClientAsync()
    const start = Date.now()
    await client.execute('SELECT 1 as test')
    const latencyMs = Date.now() - start
    return { ok: true, url: maskedUrl, latencyMs }
  } catch (error) {
    return {
      ok: false,
      url: maskedUrl,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// ─── Helper types ───────────────────────────────────────────────────────────────

/** A row from the database is always Record<string, unknown> */
type DbRow = Record<string, unknown>

/** Safe JSON parser — returns fallback on failure */
function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return fallback }
  }
  return val as T
}

/** Safe JSON stringify — returns string representation */
function safeJsonStringify(val: unknown): string {
  if (typeof val === 'string') return val
  if (val === null || val === undefined) return '[]'
  try { return JSON.stringify(val) } catch { return '[]' }
}

function safeJsonStringifyObj(val: unknown): string {
  if (typeof val === 'string') return val
  if (val === null || val === undefined) return '{}'
  try { return JSON.stringify(val) } catch { return '{}' }
}

/** Generate a CUID-like ID */
function generateId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `c${timestamp}${random}`
}

/** Escape a string for SQL LIKE */
function escapeLike(str: string): string {
  return str.replace(/[%_\\]/g, '\\$&')
}

// ─── Product helpers ────────────────────────────────────────────────────────────

const PRODUCT_JSON_ARRAY_FIELDS = ['gallery', 'pros', 'cons', 'tags', 'bestFor', 'relatedProducts'] as const
const PRODUCT_JSON_OBJECT_FIELDS = ['features', 'ratingBreakdown', 'specifications'] as const

function parseProductRow(row: DbRow): DbRow {
  const parsed = { ...row }
  for (const field of PRODUCT_JSON_ARRAY_FIELDS) {
    parsed[field] = safeJsonParse(row[field], [])
  }
  for (const field of PRODUCT_JSON_OBJECT_FIELDS) {
    parsed[field] = safeJsonParse(row[field], {})
  }
  return parsed
}

function stringifyProductData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data }
  for (const field of PRODUCT_JSON_ARRAY_FIELDS) {
    if (result[field] !== undefined) {
      result[field] = safeJsonStringify(result[field])
    }
  }
  for (const field of PRODUCT_JSON_OBJECT_FIELDS) {
    if (result[field] !== undefined) {
      result[field] = safeJsonStringifyObj(result[field])
    }
  }
  return result
}

// ─── Brand helpers ──────────────────────────────────────────────────────────────

function parseBrandRow(row: DbRow): DbRow {
  return { ...row, categories: safeJsonParse(row['categories'], []) }
}

function stringifyBrandData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data }
  if (result.categories !== undefined) {
    result.categories = safeJsonStringify(result.categories)
  }
  return result
}

// ─── Build WHERE clause from conditions ─────────────────────────────────────────

function buildWhereClause(conditions: string[], params: InValue[]): string {
  if (conditions.length === 0) return ''
  return ' WHERE ' + conditions.join(' AND ')
}

function buildWhereFromObj(where: Record<string, unknown>, params: InValue[]): string[] {
  const conditions: string[] = []
  if (where.categorySlug) {
    conditions.push('categorySlug = ?')
    params.push(where.categorySlug as InValue)
  }
  if (where.brandSlug) {
    conditions.push('brandSlug = ?')
    params.push(where.brandSlug as InValue)
  }
  if (where.OR && Array.isArray(where.OR)) {
    const orConditions: string[] = []
    for (const orClause of where.OR as Record<string, unknown>[]) {
      for (const [key, val] of Object.entries(orClause)) {
        if (val && typeof val === 'object' && 'contains' in (val as Record<string, unknown>)) {
          orConditions.push(`${key} LIKE ? ESCAPE '\\'`)
          params.push(`%${escapeLike(String((val as Record<string, unknown>).contains))}%` as InValue)
        }
      }
    }
    if (orConditions.length > 0) {
      conditions.push(`(${orConditions.join(' OR ')})`)
    }
  }
  return conditions
}

// ─── Table: Product ─────────────────────────────────────────────────────────────

const productTable = {
  async findMany(opts?: {
    where?: Record<string, unknown>
    orderBy?: Record<string, string>
    take?: number
    skip?: number
  }): Promise<DbRow[]> {
    const client = await getClientAsync()
    let sql = 'SELECT * FROM Product'
    const params: InValue[] = []
    const conditions: string[] = []

    if (opts?.where) {
      conditions.push(...buildWhereFromObj(opts.where, params))
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    // ORDER BY — use publishedAt if available, otherwise fallback to rowid
    if (opts?.orderBy) {
      const [field, direction] = Object.entries(opts.orderBy)[0]
      sql += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    if (opts?.take) {
      sql += ' LIMIT ?'
      params.push(opts.take)
    }
    if (opts?.skip) {
      if (!opts.take) {
        sql += ' LIMIT 1000000'
      }
      sql += ' OFFSET ?'
      params.push(opts.skip)
    }

    const result = await client.execute({ sql, args: params })
    return result.rows.map(row => parseProductRow(row as DbRow))
  },

  async count(opts?: { where?: Record<string, unknown> }): Promise<number> {
    const client = await getClientAsync()
    let sql = 'SELECT COUNT(*) as cnt FROM Product'
    const params: InValue[] = []

    if (opts?.where) {
      const conditions = buildWhereFromObj(opts.where, params)
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ')
      }
    }

    const result = await client.execute({ sql, args: params })
    return Number(result.rows[0]?.cnt ?? 0)
  },

  async findUnique(opts: { where: { slug: string } | { id: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    let sql: string
    let params: InValue[]

    if ('slug' in opts.where) {
      sql = 'SELECT * FROM Product WHERE slug = ? LIMIT 1'
      params = [opts.where.slug]
    } else {
      sql = 'SELECT * FROM Product WHERE id = ? LIMIT 1'
      params = [opts.where.id]
    }

    const result = await client.execute({ sql, args: params })
    if (result.rows.length === 0) return null
    return parseProductRow(result.rows[0] as DbRow)
  },

  async findFirst(opts: { where: Record<string, unknown> }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const conditions: string[] = []
    const params: InValue[] = []

    for (const [key, val] of Object.entries(opts.where)) {
      conditions.push(`${key} = ?`)
      params.push(val as InValue)
    }

    const sql = `SELECT * FROM Product WHERE ${conditions.join(' AND ')} LIMIT 1`
    const result = await client.execute({ sql, args: params })
    if (result.rows.length === 0) return null
    return parseProductRow(result.rows[0] as DbRow)
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = stringifyProductData(opts.data)

    if (!data.id) data.id = generateId()
    const now = new Date().toISOString()
    if (!data.publishedAt) data.publishedAt = now
    data.updatedAt = now

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    const sql = `INSERT INTO Product (${columns.join(', ')}) VALUES (${placeholders})`
    await client.execute({ sql, args: values })

    const created = await productTable.findUnique({ where: { slug: String(data.slug) } })
    return created || data
  },

  async update(opts: { where: { slug: string } | { id: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = stringifyProductData(opts.data)
    data.updatedAt = new Date().toISOString()

    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[]]

    let whereClause: string
    if ('slug' in opts.where) {
      whereClause = 'slug = ?'
      values.push(opts.where.slug)
    } else {
      whereClause = 'id = ?'
      values.push(opts.where.id)
    }

    const sql = `UPDATE Product SET ${setClauses.join(', ')} WHERE ${whereClause}`
    await client.execute({ sql, args: values })

    const updated = await productTable.findUnique({ where: opts.where as { slug: string } })
    return updated || data
  },

  async delete(opts: { where: { slug: string } | { id: string } }): Promise<void> {
    const client = await getClientAsync()
    let sql: string
    let params: InValue[]

    if ('slug' in opts.where) {
      sql = 'DELETE FROM Product WHERE slug = ?'
      params = [opts.where.slug]
    } else {
      sql = 'DELETE FROM Product WHERE id = ?'
      params = [opts.where.id]
    }

    await client.execute({ sql, args: params })
  },
}

// ─── Table: CategoryDB ──────────────────────────────────────────────────────────

const categoryDBTable = {
  async findMany(opts?: { orderBy?: Record<string, string> }): Promise<DbRow[]> {
    const client = await getClientAsync()
    let sql = 'SELECT * FROM CategoryDB'

    if (opts?.orderBy) {
      const [field, direction] = Object.entries(opts.orderBy)[0]
      sql += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    const result = await client.execute(sql)
    return result.rows as DbRow[]
  },

  async count(): Promise<number> {
    const client = await getClientAsync()
    const result = await client.execute('SELECT COUNT(*) as cnt FROM CategoryDB')
    return Number(result.rows[0]?.cnt ?? 0)
  },

  async findUnique(opts: { where: { slug: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM CategoryDB WHERE slug = ? LIMIT 1',
      args: [opts.where.slug],
    })
    if (result.rows.length === 0) return null
    return result.rows[0] as DbRow
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }
    if (!data.id) data.id = generateId()

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO CategoryDB (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    const created = await categoryDBTable.findUnique({ where: { slug: String(data.slug) } })
    return created || data
  },

  async update(opts: { where: { slug: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = opts.data
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[], opts.where.slug]

    await client.execute({
      sql: `UPDATE CategoryDB SET ${setClauses.join(', ')} WHERE slug = ?`,
      args: values,
    })

    const updated = await categoryDBTable.findUnique({ where: { slug: opts.where.slug } })
    return updated || data
  },

  async delete(opts: { where: { slug: string } }): Promise<void> {
    const client = await getClientAsync()
    await client.execute({
      sql: 'DELETE FROM CategoryDB WHERE slug = ?',
      args: [opts.where.slug],
    })
  },
}

// ─── Table: BrandDB ─────────────────────────────────────────────────────────────

const brandDBTable = {
  async findMany(opts?: { orderBy?: Record<string, string> }): Promise<DbRow[]> {
    const client = await getClientAsync()
    let sql = 'SELECT * FROM BrandDB'

    if (opts?.orderBy) {
      const [field, direction] = Object.entries(opts.orderBy)[0]
      sql += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    const result = await client.execute(sql)
    return result.rows.map(row => parseBrandRow(row as DbRow))
  },

  async count(): Promise<number> {
    const client = await getClientAsync()
    const result = await client.execute('SELECT COUNT(*) as cnt FROM BrandDB')
    return Number(result.rows[0]?.cnt ?? 0)
  },

  async findUnique(opts: { where: { slug: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM BrandDB WHERE slug = ? LIMIT 1',
      args: [opts.where.slug],
    })
    if (result.rows.length === 0) return null
    return parseBrandRow(result.rows[0] as DbRow)
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = stringifyBrandData(opts.data)

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO BrandDB (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    const created = await brandDBTable.findUnique({ where: { slug: String(data.slug) } })
    return created || data
  },

  async update(opts: { where: { slug: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = stringifyBrandData(opts.data)
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[], opts.where.slug]

    await client.execute({
      sql: `UPDATE BrandDB SET ${setClauses.join(', ')} WHERE slug = ?`,
      args: values,
    })

    const updated = await brandDBTable.findUnique({ where: { slug: opts.where.slug } })
    return updated || data
  },

  async delete(opts: { where: { slug: string } }): Promise<void> {
    const client = await getClientAsync()
    await client.execute({
      sql: 'DELETE FROM BrandDB WHERE slug = ?',
      args: [opts.where.slug],
    })
  },
}

// ─── Table: ContactMessage (mapped to contact_messages) ─────────────────────────

const contactMessageTable = {
  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }
    if (!data.id) data.id = generateId()
    data.createdAt = new Date().toISOString()
    if (data.isRead === undefined) data.isRead = 0

    // Map field names to column names
    const columnMap: Record<string, string> = { ipAddress: 'ip_address' }
    const mappedData: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(data)) {
      mappedData[columnMap[key] || key] = val
    }

    const columns = Object.keys(mappedData)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => mappedData[k] as InValue)

    await client.execute({
      sql: `INSERT INTO contact_messages (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    return data
  },

  async findMany(opts: { orderBy?: Record<string, string>; take?: number }): Promise<DbRow[]> {
    const client = await getClientAsync()
    let sql = 'SELECT * FROM contact_messages'
    const args: InValue[] = []

    if (opts?.orderBy) {
      const [field, direction] = Object.entries(opts.orderBy)[0]
      sql += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`
    } else {
      sql += ' ORDER BY createdAt DESC'
    }

    if (opts?.take) {
      sql += ' LIMIT ?'
      args.push(opts.take)
    }

    const result = await client.execute({ sql, args })
    return result.rows.map(row => {
      const r = row as DbRow
      if ('ip_address' in r) {
        r.ipAddress = r.ip_address
        delete r.ip_address
      }
      return r
    })
  },

  async count(): Promise<number> {
    const client = await getClientAsync()
    const result = await client.execute('SELECT COUNT(*) as cnt FROM contact_messages')
    return Number(result.rows[0]?.cnt ?? 0)
  },

  async update(opts: { where: { id: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }

    // Map field names
    const columnMap: Record<string, string> = { ipAddress: 'ip_address' }
    const mappedData: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(data)) {
      mappedData[columnMap[key] || key] = val
    }

    const setClauses = Object.keys(mappedData).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(mappedData) as InValue[], opts.where.id]

    await client.execute({
      sql: `UPDATE contact_messages SET ${setClauses.join(', ')} WHERE id = ?`,
      args: values,
    })

    return { ...opts.data, id: opts.where.id }
  },

  async delete(opts: { where: { id: string } }): Promise<void> {
    const client = await getClientAsync()
    await client.execute({
      sql: 'DELETE FROM contact_messages WHERE id = ?',
      args: [opts.where.id],
    })
  },
}

// ─── Table: NewsletterSubscriber ────────────────────────────────────────────────

const newsletterSubscriberTable = {
  async findUnique(opts: { where: { email: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM NewsletterSubscriber WHERE email = ? LIMIT 1',
      args: [opts.where.email],
    })
    if (result.rows.length === 0) return null
    return result.rows[0] as DbRow
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }
    if (!data.id) data.id = generateId()
    data.createdAt = new Date().toISOString()
    if (data.active === undefined) data.active = 1

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO NewsletterSubscriber (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    return data
  },

  async update(opts: { where: { email: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = opts.data
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[], opts.where.email]

    await client.execute({
      sql: `UPDATE NewsletterSubscriber SET ${setClauses.join(', ')} WHERE email = ?`,
      args: values,
    })

    return { ...data, email: opts.where.email }
  },
}

// ─── Table: UserReview ─────────────────────────────────────────────────────────

const userReviewTable = {
  async findMany(opts: { where: Record<string, unknown>; orderBy?: Record<string, string>[] | Record<string, string> }): Promise<DbRow[]> {
    const client = await getClientAsync()
    const conditions: string[] = []
    const params: InValue[] = []

    for (const [key, val] of Object.entries(opts.where)) {
      conditions.push(`${key} = ?`)
      params.push(val as InValue)
    }

    let sql = `SELECT * FROM UserReview WHERE ${conditions.join(' AND ')}`

    // Support both array and object orderBy
    if (opts.orderBy) {
      if (Array.isArray(opts.orderBy)) {
        const orderClauses = opts.orderBy.map((o: Record<string, string>) => {
          const [field, dir] = Object.entries(o)[0]
          return `${field} ${dir === 'desc' ? 'DESC' : 'ASC'}`
        })
        sql += ` ORDER BY ${orderClauses.join(', ')}`
      } else {
        const orderClauses = Object.entries(opts.orderBy).map(([field, dir]) =>
          `${field} ${dir === 'desc' ? 'DESC' : 'ASC'}`
        )
        sql += ` ORDER BY ${orderClauses.join(', ')}`
      }
    }

    const result = await client.execute({ sql, args: params })
    return result.rows as DbRow[]
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }
    if (!data.id) data.id = generateId()
    data.createdAt = new Date().toISOString()
    if (data.helpful === undefined) data.helpful = 0
    if (data.verified === undefined) data.verified = 0

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO UserReview (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    return data
  },

  async update(opts: { where: { id: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = opts.data

    // Handle increment: { helpful: { increment: 1 } }
    const setClauses: string[] = []
    const values: InValue[] = []

    for (const [key, val] of Object.entries(data)) {
      if (val && typeof val === 'object' && 'increment' in (val as Record<string, unknown>)) {
        setClauses.push(`${key} = ${key} + ?`)
        values.push((val as Record<string, unknown>).increment as InValue)
      } else {
        setClauses.push(`${key} = ?`)
        values.push(val as InValue)
      }
    }

    values.push(opts.where.id)

    await client.execute({
      sql: `UPDATE UserReview SET ${setClauses.join(', ')} WHERE id = ?`,
      args: values,
    })

    return { ...data, id: opts.where.id }
  },
}

// ─── Table: PriceAlert ──────────────────────────────────────────────────────────

const priceAlertTable = {
  async findUnique(opts: { where: { email_productSlug: { email: string; productSlug: string } } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM PriceAlert WHERE email = ? AND productSlug = ? LIMIT 1',
      args: [opts.where.email_productSlug.email, opts.where.email_productSlug.productSlug],
    })
    if (result.rows.length === 0) return null
    return result.rows[0] as DbRow
  },

  async findMany(opts: { where: Record<string, unknown>; orderBy?: Record<string, string> }): Promise<DbRow[]> {
    const client = await getClientAsync()
    const conditions: string[] = []
    const params: InValue[] = []

    for (const [key, val] of Object.entries(opts.where)) {
      conditions.push(`${key} = ?`)
      params.push(val as InValue)
    }

    let sql = `SELECT * FROM PriceAlert WHERE ${conditions.join(' AND ')}`

    if (opts.orderBy) {
      const [field, direction] = Object.entries(opts.orderBy)[0]
      sql += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    const result = await client.execute({ sql, args: params })
    return result.rows as DbRow[]
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }
    if (!data.id) data.id = generateId()
    data.createdAt = new Date().toISOString()
    if (data.active === undefined) data.active = 1

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO PriceAlert (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    return data
  },

  async update(opts: { where: { id: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = opts.data
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[], opts.where.id]

    await client.execute({
      sql: `UPDATE PriceAlert SET ${setClauses.join(', ')} WHERE id = ?`,
      args: values,
    })

    return { ...data, id: opts.where.id }
  },
}

// ─── Table: AffiliateMerchantConfig ─────────────────────────────────────────────

const affiliateMerchantConfigTable = {
  async findMany(opts?: { orderBy?: Record<string, string> }): Promise<DbRow[]> {
    const client = await getClientAsync()
    let sql = 'SELECT * FROM AffiliateMerchantConfig'

    if (opts?.orderBy) {
      const [field, direction] = Object.entries(opts.orderBy)[0]
      sql += ` ORDER BY ${field} ${direction === 'desc' ? 'DESC' : 'ASC'}`
    }

    const result = await client.execute(sql)
    return result.rows as DbRow[]
  },

  async findUnique(opts: { where: { merchantId: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM AffiliateMerchantConfig WHERE merchantId = ? LIMIT 1',
      args: [opts.where.merchantId],
    })
    if (result.rows.length === 0) return null
    return result.rows[0] as DbRow
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data }
    if (!data.id) data.id = generateId()
    data.updatedAt = new Date().toISOString()
    if (data.enabled === undefined) data.enabled = 1
    if (data.priority === undefined) data.priority = 1

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO AffiliateMerchantConfig (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    return data
  },

  async update(opts: { where: { merchantId: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = { ...opts.data, updatedAt: new Date().toISOString() }
    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[], opts.where.merchantId]

    await client.execute({
      sql: `UPDATE AffiliateMerchantConfig SET ${setClauses.join(', ')} WHERE merchantId = ?`,
      args: values,
    })

    const updated = await affiliateMerchantConfigTable.findUnique({ where: { merchantId: opts.where.merchantId } })
    return updated || data
  },

  async upsert(opts: { where: { id: string }; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<DbRow> {
    const merchantId = (opts.create as Record<string, unknown>).merchantId as string
    const existing = await affiliateMerchantConfigTable.findUnique({ where: { merchantId } })
    if (existing) {
      return affiliateMerchantConfigTable.update({
        where: { merchantId: (opts.update as Record<string, unknown>).merchantId as string || merchantId },
        data: opts.update,
      })
    }
    return affiliateMerchantConfigTable.create({ data: opts.create })
  },
}

// ─── Table: AffiliateGlobalSettings ─────────────────────────────────────────────

const affiliateGlobalSettingsTable = {
  async findUnique(opts: { where: { id: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM AffiliateGlobalSettings WHERE id = ? LIMIT 1',
      args: [opts.where.id],
    })
    if (result.rows.length === 0) return null
    return result.rows[0] as DbRow
  },

  async upsert(opts: { where: { id: string }; update: Record<string, unknown>; create: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const existing = await affiliateGlobalSettingsTable.findUnique({ where: { id: opts.where.id } })

    if (existing) {
      const data = { ...opts.update, updatedAt: new Date().toISOString() }
      const setClauses = Object.keys(data).map(k => `${k} = ?`)
      const values: InValue[] = [...Object.values(data) as InValue[], opts.where.id]

      await client.execute({
        sql: `UPDATE AffiliateGlobalSettings SET ${setClauses.join(', ')} WHERE id = ?`,
        args: values,
      })
    } else {
      const data = { ...opts.create }
      if (!data.id) data.id = opts.where.id
      data.updatedAt = new Date().toISOString()

      const columns = Object.keys(data)
      const placeholders = columns.map(() => '?').join(', ')
      const values: InValue[] = columns.map(k => data[k] as InValue)

      await client.execute({
        sql: `INSERT INTO AffiliateGlobalSettings (${columns.join(', ')}) VALUES (${placeholders})`,
        args: values,
      })
    }

    const result = await affiliateGlobalSettingsTable.findUnique({ where: { id: opts.where.id } })
    return result as DbRow
  },
}

// ─── Table: BlogPost ────────────────────────────────────────────────────────────

const BLOG_JSON_ARRAY_FIELDS = ['tags'] as const

function parseBlogPostRow(row: DbRow): DbRow {
  const parsed = { ...row }
  for (const field of BLOG_JSON_ARRAY_FIELDS) {
    parsed[field] = safeJsonParse(row[field], [])
  }
  return parsed
}

function stringifyBlogPostData(data: Record<string, unknown>): Record<string, unknown> {
  const result = { ...data }
  for (const field of BLOG_JSON_ARRAY_FIELDS) {
    if (result[field] !== undefined) {
      result[field] = safeJsonStringify(result[field])
    }
  }
  return result
}

const blogPostTable = {
  async findMany(opts?: {
    where?: Record<string, unknown>
    orderBy?: Record<string, string> | Array<Record<string, string>>
    take?: number
    skip?: number
  }): Promise<DbRow[]> {
    const client = await getClientAsync()
    let sql = 'SELECT * FROM BlogPost'
    const params: InValue[] = []

    const conditions: string[] = []
    if (opts?.where) {
      if (opts.where.slug) {
        conditions.push('slug = ?')
        params.push(opts.where.slug as InValue)
      }
      if (opts.where.category) {
        conditions.push('category = ?')
        params.push(opts.where.category as InValue)
      }
      if (opts.where.authorSlug) {
        conditions.push('authorSlug = ?')
        params.push(opts.where.authorSlug as InValue)
      }
    }
    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ')
    }

    // Order by
    if (opts?.orderBy) {
      const orderParts: string[] = []
      if (Array.isArray(opts.orderBy)) {
        for (const ob of opts.orderBy) {
          for (const [key, dir] of Object.entries(ob)) {
            orderParts.push(`${key} ${dir === 'desc' ? 'DESC' : 'ASC'}`)
          }
        }
      } else {
        for (const [key, dir] of Object.entries(opts.orderBy)) {
          orderParts.push(`${key} ${dir === 'desc' ? 'DESC' : 'ASC'}`)
        }
      }
      if (orderParts.length > 0) sql += ' ORDER BY ' + orderParts.join(', ')
    } else {
      sql += ' ORDER BY publishedAt DESC'
    }

    if (opts?.take) sql += ` LIMIT ${opts.take}`
    if (opts?.skip) sql += ` OFFSET ${opts.skip}`

    const result = await client.execute({ sql, args: params })
    return result.rows.map(row => parseBlogPostRow(row as DbRow))
  },

  async count(opts?: { where?: Record<string, unknown> }): Promise<number> {
    const client = await getClientAsync()
    let sql = 'SELECT COUNT(*) as cnt FROM BlogPost'
    const params: InValue[] = []

    if (opts?.where) {
      const conditions: string[] = []
      if (opts.where.category) {
        conditions.push('category = ?')
        params.push(opts.where.category as InValue)
      }
      if (opts.where.authorSlug) {
        conditions.push('authorSlug = ?')
        params.push(opts.where.authorSlug as InValue)
      }
      if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ')
    }

    const result = await client.execute({ sql, args: params })
    return Number(result.rows[0]?.cnt ?? 0)
  },

  async findUnique(opts: { where: { slug: string } }): Promise<DbRow | null> {
    const client = await getClientAsync()
    const result = await client.execute({
      sql: 'SELECT * FROM BlogPost WHERE slug = ? LIMIT 1',
      args: [opts.where.slug],
    })
    if (result.rows.length === 0) return null
    return parseBlogPostRow(result.rows[0] as DbRow)
  },

  async create(opts: { data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = stringifyBlogPostData(opts.data)

    if (!data.id) data.id = generateId()
    const now = new Date().toISOString()
    if (!data.publishedAt) data.publishedAt = now
    if (!data.updatedAt) data.updatedAt = now
    if (!data.readingTime) data.readingTime = 5

    const columns = Object.keys(data)
    const placeholders = columns.map(() => '?').join(', ')
    const values: InValue[] = columns.map(k => data[k] as InValue)

    await client.execute({
      sql: `INSERT INTO BlogPost (${columns.join(', ')}) VALUES (${placeholders})`,
      args: values,
    })

    const result = await blogPostTable.findUnique({ where: { slug: String(data.slug) } })
    return result as DbRow
  },

  async update(opts: { where: { slug: string }; data: Record<string, unknown> }): Promise<DbRow> {
    const client = await getClientAsync()
    const data = stringifyBlogPostData(opts.data)
    data.updatedAt = new Date().toISOString()

    const setClauses = Object.keys(data).map(k => `${k} = ?`)
    const values: InValue[] = [...Object.values(data) as InValue[], opts.where.slug]

    await client.execute({
      sql: `UPDATE BlogPost SET ${setClauses.join(', ')} WHERE slug = ?`,
      args: values,
    })

    const result = await blogPostTable.findUnique({ where: { slug: opts.where.slug } })
    return result as DbRow
  },

  async delete(opts: { where: { slug: string } }): Promise<DbRow> {
    const client = await getClientAsync()
    const existing = await blogPostTable.findUnique({ where: { slug: opts.where.slug } })
    if (!existing) throw new Error('BlogPost not found')

    await client.execute({
      sql: 'DELETE FROM BlogPost WHERE slug = ?',
      args: [opts.where.slug],
    })

    return existing
  },
}

// ─── Raw SQL access (for affiliate route's fallback queries) ────────────────────

async function $queryRaw<T = DbRow[]>(sql: string, ...args: InValue[]): Promise<T> {
  const client = await getClientAsync()
  const result = await client.execute({ sql, args })
  return result.rows as T
}

async function $executeRawUnsafe(sql: string, ...args: InValue[]): Promise<void> {
  const client = await getClientAsync()
  await client.execute({ sql, args })
}

// ─── Export the db object (drop-in replacement for PrismaClient) ────────────────

export const db = {
  product: productTable,
  categoryDB: categoryDBTable,
  brandDB: brandDBTable,
  blogPost: blogPostTable,
  contactMessage: contactMessageTable,
  newsletterSubscriber: newsletterSubscriberTable,
  userReview: userReviewTable,
  priceAlert: priceAlertTable,
  affiliateMerchantConfig: affiliateMerchantConfigTable,
  affiliateGlobalSettings: affiliateGlobalSettingsTable,
  $queryRaw,
  $executeRawUnsafe,
}

// Re-export helpers for route files
export { generateId, parseProductRow, stringifyProductData, parseBrandRow, stringifyBrandData, safeJsonParse, safeJsonStringify, safeJsonStringifyObj }
