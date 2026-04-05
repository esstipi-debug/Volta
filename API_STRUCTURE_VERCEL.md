# VOLTA API Structure for Vercel

## Project Structure (Serverless)

```
app/api/
├── engines/
│   ├── readiness/
│   │   └── route.ts          # GET readiness_score (cached 12h)
│   ├── session-adaptation/
│   │   └── route.ts          # POST + GET session recommendation
│   ├── acwr/
│   │   └── route.ts          # GET ACWR daily value
│   ├── recovery/
│   │   └── route.ts          # GET recovery recommendations
│   ├── injury-risk/
│   │   └── route.ts          # GET injury risk assessment
│   ├── coach-dashboard/
│   │   └── route.ts          # GET team metrics + alerts
│   ├── periodization/
│   │   └── route.ts          # GET training block plan
│   ├── wod-weekly/
│   │   └── route.ts          # GET weekly WOD (may trigger async job)
│   └── athlete-dashboard/
│       └── route.ts          # GET complete daily dashboard
│
├── cron/
│   ├── calculate-acwr.ts     # Scheduled: daily ACWR calc for all athletes
│   ├── generate-wods.ts      # Scheduled: Monday 9am generate week WODs
│   ├── weekly-analysis.ts    # Scheduled: Friday generate coach reports
│   └── queue-status.ts       # Scheduled: hourly process BullMQ jobs
│
├── webhooks/
│   ├── workout-completed/
│   │   └── route.ts          # POST from mobile app
│   ├── biometrics/
│   │   └── route.ts          # POST sleep/stress/soreness data
│   └── nutrition/
│       └── route.ts          # POST nutrition data from 3rd party
│
└── health/
    └── route.ts              # GET /api/health (status check)
```

---

## API Endpoint Patterns

### Pattern 1: Cached Read (Readiness)

```typescript
// api/engines/readiness/route.ts
import { redis } from '@/lib/redis'
import { calculateReadiness } from '@/src/engines/readinessPredictor'
import { db } from '@/db'

export const maxDuration = 10 // Vercel serverless limit

export async function GET(req: Request) {
  const athleteId = req.nextUrl.searchParams.get('athlete_id')
  const today = new Date().toISOString().split('T')[0]
  
  // 1. Check cache (fast path - <100ms)
  const cacheKey = `readiness:${athleteId}:${today}`
  const cached = await redis.get(cacheKey)
  if (cached) return Response.json(JSON.parse(cached))
  
  // 2. Calculate if not cached (1-2s)
  const athlete = await db.athletes.findById(athleteId)
  const history = await db.readiness.last30Days(athleteId)
  const recent_sleep = await db.biometrics.last7Days(athleteId)
  
  const result = calculateReadiness({
    athlete_id: athleteId,
    date: today,
    readiness_history_30d: history,
    recent_sleep_data: recent_sleep,
  })
  
  // 3. Cache for 12 hours
  await redis.setex(cacheKey, 43200, JSON.stringify(result))
  
  return Response.json(result)
}
```

**Execution time:** 100ms (cached) or 1-2s (computed)

---

### Pattern 2: Complex Calculation (Injury Risk)

```typescript
// api/engines/injury-risk/route.ts
import { redis } from '@/lib/redis'
import { predictInjuryRisk } from '@/src/engines/injuryPredictor'
import { db } from '@/db'

export const maxDuration = 10

export async function GET(req: Request) {
  const athleteId = req.nextUrl.searchParams.get('athlete_id')
  const today = new Date().toISOString().split('T')[0]
  
  // Check cache
  const cacheKey = `injury:${athleteId}:${today}`
  const cached = await redis.get(cacheKey)
  if (cached) return Response.json(JSON.parse(cached))
  
  // Fetch minimal data (8 weeks history)
  const [acwr8w, readiness8w, asymmetries, injuries] = await Promise.all([
    db.acwr.last8Weeks(athleteId),
    db.readiness.last8Weeks(athleteId),
    db.assessments.asymmetries(athleteId),
    db.injuries.recent6Months(athleteId),
  ])
  
  const result = predictInjuryRisk({
    athlete_id: athleteId,
    date: today,
    acwr_history_8w: acwr8w,
    readiness_history_8w: readiness8w,
    body_asymmetries: asymmetries,
    previous_injuries: injuries,
  })
  
  // Cache for 8 hours (less stable than readiness)
  await redis.setex(cacheKey, 28800, JSON.stringify(result))
  
  return Response.json(result)
}
```

**Execution time:** 100ms (cached) or 1-2s (computed with query optimization)

---

### Pattern 3: Background Job (WOD Generation)

```typescript
// api/engines/wod-weekly/route.ts
import { redis } from '@/lib/redis'
import { generateWODs } from '@/src/engines/wodGenerator'
import { db } from '@/db'
import { wodQueue } from '@/lib/bull'

export const maxDuration = 10

export async function GET(req: Request) {
  const athleteId = req.nextUrl.searchParams.get('athlete_id')
  const week = req.nextUrl.searchParams.get('week') || String(getWeekNumber())
  
  const cacheKey = `wod:${athleteId}:week${week}`
  
  // 1. Check if already generated
  const cached = await redis.get(cacheKey)
  if (cached) return Response.json(JSON.parse(cached))
  
  // 2. Check if job is in progress
  const jobKey = `wod-job:${athleteId}:${week}`
  const inProgress = await redis.get(jobKey)
  if (inProgress) {
    return Response.json({
      status: 'processing',
      message: 'WOD generation in progress',
      estimated_time: '2-3 minutes',
    }, { status: 202 }) // Accepted
  }
  
  // 3. Queue async job (return immediately)
  await wodQueue.add('generate-wod', {
    athlete_id: athleteId,
    week: parseInt(week),
    generated_at: new Date().toISOString(),
  }, { 
    jobId: `${athleteId}-${week}`,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })
  
  // Mark as in progress
  await redis.setex(jobKey, 900, '1') // 15 min TTL
  
  return Response.json({
    status: 'queued',
    message: 'WOD generation queued',
    job_id: `${athleteId}-${week}`,
  }, { status: 202 })
}
```

