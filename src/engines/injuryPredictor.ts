/**
 * ENGINE #11 — Injury Predictor
 *
 * Predicción de riesgo de lesión basada en:
 *   - Historial ACWR (últimas 8 semanas)
 *   - Tendencia de readiness (patrones decrecientes)
 *   - Asimetrías de movimiento (desequilibrios 1RM)
 *   - Frecuencia de lesiones previas
 *
 * Propósito: Alertar de riesgo de lesión en próximas 2 semanas
 * Output: Injury risk % + body parts at risk + alerts + prevention suggestions
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type BodyPart = 'shoulder' | 'knee' | 'lower_back' | 'ankle' | 'elbow' | 'hip' | 'wrist'
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical'

const ACWR_INJURY_THRESHOLDS = {
  low: { min: 0, max: 1.0 },
  moderate: { min: 1.0, max: 1.4 },
  high: { min: 1.4, max: 1.7 },
  critical: { min: 1.7, max: Infinity },
}

const READINESS_DECLINE_THRESHOLD = -0.1 // 10% week-over-week decline is concerning

const ASYMMETRY_THRESHOLDS = {
  low: { min: 0, max: 5 }, // <5% difference
  moderate: { min: 5, max: 10 }, // 5-10% difference
  high: { min: 10, max: 15 }, // 10-15% difference
  critical: { min: 15, max: Infinity }, // >15% difference
}

const BODY_PART_ACWR_MAPPING: Record<BodyPart, { primary_movements: string[]; sensitivity: number }> = {
  shoulder: { primary_movements: ['snatch', 'press', 'pull_up'], sensitivity: 0.9 },
  knee: { primary_movements: ['squat', 'running', 'box_jump'], sensitivity: 0.95 },
  lower_back: { primary_movements: ['deadlift', 'squat', 'rowing'], sensitivity: 0.85 },
  ankle: { primary_movements: ['running', 'box_jump', 'lateral_movement'], sensitivity: 0.8 },
  elbow: { primary_movements: ['press', 'pull_up', 'ring_work'], sensitivity: 0.75 },
  hip: { primary_movements: ['squat', 'deadlift', 'lunges'], sensitivity: 0.9 },
  wrist: { primary_movements: ['snatch', 'front_squat', 'push_press'], sensitivity: 0.7 },
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface ACWRHistoryPoint {
  date: string
  acwr_value: number
  acwr_zone: 'optimal' | 'caution' | 'danger'
}

export interface MovementStrength {
  movement: string
  one_rm: number
  bodyweight: number
}

export interface BodyPartAsymmetry {
  left_side_1rm: number
  right_side_1rm: number
}

export interface InjuryPredictorInput {
  athlete_id: string
  date: string
  acwr_history_8w: ACWRHistoryPoint[]
  readiness_history_8w: number[] // 8 weeks of readiness scores (0-100)
  movement_strengths: MovementStrength[]
  body_asymmetries: Partial<Record<BodyPart, BodyPartAsymmetry>>
  previous_injuries: { body_part: BodyPart; date: string; severity: 'minor' | 'moderate' | 'severe' }[]
  training_frequency_weekly?: number // days per week
  sleep_average?: number // hours per night
}

export interface BodyPartRisk {
  body_part: BodyPart
  risk_pct: number
  risk_level: RiskLevel
  factors: string[]
}

export interface InjuryPredictorResult {
  overall_injury_risk_pct: number
  overall_risk_level: RiskLevel

  at_risk_body_parts: BodyPartRisk[]
  highest_risk_part: BodyPart | null
  highest_risk_pct: number

  acwr_trend: 'improving' | 'stable' | 'declining'
  readiness_trend: 'improving' | 'stable' | 'declining'
  asymmetry_issues: { body_part: BodyPart; asymmetry_pct: number }[]

  prevention_suggestions: string[]
  urgent_alerts: string[]

  confidence_pct: number
  confidence_notes: string
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Calcula tendencia ACWR en últimas 8 semanas
 */
export function calculateACWRTrend(acwr_history: ACWRHistoryPoint[]): 'improving' | 'stable' | 'declining' {
  if (acwr_history.length < 7) return 'stable'

  const weeks = Math.min(Math.floor(acwr_history.length / 7), 8)
  let week1_avg = 0
  let week_latest_avg = 0

  // First week average
  for (let i = 0; i < Math.min(7, acwr_history.length); i++) {
    week1_avg += acwr_history[i].acwr_value
  }
  week1_avg /= Math.min(7, acwr_history.length)

  // Latest week average
  for (let i = Math.max(0, acwr_history.length - 7); i < acwr_history.length; i++) {
    week_latest_avg += acwr_history[i].acwr_value
  }
  week_latest_avg /= Math.min(7, acwr_history.length - Math.max(0, acwr_history.length - 7))

  const change = week_latest_avg - week1_avg
  const change_pct = week1_avg > 0 ? change / week1_avg : 0

  if (change_pct < -0.15) return 'improving'
  if (change_pct > 0.15) return 'declining'
  return 'stable'
}

