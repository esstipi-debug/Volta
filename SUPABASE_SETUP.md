# Supabase Setup Guide for VOLTA

Complete guide to integrate VOLTA with Supabase for database, authentication, and storage.

---

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New project"**
4. Fill in:
   - **Project name:** volta
   - **Database password:** (generate strong password)
   - **Region:** Choose closest to your users
   - **Pricing plan:** Free tier works for MVP (500MB storage)

5. Wait for project to initialize (~2 minutes)

---

## 2. Get API Credentials

In Supabase dashboard → **Settings** → **API**:

```bash
# Copy these values
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
```

Also get PostgreSQL connection string:
- **Host:** db.supabase.co
- **Database:** postgres
- **User:** postgres
- **Password:** (your database password)

```bash
DATABASE_URL="postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres"
```

---

## 3. Initialize Database Schema

### Option A: Using Drizzle Migrations

```bash
# Install dependencies
npm install drizzle-orm postgres

# Run migrations
npm run db:migrate
```

This creates all 25+ tables from `src/db/schema.ts`.

### Option B: Manual SQL Script

Go to **SQL Editor** in Supabase dashboard and paste:

```sql
-- Copy schema from src/db/schema.ts
-- This will create all required tables
```

---

## 4. Enable Row-Level Security (RLS)

In Supabase dashboard → **Authentication** → **Policies**:

Enable RLS for each table:

```sql
-- Example: athletes table
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;

-- Only athletes can see their own data
CREATE POLICY "Athletes can view own data"
  ON athletes
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only athletes can update their own data
CREATE POLICY "Athletes can update own data"
  ON athletes
  FOR UPDATE
  USING (auth.uid() = user_id);
```

Repeat for all tables:
- athletes
- training_sessions
- biometrics
- acwr_daily
- readiness_daily
- athlete_gamification
- injuries
- etc.

---

## 5. Configure Authentication

### Enable Email/Password Auth

In Supabase dashboard → **Authentication** → **Providers**:

- Email/Password: ✅ Enabled (default)
- Email confirmations: Toggle as needed

### Enable OAuth (Optional)

For Google, GitHub, etc.:

1. Create OAuth app in provider's console
2. Copy Client ID + Secret
3. Add to Supabase → Authentication → Providers

---

## 6. Setup Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# Database
DATABASE_URL="postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Redis (for caching)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 7. Install Supabase Client Library

```bash
npm install @supabase/supabase-js
```

---

## 8. Update Code to Use Supabase

### Replace auth.ts with auth-supabase.ts

The new authentication uses Supabase:

```typescript
import { signUp, signIn, signOut } from '@/src/lib/auth-supabase'

// Sign up
await signUp('athlete@example.com', 'password123', 'athlete')

// Sign in
await signIn('athlete@example.com', 'password123')

// Sign out
await signOut()
```

### Update Database Connection

```typescript
import { getDb } from '@/src/lib/db-supabase'

const db = getDb()
const athletes = await db.query.athletes.findMany()
```

---

## 9. Test Connection

```bash
# Start dev server
npm run dev

# Navigate to http://localhost:3000

# Try signing up
# Should create user in Supabase Auth
# And athlete record in database (via RLS policies)
```

Check Supabase dashboard:
- **Authentication** → **Users** — Should see new user
- **Editor** → **athletes table** — Should see new athlete record

---

## 10. Vercel Deployment

Set environment variables in Vercel dashboard:

1. Go to [Vercel dashboard](https://vercel.com)
2. Select VOLTA project
3. **Settings** → **Environment Variables**
4. Add:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:PASSWORD@db.supabase.co:5432/postgres
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## 11. Scaling Supabase

### Free Tier Limits
- Storage: 500MB
- Users: Unlimited
- Database: PostgreSQL 9.6
- Bandwidth: 2GB/month
- Connections: 10

### Upgrade to Pro ($25/month)
- Storage: 100GB
- Bandwidth: Unlimited
- Custom domains
- Priority support

### At 300 Athletes
- Storage used: ~50MB (plenty of room on free)
- Database size: ~20MB
- Recommend: **Pro tier** for redundancy + backups

---

## 12. Backup Strategy

### Automatic Backups (Pro only)
Supabase keeps daily backups for 7 days.

### Manual Backups

```bash
# Dump database
pg_dump $DATABASE_URL > volta_backup.sql

# Restore database
psql $DATABASE_URL < volta_backup.sql
```

Schedule weekly backups:

```bash
# Add to cron job
0 2 * * 0 pg_dump $DATABASE_URL > /backups/volta_$(date +\%Y-\%m-\%d).sql
```

---

## 13. Monitoring

### View Database Metrics

In Supabase dashboard → **Database** → **Reports**:
- Connection count
- Query performance
- Storage size
- Bandwidth usage

### Setup Alerts (Pro)

Get notified when:
- Storage exceeds 80%
- Connections exceed limit
- Query performance degrades

---

## 14. Common Issues

### Connection Refused
- Verify DATABASE_URL is correct
- Check IP allowlist (Supabase → Settings → Database)
- All IPs allowed on free tier

### Auth Not Working
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Check Supabase auth settings (email/password enabled?)
- Browser console for errors

### Slow Queries
- Check missing indexes on frequently queried columns
- Add indexes in Supabase SQL Editor:
  ```sql
  CREATE INDEX idx_athletes_user_id ON athletes(user_id);
  CREATE INDEX idx_training_sessions_date ON training_sessions(session_date);
  ```

### RLS Blocking Queries
- Verify user is authenticated
- Check RLS policies allow the operation
- Use service role key for admin operations

---

## 15. Migration from Neon (if applicable)

If switching from Neon to Supabase:

```bash
# 1. Dump data from Neon
pg_dump $OLD_DATABASE_URL > volta_data.sql

# 2. Restore to Supabase
psql $DATABASE_URL < volta_data.sql

# 3. Update environment variables
# Replace DATABASE_URL with Supabase connection

# 4. Test all endpoints
npm run test

# 5. Deploy to staging
vercel deploy

# 6. Monitor for 24h
# Check Sentry, Vercel logs, database performance
```

---

## 16. Cost Analysis

| Component | Free | Pro | Notes |
|-----------|------|-----|-------|
| Database | 500MB | 100GB | Usually <100MB at 300 athletes |
| Auth | Unlimited | Unlimited | No additional cost |
| Storage | 1GB | 100GB | For files (not used initially) |
| Bandwidth | 2GB/month | Unlimited | Sufficient for MVP |
| **Total** | **$0** | **$25/mo** | Upgrade when storage needed |

---

## Success Criteria

After setup, verify:
- [ ] Can sign up new user
- [ ] Can sign in with email/password
- [ ] Athlete record created in database
- [ ] Can register workout
- [ ] Readiness calculation works
- [ ] Data visible only to authenticated user
- [ ] No database errors in logs
- [ ] Response times <500ms

---

**Status:** ✅ Supabase integration ready
**Next Step:** Deploy to Vercel with Supabase credentials

---

Generated: 2026-04-05
