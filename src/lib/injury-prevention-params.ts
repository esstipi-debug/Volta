/**
 * INJURY PREVENTION PARAMETERS
 * Extracted from: Research Sections 2-7, 10-11
 * Source: 11-Section Investigation + GAPS Validation
 * Last Updated: 2026-03-09
 */

// ============================================================
// SECTION 2: ACWR DYNAMICS (Acute:Chronic Workload Ratio)
// ============================================================
export const ACWR_THRESHOLDS = {
  SAFE: 0.60,           // Safe zone - low injury risk
  WARNING: 0.80,        // Warning zone - elevated risk
  CRITICAL: 1.50,       // Critical zone - very high risk
  RTP_STEP_3: 0.60,     // Return to Play Step 3
  RTP_STEP_5: 0.80,     // Return to Play Step 5
};

// EWMA window parameters (Exponentially Weighted Moving Average)
export const ACWR_CALCULATION = {
  ACUTE_WINDOW_DAYS: 7,      // Short-term load (7 days)
  CHRONIC_WINDOW_DAYS: 28,   // Long-term load (28 days)
  EWMA_DECAY: 0.5,           // EWMA decay factor (vs SMA uniform)
  HETEROGENEITY_VARIANCE: { min: 21, max: 28 }, // GAPS Vacío 1: 60% confidence
  HR_ZONES: {
    // Per Section 2: HR response by ACWR range
    acwr_low: { RR_min: 2.72, RR_max: 5.43 },      // <0.60 ACWR
    acwr_moderate: { RR_min: 5.44, RR_max: 8.15 }, // 0.60-0.80
    acwr_high: { RR_min: 8.16, RR_max: 12.46 },    // 0.80-1.50
  },
};

// ============================================================
// SECTION 3: HRV BIOMARCERING & SLEEP ARCHITECTURE
// ============================================================
export const HRV_THRESHOLDS = {
  // LnRMSSD (Natural Log of Root Mean Square of Successive Differences)
  NORMAL_MIN: 3.5,              // Normal baseline LnRMSSD
  DEPRESSED_7DAY_DROP: 0.30,    // >30% drop sustained 7+ days = alert
  SEVERE_DEPRESSION: 0.50,      // >50% drop = clinical concern

  // Coefficient of Variation (day-to-day stability)
  CV_NORMAL: 0.20,              // 20% normal variation
  CV_HIGH: 0.35,                // >35% high instability

  // Sleep impact on lesion risk
  SLEEP_RISK: {
    below_7_hours: 1.70,        // 70% lesion increase risk multiplier
    below_6_hours: 2.50,        // 150% increase
    normal_7_9_hours: 1.00,     // Baseline
  },

  // Moving average window
  MOVING_AVG_DAYS: 7,
};

// ============================================================
// SECTION 4: OTS (OVERTRAINING SYNDROME) CLINICAL DIAGNOSIS
// ============================================================
export const OTS_DIAGNOSIS = {
  // T/C Ratio (Testosterone/Cortisol) via 2-Bout Protocol
  NORMAL_THRESHOLD: 0.80,       // Healthy athletes
  WARNING_THRESHOLD: 0.50,      // Elevated fatigue risk
  OTS_CLINICAL: 0.35,           // Clinical OTS diagnosis

  // Biomarker standardization issue
  GAPS_BIOMARKER_CONFIDENCE: 0.50, // GAPS Vacío 2: 50% confidence (sample type variance)

  // Clinical OTS indicators (multi-factorial)
  CLINICAL_OTS_CRITERIA: {
    high_resting_hr: true,      // RHR elevated 5-10 bpm
    mood_disturbance: true,     // Depression, irritability
    persistent_fatigue: true,   // 4+ weeks
    reduced_performance: true,  // >10% decline
    elevated_resting_cortisol: true,
    low_testosterone: true,
  },
};

