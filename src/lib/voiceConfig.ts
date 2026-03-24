/**
 * Voice TTS/STT configuration with ElevenLabs primary + OpenAI fallback
 */
import type { VoiceType } from '../types/content';
import { authFetch } from './api';

/**
 * Mapping from persona voiceType to ElevenLabs Voice IDs.
 */
export const ELEVENLABS_VOICE_MAP: Record<VoiceType, string> = {
  onyx: 'pNInz6obpgDQGcFmaJgB',   // Adam – Männerstimme (Müller)
  nova: '21m00Tcm4TlvDq8ikWAM',   // Rachel – Frauenstimme (Grünfeld)
  fable: 'onwK4e9ZLuTAKqWW03F9',  // Daniel – Business Männerstimme (Baumann)
  echo: 'Xb7hH8MSUJpSbSDYk0k2',   // Alice – Frauenstimme Business (TechAG)
};

/** Get ElevenLabs voice ID for a persona voiceType */
export function getVoiceId(voiceType: VoiceType): string {
  return ELEVENLABS_VOICE_MAP[voiceType] || ELEVENLABS_VOICE_MAP.onyx;
}

/** OpenAI TTS fallback */
async function openAiTTS(text: string, voiceType: string, signal?: AbortSignal): Promise<string> {
  const response = await authFetch('/.netlify/functions/tts', {
    method: 'POST',
    body: JSON.stringify({ text, voice: voiceType || 'onyx' }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI TTS failed: ${response.status}`);
  }

  const result = await response.json();
  return result.data?.audio || result.audio;
}

/** TTS with ElevenLabs primary, OpenAI fallback */
export async function elevenLabsTTS(text: string, voiceType: string, signal?: AbortSignal): Promise<string> {
  const voiceId = getVoiceId(voiceType);

  try {
    const response = await authFetch('/.netlify/functions/elevenlabs-tts', {
      method: 'POST',
      body: JSON.stringify({ text, voiceId }),
      signal,
    });

    if (!response.ok) {
      console.warn(`ElevenLabs TTS ${response.status} – falling back to OpenAI`);
      return openAiTTS(text, voiceType, signal);
    }

    const result = await response.json();
    return result.data?.audio || result.audio;
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    console.warn('ElevenLabs TTS error – falling back to OpenAI');
    return openAiTTS(text, voiceType, signal);
  }
}

/** OpenAI Whisper STT fallback */
async function openAiSTT(audioBase64: string, mimeType: string, signal?: AbortSignal): Promise<string> {
  const response = await authFetch('/.netlify/functions/transcribe', {
    method: 'POST',
    body: JSON.stringify({ audio: audioBase64, mimeType }),
    signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI STT failed: ${response.status}`);
  }

  const result = await response.json();
  return result.data?.text || result.text || '';
}

/** STT with ElevenLabs primary (10s timeout), OpenAI Whisper fallback */
export async function elevenLabsSTT(audioBase64: string, mimeType = 'audio/wav', signal?: AbortSignal): Promise<string> {
  try {
    // ElevenLabs with 10s timeout
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), 10000);

    // If caller provides a signal, forward abort to our timeout controller
    const onCallerAbort = () => timeoutController.abort();
    signal?.addEventListener('abort', onCallerAbort, { once: true });

    const response = await authFetch('/.netlify/functions/elevenlabs-stt', {
      method: 'POST',
      body: JSON.stringify({ audio: audioBase64, mimeType }),
      signal: timeoutController.signal,
    });

    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onCallerAbort);

    if (!response.ok) {
      console.warn(`ElevenLabs STT ${response.status} – falling back to OpenAI Whisper`);
      return openAiSTT(audioBase64, mimeType, signal);
    }

    const result = await response.json();
    const text = result.data?.text || result.text || '';
    return text;
  } catch (err) {
    // Re-throw if the CALLER aborted (unmount/navigation)
    if (signal?.aborted) throw err;
    console.warn('ElevenLabs STT failed – falling back to OpenAI Whisper:', (err as Error).message);
    return openAiSTT(audioBase64, mimeType, signal);
  }
}
