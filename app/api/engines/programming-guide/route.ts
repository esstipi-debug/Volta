/**
 * POST /api/engines/programming-guide
 *
 * Endpoint de Engine #14.
 * Llamado en tiempo real mientras el coach crea un WOD en el editor.
 *
 * Request body:
 * {
 *   box_id: string
 *   scheduled_date: string       // "YYYY-MM-DD"
 *   workout_type: string
 *   comptrain_tenet: string
 *   estimated_imr: number
 *   movements: MovementForAnalysis[]
 * }
 *
 * Response: ProgrammingGuideResult
 */

import { NextRequest, NextResponse } from 'next/server'
import { authGuard } from '@/src/lib/auth'
import { db } from '@/src/db'
import { programming_weekly_state, acwr_daily, profiles } from '@/src/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import {
  analyzeProgramming,
  buildWeeklyState,
  type MovementForAnalysis,
  type TenetType,
} from '@/src/engines/programmingGuide'

function getWeekStart(date: string): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard('coach')

    const body = await req.json()
    const {
      box_id,
      scheduled_date,
      workout_type,
      comptrain_tenet,
      estimated_imr,
      movements,
    } = body

    if (!box_id || !scheduled_date || !workout_type || !comptrain_tenet || estimated_imr === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: box_id, scheduled_date, workout_type, comptrain_tenet, estimated_imr' },
        { status: 400 }
      )
    }

    const week_start = getWeekStart(scheduled_date)

    // ── Cargar programming_weekly_state del box ──
    const [weekly_row] = await db
      .select()
      .from(programming_weekly_state)
      .where(
        and(
          eq(programming_weekly_state.box_id, box_id),
          eq(programming_weekly_state.week_start, week_start)
        )
      )
      .limit(1)

    // ── Calcular ACWR promedio del box ───────────
    // Promedio de los últimos valores de ACWR de todos los atletas del box
    const acwr_result = await db.execute(
      sql`
        SELECT AVG(a.acwr_ratio::float) as avg_acwr
        FROM acwr_daily a
        INNER JOIN profiles p ON p.id = a.athlete_id
        WHERE p.box_id = ${box_id}
          AND a.date = (
            SELECT MAX(a2.date)
            FROM acwr_daily a2
            WHERE a2.athlete_id = a.athlete_id
          )
      `
    ) as any

    const avg_acwr = parseFloat(acwr_result?.rows?.[0]?.avg_acwr ?? '1.0') || 1.0

    // ── Construir WeeklyState ────────────────────
    const weekly_state = buildWeeklyState({
      strength_count: weekly_row?.strength_count ?? 0,
      conditioning_count: weekly_row?.conditioning_count ?? 0,
      mobility_count: weekly_row?.mobility_count ?? 0,
      movement_volume: weekly_row?.movement_volume as any ?? null,
      avg_acwr_box: avg_acwr,
      weekly_load_projected: weekly_row?.weekly_load_projected ?? 0,
    })

    // ── Engine #14 ───────────────────────────────
    const result = analyzeProgramming({
      scheduled_date,
      workout_type,
      comptrain_tenet: comptrain_tenet as TenetType,
      estimated_imr,
      movements: (movements ?? []) as MovementForAnalysis[],
      weekly_state,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Solo coaches pueden acceder' }, { status: 403 })
    }
    console.error('[POST /api/engines/programming-guide]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
