# ACTIVO #15: Modelo de Datos Biométricos — El Foso Competitivo del Año 2

## Clasificación
- **Tipo:** Modelo de Datos (Data Architecture)
- **Prioridad:** CRÍTICO a largo plazo — principal activo de retención y diferenciación en Año 2+
- **Estado actual:** Schema definido en Supabase. Integración con wearables: pendiente.

---

## Por Qué Este es el Activo de Foso Más Importante

Los datos de entrenamiento (WODs, IMR, ACWR) son replicables.
Un atleta puede exportar sus tiempos y empezar en otra app en 30 minutos.

Los datos biométricos personales NO son replicables.

**La línea base personal de HRV tarda 30-90 días en establecerse.**
**La curva de temperatura basal para detección de ciclo tarda 2-3 ciclos completos.**
**El patrón de RHR vs. ACWR del individuo es único e irrepetible.**

Una vez que VOLTA tiene 6 meses de biométricos de un atleta,
ese atleta no abandona el sistema sin perder su historia completa.
**Eso es foso competitivo.**

---

## Arquitectura del Schema Biométrico

### Tabla 1: biometric_hrv_daily
```
athlete_id         UUID    FK a athletes
date               DATE
hrv_ms             FLOAT   Variabilidad cardíaca en milisegundos
hrv_baseline       FLOAT   Promedio móvil 30 días (línea base personal)
hrv_z_score        FLOAT   Desviación de la línea base
source             TEXT    'apple_health' | 'garmin' | 'whoop' | 'manual'
```

**Qué revela:**
- Z-score > +1.5 → recuperación excepcional, sistema parasimpático dominante
- Z-score < -1.5 → estrés elevado, riesgo de overtraining
- La línea base desciende con edad, sube con fitness mejorado

### Tabla 2: biometric_rhr_daily
```
athlete_id         UUID
date               DATE
rhr_bpm            INT     Latidos por minuto en reposo
rhr_7day_avg       FLOAT   Promedio de 7 días (tendencia)
rhr_deviation      FLOAT   Diferencia vs. baseline personal
anomaly_flag       BOOL    True si desviación > 6bpm sostenida
```

**Qué revela:**
- Trending ascendente +6bpm = señal de sobreentrenamiento o infección
- Trending descendente = mejora cardiovascular confirmada
- Combinado con ACWR: predictor de lesión con 75% de precisión

### Tabla 3: biometric_sleep_daily
```
athlete_id         UUID
date               DATE
total_hours        FLOAT
deep_sleep_min     INT     Minutos de sueño profundo (N3)
rem_sleep_min      INT     Minutos de sueño REM
light_sleep_min    INT     Minutos de sueño ligero
sleep_score        INT     0-100 (calculado)
deficit_flag       BOOL    True si Deep < 45min o REM < 90min
```

**Targets de referencia:**
```
Sueño profundo (N3): mínimo 45 min/noche
Sueño REM:          mínimo 90 min/noche
Total horas:        7-9 horas

Atleta con déficit crónico de N3 → recuperación muscular insuficiente
Atleta con déficit crónico de REM → consolidación cognitiva deteriorada
                                    → toma de decisiones en WOD peor
```

### Tabla 4: biometric_temperature
```
athlete_id         UUID
date               DATE
temp_celsius       FLOAT
temp_baseline      FLOAT   Promedio folicular personal
temp_deviation     FLOAT
phase_detected     TEXT    'menstrual' | 'follicular' | 'ovulatory' | 'luteal'
confidence         FLOAT   0.0 - 1.0 (confianza en la detección de fase)
```

**Qué revela:**
- Elevación de +0.2°C sostenida = ovulación detectada
- Fase folicular: máxima fuerza anaeróbica → días de PRs
- Fase lútea: mayor fatiga, umbral de dolor elevado → ajustar intensidad
- Requiere 2-3 ciclos para establecer línea base confiable

### Tabla 5: biometric_daily_summary (READINESS SCORE)
```
athlete_id         UUID
date               DATE
readiness_score    INT     0-100 (síntesis de todos los biométricos)
hrv_contribution   FLOAT   Aporte del HRV (peso 30%)
sleep_contribution FLOAT   Aporte del sueño (peso 25%)
rhr_contribution   FLOAT   Aporte del RHR (peso 20%)
temp_contribution  FLOAT   Aporte de temperatura (peso 15%)
stress_contribution FLOAT  Aporte del estrés percibido (peso 10%)
recommendation     TEXT    Mensaje generado automáticamente para el atleta
```

**La fórmula:**
```
Readiness = (HRV_norm × 0.30) +
            (Sleep_norm × 0.25) +
            (RHR_norm × 0.20) +
            (Temp_norm × 0.15) +
            (Stress_norm × 0.10)

Donde _norm = valor normalizado a escala 0-100
basado en la línea base PERSONAL del atleta (no estándares globales)
```

