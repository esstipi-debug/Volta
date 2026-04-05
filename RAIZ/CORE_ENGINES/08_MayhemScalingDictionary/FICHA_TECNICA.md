# ACTIVO #16: Diccionario de Escalado Mayhem — Árbol de Sustitución de Movimientos

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine) — componente de datos del Motor #06
- **Prioridad:** ALTO — es el IP metodológico que hace que el MovementEscalationEngine tenga valor real
- **Estado actual:** Implementado en `movement_mappings.json`. Cobertura parcial (~25 movimientos).
- **Fuente:** Mayhem Athlete Scaling Doc (Ben Bergeron / Rich Froning methodology)

> **Distinción con Activo #06:**
> El #06 (MovementEscalationEngine) es el MOTOR — la lógica que decide cuándo y cómo escalar.
> Este activo #16 es el DICCIONARIO — los árboles de sustitución que el motor consulta.
> Son independientes: el motor puede actualizarse sin tocar el diccionario y viceversa.

---

## Inventario Actual del Diccionario

### GIMNASIA (7 movimientos catalogados)

| Movimiento Rx | Opciones de Escala | Criterio de Preservación |
|---|---|---|
| **Handstand Walk** (100ft) | Ski 20/16cal · 15 HSPU · Bear Crawl 100ft · 6 Wall Walks · 40 HS Shoulder Taps · 1min HS Hold · 20 DB Strict Press | Empuje de hombros + carga invertida |
| **Rope Climb** (1 a 15ft) | 3-4 T2B · 3 Strict Pull-Ups · 25ft Sled Pull · 4-5 Strict K2E | Pulling vertical + agarre |
| **Legless Rope Climb** (1 a 15ft) | 4 Strict Pull-Ups · 25ft Sled Pull | Pulling sin asistencia de piernas |
| **Toes-to-Bar** (10 reps) | 12 GHD Sit-Ups · 14 V-Ups · 16 Alt V-Ups · 20 Abmat Sit-Ups · 10 Weighted Abmat | Core + hip flexion |
| **GHD Sit-Ups** (10 reps) | 8 T2B · 12 V-Ups · 14 Alt V-Ups · 16 Abmat Sit-Ups | Core + extensión de cadera |
| **Ring Muscle-Up** (1 rep) | Bar Muscle-Up · Burpee Pull-Up · 2 Pull-Ups | Transición pulling → pushing |
| **Pull-Up** (10 reps kipping) | Banded Pull-Ups · Jumping Pull-Ups · 5 Strict · 15 Ring Rows · 15 Body Rows | Pulling vertical |
| **Parallette HSPU** (1 rep) | Deficit HSPU 6"/4" · Strict HSPU · 2 HSPU estándar | Rango de movimiento en press |

### HALTEROFILIA (7 movimientos catalogados)

| Movimiento Rx | Opciones de Escala | Criterio de Preservación |
|---|---|---|
| **Squat Snatch** (135/95 lbs) | Power Snatch (mismo peso) · Overhead Squat (mismo peso) | Patrón técnico olímpico |
| **Power Clean** (185/115 lbs) | Sandbag equivalente 150/100 · Reducción a 115/80 | Extensión de cadera explosiva |
| **Front Squat** (135/95 lbs) | Sandbag 150/100 · Sandbag 100/70 | Carga frontal + profundidad |
| **Back Squat** | Sin opciones definidas actualmente | — |
| **Deadlift** | Sin opciones definidas actualmente | — |
| **Bench Press** | Sin opciones definidas actualmente | — |
| **Overhead Press** | Sin opciones definidas actualmente | — |

### METABÓLICO (2 movimientos catalogados)

| Movimiento | Opciones de Escala |
|---|---|
| **Double Unders** (50 reps) | 75 DU · 150 Single Unders |
| **Burpees** | Sin opciones definidas actualmente |

### PESOS Y ARRASTRES (4 movimientos catalogados)

| Movimiento | Opciones de Escala | Criterio |
|---|---|---|
| **Sled Push** (100ft @ 190/145) | Front Rack Lunge 50ft · Back Rack Lunge · Carry frontal · Sandbag carry · 15/12 Assault Cal | Empuje horizontal + carga |
| **Sled Pull** (190/145 lbs) | 5 Strict Pull-Ups · 1 Legless Rope Climb · 2 Rope Climbs · Farmers Carry | Pulling + grip |
| **Sled Drag** | Sandbag carry inverso · Arrastre con lastre improvisado | Resistencia posterior |
| **Shuttle Runs** (10 × 50ft) | 500m Bike Erg · 250m Row/Ski · 15/12 Assault Cal · 10/12 Echo Cal | Capacidad aeróbica + cambios de dirección |

### MONOSTRUCTURAL (6 máquinas catalogadas)

