---
name: Auditoría y Reorganización RAIZ — 2026-03-27
description: Consolidación de activos redundantes y reordenamiento de prioridades
tipo: META
---

# Auditoría y Reorganización RAIZ

**Fecha:** 2026-03-27
**Estado anterior:** 26 activos
**Estado actual:** 23 activos (-3 fusiones)
**Cambios críticos:** 3 fusiones + 2 movimientos a V2

---

## ✅ FUSIONES REALIZADAS

### Fusión 1: ACWR Calculator + Injury Prevention Alert System → ACWR + Injury Prevention (02)

**Razón:** El cálculo del ACWR y su sistema de alertas son inseparables. No tiene sentido calcular un ratio sin actuar sobre él.

**Cambios:**
- **Antes:** 2 activos (02 + 03)
- **Ahora:** 1 activo (02) que contiene ambas funciones
- **Archivo unificado:** `CORE_ENGINES/02_ACWR_InjuryPrevention_System/FICHA_TECNICA.md`
- **Contenido:**
  - Parte 1: Cálculo ACWR (fórmula, umbrales, ajustes demográficos)
  - Parte 2: Sistema de alertas jerárquicas (3 niveles: bienestar → HRV/sueño → ACWR)
  - Integración con StressEngine y RecoveryCalculator

**Impacto:**
- ✅ Reduce conteo sin perder funcionalidad
- ✅ Clarifica dependencia (el cálculo alimenta la alerta)
- ✅ Más fácil de mantener (cambios en un solo lugar)

---

### Fusión 2: Banister Engine + Readiness Engine Combinado → Banister Readiness Engine (09)

**Razón:** El "Readiness Engine Combinado" es simplemente el Banister Motor con un toggle de modo (Banister solo vs. Banister + lifestyle). El toggle es una feature, no un motor separado.

**Cambios:**
- **Antes:** 2 activos (09 + 10)
- **Ahora:** 1 activo (09) que contiene ambas funciones
- **Archivo unificado:** `CORE_ENGINES/09_BanisterReadiness_Engine/FICHA_TECNICA.md`
- **Contenido:**
  - Parte 1: Modelo Banister (4 curvas exponenciales — MEC/SNC/MET/ART)
  - Parte 2: Dos modos integrados
    - Modo 1: Banister solo (fricción 0, día 1-30)
    - Modo 2: Banister + lifestyle (fricción baja, día 31+)
  - Lógica de transición suave entre modos

**Impacto:**
- ✅ Elimina confusión sobre cuándo usar cada uno
- ✅ El toggle es evidentemente una feature, no un motor
- ✅ Más claro cómo fluye el usuario (Modo 1 → Modo 2)

---

### Fusión 3: Confrontation Retention Loop → Gamification System (integrado)

**Razón:** El "Confrontation Loop" (mostrar datos de forma que el atleta se responsabilice) es exactamente lo que hace la mecánica "Tú vs Tú" del sistema de gamificación.

**Cambios:**
- **Antes:** Activo independiente UX_FLOWS/01 (diseñado)
- **Ahora:** Integrado en `UX_FLOWS/02_GamificationSystem/FICHA_TECNICA.md`
- **Contenido:** Añadida sección "Integración con Confrontation Retention Loop" que explica:
  - El resumen semanal (gamificación) YA implementa confrontación
  - Mecánica "Tú vs Tú" = confrontación de datos
  - No necesita módulo separado

**Impacto:**
- ✅ Una mecánica que hace dos cosas = más valor
- ✅ Reduce fragmentación de código
- ✅ Más fácil de implementar en el MVP (menos pantallas)

---

## 🔶 MOVIMIENTOS A V2 (No MVP)

### Muscular Balance Engine (CORE_ENGINES/12)

**Razón:** Valioso pero requiere 4-6 semanas de datos para detectar desbalances. Irrelevante en los primeros 90 días del usuario.

**Decisión:** Diseñado, pero NO implementar en MVP. La arquitectura está lista para V2.

**Cuándo implementar:** Después de que 80% de usuarios alcancen nivel 4+ (mes 2-3).

---

### Warmup Generator (CORE_ENGINES/13)

**Razón:** Nice to have. El coach ya sabe hacer calentamientos. No retiene usuarios en el MVP. Requiere base de datos completa de 122 movimientos + variantes.

**Decisión:** Diseñado, pero NO implementar. El coach crea su propio calentamiento en V2.

**Cuándo implementar:** Después de que haya adopción de coaches (mes 4+).

---

### Biometric Data Model (DATA_ARCH/03)

**Razón:** Wearables, HRV, HR, SPO2... es todo year 2+. El MVP funciona con datos manuales (sRPE, sueño 1-5, estrés 1-5).

**Decisión:** El esquema está definido en el documento, pero NO prioritizar. La arquitectura multi-tenant ya lo permite.

