/**
 * ENGINE #10 — Recovery Optimizer
 *
 * Recomendaciones de recuperación basadas en:
 *   - Readiness score
 *   - ACWR zone
 *   - Sleep history (últimos 7 días)
 *   - Injury cooldowns activos
 *
 * Propósito: Optimizar recuperación sin sobreentrenamiento
 * Output: Sleep target + mobility focus + deload suggestion + supplements
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type ACWRZone = 'danger' | 'caution' | 'optimal'
export type MobilityArea = 'shoulders' | 'hips' | 'ankles' | 'thoracic' | 'lower_back' | 'wrists'
export type Supplement = 'magnesium' | 'creatine' | 'beta_alanine' | 'caffeine' | 'fish_oil' | 'zinc'
export type RecoveryPriority = 'sleep' | 'mobility' | 'deload' | 'active_recovery' | 'nutrition'

const SLEEP_TARGETS = {
  RED_READINESS: { min: 9, max: 10 }, // Crítica fatiga
  ORANGE_READINESS: { min: 8.5, max: 9 }, // Fatiga moderada
  YELLOW_READINESS: { min: 8, max: 8.5 }, // Fatiga leve
  GREEN_READINESS: { min: 7, max: 8 }, // Óptimo
}

const MOBILITY_FOCUS_BY_ACWR = {
  danger: ['hips', 'lower_back', 'shoulders'], // Cadena posterior + stabilidad
  caution: ['hips', 'ankles', 'thoracic'],
  optimal: ['wrists', 'shoulders'], // Mantenimiento
}

const SUPPLEMENT_RECOMMENDATIONS: Record<string, { supplement: Supplement; dosage: string; reason: string }[]> = {
  high_fatigue: [
    { supplement: 'magnesium', dosage: '400-500mg', reason: 'Reduce muscle tension, improve sleep' },
    { supplement: 'fish_oil', dosage: '2-3g', reason: 'Anti-inflammatory, support recovery' },
    { supplement: 'zinc', dosage: '15-30mg', reason: 'Immune support, hormone balance' },
  ],
  danger_acwr: [
    { supplement: 'magnesium', dosage: '400-500mg', reason: 'Critical fatigue management' },
    { supplement: 'fish_oil', dosage: '3-4g', reason: 'High anti-inflammatory dose' },
    { supplement: 'beta_alanine', dosage: '3-5g', reason: 'Buffering lactate accumulation' },
  ],
  intense_training: [
    { supplement: 'creatine', dosage: '5g daily', reason: 'ATP synthesis, power recovery' },
    { supplement: 'beta_alanine', dosage: '3-5g', reason: 'Carnosine buffering' },
  ],
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SleepRecord {
  date: string
  hours_slept: number
  sleep_quality: number // 1-10 scale
  notes?: string
}

export interface InjuryRecord {
  injury_type: string
  body_part: string
  cooldown_days_remaining: number
  severity: 'minor' | 'moderate' | 'severe'
}

export interface RecoveryOptimizerInput {
  athlete_id: string
  date: string
  readiness_score: number // 0-100
  acwr_zone: ACWRZone
  acwr_value: number
  sleep_history_7d: SleepRecord[]
  active_injuries: InjuryRecord[]

  // Additional context
  training_intensity_yesterday?: 'light' | 'moderate' | 'high'
  consecutive_high_acwr_days?: number // Days with ACWR > 1.4
}

export interface SupplementRecommendation {
  supplement: Supplement
  dosage: string
  reason: string
}

export interface RecoveryOptimizerResult {
  sleep_target_hours: {
    min: number
    max: number
  }
  sleep_quality_feedback: string

  mobility_focus: MobilityArea[]
  mobility_duration_min: number

  deload_suggested: boolean
  deload_type?: 'light_week' | 'active_only' | 'rest_day'
  deload_reason?: string

  supplements: SupplementRecommendation[]
  supplement_priority: 'critical' | 'important' | 'optional'

  recovery_priorities: RecoveryPriority[]
  top_priority: RecoveryPriority

  motivation_message: string
  confidence_pct: number
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Calcula promedio de horas dormidas en últimos 7 días
 */
export function calculateAverageSleep(sleep_history: SleepRecord[]): number {
  if (sleep_history.length === 0) return 0
  const total = sleep_history.reduce((sum, s) => sum + s.hours_slept, 0)
  return Math.round((total / sleep_history.length) * 10) / 10
}

/**
 * Calcula calidad promedio de sueño
 */
export function calculateAverageSleepQuality(sleep_history: SleepRecord[]): number {
  if (sleep_history.length === 0) return 5
  const total = sleep_history.reduce((sum, s) => sum + s.sleep_quality, 0)
  return Math.round((total / sleep_history.length) * 10) / 10
}

/**
 * Determina target de sueño basado en readiness
 */
function determineSleepTarget(readiness_score: number): { min: number; max: number } {
  if (readiness_score <= 24) return SLEEP_TARGETS.RED_READINESS
  if (readiness_score <= 49) return SLEEP_TARGETS.ORANGE_READINESS
  if (readiness_score <= 74) return SLEEP_TARGETS.YELLOW_READINESS
  return SLEEP_TARGETS.GREEN_READINESS
}

/**
 * Determina si necesita deload week
 */
