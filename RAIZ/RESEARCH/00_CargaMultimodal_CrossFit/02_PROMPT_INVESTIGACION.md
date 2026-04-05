# PROMPT DE INVESTIGACIÓN
## Sistema de Cuantificación de Carga Multimodal para CrossFit

> Copia este prompt completo y ejecútalo en un agente de investigación con acceso a búsqueda web y papers académicos.

---

## CONTEXTO

Estamos construyendo VOLTA, una plataforma de análisis de rendimiento y prevención de lesiones para atletas de CrossFit. El motor central necesita cuantificar la carga total de cada sesión de entrenamiento para alimentar dos algoritmos:

1. **ACWR (Acute:Chronic Workload Ratio)** — detecta picos de carga peligrosos (riesgo de lesión)
2. **Banister Fitness-Fatigue Model** — estima el readiness (disponibilidad fisiológica para rendir)

**El problema**: CrossFit combina en una sola sesión levantamiento olímpico, gimnásticos bodyweight y cardio monostructural. No existe en la literatura científica un sistema validado que cuantifique la carga total de una sesión multimodal de CrossFit con un solo score comparable entre sesiones, atletas y formatos de WOD.

**Tu trabajo**: Investigar en profundidad todas las fuentes disponibles (papers académicos, libros de fisiología del ejercicio, metodologías de programación de CrossFit élite, datos biomecánicos, y consenso de coaches de alto rendimiento) para producir los 5 entregables que se describen al final.

---

## INSTRUCCIONES GENERALES

- Busca en PubMed, Google Scholar, Frontiers, MDPI, ResearchGate, y fuentes de sports science.
- Busca también en fuentes de la industria CrossFit: CompTrain, HWPO, Mayhem, Misfit Athletics, The Gains Lab, Beyond the Whiteboard, SugarWOD.
- Busca libros de referencia: "Science and Practice of Strength Training" (Zatsiorsky), "Supertraining" (Siff), "Periodization" (Bompa), "The System" (Verkoshansky).
- Si un dato NO existe en la literatura, dilo explícitamente y propón un valor basado en el consenso más cercano disponible. Marca estos valores como [ESTIMADO — SIN VALIDACIÓN PUBLICADA].
- Si encuentras datos contradictorios entre fuentes, presenta ambas posiciones con sus papers de respaldo.
- Prioriza datos cuantitativos sobre cualitativos. Necesitamos números, no descripciones vagas.
- Cita TODOS los papers con: Autor(es), Año, Título, Journal.

---

## BLOQUE 1 — TABLA MAESTRA DE COEFICIENTES POR MOVIMIENTO

### Instrucción

Para cada uno de los siguientes movimientos de CrossFit, investiga y asigna:

**A) Coeficiente de estrés base (escala 0.50 — 2.00)**
- 1.00 = referencia (equivalente a un back squat al 70% 1RM × 10 reps)
- <1.00 = menos estresante que la referencia
- >1.00 = más estresante que la referencia

**B) Perfil de estrés por sistema (cada uno 1-10)**
- **MEC** (Mecánico/Musculoesquelético): daño en fibras musculares, DOMS, CK. Lo que hace que duela al día siguiente.
- **SNC** (Sistema Nervioso Central): demanda de coordinación, velocidad, potencia explosiva. Lo que te deja "frito" mentalmente y reduce tu velocidad de reacción.
- **MET** (Metabólico): lactato, deuda de oxígeno, HR elevada. Lo que te deja sin aire.
- **ART** (Articular): estrés en tendones, ligamentos, cápsulas articulares. Lo que genera molestias en articulaciones específicas.

**C) Articulaciones en riesgo** (listar las 1-3 más comprometidas por movimiento)

**D) Cadena muscular primaria**
- Push / Pull
- Anterior Chain / Posterior Chain
- Upper Body / Lower Body / Full Body
- Quad-dominante / Hip-dominante / Mixto

