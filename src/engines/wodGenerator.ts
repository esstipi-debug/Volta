/**
 * ENGINE #14 — WOD Generator
 *
 * Genera 5-6 entrenamientos por semana basado en:
 *   - Fase de entrenamiento actual
 *   - Nivel del atleta
 *   - Equipamiento disponible
 *   - Objetivos
 *
 * Propósito: Generar WODs personalizados y coherentes con periodización
 * Output: Programación semanal de 5-6 WODs con movimientos, intensidad, volumen
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type AthleteLevel = 'beginner' | 'intermediate' | 'advanced'
export type WorkoutType = 'strength' | 'skill' | 'metcon' | 'gymnastic' | 'endurance' | 'hybrid'
export type Equipment = 'barbell' | 'kettlebell' | 'dumbbell' | 'gymnastics' | 'cardio' | 'bodyweight'

const WORKOUT_DURATION_TARGETS = {
  strength: { min: 45, max: 60 }, // minutes
  skill: { min: 30, max: 45 },
  metcon: { min: 12, max: 20 },
  gymnastic: { min: 35, max: 50 },
  endurance: { min: 20, max: 45 },
  hybrid: { min: 50, max: 75 },
}

const MOVEMENT_LIBRARY: Record<string, { equipment: Equipment; category: string; difficulty: AthleteLevel }> = {
  // Barbell
  squat: { equipment: 'barbell', category: 'lower_body', difficulty: 'beginner' },
  deadlift: { equipment: 'barbell', category: 'lower_body', difficulty: 'intermediate' },
  snatch: { equipment: 'barbell', category: 'full_body', difficulty: 'advanced' },
  clean: { equipment: 'barbell', category: 'full_body', difficulty: 'intermediate' },
  press: { equipment: 'barbell', category: 'upper_body', difficulty: 'beginner' },
  bench_press: { equipment: 'barbell', category: 'upper_body', difficulty: 'beginner' },
  back_squat: { equipment: 'barbell', category: 'lower_body', difficulty: 'beginner' },

  // Kettlebell
  kettlebell_swing: { equipment: 'kettlebell', category: 'full_body', difficulty: 'beginner' },
  kettlebell_clean: { equipment: 'kettlebell', category: 'lower_body', difficulty: 'intermediate' },

  // Gymnastics
  pull_up: { equipment: 'gymnastics', category: 'upper_body', difficulty: 'beginner' },
  muscle_up: { equipment: 'gymnastics', category: 'upper_body', difficulty: 'advanced' },
  handstand_walk: { equipment: 'gymnastics', category: 'core', difficulty: 'advanced' },
  box_jump: { equipment: 'gymnastics', category: 'lower_body', difficulty: 'intermediate' },

  // Cardio
  running: { equipment: 'cardio', category: 'endurance', difficulty: 'beginner' },
  rowing: { equipment: 'cardio', category: 'endurance', difficulty: 'beginner' },
  assault_bike: { equipment: 'cardio', category: 'endurance', difficulty: 'beginner' },

  // Bodyweight
  push_up: { equipment: 'bodyweight', category: 'upper_body', difficulty: 'beginner' },
  air_squat: { equipment: 'bodyweight', category: 'lower_body', difficulty: 'beginner' },
  burpee: { equipment: 'bodyweight', category: 'full_body', difficulty: 'intermediate' },
  dip: { equipment: 'gymnastics', category: 'upper_body', difficulty: 'intermediate' },
}

const WORKOUT_TEMPLATES = {
  strength: {
    structure: 'Warmup → Main Lift (3-5 sets x 3-6 reps) → Accessory (3 sets x 8-10 reps)',
    rep_scheme: '3-6 reps',
    rest_between_sets: '2-3 min',
  },
  metcon: {
    structure: 'Warmup → AMRAP/EMOM/For Time (12-20 min)',
    rep_scheme: '8-15 reps per movement',
    rest_between_sets: '0-60 sec',
  },
  hybrid: {
    structure: 'Warmup → Strength (10-15 min) → Conditioning (10-15 min)',
    rep_scheme: 'Varied',
    rest_between_sets: '1-2 min',
  },
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface WODMovement {
  name: string
  reps: number | string // '10-15' or '3'
  weight?: number // lbs
  notes?: string
}

export interface WOD {
  day: number // 1-6
  date: string
  workout_type: WorkoutType
  focus: string
  intensity_level: number // % of 1RM
  volume_sets: number

  warmup: string
  main_work: WODMovement[]
  conditioning?: WODMovement[]
  finisher?: string
  cooldown: string

  duration_minutes: number
  difficulty_level: AthleteLevel
  equipment_needed: Equipment[]
  scaling_notes: string[]
}

export interface WeeklyWODPlan {
  week: number
  training_phase: string
  periodization_model: string
  wods: WOD[]
  weekly_focus: string
  total_volume_sets: number
  intensity_distribution: { strength: number; skill: number; metcon: number; endurance: number }
}

export interface WODGeneratorInput {
  week: number
  training_phase: string
  intensity_target: number // % of 1RM (65-95)
  volume_target: number // sets per session
  athlete_level: AthleteLevel
  available_equipment: Equipment[]
  primary_goals: string[]
  weekly_wods_count: number // 5 or 6
  previous_week_focus?: string // Avoid repeating
}

export interface WODGeneratorResult {
  weekly_plan: WeeklyWODPlan
  wods: WOD[]

  coherence_with_periodization: number // 0-100
  difficulty_progression: string[] // Observations per day
  equipment_utilization: Record<string, number> // % usage of each equipment

  coaching_notes: string[]
  scaling_recommendations: string[]

  confidence_pct: number
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Selecciona movimientos aptos para el atleta
 */
