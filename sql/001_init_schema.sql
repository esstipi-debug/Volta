-- ═══════════════════════════════════════════════════════════════
-- VOLTA Schema Initialization
-- Execute in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────
-- 1. Core Tables
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INT,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  weight_kg DECIMAL(6,2),
  height_cm DECIMAL(6,2),
  max_push_press DECIMAL(6,2),
  max_squat DECIMAL(6,2),
  max_deadlift DECIMAL(6,2),
  menstrual_phase_tracking BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  workout_type TEXT NOT NULL,
  srpe INT CHECK (srpe >= 1 AND srpe <= 10),
  imr_score DECIMAL(8,2),
  session_load DECIMAL(8,2),
  warmup_done BOOLEAN DEFAULT false,
  was_scaled BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS biometrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_hours DECIMAL(3,1),
  stress_level INT CHECK (stress_level >= 1 AND stress_level <= 10),
  soreness_level INT CHECK (soreness_level >= 1 AND soreness_level <= 10),
  menstrual_phase TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id, date)
);

CREATE TABLE IF NOT EXISTS acwr_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  acwr_value DECIMAL(4,2),
  acwr_zone TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id, date)
);

CREATE TABLE IF NOT EXISTS readiness_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  readiness_score INT CHECK (readiness_score >= 0 AND readiness_score <= 100),
  readiness_color TEXT CHECK (readiness_color IN ('green', 'blue', 'yellow', 'orange', 'red')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(athlete_id, date)
);

CREATE TABLE IF NOT EXISTS athlete_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL UNIQUE REFERENCES athletes(id) ON DELETE CASCADE,
  voltaje_total INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  shields_available INT DEFAULT 0,
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS injuries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  injury_type TEXT NOT NULL,
  body_part TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe')),
  date_started DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'resolved')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────
-- 2. Indexes for Performance
-- ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_athletes_user_id ON athletes(user_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_athlete_date ON training_sessions(athlete_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_biometrics_athlete_date ON biometrics(athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_acwr_daily_athlete_date ON acwr_daily(athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_readiness_daily_athlete_date ON readiness_daily(athlete_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_injuries_athlete_status ON injuries(athlete_id, status);

-- ─────────────────────────────────────────────────────────────
-- 3. Enable Row-Level Security (RLS)
-- ─────────────────────────────────────────────────────────────

ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE acwr_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────
-- 4. RLS Policies - Athletes Table
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own profile"
  ON athletes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Athletes can update own profile"
  ON athletes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- 5. RLS Policies - Training Sessions
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own sessions"
  ON training_sessions
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can insert own sessions"
  ON training_sessions
  FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can update own sessions"
  ON training_sessions
  FOR UPDATE
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 6. RLS Policies - Biometrics
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own biometrics"
  ON biometrics
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can insert own biometrics"
  ON biometrics
  FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can update own biometrics"
  ON biometrics
  FOR UPDATE
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 7. RLS Policies - ACWR Daily
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own ACWR"
  ON acwr_daily
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert ACWR"
  ON acwr_daily
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update ACWR"
  ON acwr_daily
  FOR UPDATE
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- 8. RLS Policies - Readiness Daily
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own readiness"
  ON readiness_daily
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert readiness"
  ON readiness_daily
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update readiness"
  ON readiness_daily
  FOR UPDATE
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- 9. RLS Policies - Gamification
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own gamification"
  ON athlete_gamification
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 10. RLS Policies - Injuries
-- ─────────────────────────────────────────────────────────────

CREATE POLICY "Athletes can view own injuries"
  ON injuries
  FOR SELECT
  USING (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Athletes can insert own injuries"
  ON injuries
  FOR INSERT
  WITH CHECK (
    athlete_id IN (
      SELECT id FROM athletes WHERE user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════════════
-- Schema initialization complete
-- ═══════════════════════════════════════════════════════════════
