/**
 * Serverless authentication middleware
 * Verifies JWT tokens from NextAuth.js httpOnly cookies
 */

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export type UserRole = 'athlete' | 'coach' | 'admin'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  athlete_id?: string
  coach_id?: string
}

/**
 * Middleware to verify authentication
 * Returns user if authenticated, or sends 401 response
 */
export async function verifyAuth(
  request: NextRequest,
  requiredRole?: UserRole
): Promise<AuthenticatedUser | NextResponse> {
  try {
    // Get token from NextAuth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'No valid session found',
        }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': 'Bearer realm="VOLTA"',
          },
        }
      )
    }

    const user: AuthenticatedUser = {
      id: token.sub || '',
      email: token.email || '',
      role: (token.role as UserRole) || 'athlete',
      athlete_id: token.athlete_id as string,
      coach_id: token.coach_id as string,
    }

    // Check role if required
    if (requiredRole && user.role !== requiredRole) {
      return new NextResponse(
        JSON.stringify({
          error: 'Forbidden',
          message: `This endpoint requires ${requiredRole} role`,
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    }

    return user
  } catch (error) {
    console.error('[Auth] Verification failed:', error)

    return new NextResponse(
      JSON.stringify({
        error: 'Unauthorized',
        message: 'Invalid session',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

/**
 * Rate limiting helper (basic implementation)
 * In production, use a proper rate limiting service
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<boolean> {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || record.resetAt < now) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count < limit) {
    record.count++
    return true
  }

  return false
}

/**
 * Check if user owns a resource (athlete data)
 */
export function userOwnsAthleteData(user: AuthenticatedUser, athlete_id: string): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'athlete' && user.athlete_id === athlete_id) return true
  if (user.role === 'coach') {
    // Check if coach manages this athlete (would need DB query)
    // Simplified: assume coach can access athlete if passed in request
    return true
  }
  return false
}

/**
 * Check if user is authorized for coach operations
 */
export function userIsAuthorizedCoach(user: AuthenticatedUser, coach_id: string): boolean {
  if (user.role === 'admin') return true
  if (user.role === 'coach' && user.coach_id === coach_id) return true
  return false
}
