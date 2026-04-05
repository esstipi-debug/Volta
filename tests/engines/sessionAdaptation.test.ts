/**
 * TEST SUITE: ENGINE #07 — Session Adaptation
 *
 * Tests:
 * 1. Readiness level mapping (0-100 → red/orange/yellow/green)
 * 2. WOD CNS cost calculation
 * 3. Consecutive ACWR caution detection
 * 4. Session adaptation recommendations
 * 5. Movement substitutions (based on ACWR zone)
 * 6. Intensity/volume reduction percentages
 * 7. Recovery suggestions
 * 8. Coach override
 * 9. Timing suggestions
 * 10. Confidence scoring
 */

import {
  getReadinessLevel,
  calculateWODCNSCost,
  countConsecutiveACWRCautions,
  recommendSessionAdaptation,
  coachOverrideAdaptation,
  type WODTemplate,
  type SessionAdaptationInput,
} from '@/src/engines/sessionAdaptation'

// ─────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────

const mockWOD = (cns_costs: number[], is_heavy: boolean[] = []): WODTemplate => ({
  id: 'wod-1',
  title: 'Test WOD',
  movements: cns_costs.map((cost, i) => ({
    name: `Movement ${i + 1}`,
    cns_cost: cost,
    is_heavy_lift: is_heavy[i] ?? false,
  })),
  estimated_duration_min: 45,
  intensity_rating: 7,
  volume_reps: 150,
})

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
  toBeGreaterThanOrEqual: (expected: number) => {
    if (actual < expected) {
      throw new Error(`Expected >= ${expected}, got ${actual}`)
    }
  },
  toBeLessThanOrEqual: (expected: number) => {
    if (actual > expected) {
      throw new Error(`Expected <= ${expected}, got ${actual}`)
    }
  },
  toBeGreaterThan: (expected: number) => {
    if (actual <= expected) {
      throw new Error(`Expected > ${expected}, got ${actual}`)
    }
  },
  toBeLessThan: (expected: number) => {
    if (actual >= expected) {
      throw new Error(`Expected < ${expected}, got ${actual}`)
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
  toBeDefined: () => {
    if (actual === undefined) {
      throw new Error(`Expected to be defined, got undefined`)
    }
  },
})

// ─────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — Readiness Level Mapping\n')

test('1.1: Score 0-24 → red', () => {
  expect(getReadinessLevel(0)).toBe('red')
  expect(getReadinessLevel(15)).toBe('red')
  expect(getReadinessLevel(24)).toBe('red')
})

test('1.2: Score 25-49 → orange', () => {
  expect(getReadinessLevel(25)).toBe('orange')
  expect(getReadinessLevel(37)).toBe('orange')
  expect(getReadinessLevel(49)).toBe('orange')
})

test('1.3: Score 50-74 → yellow', () => {
  expect(getReadinessLevel(50)).toBe('yellow')
  expect(getReadinessLevel(62)).toBe('yellow')
  expect(getReadinessLevel(74)).toBe('yellow')
})

