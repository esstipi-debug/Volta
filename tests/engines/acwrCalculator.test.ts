/**
 * Tests — Engine #02 ACWR Calculator
 *
 * Valida funciones puras (sin DB):
 *   - updateEWMA: cálculo EWMA correcto
 *   - classifyACWR: clasificación por zonas + injury_risk_pct
 *   - Constantes LAMBDA correctas
 */

import {
  updateEWMA,
  classifyACWR,
  LAMBDA_ACUTE,
  LAMBDA_CHRONIC,
  ACWR_ZONES,
} from '../../src/engines/acwrCalculator'

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
    toBeCloseTo: (n: number, tolerance = 0.001) => { if (Math.abs(actual - n) > tolerance) throw new Error(`Expected ~${n}, got ${actual}`) },
    toBeTruthy: () => { if (!actual) throw new Error(`Expected truthy, got ${actual}`) },
  }
}

// ─────────────────────────────────────────────
// SUITE 1 — EWMA Constants
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — EWMA Constants\n')

test('1.1: LAMBDA_ACUTE = 0.25', () => {
  expect(LAMBDA_ACUTE).toBe(0.25)
})

test('1.2: LAMBDA_CHRONIC = 0.069', () => {
  expect(LAMBDA_CHRONIC).toBe(0.069)
})

test('1.3: ACWR_ZONES definidos correctamente', () => {
  expect(ACWR_ZONES.UNDERLOAD.max).toBe(0.80)
  expect(ACWR_ZONES.OPTIMAL.max).toBe(1.30)
  expect(ACWR_ZONES.CAUTION.max).toBe(1.50)
})

// ─────────────────────────────────────────────
// SUITE 2 — updateEWMA
// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — updateEWMA\n')

test('2.1: Cold start — prev=0, load=100, λ=0.25 → 25', () => {
  const result = updateEWMA({ prev_ewma: 0, new_load: 100, lambda: 0.25 })
  expect(result).toBeCloseTo(25)
})

test('2.2: Steady state — prev=50, load=50 → 50', () => {
  const result = updateEWMA({ prev_ewma: 50, new_load: 50, lambda: 0.25 })
  expect(result).toBeCloseTo(50)
})

test('2.3: Load spike — prev=30, load=200, λ=0.25 → 72.5', () => {
  // 0.25 * 200 + 0.75 * 30 = 50 + 22.5 = 72.5
  const result = updateEWMA({ prev_ewma: 30, new_load: 200, lambda: 0.25 })
  expect(result).toBeCloseTo(72.5)
})

test('2.4: Rest day — prev=80, load=0, λ=0.25 → 60', () => {
  // 0.25 * 0 + 0.75 * 80 = 60
  const result = updateEWMA({ prev_ewma: 80, new_load: 0, lambda: 0.25 })
  expect(result).toBeCloseTo(60)
})

test('2.5: Chronic EWMA con λ_chronic=0.069', () => {
  // 0.069 * 100 + 0.931 * 50 = 6.9 + 46.55 = 53.45
  const result = updateEWMA({ prev_ewma: 50, new_load: 100, lambda: LAMBDA_CHRONIC })
  expect(result).toBeCloseTo(53.45)
})

test('2.6: Acute EWMA responds faster than chronic', () => {
  const acute = updateEWMA({ prev_ewma: 50, new_load: 200, lambda: LAMBDA_ACUTE })
  const chronic = updateEWMA({ prev_ewma: 50, new_load: 200, lambda: LAMBDA_CHRONIC })
  expect(acute).toBeGreaterThan(chronic) // acute responds faster to spikes
})

test('2.7: Multiple consecutive updates converge', () => {
  let acute = 0
  for (let i = 0; i < 20; i++) {
    acute = updateEWMA({ prev_ewma: acute, new_load: 100, lambda: LAMBDA_ACUTE })
  }
  // Should approach 100 after many iterations with constant load
  expect(acute).toBeGreaterThan(95)
})

// ─────────────────────────────────────────────
// SUITE 3 — classifyACWR
// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — classifyACWR\n')

test('3.1: ACWR 0.5 → underload, 5% risk', () => {
  const { zone, injury_risk_pct } = classifyACWR(0.5)
  expect(zone).toBe('underload')
  expect(injury_risk_pct).toBe(5)
})

test('3.2: ACWR 0.80 → underload (boundary)', () => {
  const { zone } = classifyACWR(0.80)
  expect(zone).toBe('underload')
})

test('3.3: ACWR 0.81 → optimal', () => {
  const { zone, injury_risk_pct } = classifyACWR(0.81)
  expect(zone).toBe('optimal')
  expect(injury_risk_pct).toBe(15)
})

