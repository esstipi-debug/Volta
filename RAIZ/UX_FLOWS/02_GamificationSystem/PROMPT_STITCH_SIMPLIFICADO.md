# PROMPTS STITCH — Versión Copiar & Pegar Directa

> Copia cada prompt directamente a Stitch sin modificaciones
> Generará wireframes listos para iterar

---

## PROMPT STITCH #1 — Dashboard (COPIA EXACTA)

```
Create a mobile app dashboard wireframe (375px width, iPhone style) for a CrossFit performance tracking app called VOLTA.

STRUCTURE:
- White background
- Header: 60px with logo "VOLTA" left, menu icon right
- Main content: scrollable
- Bottom navigation: 60px with 4 icons

CONTENT SECTIONS:

1. HERO CARD (120px height)
Background color based on condition:
- If 75+: #10B981 green
- If 55-74: #3B82F6 blue
- If 40-54: #F59E0B amber
- If 25-39: #F97316 orange
- If <25: #EF4444 red

Content:
- Top left: "READINESS" label (gray, small)
- Center: Large number "73"
- Below: Message "Día de caza. Todo vale ×1.5" (white text)
- Bottom right: White button "Ver detalles"

2. STREAK CARD (100px height)
Background: #F3F4F6 light gray
Layout: Left side | Right side
Left:
- Fire emoji 🔥 large
- Number "14" bold
- "DÍAS" label
- "+15% ⚡ bonus" small text

Right:
- Circular progress indicator (60px diameter)
- Shows racha as percentage

3. LEVEL CARD (100px height)
Background: #EDE9FE light purple
Left side:
- "FORJADO" bold title
- "Nivel 3"
- Progress bar: ████████░░ 500/1200 ⚡

Right side:
- "700 ⚡ para TEMPLADO"
- "~3 semanas"

4. BOX CHALLENGE CARD (100px height)
Background: white with border
- Title: "📦 Pull-ups de Marzo"
- Progress: ████████████░ 4,237/5,000
- "763 faltantes"
- "2 días restantes"
- Orange button: "Contribuir"

STYLE:
- Font: Inter sans-serif
- Border radius: 12px
- Padding: 16px
- Shadows: subtle
- Color: #1F2937 for text

BOTTOM NAV:
- Dashboard icon (active, color themed)
- Workouts icon (gray)
- Messages icon (gray)
- Profile icon (gray)

Make it mobile-first and interactive. The hero card should change color if readiness value changes.
```

---

## PROMPT STITCH #2 — Weekly Summary ("Tú vs Tú")

```
Create a modal dialog wireframe for a weekly summary screen in VOLTA.

MODAL SPECS:
- Centered on screen
- 90% width (340px max)
- Scrollable content
- Close X button top right

CONTENT:

Header:
- Emoji "📊"
- Title "TU SEMANA #14"
- Subtitle "Marzo 17-23"

Stats Grid (3 columns):
Column 1:
- Label "WODs"
- Big number "4"
- Small text "vs 3 semana pasada ↑"

Column 2:
- Label "⚡ Voltaje"
- Big number "+340"
- Small text "vs +280 ↑ +21%"

Column 3:
- Label "Racha"
- Emoji "🔥"
- Number "14"
- Check "✅"

Progress Section:
Title: "PROGRESO vs SEMANA PASADA"
- Row 1: "WODs/semana: 3.2 → 3.8  ↑ +19%" (with tiny sparkline chart on right)
- Row 2: "⚡/semana: 180 → 245  ↑ +36%"
- Row 3: "Readiness prom: 61 → 68  ↑ +11%"
- Row 4: "PRs este mes: 1 → 3  ↑ +200%"

New Badges Section:
Title: "🏅 BADGES DESBLOQUEADOS"
- Badge card with emoji 🔥
- Name "Iron Week"
- Small label "COMÚN"
- Add glow effect around badge

Box Stats:
Title: "📦 TU BOX ESTA SEMANA"
- Progress bar: ████████████░ 4,237/5,000 pull-ups
- "Faltan 763 — 2 DÍAS"
- Message: "Si cada atleta suma 200 hoy, terminas mañana 💪"

Buttons (bottom):
- Primary (green): "Seguir entrenando"
- Secondary: "Compartir semana" with share icon

STYLE:
- White background
- Green for positive numbers: #10B981
- Red for negative: #EF4444
- Font: Inter, bold for large numbers
- Border: 1px #E5E7EB
- Shadow: 20px shadow with 10% opacity

ANIMATIONS:
- Modal slides up from bottom
- Numbers flip/count from previous to current value
- Badges scale up with glow effect
```

