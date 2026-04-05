---
name: Generador de Calentamiento Dinámico
description: Genera un warmup personalizado para cada WOD de CrossFit basado en los movimientos del día y el estado del atleta
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #14
---

# Activo #13 — Generador de Calentamiento Dinámico

## Categoría
Feature de Valor — Diferenciador de Experiencia

## ¿Qué hace?

La mayoría de boxes tienen el mismo calentamiento genérico todos los días.
VOLTA genera un warmup específico para **el WOD de hoy** + **el estado del atleta hoy**.

---

## Lógica de Generación

### Paso 1 — Análisis del WOD del día
El motor lee los movimientos del WOD y clasifica sus demandas:

| WOD del día contiene | Warmup debe incluir |
|---------------------|---------------------|
| Barbell (Snatch, Clean, Jerk) | Movilidad de tobillo, cadera, overhead |
| HSPU / Press | Movilidad de hombro, rotadores |
| Gymnastics (C2B, MU) | Activación de escápula, movilidad torácica |
| Squats (Thruster, WB) | Movilidad de tobillo/cadera, activación glúteo |
| Cardio (Run, Row, Bike) | Warm-up cardiovascular, activación pierna |
| Deadlift / Hinge | Activación lumbar, movilidad isquio |

### Paso 2 — Ajuste por estado del atleta
El warmup se modifica según el readiness del día:

| Readiness | Ajuste de warmup |
|-----------|-----------------|
| > 75 | Warmup estándar (8-10 min) |
| 55-74 | Warmup extendido + movilidad extra (12-15 min) |
| < 55 | Warmup completo + activación neuromuscular (15-20 min) |

### Paso 3 — Protocolo de Retorno (post-vacaciones)
Si el atleta lleva > 7 días sin entrenar:
```
→ Warmup "Return to Training" obligatorio
→ 5 min movilidad general
→ Activación de todos los grupos afectados por el WOD
→ Técnica vacía o muy ligera del movimiento principal
→ Límite de carga: 60% del último RM registrado
```

---

## Estructura del Warmup generado

```
WARMUP PARA HOY — "Fran" (Thrusters + Pull-ups)

Bloque 1 — Movilidad (3 min)
  • Ankle circles 10/lado
  • Hip 90/90 stretch 1 min
  • Thoracic rotation 10 reps

Bloque 2 — Activación (4 min)
  • Banded pull-apart 2×15
  • Glute bridge 2×15
  • Hollow body hold 3×20s

Bloque 3 — Progresión del movimiento (3 min)
  • 5 squat a empty bar
  • 3 thruster a empty bar
  • 5 ring rows → 5 jumping pull-ups
```

---

## Formato de entrega al atleta

VOLTA presenta el warmup en la app como:
- Lista de ejercicios con tiempo/reps
- Botón "Marcar warmup completo" (suma 0.2 a readiness del día — incentivo)
- Versión compacta para el coach (ve si el atleta hizo warmup antes del WOD)

---

## Valor diferencial en CrossFit

1. **El coach no tiene que pensar el warmup** — VOLTA lo genera automáticamente según el WOD del día
2. **El atleta sabe exactamente qué hacer al llegar al box** — reduce el "no sé por dónde empezar"
3. **Previene lesiones en movimientos técnicos** (sin warmup de snatch → hombro en riesgo)
4. **Dato de adherencia**: saber si el atleta hace warmup antes de cada WOD es un predictor de lesión

---

## Integración con activos VOLTA

- **Consume**: WOD del día (programación del coach)
- **Consume**: `CORE_ENGINES/10_ReadinessEngineCombined` (readiness del día)
- **Consume**: `CORE_ENGINES/09_BanisterEngine` (días inactivos → protocolo retorno)
- **Consume**: catálogo de movimientos de `CORE_ENGINES/01_StressEngine_IMR`
- **Alimenta**: registro de sesión (warmup completado → dato de adherencia)
