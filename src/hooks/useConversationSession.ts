/**
 * useConversationSession — shared conversation logic for VoiceChatPage & ZenModePage.
 *
 * Manages: Turn state machine, chat API, TTS/STT, analysis, session save, cleanup.
 * Pages only need to render UI based on returned state.
 */
import { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRollenspiele } from '../lib/database';
import { getPersonaById } from '../lib/contentLoader';
import { blobToBase64, playBase64Audio } from '../lib/audioUtils';
import { elevenLabsTTS, elevenLabsSTT } from '../lib/voiceConfig';
import { authFetch } from '../lib/api';
import { turnReducer, shouldPauseVAD, type TurnState } from '../lib/turnStateMachine';
import type { ZenFeedback, Persona } from '../types/content';

// ─── Types ───────────────────────────────────────────────────────────
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UseConversationOptions {
  personaId: string;
  mode: 'practice' | 'zen';
  ttsEnabled?: boolean;
  onConversationEnd?: () => void;
}

export interface UseConversationReturn {
  // State
  turnState: TurnState;
  messages: Message[];
  feedback: ZenFeedback | null;
  showFeedback: boolean;
  isAnalyzing: boolean;
  isSaving: boolean;
  conversationEnded: boolean;
  persona: Persona | null;

  // Actions
  sendTextMessage: (text: string) => Promise<void>;
  handleSpeechEnd: (blob: Blob) => Promise<void>;
  handleSpeechStart: () => void;
  endSession: () => Promise<void>;
  stopEverything: () => void;
  saveAndNavigate: (feedbackData: ZenFeedback | null) => Promise<void>;

  // VAD props (derived from turnState)
  vadEnabled: boolean;
  vadPaused: boolean;

  // Metrics (Zen mode)
  interruptionCount: number;
  sessionStartTime: number;

  // Status
  statusText: string;
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useConversationSession({
  personaId,
  mode,
  ttsEnabled = true,
  onConversationEnd,
}: UseConversationOptions): UseConversationReturn {
  const navigate = useNavigate();
  const persona = getPersonaById(personaId);

  // Turn state machine
  const [turnState, dispatch] = useReducer(turnReducer, 'idle');

  // Conversation state
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationEnded, setConversationEnded] = useState(false);
  const [statusText, setStatusText] = useState(
    mode === 'zen' ? 'Sprich einfach los...' : 'Mikrofon wird initialisiert...'
  );

  // Analysis & save state
  const [feedback, setFeedback] = useState<ZenFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const messagesRef = useRef(messages);
  const conversationEndedRef = useRef(false);
  const turnStateRef = useRef(turnState);
  const greetingPlayedRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController>(new AbortController());
  const ttsAbortRef = useRef<AbortController | null>(null);
  const interruptionCountRef = useRef(0);
  const isSendingRef = useRef(false);
  const [sessionStartTime] = useState<number>(Date.now());

