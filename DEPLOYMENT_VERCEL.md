# VOLTA Deployment to Vercel

Step-by-step guide for deploying VOLTA to production on Vercel.

---

## Phase 1: Pre-Deployment (Week 1)

### 1. Local Testing

```bash
# Start local dev server with Vercel CLI
vercel dev

# Run all tests
npm run test

# Load test (simulate 100 concurrent users)
wrk -t4 -c100 -d10s http://localhost:3000/api/engines/readiness?athlete_id=athlete-123
```

**Success criteria:**
- All unit tests pass
- p95 response time <1s
- Cache hit rate >80%
- Error rate <0.1%

### 2. Create Vercel Project

```bash
# Login to Vercel
vercel login

# Link project
cd volta
vercel link

# Creates .vercel/project.json with project ID
```

### 3. Configure Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
DATABASE_URL              postgresql://...
NEXTAUTH_SECRET          <generated via: openssl rand -base64 32>
NEXTAUTH_URL             https://volta-prod.vercel.app
REDIS_URL                redis://...
UPSTASH_REDIS_REST_URL   https://...
UPSTASH_REDIS_REST_TOKEN ...
VAPID_PUBLIC_KEY         ...
VAPID_PRIVATE_KEY        ...
NEXT_PUBLIC_VAPID_PUBLIC_KEY ...
NEXT_PUBLIC_APP_URL      https://volta-prod.vercel.app
CRON_SECRET              <generated secret for cron jobs>
SENTRY_DSN               https://...@sentry.io/...
```

**Security:**
- Use strong random values for secrets
- Never commit .env to Git
- Rotate secrets quarterly
- Use different secrets per environment (dev/staging/prod)

### 4. Setup Staging Environment

```bash
# Create staging branch
git checkout -b deployment/staging

# Deploy to staging preview
vercel deploy --prod

# Get staging URL from output (e.g., https://volta-staging.vercel.app)
```

### 5. Test Staging Deployment

```bash
# Test readiness endpoint
curl https://volta-staging.vercel.app/api/engines/readiness?athlete_id=athlete-123 \
  -H "Authorization: Bearer $(JWT_TOKEN)"

# Test session registration
curl -X POST https://volta-staging.vercel.app/api/athlete/session-register \
  -H "Authorization: Bearer $(JWT_TOKEN)" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Run cron job test
curl -X POST https://volta-staging.vercel.app/api/cron/calculate-acwr \
  -H "x-vercel-cron: $(CRON_SECRET)"
```

**Verify:**
- All endpoints return 2xx status
- Response times <1s (cached)
- No 500 errors
- Database migrations applied
- Redis connection working
- Sentry events appearing

---

## Phase 2: Pre-Production Validation (Week 2)

### 1. Database Verification

```bash
# Connect to production database
psql $DATABASE_URL

# Verify schema created
\dt  # List all tables

# Check row counts
SELECT COUNT(*) FROM athletes;
SELECT COUNT(*) FROM training_sessions;

# Verify indexes
\di  # List all indexes
```

### 2. Performance Testing

```bash
# Load test against staging
k6 run k6-load-test.js --vus 50 --duration 5m

# Expected:
# - p50: <200ms (cached)
# - p95: <500ms
# - p99: <1s
# - Error rate: 0%
```

Create `k6-load-test.js`:

```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  vus: 50,
  duration: '5m',
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'http_req_failed': ['rate<0.01'],
  },
}

export default function () {
  let res = http.get('https://volta-staging.vercel.app/api/engines/readiness?athlete_id=athlete-123', {
    headers: { 'Authorization': `Bearer ${__ENV.JWT_TOKEN}` },
  })

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })

  sleep(1)
}
```

### 3. Error Tracking Setup

```bash
# Create Sentry project
# Visit: https://sentry.io → Create new project
# Select: Next.js
# Copy DSN

# Add to environment
vercel env add SENTRY_DSN https://...@sentry.io/...
```

### 4. Monitoring Setup

**CloudWatch (AWS):**
- Monitor Lambda duration
- Track error rates
- Set up alarms (>5% error rate)

**Vercel Analytics:**
- Monitor function duration
- Track database connection pool status
- Monitor cache hit rate

**Datadog/New Relic** (optional):
- Advanced performance monitoring
- Custom dashboards
- Alert routing

---

## Phase 3: Production Deployment (Week 3)

### 1. Final Pre-Checks

```bash
# Verify all tests pass on staging
npm run test
npm run lint

# Check for security vulnerabilities
npm audit

# Verify git branch is clean
git status
```

### 2. Deploy to Production

```bash
# Create production branch
git checkout main
git pull origin main

# Push to Vercel
git push origin main

# Vercel auto-deploys (configured in vercel.json)
# Monitor deployment in Vercel dashboard
```

**Or manual deploy:**

```bash
vercel deploy --prod
```

### 3. Smoke Tests (immediately after deploy)

```bash
# Test critical paths
bash smoke-tests.sh
```

Create `smoke-tests.sh`:

```bash
#!/bin/bash

