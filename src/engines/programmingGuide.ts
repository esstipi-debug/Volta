/**
 * ENGINE #14 — Programming Guide Engine
 *
 * Analiza en tiempo real el WOD que el coach está creando.
 * Previene redundancias, desequilibrios y riesgo de sobreentrenamiento
 * ANTES de que sucedan — mientras el coach todavía puede modificarlo.
 *
 * 3 análisis simultáneos:
 *   A) Cooldowns por zona CNS (72h / 48h / 12h)
 *   B) Distribución semanal vs mínimos CompTrain
 *   C) Proyección ACWR del box
 *
 * Endpoint: POST /api/engines/programming-guide
 * Tiempo: < 800ms
 *
 * Filosofía:
 *   - El coach SIEMPRE puede ignorar las sugerencias
 *   - Solo hay 1 BLOCK real: ACWR proyectado > 1.5
 *   - Todo lo demás es INFO o CAUTION (informativo, no bloqueante)
 *   - Un BLOCK requiere 2 taps para ignorar (guide_override = true)
 */

import { MOVEMENT_CATALOG } from './stressEngine'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export type SuggestionLevel = 'info' | 'caution' | 'block'
export type TenetType = 'strength' | 'conditioning' | 'mobility'

export interface MovementForAnalysis {
  movement_id: string
  sets: number
  reps: number
  weight_kg_rx?: number
  duration_sec?: number
}

export interface WeeklyState {
  strength_count: number       // WODs con tenet = 'strength' esta semana
  conditioning_count: number   // WODs con tenet = 'conditioning' esta semana
  mobility_count: number       // WODs con tenet = 'mobility' esta semana
  // Mapa: movement_id → fecha ISO del último uso (string YYYY-MM-DD)
  movements_used: Record<string, string>
  // ACWR promedio actual del box (0 si sin datos)
  avg_acwr_box: number
  // Carga semanal proyectada acumulada del box hasta ahora
  weekly_load_projected: number
}

export interface ProgrammingGuideInput {
  // WOD que el coach está creando / guardando
  scheduled_date: string       // "YYYY-MM-DD"
  workout_type: string
  comptrain_tenet: TenetType
  estimated_imr: number        // IMR estimado del WOD nuevo
  movements: MovementForAnalysis[]

  // Estado actual de la semana del box (viene de programming_weekly_state)
  weekly_state: WeeklyState

  // Fecha de referencia (normalmente = today)
  today?: string
}

export interface CooldownFlag {
  movement_id: string
  movement_name: string
  zone: 'A' | 'B' | 'C'
  cooldown_hours: 72 | 48 | 12
  last_used_date: string
  hours_since_last_use: number
  hours_remaining: number
  level: SuggestionLevel   // 'caution' si hay horas_remaining > 0
}

export interface TenetProjection {
  strength: number
  conditioning: number
  mobility: number
  after_this_wod: { strength: number; conditioning: number; mobility: number }
  missing: TenetType[]       // tenets que están por debajo del mínimo CompTrain
  surplus: TenetType[]       // tenets que están por encima del recomendado
}

export interface ACWRProjection {
  current_avg: number         // ACWR promedio actual del box
  projected: number           // ACWR estimado después de añadir este WOD
  zone: 'underload' | 'optimal' | 'caution' | 'danger'
  delta: number               // proyectado - actual
}

export interface ProgrammingGuideSuggestion {
  id: string                  // unique key para el frontend
  level: SuggestionLevel
  type:
    | 'cooldown_violation'
    | 'tenet_deficit'
    | 'tenet_surplus'
    | 'acwr_projection'
    | 'mobility_missing'
    | 'movement_repeated'
  message: string
  movement_id?: string        // si aplica a un movimiento específico
  data?: Record<string, any>  // datos adicionales para el UI
}

export interface ProgrammingGuideResult {
  /**
   * false si hay algún BLOCK (ACWR > 1.5 proyectado)
   * true en todos los demás casos — el coach puede guardar
   */
  ok: boolean

  /** Si ok=false: el motivo del bloqueo */
  block: ProgrammingGuideSuggestion | null

  /** Sugerencias de nivel CAUTION (no bloquean, pero el coach debería considerar) */
  cautions: ProgrammingGuideSuggestion[]

  /** Sugerencias de nivel INFO (solo informativas) */
  infos: ProgrammingGuideSuggestion[]