/**
 * Calcula tendencia readiness en últimas 8 semanas
 */
export function calculateReadinessTrend(readiness_history: number[]): 'improving' | 'stable' | 'declining' {
  if (readiness_history.length < 7) return 'stable'

  const weeks = Math.min(Math.floor(readiness_history.length / 7), 8)

  // First week average
  let week1_avg = 0
  for (let i = 0; i < Math.min(7, readiness_history.length); i++) {
    week1_avg += readiness_history[i]
  }
  week1_avg /= Math.min(7, readiness_history.length)

  // Latest week average
  let week_latest_avg = 0
  for (let i = Math.max(0, readiness_history.length - 7); i < readiness_history.length; i++) {
    week_latest_avg += readiness_history[i]
  }
  week_latest_avg /= Math.min(7, readiness_history.length - Math.max(0, readiness_history.length - 7))

  const change = week_latest_avg - week1_avg
  const change_pct = week1_avg > 0 ? change / week1_avg : 0

  if (change_pct < -0.15) return 'declining'
  if (change_pct > 0.15) return 'improving'
  return 'stable'
}

/**
 * Calcula asimetría entre lados (izq/der) para un body part
 */
export function calculateAsymmetryPct(left_1rm: number, right_1rm: number): number {
  if (left_1rm === 0 || right_1rm === 0) return 0
  const diff = Math.abs(left_1rm - right_1rm)
  const avg = (left_1rm + right_1rm) / 2
  return Math.round((diff / avg) * 1000) / 10
}

/**
 * Determina risk level basado en porcentaje
 */
export function determineRiskLevel(risk_pct: number): RiskLevel {
  if (risk_pct >= 60) return 'critical'
  if (risk_pct >= 40) return 'high'
  if (risk_pct >= 20) return 'moderate'
  return 'low'
}

/**
 * Main: Injury prediction
 */
