/**
 * POST /api/engines/nutrition
 *
 * Calcula recomendación nutricional para un atleta.
 * Requiere: StressEngine (session_load), ACWR data, menstrual phase.
 *
 * Request:
 * {
 *   "athlete_id": "uuid",
 *   "date": "2026-04-05",
 *   "body_weight_kg": 70,
 *   "training_intensity": "moderate",
 *   "acwr_zone": "optimal",
 *   "menstrual_phase": 2,
 *   "goal": "maintain"
 * }
 *
 * Response:
 * {
 *   "daily_target": { "calories": 2500, "protein_g": 150, ... },
 *   "timing": { "pre_workout": {...}, "post_workout": {...} },
 *   "hydration_ml": 2450,
 *   "recovery_focus": "...",
 *   "saved_to_db": true
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/src/lib/auth'
import { db } from '@/src/db'
import { nutrition_recommendations } from '@/src/db/schema'
import { eq, and } from 'drizzle-orm'
import {
  calculateNutritionRecommendation,
  type NutritionEngineInput,
} from '@/src/engines/nutritionEngine'

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const session = await getServerSession(authConfig)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const input: NutritionEngineInput = await request.json()

    // Validate required fields
    if (!input.athlete_id || !input.date || !input.body_weight_kg || !input.training_intensity || !input.goal) {
      return NextResponse.json(
        { error: 'Missing required fields: athlete_id, date, body_weight_kg, training_intensity, goal' },
        { status: 400 }
      )
    }

    // Calculate recommendation (pure function)
    const recommendation = calculateNutritionRecommendation(input)

    // Save to database
    await db
      .insert(nutrition_recommendations)
      .values({
        athlete_id: input.athlete_id,
        date: input.date,
        training_intensity: input.training_intensity,
        acwr_zone: input.acwr_zone,
        menstrual_phase: input.menstrual_phase,
        calories_target: recommendation.daily_target.calories,
        protein_target_g: recommendation.daily_target.protein_g,
        carbs_target_g: recommendation.daily_target.carbs_g,
        fats_target_g: recommendation.daily_target.fats_g,
        timing: recommendation.timing as any,
        hydration_ml: recommendation.hydration_ml,
        recovery_focus: recommendation.recovery_focus,
      })
      .onConflictDoUpdate({
        target: [nutrition_recommendations.athlete_id, nutrition_recommendations.date],
        set: {
          training_intensity: input.training_intensity,
          acwr_zone: input.acwr_zone,
          menstrual_phase: input.menstrual_phase,
          calories_target: recommendation.daily_target.calories,
          protein_target_g: recommendation.daily_target.protein_g,
          carbs_target_g: recommendation.daily_target.carbs_g,
          fats_target_g: recommendation.daily_target.fats_g,
          timing: recommendation.timing as any,
          hydration_ml: recommendation.hydration_ml,
          recovery_focus: recommendation.recovery_focus,
        },
      })

    return NextResponse.json({
      ...recommendation,
      saved_to_db: true,
    })
  } catch (error: any) {
    console.error('[Nutrition Engine Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/engines/nutrition?athlete_id=...&date=...
 *
 * Obtiene recomendación almacenada (sin recalcular).
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

    const [recommendation] = await db
      .select()
      .from(nutrition_recommendations)
      .where(
        and(
          eq(nutrition_recommendations.athlete_id, athlete_id),
          eq(nutrition_recommendations.date, date)
        )
      )
      .limit(1)

    if (!recommendation) {
      return NextResponse.json(
        { error: 'No recommendation found for this date' },
        { status: 404 }
      )
    }

    return NextResponse.json(recommendation)
  } catch (error: any) {
    console.error('[Nutrition GET Error]', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
