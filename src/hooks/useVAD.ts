import { useEffect, useRef, useCallback, useState } from 'react';
import { float32ToWavBlob } from '../lib/audioUtils';

// ─── Config ──────────────────────────────────────────────────────────
export interface VADConfig {
  speechThreshold: number;    // RMS level to consider as speech
  speechStartCount: number;   // Consecutive frames above threshold to start
  silenceEndCount: number;    // Consecutive frames below threshold to end
  preSpeechFrames: number;    // Frames to keep before speech start
  minSpeechFrames: number;    // Minimum speech duration to send (filters noise bursts)
  postTtsDelayMs: number;     // Delay after unpause before VAD resumes (echo protection)
}

export const DEFAULT_VAD_CONFIG: VADConfig = {
  speechThreshold: 0.025,
  speechStartCount: 4,        // ~190ms
  silenceEndCount: 20,         // ~950ms
  preSpeechFrames: 5,          // ~230ms
  minSpeechFrames: 10,         // ~470ms
  postTtsDelayMs: 300,         // Echo-Nachlauf
};

const PROCESSOR_BUFFER = 2048;

// ─── Interface ───────────────────────────────────────────────────────
interface UseVADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: (audioBlob: Blob) => void;
  enabled?: boolean;
  paused?: boolean;
  config?: Partial<VADConfig>;
}

interface UseVADReturn {
  isListening: boolean;
  isSpeechActive: boolean;
  volumeLevel: number;      // 0-1 current RMS (for UI visualization)
  start: () => Promise<void>;
  pause: () => void;
  destroy: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useVAD({
  onSpeechStart,
  onSpeechEnd,
  enabled = true,
  paused = false,
  config: configOverrides,
}: UseVADOptions): UseVADReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeechActive, setIsSpeechActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  // Merge config with defaults
  const config = { ...DEFAULT_VAD_CONFIG, ...configOverrides };
  const configRef = useRef(config);
  configRef.current = config;

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const generationRef = useRef(0);

  const onStartRef = useRef(onSpeechStart);
  const onEndRef = useRef(onSpeechEnd);
  const enabledRef = useRef(enabled);
  const pausedRef = useRef(paused);
  const echoDelayActiveRef = useRef(false);
  const echoDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeRef = useRef(false);
  const speechCountRef = useRef(0);
  const silenceCountRef = useRef(0);
  const speechFrameCountRef = useRef(0);
  const bufferRef = useRef<Float32Array[]>([]);
  const preRef = useRef<Float32Array[]>([]);

  useEffect(() => { onStartRef.current = onSpeechStart; }, [onSpeechStart]);
  useEffect(() => { onEndRef.current = onSpeechEnd; }, [onSpeechEnd]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // When paused changes: update ref, reset state, and handle echo-Nachlauf
  useEffect(() => {
    const wasPaused = pausedRef.current;
    pausedRef.current = paused;

    if (paused) {
      // Entering pause: reset all detection state
      activeRef.current = false;
      speechCountRef.current = 0;
      silenceCountRef.current = 0;
      speechFrameCountRef.current = 0;
      bufferRef.current = [];
      preRef.current = [];
      setIsSpeechActive(false);
      // Clear any pending echo delay
      if (echoDelayTimerRef.current) {
        clearTimeout(echoDelayTimerRef.current);
        echoDelayTimerRef.current = null;
      }
      echoDelayActiveRef.current = false;
    } else if (wasPaused && !paused) {
      // Leaving pause: activate echo-Nachlauf delay
      echoDelayActiveRef.current = true;
      echoDelayTimerRef.current = setTimeout(() => {
        echoDelayActiveRef.current = false;
        echoDelayTimerRef.current = null;
      }, configRef.current.postTtsDelayMs);
    }
  }, [paused]);

  // Cleanup echo delay timer on unmount
  useEffect(() => {
    return () => {
      if (echoDelayTimerRef.current) {
        clearTimeout(echoDelayTimerRef.current);
      }
    };
  }, []);

  const cleanup = useCallback(() => {
    generationRef.current++;
    if (procRef.current) {
      procRef.current.disconnect();
      procRef.current.onaudioprocess = null;
      procRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      ctxRef.current.close();
      ctxRef.current = null;
    }
    activeRef.current = false;
    speechCountRef.current = 0;
    silenceCountRef.current = 0;
    speechFrameCountRef.current = 0;
    bufferRef.current = [];
    preRef.current = [];
    setIsListening(false);
    setIsSpeechActive(false);
    setVolumeLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;

    const myGeneration = generationRef.current;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });

      if (generationRef.current !== myGeneration) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(PROCESSOR_BUFFER, 1, 1);
      procRef.current = processor;

      const mute = ctx.createGain();
      mute.gain.value = 0;

      const sampleRate = ctx.sampleRate;

      processor.onaudioprocess = (e) => {
        // Skip frames when disabled, paused, or in echo delay
        if (!enabledRef.current || pausedRef.current || echoDelayActiveRef.current) return;

        const cfg = configRef.current;
        const input = e.inputBuffer.getChannelData(0);
        const frame = new Float32Array(input);

        // Calculate RMS energy
        let sum = 0;
        for (let i = 0; i < frame.length; i++) sum += frame[i] * frame[i];
        const rms = Math.sqrt(sum / frame.length);

        // Update volume level (clamped to 0-1, normalized)
        setVolumeLevel(Math.min(1, rms / 0.15));

        if (!activeRef.current) {
          // Not speaking: maintain rolling pre-buffer
          preRef.current.push(frame);
          if (preRef.current.length > cfg.preSpeechFrames) preRef.current.shift();

          if (rms > cfg.speechThreshold) {
            speechCountRef.current++;
            if (speechCountRef.current >= cfg.speechStartCount) {
              activeRef.current = true;
              speechFrameCountRef.current = 0;
              setIsSpeechActive(true);
              onStartRef.current?.();
              bufferRef.current = [...preRef.current, frame];
              preRef.current = [];
            }
          } else {
            speechCountRef.current = 0;
          }
        } else {
          // Speaking: accumulate audio
          bufferRef.current.push(frame);
          speechFrameCountRef.current++;

          if (rms < cfg.speechThreshold) {
            silenceCountRef.current++;
            if (silenceCountRef.current >= cfg.silenceEndCount) {
              activeRef.current = false;
              setIsSpeechActive(false);
              const totalSpeechFrames = speechFrameCountRef.current;
              silenceCountRef.current = 0;
              speechCountRef.current = 0;
              speechFrameCountRef.current = 0;

              if (totalSpeechFrames < cfg.minSpeechFrames) {
                bufferRef.current = [];
                return;
              }

              const chunks = bufferRef.current;
              bufferRef.current = [];
              const total = chunks.reduce((n, f) => n + f.length, 0);
              const pcm = new Float32Array(total);
              let off = 0;
              for (const f of chunks) { pcm.set(f, off); off += f.length; }

              const wav = float32ToWavBlob(pcm, sampleRate);
              onEndRef.current?.(wav);
            }
          } else {
            silenceCountRef.current = 0;
          }
        }
      };

      source.connect(processor);
      processor.connect(mute);
      mute.connect(ctx.destination);

      setIsListening(true);
    } catch (err) {
      console.error('VAD initialization failed:', err);
      if (generationRef.current === myGeneration) {
        cleanup();
      }
    }
  }, [cleanup]);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled) {
      start();
    } else {
      cleanup();
    }
    return cleanup;
  }, [enabled, start, cleanup]);

  return {
    isListening,
    isSpeechActive,
    volumeLevel,
    start,
    pause: cleanup,
    destroy: cleanup,
  };
}
