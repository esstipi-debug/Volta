/**
 * ENGINE #06 — Movement Escalation
 *
 * Recomienda scaling automático (Rx+/Rx/Beginner) basado en:
 *   - 1RM vs peso propuesto
 *   - Historial reciente (últimas 3 sesiones)
 *   - Form/injury cooldowns activos
 *   - Bodyweight ratios
 *
 * Propósito: Prevenir lesiones (no escalar si form bad)
 * y optimizar desafío (no descalar si fácil).
 *
 * Output: Scale recommendation + reason + confidence (0-100)
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const SCALE_THRESHOLDS = {
  RX_PLUS: {
    min_pct_1rm: 85,  // ≥85% of 1RM = Rx+ capable
    recent_success_threshold: 4, // ≥4/5 reps in last 3 sessions
  },
  RX: {
    min_pct_1rm: 70,  // 70-85% of 1RM = Rx recommended
    recent_success_threshold: 3,
  },
  BEGINNER: {
    min_pct_1rm: 0,   // <70% = beginner
    recent_success_threshold: 0,
  },
}

const CONFIDENCE_MODIFIERS = {
  NEW_MOVEMENT: -30,        // Never done before → low confidence
  INJURY_COOLDOWN: -50,     // Cooldown active → very low confidence
  RECENT_PR: 25,            // Just hit PR → boost confidence
  FORM_CONCERNS: -20,       // Form noted in comments → reduce confidence
  BODYWEIGHT_RATIO_GOOD: 10, // Weight/BW ratio good → slight boost
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type ScaleOption = 'rx_plus' | 'rx' | 'beginner'

export interface MovementEscalationInput {
  athlete_id: string
  movement_id: string
  current_1rm_kg: number
  proposed_weight_kg: number
  bodyweight_kg: number

  // Recent history (last 3 sessions with this movement)
  recent_sessions: Array<{
    date: string
    reps_target: number
    reps_completed: number
    weight_kg: number
    scale_used: ScaleOption
    notes?: string // form issues, felt easy, etc.
  }>

  // Flags
  is_new_movement: boolean
  injury_cooldown_active: boolean
  cooldown_days_remaining?: number
}

export interface MovementEscalationResult {
  recommended_scale: ScaleOption
  suggested_weight_kg?: number
  confidence_pct: number
  reason: string

  // Detailed breakdown
  pct_1rm: number
  recent_success_rate: number
  risk_level: 'low' | 'medium' | 'high'
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Calcula porcentaje del 1RM
 */
export function calculatePct1RM(proposed_weight: number, current_1rm: number): number {
  if (current_1rm === 0) return 0
  return Math.round((proposed_weight / current_1rm) * 100)
}

/**
 * Score reciente: cuántas sesiones de las últimas 3 completó targets
 */
export function calculateRecentSuccessRate(
  recent_sessions: Array<{ reps_target: number; reps_completed: number }>
): number {
  if (recent_sessions.length === 0) return 0
  const successful = recent_sessions.filter((s) => s.reps_completed >= s.reps_target).length
  return Math.round((successful / recent_sessions.length) * 100)
}

/**
 * Detecta form concerns en comentarios
 */
function hasFormConcerns(sessions: Array<{ notes?: string }>): boolean {
  const concerns = ['form', 'balance', 'pain', 'tight', 'unstable', 'shaky']
  return sessions.some(
    (s) =>
      s.notes &&
      concerns.some((concern) =>
        s.notes!.toLowerCase().includes(concern)
      )
  )
}

/**
 * Detecta si tuvo PR reciente (peso > any previous)
 */
function hasRecentPR(
  proposed_weight: number,
  recent_sessions: Array<{ weight_kg: number }>
): boolean {
  if (recent_sessions.length === 0) return false
  const max_previous = Math.max(...recent_sessions.map((s) => s.weight_kg))
  return proposed_weight > max_previous
}

/**
 * Main: recomendación de scaling
 */
