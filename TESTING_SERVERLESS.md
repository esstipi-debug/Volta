# Testing Serverless Endpoints Locally

Guide for testing VOLTA endpoints locally before deployment to Vercel.

---

## 1. Prerequisites

```bash
# Install Vercel CLI globally
npm install -g vercel

# Install project dependencies
npm install

# Start dev server with Vercel CLI
vercel dev
```

This starts a local Vercel environment that mimics production behavior:
- Serverless functions run in isolated context
- Timeout limits enforced (10s default, 60s for engines)
- Environment variables loaded from `.env.local`
- File watching with live reload

---

## 2. Environment Setup

Create `.env.local` with test credentials:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/volta_dev"

# Auth
NEXTAUTH_SECRET="test-secret-$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Cron Secret
CRON_SECRET="test-cron-secret"

# Optional: Enable debug logging
DEBUG="volta:*"
```

---

## 3. Testing Cached Reads

### Test: GET /api/engines/readiness

```bash
curl -X GET \
  'http://localhost:3000/api/engines/readiness?athlete_id=athlete-123&date=2026-04-05' \
  -H "Authorization: Bearer $(JWT_TOKEN)"
```

**Expected:**
- First request: 2-3s (computed)
- Second request (within 12h): 100ms (cached)
- Response includes: `"source": "cache"` or `"source": "computed"`

**Verify cache:**
```bash
# Check Redis cache
npx upstash-redis-cli
> GET readiness:athlete-123:2026-04-05
```

---

## 4. Testing Complex Calculations

### Test: GET /api/engines/injury-risk

```bash
curl -X GET \
  'http://localhost:3000/api/engines/injury-risk?athlete_id=athlete-123&date=2026-04-05' \
  -H "Authorization: Bearer $(JWT_TOKEN)"
```

**Expected:**
- Response time: 2-5s (involves parallel DB queries)
- Includes: injury_risk_pct, body_part_risks, alerts
- 8-hour cache TTL

---

## 5. Testing Session Registration (Critical Path)

### Test: POST /api/athlete/session-register

```bash
curl -X POST http://localhost:3000/api/athlete/session-register \
  -H "Authorization: Bearer $(JWT_TOKEN)" \
  -H "Content-Type: application/json" \
  -d '{
    "session_date": "2026-04-05",
    "workout_type": "FOR_TIME",
    "movements": [
      {
        "movement_id": "back_squat",
        "sets": 5,
        "reps": 3,
        "weight_kg": 120
      },
      {
        "movement_id": "muscle_up",
        "sets": 3,
        "reps": 5
      }
    ],
    "srpe": 8,
    "warmup_done": true
  }'
```

**Expected:**
- Status: 201 Created
- Response time: 200-500ms
- Includes: session_id, imr_score, readiness, voltaje_earned
- acwr_job_queued: true (or false if queue unavailable)

**Check response:**
```json
{
  "session_id": "session-uuid",
  "imr_score": 45,
  "session_load": 47,
  "readiness": {
    "score": 65,
    "color": "blue",
    "recommendation": "Good readiness"
  },
  "voltaje_earned": 125,
  "acwr_job_queued": true,
  "request_id": "req-uuid",
  "response_time_ms": 342
}
```

---

## 6. Testing Background Jobs

### Test: POST /api/engines/wod-weekly-async

Queue a WOD generation job:

```bash
curl -X POST \
  'http://localhost:3000/api/engines/wod-weekly-async?coach_id=coach-123' \
  -H "Authorization: Bearer $(JWT_TOKEN)"
```

**Expected:**
- Status: 202 Accepted (immediate)
- Returns: job_id, status: "queued", check_status_url
- Response time: <100ms

**Check status:**
```bash
curl -X GET \
  'http://localhost:3000/api/engines/wod-weekly-async?job_id=wod-coach-123-...'
```

**Expected:**
- Status: 'processing' → 'completed' over 1-5 minutes
- Includes: result (WOD data) when complete

---

## 7. Testing Cron Jobs

### Test: POST /api/cron/calculate-acwr

```bash
curl -X POST http://localhost:3000/api/cron/calculate-acwr \
  -H "x-vercel-cron: test-cron-secret"
