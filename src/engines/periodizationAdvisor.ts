/**
 * ENGINE #13 — Periodization Advisor
 *
 * Planificación de bloques de entrenamiento con:
 *   - Macrociclos (4-12 semanas)
 *   - Mesociclos (2-4 semanas)
 *   - Microciclos (1 semana)
 *   - Progresión lineal y ondulante
 *
 * Propósito: Planificar periodización optimizada para objetivos del atleta
 * Output: Bloque recomendado + intensidad/volumen por semana + deload schedule
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type TrainingPhase = 'general_prep' | 'specific_prep' | 'competition' | 'transition'
export type PeriodizationModel = 'linear' | 'undulating' | 'block' | 'conjugate'
export type MuscleGroup = 'upper_body' | 'lower_body' | 'full_body' | 'metabolic'

const TRAINING_PHASES = {
  general_prep: {
    duration_weeks: 6,
    intensity_range: { min: 60, max: 80 },
    volume_range: { min: 12, max: 18 },
    rep_range: '8-12 reps',
    focus: 'Hypertrophy, base building',
  },
  specific_prep: {
    duration_weeks: 4,
    intensity_range: { min: 75, max: 90 },
    volume_range: { min: 9, max: 15 },
    rep_range: '3-6 reps',
    focus: 'Strength, power development',
  },
  competition: {
    duration_weeks: 3,
    intensity_range: { min: 85, max: 100 },
    volume_range: { min: 6, max: 10 },
    rep_range: '1-3 reps / dynamic effort',
    focus: 'Peak performance',
  },
  transition: {
    duration_weeks: 2,
    intensity_range: { min: 40, max: 60 },
    volume_range: { min: 8, max: 12 },
    rep_range: 'Skill, active recovery',
    focus: 'Deload, variety, mobility',
  },
}

const DELOAD_SCHEDULE = {
  frequency_weeks: 4, // Every 4th week
  intensity_reduction: 0.4, // 40% reduction
  volume_reduction: 0.5, // 50% reduction
  duration_days: 5,
}

const PROGRESSION_PATTERNS = {
  linear: { week_over_week_increase: 0.05, rpe_progression: 'gradual' }, // 5% increase/week
  undulating: { weekly_variation: true, avg_progression: 0.03 }, // Daily/weekly variation
  block: { phase_based_progression: true, phases: 3 },
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AthleteProfile {
  athlete_id: string
  training_age_years: number
  primary_goal: string // 'strength' | 'power' | 'endurance' | 'hypertrophy'
  recent_max_lifts: Record<string, number>
  injury_history: string[]
  available_training_days: number // days/week
}

export interface MacrocycleTemplate {
  phase: TrainingPhase
  duration_weeks: number
  intensity_zones: { min: number; max: number }
  volume_range: { min: number; max: number }
}

export interface WeeklyPlan {
  week: number
  phase: TrainingPhase
  intensity_target: number // % of 1RM
  volume_target: number // sets per session
  weekly_schedule: {
    day: number
    session_focus: string
    intensity_pct: number
    volume_sets: number
  }[]
  deload_week: boolean
}

export interface PeriodizationAdvisorInput {
  athlete: AthleteProfile
  periodization_model: PeriodizationModel
  macrocycle_duration_weeks: number // 8, 12, 16
  primary_goals: string[]
  current_phase?: TrainingPhase
  previous_block_performance?: { phase: string; pr_count: number; injury_events: number }
}

export interface PeriodizationAdvisorResult {
  recommended_model: PeriodizationModel
  macrocycle_blocks: MacrocycleTemplate[]
  weekly_plans: WeeklyPlan[]

  intensity_progression: number[] // % per week
  volume_progression: number[] // sets per week
  deload_weeks: number[]

  key_focal_points: string[]
  adaptation_recommendations: string[]

  estimated_pr_potential: number // % chance of achieving new PR
  injury_risk_mitigation: string[]

  confidence_pct: number
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Builds macrocycle based on goals and duration
 */
