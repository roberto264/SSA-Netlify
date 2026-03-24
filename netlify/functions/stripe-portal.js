/**
 * Stripe Customer Portal — Redirect zum Billing-Portal.
 * POST {} → { url: string }
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
    const stripe = new Stripe(STRIPE_SECRET_KEY);
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Get user's firma
    const { data: profile } = await supabase
      .from('profiles')
      .select('firma_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.firma_id) {
      return error(400, 'NO_FIRMA', 'Kein Unternehmen zugeordnet', origin);
    }

    if (profile.role !== 'arbeitgeber' && profile.role !== 'betreiber') {
      return error(403, 'FORBIDDEN', 'Nur Arbeitgeber können das Billing-Portal öffnen', origin);
    }

    const { data: firma } = await supabase
      .from('firmen')
      .select('stripe_customer_id')
      .eq('id', profile.firma_id)
      .single();

    if (!firma?.stripe_customer_id) {
      return error(400, 'NO_SUBSCRIPTION', 'Kein Abo vorhanden. Bitte zuerst ein Abo abschliessen.', origin);
    }

    const siteUrl = process.env.SITE_URL || origin || 'http://localhost:8888';

    const session = await stripe.billingPortal.sessions.create({
      customer: firma.stripe_customer_id,
      return_url: `${siteUrl}/`,
    });

    return success({ url: session.url }, origin);
  } catch (err) {
    console.error('Stripe portal error:', err);
    return error(500, 'STRIPE_ERROR', err.message, origin);
  }
};
