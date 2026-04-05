# SECURITY PROTOCOLS OF VOLTA

**Last Updated:** April 5, 2026
**Version:** 1.0
**Classification:** Public (Technical Documentation)
**Audience:** Technical users, developers, security auditors, investors

---

## 📋 EXECUTIVE SUMMARY

VOLTA implements a **7-layer defense architecture** to protect athlete data from unauthorized access, data breaches, and security threats. This document details our security measures, certifications, and incident response procedures.

**Key Commitments:**
- ✅ AES-256 encryption (military-grade)
- ✅ TLS 1.3 for all transit
- ✅ Row-Level Security (RLS) at database level
- ✅ 24/7 automated monitoring (Sentry + Datadog)
- ✅ Sub-72-hour breach notification
- ✅ SOC 2 Type II audit planned (2027)
- ✅ ISO 27001 certification roadmap (2027)
- ✅ Active bug bounty program ($25-5000 rewards)

---

## 1. SECURITY ARCHITECTURE (7 LAYERS)

### Layer 1: Network Security (Perimeter)

**Protection:** Firewall + DDoS mitigation
- **Vercel Edge Network:** 275+ global data centers
- **DDoS Protection:** Automatic mitigation (Vercel + Cloudflare)
- **TLS 1.3:** All HTTPS connections encrypted
- **HSTS Headers:** Force HTTPS-only (1 year)
- **CSP Headers:** Prevent XSS attacks

**Implementation:**
```
All traffic → Vercel Edge → CloudFlare DDoS → Origin Server
```

---

### Layer 2: API Security

**Protection:** Rate limiting + request validation
- **Rate Limiting:** 1000 requests/minute per IP
- **Request Validation:** Input sanitization on all endpoints
- **CORS:** Whitelist only voltaapp.com
- **API Keys:** Service-to-service authentication
- **JWT Tokens:** 1-hour expiration (renewable)

**Endpoints Protected:**
- `POST /api/auth/signup` - Email/password validation
- `POST /api/workouts` - Biometric data validation
- `GET /api/athletes/:id` - RLS check before response

---

### Layer 3: Authentication & Authorization

**Protection:** Multi-factor identity verification
- **Email + Password:** Bcrypt hashing (cost factor: 12)
- **JWT (RS256):** Public/private key cryptography
- **2FA (Coming Soon):** TOTP with authenticator apps
- **OAuth 2.0 (Coming Soon):** Google Sign-In support
- **Session Management:** Automatic logout after 24 hours idle

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

**Password Storage:**
```
plaintext_password → bcrypt(cost=12) → postgres (hashed_column)
```

---

### Layer 4: Database Security

**Protection:** Row-Level Security (RLS) + encryption
- **PostgreSQL RLS:** Athlete sees only own data
- **AES-256 Encryption:** Sensitive fields encrypted
- **SQL Injection Prevention:** Parameterized queries (Drizzle ORM)
- **Connection Pooling:** PgBouncer (5 max connections, 10s timeout)
- **Backup Encryption:** All backups encrypted

**RLS Policies:**
```sql
-- Athlete can see only own data
CREATE POLICY athlete_own_data ON athletes
FOR SELECT USING (auth.uid() = user_id);

-- Coach can see managed athletes
CREATE POLICY coach_managed_athletes ON athletes
FOR SELECT USING (
  coach_id = auth.uid() OR
  auth.uid() = user_id
);
```

---

### Layer 5: Data Encryption

**Protection:** Encryption at rest and in transit

**Encryption at Rest:**
- **Algorithm:** AES-256-GCM
- **Key Management:** Envelope encryption (master key + data key)
- **Fields Encrypted:**
  - Email addresses
  - 1RM values
  - Sleep/stress/soreness metrics
  - GPS location data
  - Payment information (partial)

**Encryption in Transit:**
- **Protocol:** TLS 1.3 (minimum)
- **Cipher Suites:** ECDHE with AES-256-GCM
- **Certificate:** Let's Encrypt (auto-renewed)
- **HPKP:** Public Key Pinning (not recommended, omitted)

**Example Encryption Flow:**
```
Plaintext Data
    ↓
Generate Random IV (16 bytes)
    ↓
AES-256-GCM Encrypt (using master key)
    ↓
Ciphertext + IV + Auth Tag
    ↓
Store in PostgreSQL
```

---

### Layer 6: Infrastructure Security

**Protection:** Managed services with security focus

