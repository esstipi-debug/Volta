/**
 * ENGINE #15 — Athlete Intelligence (Integration)
 *
 * Orquestación multi-engine que sintetiza recomendaciones de todos los motores
 * en un dashboard unificado para el atleta
 *
 * Propósito: Proporcionar recomendaciones coherentes y accionables integrando
 * todos los sistemas: estrés, readiness, sesiones, recuperación, lesiones, etc.
 *
 * Output: Dashboard diario con: sesión del día, objetivos, alertas, y próximos pasos
 */

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export type DashboardActionPriority = 'critical' | 'high' | 'medium' | 'low'

const RECOMMENDATION_WEIGHTS = {
  session_adaptation: 0.2,
  recovery_optimizer: 0.15,
  injury_predictor: 0.2,
  gamification: 0.15,
  periodization: 0.15,
  assessment: 0.1,
  coach_intelligence: 0.05,
}

const INTEGRATION_THRESHOLDS = {
  CONSENSUS_STRONG: 0.8, // 80%+ agreement on action
  CONSENSUS_MODERATE: 0.6, // 60%+ agreement
  CONSENSUS_WEAK: 0.4, // 40%+ agreement
  RECOMMENDATION_THRESHOLD: 0.65, // Include if score > 65%
}

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface EngineSignal {
  engine_name: string
  signal_type: string // 'action' | 'alert' | 'recommendation'
  priority: DashboardActionPriority
  confidence: number // 0-100
  message: string
  data?: Record<string, any>
}

export interface DailyAction {
  priority: DashboardActionPriority
  category: string // 'training' | 'recovery' | 'prevention' | 'motivation'
  title: string
  description: string
  implementation: string
  evidence_sources: string[] // Which engines recommend this
  confidence_pct: number
}

export interface DailyDashboard {
  athlete_id: string
  date: string

  todays_session: {
    workout_type: string
    intensity_recommendation: string
    expected_duration: string
    key_focus: string
  }

  daily_actions: DailyAction[]
  top_priority_action: DailyAction | null
  critical_alerts: string[]

  next_3_days_preview: {
    date: string
    focus: string
    key_metric: string
  }[]

  daily_metrics: {
    readiness: number
    acwr: number
    injury_risk_pct: number
    recovery_priority_score: number
  }

  motivational_insight: string
  overall_confidence: number
}

export interface AthleteIntelligenceInput {
  athlete_id: string
  date: string
  engine_signals: EngineSignal[]
  athlete_preferences?: {
    prefers_morning_training: boolean
    injury_sensitive: boolean
    goal: string
  }
}

export interface AthleteIntelligenceResult {
  daily_dashboard: DailyDashboard
  signal_consensus: Record<string, number> // consensus on each signal type
  recommendation_synthesis: string
  overall_athlete_state: 'optimal' | 'good' | 'caution' | 'concern'
  confidence_pct: number
}

// ─────────────────────────────────────────────
// Pure Functions
// ─────────────────────────────────────────────

/**
 * Sintetiza señales de múltiples engines
 */
export function synthesizeSignals(signals: EngineSignal[]): Record<string, number> {
  const consensus: Record<string, number> = {}

  const signal_groups: Record<string, EngineSignal[]> = {}
  for (const signal of signals) {
    if (!signal_groups[signal.signal_type]) {
      signal_groups[signal.signal_type] = []
    }
    signal_groups[signal.signal_type].push(signal)
  }

  // Calculate consensus for each signal type
  for (const [signal_type, group] of Object.entries(signal_groups)) {
    const avg_confidence = group.reduce((sum, s) => sum + s.confidence, 0) / group.length
    const high_priority_count = group.filter(s => s.priority === 'critical' || s.priority === 'high').length
    const consensus_score = (avg_confidence / 100) * 0.6 + (high_priority_count / group.length) * 0.4
    consensus[signal_type] = Math.round(consensus_score * 100)
  }

  return consensus
}

/**
 * Determina estado general del atleta
 */
export function determineAthleteState(
  signals: EngineSignal[]
): 'optimal' | 'good' | 'caution' | 'concern' {
  const critical_count = signals.filter(s => s.priority === 'critical').length
  const high_count = signals.filter(s => s.priority === 'high').length
  const avg_confidence = signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length

  if (critical_count >= 2) return 'concern'
  if (critical_count === 1 && high_count >= 2) return 'caution'
  if (high_count >= 3) return 'caution'
  if (avg_confidence >= 85 && critical_count === 0) return 'optimal'
  return 'good'
}

/**
 * Extrae acciones prioritarias de señales
 */
export function extractDailyActions(signals: EngineSignal[], date: string): DailyAction[] {
  const actions: DailyAction[] = []

  const action_signals = signals.filter(s => s.signal_type === 'action')

  for (const signal of action_signals) {
    if (signal.confidence >= INTEGRATION_THRESHOLDS.RECOMMENDATION_THRESHOLD * 100) {
      actions.push({
        priority: signal.priority,
        category: getActionCategory(signal.engine_name),
        title: signal.message,
        description: signal.data?.description || '',
        implementation: signal.data?.implementation || 'Follow engine recommendation',
        evidence_sources: [signal.engine_name],
        confidence_pct: signal.confidence,
      })
    }
  }

  // Merge similar actions from different engines
  const merged: Record<string, DailyAction> = {}
  for (const action of actions) {
    const key = action.title
    if (!merged[key]) {
      merged[key] = action
    } else {
      // Combine evidence sources
      merged[key].evidence_sources.push(...action.evidence_sources)
      merged[key].confidence_pct = Math.max(merged[key].confidence_pct, action.confidence_pct)
    }
  }

  // Sort by priority
  const priority_order = { critical: 0, high: 1, medium: 2, low: 3 }
  return Object.values(merged).sort(
    (a, b) => priority_order[a.priority] - priority_order[b.priority]
  )
}

