# ARCHIVO MAESTRO VOLTA — Sistema Completo de Cuantificación de Carga para CrossFit

> Este documento unifica toda la investigación, correcciones y activos de VOLTA en un solo archivo.
> Objetivo: servir como base para investigar formas de gamificación sobre los datos del sistema.
> Fecha de consolidación: 2026-03-27

---

# PARTE 1 — QUÉ ES VOLTA

VOLTA es una plataforma de análisis de rendimiento y prevención de lesiones para atletas de CrossFit. Su motor central cuantifica la carga total de cada sesión de entrenamiento para alimentar dos algoritmos:

1. **ACWR** (Acute:Chronic Workload Ratio) — detecta picos de carga peligrosos (riesgo de lesión)
2. **Banister** (Fitness-Fatigue Model) — estima el readiness (disponibilidad fisiológica para rendir hoy)

El sistema produce datos en tiempo real sobre cada atleta que pueden ser gamificados.

## Usuarios de VOLTA
- **Atleta individual**: registra WODs, ve su readiness, recibe recomendaciones
- **Coach de box**: gestiona 10-30 atletas, ve alertas, crea programación
- **Box/Gimnasio**: múltiples coaches, múltiples atletas

## Modelo de negocio
- Atleta: $5/mes
- Coach: $1-3/mes por atleta gestionado
- Margen: 97%+ a escala

---

# PARTE 2 — EL MOTOR DE CARGA (lo que genera los datos gamificables)

## 2.1 Los 4 Vectores de Estrés

Cada movimiento de CrossFit genera estrés en 4 sistemas biológicos simultáneamente:

- **MEC (Mecánico/Musculoesquelético)**: daño en fibras musculares, DOMS, CK. Lo que duele al día siguiente.
- **SNC (Sistema Nervioso Central)**: coordinación, velocidad, potencia explosiva. Lo que te deja "frito".
- **MET (Metabólico)**: lactato, deuda de oxígeno, HR elevada. Lo que te deja sin aire.
- **ART (Articular)**: tendones, ligamentos, cápsulas articulares. Lo que genera molestias en articulaciones.

Cada vector se mide de 1 a 10 por movimiento. Esto genera un "diamante" visual de 4 ejes por sesión.

## 2.2 Tabla Maestra de 122 Movimientos (coeficientes completos)

Referencia: Back Squat al 70% 1RM × 10 reps = Coeficiente 1.00

### BARBELL — Levantamiento Olímpico

| ID | Movimiento | Coef | MEC | SNC | MET | ART | Cadena | Variantes |
|----|-----------|------|-----|-----|-----|-----|--------|-----------|
| 01 | Snatch (full) | 1.60 | 6 | 10 | 5 | 8 | Pull, Full Body | Power (0.85); Hang (0.80); Deficit (1.15) |
| 02 | Power Snatch | 1.36 | 5 | 9 | 5 | 6 | Pull, Full Body | Sin recepción profunda |
| 03 | Hang Snatch | 1.28 | 5 | 8 | 4 | 7 | Pull, Full Body | Elimina tracción inicial |
| 04 | Snatch Balance | 1.10 | 6 | 8 | 3 | 9 | Push, Full Body | Alto cizallamiento hombro/rodilla |
| 05 | Overhead Squat | 1.30 | 8 | 8 | 5 | 9 | Push, Full Body | Tempo (1.20) |
| 06 | Clean (full) | 1.45 | 8 | 8 | 6 | 7 | Pull, Full Body | Power (0.85); Hang (0.80) |
| 07 | Power Clean | 1.23 | 7 | 7 | 6 | 5 | Pull, Full Body | Menor compresión meniscal |
| 08 | Hang Clean | 1.16 | 6 | 7 | 5 | 5 | Pull, Full Body | Ciclo estiramiento-acortamiento corto |
| 09 | Clean & Jerk (full) | 1.85 | 9 | 9 | 8 | 8 | Mixto, Full Body | Componente dual masivo |
| 10 | Push Jerk | 1.30 | 6 | 7 | 4 | 7 | Push, Full Body | Menor tiempo bajo tensión |
| 11 | Split Jerk | 1.40 | 7 | 8 | 4 | 8 | Push, Full Body | Asimetría pélvica |
| 12 | Squat Clean Thruster (Cluster) | 1.95 | 9 | 8 | 10 | 7 | Mixto, Full Body | Demanda anaeróbica insostenible |

