import { useState, useRef, useEffect, useCallback } from 'react';
import { useAudioProgress } from '../lib/database';

interface UseAudioPlayerOptions {
  modulId: number;
  audioUrl: string;
}

export function useAudioPlayer({ modulId, audioUrl }: UseAudioPlayerOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { audioProgress, saveAudioProgress, getAudioProgress } = useAudioProgress();

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);

      const savedPosition = audioProgress[modulId] || 0;
      if (savedPosition > 0) {
        audio.currentTime = savedPosition;
        setCurrentTime(savedPosition);
      }
    };

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      saveAudioProgress(modulId, 0);
    };
    audio.onerror = () => setError('Audio konnte nicht geladen werden');
    audio.onwaiting = () => setIsBuffering(true);
    audio.oncanplay = () => setIsBuffering(false);

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl, modulId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        if (audioRef.current) {
          saveAudioProgress(modulId, audioRef.current.currentTime);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, modulId, saveAudioProgress]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      saveAudioProgress(modulId, audioRef.current.currentTime);
    } else {
      await audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, modulId, saveAudioProgress]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, time));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveAudioProgress(modulId, newTime);
  }, [duration, modulId, saveAudioProgress]);

  const skip = useCallback((seconds: number) => {
    if (!audioRef.current) return;
    seek(audioRef.current.currentTime + seconds);
  }, [seek]);

  return {
    isPlaying,
    isLoading,
    isBuffering,
    currentTime,
    duration,
    error,
    togglePlay,
    seek,
    skip,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };
}
