/**
 * Tests — Engine #05 Nutrition Engine
 *
 * Valida funciones puras:
 *   - calculateNutritionRecommendation: proteína + calorías
 *   - scoreAdherence: comparación logged vs target
 *   - Menstrual adjustments
 *   - ACWR recovery adjustments
 */

import {
  calculateNutritionRecommendation,
  scoreAdherence,
  parseExternalNutritionData,
  type NutritionEngineInput,
} from '../../src/engines/nutritionEngine'

let passed = 0
let failed = 0
const failures: string[] = []

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e: any) {
    console.log(`  ❌ ${name}`)
    console.log(`     → ${e.message}`)
    failed++
    failures.push(`${name}: ${e.message}`)
  }
}

function expect(actual: any) {
  return {
    toBe: (expected: any) => { if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`) },
    toBeGreaterThan: (n: number) => { if (actual <= n) throw new Error(`Expected ${actual} > ${n}`) },
    toBeLessThan: (n: number) => { if (actual >= n) throw new Error(`Expected ${actual} < ${n}`) },
    toBeCloseTo: (n: number, tolerance = 1) => { if (Math.abs(actual - n) > tolerance) throw new Error(`Expected ~${n}, got ${actual}`) },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`) },
    toBeGreaterThanOrEqual: (n: number) => { if (actual < n) throw new Error(`Expected ${actual} >= ${n}`) },
    toBeLessThanOrEqual: (n: number) => { if (actual > n) throw new Error(`Expected ${actual} <= ${n}`) },
  }
}

const BASE_INPUT: NutritionEngineInput = {
  athlete_id: 'athlete-123',
  date: '2026-04-05',
  body_weight_kg: 70,
  training_intensity: 'moderate',
  goal: 'maintain',
}

// ─────────────────────────────────────────────
// SUITE 1 — Baseline Recommendations
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — Baseline Recommendations\n')

test('1.1: 70kg athlete, moderate intensity, maintain → calories > 0', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.daily_target.calories).toBeGreaterThan(0)
})

test('1.2: Protein > 0', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.daily_target.protein_g).toBeGreaterThan(0)
})

test('1.3: Carbs > 0', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.daily_target.carbs_g).toBeGreaterThan(0)
})

test('1.4: Fats > 0', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.daily_target.fats_g).toBeGreaterThan(0)
})

test('1.5: Hydration ≈ 35ml × 70kg = 2450ml', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.hydration_ml).toBeCloseTo(2450, 50)
})

// ─────────────────────────────────────────────
// SUITE 2 — Intensity Scaling
// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Intensity Scaling\n')

test('2.1: Elite > Intense > Moderate (protein)', () => {
  const light = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'light' })
  const moderate = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'moderate' })
  const intense = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'intense' })
  const elite = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'elite' })

  expect(light.daily_target.protein_g).toBeLessThan(moderate.daily_target.protein_g)
  expect(moderate.daily_target.protein_g).toBeLessThan(intense.daily_target.protein_g)
  expect(intense.daily_target.protein_g).toBeLessThan(elite.daily_target.protein_g)
})

test('2.2: Elite > Intense > Moderate (calories)', () => {
  const light = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'light' })
  const moderate = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'moderate' })
  const intense = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'intense' })
  const elite = calculateNutritionRecommendation({ ...BASE_INPUT, training_intensity: 'elite' })

  expect(light.daily_target.calories).toBeLessThan(moderate.daily_target.calories)
  expect(moderate.daily_target.calories).toBeLessThan(intense.daily_target.calories)
  expect(intense.daily_target.calories).toBeLessThan(elite.daily_target.calories)
})

// ─────────────────────────────────────────────
// SUITE 3 — Goal Adjustment
// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Goal Adjustment\n')

test('3.1: Build > Maintain (calories)', () => {
  const maintain = calculateNutritionRecommendation({ ...BASE_INPUT, goal: 'maintain' })
  const build = calculateNutritionRecommendation({ ...BASE_INPUT, goal: 'build' })
  expect(build.daily_target.calories).toBeGreaterThan(maintain.daily_target.calories)
})

test('3.2: Maintain > Fat loss (calories)', () => {
  const maintain = calculateNutritionRecommendation({ ...BASE_INPUT, goal: 'maintain' })
  const fat_loss = calculateNutritionRecommendation({ ...BASE_INPUT, goal: 'lose_fat' })
  expect(maintain.daily_target.calories).toBeGreaterThan(fat_loss.daily_target.calories)
})