### BARBELL — Fuerza e Híbridos Metcon

| ID | Movimiento | Coef | MEC | SNC | MET | ART | Cadena | Variantes |
|----|-----------|------|-----|-----|-----|-----|--------|-----------|
| 13 | Back Squat | 1.00 | 10 | 6 | 4 | 5 | Push, Posterior, Quad | Tempo (1.20). REFERENCIA BASE |
| 14 | Front Squat | 1.10 | 9 | 6 | 5 | 6 | Push, Anterior, Quad | Limitante respiratorio torácico |
| 15 | Deadlift | 1.20 | 10 | 7 | 5 | 4 | Pull, Posterior, Hip | Deficit (1.10); Tempo (1.20) |
| 16 | Sumo Deadlift | 1.15 | 9 | 6 | 4 | 5 | Pull, Mixto | Menor torque lumbar |
| 17 | Romanian DL | 1.05 | 10 | 5 | 4 | 4 | Pull, Posterior, Hip | Tensión excéntrica isquiotibial máxima |
| 18 | Strict Press | 0.80 | 7 | 5 | 3 | 6 | Push, Anterior, Upper | Tempo (1.15) |
| 19 | Push Press | 0.95 | 6 | 6 | 5 | 5 | Push, Anterior, Full | Transferencia cinética |
| 20 | Bench Press | 0.85 | 8 | 5 | 2 | 5 | Push, Anterior, Upper | Sin carga axial |
| 21 | Pendlay Row | 0.80 | 7 | 5 | 4 | 4 | Pull, Posterior, Upper | Pausa elimina inercia |
| 22 | Hip Thrust | 0.70 | 8 | 3 | 3 | 3 | Push, Posterior, Hip | Sin carga espinal |
| 23 | Thruster | 1.40 | 8 | 6 | 10 | 6 | Push, Anterior, Quad | Complejidad respiratoria |
| 24 | SDHP | 1.10 | 6 | 6 | 8 | 7 | Pull, Posterior, Hip | Riesgo pinzamiento subacromial |
| 25 | Hang Power Clean (Metcon) | 0.90 | 5 | 6 | 7 | 5 | Pull, Posterior, Hip | Alta cadencia |
| 26 | Ground to Overhead | 1.20 | 6 | 6 | 9 | 6 | Mixto, Full Body | Variable por eficiencia |
| 27 | Shoulder to Overhead | 1.00 | 5 | 6 | 7 | 6 | Push, Full Body | Dependencia del rebote |
| 28 | Bar Facing Burpee + Bar | 1.35 | 6 | 6 | 10 | 5 | Mixto, Full Body | Transición suelo-bipedestación |

### GIMNÁSTICOS — Tirón y Empuje

