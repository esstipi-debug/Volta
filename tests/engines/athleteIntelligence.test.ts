import {
  synthesizeSignals,
  determineAthleteState,
  extractDailyActions,
  generateMotivationalInsight,
  generateAthleteIntelligence,
  type EngineSignal,
  type AthleteIntelligenceInput,
} from '../../src/engines/athleteIntelligence'

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

console.log('\n📋 Suite 1 — Signal Synthesis\n')

test('1.1: Synthesizes signals into consensus', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'SessionAdaptation',
      signal_type: 'action',
      priority: 'high',
      confidence: 85,
      message: 'Reduce intensity by 20%',
    },
    {
      engine_name: 'RecoveryOptimizer',
      signal_type: 'action',
      priority: 'high',
      confidence: 80,
      message: 'Increase sleep target to 9h',
    },
  ]
  const consensus = synthesizeSignals(signals)
  expect(Object.keys(consensus).length).toBeGreaterThan(0)
})

test('1.2: Consensus score reflects agreement strength', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'Engine1',
      signal_type: 'alert',
      priority: 'critical',
      confidence: 95,
      message: 'High injury risk',
    },
    {
      engine_name: 'Engine2',
      signal_type: 'alert',
      priority: 'critical',
      confidence: 90,
      message: 'High injury risk',
    },
  ]
  const consensus = synthesizeSignals(signals)
  expect(consensus['alert']).toBeGreaterThan(80)
})

test('1.3: Handles multiple signal types', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'SessionAdaptation',
      signal_type: 'action',
      priority: 'high',
      confidence: 85,
      message: 'Run session as written',
    },
    {
      engine_name: 'InjuryPredictor',
      signal_type: 'alert',
      priority: 'critical',
      confidence: 75,
      message: 'Shoulder at risk',
    },
    {
      engine_name: 'CoachIntelligence',
      signal_type: 'recommendation',
      priority: 'medium',
      confidence: 70,
      message: 'Good week, maintain pace',
    },
  ]
  const consensus = synthesizeSignals(signals)
  expect(Object.keys(consensus).length).toBe(3)
})

console.log('\n📋 Suite 2 — Athlete State Determination\n')

test('2.1: State = optimal with high confidence signals', () => {
  const signals: EngineSignal[] = Array.from({ length: 5 }, (_, i) => ({
    engine_name: `Engine${i}`,
    signal_type: 'recommendation',
    priority: 'low',
    confidence: 90,
    message: 'All good',
  }))
  const state = determineAthleteState(signals)
  expect(state).toBe('optimal')
})

test('2.2: State = concern with multiple critical signals', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'InjuryPredictor',
      signal_type: 'alert',
      priority: 'critical',
      confidence: 85,
      message: 'High injury risk',
    },
    {
      engine_name: 'RecoveryOptimizer',
      signal_type: 'alert',
      priority: 'critical',
      confidence: 80,
      message: 'Severe fatigue',
    },
  ]
  const state = determineAthleteState(signals)
  expect(state).toBe('concern')
})

test('2.3: State = caution with critical + high signals', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'InjuryPredictor',
      signal_type: 'alert',
      priority: 'critical',
      confidence: 80,
      message: 'Moderate injury risk',
    },
    {
      engine_name: 'SessionAdaptation',
      signal_type: 'alert',
      priority: 'high',
      confidence: 75,
      message: 'Reduce volume',
    },
    {
      engine_name: 'CoachIntelligence',
      signal_type: 'alert',
      priority: 'high',
      confidence: 70,
      message: 'Watch closely',
    },
  ]
  const state = determineAthleteState(signals)
  expect(state).toBe('caution')
})

test('2.4: State = good with mixed signals', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'SessionAdaptation',
      signal_type: 'action',
      priority: 'medium',
      confidence: 80,
      message: 'Normal session',
    },
    {
      engine_name: 'Gamification',
      signal_type: 'recommendation',
      priority: 'low',
      confidence: 75,
      message: 'Keep momentum',
    },
  ]
  const state = determineAthleteState(signals)
  expect(state).toBe('good')
})

console.log('\n📋 Suite 3 — Daily Action Extraction\n')

test('3.1: Extracts action signals above threshold', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'SessionAdaptation',
      signal_type: 'action',
      priority: 'high',
      confidence: 75,
      message: 'Reduce volume by 20%',
      data: { implementation: 'Do 3 fewer reps per set' },
    },
  ]
  const actions = extractDailyActions(signals, '2026-04-05')
  expect(actions.length).toBeGreaterThan(0)
})

test('3.2: Ignores low confidence signals', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'Engine1',
      signal_type: 'action',
      priority: 'low',
      confidence: 30,
      message: 'Maybe reduce something',
    },
  ]
  const actions = extractDailyActions(signals, '2026-04-05')
  expect(actions.length).toBe(0)
})

test('3.3: Merges similar actions from multiple engines', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'SessionAdaptation',
      signal_type: 'action',
      priority: 'high',
      confidence: 80,
      message: 'Prioritize sleep',
      data: { description: 'Rest is critical' },
    },
    {
      engine_name: 'RecoveryOptimizer',
      signal_type: 'action',
      priority: 'high',
      confidence: 85,
      message: 'Prioritize sleep',
      data: { description: 'Target 9 hours' },
    },
  ]
  const actions = extractDailyActions(signals, '2026-04-05')
  expect(actions.length).toBe(1) // Merged
  expect(actions[0].evidence_sources.length).toBe(2)
})

