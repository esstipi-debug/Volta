/**
 * ENGINE #04 — Readiness Engine
 *
 * Orchestrates the daily readiness score for an athlete.
 * Combines Banister model (Engine #03) with optional biometric check-in (Modo 2).
 *
 * Modo 1 (default): Banister only — no check-in required
 * Modo 2 (optional, after 30 days): Banister + lifestyle adjustments from check-in
 *   Check-in: sleep_hours, stress (1-5), legs ('fresh'|'normal'|'heavy'|'destroyed')
 *
 * Lifestyle adjustment (Modo 2):
 *   sleep_adj:  poor sleep → negative, great sleep → positive (−10 to +5)
 *   stress_adj: high stress → negative (−8 to 0)
 *   legs_adj:   destroyed legs → negative (−12 to +3)
 *
 * Menstrual periodization adjustment (if applicable):
 *   Phase 1 (Menstrual, days 1-5):      −8
 *   Phase 2 (Follicular, days 6-13):     0
 *   Phase 3 (Ovulation, days 14-16):    +5
 *   Phase 4 (Luteal, days 17-28):       −3
 *
 * Final score = clamp(banister_score + lifestyle_adj + menstrual_adj, 0, 100)
 *
 * Called by BullMQ worker job "calculate-readiness"
 * Also called synchronously when athlete does manual check-in
 */

import { db } from '@/src/db'
import {
  readiness_daily,
  biometric_daily,
  menstrual_cycles,
  athlete_profiles,
} from '@/src/db/schema'
import { eq, and, desc, lte } from 'drizzle-orm'
import {
  getPreviousBanisterState,
  updateBanisterState,
  decayBanisterState,
  getColorState,
  getReadinessRecommendation,
  type BanisterState,
  type ColorState,
} from './banisterModel'

// ─────────────────────────────────────────────
// Lifestyle adjustment tables (Modo 2)
// ─────────────────────────────────────────────

const SLEEP_ADJ: Record<string, number> = {
  '<6':  -10,
  '6-7': -4,
  '7-8':  0,
  '8+':   5,
}

const STRESS_ADJ: Record<number, number> = {
  1:  0,
  2: -2,
  3: -4,
  4: -6,
  5: -8,
}

const LEGS_ADJ: Record<string, number> = {
  fresh:     3,
  normal:    0,
  heavy:    -6,
  destroyed:-12,
}

// ─────────────────────────────────────────────
// Menstrual phase detection
// ─────────────────────────────────────────────

export function getMenstrualAdjustment(
  today: string,
  cycle_start_date: string,
  cycle_length_days: number = 28
): { phase: number; phase_name: string; adjustment: number } {
  const start = new Date(cycle_start_date)
  const now = new Date(today)
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const day_in_cycle = ((diff % cycle_length_days) + cycle_length_days) % cycle_length_days + 1

  if (day_in_cycle <= 5)  return { phase: 1, phase_name: 'Menstrual',   adjustment: -8 }
  if (day_in_cycle <= 13) return { phase: 2, phase_name: 'Folicular',   adjustment:  0 }
  if (day_in_cycle <= 16) return { phase: 3, phase_name: 'Ovulación',   adjustment:  5 }
  return                         { phase: 4, phase_name: 'Lútea',       adjustment: -3 }
}

// ─────────────────────────────────────────────
// Main readiness calculation
// ─────────────────────────────────────────────

export interface ReadinessInput {
  athlete_id: string
  date: string          // ISO "YYYY-MM-DD"
  session_load: number  // from current day's session (0 if rest day)
  workout_type: string  // for Banister fatigue distribution
  had_session: boolean  // false = rest day (use decay)
  sex?: string          // 'F' to enable menstrual periodization
}

export interface ReadinessOutput {
  readiness_score: number
  color_state: ColorState
  readiness_mode: 1 | 2
  check_in_used: boolean
  fitness_score: number
  fatiga_mecanica: number
  fatiga_snc: number
  fatiga_metabolica: number
  fatiga_articular: number
  lifestyle_adj: number
  menstrual_adj: number
  recommendation_text: string
}