| ID | Movimiento | Coef | MEC | SNC | MET | ART | Cadena | Variantes |
|----|-----------|------|-----|-----|-----|-----|--------|-----------|
| 29 | Pull-up estricto | 0.90 | 8 | 5 | 4 | 5 | Pull, Upper | Weighted (1.30); Tempo (1.20) |
| 30 | Pull-up kipping | 0.75 | 5 | 6 | 6 | 7 | Pull, Upper | Fatiga metabólica antebraquial |
| 31 | Pull-up butterfly | 0.85 | 5 | 8 | 8 | 9 | Pull, Upper | Pico cizallamiento |
| 32 | Chest-to-bar kipping | 0.85 | 6 | 7 | 7 | 8 | Pull, Upper | Máxima tracción del romboides |
| 33 | Bar Muscle-Up (kipping) | 1.20 | 7 | 9 | 6 | 8 | Mixto, Upper | Rotación forzada sobre barra |
| 34 | Bar Muscle-Up (strict) | 1.60 | 10 | 9 | 4 | 9 | Mixto, Upper | Fuerza concéntrica al fallo |
| 35 | Ring Muscle-Up (kipping) | 1.50 | 7 | 10 | 6 | 9 | Mixto, Upper | Tracción y estabilización inestable |
| 36 | Ring Muscle-Up (strict) | 1.80 | 9 | 10 | 5 | 10 | Mixto, Upper | Estrés máximo en transición |
| 37 | Rope Climb (con piernas) | 1.10 | 6 | 6 | 6 | 5 | Pull, Full Body | Dependencia del bloqueo técnico |
| 38 | Rope Climb (legless) | 1.60 | 10 | 8 | 6 | 7 | Pull, Upper | Saturación láctica antebrazo |
| 39 | Peg Board | 1.50 | 9 | 9 | 5 | 7 | Pull, Upper | Tensión isométrica unilateral |
| 40 | Push-Up | 0.40 | 5 | 3 | 3 | 4 | Push, Anterior, Upper | Resistencia muscular básica |
| 41 | Ring Push-Up | 0.60 | 7 | 6 | 4 | 6 | Push, Anterior, Upper | Activación máxima estabilizadores |
| 42 | HSPU strict | 1.10 | 8 | 7 | 5 | 8 | Push, Anterior, Upper | Deficit (1.40) |
| 43 | HSPU kipping | 0.85 | 5 | 8 | 6 | 9 | Push, Anterior, Upper | Impacto compresión cervical |
| 44 | HSPU deficit (strict) | 1.40 | 9 | 8 | 6 | 9 | Push, Anterior, Upper | Tensión deltoides bajo elongación |
| 45 | HSPU deficit (kipping) | 1.15 | 6 | 9 | 7 | 10 | Push, Anterior, Upper | Carga terminal sobre trapecio |
| 46 | Ring Dip (strict) | 0.80 | 8 | 7 | 4 | 9 | Push, Anterior, Upper | Tracción externa cápsula anterior |
| 47 | Ring Dip (kipping) | 0.65 | 5 | 7 | 5 | 8 | Push, Anterior, Upper | Deformación temporal hombro |
| 48 | Paralette Dip | 0.60 | 7 | 4 | 4 | 6 | Push, Anterior, Upper | Estabilidad fija reduce SNC |
| 49 | Handstand Walk (por metro) | 0.15 | 4 | 9 | 5 | 7 | Push, Anterior, Upper | Retorno venoso cefálico |
| 50 | Press to Handstand | 1.30 | 8 | 10 | 3 | 7 | Push, Anterior, Upper | Flexibilidad isométrica extrema |

### GIMNÁSTICOS — Core, Pierna y Acrobático

| ID | Movimiento | Coef | MEC | SNC | MET | ART | Cadena | Variantes |
|----|-----------|------|-----|-----|-----|-----|--------|-----------|
| 51 | Toes-to-Bar (kipping) | 0.70 | 5 | 6 | 7 | 6 | Pull, Anterior | Dinámica pendular |
| 52 | Toes-to-Bar (strict) | 1.00 | 9 | 6 | 4 | 5 | Pull, Anterior | Aislamiento isométrico psoas |
| 53 | Knees-to-Elbow | 0.65 | 5 | 5 | 7 | 5 | Pull, Anterior | ROM amigable |
| 54 | GHD Sit-Up | 0.90 | 9 | 4 | 5 | 8 | Pull, Anterior | Impacto lumbar severo |
| 55 | GHD Hip Extension | 0.75 | 8 | 3 | 4 | 5 | Pull, Posterior, Hip | Isquiotibial domina |
| 56 | L-Sit Hold (por seg) | 0.05 | 8 | 6 | 3 | 4 | N/A, Anterior | Compresión isométrica |
| 57 | Hollow Hold (por seg) | 0.03 | 6 | 4 | 3 | 2 | N/A, Anterior | Alineación torácica-pélvica |
| 58 | V-Up | 0.40 | 6 | 6 | 5 | 3 | N/A, Anterior | Bisagra abdominal explosiva |
| 59 | Sit-Up (AbMat) | 0.20 | 4 | 2 | 4 | 3 | N/A, Anterior | Suaviza aplanamiento lumbar |
| 60 | Pistol Squat | 0.85 | 8 | 8 | 5 | 9 | Push, Anterior, Quad | Riesgo asimétrico altísimo |
| 61 | Box Jump (rebote) | 0.85 | 7 | 7 | 8 | 9 | Push, Full Body | Carga elástica calcáneo |
| 62 | Box Jump (step-down) | 0.60 | 6 | 5 | 7 | 4 | Push, Full Body | Elimina excéntrico |
| 63 | Box Jump Over | 0.80 | 6 | 6 | 9 | 6 | Push, Full Body | Ritmo anaeróbico |
| 64 | Burpee | 0.50 | 4 | 4 | 9 | 4 | Mixto, Full Body | ~10 METs |
| 65 | Burpee Box Jump Over | 1.10 | 6 | 7 | 10 | 7 | Mixto, Full Body | Destrucción vía anaeróbica |
| 66 | Burpee a target | 0.60 | 4 | 5 | 10 | 5 | Mixto, Full Body | Inhibe respiración |
| 67 | Lunge (bodyweight) | 0.40 | 7 | 3 | 5 | 6 | Push, Posterior, Quad | Tensión excéntrica asimétrica |
| 68 | Jump Lunge | 0.65 | 8 | 6 | 8 | 8 | Push, Posterior, Quad | Pliometría unilateral |