API="https://volta.vercel.app"

# Test 1: Readiness endpoint
echo "Testing readiness..."
curl -f $API/api/engines/readiness?athlete_id=athlete-123 || exit 1

# Test 2: Session registration
echo "Testing session registration..."
curl -f -X POST $API/api/athlete/session-register \
  -H "Content-Type: application/json" \
  -d '{"session_date":"2026-04-05","workout_type":"FOR_TIME","movements":[],"srpe":5}' || exit 1

# Test 3: ACWR cron
echo "Testing cron job..."
curl -f -X POST $API/api/cron/calculate-acwr \
  -H "x-vercel-cron: $CRON_SECRET" || exit 1

echo "✓ All smoke tests passed!"
```

### 4. Monitor for 24 Hours

**Check:**
- Error rate (should be <0.1%)
- Response time (cached <200ms, computed <2s)
- Database connection pool
- Redis cache hit rate
- No OOM (out of memory) errors
- No timeouts on cold starts

**In Vercel dashboard:**
- Settings → Functions → Monitor execution time
- Analytics → Track page performance

**In Sentry:**
- Issues → No critical errors
- Performance → Monitor slow transactions
- Releases → Verify deployment detected

---

## Phase 4: Post-Deployment (Ongoing)

### 1. Weekly Health Check

```bash
# Every Monday, verify:
- All endpoints responding (check /api/health)
- Error rate <0.1%
- Average response time <500ms
- Database backups working
- Redis cache operational
```

### 2. Monthly Optimization

- Review slow queries in database logs
- Optimize Redis TTLs based on hit rates
- Analyze cold start performance
- Review error patterns in Sentry

### 3. Scaling Preparation

At **300+ athletes**, consider:
- Upgrade database to Neon Pro ($25/mo)
- Enable read replicas for analytics queries
- Increase Redis plan size
- Add CDN for static assets (Vercel auto-includes)

---

## Rollback Procedure

If critical issue found in production:

```bash
# Option 1: Revert to previous commit
git revert HEAD
git push origin main

# Option 2: Revert in Vercel dashboard
# Deployments → Select previous working version → Promote to Production

# Option 3: Use Vercel CLI
vercel rollback
```

**Test rollback:**
```bash
# Verify rolled-back version
curl https://volta.vercel.app/api/health
```

---

## Cost Estimation (At 300 Athletes)

| Service | Cost | Notes |
|---------|------|-------|
| Vercel | $20 | Pro plan, $25/mo if >1000 functions |
| Neon DB | $25 | Pro tier, $0 for dev/staging |
| Upstash Redis | $10 | Pro tier, $0 for free tier |
| Sentry | $0 | 5,000 events/month free tier |
| Monitoring | $0 | Vercel native + CloudWatch free tier |
| **Total** | **$55** | Or $0 if using all free tiers |

**Revenue at 300 athletes:**
- 300 athletes × $5/month = $1,500
- 30 coaches × 10 athletes × $3 = $900
- **Total: $2,400/month**

**Margin: 97%** ✓ Highly viable

---

## Troubleshooting

### Issue: Cold start >5s

**Cause:** Function initialization slow
**Fix:**
```bash
# Reduce dependencies (check node_modules size)
npm ls --depth=0

# Enable Next.js optimization
# next.config.js: swcMinify: true
```

### Issue: Database connection timeout

**Cause:** Connection pool exhausted
**Fix:**
```bash
# Increase pool size in db-serverless.ts
// max: 10 (from 5)

# Or use Neon's serverless driver (no pool needed)
```

### Issue: Redis timeout on cache writes

**Cause:** Upstash rate limited
**Fix:**
```bash
# Upgrade Upstash plan
# Or cache less aggressively (longer TTLs)
```

### Issue: Sentry events not appearing

**Cause:** DSN not configured or events filtered
**Fix:**
```bash
# Verify SENTRY_DSN in Vercel dashboard
vercel env pull

# Check beforeSend filter in sentry-setup.ts
```

---

## Success Metrics

After production deployment, track:

| Metric | Target | How to Measure |
|--------|--------|---|
| Uptime | 99.9% | Vercel dashboard |
| Error Rate | <0.1% | Sentry |
| p95 Response Time | <500ms | Vercel Analytics |
| Cache Hit Rate | >80% | Application logs |
| Cold Start | <2s | Vercel dashboard |
| DB Connections | <5 | PostgreSQL logs |

---

## Emergency Contacts

- **Vercel Support:** vercel.com/support
- **Sentry Support:** sentry.io/support
- **Neon Support:** neon.tech/support
- **Upstash Support:** upstash.com/support

---

**Last Updated:** 2026-04-05
**Next Review:** 2026-05-05
