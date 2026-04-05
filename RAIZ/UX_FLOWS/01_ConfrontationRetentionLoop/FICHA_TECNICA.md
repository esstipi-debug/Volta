# ACTIVO #12: Flujo de Retención por Confrontación de Datos

## Clasificación
- **Tipo:** Patrón de UX (UX Flow)
- **Prioridad:** ALTO — mecanismo de engagement diferenciador vs. apps de fitness genéricas
- **Estado actual:** Lógica funcional implementada. Visual: REQUIERE REDISEÑO para viralidad.

---

## ESTADO ACTUAL (v1 — funcional, no viral)

### Trigger → Confrontación → Responsabilidad

```
1. TRIGGER AUTOMÁTICO
   Condiciones que activan el flujo:
   → ACWR > 1.3 sostenido 5+ días
   → RHR +6bpm sobre baseline personal
   → Asistencia < 60% en las últimas 3 semanas
   → Scaling > 90% Rx con señal de degradación técnica

2. CONFRONTACIÓN CONTEXTUAL
   Card en el dashboard con:
   → El dato específico que disparó la alerta
   → Correlación histórica ("atletas con este patrón...")
   → Consecuencia probable si no actúa
   → Un paso de acción concreto

3. LOOP DE RESPONSABILIDAD
   El atleta puede: Aceptar la recomendación / Ignorarla
   Si ignora → el sistema lo registra
   Si luego se lesiona → el historial muestra que fue advertido
```

**Problema del v1:** El sistema funciona lógicamente pero es un card de texto en un dashboard.
No es visualmente impactante. No es compartible. No genera conversación fuera de la app.

---

## VERSIÓN MEJORADA (v2 — Visual + Viral)

### MODIFICACIÓN 1: "BODY REPORT" — La Tarjeta Semanal Compartible

Inspirado en Spotify Wrapped. Cada lunes, el atleta recibe un resumen visual
de su semana en formato de tarjeta diseñada, lista para compartir en Instagram Stories.

```
┌─────────────────────────────────┐
│  ⚡ TU SEMANA EN VOLTA        │
│  Carlos Rodríguez | Semana 12   │
│                                 │
│  ACWR:     ████░░  1.12 🟢      │
│  Readiness: ████████  82/100    │
│  WODs:     5 de 5 completados   │
│  IMR Total: 1,847 pts           │
│                                 │
│  MEJOR MOMENTO:                 │
│  Squat 1RM → 105kg (+8kg ↑)    │
│                                 │
│  ALERTA EVITADA:                │
│  Bajaste intensidad el jueves   │
│  cuando tu RHR subió 7bpm.      │
│  Probable lesión: evitada.      │
│                                 │
│  [VOLTA.APP]  Semana 12/52   │
└─────────────────────────────────┘
```

**Elemento viral:** "Probable lesión: evitada." → El atleta comparte esto.
Su comunidad pregunta "¿qué app es esa?" → adquisición orgánica.


### MODIFICACIÓN 2: "INJURY AVOIDED BADGE" — El Momento de Orgullo

Cuando el sistema detecta que el atleta SIGUIÓ la recomendación y evitó sobreentrenamiento,
genera un badge especial.

```
┌────────────────────────────────┐
│          🛡️  ESCUDO             │
│                                │
│    LESIÓN EVITADA #3           │
│                                │
│  Tu ACWR llegó a 1.48.         │
│  Bajaste la intensidad.        │
│  Tu RHR volvió a baseline      │
│  en 4 días.                    │
│                                │
│  Los datos funcionaron.        │
│  Tu cuerpo te lo agradece.     │
│                                │
│  ─────────────────────         │
│  3 lesiones evitadas este año  │
│  Atletas similares: 1 lesión   │
│  promedio en 12 semanas        │
└────────────────────────────────┘
```

**Elemento viral:** Contar lesiones evitadas (no solo las sufridas) es un ángulo
único en fitness. Nadie más lo hace.


### MODIFICACIÓN 3: "PRISMA EVOLUTION" — El Radar Antes/Después Compartible

Al finalizar cada ciclo de 6 semanas, el sistema genera una imagen de dos radares
superpuestos: el del inicio vs. el actual. Con una frase generada automáticamente.

```
        CICLO 1 → CICLO 2
        Semanas 1-6 vs 7-12

    [Radar Inicio]  →  [Radar Ahora]

    Lo que cambió:
    ↑ Fuerza:      65 → 71  (+9%)
    ↑ Cardio:      78 → 82  (+5%)
    ↑ Potencia:    72 → 76  (+5%)
    ⚠ Flexibilidad: 45 → 48  (sigue siendo tu debilidad)

    "Mejoraste en todo.
     Pero la movilidad sigue
     siendo tu techo de cristal."

    [Compartir] [Ver plan próximo ciclo]
```

