/**
 * POST /api/engines/session/adaptation
 *
 * Recomienda adaptaciones de WOD basado en readiness + ACWR
 *
 * Request:
 * {
 *   "athlete_id": "uuid",
 *   "date": "2026-04-05",
 *   "readiness_score": 35,
 *   "acwr_zone": "caution",
 *   "acwr_value": 1.25,
 *   "scheduled_wod": {
 *     "id": "wod-1",
 *     "title": "Heavy Snatch Day",
 *     "movements": [
 *       { "name": "Snatch", "cns_cost": 9, "is_heavy_lift": true },
 *       { "name": "Front Squat", "cns_cost": 7, "is_heavy_lift": true }
 *     ],
 *     "estimated_duration_min": 60,
 *     "intensity_rating": 8,
 *     "volume_reps": 180
 *   },
 *   "acwr_history_7d": [
 *     { "date": "2026-04-03", "zone": "caution" },
 *     { "date": "2026-04-04", "zone": "caution" },
 *     { "date": "2026-04-05", "zone": "caution" }
 *   ]
 * }
 *
 * Response:
 * {
 *   "recommended_action": "reduce_intensity",
 *   "readiness_level": "orange",
 *   "intensity_reduction_pct": 25,
 *   "volume_reduction_pct": 20,
 *   "movement_substitutions": [],
 *   "timing_suggestion": "Shorter session: 45 min (vs 60 planned)",
 *   "recovery_suggestion": "Extra sleep + static stretching recommended",
 *   "confidence_pct": 90,
 *   "rationale": "...",
 *   "saved": true
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'
import { db } from '@/src/db'
import { session_adaptations } from '@/src/db/schema'
import { eq, and } from 'drizzle-orm'
import {
  recommendSessionAdaptation,
  type SessionAdaptationInput,
} from '@/src/engines/sessionAdaptation'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const input: SessionAdaptationInput = await request.json()

    // Validate required fields
    if (
      !input.athlete_id ||
      !input.date ||
      input.readiness_score == null ||
      !input.acwr_zone ||
      input.acwr_value == null ||
      !input.scheduled_wod
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: athlete_id, date, readiness_score, acwr_zone, acwr_value, scheduled_wod',
        },
        { status: 400 }
      )
    }

    // Calculate recommendation (pure function)
    const recommendation = recommendSessionAdaptation(input)

    // Save to database
    await db
      .insert(session_adaptations)
      .values({
        athlete_id: input.athlete_id,
        date: input.date,
        readiness_score: input.readiness_score,
        readiness_level: recommendation.readiness_level,
        acwr_zone: input.acwr_zone,
        acwr_value: input.acwr_value,
        recommended_action: recommendation.recommended_action,
        intensity_reduction_pct: recommendation.intensity_reduction_pct,
        volume_reduction_pct: recommendation.volume_reduction_pct,
        movement_substitutions: recommendation.movement_substitutions as any,
        timing_suggestion: recommendation.timing_suggestion,
        recovery_suggestion: recommendation.recovery_suggestion,
        confidence_pct: recommendation.confidence_pct,
        rationale: recommendation.rationale,
        wod_id: input.scheduled_wod.id,
      })
      .onConflictDoUpdate({
        target: [session_adaptations.athlete_id, session_adaptations.date],
        set: {
          readiness_score: input.readiness_score,
          readiness_level: recommendation.readiness_level,
          acwr_zone: input.acwr_zone,
          acwr_value: input.acwr_value,
          recommended_action: recommendation.recommended_action,
          intensity_reduction_pct: recommendation.intensity_reduction_pct,
          volume_reduction_pct: recommendation.volume_reduction_pct,
          movement_substitutions: recommendation.movement_substitutions as any,
          timing_suggestion: recommendation.timing_suggestion,
          recovery_suggestion: recommendation.recovery_suggestion,
          confidence_pct: recommendation.confidence_pct,
          rationale: recommendation.rationale,
          wod_id: input.scheduled_wod.id,
        },
      })

    return NextResponse.json({
      ...recommendation,
      saved: true,
    })
  } catch (error: any) {
    console.error('[Session Adaptation Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/engines/session/adaptation?athlete_id=...&date=...
 *
 * Obtiene recomendación guardada
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const athlete_id = searchParams.get('athlete_id')
    const date = searchParams.get('date')

    if (!athlete_id || !date) {
      return NextResponse.json(
        { error: 'Missing query params: athlete_id, date' },
        { status: 400 }
      )
    }

    const [adaptation] = await db
      .select()
      .from(session_adaptations)
      .where(
        and(
          eq(session_adaptations.athlete_id, athlete_id),
          eq(session_adaptations.date, date)
        )
      )
      .limit(1)

    if (!adaptation) {
      return NextResponse.json(
        { error: 'No adaptation found for this date' },
        { status: 404 }
      )
    }

    return NextResponse.json(adaptation)
  } catch (error: any) {
    console.error('[Session Adaptation GET Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
