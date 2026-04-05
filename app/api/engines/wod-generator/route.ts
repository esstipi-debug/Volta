/**
 * POST /api/engines/wod-generator
 *
 * Endpoint de Engine #16.
 * Genera un borrador de semana completa de WODs.
 * Solo accesible por coaches.
 *
 * Request body: WODGeneratorInput (ver wodGenerator.ts)
 * Response: WODGeneratorResult
 */

import { NextRequest, NextResponse } from 'next/server'
import { authGuard } from '@/src/lib/auth'
import { db } from '@/src/db'
import {
  programming_weekly_state,
  training_sessions,
  session_movements,
  acwr_daily,
  profiles,
  wod_templates,
  wod_movements,
  boxes,
} from '@/src/db/schema'
import { eq, and, gte, desc } from 'drizzle-orm'
import { sql } from 'drizzle-orm'
import {
  generateWeek,
  generatedWODtoDBFormat,
  type WODGeneratorInput,
  type BoxEquipment,
} from '@/src/engines/wodGenerator'

export async function POST(req: NextRequest) {
  try {
    const user = await authGuard('coach')

    const body = await req.json()
    const {
      box_id,
      week_start,
      sessions_per_week = 5,
      available_days,
      intensity_preference = 'standard',
      focus_areas = [],
      equipment,
      tenet_override,
      save_drafts = false,  // si true, guarda automáticamente como borradores en DB
    } = body

    if (!box_id || !week_start || !available_days) {
      return NextResponse.json(
        { error: 'Requeridos: box_id, week_start, available_days' },
        { status: 400 }
      )
    }

    // ── 1. Cargar historial de movimientos (14 días) ──
    const cutoff_date = new Date(week_start)
    cutoff_date.setDate(cutoff_date.getDate() - 14)
    const cutoff_str = cutoff_date.toISOString().split('T')[0]

    const movement_history = await db.execute(
      sql`
        SELECT
          sm.movement_id,
          MAX(sm.session_date) as last_used_date,
          COUNT(*)::int as usage_count_14d
        FROM session_movements sm
        INNER JOIN training_sessions ts ON ts.id = sm.session_id
        INNER JOIN profiles p ON p.id = ts.athlete_id
        WHERE p.box_id = ${box_id}
          AND sm.session_date >= ${cutoff_str}
        GROUP BY sm.movement_id
        ORDER BY usage_count_14d DESC
      `
    ) as any

    const recent_movements = (movement_history?.rows ?? []).map((r: any) => ({
      movement_id: r.movement_id,
      last_used_date: String(r.last_used_date).split('T')[0],
      usage_count_14d: r.usage_count_14d,
    }))

    // ── 2. Cargar 1RMs promedio del box ─────────
    const one_rm_data = await db.execute(
      sql`
        SELECT
          a.movement_id,
          AVG(a.weight_kg::float) as avg_weight
        FROM athlete_1rms a
        INNER JOIN profiles p ON p.id = a.athlete_id
        WHERE p.box_id = ${box_id}
        GROUP BY a.movement_id
      `
    ) as any

    const avg_1rms: Record<string, number> = {}
    for (const row of (one_rm_data?.rows ?? [])) {
      avg_1rms[row.movement_id] = parseFloat(row.avg_weight)
    }

    // ── 3. ACWR promedio actual del box ──────────
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

    const current_acwr_box = parseFloat(acwr_result?.rows?.[0]?.avg_acwr ?? '1.0') || 1.0

    // ── 4. Estado semanal acumulado ─────────────
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

    const weekly_load_accumulated = parseFloat(String(weekly_row?.weekly_load_projected ?? 0))

    // ── 5. Equipamiento del box ──────────────────
    const default_equipment: BoxEquipment = {
      has_barbell: true,
      has_rings: true,
      has_rope: true,
      has_kettlebell: true,
      has_echo_bike: true,
      has_rower: true,
      has_ski_erg: false,
      has_pullup_bar: true,
    }

    const box_equipment: BoxEquipment = { ...default_equipment, ...(equipment ?? {}) }

    // ── 6. Llamar Engine #16 ─────────────────────
    const generator_input: WODGeneratorInput = {
      box_id,
      week_start,
      sessions_per_week,
      available_days,
      current_acwr_box,
      weekly_load_accumulated,
      recent_movements,
      avg_1rms,
      intensity_preference,
      focus_areas,
      equipment: box_equipment,
      tenet_override,
    }

    const result = generateWeek(generator_input)

    // ── 7. Guardar como borradores si se solicita ─
    if (save_drafts) {
      for (const wod of result.wods) {
        const db_data = generatedWODtoDBFormat(wod, user.id, box_id)

        const [inserted] = await db
          .insert(wod_templates)
          .values({
            created_by: user.id,
            box_id,
            ...db_data.wod_template,
          })
          .returning({ id: wod_templates.id })

        if (db_data.movements.length > 0) {
          await db.insert(wod_movements).values(
            db_data.movements.map(m => ({
              wod_id: inserted.id,
              ...m,
            }))
          )
        }
      }
    }

    return NextResponse.json({
      ...result,
      drafts_saved: save_drafts,
    })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Solo coaches pueden acceder' }, { status: 403 })
    }
    console.error('[POST /api/engines/wod-generator]', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
