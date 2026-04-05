---
name: Correcciones y Complementos a la Investigación de Carga Multimodal
description: Fixes P0 y P1 detectados en la revisión del documento de investigación
type: CORE_ENGINE
estado: CORRECCIÓN ACTIVA
---

# CORRECCIONES A LA INVESTIGACIÓN DE CARGA MULTIMODAL

## CORRECCIÓN P0-A: Normalización de Escala Monostructurales

### El problema
La escala definida es 0.50 — 2.00, pero los monostructurales rompen el techo:
- Run 800m = 2.00 (en el límite)
- Run 1600m = 3.50 (fuera de escala)
- Run 5K = 8.00 (fuera de escala)
- Row 500m = 1.50 (ok)

Esto ocurre porque los monostructurales están coeficientados **por evento completo**,
mientras que los movimientos de barbell/gimnásticos están coeficientados **por repetición**.

### La solución: Coeficiente por unidad de esfuerzo normalizada

Los monostructurales deben expresarse **por unidad comparable** y luego el total
se calcula como `Coef × unidades`. La unidad natural para cada tipo:

```
CARRERA:  coeficiente por cada 200m
REMO:     coeficiente por cada 10 calorías (o por cada 250m)
BIKE:     coeficiente por cada 10 calorías
SKI:      coeficiente por cada 10 calorías
SALTO:    coeficiente por cada 50 repeticiones
SWIM:     coeficiente por cada 25m
```

### Tabla corregida — Monostructurales

| ID | Movimiento | Coef/unidad | Unidad | MEC | SNC | MET | ART |
|----|-----------|-------------|--------|-----|-----|-----|-----|
| 99 | Run (sprint) | 0.80 | 200m | 7 | 6 | 9 | 8 |
| 100 | Run (ritmo WOD) | 0.55 | 200m | 6 | 4 | 8 | 7 |
| 101 | Run (steady state) | 0.40 | 200m | 4 | 3 | 7 | 6 |
| 104 | Row Cal (sprint) | 0.60 | 10cal | 6 | 5 | 10 | 3 |
| 105 | Row Cal (moderado) | 0.35 | 10cal | 4 | 3 | 7 | 2 |
| 106 | Row Dist | 0.50 | 250m | 5 | 4 | 9 | 3 |
| 107 | Assault/Echo (sprint) | 0.65 | 10cal | 7 | 6 | 10 | 4 |
| 108 | Assault/Echo (mod) | 0.40 | 10cal | 5 | 4 | 8 | 3 |
| 109 | Bike Erg | 0.35 | 10cal | 6 | 3 | 7 | 3 |
| 110 | SkiErg (sprint) | 0.55 | 10cal | 5 | 6 | 9 | 4 |
| 111 | SkiErg (mod) | 0.35 | 10cal | 3 | 4 | 7 | 3 |
| 112 | Double-Under | 0.60 | 50 reps | 4 | 8 | 8 | 7 |
| 113 | Single-Under | 0.20 | 50 reps | 2 | 3 | 4 | 4 |
| 114 | Triple-Under | 1.50 | 50 reps | 6 | 10 | 9 | 8 |

### Ejemplo de cálculo corregido

WOD "Murph" — Run 1600m + 100 Pull-ups + 200 Push-ups + 300 Squats + Run 1600m

```
Run 1600m = 8 unidades de 200m × 0.55 (ritmo WOD) = 4.40
Pull-ups (kipping) = 100 reps × 0.75 = 75.00
Push-ups = 200 reps × 0.40 = 80.00
Air Squats = 300 reps × 0.30 (estimado bodyweight squat) = 90.00
Run 1600m = 4.40

Subtotal movimientos = 253.80
× Multiplicador Hero WOD = 1.50
= Carga Externa Total = 380.70
```

Ahora todos los monostructurales están dentro del rango del sistema.

---

## CORRECCIÓN P0-B: Fórmula Alométrica Completa para Gimnásticos

### El problema
El documento menciona BW^0.67 pero no desarrolla la fórmula aplicable.

### La fórmula completa

Para cualquier movimiento clasificado como "gimnástico" (bodyweight sin carga externa):

```
Carga_gimnástico = Coef_base × Reps × Factor_Alométrico

Factor_Alométrico = (BW_atleta / BW_referencia) ^ 0.67

BW_referencia = 75 kg (hombre) / 60 kg (mujer)
```

### Tabla de Factor Alométrico precalculada