### IMPLEMENTOS — Kettlebell, Dumbbell, Medicine Ball, Otros

| ID | Movimiento | Coef | MEC | SNC | MET | ART | Cadena | Variantes |
|----|-----------|------|-----|-----|-----|-----|--------|-----------|
| 69 | KB Swing American | 0.85 | 5 | 5 | 8 | 6 | Pull, Posterior, Hip | Hiperextensión lumbar |
| 70 | KB Swing Russian | 0.60 | 5 | 4 | 7 | 4 | Pull, Posterior, Hip | Bisagra pura |
| 71 | KB Snatch (1 arm) | 0.90 | 6 | 8 | 7 | 7 | Pull, Posterior, Hip | Torsión rotacional |
| 72 | KB Clean & Jerk | 0.95 | 6 | 7 | 8 | 7 | Mixto, Posterior | Asimetría rack lumbar |
| 73 | Turkish Get-Up | 1.40 | 8 | 10 | 4 | 8 | Mixto, Full Body | Alta densidad transiciones |
| 74 | Goblet Squat | 0.65 | 7 | 4 | 5 | 5 | Push, Anterior, Quad | Facilita verticalidad |
| 75 | KB Farmer Carry (1m) | 0.05 | 7 | 3 | 5 | 4 | N/A, Full Body | Fatiga de agarre |
| 76 | KB Overhead Carry (1m) | 0.08 | 5 | 7 | 5 | 8 | N/A, Full Body | Tensión glenohumeral |
| 77 | DB Snatch (alt) | 0.70 | 5 | 5 | 8 | 5 | Pull, Posterior, Hip | Altera cadencia respiratoria |
| 78 | DB Clean & Jerk | 1.10 | 7 | 7 | 9 | 6 | Mixto, Full Body | Alineación escapular independiente |
| 79 | DB Thruster | 1.25 | 8 | 7 | 10 | 7 | Push, Anterior, Quad | Centro de masa inestable |
| 80 | DB Overhead Lunge | 1.05 | 8 | 8 | 7 | 8 | Push, Posterior, Quad | Balance coronal extremo |
| 81 | Devil Press | 1.60 | 8 | 8 | 10 | 7 | Mixto, Full Body | Burpee + tracción excéntrica |
| 82 | Man Maker | 1.80 | 9 | 8 | 8 | 7 | Mixto, Full Body | Push-up + row + clean + lunge |
| 83 | DB Box Step-Up | 0.90 | 8 | 6 | 7 | 7 | Push, Full Body, Quad | Carga asimétrica glúteo medio |
| 84 | Wall Ball Shot | 0.95 | 7 | 5 | 9 | 5 | Push, Anterior, Quad | ~10 METs |
| 85 | Ball Slam | 0.50 | 4 | 4 | 7 | 4 | Pull, Anterior, Hip | Potencia abdominal |
| 86 | Ball Over Shoulder | 0.80 | 7 | 6 | 8 | 6 | Pull, Posterior, Hip | Flexión espinal cargada |
| 87 | Ball Clean (D-Ball) | 1.20 | 8 | 7 | 8 | 7 | Pull, Posterior, Hip | Flexión forzada espalda baja |
| 88 | Med Ball Carry (1m) | 0.04 | 5 | 3 | 5 | 3 | N/A, Anterior | Constricción torácica |
| 89 | Sandbag Clean | 1.40 | 9 | 8 | 8 | 7 | Pull, Posterior, Hip | Impide reclutamiento eficiente |
| 90 | Sandbag Carry (1m) | 0.06 | 7 | 5 | 6 | 5 | N/A, Anterior | Desvío centro de masa |
| 91 | Sandbag Over Shoulder | 1.30 | 8 | 7 | 9 | 7 | Pull, Posterior, Hip | Aceleración balística |
| 92 | Sled Push (1m) | 0.08 | 8 | 4 | 9 | 4 | Push, Anterior, Quad | Sin excéntrico |
| 93 | Sled Pull (1m) | 0.07 | 8 | 4 | 8 | 4 | Pull, Posterior, Hip | Menos limitación ventilatoria |
| 94 | Yoke Carry (1m) | 0.10 | 10 | 8 | 6 | 9 | N/A, Full Body | Compresión espinal colosal |
| 95 | Stone to Shoulder | 1.60 | 9 | 8 | 8 | 8 | Pull, Posterior, Hip | Redondeo dorsal bajo fuerza pico |
| 96 | Worm (equipo) | 1.30 | 8 | 9 | 8 | 7 | Mixto, Full Body | Sincronización grupal |
| 97 | Pig Flip (equipo) | 1.50 | 9 | 8 | 7 | 8 | Push, Full Body, Hip | Isométrica máxima |
| 98 | Battle Rope (30s) | 0.80 | 5 | 6 | 9 | 4 | Mixto, Anterior, Upper | Saturación capilar |

