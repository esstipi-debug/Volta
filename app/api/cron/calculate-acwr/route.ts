/**
 * POST /api/cron/calculate-acwr
 *
 * Vercel Cron Job (runs daily at 3 AM UTC)
 * - 900s timeout (15 minutes)
 * - Calculates ACWR for all active athletes
 * - Pre-computes and caches results for fast dashboard loads
 *
 * Configure in vercel.json:
 * ```json
 * {
 *   "crons": [{
 *     "path": "/api/cron/calculate-acwr",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { calculateACWR } from '@/src/engines/acwrCalculator'
import { calculateReadiness } from '@/src/engines/readinessEngine'
import { getDb } from '@/src/lib/db-serverless'
import { invalidateAthleteCache, setCached, CACHE_TTL } from '@/src/lib/cache'

interface CronResponse {
  status: 'success' | 'partial' | 'error'
  athletes_processed: number
  acwr_records_created: number
  readiness_records_created: number
  errors: Array<{ athlete_id: string; error: string }>
  runtime_ms: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // Verify cron secret (Vercel provides X-Vercel-Cron header)
    const cronSecret = request.headers.get('x-vercel-cron')
    if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
      console.warn('[Cron] Unauthorized request - invalid secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDb()
    const date = new Date().toISOString().split('T')[0]
    const errors: Array<{ athlete_id: string; error: string }> = []
    let athletesProcessed = 0
    let acwrRecordsCreated = 0
    let readinessRecordsCreated = 0

    // 1. Get all active athletes
    const athletes = await db.query.athletes.findMany({
      where: (athletes, { eq }) => eq(athletes.status, 'active'),
    })

    console.log(`[Cron] Processing ${athletes.length} athletes for date ${date}`)

    // 2. Process each athlete
    for (const athlete of athletes) {
      try {
        athletesProcessed++

        // Fetch 28-day history
        const thirtyDaysAgo = new Date(new Date(date).getTime() - 28 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

        const workouts = await db.query.workouts.findMany({
          where: (workouts, { eq, and, gte }) =>
            and(
              eq(workouts.athlete_id, athlete.id),
              gte(workouts.date, thirtyDaysAgo)
            ),
          orderBy: (workouts, { asc }) => asc(workouts.date),
        })

        // Calculate ACWR
        const imrValues = workouts.map((w) => ({
          date: w.date,
          imr: w.imr_score || 0,
        }))

        const acwrResult = calculateACWR({
          athlete_id: athlete.id,
          date,
          imr_history_7d: imrValues.slice(-7),
          imr_history_28d: imrValues,
        })

        // Save ACWR
        await db.insert({ acwr_daily: true }).values({
          athlete_id: athlete.id,
          date,
          acwr_value: acwrResult.acwr_value,
          acwr_zone: acwrResult.acwr_zone,
        })

        acwrRecordsCreated++

        // Calculate readiness for today
        const biometrics = await db.query.biometrics.findFirst({
          where: (biom, { eq, and }) =>
            and(eq(biom.athlete_id, athlete.id), eq(biom.date, date)),
        })

        const readinessResult = calculateReadiness({
          athlete_id: athlete.id,
          date,
          imr: workouts.length > 0 ? workouts[workouts.length - 1].imr_score || 0 : 0,
          acwr_value: acwrResult.acwr_value,
          sleep_hours: biometrics?.sleep_hours || 7,
          stress_level: biometrics?.stress_level || 5,
          soreness_level: biometrics?.soreness_level || 3,
          menstrual_phase: athlete.menstrual_phase_tracking ? biometrics?.menstrual_phase : undefined,
        })

        // Save readiness
        await db.insert({ readiness_daily: true }).values({
          athlete_id: athlete.id,
          date,
          readiness_score: readinessResult.readiness_score,
          readiness_color: readinessResult.readiness_color,
        })

        readinessRecordsCreated++

        // Cache the results
        await setCached(`acwr:${athlete.id}:${date}`, acwrResult, CACHE_TTL.ACWR)
        await setCached(`readiness:${athlete.id}:${date}`, readinessResult, CACHE_TTL.READINESS)

        // Invalidate related caches
        await invalidateAthleteCache(athlete.id)
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error(`[Cron] Error processing athlete ${athlete.id}:`, errorMsg)
        errors.push({
          athlete_id: athlete.id,
          error: errorMsg,
        })
      }
    }

    const runtime = Date.now() - startTime
    const status = errors.length === 0 ? 'success' : errors.length < athletes.length ? 'partial' : 'error'

    console.log(`[Cron] Completed in ${runtime}ms - ${athletesProcessed}/${athletes.length} athletes processed`)

    return NextResponse.json({
      status,
      athletes_processed: athletesProcessed,
      acwr_records_created: acwrRecordsCreated,
      readiness_records_created: readinessRecordsCreated,
      errors,
      runtime_ms: runtime,
    })
  } catch (error) {
    const runtime = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    console.error('[Cron] Fatal error:', errorMsg)

    return NextResponse.json(
      {
        status: 'error',
        error: errorMsg,
        runtime_ms: runtime,
      },
      { status: 500 }
    )
  }
}
