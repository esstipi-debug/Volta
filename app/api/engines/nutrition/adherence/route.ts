/**
 * POST /api/engines/nutrition/adherence
 *
 * Sincroniza datos de nutrición logueados desde apps externas.
 * Puede ser llamado por:
 * - Webhook desde MyFitnessPal/Cronometer
 * - Cliente (manual sync)
 * - BullMQ worker (scheduled sync)
 *
 * Request:
 * {
 *   "athlete_id": "uuid",
 *   "date": "2026-04-05",
 *   "protein_logged_g": 145,
 *   "calories_logged": 2480,
 *   "source": "myfitnesspal"
 * }
 *
 * Response:
 * {
 *   "overall_score": 3,
 *   "protein_adherence_pct": 97,
 *   "calories_adherence_pct": 99,
 *   "saved": true
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/src/db'
import { nutrition_adherence, nutrition_recommendations } from '@/src/db/schema'
import { eq, and } from 'drizzle-orm'
import { scoreAdherence } from '@/src/engines/nutritionEngine'

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    const { athlete_id, date, protein_logged_g, calories_logged, source = 'manual' } = payload

    if (!athlete_id || !date || protein_logged_g == null || calories_logged == null) {
      return NextResponse.json(
        { error: 'Missing required fields: athlete_id, date, protein_logged_g, calories_logged' },
        { status: 400 }
      )
    }

    // Get target for this date (from nutrition_recommendations)
    const [target] = await db
      .select({
        protein_target_g: nutrition_recommendations.protein_target_g,
        calories_target: nutrition_recommendations.calories_target,
      })
      .from(nutrition_recommendations)
      .where(
        and(
          eq(nutrition_recommendations.athlete_id, athlete_id),
          eq(nutrition_recommendations.date, date)
        )
      )
      .limit(1)

    // If no target exists, create one with baseline (use 1.6g/kg, 30 kcal/kg)
    let protein_target = target?.protein_target_g || 115
    let calories_target = target?.calories_target || 2400

    // Score adherence
    const score = scoreAdherence({
      athlete_id,
      date,
      protein_logged_g: Math.round(protein_logged_g),
      calories_logged: Math.round(calories_logged),
      protein_target_g: protein_target,
      calories_target: calories_target,
    })

    // Upsert adherence record
    await db
      .insert(nutrition_adherence)
      .values({
        athlete_id,
        date,
        protein_logged_g: Math.round(protein_logged_g),
        calories_logged: Math.round(calories_logged),
        protein_target_g: protein_target,
        calories_target: calories_target,
        protein_adherence_pct: score.protein_adherence_pct,
        calories_adherence_pct: score.calories_adherence_pct,
        overall_score: score.overall_score,
        source,
      })
      .onConflictDoUpdate({
        target: [nutrition_adherence.athlete_id, nutrition_adherence.date],
        set: {
          protein_logged_g: Math.round(protein_logged_g),
          calories_logged: Math.round(calories_logged),
          protein_adherence_pct: score.protein_adherence_pct,
          calories_adherence_pct: score.calories_adherence_pct,
          overall_score: score.overall_score,
          source,
        },
      })

    return NextResponse.json({
      overall_score: score.overall_score,
      protein_adherence_pct: score.protein_adherence_pct,
      calories_adherence_pct: score.calories_adherence_pct,
      saved: true,
    })
  } catch (error: any) {
    console.error('[Nutrition Adherence Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/engines/nutrition/adherence?athlete_id=...&days=7
 *
 * Obtiene historial de adherencia (últimos N días)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const athlete_id = searchParams.get('athlete_id')
    const days = parseInt(searchParams.get('days') || '7')

    if (!athlete_id) {
      return NextResponse.json(
        { error: 'Missing query param: athlete_id' },
        { status: 400 }
      )
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoff_str = cutoff.toISOString().split('T')[0]

    const history = await db
      .select()
      .from(nutrition_adherence)
      .where(
        and(
          eq(nutrition_adherence.athlete_id, athlete_id),
          nutrition_adherence.date >= new Date(cutoff_str)
        )
      )
      .orderBy(nutrition_adherence.date)

    // Calculate average adherence
    const avg_score = history.length > 0
      ? Math.round(history.reduce((sum, r) => sum + (r.overall_score || 0), 0) / history.length)
      : 0

    return NextResponse.json({
      history,
      days_tracked: history.length,
      average_score: avg_score,
    })
  } catch (error: any) {
    console.error('[Nutrition Adherence GET Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
