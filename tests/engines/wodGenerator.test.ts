import {
  selectAvailableMovements,
  generateSingleWOD,
  calculateWorkoutDistribution,
  generateWODs,
  type WODGeneratorInput,
} from '../../src/engines/wodGenerator'

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

console.log('\n📋 Suite 1 — Movement Selection\n')

test('1.1: Selects movements for beginner', () => {
  const movements = selectAvailableMovements('beginner', ['barbell', 'gymnastics'], 6)
  expect(movements.length).toBeGreaterThan(0)
})

test('1.2: Selects movements for intermediate', () => {
  const movements = selectAvailableMovements('intermediate', ['barbell', 'kettlebell'], 6)
  expect(movements.length).toBeGreaterThan(0)
})

test('1.3: Respects equipment constraints', () => {
  const movements = selectAvailableMovements('beginner', ['cardio'], 6)
  // Should have cardio movements
  expect(movements.length).toBeGreaterThan(0)
})

test('1.4: Returns limited count', () => {
  const movements = selectAvailableMovements('intermediate', ['barbell', 'gymnastics', 'cardio'], 3)
  expect(movements.length).toBeLessThanOrEqual(3)
})

console.log('\n📋 Suite 2 — Single WOD Generation\n')

test('2.1: Generates WOD with basic structure', () => {
  const wod = generateSingleWOD(
    1,
    '2026-04-06',
    'strength',
    80,
    12,
    'intermediate',
    ['squat', 'bench_press', 'pull_up']
  )
  expect(wod.day).toBe(1)
  expect(wod.workout_type).toBe('strength')
  expect(wod.main_work.length).toBeGreaterThan(0)
})

test('2.2: Strength WOD has main work', () => {
  const wod = generateSingleWOD(1, '2026-04-06', 'strength', 75, 10, 'beginner', ['squat', 'press'])
  expect(wod.main_work.length).toBeGreaterThan(0)
  expect(wod.main_work[0].reps).toBe('5')
})

test('2.3: Metcon WOD has conditioning', () => {
  const wod = generateSingleWOD(2, '2026-04-07', 'metcon', 65, 15, 'intermediate', ['burpee', 'running', 'pull_up'])
  expect(wod.conditioning).not.toBe(undefined)
  expect(wod.conditioning!.length).toBeGreaterThan(0)
})

test('2.4: WOD difficulty matches athlete level', () => {
  const beginner_wod = generateSingleWOD(1, '2026-04-06', 'hybrid', 70, 12, 'beginner', ['squat'])
  expect(beginner_wod.difficulty_level).toBe('beginner')

  const advanced_wod = generateSingleWOD(1, '2026-04-06', 'hybrid', 85, 15, 'advanced', ['snatch'])
  expect(advanced_wod.difficulty_level).toBe('advanced')
})

test('2.5: WOD duration in reasonable range', () => {
  const wod = generateSingleWOD(1, '2026-04-06', 'strength', 80, 12, 'intermediate', ['squat'])
  expect(wod.duration_minutes).toBeGreaterThan(30)
  expect(wod.duration_minutes).toBeLessThan(120)
})

test('2.6: WOD includes scaling notes', () => {
  const wod = generateSingleWOD(1, '2026-04-06', 'metcon', 70, 10, 'beginner', ['burpee'])
  expect(wod.scaling_notes.length).toBeGreaterThan(0)
})

console.log('\n📋 Suite 3 — Workout Distribution\n')

test('3.1: Distributes workouts by goals', () => {
  const dist = calculateWorkoutDistribution(6, ['strength', 'conditioning'])
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  expect(total).toBeLessThanOrEqual(6)
})

test('3.2: Prioritizes strength goal', () => {
  const dist = calculateWorkoutDistribution(6, ['strength'])
  expect(dist.strength).toBeGreaterThan(0)
})

