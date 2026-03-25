-- ============================================
-- CONTENT TABLES - Migration von JSON zu Supabase
-- ============================================

-- 1. ACADEMY CONFIG (singleton)
CREATE TABLE IF NOT EXISTS academy_config (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  theme_primary TEXT DEFAULT '#059669',
  theme_accent TEXT DEFAULT '#F59E0B',
  theme_logo TEXT,
  feature_voice_chat BOOLEAN DEFAULT true,
  feature_flashcards BOOLEAN DEFAULT true,
  feature_mindmaps BOOLEAN DEFAULT true,
  feature_certificates BOOLEAN DEFAULT true,
  feature_ai_tutor BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. MODULE
CREATE TABLE IF NOT EXISTS module (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. QUIZ TOPICS
CREATE TABLE IF NOT EXISTS quiz_topics (
  id TEXT PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 4. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_topic_id TEXT NOT NULL REFERENCES quiz_topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct INTEGER NOT NULL,
  explanation TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- 5. FLASHCARD SETS (Metadaten pro Modul)
CREATE TABLE IF NOT EXISTS flashcard_sets (
  module_id INTEGER PRIMARY KEY REFERENCES module(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

-- 6. FLASHCARDS
CREATE TABLE IF NOT EXISTS content_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES module(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 7. MINDMAPS
CREATE TABLE IF NOT EXISTS mindmaps (
  module_id INTEGER PRIMARY KEY REFERENCES module(id) ON DELETE CASCADE,
  center_label TEXT NOT NULL
);

-- 8. MINDMAP TOPICS
CREATE TABLE IF NOT EXISTS mindmap_topics (
  id TEXT NOT NULL,
  mindmap_module_id INTEGER NOT NULL REFERENCES mindmaps(module_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT NOT NULL,
  details JSONB NOT NULL,
  sort_order INTEGER DEFAULT 0,
  PRIMARY KEY (id, mindmap_module_id)
);

-- 9. PERSONAS
CREATE TABLE IF NOT EXISTS personas (
  id TEXT PRIMARY KEY,
  schema_version INTEGER DEFAULT 1,
  name TEXT NOT NULL,
  first_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  image TEXT NOT NULL,
  voice_type TEXT NOT NULL CHECK (voice_type IN ('onyx', 'nova', 'fable', 'echo')),
  summary TEXT NOT NULL,
  case_study_situation TEXT NOT NULL,
  case_study_concerns JSONB NOT NULL,
  case_study_needs JSONB NOT NULL,
  case_study_ideal_solution TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  zen_mode_prompt TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. MODULE LERNHILFEN (Audio + PDF Metadaten)
CREATE TABLE IF NOT EXISTS module_lernhilfen (
  module_id INTEGER PRIMARY KEY REFERENCES module(id) ON DELETE CASCADE,
  audio_title TEXT,
  audio_duration TEXT,
  audio_url TEXT,
  audio_description TEXT,
  pdf_title TEXT,
  pdf_description TEXT,
  pdf_file TEXT,
  pdf_topics JSONB
);

-- ============================================
-- RLS POLICIES
-- ============================================
ALTER TABLE academy_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE module ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mindmap_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_lernhilfen ENABLE ROW LEVEL SECURITY;

-- Alle authentifizierten User: SELECT
CREATE POLICY "auth_read_academy_config" ON academy_config FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_module" ON module FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_quiz_topics" ON quiz_topics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_quiz_questions" ON quiz_questions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_flashcard_sets" ON flashcard_sets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_content_flashcards" ON content_flashcards FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_mindmaps" ON mindmaps FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_mindmap_topics" ON mindmap_topics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_personas" ON personas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "auth_read_module_lernhilfen" ON module_lernhilfen FOR SELECT USING (auth.role() = 'authenticated');

-- Betreiber: ALL (CRUD)
CREATE POLICY "betreiber_manage_academy_config" ON academy_config FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_module" ON module FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_quiz_topics" ON quiz_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_quiz_questions" ON quiz_questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_flashcard_sets" ON flashcard_sets FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_content_flashcards" ON content_flashcards FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_mindmaps" ON mindmaps FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_mindmap_topics" ON mindmap_topics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_personas" ON personas FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
CREATE POLICY "betreiber_manage_module_lernhilfen" ON module_lernhilfen FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
);