**E) Multiplicador por variante** (cuando aplique)
- Strict vs Kipping vs Butterfly vs Weighted vs Deficit vs Tempo

### Los movimientos a investigar

```
BARBELL — LEVANTAMIENTO OLÍMPICO
01. Snatch (full, from floor)
02. Power Snatch
03. Hang Snatch (above knee)
04. Snatch Balance
05. Overhead Squat
06. Clean (full, from floor)
07. Power Clean
08. Hang Clean (above knee)
09. Clean & Jerk (full)
10. Push Jerk
11. Split Jerk
12. Squat Clean Thruster (Cluster)

BARBELL — FUERZA
13. Back Squat
14. Front Squat
15. Deadlift
16. Sumo Deadlift
17. Romanian Deadlift (RDL)
18. Strict Press (Shoulder Press)
19. Push Press
20. Bench Press
21. Pendlay Row
22. Hip Thrust / Glute Bridge con barra

BARBELL — HÍBRIDOS METCON
23. Thruster
24. Sumo Deadlift High Pull (SDHP)
25. Hang Power Clean (en metcon, peso ligero-moderado)
26. Ground to Overhead (anyhow)
27. Shoulder to Overhead (anyhow)
28. Bar Facing Burpee + movimiento de barra

GIMNÁSTICOS — TIRÓN
29. Pull-up estricto
30. Pull-up kipping
31. Pull-up butterfly
32. Chest-to-bar (C2B) kipping
33. Bar Muscle-Up (kipping)
34. Bar Muscle-Up (strict)
35. Ring Muscle-Up (kipping)
36. Ring Muscle-Up (strict)
37. Rope Climb (con piernas)
38. Rope Climb (legless)
39. Peg Board

GIMNÁSTICOS — EMPUJE
40. Push-Up (standard)
41. Ring Push-Up
42. Handstand Push-Up strict
43. Handstand Push-Up kipping
44. HSPU deficit (strict)
45. HSPU deficit (kipping)
46. Ring Dip (strict)
47. Ring Dip (kipping)
48. Paralette Dip
49. Handstand Walk (por metro)
50. Press to Handstand

GIMNÁSTICOS — CORE / SUSPENSIÓN
51. Toes-to-Bar (kipping)
52. Toes-to-Bar (strict)
53. Knees-to-Elbow
54. GHD Sit-Up
55. GHD Hip Extension
56. L-Sit Hold (por segundo)
57. Hollow Hold (por segundo)
58. V-Up
59. Sit-Up (AbMat)

GIMNÁSTICOS — PIERNA / ACROBÁTICO
60. Pistol Squat (air squat unilateral)
61. Box Jump (rebote — estándar competición)
62. Box Jump (step-down)
63. Box Jump Over
64. Burpee (standard)
65. Burpee Box Jump Over
66. Burpee a target (bar-facing, lateral, etc.)
67. Lunge (bodyweight, walking)
68. Jump Lunge

IMPLEMENTOS — KETTLEBELL
69. KB Swing American
70. KB Swing Russian
71. KB Snatch (single arm)
72. KB Clean & Jerk (single arm)
73. Turkish Get-Up
74. Goblet Squat
75. KB Farmer Carry (por metro)
76. KB Overhead Carry (por metro)

IMPLEMENTOS — DUMBBELL
77. DB Snatch (single arm, alternating)
78. DB Clean & Jerk
79. DB Thruster
80. DB Overhead Lunge
81. Devil Press
82. Man Maker
83. DB Box Step-Up (con peso)

IMPLEMENTOS — MEDICINE BALL
84. Wall Ball Shot
85. Ball Slam
86. Ball Over Shoulder
87. Ball Clean (D-Ball)
88. Medicine Ball Carry (por metro)

IMPLEMENTOS — OTROS
89. Sandbag Clean
90. Sandbag Carry (por metro)
91. Sandbag Over Shoulder
92. Sled Push (por metro)
93. Sled Pull (por metro)
94. Yoke Carry (por metro)
95. Stone to Shoulder (Atlas Stone)
96. Worm (equipo — por rep)
97. Pig Flip (equipo)
98. Battle Rope (por intervalo de 30s)

MONOSTRUCTURAL — CARRERA
99. Run 200m (sprint)
100. Run 400m
101. Run 800m
102. Run 1600m (1 mile)
103. Run 5K

MONOSTRUCTURAL — REMO
104. Row (calorías — ritmo sprint <1:30/500m)
105. Row (calorías — ritmo moderado 1:30-2:00/500m)
106. Row (distancia — 500m, 1000m, 2000m)

MONOSTRUCTURAL — BICICLETA
107. Assault/Echo Bike (calorías — sprint)
108. Assault/Echo Bike (calorías — moderado)
109. Bike Erg (calorías)

MONOSTRUCTURAL — SKI
110. SkiErg (calorías — sprint)
111. SkiErg (calorías — moderado)

MONOSTRUCTURAL — SALTO
112. Double-Under
113. Single-Under
114. Triple-Under

MONOSTRUCTURAL — OTROS
115. Swim (por 25m)
116. Shuttle Run (por 25m)
117. Sled Sprint (por 25m)

ACCESORIOS / MOVILIDAD (si aparecen en WODs)
118. Banded Pull-Apart
119. Face Pull
120. Single-Leg RDL (DB)
121. Bulgarian Split Squat
122. Strict Toes-to-Ring
```

