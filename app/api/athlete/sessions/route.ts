/**
 * POST /api/athlete/sessions
 *
 * Registers a training session for an athlete.
 * This is the central data entry point — triggers all engines.
 *
 * Flow:
 *   1. Validate + authenticate
 *   2. Run StressEngine → IMR + session_load
 *   3. Save training_session + session_movements
 *   4. Run ReadinessEngine (inline — fast)
 *   5. Enqueue BullMQ job "calculate-acwr" (async — non-blocking)
 *   6. Run GamificationEngine (inline — fast)
 *   7. Return response to athlete in ~100ms
 */

import { NextRequest, NextResponse } from 'next/server'
import { authGuard } from '@/src/lib/auth'
import { db } from '@/src/db'
import {
  training_sessions,
  session_movements,
  profiles,
  athlete_profiles,
  athlete_gamification,
  voltaje_transactions,
} from '@/src/db/schema'
import { eq, and } from 'drizzle-orm'
import { calculateIMR, applyWarmupBonus, type MovementInput } from '@/src/engines/stressEngine'
import { calculateReadiness } from '@/src/engines/readinessEngine'
import { getQueue } from '@/src/workers/queue'

// ─────────────────────────────────────────────
// Request body type
// ─────────────────────────────────────────────

interface SessionBody {
  wod_id?: string
  session_date: string          // "YYYY-MM-DD"
  workout_type: string
  movements: MovementInput[]
  srpe: number                  // 1–10
  result_value?: number
  result_type?: string
  was_scaled?: boolean
  scale_used?: string
  warmup_done?: boolean
  notes?: string
  // Airbike / cardio sessions
  energy_vector?: 'V1' | 'V2' | 'V3'
  estimated_imr?: number
  airbike_protocol?: string
}

// ─────────────────────────────────────────────
// Voltaje calculation (simplified gamification)
// Full Engine #10 runs in worker; this is the inline fast version
// ─────────────────────────────────────────────

function calculateVoltaje(session_load: number, color_state: string, warmup_done: boolean): {
  base: number
  multiplier: number
  total: number
} {
  const base = Math.round(session_load * 0.5)

  const multipliers: Record<string, number> = {
    green: 1.5,
    blue: 1.2,
    yellow: 1.0,
    orange: 0.8,
    red: 0.5,
  }
  const multiplier = multipliers[color_state] ?? 1.0
  const warmup_extra = warmup_done ? 1.05 : 1.0

  return {
    base,
    multiplier: multiplier * warmup_extra,
    total: Math.round(base * multiplier * warmup_extra),
  }
}

