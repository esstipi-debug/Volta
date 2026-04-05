/**
 * ENGINE #12 — Coach Intelligence
 *
 * Sistema de leaderboards, alertas de equipo e insights de coaching
 *
 * Propósito: Ayudar al coach a gestionar atletas, detectar problemas y motivar
 * Output: Leaderboards + alerts + benchmarking + performance insights
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type AlertSeverity = 'info' | 'warning' | 'critical'
export type LeaderboardMetric = 'voltaje' | 'streak' | 'readiness_avg' | 'workout_count' | 'pr_count' | 'consistency'
export type AthleteStatus = 'optimal' | 'recovering' | 'fatigued' | 'injured' | 'missing'

const ALERT_THRESHOLDS = {
  MISSING_DAYS: 3, // Alert if 3+ days without workout
  LOW_READINESS_AVG: 40, // Alert if 7-day avg < 40
  HIGH_ACWR: 1.5, // Alert if ACWR > 1.5 for 3+ days
  INJURY_RISK: 50, // Alert if injury risk % > 50
  DECLINING_PERFORMANCE: 0.2, // 20% decline in metrics
}

const BENCHMARK_PERCENTILES = {
  P90: 0.9,
  P75: 0.75,
  P50: 0.5,
  P25: 0.25,
  P10: 0.1,
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface AthleteSnapshot {
  athlete_id: string
  name: string
  current_readiness: number // 0-100
  streak_days: number
  acwr_7d_avg: number
  last_workout_date: string
  injury_risk_pct: number
  voltaje_this_week: number
  voltaje_total: number
  pr_count_month: number
}

export interface CoachAlert {
  athlete_id: string
  athlete_name: string
  severity: AlertSeverity
  title: string
  description: string
  recommended_action: string
  triggered_at: string
}

export interface LeaderboardEntry {
  rank: number
  athlete_id: string
  athlete_name: string
  metric_value: number
  previous_rank?: number
  trend: 'up' | 'stable' | 'down'
  percentile: number
}

export interface TeamBenchmark {
  metric: string
  team_avg: number
  team_median: number
  team_std_dev: number
  p90: number
  p75: number
  p25: number
  p10: number
}

export interface CoachIntelligenceInput {
  coach_id: string
  team_id: string
  date: string
  athletes: AthleteSnapshot[]
  team_avg_readiness: number
  team_voltaje_weekly_target: number
  previous_leaderboards?: Record<LeaderboardMetric, LeaderboardEntry[]>
}

export interface CoachIntelligenceResult {
  active_alerts: CoachAlert[]
  alerts_by_severity: { info: number; warning: number; critical: number }

  leaderboards: Record<LeaderboardMetric, LeaderboardEntry[]>
  top_performers: AthleteSnapshot[]
  athletes_needing_support: AthleteSnapshot[]

  team_benchmarks: Record<string, TeamBenchmark>
  team_health_score: number // 0-100
  team_engagement_pct: number // % of athletes training regularly

  coaching_insights: string[]
  recommended_team_focus: string

  confidence_pct: number
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Genera alertas automáticas basadas en métricas del atleta
 */
