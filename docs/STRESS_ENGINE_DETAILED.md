# VOLTA Stress Engine - Detailed Implementation

## Overview

The Stress Engine calculates **Intensity Magnitude Rating (IMR)** for each workout, then uses ACWR (Acute:Chronic Workload Ratio) to detect injury risk.

---

## Step 1: Calculate IMR (Intensity Magnitude Rating)

### Formula
```
IMR = Σ (stress_coefficient × weight × reps) for all barbell movements
      + adjustments for density, workout type, and monostructural movements
```

### Example: "Fran" (21-15-9 Thrusters @ 95lbs + Pull-ups)

```json
{
  "workout": "Fran",
  "movements": [
    {
      "movement": "Thrusters",
      "stress_coefficient": 1.05,
      "weight_lbs": 95,
      "total_reps": 45,
      "base_imr": "1.05 × 95 × 45 = 4,498"
    },
    {
      "movement": "Pull-ups",
      "stress_coefficient": 1.0,
      "weight": "bodyweight",
      "total_reps": 45,
      "base_imr": "~500 (bodyweight adjustment)"
    },
    {
      "subtotal": 4998
    }
  ],
  "workout_type": "for_time",
  "type_multiplier": 1.0,
  "density_adjustment": {
    "total_reps": 90,
    "time_minutes": 7.6,
    "reps_per_minute": 11.8,
    "density_factor": 1.05,
    "note": "Fast pace = 5% stress boost"
  },
  "final_imr": "4,998 × 1.0 × 1.05 = 5,248"
}
```

---

## Step 2: Adjust by Workout Type

Each workout type has a **stress multiplier** based on intensity demand:

| Workout Type | Multiplier | Reason |
|--------------|-----------|--------|
| AMRAP | 1.15 | Race-pace demands high intensity |
| For Time | 1.0 | Moderate intensity, fixed volume |
| EMOM | 0.85 | Built-in rest reduces overall stress |
| Strength | 1.3 | High CNS demand, low reps |
| Chipper | 1.05 | High volume, moderate intensity |
| Interval | 1.2 | Anaerobic threshold work |
| Long Slow Distance | 0.6 | Recovery-building, low stress |

### Applied to Fran:
```
Fran is "For Time" → IMR = 5,248 × 1.0 = 5,248
```

---

## Step 3: Account for Density

**Density** = Total Reps / Time in Minutes

Faster completion = higher physiological stress = adjust IMR upward

```
Fran example:
- Total reps: 90
- Time: 7 min 36 sec = 7.6 min
- Density: 90 / 7.6 = 11.8 reps/min

Density benchmark for Fran: ~10-12 reps/min is "good" pace
- 11.8 reps/min = slightly fast = +5% stress bonus
- Final IMR: 5,248 × 1.05 = 5,510
```

---

## Step 4: Handle Monostructural Movements

**Monostructural** = single movement for sustained time/distance (Running, Rowing, Biking)

These are calculated separately using **time × intensity**:

```json
{
  "movement": "2000m Row",
  "stress_coefficient": 0.7,
  "distance_meters": 2000,
  "time_seconds": 480,
  "pace_factor": 1.0,
  "imr": "0.7 × (2000 / 480) × 480 = 1,400"
}
```

For **Zone 2 cardio** (recovery):
```
IMR reduction: × 0.6 (lowest stress)
```

---

## Step 5: Build Daily IMR

Combine all movements in a single session:

```python
daily_imr = sum([
    barbell_imr,
    gymnastics_imr,  # pull-ups, muscle-ups, etc (low stress)
    monostructural_imr,
    metabolic_imr  # burpees, box jumps, etc
]) × workout_type_multiplier × density_adjustment
```

---

## Step 6: Calculate ACWR (Acute:Chronic Workload Ratio)

### Formula
```
ACWR = Sum of last 7 days IMR / Sum of last 28 days IMR
```

### Zones
- **0.8-1.3**: OPTIMAL ✅
- **1.3-1.5**: CAUTION ⚠️ (2x injury risk)
- **>1.5**: DANGER 🚨 (4x injury risk)

### Example:
```
Day 1-4: Normal training
- Day 1 IMR: 3,000
- Day 2 IMR: 2,500
- Day 3 IMR: 3,500
- Day 4 IMR: 2,000
- 7-day sum: ~10,000

- 28-day sum: ~35,000 (historical average)

ACWR = 10,000 / 35,000 = 0.29... wait, this is LOW

Real example with buildup:
- Last 7 days (high training): 28,000
- Last 28 days average: 22,000
- ACWR = 28,000 / 22,000 = 1.27 ✅ (Optimal but approaching caution)

System alert: "Approaching caution zone. Reduce volume by 15% tomorrow or risk injury."
```

---

## Step 7: Factor in Recovery Data

**Recovery Score** = (Sleep + Fatigue Inverse + Pain Inverse) / 3

```json
{
  "sleep_hours": 6.5,
  "sleep_score": 0.65,
  "fatigue_1_5": 4,
  "fatigue_score": 0.2,
  "pain_1_5": 2,
  "pain_score": 0.6,
  "recovery_score": (0.65 + 0.2 + 0.6) / 3 = 0.48 (POOR)
}
```

