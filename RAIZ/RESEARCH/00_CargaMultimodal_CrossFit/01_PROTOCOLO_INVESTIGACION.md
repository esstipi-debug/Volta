---
name: Protocolo de Investigación — Coeficientes de Carga CrossFit
description: Instrucciones completas para diseñar un sistema de cuantificación de carga multimodal específico para CrossFit, inexistente en la literatura
type: RESEARCH_PROTOCOL
estado: DISEÑO DE INVESTIGACIÓN
objetivo: Crear el primer algoritmo validado de cuantificación de carga específico para CrossFit
---

# PROTOCOLO DE INVESTIGACIÓN
## Creación de un Sistema de Coeficientes de Carga Multimodal para CrossFit

### Pregunta Central de Investigación

> ¿Cómo se puede cuantificar con precisión la carga total de una sesión de CrossFit que combina múltiples modalidades (barbell, gimnásticos, monostructural) en un solo score comparable entre sesiones, entre atletas y entre formatos de WOD?

### ¿Por qué no existe esto todavía?

Mangine & Seay (2022) identificaron que el 90% de los WODs del CrossFit Open combinan ejercicios cuya carga se mide en unidades incompatibles (kg, calorías, metros, repeticiones bodyweight). Nadie ha resuelto cómo unificarlas. Este protocolo busca resolver ese problema.

---

# FASE 1 — TAXONOMÍA COMPLETA DEL CROSSFIT

## 1.1 Clasificación de TODOS los movimientos

Antes de asignar coeficientes, necesitamos clasificar exhaustivamente cada movimiento de CrossFit en múltiples dimensiones simultáneas.

### Dimensión A — Modalidad primaria
```
BARBELL (carga externa cuantificable en kg)
├── Levantamiento Olímpico: Snatch, Clean, Jerk, Clean & Jerk
├── Fuerza: Back Squat, Front Squat, Deadlift, Press, Bench Press
├── Híbridos Metcon: Thruster, Sumo Deadlift High Pull, Cluster
└── Accesorios: Romanian DL, Overhead Squat, Hang variations

GIMNÁSTICO (bodyweight — sin carga externa estandarizada)
├── Tirón vertical: Pull-up (strict/kipping/butterfly), C2B, Bar MU, Ring MU
├── Empuje vertical: HSPU (strict/kipping), Handstand Walk, Press to HS
├── Core suspendido: Toes-to-bar, Knees-to-elbow, L-sit
├── Empuje horizontal: Ring Dip, Push-up, Ring Push-up
├── Escalada: Rope Climb (legless/con piernas), Peg Board
├── Acrobático: Pistol Squat, Box Jump (step/rebote), Burpee
└── Estático: Plank, Hollow Hold, L-sit Hold

MONOSTRUCTURAL (cardio — medible en distancia, calorías o tiempo)
├── Carrera: Run (200m, 400m, 800m, 1600m, 5K)
├── Remo: Row (calorías o metros)
├── Bicicleta: Assault Bike / Echo Bike (calorías)
├── Ski: SkiErg (calorías o metros)
├── Salto: Double-Under, Single-Under
└── Natación: Swim (si aplica en competencia)

IMPLEMENTOS (carga externa no-barbell)
├── Kettlebell: Swing (american/russian), Turkish Get-Up, KB Snatch, Goblet Squat
├── Dumbbell: DB Snatch, DB Clean, DB Thruster, Devil Press, Man Maker
├── Medicine Ball: Wall Ball, Ball Slam, Ball Over Shoulder
├── Sandbag: Carry, Clean, Over Shoulder
├── Sled: Push, Pull, Drag
├── Yoke / Odd Object: Stone, Worm, Pig (competencia)
└── Cuerda: Battle Rope
```

### Dimensión B — Sistema fisiológico primario demandado
Para cada movimiento, clasificar cuál sistema corporal recibe la mayor carga:

```
SISTEMA MUSCULOESQUELÉTICO (daño mecánico)
  → Medible por: CK a 24h, DOMS, pérdida de fuerza isométrica
  → Ejemplo dominante: Back Squat pesado, Deadlift pesado

SISTEMA NERVIOSO CENTRAL (fatiga neural)
  → Medible por: pérdida de velocidad propulsiva (MPV), tiempo de reacción
  → Ejemplo dominante: Snatch 1RM, Clean & Jerk 1RM, Ring Muscle-Up

SISTEMA METABÓLICO (fatiga metabólica)
  → Medible por: lactato post, HR recovery, VO2
  → Ejemplo dominante: AMRAP largo, Assault Bike sprints, Row 2K

SISTEMA ARTICULAR (estrés en articulaciones/tendones)
  → Medible por: dolor articular reportado, ROM post-sesión
  → Ejemplo dominante: Kipping pull-ups, Snatches overhead, HSPU
```