**Cuándo implementar:** Cuando tengas API keys de Whoop/Oura/Apple Health (mes 8+).

---

## 📊 ESTADO FINAL

### Conteo de activos

```
ANTES (Post-Gamificación)     DESPUÉS (Post-Auditoría)
├── CORE_ENGINES: 14          ├── CORE_ENGINES: 12 (-2 fusiones)
├── DATA_ARCH: 3              ├── DATA_ARCH: 3
├── UX_FLOWS: 5               ├── UX_FLOWS: 4 (-1 fusión)
├── STRATEGY: 2               ├── STRATEGY: 2
├── RESEARCH: 2               ├── RESEARCH: 2
└── TOTAL: 26                 └── TOTAL: 23 (-3 fusiones)

(+ 2 activos movidos a V2: Muscular Balance, Warmup)
(+ 1 activo en V2: Biometric Data)
```

### Prioridad MVP (Tier 1)

```
✅ CORE_ENGINES/01 StressEngine IMR
✅ CORE_ENGINES/02 ACWR + Injury Prevention (fusionado)
✅ CORE_ENGINES/09 Banister Readiness (fusionado)
✅ CORE_ENGINES/04 Recovery Calculator
✅ DATA_ARCH/01 Movement Coefficients
✅ DATA_ARCH/02 Multi-Tenant Architecture
✅ UX_FLOWS/03 Color Alert System
✅ UX_FLOWS/02 Gamification (racha + voltaje + resumen semanal)
✅ UX_FLOWS/05 Píldoras de Conocimiento
```

**Total MVP:** 9 activos (limpio, sin redundancia)

---

## 🔍 CLARIFICACIONES PENDIENTES

### Movimiento Escalation (06) vs Mayhem Scaling (08)

**Estado:** Requiere clarificación antes de decidir si fusionar.

**Pregunta:** ¿Son complementarios o redundantes?
- Si 06 es "progresión de movimientos" (escalera de dificultad) y 08 es "sustitución de movimientos" (qué hacer si no puedes hacer X), son complementarios.
- Si ambos son "qué hacer si el atleta no puede hacer X", uno sobra.

**Recomendación:** Definir bien la separación en V2. Por ahora, mantenerlos separados en el índice.

---

### CompTrain 2026 Legitimacy Asset (STRATEGY/02)

**Estado:** Revisar realismo del activo.

**Pregunta:** ¿Es una alianza confirmada o aspiracional?

**Recomendación:**
- Si no hay confirmación de CompTrain, renombrar a "Legitimacy Strategy" y documentar alternativas (Mayhem, HWPO, miscon, etc.)
- No tener un activo que dependa de un tercero que no ha confirmado nada.

---

## 📝 ARCHIVOS ACTUALIZADOS

- ✅ `RAIZ_INDEX.md` — Totales actualizados (26 → 23)
- ✅ `CORE_ENGINES/02_ACWR_InjuryPrevention_System/FICHA_TECNICA.md` — Creado (fusión)
- ✅ `CORE_ENGINES/09_BanisterReadiness_Engine/FICHA_TECNICA.md` — Creado (fusión)
- ✅ `UX_FLOWS/02_GamificationSystem/FICHA_TECNICA.md` — Actualizado (integración)
- ℹ️ `CORE_ENGINES/03_InjuryPreventionAlertSystem/` — Directorio pendiente de eliminar (contenido migrado a 02)
- ℹ️ `CORE_ENGINES/10_ReadinessEngineCombined/` — Directorio pendiente de eliminar (contenido migrado a 09)
- ℹ️ `UX_FLOWS/01_ConfrontationRetentionLoop/` — Directorio pendiente de eliminar (contenido integrado en 02)

---

## ✨ BENEFICIOS PRINCIPALES

1. **Claridad arquitectónica:** Cada activo tiene una función clara y única
2. **Menos fragmentación:** No hay redundancia en el modelo conceptual
3. **Implementación más limpia:** Menos archivos, menos confusión en el código
4. **Priorización MVP clara:** 9 activos Tier 1, sin bloat
5. **V2 bien definido:** Los 3 activos movidos a V2 saben exactamente cuándo entran

---

## 🚀 Próximos pasos

1. **Eliminar directorios vacíos:** (03, 10, UX_FLOWS/01) después de verificar
2. **Documentar clarificaciones:** 06 vs 08, CompTrain realismo
3. **Crear ESPECIFICACION_TECNICA_MVP.md:** Documenting exactamente qué entra en mes 1-2
4. **Iniciar implementación MVP:** StartDate: 2026-04-01

---

**Auditoría realizada por:** Claude Haiku
**Validación usuario:** Pendiente
**Estado:** ✅ LISTO PARA IMPLEMENTACIÓN
