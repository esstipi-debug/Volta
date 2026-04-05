/**
 * ALERT SYSTEM ENGINE
 * Processes athlete parameters → generates injury prevention alerts
 * Implements: ACWR, HRV, OTS, demographic adjustments, hierarchical resolution
 */

import {
  ACWR_THRESHOLDS,
  HRV_THRESHOLDS,
  OTS_DIAGNOSIS,
  DEMOGRAPHIC_ADJUSTMENTS,
  PSYCHOSOCIAL_STRESS,
  PARAMETER_HIERARCHY,
  ALERT_SEVERITY,
  RESEARCH_GAPS,
} from './injury-prevention-params';

export interface AthleteData {
  athleteId: string;
  acwr: number;
  hvr_lnRMSSD: number;
  sleep_hours: number;
  subjective_wellbeing: number; // 1-10
  menstrual_phase?: 'follicular' | 'ovulation' | 'luteal' | 'menstrual';
  age: number;
  training_age_months: number;
  t_c_ratio?: number;
  resting_hr?: number;
  academic_stress?: 'none' | 'low' | 'moderate' | 'high' | 'critical';
  hrv_baseline?: number;
}

export interface AlertResult {
  athleteId: string;
  severity: 'GREEN' | 'YELLOW' | 'RED' | 'BLACK';
  triggered_by: string[];
  adjusted_acwr: number;
  recommendations: string[];
  confidence: number;
  data_quality: 'high' | 'medium' | 'low';
  uncertainty_flags: string[];
}

// ============================================================
// MAIN ALERT ENGINE
// ============================================================
export class InjuryPreventionAlertSystem {
  generateAlert(athlete: AthleteData): AlertResult {
    const alerts: string[] = [];
    const flags: string[] = [];
    let severity_level = 0; // GREEN = 0, YELLOW = 1, RED = 2, BLACK = 3
    let adjusted_acwr = athlete.acwr;
    let confidence = 1.0;

    // STEP 1: HIERARCHICAL PARAMETER RESOLUTION (Section 8)
    // Level 1: Subjective Wellbeing (highest priority)
    const wellbeing_decision = this.checkSubjectiveWellbeing(
      athlete.subjective_wellbeing,
      alerts
    );
    if (wellbeing_decision.override) {
      return this.emergencyAlert(
        athlete.athleteId,
        wellbeing_decision.message
      );
    }

    // STEP 2: ACWR CALCULATION WITH ADJUSTMENTS (Sections 2, 6, 7)
    adjusted_acwr = this.calculateAdjustedACWR(athlete, flags);

    // STEP 3: HRV BIOMARCERING (Section 3)
    const hrv_result = this.checkHRV(athlete, flags, confidence);
    severity_level = Math.max(severity_level, hrv_result.severity_level);
    alerts.push(...hrv_result.alerts);
    confidence *= hrv_result.confidence;

    // STEP 4: OTS DIAGNOSIS (Section 4)
    if (athlete.t_c_ratio !== undefined) {
      const ots_result = this.checkOTS(athlete.t_c_ratio, flags);
      severity_level = Math.max(severity_level, ots_result.severity_level);
      alerts.push(...ots_result.alerts);
      flags.push(...ots_result.flags);
    }

    // STEP 5: SLEEP ANALYSIS (Section 3)
    const sleep_result = this.checkSleep(athlete.sleep_hours, alerts);
    severity_level = Math.max(severity_level, sleep_result.severity_level);
    confidence *= sleep_result.confidence;

    // STEP 6: ACWR THRESHOLD EVALUATION
    const acwr_result = this.evaluateACWRThreshold(
      adjusted_acwr,
      athlete.menstrual_phase
    );
    severity_level = Math.max(severity_level, acwr_result.severity_level);
    alerts.push(...acwr_result.alerts);

    // STEP 7: GENERATE RECOMMENDATIONS
    const recommendations = this.generateRecommendations(
      adjusted_acwr,
      severity_level,
      athlete
    );

    // STEP 8: ADD UNCERTAINTY HONESTY (GAPS Section 11)
    this.addUncertaintyFlags(athlete, flags, confidence);

    return {
      athleteId: athlete.athleteId,
      severity: this.severityToLabel(severity_level),
      triggered_by: alerts,
      adjusted_acwr: Math.round(adjusted_acwr * 100) / 100,
      recommendations,
      confidence: Math.round(confidence * 100),
      data_quality: this.assessDataQuality(athlete),
      uncertainty_flags: flags,
    };
  }

