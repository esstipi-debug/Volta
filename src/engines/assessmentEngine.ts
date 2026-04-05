/**
 * ENGINE #08 — Assessment Engine
 *
 * Evaluación periódica de capacidades (PRISMA VO2Max, 10D Radar Chart)
 *
 * Propósito: Medir progreso en 10 dimensiones de fitness
 * - Aerobic endurance (V1)
 * - Aerobic power (V2)
 * - Anaerobic capacity (V3)
 * - Absolute strength
 * - Strength endurance
 * - Power
 * - Gymnastics capacity
 * - Mobility
 * - Mental resilience
 * - Speed
 *
 * Output: Attribute scores + VO2Max estimate + progress tracking
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const ASSESSMENT_TYPES = {
  PRISMA_VO2MAX: 'prisma_vo2max',
  MOVEMENT_MASTERY: 'movement_mastery',
  STRENGTH_TEST: 'strength_test',
  GYMNASTICS_TEST: 'gymnastics_test',
  MOBILITY_TEST: 'mobility_test',
}

// VO2Max coefficient (varies by athlete type)
// Formula: VO2Max = (NP / BW) × coefficient
// Realistic for PRISMA protocol: ~10 ml/kg/min per W/kg
const VO2MAX_COEFFICIENT = 10

// 10D attribute thresholds (scores from 0-100)
export const ATTRIBUTE_THRESHOLDS = {
  EXCELLENT: 85,
  GOOD: 70,
  AVERAGE: 50,
  BELOW_AVERAGE: 30,
  POOR: 0,
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type AssessmentType = 'prisma_vo2max' | 'movement_mastery' | 'strength_test' | 'gymnastics_test' | 'mobility_test'

export interface PRISMATestResult {
  test_type: 'prisma_vo2max'
  duration_minutes: number // Total test time (5×5min + rests = 29min)
  intervals_completed: number // 1-5
  avg_watts: number
  normalized_power: number // NP (weighted average power)
  ftp_estimate: number // Functional Threshold Power
}

export interface AttributeScores {
  aerobic_endurance: number // V1
  aerobic_power: number // V2
  anaerobic_capacity: number // V3
  absolute_strength: number
  strength_endurance: number
  power: number
  gymnastics_capacity: number
  mobility: number
  mental_resilience: number
  speed: number
}

export interface RadarChartData {
  [key: string]: number
}

export interface AssessmentInput {
  athlete_id: string
  date: string
  bodyweight_kg: number
  assessment_type: AssessmentType
  test_result: PRISMATestResult | any // Flexible for future assessment types

  // Previous scores (for progress calculation)
  previous_scores_30d_ago?: AttributeScores
  previous_scores_90d_ago?: AttributeScores
  previous_vo2max_30d_ago?: number
  previous_vo2max_90d_ago?: number
}

export interface AssessmentResult {
  assessment_type: AssessmentType
  attribute_scores: AttributeScores
  overall_score: number // Average of all 10 attributes (0-100)
  vo2max_estimate?: number
  vo2max_category?: 'elite' | 'excellent' | 'good' | 'average' | 'below_average'

  // Progress indicators
  progress_vs_30d?: {
    overall_change_pct: number
    improved_attributes: string[]
    declined_attributes: string[]
    vo2max_change: number
  }
  progress_vs_90d?: {
    overall_change_pct: number
    improved_attributes: string[]
    declined_attributes: string[]
    vo2max_change: number
  }

  radar_chart_data: RadarChartData
  confidence_pct: number
  rationale: string
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Calcula VO2Max a partir de protocolo PRISMA
 * Formula: VO2Max (ml/kg/min) = (NP / BW) × coefficient
 */
export function calculateVO2MaxFromPRISMA(
  normalized_power: number,
  bodyweight_kg: number
): number {
  if (bodyweight_kg === 0) return 0
  return Math.round((normalized_power / bodyweight_kg) * VO2MAX_COEFFICIENT)
}

/**
 * Categoriza VO2Max
 */
