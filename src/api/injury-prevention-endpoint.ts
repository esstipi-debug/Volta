/**
 * INJURY PREVENTION API ENDPOINT
 * Integration example for Replit/Next.js
 *
 * POST /api/injuries/check-alert
 * Body: {athleteId, acwr, hvr_lnRMSSD, sleep_hours, ...}
 * Returns: AlertResult + Movement Recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { InjuryPreventionAlertSystem, type AthleteData } from '@/lib/alert-system';
import { MovementEscalationEngine } from '@/lib/movement-escalation';

const alertSystem = new InjuryPreventionAlertSystem();
const escalationEngine = new MovementEscalationEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // STEP 1: Validate input
    const athleteData: AthleteData = {
      athleteId: body.athleteId,
      acwr: body.acwr,
      hvr_lnRMSSD: body.hvr_lnRMSSD,
      sleep_hours: body.sleep_hours,
      subjective_wellbeing: body.subjective_wellbeing || 7,
      menstrual_phase: body.menstrual_phase,
      age: body.age || 25,
      training_age_months: body.training_age_months || 24,
      t_c_ratio: body.t_c_ratio,
      resting_hr: body.resting_hr,
      academic_stress: body.academic_stress,
      hrv_baseline: body.hrv_baseline,
    };

    // STEP 2: Generate injury prevention alert
    const alert = alertSystem.generateAlert(athleteData);

    // STEP 3: Get movement escalation recommendations
    const current_movements = body.current_movements || [];
    const escalation = escalationEngine.getEscalationByAlert(
      athleteData.athleteId,
      alert.severity,
      current_movements
    );

    // STEP 4: Compile full response
    const response = {
      timestamp: new Date().toISOString(),
      athlete_id: athleteData.athleteId,
      alert_status: alert.severity,
      alert_confidence: `${alert.confidence}%`,
      adjusted_acwr: alert.adjusted_acwr,
      data_quality: alert.data_quality,

      // Alert Details
      triggered_by: alert.triggered_by,
      recommendations: alert.recommendations,

      // Movement Escalations
      movement_modifications: escalation.recommended_modifications,
      affected_movements: escalation.affected_movements,
      rtp_step: escalation.rtp_step,
      progression_criteria: escalation.progression_criteria,
      regression_triggers: escalation.regression_triggers,

      // Uncertainty Honesty
      uncertainty_flags: alert.uncertainty_flags,
      research_gaps: [
        "GAPS 1: ACWR heterogeneity (60% confidence)",
        "GAPS 3: Female athlete data (40% confidence)",
        "GAPS 5: ML precision variance (80% confidence)",
      ],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate injury prevention alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 400 }
    );
  }
}

/**
 * EXAMPLE USAGE:
 *
 * POST /api/injuries/check-alert
 *
 * {
 *   "athleteId": "athlete_123",
 *   "acwr": 1.2,
 *   "hvr_lnRMSSD": 3.1,
 *   "hrv_baseline": 3.8,
 *   "sleep_hours": 6,
 *   "subjective_wellbeing": 4,
 *   "age": 28,
 *   "training_age_months": 36,
 *   "menstrual_phase": "luteal",
 *   "t_c_ratio": 0.42,
 *   "academic_stress": "critical",
 *   "current_movements": ["back_squat", "deadlift", "running", "muscle_up"]
 * }
 *
 * RESPONSE (BLACK alert example):
 *
 * {
 *   "timestamp": "2026-03-09T15:30:00Z",
 *   "athlete_id": "athlete_123",
 *   "alert_status": "BLACK",
 *   "alert_confidence": "92%",
 *   "adjusted_acwr": 0.92,
 *   "data_quality": "high",
 *   "triggered_by": [
 *     "ACWR CRITICAL: 1.2 > 1.5 - VERY HIGH injury risk",
 *     "SLEEP CRITICAL: <6 hours (6h) - 150% injury risk multiplier",
 *     "HRV CRITICAL: >50% depression from baseline (18.4%)",
 *     "OTS WARNING: T/C ratio 0.42 - elevated fatigue risk"
 *   ],
 *   "recommendations": [
 *     "🛑 STOP high-intensity training",
 *     "Complete rest or light activity only",
 *     "⚕️ Medical evaluation STRONGLY RECOMMENDED",
 *     "Contact coach/team physician immediately"
 *   ],
 *   "movement_modifications": [
 *     {
 *       "original_movement": "Back Squat",
 *       "rx_level": "Beginner",
 *       "description": "Goblet squat 20-30 lbs, or air squat with 2-inch box",
 *       "rationale": "Minimal joint stress, mobility-friendly",
 *       "biomechanical_reason": "Anterior load reduces knee stress; box eliminates depth control requirement"
 *     },
 *     ... more modifications for deadlift, running, muscle_up
 *   ],
 *   "affected_movements": ["back_squat", "deadlift", "running", "muscle_up"],
 *   "rtp_step": 1,
 *   "progression_criteria": [
 *     "No return of symptoms",
 *     "ACWR within step limit",
 *     "Subjective wellbeing >= 7/10",
 *     "HRV stable (±15% of baseline)",
 *     "Sleep >= 7 hours"
 *   ],
 *   "regression_triggers": [
 *     "Pain/symptoms return",
 *     "ACWR exceeds step limit",
 *     "HRV depression >30%",
 *     "Sleep <6 hours sustained",
 *     "Subjective wellbeing <5/10"
 *   ],
 *   "uncertainty_flags": [
 *     "⚠️ GAPS 1: ACWR window variance 21-28 days (60% confidence)",
 *     "⚠️ GAPS 3: Female athlete data only 6% of research (40% confidence)",
 *     "⚠️ GAPS 5: Model uncertainty high - incidence variance 19.4%-73.5%"
 *   ],
 *   "research_gaps": [
 *     "GAPS 1: ACWR heterogeneity (60% confidence)",
 *     "GAPS 3: Female athlete data (40% confidence)",
 *     "GAPS 5: ML precision variance (80% confidence)"
 *   ]
 * }
 */
