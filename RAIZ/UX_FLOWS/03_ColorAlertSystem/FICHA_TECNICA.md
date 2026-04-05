---
name: Color Alert System (Tema Adaptativo de Estado)
description: La interfaz de VOLTA cambia de color según el estado fisiológico del atleta CrossFit — señal visual inmediata sin leer números
type: UX_FLOW
estado: PROPUESTO — UNIVERSAL (no requiere adaptación específica CrossFit)
origen: Bolt 00101 / Activo #09
---

# Activo #03 — Color Alert System

## Categoría
UX / Retención — Diferenciador Visual

## El Principio

El atleta entra a la app y en 0.3 segundos ya sabe cómo está hoy.
Sin leer números. Sin procesar gráficas. El color lo dice todo.

---

## Paleta de Colores por Estado

| Color | Readiness | Significado CrossFit | Acción sugerida |
|-------|-----------|---------------------|-----------------|
| 🟢 **Verde** | 75-100 | En forma — día para atacar | WOD completo, intentar PRs |
| 🔵 **Azul** | 55-74 | Funcional — día normal | WOD completo, peso conservador |
| 🟡 **Amarillo** | 40-54 | Fatiga moderada | WOD escalado |
| 🟠 **Naranja** | 25-39 | Fatiga alta | Solo técnica o WOD reducido |
| 🔴 **Rojo** | < 25 | No entrenar — recuperar | Descanso activo obligatorio |

---

## ¿Dónde cambia el color?

El sistema coloriza **toda la UI**, no solo un indicador:

```
- Header/navbar → color de fondo
- Tarjeta de readiness → borde y fondo suave
- Botón "Registrar WOD" → color del estado
- Notificaciones del día → color del estado
- Widget en pantalla de inicio del teléfono (si aplica)
```

Ejemplo visual al abrir la app un día rojo:
```
┌─────────────────────────┐
│  🔴 VOLTA              │  ← Header rojo
│                         │
│  READINESS HOY: 23      │
│  "Cuerpo en deuda.      │
│   Descansa hoy."        │
│                         │
│  [Ver WOD adaptado]     │  ← Botón rojo suave
└─────────────────────────┘
```

---

## Mensaje de contexto por color

El color va acompañado de una frase corta y directa (tono CrossFit):

| Color | Frase |
|-------|-------|
| Verde | "Día de atacar. Tu cuerpo está listo." |
| Azul | "Buen día. Entrena sólido." |
| Amarillo | "Escala hoy. Mañana más." |
| Naranja | "Cuerpo en advertencia. WOD reducido." |
| Rojo | "Cuerpo en deuda. Descansa hoy." |

---

## Micro-interacción de confirmación

Si el atleta intenta registrar un WOD duro en un día rojo, VOLTA muestra:

```
⚠️ Tu readiness es 23 hoy.

Registrar este WOD puede aumentar tu riesgo de lesión.

[Continuar de todos modos]   [Ver WOD adaptado]
```

No bloquea — informa. El atleta decide siempre.

---

## Valor diferencial

1. **Experiencia emocional**: la app "siente" el estado del atleta
2. **Habit loop**: abrir la app cada mañana para ver el color = ritual diario
3. **Conversación en el box**: "¿Qué color tienes hoy?" — viraliza entre atletas
4. **Sin friccción cognitiva**: no hay que entender el ACWR para saber si entrenar o no

---

## Integración con activos VOLTA

- **Consume**: `CORE_ENGINES/10_ReadinessEngineCombined` (score del día)
- **Alimenta**: decisión del `CORE_ENGINES/11_SessionAdaptationEngine` (WOD adaptado)
- **Refuerza**: `UX_FLOWS/05_PildorasConocimiento` (el color activa la píldora del día)
