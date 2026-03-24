/**
 * Stripe Checkout — erstellt eine Checkout Session für Firmen-Abo.
 * POST { seats: number }
 * Returns { url: string } (Stripe Checkout URL)
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
    const { seats = 5 } = JSON.parse(event.body || '{}');
    const stripe = new Stripe(STRIPE_SECRET_KEY);

    // Get user profile with firma
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await supabase
      .from('profiles')
      .select('firma_id, role, firma')
      .eq('id', user.id)
      .single();

    if (!profile?.firma_id) {
      return error(400, 'NO_FIRMA', 'Kein Unternehmen zugeordnet', origin);
    }

    if (profile.role !== 'arbeitgeber' && profile.role !== 'betreiber') {
      return error(403, 'FORBIDDEN', 'Nur Arbeitgeber können Abos verwalten', origin);
    }

    // Get or create Stripe customer for firma
    const { data: firma } = await supabase
      .from('firmen')
      .select('*')
      .eq('id', profile.firma_id)
      .single();

    let customerId = firma?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        name: firma.name,
        metadata: { firma_id: firma.id },
      });
      customerId = customer.id;

      await supabase
        .from('firmen')
        .update({ stripe_customer_id: customerId })
        .eq('id', firma.id);
    }

    // Create checkout session
    const siteUrl = process.env.SITE_URL || origin || 'http://localhost:8888';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: seats,
      }],
      subscription_data: {
        metadata: { firma_id: firma.id },
      },
      success_url: `${siteUrl}/?checkout=success`,
      cancel_url: `${siteUrl}/?checkout=cancel`,
      allow_promotion_codes: true,
    });

    return success({ url: session.url }, origin);
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return error(500, 'STRIPE_ERROR', err.message, origin);
  }
};