**Adjust ACWR Risk:**
```
If Recovery Score < 0.5 (poor):
  - Move into CAUTION zone if ACWR > 1.2
  - Move into DANGER zone if ACWR > 1.4

If Recovery Score > 0.8 (excellent):
  - Allow ACWR up to 1.5 safely
```

---

## Step 8: Apply Menstrual Periodization (if applicable)

**Automatic adjustments by cycle phase:**

```
Follicular Phase (Days 1-14): Normal stress handling
  ACWR limit: 1.5

Luteal Phase (Days 15-28): Reduced recovery
  IMR reduction: -15%
  ACWR limit: 1.2 (tighter threshold)

Late Luteal Phase (Days 21-28): Maximum caution
  IMR reduction: -20%
  ACWR limit: 1.1
  Recovery needed: Extra sleep, mobility focus
```

**Example:**
```
Same Fran (IMR 5,510) in different phases:

Follicular: IMR = 5,510 × 1.0 = 5,510
Luteal: IMR = 5,510 × 0.85 = 4,684
Late Luteal: IMR = 5,510 × 0.80 = 4,408

Same workout, different stress impact!
```

---

## Step 9: Generate Recommendation

Based on ACWR + Recovery + Menstrual Phase:

```python
if acwr > 1.5 or (acwr > 1.3 and recovery_score < 0.5):
    recommendation = "RED DAY"
    action = "Light movement, avoid strength work"
    suggested_workout = generate_alternative_wod()

elif acwr > 1.2 or (acwr > 1.1 and recovery_score < 0.6):
    recommendation = "YELLOW DAY"
    action = "Reduce volume 20%, maintain intensity"

else:
    recommendation = "GREEN DAY"
    action = "Normal training, can push if feeling good"
```

---

## Example: Full Weekly ACWR Progression

```
Monday:  IMR 5,500 → ACWR 0.92 ✅ (GOOD)
Tuesday: IMR 3,200 → ACWR 0.94 ✅ (GOOD)
Wednesday: IMR 4,800 → ACWR 1.05 ✅ (GOOD)
Thursday: IMR 6,200 → ACWR 1.18 ✅ (GOOD, approaching)
Friday: IMR 5,900 → ACWR 1.27 ⚠️ (CAUTION ZONE)
  System: "ACWR at 1.27. Tomorrow: Reduce volume 20%"
Saturday: IMR 4,500 (scaled) → ACWR 1.22 ⚠️ (Still high)
  System: "Still in caution. Consider active recovery Sunday."
Sunday: Light yoga, 30min Zone 2 run → ACWR drops next week

Next Monday: IMR 5,200 → ACWR 1.15 ✅ (Back to optimal)
```

---

## Data Storage Schema

```sql
training_sessions
├── id (UUID)
├── athlete_id (FK)
├── date
├── workout_type (ENUM: amrap, for_time, emom, etc)
├── movements (JSON array of MovementExecution)
├── result (JSON: time, reps, notes)
├── imr_score (FLOAT) -- Auto-calculated
├── estimated_stress (FLOAT) -- For logging
└── was_scaled (BOOL)

athlete_metrics
├── athlete_id (FK)
├── date
├── acwr_7day (FLOAT)
├── acwr_28day (FLOAT)
├── current_acwr (FLOAT)
├── acwr_zone (ENUM: optimal, caution, danger)
├── recovery_score (FLOAT, 0-1)
├── recommendation (TEXT)
└── generated_at (TIMESTAMP)
```

---

## Stress Engine Limitations & Notes

✅ **Reliable for:**
- Barbell movements (high precision)
- Workout type classification
- Density adjustment
- ACWR trending

⚠️ **Requires user input for accuracy:**
- Actual weights lifted (can't infer from photos)
- Actual reps/time (OCR not 100%)
- Movement variations (Kipping vs Strict pull-ups have different stress)
- Scaling applied (must be logged manually)

❌ **Cannot predict without more data:**
- Individual injury thresholds (vary by athlete)
- Specific injury likelihood (use ACWR as indicator, not diagnosis)
- Recovery needs (depends on sleep quality, stress, age, etc)

---

## Implementation Checklist

- [ ] Create `movement_catalog.json` with all movements + stress coefficients
- [ ] Create `workout_types.json` with type multipliers
- [ ] Create `training.py` schema with validated input structure
- [ ] Implement IMR calculation service
- [ ] Implement ACWR calculation (7/28 day rolling)
- [ ] Implement recovery score integration
- [ ] Implement menstrual periodization logic
- [ ] Create recommendation engine
- [ ] Build API endpoint: POST /training/sessions (record WOD)
- [ ] Build API endpoint: GET /athlete/{id}/metrics (get ACWR + recommendation)
- [ ] Add logging of ACWR history for trend analysis
- [ ] Build alert system for ACWR thresholds

---

**Last Updated**: 2026-03-03
**Version**: 1.0
