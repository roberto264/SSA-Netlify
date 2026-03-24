/**
 * Stripe Webhook — verarbeitet Stripe Events.
 * Kein Auth-Check nötig (Webhook-Signatur stattdessen).
 */
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe config missing');
    return { statusCode: 500, body: 'Stripe not configured' };
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY);
  const sig = event.headers['stripe-signature'];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        // Get subscription details
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const seats = subscription.items.data[0]?.quantity || 5;
        const firmaId = subscription.metadata?.firma_id;

        if (firmaId) {
          await supabase
            .from('firmen')
            .update({
              subscription_id: subscriptionId,
              subscription_status: 'active',
              seat_limit: seats,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_ends_at: null,
            })
            .eq('id', firmaId);

          await supabase.from('audit_log').insert({
            action: 'subscription_created',
            resource: `firma:${firmaId}`,
            details: { subscription_id: subscriptionId, seats, customer_id: customerId },
          });
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = stripeEvent.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const firmaId = subscription.metadata?.firma_id;

        if (firmaId) {
          await supabase
            .from('firmen')
            .update({
              subscription_status: 'active',
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', firmaId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const firmaId = subscription.metadata?.firma_id;

        if (firmaId) {
          await supabase
            .from('firmen')
            .update({ subscription_status: 'past_due' })
            .eq('id', firmaId);

          await supabase.from('audit_log').insert({
            action: 'payment_failed',
            resource: `firma:${firmaId}`,
            details: { subscription_id: subscriptionId, invoice_id: invoice.id },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        const firmaId = subscription.metadata?.firma_id;
        if (!firmaId) break;

        const seats = subscription.items.data[0]?.quantity || 5;

        await supabase
          .from('firmen')
          .update({
            subscription_status: subscription.status,
            seat_limit: seats,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', firmaId);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        const firmaId = subscription.metadata?.firma_id;
        if (!firmaId) break;

        await supabase
          .from('firmen')
          .update({
            subscription_status: 'canceled',
            subscription_id: null,
          })
          .eq('id', firmaId);

        await supabase.from('audit_log').insert({
          action: 'subscription_canceled',
          resource: `firma:${firmaId}`,
          details: { subscription_id: subscription.id },
        });
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error('Webhook processing error:', err);
    return { statusCode: 500, body: `Webhook handler failed: ${err.message}` };
  }
};
