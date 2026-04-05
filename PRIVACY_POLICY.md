# POLÍTICA DE PRIVACIDAD DE VOLTA

**Última actualización:** 5 de Abril de 2026
**Versión:** 1.0
**Responsable:** VOLTA SPA, Chile
**Contacto:** privacy@voltaapp.com

---

## 📋 RESUMEN PARA EL USUARIO (Leer primero)

### En 30 segundos:

- 🔍 **Qué recogemos:** Email, entrenamientos, biometría (sueño, estrés), datos de pago
- 📍 **Ubicación:** Solo si tú permites (opcional)
- 🔐 **Protección:** Tus datos se encriptan (AES-256)
- 🚫 **¿Vendemos datos?** NO. Nunca.
- 👤 **Tus derechos:** Acceder, corregir, eliminar, exportar tus datos
- ⏱️ **Cuánto guardamos:** Datos activos mientras usas VOLTA, luego 90 días para brechas de seguridad
- 💾 **Backup fiscal:** Transacciones se guardan 6 años (por ley)

---

## 1. QUIÉN SOMOS

**Nombre:** VOLTA SPA
**País:** República de Chile
**Sitio Web:** https://voltaapp.com
**Email:** privacy@voltaapp.com
**Responsable de Datos:** compliance@voltaapp.com

VOLTA es una plataforma de análisis de rendimiento deportivo para atletas de CrossFit.

---

## 2. DATOS QUE RECOGEMOS

### 2.1 Datos Que Proporcionas Directamente

| Dato | Propósito | Obligatorio |
|------|----------|-----------|
| **Email** | Crear cuenta, login, recuperar contraseña | ✅ Sí |
| **Nombre completo** | Perfil y contacto | ✅ Sí |
| **Contraseña (hasheada)** | Autenticación | ✅ Sí |
| **Edad** | Verificar elegibilidad (18+) | ✅ Sí |
| **Peso, altura** | Calcular métricas personalizadas | ⚠️ Opcional (pero recomendado) |
| **1RM (Squat, Deadlift, etc)** | Calcular intensidad de entrenamientos | ⚠️ Opcional |
| **Datos de Pago (Tarjeta)** | Procesar suscripción | ✅ Si compras Pro |
| **Foto de Perfil** | Mostrar en leaderboards | ⚠️ Opcional |

### 2.2 Datos que Recogemos Automáticamente

| Dato | Cómo lo Recogemos | Propósito |
|------|---------|----------|
| **IP Address** | Servidor web | Seguridad, prevención de fraude |
| **Device ID** | Apple IDFA (si permites) | Rastreo opcional en otras apps (ATT) |
| **Ubicación GPS** | Tu teléfono (si permites) | Entrenamientos al aire libre (opcional) |
| **Fecha/Hora de Acceso** | Servidor | Logs de seguridad |
| **Tipo de Dispositivo** | iOS metadata | Optimización |
| **Versión de App** | Sistema | Soporte técnico |
| **Errores/Crashes** | Sentry (monitoreo) | Mejorar estabilidad |

### 2.3 Datos Que Generas al Usar VOLTA

| Dato | Almacenamiento |
|------|---|
| **Entrenamientos registrados** | Tu cuenta (privado) |
| **IMR Score** | Tu cuenta (privado) |
| **ACWR (estrés/carga)** | Tu cuenta (privado) |
| **Readiness (0-100)** | Tu cuenta (privado) |
| **Sleep/Stress/Soreness** | Tu cuenta (privado) |
| **Gamificación (Voltaje, racha)** | Tu cuenta (privado) |
| **Leaderboard position** | Visible para otros (solo si participas) |

### 2.4 Datos de Terceros

Si eres coach, recopilamos:
- 📋 Email de tus atletas (que proporcionan ellos)
- 📊 Datos de atletas (que ellos suben)

**Responsabilidad:** Como coach, asegúrate de tener consentimiento para acceder a datos de menores.

---

