/**
 * Tests — Engine #03 Banister Model
 *
 * Valida funciones puras (sin DB):
 *   - updateBanisterState: actualización EWMA 4 curvas
 *   - decayBanisterState: decay en días de descanso
 *   - getColorState: mapeo score → color
 *   - getReadinessRecommendation: texto por color
 *   - Distribución de fatiga por workout_type
 */

import {
  updateBanisterState,
  decayBanisterState,
  getColorState,
  getReadinessRecommendation,
  type BanisterState,
  type ColorState,
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
    toBeCloseTo: (n: number, tolerance = 0.1) => { if (Math.abs(actual - n) > tolerance) throw new Error(`Expected ~${n}, got ${actual} (tolerance ${tolerance})`) },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`) },
    toContain: (s: string) => { if (typeof actual !== 'string' || !actual.includes(s)) throw new Error(`Expected to contain "${s}", got "${actual}"`) },
  }
}

const ZERO_STATE: BanisterState = { fitness: 0, fat_mec: 0, fat_snc: 0, fat_met: 0, fat_art: 0 }

// ─────────────────────────────────────────────
// SUITE 1 — Color State Mapping
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — Color State Mapping\n')

test('1.1: score 100 → green', () => {
  expect(getColorState(100)).toBe('green')
})

test('1.2: score 75 → green', () => {
  expect(getColorState(75)).toBe('green')
})

test('1.3: score 74 → blue', () => {
  expect(getColorState(74)).toBe('blue')
})

test('1.4: score 55 → blue', () => {
  expect(getColorState(55)).toBe('blue')
})

test('1.5: score 54 → yellow', () => {
  expect(getColorState(54)).toBe('yellow')
})

test('1.6: score 40 → yellow', () => {
  expect(getColorState(40)).toBe('yellow')
})

test('1.7: score 39 → orange', () => {
  expect(getColorState(39)).toBe('orange')
})

test('1.8: score 25 → orange', () => {
  expect(getColorState(25)).toBe('orange')
})

test('1.9: score 24 → red', () => {
  expect(getColorState(24)).toBe('red')
})

test('1.10: score 0 → red', () => {
  expect(getColorState(0)).toBe('red')
})

// ─────────────────────────────────────────────
// SUITE 2 — Readiness Recommendation
// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Readiness Recommendation\n')

test('2.1: green → PR text', () => {
  const msg = getReadinessRecommendation('green')
  expect(msg).toContain('máximo')
})

test('2.2: red → recovery text', () => {
  const msg = getReadinessRecommendation('red')
  expect(msg).toContain('recuperación')
})

test('2.3: yellow → scale text', () => {
  const msg = getReadinessRecommendation('yellow')
  expect(msg).toContain('cuidado')
})

test('2.4: with athlete name → includes prefix', () => {
  const msg = getReadinessRecommendation('green', 'Carlos')
  expect(msg).toContain('Carlos')
})

test('2.5: orange → reduce intensity text', () => {
  const msg = getReadinessRecommendation('orange')
  expect(msg).toContain('reduce')
})

// ─────────────────────────────────────────────
// SUITE 3 — updateBanisterState
// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — updateBanisterState\n')

test('3.1: Cold start → fitness and fatigue both increase', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 100,
    workout_type: 'STRENGTH',
  })
  expect(result.new_state.fitness).toBeGreaterThan(0)
  expect(result.new_state.fat_mec).toBeGreaterThan(0)
  expect(result.new_state.fat_snc).toBeGreaterThan(0)
})

test('3.2: Readiness score is 0-100', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 100,
    workout_type: 'STRENGTH',
  })
  expect(result.readiness_score).toBeGreaterThan(-1)
  expect(result.readiness_score).toBeLessThan(101)
})

test('3.3: STRENGTH → after 30 sessions, MEC+SNC > MET (steady state)', () => {
  // On cold start, different λ values distort per-component comparison.
  // After convergence, the weights dominate.
  let state = ZERO_STATE
  for (let d = 0; d < 30; d++) {
    const result = updateBanisterState({ prev_state: state, session_load: 100, workout_type: 'STRENGTH' })
    state = result.new_state
  }
  // STRENGTH weights: mec=0.40, snc=0.40, met=0.10
  expect(state.fat_mec).toBeGreaterThan(state.fat_met)
  expect(state.fat_snc).toBeGreaterThan(state.fat_met)
})

test('3.4: FOR_TIME loads MET more than SNC', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 100,
    workout_type: 'FOR_TIME',
  })
  // FOR_TIME weights: mec=0.25, snc=0.15, met=0.45
  expect(result.new_state.fat_met).toBeGreaterThan(result.new_state.fat_snc)
})

test('3.5: Higher load → lower readiness', () => {
  const light = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 30,
    workout_type: 'STRENGTH',
  })
  const heavy = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 200,
    workout_type: 'STRENGTH',
  })
  expect(heavy.readiness_score).toBeLessThan(light.readiness_score)
})

test('3.6: Color state matches readiness score', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 50,
    workout_type: 'AMRAP',
  })
  expect(result.color_state).toBe(getColorState(result.readiness_score))
})

test('3.7: V3 (Wingate) has highest SNC fatigue weight', () => {
  const v1 = updateBanisterState({ prev_state: ZERO_STATE, session_load: 100, workout_type: 'V1' })
  const v3 = updateBanisterState({ prev_state: ZERO_STATE, session_load: 100, workout_type: 'V3' })
  // V1: snc=0.05, V3: snc=0.30
  expect(v3.new_state.fat_snc).toBeGreaterThan(v1.new_state.fat_snc)
})

test('3.8: Unknown workout_type uses default weights', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 100,
    workout_type: 'UNKNOWN_TYPE',
  })
  expect(result.new_state.fitness).toBeGreaterThan(0)
  expect(result.readiness_score).toBeGreaterThan(-1)
})

test('3.9: raw_readiness = fitness_score - raw_fatigue', () => {
  const result = updateBanisterState({
    prev_state: ZERO_STATE,
    session_load: 80,
    workout_type: 'EMOM',
  })
  const diff = Math.abs(result.raw_readiness - (result.fitness_score - result.raw_fatigue))
  expect(diff).toBeLessThan(0.01)
})

// ─────────────────────────────────────────────
// SUITE 4 — decayBanisterState
// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — decayBanisterState\n')

test('4.1: Decay reduces all components', () => {
  const state: BanisterState = { fitness: 10, fat_mec: 5, fat_snc: 5, fat_met: 5, fat_art: 5 }
  const decayed = decayBanisterState(state)
  expect(decayed.fitness).toBeLessThan(state.fitness)
  expect(decayed.fat_mec).toBeLessThan(state.fat_mec)
  expect(decayed.fat_snc).toBeLessThan(state.fat_snc)
  expect(decayed.fat_met).toBeLessThan(state.fat_met)
  expect(decayed.fat_art).toBeLessThan(state.fat_art)
})

test('4.2: Zero state stays zero', () => {
  const decayed = decayBanisterState(ZERO_STATE)
  expect(decayed.fitness).toBe(0)
  expect(decayed.fat_mec).toBe(0)
})

test('4.3: Fatigue decays faster than fitness (shorter τ)', () => {
  const state: BanisterState = { fitness: 10, fat_mec: 10, fat_snc: 10, fat_met: 10, fat_art: 10 }
  const decayed = decayBanisterState(state)
  // fitness τ=45 (slow decay), fat_met τ=4 (fast decay)
  // After 1 day: fitness retains more than fat_met
  expect(decayed.fitness).toBeGreaterThan(decayed.fat_met)
})

test('4.4: fat_met decays fastest (τ=4)', () => {
  const state: BanisterState = { fitness: 10, fat_mec: 10, fat_snc: 10, fat_met: 10, fat_art: 10 }
  const decayed = decayBanisterState(state)
  // τ=4 → λ≈0.22, retention ≈ 0.78 → lowest retention
  expect(decayed.fat_met).toBeLessThan(decayed.fat_mec)
  expect(decayed.fat_met).toBeLessThan(decayed.fat_art)
})

test('4.5: Multiple rest days → fatigue approaches zero', () => {
  let state: BanisterState = { fitness: 10, fat_mec: 10, fat_snc: 10, fat_met: 10, fat_art: 10 }
  for (let d = 0; d < 60; d++) {
    state = decayBanisterState(state)
  }
  expect(state.fat_met).toBeLessThan(0.01) // τ=4, should be near zero after 60 days
  expect(state.fat_snc).toBeLessThan(0.01) // τ=8
  expect(state.fitness).toBeGreaterThan(0.01) // τ=45, still has some
})

// ─────────────────────────────────────────────
// SUITE 5 — Multi-day Simulation
// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Multi-day Simulation\n')

test('5.1: 5 days training → raw_readiness decreases (fatigue accumulates)', () => {
  let state = ZERO_STATE
  let raw_values: number[] = []
  for (let d = 0; d < 5; d++) {
    const result = updateBanisterState({ prev_state: state, session_load: 50, workout_type: 'AMRAP' })
    state = result.new_state
    raw_values.push(result.raw_readiness)
  }
  // raw_readiness should get more negative as fatigue accumulates faster than fitness
  expect(raw_values[4]).toBeLessThan(raw_values[0])
})

test('5.2: Train then rest → raw_readiness recovers (fatigue decays faster)', () => {
  let state = ZERO_STATE
  // 5 days training
  for (let d = 0; d < 5; d++) {
    const result = updateBanisterState({ prev_state: state, session_load: 50, workout_type: 'AMRAP' })
    state = result.new_state
  }
  const K1 = 1.0, K2 = 1.8
  const raw_after_train = K1 * state.fitness - K2 * (state.fat_mec + state.fat_snc + state.fat_met + state.fat_art)

  // 5 days rest — fatigue decays faster than fitness
  for (let d = 0; d < 5; d++) {
    state = decayBanisterState(state)
  }
  const raw_after_rest = K1 * state.fitness - K2 * (state.fat_mec + state.fat_snc + state.fat_met + state.fat_art)

  expect(raw_after_rest).toBeGreaterThan(raw_after_train)
})

test('5.3: Taper effect — fitness decays slower than fatigue', () => {
  let state = ZERO_STATE
  // 21 days solid training
  for (let d = 0; d < 21; d++) {
    const result = updateBanisterState({ prev_state: state, session_load: 80, workout_type: 'FOR_TIME' })
    state = result.new_state
  }
  const fitness_before = state.fitness
  const fatigue_before = state.fat_mec + state.fat_snc + state.fat_met + state.fat_art

  // 7 day taper (complete rest)
  for (let d = 0; d < 7; d++) {
    state = decayBanisterState(state)
  }
  const fitness_after = state.fitness
  const fatigue_after = state.fat_mec + state.fat_snc + state.fat_met + state.fat_art

  // Fitness retains more % than fatigue (taper effect)
  const fitness_retention = fitness_after / fitness_before
  const fatigue_retention = fatigue_after / fatigue_before
  expect(fitness_retention).toBeGreaterThan(fatigue_retention)
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #03 — Banister Model: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}
console.log('═'.repeat(50) + '\n')
if (failed > 0) process.exit(1)
