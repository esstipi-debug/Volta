---
name: Banister Readiness Engine (Fitness-Fatigue + Lifestyle)
description: Modelo de dos curvas exponenciales para readiness del atleta de CrossFit + modo lifestyle integrado
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
fecha: 2026-03-27
---

# Activo #09 — Banister Readiness Engine

**FUSIÓN DE ACTIVOS 09 + 10**

El Motor Banister calcula readiness con precisión matemática. El Readiness Engine Combinado añade un toggle de modo (Banister solo vs Banister + lifestyle). Ambos son inseparables — el toggle es una feature del motor, no un motor separado.

---

## Clasificación

- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** CRÍTICO — principal mecanismo de readiness para Color Alert
- **Estado actual:** Propuesto (diseñado pero no implementado)
- **Función:** Calcular estado fisiológico real del atleta de CrossFit

---

## Parte 1 — El Modelo Banister

### Fórmula base (dos curvas exponenciales)

```
Fitness(t)   = Fitness(t-1) × e^(-1/τ_fitness) + Carga(t) × k_fitness
Fatiga(t)    = Fatiga(t-1) × e^(-1/τ_fatiga) + Carga(t) × k_fatiga
Readiness(t) = Fitness(t) - Fatiga(t)
```

### Constantes de decay (τ) — Adaptadas a CrossFit

Para VOLTA usamos **4 curvas simultáneamente**, una por vector de estrés:

| Vector | τ_fitness | τ_fatiga | k_fitness | k_fatiga | Significado |
|--------|-----------|----------|-----------|----------|------------|
| **MEC** (Muscular) | 18 días | 3 días | 0.08 | 0.12 | DOMS, regeneración lenta |
| **SNC** (Nervioso) | 8 días | 3 días | 0.10 | 0.15 | Recuperación nerviosa rápida |
| **MET** (Metabólico) | 4 días | 2 días | 0.12 | 0.18 | Lactato claro rápido |
| **ART** (Articular) | 30 días | 21 días | 0.05 | 0.08 | Adaptación lenta, decoy muy lento |

### ¿Por qué 4 curvas?

CrossFit es **multimodal**. Un WOD puede dañar músculos (MEC) pero dejar el SNC fresco, o viceversa. Un readiness de "70" que viene de estar fresco nerviosamente pero destrozado musculares es diferente a "70" donde está todo en equilibrio.

**Resultado final:** 4 readiness scores (uno por vector) que se combinan en un score único 0-100.

```
Readiness_FINAL = (MEC + SNC + MET + ART) / 4
```

### Ejemplo visual

```
Día 30 tras registrar WOD intenso de snatch:

MEC Fitness: 52  | MEC Fatiga: 38  → MEC_readiness = 14  (destrozado)
SNC Fitness: 68  | SNC Fatiga: 15  → SNC_readiness = 53  (fresco)
MET Fitness: 70  | MET Fatiga: 8   → MET_readiness = 62  (recuperado)
ART Fitness: 45  | ART Fatiga: 42  → ART_readiness = 3   (articular inflamado)

Readiness promedio = (14 + 53 + 62 + 3) / 4 = 33 → 🔴 DÍA ROJO

Recomendación: Descanso de hombro/muñeca. Si entrenas, solo ciclismo.
```

### Comparativa: ACWR vs Banister

| Métrica | ACWR (actual) | Banister (propuesto) |
|---------|---------------|----------------------|
| Detecta fatiga aguda | ✅ Excelente | ✅ Excelente |
| Detecta fatiga crónica | ⚠️ Mediocre | ✅ Excelente |
| Predice forma 2 semanas después | ❌ No | ✅ Sí |
| Diferencia vectores MEC/SNC | ❌ No | ✅ Sí |
| Complejidad implementación | ✅ Baja | ⚠️ Media |

**Decisión:** Banister reemplaza ACWR como motor principal. ACWR se mantiene como "safety check" (si ACWR > 1.5, alerta roja incluso si Banister dice "verde").

---

## Parte 2 — Dos Modos de Operación

### Modo 1 — Banister Solo (Fricción 0)

```
Input:     Solo los WODs completados (automático)
Output:    Readiness score 0-100 basado en fitness/fatiga
Fricción:  Cero — el atleta no hace nada extra
Precisión: Media (±15%)
Latencia:  Inmediata
```

