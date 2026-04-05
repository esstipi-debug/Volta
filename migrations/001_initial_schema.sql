-- BECCTTOR Initial Schema
-- MVP Database Setup for Supabase

-- Athletes table
CREATE TABLE athletes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    age INTEGER,
    weight_kg DECIMAL(5,2),
    height_cm INTEGER,
    sex TEXT CHECK (sex IN ('M', 'F', 'Other')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Biometric logs (daily recovery data: sleep, stress, pain)
CREATE TABLE biometric_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    sleep_hours DECIMAL(3,1),
    stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
    muscle_pain_level INTEGER CHECK (muscle_pain_level BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(athlete_id, date)
);

-- Training sessions (WOD records)
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    workout_type TEXT NOT NULL,
    movements JSONB NOT NULL,
    result JSONB NOT NULL,
    imr_score DECIMAL(8,2),
    acwr_7day DECIMAL(4,3),
    acwr_28day DECIMAL(4,3),
    current_acwr DECIMAL(4,3),
    acwr_zone TEXT CHECK (acwr_zone IN ('optimal', 'caution', 'danger')),
    was_scaled BOOLEAN DEFAULT FALSE,
    scaling_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Stress engine metrics (daily ACWR tracking)
CREATE TABLE stress_engine_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    acute_workload_7day DECIMAL(10,2),
    chronic_workload_28day DECIMAL(10,2),
    current_acwr DECIMAL(4,3),
    acwr_zone TEXT CHECK (acwr_zone IN ('optimal', 'caution', 'danger')),
    recovery_score DECIMAL(3,2),
    recommendation TEXT,
    generated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(athlete_id, date)
);

-- Menstrual cycle tracking (optional, for applicable athletes)
CREATE TABLE menstrual_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    last_menstruation DATE,
    cycle_length_days INTEGER DEFAULT 28,
    uses_hormonal_contraception BOOLEAN DEFAULT FALSE,
    contraception_type TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Radar scores (10 dimensions tracking)
CREATE TABLE radar_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    cardiovascular_endurance DECIMAL(3,2),
    muscular_endurance DECIMAL(3,2),
    strength DECIMAL(3,2),
    flexibility DECIMAL(3,2),
    power DECIMAL(3,2),
    speed DECIMAL(3,2),
    coordination DECIMAL(3,2),
    agility DECIMAL(3,2),
    balance DECIMAL(3,2),
    precision DECIMAL(3,2),
    overall_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(athlete_id, date)
);

-- Personal records
CREATE TABLE personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,
    movement TEXT NOT NULL,
    weight_kg DECIMAL(6,2),
    reps INTEGER,
    time_seconds INTEGER,
    date_achieved DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(athlete_id, movement, date_achieved)
);

-- Create indexes for performance
CREATE INDEX idx_athletes_telegram_id ON athletes(telegram_id);
CREATE INDEX idx_biometric_logs_athlete_date ON biometric_logs(athlete_id, date);
CREATE INDEX idx_training_sessions_athlete_date ON training_sessions(athlete_id, date);
CREATE INDEX idx_stress_engine_metrics_athlete_date ON stress_engine_metrics(athlete_id, date);
CREATE INDEX idx_radar_scores_athlete_date ON radar_scores(athlete_id, date);
