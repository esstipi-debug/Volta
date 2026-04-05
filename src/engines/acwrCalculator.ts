/**
 * ENGINE #02 — ACWR Calculator (Acute:Chronic Workload Ratio)
 *
 * Detects injury risk by comparing recent training load (7-day acute)
 * against the rolling baseline (28-day chronic) using EWMA smoothing.
 *
 * EWMA (Exponentially Weighted Moving Average):
 *   λ_acute  = 0.25  → half-life ≈ 2.8 days  (fast response)
 *   λ_chronic = 0.069 → half-life ≈ 10 days  (slow baseline)
 *
 * ACWR = EWMA_acute / EWMA_chronic
 *
 * Zones:
 *   < 0.80  → underload   (detraining risk)
 *   0.80–1.30 → optimal   (safe training zone)
 *   1.30–1.50 → caution   (injury risk rising)
 *   > 1.50  → danger      (high injury risk — alert coach)
 *
 * Injury risk % (mapped from ACWR):
 *   ≤ 0.80 → 5%
 *   0.80–1.30 → 15%
 *   1.30–1.50 → 30%
 *   > 1.50 → 50–100% (linear)
 */

import { db } from '@/src/db'
import {
  training_sessions,
  acwr_daily,
  coach_alerts,
  profiles,
} from '@/src/db/schema'
import { eq, and, gte, desc, lte } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const LAMBDA_ACUTE = 0.25
export const LAMBDA_CHRONIC = 0.069

export const ACWR_ZONES = {
  UNDERLOAD: { min: 0,    max: 0.80,  label: 'underload', risk_pct: 5  },
  OPTIMAL:   { min: 0.80, max: 1.30,  label: 'optimal',   risk_pct: 15 },
  CAUTION:   { min: 1.30, max: 1.50,  label: 'caution',   risk_pct: 30 },
  DANGER:    { min: 1.50, max: 999,   label: 'danger',    risk_pct: 75 },
} as const

// ─────────────────────────────────────────────
// Pure EWMA update (no DB — used in bulk recalculation)
// ─────────────────────────────────────────────

export function updateEWMA(params: {
  prev_ewma: number
  new_load: number
  lambda: number
}): number {
  const { prev_ewma, new_load, lambda } = params
  return lambda * new_load + (1 - lambda) * prev_ewma
}

// ─────────────────────────────────────────────
// Classify ACWR ratio into zone + injury risk %
// ─────────────────────────────────────────────

export function classifyACWR(acwr_ratio: number): {
  zone: 'underload' | 'optimal' | 'caution' | 'danger'
  injury_risk_pct: number
} {
  if (acwr_ratio <= ACWR_ZONES.UNDERLOAD.max) {
    return { zone: 'underload', injury_risk_pct: 5 }
  }
  if (acwr_ratio <= ACWR_ZONES.OPTIMAL.max) {
    return { zone: 'optimal', injury_risk_pct: 15 }
  }
  if (acwr_ratio <= ACWR_ZONES.CAUTION.max) {
    return { zone: 'caution', injury_risk_pct: 30 }
  }
  // Danger zone: linear scale from 50% to 100% as ratio goes from 1.50 to 2.50
  const risk = Math.min(100, Math.round(50 + (acwr_ratio - 1.50) * 50))
  return { zone: 'danger', injury_risk_pct: risk }
}

// ─────────────────────────────────────────────
// Main calculation — runs after every session registration
// Called by BullMQ worker job "calculate-acwr"
// ─────────────────────────────────────────────

