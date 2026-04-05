# PROMPT STITCH — Gamificación VOLTA en Figma

> Objetivo: Visualizar en Figma cómo se vería el sistema de gamificación VOLTA
> Herramienta: Stitch (Figma plugin para generar mocks a partir de prompts)
> Resultado esperado: Wireframes interactivos de las 5 pantallas clave

---

## 📋 PROMPT 1 — Dashboard Principal (Color Alert + Racha + Nivel)

```
Crea un wireframe de Figma para un dashboard de app móvil de fitness (VOLTA).

LAYOUT:
- Header: 40px, fondo sólido
- Body: lista scrollable
- Bottom nav: 60px

CONTENIDO:

Header:
├── Logo "VOLTA" (izquierda, texto blanco)
└── Botón menú (derecha, 24×24px icon)

Hero Card (120px altura):
├── Color de fondo: DINÁMICO SEGÚN READINESS
│   ├── Si readiness 75+: #10B981 (verde)
│   ├── Si readiness 55-74: #3B82F6 (azul)
│   ├── Si readiness 40-54: #F59E0B (amarillo)
│   ├── Si readiness 25-39: #F97316 (naranja)
│   └── Si readiness <25: #EF4444 (rojo)
├── Contenido:
│   ├── "READINESS" (label gris pequeño)
│   ├── Número grande: "73"
│   ├── Mensaje contextual: "Día de caza. Todo vale ×1.5" (blanco, 12px)
│   └── Botón "Ver detalles": fondo blanco semi-transparente
└── Shadow: sutil (2px offset, 10% black)

Tarjeta Racha (100px):
├── Contenido izquierda:
│   ├── Emoji: "🔥"
│   ├── Número: "14"
│   ├── Label: "días"
│   └── Subtexto: "+15% ⚡ bonus"
├── Contenido derecha:
│   └── Barra circular de progreso (60px) mostrando racha como % de "60 días"
└── Background: #F3F4F6 (gris claro)

Tarjeta Nivel (100px):
├── Izquierda:
│   ├── Nombre nivel: "FORJADO" (bold)
│   ├── Número: "Nivel 3"
│   └── Progreso: "████████░░ 500/1200 ⚡"
├── Derecha:
│   ├── Indicador: "700 ⚡ para TEMPLADO"
│   └── Estimación: "~3 semanas si entrenas 4×/sem"
└── Background: #EDE9FE (lila claro)

Sección "RETO DEL BOX" (100px):
├── Título: "📦 Pull-ups de Marzo"
├── Barra de progreso: "████████████░ 4,237/5,000"
├── Faltan: "763 pull-ups"
├── Tiempo: "— 2 días"
└── Botón CTA: "Contribuir hoy"

Bottom Nav:
├── Dashboard (activo): color tema
├── Entrenamientos: gris
├── Mensajes: gris
└── Perfil: gris

ESTILO:
- Tipografía: Inter (sans-serif)
- Bordes: 12px border-radius
- Espaciado: 16px padding interno
- Colores neutrales: #F3F4F6 (fondo), #1F2937 (texto)

Genera un mockup interactivo que muestre cómo cambia el header y hero card si cambias el readiness a 32 (rojo), 50 (amarillo).

IMPORTANTE: Hazlo mobile-first, 375×812px (iPhone).
```

---

## 📋 PROMPT 2 — Resumen Semanal ("Tú vs Tú")