export function generateAlerts(athletes: AthleteSnapshot[], date: string): CoachAlert[] {
  const alerts: CoachAlert[] = []

  for (const athlete of athletes) {
    // Missing days alert
    const daysSinceLast = Math.floor(
      (new Date(date).getTime() - new Date(athlete.last_workout_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceLast >= ALERT_THRESHOLDS.MISSING_DAYS) {
      alerts.push({
        athlete_id: athlete.athlete_id,
        athlete_name: athlete.name,
        severity: 'warning',
        title: `${athlete.name} hasn't trained in ${daysSinceLast} days`,
        description: `Last workout was on ${athlete.last_workout_date}. Check in to maintain momentum.`,
        recommended_action: 'Send motivational message and offer modification options',
        triggered_at: date,
      })
    }

    // Low readiness alert
    if (athlete.current_readiness < ALERT_THRESHOLDS.LOW_READINESS_AVG) {
      alerts.push({
        athlete_id: athlete.athlete_id,
        athlete_name: athlete.name,
        severity: 'warning',
        title: `${athlete.name} is fatigued (readiness ${athlete.current_readiness})`,
        description: 'Recovery score indicates significant fatigue. Consider reducing volume.',
        recommended_action: 'Offer active recovery, reduce intensity, prioritize sleep',
        triggered_at: date,
      })
    }

    // High ACWR alert
    if (athlete.acwr_7d_avg > ALERT_THRESHOLDS.HIGH_ACWR) {
      alerts.push({
        athlete_id: athlete.athlete_id,
        athlete_name: athlete.name,
        severity: 'critical',
        title: `${athlete.name} has elevated ACWR (${athlete.acwr_7d_avg.toFixed(2)})`,
        description: 'Training load is high relative to baseline. Injury risk is elevated.',
        recommended_action: 'Reduce intensity/volume, recommend deload, monitor closely',
        triggered_at: date,
      })
    }

    // Injury risk alert
    if (athlete.injury_risk_pct > ALERT_THRESHOLDS.INJURY_RISK) {
      alerts.push({
        athlete_id: athlete.athlete_id,
        athlete_name: athlete.name,
        severity: 'critical',
        title: `${athlete.name} is at high injury risk (${athlete.injury_risk_pct}%)`,
        description: 'Multiple risk factors detected. Immediate intervention recommended.',
        recommended_action: 'Schedule assessment, reduce load, implement prevention protocol',
        triggered_at: date,
      })
    }

    // Low consistency (missing PRs)
    if (athlete.pr_count_month === 0 && athlete.streak_days < 14) {
      alerts.push({
        athlete_id: athlete.athlete_id,
        athlete_name: athlete.name,
        severity: 'info',
        title: `${athlete.name} is in plateau phase`,
        description: 'No PRs this month + low streak. May need programming adjustment.',
        recommended_action: 'Review current block, consider new stimulus or skill focus',
        triggered_at: date,
      })
    }
  }

  return alerts
}

/**
 * Determina status del atleta
 */
export function determineAthleteStatus(snapshot: AthleteSnapshot, date: string): AthleteStatus {
  const daysSinceLast = Math.floor(
    (new Date(date).getTime() - new Date(snapshot.last_workout_date).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceLast >= 3) return 'missing'
  if (snapshot.injury_risk_pct > 50) return 'injured'
  if (snapshot.current_readiness < 40) return 'fatigued'
  if (snapshot.current_readiness < 60) return 'recovering'
  return 'optimal'
}

/**
 * Calcula leaderboard de una métrica
 */
export function calculateLeaderboard(
  athletes: AthleteSnapshot[],
  metric: LeaderboardMetric,
  previous?: LeaderboardEntry[]
): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = []

  // Sort athletes by metric
  const sorted = [...athletes].sort((a, b) => {
    const aValue = getMetricValue(a, metric)
    const bValue = getMetricValue(b, metric)
    return bValue - aValue
  })

  // Calculate percentiles
  const values = sorted.map(a => getMetricValue(a, metric))
  const p90 = values[Math.floor(values.length * 0.1)]
  const p75 = values[Math.floor(values.length * 0.25)]
  const p25 = values[Math.floor(values.length * 0.75)]
  const p10 = values[Math.floor(values.length * 0.9)]

  // Build entries
  sorted.forEach((athlete, idx) => {
    const value = getMetricValue(athlete, metric)
    const percentile = 100 - Math.floor((idx / sorted.length) * 100)

    const previousRank = previous?.findIndex(e => e.athlete_id === athlete.athlete_id) ?? -1
    const trend =
      previousRank === -1
        ? 'stable'
        : previousRank > idx
          ? 'up'
          : previousRank < idx
            ? 'down'
            : 'stable'

    entries.push({
      rank: idx + 1,
      athlete_id: athlete.athlete_id,
      athlete_name: athlete.name,
      metric_value: value,
      previous_rank: previousRank >= 0 ? previousRank + 1 : undefined,
      trend,
      percentile,
    })
  })

  return entries
}

/**
 * Extrae valor de métrica del snapshot
 */
function getMetricValue(snapshot: AthleteSnapshot, metric: LeaderboardMetric): number {
  switch (metric) {
    case 'voltaje':
      return snapshot.voltaje_this_week
    case 'streak':
      return snapshot.streak_days
    case 'readiness_avg':
      return snapshot.current_readiness
    case 'workout_count':
      return 0 // Would need additional data
    case 'pr_count':
      return snapshot.pr_count_month
    case 'consistency':
      return snapshot.streak_days > 0 ? snapshot.voltaje_this_week : 0
    default:
      return 0
  }
}

/**
 * Calcula benchmark del equipo
 */
export function calculateTeamBenchmark(athletes: AthleteSnapshot[], metric: LeaderboardMetric): TeamBenchmark {
  const values = athletes.map(a => getMetricValue(a, metric)).sort((a, b) => a - b)

  if (values.length === 0) {
    return { metric, team_avg: 0, team_median: 0, team_std_dev: 0, p90: 0, p75: 0, p25: 0, p10: 0 }
  }

  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  const median = values[Math.floor(values.length / 2)]
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length
  const std_dev = Math.sqrt(variance)

  return {
    metric,
    team_avg: Math.round(avg * 10) / 10,
    team_median: Math.round(median * 10) / 10,
    team_std_dev: Math.round(std_dev * 10) / 10,
    p90: values[Math.floor(values.length * 0.1)],
    p75: values[Math.floor(values.length * 0.25)],
    p25: values[Math.floor(values.length * 0.75)],
    p10: values[Math.floor(values.length * 0.9)],
  }
}

/**
 * Calcula team health score
 */
export function calculateTeamHealthScore(athletes: AthleteSnapshot[], date: string): number {
  let score = 100

  const athleteStatuses = athletes.map(a => determineAthleteStatus(a, date))

  // Deductions
  const missingCount = athleteStatuses.filter(s => s === 'missing').length
  const injuredCount = athleteStatuses.filter(s => s === 'injured').length
  const fatiguedCount = athleteStatuses.filter(s => s === 'fatigued').length

  score -= missingCount * 10
  score -= injuredCount * 15
  score -= fatiguedCount * 5

  // Bonus for optimal athletes
  const optimalCount = athleteStatuses.filter(s => s === 'optimal').length
  score += Math.floor((optimalCount / athletes.length) * 10)

  return Math.max(0, Math.min(100, score))
}

/**
 * Calcula engagement percentage
 */
export function calculateEngagementPct(athletes: AthleteSnapshot[], date: string): number {
  if (athletes.length === 0) return 0
  const engagedCount = athletes.filter(a => {
    const daysSinceLast = Math.floor(
      (new Date(date).getTime() - new Date(a.last_workout_date).getTime()) / (1000 * 60 * 60 * 24)
    )
    return daysSinceLast < 3
  }).length
  return Math.round((engagedCount / athletes.length) * 100)
}

/**
 * Main: Coach intelligence
 */
export function generateCoachIntelligence(input: CoachIntelligenceInput): CoachIntelligenceResult {
  const { athletes, date, team_voltaje_weekly_target } = input

  // Step 1: Generate alerts
  const active_alerts = generateAlerts(athletes, date)
  const alerts_by_severity = {
    info: active_alerts.filter(a => a.severity === 'info').length,
    warning: active_alerts.filter(a => a.severity === 'warning').length,
    critical: active_alerts.filter(a => a.severity === 'critical').length,
  }

  // Step 2: Generate leaderboards
  const leaderboards: Record<LeaderboardMetric, LeaderboardEntry[]> = {
    voltaje: calculateLeaderboard(athletes, 'voltaje', input.previous_leaderboards?.voltaje),
    streak: calculateLeaderboard(athletes, 'streak', input.previous_leaderboards?.streak),
    readiness_avg: calculateLeaderboard(athletes, 'readiness_avg', input.previous_leaderboards?.readiness_avg),
    workout_count: calculateLeaderboard(athletes, 'workout_count', input.previous_leaderboards?.workout_count),
    pr_count: calculateLeaderboard(athletes, 'pr_count', input.previous_leaderboards?.pr_count),
    consistency: calculateLeaderboard(athletes, 'consistency', input.previous_leaderboards?.consistency),
  }

  // Step 3: Identify top performers and needing support
  const top_performers = leaderboards.voltaje.slice(0, 3).map(e => athletes.find(a => a.athlete_id === e.athlete_id)!).filter(Boolean)

  const needing_support = athletes.filter(a => {
    const status = determineAthleteStatus(a, date)
    return status !== 'optimal'
  })

  // Step 4: Calculate benchmarks
  const team_benchmarks: Record<string, TeamBenchmark> = {
    voltaje: calculateTeamBenchmark(athletes, 'voltaje'),
    readiness: calculateTeamBenchmark(athletes, 'readiness_avg'),
    streak: calculateTeamBenchmark(athletes, 'streak'),
    pr_count: calculateTeamBenchmark(athletes, 'pr_count'),
  }

  // Step 5: Team health and engagement
  const team_health_score = calculateTeamHealthScore(athletes, date)
  const team_engagement_pct = calculateEngagementPct(athletes, date)

  // Step 6: Coaching insights
  const coaching_insights: string[] = []
  if (team_engagement_pct < 60) {
    coaching_insights.push('⚠️ Team engagement is low. Consider motivational event or team challenge.')
  }
  if (team_health_score < 60) {
    coaching_insights.push('🚨 Team health score is low. Review alert priorities and support fatigued athletes.')
  }
  if (needing_support.length > athletes.length * 0.4) {
    coaching_insights.push('📊 More than 40% of team needs support. Consider deload week or programming adjustment.')
  }

  const top_voltaje_athlete = leaderboards.voltaje[0]
  if (top_voltaje_athlete) {
    coaching_insights.push(`🏆 ${top_voltaje_athlete.athlete_name} is leading in voltaje (${top_voltaje_athlete.metric_value}). Use as motivation for team.`)
  }

  // Step 7: Recommended team focus
  let recommended_team_focus = 'Maintain current programming'
  if (team_health_score < 50) {
    recommended_team_focus = 'DELOAD WEEK recommended — focus on recovery'
  } else if (team_engagement_pct < 70) {
    recommended_team_focus = 'Increase team cohesion — run group challenges or competitions'
  } else if (alerts_by_severity.critical > 2) {
    recommended_team_focus = 'Individual support — tailor loads and monitor closely'
  }

  // Step 8: Confidence
  let confidence_pct = 80
  if (athletes.length >= 10) confidence_pct += 10
  if (alerts_by_severity.critical === 0) confidence_pct += 5
  confidence_pct = Math.min(confidence_pct, 95)

  return {
    active_alerts,
    alerts_by_severity,
    leaderboards,
    top_performers,
    athletes_needing_support: needing_support,
    team_benchmarks,
    team_health_score,
    team_engagement_pct,
    coaching_insights,
    recommended_team_focus,
    confidence_pct,
  }
}
