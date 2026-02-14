import { handleOptions, success, error } from './_shared/response.js';

export const handler = async (event) => {
  const optionsResponse = handleOptions(event);
  if (optionsResponse) return optionsResponse;

  if (event.httpMethod !== 'POST') {
    return error(405, 'METHOD_NOT_ALLOWED', 'Method Not Allowed');
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return error(500, 'CONFIG_ERROR', 'API Key not configured');
  }

  try {
    const { text, voice } = JSON.parse(event.body);

    if (!text) {
      return error(400, 'INVALID_INPUT', 'Missing text');
    }

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
      return error(response.status, 'OPENAI_ERROR', `OpenAI TTS error: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return success({ audio: base64 });
  } catch (err) {
    console.error('TTS error:', err);
    return error(500, 'INTERNAL_ERROR', err.message);
  }
};
