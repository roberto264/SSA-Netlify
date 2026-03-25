/**
 * Authenticated fetch wrapper.
 * Automatically adds Supabase JWT to all API calls.
 */
import { supabase } from './supabase';

/** Get current session token, or null if not logged in */
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/** Fetch with automatic Authorization header */
export async function authFetch(url, options = {}) {
  const token = await getAuthToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(url, { ...options, headers });
}