// ============================================================
// SECTION 6: DEMOGRAPHIC VARIATIONS
// ============================================================
export const DEMOGRAPHIC_ADJUSTMENTS = {
  // Menstrual Cycle Impact (Female Athletes - 40% data deficit per GAPS)
  MENSTRUAL_CYCLE: {
    follicular_phase: { acwr_adjustment: 0.00 },    // Baseline
    ovulation_phase: { acwr_adjustment: -0.05 },    // Slightly lower tolerance
    luteal_phase: { acwr_adjustment: -0.20 },       // 0.20 threshold reduction
    menstrual_phase: { acwr_adjustment: -0.10 },    // Moderate reduction
    confidence: 0.40, // GAPS Vacío 3: Only 6% of research on women
  },

  // Age Adjustments
  age_adjustments: {
    masters_35_plus: { acwr_adjustment: -0.15 },    // Reduced tolerance
    young_18_25: { acwr_adjustment: 0.00 },         // Baseline
    confidence: 0.70,
  },

  // Training Age (experience level)
  training_age: {
    novice_0_6mo: { acwr_adjustment: -0.25 },
    intermediate_6_24mo: { acwr_adjustment: -0.10 },
    advanced_24mo_plus: { acwr_adjustment: 0.00 },
    confidence: 0.75,
  },
};

// ============================================================
// SECTION 7: PSYCHOSOCIAL STRESS IMPACT
// ============================================================
export const PSYCHOSOCIAL_STRESS = {
  // Academic/Occupational Stress (per Section 7)
  NO_STRESS: { acwr_adjustment: 0.00 },
  LOW_STRESS: { acwr_adjustment: -0.05 },
  MODERATE_STRESS: { acwr_adjustment: -0.10 },
  HIGH_STRESS: { acwr_adjustment: -0.15 },
  CRITICAL_STRESS: { acwr_adjustment: -0.25 },

  // Specific triggers with Odds Ratios
  exam_period: {
    OR: 1.78,                  // 78% increased injury risk
    acwr_adjustment: -0.20,    // 0.20 threshold reduction
    duration_days: 14,
    confidence: 0.75,          // GAPS Vacío 4: Documented 3x multiplier
  },

  scholar_athlete_multiplier: 3.0, // 3x injury increase during exams

  // Life stress categories
  relationship_issues: { OR: 1.45, acwr_adjustment: -0.10 },
  financial_stress: { OR: 1.33, acwr_adjustment: -0.08 },
  sleep_deprivation: { OR: 2.10, acwr_adjustment: -0.15 },
};

// ============================================================
// SECTION 8: HIERARCHICAL PARAMETER RESOLUTION
// ============================================================
export const PARAMETER_HIERARCHY = {
  // Priority order when parameters conflict
  LEVEL_1: "subjective_wellbeing",  // Perceived fatigue (highest priority)
  LEVEL_2: "hrv_sleep",             // HRV + Sleep data
  LEVEL_3: "acwr",                  // ACWR metric (lowest priority)

  // Conflict resolution logic
  resolution_rules: {
    if_L1_bad_override_all: true,    // If athlete feels terrible, reduce load
    if_L1_good_check_L2: true,       // If good, check HRV/Sleep
    if_L2_bad_reduce_acwr: true,     // If HRV/Sleep poor, cap ACWR
    default_to_conservative: true,   // When uncertain, choose safety
  },
};

// ============================================================
// SECTION 9: ML/AI PREDICTION METRICS
// ============================================================
export const ML_PERFORMANCE_TARGETS = {
  // Target performance ranges (from research)
  AUC_range: { min: 0.66, max: 0.84 },
  sensitivity_range: { min: 0.537, max: 0.85 },  // 53.7%-85%
  specificity_range: { min: 0.62, max: 0.85 },   // 62%-85%
  f1_score_range: { min: 0.64, max: 0.85 },      // 64%-85%

  // Feature importance (predictive power)
  features_by_importance: [
    { name: "ACWR", importance: 0.35 },
    { name: "HRV_depression", importance: 0.25 },
    { name: "sleep_hours", importance: 0.20 },
    { name: "psych_stress", importance: 0.12 },
    { name: "T_C_ratio", importance: 0.08 },
  ],

  // Confidence caveat
  confidence_caveat: 0.80, // GAPS Vacío 5: ML precision illusion (19.4%-73.5% incidence variance)

  // Recommended models
  models: ["XGBoost", "Random Forest", "SVM"],
  sensitivity_over_specificity: true, // Prefer catching injuries over false alerts
};

