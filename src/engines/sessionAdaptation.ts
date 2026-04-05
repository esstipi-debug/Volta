/**
 * ENGINE #07 — Session Adaptation
 *
 * Adapta WOD en tiempo real (substituciones, ajustes) basado en:
 *   - Readiness score (Engine #04)
 *   - ACWR zone (Engine #02)
 *   - Scheduled WOD template
 *
 * Propósito: Prevenir sobreentrenamiento sin cancelar sesión
 * Ofrece 3 opciones: run as-is, reduce, recover
 *
 * Output: Suggested modifications + rationale + confidence (0-100)
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type ReadinessLevel = 'red' | 'orange' | 'yellow' | 'green'
export type ACWRZone = 'danger' | 'caution' | 'optimal'
export type AdaptationAction = 'run_as_is' | 'reduce_intensity' | 'reduce_volume' | 'recovery_only' | 'deload_suggested'

export const READINESS_THRESHOLDS = {
  red: { min: 0, max: 24 },
  orange: { min: 25, max: 49 },
  yellow: { min: 50, max: 74 },
  green: { min: 75, max: 100 },
}

export const ACWR_THRESHOLDS = {
  danger: { min: 1.5, max: 999 },
  caution: { min: 1.2, max: 1.49 },
  optimal: { min: 0.8, max: 1.19 },
}

const ADAPTATION_RULES = {
  RED_READINESS: {
    action: 'recovery_only' as AdaptationAction,
    intensity_reduction: 100,
    volume_reduction: 100,
    suggestion: 'Mobility work, walking, light stretching only',
  },
  ORANGE_READINESS: {
    action: 'reduce_intensity' as AdaptationAction,
    intensity_reduction: 25,
    volume_reduction: 20,
    suggestion: 'Reduce intensity 20-30%, maintain volume',
  },
  YELLOW_READINESS: {
    action: 'run_as_is' as AdaptationAction,
    intensity_reduction: 0,
    volume_reduction: 0,
    suggestion: 'Run as-is, option to scale down if needed',
  },
  ACWR_DANGER: {
    cns_movement_substitution: true,
    reduce_heavy_singles: true,
    suggestion: 'Reduce high-CNS movements (snatch → power clean)',
  },
  ACWR_CAUTION_CONSECUTIVE: {
    action: 'deload_suggested' as AdaptationAction,
    suggestion: 'Consecutive caution days detected → consider deload week',
  },
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface WODMovement {
  name: string
  cns_cost: number // 0-10 scale (10=most demanding)
  is_heavy_lift: boolean // snatch, clean, jerk, heavy squats
}

export interface WODTemplate {
  id: string
  title: string
  movements: WODMovement[]
  estimated_duration_min: number
  intensity_rating: number // 1-10
  volume_reps: number // total reps in WOD
}

export interface SessionAdaptationInput {
  athlete_id: string
  date: string
  readiness_score: number // 0-100
  acwr_zone: ACWRZone
  acwr_value: number // actual ACWR ratio
  scheduled_wod: WODTemplate

  // Recent ACWR history (last 7 days)
  acwr_history_7d?: Array<{
    date: string
    zone: ACWRZone
  }>
}

export interface MovementSubstitution {
  original: string
  suggested: string
  reason: string
}

export interface SessionAdaptationResult {
  recommended_action: AdaptationAction
  readiness_level: ReadinessLevel
  intensity_reduction_pct: number
  volume_reduction_pct: number
  movement_substitutions: MovementSubstitution[]
  timing_suggestion?: string
  recovery_suggestion: string
  confidence_pct: number
  rationale: string
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Maps readiness score (0-100) to level
 */
export function getReadinessLevel(readiness_score: number): ReadinessLevel {
  if (readiness_score <= READINESS_THRESHOLDS.red.max) return 'red'
  if (readiness_score <= READINESS_THRESHOLDS.orange.max) return 'orange'
  if (readiness_score <= READINESS_THRESHOLDS.yellow.max) return 'yellow'
  return 'green'
}

/**
 * Calcula CNS cost promedio del WOD
 */
export function calculateWODCNSCost(movements: WODMovement[]): number {
  if (movements.length === 0) return 0
  return Math.round(movements.reduce((sum, m) => sum + m.cns_cost, 0) / movements.length)
}

/**
 * Detecta si hay N días consecutivos en caution/danger
 */
export function countConsecutiveACWRCautions(
  acwr_history: Array<{ date: string; zone: ACWRZone }>,
  threshold_days: number = 3
): number {
  if (!acwr_history || acwr_history.length === 0) return 0

  let count = 0
  for (let i = 0; i < acwr_history.length; i++) {
    if (acwr_history[i].zone === 'caution' || acwr_history[i].zone === 'danger') {
      count++
    } else {
      count = 0 // Reset on first optimal day
    }
  }
  return count
}

/**
 * Sugiere sustituciones de movimientos según ACWR
 */
function suggestMovementSubstitutions(
  movements: WODMovement[],
  acwr_zone: ACWRZone
): MovementSubstitution[] {
  const substitutions: MovementSubstitution[] = []

  if (acwr_zone === 'danger') {
    movements.forEach((m) => {
      if (m.is_heavy_lift && m.cns_cost >= 8) {
        // Suggest power variant instead of full movement
        if (m.name.toLowerCase().includes('snatch')) {
          substitutions.push({
            original: m.name,
            suggested: 'Power Snatch',
            reason: 'High ACWR: reduce CNS demand',
          })
        } else if (m.name.toLowerCase().includes('clean')) {
          substitutions.push({
            original: m.name,
            suggested: 'Power Clean',
            reason: 'High ACWR: reduce CNS demand',
          })
        } else if (m.name.toLowerCase().includes('jerk')) {
          substitutions.push({
            original: m.name,
            suggested: 'Push Press',
            reason: 'High ACWR: reduce CNS demand',
          })
        }
      }
    })
  }

  return substitutions
}

