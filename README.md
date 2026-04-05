# VOLTA — CrossFit Performance Intelligence Platform

**VOLTA** es una plataforma integral para optimizar el rendimiento atlético en CrossFit. Combina ciencia biomecánica avanzada con gamificación para ayudar a atletas a prevenir lesiones y maximizar resultados.

## ¿Qué es VOLTA?

VOLTA utiliza el **Stress Engine** — un sistema de cuantificación de carga que rastrea:

- **ACWR** (Acute:Chronic Workload Ratio): Índice de riesgo de lesión
- **Modelo Banister**: Readiness (fatiga + adaptación) con 4 curvas de decaimiento
- **Periodización menstrual**: Para atletas femeninas (ajustes por fase del ciclo)
- **Coeficientes de movimiento**: Catalog de 122+ movimientos CrossFit

Los atletas ven un **score de readiness dinámico (0-100)** con 5 colores cada día, más mecánicas de gamificación (racha, nivel, badges) que generan hábitos sin sobreentrenamiento.

Los coaches manejan múltiples atletas, monitorean tendencias de ACWR, y reciben alertas de prevención de lesiones en 3 niveles de severidad.

## Stack Técnico (Vercel Serverless)

```
Frontend:      Next.js 14 + TypeScript + React 18 + Tailwind CSS
Backend:       Vercel Serverless Functions (Node.js)
Database:      Neon PostgreSQL
Auth:          NextAuth.js v5 (JWT en httpOnly cookies)
Queue:         BullMQ + Upstash Redis
Storage:       Vercel Blob (images) / Database (data)
Push:          Web Push API (web-push npm)
Hosting:       Vercel (Next.js optimized)
Monitoring:    Sentry (error tracking)
```

**Deployment:** GitHub → Vercel (auto-deploy on push)

## Quick Start

### Requisitos
- Node.js 18+
- npm o yarn
- Replit account (free tier) or local development

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd volta

# Instalar dependencias
npm install

# Variables de entorno
cp .env.example .env
# Editar .env con DATABASE_URL, NEXTAUTH_SECRET, etc.

# Servidor de desarrollo
npm run dev
```

Navega a `http://localhost:3000`

## Estructura del Proyecto

```
.
├── app/                           # Next.js 14 App Router
│   ├── (auth)/                    # Flujos de autenticación (login, register)
│   ├── (app)/                     # Rutas protegidas
│   │   ├── athlete/               # Dashboard y onboarding del atleta
│   │   └── coach/                 # Panel del coach
│   ├── api/                       # API Routes
│   │   ├── auth/[...nextauth]/    # NextAuth handler
│   │   └── athlete/               # Rutas de atleta (sessions, check-in, etc.)
│   ├── layout.tsx
│   └── page.tsx
├── src/
│   ├── db/                        # Drizzle ORM + Neon PostgreSQL
│   │   ├── schema.ts              # Definición de tablas (25+ tables)
│   │   └── index.ts               # Conexión Neon
│   ├── engines/                   # 15 Engines (motores del sistema)
│   │   ├── stressEngine.ts        # #01 — Cálculo de IMR
│   │   ├── acwrCalculator.ts      # #02 — EWMA + injury risk
│   │   ├── banisterModel.ts       # #03 — Fitness + 4 Fatigue curves
│   │   ├── readinessEngine.ts     # #04 — Score + color + recomendaciones
│   │   ├── programmingGuide.ts    # #14 — Guardian engine (valida WODs)
│   │   ├── wodGenerator.ts        # #16 — Genera semanas (V2)
│   │   └── ... [11 more engines]
│   ├── lib/
│   │   ├── auth.ts                # NextAuth v5 configuration
│   │   └── auth.types.ts          # Type augmentation para session
│   ├── workers/
│   │   ├── queue.ts               # BullMQ setup
│   │   └── index.js               # Worker process
│   └── components/                # React components
├── docs/
│   └── VOLTA_MASTER_DOCUMENT.md   # Documento maestro (portable, completo)
├── RAIZ/                          # Sistema de IP (histórico)
├── .env.example
├── .editorconfig                  # Formato consistente
├── .prettierrc                     # Code formatter
├── package.json
├── tsconfig.json
├── next.config.js
└── ANTIGRAVITY.md                 # Instrucciones para Antigravity
```

## Los 15 Engines (Sprint 1 MVP)

| # | Nombre | Propósito | Impacto |
|---|--------|-----------|---------|
| 01 | StressEngine | Calcula IMR de cada sesión | 10/10 |
| 02 | ACWR Calculator | Detecta riesgo de lesión (EWMA) | 9/10 |
| 03 | Banister Model | Modela fitness + fatiga | 8/10 |
| 04 | Readiness Engine | Score diario + color + recomendaciones | 10/10 |
| 05 | Session Adaptation | Adapta WOD al estado del atleta | 9/10 |
| 06 | Movement Escalation | Nivel automático (Rx+/Rx/Beginner) | 8/10 |
| 14 | Programming Guide | Valida WODs en tiempo real (previene errores) | 8/10 |
| 16 | WOD Generator V2 | Genera semana completa (futuro) | 9/10 |
| ... | ... [7 más] | ... | ... |

**Documento completo:** `VOLTA_MASTER_DOCUMENT.md`

## Desarrollo

### Variables de entorno (`.env`)

```bash
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database"

# Auth
NEXTAUTH_SECRET="[generado con: openssl rand -base64 32]"
NEXTAUTH_URL="http://localhost:3000"

# Redis (Upstash)
REDIS_URL="redis://default:password@host:port"
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Web Push Notifications
VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo (port 3000)
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run db:migrate   # Ejecutar migrations (Drizzle)
npm run db:studio    # Drizzle Studio (inspect DB)
npm run worker       # Inicia BullMQ worker
```

## Para trabajar en Antigravity

Ver **`ANTIGRAVITY.md`** para instrucciones completas sobre:
- Cómo compartir el código en Antigravity
- Flujo de colaboración (no overwrite conflicts)
- Sincronización con Git
- Limitaciones y mejores prácticas

## Deployment

### Replit (recomendado para MVP)

1. **Push a GitHub**
   ```bash
   git push origin main
   ```

2. **Conectar Replit a GitHub**
   - Replit detecta `next dev` automáticamente
   - Auto-deploys en cada push

3. **Set environment variables en Replit Secrets**
   - DATABASE_URL (Neon)
   - NEXTAUTH_SECRET
   - REDIS_URL (Upstash)
   - Web Push keys

4. **Database migrations**
   ```bash
   npm run db:migrate
   ```

## Escalado

| Etapa | Usuarios | Costo/mes | Stack |
|-------|----------|-----------|-------|
| MVP | 0–100 | $0 | Replit Free + Neon Free + Upstash Free |
| Crecimiento | ~300 | ~$55 | Replit Pro + Neon Pro + Upstash Pro |
| Escala | 1,000+ | ~$95 | Replit + Neon + Upstash (compartido) |

## Recursos

- **Documento maestro**: `VOLTA_MASTER_DOCUMENT.md`
- **Base de datos**: `src/db/schema.ts` (25+ tablas)
- **Engines**: `src/engines/` (15 motores)
- **Architecture docs**: `RAIZ/` (histórico, referencia)

## Licencia

Propietario — VOLTA es una plataforma cerrada. Contactar para partnerships.

---

**Construído con ciencia. Diseñado para atletas. Impulsado por Replit.**

*Sprint 1: Engines #01–#04, Auth, API, Dashboard base*
*Última actualización: 2026-04-04*