| BW Atleta (kg) | Factor (ref 75kg) | Factor (ref 60kg) | Impacto |
|----------------|--------------------|--------------------|---------|
| 55 | 0.80 | 0.94 | -20% / -6% carga gimnástica |
| 60 | 0.85 | 1.00 | -15% / baseline |
| 65 | 0.90 | 1.06 | -10% / +6% |
| 70 | 0.95 | 1.12 | -5% / +12% |
| 75 | 1.00 | 1.18 | baseline / +18% |
| 80 | 1.05 | 1.23 | +5% / +23% |
| 85 | 1.09 | 1.29 | +9% / +29% |
| 90 | 1.14 | 1.34 | +14% / +34% |
| 95 | 1.18 | 1.39 | +18% / +39% |
| 100 | 1.22 | 1.44 | +22% / +44% |

### Ejemplo práctico

10 Ring Muscle-Ups (kipping, coef 1.50):

```
Atleta A (70kg hombre):
  1.50 × 10 × (70/75)^0.67 = 1.50 × 10 × 0.95 = 14.25

Atleta B (95kg hombre):
  1.50 × 10 × (95/75)^0.67 = 1.50 × 10 × 1.18 = 17.70

Diferencia: +24% de carga para el atleta pesado en el mismo movimiento.
```

### Movimientos que reciben Factor Alométrico
Todos los marcados como gimnásticos (IDs 29-68), más:
- Burpees (64-66): parcialmente bodyweight
- Box Jumps (61-63): el salto mueve el propio peso
- Pistol Squats (60): unilateral bodyweight

### Movimientos que NO reciben Factor Alométrico
- Barbell (la carga es el peso de la barra, no el BW)
- Implementos (KB, DB, MB — la carga es el implemento)
- Monostructurales de máquina (Row, Bike — la resistencia es mecánica)
- Carrera: SÍ recibe factor alométrico (corres tu propio peso)

---

## CORRECCIÓN P1-A: Multiplicador por Posición en WOD (Fatiga Acumulada)

### Fundamento fisiológico

La fosfocreatina (PCr) se depleta ~50% en 30 segundos de trabajo máximo.
En un WOD sin pausas, cada ronda subsiguiente arranca con menos PCr disponible.
Además, la acumulación de H+ (acidosis) degrada la calidad del movimiento,
lo que aumenta el estrés articular por compensación biomecánica.

### Modelo de fatiga por posición

```
Multiplicador_posición(ronda) = 1.0 + (ronda - 1) × 0.04 × Factor_formato

Donde Factor_formato:
  RFT (sin pausa):     1.00  (fatiga completa entre rondas)
  AMRAP (sin pausa):   0.90  (el atleta autoregula velocidad)
  EMOM (pausa/min):    0.50  (recuperación parcial de PCr)
  Chipper (1 ronda):   N/A   (usar posición del movimiento, no ronda)
```

### Tabla resultante para RFT

| Ronda | Multiplicador | Justificación |
|-------|--------------|---------------|
| 1 | 1.00 | Baseline — técnica fresca |
| 2 | 1.04 | PCr parcialmente depletada |
| 3 | 1.08 | Acidosis perceptible |
| 4 | 1.12 | Técnica empieza a degradar |
| 5 | 1.16 | Compensación biomecánica activa |
| 6+ | 1.20 (cap) | Techo — beyond this, the athlete slows naturally |

### Para Chippers (1 ronda, múltiples movimientos)
La posición del movimiento dentro del chipper equivale a "ronda":

```
Movimiento 1 de 8: multiplicador 1.00
Movimiento 2 de 8: multiplicador 1.03
Movimiento 3 de 8: multiplicador 1.06
...
Movimiento 8 de 8: multiplicador 1.21
```

### Para EMOM
El descanso integrado reduce la acumulación:
```
Minuto 1-5:   multiplicador 1.00
Minuto 6-12:  multiplicador 1.02
Minuto 13-20: multiplicador 1.05
Minuto 21-30: multiplicador 1.08
Minuto 30+:   multiplicador 1.10 (cap)
```

---

## CORRECCIÓN P1-B: Matriz de Sinergia/Antagonismo entre Movimientos

### Definiciones
- **Sinérgico (×1.20)**: mismos grupos musculares primarios → fatiga compuesta
- **Parcialmente sinérgico (×1.10)**: comparten un grupo muscular secundario
- **Neutro (×1.00)**: grupos musculares sin overlap
- **Antagonista (×0.90)**: grupos musculares opuestos → micro-recuperación

### Clasificación por vector muscular primario