### MONOSTRUCTURALES (escala corregida — por unidad normalizada)

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
| 115 | Swim | 0.50 | 25m | 3 | 6 | 7 | 2 |
| 116 | Shuttle Run | 0.30 | 25m | 7 | 7 | 8 | 7 |
| 117 | Sled Sprint | 0.50 | 25m | 8 | 6 | 9 | 5 |

### ACCESORIOS

| ID | Movimiento | Coef | MEC | SNC | MET | ART |
|----|-----------|------|-----|-----|-----|-----|
| 118 | Banded Pull-Apart | 0.05 | 3 | 2 | 2 | 2 |
| 119 | Face Pull | 0.08 | 3 | 3 | 2 | 2 |
| 120 | Single-Leg RDL (DB) | 0.25 | 6 | 6 | 3 | 4 |
| 121 | Bulgarian Split Squat | 0.40 | 8 | 5 | 4 | 6 |
| 122 | Strict Toes-to-Ring | 0.85 | 8 | 7 | 4 | 5 |

---

# PARTE 3 — MULTIPLICADORES DE FORMATO DE WOD

Cada formato de WOD modifica la carga total calculada.

| ID | Formato | Mult | Dominios Estrés | Sub-Mult por Duración | Recuperación |
|----|---------|------|-----------------|----------------------|-------------|
| 01 | RFT - Couplet | 1.15 | MEC:Alto, MET:Muy Alto | <5m:1.30, 5-12:1.15, 12-20:1.00, 20-35:0.85, 35-60:0.70, 60+:0.60 | 48h/36h |
| 02 | RFT - Triplet | 1.10 | MEC:Medio, MET:Alto | <5m:1.25, 5-12:1.10, 12-20:1.00, 20-35:0.85, 35-60:0.70, 60+:0.60 | 48h/24h |
| 03 | RFT - Chipper | 1.05 | MEC:Medio, MET:Alto | N/A, 5-12:1.15, 12-20:1.00, 20-35:0.90, 35-60:0.80, 60+:0.70 | 72h/48h |
| 04 | AMRAP Corto (<10m) | 1.25 | MEC:Medio, MET:Muy Alto | <5m:1.30, 5-10:1.25 | 48h/36h |
| 05 | AMRAP Medio (10-20m) | 1.20 | MEC:Alto, MET:Alto | 10-12:1.20, 12-20:1.15 | 72h/48h |
| 06 | AMRAP Largo (20+m) | 1.10 | MEC:Muy Alto, MET:Medio | 20-35:1.10, 35-60:1.00, 60+:0.85 | 96h/72h |
| 07 | EMOM Corto (<12m) | 0.85 | MEC:Alto, MET:Bajo | <5m:0.95, 5-12:0.85 | 24h/12h |
| 08 | EMOM Largo (20-40m) | 0.95 | MEC:Alto, MET:Medio | 20-35:0.95, 35-60:1.00 | 48h/24h |
| 09 | Tabata/Interval | 1.15 | MEC:Bajo, MET:Muy Alto | <5m:1.15, 5-12:1.10 | 24h/12h |
| 10 | Ladder Ascendente | 1.10 | MEC:Alto, SNC:Alto | 5-12:1.15, 12-20:1.10, 20-35:1.00 | 48h/36h |
| 11 | Ladder Descendente (21-15-9) | 1.20 | SNC:Alto, MET:Muy Alto | <5m:1.30, 5-12:1.20, 12-20:1.00 | 48h/36h |
| 12 | Hero WOD (Murph, DT) | 1.50 | TODO:Muy Alto | 35-60:1.50, 60+:1.60 | 96h/72h |
| 13 | Benchmark Girls (Fran, Grace) | 1.25 | MEC:Alto, MET:Muy Alto | <5m:1.30, 5-12:1.25, 12-20:1.10 | 48h/24h |
| 14 | Strength Only (5x5, 1RM) | 1.10 | MEC:Muy Alto, SNC:Muy Alto | 35-60:1.10, 60+:1.00 | 48h/36h |
| 15 | Skill/Technique | 0.50 | SNC:Alto | 12-20:0.50, 20-35:0.50, 35-60:0.40 | 12h/6h |
| 16 | Competition Day (Multi) | 1.80 | TODO:Muy Alto | 60+:1.80 | 120h/96h |
| 17 | Active Recovery | 0.30 | TODO:Bajo | 12-60:0.30, 60+:0.20 | 0h |