/**
 * Main: recomendación de adaptación
 */
export function recommendSessionAdaptation(
  input: SessionAdaptationInput
): SessionAdaptationResult {
  const {
    readiness_score,
    acwr_zone,
    acwr_value,
    scheduled_wod,
    acwr_history_7d = [],
  } = input

  // Step 1: Determinar readiness level
  const readiness_level = getReadinessLevel(readiness_score)

  // Step 2: Determinar acción base según readiness
  let recommended_action: AdaptationAction
  let intensity_reduction = 0
  let volume_reduction = 0
  let confidence_pct = 85

  switch (readiness_level) {
    case 'red':
      recommended_action = 'recovery_only'
      intensity_reduction = 100
      volume_reduction = 100
      confidence_pct = 95
      break
    case 'orange':
      recommended_action = 'reduce_intensity'
      intensity_reduction = 25
      volume_reduction = 20
      confidence_pct = 90
      break
    case 'yellow':
      recommended_action = 'run_as_is'
      intensity_reduction = 0
      volume_reduction = 0
      confidence_pct = 80
      break
    case 'green':
      recommended_action = 'run_as_is'
      intensity_reduction = 0
      volume_reduction = 0
      confidence_pct = 85
      break
  }

  // Step 3: Aplicar ACWR overrides
  if (acwr_zone === 'danger') {
    if (recommended_action === 'run_as_is') {
      // Escalate to reduce intensity if ACWR is danger
      recommended_action = 'reduce_intensity'
      intensity_reduction = Math.max(intensity_reduction, 20)
    }
    confidence_pct -= 10
  }

  if (acwr_zone === 'caution') {
    const consecutive_cautions = countConsecutiveACWRCautions(acwr_history_7d)
    if (consecutive_cautions >= 3) {
      recommended_action = 'deload_suggested'
      volume_reduction = Math.max(volume_reduction, 30)
      intensity_reduction = Math.max(intensity_reduction, 15)
    }
  }

  // Step 4: Suggest movement substitutions
  const movement_substitutions = suggestMovementSubstitutions(
    scheduled_wod.movements,
    acwr_zone
  )

  // Step 5: Timing suggestion
  let timing_suggestion: string | undefined
  if (intensity_reduction > 0 || volume_reduction > 0) {
    const adjusted_duration = Math.round(
      scheduled_wod.estimated_duration_min * (1 - Math.max(intensity_reduction, volume_reduction) / 100)
    )
    timing_suggestion = `Shorter session: ${adjusted_duration} min (vs ${scheduled_wod.estimated_duration_min} planned)`
  }

  // Step 6: Recovery suggestion
  let recovery_suggestion = ''
  const cns_cost = calculateWODCNSCost(scheduled_wod.movements)

  if (readiness_level === 'red') {
    recovery_suggestion = 'Sleep priority + mobility work recommended'
  } else if (readiness_level === 'orange') {
    recovery_suggestion = 'Extra sleep + static stretching recommended'
  } else if (cns_cost >= 7 && acwr_zone === 'danger') {
    recovery_suggestion = 'Cold plunge + yoga recommended after session'
  } else if (readiness_score >= 75) {
    recovery_suggestion = 'Standard recovery (sleep + hydration)'
  } else {
    recovery_suggestion = 'Extended warm-down (10-15 min) recommended'
  }

  // Step 7: Clamp confidence
  confidence_pct = Math.max(0, Math.min(100, confidence_pct))

  // Step 8: Generate rationale
  let rationale = ''
  if (readiness_level === 'red') {
    rationale = `Readiness critically low (${readiness_score}) → recovery focus. Consider full rest day.`
  } else if (readiness_level === 'orange') {
    rationale = `Readiness low (${readiness_score}) + ${acwr_zone} ACWR → reduce intensity 20-30%.`
  } else if (readiness_level === 'yellow') {
    if (acwr_zone === 'danger') {
      rationale = `Readiness moderate (${readiness_score}), but ${acwr_zone} ACWR (${acwr_value.toFixed(2)}) → reduce CNS movements.`
    } else {
      rationale = `Readiness good (${readiness_score}) and ${acwr_zone} ACWR → run as planned.`
    }
  } else {
    rationale = `Readiness excellent (${readiness_score}) and ${acwr_zone} ACWR → optimal conditions for WOD.`
  }

  if (movement_substitutions.length > 0) {
    rationale += ` [${movement_substitutions.length} movement substitution(s) suggested]`
  }

  return {
    recommended_action,
    readiness_level,
    intensity_reduction_pct: intensity_reduction,
    volume_reduction_pct: volume_reduction,
    movement_substitutions,
    timing_suggestion,
    recovery_suggestion,
    confidence_pct,
    rationale,
  }
}

/**
 * Coach override utility
 */
export function coachOverrideAdaptation(
  recommended: SessionAdaptationResult,
  override_action: AdaptationAction,
  override_reason: string
): SessionAdaptationResult {
  return {
    ...recommended,
    recommended_action: override_action,
    rationale: `[COACH OVERRIDE] ${override_reason}`,
    confidence_pct: Math.max(0, recommended.confidence_pct - 20), // Reduce confidence on override
  }
}