### Formato de entrega para cada movimiento

```
## [Número]. [Nombre del Movimiento]

Coeficiente base: [0.50 — 2.00]
Fuente del coeficiente: [Paper / Consenso experto / Estimado]

Perfil de estrés:
  MEC: [1-10]  |  SNC: [1-10]  |  MET: [1-10]  |  ART: [1-10]

Articulaciones en riesgo: [lista]

Cadena muscular:
  Tipo: [Push/Pull/Mixto]
  Cadena: [Anterior/Posterior/Full]
  Zona: [Upper/Lower/Full Body]
  Dominancia: [Quad/Hip/Mixto]

Variantes y multiplicadores:
  [Variante]: [multiplicador] — [justificación breve]

Notas biomecánicas:
  [Datos cuantitativos si existen: fuerzas medidas, EMG, etc.]

Fuentes:
  [Lista de papers o fuentes consultadas para este movimiento]
```

---

## BLOQUE 2 — MULTIPLICADORES DE FORMATO DE WOD

### Instrucción

Investiga el impacto fisiológico diferencial de cada formato de WOD en CrossFit. Usa los datos existentes (Santos-Fernandez 2024 para AMRAP/EMOM/RFT, datos de Murph para Hero WODs) y extrapola con justificación fisiológica donde no haya datos directos.

### Para cada formato, entregar:

```
## [Formato]

Multiplicador global: [0.70 — 1.50]
Justificación: [por qué este número]

Perfil de estrés dominante:
  MEC: [bajo/medio/alto]
  SNC: [bajo/medio/alto]
  MET: [bajo/medio/alto]
  ART: [bajo/medio/alto]

Sub-multiplicador por duración:
  <5 min:  [multiplicador]
  5-12 min: [multiplicador]
  12-20 min: [multiplicador]
  20-35 min: [multiplicador]
  35-60 min: [multiplicador]
  60+ min: [multiplicador]

Tiempo de recuperación estimado para 100% readiness:
  Atleta intermedio: [horas]
  Atleta avanzado: [horas]

Datos fisiológicos medidos:
  HR promedio: [si existe dato]
  HR máxima: [si existe dato]
  Lactato post: [si existe dato]
  CK a 24h: [si existe dato]

Fuentes:
  [Papers consultados]
```

