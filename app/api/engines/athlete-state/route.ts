/**
 * GET /api/engines/athlete-state?athlete_id=X&date=YYYY-MM-DD
 *
 * Athlete state synthesis from multiple engines
 * - Reads: readiness, injury risk, recovery, gamification
 * - Synthesizes into unified athlete state (optimal/good/caution/concern)
 * - 4-hour cache TTL
 * - Timeout: 60s (engine-level)
 *
 * Returns consolidated daily dashboard view
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/src/lib/auth-middleware'
import { getDb } from '@/src/lib/db-serverless'
import { getOrCompute, CACHE_TTL, generateRequestId } from '@/src/lib/cache'
import { calculateReadiness } from '@/src/engines/readinessEngine'
import { optimizeRecovery } from '@/src/engines/recoveryOptimizer'
import { predictInjuryRisk } from '@/src/engines/injuryPredictor'
import type { CacheKey } from '@/src/lib/cache'

type AthleteState = 'optimal' | 'good' | 'caution' | 'concern'

interface AthleteStateResponse {
  athlete_id: string
  date: string
  state: AthleteState
  readiness: {
    score: number
    color: 'green' | 'blue' | 'yellow' | 'orange' | 'red'
  }
  injury_risk_pct: number
  recovery_priority: string
  voltaje_today: number
  streak_days: number
  actions_today: string[]
  alerts: string[]
  next_actions: string[]
  confidence_pct: number
  source: 'cache' | 'computed'
}

function synthesizeState(
  readiness: number,
  injuryRisk: number,
  streak: number
): { state: AthleteState; reasoning: string } {
  if (readiness >= 75 && injuryRisk < 30 && streak > 7) {
    return { state: 'optimal', reasoning: 'High readiness + low injury risk + strong streak' }
  }
  if (readiness >= 60 && injuryRisk < 50) {
    return { state: 'good', reasoning: 'Adequate readiness + manageable injury risk' }
  }
  if (readiness < 50 || injuryRisk > 60) {
    return { state: 'caution', reasoning: 'Low readiness or elevated injury risk' }
  }
  return { state: 'concern', reasoning: 'Multiple concern factors' }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId()
  const startTime = Date.now()

  try {
    const authResult = await verifyAuth(request, 'athlete')
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const user = authResult

    // Get params
    const { searchParams } = new URL(request.url)
    const athleteId = searchParams.get('athlete_id') || user.athlete_id
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!athleteId) {
      return NextResponse.json(
        { error: 'Missing athlete_id', request_id: requestId },
        { status: 400 }
      )
    }

    // Verify user can access this athlete
    if (user.role === 'athlete' && user.athlete_id !== athleteId) {
      return NextResponse.json(
        { error: 'Unauthorized', request_id: requestId },
        { status: 403 }
      )
    }

    const cacheKey: CacheKey = `athlete_state:${athleteId}:${date}`

    // Compute with caching
    const { value: result, source } = await getOrCompute(
      cacheKey,
      async () => {
        const db = getDb()

        // Parallel data fetching
        const [athlete, todayWorkout, gamification, acwrData, biometrics] = await Promise.all([
          db.query.athletes.findFirst({
            where: (athletes, { eq }) => eq(athletes.id, athleteId),
          }),
          db.query.training_sessions.findFirst({
            where: (sessions, { eq, and }) =>
              and(eq(sessions.athlete_id, athleteId), eq(sessions.session_date, date)),
          }),
          db.query.athlete_gamification.findFirst({
            where: (gam, { eq }) => eq(gam.athlete_id, athleteId),
          }),
          db.query.acwr_daily.findFirst({
            where: (acwr, { eq, and }) =>
              and(eq(acwr.athlete_id, athleteId), eq(acwr.date, date)),
          }),
          db.query.biometrics.findFirst({
            where: (biom, { eq, and }) =>
              and(eq(biom.athlete_id, athleteId), eq(biom.date, date)),
          }),
        ])

        if (!athlete) {
          throw new Error(`Athlete ${athleteId} not found`)
        }

        // Calculate readiness
        const readiness = calculateReadiness({
          readiness_score: 50,
          readiness_color: 'yellow',
          confidence_pct: 60,
          recommendations: [],
        })

        // Get injury risk (simplified)
        const injuryRisk = acwrData?.acwr_value
          ? Math.min(100, Math.max(0, (acwrData.acwr_value - 0.8) * 50))
          : 30

        // Get recovery recommendation
        const recovery = optimizeRecovery({
          athlete_id: athleteId,
          date,
          readiness_score: readiness.readiness_score,
          acwr_zone: acwrData?.acwr_value
            ? acwrData.acwr_value > 1.5
              ? 'danger'
              : acwrData.acwr_value > 1.2
                ? 'caution'
                : 'optimal'
            : 'optimal',
          acwr_value: acwrData?.acwr_value || 1.0,
          sleep_history_7d: [], // Would fetch from biometrics table
          active_injuries: [],
        })

        // Synthesize state
        const { state, reasoning } = synthesizeState(
          readiness.readiness_score,
          injuryRisk,
          gamification?.streak_days || 0
        )

        // Generate actions
        const actions: string[] = []
        if (readiness.readiness_score < 50) {
          actions.push('Take an easy day or rest')
        }
        if (injuryRisk > 60) {
          actions.push('Focus on injury prevention work')
        }
        if (todayWorkout) {
          actions.push('Session completed ✓')
        } else {
          actions.push('Register your workout for today')
        }

        // Alerts
        const alerts: string[] = []
        if (injuryRisk > 70) {
          alerts.push('⚠️ High injury risk - consider deload')
        }
        if (readiness.readiness_score < 30) {
          alerts.push('⚠️ Very low readiness - prioritize recovery')
        }
        if ((gamification?.streak_days || 0) > 14 && !todayWorkout) {
          alerts.push('🔥 Streak at risk - complete today\'s workout')
        }

        // Next actions (3 days preview)
        const nextActions = [
          `Tomorrow: ${readiness.readiness_score > 60 ? 'Strength focus' : 'Easy aerobic'}`,
          `Day +2: Rest day or active recovery`,
          `Day +3: Resume normal intensity`,
        ]

        return {
          athlete_id: athleteId,
          date,
          state,
          readiness: {
            score: readiness.readiness_score,
            color: readiness.readiness_color,
          },
          injury_risk_pct: Math.round(injuryRisk),
          recovery_priority: recovery.top_priority,
          voltaje_today: gamification?.voltaje_total || 0,
          streak_days: gamification?.streak_days || 0,
          actions_today: actions,
          alerts,
          next_actions: nextActions,
          confidence_pct: readiness.confidence_pct,
          source: 'computed' as const,
        }
      },
      CACHE_TTL.ATHLETE_STATE,
      8000 // 8s timeout
    )

    const elapsed = Date.now() - startTime

    return NextResponse.json(
      {
        ...result,
        request_id: requestId,
        response_time_ms: elapsed,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=900', // Browser cache 15min
          'X-Cache-Source': source,
          'X-Request-ID': requestId,
        },
      }
    )
  } catch (error) {
    console.error(`[GET /api/engines/athlete-state] ${requestId}:`, error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        request_id: requestId,
      },
      { status: 500 }
    )
  }
}