// ─────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // ── Auth ───────────────────────────────────
    const user = await authGuard('athlete')

    if (!user.onboarding_done) {
      return NextResponse.json(
        { error: 'Debes completar el onboarding antes de registrar sesiones' },
        { status: 403 }
      )
    }

    const body: SessionBody = await req.json()

    // ── Validate required fields ───────────────
    if (!body.session_date || !body.workout_type || !body.srpe) {
      return NextResponse.json(
        { error: 'session_date, workout_type y srpe son requeridos' },
        { status: 400 }
      )
    }

    if (body.srpe < 1 || body.srpe > 10) {
      return NextResponse.json(
        { error: 'sRPE debe estar entre 1 y 10' },
        { status: 400 }
      )
    }

    // ── Get athlete profile ────────────────────
    const [ap] = await db
      .select({ sex: athlete_profiles.sex })
      .from(athlete_profiles)
      .where(eq(athlete_profiles.id, user.id))
      .limit(1)

    // ── Engine #01: StressEngine ───────────────
    const imr_result = calculateIMR({
      workout_type: body.workout_type,
      movements: body.movements ?? [],
      srpe: body.srpe,
      energy_vector: body.energy_vector,
      estimated_imr: body.estimated_imr,
    })

    const { final_load, warmup_bonus } = applyWarmupBonus(
      imr_result.session_load,
      body.warmup_done ?? false
    )

    // ── Save training_session ──────────────────
    const [session] = await db
      .insert(training_sessions)
      .values({
        athlete_id: user.id,
        wod_id: body.wod_id ?? null,
        coach_id: user.coach_id ?? null,
        box_id: user.box_id ?? null,
        session_date: body.session_date,
        workout_type: body.workout_type,
        result_value: body.result_value ? String(body.result_value) : null,
        result_type: body.result_type ?? null,
        srpe: body.srpe,
        imr_score: String(imr_result.imr_score),
        session_load: String(final_load),
        was_scaled: body.was_scaled ?? false,
        scale_used: body.scale_used ?? null,
        warmup_done: body.warmup_done ?? false,
        warmup_bonus: warmup_bonus > 0 ? String(warmup_bonus) : null,
        notes: body.notes ?? null,
        energy_vector: body.energy_vector ?? null,
        airbike_protocol: body.airbike_protocol ?? null,
      })
      .returning({ id: training_sessions.id })

    const session_id = session.id

    // ── Save session_movements ─────────────────
    if (imr_result.movements_breakdown.length > 0) {
      await db.insert(session_movements).values(
        imr_result.movements_breakdown.map((m, i) => ({
          session_id,
          movement_id: m.movement_id,
          movement_name: m.movement_name,
          session_date: body.session_date,
          sets_done: body.movements?.[i]?.sets ?? null,
          reps_done: body.movements?.[i]?.reps ?? null,
          weight_kg_used: body.movements?.[i]?.weight_kg
            ? String(body.movements[i].weight_kg)
            : null,
          scale_used: body.scale_used ?? null,
          imr_contribution: String(m.imr_contribution),
        }))
      )
    }

    // ── Engine #04: ReadinessEngine (inline) ───
    const readiness = await calculateReadiness({
      athlete_id: user.id,
      date: body.session_date,
      session_load: final_load,
      workout_type: body.workout_type,
      had_session: true,
      sex: ap?.sex ?? undefined,
    })

    // ── Update ACWR snapshot on session record ─
    // (full async ACWR calculation enqueued below)
    // We do a quick ACWR estimate here for the response
    // Full calculation runs in BullMQ worker

    // ── Gamification (fast inline) ─────────────
    const voltaje = calculateVoltaje(final_load, readiness.color_state, body.warmup_done ?? false)

    // Update athlete_gamification
    await db
      .insert(athlete_gamification)
      .values({
        id: user.id,
        voltaje_total: voltaje.total,
        voltaje_level: 1,
        racha_current: 1,
        racha_max: 1,
        shields_available: 0,
        total_sessions: 1,
      })
      .onConflictDoUpdate({
        target: athlete_gamification.id,
        set: {
          voltaje_total: db['execute']
            ? undefined
            : undefined, // handled below via raw
          total_sessions: db['execute']
            ? undefined
            : undefined,
          updated_at: new Date(),
        },
      })

    // Simpler: use separate update for increments
    await db.execute(
      `UPDATE athlete_gamification
       SET voltaje_total = voltaje_total + ${voltaje.total},
           total_sessions = total_sessions + 1,
           updated_at = NOW()
       WHERE id = '${user.id}'`
    )

    // Record transaction
    await db.insert(voltaje_transactions).values({
      athlete_id: user.id,
      session_id,
      amount: voltaje.total,
      multiplier: String(voltaje.multiplier),
      concept: 'session',
      readiness_color: readiness.color_state,
    })

    // ── Enqueue async BullMQ jobs ──────────────
    try {
      const queue = getQueue()
      await queue.add('calculate-acwr', {
        athlete_id: user.id,
        date: body.session_date,
        session_load: final_load,
        coach_id: user.coach_id,
      })
    } catch (queueError) {
      // Queue failure is non-fatal — ACWR will be calculated on next run
      console.warn('[sessions] Queue unavailable, ACWR will recalculate later:', queueError)
    }

    // ── Response ───────────────────────────────
    return NextResponse.json({
      success: true,
      session_id,
      imr_score: imr_result.imr_score,
      session_load: final_load,
      readiness: {
        score: readiness.readiness_score,
        color: readiness.color_state,
        recommendation: readiness.recommendation_text,
      },
      voltaje_earned: voltaje.total,
      calculation_method: imr_result.calculation_method,
    }, { status: 201 })

  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    if (error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    console.error('[POST /api/athlete/sessions]', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────
// GET /api/athlete/sessions — last 30 sessions
// ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const user = await authGuard('athlete')

    const sessions = await db
      .select({
        id: training_sessions.id,
        session_date: training_sessions.session_date,
        workout_type: training_sessions.workout_type,
        imr_score: training_sessions.imr_score,
        session_load: training_sessions.session_load,
        srpe: training_sessions.srpe,
        energy_vector: training_sessions.energy_vector,
        airbike_protocol: training_sessions.airbike_protocol,
        was_scaled: training_sessions.was_scaled,
        warmup_done: training_sessions.warmup_done,
        created_at: training_sessions.created_at,
      })
      .from(training_sessions)
      .where(eq(training_sessions.athlete_id, user.id))
      .orderBy(training_sessions.session_date)
      .limit(30)

    return NextResponse.json({ sessions })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