**Elemento viral:** El radar visual es inmediatamente legible. La frase honesta
("sigue siendo tu debilidad") genera más engagement que el halago puro.


### MODIFICACIÓN 4: "CONFRONTATION CARD" — Rediseño del Alert Visual

El card de confrontación actual es texto plano. En v2:

```
┌──────────────────────────────────────┐
│  🔴  ALERTA DE CARGA                 │
│                                      │
│  Tu ACWR llegó a 1.48               │
│                                      │
│  ████████████████░░░░  74%           │
│  Zona de riesgo                      │
│                                      │
│  En atletas con este patrón:         │
│  → 68% tuvo lesión en <2 semanas    │
│  → Zona de mayor riesgo: hombros    │
│                                      │
│  LO QUE RECOMENDAMOS HOY:           │
│  Volumen -40% · Intensidad -30%     │
│  Prioriza movilidad                  │
│                                      │
│  ┌──────────┐  ┌──────────────────┐ │
│  │  ACEPTO  │  │  IGNORAR (riesgo)│ │
│  └──────────┘  └──────────────────┘ │
│                                      │
│  * Si ignoras, queda registrado.     │
└──────────────────────────────────────┘
```

**Elemento de retención:** El botón "Ignorar (riesgo)" con advertencia activa
el efecto de responsabilidad. El atleta piensa dos veces antes de hacer clic.


### MODIFICACIÓN 5: "VOLTA WRAPPED" — Resumen Anual

Al cumplir 12 semanas / 6 meses / 1 año:
Una secuencia de 5-7 slides animadas (formato Stories) que cuentan la historia
del atleta con sus propios datos:

```
Slide 1: "Tu año en VOLTA"
Slide 2: "Entrenaste X días. Eso es X% de tu año."
Slide 3: "Tu mayor PR: Squat X→Xkg (+X%)"
Slide 4: "Lesiones evitadas: 4 alertas seguidas = 0 lesiones"
Slide 5: "Tu debilidad que más mejoró: Flexibilidad +18%"
Slide 6: "Tu ACWR promedio: 1.08 — dentro de zona verde X% del tiempo"
Slide 7: "El próximo año, ¿qué vas a atacar?"
```

**Elemento viral:** Exactamente el modelo Spotify Wrapped.
Cada atleta lo comparte. Cada share es publicidad gratuita.

---

## Mecánica de Viralidad Integrada

| Momento | Acción del sistema | Potencial viral |
|---|---|---|
| Lunes AM | Genera Body Report semanal | Compartible en Stories |
| Fin de ciclo 6 semanas | Genera PRISMA Evolution | Antes/Después siempre viral |
| Lesión evitada | Genera Injury Avoided Badge | Ángulo único en fitness |
| ACWR crítico | Confrontation Card rediseñada | Retención (no viral) |
| Aniversario | VOLTA Wrapped | Viral masivo |
| PR nuevo | PR Card automática | Celebración compartible |

---

## Requisitos para migración/adaptación

### Lógica (conservar del v1)
1. Preservar los 4 triggers automáticos (ACWR, RHR, asistencia, scaling)
2. Preservar el registro de "alerta ignorada" — es la base del loop de responsabilidad
3. Preservar la correlación histórica ("atletas similares...")

### Nuevo en v2 (diseño + desarrollo)
1. **Sistema de generación de imágenes:** Las tarjetas compartibles requieren
   un generador de imágenes server-side (Canvas API / Puppeteer / similar)
2. **Templates de tarjetas:** Diseño de 6 templates (Body Report, Injury Badge,
   PRISMA Evolution, Confrontation Card, PR Card, Wrapped)
3. **Share nativo:** Integración con Web Share API para iOS/Android
4. **Animaciones:** El PRISMA Evolution y el Wrapped requieren animación
   (Lottie o CSS animations)
5. **Personalización mínima:** Nombre del atleta, colores del box (white-label)
6. **UTM tracking en shares:** Cada tarjeta compartida lleva UTM para medir
   cuánta adquisición viene de viralidad

### Prioridad de implementación
```
Alta:    Body Report semanal + PR Card (retención inmediata)
Media:   PRISMA Evolution + Injury Badge (engagement ciclo largo)
Futura:  VOLTA Wrapped (requiere 6+ meses de datos)
```
