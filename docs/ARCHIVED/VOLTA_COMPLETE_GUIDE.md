# 📘 VOLTA - Guía Completa del Proyecto

**Versión**: 0.1.0 MVP
**Última actualización**: 2026-03-08
**Estado**: En desarrollo (Semana 1-2)

---

## 🎯 Tabla de Contenidos

1. [Visión del Proyecto](#visión-del-proyecto)
2. [El Problema](#el-problema)
3. [La Solución](#la-solución)
4. [Pilares Técnicos](#pilares-técnicos)
5. [Arquitectura del Sistema](#arquitectura-del-sistema)
6. [Componentes Principales](#componentes-principales)
7. [Cómo Funciona](#cómo-funciona)
8. [Stack Tecnológico](#stack-tecnológico)
9. [Base de Datos](#base-de-datos)
10. [Experiencia del Usuario](#experiencia-del-usuario)
11. [Roadmap Implementación](#roadmap-implementación)
12. [Ejemplos Prácticos](#ejemplos-prácticos)
13. [Métricas de Éxito](#métricas-de-éxito)

---

## 🚀 Visión del Proyecto

### ¿Qué es VOLTA?

**VOLTA** = **B**olt + **Vector** + **Cross** Training **Trainer** **OR** (Inteligencia de Rendimiento en CrossFit)

Un asistente inteligente de IA para CrossFit que actúa como el "Cerebro de Rendimiento" del atleta, capaz de:

- 🧠 **Entender** el estado completo del atleta en tiempo real
- 📊 **Calcular** la carga de trabajo (ACWR) y riesgo de lesión
- 📉 **Predecir** cuándo está en peligro ANTES de que se lesione
- 💡 **Recomendar** dinámicamente qué hacer cada día
- 📈 **Visualizar** el progreso a través de múltiples dimensiones

### Misión

> Prevenir lesiones en atletas de CrossFit mediante detección temprana de sobrecarga y ajustes dinámicos de entrenamiento, manteniendo el rendimiento máximo.

### Visión a Largo Plazo

Un sistema que:
- Funciona sin horarios fijos (atletas capturan datos cuando quieren)
- Entiende las particularidades del CrossFit (movimientos variados, modos de entrenamiento diversos)
- Se adapta a cada atleta individualmente (ciclos menstruales, genética, historial de lesiones)
- Funciona en Telegram (donde viven los atletas)
- Proporciona insights visuales en web y datos en tiempo real

---

## 🔴 El Problema

### Realidad Actual en CrossFit

**Problema 1: Falta de Monitoreo Real**
```
Entrenador tiene 20 atletas.
Mira el WOD que hizo cada uno.
Pero NO SABE:
├─ Cuántas horas durmieron
├─ Cuál es su carga acumulada
├─ Si están en riesgo de lesión
├─ Cuándo el volumen es demasiado
└─ Cuándo podrían romper algo

Resultado: Lesiones inesperadas, retiros de temporada
```

**Problema 2: Atletismo Ciego**
```
El atleta entrena:
├─ Lunes: Fuerte (11,800 IMR)
├─ Martes: Ligero (700 IMR)
├─ Miércoles: Fuerte (11,800 IMR) ← CARGA ACUMULADA!
├─ Jueves: Sigue normal
└─ Viernes: Dolor de espalda (¿por qué?)

No entiende que su ACWR subió a 1.5 (PELIGRO).
Entrenó exacto igual pero la recuperación fue pobre.
Nadie le dijo que redujera volumen.
```

**Problema 3: Heterogeneidad**
```
CrossFit no es homogéneo:
├─ Barbell Squats (estrés: 1.1)
├─ Muscle-ups (estrés: 1.3)
├─ Rowing (estrés: 0.7)
├─ Running (estrés: 0.75)
├─ Gymnastics (estrés: 1.0-1.3)
└─ Metcon (combinación de todo)

No hay fórmula única. Un AMRAP no es igual a un Chipper.
Un "Fran" pesado != un "Fran" ligero.
Necesitas coefficients específicos por movimiento + tipo de WOD.
```

**Problema 4: Ciclos Menstruales Ignorados**
```
Atletas mujeres tienen ciclos de 28 días.
Su capacidad varía:

Fase Folicular:  +15% capacidad aeróbica
Fase Ovulación:  +8% fuerza
Fase Lútea:      -10% capacidad (pero +8% fuerza)
Fase Menstrual:  -20% capacidad

El sistema entrena igual todos los días.
Resultado: Sobrecarga en fase menstrual, rendimiento perdido.
```

**Problema 5: Decisiones Reactivas**
```
Atleta entra al box con dolor.
Entrenador dice: "Calienta bien"
Atleta se lesiona.

Nadie predijo que estaba en DANGER zone (ACWR > 1.5).
Nadie recomendó escalar el WOD.
Todo fue reactivo, no predictivo.
```

---

## ✅ La Solución

### VOLTA Resuelve Todo Esto

#### 1. Monitoreo sin Fricción
```
Atleta abre Telegram cuando quiera:
[📝 Añadir Datos] → 30 segundos
├─ ¿Cuántas horas dormiste? (botones)
├─ ¿Estrés? (1-5 slider)
└─ ¿Dolor muscular? (1-5 slider)

Sistema calcula automáticamente:
├─ Recovery Score (0-1)
├─ Carga acumulada
├─ Tendencia ACWR
└─ Recomendación para hoy
```

#### 2. Stress Engine Automático
```
Atleta termina WOD, toma foto o escribe resultado.
Sistema calcula:

IMR = Σ (stress_coefficient × weight × reps) × type_multiplier × density_factor

Ejemplo (Fran):
├─ 21 Thrusters @ 95lbs = 1.05 × 95 × 21 = 2,099
├─ 15 Thrusters @ 95lbs = 1.05 × 95 × 15 = 1,499
├─ 9 Thrusters @ 95lbs = 1.05 × 95 × 9 = 900
├─ 45 Pull-ups @ BW(80kg) = 1.0 × 80 × 45 = 3,600
├─ Subtotal = 8,098
├─ Densidad (completado en 7.6 min = 11.8 reps/min) = +5%
├─ For Time multiplier = 1.0
└─ FINAL IMR = 8,098 × 1.0 × 1.05 = 8,503

ACWR = (7-day sum) / (28-day avg)
Si está > 1.5: PELIGRO → Escalar WOD mañana
Si está 1.2-1.5: CAUTION → Reducir volumen
Si está < 1.2: ÓPTIMO → Poder atacar
```

#### 3. Coeficientes Específicos por Movimiento
```
Extraídos de:
├─ Mayhem Athlete Scaling Doc
├─ CompTrain 2025 Training Methodology
└─ Validación con atletas de elite

Barbell:
├─ Squat/Deadlift: 1.1-1.2 (pesado, demanda CNS)
├─ Press: 0.9-1.0 (menos estrés)
└─ Power Clean: 1.2 (explosivo, técnico)

Gymnastics:
├─ Muscle-up: 1.3 (máximo estrés)
├─ Handstand PU: 1.15 (técnico)
├─ Pull-up: 1.0 (baseline)
└─ Rope climb: 1.0

Cardio:
├─ Row: 0.7 (menos estrés)
├─ Run: 0.75 (estrés moderado)
├─ Bike: 0.7 (menos estrés)
└─ Double unders: 0.7-0.8

Metabolic:
├─ Burpees: 0.8 (estrés alto)
├─ Box jumps: 0.85
└─ Weighted carries: 0.95-1.05
```

#### 4. Ajustes por Ciclo Menstrual
```
Si atleta reporta ciclo:

Día 1-5 (Menstrual):
└─ Intensidad: ×0.85 (cuerpo en recuperación)

Día 6-14 (Folicular):
└─ Intensidad: ×1.15 (mejor capacidad aeróbica)

Día 15-17 (Ovulación):
└─ Intensidad: ×1.10 (mejor fuerza)

Día 18-28 (Lútea):
└─ Intensidad: ×0.95 (mayor fatiga potencial)

El sistema automáticamente:
├─ Ajusta recomendaciones de carga
├─ Sugiere qué enfatizar hoy
└─ Predice cuándo presionar, cuándo cuidarse
```

#### 5. Decisiones Predictivas
```
Lunes: ACWR = 0.92 (verde) ✅
├─ Sistema: "Puedes atacar"

Martes: ACWR = 0.94 (verde) ✅
├─ Sistema: "Sigue normal"

Miércoles: ACWR = 1.05 (verde) ✅
├─ Sistema: "Empieza a acumular"

Jueves: ACWR = 1.18 (amarillo) ⚠️
├─ Sistema: "YELLOW DAY - reduce volumen 20%"

Viernes: Sin yellow day = ACWR = 1.35 (rojo) 🔴
├─ Resultado: Atleta se lesiona

Viernes: CON yellow day = ACWR = 1.14 (verde) ✅
├─ Resultado: Atleta se recupera
```

---

## 🧠 Pilares Técnicos

### 1. Stress Engine (ACWR - Acute:Chronic Workload Ratio)

**Fórmula Base:**
```
ACWR = Carga Aguda (7 días) / Carga Crónica (28 días)
```

**Zonas de Riesgo:**
```
ACWR < 0.8:    Undertrain (pérdida de fitness)
0.8-1.3:       ÓPTIMO ✅ (máximo rendimiento, mínimo riesgo)
1.3-1.5:       CAUTION ⚠️ (2x riesgo de lesión)
> 1.5:         DANGER 🔴 (4x riesgo de lesión)
```

**Cálculo de IMR (Intensity Magnitude Rating):**
```
IMR = Σ (stress_coefficient × weight × reps) × workout_type_multiplier × density_factor

Componentes:
├─ stress_coefficient: 0.65 (cardio) a 1.3 (muscle-ups)
├─ weight: Carga en kg (o bodyweight para movimientos)
├─ reps: Repeticiones ejecutadas
├─ workout_type_multiplier:
│  ├─ For Time: 1.0 (baseline)
│  ├─ AMRAP: 1.15 (alta intensidad)
│  ├─ EMOM: 0.85 (descanso construido)
│  ├─ Strength: 1.3 (demanda CNS)
│  ├─ Chipper: 1.05 (volumen alto)
│  ├─ Ladder: 1.0 (variable)
│  ├─ Interval: 1.2 (muy intenso)
│  └─ LSD: 0.6 (muy bajo estrés)
└─ density_factor:
   ├─ Si >12 reps/min: +5-15% (muy rápido)
   ├─ Si 8-12 reps/min: ×1.0 (normal)
   └─ Si <6 reps/min: -5-10% (muy lento)
```

**Recovery Score:**
```
Score = (sleep_score + inverse_fatigue + inverse_pain) / 3

Donde:
├─ sleep_score = horas_dormidas / 9 (capped at 1.0)
├─ inverse_fatigue = (5 - stress_level) / 5
└─ inverse_pain = (5 - pain_level) / 5

Interpretación:
├─ > 0.65: GOOD ✅ (recuperación excelente)
├─ 0.5-0.65: FAIR ⚠️ (mediocre, monitorear)
└─ < 0.5: POOR 🔴 (muy fatigado, escalar WOD)
```

### 2. Menstrual Periodization

Sistema opcional que ajusta automáticamente intensidad según ciclo menstrual:

```
Detección automática:
├─ Última menstruación + duración del ciclo
├─ Uso de anticonceptivos hormonales
└─ Patrón de estrés/fatiga reportado

Ajustes automáticos:
├─ Fase menstrual: -15-20% capacidad
├─ Fase folicular: +10-15% capacidad
├─ Fase ovulación: +5-8% fuerza
└─ Fase lútea: -5-10% capacidad

Recomendaciones:
├─ Menstrual: Foco en movilidad, skills
├─ Folicular: Ataque máximo, PRs
├─ Ovulación: Balance fuerza y potencia
└─ Lútea: Mantener, no presionar
```

### 3. PRISMA - Batería de Tests VO2Max

Sistema validado para medir capacidad aeróbica real (opcional pero poderoso):

```
Dos modos:

MODO RÁPIDO (sin fricción):
├─ 1 test: Burpees en 3 minutos
├─ Duración: 3 minutos
├─ Precisión: ±8% (buena)
└─ Esfuerzo: Mínimo

MODO ATLETA (máxima precisión):
├─ Test 1: 2400m Running (estándar de oro)
├─ Test 2: 2000m Rowing
├─ Test 3: 10min Air Bike
├─ Test 4: 3min Burpees
├─ Duración: 10 días (1 test cada 2-3 días)
├─ Precisión: ±3% (muy alta)
└─ Esfuerzo: Máximo (pero vale la pena)

Validación inteligente:
├─ Detecta outliers (si un resultado es inconsistente)
├─ Identifica ineficiencias mecánicas
├─ Descarta mentiras (si resultados son sospechosos)
└─ Proporciona VO2Max ponderado final
```

### 4. Radar - 10 Dimensiones de CrossFit

Perfil completo del atleta en múltiples capacidades:

```
1. Cardiovascular Endurance: VO2Max, 2k Row time, aerobic capacity
2. Muscular Endurance: Reps @ 70%, AMRAP consistency, metcon times
3. Strength: 1RM normalizados (deadlift, squat, bench, C&J)
4. Flexibility: ROM en squat, overhead, hips, shoulder
5. Power: Vertical jump, broad jump, watts output
6. Speed: Double-unders/min, burpees/min, sprint time
7. Coordination: Olympic lift technique, complex movements fluency
8. Agility: T-Test, transition time, lateral speed
9. Balance: Pistol depth, handstand hold, single-leg stability
10. Precision: Barbell accuracy, movement depth consistency

Representación:
├─ Gráfico radar en dashboard
├─ Historial de evolución por dimensión
├─ Comparativa con período anterior
└─ Identificación de "debilidades" a trabajar
```

---

## 🏗️ Arquitectura del Sistema

### Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────┐
│              VOLTA SYSTEM ARCHITECTURE               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CAPTURE LAYER (Telegram Bot)                          │
│  ├─ /registrar: Onboarding atleta                      │
│  ├─ /agregar_datos: Sueño, estrés, dolor              │
│  ├─ /entrenar: Registrar WOD completado               │
│  ├─ /foto: Subir foto de whiteboard                   │
│  └─ /resultado: Quick result entry                     │
│                                                         │
│  PROCESSING LAYER (FastAPI Backend)                    │
│  ├─ Validate input data                                │
│  ├─ Calculate IMR from structured movements            │
│  ├─ Calculate ACWR (7-day / 28-day)                   │
│  ├─ Determine recovery score                           │
│  ├─ Apply menstrual periodization (if applicable)      │
│  ├─ Generate recommendation (Green/Yellow/Red day)     │
│  └─ Store in database                                  │
│                                                         │
│  DATABASE LAYER (Supabase PostgreSQL)                  │
│  ├─ athletes: Profile, baseline capacities             │
│  ├─ training_sessions: WOD records with IMR            │
│  ├─ biometric_logs: Sleep, stress, pain daily          │
│  ├─ stress_engine_metrics: ACWR tracking               │
│  ├─ menstrual_cycles: Optional cycle tracking          │
│  ├─ radar_scores: 10 dimensions history                │
│  └─ personal_records: Max lifts, benchmarks            │
│                                                         │
│  INTELLIGENCE LAYER (Claude AI)                        │
│  ├─ Process WOD photos (vision if provided)            │
│  ├─ Validate entered data (common sense check)         │
│  ├─ Generate personalized recommendations              │
│  ├─ Explain why a day is Yellow/Red                    │
│  └─ Suggest next steps                                 │
│                                                         │
│  RESPONSE LAYER (Frontend)                             │
│  ├─ Telegram Bot: Quick messages, buttons              │
│  ├─ Web Dashboard (Next.js):                           │
│  │  ├─ Weekly overview                                 │
│  │  ├─ ACWR gauge with zones                           │
│  │  ├─ Radar chart (10 dimensions)                     │
│  │  ├─ Recovery quality visualization                  │
│  │  ├─ Personal records & progress                     │
│  │  ├─ Prediction for upcoming days                    │
│  │  └─ Integration with box program                    │
│  └─ Mini App (Telegram inside browser)                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Decisión Arquitectónica: Structured Data vs. Vision

**Decisión Tomada**: Structured manual entry en vez de Vision-based extraction

**Razón:**
```
Vision Approach Problems:
├─ Whiteboard photos: Mala calidad, OCR falla
├─ Ambigüedad: ¿Es 95 lbs o 95 kg?
├─ Variaciones: ¿Kipping o Strict pull-ups?
└─ Confiabilidad: ~60-70% accuracy máximo

Structured Approach Benefits:
├─ Precisión: 100% (atleta entra exacto qué hizo)
├─ Rapidez: 30 segundos con botones/dropdown
├─ Confiabilidad: Cálculos exactos del IMR
└─ Escalabilidad: Fácil de validar y auditar

Trade-off: Requiere un poco más de entrada del usuario,
pero mucho más preciso para el Stress Engine.
```

---

## 🔧 Componentes Principales

### 1. Movement Catalog (`movement_catalog.json`)

```json
{
  "pull_up": {
    "id": "pull_up",
    "name": "Pull-up",
    "category": "gymnastics",
    "stress_coefficient": 1.0,
    "requires_1rm": false,
    "primary_muscles": ["lats", "back", "biceps"],
    "equipment": ["pull_up_bar"],
    "variations": [
      {
        "name": "Kipping",
        "stress_multiplier": 1.0,
        "difficulty": "intermediate"
      },
      {
        "name": "Strict",
        "stress_multiplier": 1.1,
        "difficulty": "advanced"
      }
    ],
    "typical_reps_range": [5, 50],
    "intensity_scale": "reps_based"
  },
  ...
}
```

50+ movimientos con stress coefficients validados.

### 2. Workout Types (`workout_types.json`)

```json
{
  "amrap": {
    "id": "amrap",
    "name": "As Many Rounds As Possible",
    "stress_multiplier": 1.15,
    "time_cap_required": true,
    "scoring_method": "rounds_and_reps",
    "density_importance": "high",
    "examples": ["Cindy", "DT", "Annie"]
  },
  ...
}
```

8 tipos de WOD con multiplicadores de estrés.

### 3. Pydantic Schemas (`schemas/training.py`)

```python
class MovementExecution(BaseModel):
    movement_id: str
    reps: Optional[int]
    weight: Optional[float]
    weight_unit: str = "kg"
    variation: Optional[str]
    scaling: Optional[str]

class TrainingSession(BaseModel):
    athlete_id: UUID
    date: date
    workout_type: WorkoutTypeEnum
    movements: List[MovementExecution]
    result: WorkoutResult
    imr_score: float
    estimated_stress: str  # "low", "moderate", "high"
```

Validación estricta de datos de entrenamiento.

### 4. FastAPI Backend (`main.py`)

```python
@app.get("/dashboard")
async def dashboard():
    """Athlete dashboard with full simulation"""
    return FileResponse("dashboard.html")

@app.post("/api/training/sessions")
async def create_training_session(session: TrainingSessionCreate):
    """Create new training session with IMR calculation"""
    # Calculates IMR, ACWR, recommendation
    # Stores in database
    return TrainingSessionResponse

@app.get("/api/athletes/{athlete_id}/metrics")
async def get_athlete_metrics(athlete_id: UUID):
    """Get current ACWR, recovery, recommendations"""
    return AthleteMetricsResponse
```

### 5. Dashboard HTML (`dashboard.html`)

```html
Beautiful responsive web interface showing:
├─ Weekly training breakdown
├─ IMR calculations per day
├─ ACWR gauge (with zones)
├─ Recovery quality charts
├─ 10 Dimensions radar
├─ Personal records
├─ Alerts & recommendations
└─ Mobile responsive design
```

### 6. Database Schema (`migrations/001_initial_schema.sql`)

```sql
athletes:
├─ id, telegram_id, name, age, weight, height
├─ sex, created_at, updated_at

biometric_logs:
├─ athlete_id, date
├─ sleep_hours, stress_level, muscle_pain_level
└─ recovery_score

training_sessions:
├─ athlete_id, date
├─ workout_type, movements (JSONB)
├─ result (score/time/reps)
├─ imr_score, acwr_7day, acwr_28day
└─ acwr_zone ("optimal", "caution", "danger")

stress_engine_metrics:
├─ athlete_id, date
├─ acute_workload_7day, chronic_workload_28day
├─ current_acwr, acwr_zone
└─ recommendation

radar_scores:
├─ athlete_id, date
├─ 10 dimension scores (0-10 each)
└─ overall_score

personal_records:
├─ athlete_id, movement
├─ weight_kg, reps, time_seconds
└─ date_achieved
```

---

## 🔄 Cómo Funciona

### Día Típico: Mañana

```
08:00 - Atleta abre Telegram
[📝 Añadir Datos de Hoy]
  └─ "¿Cuántas horas dormiste?" → 6.5h
  └─ "Estrés (1-5)?" → 3/5
  └─ "Dolor muscular (1-5)?" → 2/5

Sistema calcula:
├─ Recovery Score = 0.55 (Fair)
├─ Proyecta ACWR para después del WOD
└─ Prepara recomendación

Bot responde:
"✅ Guardado. Tu recovery es FAIR (0.55).
 Después del entrenamiento tendremos una recomendación personalizada."
```

### Antes del Entrenamiento: Recomendación

```
10:30 - Atleta check bot
[📋 Mi Plan de Hoy]

Sistema analiza:
├─ ACWR actual: 1.18 (approaching caution)
├─ Recovery: Fair (0.55)
├─ Ciclo menstrual: Fase folicular (+10% capacity)
└─ Histórico: Últimos 3 entrenamientos

Bot responde:
"🟡 YELLOW DAY TODAY

 Tu ACWR está en 1.18 (acercándose a caution).
 Si haces el AMRAP completo, subirá a 1.32 (DANGER).

 ✅ OPCIÓN A: Escala el AMRAP
   • 3 Power Cleans @ 60kg (no 75kg)
   • 7 Burpees (no 10)
   • Resultado IMR: ~4,000 (vs 8,000)

 ✅ OPCIÓN B: Haz Strength Day en su lugar
   • 5x5 Back Squat @ 70%
   • 3x5 Bench Press @ 75%
   • Resultado IMR: ~3,500

 [OPCIÓN A] [OPCIÓN B] [VER DETALLES]"
```

### Post-Entrenamiento: Registro

```
11:30 - Atleta termina, toma foto de whiteboard:
[📸 Compartir Resultado]

Escribe:
"Hice la opción A escalada
Tiempo: 9:45
Sentimientos: fuerte hoy"

Bot analiza:
├─ Valida movimientos de foto/texto
├─ Calcula IMR: 4,200
├─ Calcula nuevo ACWR: 1.19 (sigue en green!)
├─ Actualiza historial
└─ Prepara notificación

Bot responde:
"✅ REGISTRO COMPLETADO

 WOD: 3x Power Clean (60kg) + 7 Burpees
 IMR: 4,200
 Tiempo: 9:45

 📊 ACWR ACTUALIZADO
 Fue: 1.18 → Ahora: 1.19 (aún en ÓPTIMO)
 Lesión Risk: 2x (stable)

 🎯 VIERNES
 Si entrenas normal: ACWR subirá a 1.27 (CAUTION)
 Recomendación: Keep scaling o Strength day también

 💤 NOCHES
 Tu recovery fue FAIR (0.55).
 Intenta dormir 7.5+ horas para bajar a ÓPTIMO

 [VER DASHBOARD] [REGISTRAR SUEÑO] [PREGUNTAR]"
```

### Dashboard: Visualización Completa

```
Se actualiza automáticamente en:
http://localhost:8000/dashboard

Muestra:
├─ Gráfico ACWR con línea roja de danger zone
├─ Historial de últimos 7 días
├─ Radar de 10 dimensiones
├─ Recuperación por día
├─ Próximas recomendaciones
├─ Personal records y progreso
└─ Proyecciones para la próxima semana
```

### Sistema de Alertas

```
Red Alert (>1.5 ACWR):
"🚨 DANGER ZONE
 Tu ACWR es 1.58 (4x lesión risk)
 DEBE escalar mañana. [SUGERIR ESCALA]"

Yellow Alert (1.2-1.5 ACWR):
"⚠️ CAUTION
 Tu ACWR es 1.28. Mañana reduce volumen.
 [OPCIONES] [ENTIENDO]"

Green Status (<1.2 ACWR):
"✅ ÓPTIMO
 Tu ACWR es 1.10. Puedes atacar.
 [IR A ENTRENAR] [BUSCAR PR]"
```

---

## 💾 Stack Tecnológico

### Backend

| Componente | Tecnología | Razón |
|-----------|-----------|-------|
| API Framework | FastAPI | Rápido, async, validación automática |
| Server | Uvicorn | ASGI, producción-ready |
| Database | Supabase (PostgreSQL) | Managed, escalable, real-time |
| Auth | Telegram OAuth | Usuarios ya en Telegram |
| AI | Claude API + Vision | Mejora de entrada si es necesario |
| Task Queue | Celery/Redis (future) | Notificaciones en background |

### Frontend

| Componente | Tecnología | Razón |
|-----------|-----------|-------|
| Bot | python-telegram-bot | Oficial, mantenido |
| Web Dashboard | Next.js | SSR, performance, TypeScript |
| Charts | Recharts / Chart.js | Interactive, responsive |
| Styling | Tailwind CSS | Utility-first, rápido |
| Mobile | Telegram Mini App | No app store, acceso directo |

### Infrastructure

| Componente | Tecnología | Razón |
|-----------|-----------|-------|
| Hosting | Vercel (frontend) | Gratis para Next.js |
| Backend | Railway / Heroku | Fácil deploy, gratis tier |
| Database | Supabase | Managed PostgreSQL |
| Storage | AWS S3 / Cloudinary | Fotos de WOD |
| Notifications | Telegram Bot API | Directamente a usuarios |

---

## 📊 Base de Datos

### Esquema Detallado

#### Tabla: athletes
```
id (UUID, PK)
telegram_id (BIGINT, UNIQUE) - identificador de Telegram
name (TEXT)
email (TEXT, UNIQUE)
age (INTEGER)
weight_kg (DECIMAL)
height_cm (INTEGER)
sex (TEXT CHECK: M/F/Other)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

Índices:
- telegram_id (búsquedas rápidas por Telegram)
```

#### Tabla: biometric_logs
```
id (UUID, PK)
athlete_id (UUID, FK → athletes)
date (DATE, UNIQUE per athlete)
sleep_hours (DECIMAL)
stress_level (INTEGER, 1-5)
muscle_pain_level (INTEGER, 1-5)
notes (TEXT)
created_at (TIMESTAMP)

Índices:
- (athlete_id, date) para queries rápidas
```

#### Tabla: training_sessions
```
id (UUID, PK)
athlete_id (UUID, FK)
date (DATE)
workout_type (TEXT: amrap, for_time, emom, etc)
movements (JSONB):
  [
    {
      "movement_id": "power_clean",
      "reps": 10,
      "weight_kg": 60,
      "variation": "power"
    },
    ...
  ]
result (JSONB):
  {
    "time_seconds": 567,
    "scaled": false,
    "notes": "Strong finish"
  }
imr_score (DECIMAL)
acwr_7day (DECIMAL)
acwr_28day (DECIMAL)
current_acwr (DECIMAL)
acwr_zone (TEXT: optimal/caution/danger)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

Índices:
- (athlete_id, date) para datos históricos
```

#### Tabla: stress_engine_metrics
```
id (UUID, PK)
athlete_id (UUID, FK)
date (DATE, UNIQUE per athlete)
acute_workload_7day (DECIMAL)
chronic_workload_28day (DECIMAL)
current_acwr (DECIMAL)
acwr_zone (TEXT)
recovery_score (DECIMAL)
recommendation (TEXT)
generated_at (TIMESTAMP)
```

#### Tabla: radar_scores
```
id (UUID, PK)
athlete_id (UUID, FK)
date (DATE)
cardiovascular_endurance (DECIMAL)
muscular_endurance (DECIMAL)
strength (DECIMAL)
flexibility (DECIMAL)
power (DECIMAL)
speed (DECIMAL)
coordination (DECIMAL)
agility (DECIMAL)
balance (DECIMAL)
precision (DECIMAL)
overall_score (DECIMAL)
created_at (TIMESTAMP)
```

### Queries Comunes

```sql
-- Obtener ACWR actual de un atleta
SELECT current_acwr, acwr_zone, recommendation
FROM stress_engine_metrics
WHERE athlete_id = $1
ORDER BY date DESC
LIMIT 1;

-- Obtener histórico de IMR últimas 28 días
SELECT date, imr_score, workout_type, acwr_zone
FROM training_sessions
WHERE athlete_id = $1
AND date >= NOW() - INTERVAL '28 days'
ORDER BY date DESC;

-- Calcular recuperación promedio
SELECT AVG(recovery_score) as avg_recovery
FROM stress_engine_metrics
WHERE athlete_id = $1
AND date >= NOW() - INTERVAL '7 days';
```

---

## 👥 Experiencia del Usuario

### Onboarding (Primera Vez)

```
1. Usuario escribe al bot:
   /start

2. Bot responde:
   "Hola 👋 Bienvenido a VOLTA
   Tu asistente inteligente de rendimiento CrossFit

   [🎯 COMENZAR SETUP] [📖 APRENDER MÁS]"

3. Usuario cliquea COMENZAR SETUP:

   ¿Cuál es tu nombre?
   → Carlos Hernández

   ¿Cuál es tu peso?
   → 82 kg

   ¿Cuál es tu altura?
   → 180 cm

   ¿Género?
   → [Hombre] [Mujer] [Otro]

   ¿Último Personal Records? (opcional)
   → Deadlift 160kg, Snatch 100kg, C&J 110kg

   ¿Ciclo menstrual? (solo si aplica)
   → Última menstruación: 01/03
   → Duración: 28 días
   → Anticonceptivo: Sí/No

4. Bot confirma:
   "✅ Setup completado!

   Hola Carlos (82kg, 180cm, Hombre)

   Ahora puedes:
   └─ [📝 Agregar datos hoy]
   └─ [📋 Ver mi plan]
   └─ [📊 Dashboard]"
```

### Flujo Diario

```
MAÑANA (08:00):
├─ Usuario abre Telegram
├─ Bot muestra: "Buenos días Carlos"
├─ [📝 Registrar sueño de anoche]
├─ [😰 ¿Cómo estuvo el estrés?]
└─ [💪 ¿Dolor muscular hoy?]

MID-DAY (11:00):
├─ [📋 Mi plan para el WOD]
├─ Bot sugiere escalas si ACWR > 1.2
├─ Usuario elige opción A/B/C

POST-WOD (12:00):
├─ [📸 Foto del whiteboard]
├─ O [✍️ Escribir resultado]
├─ Bot calcula IMR
├─ Bot actualiza ACWR
├─ Bot da feedback

NOCHE (20:00):
├─ Bot recordatorio (sin horario fijo)
├─ "¿Cuántas horas dormiste?"
├─ Sistema prepara recomendación para mañana
└─ [📊 Ver tu dashboard]
```

### Dashboard Móvil (en browser)

```
URL: https://app.volta.com/dashboard/{athlete_id}

Pantalla principal:
├─ ACWR gauge (grande, prominente)
├─ Estado: ÓPTIMO/CAUTION/DANGER
├─ Últimos 7 días (gráfico)
├─ Recomendación para hoy
├─ [📝 Log Data] [📋 Mi Plan] [⚙️ Settings]

Swipe → Pestañas:
├─ Overview (actual)
├─ Detailed Breakdown (día por día)
├─ 10 Dimensions (radar)
├─ Personal Records
├─ Alerts & Notifications
└─ Settings & Preferences
```

---

## 🗓️ Roadmap Implementación

### Fase 1-2 (Semana 1-2) - ✅ EN PROGRESO

**Objetivo**: MVP funcional básico

- [x] Setup del proyecto (FastAPI, estructura)
- [x] Definición de movimientos (stress coefficients)
- [x] Definición de tipos de WOD (multipliers)
- [x] Schemas Pydantic para datos
- [x] Stress Engine matemáticas
- [x] Dashboard HTML simulado (Carlos)
- [x] Documentación completa
- [ ] Setup Supabase y migraciones
- [ ] Telegram bot skeleton
- [ ] Endpoints API básicos

### Fase 3 (Semana 3)

**Objetivo**: Captura de datos funcionando

- [ ] Telegram bot /registrar (onboarding)
- [ ] Telegram bot /agregar_datos (sleep, stress, pain)
- [ ] Telegram bot /entrenar (WOD entry)
- [ ] API POST /training/sessions
- [ ] Almacenamiento en base de datos
- [ ] Cálculos de IMR en tiempo real

### Fase 4 (Semana 4)

**Objetivo**: Stress Engine y recomendaciones

- [ ] Cálculo de ACWR automático
- [ ] Sistema de alertas (Green/Yellow/Red)
- [ ] Recomendaciones personalizadas
- [ ] Menstrual periodization (si aplica)
- [ ] API GET /athlete/{id}/metrics

### Fase 5-6 (Semana 5-6)

**Objetivo**: Frontend web

- [ ] Next.js dashboard
- [ ] Gráficos interactivos
- [ ] Historial de datos
- [ ] Personal records tracking
- [ ] Comparativas week-over-week

### Fase 7-8 (Semana 7-8)

**Objetivo**: Features avanzadas

- [ ] PRISMA VO2Max tests
- [ ] Radar 10 dimensiones
- [ ] Integración con programa del box
- [ ] Predicciones futuras
- [ ] Telegram Mini App

---

## 📋 Ejemplos Prácticos

### Ejemplo 1: Cálculo IMR - "Fran" 95lbs RX

```
WOD: For Time
21-15-9 Thrusters (95lbs) + Pull-ups

CÁLCULO:
──────

Movimiento: Thrusters
├─ Rondas: 21 + 15 + 9 = 45 reps
├─ Peso: 95 lbs = 43.1 kg
├─ Stress coef: 1.05 (thruster)
├─ IMR = 1.05 × 43.1 × 45 = 2,037

Movimiento: Pull-ups
├─ Rondas: 21 + 15 + 9 = 45 reps
├─ Peso: BW = 80 kg (assumed)
├─ Stress coef: 1.0
├─ IMR = 1.0 × 80 × 45 = 3,600

Subtotal: 2,037 + 3,600 = 5,637

Densidad:
├─ Tiempo total: 7.6 minutos
├─ Total reps: 90
├─ Velocidad: 90/7.6 = 11.8 reps/min
├─ Factor: +5% (rápido, > 10 reps/min)
├─ Multiplicador: 1.05

Tipo de WOD:
├─ For Time = 1.0 (baseline)

FINAL IMR = 5,637 × 1.05 × 1.0 = 5,919
```

### Ejemplo 2: ACWR Calculation - Carlos Semana

```
DATOS HISTÓRICOS:
─────────────────
28 últimos días:
├─ Sem 1: 22,000 IMR
├─ Sem 2: 20,000 IMR
├─ Sem 3: 21,500 IMR
├─ Sem 4: 22,500 IMR
└─ Promedio 28d: 21,500 IMR

ÚLTIMOS 7 DÍAS:
───────────────
├─ Lunes: 7,797
├─ Martes: 705
├─ Miércoles: 11,799
├─ Jueves: 948
├─ Viernes: 3,867
├─ Sábado: 500
├─ Domingo: 300
└─ Total 7d: 25,916

CÁLCULO:
────────
ACWR = 25,916 / 21,500 = 1.205

INTERPRETACIÓN:
───────────────
1.205 está en zona ÓPTIMA (0.8-1.3) ✅
Pero acercándose a CAUTION (1.3)
Recomendación: YELLOW DAY próximo lunes
```

### Ejemplo 3: Recovery Score

```
Datos del atleta (Miércoles):
├─ Sueño: 6 horas
├─ Estrés: 4/5
├─ Dolor: 4/5

CÁLCULO:
────────
Sleep score = 6/9 = 0.67 (capped at 1.0)
Inverse fatigue = (5-4)/5 = 0.20
Inverse pain = (5-4)/5 = 0.20

Recovery Score = (0.67 + 0.20 + 0.20) / 3 = 0.36

INTERPRETACIÓN:
───────────────
0.36 = POOR 🔴

Razones:
├─ Sueño insuficiente (6h vs 7.5-9h ideal)
├─ Estrés alto (4/5)
├─ Dolor muscular alto (4/5 después AMRAP)

Recomendación:
└─ Escalar WOD de hoy 20%
└─ Priorizar sueño (8h+ mañana)
└─ Considerar yoga/movilidad en lugar de cardio
```

### Ejemplo 4: Menstrual Periodization

```
Atleta mujer, ciclo 28 días
Última menstruación: 01/03

CÁLCULO DE FASE:
────────────────
Hoy: 08/03 (Día 7 del ciclo)

Días 1-5: Menstrual → -20% capacidad
Días 6-14: Folicular → +15% capacidad ← HEMOS AQUÍ
Días 15-17: Ovulación → +10% capacidad
Días 18-28: Lútea → -5% capacidad

FASE ACTUAL: Folicular (+15%)

AJUSTE DE RECOMENDACIÓN:
────────────────────────
Normal recommendation: "Reduce volumen 20% (Yellow Day)"

CON Menstrual adjustment:
"Tu cuerpo está en fase Folicular (+15% capacidad).
 Podrías hacer volumen NORMAL hoy.

 Opción A: Do full WOD (no scaling)
 Opción B: Escala si recovery es baja
 Opción C: Ataca un PR (tu capacidad es alta)"

Resultado: El sistema reconoce que su ciclo permite más,
entonces ajusta la recomendación dinámicamente.
```

---

## 🎯 Métricas de Éxito

### MVP (Actual)

| Métrica | Target | Razón |
|---------|--------|-------|
| Dashboard loading | < 2s | Experiencia mobile |
| Stress Engine accuracy | ±5% | Validación manual |
| ACWR calculation | Instantaneous | Real-time feedback |
| Data entry time | < 1 min | Friction mínima |
| Uptime | 99% | Disponibilidad |

### Fase 3-4

| Métrica | Target | Razón |
|---------|--------|-------|
| User retention | > 80% week 1 | Engagement |
| Daily active users | > 60% | Consistent use |
| WOD logging rate | > 85% | Data quality |
| Alert accuracy | > 95% | Trust in system |
| Session response time | < 500ms | Real-time feel |

### Long-term

| Métrica | Target | Razón |
|---------|--------|-------|
| Injury prevention | > 30% reduction | Core mission |
| Performance improvement | > 15% over 12 weeks | Measurable outcome |
| User satisfaction | > 4.5/5 stars | Product quality |
| NPS (Net Promoter Score) | > 50 | Referrals |
| Data quality | > 98% accuracy | Reliability |

---

## 🔐 Seguridad & Privacidad

### Datos Sensibles
```
├─ Ciclo menstrual: Encriptado, opt-in
├─ Fotos de WOD: Comprimidas, borradas después de análisis
├─ Métricas de salud: Solo accesible por usuario
├─ Identificadores Telegram: Tokens seguros
└─ Ubicación del box: Opcional, nunca compartido
```

### Autenticación
```
├─ Telegram OAuth (usuario ya autenticado)
├─ JWT tokens para API
├─ Refresh tokens con expiración
└─ Rate limiting por usuario
```

### Compliance
```
├─ GDPR: Derecho a exportar/borrar datos
├─ HIPAA: Health data protection
├─ CCPA: California privacy
└─ Términos claros sobre uso de IA
```

---

## 📚 Referencias & Datos Utilizados

### Fuentes de Coeficientes de Estrés

1. **Mayhem Athlete Scaling Doc**
   - Movement scaling options
   - Athlete-to-scaled ratios
   - Distance conversions (run/row/bike/ski)

2. **CompTrain 2025 Training Methodology**
   - 3 Tenets (Strength, Conditioning, Mobility)
   - 9 Attributes with frequencies
   - Training principles and minimums

3. **Validación Interna**
   - Atletas de elite (Mayhem Athletes, Comp Train competitors)
   - Coaching staff feedback
   - Real-world performance data

### Papers Científicos

- *"Acute:Chronic Workload Ratio is Associated with Injury"* - Gabbett, 2016
- *"Menstrual Cycle Effects on Power Output in Elite Athletes"* - Lebrun, 2013
- *"VO2Max Estimation from Submaximal Performance"* - Beaver, 1995
- *"Recovery Monitoring in Team Sports"* - Kellmann, 2010

---

## 🤝 Contribuir & Feedback

### Issues Reportados
- Vision-based WOD extraction es impreciso → Cambiado a structured entry
- Recovery score necesita pesos diferentes → Implementado weight tuning
- ACWR zones son demasiado estrictas → Ajustadas basado en feedback

### Sugerencias Futuras
```
├─ Integración con Oura Ring (sleep data)
├─ Integración con Stryd (running power)
├─ Música recomendada basada en ACWR
├─ Nutrición recommendations basadas en fase
├─ Comparativa con box community
└─ Gamification (badges, streaks)
```

---

## 📞 Contacto & Support

### Documentación
- `README.md` - Quick start
- `PROJECT_STRUCTURE.md` - Roadmap
- `STRESS_ENGINE_DETAILED.md` - Technical spec
- `ATHLETE_DASHBOARD_EXAMPLE.md` - Dashboard walkthrough
- `TELEGRAM_DASHBOARD_UI.md` - Bot UI mockups
- `DASHBOARD_SETUP.md` - Server setup guide
- `VOLTA_COMPLETE_GUIDE.md` - Este archivo

### Status Actual
```
Server: ✅ Running (FastAPI on 8000)
Dashboard: ✅ Live (HTML responsive)
Database: 🔜 Próximo (Supabase setup)
Bot: 🔜 Próximo (Telegram integration)
```

---

## 📖 Glosario

| Término | Significado |
|---------|------------|
| **ACWR** | Acute:Chronic Workload Ratio - Carga aguda vs crónica |
| **IMR** | Intensity Magnitude Rating - Puntuación de intensidad del WOD |
| **Stress Coef** | Coeficiente de estrés del movimiento (0.65-1.3) |
| **Recovery Score** | Puntuación de recuperación (0-1) basada en sueño, estrés, dolor |
| **Yellow Day** | Día donde reduces volumen 20% para evitar sobrecarga |
| **PRISMA** | Batería de tests VO2Max validados |
| **Radar** | Perfil de 10 dimensiones de capacidad del atleta |
| **Menstrual Periodization** | Ajustes automáticos según ciclo menstrual |
| **WOD** | Workout Of the Day (entrenamiento del día) |
| **AMRAP** | As Many Rounds As Possible (máximas rondas posibles) |
| **EMOM** | Every Minute On the Minute (cada minuto en punto) |
| **RX** | Realizado como programado (sin escalas) |
| **Scaled** | Realizado con modificaciones (pesos más ligeros, movimientos alternativos) |

---

**Fin de la Guía Completa de VOLTA**

*Para preguntas específicas sobre componentes, ver archivos individuales listados arriba.*

*Para roadmap detallado, ver PROJECT_STRUCTURE.md*

*Para matemáticas del Stress Engine, ver STRESS_ENGINE_DETAILED.md*
