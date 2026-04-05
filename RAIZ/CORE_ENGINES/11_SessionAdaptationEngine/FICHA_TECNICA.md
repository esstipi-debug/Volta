---
name: Motor de Adaptación de Sesiones en Tiempo Real
description: Modifica automáticamente el WOD del día según el estado fisiológico real del atleta CrossFit
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #04
---

# Activo #11 — Motor de Adaptación de Sesiones

## Categoría
Lógica de Negocio + Algoritmo de Valor

## ¿Qué hace?

Cierra el loop entre datos y acción concreta.

VOLTA actualmente calcula riesgo e indica ACWR. Pero no responde la pregunta del atleta:
> **"¿Qué hago hoy exactamente?"**

Este motor responde eso.

---

## Lógica de Adaptación CrossFit

| Readiness | Acción del motor | Ejemplo práctico |
|-----------|-----------------|-----------------|
| 85-100 | WOD completo. Intentar escala RX o más peso | "Hoy es día de PR. 100% de la carga prescrita." |
| 70-84 | Volumen −10%, intensidad completa | "Mismos rounds, 10% menos peso en barbell." |
| 55-69 | Volumen −20%, intensidad −5% | "Reduce rounds a 4/5. Peso conservador." |
| 40-54 | WOD reducido. Solo movimientos principales | "Solo los 3 movimientos del WOD, 15 min cap." |
| < 40 | Recuperación activa | "Nada de WOD hoy. 20 min de movilidad + técnica." |

---

## Variables que considera

1. **Readiness del día** (Banister + Lifestyle si disponible)
2. **Fatiga acumulada** últimos 7 días (total IMR)
3. **Días consecutivos entrenados** (sin día de descanso)
4. **RPE promedio** de las últimas 3 sesiones
5. **Fase de programación** (si el coach asignó un macrocycle — ej: semana de peak de CompTrain)
6. **Fase hormonal** (si el atleta usa el Motor Menstrual)

---

## Adaptaciones específicas CrossFit

### Tipos de WOD y cómo se adaptan

| Tipo WOD | Readiness <55% → Adaptación |
|----------|------------------------------|
| AMRAP | Reducir tiempo cap (20min→12min) |
| For Time | Reducir rondas o reps por ronda |
| EMOM | Reducir minutos (30→18) o trabajo/min |
| Heavy Day | Reducir % del RM (85%→70%) |
| Chipper | Eliminar último movimiento |
| Hero WOD | No escalar — siempre recuperación activa si readiness <55% |

### Regla de los días consecutivos
```
3 días seguidos → aviso suave
4 días seguidos + readiness <70% → adaptar a escala media
5 días seguidos → forzar recuperación activa (sin WOD completo)
```

### Detección de "falsa energía post-vacaciones"
```
Si (días_inactivo > 10) Y (readiness_aparente > 75):
  → Activar protocolo de retorno (ver Warmup Generator)
  → Limitar carga a 60% del último RM registrado
  → Mostrar alerta: "Tu fitness bajó aunque te sientes bien."
```

---

## Output del motor — Lo que ve el atleta

Antes del WOD, VOLTA muestra:

```
📊 Tu readiness hoy: 61

WOD del día adaptado para ti:
"Fran" → versión adaptada

Original: 21-15-9 Thrusters 43kg / Pull-ups
Tu versión: 15-12-9 Thrusters 34kg / Jumping Pull-ups

¿Por qué? Llevas 4 días seguidos entrenando
y tu sueño de anoche fue bajo.
```

---

## ¿Por qué tiene valor intrínseco en CrossFit?

1. **El atleta amateur no sabe escalar** — la app lo hace por él
2. **Previene el sobreentrenamiento del "fin de semana warrior"** (5 WODs en 3 días)
3. **El coach puede revisar qué adaptaciones hizo la app** — transparencia total
4. **Otros boxes dan el mismo WOD a todos** — VOLTA da el WOD de cada persona

---

## Integración con activos VOLTA

- **Consume**: `CORE_ENGINES/09_BanisterEngine` (readiness score)
- **Consume**: `CORE_ENGINES/10_ReadinessEngineCombined` (readiness + lifestyle)
- **Consume**: `CORE_ENGINES/05_MenstrualPeriodizationEngine` (si aplica)
- **Consume**: `STRATEGY/02_CompTrain2026_LegitimacyAsset` (fase de programación)
- **Alimenta**: `CORE_ENGINES/13_WarmupGenerator` (warmup acorde al WOD adaptado)
