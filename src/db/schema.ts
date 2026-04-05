import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  decimal,
  jsonb,
  unique,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { sql } from 'drizzle-orm'

// ─────────────────────────────────────────────
// BLOQUE 1: USUARIOS Y PERFILES
// ─────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: text('email').unique().notNull(),
  password_hash: text('password_hash'), // null si OAuth
  name: text('name').notNull(),
  role: text('role').notNull(), // 'athlete' | 'coach'
  email_verified: timestamp('email_verified'),
  image: text('image'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const boxes = pgTable('boxes', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  name: text('name').notNull(), // "CrossFit Norte"
  code: text('code').unique().notNull(), // "CFNORTE"
  coach_id: uuid('coach_id'), // FK → profiles.id (set after profile created)
  coach_intensity_preference: text('coach_intensity_preference').default('standard'),
  strict_programming_mode: boolean('strict_programming_mode').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // FK → users.id (same UUID)
  box_id: uuid('box_id').references(() => boxes.id),
  coach_id: uuid('coach_id'), // FK → profiles.id (self-reference)
  onboarding_done: boolean('onboarding_done').default(false).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const athlete_profiles = pgTable('athlete_profiles', {
  id: uuid('id').primaryKey(), // FK → profiles.id
  age: integer('age'),
  weight_kg: decimal('weight_kg', { precision: 5, scale: 2 }),
  height_cm: integer('height_cm'),
  sex: text('sex'), // 'M' | 'F' | 'other'
  cf_experience: text('cf_experience'), // 'beginner' | 'intermediate' | 'advanced'
  is_active: boolean('is_active').default(true),
  programming_mode: text('programming_mode').default('box_wod'), // 'box_wod' | 'personalized' | 'hybrid'
  cardio_protocol_enabled: boolean('cardio_protocol_enabled').default(false),
  cardio_phase: integer('cardio_phase').default(1),
  cardio_phase_started_at: date('cardio_phase_started_at'),
  athlete_code: text('athlete_code').unique(), // "xc1281"
})

export const coach_profiles = pgTable('coach_profiles', {
  id: uuid('id').primaryKey(), // FK → profiles.id
  box_id: uuid('box_id').references(() => boxes.id),
  athlete_count: integer('athlete_count').default(0),
})

// ─────────────────────────────────────────────
// BLOQUE 2: ENTRENAMIENTOS
// ─────────────────────────────────────────────

export const wod_templates = pgTable('wod_templates', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  created_by: uuid('created_by').references(() => profiles.id).notNull(),
  box_id: uuid('box_id').references(() => boxes.id),
  name: text('name').notNull(), // "Push Capacity"
  workout_type: text('workout_type').notNull(), // 'FOR_TIME'|'AMRAP'|'EMOM'|'STRENGTH'|'INTERVAL'|'LSD'|'CHIPPER'|'LADDER'
  comptrain_tenet: text('comptrain_tenet'), // 'strength' | 'conditioning' | 'mobility'
  comptrain_attr: text('comptrain_attr'), // 'aerobic_power' | 'absolute_strength' | etc.
  duration_min: integer('duration_min'),
  rounds: integer('rounds'),
  description: text('description'),
  coach_notes: text('coach_notes'),
  estimated_imr: decimal('estimated_imr', { precision: 10, scale: 2 }),
  is_benchmark: boolean('is_benchmark').default(false),
  is_public: boolean('is_public').default(false),
  scheduled_date: date('scheduled_date'),
  energy_vector: text('energy_vector'), // NULL | 'V1' | 'V2' | 'V3'
  airbike_protocol: text('airbike_protocol'), // NULL | 'steady30' | 'crucero35' | etc.
  guide_suggestions: jsonb('guide_suggestions'), // JSONB — sugerencias del Engine #14
  guide_override: boolean('guide_override').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const wod_movements = pgTable('wod_movements', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  wod_id: uuid('wod_id').references(() => wod_templates.id, { onDelete: 'cascade' }).notNull(),
  movement_id: text('movement_id').notNull(), // FK → movement_catalog (JSON key)
  movement_name: text('movement_name').notNull(),
  category: text('category'), // 'Barbell' | 'Gymnastics' | 'Metabolic' | etc.
  stress_coeff: decimal('stress_coeff', { precision: 4, scale: 2 }),
  sets: integer('sets'),
  reps: integer('reps'),
  duration_sec: integer('duration_sec'),
  weight_kg_rx: decimal('weight_kg_rx', { precision: 6, scale: 2 }),
  pct_1rm: decimal('pct_1rm', { precision: 4, scale: 2 }),
  scale_rx_plus: text('scale_rx_plus'),
  scale_rx: text('scale_rx'),
  scale_beginner: text('scale_beginner'),
  order_index: integer('order_index').notNull(),
})

export const training_sessions = pgTable('training_sessions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  wod_id: uuid('wod_id').references(() => wod_templates.id),
  coach_id: uuid('coach_id').references(() => profiles.id),
  box_id: uuid('box_id').references(() => boxes.id),
  session_date: date('session_date').notNull(),
  workout_type: text('workout_type'),
  result_value: decimal('result_value', { precision: 10, scale: 2 }),
  result_type: text('result_type'), // 'time' | 'rounds' | 'weight' | 'reps' | 'distance'
  srpe: integer('srpe'), // 1–10
  imr_score: decimal('imr_score', { precision: 10, scale: 2 }),
  session_load: decimal('session_load', { precision: 10, scale: 2 }), // = imr_score × (srpe / 10.0)
  was_scaled: boolean('was_scaled').default(false),
  scale_used: text('scale_used'), // 'rx_plus' | 'rx' | 'beginner'
  warmup_done: boolean('warmup_done').default(false),
  warmup_bonus: decimal('warmup_bonus', { precision: 4, scale: 2 }),
  notes: text('notes'),
  coach_notes: text('coach_notes'),
  acwr_at_session: decimal('acwr_at_session', { precision: 4, scale: 3 }),
  energy_vector: text('energy_vector'), // NULL | 'V1' | 'V2' | 'V3'
  airbike_protocol: text('airbike_protocol'),
  abort_reason: text('abort_reason'), // NULL | 'watts_dropoff' | 'fatigue' | 'time'
  hrv_morning: integer('hrv_morning'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const session_movements = pgTable('session_movements', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  session_id: uuid('session_id').references(() => training_sessions.id, { onDelete: 'cascade' }).notNull(),
  movement_id: text('movement_id').notNull(),
  movement_name: text('movement_name').notNull(),
  session_date: date('session_date').notNull(), // desnormalizado para queries de cooldown
  sets_done: integer('sets_done'),
  reps_done: integer('reps_done'),
  weight_kg_used: decimal('weight_kg_used', { precision: 6, scale: 2 }),
  scale_used: text('scale_used'),
  imr_contribution: decimal('imr_contribution', { precision: 10, scale: 2 }),
})

export const session_intervals = pgTable('session_intervals', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  session_id: uuid('session_id').references(() => training_sessions.id, { onDelete: 'cascade' }).notNull(),
  interval_number: integer('interval_number').notNull(),
  watts_peak: integer('watts_peak'),
  watts_avg: integer('watts_avg'),
  calories: integer('calories'),
  duration_sec: integer('duration_sec'),
  rest_sec: integer('rest_sec'),
  completed: boolean('completed').default(true),
  notes: text('notes'),
})

export const athlete_1rms = pgTable('athlete_1rms', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  movement_id: text('movement_id').notNull(),
  weight_kg: decimal('weight_kg', { precision: 6, scale: 2 }),
  max_reps: integer('max_reps'),
  date_achieved: date('date_achieved'),
  source: text('source').default('tested'), // 'tested' | 'estimated' | 'coach_input'
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const personal_records = pgTable('personal_records', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  wod_id: uuid('wod_id').references(() => wod_templates.id),
  movement_id: text('movement_id'),
  record_type: text('record_type').notNull(), // 'time' | 'rounds' | 'weight' | 'reps'
  record_value: decimal('record_value', { precision: 10, scale: 2 }).notNull(),
  achieved_date: date('achieved_date').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// BLOQUE 3: BIOMÉTRICOS Y READINESS
// ─────────────────────────────────────────────

export const biometric_daily = pgTable('biometric_daily', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  date: date('date').notNull(),
  sleep_hours: text('sleep_hours'), // '<6' | '6-7' | '7-8' | '8+'
  stress: integer('stress'), // 1–5
  legs: text('legs'), // 'fresh' | 'normal' | 'heavy' | 'destroyed'
  skipped: boolean('skipped').default(false),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

export const readiness_daily = pgTable('readiness_daily', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  date: date('date').notNull(),
  readiness_score: integer('readiness_score'), // 0–100
  color_state: text('color_state'), // 'green'|'blue'|'yellow'|'orange'|'red'
  readiness_mode: integer('readiness_mode'), // 1 | 2
  check_in_used: boolean('check_in_used').default(false),
  fitness_score: decimal('fitness_score', { precision: 8, scale: 4 }),
  fatiga_mecanica: decimal('fatiga_mecanica', { precision: 8, scale: 4 }),
  fatiga_snc: decimal('fatiga_snc', { precision: 8, scale: 4 }),
  fatiga_metabolica: decimal('fatiga_metabolica', { precision: 8, scale: 4 }),
  fatiga_articular: decimal('fatiga_articular', { precision: 8, scale: 4 }),
  lifestyle_adj: decimal('lifestyle_adj', { precision: 6, scale: 2 }),
  menstrual_adj: decimal('menstrual_adj', { precision: 4, scale: 2 }),
  recommendation_text: text('recommendation_text'),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

export const acwr_daily = pgTable('acwr_daily', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  date: date('date').notNull(),
  ewma_acute: decimal('ewma_acute', { precision: 10, scale: 4 }),
  ewma_chronic: decimal('ewma_chronic', { precision: 10, scale: 4 }),
  acwr_ratio: decimal('acwr_ratio', { precision: 5, scale: 3 }),
  injury_risk_pct: integer('injury_risk_pct'), // 0–100
  zone: text('zone'), // 'underload'|'optimal'|'caution'|'danger'
  days_in_zone: integer('days_in_zone'),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

export const menstrual_cycles = pgTable('menstrual_cycles', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  cycle_start_date: date('cycle_start_date').notNull(),
  cycle_length_days: integer('cycle_length_days').default(28),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// BLOQUE 4: GAMIFICACIÓN
// ─────────────────────────────────────────────

export const athlete_gamification = pgTable('athlete_gamification', {
  id: uuid('id').primaryKey(), // FK → profiles.id
  voltaje_total: integer('voltaje_total').default(0),
  voltaje_level: integer('voltaje_level').default(1),
  racha_current: integer('racha_current').default(0),
  racha_max: integer('racha_max').default(0),
  shields_available: integer('shields_available').default(0),
  total_sessions: integer('total_sessions').default(0),
  updated_at: timestamp('updated_at').defaultNow(),
})

export const badge_definitions = pgTable('badge_definitions', {
  id: text('id').primaryKey(), // "first_wod" | "streak_7" | etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'consistency'|'performance'|'exploration'|'community'
  rarity: text('rarity').notNull(), // 'common'|'rare'|'epic'|'legendary'
  voltaje_reward: integer('voltaje_reward').notNull(),
  trigger_type: text('trigger_type').notNull(), // 'sessions'|'streak'|'pr'|'acwr'|'manual'
  trigger_value: integer('trigger_value'),
})

export const athlete_badges = pgTable('athlete_badges', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  badge_id: text('badge_id').references(() => badge_definitions.id).notNull(),
  earned_at: timestamp('earned_at').defaultNow().notNull(),
}, (table) => ({
  unique_athlete_badge: unique().on(table.athlete_id, table.badge_id),
}))

export const voltaje_transactions = pgTable('voltaje_transactions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  session_id: uuid('session_id').references(() => training_sessions.id),
  amount: integer('amount').notNull(),
  multiplier: decimal('multiplier', { precision: 3, scale: 2 }),
  concept: text('concept').notNull(), // 'session'|'badge'|'streak_shield'|'warmup_bonus'
  readiness_color: text('readiness_color'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const racha_history = pgTable('racha_history', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  streak_length: integer('streak_length').notNull(),
  started_at: date('started_at').notNull(),
  ended_at: date('ended_at'),
  ended_reason: text('ended_reason'), // 'missed_day' | 'shield_used'
})

// ─────────────────────────────────────────────
// BLOQUE 5: COACH Y ALERTAS
// ─────────────────────────────────────────────

export const coach_alerts = pgTable('coach_alerts', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  coach_id: uuid('coach_id').references(() => profiles.id).notNull(),
  athlete_id: uuid('athlete_id').references(() => profiles.id),
  type: text('type').notNull(), // 'injury_risk'|'overtraining'|'inactivity'|'ignored_warning'|'pr_achieved'|'watts_dropoff'|'plateau'|'phase_advance'|'muscular_imbalance'
  severity: text('severity').notNull(), // 'urgent'|'caution'|'positive'|'retention'
  message: text('message').notNull(),
  data: jsonb('data'),
  is_read: boolean('is_read').default(false),
  read_at: timestamp('read_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const athlete_scaling_overrides = pgTable('athlete_scaling_overrides', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  coach_id: uuid('coach_id').references(() => profiles.id).notNull(),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  movement_id: text('movement_id').notNull(),
  forced_scale: text('forced_scale'), // 'rx_plus'|'rx'|'beginner'
  weight_override: decimal('weight_override', { precision: 6, scale: 2 }),
  reason: text('reason'),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const box_challenges = pgTable('box_challenges', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  box_id: uuid('box_id').references(() => boxes.id).notNull(),
  coach_id: uuid('coach_id').references(() => profiles.id).notNull(),
  name: text('name').notNull(),
  metric: text('metric').notNull(), // 'calories'|'sessions'|'imr_total'|'streak'
  target_value: integer('target_value'),
  start_date: date('start_date').notNull(),
  end_date: date('end_date').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

export const challenge_participants = pgTable('challenge_participants', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  challenge_id: uuid('challenge_id').references(() => box_challenges.id, { onDelete: 'cascade' }).notNull(),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  current_value: decimal('current_value', { precision: 10, scale: 2 }).default('0'),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
}, (table) => ({
  unique_challenge_athlete: unique().on(table.challenge_id, table.athlete_id),
}))

// ─────────────────────────────────────────────
// BLOQUE 6: SISTEMA Y CACHE
// ─────────────────────────────────────────────

export const athlete_attribute_scores = pgTable('athlete_attribute_scores', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  date: date('date').notNull(),
  aerobic_endurance: integer('aerobic_endurance'), // 0–100 (V1 sessions)
  aerobic_power: integer('aerobic_power'), // 0–100 (V2 sessions)
  anaerobic_capacity: integer('anaerobic_capacity'), // 0–100 (V3 sessions)
  absolute_strength: integer('absolute_strength'), // 0–100
  strength_endurance: integer('strength_endurance'), // 0–100
  power: integer('power'), // 0–100
  gymnastics_capacity: integer('gymnastics_capacity'), // 0–100
  mobility: integer('mobility'), // 0–100
  mental_resilience: integer('mental_resilience'), // 0–100
  speed: integer('speed'), // 0–100
  // PRISMA VO2Max
  vo2max_estimated: decimal('vo2max_estimated', { precision: 5, scale: 2 }),
  prisma_score: decimal('prisma_score', { precision: 5, scale: 2 }),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

export const programming_weekly_state = pgTable('programming_weekly_state', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  box_id: uuid('box_id').references(() => boxes.id).notNull(),
  week_start: date('week_start').notNull(), // Monday of the week
  strength_count: integer('strength_count').default(0),
  conditioning_count: integer('conditioning_count').default(0),
  mobility_count: integer('mobility_count').default(0),
  movements_used: jsonb('movements_used'), // { movement_id: last_used_date }
  weekly_load_projected: decimal('weekly_load_projected', { precision: 10, scale: 2 }),
  analysis: jsonb('analysis'), // guide_suggestions from Engine #14
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_box_week: unique().on(table.box_id, table.week_start),
}))

export const push_subscriptions = pgTable('push_subscriptions', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
})

// ─────────────────────────────────────────────
// BLOQUE 7: NUTRICIÓN
// ─────────────────────────────────────────────

export const nutrition_recommendations = pgTable('nutrition_recommendations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  date: date('date').notNull(),

  // Input parameters (for audit)
  training_intensity: text('training_intensity'), // 'light'|'moderate'|'intense'|'elite'
  acwr_zone: text('acwr_zone'), // 'underload'|'optimal'|'caution'|'danger'
  menstrual_phase: integer('menstrual_phase'), // 1-4 or null

  // Daily targets
  calories_target: integer('calories_target').notNull(),
  protein_target_g: integer('protein_target_g').notNull(),
  carbs_target_g: integer('carbs_target_g').notNull(),
  fats_target_g: integer('fats_target_g').notNull(),

  // Timing (JSON)
  timing: jsonb('timing'), // { pre_workout, post_workout }

  // Hydration
  hydration_ml: integer('hydration_ml'),

  // Recovery focus (human text)
  recovery_focus: text('recovery_focus'),

  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

export const nutrition_adherence = pgTable('nutrition_adherence', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').references(() => profiles.id).notNull(),
  date: date('date').notNull(),

  // Logged (synced from MyFitnessPal, Cronometer, or manual entry)
  protein_logged_g: integer('protein_logged_g'),
  calories_logged: integer('calories_logged'),

  // Targets (cached from nutrition_recommendations)
  protein_target_g: integer('protein_target_g'),
  calories_target: integer('calories_target'),

  // Adherence scores (0-100)
  protein_adherence_pct: integer('protein_adherence_pct'),
  calories_adherence_pct: integer('calories_adherence_pct'),

  // Overall score (0=poor, 1=ok, 2=good, 3=excellent)
  overall_score: integer('overall_score'),

  // Source of data
  source: text('source').default('manual'), // 'myfitnesspal'|'cronometer'|'manual'|'api'

  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

export const session_adaptations = pgTable('session_adaptations', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  athlete_id: uuid('athlete_id').notNull().references(() => profiles.id),
  date: date('date').notNull(),

  // Input factors
  readiness_score: integer('readiness_score').notNull(),
  readiness_level: text('readiness_level').notNull(), // 'red'|'orange'|'yellow'|'green'
  acwr_zone: text('acwr_zone').notNull(), // 'danger'|'caution'|'optimal'
  acwr_value: decimal('acwr_value', { precision: 4, scale: 2 }).notNull(),

  // Recommendation
  recommended_action: text('recommended_action').notNull(), // 'run_as_is'|'reduce_intensity'|'reduce_volume'|'recovery_only'|'deload_suggested'
  intensity_reduction_pct: integer('intensity_reduction_pct').default(0),
  volume_reduction_pct: integer('volume_reduction_pct').default(0),

  // Movement substitutions (array of {original, suggested, reason})
  movement_substitutions: jsonb('movement_substitutions').default([]),

  // Suggestions
  timing_suggestion: text('timing_suggestion'),
  recovery_suggestion: text('recovery_suggestion'),

  // Quality metrics
  confidence_pct: integer('confidence_pct'),
  rationale: text('rationale'),

  // WOD reference
  wod_id: text('wod_id'),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => ({
  unique_athlete_date: unique().on(table.athlete_id, table.date),
}))

// ─────────────────────────────────────────────
// RELATIONS (for Drizzle query builder)
// ─────────────────────────────────────────────

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.id] }),
}))

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  user: one(users, { fields: [profiles.id], references: [users.id] }),
  box: one(boxes, { fields: [profiles.box_id], references: [boxes.id] }),
  athlete_profile: one(athlete_profiles, { fields: [profiles.id], references: [athlete_profiles.id] }),
  coach_profile: one(coach_profiles, { fields: [profiles.id], references: [coach_profiles.id] }),
  training_sessions: many(training_sessions),
  acwr_daily: many(acwr_daily),
  readiness_daily: many(readiness_daily),
  biometric_daily: many(biometric_daily),
  gamification: one(athlete_gamification, { fields: [profiles.id], references: [athlete_gamification.id] }),
  badges: many(athlete_badges),
  session_adaptations: many(session_adaptations),
  alerts_as_coach: many(coach_alerts, { relationName: 'coach_alerts' }),
  alerts_as_athlete: many(coach_alerts, { relationName: 'athlete_alerts' }),
}))

export const training_sessionsRelations = relations(training_sessions, ({ one, many }) => ({
  athlete: one(profiles, { fields: [training_sessions.athlete_id], references: [profiles.id] }),
  wod: one(wod_templates, { fields: [training_sessions.wod_id], references: [wod_templates.id] }),
  movements: many(session_movements),
  intervals: many(session_intervals),
}))

export const wod_templatesRelations = relations(wod_templates, ({ one, many }) => ({
  created_by_profile: one(profiles, { fields: [wod_templates.created_by], references: [profiles.id] }),
  box: one(boxes, { fields: [wod_templates.box_id], references: [boxes.id] }),
  movements: many(wod_movements),
}))

export const nutrition_recommendationsRelations = relations(nutrition_recommendations, ({ one }) => ({
  athlete: one(profiles, { fields: [nutrition_recommendations.athlete_id], references: [profiles.id] }),
}))

export const nutrition_adherenceRelations = relations(nutrition_adherence, ({ one }) => ({
  athlete: one(profiles, { fields: [nutrition_adherence.athlete_id], references: [profiles.id] }),
}))

export const session_adaptationsRelations = relations(session_adaptations, ({ one }) => ({
  athlete: one(profiles, { fields: [session_adaptations.athlete_id], references: [profiles.id] }),
}))

// ─────────────────────────────────────────────
// TYPES (inferred from schema)
// ─────────────────────────────────────────────

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type AthleteProfile = typeof athlete_profiles.$inferSelect
export type CoachProfile = typeof coach_profiles.$inferSelect
export type Box = typeof boxes.$inferSelect
export type TrainingSession = typeof training_sessions.$inferSelect
export type NewTrainingSession = typeof training_sessions.$inferInsert
export type WodTemplate = typeof wod_templates.$inferSelect
export type NewWodTemplate = typeof wod_templates.$inferInsert
export type AcwrDaily = typeof acwr_daily.$inferSelect
export type ReadinessDaily = typeof readiness_daily.$inferSelect
export type BiometricDaily = typeof biometric_daily.$inferSelect
export type CoachAlert = typeof coach_alerts.$inferSelect
export type AthleteGamification = typeof athlete_gamification.$inferSelect
export type BadgeDefinition = typeof badge_definitions.$inferSelect
export type PushSubscription = typeof push_subscriptions.$inferSelect
export type NutritionRecommendation = typeof nutrition_recommendations.$inferSelect
export type NutritionAdherence = typeof nutrition_adherence.$inferSelect
export type SessionAdaptation = typeof session_adaptations.$inferSelect
export type NewSessionAdaptation = typeof session_adaptations.$inferInsert
