/**
 * ENGINE #01 — StressEngine
 *
 * Calculates the IMR (Intensity Magnitude Rating) for a training session.
 * IMR is the raw quantification of workout stress — the foundation for ACWR and Banister.
 *
 * Formula (barbell/gymnastic movements):
 *   IMR = Σ(stress_coeff × weight_kg × reps × sets) × wod_type_multiplier
 *
 * Formula (Airbike / cardio with energy_vector):
 *   IMR = wod_template.estimated_imr (pre-calibrated per protocol)
 *
 * Session Load (fed to ACWR):
 *   session_load = IMR × (sRPE / 10.0)
 */

// ─────────────────────────────────────────────
// Movement catalog coefficients (static JSON)
// stress_coeff represents metabolic + mechanical cost per unit
// ─────────────────────────────────────────────

export const MOVEMENT_CATALOG: Record<string, {
  name: string
  category: 'Barbell' | 'Gymnastics' | 'Metabolic' | 'Dumbbell' | 'Kettlebell' | 'Bodyweight' | 'Rowing' | 'Airbike'
  stress_coeff: number
  cooldown_zone: 'A' | 'B' | 'C' // A=72h CNS, B=48h moderate, C=12h light
}> = {
  // ── BARBELL ──────────────────────────────
  clean_and_jerk:      { name: 'Clean & Jerk',      category: 'Barbell',     stress_coeff: 0.85, cooldown_zone: 'A' },
  snatch:              { name: 'Snatch',             category: 'Barbell',     stress_coeff: 0.90, cooldown_zone: 'A' },
  back_squat:          { name: 'Back Squat',         category: 'Barbell',     stress_coeff: 0.75, cooldown_zone: 'A' },
  front_squat:         { name: 'Front Squat',        category: 'Barbell',     stress_coeff: 0.78, cooldown_zone: 'A' },
  overhead_squat:      { name: 'Overhead Squat',     category: 'Barbell',     stress_coeff: 0.82, cooldown_zone: 'A' },
  deadlift:            { name: 'Deadlift',           category: 'Barbell',     stress_coeff: 0.80, cooldown_zone: 'A' },
  power_clean:         { name: 'Power Clean',        category: 'Barbell',     stress_coeff: 0.78, cooldown_zone: 'A' },
  power_snatch:        { name: 'Power Snatch',       category: 'Barbell',     stress_coeff: 0.82, cooldown_zone: 'A' },
  hang_power_clean:    { name: 'Hang Power Clean',   category: 'Barbell',     stress_coeff: 0.72, cooldown_zone: 'A' },
  hang_power_snatch:   { name: 'Hang Power Snatch',  category: 'Barbell',     stress_coeff: 0.76, cooldown_zone: 'A' },
  push_press:          { name: 'Push Press',         category: 'Barbell',     stress_coeff: 0.65, cooldown_zone: 'B' },
  push_jerk:           { name: 'Push Jerk',          category: 'Barbell',     stress_coeff: 0.70, cooldown_zone: 'B' },
  split_jerk:          { name: 'Split Jerk',         category: 'Barbell',     stress_coeff: 0.72, cooldown_zone: 'B' },
  strict_press:        { name: 'Strict Press',       category: 'Barbell',     stress_coeff: 0.60, cooldown_zone: 'B' },
  bench_press:         { name: 'Bench Press',        category: 'Barbell',     stress_coeff: 0.55, cooldown_zone: 'B' },
  romanian_deadlift:   { name: 'Romanian Deadlift',  category: 'Barbell',     stress_coeff: 0.62, cooldown_zone: 'B' },
  good_morning:        { name: 'Good Morning',       category: 'Barbell',     stress_coeff: 0.58, cooldown_zone: 'B' },
  barbell_row:         { name: 'Barbell Row',        category: 'Barbell',     stress_coeff: 0.55, cooldown_zone: 'B' },
  thruster:            { name: 'Thruster',           category: 'Barbell',     stress_coeff: 0.80, cooldown_zone: 'A' },
  wall_ball:           { name: 'Wall Ball',          category: 'Barbell',     stress_coeff: 0.42, cooldown_zone: 'C' },

  // ── GYMNASTICS ────────────────────────────
  muscle_up_bar:       { name: 'Bar Muscle Up',      category: 'Gymnastics',  stress_coeff: 0.95, cooldown_zone: 'A' },
  muscle_up_ring:      { name: 'Ring Muscle Up',     category: 'Gymnastics',  stress_coeff: 1.00, cooldown_zone: 'A' },
  handstand_pushup:    { name: 'Handstand Push Up',  category: 'Gymnastics',  stress_coeff: 0.85, cooldown_zone: 'A' },
  strict_handstand_pu: { name: 'Strict HSPU',        category: 'Gymnastics',  stress_coeff: 0.90, cooldown_zone: 'A' },
  chest_to_bar:        { name: 'Chest To Bar',       category: 'Gymnastics',  stress_coeff: 0.75, cooldown_zone: 'A' },
  pull_up:             { name: 'Pull Up',            category: 'Gymnastics',  stress_coeff: 0.65, cooldown_zone: 'B' },
  ring_dip:            { name: 'Ring Dip',           category: 'Gymnastics',  stress_coeff: 0.70, cooldown_zone: 'B' },
  bar_dip:             { name: 'Bar Dip',            category: 'Gymnastics',  stress_coeff: 0.60, cooldown_zone: 'B' },
  toes_to_bar:         { name: 'Toes To Bar',        category: 'Gymnastics',  stress_coeff: 0.55, cooldown_zone: 'B' },
  knees_to_elbow:      { name: 'Knees To Elbow',     category: 'Gymnastics',  stress_coeff: 0.42, cooldown_zone: 'C' },
  rope_climb:          { name: 'Rope Climb',         category: 'Gymnastics',  stress_coeff: 0.88, cooldown_zone: 'A' },
  legless_rope_climb:  { name: 'Legless Rope Climb', category: 'Gymnastics',  stress_coeff: 0.95, cooldown_zone: 'A' },
  pistol_squat:        { name: 'Pistol Squat',       category: 'Gymnastics',  stress_coeff: 0.52, cooldown_zone: 'B' },
  l_sit:               { name: 'L-Sit',              category: 'Gymnastics',  stress_coeff: 0.48, cooldown_zone: 'B' },
  ring_row:            { name: 'Ring Row',           category: 'Gymnastics',  stress_coeff: 0.40, cooldown_zone: 'C' },
  push_up:             { name: 'Push Up',            category: 'Gymnastics',  stress_coeff: 0.30, cooldown_zone: 'C' },
  air_squat:           { name: 'Air Squat',          category: 'Gymnastics',  stress_coeff: 0.25, cooldown_zone: 'C' },
  burpee:              { name: 'Burpee',             category: 'Gymnastics',  stress_coeff: 0.48, cooldown_zone: 'C' },
  box_jump:            { name: 'Box Jump',           category: 'Gymnastics',  stress_coeff: 0.50, cooldown_zone: 'B' },
  double_under:        { name: 'Double Under',       category: 'Gymnastics',  stress_coeff: 0.22, cooldown_zone: 'C' },

  // ── KETTLEBELL ────────────────────────────
  kb_swing:            { name: 'KB Swing',           category: 'Kettlebell',  stress_coeff: 0.45, cooldown_zone: 'B' },
  kb_turkish_getup:    { name: 'KB Turkish Get Up',  category: 'Kettlebell',  stress_coeff: 0.60, cooldown_zone: 'B' },
  kb_snatch:           { name: 'KB Snatch',          category: 'Kettlebell',  stress_coeff: 0.55, cooldown_zone: 'B' },
  kb_clean_press:      { name: 'KB Clean & Press',   category: 'Kettlebell',  stress_coeff: 0.52, cooldown_zone: 'B' },
  kb_goblet_squat:     { name: 'KB Goblet Squat',    category: 'Kettlebell',  stress_coeff: 0.38, cooldown_zone: 'C' },
  kb_deadlift:         { name: 'KB Deadlift',        category: 'Kettlebell',  stress_coeff: 0.42, cooldown_zone: 'C' },

  // ── METABOLIC ─────────────────────────────
  rowing_ergometer:    { name: 'Rowing',             category: 'Rowing',      stress_coeff: 0.38, cooldown_zone: 'C' },
  ski_erg:             { name: 'Ski Erg',            category: 'Metabolic',   stress_coeff: 0.40, cooldown_zone: 'C' },
  run:                 { name: 'Run',                category: 'Metabolic',   stress_coeff: 0.35, cooldown_zone: 'C' },
  assault_bike:        { name: 'Assault Bike',       category: 'Airbike',     stress_coeff: 0.00, cooldown_zone: 'C' }, // IMR via estimated_imr
  echo_bike:           { name: 'Echo Bike',          category: 'Airbike',     stress_coeff: 0.00, cooldown_zone: 'C' }, // IMR via estimated_imr
  sled_push:           { name: 'Sled Push',          category: 'Metabolic',   stress_coeff: 0.55, cooldown_zone: 'B' },
  sled_pull:           { name: 'Sled Pull',          category: 'Metabolic',   stress_coeff: 0.50, cooldown_zone: 'B' },
  farmers_carry:       { name: 'Farmer Carry',       category: 'Metabolic',   stress_coeff: 0.40, cooldown_zone: 'C' },
  sandbag_carry:       { name: 'Sandbag Carry',      category: 'Metabolic',   stress_coeff: 0.48, cooldown_zone: 'C' },
}

