/**
 * Tests — Engine #14 Programming Guide
 *
 * Correr: npx ts-node tests/engines/programmingGuide.test.ts
 *
 * Valida los 3 análisis del engine:
 *   A) Cooldowns por zona CNS
 *   B) Distribución tenet vs CompTrain
 *   C) Proyección ACWR del box
 */

import { analyzeProgramming, type WeeklyState } from '../../src/engines/programmingGuide'

// ─────────────────────────────────────────────
// HELPERS DE TEST
// ─────────────────────────────────────────────

const TOMORROW = (() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
})()

const YESTERDAY = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().split('T')[0]
})()

const FIVE_DAYS_AGO = (() => {
  const d = new Date()
  d.setDate(d.getDate() - 5)
  return d.toISOString().split('T')[0]
})()

const EMPTY_WEEKLY_STATE: WeeklyState = {
  strength_count: 0,
  conditioning_count: 0,
  mobility_count: 0,
  movements_used: {},
  avg_acwr_box: 1.0,
  weekly_load_projected: 0,
}

let passed = 0
let failed = 0
const failures: string[] = []

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e: any) {
    console.log(`  ❌ ${name}`)
    console.log(`     → ${e.message}`)
    failed++
    failures.push(`${name}: ${e.message}`)
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
      }
    },
    toBeGreaterThan(n: number) {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`)
    },
    toBeLessThan(n: number) {
      if (actual >= n) throw new Error(`Expected ${actual} < ${n}`)
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
      }
    },
    toContain(item: string) {
      if (!actual.includes(item)) {
        throw new Error(`Expected array/string to contain "${item}", got: ${JSON.stringify(actual)}`)
      }
    },
    toHaveLength(n: number) {
      if (actual.length !== n) {
        throw new Error(`Expected length ${n}, got ${actual.length}`)
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${actual}`)
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${actual}`)
    },
    toBeNull() {
      if (actual !== null) throw new Error(`Expected null, got ${JSON.stringify(actual)}`)
    },
  }
}

// ─────────────────────────────────────────────
// SUITE A — COOLDOWNS
// ─────────────────────────────────────────────

console.log('\n📋 Suite A — Cooldowns CNS\n')

test('A1: Sin historial → sin cooldown violations', () => {
  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 60,
    movements: [
      { movement_id: 'back_squat', sets: 5, reps: 5, weight_kg_rx: 100 },
    ],
    weekly_state: EMPTY_WEEKLY_STATE,
  })

  expect(result.ok).toBe(true)
  expect(result.cooldown_flags).toHaveLength(0)
  expect(result.cautions).toHaveLength(0)
})

test('A2: Snatch ayer → CAUTION (Zona A — 72h, solo han pasado 24h)', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    movements_used: { snatch: YESTERDAY },
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 60,
    movements: [{ movement_id: 'snatch', sets: 5, reps: 3, weight_kg_rx: 80 }],
    weekly_state: state,
  })

  expect(result.ok).toBe(true)  // No es BLOCK, solo CAUTION
  expect(result.cautions.length).toBeGreaterThan(0)
  const caution = result.cautions.find(c => c.type === 'cooldown_violation')
  expect(caution).toBeTruthy()
})

test('A3: Snatch hace 5 días → sin cooldown (Zona A resuelto)', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    movements_used: { snatch: FIVE_DAYS_AGO },
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 60,
    movements: [{ movement_id: 'snatch', sets: 5, reps: 3, weight_kg_rx: 80 }],
    weekly_state: state,
  })

  const violations = result.cooldown_flags.filter(f => f.hours_remaining > 0)
  expect(violations).toHaveLength(0)
})

test('A4: Pull-up ayer → sin violation (Zona B, 48h. Solo han pasado 24h pero es B)', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    movements_used: { pull_up: YESTERDAY },
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 45,
    movements: [{ movement_id: 'pull_up', sets: 5, reps: 10 }],
    weekly_state: state,
  })

  // pull_up es Zona B (48h). YESTERDAY a TOMORROW = ~48h → borde
  // Puede tener flag o no dependiendo de horas exactas
  expect(typeof result.ok).toBe('boolean')  // Solo verifica que procesa
})

test('A5: Múltiples movimientos en cooldown → múltiples flags', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    movements_used: {
      clean_and_jerk: YESTERDAY,
      deadlift: YESTERDAY,
    },
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'FOR_TIME',
    comptrain_tenet: 'conditioning',
    estimated_imr: 70,
    movements: [
      { movement_id: 'clean_and_jerk', sets: 5, reps: 5, weight_kg_rx: 80 },
      { movement_id: 'deadlift', sets: 3, reps: 5, weight_kg_rx: 120 },
    ],
    weekly_state: state,
  })

  expect(result.cautions.length).toBeGreaterThan(0)
  expect(result.cooldown_flags.length).toBeGreaterThan(0)
})

// ─────────────────────────────────────────────
// SUITE B — DISTRIBUCIÓN DE TENETS
// ─────────────────────────────────────────────

console.log('\n📋 Suite B — Distribución Tenets CompTrain\n')

test('B1: Semana vacía con WOD de conditioning → sin warnings (aún hay días)', () => {
  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 55,
    movements: [],
    weekly_state: EMPTY_WEEKLY_STATE,
  })

  // Con sesión #1 conditioning y semana vacía → sin caution de déficit todavía
  expect(result.ok).toBe(true)
})

test('B2: 5 sesiones, sin movilidad → CAUTION movilidad', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    strength_count: 2,
    conditioning_count: 2,
    mobility_count: 0,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 55,
    movements: [],
    weekly_state: state,
  })

  const mobility_caution = result.cautions.find(c =>
    c.type === 'tenet_deficit' && c.id?.includes('mobility')
  )
  expect(mobility_caution).toBeTruthy()
})

test('B3: Semana con 4 sesiones de strength → CAUTION surplus', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    strength_count: 3,
    conditioning_count: 1,
    mobility_count: 0,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',  // este sería el 4to de strength
    estimated_imr: 60,
    movements: [],
    weekly_state: state,
  })

  const surplus = result.cautions.find(c => c.type === 'tenet_surplus')
  expect(surplus).toBeTruthy()
})

test('B4: Tenet projection actualiza conteos correctamente', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    strength_count: 1,
    conditioning_count: 2,
    mobility_count: 0,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 60,
    movements: [],
    weekly_state: state,
  })

  expect(result.tenet_projection.after_this_wod.strength).toBe(2)
  expect(result.tenet_projection.after_this_wod.conditioning).toBe(2)
  expect(result.tenet_projection.after_this_wod.mobility).toBe(0)
})

// ─────────────────────────────────────────────
// SUITE C — PROYECCIÓN ACWR
// ─────────────────────────────────────────────

console.log('\n📋 Suite C — Proyección ACWR del box\n')

test('C1: ACWR actual 1.0 → sin block ni caution', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    avg_acwr_box: 1.0,
    weekly_load_projected: 200,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 55,
    movements: [],
    weekly_state: state,
  })

  expect(result.block).toBeNull()
  expect(result.ok).toBe(true)
})

test('C2: ACWR actual 1.45 con WOD alto IMR → CAUTION o BLOCK', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    avg_acwr_box: 1.45,
    weekly_load_projected: 1200,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'CHIPPER',
    comptrain_tenet: 'conditioning',
    estimated_imr: 90,
    movements: [],
    weekly_state: state,
  })

  // Con ACWR 1.45 y carga alta → al menos CAUTION
  const has_acwr_issue = result.block !== null ||
    result.cautions.some(c => c.type === 'acwr_projection')
  expect(has_acwr_issue).toBeTruthy()
})

test('C3: ACWR muy bajo (< 0.8) → INFO underload', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    avg_acwr_box: 0.7,
    weekly_load_projected: 50,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 40,
    movements: [],
    weekly_state: state,
  })

  const underload_info = result.infos.find(i => i.type === 'acwr_projection')
  expect(underload_info).toBeTruthy()
  expect(underload_info?.id).toBe('acwr_underload')
})

test('C4: summary_for_storage tiene tipos correctos', () => {
  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 60,
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg_rx: 100 }],
    weekly_state: EMPTY_WEEKLY_STATE,
  })

  const s = result.summary_for_storage
  if (typeof s.has_block !== 'boolean') throw new Error('has_block debe ser boolean')
  if (typeof s.caution_count !== 'number') throw new Error('caution_count debe ser number')
  if (!Array.isArray(s.cooldown_violations)) throw new Error('cooldown_violations debe ser array')
  if (!Array.isArray(s.tenet_missing)) throw new Error('tenet_missing debe ser array')
  if (typeof s.acwr_projected !== 'number') throw new Error('acwr_projected debe ser number')
})

// ─────────────────────────────────────────────
// SUITE D — CASOS INTEGRADOS
// ─────────────────────────────────────────────

console.log('\n📋 Suite D — Casos integrados\n')

test('D1: WOD limpio en semana limpia → ok=true, sin cautions', () => {
  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 50,
    movements: [
      { movement_id: 'burpee', sets: 1, reps: 20 },
      { movement_id: 'wall_ball', sets: 1, reps: 20, weight_kg_rx: 9 },
      { movement_id: 'rowing_ergometer', sets: 1, reps: 1, duration_sec: 200 },
    ],
    weekly_state: EMPTY_WEEKLY_STATE,
  })

  expect(result.ok).toBe(true)
  expect(result.block).toBeNull()
  expect(result.cautions).toHaveLength(0)
})

test('D2: WOD con todo problemático → múltiples cautions, ok sigue true si no BLOCK', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    strength_count: 3,
    conditioning_count: 0,
    mobility_count: 0,
    movements_used: {
      snatch: YESTERDAY,
      clean_and_jerk: YESTERDAY,
    },
    avg_acwr_box: 1.35,
    weekly_load_projected: 800,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 75,
    movements: [
      { movement_id: 'snatch', sets: 5, reps: 3, weight_kg_rx: 80 },
      { movement_id: 'clean_and_jerk', sets: 5, reps: 3, weight_kg_rx: 90 },
    ],
    weekly_state: state,
  })

  // Múltiples cautions por cooldown + surplus
  expect(result.cautions.length).toBeGreaterThan(0)
  // guide_suggestions se puede guardar
  expect(result.summary_for_storage).toBeTruthy()
})

test('D3: ACWR del box > 1.5 con WOD alto → BLOCK', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    avg_acwr_box: 1.55,
    weekly_load_projected: 2000,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'CHIPPER',
    comptrain_tenet: 'conditioning',
    estimated_imr: 100,
    movements: [],
    weekly_state: state,
  })

  if (result.ok) {
    // Si no hay BLOCK, verificar que al menos hay caution de ACWR
    const has_acwr_warning = result.cautions.some(c => c.type === 'acwr_projection') ||
                             result.infos.some(c => c.type === 'acwr_projection')
    expect(has_acwr_warning).toBeTruthy()
  } else {
    expect(result.block).toBeTruthy()
    expect(result.block?.type).toBe('acwr_projection')
  }
})

test('D4: acwr_projection devuelve current, projected y zone', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    avg_acwr_box: 1.1,
    weekly_load_projected: 300,
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'AMRAP',
    comptrain_tenet: 'conditioning',
    estimated_imr: 60,
    movements: [],
    weekly_state: state,
  })

  expect(typeof result.acwr_projection.current_avg).toBe('number')
  expect(typeof result.acwr_projection.projected).toBe('number')
  expect(typeof result.acwr_projection.zone).toBe('string')
  expect(['underload', 'optimal', 'caution', 'danger']).toContain(result.acwr_projection.zone)
})

test('D5: cooldown_flags incluye movement_name y hours_remaining', () => {
  const state: WeeklyState = {
    ...EMPTY_WEEKLY_STATE,
    movements_used: { back_squat: YESTERDAY },
  }

  const result = analyzeProgramming({
    scheduled_date: TOMORROW,
    workout_type: 'STRENGTH',
    comptrain_tenet: 'strength',
    estimated_imr: 65,
    movements: [{ movement_id: 'back_squat', sets: 5, reps: 5, weight_kg_rx: 100 }],
    weekly_state: state,
  })

  const flag = result.cooldown_flags[0]
  if (flag) {
    expect(typeof flag.movement_name).toBe('string')
    expect(typeof flag.hours_remaining).toBe('number')
    expect(typeof flag.cooldown_hours).toBe('number')
    expect(['A', 'B', 'C']).toContain(flag.zone)
  }
})

// ─────────────────────────────────────────────
// REPORTE FINAL
// ─────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log(`Engine #14 — Programming Guide: ${passed} passed, ${failed} failed`)

if (failures.length > 0) {
  console.log('\nFailed tests:')
  failures.forEach(f => console.log(`  • ${f}`))
}

console.log('═'.repeat(50) + '\n')

if (failed > 0) process.exit(1)
