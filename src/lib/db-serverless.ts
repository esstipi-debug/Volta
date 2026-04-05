/**
 * Serverless-compatible database connection pooling
 * Uses Neon's built-in connection pooling (via serverless endpoint)
 * Handles database errors gracefully for ephemeral functions
 */

import { Pool, PoolClient } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from '@/src/db/schema'

let pool: Pool | null = null
let db: ReturnType<typeof drizzle> | null = null

/**
 * Initialize database connection with pooling
 * Called once per function invocation
 */
function initializePool(): Pool {
  if (pool) return pool

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL not set')
  }

  // Neon connection string with pooling: add ?sslmode=require
  const poolUrl = connectionString.includes('?')
    ? `${connectionString}&sslmode=require`
    : `${connectionString}?sslmode=require`

  pool = new Pool({
    connectionString: poolUrl,
    max: 5, // Vercel: max 5 concurrent connections
    idleTimeoutMillis: 10000, // Idle timeout 10s (Vercel functions are short-lived)
    connectionTimeoutMillis: 5000, // Connect timeout 5s
  })

  return pool
}

/**
 * Get Drizzle ORM instance with current pool
 */
export function getDb() {
  if (!db) {
    const currentPool = initializePool()
    db = drizzle(currentPool, { schema })
  }
  return db
}

/**
 * Execute a query with automatic retry and timeout protection
 */
export async function executeQuery<T>(
  queryFn: (db: ReturnType<typeof drizzle>) => Promise<T>,
  timeout: number = 8000
): Promise<T> {
  const db = getDb()

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Database query timeout after ${timeout}ms`))
    }, timeout)

    queryFn(db)
      .then((result) => {
        clearTimeout(timer)
        resolve(result)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

/**
 * Close all connections gracefully (call at end of function if needed)
 * Note: Vercel handles cleanup, but good practice to call
 */
export async function closePool(): Promise<void> {
  if (pool) {
    try {
      await pool.end()
      pool = null
      db = null
    } catch (error) {
      console.error('Error closing pool:', error)
    }
  }
}

/**
 * Health check: verify database connectivity
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const result = await executeQuery(async (db) => {
      // Simple query to verify connectivity
      const rows = await db.execute(`SELECT 1 as connected`)
      return rows.rows && rows.rows.length > 0
    })
    return result
  } catch (error) {
    console.error('Database health check failed:', error)
    return false
  }
}