| Máquina | Coeficiente | Sistema de conversión |
|---|---|---|
| Row | 0.70 | Ver `cardio_conversions.json` |
| Bike Erg | 0.70 | Ver `cardio_conversions.json` |
| Ski Erg | 0.70 | Ver `cardio_conversions.json` |
| Assault Bike | 0.70 | Ver `cardio_conversions.json` |
| Echo Bike | 0.65 | Ver `cardio_conversions.json` |
| Run | 0.75 | Ver `cardio_conversions.json` |

---

## Brechas Críticas Identificadas

### Movimientos sin opciones de escala (deuda técnica urgente)

```
Halterofilia sin escala definida:
  ❌ Back Squat
  ❌ Deadlift
  ❌ Bench Press
  ❌ Overhead Press
  ❌ Clean & Jerk (no existe en catálogo)
  ❌ Hang Power Snatch
  ❌ Thruster (movimiento más común en CrossFit)

Gimnasia sin escala definida:
  ❌ Bar Muscle-Up
  ❌ Strict HSPU (diferente de kipping)
  ❌ Pistol Squat
  ❌ Handstand Hold
  ❌ Box Jump

Metabólico sin escala definida:
  ❌ Burpees
  ❌ Wall Balls
  ❌ Kettlebell Swing
  ❌ Box Step-Up
```

**Impacto:** El motor de escalado actual solo puede prescribir con precisión para
~25 movimientos. Un WOD que incluya Thruster (Fran) o Wall Ball no tiene árbol
de sustitución definido — el sistema falla silenciosamente.

---

## Principio de Preservación del Estímulo

El valor del diccionario Mayhem no está en las sustituciones en sí,
sino en el **criterio biomecánico** detrás de cada opción:

```
REGLA 1: Preservar el plano de movimiento
  Pull-up → Ring Row (ambos pulling vertical)
  NO: Pull-up → Push-up (plano opuesto, pierde el estímulo)

REGLA 2: Preservar el patrón motor dominante
  Squat Snatch → Power Snatch (pierde el squat, mantiene el pull explosivo)
  NO: Squat Snatch → Deadlift (pierde la explosión olímpica)

REGLA 3: Preservar la demanda energética proporcional
  Rope Climb → Sled Pull (ambos pulling de alta intensidad)
  La escala debe generar estrés SIMILAR al original (mismo IMR aproximado)

REGLA 4: La escala más conservadora preserva el músculo, no el movimiento
  Ring Muscle-Up → Burpee Pull-Up (accesible pero preserva pulling + pushing)
  En nivel Beginner, el objetivo es el músculo, no la habilidad
```

---

## Estructura de Expansión Recomendada (v2)

```json
{
  "thruster": {
    "rx_unit": "95/65 lbs",
    "stress_coefficient": 1.15,
    "stimulus": "full_body_explosive_conditioning",
    "primary_pattern": "squat_to_press",
    "scaling_options": [
      {
        "level": 1,
        "option": "DB Thruster 50/35 lbs",
        "preserves": "patrón completo, reduce carga"
      },
      {
        "level": 2,
        "option": "Front Squat + Push Press separados",
        "preserves": "ambos patrones, elimina coordinación compleja"
      },
      {
        "level": 3,
        "option": "Goblet Squat + Strict Press",
        "preserves": "patrones individuales, accesible para principiantes"
      }
    ]
  }
}
```

---

## Valor Estratégico

1. **30+ movimientos × múltiples opciones = biblioteca propietaria**
   Replicar esto con criterio biomecánico correcto toma meses de trabajo editorial

2. **Basado en Mayhem Athlete** — la misma fuente metodológica de Rich Froning
   Credibilidad heredada igual que CompTrain para la periodización

3. **Diferencia a VOLTA de apps genéricas**
   Cualquier app puede decir "escala". Solo VOLTA dice exactamente *a qué y por qué*

4. **Alimenta la narrativa de la Carta Magna**
   "El sistema no te dice 'escala'. Te dice: 'Haz Legless Rope Climb en lugar de Rope Climb
   porque tu ACWR está en 1.4 y necesitas preservar el estímulo de pulling sin añadir
   carga al sistema nervioso central'"

---

## Requisitos para Migración/Adaptación

1. **Completar el diccionario hasta 80+ movimientos** antes de lanzamiento
   Prioridad: Thruster, Wall Ball, KB Swing, Bar Muscle-Up, Box Jump, Clean & Jerk

2. **Agregar campo `stimulus`** por movimiento — el sistema debe explicar qué estímulo preserva

3. **Agregar niveles numerados (1-4)** en lugar de lista plana
   (actualmente es array sin jerarquía — el motor no sabe cuál es más conservador)

4. **Mantener separado de `movement_catalog.json`**
   El catálogo define coeficientes; el diccionario de escalado define sustituciones

5. **Agregar criterio de selección** por nivel de atleta (training age, historial de lesiones)

6. **Versionar con Mayhem** — la metodología de Mayhem puede actualizarse anualmente