export function recommendMovementScale(input: MovementEscalationInput): MovementEscalationResult {
  const {
    current_1rm_kg,
    proposed_weight_kg,
    bodyweight_kg,
    recent_sessions,
    is_new_movement,
    injury_cooldown_active,
    cooldown_days_remaining,
  } = input

  // Step 1: Calcular % del 1RM
  const pct_1rm = calculatePct1RM(proposed_weight_kg, current_1rm_kg)

  // Step 2: Calcular success rate reciente
  const recent_success_rate = calculateRecentSuccessRate(recent_sessions)

  // Step 3: Determinar escala base
  let recommended_scale: ScaleOption
  if (pct_1rm >= SCALE_THRESHOLDS.RX_PLUS.min_pct_1rm) {
    recommended_scale = 'rx_plus'
  } else if (pct_1rm >= SCALE_THRESHOLDS.RX.min_pct_1rm) {
    recommended_scale = 'rx'
  } else {
    recommended_scale = 'beginner'
  }

  // Step 4: Aplicar flags (injury, new movement)
  let risk_level: 'low' | 'medium' | 'high' = 'low'
  let confidence_pct = 80

  if (is_new_movement) {
    recommended_scale = 'beginner' // Always start beginner
    confidence_pct += CONFIDENCE_MODIFIERS.NEW_MOVEMENT
    risk_level = 'medium'
  }

  if (injury_cooldown_active) {
    recommended_scale = 'beginner' // Always downscale during cooldown
    confidence_pct += CONFIDENCE_MODIFIERS.INJURY_COOLDOWN
    risk_level = 'high'
  }

  // Step 5: Form concerns
  if (hasFormConcerns(recent_sessions)) {
    if (recommended_scale === 'rx_plus') recommended_scale = 'rx'
    confidence_pct += CONFIDENCE_MODIFIERS.FORM_CONCERNS
    risk_level = 'high'
  }

  // Step 6: Boosts
  if (hasRecentPR(proposed_weight_kg, recent_sessions)) {
    confidence_pct += CONFIDENCE_MODIFIERS.RECENT_PR
  }

  // Bodyweight ratio (e.g., if pressing 60kg at 65kg BW = good)
  const weight_to_bw_ratio = proposed_weight_kg / bodyweight_kg
  if (weight_to_bw_ratio >= 0.9 && weight_to_bw_ratio <= 1.1) {
    confidence_pct += CONFIDENCE_MODIFIERS.BODYWEIGHT_RATIO_GOOD
  }

  // Step 7: Clamp confidence
  confidence_pct = Math.max(0, Math.min(100, confidence_pct))

  // Step 8: Generar reason
  let reason = ''
  if (is_new_movement) {
    reason = 'New movement — start with Beginner scale to master form.'
  } else if (injury_cooldown_active) {
    reason = `Injury cooldown active (${cooldown_days_remaining}d remaining) — reduced scale for safety.`
  } else if (hasFormConcerns(recent_sessions)) {
    reason = 'Form concerns noted in recent sessions — recommending lower scale.'
  } else if (pct_1rm >= 85) {
    reason = `${pct_1rm}% of 1RM + recent success (${recent_success_rate}%) → Rx+ capable.`
  } else if (pct_1rm >= 70) {
    reason = `${pct_1rm}% of 1RM → solid Rx recommendation.`
  } else {
    reason = `${pct_1rm}% of 1RM → start with Beginner, build up.`
  }

  return {
    recommended_scale,
    suggested_weight_kg: proposed_weight_kg,
    confidence_pct,
    reason,
    pct_1rm,
    recent_success_rate,
    risk_level,
  }
}

/**
 * Override utility: coach can force a scale with reason
 */
export function coachOverride(
  recommended: MovementEscalationResult,
  forced_scale: ScaleOption,
  override_reason: string
): MovementEscalationResult {
  return {
    ...recommended,
    recommended_scale: forced_scale,
    reason: `[COACH OVERRIDE] ${override_reason}`,
  }
}
