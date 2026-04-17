-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- Table: training_types
CREATE TABLE training_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN DEFAULT true,
    user_id UUID REFERENCES auth.users(id), -- NULL defines a global predefined type
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: training_sessions
CREATE TABLE training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type_id UUID NOT NULL REFERENCES training_types(id),
    started_at TIMESTAMPTZ NOT NULL,
    duration_min INTEGER NOT NULL CHECK (duration_min > 0),
    intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
    notes TEXT,
    metrics JSONB, -- Flexible metrics per type
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_settings
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    weekly_sessions_goal INTEGER DEFAULT 5 CHECK (weekly_sessions_goal > 0),
    weekly_minutes_goal INTEGER DEFAULT 250 CHECK (weekly_minutes_goal > 0),
    score_weight_frequency NUMERIC DEFAULT 0.6 CHECK (score_weight_frequency >= 0),
    score_weight_duration NUMERIC DEFAULT 0.4 CHECK (score_weight_duration >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure weights sum to 1.0
    CONSTRAINT weight_sum_check CHECK (score_weight_frequency + score_weight_duration = 1.0)
);

-- ============================================================================
-- 2. INDEXES for Performance (RNF-02)
-- ============================================================================
CREATE INDEX idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX idx_training_sessions_started_at ON training_sessions(started_at);
CREATE INDEX idx_training_types_user_id ON training_types(user_id);

-- ============================================================================
-- 3. INITIAL SEED DATA (Global Types)
-- ============================================================================
INSERT INTO training_types (name, icon, user_id) VALUES
('Bicicleta', 'pedal_bike', NULL),
('Correr', 'directions_run', NULL),
('Nadar', 'pool', NULL),
('Gimnasio', 'fitness_center', NULL),
('Surf', 'surfing', NULL),
('Yoga', 'self_improvement', NULL);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE training_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for training_types
-- 1. Users can read global types (user_id IS NULL) OR their own custom types
CREATE POLICY "Users can read global and own types" 
ON training_types FOR SELECT 
TO authenticated 
USING (user_id IS NULL OR user_id = auth.uid());

-- 2. Users can only insert/update/delete their own custom types
CREATE POLICY "Users can insert own custom types" 
ON training_types FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own custom types" 
ON training_types FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Policies for training_sessions
-- Users can completely manage their own sessions, but only theirs
CREATE POLICY "Users can fully manage their own sessions" 
ON training_sessions FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Policies for user_settings
-- Users can completely manage their own settings
CREATE POLICY "Users can fully manage their own settings" 
ON user_settings FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================
-- Trigger to insert default user_settings on user creation (Supabase Auth Hook)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
