/**
 * ENGINE #09 — Gamification Engine
 *
 * Voltaje (points), racha (streak), badges, shields
 *
 * Propósito: Retención y motivación del atleta
 * - Voltaje: puntos ganados por sesión completada
 * - Racha: días consecutivos activos (se resetea si falta día)
 * - Badges: logros desbloqueados por hitos
 * - Shields: protegen racha si falta día (máx 1/mes)
 *
 * Output: Voltaje earned + racha status + badges + shield status
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type ReadinessColor = 'green' | 'blue' | 'yellow' | 'orange' | 'red'
export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary'

export const VOLTAJE_MULTIPLIERS = {
  BASE: 100,
  READINESS: {
    green: 1.5,
    blue: 1.2,
    yellow: 1.0,
    orange: 0.8,
    red: 0.5,
  },
  PR_BONUS: 200,
  WARMUP_BONUS: 10,
  STREAK_CAP: 2.0,
}

// Streak multiplier: day N = 1 + (N-1) × 0.1, capped at 2.0
export function calculateStreakMultiplier(day: number): number {
  const multiplier = 1 + (day - 1) * 0.1
  return Math.min(multiplier, VOLTAJE_MULTIPLIERS.STREAK_CAP)
}

// Badge definitions
export const BADGE_DEFINITIONS = {
  // Common (rarity = common)
  first_wod: {
    id: 'first_wod',
    name: 'First WOD',
    description: 'Completed your first workout',
    rarity: 'common' as BadgeRarity,
    trigger: 'session_completed',
    requirement: { total_sessions: 1 },
  },
  first_pr: {
    id: 'first_pr',
    name: 'Personal Record',
    description: 'Achieved your first PR',
    rarity: 'common' as BadgeRarity,
    trigger: 'pr_achieved',
    requirement: { pr_count: 1 },
  },
  streak_7: {
    id: 'streak_7',
    name: 'Week Strong',
    description: '7-day workout streak',
    rarity: 'common' as BadgeRarity,
    trigger: 'streak_milestone',
    requirement: { streak_days: 7 },
  },
  calories_1k: {
    id: 'calories_1k',
    name: 'Calorie Counter',
    description: 'Logged 1000+ calories in a day',
    rarity: 'common' as BadgeRarity,
    trigger: 'nutrition_milestone',
    requirement: { calories_logged_day: 1000 },
  },

  // Rare
  acwr_recovery: {
    id: 'acwr_recovery',
    name: 'Smart Recovery',
    description: 'Recovered from ACWR caution to optimal',
    rarity: 'rare' as BadgeRarity,
    trigger: 'acwr_recovery',
    requirement: { acwr_improvement: true },
  },
  menstrual_ovulation_pr: {
    id: 'menstrual_ovulation_pr',
    name: 'Peak Performance',
    description: 'PR during ovulation phase',
    rarity: 'rare' as BadgeRarity,
    trigger: 'pr_in_menstrual_phase',
    requirement: { phase: 2 },
  },
  racha_21: {
    id: 'racha_21',
    name: 'Three Weeks',
    description: '21-day streak maintained',
    rarity: 'rare' as BadgeRarity,
    trigger: 'streak_milestone',
    requirement: { streak_days: 21 },
  },

  // Epic
  sessions_100: {
    id: 'sessions_100',
    name: 'Century Athlete',
    description: 'Completed 100 workouts',
    rarity: 'epic' as BadgeRarity,
    trigger: 'session_milestone',
    requirement: { total_sessions: 100 },
  },
  triple_pr_week: {
    id: 'triple_pr_week',
    name: 'PR Week',
    description: '3 PRs in one week',
    rarity: 'epic' as BadgeRarity,
    trigger: 'multiple_pr_week',
    requirement: { pr_count_week: 3 },
  },
  perfect_adherence_month: {
    id: 'perfect_adherence_month',
    name: 'Nutrition Master',
    description: '30 days of perfect nutrition adherence',
    rarity: 'epic' as BadgeRarity,
    trigger: 'nutrition_perfect_month',
    requirement: { adherence_days_perfect: 30 },
  },

  // Legendary
  one_year_athlete: {
    id: 'one_year_athlete',
    name: '1 Year Strong',
    description: '1 year of consistent training',
    rarity: 'legendary' as BadgeRarity,
    trigger: 'anniversary',
    requirement: { days_since_start: 365 },
  },
  no_missed_day_6mo: {
    id: 'no_missed_day_6mo',
    name: 'Iron Discipline',
    description: '6 months without missing a day (with shields)',
    rarity: 'legendary' as BadgeRarity,
    trigger: 'long_streak',
    requirement: { streak_days: 180 },
  },
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface GamificationInput {
  athlete_id: string
  date: string
  session_completed: boolean
  readiness_color: ReadinessColor
  pr_achieved: boolean
  warmup_done?: boolean

  // For badge triggers
  total_sessions?: number
  streak_days?: number
  calories_logged_today?: number
  acwr_improved?: boolean
  menstrual_phase?: number
  pr_count_this_week?: number
  adherence_days_perfect_month?: number
  days_since_start?: number
  shields_used_this_month?: number

  // Previous state
  previous_streak?: number
  shields_available?: number
}

export interface Badge {
  id: string
  name: string
  description: string
  rarity: BadgeRarity
  earned_date?: string
}

export interface GamificationResult {
  voltaje_earned: number
  voltaje_breakdown: {
    base: number
    readiness_multiplier: number
    pr_bonus?: number
    warmup_bonus?: number
    streak_multiplier: number
    total_before_bonuses: number
  }

  racha_status: {
    streak_days: number
    streak_active: boolean
    previous_streak: number
  }

  badges_earned: Badge[]
  shield_consumed: boolean
  shields_remaining: number

  next_milestone_hint: string
  motivation_message: string
  confidence_pct: number
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Calcula voltaje base × multiplicador de readiness
 */