**Ideal para:**
- Atletas nuevos (primeros 30 días)
- Atletas RX que solo registran WODs
- Usuarios de prueba (no quieren entry forms)

**Ejemplo de output:**
> "Tu readiness hoy es **73** — tu entrenamiento de los últimos días te tiene bien adaptado."

### Modo 2 — Banister + Lifestyle (Fricción baja)

Se activa después de 30 días. App sugiere: "Mejora tu readiness en 3 segundos. Completa estos datos opcionales."

```
Input:     WODs + 3 preguntas (30 segundos):
           1. "¿Cuántas horas dormiste anoche?" (slider 4-10)
           2. "¿Tu estrés hoy?" (1-5)
           3. "¿Molestias/soreness?" (1-5)
Output:    Readiness ajustado + factores cualitativos
Fricción:  Muy baja (3 preguntas, sin cálculos)
Precisión: Alta (±8%)
Latencia:  1 segundo (cálculo simple)
```

**Ajustes aplicados:**
- Sueño <6h: ×1.5 multiplicador fatiga
- Sueño >9h: ×1.2 multiplicador fitness
- Estrés 4-5: ×1.3 multiplicador fatiga
- Soreness alto: reduce readiness MEC 15%

**Ejemplo de output Modo 2:**
> "Tu readiness es **61** hoy (bajó de 73 ayer porque dormiste 5.5h).
> Si duermes bien hoy, mañana vuelves a 72.
> Recomendación: WOD escalado hoy."

### Lógica de transición

```
Día 1-30:   Modo 1 (Banister solo)
              ↓
Día 31:     App sugiere: "¿Te gustaría mejorar la precisión?
              Añade 3 datos sobre sueño/estrés cada día (30s)."
              ↓
            Si usuario dice SÍ → Modo 2
            Si usuario dice NO → Sigue en Modo 1 indefinidamente
```

**No es forzado.** El atleta elige. Si no quiere friccción, funciona sin ella.

---

## Integración con VOLTA

- **Consume**: `CORE_ENGINES/01_StressEngine_IMR` (carga del WOD)
- **Consume**: `CORE_ENGINES/04_RecoveryCalculator` (tiempos de decay por vector)
- **Alimenta**: `CORE_ENGINES/02_ACWR_InjuryPrevention_System` (safety check)
- **Alimenta**: `UX_FLOWS/03_ColorAlertSystem` (color del día)
- **Alimenta**: `CORE_ENGINES/11_SessionAdaptationEngine` (adaptación de WOD)
- **Alimenta**: `UX_FLOWS/02_GamificationSystem` (bonus por entrenar en día verde)

---

## Especificación técnica

### Entrada Modo 1 (automática)

```
{
  athlete_id: UUID,
  workout_data: [
    {
      date: ISO8601,
      imr_total: float,
      imr_breakdown: { MEC, SNC, MET, ART }
    }
  ]
}
```

### Entrada Modo 2 (opcional, user-provided)

```
{
  athlete_id: UUID,
  lifestyle_data: {
    sleep_hours: float (4-10),
    stress_level: 1-5,
    soreness_level: 1-5,
    timestamp: ISO8601
  }
}
```

### Salida (diaria)

```
{
  readiness_score: 0-100,
  readiness_by_vector: { MEC, SNC, MET, ART },
  trend_7d: float (-20 a +20),
  recommendation: string,
  mode: "mode1" | "mode2",
  timestamp: ISO8601
}
```

---

## MVP — Mes 1-2

- ✅ Banister 4-curva base
- ✅ Cálculo readiness diario
- ✅ Modo 1 funcional (sin lifestyle)
- ⚠️ Modo 2 (stub — aceptar inputs pero no aplicar ajustes)

## V2 — Mes 3+

- ✅ Modo 2 completo con ajustes lifestyle
- ✅ HRV integration (si atleta tiene smartwatch)
- ✅ Predicción de forma 2 semanas
- ✅ ML para ajuste de constantes τ por atleta

---

## Referencias

- Banister original: Banister (1991) "Modeling elite athletic performance"
- Adaptación CrossFit: Investigación propia VOLTA
- Modo lifestyle: Diseño VOLTA para reducir fricción
