---
name: Smart Coach Alerts (Alertas Proactivas al Coach)
description: Sistema de alertas inteligentes que notifica al coach CrossFit sobre atletas que necesitan atención antes de que el problema escale
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #13
---

# Activo #14 — Smart Coach Alerts

## Categoría
Lógica de Negocio + Retención B2B — Diferenciador para el Coach

## ¿Qué hace?

El coach no puede monitorear manualmente 20-30 atletas diario.
VOLTA hace el monitoreo por él y solo le interrumpe cuando algo realmente importa.

> "Tu trabajo es coaching, no vigilar dashboards."

---

## Tipos de Alertas CrossFit

### Alertas de Lesión / Overtraining
| Condición | Alerta al Coach |
|-----------|----------------|
| ACWR > 1.5 por 3 días seguidos | 🔴 "Juan lleva 3 días con carga peligrosa" |
| Readiness < 40 + se presentó al WOD | 🔴 "Ana entrenó con readiness 32 — monitorear" |
| 5+ días consecutivos sin descanso | 🟠 "Carlos no ha descansado en 5 días" |
| Push/Pull ratio < 0.6 (28 días) | 🟠 "Pedro tiene desequilibrio hombro crónico" |
| RPE reportado > 9 por 3 sesiones | 🟡 "Lucía reporta esfuerzo muy alto consistentemente" |

### Alertas de Performance
| Condición | Alerta al Coach |
|-----------|----------------|
| Banister Readiness > 85 por 3 días | ✅ "María está en peak de forma — semana para PRs" |
| Mejora de 10%+ en movimiento clave | ✅ "Sofía mejoró su Fran 15% este mes" |
| Atleta no hace PR en > 45 días | 🟡 "Pedro estancado — considerar test de 1RM" |

### Alertas de Retención (Comportamiento)
| Condición | Alerta al Coach |
|-----------|----------------|
| Atleta no registra WOD en 5+ días | 🟡 "Juan sin actividad — posible abandono" |
| Atleta nuevo sin completar onboarding | 🟡 "Ana registrada hace 3 días, sin baseline" |
| Atleta reduce frecuencia > 30% vs mes anterior | 🟡 "Carlos bajó de 4x/sem a 1x/sem" |

---

## Interface del Coach — Panel de Alertas

```
📋 ALERTAS HOY — Martes 27 Marzo

🔴 URGENTE (2)
  • Juan Pérez — ACWR 1.73 | Readiness 31
    → Recomendar descanso hoy
  • Ana López — 5 días consecutivos entrenando
    → Hablar en el box hoy

🟠 PRECAUCIÓN (1)
  • Carlos Mesa — Push/Pull 0.58 últimos 28 días
    → Semana de dominadas/remo

✅ BUENAS NOTICIAS (1)
  • María García — Readiness 89 | Peak de forma
    → Ideal para intentar PR esta semana

🟡 RETENCIÓN (1)
  • Pedro Ruiz — 6 días sin actividad
    → Enviar mensaje de check-in
```

---

## Modo de Notificación

El coach configura cómo quiere recibir las alertas:
- **Push notification** en la app (activo por defecto)
- **Resumen diario** (6 AM) — solo un push por día con todas las alertas
- **Solo urgentes** — solo alerta 🔴
- **Silencio** — ve alertas en el panel cuando entra

---

## Valor diferencial para el modelo de negocio

Este activo justifica el **cobro al coach** más que cualquier otro:

1. **Sin VOLTA**: el coach detecta el problema cuando el atleta ya se lesionó o ya abandonó
2. **Con VOLTA**: el coach interviene a tiempo, retiene al atleta, previene la lesión
3. **El coach ve ROI directo**: retención de atletas = ingreso sostenido para el box
4. **Diferenciador vs competencia**: SugarWOD y BeyondTheWhiteboard no tienen alertas proactivas de readiness

---

## Integración con activos VOLTA

- **Consume**: `CORE_ENGINES/09_BanisterEngine` (readiness de cada atleta)
- **Consume**: `CORE_ENGINES/01_StressEngine_IMR` (ACWR, carga aguda)
- **Consume**: `CORE_ENGINES/12_MuscularBalanceEngine` (desequilibrios crónicos)
- **Consume**: comportamiento de registro (días sin actividad)
- **Se muestra en**: Panel del coach — sección "Alertas"
- **Complementa**: `STRATEGY/03_CoachAthleteModel` (propuesta de valor B2B)