  // ============================================================
  // LEVEL 1: SUBJECTIVE WELLBEING (Highest Priority)
  // ============================================================
  private checkSubjectiveWellbeing(
    wellbeing: number,
    alerts: string[]
  ): { override: boolean; message: string } {
    if (wellbeing <= 3) {
      return {
        override: true,
        message: "CRITICAL: Athlete reports severe fatigue/distress. STOP training immediately.",
      };
    }
    if (wellbeing <= 5) {
      alerts.push("Subjective wellbeing LOW - reduce load 40-50%");
    }
    return { override: false, message: "" };
  }

  // ============================================================
  // CALCULATE ADJUSTED ACWR (Sections 2, 6, 7)
  // ============================================================
  private calculateAdjustedACWR(athlete: AthleteData, flags: string[]): number {
    let adjusted = athlete.acwr;

    // Menstrual cycle adjustment (Section 6)
    if (athlete.menstrual_phase) {
      const phase_adjustment =
        DEMOGRAPHIC_ADJUSTMENTS.MENSTRUAL_CYCLE[athlete.menstrual_phase]
          ?.acwr_adjustment || 0;
      adjusted -= phase_adjustment;
      if (phase_adjustment !== 0) {
        flags.push(
          `Menstrual phase (${athlete.menstrual_phase}): ACWR adjusted -${phase_adjustment} [60% confidence]`
        );
      }
    }

    // Age adjustment (Section 6)
    const age_adjustment =
      athlete.age >= 35
        ? DEMOGRAPHIC_ADJUSTMENTS.age_adjustments.masters_35_plus
            .acwr_adjustment
        : 0;
    if (age_adjustment !== 0) {
      adjusted -= age_adjustment;
      flags.push(`Age >35: ACWR adjusted -${age_adjustment} [70% confidence]`);
    }

    // Training age adjustment (Section 6)
    const training_adjustment =
      athlete.training_age_months < 6
        ? DEMOGRAPHIC_ADJUSTMENTS.training_age.novice_0_6mo.acwr_adjustment
        : athlete.training_age_months < 24
        ? DEMOGRAPHIC_ADJUSTMENTS.training_age.intermediate_6_24mo
            .acwr_adjustment
        : 0;
    if (training_adjustment !== 0) {
      adjusted -= training_adjustment;
      flags.push(`Training age: ACWR adjusted -${training_adjustment}`);
    }

    // Psychosocial stress adjustment (Section 7)
    const stress_adjustment = this.getStressAdjustment(athlete.academic_stress);
    if (stress_adjustment !== 0) {
      adjusted -= stress_adjustment;
      flags.push(`Academic stress: ACWR adjusted -${stress_adjustment}`);
    }

    return Math.max(0, adjusted); // Floor at 0
  }

  private getStressAdjustment(
    stress?: 'none' | 'low' | 'moderate' | 'high' | 'critical'
  ): number {
    switch (stress) {
      case 'none':
        return PSYCHOSOCIAL_STRESS.NO_STRESS.acwr_adjustment;
      case 'low':
        return PSYCHOSOCIAL_STRESS.LOW_STRESS.acwr_adjustment;
      case 'moderate':
        return PSYCHOSOCIAL_STRESS.MODERATE_STRESS.acwr_adjustment;
      case 'high':
        return PSYCHOSOCIAL_STRESS.HIGH_STRESS.acwr_adjustment;
      case 'critical':
        return PSYCHOSOCIAL_STRESS.CRITICAL_STRESS.acwr_adjustment;
      default:
        return 0;
    }
  }

  // ============================================================
  // LEVEL 2A: HRV BIOMARCERING (Section 3)
  // ============================================================
  private checkHRV(
    athlete: AthleteData,
    flags: string[],
    current_confidence: number
  ): { severity_level: number; alerts: string[]; confidence: number } {
    const alerts: string[] = [];
    let severity_level = 0;
    let confidence = 1.0;

    if (!athlete.hrv_baseline || !athlete.hrv_lnRMSSD) {
      return { severity_level: 0, alerts: [], confidence };
    }

    const hrv_drop =
      (athlete.hrv_baseline - athlete.hrv_lnRMSSD) / athlete.hrv_baseline;

    // Severe depression (>50% drop)
    if (hrv_drop > HRV_THRESHOLDS.SEVERE_DEPRESSION) {
      alerts.push(
        `HRV CRITICAL: >50% depression from baseline (${(hrv_drop * 100).toFixed(1)}%)`
      );
      severity_level = Math.max(severity_level, 2); // RED
      confidence *= 0.8; // High confidence on severe HRV drop
    }
    // Moderate depression (30-50% drop sustained 7+ days)
    else if (hrv_drop > HRV_THRESHOLDS.DEPRESSED_7DAY_DROP) {
      alerts.push(
        `HRV ELEVATED: 30-50% depression from baseline (${(hrv_drop * 100).toFixed(1)}%)`
      );
      severity_level = Math.max(severity_level, 1); // YELLOW
      flags.push(
        "Monitor HRV closely for sustained depression (>7 days triggers RED)"
      );
      confidence *= 0.7;
    }

    // High variability (CV >35%)
    const estimated_cv = hrv_drop; // Simplified - would need CV calculation in real app
    if (estimated_cv > HRV_THRESHOLDS.CV_HIGH) {
      flags.push("HRV HIGH VARIABILITY - training status unstable");
      confidence *= 0.75;
    }

    return { severity_level, alerts, confidence };
  }

