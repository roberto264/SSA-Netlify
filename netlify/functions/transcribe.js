export const handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not configured');
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'API Key not configured' }) };
  }

  try {
    const { audio, mimeType } = JSON.parse(event.body);

    if (!audio) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'No audio data provided' }) };
    }

    console.log('Received audio data, length:', audio.length);
    console.log('MIME type:', mimeType);

    const binaryData = Buffer.from(audio, 'base64');
    console.log('Binary data size:', binaryData.length, 'bytes');

    // Determine file extension based on MIME type
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
    console.log('Using extension:', extension, 'content-type:', contentType);

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

    console.log('Sending to Whisper API...');

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
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.error?.message || 'Transcription failed' })
      };
    }

    console.log('Transcription result:', data.text?.substring(0, 50) + '...');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Transcribe error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
