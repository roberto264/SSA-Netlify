-- ============================================
-- SWISS SOLAR ACADEMY - DATENBANK SCHEMA
-- ============================================
-- Führe dieses SQL in Supabase aus:
-- SQL Editor → New Query → Paste → Run

-- 1. PROFILES (erweitert die Auth Users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  firma TEXT,
  role TEXT DEFAULT 'lernender' CHECK (role IN ('lernender', 'arbeitgeber', 'betreiber')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. FIRMEN
CREATE TABLE firmen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MODUL FORTSCHRITT
CREATE TABLE modul_fortschritt (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  modul_id INTEGER NOT NULL,
  topic_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, modul_id, topic_id)
);

-- 4. QUIZ ERGEBNISSE
CREATE TABLE quiz_ergebnisse (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  modul_id INTEGER NOT NULL,
  topic_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ROLLENSPIEL SESSIONS
CREATE TABLE rollenspiel_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL,
  messages JSONB,
  rating TEXT CHECK (rating IN ('schwach', 'mittel', 'gut')),
  ai_feedback TEXT,
  -- Soft Skills Bewertung
  gesprachsfuhrung INTEGER CHECK (gesprachsfuhrung BETWEEN 1 AND 5),
  aktives_zuhoren INTEGER CHECK (aktives_zuhoren BETWEEN 1 AND 5),
  klarheit INTEGER CHECK (klarheit BETWEEN 1 AND 5),
  einwand_behandlung INTEGER CHECK (einwand_behandlung BETWEEN 1 AND 5),
  empathie INTEGER CHECK (empathie BETWEEN 1 AND 5),
  uberzeugungskraft INTEGER CHECK (uberzeugungskraft BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ABSCHLUSSPRÜFUNGEN
CREATE TABLE pruefungen (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE firmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE modul_fortschritt ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_ergebnisse ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollenspiel_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pruefungen ENABLE ROW LEVEL SECURITY;

-- Profiles: User kann eigenes Profil lesen/updaten, Betreiber kann alle sehen
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Betreiber can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

CREATE POLICY "Arbeitgeber can view same firma" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role = 'arbeitgeber' 
      AND p.firma = profiles.firma
    )
  );

-- Firmen: Alle können lesen
CREATE POLICY "Anyone can view firmen" ON firmen
  FOR SELECT USING (true);

-- Modul Fortschritt: User kann eigenen sehen/updaten
CREATE POLICY "Users can manage own progress" ON modul_fortschritt
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Betreiber can view all progress" ON modul_fortschritt
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

-- Quiz Ergebnisse
CREATE POLICY "Users can manage own quiz results" ON quiz_ergebnisse
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Betreiber can view all quiz results" ON quiz_ergebnisse
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

-- Rollenspiel Sessions
CREATE POLICY "Users can manage own sessions" ON rollenspiel_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Betreiber can view all sessions" ON rollenspiel_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

-- Prüfungen
CREATE POLICY "Users can manage own exams" ON pruefungen
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Betreiber can view all exams" ON pruefungen
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

-- ============================================
-- TRIGGER: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INITIAL DATA: Firmen
-- ============================================
INSERT INTO firmen (name) VALUES 
  ('Gama AG'),
  ('SolarTech GmbH'),
  ('EcoEnergy AG'),
  ('SunPower Swiss');
