# ACTIVO #5: MenstrualPeriodizationEngine (Motor de Periodización Hormonal)

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** ALTO — diferenciador de mercado, protección de atletas femeninas
- **Estado actual:** Implementado en Python con tests unitarios

## Ubicación en el sistema actual
- **Backend Python:** `backend/app/services/calculations.py` (clase `MenstrualPeriodizationEngine`)
- **Tests:** `backend/tests/test_calculations.py` (validación de fases y factores)
- **Esquema DB:** `migrations/001_initial_schema.sql` (tabla `menstrual_cycles`)
- **Integración ACWR:** `backend/app/injury_prevention_params.py` (ajuste demográfico -0.20)

## Lógica subyacente

### Cálculo de fase actual
```
días_desde_menstruación = (fecha_actual - última_menstruación).days
día_del_ciclo = días_desde_menstruación % duración_ciclo

Mapeo de fase:
  Día 1-5   → MENSTRUAL
  Día 6-14  → FOLLICULAR
  Día 15-17 → OVULATION
  Día 18-28 → LUTEAL
```

### Tabla de fases, factores y fundamento fisiológico

| Fase | Días | Factor | Efecto fisiológico | Implicación para entrenamiento |
|------|------|--------|--------------------|---------------------------------|
| MENSTRUAL | 1–5 | **0.80** (-20%) | Estrógeno y progesterona en mínimos. Fatiga, inflamación sistémica, mayor percepción de dolor | Reducir carga significativamente. Priorizar movimientos de bajo impacto y movilidad |
| FOLLICULAR | 6–14 | **1.15** (+15%) | Estrógeno ascendente. Pico de fuerza anaeróbica, mejor síntesis proteica, mayor tolerancia al dolor | Ventana óptima para PRs, cargas pesadas, volumen alto. Día perfecto para tests |
| OVULATION | 15–17 | **1.10** (+10%) | Pico hormonal completo. Alto rendimiento neuromuscular PERO ligamentos más laxos por relaxina | Rendimiento alto pero cuidado con movimientos de rango extremo. Evitar máximos en snatch/overhead |
| LUTEAL | 18–28 | **0.95** (-5%) | Progesterona dominante. Termorregulación comprometida, metabolismo elevado, retención hídrica | Reducción leve. Hidratación extra. Ajustar expectativas sin eliminar intensidad |

### Aplicación del factor
```
Carga recomendada del WOD = Carga programada × Factor de fase

Ejemplo:
  WOD programa: Back Squat @ 100kg
  Atleta en fase MENSTRUAL: 100 × 0.80 = 80kg recomendados
  Atleta en fase FOLLICULAR: 100 × 1.15 = 115kg recomendados
```

### Interacción con ACWR (doble protección)
```
El ciclo menstrual actúa en DOS niveles simultáneos:

Nivel 1 — Factor directo sobre carga:
  Reduce/aumenta la carga recomendada del WOD del día

Nivel 2 — Ajuste demográfico sobre ACWR:
  Modifica el umbral de seguridad del ACWR en -0.20
  (definido en injury_prevention_params.py)

Efecto combinado ejemplo (fase menstrual):
  • La carga del WOD baja 20% (menos IMR generado)
  • El umbral de ACWR baja de 1.30 a 1.10 (más conservador)
  → Doble capa de protección automática
```

### Persistencia en base de datos
```sql
-- Tabla: menstrual_cycles
athlete_id UUID              -- FK a athletes
last_menstruation DATE       -- fecha de última menstruación
cycle_length INT             -- duración del ciclo (default 28)
contraception TEXT           -- tipo de anticoncepción (afecta ajustes)
created_at TIMESTAMP
```

### Consideración sobre anticonceptivos
El campo `contraception` existe porque los anticonceptivos hormonales modifican el perfil endocrino:
- **Sin anticoncepción:** Ciclo natural, factores aplican completos
- **Píldora combinada:** Ciclo suprimido, factores reducidos al 50%
- **DIU hormonal:** Efectos locales, factores aplican al 75%
- **DIU no hormonal:** Ciclo natural, factores aplican completos

(Nota: esta lógica de ajuste por anticoncepción está documentada pero no completamente implementada en el código actual)

## Dependencias
- **Consume:**
  - Input del atleta: fecha última menstruación + duración ciclo
  - Tabla `menstrual_cycles` para cálculo de fase
- **Alimenta:**
  - ACWR Calculator (Activo #2) — como ajuste demográfico (-0.20 en fases vulnerables)
  - InjuryPreventionAlertSystem (Activo #3) — contexto hormonal para alertas
  - Dashboard del atleta — visualización de fase actual y recomendación
  - Carga recomendada del WOD — factor multiplicador directo

## Evolución documentada (Carta Magna + documentación técnica de wearables)
```
FASE ACTUAL:  Input manual (atleta ingresa fecha última menstruación)
FASE FUTURA:  Detección automática vía temperatura basal desde wearable

Algoritmo documentado (INTEGRACION_AVANZADA_WEARABLES_METRICAS.md):
  - detectMenstrualCyclePhase() vía peak detection de temperatura
  - Identificación de pico ovulatorio por subida de 0.3-0.5°C
  - Clasificación de fase con scoring de confianza
  - Eliminación total de input manual
```

## Valor diferenciador
1. **La mayoría de apps de fitness ignoran el ciclo menstrual completamente** — VOLTA lo integra como motor de primera clase
2. **Doble capa de protección** — factor directo sobre carga + ajuste sobre umbral ACWR
3. **Fundamento fisiológico documentado** — cada fase tiene justificación endocrina
4. **Consideración de anticonceptivos** — campo de datos diseñado para ajustes farmacológicos
5. **Roadmap a automatización** — de input manual a detección vía wearable (ya documentado)
6. **Impacto en retención:** Atletas femeninas que se sienten comprendidas por el sistema permanecen más tiempo

## Requisitos para migración/adaptación
1. **Preservar las 4 fases con sus factores exactos** — son basados en investigación
2. **Mantener la doble interacción** con ACWR (factor directo + ajuste demográfico)
3. **Migrar tabla `menstrual_cycles`** completa incluyendo campo `contraception`
4. **El cálculo de fase debe ser timezone-aware** — día 1 del ciclo depende de la zona horaria del atleta
5. **Privacidad:** Estos datos son sensibles. Exigir encriptación en reposo y en tránsito. Acceso restringido solo al atleta y su coach directo
6. **Preparar interfaz para wearable** — cuando se implemente detección automática por temperatura, el motor debe aceptar ambos inputs (manual y automático) con flag de fuente
7. **Default graceful:** Si la atleta no ingresa datos menstruales, el motor no aplica ajustes en lugar de asumir. Nunca asumir fase sin datos.
