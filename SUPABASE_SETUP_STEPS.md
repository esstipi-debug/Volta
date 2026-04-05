# Supabase Setup - Paso a Paso ✅

**Estado:** Credenciales configuradas, listo para inicializar DB

---

## Paso 1: Ejecutar Script SQL en Supabase

1. Ve a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona proyecto "volta"
3. Ve a **SQL Editor** (lado izquierdo)
4. Haz clic en **"New query"**
5. Copia todo el contenido de `sql/001_init_schema.sql`
6. Pégalo en el editor
7. Haz clic en **"Run"** (botón verde arriba a la derecha)

**Resultado esperado:**
- ✅ Se crean 7 tablas (athletes, training_sessions, biometrics, etc)
- ✅ Se crean índices para performance
- ✅ Se habilita Row-Level Security (RLS)
- ✅ Se configuran políticas de aislamiento de datos

---

## Paso 2: Verificar Tablas Creadas

1. Ve a **Editor** (icono de tabla en lado izquierdo)
2. Deberías ver estas tablas:
   - athletes
   - training_sessions
   - biometrics
   - acwr_daily
   - readiness_daily
   - athlete_gamification
   - injuries

Si no las ves, haz clic en el botón **"Refresh"** (actualizar).

---

## Paso 3: Probar Conexión Localmente

```bash
# En tu terminal:
cd volta

# Instala dependencias
npm install

# Inicia el servidor de desarrollo
npm run dev
```

Deberías ver:
```
> volta@1.0.0 dev
> next dev

  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

---

## Paso 4: Probar Sign Up

1. Abre http://localhost:3000 en tu navegador
2. Busca el botón **"Sign Up"** o ve a `/auth/signup`
3. Crea una cuenta con:
   - Email: `test@example.com`
   - Contraseña: `TestPassword123!`

**Resultado esperado:**
- ✅ Usuario creado en Supabase Auth
- ✅ Registro de athlete creado en tabla `athletes`
- ✅ Redirige al dashboard

---

## Paso 5: Verificar Datos en Supabase

1. En Supabase → **Editor** → **athletes**
2. Deberías ver una fila con:
   - `user_id`: (UUID del usuario)
   - `email`: test@example.com
   - `status`: active

---

## Paso 6: Probar APIs Localmente

```bash
# En otra terminal:
curl -X GET http://localhost:3000/api/engines/readiness?athlete_id=YOUR_ATHLETE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Resultado esperado:**
- ✅ HTTP 200
- ✅ Respuesta con readiness score

---

## Paso 7: Deploy a Vercel

Una vez todo funcione localmente:

```bash
# Commit los cambios
git add .env.local sql/
git commit -m "Configure Supabase credentials"

# Deploy a Vercel (auto-detects y deploya)
git push origin main
```

En Vercel dashboard → **Settings** → **Environment Variables**:

Añade:
```
NEXT_PUBLIC_SUPABASE_URL=https://svkmvvykkzjbypfvyqhk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_6npIVBM8R4T_BX6QfzKrig_wFsKAfny
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
DATABASE_URL=postgresql://postgres:Mateo2032.17@db.svkmvvykkzjbypfvyqhk.supabase.co:5432/postgres
UPSTASH_REDIS_REST_URL=https://usa-able-macaw-32555.upstash.io
UPSTASH_REDIS_REST_TOKEN=AZHaASQcMGNkNzIwYzA0YzlmNDQ5MjliOWJlZGY0YjU3NzNkNjc5OA==
```

---

## Checklist de Verificación

- [ ] Script SQL ejecutado sin errores
- [ ] Tablas visibles en Supabase Editor
- [ ] `npm run dev` inicia sin errores
- [ ] Puedo crear cuenta en http://localhost:3000
- [ ] Usuario y athlete visibles en Supabase
- [ ] APIs responden correctamente
- [ ] Variables de Vercel configuradas
- [ ] Deploy a Vercel exitoso

---

## Troubleshooting

### Error: "connection refused" al ejecutar `npm run dev`

```
Error: ECONNREFUSED 127.0.0.1:5432
```

**Causa:** DATABASE_URL incorreto
**Solución:** Verifica que `.env.local` tiene la DATABASE_URL completa

### Error: "permission denied" al crear usuario

```
Error: new row violates row-level security policy
```

**Causa:** RLS policies no configuradas correctamente
**Solución:** Ejecuta nuevamente el script SQL en Supabase SQL Editor

### No puedo conectar a Supabase en production

**Causa:** Variables no configuradas en Vercel
**Solución:** Ve a Vercel dashboard → Settings → Environment Variables y añade todos los valores

---

## URLs Importantes

- **Supabase Dashboard:** https://app.supabase.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Local Dev Server:** http://localhost:3000
- **Supabase Documentation:** https://supabase.com/docs

---

**Status:** ✅ Supabase conectado y listo para usar
**Próximo paso:** Ejecutar Script SQL en Supabase
