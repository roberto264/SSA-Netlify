/**
 * Turn State Machine for voice conversation flow.
 * Replaces boolean chaos (isProcessing, isSpeaking, isTranscribing, etc.)
 * with a single state that transitions through well-defined actions.
 *
 * TurnState: 'idle' | 'listening' | 'transcribing' | 'thinking' | 'speaking' | 'analyzing' | 'ended'
 *
 * TurnAction types:
 *   'SPEECH_START' | 'SPEECH_END' | 'TRANSCRIPTION_DONE' | 'TRANSCRIPTION_FAIL'
 *   'RESPONSE_READY' | 'RESPONSE_FAIL' | 'TTS_DONE' | 'TTS_FAIL'
 *   'ANALYZE_START' | 'ANALYZE_DONE' | 'END' | 'RESET'
 */

/**
 * Pure reducer: given current state + action, returns next state.
 * Invalid transitions return current state (no-op).
 */
export function turnReducer(state, action) {
  switch (action.type) {
    case 'SPEECH_START':
      return state === 'idle' ? 'listening' : state;

    case 'SPEECH_END':
      return state === 'listening' ? 'transcribing' : state;

    case 'TRANSCRIPTION_DONE':
      // From transcribing (VAD path) or idle (direct text input)
      return (state === 'transcribing' || state === 'idle') ? 'thinking' : state;

    case 'TRANSCRIPTION_FAIL':
      return state === 'transcribing' ? 'idle' : state;

    case 'RESPONSE_READY':
      return state === 'thinking' ? 'speaking' : state;

    case 'RESPONSE_FAIL':
      return state === 'thinking' ? 'idle' : state;

    case 'TTS_DONE':
    case 'TTS_FAIL':
      return state === 'speaking' ? 'idle' : state;

    case 'ANALYZE_START':
      return 'analyzing';

    case 'ANALYZE_DONE':
      return state === 'analyzing' ? 'ended' : state;

    case 'END':
      return 'ended';

    case 'RESET':
      return 'idle';

    default:
      return state;
  }
}

/** Derived: should VAD be paused?
 *  Active during: idle (detect speech start), listening (detect speech end)
 *  Paused during: transcribing, thinking, speaking (echo protection), analyzing, ended
 */
export function shouldPauseVAD(state) {
  return state !== 'idle' && state !== 'listening';
}

/** Derived: is the system busy processing? (not idle or ended) */
export function isBusy(state) {
  return state !== 'idle' && state !== 'ended';
}