export function buildMacrocycle(
  periodization_model: PeriodizationModel,
  duration_weeks: number,
  primary_goals: string[]
): MacrocycleTemplate[] {
  const blocks: MacrocycleTemplate[] = []

  if (periodization_model === 'linear') {
    // Linear: General → Specific → Competition
    blocks.push({
      phase: 'general_prep',
      duration_weeks: Math.ceil(duration_weeks * 0.4),
      intensity_zones: { min: 60, max: 75 },
      volume_range: { min: 12, max: 18 },
    })
    blocks.push({
      phase: 'specific_prep',
      duration_weeks: Math.ceil(duration_weeks * 0.35),
      intensity_zones: { min: 75, max: 90 },
      volume_range: { min: 9, max: 15 },
    })
    blocks.push({
      phase: 'competition',
      duration_weeks: Math.ceil(duration_weeks * 0.25),
      intensity_zones: { min: 85, max: 100 },
      volume_range: { min: 6, max: 10 },
    })
  } else if (periodization_model === 'undulating') {
    // Undulating: Mix intensity throughout
    blocks.push({
      phase: 'general_prep',
      duration_weeks: Math.ceil(duration_weeks * 0.5),
      intensity_zones: { min: 60, max: 85 },
      volume_range: { min: 10, max: 18 },
    })
    blocks.push({
      phase: 'specific_prep',
      duration_weeks: Math.ceil(duration_weeks * 0.5),
      intensity_zones: { min: 70, max: 95 },
      volume_range: { min: 8, max: 15 },
    })
  } else if (periodization_model === 'block') {
    // Block: Accumulation → Intensification → Realization
    blocks.push({
      phase: 'general_prep',
      duration_weeks: Math.ceil(duration_weeks * 0.35),
      intensity_zones: { min: 65, max: 80 },
      volume_range: { min: 14, max: 20 },
    })
    blocks.push({
      phase: 'specific_prep',
      duration_weeks: Math.ceil(duration_weeks * 0.35),
      intensity_zones: { min: 80, max: 92 },
      volume_range: { min: 8, max: 12 },
    })
    blocks.push({
      phase: 'competition',
      duration_weeks: Math.ceil(duration_weeks * 0.3),
      intensity_zones: { min: 90, max: 100 },
      volume_range: { min: 5, max: 9 },
    })
  }

  return blocks
}

/**
 * Calcula progresión de intensidad por semana
 */
export function calculateIntensityProgression(
  model: PeriodizationModel,
  duration_weeks: number,
  start_intensity: number,
  end_intensity: number
): number[] {
  const progression: number[] = []

  if (model === 'linear') {
    // Linear increase
    const step = (end_intensity - start_intensity) / duration_weeks
    for (let i = 0; i < duration_weeks; i++) {
      progression.push(Math.round(start_intensity + step * i))
    }
  } else if (model === 'undulating') {
    // Wave loading
    for (let i = 0; i < duration_weeks; i++) {
      const wave = (i % 3) + 1 // 1, 2, 3 week cycle
      const intensity = start_intensity + (end_intensity - start_intensity) * (wave / 3) * 0.7
      progression.push(Math.round(intensity))
    }
  } else if (model === 'block') {
    // Jump in blocks
    const blockSize = Math.ceil(duration_weeks / 3)
    for (let i = 0; i < duration_weeks; i++) {
      const blockNum = Math.floor(i / blockSize)
      const blockIntensity = start_intensity + (end_intensity - start_intensity) * (blockNum / 2)
      progression.push(Math.round(blockIntensity))
    }
  }

  return progression.slice(0, duration_weeks)
}

/**
 * Determina semanas de deload
 */
export function calculateDeloadWeeks(duration_weeks: number): number[] {
  const deload_weeks: number[] = []
  for (let week = DELOAD_SCHEDULE.frequency_weeks; week <= duration_weeks; week += DELOAD_SCHEDULE.frequency_weeks) {
    deload_weeks.push(week)
  }
  return deload_weeks
}

/**
 * Calcula potencial de PR
 */
export function estimatePRPotential(
  periodization_model: PeriodizationModel,
  training_age_years: number,
  previous_block_performance?: { phase: string; pr_count: number; injury_events: number }
): number {
  let potential = 50

  // Model suitability
  if (periodization_model === 'linear' || periodization_model === 'block') {
    potential += 15
  }

  // Training age
  if (training_age_years >= 5) {
    potential += 5
  } else if (training_age_years >= 3) {
    potential += 10
  } else {
    potential += 15 // Novices adapt faster
  }

  // Previous performance
  if (previous_block_performance) {
    if (previous_block_performance.pr_count >= 3) {
      potential += 20
    }
    if (previous_block_performance.injury_events === 0) {
      potential += 10
    }
  }

  return Math.min(potential, 95)
}

/**
 * Main: Periodization planning
 */