## 3. BASES LEGALES PARA PROCESAR TUS DATOS

### 3.1 ¿Por Qué Guardamos Tus Datos?

| Base Legal | Aplicación | Período |
|----------|-----------|---------|
| **Contrato** | Proporcionar VOLTA | Mientras usas la app |
| **Consentimiento** | Marketing por email (si te suscribes) | Hasta que te desuscribas |
| **Obligación Legal** | Datos fiscales (transacciones) | 6 años (Código Tributario Chile) |
| **Interés Legítimo** | Seguridad, prevención de fraude | 90 días |
| **Consentimiento Explícito** | Ubicación GPS | Mientras lo permitas |
| **Consentimiento Explícito** | IDFA (rastreo en otras apps) | Mientras lo permitas |

### 3.2 Derechos de Privacidad en Chile (Ley 19.628)

Tienes derecho a:
- ✅ **Acceso:** Ver todos tus datos (solicita en privacy@voltaapp.com)
- ✅ **Corrección:** Corregir datos inexactos
- ✅ **Eliminación:** Borrar tus datos (derecho al olvido)
- ✅ **Bloqueo:** Suspender uso de tus datos
- ✅ **Portabilidad:** Exportar tus datos a otro formato

---

## 4. DÓNDE ALMACENAMOS TUS DATOS

### 4.1 Centros de Datos

| Componente | Proveedor | Ubicación | Encriptación |
|----------|-----------|----------|---|
| **Database (PostgreSQL)** | Supabase | Virginia, USA | AES-256 en reposo |
| **Hosting (Frontend/API)** | Vercel | Virginia, USA | TLS 1.3 en tránsito |
| **Cache (Redis)** | Upstash | Virginia, USA | Protegido con token |
| **Logs de Seguridad** | Sentry | Servidores privados | Encriptado |
| **Backups** | Supabase | Múltiples regiones | Redundancia geográfica |

### 4.2 Transferencias Internacionales

**Tus datos pueden transferirse a:**
- 🇺🇸 USA (Vercel, Supabase, Upstash)
- 🇪🇺 Europa (backups)
- 🇨🇱 Chile (contacto local)

**Protecciones:**
- ✅ Contratos de transferencia (Data Processing Agreements)
- ✅ Encriptación de extremo a extremo
- ✅ Cumplimiento GDPR Privacy Shield

---

## 5. CON QUIÉNES COMPARTIMOS TUS DATOS

### 5.1 Terceros Autorizados

| Proveedor | Datos Compartidos | Propósito | País |
|-----------|---------|----------|------|
| **Supabase** | Todo (en servidor) | Base de datos | USA/EU |
| **Stripe** | Email, nombre, monto | Procesar pagos | USA |
| **Vercel** | IP, logs | Hosting | USA |
| **Sentry** | Errores (anónimizados) | Monitoreo | USA |
| **Upstash** | Cache (anónimizado) | Base de datos caché | USA |

### 5.2 Datos Que NO Compartimos

❌ **NUNCA vendemos:**
- Tu email
- Tus entrenamientos
- Tu ubicación
- Tus 1RMs
- Tu información de pago
- Tus biometría personales

### 5.3 Cuando SÍ Compartimos (Excepciones)

Compartimos datos si:
- 📋 **Obligación legal:** Orden judicial, autoridades
- ⚠️ **Emergencia:** Riesgo inmediato a seguridad pública
- 💼 **Fusión:** Si VOLTA es adquirida (te avisaremos)
- 👥 **Leaderboards:** Si participas públicamente (solo datos públicos)

---

## 6. COOKIES Y RASTREADORES

### 6.1 Cookies que Usamos

| Cookie | Propósito | Duración |
|--------|----------|---------|
| **session_id** | Mantener sesión iniciada | 30 días |
| **theme** | Preferencia de tema (light/dark) | 1 año |
| **language** | Idioma preferido | 1 año |
| **analytics** | Rastrear uso (Google Analytics) | 24 meses |

### 6.2 Cómo Controlar Cookies

