# ACTIVO #7: RadarCalculator — Motor PRISMA de 10 Dimensiones

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** ALTO — único sistema de evaluación multidimensional del atleta
- **Estado actual:** Implementado en Python, esquema DB definido, ejecución cada 6 semanas

## Ubicación en el sistema actual
- **Backend Python:** `backend/app/services/calculations.py` (clase `RadarCalculator`)
- **Esquema DB:** `migrations/001_initial_schema.sql` (tabla `radar_scores`)
- **Datos de referencia:** `backend/app/data/training_tenets.json` (CompTrain 3 Tenets + 9 Attributes)
- **Metodología:** `docs/2025 CompTrain Complete Training Methodology.pdf`

## Lógica subyacente

### Las 10 dimensiones del fitness funcional

| # | Dimensión | Qué evalúa | Cómo se mide |
|---|-----------|-------------|--------------|
| 1 | **Cardiovascular** | VO2Max, capacidad aeróbica, recovery rate | Beep test / 2km row time / HR recovery post-WOD |
| 2 | **Strength** | Fuerza máxima absoluta | 1RM en Back Squat, Deadlift, Strict Press |
| 3 | **Power** | Potencia explosiva | 1RM Clean, Snatch, max height Box Jump |
| 4 | **Flexibility** | Rango de movimiento articular | Overhead Squat depth, ankle dorsiflexion, shoulder rotation |
| 5 | **Speed** | Velocidad pura y cycle time | 400m sprint, cycle time en WODs cortos (<5min) |
| 6 | **Coordination** | Precisión en movimientos complejos | Muscle-ups, Handstand Walk, Snatch consistency |
| 7 | **Agility** | Cambios de dirección, transiciones | Shuttle run, transiciones en WODs multimodales |
| 8 | **Balance** | Estabilidad unilateral y overhead | Pistol Squats, Handstand Hold, Single-leg Deadlift |
| 9 | **Precision** | Consistencia técnica bajo fatiga | Varianza de técnica entre rep 1 y rep final en WODs |
| 10 | **Endurance** | Resistencia muscular + cardiorrespiratoria | WODs de 20+ minutos, degradación de pace |

### Escala de puntuación
```
Cada dimensión: 0 a 100

  90-100: Élite (top 5% de atletas CrossFit)
  75-89:  Avanzado (competidor regional)
  60-74:  Intermedio (atleta consistente de box)
  40-59:  En desarrollo (1-2 años de experiencia)
  0-39:   Principiante / debilidad significativa
```

### Protocolo del test PRISMA
```
Frecuencia: Cada 6 semanas (alineado con fin de ciclo CompTrain)

Estructura del test:
  Día 1 — Fuerza + Potencia
    • 1RM Back Squat
    • 1RM Deadlift
    • 1RM Clean
    • 1RM Snatch
    • Max Box Jump

  Día 2 — Cardiovascular + Endurance
    • VO2Max estimation (beep test o 2km row)
    • 20min AMRAP (mide degradación de pace)
    • HR recovery a 3min post-WOD

  Día 3 — Skills + Flexibility
    • Overhead Squat assessment (depth + alignment)
    • Max unbroken Muscle-ups
    • Handstand Walk distance
    • Pistol Squat assessment
    • Mobility battery (ankle, hip, shoulder, thoracic)
```

### Cálculo del score por dimensión
```
Cada dimensión tiene benchmarks por nivel:

Ejemplo — Strength:
  1RM Back Squat (hombre 80kg):
    100 = 200kg+ (élite mundial)
    90  = 170kg (élite regional)
    75  = 140kg (avanzado)
    60  = 110kg (intermedio)
    40  = 80kg (en desarrollo)
    20  = 50kg (principiante)

  Score = interpolación lineal entre benchmarks más cercanos
  Ajuste por peso corporal (relativo, no absoluto)
```

