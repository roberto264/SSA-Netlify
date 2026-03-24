/**
 * Shared response utilities for all Netlify functions.
 * Provides consistent error/success responses and CORS handling.
 */

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:8888',
  'http://localhost:5173',
  process.env.SITE_URL,
].filter(Boolean);

/** Get CORS headers with dynamic origin check */
export function getCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

// Legacy export for chat.js (v2 format) — uses first allowed origin as default
export const CORS_HEADERS = getCorsHeaders(ALLOWED_ORIGINS[0]);

/** Return early for OPTIONS preflight; returns null if not OPTIONS. */
export function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    const origin = event.headers?.origin || '';
    return { statusCode: 200, headers: getCorsHeaders(origin), body: '' };
  }
  return null;
}

/** Wrap data in a success response: { ok: true, data } */
export function success(data, origin) {
  return {
    statusCode: 200,
    headers: getCorsHeaders(origin),
    body: JSON.stringify({ ok: true, data }),
  };
}

/** Wrap an error response: { ok: false, error: { code, message } } */
export function error(statusCode, code, message, origin) {
  return {
    statusCode,
    headers: getCorsHeaders(origin),
    body: JSON.stringify({ ok: false, error: { code, message } }),
  };
}
