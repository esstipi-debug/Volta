# VOLTA Development Setup

Guía completa para desarrollar VOLTA en tu máquina local.

## Requisitos previos

- **Node.js 18+** (verify: `node --version`)
- **npm 9+** o **yarn** (verify: `npm --version`)
- **Git** (verify: `git --version`)
- **Cuenta Neon** (PostgreSQL) — [neon.tech](https://neon.tech) — free tier
- **Cuenta Upstash** (Redis) — [upstash.com](https://upstash.com) — free tier

## Instalación (5 min)

### 1. Clonar repositorio

```bash
git clone https://github.com/[user]/volta.git
cd volta
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Copiar template
cp .env.example .env

# Editar .env con tus credenciales
nano .env  # o tu editor preferido
```

**Mínimos requeridos:**
- `DATABASE_URL` — Neon PostgreSQL
- `NEXTAUTH_SECRET` — Generar: `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3000`

### 4. Inicializar base de datos

```bash
npm run db:migrate
npm run db:studio   # (opcional) Abre Drizzle Studio en navegador
```

### 5. Iniciar servidor

```bash
npm run dev
```

**Output:**
```
> next dev -p 3000

▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Environments: .env
```

Abre **http://localhost:3000** en tu navegador.

## Stack Setup Detallado

### Neon PostgreSQL (base de datos)

1. **Crear cuenta**: [neon.tech](https://neon.tech)
2. **Crear proyecto** (free tier: 3 projects)
3. **Copiar connection string**:
   ```
   DATABASE_URL=postgresql://user:password@host:port/volta_prod
   ```

**Verificar conexión:**
```bash
npm run db:studio
# Debe abrir Drizzle Studio en navegador
```

### Upstash Redis (queue + cache)

1. **Crear cuenta**: [upstash.com](https://upstash.com)
2. **Crear base de datos Redis** (free tier: 1 db)
3. **Copiar REST credentials**:
   ```
   REDIS_URL=redis://default:password@host:port
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

**Verificar conexión:**
```bash
npm run worker
# Debe iniciar el BullMQ worker sin errores
```

### NextAuth.js v5 (autenticación)

1. **Generar secret seguro**:
   ```bash
   openssl rand -base64 32
   ```
   Copiar output → `NEXTAUTH_SECRET`

2. **Configurar OAuth (opcional)**:
   - Google Console: [console.cloud.google.com](https://console.cloud.google.com)
   - Crear credenciales OAuth 2.0
   - Copiar Client ID + Secret → `.env`

### Web Push API (notificaciones)

1. **Generar VAPID keys**:
   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Copiar keys → `.env`**:
   ```
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   ```

## Flujo de desarrollo

### Estructura de carpetas a recordar

```
src/
├── db/schema.ts         ← Cambios aquí requieren db:migrate
├── engines/             ← Los 15 motores del sistema
│   ├── stressEngine.ts  ← #01 — IMR calculation
│   ├── acwrCalculator.ts ← #02 — Injury risk
│   └── ...
├── lib/auth.ts          ← NextAuth configuration
└── workers/queue.ts     ← BullMQ setup
```

### Patrón: Agregar un nuevo engine

```bash
# 1. Crear archivo
touch src/engines/newEngine.ts

# 2. Implementar función principal
# (ver src/engines/stressEngine.ts como template)

# 3. Exportar tipos y función
export function newEngine(input: Input): Output { ... }

# 4. Escribir tests
touch tests/engines/newEngine.test.ts

# 5. Correr tests
npm run test -- newEngine.test.ts

# 6. Integrar en API route o worker
# (si es asíncrono: src/workers/index.js)
```

### Patrón: Agregar un API endpoint

```bash
# 1. Crear archivo en app/api/
touch app/api/new-route/route.ts

# 2. Implementar POST/GET handler
export async function POST(req: NextRequest) {
  const user = await authGuard('athlete')  // Autenticar
  const body = await req.json()
  // ... lógica ...
  return NextResponse.json({ ... })
}

# 3. Probar con curl
curl -X POST http://localhost:3000/api/new-route \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## Scripts útiles

```bash
npm run dev              # Dev server (port 3000)
npm run build           # Build production
npm run start           # Servidor producción
npm run lint            # Ejecutar ESLint
npm run db:migrate      # Aplicar migrations
npm run db:studio       # Abre Drizzle Studio
npm run worker          # Inicia BullMQ worker
npm run test            # Jest tests
npm run test:e2e        # Playwright E2E tests
```

## Testing

### Unit tests (engines)

```bash
# Correr test específico
npm run test -- stressEngine.test.ts

# Correr todos
npm run test

# Watch mode
npm run test -- --watch
```

**Ejemplo test para Engine #01:**
```typescript
import { calculateIMR } from '@/src/engines/stressEngine'

describe('StressEngine', () => {
  it('should calculate IMR for barbell movements', () => {
    const result = calculateIMR({
      workout_type: 'FOR_TIME',
      movements: [
        { movement_id: 'back_squat', sets: 3, reps: 5, weight_kg: 100 }
      ],
      srpe: 8,
    })
    expect(result.imr_score).toBeGreaterThan(0)
  })
})
```

### E2E tests

```bash
npm run test:e2e
```

Verifica flujos completos:
- Registro + Login
- Crear WOD
- Registrar sesión
- Ver dashboard

## Debugging

### Ver logs de servidor

```bash
# Terminal donde corre `npm run dev`
# Verás logs de:
# - Request/Response
# - Database queries (si SHOW_SQL=true)
# - Engine calculations
```

### Inspeccionar base de datos

```bash
npm run db:studio
# Abre http://localhost en navegador
```

### Inspeccionar queue (Redis)

```bash
# Si tienes redis-cli instalado
redis-cli -u $REDIS_URL
> KEYS *
> GET volta:*
```

### Debugger de Node.js

```bash
node --inspect-brk ./node_modules/.bin/next dev

# Abre chrome://inspect en Chrome
```

## Troubleshooting

### "DATABASE_URL error"

```bash
# Verificar formato
echo $DATABASE_URL
# Debe ser: postgresql://user:password@host:port/dbname

# Probar conexión directo
psql $DATABASE_URL -c "SELECT 1"
```

### "NEXTAUTH_SECRET required"

```bash
# Generar nuevo
openssl rand -base64 32

# Agregar a .env
NEXTAUTH_SECRET="[output_above]"
```

### "Redis connection error"

```bash
# Verificar variables
echo $REDIS_URL

# Probar conexión
npm run dev
# Verifica logs para "Redis connected" o error
```

### "Port 3000 already in use"

```bash
# Cambiar puerto
npm run dev -- -p 3001

# O matar proceso en port 3000
# macOS/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

## Mejores prácticas

### ✅ Haz esto

- **Commit frecuente**: Pequeños commits con mensajes claros
- **Push a rama feature**: `git push origin feature/name`
- **Tests antes de merge**: `npm run test`
- **Format antes de commit**: `npx prettier --write .`
- **Actualiza tipos**: Si cambias schema → regenerar types

### ❌ No hagas esto

- **No commitees .env** (solo .env.example)
- **No hardcodees credenciales** (usa .env)
- **No mergees sin tests** pasando
- **No ignores warnings** de TypeScript
- **No modificues schema** sin coordinar

## Documentación adicional

- **Arquitectura completa**: `VOLTA_MASTER_DOCUMENT.md`
- **Sistema Antigravity**: `ANTIGRAVITY.md`
- **README**: Overview del proyecto
- **Engines**: Cada archivo en `src/engines/` tiene docstrings detallados

## Support

- **Issues**: GitHub Issues
- **Slack/Teams**: #volta-dev channel
- **Docs**: Ver carpeta `docs/`

---

**Happy coding! 🚀**

*Last updated: 2026-04-04*
