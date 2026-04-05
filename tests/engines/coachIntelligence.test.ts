import {
  generateAlerts,
  determineAthleteStatus,
  calculateLeaderboard,
  calculateTeamBenchmark,
  calculateTeamHealthScore,
  calculateEngagementPct,
  generateCoachIntelligence,
  type CoachIntelligenceInput,
  type AthleteSnapshot,
} from '../../src/engines/coachIntelligence'

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

console.log('\n📋 Suite 1 — Alert Generation\n')

test('1.1: Alert for missing days (3+)', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a1',
    name: 'John',
    current_readiness: 75,
    streak_days: 5,
    acwr_7d_avg: 1.2,
    last_workout_date: '2026-04-02',
    injury_risk_pct: 10,
    voltaje_this_week: 500,
    voltaje_total: 3000,
    pr_count_month: 1,
  }
  const alerts = generateAlerts([snapshot], '2026-04-05')
  const missingAlert = alerts.find(a => a.title.includes("hasn't trained"))
  expect(missingAlert).not.toBe(undefined)
  expect(missingAlert!.severity).toBe('warning')
})

test('1.2: Alert for low readiness', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a2',
    name: 'Jane',
    current_readiness: 35,
    streak_days: 3,
    acwr_7d_avg: 1.1,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 20,
    voltaje_this_week: 300,
    voltaje_total: 2000,
    pr_count_month: 0,
  }
  const alerts = generateAlerts([snapshot], '2026-04-05')
  const fatigueAlert = alerts.find(a => a.title.includes('fatigued'))
  expect(fatigueAlert).not.toBe(undefined)
})

test('1.3: Critical alert for high ACWR', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a3',
    name: 'Mike',
    current_readiness: 60,
    streak_days: 10,
    acwr_7d_avg: 1.6,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 25,
    voltaje_this_week: 600,
    voltaje_total: 4000,
    pr_count_month: 2,
  }
  const alerts = generateAlerts([snapshot], '2026-04-05')
  const acwrAlert = alerts.find(a => a.title.includes('elevated ACWR'))
  expect(acwrAlert).not.toBe(undefined)
  expect(acwrAlert!.severity).toBe('critical')
})

test('1.4: Critical alert for injury risk', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a4',
    name: 'Sarah',
    current_readiness: 45,
    streak_days: 7,
    acwr_7d_avg: 1.3,
    last_workout_date: '2026-04-03',
    injury_risk_pct: 65,
    voltaje_this_week: 450,
    voltaje_total: 3500,
    pr_count_month: 1,
  }
  const alerts = generateAlerts([snapshot], '2026-04-05')
  const injuryAlert = alerts.find(a => a.title.includes('injury risk'))
  expect(injuryAlert).not.toBe(undefined)
  expect(injuryAlert!.severity).toBe('critical')
})

test('1.5: No alert for healthy athlete', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a5',
    name: 'Tom',
    current_readiness: 85,
    streak_days: 20,
    acwr_7d_avg: 1.0,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 5,
    voltaje_this_week: 650,
    voltaje_total: 5000,
    pr_count_month: 3,
  }
  const alerts = generateAlerts([snapshot], '2026-04-05')
  expect(alerts.length).toBe(0)
})

console.log('\n📋 Suite 2 — Athlete Status Determination\n')

test('2.1: Status = missing (3+ days)', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a6',
    name: 'Lisa',
    current_readiness: 70,
    streak_days: 0,
    acwr_7d_avg: 1.1,
    last_workout_date: '2026-04-02',
    injury_risk_pct: 15,
    voltaje_this_week: 200,
    voltaje_total: 2500,
    pr_count_month: 0,
  }
  const status = determineAthleteStatus(snapshot, '2026-04-05')
  expect(status).toBe('missing')
})

test('2.2: Status = injured (high injury risk)', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a7',
    name: 'Chris',
    current_readiness: 50,
    streak_days: 8,
    acwr_7d_avg: 1.2,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 65,
    voltaje_this_week: 400,
    voltaje_total: 3000,
    pr_count_month: 1,
  }
  const status = determineAthleteStatus(snapshot, '2026-04-05')
  expect(status).toBe('injured')
})

