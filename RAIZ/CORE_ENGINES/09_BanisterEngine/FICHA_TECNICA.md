---
name: Motor Banister (Fitness-Fatigue Model)
description: Modelo de dos curvas exponenciales para calcular el estado fisiológico real del atleta de CrossFit
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #01
---

# Activo #09 — Motor Banister (Fitness-Fatigue Model)

## Categoría
Algoritmo de Valor — UPGRADE del StressEngine existente

## ¿Por qué reemplaza/mejora al ACWR actual?

VOLTA actualmente usa **ACWR** (carga aguda 7 días / carga crónica 28 días).
El Motor Banister es matemáticamente más sofisticado:

| Característica | ACWR (actual) | Banister (propuesto) |
|---------------|---------------|----------------------|
| Modelo | Ratio simple | Dos curvas exponenciales |
| Representa | Spike de carga reciente | Fitness acumulado real |
| Detecta fatiga | Por ratio (>1.3) | Por diferencia curvas |
| Tiempo de decay | Ventanas fijas | Constantes biológicas reales |
| Predicción | Reactiva | Proactiva |

---

## El Modelo

```
Fitness(t)   = Fitness(t-1) × e^(-1/45)  + Carga(t) × k1
Fatiga(t)    = Fatiga(t-1)  × e^(-1/15)  + Carga(t) × k2
Readiness(t) = Fitness(t) - Fatiga(t)
```

- **Fitness**: adaptación positiva — decay lento (~45 días). El entrenamiento de hace 3 semanas aún cuenta.
- **Fatiga**: carga negativa — decay rápido (~15 días). La fatiga de hace 2 semanas casi desapareció.
- **Readiness**: disponibilidad real para rendir HOY.

---

## Adaptación CrossFit

En CrossFit, la "Carga" del día es el **IMR** ya calculado por VOLTA:

```
Carga(t) = IMR_workout  (Reps × Load × Stress_Coefficient)
```

Los parámetros k1 y k2 se calibran para CrossFit:
- **k1 = 1.0** (todos los estímulos generan fitness)
- **k2 = 1.8** (la fatiga se acumula más rápido que el fitness)

### Outputs por deporte
| Estado CrossFit | Readiness | Acción recomendada |
|-----------------|-----------|-------------------|
| Peak performance | 75-100 | WOD completo, intentar PRs |
| Funcional | 50-74 | WOD con escala conservadora |
| Fatiga acumulada | 25-49 | WOD reducido o skill work |
| Sobreentrenado | < 25 | Recuperación activa / descanso |

---

## Ventajas sobre ACWR para CrossFit

1. **No castiga la consistencia**: un atleta que entrena 5x/semana siempre tendrá ACWR elevado aunque esté bien adaptado. Banister lo diferencia.
2. **Detecta el pico de forma**: ACWR solo ve riesgo. Banister indica cuándo el atleta está en su mejor momento.
3. **Memoria fisiológica real**: 6 semanas de descanso bajan el fitness gradualmente, no de golpe.
4. **Modo vacaciones integrado**: el Banister corre pasivo durante pausas (fitness decae, fatiga se limpia → readiness sube artificialmente pero fitness es bajo → activa protocolo de retorno).

---

## Integración con activos existentes

- **Reemplaza**: parte del cálculo en `CORE_ENGINES/01_StressEngine_IMR`
- **Alimenta**: `CORE_ENGINES/04_RecoveryCalculator` (readiness más preciso)
- **Alimenta**: `CORE_ENGINES/10_ReadinessEngineCombined` (base del Modo 1)
- **Alimenta**: `CORE_ENGINES/11_SessionAdaptationEngine` (decisiones de carga)
- **Alimenta**: `UX_FLOWS/03_ColorAlertSystem` (color de la app)

---

## Pregunta para el usuario
¿Quieres que Banister **reemplace** completamente el ACWR, o que **coexistan** (ACWR para injury risk, Banister para readiness)?
