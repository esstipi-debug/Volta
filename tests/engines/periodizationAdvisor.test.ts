import {
  buildMacrocycle,
  calculateIntensityProgression,
  calculateDeloadWeeks,
  estimatePRPotential,
  advisePeriodization,
  type PeriodizationAdvisorInput,
  type AthleteProfile,
} from '../../src/engines/periodizationAdvisor'

// ─────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────

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

console.log('\n📋 Suite 1 — Macrocycle Building\n')

test('1.1: Linear model creates 3 blocks', () => {
  const blocks = buildMacrocycle('linear', 12, ['strength'])
  expect(blocks.length).toBe(3)
})

test('1.2: Linear model structure (general → specific → comp)', () => {
  const blocks = buildMacrocycle('linear', 12, ['strength'])
  expect(blocks[0].phase).toBe('general_prep')
  expect(blocks[1].phase).toBe('specific_prep')
  expect(blocks[2].phase).toBe('competition')
})

test('1.3: Undulating model creates 2 blocks', () => {
  const blocks = buildMacrocycle('undulating', 12, ['hypertrophy'])
  expect(blocks.length).toBe(2)
})

test('1.4: Block model creates 3 phases', () => {
  const blocks = buildMacrocycle('block', 12, ['power'])
  expect(blocks.length).toBe(3)
})

test('1.5: Macrocycle blocks sum to approximately target duration', () => {
  const target = 12
  const blocks = buildMacrocycle('linear', target, ['strength'])
  const total_weeks = blocks.reduce((sum, b) => sum + b.duration_weeks, 0)
  expect(total_weeks).toBeLessThanOrEqual(target + 1)
})

test('1.6: Linear model intensity increases', () => {
  const blocks = buildMacrocycle('linear', 12, ['strength'])
  expect(blocks[0].intensity_zones.max).toBeLessThan(blocks[1].intensity_zones.max)
  expect(blocks[1].intensity_zones.max).toBeLessThan(blocks[2].intensity_zones.max)
})

console.log('\n📋 Suite 2 — Intensity Progression\n')

test('2.1: Linear progression increases consistently', () => {
  const progression = calculateIntensityProgression('linear', 12, 65, 90)
  expect(progression.length).toBe(12)
  expect(progression[0]).toBeLessThan(progression[5])
  expect(progression[5]).toBeLessThan(progression[11])
})

test('2.2: Undulating progression varies weekly', () => {
  const progression = calculateIntensityProgression('undulating', 12, 65, 90)
  expect(progression.length).toBe(12)
  // Should have ups and downs
  let has_variation = false
  for (let i = 1; i < progression.length; i++) {
    if (progression[i] !== progression[i - 1]) {
      has_variation = true
      break
    }
  }
  expect(has_variation).toBe(true)
})

test('2.3: Block progression steps through phases', () => {
  const progression = calculateIntensityProgression('block', 12, 65, 90)
  expect(progression.length).toBe(12)
  expect(progression[0]).toBeLessThan(progression[11])
})

test('2.4: Progression respects start/end bounds', () => {
  const progression = calculateIntensityProgression('linear', 8, 60, 85)
  expect(progression[0]).toBeGreaterThanOrEqual(60)
  expect(progression[progression.length - 1]).toBeLessThanOrEqual(85)
})

console.log('\n📋 Suite 3 — Deload Scheduling\n')

test('3.1: Deload weeks calculated every 4 weeks', () => {
  const deload = calculateDeloadWeeks(12)
  expect(deload.length).toBeGreaterThan(0)
  expect(deload[0]).toBe(4)
})

test('3.2: Multiple deload weeks in long cycle', () => {
  const deload = calculateDeloadWeeks(16)
  expect(deload.length).toBeGreaterThanOrEqual(3)
})

test('3.3: No deload weeks in short cycle', () => {
  const deload = calculateDeloadWeeks(3)
  expect(deload.length).toBe(0)
})

test('3.4: Deload weeks are spaced 4 apart', () => {
  const deload = calculateDeloadWeeks(16)
  for (let i = 1; i < deload.length; i++) {
    expect(deload[i] - deload[i - 1]).toBe(4)
  }
})

console.log('\n📋 Suite 4 — PR Potential\n')

test('4.1: PR potential is 0-100', () => {
  const potential = estimatePRPotential('linear', 2)
  expect(potential).toBeGreaterThanOrEqual(0)
  expect(potential).toBeLessThanOrEqual(100)
})

test('4.2: Novices adapt faster (higher PR potential)', () => {
  const year_1 = estimatePRPotential('linear', 1)
  const year_3 = estimatePRPotential('linear', 3)
  expect(year_1).toBeGreaterThan(year_3) // Beginners adapt faster
})

