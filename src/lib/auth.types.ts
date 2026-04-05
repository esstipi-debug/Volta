import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    role: string
    box_id: string | null
    coach_id: string | null
    onboarding_done: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      box_id: string | null
      coach_id: string | null
      onboarding_done: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    box_id: string | null
    coach_id: string | null
    onboarding_done: boolean
  }
}