export function advisePeriodization(input: PeriodizationAdvisorInput): PeriodizationAdvisorResult {
  const { athlete, periodization_model, macrocycle_duration_weeks, primary_goals, previous_block_performance } =
    input

  // Step 1: Build macrocycle blocks
  const macrocycle_blocks = buildMacrocycle(periodization_model, macrocycle_duration_weeks, primary_goals)

  // Step 2: Calculate intensity progression
  const intensity_progression = calculateIntensityProgression(periodization_model, macrocycle_duration_weeks, 65, 92)

  // Step 3: Calculate volume progression
  const volume_progression = Array.from({ length: macrocycle_duration_weeks }, (_, i) => {
    if (periodization_model === 'linear') {
      return Math.max(16 - Math.floor(i / 2), 6) // Decrease over time
    } else if (periodization_model === 'block') {
      return 18 - Math.floor((i / macrocycle_duration_weeks) * 10) // Heavy → light
    } else {
      return 12 + Math.sin((i / macrocycle_duration_weeks) * Math.PI) * 4 // Wave pattern
    }
  })

  // Step 4: Determine deload weeks
  const deload_weeks = calculateDeloadWeeks(macrocycle_duration_weeks)

  // Step 5: Generate weekly plans
  const weekly_plans: WeeklyPlan[] = []
  let current_phase_idx = 0

  for (let week = 1; week <= macrocycle_duration_weeks; week++) {
    const is_deload = deload_weeks.includes(week)
    const phase_idx = Math.floor((week / macrocycle_duration_weeks) * macrocycle_blocks.length)
    const phase = macrocycle_blocks[Math.min(phase_idx, macrocycle_blocks.length - 1)].phase

    const weekly_plan: WeeklyPlan = {
      week,
      phase,
      intensity_target: is_deload ? intensity_progression[week - 1] * 0.6 : intensity_progression[week - 1],
      volume_target: is_deload ? volume_progression[week - 1] * 0.5 : volume_progression[week - 1],
      weekly_schedule: [],
      deload_week: is_deload,
    }

    // Generate daily sessions
    for (let day = 1; day <= athlete.available_training_days; day++) {
      weekly_plan.weekly_schedule.push({
        day,
        session_focus: getSessionFocus(phase, day, athlete.available_training_days),
        intensity_pct: is_deload ? 50 : 70 + (day % 3) * 10,
        volume_sets: is_deload
          ? Math.floor(weekly_plan.volume_target / 2)
          : Math.floor(weekly_plan.volume_target / athlete.available_training_days),
      })
    }

    weekly_plans.push(weekly_plan)
  }

  // Step 6: Key focal points
  const key_focal_points: string[] = []
  if (primary_goals.includes('strength')) {
    key_focal_points.push('Heavy compound movements (3-5 reps)')
  }
  if (primary_goals.includes('hypertrophy')) {
    key_focal_points.push('Moderate loads (6-10 reps) with higher volume')
  }
  if (primary_goals.includes('power')) {
    key_focal_points.push('Explosive movements with full recovery between sets')
  }

  // Step 7: Adaptation recommendations
  const adaptation_recommendations: string[] = []
  if (macrocycle_duration_weeks < 8) {
    adaptation_recommendations.push('Short macrocycle — prioritize technical mastery over load increases')
  }
  if (athlete.training_age_years < 2) {
    adaptation_recommendations.push('Novice athlete — emphasize movement quality and consistency')
  }
  if (athlete.injury_history.length > 0) {
    adaptation_recommendations.push(`History of ${athlete.injury_history.join(', ')} — include prehab protocols`)
  }

  // Step 8: Injury risk mitigation
  const injury_risk_mitigation: string[] = [
    'Implement progressive overload (max 5% load increase/week)',
    'Include mobility work (15min) 3× per week',
    'Follow deload schedule (every 4th week)',
    'Monitor ACWR and readiness daily',
  ]

  // Step 9: PR potential
  const estimated_pr_potential = estimatePRPotential(periodization_model, athlete.training_age_years, previous_block_performance)

  // Step 10: Confidence
  let confidence_pct = 75
  if (macrocycle_duration_weeks >= 12) confidence_pct += 10
  if (athlete.training_age_years >= 3) confidence_pct += 5
  if (previous_block_performance && previous_block_performance.injury_events === 0) confidence_pct += 5
  confidence_pct = Math.min(confidence_pct, 95)

  return {
    recommended_model: periodization_model,
    macrocycle_blocks,
    weekly_plans,
    intensity_progression,
    volume_progression,
    deload_weeks,
    key_focal_points,
    adaptation_recommendations,
    estimated_pr_potential,
    injury_risk_mitigation,
    confidence_pct,
  }
}

/**
 * Helper: Determine session focus based on phase and day
 */
function getSessionFocus(phase: TrainingPhase, day: number, total_days: number): string {
  const day_pct = day / total_days

  if (phase === 'general_prep') {
    if (day_pct < 0.33) return 'Upper body hypertrophy'
    if (day_pct < 0.66) return 'Lower body hypertrophy'
    return 'Metabolic conditioning'
  } else if (phase === 'specific_prep') {
    if (day_pct < 0.5) return 'Strength focus (main lift)'
    return 'Accessory + technique work'
  } else if (phase === 'competition') {
    if (day_pct < 0.5) return 'Peak performance (comp lift)'
    return 'Skill maintenance + recovery'
  } else {
    return 'Active recovery + mobility'
  }
}
