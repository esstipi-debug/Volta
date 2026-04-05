---
name: Pulse Engine (Desafíos de Box / Team Challenges)
description: Motor de retos colectivos entre atletas de un mismo box CrossFit para aumentar retención y engagement
type: UX_FLOW
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #06
---

# Activo #04 — Pulse Engine

## Categoría
Retención / Viralidad — Feature Social

## El Concepto

CrossFit ya tiene la mejor retención del fitness precisamente por la comunidad.
El Pulse Engine digitaliza esa comunidad dentro de VOLTA.

> "No compites contra el WOD. Compites contra tu box."

---

## Tipos de Desafíos

### 1. Desafío de Consistencia (el más valioso para retención)
```
🏅 RETO DE MARZO — Box Quinto Elemento

"30 WODs en 30 días"
Participantes: 18 atletas
Progreso del box: ████████░░  68%

Tu posición: 12/18
Tu progreso: 22/30 WODs ✅

Top 3 del box:
🥇 Ana López       — 28 WODs
🥈 Carlos Mesa     — 27 WODs
🥉 María García    — 26 WODs
```

### 2. Desafío de Volumen Colectivo
```
📦 RETO SEMANAL — Box

"5,000 pull-ups entre todos esta semana"
Total: ████████████░  4,237 / 5,000

Cada WOD con pull-ups que registres suma al contador.
Faltan 763. ¿Te sumas?
```

### 3. Benchmark Challenge (CrossFit específico)
```
🎯 BENCHMARK DEL MES — Fran

Mejor tiempo del box en ABRIL:
🥇 Pedro Ruiz     — 2:47
🥈 Lucía Torres   — 3:12
🥉 Juan Pérez     — 3:31

Tu mejor tiempo: 4:05  (posición 8/18)
→ "Mejora 34 segundos para entrar al top 5"
```

### 4. Streak Challenge (Racha Colectiva)
```
🔥 RACHA DEL BOX

Todos los atletas con racha activa de 7+ días: 7 atletas
¿Puedes unirte? Tu racha actual: 4 días

Si 10 atletas alcanzan 7 días → El coach activa: [Premio del coach]
```

---

## El Rol del Coach en el Pulse Engine

El coach crea y gestiona los desafíos del box:
- Define el tipo de reto, duración y meta
- Añade un premio opcional ("El ganador elige el WOD del viernes")
- Ve el dashboard de participación
- Recibe notificación cuando el box está cerca de la meta colectiva

---

## Mecánicas de Engagement

### Feed de actividad del box
```
Hoy en tu box:
• Ana López completó "Murph" — WOD de hoy ✅
• Carlos Mesa logró PR en Deadlift: 180kg 🎯
• 3 atletas completaron el Benchmark de Fran
• El box lleva 4 días de racha colectiva 🔥
```

No es red social completa — solo actividad de entrenamiento.
Sin comentarios (fricción), solo "👊" reactions.

### Notificación de contexto social
```
"Juan te lleva 3 WODs en el reto de marzo.
¿Entrenarás hoy?"
```

---

## ¿Por qué funciona en CrossFit específicamente?

1. **La comunidad YA existe** — VOLTA la estructura, no la inventa
2. **Los coaches YA hacen retos manuales** (pizarrón del box) — VOLTA lo automatiza
3. **Accountability social** es el principal driver de retención en CrossFit
4. **El coach necesita engagement de los atletas** — el Pulse Engine le da herramientas

---

## Modelo de Negocio

| Feature | Plan Atleta | Plan Coach |
|---------|-------------|------------|
| Ver desafíos del box | ✅ | ✅ |
| Participar en desafíos | ✅ | ✅ |
| Crear desafíos | ❌ | ✅ |
| Feed de actividad | ✅ básico | ✅ completo |
| Estadísticas de participación | ❌ | ✅ |

El Pulse Engine refuerza por qué el **coach paga** — tiene tools que el atleta no puede tener solo.

---

## Integración con activos VOLTA

- **Consume**: registros de WOD de todos los atletas del box
- **Alimenta**: métricas de adherencia → `CORE_ENGINES/14_SmartCoachAlerts`
- **Alimenta**: sistema de gamificación → `UX_FLOWS/02_GamificationSystem` (cuando esté definido)
- **Relacionado con**: `STRATEGY/03_CoachAthleteModel` (valor del plan coach)
