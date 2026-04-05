# Guía Rápida — Usando Stitch para Visualizar Gamificación VOLTA

---

## ¿QUÉ ES STITCH?

Stitch es un plugin de Figma que genera wireframes a partir de prompts en lenguaje natural.

**En 3 pasos:**
1. Copia un prompt
2. Pégalo en Stitch
3. Genera wireframes en segundos

---

## OPCIÓN A — Prompts Detallados (Si tienes tiempo)

**Archivo:** `PROMPT_STITCH_GAMIFICACION.md`

✅ **Pros:**
- Muy detallados (explicaciones contextuales)
- Incluyen ejemplos visuales (ASCII art)
- Especifican interactividad y animaciones

❌ **Contras:**
- Largos (5 prompts de 100+ líneas cada uno)
- Requieren más edición manual después

**Cuándo usar:** Si quieres controlar exactamente cómo se ve cada detalle.

---

## OPCIÓN B — Prompts Simplificados (Recomendado) ⭐

**Archivo:** `PROMPT_STITCH_SIMPLIFICADO.md`

✅ **Pros:**
- Copiar & pegar directo
- Más cortos, enfocados
- Stitch genera rápido sin demasiada "ruidosidad"

❌ **Contras:**
- Menos controle sobre detalles finales
- Necesitarás iterar en Figma después

**Cuándo usar:** Para un MVP rápido. La mayoría de equipos usan esto.

---

## PASO A PASO — Opción B (Recomendado)

### 1. Abre Figma

- Ve a figma.com
- Abre un proyecto nuevo o existente
- Asegúrate de que Stitch esté instalado (si no: Assets → Plugins → Busca "Stitch")

### 2. Abre Stitch

- En la pantalla de Figma, ve a Plugins → Stitch
- Se abrirá un panel en la derecha

### 3. Genera Dashboard (PROMPT #1)

En `PROMPT_STITCH_SIMPLIFICADO.md`:
- Encuentra "PROMPT STITCH #1 — Dashboard"
- **Copia TODO desde el primer ```** hasta el último ```
- Pégalo en el cuadro de texto de Stitch
- Click en "Generate"

**Tiempo:** 15-30 segundos

**Resultado:** Un wireframe mobile con:
- Header + logo
- Hero card (readiness con color dinámico)
- Tarjeta racha (🔥14 días)
- Tarjeta nivel (FORJADO Nivel 3)
- Tarjeta reto del box
- Bottom nav

### 4. Genera Voltaje/Nivel (PROMPT #5)

Siguiente:
- Copia "PROMPT STITCH #5"
- Pégalo en Stitch
- Generate

**Resultado:** Widget de progresión + pantalla completa de niveles

### 5. Genera Resumen Semanal (PROMPT #2)

- Copia "PROMPT STITCH #2"
- Generate

**Resultado:** Modal "Tú vs Tú" con estadísticas de la semana

### 6. Genera Rachas (PROMPT #3)

- Copia "PROMPT STITCH #3"
- Generate

**Resultado:** Pantalla de detalles de racha + escudos

### 7. Genera Badges (PROMPT #4)

- Copia "PROMPT STITCH #4"
- Generate

**Resultado:** Galería de badges con mix de desbloqueados/en progreso/secretos

---

## DESPUÉS DE STITCH — Iteración en Figma

Una vez que Stitch genera los wireframes, necesitarás:

### Paso 1: Organiza los frames

- Stitch pone cada wireframe en un frame separado
- Crea un artboard limpio (File → New file)
- Organiza: Dashboard, Voltaje, Resumen, Rachas, Badges en página separadas

### Paso 2: Aplica paleta de colores

Stitch no siempre interpreta exactamente los colores. Necesitarás ajustar:

```
COLORES A VERIFICAR:
- Hero card (debe cambiar de color según readiness)
- Barra de voltaje (debe ser #8B5CF6 púrpura)
- Racha gradient (debe ser #F97316 → #DC2626)
- Text colors (debe ser #1F2937 para párrafos)
```

### Paso 3: Ajusta tipografía

Stitch puede usar tipografías por default. Cambia a:
- **Inter** 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Tamaños: 12px (label), 14px (body), 16px (subtitle), 20px (title), 24px+ (big numbers)

### Paso 4: Añade Interactividad (Prototypes)

En Figma, crea "Interactions":
- Hero card → toca → abre pantalla de detalles de readiness
- Widget voltaje → toca → abre pantalla de niveles completa
- Botón "Compartir semana" → muestra share sheet
- Cards de badges → toca → muestra modal expandido

**Figma → Prototype tab → Click → Choose action**

### Paso 5: Añade Animaciones (Opcional pero impactante)