**En iOS:**
- Configuración → Safari → Avanzado → Bloquear cookies

**En Navegador:**
- Borra cookies regularmente
- Usa modo privado

---

## 7. APP TRACKING TRANSPARENCY (ATT)

### 7.1 ¿Qué es IDFA?

IDFA = Identificador para Anunciantes en iOS
- Permite rastrear tu actividad en otras apps
- Puedes permitir o denegar en Configuración → Privacidad

### 7.2 Cómo Lo Usamos

**Si permites:**
- Rastreamos si descargas apps relacionadas con fitness
- Optimizamos anuncios para ti
- Mejoramos algoritmos de recomendación

**Si deniegас:**
- Funciona igual (sin rastreo cruzado)
- Solo rastreamos dentro de VOLTA

### 7.3 Tu Control

Puedes cambiar en cualquier momento:
- iOS Configuración → Privacidad → Rastreo de apps → VOLTA

---

## 8. SEGURIDAD DE DATOS

### 8.1 Encriptación

| Componente | Método | Estándar |
|----------|--------|----------|
| **En tránsito** | TLS 1.3 | NIST FIPS 140-2 |
| **En reposo** | AES-256 | Military-grade |
| **Contraseñas** | Bcrypt + SHA-256 | No reversible |
| **Pagos** | PCI-DSS v3.2.1 | Cumplimiento Stripe |

### 8.2 Autenticación Multi-Factor

- ✅ Email + Contraseña (obligatorio)
- ✅ 2FA con app autenticadora (próximamente)
- ✅ OAuth Google (próximamente)

### 8.3 Acceso Interno

- 🔐 Solo 3 empleados acceden a datos (compliance team)
- 📋 Todos bajo NDA (Acuerdos de Confidencialidad)
- ✅ Acceso auditado cada 30 días
- 🔑 Contraseñas almacenadas en gestor seguro (LastPass Enterprise)

---

## 9. BRECHAS DE SEGURIDAD

### 9.1 ¿Qué Hacemos si Ocurre una Brecha?

1. ⚠️ **Detección:** Sistema de monitoreo 24/7 (Sentry)
2. 📞 **Notificación (< 72 horas):** Te avisamos por email
3. 🔍 **Investigación:** Análisis forense
4. 🛡️ **Mitigación:** Resetear contraseña de afectados
5. 📋 **Reporte:** A autoridades (si aplica)

### 9.2 Notificación

Te avisaremos si tus datos están en riesgo:
- ✉️ Email directo
- 📱 Notificación en app
- 🌐 Anuncio en privacyincident.voltaapp.com

---

## 10. RETENCIÓN DE DATOS

### 10.1 Cuánto Tiempo Guardamos

| Datos | Tiempo | Razón |
|-------|--------|-------|
| **Perfil (mientras usas)** | Activo | Necesario para servicio |
| **Entrenamientos** | Activo | Tu solicitud |
| **Transacciones** | 6 años | Ley Código Tributario |
| **Logs de seguridad** | 90 días | Prevención de fraude |
| **Después de eliminar cuenta** | 30 días | Recuperación (si cambias de idea) |
| **Backups** | 7 días | Recuperación ante desastre |

### 10.2 Después de Eliminar Cuenta

**Se elimina permanentemente:**
- ✅ Perfil
- ✅ Entrenamientos
- ✅ Biometría
- ✅ Gamificación

**Se retiene (anónimizado):**
- 📊 Estadísticas agregadas
- 💳 Transacciones (6 años por ley)
- 🔐 Logs de seguridad (90 días)

---

## 11. TUS DERECHOS DE PRIVACIDAD

### 11.1 En Chile (Ley 19.628)

Puedes solicitar:

#### 📋 **Acceso (Habeas Data)**
- Ver todos tus datos
- Formato: JSON, CSV, PDF

**Cómo solicitar:**
```
Email: privacy@voltaapp.com
Asunto: Solicitud de Acceso a Datos
Incluye: Email registrado + ID
Respuesta: 10 días hábiles
```

