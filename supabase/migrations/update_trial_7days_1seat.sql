-- ============================================
-- MIGRATION: Trial auf 7 Tage + 1 Seat ändern
-- ============================================

-- 1. Trigger für neue Firmen: 7 Tage statt 14
CREATE OR REPLACE FUNCTION set_firma_trial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at = NOW() + INTERVAL '7 days';
  END IF;
  IF NEW.subscription_status IS NULL THEN
    NEW.subscription_status = 'trialing';
  END IF;
  IF NEW.seat_limit IS NULL THEN
    NEW.seat_limit = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Default seat_limit auf 1 ändern
ALTER TABLE firmen ALTER COLUMN seat_limit SET DEFAULT 1;

-- 3. Bestehende Trial-Firmen aktualisieren (optional — nur wenn gewünscht)
-- UPDATE firmen SET seat_limit = 1 WHERE subscription_status = 'trialing';