export function selectAvailableMovements(
  level: AthleteLevel,
  equipment: Equipment[],
  count: number = 6
): string[] {
  const available = Object.entries(MOVEMENT_LIBRARY)
    .filter(([_, meta]) => {
      const level_ok =
        meta.difficulty === level || (level === 'advanced' && meta.difficulty !== 'beginner') || (level === 'intermediate' && meta.difficulty !== 'advanced')
      const equipment_ok = equipment.includes(meta.equipment)
      return level_ok && equipment_ok
    })
    .map(([name]) => name)

  return available.slice(0, Math.min(count, available.length))
}

/**
 * Genera un WOD individual
 */
export function generateSingleWOD(
  day: number,
  date: string,
  workout_type: WorkoutType,
  intensity_target: number,
  volume_target: number,
  athlete_level: AthleteLevel,
  available_movements: string[]
): WOD {
  const selected_movements = available_movements.slice(0, Math.ceil(Math.random() * 3) + 2)

  const duration_range = WORKOUT_DURATION_TARGETS[workout_type]
  const duration = Math.floor(Math.random() * (duration_range.max - duration_range.min) + duration_range.min)

  const wod: WOD = {
    day,
    date,
    workout_type,
    focus: `${workout_type} focus`,
    intensity_level: intensity_target,
    volume_sets: volume_target,

    warmup: '5-10 min light cardio + dynamic mobility',
    main_work: selected_movements.slice(0, 2).map(move => ({
      name: move,
      reps: workout_type === 'strength' ? '5' : '10-15',
      weight: athlete_level === 'advanced' ? 85 : athlete_level === 'intermediate' ? 70 : 55,
    })),
    conditioning:
      workout_type === 'metcon' || workout_type === 'hybrid'
        ? selected_movements.slice(2).map(move => ({
            name: move,
            reps: '15-20',
          }))
        : undefined,
    finisher: 'Core work or stretching',
    cooldown: '5 min walking + stretching',

    duration_minutes: duration,
    difficulty_level: athlete_level,
    equipment_needed: selected_movements
      .map(m => MOVEMENT_LIBRARY[m]?.equipment)
      .filter((e): e is Equipment => Boolean(e)),
    scaling_notes: [
      athlete_level === 'beginner' ? 'Reduce weight by 20-30%' : 'Perform as written',
      'Can scale reps ±20% based on fitness level',
    ],
  }

  return wod
}

/**
 * Calcula distribución de tipos de workout
 */
export function calculateWorkoutDistribution(
  count: number,
  primary_goals: string[]
): Record<WorkoutType, number> {
  const distribution: Record<WorkoutType, number> = {
    strength: 0,
    skill: 0,
    metcon: 0,
    gymnastic: 0,
    endurance: 0,
    hybrid: 0,
  }

  if (primary_goals.includes('strength')) {
    distribution.strength = Math.ceil(count * 0.3)
  }
  if (primary_goals.includes('power')) {
    distribution.skill = Math.ceil(count * 0.2)
  }
  if (primary_goals.includes('conditioning')) {
    distribution.metcon = Math.ceil(count * 0.3)
  }

  // Fill remaining slots
  const used = Object.values(distribution).reduce((a, b) => a + b, 0)
  const remaining = count - used

  distribution.hybrid = remaining

  return distribution
}

/**
 * Main: Generate weekly WOD plan
 */
