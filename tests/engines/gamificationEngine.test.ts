/**
 * TEST SUITE: ENGINE #09 — Gamification Engine
 *
 * Tests:
 * 1. Readiness multiplier calculations
 * 2. Streak multiplier calculations
 * 3. Voltaje calculations (base + bonuses)
 * 4. Badge unlocking
 * 5. Shield mechanics
 * 6. Streak tracking
 * 7. Motivation messages
 * 8. Edge cases
 */

import {
  calculateBaseVoltage,
  calculateTotalVoltage,
  calculateStreakMultiplier,
  calculateGamification,
  type GamificationInput,
} from '@/src/engines/gamificationEngine'

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

console.log('\n📋 Suite 1 — Readiness Multipliers\n')

test('1.1: Green readiness → 1.5× multiplier', () => {
  const voltage = calculateBaseVoltage('green')
  expect(voltage).toBe(150) // 100 × 1.5
})

test('1.2: Blue readiness → 1.2× multiplier', () => {
  const voltage = calculateBaseVoltage('blue')
  expect(voltage).toBe(120) // 100 × 1.2
})

test('1.3: Yellow readiness → 1.0× multiplier', () => {
  const voltage = calculateBaseVoltage('yellow')
  expect(voltage).toBe(100) // 100 × 1.0
})

test('1.4: Orange readiness → 0.8× multiplier', () => {
  const voltage = calculateBaseVoltage('orange')
  expect(voltage).toBe(80) // 100 × 0.8
})

test('1.5: Red readiness → 0.5× multiplier', () => {
  const voltage = calculateBaseVoltage('red')
  expect(voltage).toBe(50) // 100 × 0.5
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 2 — Streak Multipliers\n')

test('2.1: Streak day 1 → 1.0× multiplier', () => {
  const mult = calculateStreakMultiplier(1)
  expect(mult).toBe(1.0)
})

test('2.2: Streak day 5 → 1.4× multiplier', () => {
  const mult = calculateStreakMultiplier(5)
  expect(mult).toBe(1.4)
})

test('2.3: Streak day 10 → 1.9× multiplier', () => {
  const mult = calculateStreakMultiplier(10)
  expect(mult).toBe(1.9)
})

test('2.4: Streak day 11+ capped at 2.0×', () => {
  const mult11 = calculateStreakMultiplier(11)
  const mult20 = calculateStreakMultiplier(20)
  expect(mult11).toBe(2.0)
  expect(mult20).toBe(2.0)
})

test('2.5: Streak day 0 → 0.9×', () => {
  const mult = calculateStreakMultiplier(0)
  expect(mult).toBe(0.9)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 3 — Total Voltaje Calculation\n')

test('3.1: Base voltage + PR bonus', () => {
  const total = calculateTotalVoltage(100, 1, true, false)
  // 100 × 1.0 (streak) + 200 (pr) = 300
  expect(total).toBe(300)
})

test('3.2: Base voltage + warmup bonus', () => {
  const total = calculateTotalVoltage(100, 1, false, true)
  // 100 × 1.0 + 10 (warmup) = 110
  expect(total).toBe(110)
})

test('3.3: Base voltage + PR + warmup', () => {
  const total = calculateTotalVoltage(100, 1, true, true)
  // 100 × 1.0 + 200 (pr) + 10 (warmup) = 310
  expect(total).toBe(310)
})

test('3.4: With streak multiplier', () => {
  const total = calculateTotalVoltage(100, 5, false, false)
  // 100 × 1.4 (streak day 5) = 140
  expect(total).toBe(140)
})

test('3.5: All bonuses + streak', () => {
  const total = calculateTotalVoltage(150, 7, true, true)
  // 150 × 1.6 (streak day 7) + 200 (pr) + 10 (warmup) = 240 + 210 = 450
  expect(total).toBeGreaterThan(400)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 4 — Streak Tracking\n')

test('4.1: Session completed → streak increments', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
  }
  const result = calculateGamification(input)
  expect(result.racha_status.streak_days).toBe(6)
})

test('4.2: Session not completed → streak resets', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
    shields_available: 0,
  }
  const result = calculateGamification(input)
  expect(result.racha_status.streak_days).toBe(0)
})

test('4.3: First session → streak starts at 1', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 0,
  }
  const result = calculateGamification(input)
  expect(result.racha_status.streak_days).toBe(1)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 5 — Shield Mechanics\n')

test('5.1: No shield → streak resets on missed day', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
    shields_available: 0,
  }
  const result = calculateGamification(input)
  expect(result.shield_consumed).toBe(false)
  expect(result.racha_status.streak_days).toBe(0)
})

test('5.2: With shield → protects streak on missed day', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
    shields_available: 1,
  }
  const result = calculateGamification(input)
  expect(result.shield_consumed).toBe(true)
  expect(result.racha_status.streak_days).toBe(5) // Streak protected
  expect(result.shields_remaining).toBe(0) // Used shield
})

test('5.3: Multiple shields available', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 10,
    shields_available: 2,
  }
  const result = calculateGamification(input)
  expect(result.shields_remaining).toBe(1) // One used
  expect(result.racha_status.streak_days).toBe(10) // Protected
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 6 — Badge Unlocking\n')