test('3.3: Prioritizes conditioning goal', () => {
  const dist = calculateWorkoutDistribution(6, ['conditioning'])
  expect(dist.metcon).toBeGreaterThan(0)
})

test('3.4: Fills remaining slots with hybrid', () => {
  const dist = calculateWorkoutDistribution(6, ['strength'])
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  expect(total).toBe(6)
})

console.log('\n📋 Suite 4 — Weekly WOD Plan\n')

test('4.1: Generates 5-WOD week', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 75,
    volume_target: 12,
    athlete_level: 'intermediate',
    available_equipment: ['barbell', 'gymnastics'],
    primary_goals: ['strength', 'conditioning'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.wods.length).toBe(5)
})

test('4.2: Generates 6-WOD week', () => {
  const input: WODGeneratorInput = {
    week: 2,
    training_phase: 'specific_prep',
    intensity_target: 85,
    volume_target: 14,
    athlete_level: 'advanced',
    available_equipment: ['barbell', 'kettlebell', 'gymnastics'],
    primary_goals: ['strength', 'power'],
    weekly_wods_count: 6,
  }
  const result = generateWODs(input)
  expect(result.wods.length).toBe(6)
})

test('4.3: Includes weekly plan metadata', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 70,
    volume_target: 10,
    athlete_level: 'beginner',
    available_equipment: ['barbell', 'gymnastics', 'cardio'],
    primary_goals: ['conditioning'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.weekly_plan.week).toBe(1)
  expect(result.weekly_plan.training_phase).toBe('general_prep')
  expect(result.weekly_plan.total_volume_sets).toBeGreaterThan(0)
})

test('4.4: Equipment utilization tracked', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 75,
    volume_target: 12,
    athlete_level: 'intermediate',
    available_equipment: ['barbell', 'gymnastics'],
    primary_goals: ['strength'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(Object.keys(result.equipment_utilization).length).toBeGreaterThan(0)
})

test('4.5: Includes coaching notes', () => {
  const input: WODGeneratorInput = {
    week: 2,
    training_phase: 'competition',
    intensity_target: 90,
    volume_target: 8,
    athlete_level: 'advanced',
    available_equipment: ['barbell', 'gymnastics'],
    primary_goals: ['strength', 'power'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.coaching_notes.length).toBeGreaterThan(0)
})

test('4.6: Includes scaling recommendations', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 70,
    volume_target: 12,
    athlete_level: 'beginner',
    available_equipment: ['barbell', 'gymnastics'],
    primary_goals: ['conditioning'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.scaling_recommendations.length).toBeGreaterThan(0)
  expect(result.scaling_recommendations.some(r => r.includes('Reduce'))).toBe(true)
})

console.log('\n📋 Suite 5 — Plan Quality Metrics\n')

test('5.1: Coherence with periodization 0-100', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 75,
    volume_target: 12,
    athlete_level: 'intermediate',
    available_equipment: ['barbell', 'gymnastics', 'cardio'],
    primary_goals: ['strength'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.coherence_with_periodization).toBeGreaterThanOrEqual(0)
  expect(result.coherence_with_periodization).toBeLessThanOrEqual(100)
})

test('5.2: Confidence score 0-100', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 75,
    volume_target: 12,
    athlete_level: 'intermediate',
    available_equipment: ['barbell', 'gymnastics', 'cardio'],
    primary_goals: ['strength', 'conditioning'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

test('5.3: Difficulty progression documented', () => {
  const input: WODGeneratorInput = {
    week: 1,
    training_phase: 'general_prep',
    intensity_target: 75,
    volume_target: 12,
    athlete_level: 'advanced',
    available_equipment: ['barbell', 'gymnastics'],
    primary_goals: ['power'],
    weekly_wods_count: 5,
  }
  const result = generateWODs(input)
  expect(result.difficulty_progression.length).toBe(5)
})

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #14 — WOD Generator: All tests passed')
console.log('══════════════════════════════════════════════════\n')
