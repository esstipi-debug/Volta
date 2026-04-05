/**
 * Supabase Authentication
 * Email/Password + OAuth integration
 */

import { supabase } from '@/src/lib/db-supabase'
import { NextRequest, NextResponse } from 'next/server'

export type UserRole = 'athlete' | 'coach' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  athlete_id?: string
  coach_id?: string
}

/**
 * Sign up new user
 */
export async function signUp(
  email: string,
  password: string,
  role: UserRole = 'athlete'
): Promise<{ user: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    })

    if (error) {
      return { user: null as any, error: error.message }
    }

    return {
      user: {
        id: data.user?.id || '',
        email: data.user?.email || '',
        role,
      },
    }
  } catch (error) {
    return {
      user: null as any,
      error: error instanceof Error ? error.message : 'Sign up failed',
    }
  }
}

/**
 * Sign in user
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { user: null as any, error: error.message }
    }

    const user = data.user
    return {
      user: {
        id: user?.id || '',
        email: user?.email || '',
        role: (user?.user_metadata?.role as UserRole) || 'athlete',
      },
    }
  } catch (error) {
    return {
      user: null as any,
      error: error instanceof Error ? error.message : 'Sign in failed',
    }
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Sign out failed',
    }
  }
}

/**
 * Get current session
 */
export async function getCurrentSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Verify JWT token from request
 */
export async function verifySupabaseToken(request: NextRequest): Promise<User | null> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.slice(7)

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role as UserRole) || 'athlete',
      athlete_id: user.user_metadata?.athlete_id,
      coach_id: user.user_metadata?.coach_id,
    }
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Update user metadata (role, links to athlete/coach)
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Update failed',
    }
  }
}

/**
 * Reset password
 */
export async function resetPassword(email: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Reset failed',
    }
  }
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Update failed',
    }
  }
}