### Comparación temporal (delta entre tests)
```
PRISMA Test #1 (Semana 6):
  Cardiovascular: 78, Strength: 65, Power: 72, Flexibility: 45...

PRISMA Test #2 (Semana 12):
  Cardiovascular: 82, Strength: 71, Power: 76, Flexibility: 48...

Delta:
  Cardiovascular: +4 (+5.1%)
  Strength: +6 (+9.2%)
  Power: +4 (+5.6%)
  Flexibility: +3 (+6.7%)  ← mejoró pero sigue siendo debilidad

Insight automático:
  "Fuerza y cardio mejoraron significativamente. Pero Flexibilidad
   sigue en 48% — zona de riesgo. Recomendación: próximo ciclo
   aumentar movilidad 15%, reducir volumen cardio 10%."
```

### Radar agregado (nivel Coach/Box)
```
Promedio de 15 atletas del box:
  Cardiovascular: 76%
  Strength: 68%
  Power: 70%
  Flexibility: 48%  ← debilidad sistémica
  Speed: 65%
  Coordination: 58%  ← segunda debilidad
  ...

Diagnóstico del coach:
  "Tu programación genera buenos resultados en cardio y fuerza,
   pero descuida movilidad y coordinación. 15 de 15 atletas tienen
   Flexibility <55%. Esto es un problema del programa, no del atleta."
```

### Persistencia en base de datos
```sql
-- Tabla: radar_scores
athlete_id UUID          -- FK a athletes
cardiovascular FLOAT     -- 0-100
strength FLOAT           -- 0-100
flexibility FLOAT        -- 0-100
power FLOAT              -- 0-100
speed FLOAT              -- 0-100
coordination FLOAT       -- 0-100
agility FLOAT            -- 0-100
balance FLOAT            -- 0-100
precision FLOAT          -- 0-100
-- Nota: endurance es la 10ma dimensión (no presente explícitamente
--        en schema actual, calculada vía cardiovascular + WOD largo)
date DATE
created_at TIMESTAMP
```

### Integración con CompTrain
```
Fuente: training_tenets.json

CompTrain define 3 Tenets + 9 Attributes del atleta completo.
Las 10 dimensiones de PRISMA mapean directamente a estos attributes,
permitiendo evaluar si la programación CompTrain está cumpliendo
su propósito declarado en cada ciclo.
```

## Dependencias
- **Consume:**
  - Resultados de tests presenciales (1RMs, tiempos, distancias)
  - Datos de WODs históricos (para Endurance y Precision bajo fatiga)
  - `training_tenets.json` (benchmarks CompTrain)
  - Peso corporal del atleta (para normalización relativa)
- **Alimenta:**
  - Dashboard del atleta — gráfico radar visual
  - Coach Dashboard — radar agregado por box
  - Recomendaciones de ajuste de programación (próximo ciclo de 6 semanas)
  - Carta Magna — "Acta de Defunción del Ego" (confrontación visual de debilidades)
  - Comparación cross-box (documentada en visión Año 3)
  - Validación de VO2Max de wearable vs PRISMA test (documentado en integración avanzada)

## Valor diferenciador
1. **10 dimensiones vs las 1-3 que miden competidores** — perfil completo, no parcial
2. **Comparación temporal cada 6 semanas** — progresión real, no percibida
3. **Radar agregado por box** — expone debilidades de la PROGRAMACIÓN, no solo del atleta
4. **Alineado con CompTrain** — mapeo directo a 9 Attributes de la metodología oficial
5. **Confrontación visual** — un gráfico radar con un lado hundido es imposible de ignorar
6. **Base para competencias relativas** (visión Año 3) — scoring por esfuerzo relativo a capacidad
7. **Validación cruzada** — el VO2Max estimado por wearable se compara contra PRISMA real

## Requisitos para migración/adaptación
1. **Preservar las 10 dimensiones exactas** — son el framework completo de evaluación
2. **Migrar benchmarks por nivel** para cada dimensión (ajustados por peso/sexo/edad)
3. **Mantener serie temporal** — el valor de PRISMA está en la comparación, no en un test aislado
4. **El protocolo del test (3 días)** debe documentarse como asset independiente para coaches
5. **Agregar la 10ma dimensión (Endurance)** explícitamente en el schema DB — actualmente calculada
6. **Normalización por peso corporal** es crítica para comparación justa entre atletas
7. **Considerar benchmarks dinámicos** — a medida que se acumulen datos de 1,000+ atletas (Año 2), los benchmarks se recalibran estadísticamente
8. **El gráfico radar es el entregable visual más importante** — preservar formato de visualización
