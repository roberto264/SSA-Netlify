/**
 * Rate limiting middleware using Upstash Redis.
 * Per-user limits on expensive AI endpoints.
 */
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

let redis = null;
let limiters = {};

function getRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    redis = new Redis({ url, token });
  }
  return redis;
}

function getLimiter(name, limit, window) {
  if (!limiters[name]) {
    const r = getRedis();
    if (!r) return null;
    limiters[name] = new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `ssa:${name}`,
    });
  }
  return limiters[name];
}

// Rate limit configs per endpoint type
const CONFIGS = {
  chat:      { limit: 20, window: '1 m' },
  tts:       { limit: 10, window: '1 m' },
  stt:       { limit: 10, window: '1 m' },
  analyze:   { limit: 5,  window: '1 m' },
};

/**
 * Check rate limit for a user on a given endpoint type.
 * Returns { allowed: true } or { allowed: false, response } where response is a ready-to-return object.
 *
 * If Upstash is not configured, allows all requests (graceful degradation).
 */
export async function checkRateLimit(userId, endpointType, origin) {
  const config = CONFIGS[endpointType];
  if (!config) return { allowed: true };

  const limiter = getLimiter(endpointType, config.limit, config.window);
  if (!limiter) {
    // Upstash not configured — allow (don't break the app)
    return { allowed: true };
  }

  try {
    const { success, remaining, reset } = await limiter.limit(userId);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return {
        allowed: false,
        response: {
          statusCode: 429,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin || '*',
            'Retry-After': String(retryAfter),
            'X-RateLimit-Remaining': '0',
          },
          body: JSON.stringify({
            ok: false,
            error: {
              code: 'RATE_LIMITED',
              message: `Zu viele Anfragen. Bitte warte ${retryAfter} Sekunden.`,
            },
          }),
        },
      };
    }

    return { allowed: true, remaining };
  } catch (err) {
    // Redis error — don't block the request
    console.error('Rate limit check failed:', err.message);
    return { allowed: true };
  }
}

/**
 * Check rate limit for v2 functions (returns Response object instead of v1 object).
 */
export async function checkRateLimitV2(userId, endpointType, corsHeaders) {
  const config = CONFIGS[endpointType];
  if (!config) return { allowed: true };

  const limiter = getLimiter(endpointType, config.limit, config.window);
  if (!limiter) return { allowed: true };

  try {
    const { success, remaining, reset } = await limiter.limit(userId);

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return {
        allowed: false,
        response: new Response(
          JSON.stringify({
            ok: false,
            error: { code: 'RATE_LIMITED', message: `Zu viele Anfragen. Bitte warte ${retryAfter} Sekunden.` },
          }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Retry-After': String(retryAfter) },
          }
        ),
      };
    }

    return { allowed: true, remaining };
  } catch (err) {
    console.error('Rate limit check failed:', err.message);
    return { allowed: true };
  }
}
