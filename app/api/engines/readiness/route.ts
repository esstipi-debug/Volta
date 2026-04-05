/**
 * GET /api/engines/readiness?athlete_id=X&date=YYYY-MM-DD
 *
 * Serverless-optimized endpoint for readiness calculation
 * - Cached reads (12h TTL)
 * - Falls back to computation if not cached
 * - Timeout: 60s (engine-level, see vercel.json)
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateIMR } from '@/src/engines/stressEngine'
import { calculateACWR } from '@/src/engines/acwrCalculator'
import { calculateReadiness } from '@/src/engines/readinessEngine'
import { getDb } from '@/src/lib/db-serverless'
import { getOrCompute, CACHE_TTL, getCached } from '@/src/lib/cache'
import type { CacheKey } from '@/src/lib/cache'

interface ReadinessResponse {
  athlete_id: string
  date: string
  readiness_score: number
  readiness_color: 'green' | 'blue' | 'yellow' | 'orange' | 'red'
  confidence_pct: number
  recommendations: string[]
  cached: boolean
  source: 'cache' | 'computed'
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Parse query params
    const { searchParams } = new URL(request.url)
    const athlete_id = searchParams.get('athlete_id')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!athlete_id) {
      return NextResponse.json({ error: 'Missing athlete_id' }, { status: 400 })
    }

    const cacheKey: CacheKey = `readiness:${athlete_id}:${date}`

    // 2. Try to get from cache first
    const cached = await getCached<ReadinessResponse>(cacheKey)
    if (cached) {
      return NextResponse.json({ ...cached, cached: true }, { status: 200 })
    }

    // 3. Cache miss - compute with timeout protection
    const startTime = Date.now()

    const { value: result, source } = await getOrCompute(
      cacheKey,
      async () => {
        const db = getDb()

        // Fetch athlete data
        const athlete = await db.query.athletes.findFirst({
          where: (athletes, { eq }) => eq(athletes.id, athlete_id),
        })

        if (!athlete) {
          throw new Error(`Athlete ${athlete_id} not found`)
        }

        // Fetch today's workout
        const workout = await db.query.workouts.findFirst({
          where: (workouts, { eq, and }) =>
            and(eq(workouts.athlete_id, athlete_id), eq(workouts.date, date)),
        })

        if (!workout) {
          return {
            athlete_id,
            date,
            readiness_score: 50,
            readiness_color: 'yellow' as const,
            confidence_pct: 40,
            recommendations: ['No workout recorded for this date'],
            cached: false,
            source: 'computed' as const,
          }
        }

        // Fetch last 28 days of ACWR data for trend
        const thirtyDaysAgo = new Date(new Date(date).getTime() - 28 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        const acwrHistory = await db.query.acwr_daily.findMany({
          where: (acwr, { eq, and, gte }) =>
            and(eq(acwr.athlete_id, athlete_id), gte(acwr.date, thirtyDaysAgo)),
        })

        // Fetch biometrics
        const biometrics = await db.query.biometrics.findFirst({
          where: (biom, { eq, and }) =>
            and(eq(biom.athlete_id, athlete_id), eq(biom.date, date)),
        })

        // Run calculation
        const imr = calculateIMR({
          workout_type: workout.workout_type,
          movements: workout.movements || [],
          srpe: workout.srpe || 5,
        })

        const acwr = acwrHistory.length > 0 ? acwrHistory[acwrHistory.length - 1] : null

        const readiness = calculateReadiness({
          date,
          athlete_id,
          imr: imr.imr_score,
          acwr_value: acwr?.acwr_value || 1.0,
          sleep_hours: biometrics?.sleep_hours || 7,
          stress_level: biometrics?.stress_level || 5,
          soreness_level: biometrics?.soreness_level || 3,
          menstrual_phase: athlete.menstrual_phase_tracking ? biometrics?.menstrual_phase : undefined,
        })

        return {
          athlete_id,
          date,
          readiness_score: readiness.readiness_score,
          readiness_color: readiness.readiness_color,
          confidence_pct: readiness.confidence_pct,
          recommendations: readiness.recommendations,
          cached: false,
          source: 'computed' as const,
        }
      },
      CACHE_TTL.READINESS,
      8000 // 8s timeout for computation
    )

    const elapsed = Date.now() - startTime

    // 4. Return with cache metadata
    return NextResponse.json(
      {
        ...result,
        cached: false,
        source,
        computed_ms: elapsed,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600', // CDN cache 1h
          'X-Cache-Source': source,
        },
      }
    )
  } catch (error) {
    console.error('[GET /api/engines/readiness] Error:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        status: 'error',
      },
      { status: 500 }
    )
  }
}
