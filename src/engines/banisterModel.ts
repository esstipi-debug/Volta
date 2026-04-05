/**
 * ENGINE #03 — Banister Model (4-Curve Impulse-Response)
 *
 * Models the athlete's fitness and fatigue response to training load.
 * Unlike ACWR (which detects injury risk), Banister predicts performance readiness today.
 *
 * 4-Fatigue Architecture:
 *   Fitness (τ=45d, k1=1.0)          — positive adaptation, decays slowly
 *   Fatigue_MEC (τ=18d)              — mechanical / muscular fatigue
 *   Fatigue_SNC (τ=8d)               — CNS fatigue (heavy lifting, max effort)
 *   Fatigue_MET (τ=4d)               — metabolic fatigue (high-intensity conditioning)
 *   Fatigue_ART (τ=30d, k2=1.8)      — articular / connective tissue load
 *
 * Performance prediction:
 *   readiness = k1 × Fitness − k2 × (Fatigue_MEC + Fatigue_SNC + Fatigue_MET + Fatigue_ART)
 *
 * EWMA formula (discrete approximation of exponential decay):
 *   component_new = λ × session_load + (1 − λ) × component_prev
 *   where λ = 1 − exp(−1/τ)
 *
 * Readiness normalized to 0–100:
 *   score = clamp(readiness × scaling_factor + 50, 0, 100)
 */

import { db } from '@/src/db'
import { readiness_daily, biometric_daily, menstrual_cycles } from '@/src/db/schema'
import { eq, and, desc, lte } from 'drizzle-orm'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

// τ (tau) = characteristic time constant in days
const TAU_FITNESS   = 45
const TAU_FAT_MEC   = 18
const TAU_FAT_SNC   = 8
const TAU_FAT_MET   = 4
const TAU_FAT_ART   = 30

// EWMA lambda = 1 − exp(−1/τ)
const LAMBDA = {
  fitness:   1 - Math.exp(-1 / TAU_FITNESS),
  fat_mec:   1 - Math.exp(-1 / TAU_FAT_MEC),
  fat_snc:   1 - Math.exp(-1 / TAU_FAT_SNC),
  fat_met:   1 - Math.exp(-1 / TAU_FAT_MET),
  fat_art:   1 - Math.exp(-1 / TAU_FAT_ART),
}

const K1 = 1.0   // fitness gain coefficient
const K2 = 1.8   // fatigue cost coefficient (articular weighted heavier)
const SCALING_FACTOR = 8 // maps raw readiness to 0–100 scale

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface BanisterState {
  fitness:   number  // positive adaptation
  fat_mec:   number  // mechanical fatigue
  fat_snc:   number  // CNS fatigue
  fat_met:   number  // metabolic fatigue
  fat_art:   number  // articular fatigue
}

export interface BanisterInput {
  prev_state: BanisterState
  session_load: number    // from StressEngine (imr_score × srpe/10)
  workout_type: string    // to weight fatigue components
}

export interface BanisterResult {
  new_state: BanisterState
  fitness_score: number          // raw fitness (positive)
  raw_fatigue: number            // total weighted fatigue
  raw_readiness: number          // fitness_score − raw_fatigue
  readiness_score: number        // 0–100 normalized
  color_state: ColorState
}

export type ColorState = 'green' | 'blue' | 'yellow' | 'orange' | 'red'

// ─────────────────────────────────────────────
// Workout type → fatigue distribution weights
// Different workout types stress different systems
// ─────────────────────────────────────────────

const FATIGUE_WEIGHTS: Record<string, {
  mec: number  // mechanical (muscles, tendons)
  snc: number  // CNS (neural)
  met: number  // metabolic (energy systems)
  art: number  // articular (joints, connective tissue)
}> = {
  STRENGTH:  { mec: 0.40, snc: 0.40, met: 0.10, art: 0.10 },
  FOR_TIME:  { mec: 0.25, snc: 0.15, met: 0.45, art: 0.15 },
  AMRAP:     { mec: 0.25, snc: 0.15, met: 0.45, art: 0.15 },
  EMOM:      { mec: 0.25, snc: 0.20, met: 0.40, art: 0.15 },
  INTERVAL:  { mec: 0.20, snc: 0.20, met: 0.45, art: 0.15 },
  LSD:       { mec: 0.30, snc: 0.05, met: 0.50, art: 0.15 },
  CHIPPER:   { mec: 0.30, snc: 0.15, met: 0.40, art: 0.15 },
  LADDER:    { mec: 0.30, snc: 0.25, met: 0.30, art: 0.15 },
  // Airbike protocols
  V1:        { mec: 0.10, snc: 0.05, met: 0.70, art: 0.15 },
  V2:        { mec: 0.15, snc: 0.15, met: 0.55, art: 0.15 },
  V3:        { mec: 0.20, snc: 0.30, met: 0.35, art: 0.15 },
}

const DEFAULT_WEIGHTS = { mec: 0.25, snc: 0.20, met: 0.40, art: 0.15 }

// ─────────────────────────────────────────────
// Pure Banister update (stateless, for testing / batch)
// ─────────────────────────────────────────────

