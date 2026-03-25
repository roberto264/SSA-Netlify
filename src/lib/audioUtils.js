/**
 * Audio utility functions for VAD + ElevenLabs integration
 */

/** Convert Float32Array PCM data to a WAV Blob */
export function float32ToWavBlob(pcm, sampleRate = 16000) {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit
  const dataLength = pcm.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataLength, true);

  // PCM samples (clamp to int16 range)
  let offset = 44;
  for (let i = 0; i < pcm.length; i++) {
    const s = Math.max(-1, Math.min(1, pcm[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    offset += 2;
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

/** Convert a Blob to a base64-encoded string */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result;
      // Strip the data:...;base64, prefix
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Play base64-encoded audio (mp3/wav) and return the HTMLAudioElement + completion promise.
 *  Pass an AbortSignal to stop playback early (promise resolves on abort, never rejects). */
export function playBase64Audio(base64, mimeType = 'audio/mpeg', signal) {
  const audio = new Audio(`data:${mimeType};base64,${base64}`);

  const promise = new Promise((resolve) => {
    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      signal?.removeEventListener('abort', onAbort);
    };

    const onAbort = () => {
      audio.pause();
      audio.src = '';
      cleanup();
      resolve();
    };

    if (signal?.aborted) { onAbort(); return; }

    audio.onended = () => { cleanup(); resolve(); };
    audio.onerror = () => { cleanup(); resolve(); };
    signal?.addEventListener('abort', onAbort, { once: true });
  });

  if (!signal?.aborted) {
    audio.play().catch(() => {});
  }

  return { audio, promise };
}