export function categorizeVO2Max(vo2max: number): 'elite' | 'excellent' | 'good' | 'average' | 'below_average' {
  if (vo2max >= 60) return 'elite'
  if (vo2max >= 50) return 'excellent'
  if (vo2max >= 40) return 'good'
  if (vo2max >= 30) return 'average'
  return 'below_average'
}

/**
 * Calcula scores de atributos desde PRISMA
 * PRISMA mide principalmente capacidad aeróbica
 * Usamos VO2Max para estimar otros atributos con ratios
 */
function calculateAttributeScoresFromPRISMA(
  vo2max: number,
  normalized_power: number,
  bodyweight_kg: number,
  intervals_completed: number
): AttributeScores {
  // Base score from VO2Max (0-100 scale)
  // Assuming ~50 ml/kg/min = score 100
  const vo2max_score = Math.min(100, (vo2max / 50) * 100)

  // FTP estimate (Watts) - typically ~75% of peak power in 5min efforts
  const estimated_ftp = Math.round(normalized_power * 0.75)
  const watts_per_kg = estimated_ftp / bodyweight_kg

  // Power relative to bodyweight (5-7 W/kg = excellent)
  const power_score = Math.min(100, (watts_per_kg / 6) * 100)

  // Anaerobic capacity estimated from ability to complete intervals
  const anaerobic_score = intervals_completed === 5 ? 80 : Math.max(50, intervals_completed * 16)

  // Estimate other attributes based on aerobic base
  return {
    aerobic_endurance: Math.round(vo2max_score * 0.95), // High correlation
    aerobic_power: Math.round(vo2max_score),
    anaerobic_capacity: Math.round(anaerobic_score),
    absolute_strength: Math.round((power_score * 0.8) + 20), // Inferred from power
    strength_endurance: Math.round(vo2max_score * 0.85),
    power: Math.round(power_score),
    gymnastics_capacity: Math.round(50 + Math.random() * 20), // Not measured by PRISMA
    mobility: Math.round(50 + Math.random() * 20), // Not measured by PRISMA
    mental_resilience: Math.round(vo2max_score * 0.7), // Correlation with endurance
    speed: Math.round((power_score * 0.9) + 10), // Related to power
  }
}

/**
 * Calcula score global (promedio de los 10 atributos)
 */
export function calculateOverallScore(scores: AttributeScores): number {
  const values = Object.values(scores)
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length)
}

/**
 * Compara scores y calcula progreso
 */
function calculateProgress(
  current: AttributeScores,
  previous?: AttributeScores,
  current_vo2max?: number,
  previous_vo2max?: number
): any {
  if (!previous) return undefined

  const current_overall = calculateOverallScore(current)
  const previous_overall = calculateOverallScore(previous)
  const overall_change_pct = Math.round((current_overall - previous_overall) / previous_overall * 100)

  const improved_attributes: string[] = []
  const declined_attributes: string[] = []

  Object.keys(current).forEach((key) => {
    const current_val = current[key as keyof AttributeScores]
    const previous_val = previous[key as keyof AttributeScores]
    const threshold = 5 // Consider significant if change > 5 points

    if (current_val > previous_val + threshold) {
      improved_attributes.push(key)
    } else if (current_val < previous_val - threshold) {
      declined_attributes.push(key)
    }
  })

  const vo2max_change = (current_vo2max && previous_vo2max) ? current_vo2max - previous_vo2max : 0

  return {
    overall_change_pct,
    improved_attributes,
    declined_attributes,
    vo2max_change,
  }
}

/**
 * Main: Assessment recommendation
 */