```
Crea un wireframe de pantalla modal en Figma para el resumen semanal de VOLTA.

CONTEXTO:
Cada domingo a las 10:00 AM, el atleta abre la app y ve un modal con su resumen de la semana.
Es la mecánica principal de "confrontación de datos" + gamificación.

LAYOUT:
- Modal centrado (90% ancho, max 340px)
- Scrollable vertical si contenido desborda
- Botón X cerrar (arriba derecha)

CONTENIDO:

Header Modal:
├── Emoji: "📊"
├── Título: "TU SEMANA #14"
└── Subtítulo: "Marzo 17-23"

Stats Grid (3 columnas):
├── Fila 1:
│   ├── Col 1: "WODs" + "4" (grande) + "vs 3 la semana pasada ↑"
│   ├── Col 2: "⚡ Voltaje" + "+340" + "vs +280 ↑ +21%"
│   └── Col 3: "Racha" + "🔥 14" + "sin romper ✅"
└── (backgrounds sutiles en colores suaves)

Comparación vs Semana Anterior:
├── Encabezado: "PROGRESO vs SEMANA PASADA"
├── Row 1: "WODs/semana: 3.2 → 3.8  ↑ +19%"  (gráfico sparkline arriba a la derecha)
├── Row 2: "⚡/semana: 180 → 245  ↑ +36%"
├── Row 3: "Readiness prom: 61 → 68  ↑ +11%"
└── Row 4: "PRs este mes: 1 → 3  ↑ +200%"

Badges Nuevos:
├── Encabezado: "🏅 BADGES DESBLOQUEADOS ESTA SEMANA"
├── Card 1: "Iron Week" + emoji 🔥 + rareza "COMÚN"
└── Bonito efecto de "destello" alrededor del badge

Box Colectivo:
├── Encabezado: "📦 TU BOX ESTA SEMANA"
├── Barra: "████████████░ 4,237/5,000 pull-ups"
├── Faltan: "763 — FALTAN 2 DÍAS"
└── Motivación: "Si cada atleta suma 200 hoy, terminas mañana 💪"

Buttons (en footer del modal):
├── Botón primary (verde): "Seguir entrenando"
└── Botón secondary: "Compartir semana" (share icon)

ESTILO:
- Fondo modal: blanco con border 1px #E5E7EB
- Shadow: 20px shadow (10% black)
- Tipografía: Inter
- Números grandes: 28px, bold, color tema (verde si mejora, rojo si empeora)
- Colores positivos: #10B981 (verde)
- Colores negativos: #EF4444 (rojo)

ANIMACIONES (si aplica):
- Modal entra desde abajo (slide-up)
- Badges aparecen con efecto de "pop" (scale + fade)
- Números "flipping" desde valor anterior al nuevo (opcional)

IMPORTANTE:
- Hazlo visualmente satisfactorio (gamificación)
- Los números grandes y colores vibrantes son importantes
- El efecto de "destello" alrededor de badges crea dopamina
```

---

## 📋 PROMPT 3 — Sistema de Rachas (Streak & Escudos)

```
Crea un wireframe de pantalla en Figma mostrando el sistema de rachas de VOLTA.

CONTEXTO:
El usuario toca en el emoji 🔥 del header para ver detalles de su racha y escudos.

LAYOUT:
- Pantalla completa (375×812px)
- Header sticky en top
- Body scrollable

HEADER:
├── Back button (izquierda)
├── Título: "Tu Racha" (centro)
└── Info icon (derecha)

Sección Principal — Racha Actual:

Tarjeta Grande (200px altura):
├── Número central: "14"
├── Emoji: "🔥" (muy grande, 60px)
├── Label: "DÍAS CONSECUTIVOS"
├── Bonus multiplicador: "+15% ⚡ voltaje en todas las acciones"
├── Progreso a siguiente tier:
│   ├── Línea: "Dia 7-13: +10%  |  14-29: +15%  |  30+: +20%"
│   └── Indicador: "TÚ ESTÁS AQUÍ" (flecha señalando 14-29)
└── Background: gradiente de naranja a rojo (#F97316 → #DC2626)

Historias de Racha (Timeline vertical):
├── Hoy (Día 14):
│   ├── Indicador: ✅
│   ├── Acción: "Abriste la app en día azul"
│   ├── Hora: "08:45 AM"
│   └── +5⚡
├── Ayer (Día 13):
│   ├── Indicador: ✅
│   ├── Acción: "Descansaste en día naranja"
│   ├── Hora: "—"
│   └── +10⚡
├── 2 días atrás (Día 12):
│   ├── Indicador: ✅
│   ├── Acción: "Registraste WOD en día verde"
│   ├── Hora: "17:30 PM"
│   └── +45⚡
└── Más... (load more)

Sección Escudos (Shields):
├── Título: "🛡️ TUS ESCUDOS"
├── Explicación pequeña: "Cada 14 días de racha activa, ganas 1 escudo. Protege 1 día de inactividad."
├── Grid 2 escudos:
│   ├── Escudo 1:
│   │   ├── Emoji grande: "🛡️"
│   │   ├── Estado: "ACTIVO"
│   │   ├── Label: "Escudo 1 de 2"
│   │   └── "Usa hoy si no entrenas"
│   └── Escudo 2:
│       ├── Emoji grande: "🛡️"
│       ├── Estado: "ACTIVO"
│       ├── Label: "Escudo 2 de 2"
│       └── "Usa mañana si no entrenas"
└── Próximo escudo: "Gana en 16 días de racha (Día 30)"

Sección ¿Qué rompe la racha?

Card informativo:
├── Encabezado: "⚠️ ¿CUÁNDO SE ROMPE?"
├── Bullet points:
│   ├── "❌ No abrir la app en 1 día entero"
│   ├── "✅ Registrar WOD (sí suma)"
│   ├── "✅ Abrir app en día rojo (sí suma)"
│   ├── "✅ Descansar en día naranja (sí suma)"
│   └── "💡 Los escudos protegen hasta 2 días"
└── Background: #FEF2F2 (rojo claro)

ESTILO:
- Colores racha: naranja → rojo (gradiente)
- Timeline: línea gris izquierda con puntos verdes (✅ completado)
- Tipografía: Inter
- Números: 32px, bold
- Emoji: 40-60px

INTERACTIVOS:
- Tocando "Usar escudo" aparece un modal de confirmación
- Timeline scrollable horizontalmente si hay muchos días
```

