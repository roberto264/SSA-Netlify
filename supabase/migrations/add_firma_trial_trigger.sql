-- ============================================
-- MIGRATION: Auto-Trial für neue Firmen
-- ============================================

-- Trigger: Neue Firmen bekommen automatisch 14 Tage Trial
CREATE OR REPLACE FUNCTION set_firma_trial()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.trial_ends_at IS NULL THEN
    NEW.trial_ends_at = NOW() + INTERVAL '14 days';
  END IF;
  IF NEW.subscription_status IS NULL THEN
    NEW.subscription_status = 'trialing';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER firmen_auto_trial
  BEFORE INSERT ON firmen
  FOR EACH ROW EXECUTE FUNCTION set_firma_trial();