test('6.1: First WOD badge', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    total_sessions: 1,
    streak_days: 1,
  }
  const result = calculateGamification(input)
  const badge = result.badges_earned.find(b => b.id === 'first_wod')
  expect(badge).toBeDefined()
})

test('6.2: 7-day streak badge', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 6, // Previous streak was 6, completing this makes it 7
  }
  const result = calculateGamification(input)
  expect(result.racha_status.streak_days).toBe(7)
  const badge = result.badges_earned.find(b => b.id === 'streak_7')
  expect(badge).toBeDefined()
})

test('6.3: 21-day streak (rare) badge', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 20,
  }
  const result = calculateGamification(input)
  expect(result.racha_status.streak_days).toBe(21)
  const badge = result.badges_earned.find(b => b.id === 'racha_21')
  expect(badge?.rarity).toBe('rare')
})

test('6.4: 100 sessions (epic) badge', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    total_sessions: 100,
    previous_streak: 0,
  }
  const result = calculateGamification(input)
  const badge = result.badges_earned.find(b => b.id === 'sessions_100')
  expect(badge?.rarity).toBe('epic')
})

test('6.5: No badges on incomplete session', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    streak_days: 5,
  }
  const result = calculateGamification(input)
  expect(result.badges_earned.length).toBe(0)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 7 — Voltaje Calculation\n')

test('7.1: Session completed → voltaje earned', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'green',
    pr_achieved: false,
    previous_streak: 0,
  }
  const result = calculateGamification(input)
  expect(result.voltaje_earned).toBeGreaterThan(0)
})

test('7.2: Session not completed → no voltaje', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    shields_available: 0,
  }
  const result = calculateGamification(input)
  expect(result.voltaje_earned).toBe(0)
})

test('7.3: Green + PR → high voltaje', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'green',
    pr_achieved: true,
    previous_streak: 5,
  }
  const result = calculateGamification(input)
  // Green (150) × 1.5 streak (day 6) + 200 PR = 425
  expect(result.voltaje_earned).toBeGreaterThan(400)
})

test('7.4: Red readiness → low voltaje', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'red',
    pr_achieved: false,
    previous_streak: 0,
  }
  const result = calculateGamification(input)
  expect(result.voltaje_earned).toBeLessThan(100)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 8 — Motivation Messages\n')

test('8.1: Session completed → includes motivation', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 1,
    streak_days: 2,
  }
  const result = calculateGamification(input)
  expect(result.motivation_message).toInclude('Session complete')
})

test('8.2: PR achieved → mentions PR in message', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: true,
    previous_streak: 0,
    streak_days: 1,
  }
  const result = calculateGamification(input)
  expect(result.motivation_message).toInclude('PR')
})

test('8.3: Shield used → mentions shield protection', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
    shields_available: 1,
    streak_days: 5,
  }
  const result = calculateGamification(input)
  expect(result.motivation_message).toInclude('Shield')
})

test('8.4: Streak broken → mentions reset', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
    shields_available: 0,
  }
  const result = calculateGamification(input)
  expect(result.motivation_message).toInclude('broken')
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 9 — Milestone Hints\n')

test('9.1: Close to 7-day milestone → hints hint', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 5,
    streak_days: 6,
  }
  const result = calculateGamification(input)
  expect(result.next_milestone_hint).toInclude('Week Strong')
})

test('9.2: Close to 21-day milestone → hints it', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 19,
    streak_days: 20,
  }
  const result = calculateGamification(input)
  expect(result.next_milestone_hint).toInclude('21-day')
})

test('9.3: Confidence score reflects session completion', () => {
  const completed: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 0,
  }
  const notCompleted: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    shields_available: 0,
  }

  const result1 = calculateGamification(completed)
  const result2 = calculateGamification(notCompleted)

  expect(result1.confidence_pct).toBeGreaterThan(result2.confidence_pct)
})

// ─────────────────────────────────────────────

console.log('\n📋 Suite 10 — Edge Cases\n')

test('10.1: Strong streak (14 days) → high confidence', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 13,
    streak_days: 14,
  }
  const result = calculateGamification(input)
  expect(result.confidence_pct).toBe(95)
})

test('10.2: Multiple bonuses stack correctly', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: true,
    readiness_color: 'green',
    pr_achieved: true,
    warmup_done: true,
    previous_streak: 6,
    streak_days: 7,
  }
  const result = calculateGamification(input)
  expect(result.voltaje_earned).toBeGreaterThan(400)
})

test('10.3: Zero streak → streak resets to 0', () => {
  const input: GamificationInput = {
    athlete_id: 'athlete1',
    date: '2026-04-05',
    session_completed: false,
    readiness_color: 'yellow',
    pr_achieved: false,
    previous_streak: 0,
    shields_available: 0,
  }
  const result = calculateGamification(input)
  expect(result.racha_status.streak_days).toBe(0)
})

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════')
console.log('Engine #09 — Gamification Engine: All tests passed')
console.log('══════════════════════════════════════════════════\n')