#### ✏️ **Corrección**
- Corregir datos inexactos
- Puedes hacerlo desde la app

#### 🗑️ **Eliminación (Derecho al Olvido)**
- Borrar todos tus datos
- Desde app: Configuración → Privacidad → Eliminar Cuenta

#### 🔒 **Bloqueo**
- Suspender uso de tus datos
- Para litigios, investigaciones

#### 📤 **Portabilidad**
- Exportar datos a otro formato
- Cambiar de servicio

---

### 11.2 En Unión Europea (GDPR)

Si eres residente de UE:

| Derecho | Cómo Ejercerlo | Plazo |
|--------|-----------|-------|
| **Acceso** | privacy@voltaapp.com | 30 días |
| **Corrección** | App o por email | 30 días |
| **Eliminación** | Eliminar cuenta o email | 30 días |
| **Portabilidad** | Email | 30 días |
| **Oposición** | privacy@voltaapp.com | Inmediato |

---

### 11.3 En California (CCPA/CPRA)

Si eres residente de California:

#### 🚫 **"No Vender Mi Información Personal"**

Vamos a Configuración → Privacidad → "No vender información":
- Deshabilitarás venta de datos a terceros
- Nosotros **nunca vendemos**, pero cumplimos la opción

#### 📋 **Derechos CCPA**

- Saber qué datos recogemos
- Eliminar datos
- Opt-out de venta

**Contacta:** privacy@voltaapp.com

---

## 12. CAMBIOS A ESTA POLÍTICA

### 12.1 Cuándo Actualizamos

Actualizamos esta Política cuando:
- Agregamos nuevas funciones
- Cambiamos proveedores
- Interpretamos nuevas leyes

### 12.2 Notificación

**Cambios importantes:**
- 📧 Email 30 días antes
- 📱 Notificación en app
- ✅ Solicito nuevo consentimiento

**Cambios menores:**
- 📄 Publicar nueva versión
- ✅ El uso continuo = aceptación

---

## 13. INFORMACIÓN DE CONTACTO

### Para Ejercer Derechos de Privacidad

📧 **Email:** privacy@voltaapp.com
📋 **Formulario:** https://voltaapp.com/privacy-request
📞 **Teléfono:** +56 2 XXXX XXXX (próximamente)

### Para Reportar Brechas

⚠️ **Email:** security@voltaapp.com
🚨 **Emergencia:** compliance@voltaapp.com

---

## 14. INFORMACIÓN LEGAL

### 14.1 Responsable de Datos (Data Controller)

**VOLTA SPA**
- RUT: XX.XXX.XXX-X
- Domicilio: [Dirección en Chile]
- Teléfono: [Teléfono]

### 14.2 Delegado de Protección de Datos (DPO)

**David García** (Compliance Officer)
- Email: dpo@voltaapp.com
- Teléfono: +56 2 XXXX XXXX

### 14.3 Autoridad Supervisora

Si eres de UE:
- **AEPD** (Agencia Española): www.aepd.es
- **EDPB** (Junta Europea): www.edpb.europa.eu

Si eres de Chile:
- **SERNAC Digital:** www.sernacdigital.cl

---

## 15. DISPOSICIONES FINALES

### 15.1 Conflicto de Documentos

Si hay conflicto entre esta Política, Términos y otras políticas:
1. Esta Política de Privacidad prevalece
2. Aplican leyes locales de tu país
3. GDPR prevalece si eres residente UE

### 15.2 Severabilidad

Si una cláusula es inválida, el resto sigue en vigor.

---

**✅ Última revisión:** 5 de Abril, 2026
**📋 Versión:** 1.0 EN / 1.0 ES
**🔐 Cumplimiento:** Chile (Ley 19.628), GDPR, CCPA, LGPD

---

*Esta política fue redactada considerando regulaciones globales. Para asesoría legal específica, consulta abogado licenciado en tu jurisdicción.*