### Los formatos a investigar:
```
01. For Time (RFT) — couplet (2 movimientos)
02. For Time (RFT) — triplet (3 movimientos)
03. For Time (RFT) — chipper (4+ movimientos, una ronda)
04. AMRAP — corto (<10 min)
05. AMRAP — medio (10-20 min)
06. AMRAP — largo (20+ min)
07. EMOM — corto (<12 min)
08. EMOM — largo (20-40 min)
09. Tabata / Interval
10. Ladder ascendente (1-2-3-4-5...)
11. Ladder descendente (21-15-9, 10-8-6-4-2)
12. Hero WOD (Murph, DT, Fran como benchmark)
13. Benchmark Girls (Fran, Grace, Diane, Isabel, etc.)
14. Strength Only (5×5, 3×3, 1RM testing)
15. Skill / Technique session (EMOM de práctica)
16. Competition day (múltiples WODs en un día)
17. Active Recovery / Mobility session
```

---

## BLOQUE 3 — MODIFICADORES INDIVIDUALES

### Instrucción

Investiga cómo las variables individuales del atleta modifican el impacto de la misma sesión. Necesitamos multiplicadores cuantitativos con justificación.

### Para cada variable, entregar:

```
## [Variable]

Niveles: [lista de niveles]
Multiplicadores por nivel: [tabla]
Justificación fisiológica: [por qué esta variable modifica la carga]
Qué afecta más: [¿carga percibida? ¿recuperación? ¿riesgo articular?]
Fuentes: [papers]
```

### Variables a investigar:

```
01. NIVEL DE EXPERIENCIA EN CROSSFIT
    Categorías: Principiante (<1 año), Intermedio (1-3), Avanzado (3-5), Élite (5+)
    Investigar: eficiencia mecánica, riesgo de lesión, capacidad de recuperación, tolerancia a volumen

02. PESO CORPORAL DEL ATLETA
    Impacto en: movimientos gimnásticos (bodyweight = la carga)
    Investigar: escalamiento alométrico, relación peso-fuerza, fórmulas de normalización (Wilks, Sinclair, etc.)
    Proponer: fórmula para escalar coeficientes gimnásticos por peso corporal

03. SEXO BIOLÓGICO
    Investigar: diferencias en producción de fuerza, recuperación, tolerancia a volumen, respuesta hormonal post-ejercicio, tasa de lesión
    Datos existentes: Tibana 2019 encontró diferencias en lactato RFT hombres vs mujeres
    Proponer: ¿coeficientes diferentes por sexo o un solo modificador?

04. EDAD
    Categorías: 18-29, 30-39, 40-49, 50-59, 60+
    Investigar: velocidad de recuperación, riesgo articular, tolerancia a intensidad, producción hormonal
    Buscar datos específicos de Masters CrossFit athletes

05. FASE DEL CICLO MENSTRUAL
    Fases: Menstrual, Folicular temprana, Folicular tardía, Ovulación, Lútea temprana, Lútea tardía
    Investigar: percepción de esfuerzo, fuerza máxima, tolerancia al volumen, riesgo de lesión ligamentosa (ACL especialmente)
    Dato existente: MDPI 2024 no encontró diferencias en carga interna/externa CrossFit entre fases

06. HISTORIAL DE LESIONES
    Investigar: ¿una lesión previa de hombro modifica el coeficiente de todos los movimientos overhead?
    ¿Cuánto tiempo post-lesión dura el riesgo elevado de re-lesión?

07. SUEÑO
    Investigar: impacto de <6h, 6-7h, 7-8h, 8+h en rendimiento, percepción de esfuerzo, riesgo de lesión
    Buscar datos cuantitativos de degradación de rendimiento por hora de sueño perdida

08. ESTRÉS PSICOLÓGICO
    Investigar: cortisol crónico elevado por estrés laboral/personal → ¿modifica la respuesta al entrenamiento?
    ¿El estrés psicológico reduce la tolerancia a la carga física?

09. NUTRICIÓN / ESTADO DE HIDRATACIÓN
    Investigar: entrenamiento en ayunas vs alimentado, deshidratación leve (2%) vs hidratado
    ¿Cuánto cambia el costo fisiológico de la misma sesión?

10. CONDICIONES AMBIENTALES
    Investigar: calor (>30°C), frío (<5°C), humedad (>80%), altitud (>1500m)
    ¿Existe un multiplicador ambiental validado?
```