test('2.3: Status = fatigued (low readiness)', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a8',
    name: 'Anna',
    current_readiness: 35,
    streak_days: 5,
    acwr_7d_avg: 1.1,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 20,
    voltaje_this_week: 350,
    voltaje_total: 2200,
    pr_count_month: 0,
  }
  const status = determineAthleteStatus(snapshot, '2026-04-05')
  expect(status).toBe('fatigued')
})

test('2.4: Status = optimal', () => {
  const snapshot: AthleteSnapshot = {
    athlete_id: 'a9',
    name: 'David',
    current_readiness: 80,
    streak_days: 15,
    acwr_7d_avg: 1.0,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 10,
    voltaje_this_week: 600,
    voltaje_total: 4500,
    pr_count_month: 2,
  }
  const status = determineAthleteStatus(snapshot, '2026-04-05')
  expect(status).toBe('optimal')
})

console.log('\n📋 Suite 3 — Leaderboards\n')

test('3.1: Voltaje leaderboard sorted correctly', () => {
  const athletes: AthleteSnapshot[] = [
    {
      athlete_id: 'a10',
      name: 'Alice',
      current_readiness: 70,
      streak_days: 5,
      acwr_7d_avg: 1.1,
      last_workout_date: '2026-04-04',
      injury_risk_pct: 15,
      voltaje_this_week: 400,
      voltaje_total: 3000,
      pr_count_month: 1,
    },
    {
      athlete_id: 'a11',
      name: 'Bob',
      current_readiness: 75,
      streak_days: 10,
      acwr_7d_avg: 1.0,
      last_workout_date: '2026-04-04',
      injury_risk_pct: 10,
      voltaje_this_week: 600,
      voltaje_total: 4000,
      pr_count_month: 2,
    },
  ]
  const leaderboard = calculateLeaderboard(athletes, 'voltaje')
  expect(leaderboard[0].athlete_name).toBe('Bob')
  expect(leaderboard[1].athlete_name).toBe('Alice')
})

test('3.2: Leaderboard includes rank and percentile', () => {
  const athletes: AthleteSnapshot[] = [
    {
      athlete_id: 'a12',
      name: 'Eve',
      current_readiness: 80,
      streak_days: 20,
      acwr_7d_avg: 1.0,
      last_workout_date: '2026-04-04',
      injury_risk_pct: 5,
      voltaje_this_week: 700,
      voltaje_total: 5000,
      pr_count_month: 3,
    },
  ]
  const leaderboard = calculateLeaderboard(athletes, 'voltaje')
  expect(leaderboard[0].rank).toBe(1)
  expect(leaderboard[0].percentile).toBeGreaterThan(0)
})

console.log('\n📋 Suite 4 — Team Benchmarks\n')

test('4.1: Benchmark calculates team average', () => {
  const athletes: AthleteSnapshot[] = Array.from({ length: 5 }, (_, i) => ({
    athlete_id: `a${i}`,
    name: `Athlete${i}`,
    current_readiness: 70 + i * 5,
    streak_days: 5 + i,
    acwr_7d_avg: 1.0 + i * 0.05,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 10 + i * 2,
    voltaje_this_week: 400 + i * 50,
    voltaje_total: 3000 + i * 300,
    pr_count_month: i,
  }))
  const benchmark = calculateTeamBenchmark(athletes, 'voltaje')
  expect(benchmark.team_avg).toBeGreaterThan(0)
})

test('4.2: Benchmark includes percentiles', () => {
  const athletes: AthleteSnapshot[] = Array.from({ length: 10 }, (_, i) => ({
    athlete_id: `a${i}`,
    name: `Athlete${i}`,
    current_readiness: 70,
    streak_days: 5,
    acwr_7d_avg: 1.0,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 10,
    voltaje_this_week: 300 + i * 50,
    voltaje_total: 3000,
    pr_count_month: 0,
  }))
  const benchmark = calculateTeamBenchmark(athletes, 'voltaje')
  expect(benchmark.p90).toBeGreaterThan(0)
  expect(benchmark.p75).toBeGreaterThan(0)
})