```

**Expected:**
- Status: 200 OK
- Processes all active athletes
- Response: { status: 'success', athletes_processed: N, acwr_records_created: N }

**Verify:**
- Check database for new acwr_daily records
- Check Redis cache for pre-computed values

---

## 8. Testing Timeout Behavior

### Simulate timeout (force long computation):

In `src/engines/stressEngine.ts`, add deliberate delay:

```typescript
export function calculateIMR(input: StressEngineInput): IMRResult {
  // Simulate slow computation
  const start = Date.now()
  while (Date.now() - start < 15000) {} // 15 second delay

  // ... rest of function
}
```

Then test readiness:

```bash
time curl http://localhost:3000/api/engines/readiness?athlete_id=...
```

**Expected:**
- Function terminates after 10s (default timeout)
- Returns: error: "Computation timeout", status: "error", HTTP 504
- Response includes: retry_after: 30 (seconds)

---

## 9. Testing Error Scenarios

### Database Connection Error

Set invalid DATABASE_URL:

```bash
DATABASE_URL="postgresql://invalid:invalid@invalid:5432/invalid"
```

**Expected:**
- Error: "Database error"
- Status: 503 Service Unavailable
- Includes: retry_after, request_id for tracing

### Missing Authentication

```bash
curl -X GET http://localhost:3000/api/engines/readiness
```

**Expected:**
- Status: 401 Unauthorized
- Error: "Unauthorized"

### Invalid SRPE

```bash
curl -X POST http://localhost:3000/api/athlete/session-register \
  -H "Authorization: Bearer $(JWT_TOKEN)" \
  -H "Content-Type: application/json" \
  -d '{
    "session_date": "2026-04-05",
    "workout_type": "FOR_TIME",
    "movements": [],
    "srpe": 15
  }'
```

**Expected:**
- Status: 400 Bad Request
- Error: "sRPE must be between 1 and 10"

---

## 10. Performance Testing

### Load Test (100 concurrent requests)

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/engines/readiness?athlete_id=athlete-123

# Using wrk (better for HTTP/1.1)
wrk -t4 -c100 -d10s http://localhost:3000/api/engines/readiness?athlete_id=athlete-123
```

**Targets:**
- Mean response time: <500ms (cached)
- p95: <1s
- p99: <2s
- Error rate: <0.1%

### Cache Hit Rate

```bash
# After warming cache:
for i in {1..100}; do
  curl -s http://localhost:3000/api/engines/readiness?athlete_id=athlete-123 \
    -H "Authorization: Bearer $(JWT_TOKEN)" > /dev/null
done

# Check metrics in vercel logs
vercel logs --follow
```

**Expected:**
- Cache hits after first request
- ~99% cache hit rate within TTL

---

## 11. Monitoring

### View server logs

```bash
# In separate terminal, while running tests
vercel logs --follow
```

**Look for:**
- [Cache] GET readiness:athlete-123:2026-04-05 (hit/miss)
- [Query] ...ms to execute
- [Timeout] Computation exceeded Xms
- [Error] ...

### Check function execution time

Vercel CLI shows execution time in response headers:

```bash
curl -i http://localhost:3000/api/engines/readiness?athlete_id=athlete-123
```

Look for:
- `X-Response-Time: 342ms`
- `X-Cache-Source: cache` or `computed`

---

## 12. Pre-Deployment Checklist

Before pushing to Vercel staging:

- [ ] All endpoints tested locally with vercel dev
- [ ] Response times within targets (<500ms cached, <5s computed)
- [ ] Error handling works (database failures, timeouts)
- [ ] Cache invalidation working (check Redis)
- [ ] Authentication working (JWT tokens)
- [ ] Rate limiting not triggering
- [ ] No SQL injection vulnerabilities
- [ ] Database connection pooling working
- [ ] Background jobs queueing (ACWR, WOD)
- [ ] Cron jobs execute successfully

---

## 13. Debugging Tips

### Enable verbose logging

```bash
DEBUG="*" vercel dev
```

### Check Node.js memory usage

```bash
# During load test, check in another terminal
watch -n 1 'ps aux | grep node'
```

### Inspect cache contents

```bash
npx redis-cli -u $UPSTASH_REDIS_REST_URL
> KEYS "*"
> GET <key>
> TTL <key>
```

### Test database connection directly

```bash
psql $DATABASE_URL -c "SELECT 1 as connected"
```

---

## 14. Common Issues & Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| "ECONNREFUSED" on database | DATABASE_URL invalid | Verify .env.local |
| Timeout on first request | Cold start + computation | Normal, second request should be <500ms |
| Redis connection error | UPSTASH credentials wrong | Check dashboard, regenerate token |
| 502 Bad Gateway | Function exceeding timeout | Check function code, add caching |
| Cache not working | TTL expired or key mismatch | Verify cache key format + TTL |

---

## 15. Next: Staging Deployment

Once all tests pass locally:

```bash
# Deploy to Vercel staging
vercel deploy --prod

# Set environment secrets
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... (add all secrets from .env)

# Run same tests against staging
curl https://volta-staging.vercel.app/api/engines/readiness?athlete_id=athlete-123
```

Compare staging vs local performance — should be similar or better.

---

**Last Updated:** 2026-04-05
