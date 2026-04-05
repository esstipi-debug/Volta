# VOLTA — Master Architecture Document

**Version:** 1.0
**Date:** 2026-04-05
**Platform:** Replit-native (Next.js 14 + Neon PostgreSQL + BullMQ)
**Status:** Sprint 1 MVP (Engines #01-#07 core, #08-#15 Phase 2)

---

## 📋 Table of Contents

1. [Visión General](#visión-general)
2. [Los 15 Engines](#los-15-engines)
3. [Data Flow](#data-flow)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Queue Jobs](#queue-jobs)
7. [Deployment](#deployment)

---

## 🎯 Visión General

**VOLTA** es una plataforma integral de inteligencia de rendimiento para CrossFit que previene lesiones, optimiza readiness, y gamifica adherencia sin sobreentrenamiento.

**Stack:**
- Frontend: Next.js 14 + React 18 + Tailwind CSS
- Backend: Node.js (Replit)
- Database: Neon PostgreSQL
- Queue: BullMQ + Upstash Redis
- Auth: NextAuth.js v5 (JWT)

**Usuarios:**
- **Atletas**: Ven readiness diario (0-100, 5 colores), ACWR risk, gamification (voltaje, racha, badges)
- **Coaches**: Monitorean múltiples atletas, reciben alertas de lesión, validan WODs en tiempo real

---

## 🔧 Los 15 Engines

### **BLOQUE 1: CORE PERFORMANCE (Engines #01-#04)**

#### **Engine #01 — StressEngine** ✅ Testeado
**Propósito:** Cuantificar carga de entrenamiento (IMR + Session Load)

**Entrada:**
- Movement (barbell, gymnastics, cardio)
- Sets × Reps × Weight
- Workout type (FOR_TIME, AMRAP, STRENGTH, etc.)
- sRPE (1-10)
- Warmup done

**Salida:**
- IMR (Intensity Magnitude Rating): `Σ(stress_coeff × weight × reps × sets) × WOD_type_multiplier`
- Session Load: `IMR × (sRPE / 10.0) × warmup_bonus`
- Cooldown zone (72h / 48h / 12h)

**Specs:**
- 60+ movimientos en catálogo
- Stress coefficients basados en biomecánica
- WOD type multipliers: FOR_TIME=1.10, AMRAP=1.05, EMOM=0.95, STRENGTH=0.90, etc.
- Airbike special: energy_vector (V1/V2/V3) con IMR estimado

**Tests:** 26/26 ✅

---

#### **Engine #02 — ACWR Calculator** ✅ Testeado
**Propósito:** Detectar riesgo de lesión (Acute:Chronic Workload Ratio)

**Entrada:**
- Athlete ID
- Date
- New session load (del Engine #01)

**Salida:**
- EWMA_acute (7-day moving average, λ=0.25)
- EWMA_chronic (28-day moving average, λ=0.069)
- ACWR ratio = acute / chronic
- Injury risk % (5-100%)
- Zone: underload / optimal / caution / danger
- Days in zone (para alertas)

**Zones:**
```
< 0.80    → underload (5% risk)
0.80-1.30 → optimal (15% risk)
1.30-1.50 → caution (30% risk)
> 1.50    → danger (50-100% risk, alert coach)
```

**Coach Alerts:**
- DANGER zone → immediate "urgent" alert
- CAUTION × 3 consecutive days → "caution" alert

**Tests:** 25/25 ✅

---

#### **Engine #03 — Banister Model** ✅ Testeado
**Propósito:** Modelar fitness + fatiga (performance readiness predictor)

**Entrada:**
- Previous Banister state (5 components)
- Session load
- Workout type (para fatigue distribution weights)
- Rest day flag

**Salida:**
- New state (fitness + 4 fatigue curves)
- Readiness score (0-100, normalized)
- Color state (green/blue/yellow/orange/red)

**Componentes:**
```
Fitness (τ=45d)        → λ=0.022 (slow gain, slow decay)
Fatigue_MEC (τ=18d)    → λ=0.054 (mechanical/muscular)
Fatigue_SNC (τ=8d)     → λ=0.118 (CNS, heavy lifts)
Fatigue_MET (τ=4d)     → λ=0.222 (metabolic, conditioning)
Fatigue_ART (τ=30d)    → λ=0.033 (articular, connective tissue)
```

**Readiness Formula:**
```
readiness_score = clamp(
  (K1 × fitness - K2 × total_fatigue) × SCALE + 50,
  0, 100
)
K1=1.0, K2=1.8, SCALE=8
```

**Fatigue Distribution por Workout Type:**
```
STRENGTH:  mec=0.40, snc=0.40, met=0.10, art=0.10
FOR_TIME:  mec=0.25, snc=0.15, met=0.45, art=0.15
AMRAP:     mec=0.25, snc=0.15, met=0.45, art=0.15
EMOM:      mec=0.25, snc=0.20, met=0.40, art=0.15
V1:        mec=0.10, snc=0.05, met=0.70, art=0.15 (aerobic)
V3:        mec=0.20, snc=0.30, met=0.35, art=0.15 (Wingate)
```

**Taper Effect:** Fatiga decae más rápido que fitness → readiness sube post-rest

**Tests:** 32/32 ✅

---

#### **Engine #04 — Readiness Engine** ✅ Testeado
**Propósito:** Score diario con adjustments (Banister + lifestyle + menstrual)

**Entrada:**
- Athlete ID, Date
- Session load, workout type (para Banister)
- Had session? (rest day flag)
- Sex (M/F para menstrual)
- Optional: biometric check-in (sleep, stress, legs)

**Salida:**
- Readiness score (0-100)
- Color state + recommendation text
- Mode: 1 (Banister only) o 2 (Banister + lifestyle)
- Fitness/fatiga scores granulares

**Modos:**
- **Modo 1 (Default):** Banister only, sin check-in requerido
- **Modo 2 (After 30 days):** Banister + lifestyle adjustments (sleep, stress, legs)

**Lifestyle Adjustments (Modo 2):**
```
Sleep:   <6h=-10, 6-7h=-4, 7-8h=0, 8+h=+5
Stress:  1=-0, 2=-2, 3=-4, 4=-6, 5=-8
Legs:    fresh=+3, normal=0, heavy=-6, destroyed=-12
Total:   -30 to +8
```

**Menstrual Periodization (Female Athletes):**
```
Phase 1 (Days 1-5,   Menstrual):   -8
Phase 2 (Days 6-13,  Follicular):   0
Phase 3 (Days 14-16, Ovulation):   +5 ← peak performance
Phase 4 (Days 17-28, Luteal):      -3
```

**Final Score:** `clamp(banister + lifestyle_adj + menstrual_adj, 0, 100)`

**Tests:** 21/21 ✅

---

### **BLOQUE 2: NUTRITION & RECOVERY (Engine #05)**

#### **Engine #05 — Nutrition Engine** ✅ Testeado
**Propósito:** Recomendaciones nutricionales minimalistas (proteína + calorías)

**Filosofía:** VOLTA no es app de tracking. Solo proporciona targets que atleta logea en MyFitnessPal/Cronometer. Agnóstico a apps externas.

**Entrada:**
- Athlete ID, Date
- Body weight (kg)
- Training intensity (light/moderate/intense/elite)
- ACWR zone (para recovery nutrition)
- Menstrual phase (si female)
- Goal (build/maintain/lose_fat)

**Salida:**
- Daily targets: calories, protein_g, carbs_g, fats_g
- Timing guidance: pre-WOD, post-WOD splits
- Hydration ML (35ml/kg + session_load adjustment)
- Recovery focus (human text)

**Macros Base (g/kg):**
```
LIGHT:     protein=1.2,  carbs=4,   fats=0.9
MODERATE:  protein=1.6,  carbs=5,   fats=1.0
INTENSE:   protein=2.0,  carbs=6,   fats=1.1
ELITE:     protein=2.2,  carbs=7,   fats=1.2
```

**Adjustments:**
- Menstrual: Phase 1=+5%, Phase 3 (ovulation)=+8%
- ACWR: danger=+15%, caution=+10%, optimal=0%, underload=-5%
- Goal: build=+500 kcal, maintain=0, fat_loss=-300 kcal

**External Sync:**
- Webhook desde MyFitnessPal/Cronometer
- Adherence scoring: target vs logged
- Score 0-3 (poor → excellent)

**Tests:** 33/33 ✅

---

### **BLOQUE 3: ATHLETE ADAPTATION (Engines #06-#07)**

#### **Engine #06 — Movement Escalation** ❓ (Pendiente)
**Propósito:** Recomendar scaling automático (Rx+/Rx/Beginner) basado en capacidad

**Entrada:**
- Athlete ID
- Movement ID
- Current 1RM
- Recent performance history (últimas 3 sesiones con este movimiento)
- Bodyweight

**Salida:**
- Recommended scale (Rx+, Rx, Beginner)
- Suggested weight override
- Confidence score (0-100)
- Reason (too easy, form at risk, new movement, etc.)

**Logic:**
```
IF (reps_last_3_sessions >= 95% of target) → escalate
IF (form_red_flags OR injury_cooldown_active) → downscale
IF (new_movement AND no_history) → start Beginner
```

**Integration:** Coach puede override, pero app sugiere automáticamente

**Expected Implementation:** ~200 líneas

---

#### **Engine #07 — Session Adaptation** ❓ (Pendiente)
**Propósito:** Adaptar WOD en tiempo real (substituciones, adjustments) basado en readiness + ACWR

**Entrada:**
- Athlete ID
- Date
- Readiness score (del Engine #04)
- ACWR zone (del Engine #02)
- Scheduled WOD template

**Salida:**
- Suggested WOD modifications:
  - Reduce volume (20-30% si readiness < 40)
  - Sub high-CNS movements (snatch → power clean si ACWR=caution)
  - Timing adjust (shorten si fatiga alta)
- Rationale

**Rules:**
```
IF readiness = red (0-24)   → offer recovery WOD (mobility/walk/rest)
IF readiness = orange       → reduce intensity 20-30%
IF readiness = yellow       → run as-is, option to scale
IF acwr = danger            → reduce high-CNS movements
IF acwr = caution × 3 days  → deload week suggestion
```

**Output:** Atleta puede aceptar, rechazar, o ignorar

**Expected Implementation:** ~250 líneas

---

### **BLOQUE 4: PROGRAMMING & COACHING (Engines #14, #16, #08)**

#### **Engine #14 — Programming Guide** ✅ Testeado
**Propósito:** Validador en tiempo real de WODs (Guardian engine)

**Entrada:**
- WOD propuesto (movimientos, sets, reps, weight)
- Historial de atleta (últimas 7-14 días)
- Menstrual phase (si female)

**Salida:**
- 3 simultaneous analyses:
  - **A) Cooldown Check:** green/yellow/red por CNS zone overlap
  - **B) Tenet Distribution:** weekly strength/conditioning/mobility vs CompTrain minimums
  - **C) ACWR Projection:** ¿cómo afecta este WOD al ACWR semanal?

**Results:**
```
GREEN:   proceed
YELLOW:  caution, consider modification
RED:     block, suggest alternative
```

**Tests:** 18/18 ✅

---

#### **Engine #16 — WOD Generator V2** ✅ Testeado
**Propósito:** Generar 5-6 WODs semana basado en gym criteria

**Entrada:**
- Box ID
- Week start date
- Sessions per week (5 o 6)
- Focus areas (strength/conditioning/mobility emphasis)
- Equipment available
- Athlete level distribution

**Salida:**
- 5-6 full WODs (uno por día)
- Cada WOD validado por Engine #14 internamente
- Si BLOCK/CAUTION → auto-swap movimiento, re-validate (max 3 intentos)

**Distribution Logic:**
- No 2 consecutive strength days
- Mobility mid-week
- Conditioning 3+ times/week
- Movement variety (no repeat in 14 days)

**Tests:** 30/30 ✅

---

#### **Engine #08 — Assessment Engine** ❓ (Pendiente)
**Propósito:** Evaluación periódica de capacidades (PRISMA VO2Max, 10D Radar Chart)

**Entrada:**
- Athlete ID
- Assessment type (PRISMA, 10D radar, movement mastery, etc.)
- Test results (watts, time, reps, etc.)

**Salida:**
- Attribute scores (0-100):
  - Aerobic endurance (V1), Aerobic power (V2), Anaerobic capacity (V3)
  - Absolute strength, Strength endurance, Power
  - Gymnastics capacity, Mobility, Mental resilience, Speed
- VO2Max estimate (PRISMA protocol)
- 10D radar chart data
- Progress vs 30/90 days ago

**PRISMA Protocol:**
```
5 × 5min @ FTP, 2min rest between
Measure: avg watts, NP (normalized power)
Estimate VO2Max = (NP / BW) × coefficient
```

**Expected Implementation:** ~300 líneas

---

### **BLOQUE 5: GAMIFICATION & RETENTION (Engine #09)**

#### **Engine #09 — Gamification Engine** ❓ (Pendiente)
**Propósito:** Voltaje, racha, badges, shields

**Entrada:**
- Athlete ID
- Session completed? (bool)
- Readiness color at session start
- PR achieved? (bool)
- Badge triggers (streak, pr, acwr recovery, etc.)

**Salida:**
- Voltaje earned (base 100 + multipliers)
- Racha updated (+1 day o reset)
- Badges earned (trigger & award)
- Shield consumed? (optional)
- Next milestone hint

**Voltaje Multipliers:**
```
Base:         100
Readiness:    green=1.5×, blue=1.2×, yellow=1.0×, orange=0.8×, red=0.5×
PR:           +200
Streak:       day N = 1 + (N-1)×0.1 (capped at 2.0x)
Warmup done:  +10
```

**Badges (por rarity):**
- Common: first_wod, first_pr, streak_7, calories_1k
- Rare: acwr_recovery, menstrual_ovulation_pr, 21_racha
- Epic: 100_sessions, triple_pr_week, perfect_adherence_month
- Legendary: 1_year_athlete, no_missed_day_6mo

**Shields:** Protegen racha si falta día (máx 1/mes)

**Expected Implementation:** ~350 líneas

---

### **BLOQUE 6: RECOVERY & COACHING SUPPORT (Engines #10-#13)**

#### **Engine #10 — Recovery Optimizer** ❓ (Pendiente)
**Propósito:** Recomendaciones de recuperación (sleep, mobility, deload)

**Entrada:**
- Athlete readiness score
- ACWR zone
- Sleep history (últimos 7 días)
- Injury history (cooldowns activos)

**Salida:**
- Sleep target (8-9h si fatiga alta)
- Mobility focus (2-3 areas)
- Deload suggestion (si ACWR > 1.4 × 5 días)
- Supplement suggestions (creatine, magnesium, etc.)

**Expected Implementation:** ~250 líneas

---

#### **Engine #11 — Injury Predictor** ❓ (Pendiente)
**Propósito:** Predict lesión con ML (futuro, Phase 2)

**Entrada:**
- ACWR history (últimas 8 semanas)
- Readiness trend (declining?)
- Movement asymmetries (1RM imbalances)
- Age + sex + CF experience

**Salida:**
- Injury risk % (próximas 2 semanas)
- Body part at risk (shoulder, knee, lower back, etc.)
- Preventive exercises

**Note:** Require ML model (logistic regression baseline)

**Expected Implementation:** ~400 líneas (with model training)

---

#### **Engine #12 — Coach Intelligence** ❓ (Pendiente)
**Propósito:** Alertas + recomendaciones para coach (macro-level)

**Entrada:**
- Box athletes (multiple)
- Weekly programming
- Injury alerts, ACWR cautions
- Box metrics (attendance, PR rate, etc.)

**Salida:**
- Athletes needing intervention (top 5)
- Programming balance (tenet distribution)
- Box leaderboards (voltaje, racha, badges)
- Trend alerts (declining adherence, etc.)

**Expected Implementation:** ~300 líneas

---

#### **Engine #13 — Periodization Advisor** ❓ (Pendiente)
**Propósito:** Macro cycles (strength blocks, deloads, peaks)

**Entrada:**
- Athlete goals (compete soon? just for fun?)
- Competition dates
- Historical performance (12-week rolling)

**Salida:**
- Suggested periodization (12-week blocks)
- When to peak, when to deload
- Taper week recommendations (3-4 weeks pre-competition)

**Expected Implementation:** ~250 líneas

---

### **BLOQUE 7: SPECIAL (Engine #15)**

#### **Engine #15 — Menstrual Periodization** ❓ (Pendiente)
**Propósito:** Optimize training specificity for menstrual cycle phases

**Entrada:**
- Athlete menstrual history
- Current phase + day in cycle
- Goals (strength? endurance?)

**Salida:**
- Workout recommendation (type, intensity)
- Nutrition priority (carb-loading in luteal, etc.)
- Recovery emphasis

**Phases:**
```
Phase 1 (Menstrual):    low hormones → strength focus, moderate volume
Phase 2 (Follicular):   rising estrogen → VO2max, conditioning focus
Phase 3 (Ovulation):    peak estrogen & progesterone → peak performance, PR attempts
Phase 4 (Luteal):       declining hormones → endurance, higher volume
```

**Expected Implementation:** ~200 líneas

---

## 📊 Data Flow

```
ATLETA LOGS SESIÓN
    ↓
[Engine #01] StressEngine → IMR + Session Load
    ↓
[Engine #02] ACWR Calculator → ACWR ratio + injury risk
    ↓
[Engine #03] Banister Model → fitness + fatigue
    ↓
[Engine #04] Readiness Engine → readiness score + color
    ↓
[Engine #05] Nutrition → protein/calories targets
    ↓
[Engine #06] Movement Escalation → suggest scale
    ↓
[Engine #07] Session Adaptation → suggest WOD modifications
    ↓
[Engine #09] Gamification → voltaje + racha + badges
    ↓
[Engine #10] Recovery Optimizer → sleep/mobility/deload tips
    ↓
[Engine #11] Injury Predictor → lesión risk
    ↓
DASHBOARD ACTUALIZADO (readiness, ACWR, gamification)
```

**Coach Side:**
```
COACH CREA WOD
    ↓
[Engine #14] Programming Guide → validation (cooldown/tenet/acwr)
    ↓
IF valid → WOD guardado
IF caution → coach revisa
IF error → bloqueado, suggestion
    ↓
[Engine #16] WOD Generator (V2) → auto-generate week
    ↓
[Engine #12] Coach Intelligence → alerts + leaderboards
```

---

## 🗄️ Database Schema

**BLOQUE 1: USUARIOS**
```sql
users, profiles, boxes, athlete_profiles, coach_profiles
```

**BLOQUE 2: ENTRENAMIENTOS**
```sql
wod_templates, wod_movements, training_sessions, session_movements, session_intervals
athlete_1rms, personal_records
```

**BLOQUE 3: PERFORMANCE**
```sql
acwr_daily, readiness_daily, biometric_daily, menstrual_cycles
athlete_attribute_scores (PRISMA, 10D radar)
```

**BLOQUE 4: NUTRICIÓN**
```sql
nutrition_recommendations, nutrition_adherence
```

**BLOQUE 5: GAMIFICACIÓN**
```sql
athlete_gamification, badge_definitions, athlete_badges, voltaje_transactions, racha_history
```

**BLOQUE 6: COACHING**
```sql
coach_alerts, athlete_scaling_overrides, box_challenges, challenge_participants
programming_weekly_state (cache para Engine #16)
```

**BLOQUE 7: SISTEMA**
```sql
push_subscriptions, (queue jobs via BullMQ in Redis)
```

---

## 🔌 API Endpoints

### **Engine Endpoints**

```
POST /api/engines/stress-engine
→ Calcula IMR + Session Load

GET/POST /api/engines/acwr
→ Obtiene/calcula ACWR diario

GET/POST /api/engines/readiness
→ Obtiene/calcula readiness + color

GET/POST /api/engines/nutrition
→ Calcula targets nutricionales

POST /api/engines/nutrition/adherence
→ Sincroniza datos logueados

GET/POST /api/engines/movement-escalation
→ Recomienda scale

GET/POST /api/engines/session-adaptation
→ Adapta WOD en tiempo real

POST /api/engines/programming-guide
→ Valida WOD propuesto

POST /api/engines/wod-generator
→ Genera semana de WODs

POST /api/engines/gamification
→ Calcula voltaje + badges
```

### **Dashboard Endpoints**

```
GET /api/athlete/dashboard
→ Readiness + ACWR + gamification + nutrition + recommendations

GET /api/coach/dashboard
→ Athletes list + alerts + programming balance + leaderboards
```

---

## ⚙️ Queue Jobs (BullMQ)

```javascript
// Runs nightly @ 00:00 UTC

"calculate-readiness"     → Engine #04 para todos athletes
"calculate-acwr"          → Engine #02 (post-session)
"score-nutrition-day"     → Engine #05 adherence check
"recover-optimizer"       → Engine #10 sleep/mobility tips
"injury-predictor"        → Engine #11 risk scoring
"coach-intelligence"      → Engine #12 alerts generation
"periodization-check"     → Engine #13 cycle recommendations
"wod-generator-weekly"    → Engine #16 (Monday 6am)
"gamification-update"     → Engine #09 (daily + session-based)
```

---

## 🚀 Deployment

### **Phase 1 (MVP, Current)**
- Engines: #01, #02, #03, #04, #05, #14, #16
- Tests: 7/7 engines (185+ tests)
- Deploy: Replit Free tier
- Timeline: 2-3 weeks

### **Phase 2 (Growth)**
- Add: Engines #06, #07, #08, #09, #10
- Polish: UI/UX, mobile responsive
- Deploy: Replit Pro + Neon Pro
- Timeline: 4-6 weeks

### **Phase 3 (Scale)**
- Add: Engines #11, #12, #13, #15
- ML model training (Injury Predictor)
- Advanced analytics dashboard
- Deploy: Vercel (frontend) + AWS RDS (if needed)
- Timeline: 8-12 weeks

---

## 💡 Key Design Principles

1. **Low Friction:** Agnóstico a apps, integra via webhook/API
2. **Science-Backed:** Basado en Banister, EWMA, menstrual periodization, etc.
3. **Gamification:** Voltaje + racha = hábitos sin sobreentrenamiento
4. **Coach-Centric:** Alertas inteligentes, validation en tiempo real
5. **Mobile-First:** Responsive design, push notifications
6. **Scalable:** Queue-based, PostgreSQL indexes, Redis caching

---

**Generated:** 2026-04-05
**Architect:** VOLTA Team
**Next Review:** Sprint 2 kickoff