export async function calculateReadiness(input: ReadinessInput): Promise<ReadinessOutput> {
  const { athlete_id, date, session_load, workout_type, had_session, sex } = input

  // ── Step 1: Get previous Banister state ──────
  const prev_state = await getPreviousBanisterState(athlete_id, date)

  // ── Step 2: Update or decay Banister state ───
  let new_state: BanisterState
  let banister_score: number

  if (had_session && session_load > 0) {
    const result = updateBanisterState({ prev_state, session_load, workout_type })
    new_state = result.new_state
    banister_score = result.readiness_score
  } else {
    // Rest day — decay all components
    new_state = decayBanisterState(prev_state)
    // Compute readiness from decayed state
    const K1 = 1.0, K2 = 1.8, SCALE = 8
    const fitness = K1 * new_state.fitness
    const fatigue = K2 * (new_state.fat_mec + new_state.fat_snc + new_state.fat_met + new_state.fat_art)
    banister_score = Math.round(Math.min(100, Math.max(0, (fitness - fatigue) * SCALE + 50)))
  }

  // ── Step 3: Check for biometric check-in (Modo 2) ───
  const [check_in] = await db
    .select()
    .from(biometric_daily)
    .where(and(eq(biometric_daily.athlete_id, athlete_id), eq(biometric_daily.date, date)))
    .limit(1)

  let lifestyle_adj = 0
  let readiness_mode: 1 | 2 = 1
  let check_in_used = false

  if (check_in && !check_in.skipped) {
    readiness_mode = 2
    check_in_used = true

    const sleep_adj = SLEEP_ADJ[check_in.sleep_hours ?? '7-8'] ?? 0
    const stress_adj = STRESS_ADJ[check_in.stress ?? 3] ?? 0
    const legs_adj = LEGS_ADJ[check_in.legs ?? 'normal'] ?? 0

    lifestyle_adj = sleep_adj + stress_adj + legs_adj
  }

  // ── Step 4: Menstrual adjustment ─────────────
  let menstrual_adj = 0
  if (sex === 'F') {
    const [latest_cycle] = await db
      .select()
      .from(menstrual_cycles)
      .where(
        and(
          eq(menstrual_cycles.athlete_id, athlete_id),
          lte(menstrual_cycles.cycle_start_date, date)
        )
      )
      .orderBy(desc(menstrual_cycles.cycle_start_date))
      .limit(1)

    if (latest_cycle) {
      const { adjustment } = getMenstrualAdjustment(
        date,
        String(latest_cycle.cycle_start_date),
        latest_cycle.cycle_length_days ?? 28
      )
      menstrual_adj = adjustment
    }
  }

  // ── Step 5: Final score ───────────────────────
  const readiness_score = Math.min(100, Math.max(0,
    banister_score + lifestyle_adj + menstrual_adj
  ))
  const color_state = getColorState(readiness_score)
  const recommendation_text = getReadinessRecommendation(color_state)

  // ── Step 6: Upsert readiness_daily ───────────
  await db
    .insert(readiness_daily)
    .values({
      athlete_id,
      date,
      readiness_score,
      color_state,
      readiness_mode,
      check_in_used,
      fitness_score: String(new_state.fitness),
      fatiga_mecanica: String(new_state.fat_mec),
      fatiga_snc: String(new_state.fat_snc),
      fatiga_metabolica: String(new_state.fat_met),
      fatiga_articular: String(new_state.fat_art),
      lifestyle_adj: String(lifestyle_adj),
      menstrual_adj: String(menstrual_adj),
      recommendation_text,
    })
    .onConflictDoUpdate({
      target: [readiness_daily.athlete_id, readiness_daily.date],
      set: {
        readiness_score,
        color_state,
        readiness_mode,
        check_in_used,
        fitness_score: String(new_state.fitness),
        fatiga_mecanica: String(new_state.fat_mec),
        fatiga_snc: String(new_state.fat_snc),
        fatiga_metabolica: String(new_state.fat_met),
        fatiga_articular: String(new_state.fat_art),
        lifestyle_adj: String(lifestyle_adj),
        menstrual_adj: String(menstrual_adj),
        recommendation_text,
      },
    })

  return {
    readiness_score,
    color_state,
    readiness_mode,
    check_in_used,
    fitness_score: Math.round(new_state.fitness * 10000) / 10000,
    fatiga_mecanica: Math.round(new_state.fat_mec * 10000) / 10000,
    fatiga_snc: Math.round(new_state.fat_snc * 10000) / 10000,
    fatiga_metabolica: Math.round(new_state.fat_met * 10000) / 10000,
    fatiga_articular: Math.round(new_state.fat_art * 10000) / 10000,
    lifestyle_adj,
    menstrual_adj,
    recommendation_text,
  }
}

// ─────────────────────────────────────────────
// Get today's readiness (for dashboard)
// ─────────────────────────────────────────────

export async function getTodayReadiness(athlete_id: string): Promise<{
  readiness_score: number
  color_state: ColorState
  recommendation_text: string
  check_in_used: boolean
  date: string
} | null> {
  const today = new Date().toISOString().split('T')[0]

  const [entry] = await db
    .select({
      readiness_score: readiness_daily.readiness_score,
      color_state: readiness_daily.color_state,
      recommendation_text: readiness_daily.recommendation_text,
      check_in_used: readiness_daily.check_in_used,
      date: readiness_daily.date,
    })
    .from(readiness_daily)
    .where(and(eq(readiness_daily.athlete_id, athlete_id), eq(readiness_daily.date, today)))
    .limit(1)

  if (!entry) return null

  return {
    readiness_score: entry.readiness_score ?? 50,
    color_state: (entry.color_state ?? 'blue') as ColorState,
    recommendation_text: entry.recommendation_text ?? '',
    check_in_used: entry.check_in_used ?? false,
    date: String(entry.date),
  }
}