export async function calculateACWR(params: {
  athlete_id: string
  date: string        // ISO date string "YYYY-MM-DD"
  new_session_load: number  // session_load from the new session
  coach_id?: string | null  // to create alert if needed
}): Promise<{
  ewma_acute: number
  ewma_chronic: number
  acwr_ratio: number
  injury_risk_pct: number
  zone: 'underload' | 'optimal' | 'caution' | 'danger'
  days_in_zone: number
  alert_created: boolean
}> {
  const { athlete_id, date, new_session_load, coach_id } = params

  // Get previous day's ACWR values (most recent entry before today)
  const [prev_acwr] = await db
    .select({
      ewma_acute: acwr_daily.ewma_acute,
      ewma_chronic: acwr_daily.ewma_chronic,
      zone: acwr_daily.zone,
      days_in_zone: acwr_daily.days_in_zone,
    })
    .from(acwr_daily)
    .where(
      and(
        eq(acwr_daily.athlete_id, athlete_id),
        lte(acwr_daily.date, date)
      )
    )
    .orderBy(desc(acwr_daily.date))
    .limit(1)

  // Seed values if no prior history
  const prev_acute = prev_acwr ? parseFloat(String(prev_acwr.ewma_acute)) : 0
  const prev_chronic = prev_acwr ? parseFloat(String(prev_acwr.ewma_chronic)) : 0

  // Update EWMA values
  const ewma_acute = updateEWMA({ prev_ewma: prev_acute, new_load: new_session_load, lambda: LAMBDA_ACUTE })
  const ewma_chronic = updateEWMA({ prev_ewma: prev_chronic, new_load: new_session_load, lambda: LAMBDA_CHRONIC })

  // Calculate ratio (protect against division by zero on cold start)
  const acwr_ratio = ewma_chronic > 0.1
    ? Math.round((ewma_acute / ewma_chronic) * 1000) / 1000
    : 1.0

  // Classify zone
  const { zone, injury_risk_pct } = classifyACWR(acwr_ratio)

  // Track consecutive days in current zone
  const prev_zone = prev_acwr?.zone
  const prev_days = prev_acwr?.days_in_zone ?? 0
  const days_in_zone = zone === prev_zone
    ? (typeof prev_days === 'number' ? prev_days : parseInt(String(prev_days), 10)) + 1
    : 1

  // Upsert acwr_daily record
  await db
    .insert(acwr_daily)
    .values({
      athlete_id,
      date,
      ewma_acute: String(ewma_acute),
      ewma_chronic: String(ewma_chronic),
      acwr_ratio: String(acwr_ratio),
      injury_risk_pct,
      zone,
      days_in_zone,
    })
    .onConflictDoUpdate({
      target: [acwr_daily.athlete_id, acwr_daily.date],
      set: {
        ewma_acute: String(ewma_acute),
        ewma_chronic: String(ewma_chronic),
        acwr_ratio: String(acwr_ratio),
        injury_risk_pct,
        zone,
        days_in_zone,
      },
    })

  // ── Coach alert for danger zone ─────────────
  let alert_created = false

  if (zone === 'danger' && coach_id) {
    // Only create alert if not already alerted today for this athlete
    await db.insert(coach_alerts).values({
      coach_id,
      athlete_id,
      type: 'injury_risk',
      severity: 'urgent',
      message: `ACWR ${acwr_ratio.toFixed(2)} — alto riesgo de lesión. Carga aguda supera baseline crónico por ${Math.round((acwr_ratio - 1) * 100)}%.`,
      data: {
        acwr_ratio,
        ewma_acute,
        ewma_chronic,
        injury_risk_pct,
        zone,
        days_in_zone,
      },
    }).onConflictDoNothing()

    alert_created = true
  }

  if (zone === 'caution' && coach_id && days_in_zone >= 3) {
    // 3+ consecutive days in caution = create caution alert
    await db.insert(coach_alerts).values({
      coach_id,
      athlete_id,
      type: 'overtraining',
      severity: 'caution',
      message: `ACWR ${acwr_ratio.toFixed(2)} — ${days_in_zone} días consecutivos en zona amarilla. Considerar reducir volumen.`,
      data: { acwr_ratio, days_in_zone, zone },
    }).onConflictDoNothing()

    alert_created = true
  }

  return {
    ewma_acute: Math.round(ewma_acute * 10000) / 10000,
    ewma_chronic: Math.round(ewma_chronic * 10000) / 10000,
    acwr_ratio,
    injury_risk_pct,
    zone,
    days_in_zone,
    alert_created,
  }
}

// ─────────────────────────────────────────────
// Get current ACWR for athlete (for dashboard display)
// Returns today's or most recent available entry
// ─────────────────────────────────────────────

export async function getAthleteACWR(athlete_id: string): Promise<{
  acwr_ratio: number
  zone: 'underload' | 'optimal' | 'caution' | 'danger'
  injury_risk_pct: number
  ewma_acute: number
  ewma_chronic: number
  days_in_zone: number
  date: string
} | null> {
  const [entry] = await db
    .select()
    .from(acwr_daily)
    .where(eq(acwr_daily.athlete_id, athlete_id))
    .orderBy(desc(acwr_daily.date))
    .limit(1)

  if (!entry) return null

  return {
    acwr_ratio: parseFloat(String(entry.acwr_ratio)),
    zone: entry.zone as 'underload' | 'optimal' | 'caution' | 'danger',
    injury_risk_pct: entry.injury_risk_pct ?? 0,
    ewma_acute: parseFloat(String(entry.ewma_acute)),
    ewma_chronic: parseFloat(String(entry.ewma_chronic)),
    days_in_zone: entry.days_in_zone ?? 1,
    date: String(entry.date),
  }
}

// ─────────────────────────────────────────────
// Get ACWR history for graph (last N days)
// ─────────────────────────────────────────────

export async function getACWRHistory(athlete_id: string, days = 30): Promise<Array<{
  date: string
  acwr_ratio: number
  zone: string
  ewma_acute: number
  ewma_chronic: number
}>> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const cutoff_str = cutoff.toISOString().split('T')[0]

  const rows = await db
    .select({
      date: acwr_daily.date,
      acwr_ratio: acwr_daily.acwr_ratio,
      zone: acwr_daily.zone,
      ewma_acute: acwr_daily.ewma_acute,
      ewma_chronic: acwr_daily.ewma_chronic,
    })
    .from(acwr_daily)
    .where(
      and(
        eq(acwr_daily.athlete_id, athlete_id),
        gte(acwr_daily.date, cutoff_str)
      )
    )
    .orderBy(acwr_daily.date)

  return rows.map(r => ({
    date: String(r.date),
    acwr_ratio: parseFloat(String(r.acwr_ratio)),
    zone: r.zone ?? 'optimal',
    ewma_acute: parseFloat(String(r.ewma_acute)),
    ewma_chronic: parseFloat(String(r.ewma_chronic)),
  }))
}
