import { handleOptions, success, error } from './_shared/response.js';
import { validateTTS } from './_shared/validate.js';
import { verifyAuth } from './_shared/auth.js';
import { checkRateLimit } from './_shared/rateLimit.js';
import { checkSubscription } from './_shared/subscription.js';

export const handler = async (event) => {
  const origin = event.headers?.origin || '';
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed', origin);
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return error(500, 'CONFIG_ERROR', 'API Key not configured', origin);
  }

  const { user, error: authError } = await verifyAuth(event, origin);
  if (authError) return authError;

  const { allowed, response: rateLimitResponse } = await checkRateLimit(user.id, 'tts', origin);
  if (!allowed) return rateLimitResponse;

  const { allowed: subAllowed, response: subResponse } = await checkSubscription(user.id, origin);
  if (!subAllowed) return subResponse;

  try {
    const { text, voice } = JSON.parse(event.body);

    const validationErr = validateTTS({ text });
    if (validationErr) return error(400, 'INVALID_INPUT', validationErr, origin);

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice: voice || 'onyx',
        input: text
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI TTS error:', response.status, errorText);
      return error(response.status, 'OPENAI_ERROR', `OpenAI TTS error: ${response.status}`, origin);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return success({ audio: base64 }, origin);
  } catch (err) {
    console.error('TTS error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
