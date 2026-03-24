import { handleOptions, success, error } from './_shared/response.js';
import { validateAudio } from './_shared/validate.js';
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
    console.error('OPENAI_API_KEY not configured');
    return error(500, 'CONFIG_ERROR', 'API Key not configured', origin);
  }

  const { user, error: authError } = await verifyAuth(event, origin);
  if (authError) return authError;

  const { allowed, response: rateLimitResponse } = await checkRateLimit(user.id, 'stt', origin);
  if (!allowed) return rateLimitResponse;

  const { allowed: subAllowed, response: subResponse } = await checkSubscription(user.id, origin);
  if (!subAllowed) return subResponse;

  try {
    const { audio, mimeType } = JSON.parse(event.body);

    const validationErr = validateAudio({ audio, mimeType });
    if (validationErr) return error(400, 'INVALID_INPUT', validationErr, origin);

    const binaryData = Buffer.from(audio, 'base64');

    const mimeToExt = {
      'audio/webm': 'webm',
      'audio/webm;codecs=opus': 'webm',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
      'audio/ogg;codecs=opus': 'ogg',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3'
    };
    const extension = mimeToExt[mimeType] || 'webm';
    const contentType = mimeType?.split(';')[0] || 'audio/webm';
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);

    const formParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="audio.${extension}"\r\n`,
      `Content-Type: ${contentType}\r\n\r\n`,
    ];

    const formEnd = `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="model"\r\n\r\n` +
      `whisper-1\r\n` +
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="language"\r\n\r\n` +
      `de\r\n` +
      `--${boundary}--\r\n`;

    const formStart = Buffer.from(formParts.join(''), 'utf8');
    const formEndBuffer = Buffer.from(formEnd, 'utf8');
    const fullBody = Buffer.concat([formStart, binaryData, formEndBuffer]);

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: fullBody
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Whisper API error:', response.status, data);
      return error(response.status, 'OPENAI_ERROR', data.error?.message || 'Transcription failed', origin);
    }

    return success({ text: data.text }, origin);
  } catch (err) {
    console.error('Transcribe error:', err);
    return error(500, 'INTERNAL_ERROR', err.message, origin);
  }
};
