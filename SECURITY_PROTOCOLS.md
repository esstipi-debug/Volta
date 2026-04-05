# PROTOCOLOS DE SEGURIDAD TÉCNICA DE VOLTA

**Última actualización:** 5 de Abril de 2026
**Versión:** 1.0 (Anexo Técnico)
**Responsable:** Chief Security Officer, VOLTA

---

## 📋 RESUMEN PARA NO-TÉCNICOS

VOLTA protege tus datos con los mismos estándares que bancos y gobiernos:

- 🔐 **Encriptación:**  Tus datos se convierten en código imposible de descifrar
- 🔑 **Contraseñas:** Se almacenan usando fórmulas matemáticas irreversibles
- 🛡️ **Firewalls:** Servidores protegidos contra atacantes
- 🔍 **Monitoreo 24/7:** Sistemas que detectan intentos de ataque
- ⚡ **Parches de Seguridad:** Actualizamos continuamente para cerrar vulnerabilidades

---

## 1. ARQUITECTURA DE SEGURIDAD

### 1.1 Capas de Defensa (Defense in Depth)

```
┌─────────────────────────────────────┐
│      1. Apple App Store Review      │ ← Aprobación segura
├─────────────────────────────────────┤
│  2. Client-Side Validation (App)    │ ← Validación de datos
├─────────────────────────────────────┤
│    3. API Layer (Vercel Functions)  │ ← Autenticación JWT
├─────────────────────────────────────┤
│      4. Rate Limiting & WAF         │ ← Protección anti-ataque
├─────────────────────────────────────┤
│    5. Database (Supabase + RLS)     │ ← Encriptación + aislamiento
├─────────────────────────────────────┤
│    6. Backup & Disaster Recovery    │ ← Redundancia geográfica
├─────────────────────────────────────┤
│   7. Monitoring (Sentry + Logs)     │ ← Detección de amenazas
└─────────────────────────────────────┘
```

---

## 2. ENCRIPTACIÓN

### 2.1 En Tránsito (Data in Transit)

| Componente | Protocolo | Estándar | Verificación |
|-----------|-----------|----------|---|
| **App → API** | TLS 1.3 | IETF RFC 8446 | Certificate Pinning |
| **API → Database** | TLS 1.3 | IETF RFC 8446 | Signed Connection String |
| **Pagos** | TLS 1.3 + PCI-DSS | PCI Security Council | Stripe Certification |
| **Backups** | TLS 1.3 | IETF RFC 8446 | SSH Key Authentication |

### 2.2 En Reposo (Data at Rest)

| Datos | Método | Clave | Validación |
|-------|--------|-------|-----------|
| **Database (Supabase)** | AES-256-GCM | AWS KMS | FIPS 140-2 Level 2 |
| **Passwords** | Bcrypt + SHA-256 | Salt único por usuario | NIST SP 800-132 |
| **Tokens JWT** | HS256 | Supabase Secret Key | RS256 en producción |
| **Sesiones** | Encrypted Cookies | HttpOnly + Secure | SameSite=Strict |
| **Backups** | AES-256 | Managed by Supabase | Redundancia 3 regiones |

### 2.3 Key Management

**Generación:**
- 🔑 Claves criptográficas generadas por AWS KMS (Hardware Security Module)
- ✅ Cumple NIST SP 800-133 (Recommendation for Cryptographic Key Generation)

**Rotación:**
- 🔄 Rotación automática cada 90 días
- 🚨 Inmediata si hay sospecha de compromiso

**Almacenamiento:**
- 🗝️ Separadas en múltiples bóvedas (Vault)
- 🚫 Nunca en código fuente o commits
- 📋 Acceso limitado a 3 personas (con MFA)

---

## 3. AUTENTICACIÓN Y AUTORIZACIÓN

### 3.1 Flujo de Autenticación

```
1. Usuario ingresa email + password en app
                    ↓
2. App valida input (no SQL injection)
                    ↓
3. Envia a /api/auth/login (HTTPS TLS 1.3)
                    ↓
4. Backend verifica en base de datos (bcrypt)
                    ↓
5. Si es válido: Genera JWT con RS256
                    ↓
6. JWT incluye: user_id, role, expiry
                    ↓
7. JWT se guarda en cookie HttpOnly + Secure
                    ↓
8. Cookie se envía en todas las requests
                    ↓
9. Backend verifica firma JWT
                    ↓
10. ✅ Acceso otorgado OR ❌ 401 Unauthorized
```

