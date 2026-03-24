/**
 * Remove User — Arbeitgeber entfernt Mitarbeiter aus der Firma.
 * POST { userId } → Soft-Delete (firma_id wird entfernt)
 */
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

  const { user, error: authError } = await verifyAuth(event, origin);
  if (authError) return authError;

  try {
    const { userId } = JSON.parse(event.body || '{}');

    if (!userId) {
      return error(400, 'INVALID_INPUT', 'userId erforderlich', origin);
    }

    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Verify caller is arbeitgeber
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('firma_id, role')
      .eq('id', user.id)
      .single();

    if (!callerProfile || callerProfile.role !== 'arbeitgeber') {
      return error(403, 'FORBIDDEN', 'Nur Arbeitgeber können Mitarbeiter entfernen', origin);
    }

    // Verify target user belongs to same firma
    const { data: targetProfile } = await supabase
      .from('profiles')
      .select('id, firma_id, email, name')
      .eq('id', userId)
      .single();

    if (!targetProfile || targetProfile.firma_id !== callerProfile.firma_id) {
      return error(400, 'NOT_IN_FIRMA', 'Dieser Benutzer gehört nicht zu deiner Firma', origin);
    }

    // Can't remove yourself
    if (userId === user.id) {
      return error(400, 'CANNOT_REMOVE_SELF', 'Du kannst dich nicht selbst entfernen', origin);
    }

    // Remove user from firma (set firma_id to null, role to privat)
    await supabase
      .from('profiles')
      .update({
        firma_id: null,
        firma: null,
        role: 'privat',
      })
      .eq('id', userId);

    // Audit log
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'user_removed_from_firma',
      resource: `user:${userId}`,
      details: {
        removed_user_email: targetProfile.email,
        firma_id: callerProfile.firma_id,
      },
    });

    return success({ message: `${targetProfile.name || targetProfile.email} wurde entfernt.` }, origin);
  } catch (err) {
    console.error('Remove user error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
