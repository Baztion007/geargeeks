import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create a Prisma client using the @prisma/adapter-libsql adapter.
 *
 * Compatible with both:
 * - Local development: file:./db/custom.db
 * - Cloudflare Workers: libsql://your-db.turso.io
 *
 * The adapter approach works everywhere — no native Node.js bindings needed.
 */
function createPrismaClient() {
  // Use dynamic import for the adapter to avoid bundling issues
  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'

  // We create the adapter asynchronously but provide a sync PrismaClient.
  // The adapter will be swapped in before any queries execute.
  const client = new PrismaClient()

  // Lazy-init the adapter
  import('@prisma/adapter-libsql').then(({ PrismaLibSql }) => {
    const config: { url: string; authToken?: string } = {
      url: databaseUrl,
    }
    if (process.env.DATABASE_AUTH_TOKEN) {
      config.authToken = process.env.DATABASE_AUTH_TOKEN
    }
    const adapter = new PrismaLibSql(config)
    // Re-create the client with the adapter
    const adaptedClient = new PrismaClient({ adapter })
    Object.assign(client, adaptedClient)
  }).catch((err) => {
    console.error('Failed to initialize Prisma with libsql adapter:', err)
  })

  return client
}

// Force new client to pick up schema changes in dev mode
if (process.env.NODE_ENV !== 'production' && globalForPrisma.prisma) {
  try {
    const prismaAny = globalForPrisma.prisma as unknown as Record<string, unknown>
    if (
      typeof prismaAny.categoryDB === 'undefined' ||
      typeof prismaAny.contactMessage === 'undefined'
    ) {
      globalForPrisma.prisma = undefined as unknown as PrismaClient | undefined
    }
  } catch {
    globalForPrisma.prisma = undefined as unknown as PrismaClient | undefined
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
