# ACTIVO #10: Diccionario de Coeficientes de Movimiento

## Clasificación
- **Tipo:** Modelo de Datos (Data Architecture)
- **Prioridad:** CRÍTICO — fundamento del IMR Engine. Sin este activo, el cálculo de carga es inválido.
- **Estado actual:** Implementado en `movement_catalog.json`, fuente: CrossFit Movement Standards + Mayhem + CompTrain

## Ubicación en el sistema actual
- **Archivo principal:** `backend/app/data/movement_catalog.json`
- **Consumidor primario:** `backend/app/services/calculations.py` → clase `StressEngine`
- **Versión actual:** 1.0

## Estructura del activo

### Coeficientes actuales por categoría

#### OLYMPIC LIFTING (mayor demanda del SNC)
| Movimiento | Coeficiente | Justificación |
|---|---|---|
| Snatch (todas las variantes) | 1.25 | Más técnico + máxima demanda neuromusuclar |
| Power Clean / Squat Clean / Hang Power Clean | 1.20 | Alta demanda explosiva del SNC |

#### BARBELL STRENGTH
| Movimiento | Coeficiente |
|---|---|
| Deadlift | 1.20 |
| Back Squat | 1.10 |
| Overhead Press | 0.90 |
| Bench Press | 0.95 |

#### GYMNASTICS
| Movimiento | Coeficiente |
|---|---|
| Muscle-up | 1.30 (más alto del catálogo) |
| HSPU | 1.15 |
| Pull-up | 1.00 |
| Toes-to-Bar | 0.90 |
| Rope Climb | 1.00 |

#### METABOLIC / CARDIO
| Movimiento | Coeficiente |
|---|---|
| Box Jump | 0.85 |
| Burpee | 0.80 |
| Running | 0.75 |
| Row / Bike / Ski | 0.70 |
| Double-under | 0.70 |

### Multiplicadores de tipo de WOD
| Tipo | Multiplicador | Justificación |
|---|---|---|
| Strength | 1.30 | Alta demanda neuromuscular concentrada |
| Interval | 1.20 | Esfuerzo máximo por intervalos |
| AMRAP | 1.15 | Ritmo sostenido bajo presión competitiva |
| For Time | 1.00 | Baseline de referencia |
| Chipper | 1.05 | Volumen alto pero ritmo manejable |
| Ladder | 1.00 | Estructura progresiva controlada |
| EMOM | 0.85 | Intervalos con descanso integrado |
| LSD (Long Slow Distance) | 0.60 | Baja intensidad, alto volumen aeróbico |

## Metadatos por movimiento
Cada movimiento en el catálogo incluye:
- `stress_coefficient` — multiplicador de carga fisiológica
- `requires_1rm` — si verdadero, necesita 1RM registrado para cálculo preciso
- `primary_muscles` — grupos musculares afectados
- `variations` — versiones con el mismo coeficiente base
- `typical_reps_range` — rango de repeticiones esperado
- `intensity_scale` — clasificación subjetiva de dificultad

## Brechas identificadas (deuda técnica)
1. **Variantes olímpicas sin diferenciación:** Squat Snatch a 90% 1RM y Hang Power Snatch a 60% usan el mismo coeficiente 1.25. Una versión avanzada debería tener coeficientes por variante y por intensidad relativa al 1RM.
2. **Clean & Jerk:** No existe como movimiento independiente — está implícito como combinación de Clean + Jerk, pero no tiene su propio ID ni coeficiente compuesto.
3. **Coeficiente por % de 1RM:** El coeficiente es fijo. La realidad fisiológica es que el mismo movimiento al 95% del 1RM genera más estrés que al 70%. Una versión v2 debería incluir la curva de intensidad relativa.
4. **Solo ~20 movimientos catalogados:** El repertorio real del CrossFit tiene 80-100 movimientos. El catálogo debe expandirse antes de migración.

## Valor estratégico
1. **IP silenciosa más valiosa del sistema** — sin estos coeficientes, el IMR es genérico e inútil
2. **Basado en 3 fuentes de autoridad** (CrossFit Standards, Mayhem, CompTrain) — no es arbitrario
3. **Diferencia entre "calculadora de reps" y "sistema que entiende CrossFit biomecánicamente"**
4. **Es el activo que hace que VOLTA no pueda ser copiado fácilmente** — replicar los algoritmos es posible, reconstruir este diccionario con rigor científico toma años

## Requisitos para migración/adaptación
1. **Expandir a 80-100 movimientos** antes de lanzamiento (incluir Thrusters, Wall Balls, KB Swings, GHD, etc.)
2. **Separar coeficiente base de modificador por variante** — estructura v2:
   ```
   snatch.base_coefficient = 1.25
   snatch.variants.squat_snatch.modifier = +0.10
   snatch.variants.hang_power_snatch.modifier = -0.05
   ```
3. **Agregar Clean & Jerk** como movimiento compuesto con su propio coeficiente (~1.35)
4. **Implementar curva de intensidad relativa** (% del 1RM afecta el coeficiente final)
5. **Preservar la estructura JSON** — es consumida directamente por el StressEngine
6. **Versionar el diccionario** — los coeficientes pueden refinarse con datos de 1,000+ atletas (Año 2)
