/**
 * TEST SUITE: ENGINE #10 — Recovery Optimizer
 *
 * Tests:
 * 1. Sleep target calculation (readiness-based)
 * 2. Average sleep calculation from history
 * 3. Sleep quality evaluation
 * 4. Mobility focus selection
 * 5. Deload decision logic
 * 6. Supplement recommendations
 * 7. Recovery priorities
 * 8. Confidence scoring
 * 9. Edge cases
 */

import {
  calculateAverageSleep,
  calculateAverageSleepQuality,
  optimizeRecovery,
  type RecoveryOptimizerInput,
  type SleepRecord,
} from '@/src/engines/recoveryOptimizer'

// ─────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────

const test = (name: string, fn: () => void) => {
  try {
    fn()
    console.log(`  ✅ ${name}`)
  } catch (e) {
    console.log(`  ❌ ${name}`)
    throw e
  }
}

const expect = (actual: any) => ({
  toBe: (expected: any) => {
    if (actual !== expected) {
      throw new Error(
        `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      )
    }
  },
  toEqual: (expected: any) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(
        `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      )
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected > ${expected}, got ${actual}`)
    }
  },
  toBeGreaterThanOrEqual: (expected: number) => {
    if (actual < expected) {
      throw new Error(`Expected >= ${expected}, got ${actual}`)
    }
  },
  toBeLessThan: (expected: number) => {
    if (actual >= expected) {
      throw new Error(`Expected < ${expected}, got ${actual}`)
    }
  },
  toBeLessThanOrEqual: (expected: number) => {
    if (actual > expected) {
      throw new Error(`Expected <= ${expected}, got ${actual}`)
    }
  },
  toInclude: (expected: string) => {
    if (!actual.includes(expected)) {
      throw new Error(`Expected "${actual}" to include "${expected}"`)
    }
  },
  toHaveLength: (expected: number) => {
    if (actual.length !== expected) {
      throw new Error(`Expected length ${expected}, got ${actual.length}`)
    }
  },
})

// ─────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — Sleep History Calculations\n')

test('1.1: Average sleep from 7 days', () => {
  const history: SleepRecord[] = [
    { date: '2026-03-30', hours_slept: 8, sleep_quality: 8 },
    { date: '2026-03-31', hours_slept: 7.5, sleep_quality: 7 },
    { date: '2026-04-01', hours_slept: 8.5, sleep_quality: 8 },
    { date: '2026-04-02', hours_slept: 7, sleep_quality: 6 },
    { date: '2026-04-03', hours_slept: 8, sleep_quality: 8 },
    { date: '2026-04-04', hours_slept: 9, sleep_quality: 9 },
    { date: '2026-04-05', hours_slept: 8, sleep_quality: 8 },
  ]
  const avg = calculateAverageSleep(history)
  expect(avg).toBe(8.0) // (8+7.5+8.5+7+8+9+8)/7 = 56/7 = 8.0
})

test('1.2: Average sleep quality', () => {
  const history: SleepRecord[] = [
    { date: '2026-03-30', hours_slept: 8, sleep_quality: 8 },
    { date: '2026-03-31', hours_slept: 7.5, sleep_quality: 7 },
    { date: '2026-04-01', hours_slept: 8.5, sleep_quality: 8 },
    { date: '2026-04-02', hours_slept: 7, sleep_quality: 6 },
    { date: '2026-04-03', hours_slept: 8, sleep_quality: 8 },
    { date: '2026-04-04', hours_slept: 9, sleep_quality: 9 },
    { date: '2026-04-05', hours_slept: 8, sleep_quality: 8 },
  ]
  const quality = calculateAverageSleepQuality(history)
  expect(quality).toBe(7.7) // (8+7+8+6+8+9+8)/7 = 7.71 → rounds to 7.7
})

test('1.3: Empty sleep history → 0 average', () => {
  const avg = calculateAverageSleep([])
  expect(avg).toBe(0)
})

test('1.4: Empty sleep history → 5 quality (default)', () => {
  const quality = calculateAverageSleepQuality([])
  expect(quality).toBe(5)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Sleep Targets by Readiness\n')

test('2.1: Red readiness (0-24) → 9-10h target', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 15,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.sleep_target_hours.min).toBe(9)
  expect(result.sleep_target_hours.max).toBe(10)
})

test('2.2: Orange readiness (25-49) → 8.5-9h target', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 35,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.sleep_target_hours.min).toBe(8.5)
  expect(result.sleep_target_hours.max).toBe(9)
})

test('2.3: Yellow readiness (50-74) → 8-8.5h target', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 62,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.sleep_target_hours.min).toBe(8)
  expect(result.sleep_target_hours.max).toBe(8.5)
})

test('2.4: Green readiness (75-100) → 7-8h target', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 88,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.sleep_target_hours.min).toBe(7)
  expect(result.sleep_target_hours.max).toBe(8)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Mobility Focus\n')

test('3.1: Danger ACWR → hips, lower_back, shoulders', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.mobility_focus.length).toBe(3)
  expect(result.mobility_focus).toInclude('hips')
  expect(result.mobility_focus).toInclude('lower_back')
  expect(result.mobility_focus).toInclude('shoulders')
})

test('3.2: Caution ACWR → hips, ankles, thoracic', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'caution',
    acwr_value: 1.3,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.mobility_focus.length).toBe(3)
  expect(result.mobility_focus).toInclude('hips')
})

test('3.3: Optimal ACWR → wrists, shoulders (maintenance)', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 80,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.mobility_focus.length).toBe(2)
  expect(result.mobility_focus).toInclude('wrists')
  expect(result.mobility_focus).toInclude('shoulders')
})

test('3.4: Danger ACWR → 15min mobility', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.mobility_duration_min).toBe(15)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Deload Decision\n')

test('4.1: 5+ days high ACWR → light week deload', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
    consecutive_high_acwr_days: 5,
  }
  const result = optimizeRecovery(input)
  expect(result.deload_suggested).toBe(true)
  expect(result.deload_type).toBe('light_week')
})

test('4.2: Danger ACWR + severe injury → active recovery only', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 30,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [
      {
        injury_type: 'shoulder_strain',
        body_part: 'shoulder',
        cooldown_days_remaining: 10,
        severity: 'severe',
      },
    ],
  }
  const result = optimizeRecovery(input)
  expect(result.deload_suggested).toBe(true)
  expect(result.deload_type).toBe('active_only')
})

test('4.3: 2+ active injuries → rest day', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 60,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [
      {
        injury_type: 'shoulder_strain',
        body_part: 'shoulder',
        cooldown_days_remaining: 5,
        severity: 'moderate',
      },
      {
        injury_type: 'knee_pain',
        body_part: 'knee',
        cooldown_days_remaining: 3,
        severity: 'moderate',
      },
    ],
  }
  const result = optimizeRecovery(input)
  expect(result.deload_suggested).toBe(true)
  expect(result.deload_type).toBe('rest_day')
})

test('4.4: Optimal conditions → no deload', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 85,
    acwr_zone: 'optimal',
    acwr_value: 0.95,
    sleep_history_7d: [],
    active_injuries: [],
    consecutive_high_acwr_days: 0,
  }
  const result = optimizeRecovery(input)
  expect(result.deload_suggested).toBe(false)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Supplement Recommendations\n')

test('5.1: Danger ACWR → critical supplements', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.supplement_priority).toBe('critical')
  expect(result.supplements.length).toBeGreaterThan(0)
})

test('5.2: Red readiness → important supplements', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 20,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.supplement_priority).toBe('important')
  expect(result.supplements.length).toBeGreaterThan(0)
})

test('5.3: High training yesterday → intense supplements', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 75,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [],
    training_intensity_yesterday: 'high',
  }
  const result = optimizeRecovery(input)
  expect(result.supplement_priority).toBe('important')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Recovery Priorities\n')

test('6.1: Insufficient sleep → sleep priority', () => {
  const sleep_history: SleepRecord[] = [
    { date: '2026-03-30', hours_slept: 5, sleep_quality: 5 },
    { date: '2026-03-31', hours_slept: 5.5, sleep_quality: 5 },
    { date: '2026-04-01', hours_slept: 6, sleep_quality: 5 },
  ]
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 65,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: sleep_history,
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.recovery_priorities).toInclude('sleep')
})

test('6.2: Danger ACWR → mobility priority', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.recovery_priorities).toInclude('mobility')
})

test('6.3: Deload suggested → deload priority', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
    consecutive_high_acwr_days: 5,
  }
  const result = optimizeRecovery(input)
  expect(result.recovery_priorities).toInclude('deload')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Confidence Scoring\n')

test('7.1: Danger ACWR → high confidence (95)', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.confidence_pct).toBe(95)
})

test('7.2: Active injuries → boosted confidence', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 75,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    sleep_history_7d: [],
    active_injuries: [
      {
        injury_type: 'strain',
        body_part: 'shoulder',
        cooldown_days_remaining: 5,
        severity: 'moderate',
      },
    ],
  }
  const result = optimizeRecovery(input)
  expect(result.confidence_pct).toBeGreaterThan(80)
})

test('7.3: Confidence always 0-100', () => {
  const input: RecoveryOptimizerInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'caution',
    acwr_value: 1.3,
    sleep_history_7d: [],
    active_injuries: [],
  }
  const result = optimizeRecovery(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #10 — Recovery Optimizer: All tests passed')
console.log('══════════════════════════════════════════════════\n')