Usando los datos de cadena muscular de la Tabla Maestra:

```
GRUPO A — Push Upper (Press, HSPU, Dips, Push-ups)
GRUPO B — Pull Upper (Pull-ups, MU, Rows, Rope Climb)
GRUPO C — Push Lower / Quad (Squat, Thruster, Wall Ball, Lunge, Box Jump)
GRUPO D — Pull Lower / Hip (Deadlift, KB Swing, GHD, RDL)
GRUPO E — Core / Anterior (T2B, Sit-ups, GHD Sit-up)
GRUPO F — Cardio Monostructural (Run, Row, Bike, Ski, DU)
```

### Matriz de interacción

| Par | Tipo | Mult | Ejemplo |
|-----|------|------|---------|
| A + A | Sinérgico | 1.20 | HSPU + Ring Dips |
| B + B | Sinérgico | 1.20 | Pull-ups + Rope Climb |
| C + C | Sinérgico | 1.20 | Thrusters + Wall Balls |
| D + D | Sinérgico | 1.20 | Deadlift + KB Swings |
| A + B | Antagonista | 0.90 | Push Press + Pull-ups |
| C + D | Antagonista | 0.90 | Front Squat + Deadlift |
| A + C | Parcial sinérgico | 1.10 | Thruster (comparte press + squat) |
| B + D | Parcial sinérgico | 1.10 | Pull-ups + KB Swing (comparten posterior) |
| A + D | Neutro | 1.00 | HSPU + Deadlift |
| B + C | Neutro | 1.00 | Pull-ups + Wall Ball |
| A + F | Neutro | 1.00 | Press + Row (cardio) |
| C + F | Parcial sinérgico | 1.10 | Squats + Run (comparten piernas) |
| E + C | Parcial sinérgico | 1.10 | T2B + Thrusters (comparten core/hip flexor) |
| E + F | Neutro | 1.00 | T2B + Row |

### Combinaciones específicas de WODs clásicos

| WOD | Par de movimientos | Tipo | Mult |
|-----|-------------------|------|------|
| Fran | Thrusters (A+C) + Pull-ups (B) | Neutro/Antagonista | 0.95 |
| Grace | Clean & Jerk cycling | Solo movimiento | 1.00 |
| Diane | Deadlift (D) + HSPU (A) | Neutro | 1.00 |
| DT | Deadlift (D) + HPC (D) + Jerk (A) | D+D sinérgico, D+A neutro | 1.10 |
| Isabel | Snatch cycling | Solo movimiento | 1.00 |
| Karen | Wall Balls (C) solo | Solo movimiento | 1.00 |
| Murph | Run (F) + Pull-ups (B) + Push-ups (A) + Squats (C) | Máxima distribución | 0.95 |
| Filthy 50 | 10 movimientos variados | Alta distribución | 0.95 |

### Cómo se aplica

En un WOD couplet (A + B alternando):
```
Carga_total = (Carga_mov_A + Carga_mov_B) × Mult_interacción × Mult_formato
```

En un WOD triplet (A + B + C):
```
Mult_interacción = promedio de los 3 pares:
  Par AB, Par BC, Par AC
  Ejemplo: Thruster(A+C) + Pull-up(B) + Run(F)
  AC+B = 0.95, B+F = 1.00, AC+F = 1.05
  Promedio = 1.00
```

---

## CORRECCIÓN P1-C: Normalización CE↔sRPE para Fórmula Híbrida

### El problema
CE (Carga Externa) produce números como 253.80
sRPE produce números como 480 (RPE 8 × 60 min)
No son comparables directamente.

### Solución: Z-score individual rolling

Para cada atleta, mantener una media móvil (28 días) de sus CE y sRPE:

```
CE_normalizado = (CE_hoy - media_CE_28d) / desvest_CE_28d
sRPE_normalizado = (sRPE_hoy - media_sRPE_28d) / desvest_sRPE_28d
```

Ambos z-scores están ahora en la misma escala (media 0, desvest 1).

La fórmula híbrida queda:
```
CTS_z = 0.70 × CE_normalizado + 0.30 × sRPE_normalizado
```

Y para volver a escala absoluta (para alimentar ACWR y Banister):
```
CTS_absoluta = CTS_z × desvest_CE_28d + media_CE_28d
```

### Cold start (primeros 28 días)
Sin historial suficiente para z-score, usar conversión simple:
```
sRPE_escalado = sRPE × (media_CE_global / media_sRPE_global)
```
Donde las medias globales se calculan de todos los atletas del sistema.