---

## BLOQUE 4 — INTERACCIONES ENTRE MOVIMIENTOS

### Instrucción

Investiga cómo la combinación y secuencia de movimientos dentro de un WOD modifica el estrés total. Esto es crítico porque CrossFit es multimodal — el estrés de un WOD NO es simplemente la suma del estrés de cada movimiento por separado.

### Preguntas de investigación:

```
01. SINERGIA MUSCULAR (mismo grupo muscular consecutivo)
    ¿Cuánto aumenta el estrés cuando dos movimientos consecutivos cargan
    el mismo grupo muscular?
    Ejemplo: Wall Balls → Thrusters (ambos quad-dominante + press)
    Investigar: "compound sets fatigue", "pre-exhaustion technique"
    Proponer: multiplicador de sinergia [1.05 — 1.30]

02. ANTAGONISMO MUSCULAR (grupos opuestos alternados)
    ¿Se reduce el estrés total cuando movimientos consecutivos alternan
    grupos musculares?
    Ejemplo: Pull-ups → Push Press (pull → push)
    Investigar: "agonist antagonist paired sets", "alternating muscle groups rest"
    Proponer: multiplicador de antagonismo [0.85 — 0.95]

03. POSICIÓN EN EL WOD (fatiga acumulada)
    ¿Cómo escala el estrés de un movimiento según su posición?
    Ronda 1 es diferente a ronda 5. Rep 1 es diferente a rep 100.
    Investigar: "repetition quality degradation fatigue", "technique breakdown under fatigue"
    Proponer: función de escalamiento por ronda/posición

04. TRANSICIONES ENTRE MODALIDADES
    ¿Cambiar de barbell a gimnástico a cardio dentro del WOD genera
    estrés adicional (cambio de patrón motor) o permite micro-recuperación?
    Investigar: "task switching cost exercise", "exercise transition fatigue"

05. EFECTO DEL NÚMERO DE MOVIMIENTOS
    ¿Un couplet (Fran: thrusters + pull-ups) es más o menos estresante
    que un chipper (Filthy Fifty: 10 movimientos)?
    Hipótesis: couplets permiten mayor intensidad por movimiento,
    chippers distribuyen la fatiga pero extienden la duración.

06. COMBINACIONES ESPECÍFICAS CONOCIDAS POR SU BRUTALIDAD
    Investigar el impacto fisiológico documentado de:
    - Thrusters + Pull-ups (Fran)
    - Clean & Jerk cycling (Grace, Isabel)
    - Run + Pull-ups + Push-ups + Squats (Murph)
    - Deadlift + HSPU + Box Jumps (Diane-type)
    - Double-Unders + cualquier movimiento (efecto del rebote en pantorrillas)
    ¿Hay algo específico de estas combinaciones que los hace peores
    que la suma de sus partes?
```

---

## BLOQUE 5 — SISTEMA DE CARGA INTERNA (sRPE) COMO VALIDADOR

### Instrucción

Investiga en profundidad el uso de Session RPE en CrossFit/HIFT como herramienta de validación del modelo de carga externa.