### 3.2 Tokens JWT (JSON Web Tokens)

| Campo | Contenido | Ejemplo |
|-------|-----------|---------|
| **Header** | `{"alg":"RS256","typ":"JWT"}` | Algoritmo |
| **Payload** | `{"sub":"user123","role":"athlete","exp":1234567890}` | Datos usuario |
| **Signature** | Firmado con private key | Imposible falsificar |

**Expiración:**
- ⏱️ Access Token: 1 hora
- 🔄 Refresh Token: 7 días (rotación automática)

### 3.3 Row-Level Security (RLS) en Database

**Problema:** Si alguien obtiene acceso a la DB, podrían ver todos los datos.

**Solución:** Políticas de RLS que filtran automáticamente:

```sql
-- Política: Solo tú ves tus propios datos
CREATE POLICY "Users see own data" ON training_sessions
  FOR SELECT
  USING (athlete_id = auth.uid());

-- Resultado: SELECT * FROM training_sessions
-- Devuelve solo las filas donde athlete_id = tu ID
```

**Efectos:**
- ✅ Incluso si hacker obtiene DB, solo ve sus propios datos
- ✅ Coaches solo ven atletas que gestionan
- ✅ No hay "admin query" que vea todo (excep service role)

---

## 4. PREVENCIÓN DE VULNERABILIDADES COMUNES

### 4.1 SQL Injection

**Riesgo:** Insertar código SQL malicioso en inputs

**Prevención:**
- ✅ Usamos Drizzle ORM (todas queries parametrizadas)
- ✅ Input validation en app y backend
- ✅ Nunca usamos string concatenation

**Ejemplo Seguro:**
```typescript
// ❌ INSEGURO (NUNCA HACER)
const query = `SELECT * FROM athletes WHERE email = '${email}'`

// ✅ SEGURO (Lo que hacemos)
const athletes = await db.query.athletes.findMany({
  where: eq(athletes.email, email) // Parametrizado automáticamente
})
```

### 4.2 Cross-Site Scripting (XSS)

**Riesgo:** Inyectar código JavaScript malicioso

**Prevención:**
- ✅ Sanitización de inputs (DOMPurify)
- ✅ CSP (Content Security Policy) headers
- ✅ Escaping automático en React/Next.js
- ✅ HttpOnly cookies (no accesibles via JavaScript)

**CSP Headers:**
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
```

### 4.3 CSRF (Cross-Site Request Forgery)

**Riesgo:** Cambios no autorizados usando cookie del usuario

**Prevención:**
- ✅ SameSite=Strict en cookies
- ✅ CSRF tokens en formularios
- ✅ Verificación de Origin header
- ✅ POST requiere content-type application/json

**Ejemplo:**
```typescript
// Attacker NO puede hacer esto desde otro sitio:
fetch('https://voltaapp.com/api/profile', {
  method: 'POST',
  credentials: 'include', // ❌ Bloqueado por SameSite=Strict
})
```

### 4.4 Broken Authentication

**Riesgo:** Contraseña débil, session hijacking

**Prevención:**
- ✅ Contraseña mínimo 12 caracteres
- ✅ Validación de complejidad (mayúsculas, números, símbolos)
- ✅ Rate limiting: máximo 5 intentos fallidos/5 min
- ✅ Login notifications (email si login desde nuevo dispositivo)

### 4.5 Sensitive Data Exposure

**Riesgo:** Datos visibles en logs, screenshots, memoria

**Prevención:**
- ✅ Nunca loguear: contraseñas, tokens, números de tarjeta
- ✅ Sanitizar logs (Sentry)
- ✅ Rotación de secrets en CI/CD
- ✅ Masking en error messages (ej: "error en índice 5" no el valor real)

---

## 5. INFRAESTRUCTURA SEGURA

### 5.1 Proveedores Utilizados

| Proveedor | Servicio | Certificaciones | Uptime |
|-----------|----------|---|---|
| **Supabase** | Database + Auth | SOC 2 Type II, GDPR | 99.99% |
| **Vercel** | Hosting | SOC 2 Type II, HIPAA | 99.99%+ |
| **Stripe** | Pagos | PCI DSS Level 1, GDPR | 99.999% |
| **Upstash** | Redis Cache | SOC 2 Type II | 99.95% |
| **Sentry** | Error Monitoring | SOC 2 Type II, GDPR | 99.9%+ |

### 5.2 Network Security

| Capa | Protección |
|------|-----------|
| **DNS** | Protected by Cloudflare (DDoS mitigation) |
| **CDN** | Vercel global edge network (99 localidades) |
| **Firewall** | WAF (Web Application Firewall) en Vercel |
| **DDoS** | Auto-scaling de Vercel para traffic floods |
| **IP Blacklist** | Detección automática de IPs maliciosas |

### 5.3 Environment Isolation

```
┌─────────────────────┐
│   PRODUCTION        │
│   - Real data       │
│   - Full monitoring │
│   - Backups diarios │
└─────────────────────┘

