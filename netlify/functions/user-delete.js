/**
 * User Account Deletion — DSGVO Art. 17 (Recht auf Löschung).
 * POST { confirm: true } → Soft-Delete (30 Tage, dann permanent)
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
    const { confirm } = JSON.parse(event.body || '{}');

    if (!confirm) {
      return error(400, 'CONFIRMATION_REQUIRED', 'Bitte bestätige die Löschung mit { "confirm": true }', origin);
    }

    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Soft-delete: set deleted_at timestamp
    const deletedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ deleted_at: deletedAt })
      .eq('id', user.id);

    if (updateError) throw updateError;

    // Log the deletion request
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'account_deletion_requested',
      resource: `user:${user.id}`,
      details: {
        deleted_at: deletedAt,
        permanent_deletion_after: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });

    return success({
      message: 'Konto wird gelöscht. Deine Daten werden innerhalb von 30 Tagen endgültig entfernt.',
      deleted_at: deletedAt,
      permanent_after: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, origin);
  } catch (err) {
    console.error('Delete error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