console.log('\n📋 Suite 5 — Team Health & Engagement\n')

test('5.1: Team health score 0-100', () => {
  const athletes: AthleteSnapshot[] = Array.from({ length: 5 }, (_, i) => ({
    athlete_id: `a${i}`,
    name: `Athlete${i}`,
    current_readiness: 75,
    streak_days: 10,
    acwr_7d_avg: 1.0,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 10,
    voltaje_this_week: 500,
    voltaje_total: 3500,
    pr_count_month: 1,
  }))
  const score = calculateTeamHealthScore(athletes, '2026-04-05')
  expect(score).toBeGreaterThanOrEqual(0)
  expect(score).toBeLessThanOrEqual(100)
})

test('5.2: Health score decreases with missing athletes', () => {
  const healthy: AthleteSnapshot[] = [
    {
      athlete_id: 'a1',
      name: 'Alice',
      current_readiness: 80,
      streak_days: 15,
      acwr_7d_avg: 1.0,
      last_workout_date: '2026-04-04',
      injury_risk_pct: 5,
      voltaje_this_week: 600,
      voltaje_total: 4000,
      pr_count_month: 2,
    },
  ]

  const missing: AthleteSnapshot[] = [
    {
      athlete_id: 'a2',
      name: 'Bob',
      current_readiness: 50,
      streak_days: 0,
      acwr_7d_avg: 0.8,
      last_workout_date: '2026-04-01',
      injury_risk_pct: 20,
      voltaje_this_week: 0,
      voltaje_total: 2000,
      pr_count_month: 0,
    },
  ]

  const healthyScore = calculateTeamHealthScore(healthy, '2026-04-05')
  const mixedScore = calculateTeamHealthScore([...healthy, ...missing], '2026-04-05')
  expect(mixedScore).toBeLessThan(healthyScore)
})

test('5.3: Engagement percentage 0-100', () => {
  const athletes: AthleteSnapshot[] = Array.from({ length: 3 }, (_, i) => ({
    athlete_id: `a${i}`,
    name: `Athlete${i}`,
    current_readiness: 70,
    streak_days: 5,
    acwr_7d_avg: 1.0,
    last_workout_date: '2026-04-04',
    injury_risk_pct: 10,
    voltaje_this_week: 400,
    voltaje_total: 3000,
    pr_count_month: 1,
  }))
  const engagement = calculateEngagementPct(athletes, '2026-04-05')
  expect(engagement).toBeGreaterThanOrEqual(0)
  expect(engagement).toBeLessThanOrEqual(100)
})

console.log('\n📋 Suite 6 — Coach Intelligence Main Function\n')

test('6.1: Generates alerts', () => {
  const input: CoachIntelligenceInput = {
    coach_id: 'coach1',
    team_id: 'team1',
    date: '2026-04-05',
    athletes: [
      {
        athlete_id: 'a1',
        name: 'John',
        current_readiness: 35,
        streak_days: 3,
        acwr_7d_avg: 1.1,
        last_workout_date: '2026-04-02',
        injury_risk_pct: 20,
        voltaje_this_week: 300,
        voltaje_total: 2000,
        pr_count_month: 0,
      },
    ],
    team_avg_readiness: 70,
    team_voltaje_weekly_target: 500,
  }
  const result = generateCoachIntelligence(input)
  expect(result.active_alerts.length).toBeGreaterThan(0)
})

test('6.2: Generates leaderboards', () => {
  const input: CoachIntelligenceInput = {
    coach_id: 'coach1',
    team_id: 'team1',
    date: '2026-04-05',
    athletes: [
      {
        athlete_id: 'a1',
        name: 'Alice',
        current_readiness: 80,
        streak_days: 15,
        acwr_7d_avg: 1.0,
        last_workout_date: '2026-04-04',
        injury_risk_pct: 5,
        voltaje_this_week: 600,
        voltaje_total: 4000,
        pr_count_month: 2,
      },
      {
        athlete_id: 'a2',
        name: 'Bob',
        current_readiness: 70,
        streak_days: 5,
        acwr_7d_avg: 1.1,
        last_workout_date: '2026-04-04',
        injury_risk_pct: 15,
        voltaje_this_week: 400,
        voltaje_total: 3000,
        pr_count_month: 1,
      },
    ],
    team_avg_readiness: 75,
    team_voltaje_weekly_target: 500,
  }
  const result = generateCoachIntelligence(input)
  expect(result.leaderboards.voltaje.length).toBe(2)
  expect(result.leaderboards.voltaje[0].athlete_name).toBe('Alice')
})