/**
 * Determina categoría de acción
 */
function getActionCategory(engine_name: string): string {
  if (engine_name.includes('Recovery') || engine_name.includes('Sleep')) return 'recovery'
  if (engine_name.includes('Injury') || engine_name.includes('Injury')) return 'prevention'
  if (engine_name.includes('Session') || engine_name.includes('WOD')) return 'training'
  if (engine_name.includes('Gamification') || engine_name.includes('Coach')) return 'motivation'
  return 'training'
}

/**
 * Genera insight motivacional
 */
export function generateMotivationalInsight(
  signals: EngineSignal[],
  athlete_state: 'optimal' | 'good' | 'caution' | 'concern'
): string {
  if (athlete_state === 'optimal') {
    return '🚀 You\'re in peak condition! Seize today\'s training opportunity.'
  } else if (athlete_state === 'good') {
    return '💪 You\'re ready to train. Focus on consistency over intensity.'
  } else if (athlete_state === 'caution') {
    return '⚠️ Your body needs strategic recovery. Smart training today means stronger tomorrow.'
  } else {
    return '🛡️ Prioritize recovery today. Your future self will thank you.'
  }
}

/**
 * Main: Athlete Intelligence synthesis
 */
export function generateAthleteIntelligence(input: AthleteIntelligenceInput): AthleteIntelligenceResult {
  const { athlete_id, date, engine_signals } = input

  // Step 1: Synthesize signals
  const signal_consensus = synthesizeSignals(engine_signals)

  // Step 2: Determine athlete state
  const athlete_state = determineAthleteState(engine_signals)

  // Step 3: Extract daily actions
  const daily_actions = extractDailyActions(engine_signals, date)
  const top_priority_action = daily_actions.length > 0 ? daily_actions[0] : null

  // Step 4: Extract critical alerts
  const critical_alerts = engine_signals
    .filter(s => s.priority === 'critical')
    .map(s => s.message)

  // Step 5: Extract session recommendation
  const session_signal = engine_signals.find(s => s.engine_name.includes('Session'))
  const todays_session = {
    workout_type: session_signal?.data?.workout_type || 'TBD',
    intensity_recommendation: session_signal?.data?.intensity || 'Moderate',
    expected_duration: session_signal?.data?.duration || '45-60 min',
    key_focus: session_signal?.data?.focus || 'Full body development',
  }

  // Step 6: Extract metrics
  const acwr_signal = engine_signals.find(s => s.data?.acwr_value)
  const readiness_signal = engine_signals.find(s => s.data?.readiness_score)
  const injury_signal = engine_signals.find(s => s.engine_name.includes('Injury'))

  const daily_metrics = {
    readiness: readiness_signal?.data?.readiness_score || 75,
    acwr: acwr_signal?.data?.acwr_value || 1.1,
    injury_risk_pct: injury_signal?.data?.risk_pct || 20,
    recovery_priority_score: 100 - (daily_actions.length * 15),
  }

  // Step 7: Generate next 3 days preview
  const next_3_days_preview = Array.from({ length: 3 }, (_, i) => ({
    date: new Date(new Date(date).getTime() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    focus: ['Strength focus', 'Conditioning', 'Skill work'][i % 3],
    key_metric: ['Voltage', 'Readiness', 'Recovery'][i % 3],
  }))

  // Step 8: Generate motivational insight
  const motivational_insight = generateMotivationalInsight(engine_signals, athlete_state)

  // Step 9: Calculate overall confidence
  const avg_signal_confidence = engine_signals.reduce((sum, s) => sum + s.confidence, 0) / engine_signals.length
  const consensus_confidence = Object.values(signal_consensus).reduce((sum, v) => sum + v, 0) / Object.keys(signal_consensus).length
  const overall_confidence = Math.round((avg_signal_confidence * 0.6 + consensus_confidence * 0.4) / 10) * 10

  // Step 10: Generate recommendation synthesis
  const recommendation_synthesis =
    athlete_state === 'optimal'
      ? 'All systems optimal. Execute today\'s session with confidence.'
      : athlete_state === 'good'
        ? 'Good condition overall. Focus on form and consistency.'
        : athlete_state === 'caution'
          ? 'Some fatigue signals detected. Consider reducing volume while maintaining intensity on primary lift.'
          : 'Multiple recovery needs detected. Consider deload session or active recovery.'

  const daily_dashboard: DailyDashboard = {
    athlete_id,
    date,
    todays_session,
    daily_actions,
    top_priority_action,
    critical_alerts,
    next_3_days_preview,
    daily_metrics,
    motivational_insight,
    overall_confidence,
  }

  return {
    daily_dashboard,
    signal_consensus,
    recommendation_synthesis,
    overall_athlete_state: athlete_state,
    confidence_pct: overall_confidence,
  }
}
