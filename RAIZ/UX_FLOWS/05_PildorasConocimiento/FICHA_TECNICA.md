---
name: Píldoras de Conocimiento (Micro-educación contextual)
description: Contenido educativo ultra-corto entregado en el momento exacto en que el atleta CrossFit lo necesita — dentro del flujo natural de la app
type: UX_FLOW
estado: MUST — INTEGRAR (confirmado por usuario)
origen: Bolt 00101 / Activo #08
---

# Activo #05 — Píldoras de Conocimiento

## Categoría
Retención + Educación + Diferenciador de Autoridad

## El Principio

> "La píldora correcta, en el momento correcto, sin interrumpir el flujo."

No es una sección de "aprende CrossFit". No es un blog.
Es educación invisible — el atleta aprende sin sentir que está estudiando.

---

## Tipos de Píldoras

### Tipo 1 — Contextual al Estado del Día
Se activa cuando el `ColorAlertSystem` detecta un estado específico:

```
🔴 [Día Rojo — Readiness 23]

"¿Sabías que el overtraining reduce tus gains?
Después de 48h de descanso, la síntesis proteica
sube un 40%. Hoy descansar ES entrenar."

[Entendido] [Más info]
```

```
🟢 [Día Verde — Readiness 87]

"Cuando tu Banister supera 85, estás en 'supercompensación'.
Es el momento ideal para intentar un PR.
Tu sistema nervioso está en máximo rendimiento."

[Entendido]
```

### Tipo 2 — Contextual al Movimiento registrado
Se activa cuando el atleta registra un WOD con ciertos movimientos:

```
[Después de registrar un WOD con Snatch]

"Tip de hombro 🎯
El dolor de hombro en el snatch casi siempre es falta
de movilidad torácica, no el hombro en sí.
3 min de Cat-Cow antes del WOD lo cambia todo."

[Guardar tip]
```

```
[Después de WOD con Kipping Pull-ups]

"Kipping sin base = receta para hombro lesionado.
¿Tienes 10 strict pull-ups? Si no, considera
hacer ring rows esta semana."

[Guardar tip]
```

### Tipo 3 — Educación de los Números de VOLTA
Cada vez que el atleta ve un número nuevo en la app, puede entender qué es:

```
[Primera vez que ve ACWR en dashboard]

"¿Qué es el ACWR? 🔢
Es la relación entre tu carga de esta semana
y tu promedio de las últimas 4 semanas.

>1.3 = carga muy alta para tu base (riesgo)
0.8-1.3 = zona segura
<0.8 = semana de descarga

El tuyo hoy: 1.1 ✅"
```

### Tipo 4 — Píldoras del Coach (para atletas del box)
El coach puede crear y enviar píldoras personalizadas a sus atletas:

```
[Del coach: Quinto Elemento]

"Esta semana trabajamos fuerza de pressing.
El press horizontal y vertical activan diferentes
fibras. Necesitas ambos para desarrollo simétrico.

Por eso alternamos Press/Push Press en el WOD."
```

### Tipo 5 — Periodización Menstrual (para atletas que usan el motor)
```
[Fase Lútea detectada]

"Estrógenos bajos + progesterona alta =
mayor fatiga percibida, pero fuerza máxima
casi igual. Tu RPE será más alto hoy aunque
estés igual de fuerte que ayer.

No te frustres — es fisiología, no rendimiento."
```

---

## Sistema de Entrega

### Frecuencia y timing
- **Máximo 1 píldora por sesión de uso** (no spamear)
- **Se muestra después de completar una acción** (no al abrir la app)
- **Se puede guardar** en biblioteca personal del atleta

### Biblioteca personal
```
📚 MIS PÍLDORAS GUARDADAS (12)

🔴 "Descansar es entrenar" — Overtraining
💪 "Kipping sin base" — Prevención hombro
🔢 "El ACWR explicado" — Métricas VOLTA
🌙 "Fase Lútea y RPE" — Motor Menstrual
```

---

## Banco de Contenido (ejemplos por categoría)

| Categoría | # Píldoras sugeridas |
|-----------|----------------------|
| Fisiología del entrenamiento | 20 |
| Prevención de lesiones CrossFit | 15 |
| Nutrición pre/post WOD | 10 |
| Sueño y recuperación | 8 |
| Interpretación de métricas VOLTA | 12 |
| Técnica de movimientos CrossFit | 25 |
| Ciclo menstrual y rendimiento | 10 |
| **Total inicial** | **~100** |

El banco crece con el tiempo. El coach puede contribuir.

---

## Valor diferencial

1. **VOLTA educa al atleta sobre sus propios datos** — genera confianza en la app
2. **El atleta mejora su inteligencia deportiva** — se vuelve dependiente del sistema
3. **El coach cuya app educa a sus atletas es percibido como más profesional**
4. **Diferenciador claro vs SugarWOD / BeyondTheWhiteboard** — ellos no educan, solo registran
5. **Retention tool**: el atleta que entiende sus datos no abandona la app

---

## Integración con activos VOLTA

- **Activada por**: `UX_FLOWS/03_ColorAlertSystem` (estado del día)
- **Activada por**: registro de movimientos específicos
- **Activada por**: primera vez que el atleta ve cada métrica
- **Activada por**: fase del `CORE_ENGINES/05_MenstrualPeriodizationEngine`
- **Herramienta para**: plan coach (píldoras personalizadas)
- **Retroalimenta**: `UX_FLOWS/02_GamificationSystem` (guardar píldoras → XP, cuando esté definido)