---

## PROMPT STITCH #3 — Streak Details

```
Create a full-screen wireframe showing streak details in VOLTA.

SCREEN: 375×812px mobile

Header:
- Back button left
- "Tu Racha" centered
- Info icon right

Main Card (200px):
Background: gradient orange to red (#F97316 to #DC2626)
Content:
- Large fire emoji 🔥 (60px)
- Center big number "14" (bold, white)
- "DÍAS CONSECUTIVOS" label (white)
- "+15% ⚡ voltaje" bonus text
- "Tier 14-29 (next tier at 30+)" info
- Positioned indicator showing current tier

Timeline Section:
Title: "TUS ÚLTIMOS 5 DÍAS"
Vertical timeline with left line:
- Today (Day 14): ✅ icon
  Action: "Abriste la app en día azul"
  Time: "08:45 AM"
  Reward: "+5⚡"

- Yesterday (Day 13): ✅ icon
  Action: "Descansaste en día naranja"
  Reward: "+10⚡"

- 2 days ago (Day 12): ✅ icon
  Action: "Registraste WOD en día verde"
  Time: "17:30 PM"
  Reward: "+45⚡"

- 3 days ago: ✅ icon
  Action: "Completaste reto del box"
  Reward: "+75⚡"

- 4 days ago: ✅ icon
  Action: "Leíste una píldora"
  Reward: "+5⚡"

Link: "Ver más..."

Shields Section:
Title: "🛡️ TUS ESCUDOS"
Small text: "Cada 14 días, ganas 1 escudo. Protege 1 día sin entrenar."

Two shield cards:
Shield 1:
- Emoji: 🛡️ (large, 48px)
- Status: "ACTIVO"
- Label: "Escudo 1 de 2"
- Action text: "Usa hoy si no entrenas"

Shield 2:
- Emoji: 🛡️
- Status: "ACTIVO"
- Label: "Escudo 2 de 2"
- Action text: "Usa mañana si no entrenas"

Note: "Próximo escudo en 16 días (Día 30)"

What Breaks It Section:
Background: #FEF2F2 (light red)
Title: "⚠️ ¿CUÁNDO SE ROMPE?"
Bullet points:
- ❌ No abrir la app en 1 día completo
- ✅ Registrar WOD sí suma
- ✅ Abrir app en día rojo sí suma
- ✅ Descansar en día naranja sí suma
- 💡 Los escudos protegen hasta 2 días

STYLE:
- Main colors: orange and red (streak theme)
- Timeline line on left: gray #D1D5DB
- Timeline completed dots: green #10B981
- Font: Inter
- Spacing: generous (16px padding)

INTERACTIONS:
- Swipe down to close
- Tap shield to show confirmation dialog
```

---

## PROMPT STITCH #4 — Badges Gallery