export function generateWODs(input: WODGeneratorInput): WODGeneratorResult {
  const {
    week,
    training_phase,
    intensity_target,
    volume_target,
    athlete_level,
    available_equipment,
    primary_goals,
    weekly_wods_count,
    previous_week_focus,
  } = input

  // Step 1: Select available movements
  const available_movements = selectAvailableMovements(athlete_level, available_equipment, 15)

  // Step 2: Calculate workout distribution
  const distribution = calculateWorkoutDistribution(weekly_wods_count, primary_goals)

  // Step 3: Generate WODs
  const wods: WOD[] = []
  let workout_idx = 0

  const workout_types: WorkoutType[] = []
  for (const [type, count] of Object.entries(distribution)) {
    for (let i = 0; i < count; i++) {
      workout_types.push(type as WorkoutType)
    }
  }

  // Shuffle workout types
  for (let i = workout_types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[workout_types[i], workout_types[j]] = [workout_types[j], workout_types[i]]
  }

  for (let day = 1; day <= weekly_wods_count; day++) {
    const date = new Date(2026, 3, 5 + day) // Start date
    const workout_type = workout_types[day - 1] || 'hybrid'

    const wod = generateSingleWOD(
      day,
      date.toISOString().split('T')[0],
      workout_type,
      intensity_target,
      volume_target,
      athlete_level,
      available_movements
    )
    wods.push(wod)
  }

  // Step 4: Calculate metrics
  const total_volume = wods.reduce((sum, w) => sum + w.volume_sets, 0)

  // Equipment utilization
  const equipment_count: Record<string, number> = {}
  wods.forEach(wod => {
    wod.equipment_needed.forEach(e => {
      equipment_count[e] = (equipment_count[e] || 0) + 1
    })
  })
  const equipment_utilization: Record<string, number> = {}
  Object.entries(equipment_count).forEach(([eq, count]) => {
    equipment_utilization[eq] = Math.round((count / wods.length) * 100)
  })

  // Step 5: Generate intensity distribution
  const intensity_distribution: Record<string, number> = { strength: 0, skill: 0, metcon: 0, endurance: 0 }
  wods.forEach(wod => {
    if (wod.workout_type === 'strength' || wod.workout_type === 'hybrid') {
      intensity_distribution.strength += 1
    }
    if (wod.workout_type === 'skill' || wod.workout_type === 'gymnastic') {
      intensity_distribution.skill += 1
    }
    if (wod.workout_type === 'metcon' || wod.workout_type === 'hybrid') {
      intensity_distribution.metcon += 1
    }
    if (wod.workout_type === 'endurance') {
      intensity_distribution.endurance += 1
    }
  })

  // Step 6: Coaching notes
  const coaching_notes: string[] = [
    `Week ${week} of ${training_phase}: ${weekly_wods_count} sessions planned`,
    `Intensity target: ${intensity_target}% of 1RM`,
    `Total volume: ${total_volume} sets`,
    `Primary focus: ${primary_goals.join(', ')}`,
  ]

  // Step 7: Scaling recommendations
  const scaling_recommendations: string[] = [
    athlete_level === 'beginner' ? 'Reduce weights by 20-30% and scale reps down by 30-50%' : undefined,
    athlete_level === 'intermediate' ? 'Scale reps ±20% based on fitness level, weights as written' : undefined,
    athlete_level === 'advanced' ? 'Perform as written, can add weight if feeling strong' : undefined,
    'If energy is low, reduce reps by 20% rather than skipping workout',
    'Listen to body and adjust if feeling overly fatigued',
  ].filter(Boolean) as string[]

  // Step 8: Coherence with periodization
  let coherence = 80
  if (distribution.strength > 0) coherence += 10
  if (distribution.metcon > 0) coherence += 5
  coherence = Math.min(coherence, 95)

  // Step 9: Confidence
  let confidence_pct = 80
  if (available_movements.length >= 10) confidence_pct += 10
  if (weekly_wods_count >= 5) confidence_pct += 5
  confidence_pct = Math.min(confidence_pct, 95)

  const weekly_plan: WeeklyWODPlan = {
    week,
    training_phase,
    periodization_model: 'linear',
    wods,
    weekly_focus: `${training_phase}: ${primary_goals.join(', ')}`,
    total_volume_sets: total_volume,
    intensity_distribution: {
      strength: intensity_distribution.strength,
      skill: intensity_distribution.skill,
      metcon: intensity_distribution.metcon,
      endurance: intensity_distribution.endurance,
    },
  }

  return {
    weekly_plan,
    wods,
    coherence_with_periodization: coherence,
    difficulty_progression: wods.map(w => `${w.workout_type}: ${w.difficulty_level}`),
    equipment_utilization,
    coaching_notes,
    scaling_recommendations,
    confidence_pct,
  }
}