### Detección de discrepancia
```
Delta = CE_normalizado - sRPE_normalizado

Si |Delta| > 1.5 desviaciones estándar de forma consistente (>10 sesiones):
  → Discrepancia estructural → activar auto-calibración

Si Delta > 1.5: modelo sobreestima (atleta dice "fue fácil")
  → Bajar coeficientes de los movimientos frecuentes del atleta

Si Delta < -1.5: modelo subestima (atleta dice "fue brutal")
  → Subir coeficientes O investigar factores externos (sueño, estrés)
```

---

## CORRECCIÓN P1-D: Protocolo de Validación contra Lesiones

### Diseño del estudio

```
Participantes: mínimo 50 atletas activos durante 6 meses
Frecuencia: 3-6 sesiones/semana
Datos capturados por sesión:
  - WOD completo (movimientos, pesos, reps, formato, duración)
  - sRPE a los 30 minutos
  - Check-in diario (sueño, estrés, soreness 1-5)

Datos de lesión capturados:
  - Fecha de inicio de síntomas
  - Zona corporal (hombro, rodilla, lumbar, etc.)
  - Tipo (aguda vs sobreuso)
  - Severidad (sin tiempo perdido / 1-3 días / 4-7 días / 7+ días)
  - Movimiento asociado (si identificable)
```

### Métricas de validación

```
1. CORRELACIÓN CE↔sRPE
   Objetivo: r > 0.70 grupal, r > 0.60 individual
   Timeframe: a los 30 días de uso

2. PREDICCIÓN DE LESIÓN
   Para cada lesión reportada, revisar los 7 días previos:
   - ¿El ACWR estaba en zona de peligro (>1.3)?
   - ¿El readiness estaba < 40?
   - ¿El ACWR articular de esa zona específica estaba elevado?

   Sensibilidad objetivo: >65% de lesiones precedidas por alarma
   Especificidad: <25% de alarmas falsas

3. AUTO-CALIBRACIÓN
   Comparar r(CE↔sRPE) antes y después de la activación:
   - Pre-calibración (sesiones 1-21): r baseline
   - Post-calibración (sesiones 22-60): r debería mejorar > 0.05

4. DIFERENCIA POR FORMATO DE WOD
   El modelo debería predecir igual de bien para:
   - RFT, AMRAP, EMOM, Hero WOD
   Si un formato tiene r < 0.50, los multiplicadores de ese formato necesitan ajuste
```

### Timeline de validación

```
Mes 1-2: Recolección de datos (freeze phase, coeficientes fijos)
Mes 3: Primera calibración individual activada
Mes 4-6: Modelo personalizado activo, recolección de lesiones
Mes 6: Análisis de correlación CE↔sRPE + análisis de lesiones
Mes 7: Ajuste de coeficientes base v1.5 con datos reales
```

---

## RESUMEN DE CORRECCIONES

| ID | Corrección | Estado |
|----|-----------|--------|
| P0-A | Escala monostructurales normalizada por unidad | ✅ Corregido |
| P0-B | Fórmula alométrica completa para gimnásticos | ✅ Corregido |
| P1-A | Multiplicador por posición en WOD | ✅ Corregido |
| P1-B | Matriz sinergia/antagonismo 6 grupos × 6 grupos | ✅ Corregido |
| P1-C | Normalización z-score para CE↔sRPE | ✅ Corregido |
| P1-D | Protocolo de validación contra lesiones | ✅ Corregido |

## Estado final del modelo

Con la investigación original + estas correcciones, el sistema tiene:

```
✅ 122 movimientos con coeficiente + 4 vectores de estrés + variantes
✅ 17 formatos de WOD con multiplicadores + sub-multiplicadores por duración
✅ 10 variables individuales con modificadores cuantitativos
✅ Fórmula alométrica para gimnásticos por peso corporal
✅ Escala normalizada para monostructurales
✅ Multiplicador de fatiga por posición en WOD
✅ Matriz de sinergia/antagonismo entre grupos musculares
✅ Modelo Banister multi-curva (4 tau independientes)
✅ ACWR con EWMA por tipo de estrés
✅ Fórmula híbrida CTS = 0.70×CE + 0.30×sRPE (normalizada z-score)
✅ Auto-calibración con gradient descent (lr=0.03, clip ±25%, freeze 21 sesiones)
✅ Protocolo de validación con 50 atletas × 6 meses

El modelo está listo para implementación.
Los coeficientes [E] se refinarán con datos reales de atletas.
```
