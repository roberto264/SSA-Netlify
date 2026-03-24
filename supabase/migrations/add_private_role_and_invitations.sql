-- ============================================
-- MIGRATION: Privat-Rolle, Einladungen, Firmen-RLS
-- ============================================
-- Voraussetzung: add_subscriptions_and_billing.sql muss zuerst ausgeführt sein

-- 1. Rolle 'privat' erlauben
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('privat', 'lernender', 'arbeitgeber', 'betreiber'));

-- 2. Privat-Subscription-Felder auf profiles (für User ohne Firma)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE;

-- 3. Einladungs-Table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firma_id UUID REFERENCES firmen(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  invited_by UUID REFERENCES profiles(id),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_firma ON invitations(firma_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- 4. Firmen nicht mehr öffentlich lesbar (Datenschutz)
DROP POLICY IF EXISTS "Anyone can view firmen" ON firmen;

CREATE POLICY "Users can view own firma" ON firmen
  FOR SELECT USING (id IN (SELECT firma_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Betreiber can view all firmen" ON firmen
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'betreiber')
  );

-- Arbeitgeber dürfen ihre Firma updaten (für Stripe-Felder etc.)
CREATE POLICY "Arbeitgeber can update own firma" ON firmen
  FOR UPDATE USING (id IN (SELECT firma_id FROM profiles WHERE id = auth.uid() AND role = 'arbeitgeber'));

-- Service Role darf Firmen erstellen (für Registrierung)
CREATE POLICY "Service can insert firmen" ON firmen
  FOR INSERT WITH CHECK (true);

-- 5. RLS für Einladungen
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Arbeitgeber can manage own firma invitations" ON invitations
  FOR ALL USING (
    firma_id IN (SELECT firma_id FROM profiles WHERE id = auth.uid() AND role = 'arbeitgeber')
  );

CREATE POLICY "Service can manage invitations" ON invitations
  FOR ALL WITH CHECK (true);

-- 6. Bestehende Privat-User: Trial setzen
-- (Wird erst relevant wenn neue Privat-User erstellt werden)