**Database (Supabase PostgreSQL):**
- **Compliance:** SOC 2 Type II
- **Backup:** Daily, geo-redundant (US + EU)
- **Isolation:** VPC, network isolation
- **Update Frequency:** Security patches within 24h
- **Version:** PostgreSQL 15+

**Hosting (Vercel):**
- **Compliance:** SOC 2 Type II, ISO 27001
- **Uptime:** 99.99% SLA
- **DDoS Protection:** Automatic
- **CDN:** 275+ global edge nodes
- **Auto-scaling:** Handle 100x traffic spike

**Payment Processing (Stripe):**
- **Compliance:** PCI-DSS Level 1
- **Encryption:** TLS 1.3 + AES-256
- **Tokenization:** No card data stored (Stripe handles it)
- **3D Secure:** 2FA for high-risk transactions
- **Fraud Detection:** Machine learning

**Error Monitoring (Sentry):**
- **Compliance:** SOC 2 Type II
- **Data Retention:** 90 days
- **Encryption:** HTTPS + encryption at rest
- **PII Scrubbing:** Automatic removal of sensitive data
- **Alert:** Real-time email alerts (on errors)

**Cache Layer (Upstash Redis):**
- **Encryption:** TLS 1.3 in transit
- **Auth:** API token + IP whitelist
- **Backup:** Daily snapshots
- **Data Types:** Dashboard cache (non-sensitive)

---

### Layer 7: Application Security

**Protection:** Code-level security measures

**Dependency Management:**
- **npm audit:** Weekly automated scans
- **SNYK:** Continuous vulnerability monitoring
- **Update Policy:** Security patches within 48h

**Secure Coding Practices:**
- **Input Validation:** Zod + TypeScript strict mode
- **Output Encoding:** React auto-escapes JSX
- **Error Messages:** Generic responses (no stack traces exposed)
- **Logging:** No sensitive data in logs
- **Secrets Management:** Environment variables (not hardcoded)

**OWASP Top 10 Mitigations:**

1. **Injection:** Parameterized queries (Drizzle)
2. **Broken Authentication:** JWT + RLS
3. **Sensitive Data Exposure:** AES-256 encryption
4. **XML External Entities:** Not applicable (JSON API)
5. **Broken Access Control:** RLS policies
6. **Security Misconfiguration:** Infrastructure as Code
7. **XSS:** Content Security Policy + React escaping
8. **Insecure Deserialization:** JSON schema validation
9. **Using Components with Vulnerabilities:** Automated scanning
10. **Insufficient Logging:** 24/7 monitoring

---

## 2. AUTHENTICATION FLOW

### User Registration

```
User Input Email/Password
        ↓
Validate Format (Zod schema)
        ↓
Check Email Not Exist
        ↓
Hash Password (bcrypt, cost=12)
        ↓
Store in PostgreSQL
        ↓
Send Verification Email
        ↓
User Clicks Link
        ↓
Mark Email Verified
        ↓
Return JWT Token (1 hour)
```

### User Login

```
User Input Email/Password
        ↓
Query Database
        ↓
Validate Password (bcrypt compare)
        ↓
Issue JWT Token (RS256)
        ↓
Return token + refresh_token (7 days)
        ↓
Client Stores in Secure Cookie (HttpOnly)
        ↓
Each Request: Authorization: Bearer <token>
```

### Session Management

**Token Expiration:**
- **Access Token:** 1 hour
- **Refresh Token:** 7 days
- **Session Idle:** 24 hours (auto-logout)
- **Device-specific:** JWT includes device fingerprint

**Logout Cleanup:**
- Invalidate refresh token
- Clear secure cookies
- Revoke session in database

---

## 3. DATA PROTECTION STANDARDS

### Data Classification

| Classification | Examples | Protection | Retention |
|---|---|---|---|
| **PUBLIC** | Leaderboards, public profiles | No encryption | No limit |
| **INTERNAL** | App metrics, aggregated stats | Standard encryption | 90 days |
| **CONFIDENTIAL** | Workouts, biometrics, email | AES-256 encryption | Active + 30 days |
| **RESTRICTED** | Passwords, payment tokens | Master key encryption | Active only |

### Data Lifecycle

```
Collection → Transmission → Storage → Processing → Deletion
    ↓            ↓            ↓         ↓           ↓
Validated     TLS 1.3      AES-256   RLS         30-day
Input         Encrypted    Encrypted  Policies    Window
```

---

## 4. VULNERABILITY PREVENTION

### Input Validation