// WOD type multipliers — longer/higher-intensity formats multiply base IMR
export const WOD_TYPE_MULTIPLIERS: Record<string, number> = {
  FOR_TIME:  1.10,
  AMRAP:     1.05,
  EMOM:      0.95,
  STRENGTH:  0.90,
  INTERVAL:  1.00,
  LSD:       0.85,
  CHIPPER:   1.15,
  LADDER:    1.05,
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface MovementInput {
  movement_id: string
  sets: number
  reps: number
  weight_kg: number      // actual weight used (not RX — the weight the athlete used)
  duration_sec?: number  // for time-based movements (rowing, run)
}

export interface StressEngineInput {
  workout_type: string
  movements: MovementInput[]
  srpe: number        // 1–10, session RPE (reported by athlete post-WOD)
  // If energy_vector is set, skip movement formula and use estimated_imr directly
  energy_vector?: 'V1' | 'V2' | 'V3'
  estimated_imr?: number // from wod_templates.estimated_imr (Airbike sessions)
}

export interface MovementIMRResult {
  movement_id: string
  movement_name: string
  imr_contribution: number
}

export interface StressEngineResult {
  imr_score: number
  session_load: number  // = imr_score × (srpe / 10.0)
  movements_breakdown: MovementIMRResult[]
  calculation_method: 'formula' | 'estimated_imr'
}

// ─────────────────────────────────────────────
// Core function
// ─────────────────────────────────────────────

export function calculateIMR(input: StressEngineInput): StressEngineResult {
  const { workout_type, movements, srpe, energy_vector, estimated_imr } = input

  // ── Airbike / Cardio Protocol sessions ──────
  // If energy_vector is set, use pre-calibrated estimated_imr
  if (energy_vector && estimated_imr !== undefined) {
    const imr_score = estimated_imr
    const session_load = imr_score * (srpe / 10.0)

    return {
      imr_score,
      session_load,
      movements_breakdown: [],
      calculation_method: 'estimated_imr',
    }
  }

  // ── Standard WOD formula ─────────────────────
  const multiplier = WOD_TYPE_MULTIPLIERS[workout_type] ?? 1.0
  const movements_breakdown: MovementIMRResult[] = []
  let raw_imr = 0

  for (const movement of movements) {
    const catalog_entry = MOVEMENT_CATALOG[movement.movement_id]

    if (!catalog_entry) {
      // Unknown movement — skip with 0 contribution
      movements_breakdown.push({
        movement_id: movement.movement_id,
        movement_name: movement.movement_id,
        imr_contribution: 0,
      })
      continue
    }

    // Skip Airbike movements from formula (handled by estimated_imr branch above)
    if (catalog_entry.category === 'Airbike') {
      movements_breakdown.push({
        movement_id: movement.movement_id,
        movement_name: catalog_entry.name,
        imr_contribution: 0,
      })
      continue
    }

    // For time-based metabolic movements (rowing, run), use duration_sec as proxy for volume
    let volume: number
    if (catalog_entry.category === 'Metabolic' || catalog_entry.category === 'Rowing') {
      volume = (movement.duration_sec ?? 0) / 60 // convert to minutes
    } else {
      volume = movement.sets * movement.reps * movement.weight_kg
    }

    const contribution = catalog_entry.stress_coeff * volume
    raw_imr += contribution

    movements_breakdown.push({
      movement_id: movement.movement_id,
      movement_name: catalog_entry.name,
      imr_contribution: Math.round(contribution * 100) / 100,
    })
  }

  const imr_score = Math.round(raw_imr * multiplier * 100) / 100
  const session_load = Math.round(imr_score * (srpe / 10.0) * 100) / 100

  return {
    imr_score,
    session_load,
    movements_breakdown,
    calculation_method: 'formula',
  }
}

// ─────────────────────────────────────────────
// Warmup bonus
// Applied after IMR calculation: +5% session_load if warmup_done = true
// ─────────────────────────────────────────────

export function applyWarmupBonus(session_load: number, warmup_done: boolean): {
  final_load: number
  warmup_bonus: number
} {
  if (!warmup_done) {
    return { final_load: session_load, warmup_bonus: 0 }
  }
  const warmup_bonus = Math.round(session_load * 0.05 * 100) / 100
  return {
    final_load: Math.round((session_load + warmup_bonus) * 100) / 100,
    warmup_bonus,
  }
}

// ─────────────────────────────────────────────
// Cooldown zone helper — used by Movement Escalation Engine
// Returns the longest cooldown window required by any movement in the session
// ─────────────────────────────────────────────

export function getSessionCooldownZone(movement_ids: string[]): {
  zone: 'A' | 'B' | 'C'
  cooldown_hours: 72 | 48 | 12
  movements_in_zone_a: string[]
} {
  const zone_a_hours = 72
  const zone_b_hours = 48
  const zone_c_hours = 12

  const movements_in_zone_a: string[] = []
  let highest_zone: 'A' | 'B' | 'C' = 'C'

  for (const id of movement_ids) {
    const entry = MOVEMENT_CATALOG[id]
    if (!entry) continue

    if (entry.cooldown_zone === 'A') {
      highest_zone = 'A'
      movements_in_zone_a.push(id)
    } else if (entry.cooldown_zone === 'B' && highest_zone === 'C') {
      highest_zone = 'B'
    }
  }

  const cooldown_hours = highest_zone === 'A' ? zone_a_hours
    : highest_zone === 'B' ? zone_b_hours
    : zone_c_hours

  return { zone: highest_zone, cooldown_hours, movements_in_zone_a }
}
