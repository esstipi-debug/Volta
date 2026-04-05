import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/src/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, role } = body

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (!['athlete', 'coach'].includes(role)) {
      return NextResponse.json(
        { error: 'Rol inválido' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    const userId = await registerUser({ email, password, name, role })

    return NextResponse.json({ success: true, userId }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'EMAIL_EXISTS') {
      return NextResponse.json(
        { error: 'Ya existe una cuenta con ese email' },
        { status: 409 }
      )
    }

    console.error('[register]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
