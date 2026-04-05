---
name: Sistema de Gamificación VOLTA (Blueprint Adictivo)
description: Sistema de gamificación de baja fricción integrado con Color Alert, Píldoras, Pulse Engine — diseñado para retención diaria
type: UX_FLOW
estado: DISEÑADO — LISTO PARA IMPLEMENTACIÓN MVP
fecha: 2026-03-27
---

# Activo #02 — Sistema de Gamificación VOLTA

## Filosofía de Diseño

- **Cero fricción**: gamifica acciones que el atleta YA hace
- **Adictivo > educativo**: dopamina primero, información después
- **No castiga descanso**: descansar en día rojo da MÁS reward que entrenar
- **Social pero no red social**: el box es la unidad, no el mundo
- **Funciona día 1**: enganche en primeras 72 horas
- **Simple de implementar**: MVP con 1-2 desarrolladores

Referencias de éxito: Duolingo (streaks), Strava (social + PRs), Whoop (score matutino)

---

## 1. ARQUITECTURA DEL LOOP ADICTIVO

### Loop Diario

```
TRIGGER              → ACCIÓN          → REWARD VARIABLE       → INVERSIÓN
─────────────────────────────────────────────────────────────────────────────
Notif matutina:      → Abre la app     → Color del día +       → Racha +1
"Tu color hoy: 🟢"     (0.3s señal)      mensaje sorpresa       (no quiere
                                          + streak counter        perderla)
                                          + ¿badge nuevo?

Post-WOD:            → Registra WOD    → Animación de ⚡       → Barra de
"Registra tu WOD"       (ya lo haría)     + posible badge         nivel sube
                                          + posible PR
                                          + posición en box
```

**Variable reward diario:**
- El color es diferente → mensaje diferente → oportunidades diferentes
- Día verde: posibilidad de PR badge, voltaje ×1.5
- Día rojo: badge "Smart Rest" disponible, píldora especial
- Random: 1 de cada 5 días aparece "bonus drop" (voltaje doble en siguiente acción)

### Loop Semanal

- **Lunes**: Reto semanal del box se activa
- **Viernes**: Progreso visible del reto + quién lidera
- **Domingo**: Resumen semanal ("Tu semana en 30 segundos") — XP total, comparación vs TU semana anterior, próximo nivel

```
┌─────────────────────────────────┐
│  TU SEMANA #14                  │
│                                 │
│  WODs: 4  │  Racha: 🔥 12 días │
│  ⚡: +340  │  Nivel: Forjado 3  │
│                                 │
│  vs semana pasada: ↑ +15% vol   │
│                                 │
│  🏅 Badge nuevo: "Iron Week"   │
│                                 │
│  Tu box esta semana:            │
│  ████████████░  4,237/5,000     │
│  pull-ups — FALTAN 763          │
└─────────────────────────────────┘
```

### Loop Mensual

- Día 1: Nuevo reto mensual del box + misión personal (basada en debilidad del radar)
- Último día: "Cierre VOLTA" → tu mes en datos → badge mensual → comparación vs mes pasado

### Primeras 72 Horas (Onboarding)

```
HORA 0 (Registro)
├── "Elige tu nombre de atleta"
├── Calibración: 1RM de 3 movimientos
├── Se genera primer radar (incompleto)
├── → Badge: "Primer Voltaje ⚡" (+50⚡)
└── → "Tu color de mañana será..." (cliffhanger)

HORA 24 (Día 2)
├── Notificación: "Tu primer color: 🟢/🔵/🟡"
├── Registra primer WOD
├── → Animación de ⚡ volando al perfil
├── → Badge: "Primera Descarga" (+50⚡)
├── → Píldora contextual al WOD
└── → "Mañana: racha de 2. No la pierdas."

HORA 48 (Día 3)
├── Notificación: "🔥 Racha de 2. ¿Vienes hoy?"
├── Registra WOD o abre app (ambos cuentan)
├── → Badge: "Triple Voltaje ⚡⚡⚡" (+50⚡)
├── → Se desbloquea: acceso al reto del box
└── → "Ya estás en el radar del box."

RESULTADO: 3 badges, 150+ ⚡, racha de 3, radar visible, posición en box.
```

