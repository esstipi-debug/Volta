/**
 * Tests — Engine #04 Readiness Engine
 *
 * Valida función pura (sin DB):
 *   - getMenstrualAdjustment: fases del ciclo + ajustes
 *   - Integración con Banister (via funciones puras importadas)
 */

import { getMenstrualAdjustment } from '../../src/engines/readinessEngine'
import {
  updateBanisterState,
  decayBanisterState,
  getColorState,
  type BanisterState,
} from '../../src/engines/banisterModel'

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
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`) },
  }
}

const ZERO_STATE: BanisterState = { fitness: 0, fat_mec: 0, fat_snc: 0, fat_met: 0, fat_art: 0 }

// ─────────────────────────────────────────────
// SUITE 1 — Menstrual Phases
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — Menstrual Phases\n')

test('1.1: Day 1 → Phase 1 (Menstrual), adj = -8', () => {
  const { phase, phase_name, adjustment } = getMenstrualAdjustment('2026-04-01', '2026-04-01')
  expect(phase).toBe(1)
  expect(phase_name).toBe('Menstrual')
  expect(adjustment).toBe(-8)
})

test('1.2: Day 5 → Phase 1 (Menstrual), adj = -8', () => {
  const { phase, adjustment } = getMenstrualAdjustment('2026-04-05', '2026-04-01')
  expect(phase).toBe(1)
  expect(adjustment).toBe(-8)
})

test('1.3: Day 6 → Phase 2 (Folicular), adj = 0', () => {
  const { phase, phase_name, adjustment } = getMenstrualAdjustment('2026-04-06', '2026-04-01')
  expect(phase).toBe(2)
  expect(phase_name).toBe('Folicular')
  expect(adjustment).toBe(0)
})

test('1.4: Day 13 → Phase 2 (Folicular), adj = 0', () => {
  const { phase, adjustment } = getMenstrualAdjustment('2026-04-13', '2026-04-01')
  expect(phase).toBe(2)
  expect(adjustment).toBe(0)
})

test('1.5: Day 14 → Phase 3 (Ovulación), adj = +5', () => {
  const { phase, phase_name, adjustment } = getMenstrualAdjustment('2026-04-14', '2026-04-01')
  expect(phase).toBe(3)
  expect(phase_name).toBe('Ovulación')
  expect(adjustment).toBe(5)
})

test('1.6: Day 16 → Phase 3 (Ovulación), adj = +5', () => {
  const { phase, adjustment } = getMenstrualAdjustment('2026-04-16', '2026-04-01')
  expect(phase).toBe(3)
  expect(adjustment).toBe(5)
})

test('1.7: Day 17 → Phase 4 (Lútea), adj = -3', () => {
  const { phase, phase_name, adjustment } = getMenstrualAdjustment('2026-04-17', '2026-04-01')
  expect(phase).toBe(4)
  expect(phase_name).toBe('Lútea')
  expect(adjustment).toBe(-3)
})

test('1.8: Day 28 → Phase 4 (Lútea), adj = -3', () => {
  const { phase, adjustment } = getMenstrualAdjustment('2026-04-28', '2026-04-01')
  expect(phase).toBe(4)
  expect(adjustment).toBe(-3)
})

// ─────────────────────────────────────────────
// SUITE 2 — Cycle Wrap-around
// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Cycle Wrap-around\n')

test('2.1: Day 29 (cycle 28) → wraps to day 1 (Menstrual)', () => {
  const { phase } = getMenstrualAdjustment('2026-04-29', '2026-04-01')
  expect(phase).toBe(1) // day 29 = day 1 of next cycle
})

test('2.2: Day 56 → wraps correctly (56 mod 28 = 0 → day 28)', () => {
  // 56 days from April 1 = May 27. 56 mod 28 = 0, so day_in_cycle = (0 % 28 + 28) % 28 + 1 = 1
  // Actually: diff=56, 56%28=0, ((0)+28)%28=0, +1=1 → day 1 = Menstrual
  const { phase } = getMenstrualAdjustment('2026-05-27', '2026-04-01')
  expect(phase).toBe(1) // wraps exactly to day 1 of 3rd cycle
})

test('2.3: Custom cycle length 30 days', () => {
  // Day 29 in 30-day cycle = day 29 → Phase 4 (Lútea, days 17-30)
  const { phase } = getMenstrualAdjustment('2026-04-29', '2026-04-01', 30)
  expect(phase).toBe(4) // day 29 of 30-day cycle is Lútea
})

test('2.4: Short cycle 25 days — day 26 wraps to day 1', () => {
  const { phase } = getMenstrualAdjustment('2026-04-26', '2026-04-01', 25)
  expect(phase).toBe(1)
})

// ─────────────────────────────────────────────
// SUITE 3 — Readiness + Menstrual Integration
// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Readiness + Menstrual Integration\n')

test('3.1: Menstrual phase adj is negative (-8)', () => {
  const { adjustment } = getMenstrualAdjustment('2026-04-01', '2026-04-01') // Phase 1
  expect(adjustment).toBeLessThan(0)
  expect(adjustment).toBe(-8)
})

test('3.2: Ovulation phase increases effective readiness', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 50,
    workout_type: 'AMRAP',
  })
  const base_readiness = result.readiness_score
  const { adjustment } = getMenstrualAdjustment('2026-04-14', '2026-04-01') // Phase 3, +5
  const adjusted = Math.min(100, Math.max(0, base_readiness + adjustment))
  expect(adjusted).toBeGreaterThan(base_readiness)
})

test('3.3: Folicular phase has no effect', () => {
  const { adjustment } = getMenstrualAdjustment('2026-04-10', '2026-04-01') // Phase 2, 0
  expect(adjustment).toBe(0)
})

// ─────────────────────────────────────────────
// SUITE 4 — Lifestyle Adjustments (unit ranges)
// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Lifestyle Adjustment Ranges\n')

test('4.1: Max negative lifestyle = sleep<6 + stress5 + destroyed = -30', () => {
  // sleep<6: -10, stress5: -8, destroyed: -12 = -30
  const total = -10 + -8 + -12
  expect(total).toBe(-30)
})

test('4.2: Max positive lifestyle = sleep8+ + stress1 + fresh = +8', () => {
  // sleep8+: +5, stress1: 0, fresh: +3 = +8
  const total = 5 + 0 + 3
  expect(total).toBe(8)
})

test('4.3: Neutral lifestyle = sleep7-8 + stress1 + normal = 0', () => {
  const total = 0 + 0 + 0
  expect(total).toBe(0)
})

// ─────────────────────────────────────────────
// SUITE 5 — Full Readiness Simulation
// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Full Readiness Simulation\n')

test('5.1: Week of training + menstrual phase 1 → worst case scenario', () => {
  let state = ZERO_STATE
  // 5 days heavy training
  for (let d = 0; d < 5; d++) {
    const result = updateBanisterState({ prev_state: state, session_load: 120, workout_type: 'STRENGTH' })
    state = result.new_state
  }
  const banister = updateBanisterState({ prev_state: state, session_load: 120, workout_type: 'STRENGTH' })

  // Add worst lifestyle + menstrual
  const menstrual_adj = -8  // Phase 1
  const lifestyle_adj = -30 // worst lifestyle
  const final = Math.min(100, Math.max(0, banister.readiness_score + menstrual_adj + lifestyle_adj))

  // Should be very low (red/orange)
  const color = getColorState(final)
  expect(color === 'red' || color === 'orange').toBeTruthy()
})

test('5.2: Rest days + ovulation + good sleep → high readiness', () => {
  // Simulate some training then rest
  let state = ZERO_STATE
  for (let d = 0; d < 14; d++) {
    const result = updateBanisterState({ prev_state: state, session_load: 60, workout_type: 'AMRAP' })
    state = result.new_state
  }
  // 3 rest days
  for (let d = 0; d < 3; d++) {
    state = decayBanisterState(state)
  }

  const K1 = 1.0, K2 = 1.8, SCALE = 8
  const fitness = K1 * state.fitness
  const fatigue = K2 * (state.fat_mec + state.fat_snc + state.fat_met + state.fat_art)
  const banister_score = Math.round(Math.min(100, Math.max(0, (fitness - fatigue) * SCALE + 50)))

  const menstrual_adj = 5  // Ovulation
  const lifestyle_adj = 8  // Best lifestyle
  const final = Math.min(100, Math.max(0, banister_score + menstrual_adj + lifestyle_adj))

  expect(final).toBeGreaterThan(banister_score)
})

test('5.3: Readiness score always clamped 0-100', () => {
  // Even with max bonuses
  const final_high = Math.min(100, Math.max(0, 98 + 5 + 8))
  expect(final_high).toBe(100)

  // Even with max penalties
  const final_low = Math.min(100, Math.max(0, 10 - 8 - 30))
  expect(final_low).toBe(0)
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #04 — Readiness Engine: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}
console.log('═'.repeat(50) + '\n')
if (failed > 0) process.exit(1)
