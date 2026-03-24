/**
 * Input validation utilities for Netlify Functions.
 * Prevents oversized payloads and malformed input.
 */

const LIMITS = {
  // Chat
  MAX_MESSAGES: 50,
  MAX_MESSAGE_LENGTH: 2000,
  MAX_SYSTEM_PROMPT: 5000,
  MAX_TOKENS_LIMIT: 1000,

  // Audio (base64)
  MAX_AUDIO_BASE64_LENGTH: 15_000_000, // ~10MB binary

  // TTS
  MAX_TTS_TEXT: 1000,

  // Analyze
  MAX_ANALYZE_MESSAGES: 100,
  MAX_PERSONA_NAME: 200,
  MAX_PERSONA_SITUATION: 2000,
};

/**
 * Validate chat input. Returns error string or null.
 */
export function validateChat({ messages, systemPrompt, maxTokens }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array';
  }
  if (messages.length > LIMITS.MAX_MESSAGES) {
    return `Too many messages (max ${LIMITS.MAX_MESSAGES})`;
  }
  for (const msg of messages) {
    if (!msg.role || !msg.content) return 'Each message must have role and content';
    if (typeof msg.content !== 'string') return 'Message content must be a string';
    if (msg.content.length > LIMITS.MAX_MESSAGE_LENGTH) {
      return `Message too long (max ${LIMITS.MAX_MESSAGE_LENGTH} chars)`;
    }
  }
  if (!systemPrompt || typeof systemPrompt !== 'string') {
    return 'systemPrompt is required';
  }
  if (systemPrompt.length > LIMITS.MAX_SYSTEM_PROMPT) {
    return `systemPrompt too long (max ${LIMITS.MAX_SYSTEM_PROMPT} chars)`;
  }
  if (maxTokens && (maxTokens < 1 || maxTokens > LIMITS.MAX_TOKENS_LIMIT)) {
    return `maxTokens must be between 1 and ${LIMITS.MAX_TOKENS_LIMIT}`;
  }
  return null;
}

/**
 * Validate audio input (STT). Returns error string or null.
 */
export function validateAudio({ audio, mimeType }) {
  if (!audio || typeof audio !== 'string') {
    return 'audio (base64) is required';
  }
  if (audio.length > LIMITS.MAX_AUDIO_BASE64_LENGTH) {
    return `Audio too large (max ~10MB)`;
  }
  const validMimes = ['audio/webm', 'audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg', 'audio/ogg;codecs=opus', 'audio/wav', 'audio/mpeg'];
  if (mimeType && !validMimes.includes(mimeType)) {
    return `Invalid MIME type: ${mimeType}`;
  }
  return null;
}

/**
 * Validate TTS input. Returns error string or null.
 */
export function validateTTS({ text }) {
  if (!text || typeof text !== 'string') {
    return 'text is required';
  }
  if (text.length > LIMITS.MAX_TTS_TEXT) {
    return `Text too long (max ${LIMITS.MAX_TTS_TEXT} chars)`;
  }
  return null;
}

/**
 * Validate analyze input. Returns error string or null.
 */
export function validateAnalyze({ messages, personaName, personaSituation }) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return 'messages must be a non-empty array';
  }
  if (messages.length > LIMITS.MAX_ANALYZE_MESSAGES) {
    return `Too many messages (max ${LIMITS.MAX_ANALYZE_MESSAGES})`;
  }
  if (!personaName || typeof personaName !== 'string') {
    return 'personaName is required';
  }
  if (personaName.length > LIMITS.MAX_PERSONA_NAME) {
    return `personaName too long (max ${LIMITS.MAX_PERSONA_NAME} chars)`;
  }
  if (personaSituation && personaSituation.length > LIMITS.MAX_PERSONA_SITUATION) {
    return `personaSituation too long (max ${LIMITS.MAX_PERSONA_SITUATION} chars)`;
  }
  return null;
}