---

## 2. SISTEMA DE PROGRESIÓN

### Moneda: VOLTAJE (⚡)

| Nivel | Nombre | ⚡ necesario | Tiempo estimado | Desbloquea |
|-------|--------|-------------|-----------------|------------|
| 1 | Novato | 0 | Día 1 | App básica, color diario |
| 2 | Iniciado | 150 | Día 3 | Retos del box visibles |
| 3 | Forjado | 500 | Semana 2 | Radar completo, comparación semanal |
| 4 | Templado | 1,200 | Mes 1 | Badge showcase en perfil público del box |
| 5 | Curtido | 2,500 | Mes 2 | Estadísticas avanzadas, historial PRs |
| 6 | Acero | 4,500 | Mes 4 | Crear retos personales, tema oscuro |
| 7 | Titán | 7,500 | Mes 7 | Insights predictivos |
| 8 | Forja Viva | 12,000 | Mes 12 | Acceso a beta features |
| 9 | Leyenda | 18,000 | Mes 18+ | Título visible en leaderboard |
| 10 | VOLTA | 30,000 | Mes 30+ | Perfil dorado, badge exclusivo |

**Curva:** Niveles 1-3 en 2 semanas (enganche). 4-7 mensual (retención). 8-10 trimestral+ (status).

### Acciones que generan Voltaje

| Acción | ⚡ | Cap |
|--------|---|-----|
| Abrir app y ver color | +5 | 1/día |
| Registrar WOD | +30 | 2/día |
| WOD en día verde (respetando readiness) | +45 (×1.5) | — |
| Descansar en día rojo | +20 | 1/día |
| Descansar en día naranja | +10 | 1/día |
| PR personal | +100 | sin cap |
| Completar reto semanal del box | +75 | 1/semana |
| Completar reto mensual | +200 | 1/mes |
| Leer píldora | +5 | 1/día |
| Guardar píldora | +10 | 1/día |
| Bonus racha 7 días | +50 | 1/semana |
| Bonus racha 30 días | +300 | 1/mes |
| Primer benchmark (Fran, Murph...) | +50 | 1/benchmark |

```
┌─────────────────────────────────┐
│  ⚡ FORJADO — Nivel 3           │
│  ████████████░░░░  500/1200 ⚡  │
│  700 para TEMPLADO              │
│  ~3 semanas si entrenas 4×/sem  │
└─────────────────────────────────┘
```

---

## 3. SISTEMA DE STREAKS Y PÉRDIDA

### La Racha VOLTA (🔥)

**Premia interacción diaria con VOLTA, NO entrenar diario.**

| Acción del día | ¿Suma racha? |
|----------------|-------------|
| Registrar WOD | ✅ +1 |
| Abrir app en día rojo y NO entrenar | ✅ +1 (Smart Rest) |
| Abrir app en día naranja y NO entrenar | ✅ +1 |
| No abrir la app | ❌ Racha rota |
| Entrenar en día rojo | ⚠️ +1 pero sin bonus |

### Pérdida al romper racha

- Pierdes: multiplicador activo de voltaje
- Pierdes: posición en "racha más larga del box"
- Conservas: todo tu voltaje y nivel (NUNCA pierdes progresión permanente)

### Escudos (🛡️)

- Ganas 1 escudo cada 14 días de racha consecutiva
- Máximo 2 escudos acumulados
- Protege 1 día de inactividad automáticamente

### Multiplicador de racha

| Racha | Bonus |
|-------|-------|
| 1-6 días | +0% |
| 7-13 días | +10% voltaje |
| 14-29 días | +15% |
| 30-59 días | +20% |
| 60+ días | +25% (cap) |

---

## 4. BADGES / LOGROS (47 total)

### Consistencia (🔥) — 7 badges

| Badge | Condición | Rareza |
|-------|-----------|--------|
| Primer Voltaje | Primer WOD registrado | Común |
| Iron Week | 5 WODs en 7 días | Común |
| Máquina del Mes | 20+ WODs en 30 días | Raro |
| Racha 30 | 30 días de racha activa | Raro |
| Racha 100 | 100 días de racha | Épico |
| Racha 365 | 365 días de racha | Legendario |
| El Que No Falla | 48 semanas de mín. 3 WODs | Legendario |