test('3.4: Sorts actions by priority', () => {
  const signals: EngineSignal[] = [
    {
      engine_name: 'E1',
      signal_type: 'action',
      priority: 'low',
      confidence: 75,
      message: 'Action A',
    },
    {
      engine_name: 'E2',
      signal_type: 'action',
      priority: 'critical',
      confidence: 75,
      message: 'Action B',
    },
  ]
  const actions = extractDailyActions(signals, '2026-04-05')
  expect(actions[0].priority).toBe('critical')
})

console.log('\n📋 Suite 4 — Motivational Insight\n')

test('4.1: Optimal state gets positive message', () => {
  const signals: EngineSignal[] = []
  const insight = generateMotivationalInsight(signals, 'optimal')
  expect(insight.length).toBeGreaterThan(0)
  expect(insight.includes('peak')).toBe(true)
})

test('4.2: Concern state gets recovery message', () => {
  const signals: EngineSignal[] = []
  const insight = generateMotivationalInsight(signals, 'concern')
  expect(insight.length).toBeGreaterThan(0)
  expect(insight.includes('recovery')).toBe(true)
})

console.log('\n📋 Suite 5 — Main Intelligence Function\n')

test('5.1: Generates complete daily dashboard', () => {
  const input: AthleteIntelligenceInput = {
    athlete_id: 'a1',
    date: '2026-04-05',
    engine_signals: [
      {
        engine_name: 'SessionAdaptation',
        signal_type: 'action',
        priority: 'high',
        confidence: 80,
        message: 'Run session as planned',
        data: { workout_type: 'Strength', duration: '60 min', focus: 'Lower body' },
      },
      {
        engine_name: 'RecoveryOptimizer',
        signal_type: 'recommendation',
        priority: 'medium',
        confidence: 75,
        message: 'Target 8 hours sleep',
        data: { readiness_score: 75 },
      },
      {
        engine_name: 'InjuryPredictor',
        signal_type: 'alert',
        priority: 'low',
        confidence: 60,
        message: 'Minor risk',
        data: { risk_pct: 15, acwr_value: 1.1 },
      },
    ],
  }
  const result = generateAthleteIntelligence(input)
  expect(result.daily_dashboard).not.toBe(undefined)
  expect(result.daily_dashboard.athlete_id).toBe('a1')
})

test('5.2: Includes todays session', () => {
  const input: AthleteIntelligenceInput = {
    athlete_id: 'a2',
    date: '2026-04-05',
    engine_signals: [
      {
        engine_name: 'SessionAdaptation',
        signal_type: 'action',
        priority: 'high',
        confidence: 85,
        message: 'Run metcon',
        data: { workout_type: 'Metcon', duration: '20 min', focus: 'Conditioning' },
      },
    ],
  }
  const result = generateAthleteIntelligence(input)
  expect(result.daily_dashboard.todays_session.workout_type).toBe('Metcon')
})

test('5.3: Includes critical alerts', () => {
  const input: AthleteIntelligenceInput = {
    athlete_id: 'a3',
    date: '2026-04-05',
    engine_signals: [
      {
        engine_name: 'InjuryPredictor',
        signal_type: 'alert',
        priority: 'critical',
        confidence: 85,
        message: 'Critical shoulder risk',
      },
    ],
  }
  const result = generateAthleteIntelligence(input)
  expect(result.daily_dashboard.critical_alerts.length).toBeGreaterThan(0)
})

test('5.4: Includes next 3 days preview', () => {
  const input: AthleteIntelligenceInput = {
    athlete_id: 'a4',
    date: '2026-04-05',
    engine_signals: [],
  }
  const result = generateAthleteIntelligence(input)
  expect(result.daily_dashboard.next_3_days_preview.length).toBe(3)
})

test('5.5: Extracts daily metrics', () => {
  const input: AthleteIntelligenceInput = {
    athlete_id: 'a5',
    date: '2026-04-05',
    engine_signals: [
      {
        engine_name: 'RecoveryOptimizer',
        signal_type: 'recommendation',
        priority: 'medium',
        confidence: 75,
        message: 'Sleep target 8h',
        data: { readiness_score: 85 },
      },
      {
        engine_name: 'InjuryPredictor',
        signal_type: 'alert',
        priority: 'low',
        confidence: 50,
        message: 'Low risk',
        data: { risk_pct: 10, acwr_value: 1.0 },
      },
    ],
  }
  const result = generateAthleteIntelligence(input)
  expect(result.daily_dashboard.daily_metrics.readiness).toBeGreaterThan(0)
  expect(result.daily_dashboard.daily_metrics.acwr).toBeGreaterThan(0)
})

test('5.6: Calculates overall confidence', () => {
  const input: AthleteIntelligenceInput = {
    athlete_id: 'a6',
    date: '2026-04-05',
    engine_signals: [
      {
        engine_name: 'Engine1',
        signal_type: 'action',
        priority: 'high',
        confidence: 85,
        message: 'Do something',
      },
      {
        engine_name: 'Engine2',
        signal_type: 'alert',
        priority: 'medium',
        confidence: 80,
        message: 'Watch this',
      },
    ],
  }
  const result = generateAthleteIntelligence(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #15 — Athlete Intelligence: All tests passed')
console.log('══════════════════════════════════════════════════\n')
