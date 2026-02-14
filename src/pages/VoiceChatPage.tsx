import { useState } from 'react';
import { Loader2, Mic, MicOff, Send, Star, TrendingUp, AlertCircle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useConversationSession } from '../hooks/useConversationSession';
import { useVAD } from '../hooks/useVAD';
import type { ZenFeedback } from '../types/content';

// ─── Skill Rating Component ─────────────────────────────────────────
function SkillRating({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
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

// ─── Feedback Modal Component ───────────────────────────────────────
function FeedbackModal({ feedback, personaName, onSave, isSaving }: {
  feedback: ZenFeedback;
  personaName: string;
  onSave: () => void;
  isSaving: boolean;
}) {
  const ratingColor: Record<string, string> = {
    schwach: 'bg-red-100 text-red-700 border-red-200',
    mittel: 'bg-amber-100 text-amber-700 border-amber-200',
    gut: 'bg-green-100 text-green-700 border-green-200'
  };
  const ratingEmoji: Record<string, string> = {
    schwach: '\u{1F614}', mittel: '\u{1F914}', gut: '\u{1F389}'
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ratingEmoji[feedback.gesamtbewertung] || '\u{1F4CA}'}</span>
            <div>
              <h2 className="font-bold text-lg">Gesprachsanalyse</h2>
              <p className="text-indigo-100 text-sm">Gesprach mit {personaName}</p>
            </div>
          </div>
        </div>

        <div className="p-5 border-b">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-slate-500">Gesamtbewertung:</span>
            <span className={`px-4 py-1.5 rounded-full font-semibold capitalize border ${ratingColor[feedback.gesamtbewertung]}`}>
              {feedback.gesamtbewertung}
            </span>
          </div>
        </div>

        <div className="p-5 border-b bg-slate-50">
          <p className="text-slate-700 text-sm leading-relaxed">{feedback.feedback}</p>
        </div>

        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" /> Soft Skills Bewertung
          </h3>
          <div className="divide-y divide-slate-100">
            <SkillRating label="Gesprachsfuhrung" value={feedback.gesprachsfuhrung} />
            <SkillRating label="Aktives Zuhoren" value={feedback.aktives_zuhoren} />
            <SkillRating label="Klarheit" value={feedback.klarheit} />
            <SkillRating label="Einwandbehandlung" value={feedback.einwand_behandlung} />
            <SkillRating label="Empathie" value={feedback.empathie} />
            <SkillRating label="Uberzeugungskraft" value={feedback.uberzeugungskraft} />
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 gap-4">
          {feedback.staerken?.length > 0 && (
            <div>
              <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1.5 text-sm">
                <CheckCircle className="w-4 h-4" /> Starken
              </h4>
              <ul className="space-y-1">
                {feedback.staerken.map((s, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-green-500 mt-0.5">&bull;</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {feedback.verbesserungen?.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4" /> Verbesserungen
              </h4>
              <ul className="space-y-1">
                {feedback.verbesserungen.map((v, i) => (
                  <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">&bull;</span>{v}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-5 bg-slate-50 rounded-b-2xl flex gap-3">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Speichern...</>
            ) : (
              'Speichern & Beenden'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── VoiceChatPage ──────────────────────────────────────────────────
export function VoiceChatPage() {
  const { personaId } = useParams();
  const navigate = useNavigate();

  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [inputText, setInputText] = useState('');

  const session = useConversationSession({
    personaId: personaId!,
    mode: 'practice',
    ttsEnabled,
  });

  const { isListening, isSpeechActive } = useVAD({
    onSpeechStart: session.handleSpeechStart,
    onSpeechEnd: session.handleSpeechEnd,
    enabled: micEnabled && session.vadEnabled,
    paused: session.vadPaused,
  });

  if (!session.persona) { navigate('/roleplay'); return null; }

  const persona = session.persona;
  const isSpeaking = session.turnState === 'speaking';
  const isProcessing = session.turnState === 'thinking';
  const isTranscribing = session.turnState === 'transcribing';

  const getMicStatusText = () => {
    if (!micEnabled) return 'Mikrofon deaktiviert - Texteingabe nutzen';
    if (isTranscribing) return 'Wird transkribiert...';
    if (isSpeechActive) return 'Aufnahme...';
    if (isSpeaking) return 'Persona spricht...';
    if (isListening) return 'Sprich einfach los...';
    return 'Mikrofon wird initialisiert...';
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
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
            onClick={session.endSession}
            disabled={session.isAnalyzing}
            className="px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {session.isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Analysiere...</>
            ) : (
              'Gesprach beenden'
            )}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl card-shadow p-3 sm:p-4 overflow-y-auto mb-4 scrollbar-thin">
        {session.messages.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            <p className="text-lg mb-2">{persona.image}</p>
            <p>Das Gesprach beginnt...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {session.messages.map((msg, i) => (
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
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl card-shadow p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMicEnabled(!micEnabled)}
            className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0 ${
              !micEnabled
                ? 'bg-slate-400 hover:bg-slate-500'
                : isSpeechActive
                  ? 'bg-red-500'
                  : isListening
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {micEnabled && isListening && !isSpeechActive && (
              <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-50"></div>
            )}
            {micEnabled ? (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
            ) : (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6 relative z-10" />
            )}
          </button>

          {micEnabled ? (
            isTranscribing ? (
              <div className="flex-1 h-12 bg-indigo-50 rounded-xl flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span className="text-sm text-indigo-600">Wird transkribiert...</span>
              </div>
            ) : isSpeechActive ? (
              <div className="flex-1 h-12 bg-red-50 rounded-xl flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-600 font-medium">Aufnahme...</span>
              </div>
            ) : (
              <div className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 ${
                isSpeaking ? 'bg-purple-50' : 'bg-emerald-50'
              }`}>
                <span className={`text-sm ${isSpeaking ? 'text-purple-600' : 'text-emerald-600'}`}>
                  {isSpeaking ? 'Persona spricht...' : 'Sprich einfach los...'}
                </span>
              </div>
            )
          ) : (
            <>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    session.sendTextMessage(inputText);
                    setInputText('');
                  }
                }}
                placeholder="Nachricht eingeben..."
                className="flex-1 px-3 sm:px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 transition-colors text-sm sm:text-base"
              />
              <button
                onClick={() => { session.sendTextMessage(inputText); setInputText(''); }}
                disabled={isProcessing || !inputText.trim()}
                className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2 text-center">
          {getMicStatusText()}
        </p>
      </div>

      {/* Feedback Modal */}
      {session.showFeedback && session.feedback && (
        <FeedbackModal
          feedback={session.feedback}
          personaName={persona.name}
          onSave={() => session.saveAndNavigate(session.feedback)}
          isSaving={session.isSaving}
        />
      )}
    </main>
  );
}
