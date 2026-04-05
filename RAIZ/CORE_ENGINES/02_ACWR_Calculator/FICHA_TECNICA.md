# ACTIVO #2: ACWR Calculator (Motor de Predicción de Lesiones)

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** CRÍTICO — principal mecanismo de prevención de lesiones
- **Estado actual:** Implementado en Python y TypeScript, con ajustes demográficos

## Ubicación en el sistema actual
- **Backend Python:** `backend/app/services/calculations.py` (cálculo base ACWR)
- **Parámetros:** `backend/app/injury_prevention_params.py` (umbrales + ajustes demográficos)
- **Sistema de alertas:** `backend/app/injury_prevention_alert.py` (consume ACWR para generar alertas)
- **Frontend TypeScript:** `src/lib/injury-prevention-params.ts` (mirror de parámetros)
- **Esquema DB:** `migrations/001_initial_schema.sql` (tabla `stress_engine_metrics`)

## Lógica subyacente

### Fórmula base
```
ACWR = Promedio_IMR_últimos_7_días ÷ Promedio_IMR_últimos_28_días
```

### Sistema de zonas
| ACWR | Zona | Riesgo relativo | Color | Acción |
|------|------|-----------------|-------|--------|
| < 0.8 | UNDERTRAIN | 1.5x | Azul | Aumentar carga progresivamente |
| 0.8–1.3 | OPTIMAL | 1.0x (baseline) | Verde | Mantener curso |
| 1.3–1.5 | CAUTION | 2.0x | Amarillo | Monitorear, reducir volumen |
| > 1.5 | DANGER | 4.0x | Rojo | Descanso obligatorio 1-2 días |

### Umbrales refinados (injury_prevention_params)
```
ACWR_THRESHOLDS:
  SAFE_LOWER: 0.60
  SAFE_UPPER: 0.80
  OPTIMAL_LOWER: 0.80
  OPTIMAL_UPPER: 1.30
  WARNING: 1.30
  CRITICAL: 1.50
```

### Ajustes demográficos (ACWR personalizado)
El ACWR crudo se modifica según el perfil del atleta:

| Factor | Ajuste al umbral | Fuente |
|--------|-------------------|--------|
| Ciclo menstrual activo | -0.20 | Investigación hormonal |
| Edad > 35 años | -0.15 | Disminución capacidad recuperación |
| Edad de entrenamiento baja (<2 años) | -0.25 | Sistema musculoesquelético inmaduro |
| Estrés psicosocial académico | ×3 multiplicador | Investigación cortisol |
| Historial de lesiones reciente | -0.10 | Tejido vulnerable |

**Ejemplo de personalización:**
```
Atleta: Mujer, 38 años, 1.5 años de experiencia, fase lútea
ACWR crudo: 1.25 (nominalmente "verde")

Ajustes aplicados:
  Base threshold: 1.30
  - Edad >35: -0.15 → 1.15
  - Training age baja: -0.25 → 0.90
  - Ciclo menstrual: -0.20 → 0.70

ACWR ajustado: 1.25 vs umbral 0.70 → ZONA ROJA PERSONALIZADA
Recomendación: Descanso, a pesar de que el número crudo parece seguro.
```

### Persistencia en base de datos
```sql
-- Tabla: stress_engine_metrics
acute_workload_7day FLOAT    -- suma IMR últimos 7 días
chronic_workload_28day FLOAT -- suma IMR últimos 28 días
acwr_value FLOAT             -- ratio calculado
zone TEXT                     -- 'optimal', 'caution', 'danger', 'undertrain'
```

## Dependencias
- **Consume:** IMR diarios del StressEngine (Activo #1)
- **Alimenta:**
  - InjuryPreventionAlertSystem (genera alertas verde/amarillo/rojo/negro)
  - Injury Risk Predictor (ACWR pesa 50% del score de riesgo)
  - RTP Protocol (los 6 pasos usan límites de ACWR)
  - Coach Dashboard (visualización de estado por atleta)
  - Readiness Score (componente de contexto de carga)

## Valor diferenciador
- **Único en el mercado:** ACWR ajustado por demografía + ciclo hormonal + estrés psicosocial
- **Doble implementación:** Corre en backend (Python) y frontend (TypeScript) para respuesta offline
- **Basado en investigación:** 11 secciones de investigación con niveles de confianza documentados
- **Incluye honestidad sobre incertidumbre:** El sistema reporta research gaps y confidence levels

## Requisitos para migración/adaptación
1. **Preservar la fórmula de 2 capas** — ACWR crudo + ajustes demográficos personalizados
2. **Migrar tabla completa de ajustes** — los 5 factores demográficos con sus valores exactos
3. **Mantener histórico de 28 días** — el motor necesita mínimo 28 días de IMR para ser preciso
4. **Preservar sistema de zonas con colores** — es la interfaz de comunicación al usuario
5. **Mantener doble implementación** (backend + frontend) para funcionamiento offline
6. **Los umbrales deben ser configurables** — diferentes poblaciones pueden necesitar ajustes
7. **Cold start problem:** Documentar estrategia para atletas nuevos sin 28 días de datos (actualmente usa estimaciones conservadoras)
