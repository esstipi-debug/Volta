# ACTIVO #14: CompTrain 2026 como Activo de Legitimidad

## Clasificación
- **Tipo:** Ventaja Competitiva (Strategy)
- **Prioridad:** ALTO — es el escudo de credibilidad que cierra la venta sin equipo de ventas
- **Fuente en sistema:** `backend/app/data/training_tenets.json`
- **Referencia externa:** *CompTrain Complete Training Methodology 2025* (Ben Bergeron / Mat Fraser)

---

## Qué es CompTrain y por qué importa

**Ben Bergeron** es el coach de CrossFit más titulado de la historia. Entrenó a Mat Fraser
(5× CrossFit Games Champion), Katrin Davidsdottir (2× champion) y otros atletas de élite.
**CompTrain** es su metodología sistematizada, adoptada por miles de boxes en el mundo.

Cuando VOLTA dice "implementamos CompTrain 2026", no está vendiendo una app.
**Está invocando la autoridad del entrenador más exitoso del deporte.**

---

## Cómo está implementado en el sistema

### Los 3 Tenets (Pilares)

El sistema ancla toda la lógica de periodización a estos tres pilares:

| Tenet | Aplicación deportiva | Impacto en longevidad |
|---|---|---|
| **Strength** | Velocidad & Potencia | Masa magra reduce riesgo metabólico 82% |
| **Conditioning** | Output & Recuperabilidad | Fitness cardiorrespiratorio baja mortalidad 80% |
| **Mobility / ROM** | Prevención de lesiones | Rango de movimiento baja riesgo de lesión 85% |

### Los 9 Attributes (mapeados a PRISMA)

```
Strength Tenet:
  → Absolute Strength    = PRISMA: Fuerza (1RM normalizado por peso)
  → Explosive Power      = PRISMA: Potencia (salto vertical, watts)
  → Muscular Endurance   = PRISMA: Resistencia Muscular

Conditioning Tenet:
  → Aerobic Endurance    = PRISMA: Cardiovascular (VO2Max, 2k Row, FTP)
  → Aerobic Power        = PRISMA: Cardiovascular (optimización VO2Max)
  → Anaerobic Capacity   = PRISMA: Velocidad (work output en sprints)

Mobility Tenet:
  → Flexibility          = PRISMA: Flexibilidad (ROM en squat, overhead)
  → Motor Control        = PRISMA: Coordinación (técnica en levantamientos)
  → Stability            = PRISMA: Equilibrio (pistol, handstand, unilateral)
```

**Resultado clave:** Las 10 dimensiones del PRISMA no son arbitrarias.
Cada una mapea directamente a un Attribute de CompTrain.
Cuando un atleta hace el PRISMA, está siendo evaluado contra el estándar
de Bergeron — no contra un criterio inventado por VOLTA.

### Los 6 Principios de Entrenamiento (hardcoded en la lógica)

```
1. Maximizar retornos del entrenamiento
   → Mínima dosis efectiva, máximo resultado
   → VOLTA implementa: IMR como guardia de volumen excesivo

2. Fitness completo siempre
   → No periodizar un solo aspecto; mejorar Strength + Conditioning + Mobility simultáneamente
   → VOLTA implementa: Distribution Analysis (Artículo III, Carta Magna)

3. Crear simplicidad con estructura
   → Estructura que garantice patrones correctos de estrés
   → VOLTA implementa: ACWR + ciclos de 6 semanas

4. Intensidad intencional
   → No ir al máximo todos los días. Variar: Zone 2, Lactate Threshold, VO2Max, Anaeróbico
   → VOLTA implementa: WorkoutType multipliers (LSD=0.6 a Strength=1.3)

5. Entrenar para más
   → Fitness funcional transferible, no específico de deporte
   → VOLTA implementa: Radar PRISMA de 10 dimensiones (no solo fuerza o solo cardio)

6. Medir, registrar y testear
   → Benchmarks bi-semanales para progresos medibles
   → VOLTA implementa: PRISMA cada 6 semanas + tracking diario de todos los motores
```

### Frecuencias mínimas de entrenamiento

```
CompTrain define:
  Frecuencia: 5 días/semana mínimo
  Estructura semanal:
    Fuerza:       3× por semana (levantar pesado)
    Conditioning: Continuo a lo largo de la semana
    Endurance:    1× por semana (largo y lento)

VOLTA implementa:
  Attendance tracking → alerta si atleta cae <5 días/semana
  Distribution analysis → alerta si balance de Strength vs Conditioning se desvía
```

---

## El Argumento de Venta que Habilita

### Sin este activo:
> "VOLTA usa su propia metodología de periodización."
> Respuesta del coach: *"¿Por qué debería confiar en eso?"*

### Con este activo:
> "VOLTA implementa digitalmente la metodología CompTrain de Ben Bergeron —
>  el sistema que llevó a Mat Fraser a 5 títulos consecutivos del CrossFit Games."
> Respuesta del coach: *"Cuéntame más."*

**La diferencia es la credibilidad prestada.** VOLTA no necesita convencer
al coach de que su metodología es válida. Bergeron ya lo hizo.

---

## Valor en Cada Segmento

### Para el Coach:
- No necesita aprender una nueva metodología
- VOLTA implementa lo que ya conoce, pero con datos
- "No estoy adoptando una app rara. Estoy implementando CompTrain con métricas."

### Para el Atleta:
- "Entreno con la metodología de Mat Fraser"
- Es aspiracional. Es compartible. Es identidad.

### Para el Dueño del Box:
- "Mi box usa CompTrain + datos" es diferenciador vs. boxes sin metodología clara
- Es argumento de retención ante atletas que quieren seriedad

### Para Prensa / Inversores:
- "Somos la capa de datos sobre la metodología de entrenamiento más validada del CrossFit"
- No es opinión. Es evidencia de 5 títulos consecutivos de Games.

---

## Mapa de Dependencias en el Sistema

```
training_tenets.json
        │
        ├── RadarCalculator_PRISMA (07)
        │     └── Cada dimensión mapea a un Attribute de CompTrain
        │
        ├── Carta Magna (Artículo II — El Dogma)
        │     └── "CompTrain 2026 es la Constitución"
        │
        ├── Dashboard del Atleta
        │     └── Contexto de ciclo: "Estamos en Semana 2 de Acumulación"
        │
        └── Coach Intelligence (Año 2)
              └── Recomendaciones basadas en desviación del estándar CompTrain
```

---

## Riesgos y Mitigaciones

| Riesgo | Mitigación |
|---|---|
| CompTrain cambia metodología en 2027+ | Versionar el JSON. La v2026 sigue siendo válida como baseline histórico. |
| Disputa de licencia o uso del nombre | Usar como referencia académica, no como endorsement oficial. Evitar "powered by CompTrain" sin acuerdo. |
| Bergeron lanza su propia app de datos | Posicionarse como complemento técnico, no como competidor de metodología. |

---

## Requisitos para Migración/Adaptación

1. **Preservar `training_tenets.json` intacto** — es la fuente de verdad metodológica
2. **Mantener el mapeo PRISMA ↔ CompTrain Attributes** — es lo que valida el test
3. **En comunicación de marca:** referenciar CompTrain explícitamente en onboarding,
   landing page y materiales de coach
4. **Versionar el JSON** cuando CompTrain actualice su metodología
5. **Explorar acuerdo formal con CompTrain** en Año 2 (co-marketing, endorsement)
   — potencial de credibilidad exponencial si se formaliza
6. **Nunca desacoplar el ciclo de 6 semanas de CompTrain** — es lo que da estructura
   al PRISMA, al ACWR y a toda la narrativa de "película completa"