```
01. ¿Cuál escala de RPE es más apropiada para CrossFit?
    - Escala de Borg original (6-20)
    - Escala CR-10 modificada de Foster (0-10)
    - Escala CR-100 (centiMax)
    ¿Alguna ha sido validada específicamente para HIFT/CrossFit?

02. ¿A qué minuto post-WOD debe medirse el RPE?
    Dato existente: Tibana 2018 recomienda 30 minutos post-WOD.
    ¿Hay consenso? ¿Otros papers dicen diferente?

03. ¿Cómo se calcula el sRPE para WODs multimodales?
    sRPE = RPE × duración_minutos
    ¿La duración incluye descansos (en EMOMs) o solo tiempo bajo tensión?
    ¿Un WOD de 3 minutos all-out (Fran) genera sRPE bajo solo por ser corto?
    ¿Se necesita un ajuste para WODs ultra-cortos?

04. CORRELACIÓN sRPE vs CARGA EXTERNA en CrossFit
    ¿Qué correlaciones se han encontrado?
    ¿Son más altas para ciertos formatos de WOD que para otros?
    ¿El sRPE captura mejor el estrés metabólico que el mecánico?

05. LIMITACIONES DEL sRPE EN CROSSFIT
    - ¿Los atletas principiantes reportan RPE diferente que los experimentados para la misma carga?
    - ¿El RPE está influenciado por el componente competitivo (ir contra el reloj)?
    - ¿El RPE subestima el estrés articular? (puedes no sentir que fue "duro" pero tus hombros se destruyeron)

06. PROPUESTA DE MODELO HÍBRIDO
    ¿Cómo combinar carga externa (CE) calculada por coeficientes
    con carga interna (CI = sRPE) para producir un score final más robusto?
    Investigar: "internal external training load integration", "combined training load monitoring"
    Proponer una fórmula o algoritmo de integración con justificación.
```

---

## BLOQUE 6 — RECUPERACIÓN POR TIPO DE ESTRÉS

### Instrucción

Investiga los tiempos de recuperación específicos para cada tipo de estrés identificado, aplicados al contexto CrossFit.

```
01. RECUPERACIÓN MUSCULAR (estrés MEC)
    ¿Cuántas horas necesita cada grupo muscular para volver al 100%?
    ¿Es diferente para upper vs lower body?
    ¿Es diferente para concéntrico vs excéntrico?
    Datos: CK pico 24h, baseline 48h. ¿Qué más hay?

02. RECUPERACIÓN NEURAL (estrés SNC)
    ¿Cuántas horas necesita el SNC después de:
    - Sesión de 1RM olímpico?
    - WOD con alto volumen de muscle-ups?
    - Día de competencia (múltiples WODs)?
    ¿Cómo se mide? ¿Qué marcadores existen?

03. RECUPERACIÓN METABÓLICA (estrés MET)
    Lactato se limpia en 15 min. ¿Qué más necesita recuperarse?
    Glucógeno: ¿cuántas horas para resíntesis completa?
    ¿Depende de la nutrición post-WOD?

04. RECUPERACIÓN ARTICULAR (estrés ART)
    ¿Cuánto tiempo necesitan los tendones y ligamentos?
    ¿La recuperación articular es acumulativa? (daño micro que se suma)
    ¿Los tendones se adaptan más lento que los músculos?
    Buscar: "tendon recovery exercise", "joint recovery timeline"

05. INTERACCIÓN ENTRE TIPOS DE RECUPERACIÓN
    ¿La fatiga neural retrasa la recuperación muscular?
    ¿La inflamación articular interfiere con la recuperación metabólica?
    ¿Se pueden entrenar diferentes sistemas en días consecutivos?
    Ejemplo: Día 1 = squats pesados (MEC+SNC), Día 2 = AMRAP cardio (MET)
    ¿Es viable o la fatiga sistémica lo impide?
```

---

## BLOQUE 7 — MODELO BANISTER ADAPTADO A CROSSFIT

### Instrucción

Diseña una adaptación del modelo Banister (Fitness-Fatigue) específica para CrossFit, incorporando todo lo investigado en los bloques anteriores.