test('3.3: Build = +500 kcal vs maintain', () => {
  const maintain = calculateNutritionRecommendation({ ...BASE_INPUT, goal: 'maintain' })
  const build = calculateNutritionRecommendation({ ...BASE_INPUT, goal: 'build' })
  const diff = build.daily_target.calories - maintain.daily_target.calories
  expect(diff).toBeCloseTo(500, 50)
})

// ─────────────────────────────────────────────
// SUITE 4 — Menstrual Adjustments
// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Menstrual Adjustments\n')

test('4.1: Phase 1 (Menstrual) → +5% protein', () => {
  const baseline = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: undefined })
  const phase1 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 1 })
  expect(phase1.daily_target.protein_g).toBeGreaterThan(baseline.daily_target.protein_g)
})

test('4.2: Phase 2 (Follicular) ≈ baseline protein', () => {
  const baseline = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: undefined })
  const phase2 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 2 })
  expect(phase2.daily_target.protein_g).toBeCloseTo(baseline.daily_target.protein_g, 2)
})

test('4.3: Phase 3 (Ovulation) → +8% protein', () => {
  const baseline = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: undefined })
  const phase3 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 3 })
  expect(phase3.daily_target.protein_g).toBeGreaterThan(baseline.daily_target.protein_g)
})

test('4.4: Phase 4 (Luteal) → +6% protein', () => {
  const baseline = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: undefined })
  const phase4 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 4 })
  expect(phase4.daily_target.protein_g).toBeGreaterThan(baseline.daily_target.protein_g)
})

test('4.5: Ovulation > Luteal > Menstrual (protein)', () => {
  const m1 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 1 }).daily_target.protein_g
  const m3 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 3 }).daily_target.protein_g
  const m4 = calculateNutritionRecommendation({ ...BASE_INPUT, menstrual_phase: 4 }).daily_target.protein_g
  expect(m3).toBeGreaterThan(m4)
  expect(m4).toBeGreaterThan(m1)
})

// ─────────────────────────────────────────────
// SUITE 5 — ACWR Recovery Adjustments
// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — ACWR Recovery Adjustments\n')

test('5.1: Danger zone → +15% protein (max recovery)', () => {
  const optimal = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'optimal' })
  const danger = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'danger' })
  expect(danger.daily_target.protein_g).toBeGreaterThan(optimal.daily_target.protein_g)
})

test('5.2: Caution zone → +10% protein', () => {
  const optimal = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'optimal' })
  const caution = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'caution' })
  expect(caution.daily_target.protein_g).toBeGreaterThan(optimal.daily_target.protein_g)
})

test('5.3: Underload → -5% protein (less recovery need)', () => {
  const optimal = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'optimal' })
  const underload = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'underload' })
  expect(underload.daily_target.protein_g).toBeLessThan(optimal.daily_target.protein_g)
})

test('5.4: Danger > Caution > Optimal > Underload (protein)', () => {
  const underload = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'underload' }).daily_target.protein_g
  const optimal = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'optimal' }).daily_target.protein_g
  const caution = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'caution' }).daily_target.protein_g
  const danger = calculateNutritionRecommendation({ ...BASE_INPUT, acwr_zone: 'danger' }).daily_target.protein_g

  expect(underload).toBeLessThan(optimal)
  expect(optimal).toBeLessThan(caution)
  expect(caution).toBeLessThan(danger)
})

// ─────────────────────────────────────────────
// SUITE 6 — Timing Distribution
// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Timing Distribution\n')

test('6.1: Pre-workout carbs + protein > 0', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.timing.pre_workout.carbs_g).toBeGreaterThan(0)
  expect(rec.timing.pre_workout.protein_g).toBeGreaterThan(0)
})

test('6.2: Post-workout protein > pre-workout protein', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.timing.post_workout.protein_g).toBeGreaterThan(rec.timing.pre_workout.protein_g)
})

test('6.3: Post-workout carbs > pre-workout carbs', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  expect(rec.timing.post_workout.carbs_g).toBeGreaterThan(rec.timing.pre_workout.carbs_g)
})

test('6.4: Pre + post ≤ daily total (carbs)', () => {
  const rec = calculateNutritionRecommendation(BASE_INPUT)
  const used = rec.timing.pre_workout.carbs_g + rec.timing.post_workout.carbs_g
  expect(used).toBeLessThanOrEqual(rec.daily_target.carbs_g)
})

