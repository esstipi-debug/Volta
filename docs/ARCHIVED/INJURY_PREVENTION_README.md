# Injury Prevention System - Implementation Guide

## 📁 Files Created

```
src/lib/
├── injury-prevention-params.ts    (850+ lines) - All parameters from research
├── alert-system.ts                (520 lines)  - Alert generation engine
└── movement-escalation.ts         (700 lines)  - Movement substitution system

src/api/
└── injury-prevention-endpoint.ts  (Integration example for Next.js)
```

---

## 🔄 Data Flow

```
Athlete Data Input
    ↓
[Alert System] → Generates injury risk alert
    ├─ Checks subjective wellbeing (LEVEL 1)
    ├─ Calculates adjusted ACWR (demographics + stress)
    ├─ Evaluates HRV, OTS, Sleep thresholds
    ├─ Applies hierarchical resolution
    └─ Output: AlertResult {severity, recommendations, confidence}
    ↓
[Escalation Engine] → Movement modifications
    ├─ Maps current movements to safe alternatives
    ├─ Returns 3-level progressions (Rx+, Rx, Beginner)
    └─ Output: EscalationRecommendation {modifications, RTP step}
    ↓
API Response → Dashboard Display
```

---

## 🎯 Key Features

### 1. **Hierarchical Parameter Resolution** (Section 8)
- **Level 1:** Subjective Wellbeing (overrides all if <3/10)
- **Level 2:** HRV + Sleep data (secondary)
- **Level 3:** ACWR metric (tertiary)
- **Rule:** Always choose conservative option when uncertain

### 2. **Demographic Adjustments** (Section 6)
- Menstrual cycle: -0.20 ACWR in luteal phase (40% confidence)
- Age >35: -0.15 ACWR adjustment (70% confidence)
- Training age: 0-6 months = -0.25 ACWR
- Psychosocial stress: Academic exams 3x injury multiplier (75% confidence)

### 3. **Thresholds Implemented** (Sections 2-4)
- ACWR: Safe <0.60, Warning 0.60-0.80, Critical >1.50
- HRV: >30% depression sustained 7+ days = YELLOW alert
- OTS: T/C ratio <0.35 = clinical OTS (BLACK alert)
- Sleep: <6 hours = 150% injury risk multiplier

### 4. **Return to Play (RTP) Protocol** (Section 10)
- 6-step progression with ACWR limits
- Step 1: Complete rest (ACWR 0.00)
- Step 3: Sport-specific training (ACWR <0.60)
- Step 5: High intensity (ACWR <0.80)
- Step 6: Full return (ACWR normal)

### 5. **Movement Escalations** (Section 5)
- 30+ CrossFit movements with 3-level modifications
- Examples: Back Squat → Goblet Squat → Box Squat
- Biomechanical reasoning for each escalation

### 6. **Uncertainty Honesty** (Section 11 - GAPS)
- GAPS 1: ACWR heterogeneity (60% confidence)
- GAPS 3: Female athlete data deficit (40% confidence)
- GAPS 5: ML precision variance (80% confidence)
- UI should display confidence intervals + caveats

---

## 📊 Alert Severity Levels

| Level | Label     | ACWR   | Action                              | Color   |
|-------|-----------|--------|-------------------------------------|---------|
| 0     | GREEN     | <0.60  | Continue normal training            | 🟢      |
| 1     | YELLOW    | 0.60-0.80 | Reduce load 10-20%; monitor daily   | 🟡      |
| 2     | RED       | 0.80-1.50 | Reduce load 30-50%; consult coach   | 🔴      |
| 3     | BLACK     | >1.50  | Complete rest; medical evaluation   | ⚫      |

---

## 💻 Usage Example