---

# PARTE 4 — MODIFICADORES INDIVIDUALES

## 4.1 Variables del atleta

| Variable | Niveles | Modificador | Justificación |
|----------|---------|-------------|---------------|
| Experiencia | Principiante (<1a) | 1.20 | Déficit coordinación neuromuscular |
| | Intermedio (1-3a) | 1.00 | Baseline |
| | Avanzado (3-5a) | 0.85 | Vías motoras optimizadas |
| | Élite (5+a) | 0.75 | Mínimo costo transmisión neural |
| Peso Corporal | Alométrico | (BW/75)^0.67 | Ley cuadrático-cúbica |
| Sexo | Ambos | 1.00 | Respuestas equivalentes relativas |
| Edad | 18-29 | 1.00 | Recuperación pico |
| | 30-39 | 1.05 | Menor elasticidad tejidos |
| | 40-49 | 1.15 | Menor T/IGF-1, +24h recuperación |
| | 50+ | 1.25 | Declive fibras rápidas |
| Ciclo Menstrual | Todas las fases | 1.00 | No varía fuerza real, sí percepción |
| Sueño | >8h | 1.00 | Limpieza glinfática completa |
| | 6-7h | 1.15 | Retardo neuro-perceptual |
| | <6h | 1.30 | 2x riesgo de lesión |
| Estrés Crónico | Normal | 1.00 | Cortisol circadiano funcional |
| | Elevado | 1.20 | Cortisol bloquea resíntesis glucógeno |

## 4.2 Fórmula Alométrica para Gimnásticos

```
Carga_gimnástico = Coef_base × Reps × (BW_atleta / BW_referencia) ^ 0.67
BW_referencia = 75kg (hombre) / 60kg (mujer)
```

Un atleta de 95kg tiene +24% más carga en muscle-ups que uno de 70kg.

## 4.3 Interacciones entre Movimientos