// ─────────────────────────────────────────────
// SUITE 7 — Adherence Scoring
// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Adherence Scoring\n')

test('7.1: 100% logged = 100% adherence', () => {
  const score = scoreAdherence({
    athlete_id: 'athlete-1',
    date: '2026-04-05',
    protein_logged_g: 150,
    calories_logged: 2500,
    protein_target_g: 150,
    calories_target: 2500,
  })
  expect(score.protein_adherence_pct).toBe(100)
  expect(score.calories_adherence_pct).toBe(100)
})

test('7.2: 100% hit = score 3 (excellent)', () => {
  const score = scoreAdherence({
    athlete_id: 'athlete-1',
    date: '2026-04-05',
    protein_logged_g: 150,
    calories_logged: 2500,
    protein_target_g: 150,
    calories_target: 2500,
  })
  expect(score.overall_score).toBe(3)
})

test('7.3: 95% hit = score 3 (within tolerance)', () => {
  const score = scoreAdherence({
    athlete_id: 'athlete-1',
    date: '2026-04-05',
    protein_logged_g: 142,
    calories_logged: 2375,
    protein_target_g: 150,
    calories_target: 2500,
  })
  expect(score.overall_score).toBe(3)
})

test('7.4: 50% hit = score 0 (poor)', () => {
  const score = scoreAdherence({
    athlete_id: 'athlete-1',
    date: '2026-04-05',
    protein_logged_g: 75,
    calories_logged: 1250,
    protein_target_g: 150,
    calories_target: 2500,
  })
  expect(score.overall_score).toBe(0)
})

test('7.5: One macro hit, one miss = score 2', () => {
  const score = scoreAdherence({
    athlete_id: 'athlete-1',
    date: '2026-04-05',
    protein_logged_g: 150,
    calories_logged: 1800,
    protein_target_g: 150,
    calories_target: 2500,
  })
  expect(score.overall_score).toBe(2)
})

// ─────────────────────────────────────────────
// SUITE 8 — External Integration
// ─────────────────────────────────────────────

console.log('\n📋 Suite 8 — External App Integration\n')

test('8.1: Parse MyFitnessPal webhook', () => {
  const payload = {
    protein_g: 145,
    calories: 2480,
    date: '2026-04-05',
    source: 'myfitnesspal',
  }
  const parsed = parseExternalNutritionData(payload)
  expect(parsed.protein_g).toBe(145)
  expect(parsed.calories).toBe(2480)
})

test('8.2: Parse Cronometer (energy_kcal alias)', () => {
  const payload = {
    protein_g: 140,
    energy_kcal: 2450,
    date: '2026-04-05',
  }
  const parsed = parseExternalNutritionData(payload)
  expect(parsed.protein_g).toBe(140)
  expect(parsed.calories).toBe(2450)
})

// ─────────────────────────────────────────────
// SUITE 9 — Body Weight Scaling
// ─────────────────────────────────────────────

console.log('\n📋 Suite 9 — Body Weight Scaling\n')

test('9.1: Heavier athlete → more calories', () => {
  const light = calculateNutritionRecommendation({ ...BASE_INPUT, body_weight_kg: 60 })
  const heavy = calculateNutritionRecommendation({ ...BASE_INPUT, body_weight_kg: 90 })
  expect(heavy.daily_target.calories).toBeGreaterThan(light.daily_target.calories)
})

test('9.2: Heavier athlete → more protein', () => {
  const light = calculateNutritionRecommendation({ ...BASE_INPUT, body_weight_kg: 60 })
  const heavy = calculateNutritionRecommendation({ ...BASE_INPUT, body_weight_kg: 90 })
  expect(heavy.daily_target.protein_g).toBeGreaterThan(light.daily_target.protein_g)
})

test('9.3: Hydration scales with weight (35ml/kg)', () => {
  const light = calculateNutritionRecommendation({ ...BASE_INPUT, body_weight_kg: 60 })
  const heavy = calculateNutritionRecommendation({ ...BASE_INPUT, body_weight_kg: 90 })
  expect(light.hydration_ml).toBeCloseTo(60 * 35, 50)
  expect(heavy.hydration_ml).toBeCloseTo(90 * 35, 50)
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #05 — Nutrition: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}
console.log('═'.repeat(50) + '\n')
if (failed > 0) process.exit(1)
