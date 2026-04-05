# ACTIVO #4: RecoveryCalculator (Motor de Recuperación)

## Clasificación
- **Tipo:** Motor de Lógica (Core Engine)
- **Prioridad:** ALTO — puente entre carga externa y capacidad interna
- **Estado actual:** Implementado en Python, con tests unitarios

## Ubicación en el sistema actual
- **Backend Python:** `backend/app/services/calculations.py` (clase `RecoveryCalculator`)
- **Tests:** `backend/tests/test_calculations.py` (casos de validación)
- **Esquema DB:** `migrations/001_initial_schema.sql` (tabla `biometric_logs`)

## Lógica subyacente

### Fórmula principal
```
Recovery Score = (sleep_score + inverse_stress + inverse_pain) / 3
```

### Componentes del cálculo

**1. Sleep Score (calidad de sueño)**
```
sleep_score = min(horas_dormidas / 9, 1.0)

Ejemplos:
  9+ horas → 1.00 (máximo, tope en 1.0)
  8 horas  → 0.89
  7 horas  → 0.78
  6 horas  → 0.67
  5 horas  → 0.56
  4 horas  → 0.44
```

**2. Inverse Stress (estrés invertido)**
```
inverse_stress = (5 - nivel_estrés) / 5
Escala de entrada: 1 (sin estrés) a 5 (estrés máximo)

Ejemplos:
  Estrés 1/5 → (5-1)/5 = 0.80
  Estrés 2/5 → (5-2)/5 = 0.60
  Estrés 3/5 → (5-3)/5 = 0.40
  Estrés 4/5 → (5-4)/5 = 0.20
  Estrés 5/5 → (5-5)/5 = 0.00
```

**3. Inverse Pain (dolor muscular invertido)**
```
inverse_pain = (5 - nivel_dolor) / 5
Escala de entrada: 1 (sin dolor) a 5 (dolor severo)

Ejemplos:
  Dolor 1/5 → 0.80
  Dolor 2/5 → 0.60
  Dolor 3/5 → 0.40
  Dolor 4/5 → 0.20
  Dolor 5/5 → 0.00
```

### Clasificación del resultado
| Score | Estado | Color | Acción recomendada |
|-------|--------|-------|-------------------|
| > 0.65 | GOOD | Verde | Entrena normal, puede progresar |
| 0.50–0.65 | FAIR | Amarillo | Reducir intensidad 15-20% |
| < 0.50 | POOR | Rojo | Priorizar descanso activo o total |

### Casos de ejemplo validados

**Atleta bien recuperado:**
```
Sueño: 8h, Estrés: 1/5, Dolor: 1/5
sleep = 0.89, stress = 0.80, pain = 0.80
Score = (0.89 + 0.80 + 0.80) / 3 = 0.83 → GOOD ✅
```

**Atleta parcialmente recuperado:**
```
Sueño: 7h, Estrés: 3/5, Dolor: 2/5
sleep = 0.78, stress = 0.40, pain = 0.60
Score = (0.78 + 0.40 + 0.60) / 3 = 0.59 → FAIR ⚠️
```

**Atleta no recuperado:**
```
Sueño: 5h, Estrés: 4/5, Dolor: 4/5
sleep = 0.56, stress = 0.20, pain = 0.20
Score = (0.56 + 0.20 + 0.20) / 3 = 0.32 → POOR 🔴
```

### Persistencia en base de datos
```sql
-- Tabla: biometric_logs
sleep_hours FLOAT         -- horas dormidas (input)
stress_level INT          -- 1-5 (input)
muscle_pain_level INT     -- 1-5 (input)
date DATE                 -- fecha del registro
athlete_id UUID           -- FK a athletes
```

## Dependencias
- **Consume:**
  - Input directo del atleta (3 valores subjetivos: sueño, estrés, dolor)
  - Tabla `biometric_logs` para histórico
- **Alimenta:**
  - Readiness Score (documentado en Carta Magna, pendiente implementación como motor)
  - Recomendaciones de intensidad diaria
  - Dashboard del atleta (visualización de estado de recuperación)
  - InjuryPreventionAlertSystem (contexto adicional para alertas)

## Relación con otros motores
```
StressEngine (IMR)     → Cuánto trabajo HICISTE (carga externa)
RecoveryCalculator     → Cuánto puede ABSORBER tu cuerpo (capacidad interna)
ACWR                   → Balance entre carga acumulada y adaptación
AlertSystem            → Decisión final combinando todos los factores
```

**La potencia de VOLTA está en cruzar carga externa (IMR/ACWR) con capacidad interna (Recovery).** Un ACWR de 1.2 con Recovery GOOD es verde. El mismo 1.2 con Recovery POOR es rojo.

## Valor diferenciador
1. **Simplicidad deliberada** — 3 inputs, 1 output. Mínima fricción para el atleta
2. **Pesos iguales** — cada componente vale 33%. Deliberadamente democrático: sueño, estrés y dolor importan igual
3. **Escala normalizada 0-1** — compatible con cualquier sistema de scoring downstream
4. **Complemento de ACWR** — carga vs capacidad es el framework completo de prevención

## Requisitos para migración/adaptación
1. **Preservar la escala 0-1** — permite composición con otros scores (Readiness, Injury Risk)
2. **Mantener 3 inputs subjetivos** — son de mínima fricción (el atleta responde en 10 segundos)
3. **Los umbrales GOOD/FAIR/POOR (0.65/0.50)** son configurables pero probados
4. **Considerar evolución:** En futuras versiones, el sueño podría venir de wearable (objetivo) en vez de input manual (subjetivo), reemplazando `min(horas/9, 1.0)` por un análisis de arquitectura de sueño más sofisticado
5. **Histórico es valioso** — preservar serie temporal de recovery scores para detectar tendencias descendentes
6. **No requiere dependencias externas** — motor completamente autónomo, stateless
