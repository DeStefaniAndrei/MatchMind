-- MatchMind Database Schema for Supabase
-- This file contains all the SQL commands to create the database structure

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table

--TO DO REMOVE EMAAIL IF FINE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255), 
    chz_balance DECIMAL(18, 8) DEFAULT 0,
    total_staked DECIMAL(18, 8) DEFAULT 0,
    total_rewards DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sportmonks_id INTEGER UNIQUE,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
    home_score INTEGER DEFAULT 0,
    away_score INTEGER DEFAULT 0,
    venue VARCHAR(200),
    league VARCHAR(100),
    participants_count INTEGER DEFAULT 0,
    total_stake DECIMAL(18, 8) DEFAULT 0,
    contract_game_id INTEGER, -- Links to smart contract game ID
    contract_address VARCHAR(42), -- GamePool contract address
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakes table
CREATE TABLE IF NOT EXISTS stakes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    amount DECIMAL(18, 8) NOT NULL,
    contract_tx_hash VARCHAR(66), -- Transaction hash from blockchain
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Questions table (for predictions)
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of possible answers
    correct_answer VARCHAR(255),
    question_type VARCHAR(50) DEFAULT 'prediction',
    points INTEGER DEFAULT 10,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When question becomes active
    end_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When question closes for answers
    grace_seconds INTEGER DEFAULT 30, -- Grace period before evaluation
    state VARCHAR(20) DEFAULT 'draft' CHECK (state IN ('draft', 'scheduled', 'active', 'closed', 'evaluated', 'settled')),
    evaluation_rule JSONB, -- Rule configuration for evaluation
    metadata JSONB, -- Additional question metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User answers table (renamed from predictions for clarity)
CREATE TABLE IF NOT EXISTS user_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_payload JSONB NOT NULL, -- Flexible answer format
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, question_id) -- One answer per user per question
);

-- Question results table (stores evaluation results)
CREATE TABLE IF NOT EXISTS question_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    correct_answer JSONB NOT NULL, -- The correct answer
    evaluation_source VARCHAR(100), -- Source of the correct answer (api, manual, etc.)
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep predictions table for backward compatibility (can be removed later)
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer VARCHAR(255) NOT NULL,
    points_earned INTEGER DEFAULT 0,
    is_correct BOOLEAN,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard table (for match rankings)
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rank INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    correct_predictions INTEGER DEFAULT 0,
    total_predictions INTEGER DEFAULT 0,
    reward_amount DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- Contract events table (for tracking blockchain events)
CREATE TABLE IF NOT EXISTS contract_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_address VARCHAR(42) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number INTEGER NOT NULL,
    event_data JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin actions table (for tracking admin operations)
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50), -- 'match', 'contract', 'user', etc.
    target_id UUID,
    details JSONB,
    tx_hash VARCHAR(66),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON matches(start_time);
CREATE INDEX IF NOT EXISTS idx_matches_sportmonks_id ON matches(sportmonks_id);
CREATE INDEX IF NOT EXISTS idx_stakes_user_id ON stakes(user_id);
CREATE INDEX IF NOT EXISTS idx_stakes_match_id ON stakes(match_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_question_id ON predictions(question_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_match_id ON leaderboard(match_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_user_id ON leaderboard(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_events_contract_address ON contract_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_contract_events_processed ON contract_events(processed);

-- New indexes for question system
CREATE INDEX IF NOT EXISTS idx_questions_match_id ON questions(match_id);
CREATE INDEX IF NOT EXISTS idx_questions_state ON questions(state);
CREATE INDEX IF NOT EXISTS idx_questions_start_at ON questions(start_at);
CREATE INDEX IF NOT EXISTS idx_questions_end_at ON questions(end_at);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_results_question_id ON question_results(question_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stakes_updated_at BEFORE UPDATE ON stakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leaderboard_updated_at BEFORE UPDATE ON leaderboard FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid()::text = wallet_address);

-- Anyone can read matches
CREATE POLICY "Anyone can view matches" ON matches FOR SELECT USING (true);

-- Users can view their own stakes
CREATE POLICY "Users can view own stakes" ON stakes FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Users can insert their own stakes
CREATE POLICY "Users can insert own stakes" ON stakes FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Anyone can read questions
CREATE POLICY "Anyone can view questions" ON questions FOR SELECT USING (true);

-- Users can view their own predictions
CREATE POLICY "Users can view own predictions" ON predictions FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Users can view their own answers
CREATE POLICY "Users can view own answers" ON user_answers FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Users can insert their own answers
CREATE POLICY "Users can insert own answers" ON user_answers FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Users can update their own answers (if not yet closed)
CREATE POLICY "Users can update own answers" ON user_answers FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Anyone can read question results
CREATE POLICY "Anyone can view question results" ON question_results FOR SELECT USING (true);

-- Users can insert their own predictions
CREATE POLICY "Users can insert own predictions" ON predictions FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE wallet_address = auth.uid()::text)
);

-- Anyone can read leaderboard
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);

-- Admin can manage all data (you'll need to set up admin role)
CREATE POLICY "Admin can manage all data" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON matches FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON stakes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON questions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON user_answers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON question_results FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON predictions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON leaderboard FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON contract_events FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON admin_actions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert some sample data for testing
INSERT INTO users (wallet_address, username, chz_balance) VALUES 
('0x93d43c27746D76e7606C55493A757127b33D7763', 'admin', 1000.0)
ON CONFLICT (wallet_address) DO NOTHING; 