**All user inputs validated via Zod:**
```typescript
const workoutSchema = z.object({
  date: z.string().datetime(),
  duration: z.number().min(1).max(1440),
  exercises: z.array(exerciseSchema).min(1).max(50),
  notes: z.string().max(5000).optional(),
});

// Usage: Parse and validate before database insert
const validated = workoutSchema.parse(userInput);
```

### SQL Injection Prevention

**Drizzle ORM prevents SQL injection:**
```typescript
// SAFE: Parameterized query
const workout = await db
  .select()
  .from(workouts)
  .where(eq(workouts.athleteId, userId));

// NEVER: String concatenation
const unsafe = `SELECT * FROM workouts WHERE athlete_id = ${userId}`;
```

### Cross-Site Scripting (XSS) Prevention

**React auto-escapes by default:**
```jsx
// SAFE: JSX escapes HTML entities
<div>{userInput}</div>  // &lt;script&gt; displayed as text

// UNSAFE: dangerouslySetInnerHTML (never use)
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Content Security Policy (CSP):**
```
default-src 'self';
script-src 'self' 'unsafe-inline' vercel.live;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
```

### Cross-Site Request Forgery (CSRF) Prevention

**SameSite Cookie Policy:**
```
Set-Cookie: session=token; SameSite=Strict; HttpOnly;
```

**Token Validation:**
- All POST/PUT/DELETE endpoints require JWT token
- Tokens include CSRF token in header

### Insecure Direct Object References (IDOR)

**RLS prevents IDOR attacks:**
```typescript
// Even if attacker guesses athlete_id=999
GET /api/athletes/999/workouts

// RLS policy blocks access:
// "athlete_id = auth.uid() OR coach_id = auth.uid()"

// Result: 403 Forbidden (if not authorized)
```

---

## 5. INCIDENT RESPONSE

### Detection (Automated)

**Monitoring Systems:**
- **Sentry:** JavaScript errors, performance issues
- **Datadog:** Infrastructure metrics (CPU, memory, disk)
- **CloudFlare:** DDoS attacks, bot traffic
- **AWS CloudWatch:** API latency, error rates

**Alert Thresholds:**
- Error rate > 1% → Immediate alert
- Response time > 5 seconds → Warning alert
- Unusual login patterns → Investigation alert
- Database connection failures → Critical alert

### Response Timeline

```
00:00 - Detect anomaly (automated alert)
00:15 - Security team investigates
00:30 - Confirm breach or false alarm
01:00 - Isolate affected systems (if needed)
02:00 - Begin forensic analysis
04:00 - Identify root cause
06:00 - Implement temporary mitigation
12:00 - Notify affected users (<72h requirement)
24:00 - Deploy permanent fix
48:00 - Post-incident review
72:00 - Public disclosure (if critical)
```

### User Notification

**Email Template (if breach occurs):**
```
Subject: Important Security Notice

We identified a security incident affecting your VOLTA account.

Affected Data: [list specific fields]
Discovered: [date]
Reported to: [regulatory body, if applicable]

Actions You Should Take:
1. Change your VOLTA password
2. Review your account activity
3. Contact privacy@voltaapp.com if concerned

Incident Details: https://voltaapp.com/privacy-incident
```

---

## 6. COMPLIANCE CERTIFICATIONS

### Current Certifications (Inherited from Vendors)

| Certification | Provider | Scope | Validation |
|---|---|---|---|
| **SOC 2 Type II** | Supabase | Database security | Annual audit |
| **ISO 27001** | Vercel | Infrastructure | Annual audit |
| **PCI-DSS Level 1** | Stripe | Payment processing | Annual audit |
| **GDPR Compliant** | Data processors | EU data handling | Continuous |
| **CCPA Compliant** | Legal review | California data | Continuous |

### Planned Certifications (VOLTA-specific)

| Certification | Target Date | Scope | Cost |
|---|---|---|---|
| **SOC 2 Type II** | Q4 2027 | VOLTA systems | $10,000-15,000 |
| **ISO 27001** | Q2 2027 | Information security | $15,000-20,000 |
| **HITRUST CSF** | 2028 | Healthcare readiness | $20,000-30,000 |

---

## 7. BUG BOUNTY PROGRAM

### Scope

**In Scope:**
- Authentication bypass vulnerabilities
- Unauthorized data access (IDOR, privilege escalation)
- Sensitive data leakage (credentials, PII, tokens)
- Injection attacks (SQL, NoSQL, command)
- Server-side template injection
- Insecure cryptographic implementation
- Insecure random number generation

**Out of Scope:**
- Social engineering, phishing
- Physical attacks
- Client-side performance issues
- Missing security headers (low risk)
- Rate limiting bypass (report for monitoring)
- Self-XSS, localStorage XSS

### Reward Structure

| Severity | Impact | Reward | Examples |
|---|---|---|---|
| **Critical** | Full compromise | $5,000 | Authentication bypass, RCE |
| **High** | Data breach | $2,000 | Unauthorized data access |
| **Medium** | Partial access | $500 | IDOR to another athlete's data |
| **Low** | Information disclosure | $100 | Error message with sensitive info |

### Reporting

**Email:** security@voltaapp.com
**PGP Key:** [Public key available on website]
**Response Time:** 48 hours
**Disclosure:** Responsible disclosure (90 days)

---

## 8. INFRASTRUCTURE DETAILS

### Deployment Architecture

```
GitHub (Source Code)
    ↓