**Execution time:** <200ms (returns immediately, job runs in background)

---

### Pattern 4: Cron Job (Daily ACWR Calculation)

```typescript
// api/cron/calculate-acwr.ts
// Runs daily at 3 AM UTC (0 3 * * *)

import { db } from '@/db'
import { calculateACWR } from '@/src/engines/stressEngine'
import { redis } from '@/lib/redis'

export const maxDuration = 900 // 15 minutes for batch processing

export async function GET(req: Request) {
  // Verify Vercel cron header
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const athletes = await db.athletes.findAll()
    const today = new Date().toISOString().split('T')[0]
    
    let processed = 0
    let errors = 0
    
    for (const athlete of athletes) {
      try {
        // Fetch workout data
        const workouts = await db.workouts.last8Weeks(athlete.id)
        
        // Calculate ACWR
        const acwr = calculateACWR({
          athlete_id: athlete.id,
          date: today,
          recent_workouts: workouts,
        })
        
        // Save to database
        await db.acwr.upsert({
          athlete_id: athlete.id,
          date: today,
          acwr_value: acwr.acwr_value,
          acwr_zone: acwr.acwr_zone,
        })
        
        // Invalidate cache
        await redis.del(`readiness:${athlete.id}:${today}`)
        await redis.del(`session:${athlete.id}:${today}`)
        
        processed++
      } catch (err) {
        console.error(`ACWR calc failed for ${athlete.id}:`, err)
        errors++
      }
    }
    
    return Response.json({
      status: 'completed',
      processed,
      errors,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Cron job failed:', err)
    return Response.json({
      error: 'Cron job failed',
      message: String(err),
    }, { status: 500 })
  }
}
```

**Execution time:** 2-5 minutes (depends on athlete count)

---

## Caching Layer Strategy

### TTLs by Engine

| Data | TTL | Invalidation |
|------|-----|--------------|
| Readiness | 12 hours | On new workout/biometrics |
| ACWR | 24 hours | Daily cron at 3 AM |
| Injury Risk | 8 hours | On new workout/biometrics |
| Session Adaptation | 6 hours | On readiness change |
| Recovery | 12 hours | On readiness/injury change |
| Coach Dashboard | 1 hour | Manual refresh or cron |
| WOD | 7 days | Generate weekly, cache full week |
| Athlete Dashboard | 6 hours | Composite of above |

### Cache Invalidation Events

```typescript
// lib/cache-invalidation.ts
export async function invalidateAthleteCache(athleteId: string, triggers: string[]) {
  const patterns = [
    'readiness:',
    'session:',
    'recovery:',
    'injury:',
    'dashboard:',
  ]
  
  for (const pattern of patterns) {
    const key = pattern + athleteId + '*'
    await redis.del(key) // Invalidate all variations
  }
}

// Usage when workout is logged
export async function onWorkoutCompleted(athleteId: string) {
  await invalidateAthleteCache(athleteId, ['workout'])
  // Engines will recalculate on next API call
}
```

---

## Error Handling for Timeouts

```typescript
// lib/api-helpers.ts
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Execution timeout')), timeoutMs)
    ),
  ])
}

// Usage
export async function GET(req: Request) {
  try {
    const result = await withTimeout(
      expensiveCalculation(),
      8000 // 8 seconds
    )
    return Response.json(result)
  } catch (err) {
    if (err.message === 'Execution timeout') {
      // Return cached/stale data instead of error
      const cached = await redis.get(cacheKey)
      if (cached) {
        return Response.json(JSON.parse(cached), {
          headers: { 'X-Cache': 'stale' },
        })
      }
      // If no cache, return "computing" status
      return Response.json(
        { status: 'computing', estimated_time: '30 seconds' },
        { status: 202 }
      )
    }
    throw err
  }
}
```

---

## Testing on Vercel

### Local Test (Simulate Vercel Environment)

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with Vercel constraints
vercel dev --listen 3000

# Test endpoint
curl http://localhost:3000/api/engines/readiness?athlete_id=a1
```

### Staging Deployment

```bash
# Deploy to Vercel staging
vercel deploy --prod --debug

# Monitor real-time performance
vercel analytics show
```

---

## Success Criteria

✅ All API endpoints return <5 seconds (normal load)
✅ Cache hit rate >80% for repeated requests
✅ No timeouts on Pro plan (60s)
✅ Background jobs process within 10 minutes
✅ Cron jobs complete within allocated window
✅ Error rate <0.1% (SLA compliant)

---

## Next: Database Schema Refactoring

After API structure is set, update database schema with:
- Indexes for common queries
- Partitioning for large tables (workouts by athlete + date)
- Connection pooling for serverless (Neon serverless driver)
