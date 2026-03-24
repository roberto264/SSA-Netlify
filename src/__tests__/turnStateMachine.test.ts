import { describe, it, expect } from 'vitest';
import { turnReducer, shouldPauseVAD, isBusy } from '../lib/turnStateMachine';

describe('turnReducer', () => {
  // Happy path transitions
  it('idle → listening on SPEECH_START', () => {
    expect(turnReducer('idle', { type: 'SPEECH_START' })).toBe('listening');
  });

  it('listening → transcribing on SPEECH_END', () => {
    expect(turnReducer('listening', { type: 'SPEECH_END' })).toBe('transcribing');
  });

  it('transcribing → thinking on TRANSCRIPTION_DONE', () => {
    expect(turnReducer('transcribing', { type: 'TRANSCRIPTION_DONE' })).toBe('thinking');
  });

  it('idle → thinking on TRANSCRIPTION_DONE (text input path)', () => {
    expect(turnReducer('idle', { type: 'TRANSCRIPTION_DONE' })).toBe('thinking');
  });

  it('transcribing → idle on TRANSCRIPTION_FAIL', () => {
    expect(turnReducer('transcribing', { type: 'TRANSCRIPTION_FAIL' })).toBe('idle');
  });

  it('thinking → speaking on RESPONSE_READY', () => {
    expect(turnReducer('thinking', { type: 'RESPONSE_READY' })).toBe('speaking');
  });

  it('thinking → idle on RESPONSE_FAIL', () => {
    expect(turnReducer('thinking', { type: 'RESPONSE_FAIL' })).toBe('idle');
  });

  it('speaking → idle on TTS_DONE', () => {
    expect(turnReducer('speaking', { type: 'TTS_DONE' })).toBe('idle');
  });

  it('speaking → idle on TTS_FAIL', () => {
    expect(turnReducer('speaking', { type: 'TTS_FAIL' })).toBe('idle');
  });

  // Analysis flow
  it('any → analyzing on ANALYZE_START', () => {
    expect(turnReducer('idle', { type: 'ANALYZE_START' })).toBe('analyzing');
    expect(turnReducer('speaking', { type: 'ANALYZE_START' })).toBe('analyzing');
  });

  it('analyzing → ended on ANALYZE_DONE', () => {
    expect(turnReducer('analyzing', { type: 'ANALYZE_DONE' })).toBe('ended');
  });

  it('any → ended on END', () => {
    expect(turnReducer('idle', { type: 'END' })).toBe('ended');
  });

  it('any → idle on RESET', () => {
    expect(turnReducer('ended', { type: 'RESET' })).toBe('idle');
    expect(turnReducer('speaking', { type: 'RESET' })).toBe('idle');
  });

  // Invalid transitions (should no-op)
  it('ignores SPEECH_START when not idle', () => {
    expect(turnReducer('thinking', { type: 'SPEECH_START' })).toBe('thinking');
    expect(turnReducer('speaking', { type: 'SPEECH_START' })).toBe('speaking');
  });

  it('ignores SPEECH_END when not listening', () => {
    expect(turnReducer('idle', { type: 'SPEECH_END' })).toBe('idle');
  });

  it('ignores RESPONSE_READY when not thinking', () => {
    expect(turnReducer('idle', { type: 'RESPONSE_READY' })).toBe('idle');
  });

  it('ignores TTS_DONE when not speaking', () => {
    expect(turnReducer('idle', { type: 'TTS_DONE' })).toBe('idle');
  });

  it('ignores ANALYZE_DONE when not analyzing', () => {
    expect(turnReducer('idle', { type: 'ANALYZE_DONE' })).toBe('idle');
  });
});

describe('shouldPauseVAD', () => {
  it('VAD active during idle and listening', () => {
    expect(shouldPauseVAD('idle')).toBe(false);
    expect(shouldPauseVAD('listening')).toBe(false);
  });

  it('VAD paused during processing states', () => {
    expect(shouldPauseVAD('transcribing')).toBe(true);
    expect(shouldPauseVAD('thinking')).toBe(true);
    expect(shouldPauseVAD('speaking')).toBe(true);
    expect(shouldPauseVAD('analyzing')).toBe(true);
    expect(shouldPauseVAD('ended')).toBe(true);
  });
});

describe('isBusy', () => {
  it('not busy when idle or ended', () => {
    expect(isBusy('idle')).toBe(false);
    expect(isBusy('ended')).toBe(false);
  });

  it('busy during all processing states', () => {
    expect(isBusy('listening')).toBe(true);
    expect(isBusy('transcribing')).toBe(true);
    expect(isBusy('thinking')).toBe(true);
    expect(isBusy('speaking')).toBe(true);
    expect(isBusy('analyzing')).toBe(true);
  });
});