```
01. CONSTANTES DE DECAY
    El Banister clásico usa tau1=45 (fitness) y tau2=15 (fatigue).
    ¿Son apropiadas para CrossFit?
    ¿O la naturaleza multimodal de CrossFit requiere constantes diferentes?

    PROPUESTA A INVESTIGAR: ¿Debería haber múltiples curvas de fatiga
    en lugar de una sola?
    - Fatiga_muscular: tau = 15 días (decay rápido)
    - Fatiga_neural: tau = 7 días (decay muy rápido)
    - Fatiga_articular: tau = 30 días (decay lento — se acumula)
    - Fatiga_metabólica: tau = 3 días (se limpia rápido)

    Readiness = Fitness - (w1×Fat_MEC + w2×Fat_SNC + w3×Fat_ART + w4×Fat_MET)

02. MODELO NO-LINEAL DE BUSSO
    Busso (2003) propuso que la fatiga se compone cuando hay días consecutivos
    de entrenamiento duro. ¿Cómo implementar esto para CrossFit?
    ¿El multiplicador de fatiga compuesta debería ser diferente para
    3 días seguidos vs 5 días seguidos?

03. CALIBRACIÓN DE k1 (fitness gain) y k2 (fatigue gain)
    En el modelo clásico, k2 > k1 (la fatiga crece más rápido que el fitness).
    ¿Cuál es el ratio óptimo para CrossFit?
    ¿Es diferente para atletas que entrenan 3x/semana vs 5x/semana vs 2x/día?

04. VALIDACIÓN
    ¿Cómo validar que el Banister adaptado predice correctamente el readiness?
    Proponer un protocolo de validación usando datos de atletas reales:
    - ¿Qué métricas se usarían como ground truth de "readiness"?
    - ¿Cuántos atletas y cuánto tiempo se necesitan para validar?
    - ¿Qué correlación mínima se consideraría aceptable?
```

---

## BLOQUE 8 — ACWR ADAPTADO A CROSSFIT (EWMA)

### Instrucción

Diseña la versión EWMA del ACWR específica para CrossFit.

```
01. FÓRMULA EWMA vs ROLLING AVERAGE
    Implementar EWMA como recomienda Murray 2017:

    EWMA_hoy = Carga_hoy × λ + EWMA_ayer × (1 - λ)

    Donde λ = 2/(N+1)
    Para ACWR: λ_agudo = 2/8 = 0.25 (ventana ~7 días)
               λ_crónico = 2/29 = 0.069 (ventana ~28 días)

    ¿Estos valores de N son apropiados para CrossFit?
    ¿O la frecuencia típica de entrenamiento en CrossFit (5x/semana)
    sugiere ventanas diferentes?

02. UMBRALES PARA CROSSFIT
    Los umbrales clásicos (Gabbett 2016):
    - Sweet spot: 0.8-1.3
    - Warning: 1.3-1.5
    - Danger: >1.5

    ¿Son apropiados para CrossFit? ¿O la variabilidad de estímulos
    de CrossFit genera ACWR más volátil de lo normal?
    ¿Debería haber umbrales diferentes para atletas que entrenan
    3x/semana vs 6x/semana?

03. MANEJO DE DÍAS SIN ENTRENAMIENTO
    ¿Cómo maneja el EWMA un día de descanso? ¿Carga = 0?
    ¿Esto distorsiona el ratio cuando el atleta entrena solo 3x/semana?
    ¿Se necesita un ajuste para frecuencias de entrenamiento bajas?

04. ACWR POR TIPO DE ESTRÉS
    ¿Tiene sentido calcular ACWR separado para cada tipo de estrés?
    - ACWR_mecánico
    - ACWR_neural
    - ACWR_metabólico
    - ACWR_articular

    Un atleta puede tener ACWR_metabólico alto pero ACWR_articular bajo
    (muchas sesiones de remo pero pocos overhead). ¿Esto es útil o
    sobre-complica el modelo?
```

---

## BLOQUE 9 — PROTOCOLO DE AUTO-CALIBRACIÓN

### Instrucción

Diseña un algoritmo que permita que los coeficientes se auto-ajusten por atleta individual a lo largo del tiempo, usando la discrepancia entre carga externa calculada y sRPE reportado.

