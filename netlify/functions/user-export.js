/**
 * User Data Export — DSGVO Art. 20 (Recht auf Datenportabilität).
 * POST {} → JSON mit allen User-Daten
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
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all user data in parallel
    const [profileRes, progressRes, quizRes, sessionsRes, examsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('modul_fortschritt').select('*').eq('user_id', user.id),
      supabase.from('quiz_ergebnisse').select('*').eq('user_id', user.id),
      supabase.from('rollenspiel_sessions').select('*').eq('user_id', user.id),
      supabase.from('pruefungen').select('*').eq('user_id', user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      profile: profileRes.data,
      modul_fortschritt: progressRes.data || [],
      quiz_ergebnisse: quizRes.data || [],
      rollenspiel_sessions: sessionsRes.data || [],
      pruefungen: examsRes.data || [],
    };

    // Log the export
    await supabase.from('audit_log').insert({
      user_id: user.id,
      action: 'data_export',
      resource: `user:${user.id}`,
      details: {
        records: {
          progress: progressRes.data?.length || 0,
          quizzes: quizRes.data?.length || 0,
          sessions: sessionsRes.data?.length || 0,
          exams: examsRes.data?.length || 0,
        },
      },
    });

    return success(exportData, origin);
  } catch (err) {
    console.error('Export error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
