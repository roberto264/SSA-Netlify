import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Loader2, Mic, Send, X, Star, TrendingUp, AlertCircle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRollenspiele } from '../lib/database';
import { getPersonaById } from '../lib/contentLoader';

// Skill Rating Component
function SkillRating({ label, value, max = 5 }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-600">{label}</span>
      <div className="flex gap-1">
        {[...Array(max)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
          />
        ))}
      </div>
    </div>
  );
}

// Feedback Modal Component
function FeedbackModal({ feedback, persona, onClose, onSave, isSaving }) {
  if (!feedback) return null;

  const ratingColor = {
    schwach: 'bg-red-100 text-red-700 border-red-200',
    mittel: 'bg-amber-100 text-amber-700 border-amber-200',
    gut: 'bg-green-100 text-green-700 border-green-200'
  };

  const ratingEmoji = {
    schwach: '😔',
    mittel: '🤔',
    gut: '🎉'
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{ratingEmoji[feedback.gesamtbewertung] || '📊'}</span>
              <div>
                <h2 className="font-bold text-lg">Gesprächsanalyse</h2>
                <p className="text-indigo-100 text-sm">Gespräch mit {persona.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div className="p-5 border-b">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-slate-500">Gesamtbewertung:</span>
            <span className={`px-4 py-1.5 rounded-full font-semibold capitalize border ${ratingColor[feedback.gesamtbewertung]}`}>
              {feedback.gesamtbewertung}
            </span>
          </div>
        </div>

        {/* Feedback Text */}
        <div className="p-5 border-b bg-slate-50">
          <p className="text-slate-700 text-sm leading-relaxed">{feedback.feedback}</p>
        </div>

        {/* Soft Skills */}
        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            Soft Skills Bewertung
          </h3>
          <div className="divide-y divide-slate-100">
            <SkillRating label="Gesprächsführung" value={feedback.gesprachsfuhrung} />
            <SkillRating label="Aktives Zuhören" value={feedback.aktives_zuhoren} />
            <SkillRating label="Klarheit" value={feedback.klarheit} />
            <SkillRating label="Einwandbehandlung" value={feedback.einwand_behandlung} />
            <SkillRating label="Empathie" value={feedback.empathie} />
            <SkillRating label="Überzeugungskraft" value={feedback.uberzeugungskraft} />
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="p-5 grid grid-cols-2 gap-4">
          {feedback.staerken && feedback.staerken.length > 0 && (
            <div>
              <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4" />
                Stärken
              </h4>
              <ul className="space-y-1">
                {feedback.staerken.map((s, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.verbesserungen && feedback.verbesserungen.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4" />
                Verbesserungen
              </h4>
              <ul className="space-y-1">
                {feedback.verbesserungen.map((v, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-5 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Speichern...
              </>
            ) : (
              'Speichern & Beenden'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function VoiceChatPage() {
  const { personaId } = useParams();
  const navigate = useNavigate();
  const persona = getPersonaById(personaId);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const { saveSession } = useRollenspiele();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (persona) {
      setMessages([{ role: 'assistant', content: `Guten Tag, mein Name ist ${persona.firstName}. Wie kann ich Ihnen helfen?` }]);
    }
  }, [persona]);

  if (!persona) { navigate('/roleplay'); return null; }

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputText('');
    setIsProcessing(true);
    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }], systemPrompt: persona.systemPrompt })
      });
      const data = await response.json();

      // Check for errors
      if (data.error) {
        console.error('API Error:', data.error);
        setMessages(prev => [...prev, { role: 'assistant', content: `Fehler: ${data.error.message || data.error}` }]);
        return;
      }

      if (!data.choices || !data.choices[0]) {
        console.error('Invalid response:', data);
        setMessages(prev => [...prev, { role: 'assistant', content: 'Entschuldigung, ich konnte keine Antwort generieren.' }]);
        return;
      }

      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      // TTS
      if (ttsEnabled) {
        try {
          const ttsResponse = await fetch('/.netlify/functions/tts', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reply, voice: persona.voiceType || 'onyx' })
          });
          const ttsData = await ttsResponse.json();
          if (ttsData.audio) {
            const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
            new Audio(URL.createObjectURL(audioBlob)).play();
          }
        } catch (ttsError) {
          console.error('TTS Error:', ttsError);
          // TTS failure is not critical, continue without audio
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Verbindungsfehler: ${error.message}` }]);
    }
    finally { setIsProcessing(false); }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 64;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      // Start visualization loop
      const updateLevels = () => {
        if (!analyzerRef.current) return;
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);

        // Take 20 samples for the bars
        const levels = [];
        const step = Math.floor(dataArray.length / 20);
        for (let i = 0; i < 20; i++) {
          levels.push(dataArray[i * step] / 255);
        }
        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();

      // Find a supported MIME type for recording
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav'
      ];
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }
      console.log('Using MIME type:', selectedMimeType || 'default');

      const options = selectedMimeType ? { mimeType: selectedMimeType } : {};
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        // Stop visualization
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevels(new Array(20).fill(0));

        const actualMimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        console.log('Actual recorded MIME type:', actualMimeType);
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          setIsTranscribing(true);
          try {
            const response = await fetch('/.netlify/functions/transcribe', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64, mimeType: actualMimeType })
            });
            const data = await response.json();
            if (data.text) {
              sendMessage(data.text);
            } else if (data.error) {
              console.error('Transcription error:', data.error);
            }
          } catch (error) {
            console.error('Transcribe fetch error:', error);
          } finally {
            setIsTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      analyzerRef.current = null;
    }
  };

  const analyzeConversation = async () => {
    // Need at least 2 user messages for meaningful analysis
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length < 2) {
      // Too short, skip analysis
      await saveSessionAndNavigate(null);
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/.netlify/functions/analyze-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          personaName: persona.name,
          personaSituation: persona.caseStudy?.situation || persona.summary
        })
      });
      const data = await response.json();
      setFeedback(data);
      setShowFeedback(true);
    } catch (error) {
      console.error('Analysis error:', error);
      // If analysis fails, just save without feedback
      await saveSessionAndNavigate(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveSessionAndNavigate = async (feedbackData) => {
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

      await saveSession(
        persona.id,
        messages,
        feedbackData?.gesamtbewertung || null,
        feedbackData?.feedback || null,
        softSkills
      );
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
      navigate('/');
    }
  };

  const endSession = async () => {
    await analyzeConversation();
  };

  const handleSaveFeedback = () => {
    saveSessionAndNavigate(feedback);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
            {persona.image}
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">{persona.name}</h2>
            <p className="text-xs text-slate-500">{persona.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              ttsEnabled ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
            title={ttsEnabled ? 'Sprache ausschalten' : 'Sprache einschalten'}
          >
            {ttsEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <button
            onClick={endSession}
            disabled={isAnalyzing}
            className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analysiere...
              </>
            ) : (
              'Gespräch beenden'
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl card-shadow p-3 sm:p-4 overflow-y-auto mb-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p className="text-lg mb-2">{persona.image}</p>
            <p>Das Gespräch beginnt...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-md">
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-slate-500" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl card-shadow p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 ${
              isRecording ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isRecording && (
              <div className="pulse-ring absolute inset-0 bg-red-500 rounded-full"></div>
            )}
            <Mic className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
          </button>

          {/* Audio Waveform or Input */}
          {isRecording ? (
            <div className="flex-1 h-12 bg-red-50 rounded-xl flex items-center justify-center gap-[2px] px-4">
              {audioLevels.map((level, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full transition-all duration-75"
                  style={{
                    height: `${Math.max(4, level * 40)}px`,
                  }}
                />
              ))}
            </div>
          ) : isTranscribing ? (
            <div className="flex-1 h-12 bg-indigo-50 rounded-xl flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-sm text-indigo-600">Wird transkribiert...</span>
            </div>
          ) : (
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
              placeholder="Nachricht eingeben..."
              className="flex-1 px-3 sm:px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 transition-colors text-sm sm:text-base"
            />
          )}

          <button
            onClick={() => sendMessage(inputText)}
            disabled={isProcessing || !inputText.trim() || isRecording || isTranscribing}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          {isRecording ? 'Aufnahme läuft... Loslassen zum Senden' : 'Halte den Mikrofon-Button gedrückt zum Aufnehmen'}
        </p>
      </div>

      {/* Feedback Modal */}
      {showFeedback && feedback && (
        <FeedbackModal
          feedback={feedback}
          persona={persona}
          onClose={() => setShowFeedback(false)}
          onSave={handleSaveFeedback}
          isSaving={isSaving}
        />
      )}
    </main>
  );
}
