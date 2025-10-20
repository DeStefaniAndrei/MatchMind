-- Complete Database Rebuild Script
-- Run this in Supabase SQL Editor to drop everything and recreate with integer IDs

-- Step 1: Disable RLS
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stakes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leaderboard_entry DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contract_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_actions DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop all tables (CASCADE removes foreign key constraints)
DROP TABLE IF EXISTS admin_actions CASCADE;
DROP TABLE IF EXISTS contract_events CASCADE;
DROP TABLE IF EXISTS leaderboard_entry CASCADE;
DROP TABLE IF EXISTS stakes CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

