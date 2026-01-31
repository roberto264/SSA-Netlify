import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecordingOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
}

export function useVoiceRecording({ onTranscription, onError }: UseVoiceRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          try {
            const response = await fetch('/.netlify/functions/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 }),
            });
            const data = await response.json();
            if (data.text) {
              onTranscription?.(data.text);
            }
          } catch (error) {
            onError?.(error as Error);
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      onError?.(error as Error);
    }
  }, [onTranscription, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [isRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
  };
}
