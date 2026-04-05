/**
 * Sentry integration for VOLTA
 * Error tracking + performance monitoring for serverless functions
 */

import * as Sentry from '@sentry/nextjs'

export interface SentryContext {
  athlete_id?: string
  coach_id?: string
  request_id?: string
  endpoint?: string
  cache_source?: 'cache' | 'computed'
  response_time_ms?: number
}

/**
 * Initialize Sentry (call in pages/_app.tsx or app layout)
 */
export function initializeSentry(): void {
  if (!process.env.SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured - error tracking disabled')
    return
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.VERCEL_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'unknown',
    tracesSampleRate: 1.0, // 100% for serverless (can reduce in prod)
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.OnUncaughtException(),
      new Sentry.Integrations.OnUnhandledRejection(),
    ],
    // Serverless-specific settings
    serverName: process.env.VERCEL_URL || 'unknown',
    beforeSend: (event, hint) => {
      // Filter out health check errors
      if (event.request?.url?.includes('/api/health')) {
        return null
      }
      return event
    },
  })
}

/**
 * Capture exception with context
 */
export function captureException(
  error: Error | unknown,
  context?: SentryContext
): void {
  if (context) {
    Sentry.setContext('request', {
      athlete_id: context.athlete_id,
      coach_id: context.coach_id,
      request_id: context.request_id,
      endpoint: context.endpoint,
      cache_source: context.cache_source,
      response_time_ms: context.response_time_ms,
    })
  }

  Sentry.captureException(error)
}

/**
 * Capture message (info, warning, error)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: SentryContext
): void {
  if (context) {
    Sentry.setContext('request', {
      athlete_id: context.athlete_id,
      coach_id: context.coach_id,
      request_id: context.request_id,
      endpoint: context.endpoint,
    })
  }

  Sentry.captureMessage(message, level)
}

/**
 * Track performance metric
 */
export function trackPerformance(
  operation: string,
  duration: number,
  metadata?: Record<string, unknown>
): void {
  Sentry.captureMessage(`[Perf] ${operation}: ${duration}ms`, 'info')

  if (metadata) {
    Sentry.setContext('performance', {
      operation,
      duration_ms: duration,
      ...metadata,
    })
  }
}

/**
 * Track cache hit/miss
 */
export function trackCache(
  key: string,
  hit: boolean,
  ttl?: number
): void {
  captureMessage(
    `Cache ${hit ? 'HIT' : 'MISS'}: ${key}${ttl ? ` (TTL: ${ttl}s)` : ''}`,
    'info'
  )
}

/**
 * Track database query performance
 */
export function trackQuery(
  query: string,
  duration: number,
  rowCount?: number
): void {
  if (duration > 1000) {
    // Slow query warning
    captureMessage(`[DB] Slow query (${duration}ms): ${query.substring(0, 100)}...`, 'warning')
  }

  trackPerformance('database_query', duration, {
    query: query.substring(0, 200),
    rows: rowCount,
  })
}

/**
 * Track timeout occurrence
 */
export function trackTimeout(
  endpoint: string,
  timeoutMs: number,
  hasStaleCache: boolean
): void {
  captureMessage(
    `[Timeout] ${endpoint} exceeded ${timeoutMs}ms${hasStaleCache ? ' (returned stale cache)' : ''}`,
    'warning'
  )
}

/**
 * Set user context (for filtering errors by user)
 */
export function setUserContext(userId: string, email?: string, role?: string): void {
  Sentry.setUser({
    id: userId,
    email,
    username: role,
  })
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null)
}

/**
 * Flush pending events (call before function exits)
 */
export async function flushSentry(timeoutMs: number = 2000): Promise<boolean> {
  try {
    return await Sentry.close(timeoutMs)
  } catch (error) {
    console.error('[Sentry] Flush error:', error)
    return false
  }
}