  // ============================================================
  // LEVEL 2B: SLEEP ANALYSIS (Section 3)
  // ============================================================
  private checkSleep(
    sleep_hours: number,
    alerts: string[]
  ): { severity_level: number; confidence: number } {
    let severity_level = 0;
    let confidence = 1.0;

    if (sleep_hours < 6) {
      alerts.push(
        `SLEEP CRITICAL: <6 hours (${sleep_hours}h) - 150% injury risk multiplier`
      );
      severity_level = 2; // RED
      confidence *= 0.85;
    } else if (sleep_hours < 7) {
      alerts.push(
        `SLEEP WARNING: <7 hours (${sleep_hours}h) - 70% injury risk increase`
      );
      severity_level = 1; // YELLOW
      confidence *= 0.8;
    } else if (sleep_hours >= 7 && sleep_hours <= 9) {
      // Optimal - no alert
      confidence *= 1.0;
    } else {
      // >9 hours - may indicate overtraining/fatigue
      alerts.push(`SLEEP EXCESS: >${sleep_hours}h - possible overtraining signal`);
      severity_level = 1; // YELLOW
      confidence *= 0.7;
    }

    return { severity_level, confidence };
  }

  // ============================================================
  // LEVEL 3: OTS DIAGNOSIS (Section 4)
  // ============================================================
  private checkOTS(
    t_c_ratio: number,
    flags: string[]
  ): { severity_level: number; alerts: string[]; flags: string[] } {
    const alerts: string[] = [];
    let severity_level = 0;

    if (t_c_ratio < OTS_DIAGNOSIS.OTS_CLINICAL) {
      alerts.push(
        `OTS CLINICAL: T/C ratio ${t_c_ratio.toFixed(2)} - MEDICAL EVALUATION REQUIRED`
      );
      severity_level = 3; // BLACK - emergency
      flags.push(
        "⚠️ T/C ratio biomarker not universally standardized (50% confidence) - use athlete baseline"
      );
    } else if (t_c_ratio < OTS_DIAGNOSIS.WARNING_THRESHOLD) {
      alerts.push(
        `OTS WARNING: T/C ratio ${t_c_ratio.toFixed(2)} - elevated fatigue risk`
      );
      severity_level = 2; // RED
      flags.push("Monitor closely for additional OTS indicators");
    } else if (t_c_ratio < OTS_DIAGNOSIS.NORMAL_THRESHOLD) {
      alerts.push(
        `OTS MONITOR: T/C ratio ${t_c_ratio.toFixed(2)} - approaching warning zone`
      );
      severity_level = 1; // YELLOW
    }

    return { severity_level, alerts, flags };
  }

  // ============================================================
  // ACWR THRESHOLD EVALUATION
  // ============================================================
  private evaluateACWRThreshold(
    adjusted_acwr: number,
    menstrual_phase?: string
  ): { severity_level: number; alerts: string[] } {
    const alerts: string[] = [];
    let severity_level = 0;

    const safe_threshold = ACWR_THRESHOLDS.SAFE;
    const warning_threshold = ACWR_THRESHOLDS.WARNING;
    const critical_threshold = ACWR_THRESHOLDS.CRITICAL;

    if (adjusted_acwr > critical_threshold) {
      alerts.push(
        `ACWR CRITICAL: ${adjusted_acwr.toFixed(2)} > ${critical_threshold} - VERY HIGH injury risk`
      );
      severity_level = 3; // BLACK
    } else if (adjusted_acwr > warning_threshold) {
      alerts.push(
        `ACWR ELEVATED: ${adjusted_acwr.toFixed(2)} > ${warning_threshold} - elevated risk zone`
      );
      severity_level = 2; // RED
    } else if (adjusted_acwr > safe_threshold) {
      alerts.push(
        `ACWR WARNING: ${adjusted_acwr.toFixed(2)} > ${safe_threshold} - monitor closely`
      );
      severity_level = 1; // YELLOW
    } else {
      // Safe zone
      severity_level = 0; // GREEN
    }

    return { severity_level, alerts };
  }