**Instrucción de investigación**: Cada movimiento debe tener un perfil de 4 valores (0-10) indicando cuánto carga cada sistema. Ejemplo:

```
Deadlift 1RM:
  Musculoesquelético: 9
  SNC: 8
  Metabólico: 3
  Articular: 7

Assault Bike 30cal:
  Musculoesquelético: 3
  SNC: 2
  Metabólico: 9
  Articular: 2

Ring Muscle-Up:
  Musculoesquelético: 6
  SNC: 8
  Metabólico: 4
  Articular: 8
```

### Dimensión C — Cadena muscular involucrada
Para alimentar el Motor de Balance Muscular (Activo #12):

```
Clasificar cada movimiento como:
├── Push / Pull
├── Anterior Chain / Posterior Chain
├── Quad-dominante / Hip-dominante
├── Bilateral / Unilateral
├── Upper Body / Lower Body / Full Body
└── Flexión / Extensión dominante de columna
```

### Dimensión D — Variantes del mismo movimiento
Un pull-up no es un pull-up. Cada variante tiene impacto diferente:

```
PULL-UP
├── Strict:     SNC 5, Articular 3, Muscular 7, Metabólico 3
├── Kipping:    SNC 3, Articular 7, Muscular 4, Metabólico 5
├── Butterfly:  SNC 4, Articular 8, Muscular 3, Metabólico 6
└── Weighted:   SNC 7, Articular 5, Muscular 9, Metabólico 2

HSPU
├── Strict:     SNC 7, Articular 5, Muscular 8, Metabólico 3
├── Kipping:    SNC 4, Articular 8, Muscular 4, Metabólico 5
└── Deficit:    SNC 8, Articular 7, Muscular 9, Metabólico 3

MUSCLE-UP
├── Bar (strict):    SNC 8, Articular 6, Muscular 8, Metabólico 3
├── Bar (kipping):   SNC 5, Articular 8, Muscular 5, Metabólico 5
├── Ring (strict):   SNC 9, Articular 7, Muscular 9, Metabólico 3
└── Ring (kipping):  SNC 6, Articular 9, Muscular 5, Metabólico 6
```

---

# FASE 2 — VARIABLES DE CONTEXTO QUE MODIFICAN EL COEFICIENTE BASE

El mismo movimiento tiene impacto diferente según el contexto en que se ejecuta.

## 2.1 Posición dentro del WOD (fatiga acumulada)

**Concepto clave**: Un clean en la ronda 1 no genera el mismo estrés que un clean en la ronda 5 después de 50 wall balls.

```
INVESTIGAR:
- ¿Cómo cambia la biomecánica de un movimiento bajo fatiga?
- ¿Cuánto aumenta el riesgo de lesión por repetición bajo fatiga?
- ¿Existe un "multiplicador de fatiga acumulada" por ronda?

Hipótesis a investigar:
  Ronda 1: multiplicador 1.0x
  Ronda 2: multiplicador 1.05x
  Ronda 3: multiplicador 1.12x
  Ronda 4: multiplicador 1.20x
  Ronda 5+: multiplicador 1.30x

Buscar papers sobre:
  "biomechanical changes under fatigue CrossFit"
  "movement quality degradation repetitions"
  "injury risk fatigue accumulation resistance training"
  "technique breakdown fatigue Olympic lifting"
```

## 2.2 Carga relativa vs absoluta

**El mismo peso es diferente para cada atleta.**

```
INVESTIGAR:
- ¿El coeficiente debe basarse en % del 1RM o en kg absolutos?
- ¿Cómo escala el estrés con el % del RM?

Rangos conocidos de la fisiología del ejercicio:
  <50% 1RM:  estrés mecánico bajo, metabólico variable por volumen
  50-70% 1RM: zona de hipertrofia, estrés moderado
  70-85% 1RM: zona de fuerza, estrés mecánico-neural alto
  85-95% 1RM: zona de fuerza máxima, estrés SNC muy alto
  >95% 1RM:  intentos máximos, estrés SNC extremo + articular

¿Cómo integrar esto?
  Coeficiente_real = Coeficiente_base × f(%RM)
  Donde f(%RM) es una función no-lineal que escala el estrés

Buscar papers sobre:
  "relative intensity stress response"
  "percentage 1RM neural fatigue"
  "dose-response resistance training intensity"
```

## 2.3 Volumen (reps) — rendimientos decrecientes o crecientes?

```
INVESTIGAR:
- ¿5 reps de snatch a 80% es proporcionalmente menos estresante que 15 reps a 60%?
- ¿O el estrés articular acumulado en 15 reps supera al mecánico de 5 reps pesadas?
- ¿La relación reps-estrés es lineal, logarítmica o exponencial?

Hipótesis:
  Estrés mecánico: relación logarítmica (las primeras reps cargan más que las últimas)
  Estrés metabólico: relación exponencial (cada rep bajo fatiga cuesta más)
  Estrés articular: relación lineal-acumulativa (cada rep suma desgaste igual)
  Estrés SNC: relación de umbral (se agota a cierto volumen y no se recupera intra-sesión)

Buscar papers sobre:
  "volume-response relationship muscle damage"
  "repetition-fatigue curve"
  "neural fatigue volume threshold"
  "junk volume diminishing returns"
```

## 2.4 Tempo y velocidad de ejecución

```
INVESTIGAR:
- Un WOD "For Time" incentiva velocidad máxima → ¿más riesgo articular?
- Un EMOM permite reset entre minutos → ¿técnica más limpia?
- ¿Cómo afecta el tempo (reps/min) al estrés total?

Dato existente (Mangine 2022):
  La "tasa de completación de repeticiones" (reps/min) es propuesta como
  métrica unificadora de intensidad en CrossFit.

Investigar:
  Coeficiente_tempo = f(reps_por_minuto)
  Si un atleta hace 15 thrusters en 1 min vs 15 thrusters en 3 min:
    ¿El estrés mecánico es igual pero el metabólico es mayor en el caso rápido?
    ¿O la técnica degradada a velocidad alta aumenta TAMBIÉN el mecánico?

Buscar:
  "repetition velocity fatigue relationship"
  "movement speed injury risk"
  "pacing strategy physiological cost"
```

## 2.5 Descanso intra-WOD

```
INVESTIGAR:
- EMOMs tienen descanso integrado → clearance parcial de lactato
- AMRAPs no tienen descanso formal → fatiga progresiva
- RFT incentiva ir sin parar → máxima acumulación
- ¿Cómo modelar el efecto del descanso en el coeficiente?

Datos existentes:
  La fosfocreatina se recupera ~50% en 30 segundos, ~85% en 2 minutos
  El lactato requiere ~15 minutos para clearance significativo
  La fatiga neural NO se recupera con descansos cortos

Modelar:
  Si descanso > 2 min entre sets: reset parcial de fatiga metabólica
  Si descanso > 5 min: reset casi completo de metabólico, parcial de neural
  Si descanso = 0 (RFT all-out): fatiga compuesta exponencialmente
```

---

# FASE 3 — FORMATO DE WOD COMO MULTIPLICADOR GLOBAL

## 3.1 Multiplicador por formato

Cada formato de WOD genera un perfil de estrés diferente.

```
INVESTIGAR y proponer multiplicadores basados en evidencia:

FOR TIME (RFT)
  Naturaleza: all-out, completar lo antes posible
  Datos: mayor lactato, mayor pérdida de MPV (Santos-Fernandez 2024)
  Hipótesis multiplicador: 1.15-1.30x (el formato más demandante)
  Investigar: ¿depende de la duración? <5min vs 5-15min vs 15-30min vs 30min+

AMRAP
  Naturaleza: máximo trabajo en tiempo fijo, autoregulación (pacing)
  Datos: fatiga intermedia, atleta se autoregula
  Hipótesis multiplicador: 1.00-1.15x (baseline)
  Investigar: ¿AMRAPs cortos (7min) vs largos (20min) tienen perfil diferente?

EMOM
  Naturaleza: trabajo/descanso por minuto, descanso integrado
  Datos: menor HR, menor lactato, menor fatiga neuromuscular
  Hipótesis multiplicador: 0.85-1.00x
  Investigar: ¿EMOMs largos (30min) se acercan al AMRAP en estrés?

TABATA
  Naturaleza: 20s ON / 10s OFF × 8 rounds
  Datos: validado para VO2max, estrés metabólico concentrado
  Hipótesis multiplicador: 1.10x (corto pero intenso)

CHIPPER
  Naturaleza: lista larga de movimientos, cada uno una vez
  Datos: no hay comparación directa publicada
  Hipótesis: depende de los movimientos incluidos, duración generalmente >15min
  Investigar como variante de RFT largo

HERO WOD
  Naturaleza: WODs emblemáticos, generalmente largos y brutales
  Datos: Murph = HR media 169bpm, ~43 min, lactato 10 mmol/L
  Hipótesis multiplicador: 1.25-1.40x
  Investigar: ¿el componente psicológico/emocional de los Hero WODs
             aumenta el RPE más allá del estrés fisiológico real?

LADDER / ASCENDING-DESCENDING
  Naturaleza: carga o reps que aumentan/disminuyen progresivamente
  Datos: no hay literatura específica
  Investigar: ¿la progresión ascendente genera más fatiga que la descendente?

COUPLET vs TRIPLET vs CHIPPER (número de movimientos)
  Investigar: ¿un WOD con 2 movimientos es más intenso que uno con 5 movimientos?
  Hipótesis: couplets permiten mayor intensidad por movimiento (menos transición),
             chippers distribuyen la carga pero extienden la duración
```

## 3.2 Duración del WOD como modificador

```
La duración cambia el sistema energético dominante:

<5 min:   Fosfocreatina + Glucolítico    → estrés neural > metabólico
5-15 min: Glucolítico + Oxidativo        → estrés metabólico máximo
15-30 min: Oxidativo + Glucolítico       → estrés metabólico + mecánico
30-60 min: Oxidativo dominante           → estrés mecánico acumulado + articular
>60 min:  Oxidativo puro                 → estrés articular + depleción glucógeno

INVESTIGAR:
  ¿Existe un multiplicador por rango de duración?
  ¿O la duración ya está capturada en el sRPE (RPE × minutos)?
  ¿Cuál es la interacción entre duración e intensidad?

Buscar:
  "exercise duration energy system contribution"
  "CrossFit workout duration physiological response"
  "time domain training zones"
```

---

# FASE 4 — EL FACTOR HUMANO (variables individuales)

## 4.1 Nivel del atleta

```
INVESTIGAR:
- ¿El mismo WOD genera más estrés en un principiante o en un élite?
- El élite mueve más peso (más carga absoluta) pero tiene mejor técnica (menos riesgo)
- El principiante mueve menos peso pero su técnica degradada aumenta estrés articular

Clasificación propuesta:
  Principiante (<1 año CrossFit): multiplicador articular +20%
  Intermedio (1-3 años): baseline
  Avanzado (3-5 años): baseline, +10% carga mecánica (más peso)
  Élite/Competidor (5+ años): +20% carga mecánica, -15% articular

Buscar:
  "training experience injury risk CrossFit"
  "novice vs experienced movement quality"
  "skill level mechanical efficiency"
```

## 4.2 Peso corporal del atleta

```
CRÍTICO para movimientos gimnásticos:
  Un atleta de 60kg haciendo muscle-ups vs uno de 95kg
  → El de 95kg mueve 58% más masa en cada rep
  → Su estrés articular es proporcionalmente mayor

INVESTIGAR:
  ¿Los coeficientes gimnásticos deben multiplicarse por (BW/baseline_BW)?
  ¿Cuál es el baseline? ¿70kg como referencia estándar?

  Coeficiente_gimnástico_real = Coeficiente_base × (BW_atleta / 70)

  Un muscle-up para un atleta de 90kg:
    1.30 × (90/70) = 1.67 → significativamente más estrés

Buscar:
  "bodyweight exercise load scaling"
  "body mass gymnastics injury risk"
  "allometric scaling exercise physiology"
```

## 4.3 Sexo biológico

```
INVESTIGAR:
- Tibana et al. (2019) encontró diferencias significativas en lactato
  post-WOD entre hombres y mujeres con volumen igualado
- RFT genera más lactato en hombres que en mujeres
- ¿Los coeficientes deben ser diferentes por sexo?
- ¿O el sRPE captura esta diferencia automáticamente?

Datos existentes:
  Mujeres: mayor resistencia a fatiga en repeticiones submáximas
  Hombres: mayor producción de fuerza máxima, mayor daño muscular (CK)

Buscar:
  "sex differences CrossFit physiological response"
  "sex differences muscle damage recovery"
  "female athlete training load monitoring"
```

## 4.4 Edad

```
INVESTIGAR:
- Recuperación más lenta en atletas >35 años (Masters)
- Mayor riesgo articular con edad
- ¿Existe un multiplicador de recuperación por década de vida?

Hipótesis:
  18-29 años: baseline
  30-39 años: recuperación ×1.10 (10% más lenta)
  40-49 años: recuperación ×1.25
  50+: recuperación ×1.40

Buscar:
  "age-related recovery exercise"
  "masters athlete training load tolerance"
  "CrossFit masters injury rate"
```

## 4.5 Ciclo menstrual

```
Ya existe el Motor Menstrual (Activo #05) en VOLTA.

INVESTIGAR interacción con coeficientes:
- Fase folicular: ¿mayor tolerancia a carga mecánica?
- Fase lútea: ¿mayor RPE para la misma carga objetiva?
- ¿Los coeficientes deben ajustarse por fase o solo el readiness?

Dato existente (MDPI 2024):
  No se encontraron diferencias significativas en carga interna/externa
  de CrossFit entre fases del ciclo. PERO la percepción sí cambia.

Buscar:
  "menstrual cycle training load perception"
  "menstrual cycle CrossFit performance"
  "estrogen progesterone muscle recovery"
```

---

# FASE 5 — CUANTIFICACIÓN DE MOVIMIENTOS GIMNÁSTICOS (el gran vacío)

Este es el problema más difícil. Sin carga externa, ¿cómo cuantificar?

## 5.1 Marco propuesto: Difficulty-Demand Score (DDS)

```
Para cada movimiento gimnástico, crear un score de 4 componentes:

DDS = (Fuerza_requerida × w1) + (Complejidad_técnica × w2) +
      (Riesgo_articular × w3) + (Demanda_metabólica_por_rep × w4)

Donde cada componente es 1-10 y los pesos w1-w4 reflejan la importancia
relativa de cada tipo de estrés.

INVESTIGAR los pesos óptimos:
  w1 (fuerza): ¿cuánto pesa la demanda de fuerza pura?
  w2 (técnica): ¿cuánto pesa la complejidad coordinativa?
  w3 (articular): ¿cuánto pesa el riesgo de lesión articular?
  w4 (metabólico): ¿cuánto pesa el costo cardio por rep?
```

## 5.2 Método de cuantificación por biomecánica

```
INVESTIGAR fuerzas medidas en estudios biomecánicos:
  Kipping pull-up: 3-5× bodyweight en hombro (DATO EXISTENTE)
  Strict pull-up: ~1.0-1.5× bodyweight (estimado)
  Muscle-up catch: ¿?× bodyweight en codo/hombro
  HSPU: ~70-80% bodyweight en hombros/cabeza
  Box jump: ¿?× bodyweight en impacto de aterrizaje
  Rope climb: ~100% bodyweight en agarre + tracción
  Pistol squat: 100% bodyweight unilateral (vs 50% en bilateral)

Buscar:
  "kipping pull-up force measurement"
  "handstand push-up ground reaction force"
  "box jump landing force"
  "rope climb upper body force"
  "pistol squat knee force"
  "gymnastics elements force analysis"
```

## 5.3 El bodyweight como denominador

```
PROPUESTA para gimnásticos:

Carga_gimnástico = Coeficiente_DDS × Bodyweight × Reps × Multiplicador_variante

Donde Multiplicador_variante:
  Strict: 1.0
  Kipping: 0.7 muscular, 1.3 articular → promedio 1.0
  Butterfly: 0.6 muscular, 1.5 articular → promedio 1.05
  Weighted (+10kg): 1.0 + (peso_extra / bodyweight)
  Deficit: 1.15 (mayor ROM = mayor demanda)

INVESTIGAR:
  ¿Este modelo captura adecuadamente la diferencia entre variantes?
  ¿Es mejor tener un score único o mantener los 4 sub-scores separados?
  ¿El promedio de muscular y articular pierde información crítica?
```

---

# FASE 6 — MOVIMIENTOS MONOSTRUCTURALES (cardio)

## 6.1 El problema de unidades

```
¿Cómo comparar 400m de carrera con 20cal de Assault Bike?

INVESTIGAR equivalencias metabólicas:
  ¿1 caloría de remo = cuántos metros de carrera en estrés?
  ¿Las calorías del Assault Bike son equivalentes a las del SkiErg?

Propuesta: usar METs (Equivalentes Metabólicos) como normalizador
  Carrera 10km/h: ~10 METs
  Remo moderado: ~7 METs
  Assault Bike all-out: ~12+ METs
  SkiErg moderado: ~8 METs
  Double-unders: ~10 METs

  Carga_monostructural = METs × duración_minutos × bodyweight_kg / 60

Buscar:
  "metabolic equivalent CrossFit activities"
  "rowing running caloric equivalence"
  "assault bike metabolic cost"
  "MET values functional fitness"
```

## 6.2 Cardio en contexto vs cardio aislado

```
INVESTIGAR:
  800m run al inicio del WOD ≠ 800m run después de 50 thrusters

  ¿El contexto multiplica el costo del cardio?
  ¿La fatiga previa cambia el MET del mismo ejercicio?

  Hipótesis: el costo metabólico del cardio bajo fatiga es mayor
  porque el atleta compensa con técnica degradada
```

---

# FASE 7 — INTERACCIONES ENTRE MOVIMIENTOS (secuencia y combinación)

## 7.1 El efecto de la secuencia

```
INVESTIGAR:
  Thrusters después de pull-ups ≠ pull-ups después de thrusters

  ¿El orden de los movimientos dentro del WOD cambia el estrés total?
  ¿O solo redistribuye qué sistema se fatiga primero?

Ejemplos a investigar:
  Fran: Thrusters → Pull-ups (clásico)
  vs hipotético: Pull-ups → Thrusters

  ¿El estrés total es diferente o solo la distribución?

Buscar:
  "exercise order effect fatigue"
  "movement sequence physiological response"
  "paired exercises interference effect"
```

## 7.2 Sinergia y antagonismo entre movimientos

```
INVESTIGAR:
  Algunos pares de movimientos se "cancelan" (antagonistas):
    Push Press + Pull-ups → un grupo descansa mientras el otro trabaja

  Otros se "amplifican" (sinérgicos):
    Wall Balls + Thrusters → mismos músculos, fatiga compuesta
    Deadlifts + Box Jumps → cadena posterior sin descanso

  ¿Existe un multiplicador de sinergia/antagonismo?

  Hipótesis:
    Par antagonista: multiplicador 0.90 (ligera reducción por descanso relativo)
    Par neutro: multiplicador 1.00
    Par sinérgico: multiplicador 1.15 (fatiga compuesta)

Buscar:
  "agonist antagonist paired sets fatigue"
  "exercise pairing CrossFit performance"
  "compound set fatigue accumulation"
```

## 7.3 Número de transiciones

```
INVESTIGAR:
  Cada cambio de movimiento en un WOD tiene un costo:
    - Transición barbell → gymnastics → cardio
    - Setup time, cambio de patrón motor, ajuste de implemento

  ¿Las transiciones frecuentes aumentan la fatiga neural?
  ¿O permiten micro-recuperación del grupo muscular previo?

  Un couplet (2 movimientos) vs un chipper (8 movimientos):
    Couplet: más intensidad por movimiento, menos transiciones
    Chipper: menor intensidad pero más cambios de patrón motor
```

---

# FASE 8 — CARGA EXTERNA vs CARGA INTERNA

## 8.1 Integración del sRPE con el coeficiente objetivo

```
MODELO DE DOS SEÑALES:

Señal 1 — CARGA EXTERNA (objetiva, calculada por VOLTA)
  CE = Σ (Coeficiente_mov × peso × reps × multiplicador_contexto)

Señal 2 — CARGA INTERNA (subjetiva, reportada por atleta)
  CI = sRPE = RPE_30min × duración_WOD_minutos

INVESTIGAR cómo combinar ambas señales:

  Opción A: Promedio ponderado
    Carga_total = α × CE + (1-α) × CI
    ¿Cuál es el α óptimo? ¿0.5? ¿0.6?

  Opción B: Validación cruzada
    Si |CE - CI| > umbral → flag de discrepancia
    CE >> CI: los coeficientes están sobreestimados O el atleta subestima esfuerzo
    CI >> CE: los coeficientes están subestimados O el atleta estaba en mal día

  Opción C: Modelo adaptativo individual
    α se ajusta por atleta basado en historial de concordancia CE↔CI
    Si un atleta siempre reporta RPE alto para WODs que el modelo calcula "bajo":
      → Sus coeficientes personales se recalibran al alza

Buscar:
  "external internal training load relationship"
  "session RPE validity resistance training"
  "individualized training load monitoring"
  "discrepancy internal external load overtraining"
```

## 8.2 Calibración individual a lo largo del tiempo

```
CONCEPTO CLAVE: los coeficientes no son estáticos.

Un atleta que progresa ajusta su relación con cada movimiento:
  - Año 1: kipping pull-ups son técnicamente difíciles → SNC alto
  - Año 3: kipping pull-ups son automáticos → SNC bajo, articular sube

INVESTIGAR:
  ¿Puede el sistema auto-calibrar coeficientes por atleta?

  Algoritmo propuesto:
    1. Empezar con coeficientes base (consenso experto)
    2. Registrar sRPE de cada sesión
    3. Comparar sRPE real vs sRPE predicho por el modelo
    4. Si la discrepancia es consistente → ajustar coeficientes para ese atleta
    5. Con suficientes datos (~30 sesiones) → el modelo se personaliza

Buscar:
  "individualized dose-response model"
  "adaptive training load algorithm"
  "machine learning training load prediction"
  "Bayesian updating exercise prescription"
```

---

# FASE 9 — RECUPERACIÓN (el otro lado de la ecuación)

## 9.1 Ventana de recuperación por tipo de estrés

```
Dato base (literatura existente):
  CK (daño muscular): pico 24h, baseline 48h
  Cortisol/Testosterona: baseline 48h
  Lactato: clearance 15 min
  SNC: ¿? (no hay consenso claro)
  Articular: ¿? (depende de la articulación)

INVESTIGAR ventanas específicas:
  ¿Cuánto tarda en recuperarse el SNC después de un día de 1RM?
  ¿Cuánto tarda una articulación de hombro después de 100 kipping pull-ups?
  ¿La recuperación articular es lineal o tiene efecto acumulativo a lo largo de semanas?

Buscar:
  "neural recovery heavy resistance training"
  "shoulder joint recovery repetitive overhead"
  "cumulative joint stress tendon adaptation"
  "supercompensation timeline by system"
```

## 9.2 Recuperación cruzada entre grupos musculares

```
INVESTIGAR:
  Si hoy destruyo piernas (squats), ¿mañana puedo hacer upper body sin penalización?

  Hipótesis: la fatiga LOCAL (muscular) se puede alternar entre grupos
  PERO la fatiga SISTÉMICA (SNC, hormonal, metabólica) afecta todo

  ¿Cómo modelar esto en VOLTA?
  ¿Split de carga por grupo muscular con recuperación independiente?
  ¿O un solo pool de "fatiga sistémica" más pools locales?

Buscar:
  "split routine recovery concurrent training"
  "local vs systemic fatigue resistance training"
  "cross-education recovery between muscle groups"
```

---

# FASE 10 — VALIDACIÓN DEL MODELO

## 10.1 Método de validación interna

```
Con datos de atletas de VOLTA:

1. Registrar CE (carga externa calculada) + sRPE por 90 días
2. Comparar CE vs sRPE: correlación esperada r > 0.70
3. Si r < 0.60 → los coeficientes no reflejan la realidad percibida
4. Ajustar coeficientes y re-evaluar

Métricas de éxito:
  - Correlación CE↔sRPE > 0.70 a nivel grupal
  - Correlación CE↔sRPE > 0.60 a nivel individual
  - El modelo predice readiness del día siguiente con RMSE < 10 puntos
  - Las alertas de overtraining preceden a lesiones reportadas en >60% de casos
```

## 10.2 Método de validación contra lesiones

```
Con suficientes datos (>6 meses, >50 atletas):

1. Registrar todas las lesiones reportadas (tipo, zona, severidad)
2. Analizar ACWR y readiness de los 7 días previos a cada lesión
3. ¿El modelo detectó el riesgo antes de la lesión?
4. Sensibilidad objetivo: >70% de lesiones precedidas por alarma
5. Especificidad: <20% de alarmas falsas (para no perder credibilidad)

ESTO SERÍA PUBLICABLE. Ningún estudio ha correlacionado ACWR con lesiones
específicamente en CrossFit. VOLTA podría generar el primer paper.
```

## 10.3 Iteración continua

```
Los coeficientes NUNCA están "terminados":
  - v1.0: consenso experto (lo que tenemos ahora)
  - v1.5: ajustado por sRPE de los primeros 100 atletas
  - v2.0: ajustado por correlación con lesiones
  - v3.0: modelo adaptativo individual (machine learning)

Cada versión es más precisa que la anterior.
El valor de VOLTA CRECE con cada atleta que aporta datos.
```

---

# FASE 11 — COMPETENCIA Y EVENTOS ESPECIALES

## 11.1 Carga de competencia

```
INVESTIGAR:
  Un día de competencia (3-4 WODs) ≠ un día normal de box

  Factores adicionales:
  - Estrés psicológico de competir (cortisol elevado pre-evento)
  - Intentos máximos (no hay escala, todo es all-out)
  - Recuperación entre WODs limitada (30-60 min)
  - Duración total del día (8-10 horas)

  ¿Existe un "multiplicador de competencia"?
  Hipótesis: multiplicador 1.5-2.0x sobre la carga calculada normal

Buscar:
  "competition day physiological stress"
  "psychological stress cortisol athletic competition"
  "multi-event competition recovery"
  "CrossFit competition workload analysis"
```

## 11.2 Testing days (días de benchmark/1RM)

```
INVESTIGAR:
  Los días de testeo (1RM, benchmark WODs) tienen perfil diferente:
  - Mayor estrés SNC (intentos máximos)
  - Menor volumen total (pocas reps pesadas)
  - Mayor estrés psicológico (presión por resultado)
  - Recuperación neural más larga que la muscular

  ¿Cómo los clasifica el modelo?
  ¿Un 1RM de 3 reps tiene más impacto que un WOD de 100 reps?
```

---

# FASE 12 — FACTORES AMBIENTALES Y EXTERNOS

## 12.1 Variables que modifican el costo de la misma sesión

```
INVESTIGAR el impacto de:

TEMPERATURA Y HUMEDAD
  - WOD al aire libre a 35°C vs gimnasio climatizado
  - Deshidratación bajo calor → mayor HR para la misma carga
  - ¿Multiplicador por condición climática?

ALTITUD
  - Box a nivel del mar vs box a 2500m
  - Menor disponibilidad de O2 → mayor costo metabólico
  - ¿Multiplicador por altitud?

HORA DEL DÍA
  - WOD a las 6AM vs WOD a las 6PM
  - Temperatura corporal, cortisol, testosterona varían con circadiano
  - ¿Hay hora óptima para minimizar estrés / maximizar adaptación?

NUTRICIÓN PRE-WOD
  - WOD en ayunas vs WOD con comida 2h antes
  - ¿Cambia la capacidad de tolerar carga?

Buscar:
  "environmental factors exercise performance"
  "heat stress training load modification"
  "altitude training physiological cost"
  "circadian rhythm exercise performance"
  "fasted training physiological response"
```

---

# RESUMEN EJECUTIVO — QUÉ DEBE PRODUCIR ESTA INVESTIGACIÓN

Al completar las 12 fases, el output debe ser:

## Entregable 1: Tabla Maestra de Coeficientes
```
Para CADA movimiento de CrossFit (~120 movimientos):
  - Coeficiente base (1.0 = referencia)
  - Perfil de estrés: [Mecánico, SNC, Metabólico, Articular] (cada uno 1-10)
  - Cadena muscular: [Push/Pull, Anterior/Posterior, Upper/Lower]
  - Multiplicador por variante (strict/kipping/butterfly/weighted/deficit)
  - Fórmula de carga: cómo calcular la carga de ese movimiento específico
```

## Entregable 2: Tabla de Multiplicadores de Contexto
```
  - Por formato de WOD: [RFT, AMRAP, EMOM, Tabata, Chipper, Hero]
  - Por duración: [<5min, 5-15, 15-30, 30-60, 60+]
  - Por posición en WOD: [ronda 1, 2, 3, 4, 5+]
  - Por sinergia entre movimientos: [antagonista, neutro, sinérgico]
  - Por competencia: [entrenamiento, benchmark, competencia]
```

## Entregable 3: Tabla de Modificadores Individuales
```
  - Por nivel: [principiante, intermedio, avanzado, élite]
  - Por peso corporal: función de escala para gimnásticos
  - Por sexo: diferencias validadas (si las hay)
  - Por edad: multiplicador de recuperación por década
  - Por fase menstrual: modificadores de percepción
```

## Entregable 4: Algoritmo de Integración
```
  Carga_Total_Sesión = Σ(Coeficiente_mov × Carga × Reps × Mult_contexto)
                       × Mult_formato × Mult_duración × Mult_individual

  Validado contra sRPE con correlación > 0.70
  Alimentando ACWR (EWMA) y Banister-Busso
```

## Entregable 5: Protocolo de Auto-calibración
```
  Cómo los coeficientes se ajustan automáticamente por atleta
  basado en discrepancia acumulada CE↔sRPE
  → El modelo mejora con cada sesión registrada
```