Vercel Build Pipeline
    ↓
TypeScript Compilation
    ↓
Environment Variables Inject
    ↓
Build Artifacts
    ↓
Edge CDN (275 locations)
    ↓
Auto-scaling Serverless Functions
    ↓
API Routes → Supabase PostgreSQL
```

### Serverless Function Configuration

- **Runtime:** Node.js 20+
- **Memory:** 1024 MB default
- **Timeout:** 60 seconds (API routes), 900 seconds (cron)
- **Cold Start:** <100ms (Vercel)
- **Concurrency:** Unlimited auto-scaling

### Database Connection Pooling

```
Application
    ↓ (10 concurrent requests)
PgBouncer (5 max pool connections)
    ↓
PostgreSQL Server
    ↓ (Share connections)
Connection pooled (10s idle timeout)
```

---

## 9. SECURITY AUDIT LOGS

### What We Log

**Authentication Events:**
- User login attempts (successful and failed)
- Password changes
- Account deletions
- Token generation/refresh
- Email verification

**Data Access Events:**
- GET requests to /api/athletes/
- Bulk exports of data
- Administrative access
- Unusual query patterns

**System Events:**
- Database backups
- Deployment changes
- Configuration updates
- Certificate renewals

### Retention

**Active Logs:** 30 days (real-time monitoring)
**Archive:** 90 days (investigation)
**Deleted:** After 90 days (auto-purge)

### Log Security

- **Encryption:** AES-256 at rest
- **Access Control:** Restricted to compliance team
- **Integrity:** Append-only (immutable)
- **Monitoring:** Alerting on unusual access

---

## 10. SECURITY CHECKLIST

### Pre-Deployment

- [ ] All dependencies updated (npm audit clean)
- [ ] Secrets not in version control (.env.local in .gitignore)
- [ ] TLS certificates valid (>30 days remaining)
- [ ] Database backups verified
- [ ] RLS policies tested
- [ ] Rate limiting configured
- [ ] Error messages sanitized (no stack traces)
- [ ] CORS properly configured

### Post-Deployment

- [ ] Monitor Sentry for errors (hourly)
- [ ] Check Datadog metrics (CPU, memory, latency)
- [ ] Verify all endpoints responding (uptime check)
- [ ] Test account deletion flow
- [ ] Verify RLS policies working (athlete isolation)
- [ ] Monitor suspicious login attempts
- [ ] Review CloudFlare analytics

### Monthly

- [ ] Security dependency scan (SNYK)
- [ ] Penetration testing consideration
- [ ] Log review for anomalies
- [ ] Backup restoration test
- [ ] Certificate expiration check (>60 days)
- [ ] Update security documentation
- [ ] Team security training

### Quarterly

- [ ] Full security audit
- [ ] Vulnerability assessment
- [ ] Compliance review
- [ ] Incident response drill
- [ ] Third-party vendor security review

---

## 11. CONTACT & REPORTING

**For Security Issues:**
- 📧 Email: security@voltaapp.com
- 🕒 Response Time: 48 hours
- 🔐 PGP Encryption: Available

**For Privacy Concerns:**
- 📧 Email: privacy@voltaapp.com
- 🕒 Response Time: 72 hours

**For General Compliance:**
- 📧 Email: compliance@voltaapp.com
- 🕒 Response Time: 5 business days

---

**✅ Last Review:** April 5, 2026
**📋 Version:** 1.0 EN
**🔐 Compliance:** NIST, OWASP, GDPR, CCPA, ISO 27001 (roadmap)

---

*This document is subject to periodic review. Updates will be published on https://voltaapp.com/security*