```typescript
import { InjuryPreventionAlertSystem } from '@/lib/alert-system';
import { MovementEscalationEngine } from '@/lib/movement-escalation';

const alertSystem = new InjuryPreventionAlertSystem();
const escalationEngine = new MovementEscalationEngine();

// Athlete data from biometrics API
const athlete = {
  athleteId: 'ATH_001',
  acwr: 1.2,
  hvr_lnRMSSD: 3.1,
  hrv_baseline: 3.8,
  sleep_hours: 6,
  subjective_wellbeing: 4,
  age: 28,
  training_age_months: 36,
  menstrual_phase: 'luteal',
  t_c_ratio: 0.42,
  academic_stress: 'critical',
};

// Generate injury alert
const alert = alertSystem.generateAlert(athlete);
// Result: {severity: 'BLACK', confidence: 92, recommendations: [...]}

// Get movement recommendations
const escalation = escalationEngine.getEscalationByAlert(
  athlete.athleteId,
  alert.severity,
  ['back_squat', 'deadlift', 'running']
);
// Result: {rtp_step: 1, recommended_modifications: [...]}
```

---

## 🔬 Research Sources

All parameters extracted from 11-section research document:

- **Section 2:** ACWR dynamics, EWMA calculation, HR zones
- **Section 3:** HRV biomarcering, sleep impact, LnRMSSD thresholds
- **Section 4:** OTS clinical diagnosis, T/C ratio, biomarkers
- **Section 5:** CrossFit injury epidemiology, movement patterns
- **Section 6:** Demographic variations (menstrual, age, training age)
- **Section 7:** Psychosocial stress (academic, occupational, relationship)
- **Section 8:** Hierarchical parameter resolution matrix
- **Section 9:** ML/AI metrics (AUC, sensitivity, specificity)
- **Section 10:** RTP 6-step protocol with ACWR progression
- **Section 11:** GAPS validation (5 knowledge gaps, confidence levels)

---

## ⚠️ Implementation Notes

### Database Schema Needed
```sql
CREATE TABLE athlete_daily_metrics (
  id UUID PRIMARY KEY,
  athlete_id UUID REFERENCES athletes(id),
  date DATE,
  acwr DECIMAL(4,2),
  hrv_lnRMSSD DECIMAL(4,2),
  sleep_hours DECIMAL(3,1),
  subjective_wellbeing INT (1-10),
  t_c_ratio DECIMAL(4,2),
  academic_stress VARCHAR(20),
  alert_severity VARCHAR(10),
  alert_confidence INT,
  created_at TIMESTAMP
);
```

### API Endpoint
- POST `/api/injuries/check-alert` - Generate injury alert
- GET `/api/injuries/athlete/:id/history` - Alert history
- PUT `/api/injuries/athlete/:id/acknowledge` - Acknowledge alert

### Queue Integration (Optional)
- Store alerts in Redis with TTL (24 hours)
- Background job: Calculate ACWR daily (Section 2 EWMA)
- Webhook: Notify coach on RED/BLACK alerts

---

## 🚀 Next Steps

1. ✅ Parameters extracted → injury-prevention-params.ts
2. ✅ Alert engine built → alert-system.ts
3. ✅ Movements escalation → movement-escalation.ts
4. ⏭️ Create UI components (Alert display, Movement modal)
5. ⏭️ Integrate with Supabase (save alerts, metrics)
6. ⏭️ Build coach notification system
7. ⏭️ Deploy to Replit

---

## 📞 Uncertainty Caveats

⚠️ **Always display to athlete:**
- Confidence percentage (92%, 65%, etc.)
- Which GAPS apply to their data
- Recommendation: "Use conservative thresholds"

❌ **DON'T say:**
- "You're 92% likely to get injured"
- "This model is 84% accurate"

✅ **DO say:**
- "Alert has 92% confidence"
- "Female athletes: data is uncertain (40% confidence)"
- "If HRV drops persist >7 days, escalate to RED"

---

Generated: 2026-03-09
Research Validation: 11 sections + GAPS updated
Confidence: 60%-80% across parameters
