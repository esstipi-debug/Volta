# ACTIVO #1: StressEngine (Motor IMR)

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** FUNDACIONAL — todas las demás métricas dependen de este motor
- **Estado actual:** Implementado y validado con 5 casos de prueba

## Ubicación en el sistema actual
- **Backend Python:** `backend/app/services/calculations.py` (clase `StressEngine`)
- **Datos de referencia:** `backend/app/data/movement_mappings.json` (30+ movimientos)
- **Validación:** `backend/app/validation_endpoint.py` (5 WODs de prueba)
- **Tests:** `backend/tests/test_calculations.py`

## Lógica subyacente

### Fórmula principal
```
IMR = Σ(coeficiente_movimiento × peso × reps) × multiplicador_tipo_wod × factor_densidad
```

### Capa 1 — Coeficientes de estrés por movimiento
Cada movimiento tiene un coeficiente científico que refleja su impacto en el sistema nervioso central:

| Movimiento | Coeficiente | Justificación |
|------------|-------------|---------------|
| Deadlift | 1.2 | Alto estrés CNS, cadena posterior completa |
| Squat | 1.1 | Estrés moderado-alto, carga axial |
| Pull-ups | 1.0 | Peso corporal, moderado |
| Press | 0.9 | Moderado, menos masa muscular |
| Burpees | 0.8 | Bajo impacto individual, alto acumulativo |
| Rowing | 0.7 | Bajo estrés articular |

**Fuente:** `movement_mappings.json` contiene 30+ movimientos con coeficientes, categorías (gymnastics/weightlifting/cardio) y opciones de escalado basadas en Mayhem Athlete Scaling Doc + CompTrain Methodology.

### Capa 2 — Multiplicadores por tipo de WOD
Captura la naturaleza metabólica del formato de entrenamiento:

| Tipo WOD | Multiplicador | Razón |
|----------|---------------|-------|
| FOR_TIME | 1.0 | Baseline — esfuerzo autoregulado |
| AMRAP | 1.15 | Mayor intensidad sostenida |
| STRENGTH | 1.3 | Máxima demanda del CNS |
| INTERVAL | 1.2 | Picos repetidos de esfuerzo |
| EMOM | 0.85 | Intervalos controlados con descanso forzado |
| LSD | 0.6 | Recuperación activa, baja intensidad |
| CHIPPER | 1.1 | Volumen alto, variedad de movimientos |
| LADDER | 1.1 | Progresión de carga |

### Capa 3 — Factor de densidad (reps/minuto)
Ajusta el IMR según el ritmo real de ejecución:

| Densidad (reps/min) | Factor | Interpretación |
|---------------------|--------|----------------|
| > 15 | +15% | Sprint metabólico |
| 12-15 | +10% | Alta intensidad sostenida |
| 9-12 | +5% | Moderada-alta |
| 6-9 | 0% | Baseline |
| 4-6 | -5% | Fuerza pesada, descanso largo |
| < 4 | -10% | Técnica pura o máximos |

### Casos de validación confirmados
1. **Fran** (21-15-9 Thrusters + Pull-ups) → ~5,919 IMR
2. **Push Capacity AMRAP** → ~12,000 IMR
3. **Grip Burner EMOM** → ~783 IMR
4. **Strength Day** (5×5 Back Squat) → ~5,000 IMR
5. **LSD Run** → ~4,500 IMR

## Dependencias (qué otros activos consumen este motor)
- **ACWR Calculator** — usa IMR diarios acumulados para calcular ratio agudo:crónico
- **Readiness Score** — el IMR alimenta el contexto de carga para la síntesis diaria
- **Injury Risk Predictor** — ACWR (derivado de IMR) pesa 50% del predictor
- **Distribución de Movimientos** — categorías de cada movimiento vienen del mismo JSON
- **Coach Dashboard** — muestra IMR por sesión, por semana, por ciclo
- **Alertas del sistema** — umbrales basados en desviaciones de IMR promedio

## Requisitos para migración/adaptación
1. **Preservar las 3 capas de cálculo** — la potencia del motor está en la composición de coeficiente + multiplicador + densidad
2. **Migrar `movement_mappings.json` íntegro** — es la biblioteca de referencia con 30+ movimientos, coeficientes y escalados
3. **Mantener tipado fuerte** — los enums de `WorkoutType` (8 tipos) deben preservarse
4. **Los 5 casos de validación** deben servir como test suite en cualquier nuevo formato
5. **El motor debe ser stateless** — recibe datos de un WOD, devuelve IMR. Sin dependencia de DB
6. **Considerar extensibilidad** — el JSON de movimientos debe ser editable para agregar nuevos movimientos sin tocar código