test('6.3: Identifies top performers', () => {
  const input: CoachIntelligenceInput = {
    coach_id: 'coach1',
    team_id: 'team1',
    date: '2026-04-05',
    athletes: [
      {
        athlete_id: 'a1',
        name: 'Star',
        current_readiness: 90,
        streak_days: 25,
        acwr_7d_avg: 0.9,
        last_workout_date: '2026-04-04',
        injury_risk_pct: 2,
        voltaje_this_week: 750,
        voltaje_total: 6000,
        pr_count_month: 4,
      },
    ],
    team_avg_readiness: 70,
    team_voltaje_weekly_target: 500,
  }
  const result = generateCoachIntelligence(input)
  expect(result.top_performers.length).toBeGreaterThan(0)
  expect(result.top_performers[0].name).toBe('Star')
})

test('6.4: Identifies athletes needing support', () => {
  const input: CoachIntelligenceInput = {
    coach_id: 'coach1',
    team_id: 'team1',
    date: '2026-04-05',
    athletes: [
      {
        athlete_id: 'a1',
        name: 'Struggling',
        current_readiness: 30,
        streak_days: 1,
        acwr_7d_avg: 1.2,
        last_workout_date: '2026-04-01',
        injury_risk_pct: 45,
        voltaje_this_week: 200,
        voltaje_total: 1500,
        pr_count_month: 0,
      },
    ],
    team_avg_readiness: 70,
    team_voltaje_weekly_target: 500,
  }
  const result = generateCoachIntelligence(input)
  expect(result.athletes_needing_support.length).toBeGreaterThan(0)
})

test('6.5: Team benchmarks included', () => {
  const input: CoachIntelligenceInput = {
    coach_id: 'coach1',
    team_id: 'team1',
    date: '2026-04-05',
    athletes: Array.from({ length: 5 }, (_, i) => ({
      athlete_id: `a${i}`,
      name: `Athlete${i}`,
      current_readiness: 70 + i * 5,
      streak_days: 5 + i,
      acwr_7d_avg: 1.0,
      last_workout_date: '2026-04-04',
      injury_risk_pct: 10,
      voltaje_this_week: 400 + i * 50,
      voltaje_total: 3000,
      pr_count_month: 0,
    })),
    team_avg_readiness: 75,
    team_voltaje_weekly_target: 500,
  }
  const result = generateCoachIntelligence(input)
  expect(result.team_benchmarks.voltaje).not.toBe(undefined)
  expect(result.team_benchmarks.readiness).not.toBe(undefined)
})

test('6.6: Confidence scoring 0-100', () => {
  const input: CoachIntelligenceInput = {
    coach_id: 'coach1',
    team_id: 'team1',
    date: '2026-04-05',
    athletes: Array.from({ length: 15 }, (_, i) => ({
      athlete_id: `a${i}`,
      name: `Athlete${i}`,
      current_readiness: 70,
      streak_days: 5,
      acwr_7d_avg: 1.0,
      last_workout_date: '2026-04-04',
      injury_risk_pct: 10,
      voltaje_this_week: 400,
      voltaje_total: 3000,
      pr_count_month: 1,
    })),
    team_avg_readiness: 70,
    team_voltaje_weekly_target: 500,
  }
  const result = generateCoachIntelligence(input)
  expect(result.confidence_pct).toBeGreaterThanOrEqual(0)
  expect(result.confidence_pct).toBeLessThanOrEqual(100)
})

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #12 — Coach Intelligence: All tests passed')
console.log('══════════════════════════════════════════════════\n')