  /** Análisis de cooldowns por movimiento del WOD */
  cooldown_flags: CooldownFlag[]

  /** Distribución de tenets: estado actual + proyectado con este WOD */
  tenet_projection: TenetProjection

  /** Proyección de ACWR del box si se añade este WOD */
  acwr_projection: ACWRProjection

  /**
   * Resumen para guardar en wod_templates.guide_suggestions
   * Solo incluye cautions + block (no infos — demasiado verboso)
   */
  summary_for_storage: {
    has_block: boolean
    caution_count: number
    acwr_projected: number
    cooldown_violations: string[]  // movement_ids con violación
    tenet_missing: TenetType[]
  }
}

// ─────────────────────────────────────────────
// CompTrain mínimos semanales (semana de 5 sesiones)
// ─────────────────────────────────────────────

const COMPTRAIN_MINIMUMS: Record<TenetType, number> = {
  strength: 2,
  conditioning: 3,
  mobility: 1,
}

// Zona CNS → cooldown mínimo en horas
const COOLDOWN_HOURS: Record<'A' | 'B' | 'C', number> = {
  A: 72,
  B: 48,
  C: 12,
}

// ─────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────

function hoursBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime()
  const b = new Date(dateB).getTime()
  return Math.abs(b - a) / (1000 * 60 * 60)
}

function isoToday(): string {
  return new Date().toISOString().split('T')[0]
}

function acwrZone(ratio: number): 'underload' | 'optimal' | 'caution' | 'danger' {
  if (ratio < 0.8) return 'underload'
  if (ratio <= 1.3) return 'optimal'
  if (ratio <= 1.5) return 'caution'
  return 'danger'
}

// ─────────────────────────────────────────────
// Análisis A — Cooldowns por zona CNS
// ─────────────────────────────────────────────

function analyzeCooldowns(
  movements: MovementForAnalysis[],
  movements_used: Record<string, string>,
  scheduled_date: string
): { flags: CooldownFlag[]; suggestions: ProgrammingGuideSuggestion[] } {
  const flags: CooldownFlag[] = []
  const suggestions: ProgrammingGuideSuggestion[] = []

  for (const mov of movements) {
    const catalog = MOVEMENT_CATALOG[mov.movement_id]
    if (!catalog) continue

    const last_used = movements_used[mov.movement_id]
    if (!last_used) continue  // never used → no cooldown issue

    const cooldown_hours = COOLDOWN_HOURS[catalog.cooldown_zone]
    const hours_since = hoursBetween(last_used, scheduled_date)
    const hours_remaining = Math.max(0, cooldown_hours - hours_since)

    const flag: CooldownFlag = {
      movement_id: mov.movement_id,
      movement_name: catalog.name,
      zone: catalog.cooldown_zone,
      cooldown_hours: cooldown_hours as 72 | 48 | 12,
      last_used_date: last_used,
      hours_since_last_use: Math.round(hours_since),
      hours_remaining: Math.round(hours_remaining),
      level: hours_remaining > 0 ? 'caution' : 'info',
    }

    flags.push(flag)

    if (hours_remaining > 0) {
      // Zona A con < 48h → CAUTION fuerte (texto más directo)
      const isStrongCaution = catalog.cooldown_zone === 'A' && hours_since < 48

      suggestions.push({
        id: `cooldown_${mov.movement_id}`,
        level: 'caution',
        type: 'cooldown_violation',
        message: isStrongCaution
          ? `${catalog.name} se usó hace ${Math.round(hours_since)}h. Zona CNS A requiere mínimo 72h de recuperación. Riesgo de lesión por fatiga acumulada.`
          : `${catalog.name} se usó hace ${Math.round(hours_since)}h. Cooldown recomendado: ${cooldown_hours}h. Quedan ${Math.round(hours_remaining)}h de recuperación.`,
        movement_id: mov.movement_id,
        data: {
          zone: catalog.cooldown_zone,
          hours_since: Math.round(hours_since),
          hours_remaining: Math.round(hours_remaining),
          cooldown_hours,
        },
      })
    }
  }

  return { flags, suggestions }
}

// ─────────────────────────────────────────────
// Análisis B — Distribución semanal vs CompTrain
// ─────────────────────────────────────────────

