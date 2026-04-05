/**
 * Tests — Engine #01 StressEngine
 *
 * Valida:
 *   - Cálculo IMR para movimientos barbell/gymnastics/metabolic
 *   - Caso Airbike (estimated_imr directo)
 *   - Session load = IMR × (sRPE / 10)
 *   - Warmup bonus (+5%)
 *   - Cooldown zones
 */

import {
  calculateIMR,
  applyWarmupBonus,
  getSessionCooldownZone,
  MOVEMENT_CATALOG,
  WOD_TYPE_MULTIPLIERS,
} from '../../src/engines/stressEngine'

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
    toBeCloseTo: (n: number, tolerance = 0.1) => { if (Math.abs(actual - n) > tolerance) throw new Error(`Expected ~${n}, got ${actual}`) },
    toHaveLength: (n: number) => { if (actual.length !== n) throw new Error(`Expected length ${n}, got ${actual.length}`) },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`) },
    toContain: (item: any) => { if (!actual.includes(item)) throw new Error(`Expected to contain "${item}"`) },
  }
}

// ─────────────────────────────────────────────
// SUITE 1 — IMR BARBELL
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — IMR Barbell\n')

test('1.1: Back Squat 5×5@100kg STRENGTH → IMR > 0', () => {
  const result = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg: 100 }],
    srpe: 7,
  })
  expect(result.imr_score).toBeGreaterThan(0)
  expect(result.calculation_method).toBe('formula')
})

test('1.2: IMR escala con peso — 100kg < 150kg', () => {
  const light = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg: 100 }],
    srpe: 7,
  })
  const heavy = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg: 150 }],
    srpe: 7,
  })
  expect(heavy.imr_score).toBeGreaterThan(light.imr_score)
})

test('1.3: IMR escala con volumen — 3×5 < 5×5', () => {
  const low = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'deadlift', sets: 3, reps: 5, weight_kg: 120 }],
    srpe: 7,
  })
  const high = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'deadlift', sets: 5, reps: 5, weight_kg: 120 }],
    srpe: 7,
  })
  expect(high.imr_score).toBeGreaterThan(low.imr_score)
})

test('1.4: Snatch tiene stress_coeff mayor que wall_ball', () => {
  const snatch_coeff = MOVEMENT_CATALOG['snatch'].stress_coeff
  const wall_ball_coeff = MOVEMENT_CATALOG['wall_ball'].stress_coeff
  expect(snatch_coeff).toBeGreaterThan(wall_ball_coeff)
})

test('1.5: Múltiples movimientos suman correctamente', () => {
  const result = calculateIMR({
    workout_type: 'FOR_TIME',
    movements: [
      { movement_id: 'thruster', sets: 3, reps: 10, weight_kg: 60 },
      { movement_id: 'pull_up', sets: 3, reps: 15, weight_kg: 80 },
    ],
    srpe: 8,
  })
  expect(result.movements_breakdown).toHaveLength(2)
  const sum = result.movements_breakdown.reduce((acc, m) => acc + m.imr_contribution, 0)
  expect(sum).toBeGreaterThan(0)
})

// ─────────────────────────────────────────────
// SUITE 2 — WOD TYPE MULTIPLIERS
// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Multiplicadores por tipo\n')

test('2.1: FOR_TIME multiplier = 1.10', () => {
  expect(WOD_TYPE_MULTIPLIERS['FOR_TIME']).toBe(1.10)
})

test('2.2: CHIPPER > EMOM (más demandante)', () => {
  const chipper = calculateIMR({
    workout_type: 'CHIPPER',
    movements: [{ movement_id: 'back_squat', sets: 1, reps: 50, weight_kg: 60 }],
    srpe: 8,
  })
  const emom = calculateIMR({
    workout_type: 'EMOM',
    movements: [{ movement_id: 'back_squat', sets: 1, reps: 50, weight_kg: 60 }],
    srpe: 8,
  })
  expect(chipper.imr_score).toBeGreaterThan(emom.imr_score)
})

test('2.3: STRENGTH multiplier = 0.90', () => {
  expect(WOD_TYPE_MULTIPLIERS['STRENGTH']).toBe(0.90)
})

// ─────────────────────────────────────────────
// SUITE 3 — SESSION LOAD
// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Session Load\n')

test('3.1: session_load = imr × (srpe / 10)', () => {
  const result = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg: 100 }],
    srpe: 10,
  })
  // Con sRPE 10 → session_load = imr × 1.0 = imr
  expect(result.session_load).toBeCloseTo(result.imr_score, 0.01)
})

test('3.2: sRPE 5 → session_load = imr × 0.5', () => {
  const result = calculateIMR({
    workout_type: 'STRENGTH',
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg: 100 }],
    srpe: 5,
  })
  const expected = result.imr_score * 0.5
  expect(result.session_load).toBeCloseTo(expected, 0.01)
})

test('3.3: sRPE 1 → session_load mínimo', () => {
  const result = calculateIMR({
    workout_type: 'AMRAP',
    movements: [{ movement_id: 'air_squat', sets: 5, reps: 50, weight_kg: 70 }],
    srpe: 1,
  })
  expect(result.session_load).toBeGreaterThan(0)
  expect(result.session_load).toBeLessThan(result.imr_score)
})

// ─────────────────────────────────────────────
// SUITE 4 — AIRBIKE / CARDIO
// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Airbike / Cardio Protocol\n')

test('4.1: energy_vector + estimated_imr → usa método estimated', () => {
  const result = calculateIMR({
    workout_type: 'INTERVAL',
    movements: [],
    srpe: 7,
    energy_vector: 'V1',
    estimated_imr: 35,
  })
  expect(result.imr_score).toBe(35)
  expect(result.calculation_method).toBe('estimated_imr')
})

test('4.2: V2 estimated_imr = 65 → session_load correcto', () => {
  const result = calculateIMR({
    workout_type: 'INTERVAL',
    movements: [],
    srpe: 8,
    energy_vector: 'V2',
    estimated_imr: 65,
  })
  expect(result.session_load).toBeCloseTo(65 * 0.8, 0.01)
})

test('4.3: V3 Wingate estimated_imr = 85', () => {
  const result = calculateIMR({
    workout_type: 'INTERVAL',
    movements: [],
    srpe: 9,
    energy_vector: 'V3',
    estimated_imr: 85,
  })
  expect(result.imr_score).toBe(85)
  expect(result.session_load).toBeCloseTo(85 * 0.9, 0.01)
})

test('4.4: Sin energy_vector → usa fórmula normal', () => {
  const result = calculateIMR({
    workout_type: 'AMRAP',
    movements: [{ movement_id: 'burpee', sets: 5, reps: 20, weight_kg: 80 }],
    srpe: 7,
  })
  expect(result.calculation_method).toBe('formula')
})

// ─────────────────────────────────────────────
// SUITE 5 — WARMUP BONUS
// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Warmup Bonus\n')

test('5.1: warmup_done=true → +5% session_load', () => {
  const { final_load, warmup_bonus } = applyWarmupBonus(100, true)
  expect(warmup_bonus).toBe(5)
  expect(final_load).toBe(105)
})

test('5.2: warmup_done=false → sin bonus', () => {
  const { final_load, warmup_bonus } = applyWarmupBonus(100, false)
  expect(warmup_bonus).toBe(0)
  expect(final_load).toBe(100)
})

test('5.3: Warmup bonus proporcional a session_load', () => {
  const { warmup_bonus } = applyWarmupBonus(200, true)
  expect(warmup_bonus).toBe(10) // 200 × 0.05
})

// ─────────────────────────────────────────────
// SUITE 6 — COOLDOWN ZONES
// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Cooldown Zones\n')

test('6.1: Snatch + Deadlift → Zone A (72h)', () => {
  const { zone, cooldown_hours } = getSessionCooldownZone(['snatch', 'deadlift'])
  expect(zone).toBe('A')
  expect(cooldown_hours).toBe(72)
})

test('6.2: Solo push_press + pull_up → Zone B (48h)', () => {
  const { zone, cooldown_hours } = getSessionCooldownZone(['push_press', 'pull_up'])
  expect(zone).toBe('B')
  expect(cooldown_hours).toBe(48)
})

test('6.3: Solo burpee + air_squat → Zone C (12h)', () => {
  const { zone, cooldown_hours } = getSessionCooldownZone(['burpee', 'air_squat', 'double_under'])
  expect(zone).toBe('C')
  expect(cooldown_hours).toBe(12)
})

test('6.4: Mezcla A + C → Zone A domina', () => {
  const { zone, movements_in_zone_a } = getSessionCooldownZone(['snatch', 'burpee', 'air_squat'])
  expect(zone).toBe('A')
  expect(movements_in_zone_a).toContain('snatch')
})

test('6.5: MOVEMENT_CATALOG tiene todas las zonas asignadas', () => {
  for (const [id, info] of Object.entries(MOVEMENT_CATALOG)) {
    if (!['A', 'B', 'C'].includes(info.cooldown_zone)) {
      throw new Error(`${id} tiene cooldown_zone inválido: ${info.cooldown_zone}`)
    }
  }
})

// ─────────────────────────────────────────────
// SUITE 7 — EDGE CASES
// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Edge cases\n')

test('7.1: Movimiento desconocido → imr_contribution = 0', () => {
  const result = calculateIMR({
    workout_type: 'AMRAP',
    movements: [{ movement_id: 'invented_movement', sets: 3, reps: 10, weight_kg: 50 }],
    srpe: 7,
  })
  expect(result.movements_breakdown[0].imr_contribution).toBe(0)
})

test('7.2: Sin movimientos → IMR = 0', () => {
  const result = calculateIMR({
    workout_type: 'AMRAP',
    movements: [],
    srpe: 7,
  })
  expect(result.imr_score).toBe(0)
  expect(result.session_load).toBe(0)
})

test('7.3: Rowing usa duration_sec como proxy', () => {
  const result = calculateIMR({
    workout_type: 'AMRAP',
    movements: [{ movement_id: 'rowing_ergometer', sets: 1, reps: 0, weight_kg: 0, duration_sec: 600 }],
    srpe: 7,
  })
  expect(result.imr_score).toBeGreaterThan(0)
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #01 — StressEngine: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}
console.log('═'.repeat(50) + '\n')
if (failed > 0) process.exit(1)