┌─────────────────────┐
│   STAGING           │
│   - Test data       │
│   - Copy del prod   │
│   - Testing nuevos  │
└─────────────────────┘

┌─────────────────────┐
│   DEVELOPMENT       │
│   - Local machine   │
│   - No datos reales │
│   - Testing rápido  │
└─────────────────────┘
```

**Separación:**
- ✅ Diferentes databases (prod, staging, dev)
- ✅ Diferentes secrets/API keys por environment
- ✅ No se puede promocionar staging a prod sin review

---

## 6. MONITOREO Y DETECCIÓN DE AMENAZAS

### 6.1 Herramientas de Monitoreo

| Herramienta | Qué Monitorea | Alertas |
|------------|---------------|---------|
| **Sentry** | Crashes, errores, performance | Tiempo real |
| **Vercel Analytics** | Uptime, latencia, errors | Cada hora |
| **AWS CloudWatch** | Logs, métricas, tráfico | Tiempo real |
| **Datadog** | Infrastructure, database performance | Cada 5 min |
| **Custom Webhooks** | Failed logins, unusual patterns | Inmediato |

### 6.2 Detección Automática de Amenazas

**Sistema de Alertas:**

| Evento | Condición | Acción |
|--------|-----------|--------|
| **Múltiples failed logins** | >5 intentos en 5 min | Bloquear IP + email al usuario |
| **Login desde nuevo país** | Geolocation change | Verificación 2FA + email |
| **Spike en API calls** | 10x promedio | Rate limiting automático |
| **SQL injection attempt** | Pattern matching | Bloquear + reportar |
| **Large data export** | >10MB en 1 min | Requerir 2FA |
| **Unauthorized API key** | Token inválido | 401 + log |

### 6.3 Auditoría de Acceso

**Logs guardados:**
- ✅ Quién accedió (email)
- ✅ Cuándo (timestamp)
- ✅ Desde dónde (IP, dispositivo)
- ✅ Qué hizo (GET, POST, DELETE)
- ✅ Resultado (200 OK, 401 Unauthorized, etc)

**Retención:** 90 días

---

## 7. GESTIÓN DE VULNERABILIDADES

### 7.1 Programa de Bug Bounty

**Recompensas:**
- 🐛 Bug crítico (RCE, data leak): $1,000-5,000
- 🟠 Bug alto (bypass auth, XSS): $500-1,000
- 🟡 Bug medio (CSRF, enumeration): $100-500
- 🔵 Bug bajo (info disclosure): $25-100

**Cómo reportar:**
```
Email: security@voltaapp.com
Asunto: [SECURITY] Descripción del bug
Incluir: Pasos para reproducir, impacto, PoC si es posible
```

**Confidencialidad:**
- ✅ 90 días antes de divulgación pública
- ✅ Crédito en "Hall of Fame" si deseas
- ✅ NDA disponible si es necesario

### 7.2 Parches de Seguridad

**Ciclo:**
1. ⚠️ Vuln reportada → Reproducida (24h)
2. 🔧 Patch desarrollado (48h)
3. 🧪 Testing en staging (24h)
4. 🚀 Deploy a prod (push to main)
5. 📢 Comunicado public (si es crítica)

**Dependencias:**
- ✅ npm audit check en cada commit
- ✅ Auto-update de seguridad via Dependabot
- ✅ Revisión manual de cada actualización

---

## 8. PLAN DE RESPUESTA A BRECHAS

### 8.1 Pasos Inmediatos (0-1 hora)

```
1. Detección → Alerta automatizada de Sentry/Datadog
2. Confirmación → Security team valida la brecha
3. Contención → Aislar sistemas afectados
4. Logging → Documentar todo para análisis forense
5. Escalación → CEO/CTO/DPO notificados
```

### 8.2 Notificación a Usuarios (< 72 horas)

**Comunicación:**
- 📧 Email a todos los afectados
- 📱 Notificación en-app
- 🌐 Anuncio en privacyincident.voltaapp.com

**Contenido obligatorio:**
- ✅ Qué datos fueron comprometidos
- ✅ Cuándo ocurrió
- ✅ Qué estamos haciendo
- ✅ Qué debes hacer (resetear contraseña, etc)
- ✅ Contacto para preguntas

### 8.3 Remediación

**Pasos:**
1. 🔑 Resetear contraseñas de afectados (enviar link)
2. 🛡️ Resetear tokens/sessions
3. 🔍 Auditoría forense completa
4. 🔐 Cambiar todas las claves (si comprometidas)
5. 📋 Reportar a autoridades (si aplica)
6. 📚 Post-mortem y mejoras

---

## 9. CUMPLIMIENTO DE ESTÁNDARES

### 9.1 Certificaciones Objetivo

| Estándar | Meta | Estado |
|----------|------|--------|
| **SOC 2 Type II** | 2027 | En roadmap |
| **ISO 27001** | 2027 | Auditoría planeada |
| **HIPAA** | 2027 (si módulo de salud) | Evaluación |
| **PCI DSS Level 1** | Delegado a Stripe | ✅ Cumple |
| **GDPR Compliant** | Continuo | ✅ Auditoría 2026 |

### 9.2 Auditorías

**Internas:**
- ✅ Auditoría de código cada 6 meses
- ✅ Penetration testing anual
- ✅ Security training para team trimestralmente

**Externas:**
- ✅ Auditoría SOC 2 planeada 2027
- ✅ Penetration testing por terceros anual

---

## 10. GUÍA DE SEGURIDAD PARA USUARIOS

### 10.1 Cómo Mantener Tu Cuenta Segura

| Acción | Por Qué |
|--------|-------|
| **Contraseña única y fuerte** | Evita brute force attacks |
| **No compartir contraseña** | Riesgo de acceso no autorizado |
| **Logout de sesiones viejas** | Limita time window de compromiso |
| **Actualizar app regularmente** | Patches de seguridad |
| **No usar WiFi público** | Riesgo de MITM attacks |
| **Verificar HTTPS** | URL debe decir https://voltaapp.com |
| **Habilitar 2FA** | Segundo factor de autenticación |
| **No dar credenciales a nadie** | Ni siquiera support (nosotros no las pedimos) |

### 10.2 Qué NO Hagas

❌ **NUNCA:**
- Compartas tu contraseña
- Uses la misma contraseña en múltiples apps
- Ingreses datos en WiFi no seguro
- Hagas click en links sospechosos
- Instales apps pirata/modificadas
- Des acceso a tu email ligado a VOLTA
- Dejes app abierta en dispositivo compartido

---

## 11. INFORMACIÓN TÉCNICA ADICIONAL

### 11.1 Stack Tecnológico Seguro

| Layer | Tecnología | Razón |
|-------|-----------|-------|
| **Frontend** | Next.js 14 + TypeScript | Type-safe, built-in security headers |
| **Auth** | NextAuth.js + JWT | Industry standard, OIDC compatible |
| **Database** | Supabase PostgreSQL + RLS | Row-level security native |
| **API** | Vercel Functions (serverless) | Auto-patching, no server admin |
| **Cache** | Upstash Redis | Managed service, no persistence |
| **Secrets** | AWS Secrets Manager | Hardware-backed encryption |
| **Monitoring** | Sentry + Datadog | Real-time threat detection |

### 11.2 API Security Headers

Cada respuesta HTTP incluye:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

## 12. CONTACTO PARA SEGURIDAD

### Reportar Vulnerabilidades

📧 **security@voltaapp.com**
🔐 **PGP Key:** [disponible en voltaapp.com/security]

### Preguntas Técnicas

📧 **compliance@voltaapp.com**

### Datos Comprometidos

⚠️ **security@voltaapp.com**
📞 **Emergencia:** +56 2 XXXX XXXX

---

## 13. HISTORIAL DE REVISIONES

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-04-05 | Versión inicial |

---

**✅ Última revisión:** 5 de Abril, 2026
**📋 Versión:** 1.0
**🔐 Estándar:** NIST, OWASP Top 10, GDPR, CCPA

---

*Este documento es técnico pero accesible. Para preguntas, contacta security@voltaapp.com*
