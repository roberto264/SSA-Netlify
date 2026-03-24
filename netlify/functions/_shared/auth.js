/**
 * JWT Authentication middleware for Netlify Functions.
 * Validates Supabase JWT tokens from Authorization header.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Log an action to the audit_log table (fire-and-forget).
 */
export async function logAudit(userId, action, resource, details = {}) {
  if (!supabaseUrl || !supabaseServiceKey) return;
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    await supabase.from('audit_log').insert({
      user_id: userId,
      action,
      resource,
      details,
      ip_address: details.ip || null,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
}

/**
 * Verify the JWT token from the Authorization header.
 * Returns { user, error } — if error is set, return it as the response.
 *
 * Usage in a function:
 *   const { user, error: authError } = await verifyAuth(event);
 *   if (authError) return authError;
 *   // user.id is now available
 */
export async function verifyAuth(event, origin) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return {
      user: null,
      error: {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
        body: JSON.stringify({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } }),
      },
    };
  }

  const token = authHeader.slice(7);

  try {
    // Use service role key to verify user tokens server-side
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase config missing for auth verification');
      return {
        user: null,
        error: {
          statusCode: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
          body: JSON.stringify({ ok: false, error: { code: 'CONFIG_ERROR', message: 'Auth configuration missing' } }),
        },
      };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: verifyError } = await supabase.auth.getUser(token);

    if (verifyError || !user) {
      return {
        user: null,
        error: {
          statusCode: 401,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
          body: JSON.stringify({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }),
        },
      };
    }

    // Log API access (fire-and-forget, don't block the request)
    const functionName = event.path?.replace('/.netlify/functions/', '') || 'unknown';
    logAudit(user.id, `api_call:${functionName}`, `function:${functionName}`, {
      method: event.httpMethod,
      ip: event.headers?.['x-forwarded-for'] || event.headers?.['client-ip'] || null,
    }).catch(() => {}); // Ignore audit errors

    return { user, error: null };
  } catch (err) {
    console.error('Auth verification error:', err);
    return {
      user: null,
      error: {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': origin || '*' },
        body: JSON.stringify({ ok: false, error: { code: 'AUTH_ERROR', message: 'Authentication failed' } }),
      },
    };
  }
}
