---
name: ACWR + Injury Prevention Alert System (Motor Integrado)
description: Sistema de cálculo de carga aguda/crónica + alertas jerárquicas de prevención de lesiones
type: CORE_ENGINE
estado: Implementado (Python + TypeScript)
fecha: 2026-03-27
---

# Activo #02 — ACWR + Injury Prevention Alert System

**FUSIÓN DE ACTIVOS 02 + 03**

El cálculo del ACWR y su sistema de alertas son dos caras de la misma moneda: no tiene sentido calcular un ratio sin actuar sobre él. Este activo unifica ambos.

---

## Clasificación

- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** CRÍTICO — principal mecanismo de prevención de lesiones
- **Estado actual:** Implementado en Python y TypeScript
- **Ubicación:**
  - Backend Python: `backend/app/services/calculations.py` + `backend/app/injury_prevention_alert.py`
  - Frontend TypeScript: `src/lib/injury-prevention-params.ts` + `src/lib/alert-system.ts`
  - API: `backend/app/routes/injury_prevention.py`

---

## Parte 1 — Cálculo ACWR

### Fórmula base

```
ACWR = Promedio_IMR_últimos_7_días ÷ Promedio_IMR_últimos_28_días
```

### Sistema de zonas

| ACWR | Zona | Riesgo relativo | Acción |
|------|------|-----------------|--------|
| < 0.8 | UNDERTRAIN | 1.5x | Aumentar carga |
| 0.8–1.3 | OPTIMAL | 1.0x (baseline) | Mantener curso |
| 1.3–1.5 | CAUTION | 2.0x | Monitorear |
| > 1.5 | DANGER | 4.0x | Descanso 1-2 días |

### Umbrales refinados

```
ACWR_THRESHOLDS:
  SAFE_LOWER: 0.60
  SAFE_UPPER: 0.80
  OPTIMAL_LOWER: 0.80
  OPTIMAL_UPPER: 1.30
  WARNING: 1.30
  CRITICAL: 1.50
```

### Ajustes demográficos (ACWR personalizado)

| Factor | Ajuste | Fuente |
|--------|--------|--------|
| Ciclo menstrual activo | -0.20 | Investigación hormonal |
| Edad > 35 años | -0.15 | Recuperación disminuida |
| Training age < 2 años | -0.25 | Sistema musculoesquelético inmaduro |
| Estrés psicosocial | ×3 multiplicador | Cortisol elevado |
| Historial lesión reciente | -0.10 | Tejido vulnerable |

---

## Parte 2 — Sistema de Alertas Jerárquicas

### Arquitectura de 3 niveles (el más conservador prevalece)

```
NIVEL 1 — BIENESTAR SUBJETIVO (override absoluto)
├── Si atleta reporta <3/10 → ALERTA NEGRA
└── Percepción del atleta supera cualquier dato

NIVEL 2 — BIOLOGÍA (HRV + Sueño)
├── HRV depresión >50% vs baseline → ROJO
├── HRV depresión >30% vs baseline → AMARILLO
├── Sueño <6h consistente → ×2.5 multiplicador riesgo
└── Sueño <7h consistente → ×1.7 multiplicador riesgo

NIVEL 3 — ACWR AJUSTADO
├── Aplica ajustes demográficos
└── Evalúa contra umbrales personalizados
```

### Flujo de ejecución (pipeline)

```
1. checkSubjectiveWellbeing(score)
   → Si <3/10: return BLACK, skip todo lo demás

2. calculateAdjustedACWR(acwr_raw, demographics)
   → Aplica ajustes: menstrual, edad, training age, estrés

3. checkHRV(hrv_current, hrv_baseline)
   → Si depresión >50%: return RED

4. checkSleep(hours, consistency)
   → Si <6h: aplica multiplicador 2.5x al riesgo

5. resolveFinalAlert()
   → Resultado conservador de 1-4
```

### Salidas del sistema (alertas)

| Alerta | Color | Acción recomendada |
|--------|-------|-------------------|
| BLACK | 🔴🔴🔴 | Pausa entrenamiento. Revisar bienestar con coach. |
| RED | 🔴 | Descanso obligatorio 1-2 días. Solo técnica si se entrena. |
| YELLOW | 🟡 | Escalar WOD. Monitorear HRV/sueño. |
| BLUE | 🔵 | Fase de recuperación. Entrenar conservador. |
| GREEN | 🟢 | Zona óptima. Entrenar normal. |

---

## Integración con VOLTA

- **Consume**: `CORE_ENGINES/01_StressEngine_IMR` (cálculo de carga)
- **Consume**: `CORE_ENGINES/04_RecoveryCalculator` (tiempos de recuperación)
- **Alimenta**: `CORE_ENGINES/09_BanisterReadiness_Engine` (score readiness)
- **Alimenta**: `UX_FLOWS/03_ColorAlertSystem` (color del día)
- **Alimenta**: `UX_FLOWS/02_GamificationSystem` (bonus por descansar inteligente)

---

## Especificación técnica

### Entrada (datos requeridos)

```
{
  athlete_id: UUID,
  workout_data: {
    date: ISO8601,
    imr: float (0-2000),
    vector_breakdown: { MEC, SNC, MET, ART }
  },
  biometric_data: {
    wellbeing: 1-10,
    hrv: float (milis),
    hrv_baseline: float,
    sleep_hours: float,
    sleep_consistency_7d: percent,
    stress_level: 1-10
  },
  demographics: {
    age: int,
    training_age: int,
    menstrual_cycle_phase?: string,
    recent_injury_history?: bool
  }
}
```

### Salida (alert + metadata)

```
{
  alert_level: "BLACK" | "RED" | "YELLOW" | "BLUE" | "GREEN",
  acwr_value: float,
  acwr_adjusted: float,
  hrv_status: string,
  sleep_status: string,
  wellbeing_status: string,
  recommendation: string,
  timestamp: ISO8601
}
```

---

## MVP — Lo que entra Mes 1

- ✅ Cálculo ACWR base
- ✅ Umbrales + zonas (4 variables)
- ✅ Alertas jerárquicas (3 niveles)
- ⚠️ Ajustes demográficos (solo edad + training age, NO menstrual)

## V2 — Lo que se añade después

- Integración completa con HRV (requiere wearable API)
- Ajuste menstrual completo
- Machine learning para predicción de lesiones

---

## Referencias

- ACWR original: Blanchard et al. (2012, 2016)
- Ajustes demográficos: Investigación propia + Gabbett 2020
- Arquitectura de alertas: Diseño VOLTA específico
