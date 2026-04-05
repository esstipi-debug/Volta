# ACTIVO #3: InjuryPreventionAlertSystem (Motor de Alertas Jerárquicas)

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** ALTO — cerebro de decisión que convierte datos en acciones
- **Estado actual:** Implementado en Python (408 líneas) y TypeScript (mirror completo)

## Ubicación en el sistema actual
- **Backend Python:** `backend/app/injury_prevention_alert.py` (clase `InjuryPreventionAlertSystem`)
- **Frontend TypeScript:** `src/lib/alert-system.ts` (mirror de la lógica Python)
- **Parámetros:** `backend/app/injury_prevention_params.py` (umbrales HRV, OTS, sueño)
- **Parámetros TS:** `src/lib/injury-prevention-params.ts` (850+ líneas)
- **Ruta API:** `backend/app/routes/injury_prevention.py` (endpoint POST `/api/injuries/check-alert`)

## Lógica subyacente

### Arquitectura de resolución jerárquica (3 niveles)

El sistema evalúa señales en orden de prioridad descendente. El nivel más conservador siempre prevalece.

```
┌─────────────────────────────────────────────────────┐
│ NIVEL 1 — BIENESTAR SUBJETIVO (override absoluto)   │
│ Si atleta reporta <3/10 → ALERTA NEGRA inmediata    │
│ Razón: percepción del atleta supera cualquier dato   │
├─────────────────────────────────────────────────────┤
│ NIVEL 2A — HRV (Variabilidad Cardíaca)              │
│ Depresión >50% vs baseline → ROJO                    │
│ Depresión >30% vs baseline → AMARILLO                │
│                                                       │
│ NIVEL 2B — CALIDAD DE SUEÑO                          │
│ <6 horas consistente → multiplicador riesgo 2.5x     │
│ <7 horas consistente → multiplicador riesgo 1.7x     │
│ 7-9 horas → baseline (sin ajuste)                    │
├─────────────────────────────────────────────────────┤
│ NIVEL 3 — ACWR AJUSTADO                              │
│ Usa ACWR personalizado (Activo #2)                   │
│ Aplica ajustes demográficos antes de evaluar zona    │
└─────────────────────────────────────────────────────┘
```

### Flujo de ejecución (pipeline)
```
1. checkSubjectiveWellbeing(score)
   → Si <3/10: return BLACK, skip todo lo demás

2. calculateAdjustedACWR(acwr_raw, demographics)
   → Aplica ajustes: menstrual, edad, training age, estrés

3. checkHRV(hrv_current, hrv_baseline)
   → Calcula % depresión, evalúa contra umbrales

4. checkSleep(hours, quality)
   → Calcula multiplicador de riesgo

5. checkOTS(testosterone_cortisol_ratio)
   → Si T/C <0.35: diagnóstico clínico de sobreentrenamiento
   → Si T/C <0.50: warning
   → Si T/C <0.80: monitoreo

6. generateRecommendations(all_signals)
   → Compila severidad final + acciones específicas

7. flagUncertainty(triggered_parameters)
   → Agrega research gaps relevantes con % de confianza
```

### Umbrales de HRV
```
HRV_THRESHOLDS:
  RED:    depresión >50% desde baseline
  YELLOW: depresión >30% desde baseline
  GREEN:  depresión <30% o mejora
```

### Umbrales de OTS (Overtraining Syndrome)
```
OTS_DIAGNOSIS (ratio Testosterona/Cortisol):
  CLINICAL:  T/C < 0.35 → sobreentrenamiento confirmado
  WARNING:   T/C < 0.50 → riesgo alto
  MONITOR:   T/C < 0.80 → vigilancia activa
```

### Multiplicadores de sueño
```
SLEEP_RISK:
  <6 horas: 2.5x riesgo de lesión
  <7 horas: 1.7x riesgo de lesión
  7-9 horas: 1.0x (baseline)
  >9 horas: 0.9x (recuperación extra)
```

