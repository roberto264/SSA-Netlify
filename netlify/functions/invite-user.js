/**
 * Invite User — Arbeitgeber lädt Mitarbeiter per E-Mail ein.
 * POST { email } → { invitation, inviteUrl }
 */
import { handleOptions, success, error } from './_shared/response.js';
import { verifyAuth } from './_shared/auth.js';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const handler = async (event) => {
  const origin = event.headers?.origin || '';
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed', origin);
  }

  const { user, error: authError } = await verifyAuth(event, origin);
  if (authError) return authError;

  try {
    const { email } = JSON.parse(event.body || '{}');

    if (!email || !email.includes('@')) {
      return error(400, 'INVALID_INPUT', 'Gültige E-Mail-Adresse erforderlich', origin);
    }

    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Verify user is arbeitgeber
    const { data: profile } = await supabase
      .from('profiles')
      .select('firma_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'arbeitgeber') {
      return error(403, 'FORBIDDEN', 'Nur Arbeitgeber können Mitarbeiter einladen', origin);
    }

    if (!profile.firma_id) {
      return error(400, 'NO_FIRMA', 'Keine Firma zugeordnet', origin);
    }

    // Check if email already registered
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return error(400, 'ALREADY_REGISTERED', 'Diese E-Mail ist bereits registriert', origin);
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('invitations')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('firma_id', profile.firma_id)
      .is('accepted_at', null)
      .single();

    if (existingInvite) {
      return error(400, 'ALREADY_INVITED', 'Diese E-Mail wurde bereits eingeladen', origin);
    }

    // Check seat limit
    const { data: firma } = await supabase
      .from('firmen')
      .select('seat_limit')
      .eq('id', profile.firma_id)
      .single();

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('firma_id', profile.firma_id)
      .is('deleted_at', null);

    const { count: pendingInvites } = await supabase
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('firma_id', profile.firma_id)
      .is('accepted_at', null);

    if ((activeUsers + pendingInvites) >= (firma?.seat_limit || 5)) {
      return error(400, 'SEAT_LIMIT', 'Seat-Limit erreicht. Bitte mehr Seats buchen.', origin);
    }

    // Create invitation
    const token = crypto.randomBytes(32).toString('hex');

    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert({
        firma_id: profile.firma_id,
        email: email.toLowerCase(),
        token,
        invited_by: user.id,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const siteUrl = process.env.SITE_URL || origin || 'http://localhost:8888';
    const inviteUrl = `${siteUrl}/invite/${token}`;

    // Log
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'invite_sent',
      resource: `invitation:${invitation.id}`,
      details: { email: email.toLowerCase(), firma_id: profile.firma_id },
    });

    return success({ invitation, inviteUrl }, origin);
  } catch (err) {
    console.error('Invite error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