```
Create a full-screen badges gallery for VOLTA.

SCREEN: 375×812px mobile

Header:
- Back button left
- "Mis Badges" title center
- Counter "(12/47)" right

Filter Row:
Horizontal scrollable buttons:
- 🔥 Consistencia ████░ 4/7
- 💪 Rendimiento ██░░░ 2/8
- 🧠 Recuperación ███░░ 3/5
- 👊 Social ██░░░ 2/5
- 📚 Conocimiento █░░░░ 1/4
- 🔒 Secretos ?/?

(Default: show all)

BADGE GRID: 2 columns, scrollable

BADGE CARD 1 (Unlocked - Common):
Background: white
- Emoji: 🔥 (large, 36px)
- Name: "Iron Week"
- Description: "5 WODs en 7 días"
- Rarity label: "COMÚN" (gray)
- "Desbloqueado hace 3 días"
- Category color bar on bottom edge

BADGE CARD 2 (Unlocked - Epic):
Background: #FEF3C7 (light gold)
- Emoji: 💪
- Name: "Fran Sub-4"
- Description: "Fran por debajo de 4:00"
- Rarity: "ÉPICO" (gold)
- "Desbloqueado hace 10 días"
- Gold border / glow effect

BADGE CARD 3 (In Progress):
Background: #F0F9FF (light blue)
Opacity: 70% (indicates locked)
- Emoji: 🧠
- Name: "Zona Segura"
- Description: "ACWR 0.8-1.3 por 30d"
- Rarity: "RARO" (blue)
- Progress: ████░░░░░░ 8/30 días
- "~3 semanas" estimate
- Lock icon overlay

BADGE CARD 4 (Secret - Locked):
Background: #1F2937 (dark gray)
- Emoji: 🔒 (lock)
- Name: "???"
- Description: "Hay quien entrena cuando otros duermen"
- Rarity: "SECRETO"
- Status: "BLOQUEADO"
- Hint text: Small italic text with clue
- Darker styling to hide details

Grid continues with 8-12 cards total showing mix of:
- Unlocked common (3)
- Unlocked rare (2)
- Unlocked epic (1)
- In progress (2)
- Secret locked (2)

Footer:
- Text: "47 badges totales"
- Encouragement: "¡Sigue entrenando inteligente!"
- Button: "Ver logros del box"

STYLE:
Category colors:
- Consistency (🔥): #F97316 orange
- Performance (💪): #EF4444 red
- Recovery (🧠): #3B82F6 blue
- Social (👊): #8B5CF6 purple
- Knowledge (📚): #10B981 green
- Secret (🔒): #6B7280 gray

- Font: Inter
- Cards: 12px border-radius
- Shadows: subtle (2px)
- Icons: 36-48px
- Locked cards: slightly transparent

INTERACTIONS:
- Cards scale on hover (1.05x)
- Click shows expanded modal with full details
- Completed badges have checkmark icon
- Secret badges show hint on hover
```

---

## PROMPT STITCH #5 — Voltage/Level Widget

```
Create a progress widget showing voltage and level in VOLTA.

COMPACT VERSION (for dashboard):

Card Size: 120×140px
Background: #EDE9FE (light purple)
Border radius: 12px

Content:
Top section:
- Emoji: ⚡ (in purple #8B5CF6)
- Name: "FORJADO" (bold, 16px)
- Subtext: "Nivel 3" (gray, 12px)

Progress bar:
- Full width inside card
- ████████████░░░ 500/1200
- Color: #8B5CF6 purple
- Below: "500/1200 ⚡" small text

Bottom info:
- "700 ⚡ para TEMPLADO"
- "~3 semanas" (gray)

---

FULL-SCREEN VERSION (when clicked):

HEADER:
- Back button
- "Tu Progresión"
- Help icon

Current Level Section:
Background gradient: #EDE9FE
- Large title: "FORJADO"
- Subtitle: "Nivel 3 de 10"
- Description: "Ya puedes ver comparativas semanales completas"
- Big progress bar: ████████████░░░ 500/1200 ⚡
- Percentage: "41% del camino"
- Stats: "3 semanas si entrenas 4×/semana"

LEVEL TIMELINE (vertical, scrollable):

Level 1 - NOVATO:
- ⚡ 0
- ✅ COMPLETADO
- Unlock: "App básica, color diario"
- Achieved: "Día 1"
- Color: gray (completed)

Level 2 - INICIADO:
- ⚡ 150
- ✅ COMPLETADO
- Unlock: "Retos del box visibles"
- Achieved: "Día 3"
- Color: gray (completed)

Level 3 - FORJADO ← CURRENT:
- ⚡ 500 (500/1200)
- 🔄 EN PROGRESO
- Unlock: "Radar completo, comparación semanal"
- Estimate: "3 semanas"
- Color: #8B5CF6 (purple, highlighted)
- Indicator: pulsing dot on left

Level 4 - TEMPLADO:
- ⚡ 1,200
- 🔒 BLOQUEADO
- Unlock: "Badge showcase, perfil público"
- Estimate: "~1 mes"
- Color: #BFDBFE light blue (locked)

Levels 5-10:
- Darkened/grayed out
- Locked
- Sequential progression visible

EACH TIMELINE ITEM:
- Left border: 4px color coded
- Vertical connecting line on left
- Completed: ✅ green circle
- Current: 🔄 spinning/pulsing circle
- Locked: 🔒 gray circle

RIGHT SIDEBAR STATS (if space):
- "⚡/día: 98"
- "⚡/semana: +245"
- "Velocidad: +3 niveles en 2 meses"
- "Tendencia: ↑ Acelerando" (green)

Footer message:
"Seguís a buen ritmo. ¡Sigue así! 💪"
Button: "Ver cómo ganar más ⚡"

STYLE:
- Colors by level tier:
  - 1-3: Blues/grays (novice)
  - 4-6: Purples (intermediate)
  - 7-9: Golds (advanced)
  - 10: Rainbow/special (legendary)
- Font: Inter
- Current level: pulsing border animation
- Completed items: green checkmark
- Locked items: gray & semi-transparent

INTERACTIONS:
- Click level: show tooltip with details
- Hover completed level: "Unlocked X days ago"
- Hover locked level: "Complete previous level"
- Mobile: swipe to see all 10 levels
```

