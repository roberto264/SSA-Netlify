/**
 * Subscription check middleware.
 * Verifies that the user's firma has an active subscription with available seats.
 */
import { createClient } from '@supabase/supabase-js';

/**
 * Check if user's firma has an active (or trialing) subscription.
 * Returns { allowed: true, firma } or { allowed: false, response }.
 */
export async function checkSubscription(userId, origin) {
  try {
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get user profile with firma
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('firma_id, role')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) {
      return {
        allowed: false,
        response: makeError(403, 'NO_PROFILE', 'Profil nicht gefunden', origin),
      };
    }

    // Betreiber bypassen Subscription-Check
    if (profile.role === 'betreiber') {
      return { allowed: true, firma: null };
    }

    if (!profile.firma_id) {
      return {
        allowed: false,
        response: makeError(403, 'NO_FIRMA', 'Kein Unternehmen zugeordnet. Bitte Firma auswählen.', origin),
      };
    }

    // Get firma subscription status
    const { data: firma, error: firmaErr } = await supabase
      .from('firmen')
      .select('id, name, subscription_status, seat_limit, trial_ends_at')
      .eq('id', profile.firma_id)
      .single();

    if (firmaErr || !firma) {
      return {
        allowed: false,
        response: makeError(403, 'FIRMA_NOT_FOUND', 'Unternehmen nicht gefunden', origin),
      };
    }

    const status = firma.subscription_status;

    // Check trial expiry
    if (status === 'trialing' && firma.trial_ends_at) {
      const trialEnd = new Date(firma.trial_ends_at);
      if (trialEnd < new Date()) {
        // Trial expired — update status
        await supabase
          .from('firmen')
          .update({ subscription_status: 'unpaid' })
          .eq('id', firma.id);

        return {
          allowed: false,
          response: makeError(403, 'TRIAL_EXPIRED', 'Die Testphase ist abgelaufen. Bitte ein Abo abschliessen.', origin),
        };
      }
    }

    // Only active or trialing subscriptions allowed
    if (status !== 'active' && status !== 'trialing') {
      const messages = {
        past_due: 'Zahlungsproblem — bitte Zahlungsmethode aktualisieren.',
        canceled: 'Das Abo wurde gekündigt. Bitte ein neues Abo abschliessen.',
        unpaid: 'Kein aktives Abo vorhanden. Bitte ein Abo abschliessen.',
        incomplete: 'Abo-Einrichtung unvollständig. Bitte erneut versuchen.',
      };

      return {
        allowed: false,
        response: makeError(403, 'SUBSCRIPTION_INACTIVE', messages[status] || 'Kein aktives Abo.', origin),
      };
    }

    // Check seat limit
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('firma_id', firma.id)
      .is('deleted_at', null);

    if (activeUsers > firma.seat_limit) {
      return {
        allowed: false,
        response: makeError(403, 'SEAT_LIMIT', `Seat-Limit erreicht (${firma.seat_limit}). Bitte mehr Seats buchen.`, origin),
      };
    }

    return { allowed: true, firma };
  } catch (err) {
    // Don't block on subscription check errors (graceful degradation)
    console.error('Subscription check error:', err);
    return { allowed: true, firma: null };
  }
}

function makeError(statusCode, code, message, origin) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': origin || '*',
    },
    body: JSON.stringify({ ok: false, error: { code, message } }),
  };
}