test('4.3: Linear model favors PR potential', () => {
  const linear = estimatePRPotential('linear', 3)
  const undulating = estimatePRPotential('undulating', 3)
  expect(linear).toBeGreaterThanOrEqual(undulating)
})

test('4.4: Clean previous block boosts potential', () => {
  const no_history = estimatePRPotential('linear', 3)
  const clean_history = estimatePRPotential('linear', 3, {
    phase: 'competition',
    pr_count: 3,
    injury_events: 0,
  })
  expect(clean_history).toBeGreaterThan(no_history)
})

console.log('\n📋 Suite 5 — Main Periodization Function\n')

test('5.1: Returns complete periodization plan', () => {
  const athlete: AthleteProfile = {
    athlete_id: 'a1',
    training_age_years: 3,
    primary_goal: 'strength',
    recent_max_lifts: { squat: 300, bench: 200, deadlift: 350 },
    injury_history: [],
    available_training_days: 4,
  }
  const input: PeriodizationAdvisorInput = {
    athlete,
    periodization_model: 'linear',
    macrocycle_duration_weeks: 12,
    primary_goals: ['strength'],
  }
  const result = advisePeriodization(input)
  expect(result.macrocycle_blocks.length).toBeGreaterThan(0)
  expect(result.weekly_plans.length).toBe(12)
  expect(result.intensity_progression.length).toBe(12)
})

test('5.2: Generates weekly plans for each week', () => {
  const athlete: AthleteProfile = {
    athlete_id: 'a2',
    training_age_years: 2,
    primary_goal: 'hypertrophy',
    recent_max_lifts: { squat: 250, bench: 180 },
    injury_history: [],
    available_training_days: 3,
  }
  const input: PeriodizationAdvisorInput = {
    athlete,
    periodization_model: 'block',
    macrocycle_duration_weeks: 8,
    primary_goals: ['hypertrophy'],
  }
  const result = advisePeriodization(input)
  expect(result.weekly_plans.length).toBe(8)
  result.weekly_plans.forEach(plan => {
    expect(plan.weekly_schedule.length).toBe(3) // 3 training days
  })
})

test('5.3: Identifies deload weeks in plan', () => {
  const athlete: AthleteProfile = {
    athlete_id: 'a3',
    training_age_years: 4,
    primary_goal: 'strength',
    recent_max_lifts: { squat: 350, bench: 250 },
    injury_history: [],
    available_training_days: 4,
  }
  const input: PeriodizationAdvisorInput = {
    athlete,
    periodization_model: 'linear',
    macrocycle_duration_weeks: 12,
    primary_goals: ['strength'],
  }
  const result = advisePeriodization(input)
  const deload_weeks = result.weekly_plans.filter(p => p.deload_week).length
  expect(deload_weeks).toBeGreaterThan(0)
})

test('5.4: Provides key focal points based on goals', () => {
  const athlete: AthleteProfile = {
    athlete_id: 'a4',
    training_age_years: 2,
    primary_goal: 'power',
    recent_max_lifts: { clean: 200 },
    injury_history: [],
    available_training_days: 5,
  }
  const input: PeriodizationAdvisorInput = {
    athlete,
    periodization_model: 'undulating',
    macrocycle_duration_weeks: 10,
    primary_goals: ['power', 'speed'],
  }
  const result = advisePeriodization(input)
  expect(result.key_focal_points.length).toBeGreaterThan(0)
})

test('5.5: Includes injury risk mitigation', () => {
  const athlete: AthleteProfile = {
    athlete_id: 'a5',
    training_age_years: 1,
    primary_goal: 'hypertrophy',
    recent_max_lifts: { squat: 200 },
    injury_history: ['lower_back'],
    available_training_days: 3,
  }
  const input: PeriodizationAdvisorInput = {
    athlete,
    periodization_model: 'linear',
    macrocycle_duration_weeks: 12,
    primary_goals: ['hypertrophy'],
  }
  const result = advisePeriodization(input)
  expect(result.injury_risk_mitigation.length).toBeGreaterThan(0)
  expect(result.adaptation_recommendations.some(r => r.includes('prehab'))).toBe(true)
})

test('5.6: Confidence score 0-100', () => {
  const athlete: AthleteProfile = {
    athlete_id: 'a6',
    training_age_years: 3,
    primary_goal: 'strength',
    recent_max_lifts: { squat: 300 },
    injury_history: [],
    available_training_days: 4,
  }
  const input: PeriodizationAdvisorInput = {
    athlete,
    periodization_model: 'linear',
    macrocycle_duration_weeks: 12,
    primary_goals: ['strength'],
    previous_block_performance: { phase: 'competition', pr_count: 2, injury_events: 0 },
  }
  const result = advisePeriodization(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #13 — Periodization Advisor: All tests passed')
console.log('══════════════════════════════════════════════════\n')
