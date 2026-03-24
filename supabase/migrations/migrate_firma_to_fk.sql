-- ============================================
-- MIGRATION: Migriere profiles.firma (TEXT) → profiles.firma_id (UUID FK)
-- ============================================
-- Voraussetzung: add_subscriptions_and_billing.sql muss zuerst ausgeführt sein

-- 1. Bestehende Text-Zuordnungen zu FK migrieren
UPDATE profiles p
SET firma_id = f.id
FROM firmen f
WHERE p.firma = f.name
  AND p.firma_id IS NULL;

-- 2. Logge Profile ohne zugeordnete Firma (zur manuellen Überprüfung)
-- SELECT id, email, firma FROM profiles WHERE firma IS NOT NULL AND firma_id IS NULL;

-- 3. Die alte firma TEXT-Spalte bleibt vorerst als Fallback bestehen.
-- Erst löschen wenn alle Frontend-Referenzen auf firma_id umgestellt sind:
-- ALTER TABLE profiles DROP COLUMN firma;
