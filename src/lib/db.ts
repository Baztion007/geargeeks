import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Create a Prisma client with the appropriate engine based on DATABASE_URL.
 *
 * - Local development (file: URL): Uses the default PrismaClient with native
 *   SQLite engine. This works in Node.js but NOT on Cloudflare Workers.
 *
 * - Cloudflare / Turso (libsql:// or https: URL): Uses @prisma/adapter-libsql
 *   which works in both Node.js and edge runtimes. The adapter uses the
 *   Web-standard API version of @libsql/client which only supports remote URLs.
 *
 * This dual-path approach ensures both environments work without race conditions.
 */
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || 'file:./db/custom.db'

  // Remote database URL → use the libsql adapter (required for Cloudflare Workers)
  if (!databaseUrl.startsWith('file:')) {
    const config: { url: string; authToken?: string } = { url: databaseUrl }
    if (process.env.DATABASE_AUTH_TOKEN) {
      config.authToken = process.env.DATABASE_AUTH_TOKEN
    }

    const adapter = new PrismaLibSql(config)
    return new PrismaClient({ adapter })
  }

  // Local file: URL → use default PrismaClient with native SQLite engine
  // This works in Node.js (local dev) but will NOT work on Cloudflare Workers
  return new PrismaClient()
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