### Rendimiento (💪) — 8 badges

| Badge | Condición | Rareza |
|-------|-----------|--------|
| Primera Descarga | Primer WOD registrado | Común |
| PR Hunter | Primer PR en cualquier movimiento | Común |
| Doble PR | 2 PRs en la misma semana | Raro |
| Fran Sub-4 | Fran < 4:00 | Raro |
| Murph Sub-40 | Murph < 40:00 | Épico |
| Bodyweight Snatch | Snatch = peso corporal | Épico |
| 2× BW Deadlift | Deadlift = 2× peso corporal | Épico |
| Decatleta | Todas las dimensiones del radar ≥6/10 | Legendario |

### Recuperación Inteligente (🧠) — 5 badges

| Badge | Condición | Rareza |
|-------|-----------|--------|
| Smart Rest | Descansar en día rojo 3 veces | Común |
| Zona Segura | ACWR entre 0.8-1.3 por 30 días | Raro |
| El Paciente | 5 días rojo descansados sin romper racha | Raro |
| Anti-Frágil | ACWR nunca >1.5 en 90 días | Épico |
| Maestro del Readiness | 80% de WODs en días verde/azul en 60 días | Épico |

### Social / Box (👊) — 5 badges

| Badge | Condición | Rareza |
|-------|-----------|--------|
| Del Box | Completar primer reto colectivo | Común |
| Top 3 | Top 3 en un reto del box | Raro |
| El Motor | Mayor contribución a reto colectivo | Raro |
| Pulse | Participar en 5 retos colectivos | Raro |
| Leyenda del Box | Top 3 en 3 retos consecutivos | Épico |

### Conocimiento (📚) — 4 badges

| Badge | Condición | Rareza |
|-------|-----------|--------|
| Curioso | Leer primera píldora | Común |
| Estudiante | Guardar 10 píldoras | Común |
| Erudito | Guardar 50 píldoras | Raro |
| Sabio VOLTA | Leer todas las píldoras de una categoría | Épico |

### 🔒 Secretos — 5 badges (no aparecen hasta desbloquearlos)

| Badge | Condición | Pista |
|-------|-----------|-------|
| El Madrugador | WOD antes de 6AM × 5 | "??? — Hay quien entrena cuando otros duermen" |
| Noche de Lobos | WOD después de 9PM × 5 | "??? — La barra no duerme" |
| El Equilibrista | Radar con todas dimensiones entre 5-7 | "??? — A veces el balance es la fuerza" |
| Comeback | Volver tras 14+ días inactivo + 7 WODs seguidos | "??? — La mejor historia es la del que volvió" |
| Hermandad | 3 atletas del box con racha 30+ simultánea | "??? — Solo no se llega" |

### Distribución de rareza

| Rareza | Cantidad | % del total |
|--------|----------|-------------|
| Común | 10 | 29% |
| Raro | 13 | 38% |
| Épico | 10 | 29% |
| Legendario | 3 | 9% |
| Secreto | 5 | (+15%) |

```
┌─────────────────────────────────┐
│  MIS BADGES (12/47)             │
│                                 │
│  🔥 Consistencia    ████░  4/7  │
│  💪 Rendimiento     ██░░░  2/8  │
│  🧠 Recuperación    ███░░  3/5  │
│  👊 Social          ██░░░  2/5  │
│  📚 Conocimiento    █░░░░  1/4  │
│  🔒 Secretos        ?/?         │
│                                 │
│  Próximo más cercano:           │
│  🧠 "Zona Segura" — faltan 8d  │
└─────────────────────────────────┘
```

---

## 5. INTEGRACIÓN CON SISTEMAS EXISTENTES

### Color Alert × Gamificación

| Color | Multiplicador ⚡ | Reward por descanso | Mensaje gamificado |
|-------|------------------|--------------------|--------------------|
| 🟢 Verde | ×1.5 en WOD | — | "Día de caza. Todo vale más." |
| 🔵 Azul | ×1.0 | — | "Día sólido. Suma voltaje." |
| 🟡 Amarillo | ×1.0 | — | "Escala y suma. Inteligente > intenso." |
| 🟠 Naranja | ×0.8 en WOD | +10⚡ | "Descansar hoy = entrenar mejor mañana." |
| 🔴 Rojo | ×0.5 en WOD | +20⚡ | "Tu cuerpo pide pausa. Respétalo y gana." |

