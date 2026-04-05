/**
 * ENGINE #05 — Nutrition Engine
 *
 * Calcula recomendaciones MINIMALISTAS de nutrición basadas en:
 *   - Training load (StressEngine)
 *   - ACWR zone (riesgo de lesión → recovery nutrition)
 *   - Menstrual phase (femeninas)
 *   - Body weight
 *
 * Propósito: generar targets simples (calorías + proteína)
 * que el atleta logea en su app favorita (MyFitnessPal, Cronometer, etc.)
 * sin fricción. VOLTA no reemplaza apps de tracking — se acopla a ellas.
 *
 * Agnostic: no importa dónde logee el atleta. VOLTA solo proporciona targets.
 */

// ─────────────────────────────────────────────
// Constants & Baselines
// ─────────────────────────────────────────────

const BASELINE = {
  // Macros (g/kg) por actividad base
  SEDENTARY:     { protein: 0.8,  carbs: 3,   fats: 0.8 },
  LIGHT:         { protein: 1.2,  carbs: 4,   fats: 0.9 },
  MODERATE:      { protein: 1.6,  carbs: 5,   fats: 1.0 },
  INTENSE:       { protein: 2.0,  carbs: 6,   fats: 1.1 },
  ELITE:         { protein: 2.2,  carbs: 7,   fats: 1.2 },

  // Caloric multipliers (kcal/lb = 1 lb per day estimated change)
  CALORIC_SURPLUS_PHASE: 500,   // +500 kcal for growth
  CALORIC_DEFICIT_PHASE: -300,  // -300 kcal for fat loss
  MAINTENANCE: 0,               // neutral
}

// Menstrual phase adjustments (% multiplier on protein)
const MENSTRUAL_ADJUSTMENTS = {
  1: 1.05,   // Menstrual: +5% protein (iron-rich, recovery)
  2: 1.0,    // Follicular: baseline
  3: 1.08,   // Ovulation: +8% protein (peak performance)
  4: 1.06,   // Luteal: +6% protein (higher metabolic need)
}

