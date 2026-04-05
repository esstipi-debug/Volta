import {
  calculateACWRTrend,
  calculateReadinessTrend,
  calculateAsymmetryPct,
  determineRiskLevel,
  predictInjuryRisk,
  type InjuryPredictorInput,
  type ACWRHistoryPoint,
  type BodyPartAsymmetry,
} from '../../src/engines/injuryPredictor'

// ─────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────

interface TestResult {
  passed: number
  failed: number
  errors: string[]
}

function expect(actual: any) {
  const matchers = {
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`)
      }
    },
    toEqual: (expected: any) => {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
      }
    },
    toBeGreaterThan: (threshold: number) => {
      if (actual <= threshold) {
        throw new Error(`Expected ${actual} > ${threshold}`)
      }
    },
    toBeLessThan: (threshold: number) => {
      if (actual >= threshold) {
        throw new Error(`Expected ${actual} < ${threshold}`)
      }
    },
    toBeGreaterThanOrEqual: (threshold: number) => {
      if (actual < threshold) {
        throw new Error(`Expected ${actual} >= ${threshold}`)
      }
    },
    toBeLessThanOrEqual: (threshold: number) => {
      if (actual > threshold) {
        throw new Error(`Expected ${actual} <= ${threshold}`)
      }
    },
    toInclude: (item: any) => {
      if (!actual.includes(item)) {
        throw new Error(`Expected array to include ${item}`)
      }
    },
    toHaveLength: (len: number) => {
      if (actual.length !== len) {
        throw new Error(`Expected length ${len}, got ${actual.length}`)
      }
    },
  }

  return {
    ...matchers,
    not: {
      toBe: (expected: any) => {
        if (actual === expected) {
          throw new Error(`Expected ${actual} not to be ${expected}`)
        }
      },
      toEqual: (expected: any) => {
        if (JSON.stringify(actual) === JSON.stringify(expected)) {
          throw new Error(`Expected ${JSON.stringify(actual)} not to equal ${JSON.stringify(expected)}`)
        }
      },
      toInclude: (item: any) => {
        if (actual.includes(item)) {
          throw new Error(`Expected array not to include ${item}`)
        }
      },
    },
  }
}

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    return true
  } catch (err: any) {
    console.log(`  ❌ ${name}`)
    throw err
  }
}

// ─────────────────────────────────────────────
// Test Suites
// ─────────────────────────────────────────────

console.log('\n📋 Suite 1 — ACWR Trend Detection\n')

test('1.1: Improving ACWR (values declining)', () => {
  const history: ACWRHistoryPoint[] = Array.from({ length: 14 }, (_, i) => ({
    date: `2026-03-${20 + i}`,
    acwr_value: 1.8 - i * 0.05,
    acwr_zone: i < 7 ? 'danger' : 'caution',
  }))
  const trend = calculateACWRTrend(history)
  expect(trend).toBe('improving')
})

test('1.2: Declining ACWR (values rising)', () => {
  const history: ACWRHistoryPoint[] = Array.from({ length: 14 }, (_, i) => ({
    date: `2026-03-${20 + i}`,
    acwr_value: 1.0 + i * 0.05,
    acwr_zone: i < 7 ? 'caution' : 'danger',
  }))
  const trend = calculateACWRTrend(history)
  expect(trend).toBe('declining')
})

test('1.3: Stable ACWR (no significant change)', () => {
  const history: ACWRHistoryPoint[] = Array.from({ length: 14 }, (_, i) => ({
    date: `2026-03-${20 + i}`,
    acwr_value: 1.2,
    acwr_zone: 'caution',
  }))
  const trend = calculateACWRTrend(history)
  expect(trend).toBe('stable')
})

test('1.4: Insufficient history → stable', () => {
  const history: ACWRHistoryPoint[] = [
    { date: '2026-03-20', acwr_value: 1.5, acwr_zone: 'danger' },
  ]
  const trend = calculateACWRTrend(history)
  expect(trend).toBe('stable')
})

console.log('\n📋 Suite 2 — Readiness Trend Detection\n')

test('2.1: Declining readiness', () => {
  const history = [80, 80, 80, 80, 80, 80, 80, 65, 65, 65, 65, 65, 65, 65] // First week 80, latest week 65 = -18.75%
  const trend = calculateReadinessTrend(history)
  expect(trend).toBe('declining')
})

test('2.2: Improving readiness', () => {
  const history = [45, 45, 45, 45, 45, 45, 45, 70, 70, 70, 70, 70, 70, 70] // First week 45, latest week 70 = +55.56%
  const trend = calculateReadinessTrend(history)
  expect(trend).toBe('improving')
})

test('2.3: Stable readiness', () => {
  const history = [75, 74, 76, 75, 75, 76, 74, 75]
  const trend = calculateReadinessTrend(history)
  expect(trend).toBe('stable')
})

console.log('\n📋 Suite 3 — Asymmetry Calculation\n')

test('3.1: No asymmetry (equal sides)', () => {
  const asym = calculateAsymmetryPct(100, 100)
  expect(asym).toBe(0)
})

test('3.2: 10% asymmetry', () => {
  const asym = calculateAsymmetryPct(100, 90)
  expect(asym).toBeGreaterThan(5)
  expect(asym).toBeLessThan(12)
})

test('3.3: Severe asymmetry (>15%)', () => {
  const asym = calculateAsymmetryPct(100, 80)
  expect(asym).toBeGreaterThan(15)
})

console.log('\n📋 Suite 4 — Risk Level Determination\n')

test('4.1: Low risk (<20%)', () => {
  const level = determineRiskLevel(15)
  expect(level).toBe('low')
})

test('4.2: Moderate risk (20-39%)', () => {
  const level = determineRiskLevel(30)
  expect(level).toBe('moderate')
})

test('4.3: High risk (40-59%)', () => {
  const level = determineRiskLevel(50)
  expect(level).toBe('high')
})

test('4.4: Critical risk (≥60%)', () => {
  const level = determineRiskLevel(75)
  expect(level).toBe('critical')
})

console.log('\n📋 Suite 5 — Overall Injury Risk Prediction\n')

test('5.1: Low risk with optimal conditions', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a1',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 0.95 + Math.random() * 0.1,
      acwr_zone: 'optimal',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 80 + Math.random() * 10),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.overall_risk_level).toBe('low')
  expect(result.overall_injury_risk_pct).toBeLessThan(20)
})

test('5.2: High risk with danger ACWR days', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a2',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.8,
      acwr_zone: i < 20 ? 'danger' : 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 45),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.overall_risk_level).not.toBe('low')
  expect(result.overall_injury_risk_pct).toBeGreaterThan(20)
})

test('5.3: Critical risk with declining readiness + ACWR', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a3',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.0 + (i / 56) * 0.8,
      acwr_zone: i > 40 ? 'danger' : 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, (_, i) => 85 - (i / 56) * 30),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.overall_injury_risk_pct).toBeGreaterThan(30)
})

test('5.4: Moderate risk with asymmetries', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a4',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.2,
      acwr_zone: 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 70),
    movement_strengths: [],
    body_asymmetries: {
      shoulder: { left_side_1rm: 100, right_side_1rm: 85 } as BodyPartAsymmetry,
      knee: { left_side_1rm: 200, right_side_1rm: 175 } as BodyPartAsymmetry,
    },
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.asymmetry_issues.length).toBeGreaterThan(0)
  expect(result.overall_injury_risk_pct).toBeGreaterThan(10)
})

console.log('\n📋 Suite 6 — Body Part Specific Risk\n')

test('6.1: Identifies at-risk body parts', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a5',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.6,
      acwr_zone: 'danger',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 35),
    movement_strengths: [],
    body_asymmetries: {
      lower_back: { left_side_1rm: 180, right_side_1rm: 150 } as BodyPartAsymmetry,
    },
    previous_injuries: [{ body_part: 'lower_back', date: '2026-02-01', severity: 'moderate' }],
  }
  const result = predictInjuryRisk(input)
  expect(result.at_risk_body_parts.length).toBeGreaterThan(0)
  expect(result.highest_risk_part).toBe('lower_back')
})

test('6.2: Highest risk body part identified', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a6',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.5,
      acwr_zone: 'danger',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 50),
    movement_strengths: [],
    body_asymmetries: {
      knee: { left_side_1rm: 250, right_side_1rm: 200 } as BodyPartAsymmetry,
    },
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.highest_risk_pct).toBeGreaterThan(0)
})

console.log('\n📋 Suite 7 — Prevention Suggestions\n')

test('7.1: Suggests action for declining ACWR', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a7',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.0 + (i / 56) * 0.8,
      acwr_zone: i > 40 ? 'danger' : 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 70),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.prevention_suggestions.length).toBeGreaterThan(0)
})

test('7.2: Suggests recovery for low sleep', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a8',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.2,
      acwr_zone: 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 75),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
    sleep_average: 5.5,
  }
  const result = predictInjuryRisk(input)
  const hasSleepSuggestion = result.prevention_suggestions.some(s => s.includes('Sleep'))
  expect(hasSleepSuggestion).toBe(true)
})

console.log('\n📋 Suite 8 — Urgent Alerts\n')

test('8.1: Alerts on critical risk', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a9',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 2.0,
      acwr_zone: 'danger',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 20),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.urgent_alerts.length).toBeGreaterThan(0)
})

test('8.2: Alerts on high ACWR exposure', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a10',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.8,
      acwr_zone: 'danger',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 60),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  const hasACWRAlert = result.urgent_alerts.some(a => a.includes('ACWR'))
  expect(hasACWRAlert).toBe(true)
})

console.log('\n📋 Suite 9 — Confidence Scoring\n')

test('9.1: High confidence with full history', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a11',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.2,
      acwr_zone: 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 70),
    movement_strengths: [],
    body_asymmetries: {
      shoulder: { left_side_1rm: 100, right_side_1rm: 100 } as BodyPartAsymmetry,
    },
    previous_injuries: [
      { body_part: 'shoulder', date: '2026-01-01', severity: 'minor' },
      { body_part: 'knee', date: '2026-02-01', severity: 'minor' },
    ],
  }
  const result = predictInjuryRisk(input)
  expect(result.confidence_pct).toBeGreaterThan(85)
})

test('9.2: Lower confidence with limited history', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a12',
    date: '2026-04-05',
    acwr_history_8w: [
      { date: '2026-03-29', acwr_value: 1.2, acwr_zone: 'caution' },
      { date: '2026-03-30', acwr_value: 1.1, acwr_zone: 'caution' },
    ],
    readiness_history_8w: [75, 76],
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.confidence_pct).toBeLessThan(80)
})

test('9.3: Confidence always 0-100', () => {
  const input: InjuryPredictorInput = {
    athlete_id: 'a13',
    date: '2026-04-05',
    acwr_history_8w: Array.from({ length: 56 }, (_, i) => ({
      date: `2026-02-${8 + Math.floor(i / 2)}`,
      acwr_value: 1.2,
      acwr_zone: 'caution',
    })),
    readiness_history_8w: Array.from({ length: 56 }, () => 70),
    movement_strengths: [],
    body_asymmetries: {},
    previous_injuries: [],
  }
  const result = predictInjuryRisk(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #11 — Injury Predictor: All tests passed')
console.log('══════════════════════════════════════════════════\n')
