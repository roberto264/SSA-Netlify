/**
 * Accept Invitation — Eingeladener Mitarbeiter registriert sich.
 * POST { token, name, password } → { user }
 */
import { handleOptions, success, error } from './_shared/response.js';
import { createClient } from '@supabase/supabase-js';

export const handler = async (event) => {
  const origin = event.headers?.origin || '';
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed', origin);
  }

  try {
    const { token, name, password } = JSON.parse(event.body || '{}');

    if (!token || !name || !password) {
      return error(400, 'INVALID_INPUT', 'Token, Name und Passwort erforderlich', origin);
    }

    if (password.length < 6) {
      return error(400, 'INVALID_INPUT', 'Passwort muss mindestens 6 Zeichen haben', origin);
    }

    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Find invitation
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .select('*, firmen(name)')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (inviteError || !invitation) {
      return error(400, 'INVALID_TOKEN', 'Einladung nicht gefunden oder bereits verwendet', origin);
    }

    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return error(400, 'EXPIRED', 'Diese Einladung ist abgelaufen. Bitte deinen Arbeitgeber um eine neue.', origin);
    }

    // Check if email already registered
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', invitation.email)
      .single();

    if (existingUser) {
      return error(400, 'ALREADY_REGISTERED', 'Diese E-Mail ist bereits registriert', origin);
    }

    // Create user via Supabase Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true, // Skip email verification for invited users
      user_metadata: { name },
    });

    if (authError) {
      console.error('User creation error:', authError);
      return error(500, 'CREATE_ERROR', authError.message, origin);
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({
        name,
        firma: invitation.firmen?.name || null,
        firma_id: invitation.firma_id,
        role: 'lernender',
      })
      .eq('id', authData.user.id);

    // Mark invitation as accepted
    await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    // Log
    await supabase.from('audit_log').insert({
      user_id: authData.user.id,
      action: 'invite_accepted',
      resource: `invitation:${invitation.id}`,
      details: { firma_id: invitation.firma_id },
    });

    return success({
      message: 'Konto erstellt! Du kannst dich jetzt anmelden.',
      email: invitation.email,
    }, origin);
  } catch (err) {
    console.error('Accept invite error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
