/**
 * AudioManager — centralized audio playback with abort support.
 * Replaces scattered currentAudioRef + playBase64Audio() calls.
 */

export class AudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAbort: AbortController | null = null;

  /**
   * Play base64-encoded audio. Stops any currently playing audio first.
   * Returns a promise that resolves when playback completes or is aborted.
   */
  async play(base64: string, options?: {
    mimeType?: string;
    signal?: AbortSignal;
  }): Promise<void> {
    // Stop any current playback
    this.stop();

    const mimeType = options?.mimeType || 'audio/mpeg';
    const callerSignal = options?.signal;

    // Create internal abort controller
    const abortController = new AbortController();
    this.currentAbort = abortController;

    // Forward caller signal to our internal abort
    const onCallerAbort = () => abortController.abort();
    callerSignal?.addEventListener('abort', onCallerAbort, { once: true });

    const audio = new Audio(`data:${mimeType};base64,${base64}`);
    this.currentAudio = audio;

    return new Promise<void>((resolve) => {
      const signal = abortController.signal;

      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
        callerSignal?.removeEventListener('abort', onCallerAbort);
        signal.removeEventListener('abort', onAbort);
        if (this.currentAudio === audio) {
          this.currentAudio = null;
          this.currentAbort = null;
        }
      };

      const onAbort = () => {
        audio.pause();
        audio.src = '';
        cleanup();
        resolve();
      };

      if (signal.aborted) { onAbort(); return; }

      audio.onended = () => { cleanup(); resolve(); };
      audio.onerror = () => { cleanup(); console.error('Audio playback failed'); resolve(); };
      signal.addEventListener('abort', onAbort, { once: true });

      audio.play().catch((err) => {
        console.error('Audio play error:', err);
        cleanup();
        resolve();
      });
    });
  }

  /** Stop current playback immediately. */
  stop(): void {
    if (this.currentAbort) {
      this.currentAbort.abort();
      this.currentAbort = null;
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio = null;
    }
  }

  /** Whether audio is currently playing. */
  get isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}
