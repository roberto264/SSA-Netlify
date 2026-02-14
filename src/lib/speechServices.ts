/**
 * Engine-agnostic Speech Services.
 * ElevenLabs primary with OpenAI fallback for both TTS and STT.
 * Replaces voiceConfig.ts with normalized interfaces.
 */
import type { VoiceType } from '../types/content';

// ─── Types ───────────────────────────────────────────────────────────
export type SpeechEngine = 'elevenlabs' | 'openai';

export interface SpeechSynthesisResult {
  audio: string;          // base64
  engine: SpeechEngine;
}

export interface SpeechRecognitionResult {
  text: string;
  engine: SpeechEngine;
}

// ─── Voice Map ───────────────────────────────────────────────────────
export const ELEVENLABS_VOICE_MAP: Record<VoiceType, string> = {
  onyx: 'pNInz6obpgDQGcFmaJgB',   // Adam
  nova: '21m00Tcm4TlvDq8ikWAM',   // Rachel
  fable: 'onwK4e9ZLuTAKqWW03F9',  // Daniel
  echo: 'Xb7hH8MSUJpSbSDYk0k2',   // Alice
};

function getVoiceId(voiceType: VoiceType): string {
  return ELEVENLABS_VOICE_MAP[voiceType] || ELEVENLABS_VOICE_MAP.onyx;
}

// ─── TTS ─────────────────────────────────────────────────────────────
async function openAiTTS(text: string, voice: string, signal?: AbortSignal): Promise<SpeechSynthesisResult> {
  const response = await fetch('/.netlify/functions/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voice || 'onyx' }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI TTS failed: ${response.status}`);
  }

  const result = await response.json();
  return { audio: result.data?.audio || result.audio, engine: 'openai' };
}

export async function synthesizeSpeech(params: {
  text: string;
  voice: VoiceType;
  signal?: AbortSignal;
}): Promise<SpeechSynthesisResult> {
  const { text, voice, signal } = params;
  const voiceId = getVoiceId(voice);

  try {
    const response = await fetch('/.netlify/functions/elevenlabs-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId }),
      signal,
    });

    if (!response.ok) {
      console.warn(`ElevenLabs TTS ${response.status} – falling back to OpenAI`);
      return openAiTTS(text, voice, signal);
    }

    const result = await response.json();
    return { audio: result.data?.audio || result.audio, engine: 'elevenlabs' };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    console.warn('ElevenLabs TTS error – falling back to OpenAI');
    return openAiTTS(text, voice, signal);
  }
}

// ─── STT ─────────────────────────────────────────────────────────────
async function openAiSTT(audio: string, mimeType: string, signal?: AbortSignal): Promise<SpeechRecognitionResult> {
  console.log('STT | using OpenAI Whisper fallback');
  const response = await fetch('/.netlify/functions/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio, mimeType }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI STT failed: ${response.status}`);
  }

  const result = await response.json();
  return { text: result.data?.text || result.text || '', engine: 'openai' };
}

export async function transcribeSpeech(params: {
  audio: string;
  mimeType: string;
  signal?: AbortSignal;
}): Promise<SpeechRecognitionResult> {
  const { audio, mimeType, signal } = params;

  try {
    // ElevenLabs with 10s timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 10000);

    const onCallerAbort = () => timeoutController.abort();
    signal?.addEventListener('abort', onCallerAbort, { once: true });

    console.log('STT | trying ElevenLabs Scribe...');
    const response = await fetch('/.netlify/functions/elevenlabs-stt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio, mimeType }),
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onCallerAbort);

    if (!response.ok) {
      console.warn(`ElevenLabs STT ${response.status} – falling back to OpenAI Whisper`);
      return openAiSTT(audio, mimeType, signal);
    }

    const result = await response.json();
    const text = result.data?.text || result.text || '';
    console.log('STT | ElevenLabs result:', text.substring(0, 50));
    return { text, engine: 'elevenlabs' };
  } catch (err) {
    if (signal?.aborted) throw err;
    console.warn('ElevenLabs STT failed – falling back to OpenAI Whisper:', (err as Error).message);
    return openAiSTT(audio, mimeType, signal);
  }
}

// ─── LLM Streaming (SSE) ────────────────────────────────────────────
export interface StreamChatParams {
  messages: Array<{ role: string; content: string }>;
  systemPrompt: string;
  maxTokens?: number;
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone: (fullText: string, conversationEnded: boolean) => void;
}

/**
 * Stream a chat response via SSE.
 * Tokens arrive one-by-one via onToken(), full text + end flag via onDone().
 */
export async function streamChatResponse(params: StreamChatParams): Promise<void> {
  const { messages, systemPrompt, maxTokens, signal, onToken, onDone } = params;

  const response = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, maxTokens, stream: true }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: `HTTP ${response.status}` } }));
    throw new Error(err.error?.message || `Chat stream failed: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const payload = line.slice(6).trim();
      if (!payload) continue;

      try {
        const parsed = JSON.parse(payload);

        if (parsed.token) {
          fullText += parsed.token;
          onToken(parsed.token);
        }

        if (parsed.done) {
          // Strip [GESPRAECH_ENDE] if it somehow leaked through
          const cleanText = fullText.replace('[GESPRAECH_ENDE]', '').trim();
          onDone(cleanText, parsed.conversationEnded || false);
          return;
        }
      } catch {
        // Skip malformed events
      }
    }
  }

  // Stream ended without explicit done event
  const cleanText = fullText.replace('[GESPRAECH_ENDE]', '').trim();
  onDone(cleanText, fullText.includes('[GESPRAECH_ENDE]'));
}
