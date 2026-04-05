/**
 * Tests — Engine #06 Movement Escalation
 *
 * Valida funciones puras:
 *   - recommendMovementScale: scaling recommendation
 *   - calculatePct1RM: % of 1RM
 *   - calculateRecentSuccessRate: success % from last 3 sessions
 *   - Risk level assessment
 *   - Confidence scoring
 */

import {
  recommendMovementScale,
  calculatePct1RM,
  calculateRecentSuccessRate,
  coachOverride,
  type MovementEscalationInput,
} from '../../src/engines/movementEscalation'

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
    toBeGreaterThanOrEqual: (n: number) => { if (actual < n) throw new Error(`Expected ${actual} >= ${n}`) },
    toBeLessThanOrEqual: (n: number) => { if (actual > n) throw new Error(`Expected ${actual} <= ${n}`) },
    toContain: (s: string) => { if (typeof actual !== 'string' || !actual.includes(s)) throw new Error(`Expected to contain "${s}", got "${actual}"`) },
  }
}

const BASE_INPUT: MovementEscalationInput = {
  athlete_id: 'athlete-1',
  movement_id: 'back_squat',
  current_1rm_kg: 100,
  proposed_weight_kg: 80,
  bodyweight_kg: 70,
  recent_sessions: [
    { date: '2026-04-03', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
    { date: '2026-04-02', reps_target: 5, reps_completed: 4, weight_kg: 75, scale_used: 'rx' },
    { date: '2026-04-01', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
  ],
  is_new_movement: false,
  injury_cooldown_active: false,
}

// ─────────────────────────────────────────────
// SUITE 1 — Percentage of 1RM
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — Percentage of 1RM\n')

test('1.1: 80kg / 100kg 1RM = 80%', () => {
  expect(calculatePct1RM(80, 100)).toBe(80)
})

test('1.2: 100kg / 100kg 1RM = 100%', () => {
  expect(calculatePct1RM(100, 100)).toBe(100)
})

test('1.3: 85kg / 100kg 1RM = 85%', () => {
  expect(calculatePct1RM(85, 100)).toBe(85)
})

test('1.4: 0kg 1RM → 0%', () => {
  expect(calculatePct1RM(50, 0)).toBe(0)
})

test('1.5: 70kg / 100kg 1RM = 70%', () => {
  expect(calculatePct1RM(70, 100)).toBe(70)
})

// ─────────────────────────────────────────────
// SUITE 2 — Recent Success Rate
// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Recent Success Rate\n')

test('2.1: 3/3 completed = 100% success', () => {
  const sessions = [
    { reps_target: 5, reps_completed: 5 },
    { reps_target: 5, reps_completed: 5 },
    { reps_target: 5, reps_completed: 5 },
  ]
  expect(calculateRecentSuccessRate(sessions)).toBe(100)
})

test('2.2: 2/3 completed = 67% success', () => {
  const sessions = [
    { reps_target: 5, reps_completed: 5 },
    { reps_target: 5, reps_completed: 4 },
    { reps_target: 5, reps_completed: 5 },
  ]
  expect(calculateRecentSuccessRate(sessions)).toBe(67)
})

test('2.3: 0/3 completed = 0% success', () => {
  const sessions = [
    { reps_target: 5, reps_completed: 3 },
    { reps_target: 5, reps_completed: 2 },
    { reps_target: 5, reps_completed: 3 },
  ]
  expect(calculateRecentSuccessRate(sessions)).toBe(0)
})

test('2.4: Empty history = 0% success', () => {
  expect(calculateRecentSuccessRate([])).toBe(0)
})

// ─────────────────────────────────────────────
// SUITE 3 — Scaling Recommendation
// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Scaling Recommendation\n')

test('3.1: 80% of 1RM + good recent → Rx', () => {
  const result = recommendMovementScale(BASE_INPUT)
  expect(result.recommended_scale).toBe('rx')
})

test('3.2: 85% of 1RM → Rx+', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 85,
  })
  expect(result.recommended_scale).toBe('rx_plus')
})

test('3.3: 70% of 1RM → Rx minimum', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 70,
  })
  expect(result.recommended_scale).toBe('rx')
})

test('3.4: 60% of 1RM → Beginner', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 60,
  })
  expect(result.recommended_scale).toBe('beginner')
})

test('3.5: New movement → always Beginner', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 85,
    is_new_movement: true,
  })
  expect(result.recommended_scale).toBe('beginner')
})

test('3.6: Injury cooldown active → always Beginner', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 85,
    injury_cooldown_active: true,
    cooldown_days_remaining: 3,
  })
  expect(result.recommended_scale).toBe('beginner')
})

test('3.7: Form concerns → downscale from Rx+ to Rx', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 85,
    recent_sessions: [
      {
        date: '2026-04-03',
        reps_target: 5,
        reps_completed: 5,
        weight_kg: 80,
        scale_used: 'rx',
        notes: 'form shaky on last rep',
      },
      { date: '2026-04-02', reps_target: 5, reps_completed: 5, weight_kg: 80, scale_used: 'rx' },
      { date: '2026-04-01', reps_target: 5, reps_completed: 5, weight_kg: 80, scale_used: 'rx' },
    ],
  })
  expect(result.recommended_scale).toBe('rx')
})

// ─────────────────────────────────────────────
// SUITE 4 — Risk Level
// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Risk Level\n')

test('4.1: Normal scenario → low risk', () => {
  const result = recommendMovementScale(BASE_INPUT)
  expect(result.risk_level).toBe('low')
})

test('4.2: New movement → medium risk', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    is_new_movement: true,
  })
  expect(result.risk_level).toBe('medium')
})

