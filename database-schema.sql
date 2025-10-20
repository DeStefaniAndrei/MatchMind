-- MatchMind Database Schema for Supabase
-- This file contains all the SQL commands to create the database structure

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    chz_balance DECIMAL(18, 8) DEFAULT 0,
    total_staked DECIMAL(18, 8) DEFAULT 0,
    total_rewards DECIMAL(18, 8) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    amount DECIMAL(18, 8) NOT NULL,
    contract_tx_hash VARCHAR(66), -- Transaction hash from blockchain
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);


-- leaderboard_entry table (for match rankings)
CREATE TABLE IF NOT EXISTS leaderboard_entry (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    id SERIAL PRIMARY KEY,
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
    id SERIAL PRIMARY KEY,
    admin_user_id INTEGER REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50), -- 'match', 'contract', 'user', etc.
    target_id INTEGER,
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
-- Question-related indexes removed - questions are now handled in memory only
CREATE INDEX IF NOT EXISTS idx_leaderboard_entry_match_id ON leaderboard_entry(match_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entry_user_id ON leaderboard_entry(user_id);
CREATE INDEX IF NOT EXISTS idx_contract_events_contract_address ON contract_events(contract_address);
CREATE INDEX IF NOT EXISTS idx_contract_events_processed ON contract_events(processed);



-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop if exists to avoid conflicts)
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_matches_updated_at ON matches;
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stakes_updated_at ON stakes;
CREATE TRIGGER update_stakes_updated_at BEFORE UPDATE ON stakes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leaderboard_entry_updated_at ON leaderboard_entry;
CREATE TRIGGER update_leaderboard_entry_updated_at BEFORE UPDATE ON leaderboard_entry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entry ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Anyone can view matches" ON matches;
DROP POLICY IF EXISTS "Users can view own stakes" ON stakes;
DROP POLICY IF EXISTS "Users can insert own stakes" ON stakes;
DROP POLICY IF EXISTS "Anyone can view leaderboard_entry" ON leaderboard_entry;
DROP POLICY IF EXISTS "Admin can manage all data" ON users;
DROP POLICY IF EXISTS "Admin can manage all data" ON matches;
DROP POLICY IF EXISTS "Admin can manage all data" ON stakes;
DROP POLICY IF EXISTS "Admin can manage all data" ON leaderboard_entry;
DROP POLICY IF EXISTS "Admin can manage all data" ON contract_events;
DROP POLICY IF EXISTS "Admin can manage all data" ON admin_actions;

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

-- Question-related policies removed - questions are now handled in memory only

-- Anyone can read leaderboard_entry
CREATE POLICY "Anyone can view leaderboard_entry" ON leaderboard_entry FOR SELECT USING (true);

-- Admin can manage all data (you'll need to set up admin role)
CREATE POLICY "Admin can manage all data" ON users FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON matches FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON stakes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON leaderboard_entry FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON contract_events FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin can manage all data" ON admin_actions FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert some sample data for testing
INSERT INTO users (wallet_address, username, chz_balance) VALUES 
('0x93d43c27746D76e7606C55493A757127b33D7763', 'admin', 1000.0)
ON CONFLICT (wallet_address) DO NOTHING; 