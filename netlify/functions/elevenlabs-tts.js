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

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY not configured');
    return error(500, 'CONFIG_ERROR', 'ElevenLabs API Key not configured', origin);
  }

  const { user, error: authError } = await verifyAuth(event, origin);
  if (authError) return authError;

  const { allowed, response: rateLimitResponse } = await checkRateLimit(user.id, 'tts', origin);
  if (!allowed) return rateLimitResponse;

  const { allowed: subAllowed, response: subResponse } = await checkSubscription(user.id, origin);
  if (!subAllowed) return subResponse;

  try {
    const { text, voiceId } = JSON.parse(event.body);

    const validationErr = validateTTS({ text });
    if (validationErr) return error(400, 'INVALID_INPUT', validationErr, origin);
    if (!voiceId) return error(400, 'INVALID_INPUT', 'Missing voiceId', origin);

    console.log('Sending TTS request to ElevenLabs...');

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        output_format: 'mp3_44100_128'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs TTS error:', response.status, errorText);
      return error(response.status, 'ELEVENLABS_ERROR', `ElevenLabs TTS error: ${response.status}`, origin);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    console.log('ElevenLabs TTS response received');

    return success({ audio: base64 }, origin);
  } catch (err) {
    console.error('ElevenLabs TTS function error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