---

## 📋 PROMPT 4 — Badges & Logros

```
Crea un wireframe de pantalla en Figma mostrando la galería de badges de VOLTA.

CONTEXTO:
El usuario accede a "Mis Badges" desde el perfil. Ve todos los badges desbloqueados y progreso hacia los próximos.

LAYOUT:
- Pantalla completa
- Header sticky
- Grid scrollable de badges

HEADER:
├── Título: "Mis Badges"
├── Contador: "(12/47)"
└── Filtro dropdown (por categoría)

STAT BAR — Categorías de Badges:

Fila 1 (6 botones toggleables):
├── 🔥 Consistencia: ████░ 4/7
├── 💪 Rendimiento: ██░░░ 2/8
├── 🧠 Recuperación: ███░░ 3/5
├── 👊 Social: ██░░░ 2/5
├── 📚 Conocimiento: █░░░░ 1/4
└── 🔒 Secretos: ?/? (oculto)

(Default: mostrar TODOS)

GRID DE BADGES (2 columnas, scrollable):

Tarjeta Badge Desbloqueado:
├── Grande:
│   ├── Emoji/Icono: "🔥"
│   ├── Nombre: "Iron Week"
│   ├── Descripción: "5 WODs en 7 días"
│   ├── Rareza badge: "COMÚN" (gris)
│   ├── Desbloqueado: "Hace 3 días"
│   └── Background: gradiente sutil (color según categoría)
└── En hover: se agranda un poco (scale 1.05)

Tarjeta Badge Desbloqueado (Épico):
├── Nombre: "Fran Sub-4"
├── Descripción: "Fran por debajo de 4:00"
├── Rareza: "ÉPICO" (dorado)
├── Desbloqueado: "Hace 10 días"
├── Efecto visual: brillo dorado alrededor
└── Background: #FEF3C7 (amarillo suave)

Tarjeta Badge Próximo/En Progreso:
├── Nombre: "Zona Segura"
├── Descripción: "ACWR entre 0.8-1.3 por 30 días"
├── Rareza: "RARO" (azul claro)
├── Progreso: "████░░░░░░ 8/30 días"
├── Tiempo estimado: "~3 semanas"
├── Background: #F0F9FF (azul muy claro)
└── Opacidad: 70% (aún no desbloqueado)

Tarjeta Badge Secreto:
├── Nombre: "???"
├── Descripción: "Hay quien entrena cuando otros duermen"
├── Rareza: "SECRETO" (gris oscuro)
├── Estado: "BLOQUEADO"
├── Pista: "Entrena muy temprano para desbloquear"
├── Background: #1F2937 (gris oscuro)
└── Icono candado: 🔒

DISTRIBUCIÓN:
Col 1:
├── Iron Week (COMÚN, ✅)
├── Zona Segura (RARO, 8/30)
├── Fran Sub-4 (ÉPICO, ✅)
└── El Madrugador (SECRETO, 🔒)

Col 2:
├── Triple Voltaje (COMÚN, ✅)
├── Anti-Frágil (ÉPICO, ✅)
├── Smart Rest (COMÚN, ✅)
└── Hermandad (SECRETO, 🔒)

FOOTER:
├── Estadística: "47 badges totales en el sistema"
├── Encouragement: "¡Sigue entrenando inteligente!"
└── Botón: "Ver logros del box" (secundario)

ESTILO:
- Cada categoría tiene su color:
  - 🔥 Consistencia: #F97316 (naranja)
  - 💪 Rendimiento: #EF4444 (rojo)
  - 🧠 Recuperación: #3B82F6 (azul)
  - 👊 Social: #8B5CF6 (púrpura)
  - 📚 Conocimiento: #10B981 (verde)
  - 🔒 Secreto: #6B7280 (gris)
- Border-radius: 16px para tarjetas
- Sombra suave en hover

ANIMACIONES:
- Badges desbloqueados: aparecen con efecto "pop" (scale + fade)
- En hover: scale 1.05 + sombra más pronunciada
- En click: muestra modal con descripción extendida
```