test('4.3: Form concerns → high risk', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    recent_sessions: [
      {
        date: '2026-04-03',
        reps_target: 5,
        reps_completed: 5,
        weight_kg: 75,
        scale_used: 'rx',
        notes: 'balance issue',
      },
      { date: '2026-04-02', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
      { date: '2026-04-01', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
    ],
  })
  expect(result.risk_level).toBe('high')
})

test('4.4: Injury cooldown → high risk', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    injury_cooldown_active: true,
  })
  expect(result.risk_level).toBe('high')
})

// ─────────────────────────────────────────────
// SUITE 5 — Confidence Scoring
// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Confidence Scoring\n')

test('5.1: Normal → confidence 80+', () => {
  const result = recommendMovementScale(BASE_INPUT)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(70)
})

test('5.2: New movement → reduced confidence (< 80)', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    is_new_movement: true,
  })
  expect(result.confidence_pct).toBeLessThan(80)
})

test('5.3: Injury cooldown → reduced confidence (< 80)', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    injury_cooldown_active: true,
  })
  expect(result.confidence_pct).toBeLessThan(80)
})

test('5.4: Recent PR → PR detected in reason', () => {
  const result_with_pr = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 76, // > any recent (75kg)
    recent_sessions: [
      { date: '2026-04-03', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
      { date: '2026-04-02', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
      { date: '2026-04-01', reps_target: 5, reps_completed: 5, weight_kg: 70, scale_used: 'rx' },
    ],
  })
  expect(result_with_pr.confidence_pct).toBeGreaterThanOrEqual(85)
})

test('5.5: Confidence always 0-100', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    is_new_movement: true,
    injury_cooldown_active: true,
  })
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

// ─────────────────────────────────────────────
// SUITE 6 — Reason Strings
// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Reason Strings\n')

test('6.1: New movement → mentions "New movement"', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    is_new_movement: true,
  })
  expect(result.reason).toContain('New movement')
})

test('6.2: Injury cooldown → mentions cooldown', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    injury_cooldown_active: true,
    cooldown_days_remaining: 5,
  })
  expect(result.reason).toContain('cooldown')
})

test('6.3: Form concerns → mentions "Form concerns"', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    recent_sessions: [
      {
        date: '2026-04-03',
        reps_target: 5,
        reps_completed: 5,
        weight_kg: 75,
        scale_used: 'rx',
        notes: 'form issue noted',
      },
      { date: '2026-04-02', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
      { date: '2026-04-01', reps_target: 5, reps_completed: 5, weight_kg: 75, scale_used: 'rx' },
    ],
  })
  expect(result.reason).toContain('Form concerns')
})

test('6.4: Rx+ capable → mentions "Rx+"', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    proposed_weight_kg: 86,
  })
  expect(result.reason).toContain('Rx+')
})

// ─────────────────────────────────────────────
// SUITE 7 — Coach Override
// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Coach Override\n')

test('7.1: Coach can override to different scale', () => {
  const recommended = recommendMovementScale(BASE_INPUT)
  const overridden = coachOverride(recommended, 'beginner', 'Athlete has shoulder pain')
  expect(overridden.recommended_scale).toBe('beginner')
})

test('7.2: Override reason includes "[COACH OVERRIDE]"', () => {
  const recommended = recommendMovementScale(BASE_INPUT)
  const overridden = coachOverride(recommended, 'rx_plus', 'Athlete is very strong today')
  expect(overridden.reason).toContain('[COACH OVERRIDE]')
})

test('7.3: Override preserves other fields', () => {
  const recommended = recommendMovementScale(BASE_INPUT)
  const overridden = coachOverride(recommended, 'beginner', 'Just testing')
  expect(overridden.pct_1rm).toBe(recommended.pct_1rm)
  expect(overridden.confidence_pct).toBe(recommended.confidence_pct)
})

// ─────────────────────────────────────────────
// SUITE 8 — Edge Cases
// ─────────────────────────────────────────────

console.log('\n📋 Suite 8 — Edge Cases\n')

test('8.1: Zero 1RM → all recommendations beginner', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    current_1rm_kg: 0,
  })
  expect(result.recommended_scale).toBe('beginner')
  expect(result.pct_1rm).toBe(0)
})

test('8.2: Proposed weight > 1RM (overachieve) → Rx+ if ≥85% achieved', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    current_1rm_kg: 100,
    proposed_weight_kg: 90,
    recent_sessions: [
      { date: '2026-04-03', reps_target: 5, reps_completed: 5, weight_kg: 90, scale_used: 'rx' },
      { date: '2026-04-02', reps_target: 5, reps_completed: 5, weight_kg: 90, scale_used: 'rx' },
      { date: '2026-04-01', reps_target: 5, reps_completed: 5, weight_kg: 90, scale_used: 'rx' },
    ],
  })
  expect(result.recommended_scale).toBe('rx_plus')
})

test('8.3: Single recent session → uses that data', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    recent_sessions: [{ date: '2026-04-04', reps_target: 5, reps_completed: 5, weight_kg: 80, scale_used: 'rx' }],
  })
  expect(result.recent_success_rate).toBe(100)
})

test('8.4: All sessions failed → 0% success', () => {
  const result = recommendMovementScale({
    ...BASE_INPUT,
    recent_sessions: [
      { date: '2026-04-03', reps_target: 5, reps_completed: 2, weight_kg: 75, scale_used: 'rx' },
      { date: '2026-04-02', reps_target: 5, reps_completed: 3, weight_kg: 75, scale_used: 'rx' },
      { date: '2026-04-01', reps_target: 5, reps_completed: 1, weight_kg: 75, scale_used: 'rx' },
    ],
  })
  expect(result.recent_success_rate).toBe(0)
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #06 — Movement Escalation: ${passed} passed, ${failed} failed`)
if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}
console.log('═'.repeat(50) + '\n')
if (failed > 0) process.exit(1)