6 grupos musculares:
- A: Push Upper | B: Pull Upper | C: Push Lower/Quad | D: Pull Lower/Hip | E: Core | F: Cardio

| Interacción | Multiplicador |
|-------------|--------------|
| Mismo grupo (A+A, B+B, etc.) | ×1.20 (sinérgico) |
| Comparten secundario (A+C, B+D, C+F) | ×1.10 (parcial) |
| Sin overlap (A+D, B+C, E+F) | ×1.00 (neutro) |
| Grupos opuestos (A+B, C+D) | ×0.90 (antagonista) |

## 4.4 Multiplicador por Posición en WOD

```
Mult_posición(ronda) = 1.0 + (ronda - 1) × 0.04 × Factor_formato
RFT: Factor 1.00 | AMRAP: Factor 0.90 | EMOM: Factor 0.50
Cap: 1.20 máximo
```

---

# PARTE 5 — ALGORITMOS PRINCIPALES

## 5.1 Fórmula de Carga Total de Sesión (CTS)

```
CTS = 0.70 × CE + 0.30 × sRPE_normalizado

Donde:
  CE = Σ(Coef_mov × Peso × Reps × Mult_variante × Mult_posición × Factor_alométrico)
       × Mult_interacción × Mult_formato × Mult_individual

  sRPE = RPE (escala CR-10, medido 30 min post-WOD) × Duración (minutos)

Normalización: z-score rolling 28 días para hacer CE y sRPE comparables
```

## 5.2 Modelo Banister Multi-Curva (4 fatigas independientes)

```
Fitness(t) = Fitness(t-1) × e^(-1/45) + CTS(t) × k1

Fatiga_MEC(t) = Fat_MEC(t-1) × e^(-1/18) + CTS_MEC(t) × k2_MEC
Fatiga_SNC(t) = Fat_SNC(t-1) × e^(-1/8)  + CTS_SNC(t) × k2_SNC
Fatiga_MET(t) = Fat_MET(t-1) × e^(-1/4)  + CTS_MET(t) × k2_MET
Fatiga_ART(t) = Fat_ART(t-1) × e^(-1/30) + CTS_ART(t) × k2_ART

Readiness(t) = Fitness(t) - (w1×Fat_MEC + w2×Fat_SNC + w3×Fat_MET + w4×Fat_ART)
```

Constantes de decay:
- Fitness: tau=45 días (adaptación lenta)
- Fatiga Muscular: tau=18 días
- Fatiga Neural: tau=8 días (se limpia rápido)
- Fatiga Metabólica: tau=4 días (la más rápida)
- Fatiga Articular: tau=30 días (la más lenta — se acumula silenciosamente)

## 5.3 ACWR con EWMA (por tipo de estrés)

```
EWMA_agudo(t)  = CTS(t) × 0.25 + EWMA_agudo(t-1) × 0.75
EWMA_crónico(t) = CTS(t) × 0.069 + EWMA_crónico(t-1) × 0.931

ACWR = EWMA_agudo / EWMA_crónico

Umbrales:
  Sweet spot: 0.8 — 1.3  (zona segura)
  Warning:    1.3 — 1.5  (precaución)
  Crítico:    > 1.5      (riesgo duplicado de lesión)
  Bajo:       < 0.8      (desentrenamiento)
```

Se calcula ACWR separado para cada vector (ACWR_MEC, ACWR_SNC, ACWR_MET, ACWR_ART).

## 5.4 Tiempos de Recuperación por Sistema

| Sistema | Recuperación | Mecanismo |
|---------|-------------|-----------|
| MEC (Muscular) | 48-72h | CK pico 24h, clearance citoquinas |
| SNC (Neural) | 24-48h | Resíntesis neurotransmisores placa motora |
| MET (Metabólico) | 12-36h | Resíntesis glucógeno, homeostasis mitocondrial |
| ART (Articular) | 24h a 21+ días | Cartílago <30min, tendones semanas |

## 5.5 Auto-calibración (Gradient Descent)

