---
name: Motor de Balance Muscular
description: Detecta desequilibrios músculo-articulares crónicos en atletas CrossFit para prevenir lesiones por sobreuso
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #07
---

# Activo #12 — Motor de Balance Muscular

## Categoría
Algoritmo de Valor — Prevención de Lesiones

## ¿Qué problema resuelve?

CrossFit tiene un patrón de lesión muy específico: el atleta entrena duro, mejora en WODs, pero acumula desequilibrios musculares invisibles hasta que aparece la lesión.

Las lesiones más comunes en CrossFit por desequilibrio:
- **Hombro**: 34% de las lesiones — exceso de press sin trabajo de retractores
- **Lumbar**: 23% — exceso de dominante anterior (kipping, situps) sin trabajo de extensores
- **Rodilla**: 18% — ratio quad/isquio alterado (mucho thruster, poco deadlift)

---

## Los 4 Ratios Críticos en CrossFit

### 1. Push/Pull Ratio (Hombro)
```
Target: 1:1 — igual volumen de empuje que de tracción
Push: Press, Push Press, Jerk, HSPU, Ring Dips
Pull: Pull-ups, C2B, Muscle-ups, Row, Ring Rows

Alarma: Pull < 0.7 × Push (demasiado press, poco tirón)
```

### 2. Anterior/Posterior Chain Ratio (Lumbar + Glúteo)
```
Target: 1:1.2 (la cadena posterior debe ser ligeramente dominante)
Anterior: Kipping, Situps, Toes-to-bar, Front Squat, Thruster
Posterior: Deadlift, GHD, KB Swing, Back Squat, Romanian DL

Alarma: Posterior < 0.8 × Anterior
```

### 3. Quad/Isquio Ratio (Rodilla)
```
Target: 0.55-0.75 (isquio ≈ 60% de la fuerza del quad)
Quad-dominante: Front Squat, Thruster, Wall Ball
Isquio: Deadlift, GHD, Single-leg RDL

Alarma: < 0.50 (quad demasiado dominante — riesgo ligamento cruzado)
```

### 4. Bilateral/Unilateral Ratio (Asimetría)
```
Target: < 10% diferencia lado dominante vs no dominante
Testeable con: Single-leg squat, 1-arm KB press
Alarma: > 15% de diferencia bilateral
```

---

## Cómo VOLTA mide estos ratios

VOLTA ya captura los movimientos de cada WOD con su coeficiente de estrés.
El motor clasifica cada movimiento en su categoría:

```python
MOVEMENT_CATEGORIES = {
    # Push
    "press": "push", "push_press": "push", "jerk": "push",
    "hspu": "push", "ring_dip": "push",

    # Pull
    "pullup": "pull", "c2b": "pull", "muscle_up": "pull",
    "ring_row": "pull", "rope_climb": "pull",

    # Anterior
    "toes_to_bar": "anterior", "situp": "anterior",
    "front_squat": "anterior", "thruster": "anterior",

    # Posterior
    "deadlift": "posterior", "ghd": "posterior",
    "kb_swing": "posterior", "back_squat": "posterior",
}
```

Se acumula **volumen ponderado** (reps × coeficiente IMR) por categoría en los últimos 28 días.

---

## Outputs

### Dashboard del atleta
```
📊 Balance Muscular — Últimos 28 días

Push/Pull:        ██████████░░  0.62 ⚠️  (target: 1.0)
Anterior/Post:    ████████████  1.05 ✅
Quad/Isquio:      ███████░░░░░  0.48 🔴

Alerta: Tus cuádriceps dominan sobre los isquiotibiales.
Riesgo elevado de lesión de rodilla.
Recomendación: 3 sesiones de RDL o GHD esta semana.
```

### Recomendación automática al coach
Si el atleta tiene un ratio fuera de rango, el coach recibe:
> "Atleta Juan — Push/Pull 0.62 últimos 28 días. Recomendar semana de dominada y remo."

---

## Integración con activos VOLTA

- **Consume**: catálogo de movimientos de `CORE_ENGINES/01_StressEngine_IMR`
- **Alimenta**: `CORE_ENGINES/14_SmartCoachAlerts` (alertas proactivas al coach)
- **Alimenta**: `CORE_ENGINES/11_SessionAdaptationEngine` (penaliza WODs que profundizan desequilibrio)
- **Visible en**: Dashboard del atleta + panel del coach

---

## Pregunta para el usuario
¿Quieres que VOLTA también **recomiende movimientos compensatorios específicos** (ej: "Haz 3×10 face pulls") o solo alerte sobre el desequilibrio?