function shouldDeload(
  acwr_zone: ACWRZone,
  consecutive_high_days: number,
  active_injuries: InjuryRecord[]
): { suggested: boolean; type?: 'light_week' | 'active_only' | 'rest_day'; reason?: string } {
  // If danger ACWR for 5+ days
  if ((consecutive_high_days ?? 0) >= 5) {
    return {
      suggested: true,
      type: 'light_week',
      reason: 'Cumulative high ACWR exposure — deload week recommended',
    }
  }

  // If danger ACWR + active injury
  if (acwr_zone === 'danger' && active_injuries.length > 0) {
    const severe_injuries = active_injuries.filter(i => i.severity === 'severe')
    if (severe_injuries.length > 0) {
      return {
        suggested: true,
        type: 'active_only',
        reason: 'High ACWR + severe injury — active recovery only',
      }
    }
  }

  // If multiple active injuries
  if (active_injuries.length >= 2) {
    return {
      suggested: true,
      type: 'rest_day',
      reason: `Multiple active injuries (${active_injuries.length}) — recommend full rest day`,
    }
  }

  return { suggested: false }
}

/**
 * Main: Recovery optimization
 */
export function optimizeRecovery(input: RecoveryOptimizerInput): RecoveryOptimizerResult {
  const {
    readiness_score,
    acwr_zone,
    acwr_value,
    sleep_history_7d,
    active_injuries,
    training_intensity_yesterday,
    consecutive_high_acwr_days,
  } = input

  // Step 1: Sleep target
  const sleep_target = determineSleepTarget(readiness_score)
  const avg_sleep = calculateAverageSleep(sleep_history_7d)
  const avg_quality = calculateAverageSleepQuality(sleep_history_7d)

  let sleep_feedback = ''
  if (avg_sleep < sleep_target.min) {
    sleep_feedback = `Currently sleeping ${avg_sleep}h (target ${sleep_target.min}-${sleep_target.max}h). Increase sleep to support recovery.`
  } else if (avg_sleep > sleep_target.max) {
    sleep_feedback = `Sleeping ${avg_sleep}h (target ${sleep_target.min}-${sleep_target.max}h). May indicate overtraining — consider deload.`
  } else {
    sleep_feedback = `Sleep ${avg_sleep}h is on target (${sleep_target.min}-${sleep_target.max}h). Maintain consistency.`
  }

  if (avg_quality < 5) {
    sleep_feedback += ' Sleep quality is low — consider sleep hygiene improvements.'
  }

  // Step 2: Mobility focus
  const mobility_focus = MOBILITY_FOCUS_BY_ACWR[acwr_zone] as MobilityArea[]
  const mobility_duration = acwr_zone === 'danger' ? 15 : acwr_zone === 'caution' ? 12 : 10

  // Step 3: Deload decision
  const deload_decision = shouldDeload(acwr_zone, consecutive_high_acwr_days, active_injuries)

  // Step 4: Supplement recommendations
  let supplements: SupplementRecommendation[] = []
  let supplement_priority: 'critical' | 'important' | 'optional' = 'optional'

  if (acwr_zone === 'danger') {
    supplements = SUPPLEMENT_RECOMMENDATIONS.danger_acwr
    supplement_priority = 'critical'
  } else if (readiness_score <= 35) {
    supplements = SUPPLEMENT_RECOMMENDATIONS.high_fatigue
    supplement_priority = 'important'
  } else if (training_intensity_yesterday === 'high') {
    supplements = SUPPLEMENT_RECOMMENDATIONS.intense_training
    supplement_priority = 'important'
  }

  // Step 5: Recovery priorities
  const recovery_priorities: RecoveryPriority[] = []
  let top_priority: RecoveryPriority = 'sleep'

  if (avg_sleep < sleep_target.min) {
    recovery_priorities.push('sleep')
    top_priority = 'sleep'
  }
  if (acwr_zone === 'danger') {
    recovery_priorities.push('mobility')
  }
  if (deload_decision.suggested) {
    recovery_priorities.push('deload')
    top_priority = 'deload'
  }
  if (active_injuries.length > 0) {
    recovery_priorities.push('active_recovery')
  }
  if (readiness_score <= 40) {
    recovery_priorities.push('nutrition')
  }

  // If empty, add default
  if (recovery_priorities.length === 0) {
    recovery_priorities.push('mobility')
    top_priority = 'mobility'
  }

  // Step 6: Confidence
  let confidence_pct = 80
  if (acwr_zone === 'danger') confidence_pct = 95 // Clear signal
  if (active_injuries.length > 0) confidence_pct += 10 // Clear need for recovery
  if (avg_sleep >= sleep_target.min && avg_sleep <= sleep_target.max) confidence_pct += 5

  // Step 7: Motivation message
  let motivation_message = ''
  if (deload_decision.suggested) {
    motivation_message = `Your body needs a break. ${deload_decision.reason} This investment will improve long-term performance.`
  } else if (acwr_zone === 'danger') {
    motivation_message = `High training load detected. Prioritize ${sleep_target.max}h sleep + ${mobility_duration}min mobility to stay healthy.`
  } else if (readiness_score >= 80) {
    motivation_message = `You're recovering well! Maintain your sleep routine (${sleep_target.min}-${sleep_target.max}h) and keep moving with mobility work.`
  } else {
    motivation_message = `You're in recovery mode. Focus on sleep (${sleep_target.min}-${sleep_target.max}h) and mobility to bounce back stronger.`
  }

  return {
    sleep_target_hours: sleep_target,
    sleep_quality_feedback: sleep_feedback,

    mobility_focus,
    mobility_duration_min: mobility_duration,

    deload_suggested: deload_decision.suggested,
    deload_type: deload_decision.type,
    deload_reason: deload_decision.reason,

    supplements,
    supplement_priority,

    recovery_priorities,
    top_priority,

    motivation_message,
    confidence_pct: Math.max(0, Math.min(100, confidence_pct)),
  }
}
