-- ============================================
-- ZEN MODE: Extend rollenspiel_sessions table
-- ============================================

-- Session type to distinguish standard from zen mode
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'standard'
    CHECK (session_type IN ('standard', 'zen'));

-- Duration tracking (seconds)
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Number of back-and-forth exchanges
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS exchange_count INTEGER;

-- User speaking ratio (0.0 - 1.0, fraction of total words from user)
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS speaking_ratio NUMERIC(3,2);

-- Questions asked by the user
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS user_question_count INTEGER;

-- Quality of user's questions (1-5)
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS user_question_quality INTEGER
    CHECK (user_question_quality BETWEEN 1 AND 5);

-- Sentiment/tonality score (1-5)
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS sentiment_score INTEGER
    CHECK (sentiment_score BETWEEN 1 AND 5);

-- Detailed tonality text feedback
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS tonalitaet TEXT;

-- Interruption tracking (how many times user spoke over the persona)
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS interruption_count INTEGER DEFAULT 0;

-- "Dem Kunden reingeredet" score (1-5, 5 = no interruptions)
ALTER TABLE rollenspiel_sessions
  ADD COLUMN IF NOT EXISTS dem_kunden_reingeredet INTEGER
    CHECK (dem_kunden_reingeredet BETWEEN 1 AND 5);

-- Index for filtering by session type
CREATE INDEX IF NOT EXISTS idx_rollenspiel_session_type
  ON rollenspiel_sessions(session_type);