// ============================================================
// SECTION 10: RETURN TO PLAY (RTP) PROTOCOL
// ============================================================
export const RTP_PROTOCOL = {
  steps: [
    {
      step: 1,
      name: "Complete Rest",
      duration_days: "3-5",
      acwr_limit: 0.00,
      description: "No training activity",
    },
    {
      step: 2,
      name: "Light Activity",
      duration_days: "3-5",
      acwr_limit: 0.30,
      description: "Walking, stretching, mobility work",
    },
    {
      step: 3,
      name: "Sport-Specific Training",
      duration_days: "3-5",
      acwr_limit: 0.60,
      description: "Technical drills, no intensity",
    },
    {
      step: 4,
      name: "Moderate Intensity",
      duration_days: "3-5",
      acwr_limit: 0.70,
      description: "60-70% effort, reduced volume",
    },
    {
      step: 5,
      name: "High Intensity",
      duration_days: "3-5",
      acwr_limit: 0.80,
      description: "80-90% effort, match demands",
    },
    {
      step: 6,
      name: "Full Return",
      duration_days: "ongoing",
      acwr_limit: 1.00,
      description: "Normal training load",
    },
  ],

  // Progression criteria
  progression_criteria: [
    "No return of symptoms",
    "ACWR within step limit",
    "Subjective wellbeing ≥ 7/10",
    "HRV stable (±15% of baseline)",
    "Sleep ≥ 7 hours",
  ],

  // Regression triggers
  regression_triggers: [
    "Pain/symptoms return",
    "ACWR exceeds step limit",
    "HRV depression >30%",
    "Sleep <6 hours sustained",
    "Subjective wellbeing <5/10",
  ],
};

// ============================================================
// SECTION 11: GAPS VALIDATION (Updated)
// ============================================================
export const RESEARCH_GAPS = {
  gap_1: {
    title: "ACWR Heterogeneity",
    description: "Window variance 21-28 days; EWMA assumes uniform recovery",
    confidence: 0.60,
    impact: "CRITICAL - affects all threshold calculations",
    mitigation: "Use both EWMA and SMA; alert on variance >5 days",
  },
  gap_2: {
    title: "OTS Biomarker Standardization",
    description: "T/C ratio not universally standardized; varies by sample type",
    confidence: 0.50,
    impact: "HIGH - OTS diagnosis unreliable across labs",
    mitigation: "Use athlete's personal baseline T/C, not absolute thresholds",
  },
  gap_3: {
    title: "Female Athlete Data Deficit",
    description: "Only 6% of sports science research focuses on women",
    confidence: 0.40,
    impact: "CRITICAL - menstrual cycle adjustments highly uncertain",
    mitigation: "Flag all female athletes as 'data uncertain'; use conservative thresholds",
  },
  gap_4: {
    title: "Academic Stress Impact",
    description: "Documented 3x injury multiplier during exam periods",
    confidence: 0.75,
    impact: "HIGH - psychosocial stress is real and measurable",
    mitigation: "Integrate stress survey into daily check-in",
  },
  gap_5: {
    title: "ML Precision Illusion",
    description: "Only 16% of studies report total accuracy; 19.4%-73.5% incidence variance across studies",
    confidence: 0.80,
    impact: "CRITICAL - model predictions unreliable without calibration",
    mitigation: "Add 'uncertainty honesty' to alerts; show confidence intervals",
  },
};

// ============================================================
// ALERT SEVERITY MAPPING
// ============================================================
export const ALERT_SEVERITY = {
  GREEN: {
    level: 0,
    label: "Safe",
    description: "All parameters normal",
    action: "Continue training",
    color: "#22c55e",
  },
  YELLOW: {
    level: 1,
    label: "Caution",
    description: "One or more parameters elevated",
    action: "Monitor closely; reduce load 10-20%",
    color: "#eab308",
  },
  RED: {
    level: 2,
    label: "Alert",
    description: "Multiple elevated parameters or single critical",
    action: "Reduce load 30-50%; consult coach",
    color: "#ef4444",
  },
  BLACK: {
    level: 3,
    label: "Emergency",
    description: "Multiple critical parameters; high lesion risk",
    action: "Complete rest; medical evaluation recommended",
    color: "#000000",
  },
};