test('3.4: ACWR 1.0 → optimal (sweet spot)', () => {
  const { zone } = classifyACWR(1.0)
  expect(zone).toBe('optimal')
})

test('3.5: ACWR 1.30 → optimal (boundary)', () => {
  const { zone } = classifyACWR(1.30)
  expect(zone).toBe('optimal')
})

test('3.6: ACWR 1.31 → caution', () => {
  const { zone, injury_risk_pct } = classifyACWR(1.31)
  expect(zone).toBe('caution')
  expect(injury_risk_pct).toBe(30)
})

test('3.7: ACWR 1.50 → caution (boundary)', () => {
  const { zone } = classifyACWR(1.50)
  expect(zone).toBe('caution')
})

test('3.8: ACWR 1.51 → danger', () => {
  const { zone } = classifyACWR(1.51)
  expect(zone).toBe('danger')
})

test('3.9: ACWR 2.0 → danger, risk = 75%', () => {
  // risk = min(100, round(50 + (2.0 - 1.50) * 50)) = 50 + 25 = 75
  const { zone, injury_risk_pct } = classifyACWR(2.0)
  expect(zone).toBe('danger')
  expect(injury_risk_pct).toBe(75)
})

test('3.10: ACWR 2.5 → danger, risk capped at 100%', () => {
  const { injury_risk_pct } = classifyACWR(2.5)
  expect(injury_risk_pct).toBe(100)
})

test('3.11: ACWR 3.0 → danger, risk still 100% (cap)', () => {
  const { injury_risk_pct } = classifyACWR(3.0)
  expect(injury_risk_pct).toBe(100)
})

test('3.12: ACWR 0 → underload', () => {
  const { zone } = classifyACWR(0)
  expect(zone).toBe('underload')
})

// ─────────────────────────────────────────────
// SUITE 4 — ACWR Simulation (multi-day)
// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — ACWR Simulation\n')

test('4.1: Constant load → ACWR converges to ~1.0', () => {
  let acute = 0
  let chronic = 0
  const daily_load = 80
  for (let d = 0; d < 60; d++) {
    acute = updateEWMA({ prev_ewma: acute, new_load: daily_load, lambda: LAMBDA_ACUTE })
    chronic = updateEWMA({ prev_ewma: chronic, new_load: daily_load, lambda: LAMBDA_CHRONIC })
  }
  const acwr = chronic > 0.1 ? acute / chronic : 1.0
  expect(acwr).toBeCloseTo(1.0, 0.05)
})

test('4.2: Spike after low load → ACWR > 1.3 (caution+)', () => {
  let acute = 0
  let chronic = 0
  // 30 days low load
  for (let d = 0; d < 30; d++) {
    acute = updateEWMA({ prev_ewma: acute, new_load: 30, lambda: LAMBDA_ACUTE })
    chronic = updateEWMA({ prev_ewma: chronic, new_load: 30, lambda: LAMBDA_CHRONIC })
  }
  // Then sudden spike
  for (let d = 0; d < 3; d++) {
    acute = updateEWMA({ prev_ewma: acute, new_load: 200, lambda: LAMBDA_ACUTE })
    chronic = updateEWMA({ prev_ewma: chronic, new_load: 200, lambda: LAMBDA_CHRONIC })
  }
  const acwr = acute / chronic
  const { zone } = classifyACWR(acwr)
  expect(acwr).toBeGreaterThan(1.3)
  // Should be caution or danger
  expect(zone === 'caution' || zone === 'danger').toBeTruthy()
})

test('4.3: Detraining (no load after buildup) → underload', () => {
  let acute = 0
  let chronic = 0
  // 40 days of good training
  for (let d = 0; d < 40; d++) {
    acute = updateEWMA({ prev_ewma: acute, new_load: 80, lambda: LAMBDA_ACUTE })
    chronic = updateEWMA({ prev_ewma: chronic, new_load: 80, lambda: LAMBDA_CHRONIC })
  }
  // Then 14 days rest
  for (let d = 0; d < 14; d++) {
    acute = updateEWMA({ prev_ewma: acute, new_load: 0, lambda: LAMBDA_ACUTE })
    chronic = updateEWMA({ prev_ewma: chronic, new_load: 0, lambda: LAMBDA_CHRONIC })
  }
  const acwr = chronic > 0.1 ? acute / chronic : 1.0
  expect(acwr).toBeLessThan(0.80) // underload territory
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #02 — ACWR Calculator: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}
console.log('═'.repeat(50) + '\n')
if (failed > 0) process.exit(1)
