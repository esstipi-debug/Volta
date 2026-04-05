# ACTIVO #11: Arquitectura Multi-Tenant — Modelo Atleta / Coach / Box

## Clasificación
- **Tipo:** Modelo de Datos (Data Architecture)
- **Prioridad:** ALTO — define la estructura comercial y de acceso de toda la plataforma
- **Estado actual:** Implementado en schema de Supabase + schemas Pydantic en Python

## Ubicación en el sistema actual
- **Schema principal:** `migrations/001_initial_schema.sql`
- **Schema Pydantic:** `backend/app/schemas/training.py` (TrainingSession, box, coach_notes)
- **Lógica de acceso:** `backend/app/main.py`

## Jerarquía de entidades

```
BOX (organización raíz)
  ├── id: UUID
  ├── name: string
  └── coaches: [COACH]
        ├── id: UUID
        ├── box_id: UUID (FK)
        └── athletes: [ATLETA]
              ├── id: UUID
              ├── coach_id: UUID (FK, NULLABLE ← clave del modelo dual)
              ├── box_id: UUID (FK, NULLABLE)
              └── training_sessions: [SESSION]
```

## El modelo dual (núcleo del activo)

### Modo Autónomo (coach_id = NULL)
```
Atleta se registra directamente → sin coach → sin box
  • Carga sus propios WODs manualmente
  • Recibe todos los cálculos (IMR, ACWR, Recovery, PRISMA)
  • Dashboard personal completo
  • Paga directamente (B2C)
```

### Modo Delegado (coach_id = UUID)
```
Atleta es invitado por coach → pertenece a un box
  • Coach entrega los WODs al atleta
  • Coach puede modificar movimientos (scaling)
  • Coach puede ver el dashboard del atleta
  • Coach puede ver el agregado de todos sus atletas
  • El box paga por todos los atletas (B2B)
```

## TrainingSession: estructura de datos de sesión

El activo central es `TrainingSession`, que soporta los 8 tipos de WOD:

| Campo | Tipo | Función |
|---|---|---|
| `athlete_id` | UUID | Identifica al propietario |
| `workout_type` | Enum | AMRAP / FOR_TIME / EMOM / STRENGTH / CHIPPER / LADDER / INTERVAL / LSD |
| `amrap / for_time / emom / strength` | Optional object | Estructura específica por tipo |
| `result` | WorkoutResult | Resultado real del atleta |
| `was_scaled` | bool | Distingue Rx de Scaled |
| `scaling_reason` | string | Por qué se escaló |
| `coach_notes` | string | Observaciones del coach |
| `athlete_notes` | string | Observaciones del atleta |
| `imr_score` | float | Auto-calculado por el sistema |

## Flujo de permisos

```
COACH puede:
  ✅ Crear WODs y asignarlos a sus atletas
  ✅ Ver IMR, ACWR, Readiness de cada atleta
  ✅ Ver radar PRISMA agregado del box
  ✅ Modificar scaling de cualquier atleta bajo su cargo
  ❌ Ver atletas de otro coach / otro box

ATLETA puede:
  ✅ Ver su propio dashboard completo
  ✅ Registrar sus resultados
  ✅ Ver su historial de progresión
  ❌ Ver datos de otros atletas
  ❌ (en modo delegado) Crear WODs — solo el coach los crea

BOX OWNER puede:
  ✅ Ver métricas agregadas de todo el box
  ✅ Ver todos los coaches y atletas
  ✅ Comparar rendimiento entre coaches
```

## Valor estratégico

### Canal B2C
- Atleta individual → registro directo → pago mensual personal
- No requiere coach ni box
- Entrada de bajo fricción: empieza en 5 minutos

### Canal B2B
- Box paga por sus atletas → precio por asiento
- Coach como punto de venta: convencer a 1 coach = 20-40 atletas suscritos
- El box ve ROI directamente (métricas de retención y lesiones)

### Por qué esto es un activo
La mayoría de competidores eligen UN modelo. VOLTA tiene ambos por diseño:
- Si el atleta llega sin coach → entra por B2C
- Si el box adopta VOLTA → todos sus atletas migran a B2B
- El atleta que empezó en B2C puede conectarse a un coach después sin perder historial

## Requisitos para migración/adaptación
1. **Preservar `coach_id` como NULLABLE** — es el switch que habilita el modo dual
2. **Mantener Row Level Security (RLS)** en Supabase para aislar datos entre boxes
3. **El historial del atleta debe migrar con él** cuando se conecta a un coach
4. **Diseñar el flujo de invitación coach → atleta** (link de invitación, QR, o código de box)
5. **Separar precios B2C vs B2B** en la tabla de suscripciones
6. **Auditoría de acceso:** registrar cuándo un coach accede al dashboard de un atleta