---

## 📋 PROMPT 5 — Voltaje + Progreso de Nivel (Mini Panel)

```
Crea un wireframe de Figma mostrando el panel de progreso de voltaje/nivel.

CONTEXTO:
Es el widget que aparece en varias pantallas (dashboard, post-WOD). Muestra voltaje actual, nivel, y progreso hacia el siguiente nivel.

LAYOUT OPCIÓN A — Card Compacta (para dashboard):

┌───────────────────────────┐
│  ⚡ FORJADO — Nivel 3    │
│  ████████████░░░  500/1200│
│  700 para TEMPLADO        │
│  ~3 semanas si entrenas   │
│  4×/semana               │
└───────────────────────────┘

Contenido detallado:
├── Encabezado:
│   ├── Icono: ⚡ (amarillo)
│   ├── Nombre nivel: "FORJADO" (bold, 16px)
│   └── Número: "Nivel 3" (gris, 12px)
├── Barra de progreso:
│   ├── ████████████░░░ (color tema violeta)
│   ├── Número: "500/1200 ⚡"
│   └── Porcentaje: 41%
├── Información:
│   ├── "700 ⚡ para próximo nivel"
│   └── "~3 semanas si entrenas 4×/semana"
└── Background: #EDE9FE (violeta claro)

LAYOUT OPCIÓN B — Pantalla Completa (cuando tocas en el widget):

HEADER:
├── Back button
├── Título: "Tu Progresión"
└── Help icon

SECCIÓN NIVEL ACTUAL:
├── Nombre grande: "FORJADO"
├── Número: "Nivel 3 de 10"
├── Descripción: "Ya puedes ver comparativas semanales completas"
├── Barra de progreso grande:
│   └── ████████████░░░ 500/1200 ⚡
└── Estadística: "41% del camino a TEMPLADO"

TIMELINE VERTICAL — Todos los Niveles:

├── Nivel 1 — NOVATO
│   ├── ⚡ 0 (completado)
│   ├── Estado: ✅ COMPLETADO
│   ├── Desbloqueó: App básica, color diario
│   └── Alcanzado: Día 1

├── Nivel 2 — INICIADO
│   ├── ⚡ 150 (completado)
│   ├── Estado: ✅ COMPLETADO
│   ├── Desbloqueó: Retos del box visibles
│   └── Alcanzado: Día 3

├── Nivel 3 — FORJADO ← TÚ ESTÁS AQUÍ
│   ├── ⚡ 500 (500/1200 — 41%)
│   ├── Estado: 🔄 EN PROGRESO
│   ├── Desbloqueará: Radar completo, comparación semanal
│   ├── Estimación: 3 semanas (4 WODs/sem)
│   └── Indicador: pulsante (animated dot)

├── Nivel 4 — TEMPLADO
│   ├── ⚡ 1,200 (no alcanzado)
│   ├── Estado: 🔒 BLOQUEADO
│   ├── Desbloqueará: Badge showcase, perfil público en box
│   └── Estimación: ~1 mes desde nivel 3

└── Niveles 5-10
    ├── Oscurecidos (grises)
    └── Progresivamente desbloqueables

CADA TARJETA DE NIVEL:
├── Color fondo: blanco si completado, gris si bloqueado
├── Icono: ✅ si completado, 🔒 si bloqueado, 🔄 si actual
├── Border izquierdo: 4px color tema
├── En hover (si bloqueado): muestra tooltip "Completa nivel anterior"

STATS SIDEBAR (derecha, si hay espacio):
├── Voltaje/día promedio: "98 ⚡/día"
├── Voltaje/semana: "+245 ⚡ promedio"
├── Velocidad de progresión: "+3 niveles en 2 meses"
└── Trending: "↑ Acelerando" (verde)

FOOTER:
├── Encouragement: "Seguís a buen ritmo. Sigue así! 💪"
└── Botón: "Ver cómo ganar más ⚡" (link a FAQ)

ESTILO:
- Colores por nivel:
  - 1-3: Grises/azules (novicio)
  - 4-6: Violetas (intermedio)
  - 7-9: Dorados (avanzado)
  - 10: Arcoíris/especial (legendario)
- Tipografía: Inter
- Timeline: línea vertical izquierda con puntos (✅ / 🔄 / 🔒)
- Animación: el nivel actual tiene un "pulse" sutil (borde que late)

INTERACTIVOS:
- Click en nivel completado: muestra tooltip "Desbloqueado hace X días"
- Click en nivel bloqueado: muestra tooltip con requisito
- Swipe horizontal en mobile: ver próximos 3 niveles
```