```
01. ALGORITMO DE DETECCIÓN DE DISCREPANCIA
    Si la carga externa (CE) calculada por VOLTA consistentemente
    sobreestima o subestima respecto al sRPE del atleta:
    - ¿Cuántas sesiones se necesitan para detectar un sesgo estable?
    - ¿Qué umbral de discrepancia es "significativo"?
    - ¿Cómo distinguir entre "coeficientes mal calibrados" y
      "atleta tuvo una mala semana por estrés/sueño"?

02. ALGORITMO DE AJUSTE
    Una vez detectada la discrepancia:
    - ¿Se ajustan todos los coeficientes uniformemente?
    - ¿O se ajustan solo los coeficientes de los movimientos específicos
      donde hay mayor discrepancia?
    - ¿A qué velocidad se ajustan? (learning rate)
    - ¿Hay límites para evitar que se descontrolen?

03. COLD START (atleta nuevo)
    Un atleta nuevo no tiene historial.
    - ¿Qué coeficientes usa por defecto?
    - ¿Cuántas sesiones hasta que el modelo empiece a personalizar?
    - ¿Se puede acelerar con el onboarding? (ej: si dice que tiene
      5 años de experiencia, empezar con coeficientes de "avanzado")

04. VALIDACIÓN DEL AUTO-CALIBRADO
    - ¿Cómo saber si la calibración personalizada es MEJOR que los
      coeficientes base?
    - Métrica: ¿la correlación CE↔sRPE mejora después de 30 sesiones
      de calibración?
    - ¿Cuánta mejora es "significativa"?
```

---

## FORMATO DE ENTREGA FINAL

Organiza toda la investigación en 5 documentos:

```
ENTREGABLE_1_TABLA_MAESTRA_MOVIMIENTOS.md
  → Los ~122 movimientos con todos sus datos (Bloque 1)

ENTREGABLE_2_MULTIPLICADORES_FORMATO_WOD.md
  → Los 17 formatos con multiplicadores y datos fisiológicos (Bloque 2)

ENTREGABLE_3_MODIFICADORES_INDIVIDUALES.md
  → Las 10 variables individuales con multiplicadores (Bloque 3)
  → + Las interacciones entre movimientos (Bloque 4)
  → + El modelo de sRPE (Bloque 5)
  → + Los tiempos de recuperación (Bloque 6)

ENTREGABLE_4_ALGORITMO_BANISTER_CROSSFIT.md
  → El modelo Banister adaptado completo (Bloque 7)
  → + El ACWR EWMA adaptado (Bloque 8)

ENTREGABLE_5_PROTOCOLO_AUTOCALIBRACIÓN.md
  → El algoritmo de personalización (Bloque 9)
```

Para cada dato incluido en los entregables, indica:
- **[V]** = Validado por paper peer-reviewed (citar fuente)
- **[C]** = Consenso de la industria (citar fuente: CompTrain, HWPO, etc.)
- **[E]** = Estimado por el investigador (justificar razonamiento)

Los datos marcados [E] son los que VOLTA deberá validar con datos reales de sus atletas.

---

## PAPERS SEMILLA (punto de partida, NO la investigación completa)

Estos papers ya los conocemos. La investigación debe ir MÁS ALLÁ de estos:

1. Mangine & Seay (2022). "Quantifying CrossFit." Frontiers in Sports and Active Living
2. Tibana et al. (2018). "Validity of Session RPE for HIFT." Sports
3. Haddad et al. (2020). "Session RPE Superior to TRIMP for FFT." PubMed
4. Santos-Fernandez et al. (2024). "AMRAP vs EMOM vs RFT." Frontiers in Physiology
5. Gabbett (2016). "Training-injury prevention paradox." BJSM
6. Murray et al. (2017). "EWMA for ACWR." BJSM
7. Busso (2003). "Variable dose-response model." MSSE
8. Claudino et al. (2018). "CrossFit Systematic Review." Sports Medicine Open
9. Klimek et al. (2021). "CrossFit Injuries Meta-Analysis." GJSM
10. Dos Santos et al. (2024). "Physical demands CrossFit scoping review." BMC Sports Science

La investigación debe encontrar papers ADICIONALES que complementen y profundicen estos.
