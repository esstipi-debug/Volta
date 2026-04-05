/**
 * Supabase Database Connection
 * PostgreSQL + Auth + RLS integration
 */

import { createClient } from '@supabase/supabase-js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/src/db/schema'

// Supabase client for auth + storage
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Postgres connection for Drizzle ORM
let postgresClient: postgres.Sql | null = null
let db: ReturnType<typeof drizzle> | null = null

/**
 * Get Drizzle ORM instance with Supabase PostgreSQL
 */
export function getDb() {
  if (!db) {
    if (!postgresClient) {
      const connectionString = process.env.DATABASE_URL
      if (!connectionString) {
        throw new Error('DATABASE_URL not set')
      }

      postgresClient = postgres(connectionString, {
        max: 5, // Connection pool size
        idle_timeout: 10, // Idle timeout in seconds
        connect_timeout: 5, // Connection timeout in seconds
      })
    }

    db = drizzle(postgresClient, { schema })
  }

  return db
}

/**
 * Get authenticated user from Supabase session
 */
export async function getAuthenticatedUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Close database connection
 */
export async function closeDb() {
  if (postgresClient) {
    await postgresClient.end()
    postgresClient = null
    db = null
  }
}