// ACWR zone → recovery nutrition multiplier
const ACWR_NUTRITION_MULTIPLIERS: Record<string, number> = {
  underload:  0.95,   // -5% protein (detraining, less recovery need)
  optimal:    1.0,    // baseline
  caution:    1.1,    // +10% protein (overtraining, need recovery)
  danger:     1.15,   // +15% protein (high injury risk, max recovery)
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface NutritionEngineInput {
  athlete_id: string
  date: string

  body_weight_kg: number
  body_fat_pct?: number

  // Training context
  session_load?: number          // from StressEngine
  workout_type?: string          // STRENGTH, FOR_TIME, etc.
  training_intensity: 'light' | 'moderate' | 'intense' | 'elite'

  // Performance state
  acwr_zone?: 'underload' | 'optimal' | 'caution' | 'danger'
  menstrual_phase?: 1 | 2 | 3 | 4  // for females

  // Goal
  goal: 'build' | 'maintain' | 'lose_fat'
}

export interface NutritionTarget {
  calories: number
  protein_g: number
  carbs_g: number
  fats_g: number
}

export interface NutritionRecommendation {
  date: string
  athlete_id: string

  // Daily targets (agnostic to app)
  daily_target: NutritionTarget

  // Timing guidance (optional, for compliance)
  timing: {
    pre_workout: {
      carbs_g: number
      protein_g: number
    }
    post_workout: {
      protein_g: number
      carbs_g: number
    }
  }

  // Hydration (simple)
  hydration_ml: number

  // Recovery focus
  recovery_focus: string

  // For adherence tracking
  protein_target_g: number
  calories_target: number
}

export interface NutritionAdherence {
  date: string
  athlete_id: string

  protein_logged_g: number
  calories_logged: number

  protein_target_g: number
  calories_target: number

  protein_adherence_pct: number
  calories_adherence_pct: number

  overall_score: 0 | 1 | 2 | 3  // 0=poor, 1=ok, 2=good, 3=excellent
}

// ─────────────────────────────────────────────
// Core Calculation Functions
// ─────────────────────────────────────────────

/**
 * Calcula macros base según intensidad de entrenamiento
 */
function getBaselineMacros(intensity: string): { protein: number; carbs: number; fats: number } {
  const map: Record<string, { protein: number; carbs: number; fats: number }> = {
    light: BASELINE.LIGHT,
    moderate: BASELINE.MODERATE,
    intense: BASELINE.INTENSE,
    elite: BASELINE.ELITE,
  }
  return map[intensity] || BASELINE.MODERATE
}

/**
 * Ajusta proteína según menstrual phase
 */
function applyMenstrualAdjustment(protein_g: number, phase?: number): number {
  if (!phase || phase < 1 || phase > 4) return protein_g
  const multiplier = MENSTRUAL_ADJUSTMENTS[phase as keyof typeof MENSTRUAL_ADJUSTMENTS] || 1.0
  return Math.round(protein_g * multiplier)
}

/**
 * Ajusta proteína según ACWR zone (injury risk)
 */
function applyACWRAdjustment(protein_g: number, zone?: string): number {
  if (!zone) return protein_g
  const multiplier = ACWR_NUTRITION_MULTIPLIERS[zone] || 1.0
  return Math.round(protein_g * multiplier)
}

/**
 * Estima calorías basadas en peso + intensidad + goal
 *
 * Fórmula simple (Harris-Benedict adaptada):
 *   BMR ≈ 24 * weight_kg  (aproximación baja)
 *   TDEE = BMR * activity_multiplier
 *   Ajuste por goal: +500 (build), 0 (maintain), -300 (fat loss)
 */
function estimateCalories(
  weight_kg: number,
  intensity: string,
  goal: 'build' | 'maintain' | 'lose_fat'
): number {
  const activityMultipliers: Record<string, number> = {
    light: 1.4,
    moderate: 1.6,
    intense: 1.8,
    elite: 2.0,
  }

  const bmr = 24 * weight_kg  // simplified
  const tdee = bmr * (activityMultipliers[intensity] || 1.6)

  const adjustments: Record<string, number> = {
    build: BASELINE.CALORIC_SURPLUS_PHASE,
    maintain: BASELINE.MAINTENANCE,
    lose_fat: BASELINE.CALORIC_DEFICIT_PHASE,
  }

  return Math.round(tdee + adjustments[goal])
}

/**
 * Main: calcula recomendación nutricional
 */
export function calculateNutritionRecommendation(input: NutritionEngineInput): NutritionRecommendation {
  const { body_weight_kg, training_intensity, acwr_zone, menstrual_phase, goal, date, athlete_id, session_load } = input

  // Step 1: Baseline macros
  const baseline = getBaselineMacros(training_intensity)
  let protein_g = Math.round(baseline.protein * body_weight_kg)
  let carbs_g = Math.round(baseline.carbs * body_weight_kg)
  let fats_g = Math.round(baseline.fats * body_weight_kg)

  // Step 2: Apply menstrual adjustment
  protein_g = applyMenstrualAdjustment(protein_g, menstrual_phase)

  // Step 3: Apply ACWR adjustment (overtraining = more recovery)
  protein_g = applyACWRAdjustment(protein_g, acwr_zone)

  // Step 4: Estimate total calories
  const calories = estimateCalories(body_weight_kg, training_intensity, goal)

  // Step 5: Distribute remaining calories among macros
  const protein_kcal = protein_g * 4
  const remaining_kcal = calories - protein_kcal
  const fat_kcal = fats_g * 9
  const carbs_from_remaining = (remaining_kcal - fat_kcal) / 4
  carbs_g = Math.round(carbs_from_remaining)

  // Step 6: Hydration (simple: 35ml/kg)
  const hydration_ml = Math.round(35 * body_weight_kg)
  if (session_load && session_load > 50) {
    // High load day: add 500ml
    hydration_ml + 500
  }

  // Step 7: Recovery focus (human-readable)
  let recovery_focus = 'balanced'
  if (acwr_zone === 'danger' || acwr_zone === 'caution') {
    recovery_focus = 'prioritize protein for recovery'
  }
  if (menstrual_phase === 1) {
    recovery_focus = 'iron + protein for menstrual recovery'
  }

  // Step 8: Timing (naive split)
  const pre_workout_carbs = Math.round(carbs_g * 0.25)
  const pre_workout_protein = Math.round(protein_g * 0.15)
  const post_workout_protein = Math.round(protein_g * 0.35)
  const post_workout_carbs = Math.round(carbs_g * 0.30)

  return {
    date,
    athlete_id,
    daily_target: {
      calories,
      protein_g,
      carbs_g,
      fats_g,
    },
    timing: {
      pre_workout: { carbs_g: pre_workout_carbs, protein_g: pre_workout_protein },
      post_workout: { protein_g: post_workout_protein, carbs_g: post_workout_carbs },
    },
    hydration_ml,
    recovery_focus,
    protein_target_g: protein_g,
    calories_target: calories,
  }
}

// ─────────────────────────────────────────────
// Adherence Scoring (paired with external logging)
// ─────────────────────────────────────────────

/**
 * Score de adherencia: compara logged vs target
 * Asume que el atleta logea en MyFitnessPal/Cronometer
 * y sincroniza acá (webhook o manual)
 */
export function scoreAdherence(params: {
  protein_logged_g: number
  calories_logged: number
  protein_target_g: number
  calories_target: number
  date: string
  athlete_id: string
}): NutritionAdherence {
  const { protein_logged_g, calories_logged, protein_target_g, calories_target, date, athlete_id } = params

  // Tolerance: ±10% is "good"
  const protein_adherence_pct = Math.round((protein_logged_g / protein_target_g) * 100)
  const calories_adherence_pct = Math.round((calories_logged / calories_target) * 100)

  // Overall score (0-3)
  let overall_score: 0 | 1 | 2 | 3 = 0
  const protein_hit = protein_adherence_pct >= 90 && protein_adherence_pct <= 110
  const calories_hit = calories_adherence_pct >= 90 && calories_adherence_pct <= 110

  if (protein_hit && calories_hit) overall_score = 3
  else if (protein_hit || calories_hit) overall_score = 2
  else if (protein_adherence_pct >= 75 && calories_adherence_pct >= 75) overall_score = 1
  else overall_score = 0

  return {
    date,
    athlete_id,
    protein_logged_g,
    calories_logged,
    protein_target_g,
    calories_target,
    protein_adherence_pct,
    calories_adherence_pct,
    overall_score,
  }
}

// ─────────────────────────────────────────────
// Integration Helper (for external app webhooks)
// ─────────────────────────────────────────────

/**
 * Parse webhook desde MyFitnessPal/Cronometer
 * Estructura esperada: { protein_g, calories, date }
 */
export function parseExternalNutritionData(payload: any): {
  protein_g: number
  calories: number
  date: string
  source: string
} {
  return {
    protein_g: payload.protein_g || 0,
    calories: payload.calories || payload.energy_kcal || 0,
    date: payload.date || new Date().toISOString().split('T')[0],
    source: payload.source || 'manual',
  }
}
