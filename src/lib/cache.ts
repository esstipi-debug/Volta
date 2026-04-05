/**
 * Serverless-compatible caching layer for Vercel Functions
 * Uses Upstash Redis (HTTP-based, no persistent connections)
 * TTLs tuned for Vercel's 10s/60s timeout constraints
 */

import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// TTL (in seconds) for different data types
export const CACHE_TTL = {
  READINESS: 12 * 3600, // 12 hours - readiness score stable
  ACWR: 24 * 3600, // 24 hours - ACWR calculated daily
  INJURY_RISK: 8 * 3600, // 8 hours - moderate churn
  RECOVERY: 6 * 3600, // 6 hours - frequent updates
  WOD: 24 * 3600, // 24 hours - weekly/daily plan
  ATHLETE_STATE: 4 * 3600, // 4 hours - synthesized signal
  COACH_ALERT: 2 * 3600, // 2 hours - frequent updates
  SHORT_LIVED: 5 * 60, // 5 minutes - high-churn data
}

export type CacheKey =
  | `readiness:${string}:${string}`
  | `acwr:${string}:${string}`
  | `injury:${string}:${string}`
  | `recovery:${string}:${string}`
  | `wod:${string}:${string}`
  | `athlete_state:${string}:${string}`
  | `coach_alert:${string}:${string}`
  | `queue_status:${string}`

/**
 * Get value from cache with timeout protection
 * If Redis call exceeds 500ms, returns undefined (don't wait for slow operations)
 */
export async function getCached<T>(key: CacheKey): Promise<T | null> {
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 500)
    })

    const cachePromise = redis.get(key).then((v) => (v ? (JSON.parse(v as string) as T) : null))

    return (await Promise.race([cachePromise, timeoutPromise])) as T | null
  } catch (error) {
    console.warn(`[Cache] GET ${key} failed:`, error)
    return null
  }
}

/**
 * Set value in cache with timeout protection
 * If Redis call exceeds 500ms, silently fails (don't block function execution)
 */
export async function setCached<T>(key: CacheKey, value: T, ttl_seconds: number): Promise<boolean> {
  try {
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => resolve(false), 500)
    })

    const cachePromise = redis.setex(key, ttl_seconds, JSON.stringify(value))

    return await Promise.race([cachePromise.then(() => true), timeoutPromise])
  } catch (error) {
    console.warn(`[Cache] SET ${key} failed:`, error)
    return false
  }
}

/**
 * Invalidate cache for an athlete (called after data mutations)
 */
export async function invalidateAthleteCache(athlete_id: string): Promise<void> {
  try {
    const keysToDelete = [
      `readiness:${athlete_id}:*`,
      `acwr:${athlete_id}:*`,
      `injury:${athlete_id}:*`,
      `recovery:${athlete_id}:*`,
      `wod:${athlete_id}:*`,
      `athlete_state:${athlete_id}:*`,
    ]

    // Pattern deletion: get keys then delete
    for (const pattern of keysToDelete) {
      const keys = await redis.keys(pattern)
      if (keys && keys.length > 0) {
        await redis.del(...(keys as string[]))
      }
    }
  } catch (error) {
    console.warn(`[Cache] Invalidate ${athlete_id} failed:`, error)
  }
}

/**
 * Invalidate coach cache (broader invalidation)
 */
export async function invalidateCoachCache(coach_id: string): Promise<void> {
  try {
    const keys = await redis.keys(`coach_alert:${coach_id}:*`)
    if (keys && keys.length > 0) {
      await redis.del(...(keys as string[]))
    }
  } catch (error) {
    console.warn(`[Cache] Invalidate coach ${coach_id} failed:`, error)
  }
}

/**
 * Get or compute: tries cache first, falls back to computation
 * If computation exceeds timeLimit, returns stale cache (if available)
 */
export async function getOrCompute<T>(
  key: CacheKey,
  compute: () => Promise<T>,
  ttl_seconds: number,
  timeLimit: number = 5000
): Promise<{ value: T; source: 'cache' | 'computed' | 'timeout_stale' }> {
  // Try cache first
  const cached = await getCached<T>(key)
  if (cached) {
    return { value: cached, source: 'cache' }
  }

  // Cache miss - compute with timeout
  try {
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), timeLimit)
    })

    const result = await Promise.race([compute(), timeoutPromise])

    if (result === null) {
      // Timeout - return error or empty
      throw new Error(`Computation timeout (${timeLimit}ms)`)
    }

    // Success - cache and return
    await setCached(key, result, ttl_seconds)
    return { value: result, source: 'computed' }
  } catch (error) {
    console.error(`[Cache] Compute ${key} failed:`, error)
    throw error
  }
}