test('1.4: Score 75-100 → green', () => {
  expect(getReadinessLevel(75)).toBe('green')
  expect(getReadinessLevel(87)).toBe('green')
  expect(getReadinessLevel(100)).toBe('green')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — WOD CNS Cost Calculation\n')

test('2.1: Average of CNS costs', () => {
  const wod = mockWOD([5, 7, 9])
  expect(calculateWODCNSCost(wod.movements)).toBe(7) // (5+7+9)/3 = 7
})

test('2.2: Single movement', () => {
  const wod = mockWOD([8])
  expect(calculateWODCNSCost(wod.movements)).toBe(8)
})

test('2.3: Empty movements → 0', () => {
  const wod = mockWOD([])
  expect(calculateWODCNSCost(wod.movements)).toBe(0)
})

test('2.4: High CNS cost WOD', () => {
  const wod = mockWOD([9, 9, 10, 9])
  expect(calculateWODCNSCost(wod.movements)).toBe(9) // (9+9+10+9)/4 = 9.25 → rounds to 9
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Consecutive ACWR Cautions Detection\n')

test('3.1: 3 consecutive cautions', () => {
  const history = [
    { date: '2026-03-30', zone: 'caution' as const },
    { date: '2026-03-31', zone: 'caution' as const },
    { date: '2026-04-01', zone: 'caution' as const },
  ]
  expect(countConsecutiveACWRCautions(history)).toBe(3)
})

test('3.2: 2 cautions, then optimal → resets', () => {
  const history = [
    { date: '2026-03-30', zone: 'caution' as const },
    { date: '2026-03-31', zone: 'caution' as const },
    { date: '2026-04-01', zone: 'optimal' as const },
  ]
  expect(countConsecutiveACWRCautions(history)).toBe(0)
})

test('3.3: Mix of caution + danger counts consecutive', () => {
  const history = [
    { date: '2026-03-30', zone: 'caution' as const },
    { date: '2026-03-31', zone: 'danger' as const },
    { date: '2026-04-01', zone: 'caution' as const },
  ]
  expect(countConsecutiveACWRCautions(history)).toBe(3)
})

test('3.4: Empty history → 0', () => {
  expect(countConsecutiveACWRCautions([])).toBe(0)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Session Adaptation Recommendations\n')

test('4.1: Red readiness → recovery_only', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 20,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBe('recovery_only')
  expect(result.readiness_level).toBe('red')
  expect(result.intensity_reduction_pct).toBe(100)
  expect(result.volume_reduction_pct).toBe(100)
})

test('4.2: Orange readiness → reduce_intensity', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 35,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([6, 7, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBe('reduce_intensity')
  expect(result.readiness_level).toBe('orange')
  expect(result.intensity_reduction_pct).toBe(25)
  expect(result.volume_reduction_pct).toBe(20)
})

test('4.3: Yellow readiness + optimal ACWR → run_as_is', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 62,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([6, 7, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBe('run_as_is')
  expect(result.readiness_level).toBe('yellow')
  expect(result.intensity_reduction_pct).toBe(0)
})

test('4.4: Green readiness + optimal ACWR → run_as_is', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 88,
    acwr_zone: 'optimal',
    acwr_value: 0.95,
    scheduled_wod: mockWOD([7, 8, 9]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBe('run_as_is')
  expect(result.readiness_level).toBe('green')
  expect(result.confidence_pct).toBeGreaterThanOrEqual(80)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — ACWR Zone Overrides\n')

test('5.1: Green readiness + danger ACWR → escalate to reduce_intensity', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 80,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    scheduled_wod: mockWOD([6, 7, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBe('reduce_intensity')
  expect(result.intensity_reduction_pct).toBeGreaterThanOrEqual(20)
})

test('5.2: Caution ACWR × 3 days → deload_suggested', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 70,
    acwr_zone: 'caution',
    acwr_value: 1.3,
    scheduled_wod: mockWOD([7, 8, 9]),
    acwr_history_7d: [
      { date: '2026-04-03', zone: 'caution' },
      { date: '2026-04-04', zone: 'caution' },
      { date: '2026-04-05', zone: 'caution' },
    ],
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBe('deload_suggested')
  expect(result.volume_reduction_pct).toBeGreaterThanOrEqual(30)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Movement Substitutions\n')

test('6.1: Danger ACWR + high CNS snatch → suggest Power Snatch', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 75,
    acwr_zone: 'danger',
    acwr_value: 1.7,
    scheduled_wod: {
      id: 'wod-1',
      title: 'Olympic WOD',
      movements: [
        { name: 'Snatch', cns_cost: 9, is_heavy_lift: true },
        { name: 'Squat', cns_cost: 7, is_heavy_lift: true },
      ],
      estimated_duration_min: 45,
      intensity_rating: 8,
      volume_reps: 120,
    },
  }
  const result = recommendSessionAdaptation(input)
  expect(result.movement_substitutions.length).toBeGreaterThan(0)
  const snatch_sub = result.movement_substitutions.find(s => s.original === 'Snatch')
  expect(snatch_sub?.suggested).toBe('Power Snatch')
})

test('6.2: Danger ACWR + clean → suggest Power Clean', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 75,
    acwr_zone: 'danger',
    acwr_value: 1.7,
    scheduled_wod: {
      id: 'wod-1',
      title: 'Clean WOD',
      movements: [
        { name: 'Clean and Jerk', cns_cost: 9, is_heavy_lift: true },
      ],
      estimated_duration_min: 45,
      intensity_rating: 8,
      volume_reps: 100,
    },
  }
  const result = recommendSessionAdaptation(input)
  const clean_sub = result.movement_substitutions.find(s => s.original.includes('Clean'))
  expect(clean_sub?.suggested).toBe('Power Clean')
})

test('6.3: Optimal ACWR → no substitutions', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 80,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: {
      id: 'wod-1',
      title: 'Olympic WOD',
      movements: [
        { name: 'Snatch', cns_cost: 9, is_heavy_lift: true },
      ],
      estimated_duration_min: 45,
      intensity_rating: 8,
      volume_reps: 100,
    },
  }
  const result = recommendSessionAdaptation(input)
  expect(result.movement_substitutions.length).toBe(0)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Recovery Suggestions\n')

test('7.1: Red readiness → sleep priority suggestion', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 15,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recovery_suggestion).toInclude('Sleep priority')
})

test('7.2: Orange readiness → extra sleep suggestion', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 35,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recovery_suggestion).toInclude('Extra sleep')
})

test('7.3: Green + high CNS + danger ACWR → cold plunge suggestion', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 85,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    scheduled_wod: mockWOD([9, 9, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recovery_suggestion).toInclude('Cold plunge')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 8 — Timing Suggestions\n')

test('8.1: Volume reduction → timing suggestion provided', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 35,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([6, 7, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.timing_suggestion).toInclude('Shorter session')
})

test('8.2: Intensity reduction → timing suggestion provided', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 70,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    scheduled_wod: mockWOD([8, 9, 9]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.timing_suggestion).toBeDefined()
})

test('8.3: No reduction → no timing suggestion', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 88,
    acwr_zone: 'optimal',
    acwr_value: 0.95,
    scheduled_wod: mockWOD([6, 7, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.timing_suggestion).toBe(undefined)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 9 — Confidence Scoring\n')

test('9.1: Red readiness → high confidence (95)', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 15,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.confidence_pct).toBe(95)
})

test('9.2: Danger ACWR → reduces confidence by 10', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 88,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    scheduled_wod: mockWOD([7, 8, 9]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.confidence_pct).toBe(75) // 85 - 10
})

test('9.3: Confidence always 0-100', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 50,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 10 — Coach Override\n')

test('10.1: Coach can override action', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 20,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const recommended = recommendSessionAdaptation(input)
  const overridden = coachOverrideAdaptation(recommended, 'run_as_is', 'Athlete requested full WOD')
  expect(overridden.recommended_action).toBe('run_as_is')
  expect(overridden.rationale).toInclude('[COACH OVERRIDE]')
})

test('10.2: Override reduces confidence by 20', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 88,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([7, 8, 9]),
  }
  const recommended = recommendSessionAdaptation(input)
  const overridden = coachOverrideAdaptation(recommended, 'recovery_only', 'Testing override')
  expect(overridden.confidence_pct).toBe(recommended.confidence_pct - 20)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 11 — Rationale Generation\n')

test('11.1: Red readiness → mentions "recovery focus"', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 15,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([5, 6, 7]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.rationale).toInclude('recovery focus')
})

test('11.2: Danger ACWR → mentions ACWR value', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 70,
    acwr_zone: 'danger',
    acwr_value: 1.7,
    scheduled_wod: mockWOD([7, 8, 9]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.rationale).toInclude('1.70')
})

test('11.3: Movement substitution → mentioned in rationale', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 80,
    acwr_zone: 'danger',
    acwr_value: 1.8,
    scheduled_wod: {
      id: 'wod-1',
      title: 'Olympic WOD',
      movements: [
        { name: 'Snatch', cns_cost: 9, is_heavy_lift: true },
      ],
      estimated_duration_min: 45,
      intensity_rating: 8,
      volume_reps: 100,
    },
  }
  const result = recommendSessionAdaptation(input)
  expect(result.rationale).toInclude('substitution')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 12 — Edge Cases\n')

test('12.1: Boundary score 24/25 (red/orange)', () => {
  expect(getReadinessLevel(24)).toBe('red')
  expect(getReadinessLevel(25)).toBe('orange')
})

test('12.2: Boundary score 49/50 (orange/yellow)', () => {
  expect(getReadinessLevel(49)).toBe('orange')
  expect(getReadinessLevel(50)).toBe('yellow')
})

test('12.3: Boundary score 74/75 (yellow/green)', () => {
  expect(getReadinessLevel(74)).toBe('yellow')
  expect(getReadinessLevel(75)).toBe('green')
})

test('12.4: All results include required fields', () => {
  const input: SessionAdaptationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    readiness_score: 60,
    acwr_zone: 'optimal',
    acwr_value: 1.0,
    scheduled_wod: mockWOD([6, 7, 8]),
  }
  const result = recommendSessionAdaptation(input)
  expect(result.recommended_action).toBeDefined()
  expect(result.readiness_level).toBeDefined()
  expect(result.intensity_reduction_pct).toBeDefined()
  expect(result.volume_reduction_pct).toBeDefined()
  expect(result.recovery_suggestion).toBeDefined()
  expect(result.confidence_pct).toBeDefined()
  expect(result.rationale).toBeDefined()
})

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #07 — Session Adaptation: All tests passed')
console.log('══════════════════════════════════════════════════\n')