export function calculateBaseVoltage(readiness_color: ReadinessColor): number {
  const multiplier = VOLTAJE_MULTIPLIERS.READINESS[readiness_color]
  return Math.round(VOLTAJE_MULTIPLIERS.BASE * multiplier)
}

/**
 * Calcula voltaje total con todos los bonificadores
 */
export function calculateTotalVoltage(
  base_voltage: number,
  streak_days: number,
  pr_achieved: boolean,
  warmup_done: boolean = false
): number {
  let total = base_voltage

  // Streak multiplier
  const streak_mult = calculateStreakMultiplier(Math.max(1, streak_days))
  total = Math.round(total * streak_mult)

  // PR bonus (additive, not multiplicative)
  if (pr_achieved) {
    total += VOLTAJE_MULTIPLIERS.PR_BONUS
  }

  // Warmup bonus
  if (warmup_done) {
    total += VOLTAJE_MULTIPLIERS.WARMUP_BONUS
  }

  return total
}

/**
 * Determina badges ganadas basado en triggers
 */
function checkBadges(input: GamificationInput): Badge[] {
  const earned: Badge[] = []

  // First WOD
  if (input.total_sessions === 1 && input.session_completed) {
    earned.push({
      id: 'first_wod',
      name: BADGE_DEFINITIONS.first_wod.name,
      description: BADGE_DEFINITIONS.first_wod.description,
      rarity: 'common',
      earned_date: input.date,
    })
  }

  // First PR
  if (input.pr_achieved && (input.total_sessions ?? 0) <= 5) {
    earned.push({
      id: 'first_pr',
      name: BADGE_DEFINITIONS.first_pr.name,
      description: BADGE_DEFINITIONS.first_pr.description,
      rarity: 'common',
      earned_date: input.date,
    })
  }

  // Streak milestones (common)
  if (input.streak_days === 7) {
    earned.push({
      id: 'streak_7',
      name: BADGE_DEFINITIONS.streak_7.name,
      description: BADGE_DEFINITIONS.streak_7.description,
      rarity: 'common',
      earned_date: input.date,
    })
  }

  // Rare: 21-day streak
  if (input.streak_days === 21) {
    earned.push({
      id: 'racha_21',
      name: BADGE_DEFINITIONS.racha_21.name,
      description: BADGE_DEFINITIONS.racha_21.description,
      rarity: 'rare',
      earned_date: input.date,
    })
  }

  // Rare: ACWR recovery
  if (input.acwr_improved) {
    earned.push({
      id: 'acwr_recovery',
      name: BADGE_DEFINITIONS.acwr_recovery.name,
      description: BADGE_DEFINITIONS.acwr_recovery.description,
      rarity: 'rare',
      earned_date: input.date,
    })
  }

  // Epic: 100 sessions
  if (input.total_sessions === 100) {
    earned.push({
      id: 'sessions_100',
      name: BADGE_DEFINITIONS.sessions_100.name,
      description: BADGE_DEFINITIONS.sessions_100.description,
      rarity: 'epic',
      earned_date: input.date,
    })
  }

  // Epic: Triple PR week
  if ((input.pr_count_this_week ?? 0) === 3) {
    earned.push({
      id: 'triple_pr_week',
      name: BADGE_DEFINITIONS.triple_pr_week.name,
      description: BADGE_DEFINITIONS.triple_pr_week.description,
      rarity: 'epic',
      earned_date: input.date,
    })
  }

  // Legendary: 1 year
  if (input.days_since_start === 365) {
    earned.push({
      id: 'one_year_athlete',
      name: BADGE_DEFINITIONS.one_year_athlete.name,
      description: BADGE_DEFINITIONS.one_year_athlete.description,
      rarity: 'legendary',
      earned_date: input.date,
    })
  }

  return earned
}