export function updateBanisterState(input: BanisterInput): BanisterResult {
  const { prev_state, session_load, workout_type } = input
  const weights = FATIGUE_WEIGHTS[workout_type] ?? DEFAULT_WEIGHTS

  // Update each component with its EWMA
  const new_state: BanisterState = {
    fitness: LAMBDA.fitness * session_load + (1 - LAMBDA.fitness) * prev_state.fitness,
    fat_mec: LAMBDA.fat_mec * (session_load * weights.mec) + (1 - LAMBDA.fat_mec) * prev_state.fat_mec,
    fat_snc: LAMBDA.fat_snc * (session_load * weights.snc) + (1 - LAMBDA.fat_snc) * prev_state.fat_snc,
    fat_met: LAMBDA.fat_met * (session_load * weights.met) + (1 - LAMBDA.fat_met) * prev_state.fat_met,
    fat_art: LAMBDA.fat_art * (session_load * weights.art) + (1 - LAMBDA.fat_art) * prev_state.fat_art,
  }

  const fitness_score = K1 * new_state.fitness
  const raw_fatigue = K2 * (new_state.fat_mec + new_state.fat_snc + new_state.fat_met + new_state.fat_art)
  const raw_readiness = fitness_score - raw_fatigue

  // Normalize to 0–100
  const readiness_score = Math.round(
    Math.min(100, Math.max(0, raw_readiness * SCALING_FACTOR + 50))
  )

  const color_state = getColorState(readiness_score)

  return {
    new_state,
    fitness_score: Math.round(fitness_score * 10000) / 10000,
    raw_fatigue: Math.round(raw_fatigue * 10000) / 10000,
    raw_readiness: Math.round(raw_readiness * 10000) / 10000,
    readiness_score,
    color_state,
  }
}

// ─────────────────────────────────────────────
// Decay state on rest days (no session load)
// ─────────────────────────────────────────────

export function decayBanisterState(prev_state: BanisterState): BanisterState {
  return {
    fitness: (1 - LAMBDA.fitness) * prev_state.fitness,
    fat_mec: (1 - LAMBDA.fat_mec) * prev_state.fat_mec,
    fat_snc: (1 - LAMBDA.fat_snc) * prev_state.fat_snc,
    fat_met: (1 - LAMBDA.fat_met) * prev_state.fat_met,
    fat_art: (1 - LAMBDA.fat_art) * prev_state.fat_art,
  }
}

// ─────────────────────────────────────────────
// Color state from score (canonical thresholds)
// ─────────────────────────────────────────────

export function getColorState(readiness_score: number): ColorState {
  if (readiness_score >= 75) return 'green'
  if (readiness_score >= 55) return 'blue'
  if (readiness_score >= 40) return 'yellow'
  if (readiness_score >= 25) return 'orange'
  return 'red'
}

// ─────────────────────────────────────────────
// Get previous state from DB (for incremental update)
// ─────────────────────────────────────────────

export async function getPreviousBanisterState(athlete_id: string, before_date: string): Promise<BanisterState> {
  const [prev] = await db
    .select({
      fitness_score: readiness_daily.fitness_score,
      fatiga_mecanica: readiness_daily.fatiga_mecanica,
      fatiga_snc: readiness_daily.fatiga_snc,
      fatiga_metabolica: readiness_daily.fatiga_metabolica,
      fatiga_articular: readiness_daily.fatiga_articular,
    })
    .from(readiness_daily)
    .where(
      and(
        eq(readiness_daily.athlete_id, athlete_id),
        lte(readiness_daily.date, before_date)
      )
    )
    .orderBy(desc(readiness_daily.date))
    .limit(1)

  if (!prev) {
    // Cold start — all zeros
    return { fitness: 0, fat_mec: 0, fat_snc: 0, fat_met: 0, fat_art: 0 }
  }

  return {
    fitness:  parseFloat(String(prev.fitness_score ?? 0)),
    fat_mec:  parseFloat(String(prev.fatiga_mecanica ?? 0)),
    fat_snc:  parseFloat(String(prev.fatiga_snc ?? 0)),
    fat_met:  parseFloat(String(prev.fatiga_metabolica ?? 0)),
    fat_art:  parseFloat(String(prev.fatiga_articular ?? 0)),
  }
}

// ─────────────────────────────────────────────
// Recommendation text per color
// ─────────────────────────────────────────────

export function getReadinessRecommendation(
  color: ColorState,
  athlete_name?: string
): string {
  const prefix = athlete_name ? `${athlete_name}: ` : ''
  const messages: Record<ColorState, string> = {
    green:  `${prefix}Listo para rendir al máximo. Día ideal para PR o trabajo intenso.`,
    blue:   `${prefix}Buen día de entrenamiento. Ejecuta el WOD completo con buena forma.`,
    yellow: `${prefix}Entrena con cuidado. Considera escalar si algo no se siente bien.`,
    orange: `${prefix}Día difícil — reduce intensidad 20-30%. Prioriza calidad sobre cantidad.`,
    red:    `${prefix}Día de recuperación. Movilidad, caminata o descanso activo recomendado.`,
  }
  return messages[color]
}
