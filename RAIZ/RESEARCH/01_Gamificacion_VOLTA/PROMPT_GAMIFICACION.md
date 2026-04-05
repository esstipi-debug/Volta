# PROMPT — Diseño de Sistema de Gamificación Adictivo para VOLTA

> Objetivo: Generar un blueprint de gamificación simplificado, de baja fricción y altamente adictivo para una plataforma de rendimiento CrossFit.
> Uso: Copiar y pegar este prompt en una sesión nueva de IA con contexto limpio.

---

## EL PROMPT

```
Eres un diseñador de producto especializado en behavioral design, gamificación y loops adictivos para apps deportivas. Tu referencia de éxito NO es la gamificación académica — es lo que hace Duolingo, Strava, Whoop y Candy Crush para que la gente no pueda dejar de abrir la app.

Tu trabajo: diseñar el sistema de gamificación más adictivo posible para VOLTA, una plataforma de rendimiento y prevención de lesiones para CrossFit.

---

## CONTEXTO DE VOLTA (lo que ya existe)

### Qué hace VOLTA
VOLTA cuantifica la carga de cada sesión de entrenamiento de CrossFit usando 4 vectores de estrés biológico:
- **MEC** (Muscular): daño en fibras, lo que duele al día siguiente
- **SNC** (Nervioso): coordinación y potencia explosiva, lo que te deja "frito"
- **MET** (Metabólico): deuda de oxígeno, lo que te deja sin aire
- **ART** (Articular): estrés en tendones y ligamentos

Con esos datos calcula:
- **Readiness** (0-100): qué tan listo estás para entrenar hoy
- **ACWR** (ratio de carga): si estás en zona segura o de riesgo de lesión
- **Perfil de rendimiento**: radar de 10 dimensiones (fuerza, cardio, potencia, etc.)

### Usuarios
- **Atleta individual**: registra WODs, ve su estado, recibe recomendaciones ($5/mes)
- **Coach de box**: gestiona 10-30 atletas, ve alertas, crea programación ($1-3/mes por atleta)

### 5 sistemas UX que YA existen y deben integrarse con la gamificación

**1. Color Alert System**
La app cambia de color según tu readiness:
- 🟢 Verde (75-100): "Día de atacar"
- 🔵 Azul (55-74): "Entrena sólido"
- 🟡 Amarillo (40-54): "Escala hoy"
- 🟠 Naranja (25-39): "WOD reducido"
- 🔴 Rojo (<25): "Descansa hoy"
El atleta abre la app → 0.3 segundos ya sabe cómo está. Sin leer números.

**2. Píldoras de Conocimiento (MUST — obligatorio integrar)**
Micro-educación contextual invisible. Máximo 1 por sesión. Se activan por:
- Estado del día (color rojo → píldora de recuperación)
- Movimiento registrado (snatch → tip de hombro)
- Primera vez que ves una métrica (ACWR → explicación)
- Fase menstrual
- El coach puede crear píldoras personalizadas
El atleta aprende sin sentir que estudia. ~100 píldoras en banco inicial.

**3. Pulse Engine (Desafíos colectivos de box)**
Retos entre atletas del mismo box:
- Consistencia: "30 WODs en 30 días" (leaderboard del box)
- Volumen colectivo: "5,000 pull-ups entre todos esta semana"
- Benchmarks: ranking del box en Fran, Murph, etc.
- Streaks: racha colectiva del box
El coach crea los retos. Feed de actividad simple (sin comentarios, solo 👊 reactions).

**4. Smart Coach Alerts**
Alertas proactivas al coach: riesgo de lesión, picos de rendimiento, atletas que van a abandonar.

**5. Session Adaptation Engine**
Si tu readiness es bajo, VOLTA adapta automáticamente el WOD (menos reps, menos peso, más descanso).

---

## LO QUE NECESITO QUE DISEÑES

Un sistema de gamificación que cumpla estas 7 reglas:

### REGLA 1 — CERO FRICCIÓN
- Toda la gamificación ocurre sobre acciones que el atleta YA hace (registrar WOD, abrir la app, mejorar un tiempo)
- El atleta NUNCA tiene que hacer algo extra solo por gamificación
- Si una mecánica requiere un paso adicional, elimínala

### REGLA 2 — ADICTIVO, NO EDUCATIVO
- El objetivo es que el atleta abra la app todos los días, no que "aprenda"
- Usa los mismos loops que usan Duolingo (streaks + pérdida), Strava (social + PRs), Whoop (score matutino)
- Variable reward > reward predecible. El atleta no debe saber exactamente qué va a pasar cuando abre la app
- El dolor de perder debe ser mayor que el placer de ganar (loss aversion)

### REGLA 3 — INTEGRADO CON LOS 5 SISTEMAS
- No es una capa separada — vive DENTRO del Color Alert, las Píldoras, el Pulse Engine
- Ejemplo: el color verde no solo indica readiness, también significa que hoy puedes desbloquear X
- Las píldoras de conocimiento pueden dar XP o revelar algo
- El Pulse Engine es inherentemente gamificado, solo necesita XP/rewards

### REGLA 4 — NO CASTIGAR POR DESCANSAR
- CrossFit tiene cultura de "más es mejor" que causa lesiones
- VOLTA previene lesiones. La gamificación NO puede premiar sobreentrenamiento
- Descansar en día rojo debe dar más reward que entrenar en día rojo
- Respetar tu readiness = acción gamificable positiva

### REGLA 5 — SOCIAL PERO NO RED SOCIAL
- El box (gimnasio) es la unidad social natural en CrossFit
- Los atletas ya se comparan en el pizarrón del box
- Leaderboards sí, pero con diseño que NO desmotive a los de abajo
- Comparación con tu yo pasado > comparación con otros

### REGLA 6 — FUNCIONA DESDE EL DÍA 1
- Un atleta nuevo debe sentir la gamificación en su primera sesión
- No "desbloqueas gamificación después de X días" — eso es fricción
- Onboarding gamificado que enganche inmediatamente

### REGLA 7 — SIMPLE DE IMPLEMENTAR
- El MVP se construye con 1-2 desarrolladores
- Prioriza mecánicas que requieran poco backend
- Nada de NFTs, tokens, blockchain, o mecánicas que requieran marketplace
- Prioridad: lo que genera más adicción con menos código

---

## ENTREGABLES EXACTOS QUE NECESITO

### ENTREGABLE 1 — Arquitectura del Loop Adictivo
- ¿Cuál es el loop diario? (trigger → acción → reward variable → inversión)
- ¿Cuál es el loop semanal?
- ¿Cuál es el loop mensual?
- ¿Cómo se engancha al atleta las primeras 72 horas?
- Diagrama simple de cada loop

### ENTREGABLE 2 — Sistema de Progresión
- Niveles, XP, o equivalente (pero con nombre CrossFit, no genérico)
- ¿Qué acciones dan progresión? (con valores concretos)
- ¿Qué desbloquea cada nivel? (features, cosméticos, privilegios)
- Curva de dificultad (fácil al inicio, progresivamente más exigente)
- ¿Cuántos niveles? ¿Cuánto tarda en llegar al máximo un atleta activo?

### ENTREGABLE 3 — Sistema de Streaks y Pérdida
- ¿Cómo funcionan las rachas? (diaria, semanal, por tipo)
- ¿Qué pierdes cuando rompes la racha? (loss aversion concreto)
- ¿Hay "escudos" o protección de racha?
- ¿Cómo evitas que la racha premie sobreentrenamiento? (día de descanso = mantiene racha?)

### ENTREGABLE 4 — Badges / Logros
- Lista completa de badges con nombre, condición exacta, y rareza
- Categorías de badges (mínimo: consistencia, rendimiento, recuperación inteligente, social, conocimiento)
- ¿Hay badges secretos? ¿Cuáles?
- ¿Los badges son visibles para otros? ¿Dónde?

### ENTREGABLE 5 — Integración con Color Alert + Píldoras + Pulse
- ¿Cómo cambia la gamificación según el color del día?
- ¿Las píldoras dan XP? ¿Desbloquean algo?
- ¿El Pulse Engine (retos de box) da rewards diferentes a los individuales?
- ¿Cómo se visualiza todo junto en el dashboard sin ruido visual?

### ENTREGABLE 6 — Leaderboards sin Desmotivación
- Diseño de leaderboard que no destruya a los de abajo
- ¿Hay categorías/ligas? ¿Cómo se agrupan?
- ¿Qué ve el #1 vs el #15 de 18 atletas?
- Alternativas al leaderboard clásico (comparación con tu yo pasado, etc.)

### ENTREGABLE 7 — Anti-Gaming
- ¿Cómo evitas que alguien infle datos para ganar XP?
- ¿Hay caps diarios/semanales?
- ¿Qué pasa si alguien registra 5 WODs en un día?
- ¿Cómo previenen que la gamificación incentive overtraining?

### ENTREGABLE 8 — Priorización MVP
- ¿Qué 3 mecánicas implementas primero? (máximo impacto, mínimo esfuerzo)
- ¿Qué dejas para V2?
- ¿Qué NO implementas nunca?
- Tabla de priorización: mecánica | impacto en retención | esfuerzo de dev | orden

---

## RESTRICCIONES DE FORMATO

- Sé concreto y específico. "Badge de consistencia" no sirve — "Badge 'Iron Week': registra 5 WODs en 7 días" sí sirve.
- Cada mecánica debe tener un ejemplo visual (mockup en texto/ASCII) de cómo se ve en la app.
- Usa lenguaje de CrossFit donde aplique (WOD, PR, box, AMRAP, RX, scaled).
- Si una idea requiere más de 2 oraciones para explicarla, es demasiado compleja. Simplifícala.
- Prioriza dopamina sobre información. Si una pantalla puede mostrar un número o una animación de celebración, elige la animación.
```

---

## NOTAS PARA EL USUARIO

- **Dónde usar este prompt**: En una sesión nueva de IA (Claude, GPT-4, etc.) con contexto limpio
- **Complementar con**: Adjuntar el `ARCHIVO_MAESTRO_VOLTA.md` como contexto adicional si la IA lo permite
- **Resultado esperado**: Blueprint completo de gamificación listo para implementar en el MVP
- **Tiempo estimado**: La IA debería producir un documento de 3,000-5,000 palabras con los 8 entregables
