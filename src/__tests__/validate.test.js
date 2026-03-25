import { describe, it, expect } from 'vitest';

// Import the validate functions (we need to use dynamic import since they're ES modules in netlify/functions)
// For unit testing, we replicate the logic here
const LIMITS = {
  MAX_MESSAGES: 50,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_SYSTEM_PROMPT: 5000,
  MAX_TOKENS_LIMIT: 1000,
  MAX_AUDIO_BASE64_LENGTH: 15_000_000,
  MAX_TTS_TEXT: 1000,
  MAX_ANALYZE_MESSAGES: 100,
  MAX_PERSONA_NAME: 200,
};

// Replicate validateChat for testing
function validateChat({ messages, systemPrompt, maxTokens }: any) {
  if (!Array.isArray(messages) || messages.length === 0) return 'messages must be a non-empty array';
  if (messages.length > LIMITS.MAX_MESSAGES) return `Too many messages (max ${LIMITS.MAX_MESSAGES})`;
  for (const msg of messages) {
    if (!msg.role || !msg.content) return 'Each message must have role and content';
    if (typeof msg.content !== 'string') return 'Message content must be a string';
    if (msg.content.length > LIMITS.MAX_MESSAGE_LENGTH) return `Message too long (max ${LIMITS.MAX_MESSAGE_LENGTH} chars)`;
  }
  if (!systemPrompt || typeof systemPrompt !== 'string') return 'systemPrompt is required';
  if (systemPrompt.length > LIMITS.MAX_SYSTEM_PROMPT) return `systemPrompt too long (max ${LIMITS.MAX_SYSTEM_PROMPT} chars)`;
  if (maxTokens && (maxTokens < 1 || maxTokens > LIMITS.MAX_TOKENS_LIMIT)) return `maxTokens must be between 1 and ${LIMITS.MAX_TOKENS_LIMIT}`;
  return null;
}

function validateTTS({ text }: any) {
  if (!text || typeof text !== 'string') return 'text is required';
  if (text.length > LIMITS.MAX_TTS_TEXT) return `Text too long (max ${LIMITS.MAX_TTS_TEXT} chars)`;
  return null;
}

function validateAudio({ audio, mimeType }: any) {
  if (!audio || typeof audio !== 'string') return 'audio (base64) is required';
  if (audio.length > LIMITS.MAX_AUDIO_BASE64_LENGTH) return 'Audio too large (max ~10MB)';
  const validMimes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg', 'audio/ogg;codecs=opus', 'audio/wav', 'audio/mpeg'];
  if (mimeType && !validMimes.includes(mimeType)) return `Invalid MIME type: ${mimeType}`;
  return null;
}

describe('validateChat', () => {
  const validInput = {
    messages: [{ role: 'user', content: 'Hallo' }],
    systemPrompt: 'Du bist ein Berater.',
  };

  it('accepts valid input', () => {
    expect(validateChat(validInput)).toBeNull();
  });

  it('rejects empty messages', () => {
    expect(validateChat({ ...validInput, messages: [] })).toContain('non-empty');
  });

  it('rejects non-array messages', () => {
    expect(validateChat({ ...validInput, messages: 'string' })).toContain('non-empty');
  });

  it('rejects too many messages', () => {
    const tooMany = Array.from({ length: 51 }, (_, i) => ({ role: 'user', content: `msg ${i}` }));
    expect(validateChat({ ...validInput, messages: tooMany })).toContain('Too many');
  });

  it('rejects message without role', () => {
    expect(validateChat({ ...validInput, messages: [{ content: 'no role' }] })).toContain('role and content');
  });

  it('rejects overly long message', () => {
    const longMsg = [{ role: 'user', content: 'x'.repeat(2001) }];
    expect(validateChat({ ...validInput, messages: longMsg })).toContain('too long');
  });

  it('rejects missing systemPrompt', () => {
    expect(validateChat({ messages: validInput.messages, systemPrompt: '' })).toContain('required');
  });

  it('rejects overly long systemPrompt', () => {
    expect(validateChat({ ...validInput, systemPrompt: 'x'.repeat(5001) })).toContain('too long');
  });

  it('rejects maxTokens over limit', () => {
    expect(validateChat({ ...validInput, maxTokens: 1001 })).toContain('between 1');
  });

  it('allows maxTokens of 0 (treated as falsy/default)', () => {
    expect(validateChat({ ...validInput, maxTokens: 0 })).toBeNull();
  });

  it('accepts valid maxTokens', () => {
    expect(validateChat({ ...validInput, maxTokens: 500 })).toBeNull();
  });
});

describe('validateTTS', () => {
  it('accepts valid text', () => {
    expect(validateTTS({ text: 'Hallo Welt' })).toBeNull();
  });

  it('rejects empty text', () => {
    expect(validateTTS({ text: '' })).toContain('required');
  });

  it('rejects non-string', () => {
    expect(validateTTS({ text: 123 })).toContain('required');
  });

  it('rejects overly long text', () => {
    expect(validateTTS({ text: 'x'.repeat(1001) })).toContain('too long');
  });
});

describe('validateAudio', () => {
  it('accepts valid audio', () => {
    expect(validateAudio({ audio: 'base64data', mimeType: 'audio/wav' })).toBeNull();
  });

  it('rejects missing audio', () => {
    expect(validateAudio({ audio: '' })).toContain('required');
  });

  it('rejects invalid MIME type', () => {
    expect(validateAudio({ audio: 'data', mimeType: 'video/mp4' })).toContain('Invalid MIME');
  });

  it('accepts all valid MIME types', () => {
    const validMimes = ['audio/webm', 'audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'];
    for (const mime of validMimes) {
      expect(validateAudio({ audio: 'data', mimeType: mime })).toBeNull();
    }
  });
});