```
1. Freeze Phase: primeros 21 sesiones con coeficientes base fijos
2. Detección: EWMA de Delta(CE - sRPE) > banda ±15% por >10 sesiones
3. Ajuste: learning rate 0.03-0.05 por iteración
4. Clipping: ningún coeficiente muta más allá de ±25% del base
5. Validación: r(CE↔sRPE) debe mejorar >0.05 post-calibración
```

---

# PARTE 6 — OUTPUTS VISUALES DEL SISTEMA (datos gamificables)

## 6.1 Readiness Score (0-100)
El atleta ve cada día un número de 0 a 100 que indica su disponibilidad.

## 6.2 Color de la App
| Readiness | Color | Mensaje |
|-----------|-------|---------|
| 75-100 | Verde | "Día de atacar" |
| 55-74 | Azul | "Buen día, entrena sólido" |
| 40-54 | Amarillo | "Escala hoy" |
| 25-39 | Naranja | "WOD reducido" |
| < 25 | Rojo | "Descansa. Es ganancia." |

## 6.3 Diamante de Estrés (4 ejes)
Cada sesión genera un radar de 4 puntas (MEC, SNC, MET, ART) que muestra el "tipo" de estrés.

## 6.4 Curvas Banister (Fitness vs Fatiga)
Gráfica temporal donde el espacio entre fitness y fatiga = readiness.

## 6.5 ACWR Timeline
Gráfica del ratio agudo/crónico con zonas de color (verde/amarillo/rojo).

## 6.6 Balance Muscular (4 ratios)
- Push/Pull Ratio (target 1:1)
- Anterior/Posterior Chain (target 1:1.2)
- Quad/Isquio (target 0.55-0.75)
- Bilateral (target <10% diferencia)

## 6.7 Datos por Sesión
- CTS (carga total calculada)
- sRPE reportado
- Duración
- Formato de WOD
- Movimientos ejecutados con pesos y reps
- PR logrados

## 6.8 Datos Históricos
- Streak de entrenamiento (días consecutivos)
- Frecuencia semanal/mensual
- PRs por movimiento
- Mejora en benchmarks
- Volumen total acumulado
- Distribución de tipos de estrés a lo largo del tiempo

## 6.9 Datos del Coach
- Readiness de todos los atletas
- Alertas proactivas (lesión, overtraining, abandono)
- Participation rates en desafíos
- Comparativa de carga entre atletas

---

# PARTE 7 — ACTIVOS COMPLEMENTARIOS DEL ECOSISTEMA

## Píldoras de Conocimiento (MUST — confirmado)
Micro-contenido educativo contextual entregado en el momento exacto.
5 tipos: contextual al estado, al movimiento, a las métricas, del coach, del ciclo menstrual.
Máximo 1 por sesión. Biblioteca personal guardable.

## Color Alert System
La UI entera cambia de color según readiness. Señal visual en 0.3 segundos.

## Session Adaptation Engine
Adapta automáticamente el WOD del día según readiness del atleta.
Readiness 85+ = WOD completo. <40 = recuperación activa.

## Warmup Generator
Genera calentamiento específico para el WOD del día + estado del atleta.

## Smart Coach Alerts
Alertas proactivas al coach: lesión, peak de forma, abandono, desequilibrio muscular.

## Pulse Engine
Desafíos colectivos de box: consistencia, volumen, benchmarks, rachas.

## Muscular Balance Engine
Detecta desequilibrios crónicos Push/Pull, Anterior/Posterior, Quad/Isquio.

---

# PARTE 8 — MODELO DE NEGOCIO

| Concepto | Detalle |
|----------|---------|
| Atleta | $5/mes |
| Coach | $1-3/mes por atleta gestionado |
| @ 300 atletas + 30 coaches | $2,400/mes revenue |
| Infra (Replit+Supabase+Redis) | $65/mes |
| Margen | 97.3% |
| Stack | Next.js + Supabase + Redis + Replit |

---

> FIN DEL ARCHIVO MAESTRO
> Este documento contiene la totalidad del sistema VOLTA:
> - 122 movimientos cuantificados
> - 17 formatos de WOD con multiplicadores
> - 10 variables individuales
> - Algoritmos Banister + ACWR + Auto-calibración
> - Todos los activos complementarios
> - Modelo de negocio
>
> Úsalo como base para investigar formas de gamificación.