export function predictInjuryRisk(input: InjuryPredictorInput): InjuryPredictorResult {
  const {
    acwr_history_8w,
    readiness_history_8w,
    movement_strengths,
    body_asymmetries,
    previous_injuries,
    training_frequency_weekly,
    sleep_average,
  } = input

  // Step 1: ACWR risk calculation
  let acwr_risk_pct = 0
  const danger_days = acwr_history_8w.filter(h => h.acwr_zone === 'danger').length
  const caution_days = acwr_history_8w.filter(h => h.acwr_zone === 'caution').length

  // Danger zone: 1% risk per day, Caution: 0.3% per day
  acwr_risk_pct = danger_days * 1.0 + caution_days * 0.3
  acwr_risk_pct = Math.min(acwr_risk_pct, 50) // Cap at 50%

  // Step 2: Readiness decline detection
  let readiness_risk_pct = 0
  const readiness_trend = calculateReadinessTrend(readiness_history_8w)
  if (readiness_trend === 'declining') {
    readiness_risk_pct = 15
  }
  if (readiness_history_8w.length > 0) {
    const latest_readiness = readiness_history_8w[readiness_history_8w.length - 1]
    if (latest_readiness < 30) readiness_risk_pct = 25 // Critical fatigue
    else if (latest_readiness < 50) readiness_risk_pct = 15
  }

  // Step 3: Asymmetry detection
  const asymmetry_issues: { body_part: BodyPart; asymmetry_pct: number }[] = []
  let asymmetry_risk_pct = 0

  for (const [body_part, asymmetry] of Object.entries(body_asymmetries)) {
    const asym = asymmetry as BodyPartAsymmetry
    const asymmetry_pct = calculateAsymmetryPct(asym.left_side_1rm, asym.right_side_1rm)
    if (asymmetry_pct > 5) {
      asymmetry_issues.push({ body_part: body_part as BodyPart, asymmetry_pct })
      if (asymmetry_pct >= 15) asymmetry_risk_pct += 20
      else if (asymmetry_pct >= 10) asymmetry_risk_pct += 12
      else asymmetry_risk_pct += 6
    }
  }
  asymmetry_risk_pct = Math.min(asymmetry_risk_pct, 30)

  // Step 4: Previous injury recurrence risk
  let recurrence_risk_pct = 0
  const recent_injuries = previous_injuries.filter(inj => {
    const daysAgo = Math.floor(
      (new Date(input.date).getTime() - new Date(inj.date).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysAgo < 180 // Within 6 months
  })

  if (recent_injuries.length >= 2) recurrence_risk_pct = 20
  else if (recent_injuries.length === 1) recurrence_risk_pct = 10

  // Step 5: Sleep deficit factor
  let sleep_risk_pct = 0
  if (sleep_average !== undefined) {
    if (sleep_average < 6) sleep_risk_pct = 15
    else if (sleep_average < 7) sleep_risk_pct = 8
  }

  // Step 6: Overall risk calculation
  const overall_risk_pct = Math.min(
    acwr_risk_pct + readiness_risk_pct + asymmetry_risk_pct + recurrence_risk_pct + sleep_risk_pct,
    100
  )

  const overall_risk_level = determineRiskLevel(overall_risk_pct)
  const acwr_trend = calculateACWRTrend(acwr_history_8w)

  // Step 7: Body part specific risk
  const at_risk_body_parts: BodyPartRisk[] = []
  let highest_risk_pct = 0
  let highest_risk_part: BodyPart | null = null

  const body_parts: BodyPart[] = ['shoulder', 'knee', 'lower_back', 'ankle', 'elbow', 'hip', 'wrist']

  for (const part of body_parts) {
    let part_risk = 0

    // ACWR contribution
    if (acwr_trend === 'declining') {
      part_risk += 8 * BODY_PART_ACWR_MAPPING[part].sensitivity
    }

    // Asymmetry contribution
    const asymmetry = asymmetry_issues.find(a => a.body_part === part)
    if (asymmetry) {
      if (asymmetry.asymmetry_pct >= 15) part_risk += 25
      else if (asymmetry.asymmetry_pct >= 10) part_risk += 15
      else part_risk += 8
    }

    // Previous injury contribution
    const part_injuries = recent_injuries.filter(i => i.body_part === part)
    if (part_injuries.length > 0) {
      part_risk += part_injuries.length * 15
    }

    // Readiness contribution
    if (readiness_history_8w.length > 0) {
      const latest = readiness_history_8w[readiness_history_8w.length - 1]
      if (latest < 40) part_risk += 12
    }

    part_risk = Math.min(part_risk, 80)

    if (part_risk > 10) {
      at_risk_body_parts.push({
        body_part: part,
        risk_pct: part_risk,
        risk_level: determineRiskLevel(part_risk),
        factors: buildRiskFactors(part, asymmetry, part_injuries, readiness_history_8w),
      })

      if (part_risk > highest_risk_pct) {
        highest_risk_pct = part_risk
        highest_risk_part = part
      }
    }
  }

  // Sort by risk
  at_risk_body_parts.sort((a, b) => b.risk_pct - a.risk_pct)

  // Step 8: Prevention suggestions
  const prevention_suggestions: string[] = []
  if (acwr_trend === 'declining') {
    prevention_suggestions.push('ACWR is rising — prioritize mobility work')
  }
  if (readiness_trend === 'declining') {
    prevention_suggestions.push('Readiness is declining — increase sleep and recovery')
  }
  if (asymmetry_issues.length > 0) {
    prevention_suggestions.push(`Fix asymmetries: ${asymmetry_issues.map(a => a.body_part).join(', ')}`)
  }
  if (sleep_average !== undefined && sleep_average < 7) {
    prevention_suggestions.push(`Sleep is low (${sleep_average}h) — target 8-9h`)
  }

  // Step 9: Urgent alerts
  const urgent_alerts: string[] = []
  if (overall_risk_level === 'critical') {
    urgent_alerts.push(`⚠️ CRITICAL injury risk (${overall_risk_pct}%) — consider deload week`)
  }
  if (highest_risk_part && highest_risk_pct >= 50) {
    urgent_alerts.push(`🚨 ${highest_risk_part} at severe risk (${highest_risk_pct}%) — prioritize prevention`)
  }
  if (danger_days >= 5) {
    urgent_alerts.push('High ACWR exposure (5+ days danger) — elevated tissue stress')
  }

  // Step 10: Confidence scoring
  let confidence_pct = 70
  if (acwr_history_8w.length >= 56) confidence_pct += 15 // 8 full weeks
  if (readiness_history_8w.length >= 56) confidence_pct += 10
  if (body_asymmetries && Object.keys(body_asymmetries).length >= 3) confidence_pct += 10
  if (previous_injuries.length >= 2) confidence_pct += 5

  confidence_pct = Math.min(confidence_pct, 95)

  const confidence_notes =
    acwr_history_8w.length < 14
      ? 'Limited ACWR history — confidence low'
      : acwr_history_8w.length < 28
        ? 'Partial data — confidence moderate'
        : 'Full 8-week history — high confidence'

  return {
    overall_injury_risk_pct: Math.round(overall_risk_pct),
    overall_risk_level,

    at_risk_body_parts,
    highest_risk_part,
    highest_risk_pct: Math.round(highest_risk_pct),

    acwr_trend,
    readiness_trend,
    asymmetry_issues,

    prevention_suggestions,
    urgent_alerts,

    confidence_pct,
    confidence_notes,
  }
}

/**
 * Helper: Build risk factor list for body part
 */
function buildRiskFactors(
  body_part: BodyPart,
  asymmetry: { body_part: BodyPart; asymmetry_pct: number } | undefined,
  injuries: any[],
  readiness_history: number[]
): string[] {
  const factors: string[] = []

  if (asymmetry) {
    factors.push(`Asymmetry: ${asymmetry.asymmetry_pct}%`)
  }
  if (injuries.length > 0) {
    factors.push(`Previous ${body_part} injury(ies)`)
  }
  if (readiness_history.length > 0 && readiness_history[readiness_history.length - 1] < 50) {
    factors.push('Low readiness')
  }

  return factors
}
