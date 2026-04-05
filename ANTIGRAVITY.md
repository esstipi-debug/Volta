# VOLTA en Google Antigravity

Guía para colaborar en el código VOLTA usando Google Antigravity.

## ¿Qué es Antigravity?

Antigravity es el editor colaborativo interno de Google. Funciona como Google Docs pero para código — permite múltiples usuarios editando archivos simultáneamente, con control de versiones integrado.

## Configuración inicial

### 1. Sincronizar repositorio con Antigravity

```bash
# Opción A: Clonar directamente en Antigravity
# (si Antigravity tiene integración Git)

# Opción B: Copiar archivos manualmente
# Copia la carpeta /wonderful-swanson a tu workspace de Antigravity
```

### 2. Estructura esperada en Antigravity

```
volta/
├── app/                    # Next.js pages
├── src/
│   ├── db/                 # Schema + conexión Neon
│   ├── engines/            # 15 motores
│   ├── lib/                # Auth, utilities
│   ├── workers/            # BullMQ queue
│   └── components/         # React components
├── docs/
│   └── VOLTA_MASTER_DOCUMENT.md
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Flujo de colaboración

### Para leer / navegar código

1. **Abre un archivo en Antigravity** (ej: `src/engines/stressEngine.ts`)
2. **Lee comentarios de docstring** en cada función
3. **Sigue las dependencias** usando Ctrl+Click en imports

### Para editar código

1. **Haz cambios locales** en Antigravity
   - El editor registra automáticamente cambios
   - Versionado integrado (puedes ver historial)

2. **Sincroniza con Git** (si aplica)
   ```bash
   # Desde tu terminal local
   git pull origin [rama]
   # Antigravity te muestra conflictos
   ```

3. **Evita conflictos de merge**
   - **No edites el mismo archivo simultáneamente** que otro colaborador
   - **Comunica con el equipo** si vas a editar un engine o archivo crítico
   - **Usa branches** para trabajo en paralelo (Feature branches, Sprint branches)

### Para código que requiere validación

Los 15 engines tienen **tests**. Antes de mergear cambios en engines:

```bash
npm run test -- src/engines/[engineName].test.ts
```

## Archivos críticos (NO EDITAR sin coordinación)

Estos archivos tienen interdependencias fuertes. Coordina antes de modificar:

| Archivo | Razón | Owner |
|---------|-------|-------|
| `src/db/schema.ts` | Todas las engines dependen del schema | DB Architect |
| `src/engines/stressEngine.ts` | Base para ACWR, Readiness, Gamification | Science Lead |
| `src/lib/auth.ts` | Todos los endpoints dependen | Backend Lead |
| `src/engines/acwrCalculator.ts` | Input a Programming Guide | Science Lead |

## Archivos seguros para editar en paralelo

Estos puedes editar sin problema:

- `app/(auth)/login/page.tsx` — UI solo
- `app/(app)/athlete/dashboard/page.tsx` — UI solo
- Cualquier `.css` o Tailwind
- Archivos de documentación (`.md`)
- `.env.example` (no contiene secretos)

## Best Practices

### ✅ Haz esto

```typescript
// 1. Comenta cambios significativos
/**
 * Engine #01 — StressEngine
 * Cambio: Agregué soporte para movimientos customizados (2026-04-04)
 */

// 2. Seguí la arquitectura existente
// ✅ Usa las constantes del MOVEMENT_CATALOG
const coeff = MOVEMENT_CATALOG[movement_id].stress_coeff

// 3. Mantén los tipos TypeScript
interface StressEngineInput {
  movements: MovementInput[]
  srpe: number
}

// 4. Documenta fórmulas con contexto
// ACWR = EWMA_acute / EWMA_chronic
// λ_acute = 0.25 (half-life ≈ 2.8 días)
```

### ❌ NO hagas esto

```typescript
// ❌ No cambies el schema sin avisar
// ❌ No remuevas funciones (deprecated si no se usa)
// ❌ No modifiques constantes core (COMPTRAIN_MINIMUMS, LAMBDA_ACUTE)
// ❌ No edites .env (solo .env.example)
// ❌ No hagas cambios cosméticos a código crítico (dificulta review)
```

## Flujo de cambios mayores

Si quieres hacer un cambio significativo (ej: refactorizar Engine #14):

1. **Abre un issue** describiendo el cambio
2. **Crea una rama** (`feature/engine-14-refactor`)
3. **Edita en tu rama** sin afectar `main`
4. **Pide review** antes de mergear
5. **Merge** después de aprobación

```bash
# En Antigravity o terminal
git checkout -b feature/engine-14-refactor
# ... edita en Antigravity ...
git push origin feature/engine-14-refactor
# Abre Pull Request
```

## Herramientas útiles

### Búsqueda en Antigravity

```
Ctrl+F   → Buscar en archivo actual
Ctrl+Shift+F → Buscar en todo el workspace (si disponible)
```

### Navegación

```
Ctrl+Click → Ir a definición (si disponible)
Alt+← → Volver a ubicación anterior
```

### Control de versiones

```
Ver historial → Panel "Changes" o "History"
Comparar versiones → "Show diff"
Revertir → "Revert to version"
```

## Troubleshooting

### "Conflicto de merge"

```bash
# En tu terminal
git fetch origin
git rebase origin/main
# Resuelve conflictos en Antigravity
git push origin feature/rama
```

### "No puedo ver los cambios de otro usuario"

1. **Refresh** en Antigravity (Ctrl+R o F5)
2. **Git pull** si es necesario
3. **Reporta** si sigue sin sincronizar

### "Antigravity me muestra un archivo vacío"

- Probablemente el archivo está bien, solo el preview está roto
- Lee el archivo con `cat` desde terminal:
  ```bash
  cat src/engines/stressEngine.ts | head -50
  ```

## Recursos

- **Google Antigravity Help**: Pregunta en Google Chat #antigravity-help
- **VOLTA Docs**: Ver `VOLTA_MASTER_DOCUMENT.md`
- **Architecture**: Ver `README.md`
- **Slack/Teams**: Coordina cambios en canal #volta-dev

---

**Última actualización: 2026-04-04**
