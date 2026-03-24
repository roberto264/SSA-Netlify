/**
 * Stripe Update Seats — Ändert die Seat-Anzahl eines bestehenden Abos.
 * POST { seats: number } → { subscription }
 */
import Stripe from 'stripe';
import { handleOptions, success, error } from './_shared/response.js';
import { verifyAuth } from './_shared/auth.js';
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const origin = event.headers?.origin || '';
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed', origin);
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_SECRET_KEY) {
    return error(500, 'CONFIG_ERROR', 'Stripe not configured', origin);
  }

  const { user, error: authError } = await verifyAuth(event, origin);
  if (authError) return authError;

  try {
    const { seats } = JSON.parse(event.body || '{}');

    if (!seats || seats < 1) {
      return error(400, 'INVALID_INPUT', 'Mindestens 1 Seat erforderlich', origin);
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get user's firma
    const { data: profile } = await supabase
      .from('profiles')
      .select('firma_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.firma_id || (profile.role !== 'arbeitgeber' && profile.role !== 'betreiber')) {
      return error(403, 'FORBIDDEN', 'Nur Arbeitgeber können Seats anpassen', origin);
    }

    // Get firma with subscription
    const { data: firma } = await supabase
      .from('firmen')
      .select('*')
      .eq('id', profile.firma_id)
      .single();

    if (!firma?.subscription_id) {
      return error(400, 'NO_SUBSCRIPTION', 'Kein aktives Abo vorhanden. Bitte zuerst ein Abo abschliessen.', origin);
    }

    // Check minimum seats (can't go below active users)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('firma_id', firma.id)
      .is('deleted_at', null);

    if (seats < activeUsers) {
      return error(400, 'TOO_FEW_SEATS', `Mindestens ${activeUsers} Seats nötig (${activeUsers} aktive Mitarbeiter). Entferne zuerst Mitarbeiter.`, origin);
    }

    // Get subscription and update quantity
    const subscription = await stripe.subscriptions.retrieve(firma.subscription_id);
    const itemId = subscription.items.data[0]?.id;

    if (!itemId) {
      return error(500, 'STRIPE_ERROR', 'Subscription Item nicht gefunden', origin);
    }

    const updated = await stripe.subscriptions.update(firma.subscription_id, {
      items: [{
        id: itemId,
        quantity: seats,
      }],
      proration_behavior: 'create_prorations', // Anteilige Abrechnung
    });

    // Update seat_limit in DB
    await supabase
      .from('firmen')
      .update({ seat_limit: seats })
      .eq('id', firma.id);

    // Audit log
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'seats_updated',
      resource: `firma:${firma.id}`,
      details: { old_seats: firma.seat_limit, new_seats: seats },
    });

    return success({
      message: `Seats auf ${seats} angepasst.`,
      seats,
      subscription_status: updated.status,
    }, origin);
  } catch (err) {
    console.error('Update seats error:', err);
    return error(500, 'STRIPE_ERROR', err.message, origin);
  }
};
