-- ============================================
-- FLASHCARD PROGRESS TABLE
-- ============================================
-- Speichert den Lernfortschritt für Karteikarten

CREATE TABLE IF NOT EXISTS flashcard_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modul_id INTEGER NOT NULL,
  card_id TEXT NOT NULL,
  mastered BOOLEAN DEFAULT FALSE,
  times_reviewed INTEGER DEFAULT 0,
  last_reviewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one progress entry per user per card
  UNIQUE(user_id, modul_id, card_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_modul_id ON flashcard_progress(modul_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_progress_user_modul ON flashcard_progress(user_id, modul_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE flashcard_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users können nur ihren eigenen Fortschritt sehen
CREATE POLICY "Users can view their own flashcard progress"
  ON flashcard_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users können ihren eigenen Fortschritt erstellen
CREATE POLICY "Users can create their own flashcard progress"
  ON flashcard_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users können ihren eigenen Fortschritt aktualisieren
CREATE POLICY "Users can update their own flashcard progress"
  ON flashcard_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users können ihren eigenen Fortschritt löschen
CREATE POLICY "Users can delete their own flashcard progress"
  ON flashcard_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FÜR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_flashcard_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flashcard_progress_updated_at
  BEFORE UPDATE ON flashcard_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_flashcard_progress_updated_at();