function analyzeTenetDistribution(
  weekly_state: WeeklyState,
  new_tenet: TenetType
): { projection: TenetProjection; suggestions: ProgrammingGuideSuggestion[] } {
  const after = {
    strength:     weekly_state.strength_count     + (new_tenet === 'strength' ? 1 : 0),
    conditioning: weekly_state.conditioning_count + (new_tenet === 'conditioning' ? 1 : 0),
    mobility:     weekly_state.mobility_count     + (new_tenet === 'mobility' ? 1 : 0),
  }

  const missing: TenetType[] = []
  const surplus: TenetType[] = []
  const suggestions: ProgrammingGuideSuggestion[] = []

  // Chequear qué tenets están por debajo del mínimo DESPUÉS de añadir este WOD
  // Asumimos que hay al menos 1-2 días más en la semana — solo alertamos si ya es tarde
  const total_sessions_after = after.strength + after.conditioning + after.mobility

  for (const tenet of ['strength', 'conditioning', 'mobility'] as TenetType[]) {
    const current_count = after[tenet]
    const minimum = COMPTRAIN_MINIMUMS[tenet]

    if (current_count < minimum) {
      missing.push(tenet)

      // Solo generar CAUTION si estamos en viernes (sesión 5+) y aún falta
      if (total_sessions_after >= 4) {
        suggestions.push({
          id: `tenet_deficit_${tenet}`,
          level: 'caution',
          type: 'tenet_deficit',
          message: tenet === 'mobility'
            ? `⚠️ Sin sesión de movilidad esta semana. CompTrain requiere mínimo 1. Considera añadir movilidad a otro WOD o un día dedicado.`
            : `Esta semana lleva ${current_count} de ${minimum} sesiones de ${tenet === 'strength' ? 'fuerza' : 'condicionamiento'} requeridas.`,
          data: { tenet, current: current_count, minimum, sessions_so_far: total_sessions_after },
        })
      } else {
        // Aún hay días disponibles — solo INFO
        suggestions.push({
          id: `tenet_info_${tenet}`,
          level: 'info',
          type: 'tenet_deficit',
          message: `Esta semana: ${current_count}/${minimum} ${tenet}. Quedan días para alcanzar el mínimo.`,
          data: { tenet, current: current_count, minimum },
        })
      }
    }
  }

  // Surplus: demasiada concentración en un tenet
  for (const tenet of ['strength', 'conditioning', 'mobility'] as TenetType[]) {
    if (after[tenet] >= 4 && new_tenet === tenet) {
      surplus.push(tenet)
      suggestions.push({
        id: `tenet_surplus_${tenet}`,
        level: 'caution',
        type: 'tenet_surplus',
        message: `Alta concentración: ${after[tenet]} sesiones de ${tenet} esta semana. Considera balancear con otros tenets.`,
        data: { tenet, count: after[tenet] },
      })
    }
  }

  return {
    projection: {
      strength: weekly_state.strength_count,
      conditioning: weekly_state.conditioning_count,
      mobility: weekly_state.mobility_count,
      after_this_wod: after,
      missing,
      surplus,
    },
    suggestions,
  }
}

// ─────────────────────────────────────────────
// Análisis C — Proyección ACWR del box
// ─────────────────────────────────────────────

