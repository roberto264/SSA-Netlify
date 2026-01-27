exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API Key not configured' }) };
  }

  try {
    const { audio } = JSON.parse(event.body);
    const binaryData = Buffer.from(audio, 'base64');
    const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
    
    const formParts = [
      `--${boundary}\r\n`,
      `Content-Disposition: form-data; name="file"; filename="audio.webm"\r\n`,
      `Content-Type: audio/webm\r\n\r\n`,
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
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
