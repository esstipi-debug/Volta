# VOLTA Vercel Migration Guide

## Platform Decision: Replit → Vercel

**Status:** Architecture refactoring for Vercel serverless deployment.

---

## Why Vercel?

- ✅ Built for Next.js (native support)
- ✅ Automatic deployments from Git
- ✅ Global CDN for static assets
- ✅ Serverless functions (auto-scaling)
- ✅ Environment variables management
- ✅ Free tier sufficient for MVP (100 GB bandwidth)
- ✅ Pro tier ($20/month) → 60s function timeout (vs 10s free)

---

## Key Architectural Changes

### 1. Serverless Functions (Vercel)

**Before (Replit):** Long-running Node server
```
Replit → Always-on server → Database
```

**After (Vercel):** Serverless API routes
```
HTTP Request → Vercel Function (10-60s timeout) → Database/Redis
```

### 2. Timeout Constraints

| Operation | Timeout | Strategy |
|-----------|---------|----------|
| **Simple read** (readiness, scores) | 1-2s | Sync in API route |
| **Complex calculation** (ACWR, recovery) | 3-5s | Sync in API route, cache result |
| **Heavy processing** (WOD gen, periodization) | 8-10s | Sync in API route, cache result |
| **Batch jobs** (weekly calcs, reports) | 60s* | Background job (BullMQ) via cron |

*Pro plan or external worker

### 3. New Architecture

```
┌─────────────────────────────────────────┐
│         Vercel Frontend (Next.js)        │
├─────────────────────────────────────────┤
│  API Routes (Serverless Functions)      │
│  ├── /api/engines/[engine-name]         │
│  ├── /api/athletes/readiness            │
│  ├── /api/coach/dashboard               │
│  └── /api/webhooks/...                  │
├─────────────────────────────────────────┤
│  External Services                      │
│  ├── Neon PostgreSQL (database)         │
│  ├── Upstash Redis (cache + queue)      │
│  └── Vercel Cron Jobs (background)      │
└─────────────────────────────────────────┘
```

### 4. Background Jobs Strategy

**For long-running tasks (>10s):**

```typescript
// Example: Weekly WOD generation
// api/cron/weekly-wod-generation.ts
export async function GET(req: Request) {
  // Vercel Cron (0 9 * * 1 = Monday 9am UTC)
  // Max runtime: 900s (15 min) on Pro plan
  
  const athletes = await db.athletes.findAll();
  
  for (const athlete of athletes) {
    // Queue job in BullMQ
    await wodQueue.add('generate-wod', {
      athlete_id: athlete.id,
      week: getCurrentWeek(),
    });
  }
  
  return Response.json({ queued: athletes.length });
}
```

---

## Refactoring Checklist

### Phase 1: Core Infrastructure
- [ ] Update `package.json` with Vercel-compatible deps
- [ ] Create `vercel.json` config
- [ ] Move environment vars to Vercel secrets
- [ ] Update `.env.example` with Vercel vars
- [ ] Configure Upstash Redis connection (same as before)
- [ ] Test Neon PostgreSQL connection

### Phase 2: API Refactoring
- [ ] Refactor `/api/engines/*` routes for <10s execution
  - [ ] Cache frequently computed values in Redis
  - [ ] Return precomputed results where possible
  - [ ] Move heavy lifting to background jobs
- [ ] Create `/api/cron/*` routes for scheduled tasks
- [ ] Add request/response logging (Vercel Analytics)
- [ ] Implement error handling for timeout scenarios

### Phase 3: Database Optimization
- [ ] Add database indexes for common queries
- [ ] Implement read caching (Redis)
- [ ] Connection pooling via Neon serverless driver
- [ ] Create database migration scripts

### Phase 4: Testing & Deployment
- [ ] Test all engines on Vercel Functions
- [ ] Set up monitoring (Sentry for errors)
- [ ] Configure custom domain
- [ ] Set up CI/CD (GitHub → Vercel auto-deploy)
- [ ] Load testing with simulated concurrent requests

---

## Engine Execution Times (Target)

| Engine | Complexity | Target Time | Strategy |
|--------|-----------|------------|----------|
| #06 Movement Escalation | Low | 200-500ms | Sync |
| #07 Session Adaptation | Medium | 500-800ms | Sync |
| #08 Assessment | Medium | 800ms-1s | Sync |
| #09 Gamification | Low | 200-400ms | Sync |
| #10 Recovery Optimizer | Medium | 600-900ms | Sync |
| #11 Injury Predictor | High | 1-2s | Sync (cached history) |
| #12 Coach Intelligence | High | 2-3s | Sync (limited athlete batch) |
| #13 Periodization | Medium | 1-1.5s | Sync |
| #14 WOD Generator | High | 3-5s | Async job |
| #15 Integration | High | 2-3s | Sync (all cached) |

**Goal:** All API responses <5s for MVP, <10s for Pro plan

---

## Environment Variables (Vercel)

```env
# Database
DATABASE_URL=postgresql://user:pass@pg.neon.tech/volta

# Authentication
NEXTAUTH_SECRET=[openssl rand -base64 32]
NEXTAUTH_URL=https://volta.vercel.app

# Redis (Queue + Cache)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Monitoring
SENTRY_DSN=https://...

# API Keys
OPENAI_API_KEY=[if using for future AI features]
```

---

## Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXTAUTH_SECRET": "@nextauth_secret",
    "NEXTAUTH_URL": "@nextauth_url",
    "UPSTASH_REDIS_REST_URL": "@upstash_url",
    "UPSTASH_REDIS_REST_TOKEN": "@upstash_token"
  },
  "functions": {
    "api/engines/**": {
      "maxDuration": 10
    },
    "api/cron/**": {
      "maxDuration": 900
    }
  }
}
```

---

## Caching Strategy (Redis)

```typescript
// api/engines/readiness.ts
export async function GET(req: Request) {
  const athleteId = req.nextUrl.searchParams.get('athlete_id');
  const cacheKey = `readiness:${athleteId}:${today}`;
  
  // 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) return Response.json(cached); // <100ms
  
  // 2. Compute if not cached
  const result = await calculateReadiness(athleteId);
  
  // 3. Cache for 12 hours
  await redis.setex(cacheKey, 43200, JSON.stringify(result));
  
  return Response.json(result);
}
```

---

## Migration Timeline

| Week | Phase | Deliverables |
|------|-------|--------------|
| W1 | Infrastructure | vercel.json + env vars setup |
| W2 | API Routes | Refactor /api/engines/* |
| W3 | Background Jobs | Cron routes + BullMQ integration |
| W4 | Testing | Load testing + error handling |
| W5 | Deployment | Go live on Vercel |

---

## Rollback Plan

If issues arise post-launch:
1. Keep Replit deployment active (standby)
2. Point DNS to Replit if Vercel has issues
3. No data loss (both use same Neon PostgreSQL)
4. Can switch back instantly

---

## Next Steps

1. ✅ Verify all 15 engines work in serverless context
2. ⬜ Refactor API routes for Vercel Functions
3. ⬜ Set up Vercel project + environment variables
4. ⬜ Implement Redis caching layer
5. ⬜ Create background job routes
6. ⬜ Test end-to-end on Vercel staging
7. ⬜ Deploy to production
