import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { db } from '@/src/db'
import { users, profiles, athlete_profiles, coach_profiles } from '@/src/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email.toLowerCase()))
          .limit(1)

        if (!user || !user.password_hash) return null

        const valid = await bcrypt.compare(password, user.password_hash)
        if (!valid) return null

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, user.id))
          .limit(1)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          box_id: profile?.box_id ?? null,
          coach_id: profile?.coach_id ?? null,
          onboarding_done: profile?.onboarding_done ?? false,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.box_id = (user as any).box_id
        token.coach_id = (user as any).coach_id
        token.onboarding_done = (user as any).onboarding_done
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.box_id = token.box_id as string | null
        session.user.coach_id = token.coach_id as string | null
        session.user.onboarding_done = token.onboarding_done as boolean
      }
      return session
    },
  },
})

// ─────────────────────────────────────────────
// Auth guard — used in API routes
// Throws if not authenticated or role mismatch
// ─────────────────────────────────────────────

export async function authGuard(requiredRole?: 'athlete' | 'coach') {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED')
  }

  if (requiredRole && session.user.role !== requiredRole) {
    throw new Error('FORBIDDEN')
  }

  return session.user as {
    id: string
    email: string
    name: string
    role: string
    box_id: string | null
    coach_id: string | null
    onboarding_done: boolean
  }
}

// ─────────────────────────────────────────────
// Register new user — called from /api/auth/register
// ─────────────────────────────────────────────

export async function registerUser(params: {
  email: string
  password: string
  name: string
  role: 'athlete' | 'coach'
}) {
  const { email, password, name, role } = params

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)

  if (existing.length > 0) {
    throw new Error('EMAIL_EXISTS')
  }

  const password_hash = await bcrypt.hash(password, 12)

  const [newUser] = await db
    .insert(users)
    .values({
      email: email.toLowerCase(),
      password_hash,
      name,
      role,
    })
    .returning({ id: users.id })

  // Create base profile
  await db.insert(profiles).values({
    id: newUser.id,
    onboarding_done: false,
  })

  // Create role-specific profile stub
  if (role === 'athlete') {
    await db.insert(athlete_profiles).values({
      id: newUser.id,
      programming_mode: 'box_wod',
      cardio_protocol_enabled: false,
      cardio_phase: 1,
    })
  } else {
    await db.insert(coach_profiles).values({
      id: newUser.id,
      athlete_count: 0,
    })
  }

  return newUser.id
}