### Estructura del output
```
AlertResult {
  severity: GREEN | YELLOW | RED | BLACK
  triggered_by: string         // "subjective_wellbeing" | "hrv_depression" | "acwr_critical" | etc.
  adjusted_acwr: float         // ACWR post-ajustes demográficos
  recommendations: string[]    // Acciones específicas ordenadas por prioridad
  confidence: float            // % confianza del diagnóstico (0.0 - 1.0)
  uncertainty_flags: string[]  // Research gaps relevantes al caso
  rtp_step: int | null         // Paso actual del protocolo Return-to-Play si aplica
}
```

### Severidades y su significado
| Severidad | Significado | Acción automática |
|-----------|-------------|-------------------|
| GREEN | Sistema estable, entrena normal | Ninguna — progresión según plan |
| YELLOW | Señales de alerta temprana | Notificación al atleta + coach, reducir 20% volumen |
| RED | Riesgo inminente | Alerta urgente, descanso recomendado 1-2 días |
| BLACK | Crisis — bienestar subjetivo colapsado | Override total, descanso obligatorio, contactar coach |

### Honestidad sobre incertidumbre (uncertainty_flags)
Característica única: el sistema reporta sus propias limitaciones.

```
RESEARCH_GAPS (5 gaps documentados):
  GAP_1: "Tamaño de muestra pequeño en estudios HRV-lesión" → confianza 70%
  GAP_2: "Ajustes menstruales basados en estudios con N<50" → confianza 65%
  GAP_3: "OTS diagnosis requiere análisis hormonal no siempre disponible" → confianza 60%
  GAP_4: "Correlación sueño-lesión varía significativamente por deporte" → confianza 75%
  GAP_5: "Estrés psicosocial como multiplicador necesita más validación" → confianza 55%
```

## Dependencias
- **Consume:**
  - ACWR Calculator (Activo #2) — para el Nivel 3
  - StressEngine IMR (Activo #1) — indirectamente vía ACWR
  - Datos biométricos del atleta (HRV, sueño, bienestar subjetivo)
  - Perfil demográfico del atleta (edad, sexo, training age, ciclo menstrual)
- **Alimenta:**
  - MovementEscalationEngine — las alertas disparan recomendaciones de escalado
  - RTP Protocol — la severidad determina el paso de retorno
  - Coach Dashboard — visualización de alertas por atleta
  - Notificaciones push — alertas YELLOW/RED/BLACK generan notificaciones

## Valor diferenciador
1. **Jerarquía de 3 niveles** — no es un solo umbral, es un pipeline que prioriza señales
2. **Override subjetivo** — respeta la percepción del atleta por encima de cualquier dato
3. **Honestidad sobre incertidumbre** — ningún competidor reporta research gaps al usuario
4. **Doble implementación** — Python (backend) + TypeScript (frontend) para ejecución offline
5. **OTS diagnosis integrado** — ratio T/C como señal de sobreentrenamiento clínico
6. **11 secciones de investigación** respaldando cada umbral con citas específicas

## Requisitos para migración/adaptación
1. **Preservar la jerarquía de 3 niveles** — el orden de evaluación es crítico (Nivel 1 override todo)
2. **Migrar los 5 research gaps** con sus niveles de confianza — es diferenciador de marca
3. **Mantener pipeline secuencial** — cada check puede short-circuit el resto
4. **Preservar los 4 niveles de severidad** (GREEN/YELLOW/RED/BLACK) — son la interfaz de comunicación
5. **El endpoint API debe aceptar datos parciales** — no todos los atletas tendrán HRV o T/C disponible
6. **Graceful degradation** — si falta HRV, evalúa solo con ACWR + sueño. Si falta sueño, solo ACWR. Nunca falla silenciosamente.
7. **Los umbrales deben ser versionados** — a medida que nueva investigación aparezca, los números cambiarán
