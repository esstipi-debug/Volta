/**
 * GET /api/engines/injury-risk?athlete_id=X&date=YYYY-MM-DD
 *
 * Serverless-optimized endpoint for injury risk prediction
 * - Parallel data fetching (database + cache)
 * - Caches results (8h TTL)
 * - Timeout: 60s (engine-level, see vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server'
import { predictInjuryRisk } from '@/src/engines/injuryPredictor'
import { getDb } from '@/src/lib/db-serverless'
import { getOrCompute, CACHE_TTL } from '@/src/lib/cache'
import type { CacheKey } from '@/src/lib/cache'

interface InjuryRiskResponse {
  athlete_id: string
  date: string
  injury_risk_pct: number
  risk_level: 'low' | 'moderate' | 'high'
  body_part_risks: Record<string, number>
  acwr_trend: 'improving' | 'stable' | 'declining'
  readiness_trend: 'improving' | 'stable' | 'declining'
  prevention_suggestions: string[]
  urgent_alerts: string[]
  confidence_pct: number
  source: 'cache' | 'computed'
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const athlete_id = searchParams.get('athlete_id')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!athlete_id) {
      return NextResponse.json({ error: 'Missing athlete_id' }, { status: 400 })
    }

    const cacheKey: CacheKey = `injury:${athlete_id}:${date}`
    const startTime = Date.now()

    // Compute with cache fallback
    const { value: result, source } = await getOrCompute(
      cacheKey,
      async () => {
        const db = getDb()

        // Parallel data fetching
        const [athlete, acwrHistory, readinessHistory, injuries] = await Promise.all([
          db.query.athletes.findFirst({
            where: (athletes, { eq }) => eq(athletes.id, athlete_id),
          }),
          // ACWR for last 28 days
          db.query.acwr_daily.findMany({
            where: (acwr, { eq, and, gte }) =>
              and(
                eq(acwr.athlete_id, athlete_id),
                gte(acwr.date, new Date(new Date(date).getTime() - 28 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0])
              ),
            orderBy: (acwr, { asc }) => asc(acwr.date),
          }),
          // Readiness for last 28 days
          db.query.readiness_daily.findMany({
            where: (readiness, { eq, and, gte }) =>
              and(
                eq(readiness.athlete_id, athlete_id),
                gte(readiness.date, new Date(new Date(date).getTime() - 28 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split('T')[0])
              ),
            orderBy: (readiness, { asc }) => asc(readiness.date),
          }),
          // Active injuries
          db.query.injuries.findMany({
            where: (inj, { eq, and }) =>
              and(eq(inj.athlete_id, athlete_id), eq(inj.status, 'active')),
          }),
        ])

        if (!athlete) {
          throw new Error(`Athlete ${athlete_id} not found`)
        }

        // Run injury predictor
        const prediction = predictInjuryRisk({
          athlete_id,
          date,
          acwr_history_7d: acwrHistory.slice(-7).map((a) => ({
            date: a.date,
            acwr_value: a.acwr_value || 0,
          })),
          readiness_history_7d: readinessHistory.slice(-7).map((r) => ({
            date: r.date,
            readiness_score: r.readiness_score || 50,
          })),
          active_injuries: injuries.map((i) => ({
            injury_type: i.injury_type || 'unknown',
            body_part: i.body_part || 'unknown',
            severity: i.severity as 'minor' | 'moderate' | 'severe',
            days_active: Math.floor(
              (new Date(date).getTime() - new Date(i.date_started || date).getTime()) / (24 * 60 * 60 * 1000)
            ),
          })),
        })

        return {
          athlete_id,
          date,
          injury_risk_pct: prediction.injury_risk_pct,
          risk_level: prediction.risk_level,
          body_part_risks: prediction.body_part_risks,
          acwr_trend: prediction.acwr_trend,
          readiness_trend: prediction.readiness_trend,
          prevention_suggestions: prediction.prevention_suggestions,
          urgent_alerts: prediction.urgent_alerts,
          confidence_pct: prediction.confidence_pct,
          source: 'computed' as const,
        }
      },
      CACHE_TTL.INJURY_RISK,
      8000 // 8s timeout
    )

    const elapsed = Date.now() - startTime

    return NextResponse.json(
      {
        ...result,
        computed_ms: elapsed,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=1800', // CDN cache 30min
          'X-Cache-Source': source,
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/engines/injury-risk] Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 'error',
      },
      { status: 500 }
    )
  }
}
