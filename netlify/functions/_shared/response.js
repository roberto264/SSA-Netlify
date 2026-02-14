/**
 * Shared response utilities for all Netlify functions.
 * Provides consistent error/success responses and CORS handling.
 */

export const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Return early for OPTIONS preflight; returns null if not OPTIONS. */
export function handleOptions(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }
  return null;
}

/** Wrap data in a success response: { ok: true, data } */
export function success(data) {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: true, data }),
  };
}

/** Wrap an error response: { ok: false, error: { code, message } } */
export function error(statusCode, code, message) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({ ok: false, error: { code, message } }),
  };
}