  const { saveSession } = useRollenspiele();

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { conversationEndedRef.current = conversationEnded; }, [conversationEnded]);
  useEffect(() => { turnStateRef.current = turnState; }, [turnState]);

  // Master cleanup on unmount (Strict Mode safe: reset spent AbortController on mount)
  useEffect(() => {
    // On (re-)mount: if the controller was aborted by a previous cleanup cycle, replace it
    if (abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController();
    }
    // Reset greeting guard so it retries after Strict Mode remount
    greetingPlayedRef.current = false;

    return () => {
      abortControllerRef.current.abort();
      ttsAbortRef.current?.abort();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      }
    };
  }, []);

  // ─── TTS with mutex ──────────────────────────────────────────────
  const playTTS = useCallback(async (text: string, voice: string): Promise<void> => {
    // Abort previous TTS and clean up before starting new one
    if (ttsAbortRef.current) {
      ttsAbortRef.current.abort();
      ttsAbortRef.current = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }

    const ttsController = new AbortController();
    ttsAbortRef.current = ttsController;
    const signal = ttsController.signal;

    try {
      const audioBase64 = await elevenLabsTTS(text, voice, signal);
      if (signal.aborted) return;

      const { audio, promise } = playBase64Audio(audioBase64, 'audio/mpeg', signal);
      currentAudioRef.current = audio;
      dispatch({ type: 'RESPONSE_READY' });
      if (mode === 'zen') setStatusText('Persona spricht...');
      await promise;
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('TTS Error:', error);
    } finally {
      // Only clean up if this is still the active TTS controller
      if (ttsAbortRef.current === ttsController) {
        currentAudioRef.current = null;
        dispatch({ type: 'TTS_DONE' });
        ttsAbortRef.current = null;
      }
    }
  }, [mode]);

  // ─── Send message (chat API + TTS) ────────────────────────────────
  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim() || conversationEndedRef.current) return;
    // Lock to prevent double-sends (VAD + manual send race condition)
    if (isSendingRef.current) return;
    // Prevent sending during active turn states (use ref for fresh value)
    const state = turnStateRef.current;
    if (state !== 'idle' && state !== 'listening' && state !== 'transcribing') return;
    isSendingRef.current = true;

    const currentMessages = [...messagesRef.current, { role: 'user' as const, content: text }];
    setMessages(currentMessages);
    dispatch({ type: 'TRANSCRIPTION_DONE' }); // Skip to thinking

    if (mode === 'zen') setStatusText('Denkt nach...');

    try {
      const response = await authFetch('/.netlify/functions/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: currentMessages,
          systemPrompt: mode === 'zen'
            ? (persona!.zenModePrompt || persona!.systemPrompt)
            : persona!.systemPrompt,
          maxTokens: mode === 'zen' ? 200 : 150  // Reduced for faster responses
        }),
        signal: abortControllerRef.current.signal,
      });
      const result = await response.json();

      if (!result.ok || !result.data?.choices?.[0]) {
        console.error('API Error:', result.error || 'Invalid response');
        dispatch({ type: 'RESPONSE_FAIL' });
        if (mode === 'practice') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Fehler: ${result.error?.message || 'Keine Antwort'}`
          }]);
        } else {
          setStatusText('Fehler - versuche es erneut');
        }
        return;
      }

      const reply = result.data.choices[0].message.content;
      const hasEnded = result.data.conversationEnded;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // TTS playback
      if (ttsEnabled || mode === 'zen') {
        await playTTS(reply, persona!.voiceType || 'onyx');
      } else {
        // No TTS — skip to idle
        dispatch({ type: 'RESPONSE_READY' });
        dispatch({ type: 'TTS_DONE' });
      }

      // Handle conversation end (zen mode)
      if (hasEnded && mode === 'zen') {
        setConversationEnded(true);
        setStatusText('Gespräch beendet - Analyse läuft...');
        onConversationEnd?.();
        await runAnalysis();
      } else if (mode === 'zen') {
        setStatusText('Sprich einfach los...');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('Error:', error);
      dispatch({ type: 'RESPONSE_FAIL' });
      if (mode === 'practice') {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Verbindungsfehler: ${(error as Error).message}`
        }]);
      } else {
        setStatusText('Verbindungsfehler - versuche es erneut');
      }
    } finally {
      isSendingRef.current = false;
    }
  }, [persona, ttsEnabled, mode, playTTS, onConversationEnd]);

  // ─── VAD callbacks ────────────────────────────────────────────────
  const handleSpeechStart = useCallback(() => {
    // Zen mode: count interruptions if persona is speaking
    if (mode === 'zen' && turnStateRef.current === 'speaking') {
      ttsAbortRef.current?.abort();
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.src = '';
        currentAudioRef.current = null;
      }
      interruptionCountRef.current += 1;
      // Transition state from 'speaking' to 'idle' so SPEECH_START can work
      dispatch({ type: 'TTS_DONE' });
    }
    dispatch({ type: 'SPEECH_START' });
  }, [mode]);

  const handleSpeechEnd = useCallback(async (audioBlob: Blob) => {
    if (conversationEndedRef.current) return;
    // Only process if we're in listening state (or idle for edge cases)
    const state = turnStateRef.current;
    if (state !== 'listening' && state !== 'idle') return;

    dispatch({ type: 'SPEECH_END' });
    if (mode === 'zen') setStatusText('Wird transkribiert...');

    try {
      const base64 = await blobToBase64(audioBlob);
      const text = await elevenLabsSTT(base64, 'audio/wav', abortControllerRef.current.signal);
      if (text && text.trim()) {
        sendTextMessage(text);
      } else {
        dispatch({ type: 'TRANSCRIPTION_FAIL' });
        if (mode === 'zen') setStatusText('Sprich einfach los...');
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('STT Error:', error);
      dispatch({ type: 'TRANSCRIPTION_FAIL' });
      if (mode === 'zen') setStatusText('Fehler - versuche es erneut');
    }
  }, [sendTextMessage, mode]);

  // ─── Greeting ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!persona || greetingPlayedRef.current) return;
    greetingPlayedRef.current = true;

    // Zen mode: Customer-appropriate greeting (realistic conversation)
    // Practice mode: Neutral greeting for training scenarios
    const greeting = mode === 'zen'
      ? `Guten Tag! Ich habe gehört, Sie beraten zu Solaranlagen. Meine Nachbarn haben vor kurzem eine installiert, und jetzt überlege ich auch. Können Sie mir helfen?`
      : `Guten Tag, mein Name ist ${persona.firstName}.`;
    setMessages([{ role: 'assistant', content: greeting }]);

    if (mode === 'zen') {
      playTTS(greeting, persona.voiceType || 'onyx').then(() => {
        setStatusText('Sprich einfach los...');
      });
    }
  }, [persona, mode, playTTS]);

  // ─── Analysis ─────────────────────────────────────────────────────
  const runAnalysis = useCallback(async () => {
    const currentMessages = messagesRef.current;
    const userMessages = currentMessages.filter(m => m.role === 'user');
    if (userMessages.length < 2) {
      await saveAndNavigateInternal(null);
      return;
    }

    setIsAnalyzing(true);
    dispatch({ type: 'ANALYZE_START' });

    const body: Record<string, unknown> = {
      messages: currentMessages,
      personaName: persona!.name,
      personaSituation: persona!.caseStudy?.situation || persona!.summary,
      mode,
    };

    if (mode === 'zen') {
      body.durationSeconds = Math.round((Date.now() - sessionStartTime) / 1000);
      body.exchangeCount = userMessages.length;
      body.interruptionCount = interruptionCountRef.current;
    }

    try {
      const response = await authFetch('/.netlify/functions/analyze', {
        method: 'POST',
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });
      const result = await response.json();
      const analysisData = (result.data || result) as ZenFeedback;
      setFeedback(analysisData);
      setShowFeedback(true);
      dispatch({ type: 'ANALYZE_DONE' });
    } catch (error) {
      if ((error as Error).name === 'AbortError') return;
      console.error('Analysis error:', error);
      dispatch({ type: 'ANALYZE_DONE' });
      await saveAndNavigateInternal(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [persona, mode, sessionStartTime]);

  // ─── Save & Navigate ──────────────────────────────────────────────
  const saveAndNavigateInternal = useCallback(async (feedbackData: ZenFeedback | null) => {
    setIsSaving(true);
    try {
      const softSkills = feedbackData ? {
        gesprachsfuhrung: feedbackData.gesprachsfuhrung,
        aktives_zuhoren: feedbackData.aktives_zuhoren,
        klarheit: feedbackData.klarheit,
        einwand_behandlung: feedbackData.einwand_behandlung,
        empathie: feedbackData.empathie,
        uberzeugungskraft: feedbackData.uberzeugungskraft
      } : {};

      const zenData = (mode === 'zen' && feedbackData) ? {
        duration_seconds: feedbackData.duration_seconds,
        exchange_count: feedbackData.exchange_count,
        speaking_ratio: feedbackData.speaking_ratio,
        user_question_count: feedbackData.user_question_count,
        user_question_quality: feedbackData.user_question_quality,
        sentiment_score: feedbackData.sentiment_score,
        tonalitaet: feedbackData.tonalitaet,
        interruption_count: feedbackData.interruption_count,
        dem_kunden_reingeredet: feedbackData.dem_kunden_reingeredet
      } : null;

      const args: unknown[] = [
        persona!.id,
        messagesRef.current,
        feedbackData?.gesamtbewertung || null,
        feedbackData?.feedback || null,
        softSkills,
      ];
      if (zenData) args.push(zenData);

      await (saveSession as (...args: unknown[]) => Promise<void>)(...args);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
      navigate('/');
    }
  }, [persona, mode, navigate, saveSession]);

  // ─── End Session ──────────────────────────────────────────────────
  const endSession = useCallback(async () => {
    // Reset master controller if spent (e.g. after stopEverything / emergency exit)
    if (abortControllerRef.current.signal.aborted) {
      abortControllerRef.current = new AbortController();
    }
    // Stop TTS but keep master controller alive for analysis
    ttsAbortRef.current?.abort();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    dispatch({ type: 'TTS_DONE' });
    await runAnalysis();
  }, [runAnalysis]);

  // ─── Stop Everything (emergency) ─────────────────────────────────
  const stopEverything = useCallback(() => {
    abortControllerRef.current.abort();
    ttsAbortRef.current?.abort();
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    dispatch({ type: 'RESET' });
  }, []);

  // Public saveAndNavigate (wraps internal)
  const saveAndNavigate = useCallback(async (feedbackData: ZenFeedback | null) => {
    await saveAndNavigateInternal(feedbackData);
  }, [saveAndNavigateInternal]);

  // ─── Derived state ────────────────────────────────────────────────
  const vadPaused = shouldPauseVAD(turnState);
  const vadEnabled = mode === 'zen'
    ? !conversationEnded && !isAnalyzing
    : true; // practice: controlled by micEnabled in the page

  return {
    turnState,
    messages,
    feedback,
    showFeedback,
    isAnalyzing,
    isSaving,
    conversationEnded,
    persona: persona || null,

    sendTextMessage,
    handleSpeechEnd,
    handleSpeechStart,
    endSession,
    stopEverything,
    saveAndNavigate,

    vadEnabled,
    vadPaused,

    interruptionCount: interruptionCountRef.current,
    sessionStartTime,

    statusText,
  };
}