```
┌─────────────────────────────────┐
│  🔴 VOLTA — Readiness 22        │
│                                 │
│  "Tu cuerpo pide pausa."        │
│                                 │
│  Hoy descansando ganas:         │
│  +20⚡ Smart Rest                │
│  +1🔥 Racha (sí, cuenta)        │
│  → Progreso: Smart Rest 2/3     │
│                                 │
│  [Confirmar descanso ✅]         │
│  [Registrar WOD de todos modos] │
└─────────────────────────────────┘
```

### Píldoras × Gamificación

- Leer píldora: +5⚡
- Guardar píldora: +10⚡
- Completar categoría → badge
- **Píldora misteriosa** (1 de cada 10): borde dorado, contenido oculto hasta tocar. +15⚡ por descubrirla.

```
┌─────────────────────────────────┐
│  📦 PÍLDORA MISTERIOSA           │
│  ┌───────────────────────┐      │
│  │  ??? ??? ??? ??? ???  │      │
│  │  Toca para revelar    │      │
│  │  +15⚡                 │      │
│  └───────────────────────┘      │
└─────────────────────────────────┘
```

### Pulse Engine × Gamificación

| Reto | Reward individual | Reward colectivo |
|------|-------------------|------------------|
| Reto semanal completado | +75⚡ | Box completa: +50⚡ bonus TODOS |
| Top 3 del reto | Badge "Top 3" | — |
| Reto mensual | +200⚡ | Box completa: badge colectivo |
| Racha colectiva (10+ atletas 7+ días) | — | +25⚡ cada uno + badge "Hermandad" |

### Dashboard Unificado

```
┌─────────────────────────────────────────┐
│  🟢 VOLTA          ⚡ 2,847  🔥 14 días │
│  ─────────────────────────────────────  │
│                                         │
│  READINESS: 82                          │
│  "Día de caza. Todo vale ×1.5"          │
│                                         │
│  ┌─────────┐  ┌──────────────────────┐  │
│  │ NIVEL 4 │  │  RACHA    │ ESCUDOS  │  │
│  │Templado │  │  🔥 14    │ 🛡️ 1    │  │
│  │████░ 62%│  │  +15% ⚡  │          │  │
│  └─────────┘  └──────────────────────┘  │
│                                         │
│  📦 RETO DEL BOX: Pull-ups             │
│  ████████████░  4,237/5,000  — 2 días   │
│                                         │
│  [Registrar WOD]     [Ver mi radar]     │
└─────────────────────────────────────────┘
```

**Solo 3 números arriba:** Voltaje total, racha, readiness. Todo lo demás un tap de distancia.

---

## 6. LEADERBOARDS SIN DESMOTIVACIÓN

### Diseño "Spotlight" (nunca lista completa)

```
┌─────────────────────────────────────┐
│  📊 RETO MARZO — 30 WODs en 30d    │
│                                     │
│  🥇 Ana López         28 WODs      │
│  🥈 Carlos Mesa       27 WODs      │
│  🥉 María García      26 WODs      │
│  ─────────────────────────────────  │
│  TÚ: #8 de 18 — 22 WODs           │
│  "6 WODs más para entrar al top 5"  │
└─────────────────────────────────────┘
```

- Top 3 siempre visible (aspiracional)
- TU posición + distancia al siguiente escalón
- NUNCA ves quién está debajo de ti

### Ligas por Nivel

| Liga | Niveles | Competencia |
|------|---------|-------------|
| Novato | 1-3 | Solo contra novatos del box |
| Forjado | 4-6 | Intermedios |
| Titán | 7-10 | Veteranos |

### Tú vs Tú (default, siempre primero)

```
┌─────────────────────────────────────┐
│  📈 TÚ vs TÚ (30 días)             │
│                                     │
│  WODs/semana:    3.2 → 3.8  ↑ 19%  │
│  ⚡/semana:      180 → 245  ↑ 36%  │
│  Readiness prom: 61  → 68   ↑ 11%  │
│  PRs este mes:   1   → 3    ↑ 200% │
│                                     │
│  "Mejor mes en todas las métricas"  │
└─────────────────────────────────────┘
```

