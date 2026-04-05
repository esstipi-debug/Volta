---
name: Investigación de Carga Multimodal CrossFit — Paquete Completo
description: Investigación científica + correcciones para crear el primer sistema de cuantificación de carga específico para CrossFit
type: RESEARCH
estado: COMPLETO — LISTO PARA IMPLEMENTACIÓN
fecha: 2026-03-27
---

# Investigación de Carga Multimodal CrossFit

## Contenido del paquete

| Archivo | Contenido |
|---------|-----------|
| `Documento original` | CrossFit Carga Multimodal Investigación.docx (en Downloads) |
| `01_PROTOCOLO_INVESTIGACION.md` | Diseño de las 12 fases de investigación |
| `02_PROMPT_INVESTIGACION.md` | Prompt ejecutable (9 bloques) que generó la investigación |
| `03_CORRECCIONES.md` | 6 correcciones P0/P1 al documento original |

## Resumen de entregables producidos

### Entregable 1 — Tabla Maestra de 122 Movimientos ✅
- Coeficiente base (0.50-2.00) para cada movimiento
- Perfil de 4 vectores: MEC, SNC, MET, ART (1-10)
- Cadena muscular, dominancia, articulaciones en riesgo
- Variantes con multiplicadores (strict/kipping/butterfly/weighted/deficit)
- Fuente: ~5% [V]alidado, ~15% [C]onsenso, ~80% [E]stimado

### Entregable 2 — Multiplicadores de 17 Formatos de WOD ✅
- RFT couplet/triplet/chipper, AMRAP corto/medio/largo, EMOM corto/largo
- Tabata, Ladder, Hero WOD, Benchmark Girls, Strength, Skill, Competition
- Sub-multiplicadores por duración (<5min hasta 60+min)
- Tiempos de recuperación estimados (intermedio vs avanzado)

### Entregable 3 — Modificadores Individuales ✅
- 7 variables: experiencia, peso corporal, sexo, edad, ciclo menstrual, sueño, estrés
- Interacciones entre movimientos: sinergia (×1.20), antagonismo (×0.90)
- sRPE como validador (CR-10 Foster, 30min post-WOD)
- Tiempos de recuperación por tipo de estrés (MEC 48-72h, SNC 24-48h, MET 12-36h, ART 24h-21d)

### Entregable 4 — Algoritmo Banister + ACWR CrossFit ✅
- Banister multi-curva: 4 taus independientes (MEC=18d, SNC=8d, MET=4d, ART=30d)
- ACWR con EWMA (λ_agudo=0.25, λ_crónico=0.069)
- ACWR separado por tipo de estrés (articular, metabólico, etc.)
- Umbrales: sweet spot 0.8-1.3, warning 1.3-1.5, crítico >1.5

### Entregable 5 — Protocolo de Auto-calibración ✅
- Gradient descent (lr=0.03-0.05, clip ±25%)
- Freeze phase: 21 sesiones antes de primera calibración
- Fórmula híbrida: CTS = 0.70×CE + 0.30×sRPE (z-score normalizado)

## Correcciones aplicadas (post-revisión)
1. Escala monostructurales normalizada por unidad (200m, 10cal, 50reps)
2. Fórmula alométrica: (BW/75)^0.67 para gimnásticos
3. Multiplicador de fatiga por posición en WOD (+4%/ronda, cap 1.20)
4. Matriz sinergia/antagonismo 6×6 grupos musculares
5. Normalización z-score rolling 28d para CE↔sRPE
6. Protocolo de validación: 50 atletas × 6 meses

## Bibliografía
61+ fuentes citadas en el documento original (PubMed, Frontiers, MDPI, etc.)

## Estado
**LISTO PARA IMPLEMENTACIÓN** — Los coeficientes [E] se refinarán con datos reales de atletas VOLTA.