/**
 * Main: Gamification calculation
 */
export function calculateGamification(input: GamificationInput): GamificationResult {
  // If session not completed, racha resets (unless shield used)
  let new_streak = input.session_completed
    ? (input.previous_streak ?? 0) + 1
    : 0

  let shield_consumed = false
  let shields_remaining = input.shields_available ?? 0

  // Shield logic: if streak would reset and athlete has shields, use one
  if (!input.session_completed && new_streak === 0 && shields_remaining > 0) {
    shield_consumed = true
    new_streak = input.previous_streak ?? 0 // Protect streak
    shields_remaining -= 1
  }

  // Step 1: Calculate base voltage
  const base_voltage = calculateBaseVoltage(input.readiness_color)

  // Step 2: Apply streak multiplier
  const streak_mult = calculateStreakMultiplier(new_streak)

  // Step 3: Calculate total voltage
  const total_voltage = calculateTotalVoltage(
    base_voltage,
    new_streak,
    input.pr_achieved,
    input.warmup_done ?? false
  )

  // Step 4: Check badge unlocks
  const badges_earned = input.session_completed
    ? checkBadges({ ...input, streak_days: new_streak })
    : []

  // Step 5: Generate milestone hints
  let next_milestone_hint = ''
  if (new_streak === 6) {
    next_milestone_hint = '1 more day to unlock "Week Strong" badge!'
  } else if (new_streak === 20) {
    next_milestone_hint = '1 more day for 21-day rare badge!'
  } else if ((input.total_sessions ?? 0) === 99) {
    next_milestone_hint = 'Unlock "Century Athlete" with one more session!'
  } else if (input.pr_achieved) {
    next_milestone_hint = 'Great PR! ' + (new_streak % 7 === 0 ? 'Plus, you have hit a 7-day milestone!' : '')
  } else {
    next_milestone_hint = `Maintain your ${new_streak}-day streak!`
  }

  // Step 6: Motivation message
  let motivation_message = ''
  if (!input.session_completed && !shield_consumed) {
    motivation_message = `Streak broken! Reset. Use a shield next time to protect it.`
  } else if (shield_consumed) {
    motivation_message = `Shield used! Your streak is protected. Keep it going!`
  } else if (input.pr_achieved) {
    motivation_message = `Amazing PR! Your ${new_streak}-day streak + bonus = ${total_voltage} voltaje!`
  } else if (new_streak % 7 === 0) {
    motivation_message = `Week milestone! Your commitment is showing. Keep grinding!`
  } else {
    motivation_message = `Session complete! +${total_voltage} voltaje. Streak: ${new_streak} days.`
  }

  // Confidence based on whether session was completed and streak is strong
  let confidence_pct = 75
  if (input.session_completed) confidence_pct = 90
  if (new_streak >= 14) confidence_pct = 95
  if (!input.session_completed && !shield_consumed) confidence_pct = 60

  return {
    voltaje_earned: input.session_completed ? total_voltage : 0,
    voltaje_breakdown: {
      base: base_voltage,
      readiness_multiplier: VOLTAJE_MULTIPLIERS.READINESS[input.readiness_color],
      pr_bonus: input.pr_achieved ? VOLTAJE_MULTIPLIERS.PR_BONUS : undefined,
      warmup_bonus: input.warmup_done ? VOLTAJE_MULTIPLIERS.WARMUP_BONUS : undefined,
      streak_multiplier: streak_mult,
      total_before_bonuses: Math.round(base_voltage * streak_mult),
    },

    racha_status: {
      streak_days: new_streak,
      streak_active: new_streak > 0,
      previous_streak: input.previous_streak ?? 0,
    },

    badges_earned,
    shield_consumed,
    shields_remaining,

    next_milestone_hint,
    motivation_message,
    confidence_pct,
  }
}
