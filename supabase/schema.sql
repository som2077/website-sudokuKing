-- ==============================================================================
-- SUDOKU KING: COMPLETE SUPABASE DATABASE SETUP
-- Includes: Daily Leaderboard, 1v1 Versus Matches, Versus Rankings & Realtime
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: daily_leaderboard
-- Stores daily challenge leaderboard scores & completions
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.daily_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    puzzle_date DATE NOT NULL,
    username TEXT NOT NULL,
    country_code VARCHAR(10) DEFAULT 'US',
    country_name VARCHAR(100) DEFAULT 'United States',
    avatar_seed TEXT,
    time_seconds INTEGER NOT NULL,
    score INTEGER NOT NULL,
    mistakes INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_daily_submission UNIQUE (puzzle_date, username)
);

-- Indexes for lightning-fast daily ranking queries
CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_date_score 
ON public.daily_leaderboard (puzzle_date, score DESC, time_seconds ASC);

CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_username 
ON public.daily_leaderboard (username);

-- ==============================================================================
-- TABLE 2: versus_matches
-- Stores every completed 1 vs 1 Sudoku duel history
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.versus_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Medium',
    player1_id TEXT NOT NULL,
    player1_username TEXT NOT NULL,
    player1_country VARCHAR(10) DEFAULT 'US',
    player2_id TEXT NOT NULL,
    player2_username TEXT NOT NULL,
    player2_country VARCHAR(10) DEFAULT 'US',
    winner_id TEXT,
    winner_username TEXT,
    finish_reason VARCHAR(30) DEFAULT 'completion', -- 'completion', 'knockout', 'forfeit'
    time_seconds INTEGER NOT NULL,
    p1_mistakes INTEGER DEFAULT 0,
    p2_mistakes INTEGER DEFAULT 0,
    p1_progress INTEGER DEFAULT 0,
    p2_progress INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versus_matches_room 
ON public.versus_matches (room_code);

CREATE INDEX IF NOT EXISTS idx_versus_matches_created 
ON public.versus_matches (created_at DESC);

-- ==============================================================================
-- TABLE 3: versus_leaderboard
-- Stores overall 1 vs 1 duel ratings, wins, losses, and win streaks
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.versus_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    country_code VARCHAR(10) DEFAULT 'US',
    country_name VARCHAR(100) DEFAULT 'United States',
    avatar_seed TEXT,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    win_rate NUMERIC(5,2) DEFAULT 0.00,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    fastest_win_seconds INTEGER,
    elo_rating INTEGER DEFAULT 1000,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_versus_leaderboard_rating 
ON public.versus_leaderboard (elo_rating DESC, matches_won DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures safe public read & insert permissions for game clients
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.daily_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versus_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.versus_leaderboard ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can read daily_leaderboard" ON public.daily_leaderboard;
DROP POLICY IF EXISTS "Public can insert/update daily_leaderboard" ON public.daily_leaderboard;
DROP POLICY IF EXISTS "Public can read versus_matches" ON public.versus_matches;
DROP POLICY IF EXISTS "Public can insert versus_matches" ON public.versus_matches;
DROP POLICY IF EXISTS "Public can read versus_leaderboard" ON public.versus_leaderboard;
DROP POLICY IF EXISTS "Public can insert/update versus_leaderboard" ON public.versus_leaderboard;

-- daily_leaderboard policies
CREATE POLICY "Public can read daily_leaderboard"
ON public.daily_leaderboard FOR SELECT
USING (true);

CREATE POLICY "Public can insert/update daily_leaderboard"
ON public.daily_leaderboard FOR ALL
USING (true)
WITH CHECK (true);

-- versus_matches policies
CREATE POLICY "Public can read versus_matches"
ON public.versus_matches FOR SELECT
USING (true);

CREATE POLICY "Public can insert versus_matches"
ON public.versus_matches FOR INSERT
WITH CHECK (true);

-- versus_leaderboard policies
CREATE POLICY "Public can read versus_leaderboard"
ON public.versus_leaderboard FOR SELECT
USING (true);

CREATE POLICY "Public can insert/update versus_leaderboard"
ON public.versus_leaderboard FOR ALL
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- REALTIME REPLICATION SETUP
-- Enables Supabase Realtime WebSocket notifications for table inserts/updates
-- ==============================================================================
DO $$
BEGIN
    -- Add daily_leaderboard to realtime publication if not already present
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'daily_leaderboard'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_leaderboard;
    END IF;

    -- Add versus_matches to realtime publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'versus_matches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.versus_matches;
    END IF;

    -- Add versus_leaderboard to realtime publication
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'versus_leaderboard'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.versus_leaderboard;
    END IF;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA FOR 1v1 CHAMPIONS LEADERBOARD
-- ==============================================================================
INSERT INTO public.versus_leaderboard 
(username, country_code, country_name, avatar_seed, matches_played, matches_won, matches_lost, win_rate, current_streak, best_streak, fastest_win_seconds, elo_rating)
VALUES
('NexusAI', 'JP', 'Japan', 'bot_NexusAI', 48, 42, 6, 87.50, 8, 14, 134, 1840),
('SudokuMaster99', 'US', 'United States', 'player_master', 35, 29, 6, 82.86, 5, 9, 145, 1720),
('GridWizard', 'DE', 'Germany', 'player_grid', 30, 24, 6, 80.00, 3, 7, 162, 1650),
('AlphaDigit', 'IN', 'India', 'player_alpha', 28, 22, 6, 78.57, 4, 6, 178, 1590),
('SpeedSolver_UK', 'GB', 'United Kingdom', 'player_uk', 24, 18, 6, 75.00, 2, 5, 185, 1510)
ON CONFLICT (username) DO NOTHING;