export function assessAthlete(input: AssessmentInput): AssessmentResult {
  const {
    athlete_id,
    date,
    bodyweight_kg,
    assessment_type,
    test_result,
    previous_scores_30d_ago,
    previous_scores_90d_ago,
    previous_vo2max_30d_ago,
    previous_vo2max_90d_ago,
  } = input

  let attribute_scores: AttributeScores
  let vo2max_estimate: number | undefined
  let confidence_pct = 85

  // Step 1: Process based on assessment type
  if (assessment_type === 'prisma_vo2max') {
    const prisma = test_result as PRISMATestResult

    // Validate test completion
    if (prisma.intervals_completed < 1) {
      confidence_pct = 30 // Incomplete test
    } else if (prisma.intervals_completed < 5) {
      confidence_pct = 65 // Incomplete
    } else {
      confidence_pct = 95 // Full test completed
    }

    // Calculate VO2Max
    vo2max_estimate = calculateVO2MaxFromPRISMA(prisma.normalized_power, bodyweight_kg)

    // Calculate attribute scores
    attribute_scores = calculateAttributeScoresFromPRISMA(
      vo2max_estimate,
      prisma.normalized_power,
      bodyweight_kg,
      prisma.intervals_completed
    )
  } else {
    // Placeholder for other assessment types
    attribute_scores = {
      aerobic_endurance: 50,
      aerobic_power: 50,
      anaerobic_capacity: 50,
      absolute_strength: 50,
      strength_endurance: 50,
      power: 50,
      gymnastics_capacity: 50,
      mobility: 50,
      mental_resilience: 50,
      speed: 50,
    }
    confidence_pct = 50
  }

  // Step 2: Clamp all scores to 0-100
  Object.keys(attribute_scores).forEach((key) => {
    const score = attribute_scores[key as keyof AttributeScores]
    attribute_scores[key as keyof AttributeScores] = Math.max(0, Math.min(100, score))
  })

  // Step 3: Calculate overall score
  const overall_score = calculateOverallScore(attribute_scores)

  // Step 4: Categorize VO2Max
  const vo2max_category = vo2max_estimate ? categorizeVO2Max(vo2max_estimate) : undefined

  // Step 5: Calculate progress
  const progress_vs_30d = previous_scores_30d_ago
    ? calculateProgress(attribute_scores, previous_scores_30d_ago, vo2max_estimate, previous_vo2max_30d_ago)
    : undefined

  const progress_vs_90d = previous_scores_90d_ago
    ? calculateProgress(attribute_scores, previous_scores_90d_ago, vo2max_estimate, previous_vo2max_90d_ago)
    : undefined

  // Step 6: Build radar chart data
  const radar_chart_data: RadarChartData = {
    'Aerobic Endurance': attribute_scores.aerobic_endurance,
    'Aerobic Power': attribute_scores.aerobic_power,
    'Anaerobic Capacity': attribute_scores.anaerobic_capacity,
    'Absolute Strength': attribute_scores.absolute_strength,
    'Strength Endurance': attribute_scores.strength_endurance,
    Power: attribute_scores.power,
    'Gymnastics': attribute_scores.gymnastics_capacity,
    Mobility: attribute_scores.mobility,
    'Mental Resilience': attribute_scores.mental_resilience,
    Speed: attribute_scores.speed,
  }

  // Step 7: Generate rationale
  let rationale = ''
  if (assessment_type === 'prisma_vo2max') {
    const prisma = test_result as PRISMATestResult
    const intervals_str = `${prisma.intervals_completed}/5 intervals`
    rationale = `PRISMA VO2Max (${intervals_str}): ${vo2max_estimate} ml/kg/min (${vo2max_category}). NP: ${prisma.normalized_power}W, FTP est: ${prisma.ftp_estimate}W.`

    if (previous_vo2max_30d_ago && vo2max_estimate) {
      const change = vo2max_estimate - previous_vo2max_30d_ago
      if (change > 2) {
        rationale += ` Improving (+${change} vs 30d).`
      } else if (change < -2) {
        rationale += ` Declining (${change} vs 30d).`
      }
    }
  }

  return {
    assessment_type,
    attribute_scores,
    overall_score,
    vo2max_estimate,
    vo2max_category,
    progress_vs_30d,
    progress_vs_90d,
    radar_chart_data,
    confidence_pct,
    rationale,
  }
}
