-- ============================================
-- PDF HIGHLIGHTS TABLE
-- ============================================
-- Speichert Markierungen/Highlights von Usern in PDFs

CREATE TABLE IF NOT EXISTS pdf_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id INTEGER NOT NULL,
  page_index INTEGER NOT NULL,
  highlight_areas JSONB NOT NULL,
  color TEXT NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pdf_highlights_user_id ON pdf_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_pdf_highlights_module_id ON pdf_highlights(module_id);
CREATE INDEX IF NOT EXISTS idx_pdf_highlights_user_module ON pdf_highlights(user_id, module_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE pdf_highlights ENABLE ROW LEVEL SECURITY;

-- Policy: Users können nur ihre eigenen Highlights sehen
CREATE POLICY "Users can view their own highlights"
  ON pdf_highlights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users können ihre eigenen Highlights erstellen
CREATE POLICY "Users can create their own highlights"
  ON pdf_highlights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users können ihre eigenen Highlights aktualisieren
CREATE POLICY "Users can update their own highlights"
  ON pdf_highlights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users können ihre eigenen Highlights löschen
CREATE POLICY "Users can delete their own highlights"
  ON pdf_highlights
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER FÜR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_pdf_highlights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pdf_highlights_updated_at
  BEFORE UPDATE ON pdf_highlights
  FOR EACH ROW
  EXECUTE FUNCTION update_pdf_highlights_updated_at();