function analyzeACWRProjection(
  weekly_state: WeeklyState,
  new_imr: number
): { projection: ACWRProjection; block: ProgrammingGuideSuggestion | null; suggestion: ProgrammingGuideSuggestion | null } {
  const current = weekly_state.avg_acwr_box

  // Proyección simplificada:
  // Si el ACWR actual ya está en zona de precaución y añadimos más carga
  // → estimamos el incremento proporcional
  const load_increase_factor = weekly_state.weekly_load_projected > 0
    ? new_imr / (weekly_state.weekly_load_projected / Math.max(1, weekly_state.strength_count + weekly_state.conditioning_count + weekly_state.mobility_count))
    : 1.0

  // EWMA acute increment: λ_acute = 0.25, so adding new_imr pushes acute up
  const LAMBDA_ACUTE = 0.25
  const projected = current > 0
    ? Math.round((current + LAMBDA_ACUTE * load_increase_factor * 0.1) * 1000) / 1000
    : 1.0  // sin datos = asume zona óptima

  const zone = acwrZone(projected)
  const delta = Math.round((projected - current) * 1000) / 1000

  const projection: ACWRProjection = { current_avg: current, projected, zone, delta }

  // BLOCK solo si proyección > 1.5
  if (projected > 1.5) {
    return {
      projection,
      block: {
        id: 'acwr_block',
        level: 'block',
        type: 'acwr_projection',
        message: `🔴 BLOCK: ACWR proyectado del box es ${projected.toFixed(2)} (peligro). Añadir este WOD aumentaría el riesgo de lesión del grupo. Requiere confirmación explícita.`,
        data: { current, projected, zone, new_imr },
      },
      suggestion: null,
    }
  }

  // CAUTION si 1.3–1.5
  if (projected > 1.3) {
    return {
      projection,
      block: null,
      suggestion: {
        id: 'acwr_caution',
        level: 'caution',
        type: 'acwr_projection',
        message: `⚠️ ACWR proyectado del box: ${projected.toFixed(2)}. Zona de precaución. Considera reducir el volumen o intensidad de este WOD.`,
        data: { current, projected, zone, new_imr },
      },
    }
  }

  // INFO si muy bajo (underload)
  if (projected < 0.8 && current > 0) {
    return {
      projection,
      block: null,
      suggestion: {
        id: 'acwr_underload',
        level: 'info',
        type: 'acwr_projection',
        message: `ℹ️ Carga semanal baja. ACWR proyectado: ${projected.toFixed(2)}. El box podría estar en subcarga.`,
        data: { current, projected, zone },
      },
    }
  }

  // Zona óptima → sin sugerencia
  return { projection, block: null, suggestion: null }
}

// ─────────────────────────────────────────────
// FUNCIÓN PRINCIPAL
// ─────────────────────────────────────────────

export function analyzeProgramming(input: ProgrammingGuideInput): ProgrammingGuideResult {
  const today = input.today ?? isoToday()

  // ── A) Cooldowns ─────────────────────────────
  const { flags: cooldown_flags, suggestions: cooldown_suggestions } = analyzeCooldowns(
    input.movements,
    input.weekly_state.movements_used,
    input.scheduled_date
  )

  // ── B) Distribución tenet ────────────────────
  const { projection: tenet_projection, suggestions: tenet_suggestions } = analyzeTenetDistribution(
    input.weekly_state,
    input.comptrain_tenet
  )

  // ── C) Proyección ACWR ───────────────────────
  const {
    projection: acwr_projection,
    block: acwr_block,
    suggestion: acwr_suggestion,
  } = analyzeACWRProjection(input.weekly_state, input.estimated_imr)

  // ── Consolidar resultados ────────────────────
  const all_suggestions = [
    ...cooldown_suggestions,
    ...tenet_suggestions,
    ...(acwr_suggestion ? [acwr_suggestion] : []),
  ]

  const cautions = all_suggestions.filter(s => s.level === 'caution')
  const infos = all_suggestions.filter(s => s.level === 'info')

  const ok = acwr_block === null

  return {
    ok,
    block: acwr_block,
    cautions,
    infos,
    cooldown_flags,
    tenet_projection,
    acwr_projection,
    summary_for_storage: {
      has_block: !ok,
      caution_count: cautions.length,
      acwr_projected: acwr_projection.projected,
      cooldown_violations: cooldown_flags
        .filter(f => f.hours_remaining > 0)
        .map(f => f.movement_id),
      tenet_missing: tenet_projection.missing,
    },
  }
}

// ─────────────────────────────────────────────
// Helper: construir WeeklyState desde DB results
// Facilita el uso desde la API route
// ─────────────────────────────────────────────

export interface WeeklyStateFromDB {
  strength_count?: number
  conditioning_count?: number
  mobility_count?: number
  movement_volume?: Record<string, { last_date: string }> | null
  avg_acwr_box?: number
  weekly_load_projected?: number | string
}

export function buildWeeklyState(db_row: WeeklyStateFromDB): WeeklyState {
  const movements_used: Record<string, string> = {}

  if (db_row.movement_volume) {
    for (const [movement_id, data] of Object.entries(db_row.movement_volume)) {
      if (data?.last_date) {
        movements_used[movement_id] = data.last_date
      }
    }
  }

  return {
    strength_count: db_row.strength_count ?? 0,
    conditioning_count: db_row.conditioning_count ?? 0,
    mobility_count: db_row.mobility_count ?? 0,
    movements_used,
    avg_acwr_box: db_row.avg_acwr_box ?? 0,
    weekly_load_projected: parseFloat(String(db_row.weekly_load_projected ?? 0)),
  }
}