### Tabla 6: wearable_sync_logs
```
athlete_id         UUID
sync_time          TIMESTAMP
source             TEXT    'apple_health' | 'google_fit' | 'garmin' | 'whoop'
metrics_synced     JSONB   Qué métricas se obtuvieron en esta sync
status             TEXT    'success' | 'partial' | 'failed'
error_message      TEXT    Si hubo error
```

---

## Fuentes de Datos por Plataforma

| Métrica | Apple Health | Google Fit | Garmin | Whoop |
|---|---|---|---|---|
| HRV | ✅ nativo | ⚠️ limitado | ✅ completo | ✅ completo |
| Sueño (fases) | ✅ watchOS 9+ | ⚠️ básico | ✅ completo | ✅ completo |
| RHR | ✅ nativo | ✅ nativo | ✅ nativo | ✅ nativo |
| Temperatura | ✅ Apple Watch Ultra/S8+ | ❌ no disponible | ⚠️ Garmin select | ✅ completo |
| VO2Max est. | ✅ Apple Watch | ✅ Wear OS | ✅ Garmin | ❌ no |

**Implicación:** Para el stack biométrico completo, Apple Watch o Whoop
son las plataformas óptimas. Google Fit requiere fallbacks.

---

## El Foso Competitivo en Números

```
Tiempo para establecer línea base confiable:
  HRV baseline:          30 días (promedio móvil estable)
  RHR trending:          14-21 días
  Sueño patterns:        21-30 días
  Ciclo menstrual:       60-90 días (2-3 ciclos completos)

Una vez establecida la línea base:
  El sistema personaliza TODAS las alertas para ese individuo
  El "normal" de cada atleta es único e irrepetible
  Migrar a otra app = perder 1-3 meses de calibración personal
```

**Efecto acumulativo:**
```
Mes 1: Datos básicos. Alertas genéricas.
Mes 3: Línea base establecida. Alertas personalizadas.
Mes 6: Patrones identificados. Correlaciones predictivas.
Mes 12: El sistema predice lesiones antes de que el atleta las sienta.
```

---

## Integración con Otros Motores

```
biometric_daily_summary.readiness_score
        ├── ACWR_Calculator: modifica umbral de alerta
        │   (ACWR 1.4 con Readiness 85 ≠ ACWR 1.4 con Readiness 55)
        ├── InjuryPreventionAlertSystem: input principal
        │   (combinado con ACWR → Injury Risk Predictor)
        ├── MenstrualPeriodizationEngine: alimentado por temperatura
        │   (phase_detected → ajuste automático de cargas)
        └── Dashboard del Atleta: card diaria "Tu estado hoy"
```

---

## Valor por Segmento

### Para el Atleta:
"VOLTA me conoce mejor que yo mismo. Sabe que cuando mi HRV baja
2 puntos y mi RHR sube 4bpm, al día siguiente mi técnica en snatch falla.
Y siempre tiene razón."

### Para el Coach:
Vista agregada de readiness de todo el box cada mañana.
En lugar de adivinar quién llegará "cargado" al WOD,
el coach ve: 8 de 20 atletas tienen Readiness < 65 hoy.
Decisión: modificar el WOD programado o avisar a esos 8 que bajen intensidad.

### Para Inversores:
Los datos biométricos longitudinales de atletas son activos de datos
con valor científico propio. A escala de 1,000+ atletas,
VOLTA tendría el dataset más completo de biométricos + rendimiento
de CrossFit en el mundo. Eso es IP de primer nivel.

---

## Requisitos para Migración/Adaptación

1. **Preservar el schema de 6 tablas** — es la arquitectura completa
2. **Implementar OAuth 2.0** para Apple Health y Google Fit
   (documentado en IMPLEMENTACION_TECNICA_WEARABLES.md)
3. **Bull Queue + Redis** para sync asíncrono cada 6 horas
   (el atleta no debe sentir latencia en la sync)
4. **Cálculo de línea base en backend** — no en frontend
   (la línea base personal es dato sensible, nunca al cliente)
5. **Row Level Security estricto** — los biométricos son los datos
   más sensibles del sistema. Cada atleta solo ve los suyos.
6. **Fallback para atletas sin wearable:** permitir entrada manual
   de métricas clave (sueño estimado, estrés percibido 1-5)
   para que el Readiness Score funcione con datos parciales
7. **Política de retención de datos** — definir cuánto tiempo se conservan
   biométricos históricos (GDPR / CCPA compliance)
8. **Onboarding de calibración:** los primeros 30 días deben
   comunicar al atleta que el sistema está "aprendiendo su cuerpo"
   para gestionar expectativas correctamente