---

## 7. ANTI-GAMING

### Caps

| Acción | Cap | Si excedes |
|--------|-----|-----------|
| WODs registrados | 2/día | Tercero no genera ⚡ |
| Abrir app reward | 1/día | Solo primera apertura |
| Píldoras | 1/día | Solo 1 aparece |
| PR claims | Sin cap | Saltos >120% requieren confirmación coach |

### WODs sospechosos

- IMR > 2× promedio → flag → coach recibe alerta → voltaje retenido 48h
- WOD intenso en día rojo → voltaje ×0.5 + alerta coach

### Techo semanal anti-overtraining

| WODs/semana | Voltaje que recibes |
|-------------|-------------------|
| 3-5 días | 100% |
| 6 días | 90% |
| 7 días | 75% + mensaje pro-descanso |

**Invisible hasta que aplica.** El sistema empuja orgánicamente hacia 4-5 WODs/semana.

---

## 8. PRIORIZACIÓN MVP

### MVP (Mes 1) — 3 mecánicas

| # | Mecánica | Impacto | Esfuerzo | Por qué |
|---|---------|---------|----------|---------|
| 1 | Racha + escudos | 🔥🔥🔥🔥🔥 | Bajo | Streaks retienen 2.5× más (Duolingo) |
| 2 | Color × voltaje variable | 🔥🔥🔥🔥 | Bajo | Ya existe el color, solo añadir multiplicador |
| 3 | Resumen semanal + Tú vs Tú | 🔥🔥🔥🔥 | Medio | El espejo de progresión |

+ 10 badges iniciales (3 comunes, 4 raros, 2 épicos, 1 secreto)
+ Niveles 1-6

### V2 (Mes 2-3)

- 47 badges completos
- Píldoras misteriosas
- Leaderboard box con ligas
- Pulse × voltaje
- Anti-gaming completo
- Onboarding 72h completo

### V3 (Mes 6+)

- Ligas por nivel
- Misiones mensuales personalizadas
- Temporadas (reset trimestral de ligas)
- Coach gamification (badges del coach)
- Niveles 7-10

### NUNCA implementar

| Mecánica | Por qué NO |
|----------|-----------|
| Castigo por descanso | Contradice misión VOLTA |
| Leaderboard completo 1-N | Desmotiva al 70% inferior |
| Comprar voltaje con dinero | Destruye confianza |
| Notificaciones >2/día | Churn por molestia |
| Punición de equipo | Genera culpa |
| Reset de nivel por inactividad | Pérdida permanente = abandono permanente |

---

## INTEGRACIÓN CON CONFRONTATION RETENTION LOOP

El "Confrontation Loop" (antes Activo #01 UX_FLOWS) no es un sistema separado — **es la mecánica "Tú vs Tú" de la gamificación.**

Cuando el resumen semanal muestra:
```
📈 TÚ vs TÚ (30 días)
WODs/semana:    3.2 → 3.8  ↑ 19%
Readiness prom: 61  → 68   ↑ 11%
```

Eso es **confrontación con datos.** El atleta ve su progreso y se responsabiliza.

Integración:
- La mecánica de resumen semanal (gamificación) YA implementa la confrontación
- No necesita un módulo separado
- Elimina redundancia: 1 sistema que hace ambas cosas

---

## Integración con activos VOLTA

- **Consume**: `CORE_ENGINES/10_ReadinessEngineCombined` (color del día, readiness score)
- **Consume**: `CORE_ENGINES/01_StressEngineIMR` (voltaje por WOD registrado)
- **Integra**: `UX_FLOWS/03_ColorAlertSystem` (multiplicadores por color)
- **Integra**: `UX_FLOWS/05_PildorasConocimiento` (XP por leer/guardar, píldoras misteriosas)
- **Integra**: `UX_FLOWS/04_PulseEngine` (rewards colectivos de box)
- **Alimenta**: `CORE_ENGINES/14_SmartCoachAlerts` (métricas de engagement → alertas de retención)