---

## INSTRUCCIONES DE USO

Para cada prompt:

1. **Abre Stitch en Figma**
2. **Copia y pega el prompt completo**
3. **Stitch genera un wireframe inicial**
4. **Ajusta manualmente:**
   - Colores exactos según paleta VOLTA
   - Tipografía: Inter 400/500/600/700
   - Spacing: multiples de 4px o 8px
5. **Añade interactividad:**
   - Prototypes (click → siguiente pantalla)
   - Estados hover (botones, cards)
   - Animaciones (opcionales pero impactantes)

---

## PALETA DE COLORES VOLTA

```
Primarios:
- Verde (readiness 75+): #10B981
- Azul (readiness 55-74): #3B82F6
- Amarillo (readiness 40-54): #F59E0B
- Naranja (readiness 25-39): #F97316
- Rojo (readiness <25): #EF4444

Neutrales:
- Background: #FFFFFF (blanco)
- Surface: #F3F4F6 (gris 100)
- Border: #E5E7EB (gris 200)
- Text: #1F2937 (gris 900)
- Text light: #6B7280 (gris 500)

Especiales:
- Voltaje: #8B5CF6 (púrpura)
- Racha: #F97316 → #DC2626 (gradiente naranja-rojo)
- Secreto: #6B7280 (gris oscuro)
- Éxito: #10B981 (verde)
```

---

## ORDEN RECOMENDADO DE GENERACIÓN

1. **Primero:** PROMPT 1 (Dashboard) — contexto general
2. **Segundo:** PROMPT 5 (Voltaje/Nivel) — aparece en muchos lugares
3. **Tercero:** PROMPT 2 (Resumen semanal) — experiencia emocional clave
4. **Cuarto:** PROMPT 3 (Rachas) — profundidad mecánica
5. **Quinto:** PROMPT 4 (Badges) — galería visual

---

## PRÓXIMOS PASOS DESPUÉS DE STITCH

- [ ] Exportar wireframes como PDF
- [ ] Crear prototype interactivo (click paths)
- [ ] Validar con usuario: ¿se entiende la gamificación?
- [ ] Iterar colores/espaciado según feedback
- [ ] Pasar a diseño de alta fidelidad
- [ ] Comenzar development en React/TypeScript
