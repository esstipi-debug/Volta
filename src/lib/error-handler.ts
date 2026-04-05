/**
 * Serverless error handling with graceful degradation
 * Handles timeouts, database errors, and cache fallbacks
 */

import { NextResponse } from 'next/server'

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ErrorResponse {
  error: string
  status: 'error' | 'degraded' | 'timeout'
  severity: ErrorSeverity
  request_id?: string
  retry_after?: number
  fallback_data?: unknown
  timestamp: string
}

/**
 * Classify error type
 */
export function classifyError(error: unknown): {
  type: 'timeout' | 'database' | 'validation' | 'auth' | 'not_found' | 'unknown'
  severity: ErrorSeverity
  message: string
} {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()

    if (msg.includes('timeout') || msg.includes('timed out')) {
      return { type: 'timeout', severity: 'high', message: 'Operation timeout' }
    }
    if (msg.includes('database') || msg.includes('query')) {
      return { type: 'database', severity: 'high', message: 'Database error' }
    }
    if (msg.includes('validation') || msg.includes('invalid')) {
      return { type: 'validation', severity: 'low', message: 'Validation error' }
    }
    if (msg.includes('auth') || msg.includes('unauthorized')) {
      return { type: 'auth', severity: 'medium', message: 'Authentication error' }
    }
    if (msg.includes('not found')) {
      return { type: 'not_found', severity: 'low', message: 'Resource not found' }
    }

    return {
      type: 'unknown',
      severity: 'medium',
      message: error.message,
    }
  }

  return {
    type: 'unknown',
    severity: 'medium',
    message: String(error),
  }
}

/**
 * Generate error response with appropriate HTTP status
 */
export function handleError(
  error: unknown,
  options?: {
    fallback_data?: unknown
    request_id?: string
    log?: boolean
  }
): NextResponse<ErrorResponse> {
  const classification = classifyError(error)
  const timestamp = new Date().toISOString()

  if (options?.log !== false) {
    console.error(`[Error] ${classification.type}:`, error, {
      request_id: options?.request_id,
      timestamp,
    })
  }

  // Determine HTTP status
  let httpStatus = 500
  switch (classification.type) {
    case 'timeout':
      httpStatus = 504 // Gateway Timeout
      break
    case 'validation':
      httpStatus = 400 // Bad Request
      break
    case 'auth':
      httpStatus = 401 // Unauthorized
      break
    case 'not_found':
      httpStatus = 404 // Not Found
      break
    case 'database':
      httpStatus = 503 // Service Unavailable
      break
  }

  // If fallback data available and it's a timeout, return degraded response
  const status =
    classification.type === 'timeout' && options?.fallback_data ? 'degraded' : 'error'

  const response: ErrorResponse = {
    error: classification.message,
    status,
    severity: classification.severity,
    request_id: options?.request_id,
    retry_after: classification.type === 'timeout' ? 30 : undefined,
    fallback_data: options?.fallback_data,
    timestamp,
  }

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      'Retry-After': response.retry_after?.toString() || '60',
      'X-Error-Type': classification.type,
      'X-Error-Severity': classification.severity,
    },
  })
}

/**
 * Timeout wrapper for database queries
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000,
  timeoutValue?: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => {
      setTimeout(() => {
        if (timeoutValue !== undefined) {
          resolve(timeoutValue)
        } else {
          resolve(null as unknown as T)
        }
      }, timeoutMs)
    }),
  ])
}

/**
 * Generate request ID for tracing
 */
export function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}