Para versión "wow factor":
- Dashboard hero card: **fade in** (0.3s) cuando carga
- Números de estadísticas: **count-up** (1s) al abrir resumen semanal
- Badges: **scale up + glow** (0.5s) cuando se desbloquean
- Racha: **pulse** (infinito) si está a punto de romperse

**Nota:** Las animaciones se especifican en Figma prototype → interactions → animation

---

## CHECKLIST — Lo que NO DEBE FALTAR

- [ ] El color del hero card cambia según readiness (🟢/🔵/🟡/🟠/🔴)
- [ ] El número de voltaje/nivel tiene barra de progreso clara
- [ ] Las rachas muestran timeline de últimas 5 acciones
- [ ] Los escudos se ven desbloqueables (no grises)
- [ ] Los badges tienen mezcla de desbloqueados/en progreso/secretos
- [ ] Resumen semanal muestra comparativa vs semana anterior (% subida)
- [ ] Botones son tocables (hover state visible)
- [ ] La paleta de colores VOLTA está aplicada correctamente
- [ ] Tipografía es Inter en todos lados
- [ ] Mobile-first (375×812px para iPhones)

---

## TROUBLESHOOTING

### Stitch genera algo raro

**Solución:**
- Copia el prompt entero de nuevo (sin modificaciones)
- Si persiste, reduce el prompt a 50% de su tamaño
- Genera de nuevo

### Los colores no son exactos

**Solución:**
- Stitch interpreta colores en inglés (e.g., "green" → no es exactamente #10B981)
- Después de generar, selecciona cada elemento y ajusta color manualmente
- Usa la paleta de colores VOLTA incluida en el prompt

### No me salen iconos/emojis

**Solución:**
- Stitch puede no soportar emojis complejos
- Después, añade emojis manualmente en Figma
- O usa SF Symbols (iOS) o Material Icons (Android)

### Quiero cambiar algo

**Solución:**
- Regenera TODO el prompt con los cambios descritos
- O edita directamente en Figma después de generar

---

## TIEMPO ESTIMADO

| Tarea | Tiempo |
|-------|--------|
| Generar 5 wireframes con Stitch | 5 min |
| Iterar colores + tipografía | 15 min |
| Añadir interactividad (prototypes) | 20 min |
| Añadir animaciones (opcional) | 15 min |
| **TOTAL** | **55 min** |

**O puedes hacer solo los wireframes bases** (5 min + 15 min = 20 min) y después completar durante desarrollo.

---

## PRÓXIMOS PASOS DESPUÉS DE STITCH

1. ✅ **Wireframes listos** (Stitch)
2. → **Validar con usuario** — ¿se entiende? ¿es atractivo?
3. → **Pasar a diseño de alta fidelidad** — colores finales, micro-interactions
4. → **Comenzar implementación React/TypeScript**

---

## COMANDOS RÁPIDOS DE FIGMA

```
Cmd+A           Seleccionar todo en frame
Cmd+D           Duplicar elemento
Cmd+Shift+K     Convertir a component
Shift+H         Navegar a home
R               Herramienta rectángulo
T               Herramienta texto
I               Herramienta eyedropper (color picker)
Shift+2         Zoom a 100%
Shift+1         Zoom a fit all
```

---

## LINKS ÚTILES

- **Figma:** figma.com
- **Stitch Plugin:** figma.com/community/plugin/...
- **VOLTA Gamification:** Ver `FICHA_TECNICA.md` en mismo directorio
- **Paleta de colores:** Ver `GUIA_RAPIDA_STITCH.md` (aquí) al final

---

## PREGUNTAS FRECUENTES

**P: ¿Puedo exportar los wireframes a HTML?**
A: No, pero puedes exportar como PDF para documentación o como PNG para compartir.

**P: ¿Necesito Figma Pro?**
A: No, la versión gratuita es suficiente para wireframes. Pro te da más features de prototype.

**P: ¿Puedo modificar los prompts?**
A: Sí, pero recuerda que Stitch interpreta lenguaje natural. Menos detalles = generación más rápida. Más detalles = más preciso pero más lento.

**P: ¿Cómo muestro esto a stakeholders?**
A: Figma permite compartir links. File → Share → Get link. Puedes dar acceso de "view-only".

**P: ¿Puedo automatizar esto?**
A: Sí, con Figma API + script, pero para MVP es overkill. Usa Stitch manual.

---

## VERSIÓN SUPER RÁPIDA (5 MINUTOS)

Si REALMENTE tienes prisa:

1. Abre Figma
2. Nueva página: "VOLTA Gamification"
3. Abre Stitch
4. Copia PROMPT #1 (Dashboard) → Generate
5. Manda a usuario para que vea:
   - "Esto es lo que ve cuando abre la app"
   - Color + readiness + racha + nivel + reto del box
6. Listo.

**El feedback del usuario en 5 min es mejor que wireframes perfectos en 2 horas.**

---

¡A generar! 🚀