  // ============================================================
  // RECOMMENDATION ENGINE
  // ============================================================
  private generateRecommendations(
    adjusted_acwr: number,
    severity_level: number,
    athlete: AthleteData
  ): string[] {
    const recs: string[] = [];

    switch (severity_level) {
      case 0: // GREEN
        recs.push("Continue normal training");
        if (adjusted_acwr > 0.4) {
          recs.push("Monitor ACWR for next 3-5 days");
        }
        break;

      case 1: // YELLOW
        recs.push("⚠️ Reduce training load by 10-20%");
        recs.push("Focus on recovery: sleep ≥8h, mobility work");
        recs.push("Check HRV daily; if depression persists >7 days → RED alert");
        if (athlete.menstrual_phase === 'luteal') {
          recs.push("Menstrual phase: higher caution advised (40% data uncertainty)");
        }
        break;

      case 2: // RED
        recs.push("🔴 REDUCE training load by 30-50%");
        recs.push("Priority: Recovery (sleep, stress, nutrition)");
        recs.push("Consult coach - modify training protocol");
        recs.push("Daily HRV/sleep monitoring mandatory");
        recs.push("Re-assess in 3-5 days");
        break;

      case 3: // BLACK
        recs.push("🛑 STOP high-intensity training");
        recs.push("Complete rest or light activity only");
        recs.push("⚕️ Medical evaluation STRONGLY RECOMMENDED");
        recs.push("Contact coach/team physician immediately");
        break;
    }

    return recs;
  }

  // ============================================================
  // UNCERTAINTY HONESTY (GAPS Section 11)
  // ============================================================
  private addUncertaintyFlags(
    athlete: AthleteData,
    flags: string[],
    confidence: number
  ): void {
    // GAPS Vacío 1: ACWR Heterogeneity (60% confidence)
    flags.push(`⚠️ GAPS 1: ACWR window variance 21-28 days (60% confidence)`);

    // GAPS Vacío 3: Female athlete data deficit (40% confidence)
    if (athlete.menstrual_phase) {
      flags.push(
        `⚠️ GAPS 3: Female athlete data only 6% of research (40% confidence)`
      );
      flags.push(
        "→ Use CONSERVATIVE thresholds for menstrual adjustments"
      );
    }

    // GAPS Vacío 4: Academic stress impact (75% confidence)
    if (athlete.academic_stress && athlete.academic_stress !== 'none') {
      flags.push(
        `⚠️ GAPS 4: Academic stress 3x injury multiplier (75% confidence)`
      );
    }

    // GAPS Vacío 5: ML precision illusion (80% confidence)
    if (confidence < 0.7) {
      flags.push(
        `⚠️ GAPS 5: Model uncertainty high - incidence variance 19.4%-73.5%`
      );
      flags.push("→ Confidence intervals: Show user actual uncertainty range");
    }
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================
  private severityToLabel(
    level: number
  ): 'GREEN' | 'YELLOW' | 'RED' | 'BLACK' {
    switch (level) {
      case 0:
        return 'GREEN';
      case 1:
        return 'YELLOW';
      case 2:
        return 'RED';
      case 3:
        return 'BLACK';
      default:
        return 'GREEN';
    }
  }

  private assessDataQuality(athlete: AthleteData): 'high' | 'medium' | 'low' {
    let quality_score = 0;
    if (athlete.acwr) quality_score++;
    if (athlete.hvr_lnRMSSD) quality_score++;
    if (athlete.sleep_hours) quality_score++;
    if (athlete.t_c_ratio) quality_score++;
    if (athlete.subjective_wellbeing) quality_score++;

    return quality_score >= 4 ? 'high' : quality_score >= 2 ? 'medium' : 'low';
  }

  private emergencyAlert(
    athleteId: string,
    message: string
  ): AlertResult {
    return {
      athleteId,
      severity: 'BLACK',
      triggered_by: [message],
      adjusted_acwr: 0,
      recommendations: [
        "🛑 " + message,
        "STOP training immediately",
        "Contact coach/medical team",
        "Medical evaluation required",
      ],
      confidence: 95,
      data_quality: 'high',
      uncertainty_flags: [
        "EMERGENCY STATE - Overrides all other parameters",
      ],
    };
  }
}
