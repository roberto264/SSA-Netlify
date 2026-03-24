-- ============================================
-- MIGRATION: Subscriptions & Billing (B2B)
-- ============================================
-- Run in Supabase SQL Editor after existing schema

-- 1. Erweitere firmen mit Stripe & Subscription Feldern
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing'
  CHECK (subscription_status IN ('trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete'));
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS seat_limit INTEGER DEFAULT 5;
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE firmen ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Erweitere profiles mit firma_id FK (Vorbereitung für Phase 2.2)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS firma_id UUID REFERENCES firmen(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 3. API-Nutzung Tracking (Kosten pro Firma/User)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firma_id UUID REFERENCES firmen(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  function_name TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_firma ON api_usage(firma_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action, created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_firma_id ON profiles(firma_id);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_firmen_stripe ON firmen(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_firmen_status ON firmen(subscription_status);

-- Nützliche Indexes für bestehende Tabellen
CREATE INDEX IF NOT EXISTS idx_modul_fortschritt_user_date ON modul_fortschritt(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_quiz_ergebnisse_user_date ON quiz_ergebnisse(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_rollenspiel_sessions_user_date ON rollenspiel_sessions(user_id, created_at);

-- 6. RLS für neue Tabellen
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- api_usage: Betreiber können alles sehen, Arbeitgeber eigene Firma
CREATE POLICY "Betreiber can view all api_usage" ON api_usage
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

CREATE POLICY "Arbeitgeber can view firma api_usage" ON api_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'arbeitgeber'
      AND p.firma_id = api_usage.firma_id
    )
  );

-- audit_log: Nur Betreiber
CREATE POLICY "Betreiber can view audit_log" ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

-- Service Role darf alles in api_usage und audit_log schreiben (für Functions)
CREATE POLICY "Service can insert api_usage" ON api_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service can insert audit_log" ON audit_log
  FOR INSERT WITH CHECK (true);

-- 7. Arbeitgeber-Policies für Mitarbeiterdaten (fehlten bisher!)
CREATE POLICY "Arbeitgeber can view team progress" ON modul_fortschritt
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'arbeitgeber'
      AND p.firma_id = (SELECT firma_id FROM profiles WHERE id = modul_fortschritt.user_id)
    )
  );

CREATE POLICY "Arbeitgeber can view team quiz results" ON quiz_ergebnisse
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'arbeitgeber'
      AND p.firma_id = (SELECT firma_id FROM profiles WHERE id = quiz_ergebnisse.user_id)
    )
  );

CREATE POLICY "Arbeitgeber can view team sessions" ON rollenspiel_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'arbeitgeber'
      AND p.firma_id = (SELECT firma_id FROM profiles WHERE id = rollenspiel_sessions.user_id)
    )
  );

-- 8. Setze Trial für bestehende Firmen
UPDATE firmen
SET trial_ends_at = NOW() + INTERVAL '14 days',
    subscription_status = 'trialing'
WHERE trial_ends_at IS NULL;

-- 9. Updated_at Trigger für firmen
CREATE OR REPLACE FUNCTION update_firmen_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER firmen_updated_at
  BEFORE UPDATE ON firmen
  FOR EACH ROW EXECUTE FUNCTION update_firmen_updated_at();