---

## QUICK REFERENCE — Paleta VOLTA

```
READINESS STATES:
🟢 Green:  #10B981
🔵 Blue:   #3B82F6
🟡 Yellow: #F59E0B
🟠 Orange: #F97316
🔴 Red:    #EF4444

GAMIFICATION:
⚡ Voltage: #8B5CF6 (purple)
🔥 Streak:  #F97316 → #DC2626 (orange → red)
🏅 Badge:   varies by category
🔒 Secret:  #6B7280 (gray)

NEUTRAL:
White:      #FFFFFF
Gray Light: #F3F4F6
Gray Border:#E5E7EB
Gray Text:  #6B7280
Black Text: #1F2937

SUCCESS/FAIL:
Green:      #10B981
Red:        #EF4444
```

---

## CÓMO USAR ESTOS PROMPTS

1. Abre Stitch en Figma
2. Copia UN PROMPT ENTERO (entre los backticks ```)
3. Pégalo en Stitch
4. Genera el wireframe
5. Itea: ajusta colores, spacing, tipografía
6. Repite con siguiente prompt

**Orden recomendado:**
1. Dashboard (#1)
2. Voltaje (#5)
3. Resumen semanal (#2)
4. Rachas (#3)
5. Badges (#4)
6. Registro WOD (#6)
7. ACWR Dashboard (#7)

---

## PROMPT STITCH #6 — Vista de Entrenamiento (Registro WOD)

```
Create a 4-step mobile workout registration flow for VOLTA (375px width).

GLOBAL STYLE (Light Theme):
- Background: #F8F9FA
- Cards: #FFFFFF with box-shadow: 0 4px 16px rgba(0,0,0,0.06)
- Border radius: 16px
- Font: Inter
- Primary accent: #2563EB (Electric Blue)
- Gamification accent: #F97316 (Orange Energy)
- Voltage accent: #8B5CF6 (Purple)

SHOW ALL 4 STEPS in a single scrollable wireframe, separated by dividers.

─────────────────────────────────────
STEP 1 — TIPO DE WOD
─────────────────────────────────────

Header:
- Back arrow left
- "Registrar WOD" title center
- Step indicator: "Paso 1 de 4" right (gray small)

Step Progress Bar (4 segments):
- Segment 1: filled #2563EB
- Segments 2-4: gray #E5E7EB
- Height: 4px, full width, below header

Content:
- Title: "¿Qué tipo de WOD hiciste?"
- Subtitle: "Selecciona el formato de tu sesión"

WOD Type Grid (2 columns, 3 rows):
Each card 150×90px:
- Card 1: ⏱️ "For Time" — "×1.0 estrés" — white bg, gray border
- Card 2: 🔄 "AMRAP" — "×1.15 estrés" — white bg, gray border
- Card 3 (SELECTED): 🏋️ "Strength" — "×1.3 estrés" — BLUE bg #EFF6FF, blue border #2563EB, blue checkmark top-right
- Card 4: ⏰ "EMOM" — "×0.85 estrés" — white bg
- Card 5: 📊 "Interval" — "×1.2 estrés" — white bg
- Card 6: 📋 "Chipper" — "×1.1 estrés" — white bg

Duration Slider Card:
- White card, 60px height
- Label: "Duración" left
- Slider: full width, filled to 40%
- Value box right: "20 min" blue bold

Button: "Siguiente — Movimientos →"
- Full width, gradient blue, 52px height, rounded-xl

─────────────────────────────────────
STEP 2 — MOVIMIENTOS
─────────────────────────────────────

Step Progress Bar: 2 of 4 filled

Title: "Movimientos del WOD"
Subtitle: "Agrega cada ejercicio"

Movement Card 1 (already added):
White card with soft shadow:
- Row 1: 🏋️ "Back Squat" left | "×1.1" gray pill right | ✕ red button far right
- Row 2: Two input boxes side by side
  - Box 1: "Peso (kg)" label top, "80" large number center, blue border (focused)
  - Box 2: "Reps totales" label top, "50" large number center

Movement Card 2 (already added):
- 🤸 "Pull-ups" | "×1.0" | ✕
- Peso: "0 kg" (bodyweight) | Reps: "30"

"+ Agregar movimiento" button:
- Dashed border, gray text, full width, 48px
- On hover state: show search input with list of movements:
  🏋️ Deadlift ×1.2
  🦵 Front Squat ×1.1
  💥 Clean ×1.15
  ⚡ Snatch ×1.3

IMR Live Preview Card:
- Blue tinted card #EFF6FF
- Left: "IMR estimado" label
- Right: "4,850" large bold #2563EB
- Small text: "Carga externa calculada en tiempo real"

Button: "Siguiente — Esfuerzo percibido →"

─────────────────────────────────────
STEP 3 — sRPE (Percepción de Esfuerzo)
─────────────────────────────────────

Step Progress Bar: 3 of 4 filled

Title: "¿Cómo lo sentiste?"
Subtitle: "Escala CR-10 de esfuerzo — medir 30 min post-WOD"

sRPE Scale (vertical list, 10 rows):
Each row 52px, full width:

Row 1:  [1]🟩 "Muy fácil"     ░░░░░░░░░░ (1 bar)
Row 2:  [2]🟩 "Fácil"         ██░░░░░░░░ (2 bars)
Row 3:  [3]🟨 "Moderado"      ███░░░░░░░
Row 4:  [4]🟨 "Algo difícil"  ████░░░░░░
Row 5:  [5]🟨 "Difícil"       █████░░░░░
Row 6:  [6]🟧 "Difícil +"     ██████░░░░
Row 7 (SELECTED): [7]🟧 "Muy difícil" ███████░░░ — ORANGE border, selected state
Row 8:  [8]🟥 "Extremo"       ████████░░
Row 9:  [9]🟥 "Casi máximo"   █████████░
Row 10: [10]🔴 "Máximo total" ██████████

Each row:
- Left: Colored square with number [N]
- Center: Label text
- Right: Mini bar chart (N filled, 10-N empty)
- Selected state: colored left border 3px, tinted background

Button: "Ver resumen →"

─────────────────────────────────────
STEP 4 — RESUMEN + CONFIRMACIÓN
─────────────────────────────────────

Step Progress Bar: 4 of 4 filled (complete)

Title: "Resumen del WOD"
Subtitle: "Confirma antes de registrar"

Summary Card (white, bordered):
Row 1 (with bottom border):
- 🏋️ "Strength" left | "20 min" gray right

Movements list:
- 🦵 Back Squat — 80kg × 50 reps
- 🤸 Pull-ups — bw × 30 reps

Row last (with top border):
- Left: "Esfuerzo percibido (sRPE)"
- Right: [7] colored badge + "Muy difícil"

Metrics Grid (2 cards side by side):
Card 1 (blue tinted):
- "IMR" label (tiny gray caps)
- "4,850" large bold blue
- "Carga externa"

Card 2 (purple tinted):
- "CTS" label
- "3,795" large bold purple
- "Carga total sesión"

Voltaje Reward Card (purple soft):
- Left: "Voltaje que ganarás" bold + "×1.5 día verde + 15% racha" small
- Right: ⚡ "+52" large bold purple

── PÍLDORA POST-WOD (contextual) ──
Card with LEFT BORDER #F97316 (orange), orange tinted:
- Top row: 💡 "Píldora post-WOD" + "Strength • +5⚡" small right
- Content: "Tip de hombro 🎯 — El dolor en press casi siempre es falta de movilidad torácica. 3 min de Cat-Cow lo cambia."
- Action row: [Guardar +10⚡] button left | "Cerrar" ghost right

CTA Button: "✅ Confirmar y Registrar WOD"
- Full width, GREEN gradient #22C55E → #16A34A, 56px height
- Shadow: 0 8px 24px rgba(34,197,94,0.2)

─────────────────────────────────────
SUCCESS STATE (after confirm)
─────────────────────────────────────

Center of screen, white bg:
- Large circle with green checkmark (animated: stroke draws)
- "¡WOD Registrado!" bold large
- ⚡ "+52" large purple animated counting up
- "Racha: 🔥 15 días (+15% bonus)" small
- "Tu ACWR se actualizará en breve" small gray
- Floating emojis: 🎉 ⚡ 🔥 💪 ✨ (scattered confetti effect)

STYLE NOTES:
- Each step slides in from right (transition)
- IMR updates live as user types reps/weight
- sRPE rows have tap feedback (scale 1.02)
- Confirm button has success flash animation
- Post-WOD píldora slides up from bottom
```

---

## PROMPT STITCH #7 — ACWR Dashboard (Stress Engine View)

```
Create a full-screen ACWR (Acute:Chronic Workload Ratio) dashboard for VOLTA.

SCREEN: 375×812px mobile, Light Theme

GLOBAL STYLE:
- Background: #F8F9FA
- Cards: #FFFFFF with subtle shadows
- Font: Inter
- Border radius: 16px
- Safe zone color: #22C55E green
- Warning color: #F97316 orange
- Danger color: #EF4444 red
- Accent: #2563EB blue

─────────────────────────────────────
HEADER
─────────────────────────────────────
- Back button left (←)
- "Stress Engine" title center
- ⓘ info icon right (triggers ACWR explanation pill)

─────────────────────────────────────
SECTION 1 — HERO: READINESS + ACWR
─────────────────────────────────────

Two-column card (white, 160px):

LEFT COLUMN — Readiness Ring:
- SVG concentric ring, 120px diameter
- Outer ring: #F3F4F6 background
- Progress ring: #3B82F6 (value 82%), stroke-linecap: round
- Center: "82" large bold blue
- Below ring: "READINESS" tiny caps gray
- Under card: "Buen día. Entrena sólido." italic small

RIGHT COLUMN — ACWR Number:
- Label: "ACWR HOY" tiny caps gray
- Big number: "0.91" bold 40px
- Color: #22C55E (green — safe zone)
- Pill badge below: "✅ ZONA SEGURA" green pill
- Range text: "0.80 - 1.30"

Status indicator row below:
- 🟢 dot + "Óptimo para entrenar" green text
- "ACWR calculado con EWMA λ=0.25/0.069" tiny gray right

─────────────────────────────────────
SECTION 2 — 7-DAY ACWR CHART
─────────────────────────────────────

Card title row: "Tendencia 7 días" left | "Ver 28 días" blue link right

Chart (280×160px):
- Smooth spline line chart, #3B82F6 blue
- Area fill below line: blue gradient fading to transparent
- X axis: Lun Mar Mié Jue Vie Sáb Dom
- Y axis labels: 0.6, 0.8, 1.0, 1.2, 1.5, 1.8 (left side)
- Data points (circles on line): 0.92, 0.95, 1.08, 1.12, 1.05, 0.98, 0.91
- TODAY marker: larger circle, blue border white fill, tooltip "Hoy: 0.91"

ZONE BANDS on chart background:
- Green band #22C55E10: between 0.80 and 1.30 (safe zone)
- Orange band #F9731610: between 1.30 and 1.50 (caution)
- Red band #EF444410: above 1.50 (danger)

Zone legend below chart (3 pills horizontal):
- 🟢 "Óptima 0.8-1.3"
- 🟠 "Precaución 1.3-1.5"
- 🔴 "Peligro >1.5"

─────────────────────────────────────
SECTION 3 — 3-LEVEL ALERT SYSTEM
─────────────────────────────────────

Card title: "Sistema de Alertas" | status: "Sin alertas activas ✅" green

Three alert tier rows (stacked):

TIER 1 — GREEN (currently active state):
- Left: 🟢 circle icon
- Center: "Bienestar Subjetivo" bold + "Sueño, estrés, dolor" small gray
- Right: "OK ✅" green pill
- Tap to expand: shows today's values (Sueño 7/10, Estrés 3/10, Dolor 2/10)

TIER 2 — GRAY (not triggered):
- Left: ⚪ circle icon
- Center: "HRV + Sueño" bold + "Vars fisiológicas objetivas" small gray
- Right: "Normal" gray pill
- Expand: HRV trend chart (mini), Sleep duration bar

TIER 3 — GRAY (not triggered):
- Left: ⚪ circle icon
- Center: "ACWR Ajustado" bold + "Ratio agudo:crónico" small gray
- Right: "0.91 ✅" gray pill
- Expand: ACWR formula explanation

Example TRIGGERED state (shown below as reference):
TIER 1 triggered (orange):
- 🟠 icon
- "Bienestar Subjetivo — ⚠️ Alerta"
- Right: "REVISAR" orange pill
- Expanded: "Dolor articular 7/10 detectado. Considera escalar hoy."

TIER 3 triggered (red):
- 🔴 icon
- "ACWR Crítico — 1.67"
- Right: "RIESGO ALTO" red pill
- Expanded: "Tu carga esta semana es 67% mayor que tu promedio. Descansa 48h."

─────────────────────────────────────
SECTION 4 — BANISTER READINESS
─────────────────────────────────────

Card title: "Motor Banister" | "4 curvas independientes" gray small

Four mini cards in 2×2 grid (each 80px):

Card MEC (Muscular, τ=18d):
- Label: "MEC 💪"
- Mini bar: ████████░░ 76/100
- Color: #3B82F6 blue

Card SNC (Nervioso, τ=8d):
- Label: "SNC ⚡"
- Mini bar: ██████░░░░ 61/100
- Color: #8B5CF6 purple

Card MET (Metabólico, τ=4d):
- Label: "MET 🫁"
- Mini bar: █████████░ 88/100
- Color: #22C55E green

Card ART (Articular, τ=30d):
- Label: "ART 🦴"
- Mini bar: ███████░░░ 71/100
- Color: #F97316 orange

Composite readiness = weighted average: "82" shown as before

─────────────────────────────────────
SECTION 5 — PÍLDORA CONTEXTUAL
─────────────────────────────────────

Triggered because user is viewing ACWR for FIRST TIME (Tipo 3 pill):

Card with:
- Left accent border: #2563EB blue, 4px
- Background: #EFF6FF (very light blue)
- Top row: 🔢 icon + "Píldora: ¿Qué es el ACWR?" bold | "MÉTRICAS VOLTA" tiny caps right | "+5⚡"
- Content text:
  "Es la relación entre tu carga de esta semana
  y tu promedio de las últimas 4 semanas.
  >1.3 = riesgo alto | 0.8–1.3 = zona segura
  El tuyo hoy: 0.91 ✅"
- Action row: [💾 Guardar +10⚡] blue button | "Cerrar" ghost text right

─────────────────────────────────────
SECTION 6 — CTA ACCIÓN
─────────────────────────────────────

Two buttons:
- Primary (blue): "Registrar WOD de hoy" full width
- Secondary ghost: "Ver mi Radar 10D" with 🎯 icon

Small gamification note below:
- "💡 WOD en día azul = ×1.0 ⚡ | Descanso en naranja = +10⚡"

─────────────────────────────────────
BONUS: PÍLDORA MISTERIOSA variant
─────────────────────────────────────

Show at bottom as alternative state:

Card with:
- GOLD border #D97706, 2px
- Background: #FFFBEB (amber tinted)
- Lock/mystery icon: 📦 golden
- Title: "📦 Píldora Misteriosa"
- Content: blurred/obscured text "??? ??? ??? ???"
- "Toca para revelar" small italic
- "+15⚡" gold badge top-right corner
- Tap state: reveals content with scale-up animation

STYLE NOTES:
- Chart line animates drawing left-to-right on load
- Ring strokes animate filling on enter
- Zone bands appear with fade-in
- Alert tiers expand/collapse with smooth height animation
- Banister bars animate filling from 0 on scroll-into-view
- Píldora card slides up from bottom after 1.5s delay
```

---

## PROMPT STITCH #8 — Biblioteca de Píldoras

```
Create a knowledge library screen for VOLTA called "Mis Píldoras".

SCREEN: 375×812px mobile, Light Theme

STYLE:
- Background: #F8F9FA
- Cards: white with soft shadow
- Accent saved: #2563EB blue
- Accent unread: #F97316 orange
- Font: Inter

─────────────────────────────────────
HEADER
─────────────────────────────────────
- Back button left
- "Mis Píldoras" title center
- "📚 Guardar +10⚡" small pill top right (reminder mechanic)

─────────────────────────────────────
STATS ROW
─────────────────────────────────────

3 mini cards horizontal:
- Card 1: "12" bold | "Guardadas" gray small
- Card 2: "📚 Estudiante" bold blue | "7/10 guardadas" small (badge in progress)
- Card 3: "+85⚡" bold purple | "Por píldoras" small

─────────────────────────────────────
CATEGORY TABS (horizontal scroll)
─────────────────────────────────────

Scrollable tab row:
- "Todas" ACTIVE (blue bg, white text)
- "🔴 Recuperación"
- "💪 Técnica"
- "🔢 Métricas VOLTA"
- "🌙 Menstrual"
- "🧑‍🏫 De mi Coach"

─────────────────────────────────────
FEATURED — PÍLDORA MISTERIOSA
─────────────────────────────────────

Full-width card, gold gradient border:
- Background: linear gradient #FFFBEB → #FEF3C7
- Large icon: 📦 (40px)
- "PÍLDORA MISTERIOSA" caps gold
- Blurred text: "???  ???  ???  ???"
- "Toca para revelar • +15⚡" centered italic
- Pulsing golden border animation

─────────────────────────────────────
SAVED PILLS LIST
─────────────────────────────────────

Pill Card 1 — RECOVERY (read):
- Left: 🔴 color dot
- Category badge: "RECUPERACIÓN" tiny caps red
- Title: "Descansar es entrenar"
- Preview: "Después de 48h de descanso, la síntesis proteica sube 40%..."
- Bottom row: "Hace 3 días" gray | 💾 saved icon right

Pill Card 2 — TECHNIQUE (unread, highlighted):
- Orange left border 3px (unread indicator)
- Left: 💪 dot
- Category: "TÉCNICA" orange
- Title: "Kipping sin base = hombro lesionado"
- Preview: "¿Tienes 10 strict pull-ups? Si no, considera ring rows..."
- Bottom row: "Hoy" orange bold | "NUEVA" orange pill | 💾 icon

Pill Card 3 — METRICS:
- Left: 🔢 blue dot
- Category: "MÉTRICAS VOLTA"
- Title: "¿Qué es el ACWR?"
- Preview: ">1.3 riesgo alto | 0.8-1.3 zona segura | El tuyo hoy: 0.91"
- Bottom row: "Hace 1 semana" | 💾 icon

Pill Card 4 — MENSTRUAL:
- Left: 🌙 purple dot
- Category: "CICLO MENSTRUAL"
- Title: "Fase Lútea y RPE"
- Preview: "Tu RPE será más alto hoy aunque estés igual de fuerte..."
- Bottom row: "Hace 2 semanas" | 💾 icon

Pill Card 5 — COACH:
- Left: 🧑‍🏫 teal dot
- Category: "DE QUINTO ELEMENTO" (coach name)
- Title: "Por qué alternamos Press/Push Press"
- Preview: "Press horizontal y vertical activan diferentes fibras..."
- Bottom row: "De tu coach" teal | 💾 icon

─────────────────────────────────────
EMPTY STATE (when category has 0 pills)
─────────────────────────────────────

Center of screen:
- Large icon: 📭 (60px)
- "Aún no tienes píldoras de esta categoría"
- "Se desbloquean automáticamente al entrenar"
- Ghost button: "Registrar WOD y desbloquear"

─────────────────────────────────────
PILL DETAIL MODAL (tap on any card)
─────────────────────────────────────

Bottom sheet, 85% height:
- Handle bar top center
- Category color header bar 4px
- Large icon (40px)
- Category + date row
- Full title bold 20px
- Full content text (3-5 lines)
- Source/context: "Activada por: día rojo detectado"
- Gamification row: ⚡ +5 leída | ⚡ +10 guardada
- Two buttons: [💾 Guardar +10⚡] blue | [Compartir] ghost

STYLE NOTES:
- Unread pills have orange left border 3px
- Read pills have gray left border
- Mysterious pill has gold pulsing border
- Cards have gentle shadow and 16px radius
- Tap expands to modal with slide-up animation
- XP counter in header updates in real-time when pill is saved
```
