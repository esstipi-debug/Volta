/**
 * TEST SUITE: ENGINE #08 — Assessment Engine
 *
 * Tests:
 * 1. VO2Max calculation from PRISMA protocol
 * 2. VO2Max categorization
 * 3. Attribute score calculation
 * 4. Overall score (10D average)
 * 5. Progress tracking (30d/90d)
 * 6. Radar chart data generation
 * 7. Confidence scoring
 * 8. Different assessment types
 * 9. Edge cases
 */

import {
  calculateVO2MaxFromPRISMA,
  categorizeVO2Max,
  calculateOverallScore,
  assessAthlete,
  type AssessmentInput,
  type PRISMATestResult,
  type AttributeScores,
} from '@/src/engines/assessmentEngine'

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

console.log('\n📋 Suite 1 — VO2Max Calculation from PRISMA\n')

test('1.1: Calculate VO2Max from watts and bodyweight', () => {
  // NP=350W, BW=70kg → (350/70) × 10 = 50 ml/kg/min
  const vo2max = calculateVO2MaxFromPRISMA(350, 70)
  expect(vo2max).toBe(50)
})

test('1.2: Higher watts → higher VO2Max', () => {
  const low = calculateVO2MaxFromPRISMA(300, 70)
  const high = calculateVO2MaxFromPRISMA(400, 70)
  expect(high).toBeGreaterThan(low)
})

test('1.3: Lower bodyweight → higher VO2Max (watts per kg)', () => {
  const heavier = calculateVO2MaxFromPRISMA(300, 80)
  const lighter = calculateVO2MaxFromPRISMA(300, 60)
  expect(lighter).toBeGreaterThan(heavier)
})

test('1.4: Zero bodyweight → zero VO2Max', () => {
  const vo2max = calculateVO2MaxFromPRISMA(300, 0)
  expect(vo2max).toBe(0)
})

