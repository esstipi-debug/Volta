---
name: Readiness Engine Combinado (Banister Solo + Lifestyle)
description: Dos modos de operación según nivel de fricción que el atleta CrossFit acepta
type: CORE_ENGINE
estado: PROPUESTO — ADAPTAR A CROSSFIT
origen: Bolt 00101 / Activo #12
---

# Activo #10 — Readiness Engine Combinado

## Categoría
Algoritmo de Valor + Lógica de Negocio

## El Problema que Resuelve

El mayor error en apps fitness: pedir mucho input al atleta desde el día 1.
El atleta abandona antes de ver valor.

**Solución**: dos modos. El atleta entra en Modo 1 sin fricción. La app sugiere Modo 2 después de 30 días.

---

## Modo 1 — Banister Solo (Fricción CERO)

```
Input:  Solo los WODs completados (automático)
Output: Readiness score 0-100 basado en fitness/fatiga
Fricción: 0 — el atleta no hace nada extra
Precisión: Media
```

**Ideal para:**
- Atleta nuevo que aún no confía en la app
- Atleta RX que solo quiere registrar WODs
- Primeros 30 días de uso

**Ejemplo de output en VOLTA:**
> "Tu readiness hoy es **73** — tu entrenamiento de los últimos días te tiene bien adaptado."

---

## Modo 2 — Banister + Lifestyle (Fricción BAJA, Precisión ALTA)

```
Input:  WODs + check-in diario (3 preguntas, 10 segundos)
Output: Readiness ajustado por variables de vida real
Fricción: Baja
Precisión: Alta — refleja al atleta completo, no solo su training
```

### El check-in de 10 segundos (adaptado CrossFit)
```
1. ¿Cuántas horas dormiste? [<6 | 6-7 | 7-8 | 8+]
2. ¿Cómo es tu estrés hoy? [1-5]
3. ¿Cómo están tus piernas? [Frescas | Normal | Pesadas | Destrozadas]
```

### Modificadores sobre el Banister Base

| Variable | Impacto en readiness |
|----------|----------------------|
| Sueño < 6h | −12 puntos |
| Sueño 6-7h | −5 puntos |
| Sueño 8h+ | +5 puntos |
| Estrés alto (4-5) | −10 puntos |
| Piernas destrozadas | −15 puntos |
| Viaje / jet lag | −10 puntos |
| Enfermedad declarada | −20 puntos |

### Ejemplo de output en VOLTA:
> "Tu Banister dice 73, pero dormiste 5h y tienes estrés alto."
> "**Readiness real: 51** — WOD escalado recomendado hoy."

---

## Transición entre Modos

El atleta empieza en Modo 1 por defecto.
Después de 30 días de uso, VOLTA muestra:

> *"Con el check-in diario, tus predicciones serían 40% más precisas."*
> *"Son 3 preguntas. 10 segundos antes del gym."*
> [Activar Modo 2]

No se fuerza. El atleta decide.

---

## ¿Por qué tiene valor en CrossFit específicamente?

1. **El atleta RX no quiere formularios** — Modo 1 lo respeta
2. **El atleta competidor sí quiere precision** — Modo 2 le da ventaja real
3. **Las piernas** son el indicador más relevante en CrossFit (squats, cardio)
4. **El sueño impacta más en WODs que en cualquier otro deporte** (HRV, lactato threshold)

---

## Integración con activos VOLTA

- **Base**: `CORE_ENGINES/09_BanisterEngine` (provee el score base)
- **Alimenta**: `CORE_ENGINES/11_SessionAdaptationEngine` (decide carga del día)
- **Alimenta**: `UX_FLOWS/03_ColorAlertSystem` (color de la interfaz)
- **Alimenta**: `CORE_ENGINES/14_SmartCoachAlerts` (coach ve readiness real)
