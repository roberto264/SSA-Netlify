import { useState, useRef } from 'react';
import { Loader2, Mic, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZenFeedbackModal } from '../components/ZenFeedbackModal';
import { useConversationSession } from '../hooks/useConversationSession';
import { useVAD } from '../hooks/useVAD';

export function ZenModePage() {
  const { personaId } = useParams();
  const navigate = useNavigate();

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const session = useConversationSession({
    personaId: personaId!,
    mode: 'zen',
  });

  const { isListening, isSpeechActive } = useVAD({
    onSpeechStart: session.handleSpeechStart,
    onSpeechEnd: session.handleSpeechEnd,
    enabled: session.vadEnabled,
    paused: session.vadPaused,
  });

  if (!session.persona) { navigate('/roleplay'); return null; }

  const persona = session.persona;
  const isSpeaking = session.turnState === 'speaking';
  const isProcessing = session.turnState === 'thinking';
  const isTranscribing = session.turnState === 'transcribing';

  const handleEmergencyExit = () => {
    session.stopEverything();

    const userMessages = session.messages.filter(m => m.role === 'user');
    if (userMessages.length >= 2) {
      setShowExitConfirm(true);
    } else {
      navigate('/roleplay');
    }
  };

  const handleExitWithAnalysis = async () => {
    setShowExitConfirm(false);
    await session.endSession();
  };

  const getMicColor = () => {
    if (session.conversationEnded || session.isAnalyzing) return 'bg-slate-600 opacity-50';
    if (isSpeechActive) return 'bg-red-500 scale-110';
    if (isTranscribing || isProcessing) return 'bg-amber-500';
    if (isSpeaking) return 'bg-purple-500';
    if (isListening) return 'bg-emerald-500 zen-mic-idle';
    return 'bg-slate-600';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-between text-white z-50">
      {/* Emergency Exit */}
      <button
        onClick={handleEmergencyExit}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
        title="Gespräch abbrechen"
      >
        <X className="w-5 h-5 text-white/70" />
      </button>

      {/* Header */}
      <div className="flex flex-col items-center pt-12 sm:pt-16">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 bg-white/10 rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-4 ${isSpeaking ? 'zen-speaking' : ''}`}>
          {persona.image}
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-white/90">
          Kundengespräch mit {persona.name}
        </h1>
        <p className="text-sm text-white/50 mt-1">{persona.difficulty}</p>
      </div>

      {/* Center - Mic Indicator */}
      <div className="flex flex-col items-center">
        {session.isAnalyzing ? (
          <div className="flex flex-col items-center gap-4 zen-overlay">
            <Loader2 className="w-16 h-16 animate-spin text-emerald-400" />
            <p className="text-emerald-300 font-medium">Dein Gespräch wird ausgewertet...</p>
          </div>
        ) : (
          <>
            {isSpeechActive && (
              <div className="flex items-center justify-center gap-1 h-8 mb-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-red-400 rounded-full animate-pulse"
                    style={{
                      height: `${12 + Math.random() * 20}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            )}

            <div
              className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all ${getMicColor()}`}
            >
              {isSpeechActive && (
                <div className="pulse-ring absolute inset-0 bg-red-500 rounded-full" />
              )}
              {isTranscribing || isProcessing ? (
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin relative z-10" />
              ) : (
                <Mic className="w-8 h-8 sm:w-10 sm:h-10 relative z-10" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom - Status */}
      <div className="pb-8 sm:pb-12 text-center">
        <p className="text-sm text-white/50">{session.statusText}</p>
        {session.interruptionCount > 0 && !session.conversationEnded && (
          <p className="text-xs text-amber-400/60 mt-1">
            Unterbrechungen: {session.interruptionCount}
          </p>
        )}
      </div>

      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 text-slate-800 animate-slide-in">
            <h3 className="font-bold text-lg mb-2">Gespräch abbrechen?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Du hast bereits genug Austausche für eine Teil-Auswertung. Möchtest du das Gespräch auswerten lassen?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/roleplay')}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Ohne Auswertung
              </button>
              <button
                onClick={handleExitWithAnalysis}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Auswerten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zen Feedback Modal */}
      {session.showFeedback && session.feedback && (
        <ZenFeedbackModal
          feedback={session.feedback}
          personaName={persona.name}
          personaImage={persona.image}
          onSave={() => session.saveAndNavigate(session.feedback)}
          isSaving={session.isSaving}
        />
      )}
    </div>
  );
}