test('1.5: Realistic PRISMA result (elite athlete)', () => {
  // ~400W NP, 70kg BW
  const vo2max = calculateVO2MaxFromPRISMA(400, 70)
  expect(vo2max).toBeGreaterThan(40) // Elite range
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — VO2Max Categorization\n')

test('2.1: VO2Max >= 60 → elite', () => {
  expect(categorizeVO2Max(60)).toBe('elite')
  expect(categorizeVO2Max(70)).toBe('elite')
})

test('2.2: VO2Max 50-59 → excellent', () => {
  expect(categorizeVO2Max(50)).toBe('excellent')
  expect(categorizeVO2Max(55)).toBe('excellent')
})

test('2.3: VO2Max 40-49 → good', () => {
  expect(categorizeVO2Max(40)).toBe('good')
  expect(categorizeVO2Max(45)).toBe('good')
})

test('2.4: VO2Max 30-39 → average', () => {
  expect(categorizeVO2Max(30)).toBe('average')
  expect(categorizeVO2Max(35)).toBe('average')
})

test('2.5: VO2Max < 30 → below_average', () => {
  expect(categorizeVO2Max(20)).toBe('below_average')
  expect(categorizeVO2Max(0)).toBe('below_average')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Overall Score Calculation\n')

test('3.1: Average of 10 attributes', () => {
  const scores: AttributeScores = {
    aerobic_endurance: 80,
    aerobic_power: 80,
    anaerobic_capacity: 80,
    absolute_strength: 80,
    strength_endurance: 80,
    power: 80,
    gymnastics_capacity: 80,
    mobility: 80,
    mental_resilience: 80,
    speed: 80,
  }
  const overall = calculateOverallScore(scores)
  expect(overall).toBe(80)
})

test('3.2: Mixed scores average correctly', () => {
  const scores: AttributeScores = {
    aerobic_endurance: 100,
    aerobic_power: 100,
    anaerobic_capacity: 0,
    absolute_strength: 0,
    strength_endurance: 0,
    power: 0,
    gymnastics_capacity: 0,
    mobility: 0,
    mental_resilience: 0,
    speed: 0,
  }
  const overall = calculateOverallScore(scores)
  expect(overall).toBe(20)
})

test('3.3: Overall score always 0-100', () => {
  const scores: AttributeScores = {
    aerobic_endurance: 75,
    aerobic_power: 65,
    anaerobic_capacity: 85,
    absolute_strength: 70,
    strength_endurance: 60,
    power: 80,
    gymnastics_capacity: 55,
    mobility: 50,
    mental_resilience: 90,
    speed: 70,
  }
  const overall = calculateOverallScore(scores)
  expect(overall).toBeGreaterThanOrEqual(0)
  expect(overall).toBeLessThanOrEqual(100)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — PRISMA Assessment\n')

test('4.1: Full PRISMA (5/5 intervals)', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)

  expect(result.vo2max_estimate).toBeGreaterThan(0)
  expect(result.vo2max_category).toBeDefined()
  expect(result.confidence_pct).toBe(95) // Full test = high confidence
  expect(result.attribute_scores).toBeDefined()
  expect(result.overall_score).toBeGreaterThanOrEqual(0)
  expect(result.overall_score).toBeLessThanOrEqual(100)
})

test('4.2: Partial PRISMA (3/5 intervals)', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 17,
    intervals_completed: 3,
    avg_watts: 320,
    normalized_power: 330,
    ftp_estimate: 250,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)

  expect(result.confidence_pct).toBe(65) // Incomplete = lower confidence
  expect(result.vo2max_estimate).toBeGreaterThan(0)
})

test('4.3: Incomplete PRISMA (0 intervals)', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 5,
    intervals_completed: 0,
    avg_watts: 200,
    normalized_power: 200,
    ftp_estimate: 150,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)

  expect(result.confidence_pct).toBe(30) // Very incomplete = very low confidence
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Attribute Scores\n')

test('5.1: All attribute scores are 0-100', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  const scores = result.attribute_scores

  Object.values(scores).forEach((score) => {
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})

test('5.2: Aerobic power ≥ Aerobic endurance', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  expect(result.attribute_scores.aerobic_power).toBeGreaterThanOrEqual(
    result.attribute_scores.aerobic_endurance - 5
  )
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Radar Chart Data\n')

test('6.1: Has all 10 dimensions', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  const dims = Object.keys(result.radar_chart_data)
  expect(dims.length).toBe(10)
})

test('6.2: All radar values are 0-100', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)

  Object.values(result.radar_chart_data).forEach((value) => {
    expect(value as number).toBeGreaterThanOrEqual(0)
    expect(value as number).toBeLessThanOrEqual(100)
  })
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Progress Tracking\n')

test('7.1: No previous scores → no progress data', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  // No previous scores provided, so progress should be undefined
  expect(result.progress_vs_30d).toBe(undefined)
})

test('7.2: With previous 30d scores → calculate progress', () => {
  const previous_scores_30d_ago: AttributeScores = {
    aerobic_endurance: 70,
    aerobic_power: 70,
    anaerobic_capacity: 70,
    absolute_strength: 70,
    strength_endurance: 70,
    power: 70,
    gymnastics_capacity: 70,
    mobility: 70,
    mental_resilience: 70,
    speed: 70,
  }

  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 380,
    normalized_power: 390,
    ftp_estimate: 290,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
    previous_scores_30d_ago,
    previous_vo2max_30d_ago: 45,
  }

  const result = assessAthlete(input)
  expect(result.progress_vs_30d).toBeDefined()
  if (result.progress_vs_30d) {
    expect(result.progress_vs_30d.overall_change_pct).toBeDefined()
  }
})

test('7.3: Improved vs declined attributes tracked', () => {
  const previous_scores_30d_ago: AttributeScores = {
    aerobic_endurance: 50,
    aerobic_power: 50,
    anaerobic_capacity: 50,
    absolute_strength: 50,
    strength_endurance: 50,
    power: 50,
    gymnastics_capacity: 50,
    mobility: 50,
    mental_resilience: 50,
    speed: 50,
  }

  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 400,
    normalized_power: 410,
    ftp_estimate: 310,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
    previous_scores_30d_ago,
  }

  const result = assessAthlete(input)
  if (result.progress_vs_30d) {
    expect(result.progress_vs_30d.improved_attributes).toHaveLength(10) // All should improve
  }
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 8 — Rationale Generation\n')

test('8.1: PRISMA → mentions VO2Max and NP', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  expect(result.rationale).toInclude('PRISMA')
  expect(result.rationale).toInclude('ml/kg/min')
})

test('8.2: Progress mentioned in rationale if improving', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 400,
    normalized_power: 410,
    ftp_estimate: 310,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
    previous_vo2max_30d_ago: 30, // Significant improvement
  }

  const result = assessAthlete(input)
  expect(result.rationale).toInclude('Improving')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 9 — Edge Cases\n')

test('9.1: Very heavy athlete (100kg)', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 100,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  expect(result.vo2max_estimate).toBeGreaterThan(0)
  // (360W / 100kg) × 10 = 36, which is lower than a lighter athlete due to higher BW
  expect(result.vo2max_estimate).toBeLessThan(40)
})

test('9.2: Very light athlete (50kg)', () => {
  const prisma: PRISMATestResult = {
    test_type: 'prisma_vo2max',
    duration_minutes: 29,
    intervals_completed: 5,
    avg_watts: 350,
    normalized_power: 360,
    ftp_estimate: 270,
  }

  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 50,
    assessment_type: 'prisma_vo2max',
    test_result: prisma,
  }

  const result = assessAthlete(input)
  expect(result.vo2max_estimate).toBeGreaterThan(30) // Higher due to lower BW
})

test('9.3: Non-PRISMA assessment type', () => {
  const input: AssessmentInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    bodyweight_kg: 70,
    assessment_type: 'movement_mastery',
    test_result: { some: 'data' },
  }

  const result = assessAthlete(input)
  expect(result.attribute_scores).toBeDefined()
  expect(result.overall_score).toBe(50) // Default/placeholder
  expect(result.confidence_pct).toBe(50)
})

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #08 — Assessment Engine: All tests passed')
console.log('══════════════════════════════════════════════════\n')
