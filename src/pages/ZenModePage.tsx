import { useState } from 'react';
import { Loader2, Mic, X } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZenFeedbackModal } from '../components/ZenFeedbackModal';
import { useConversationSession } from '../hooks/useConversationSession';
import { useVAD } from '../hooks/useVAD';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-between text-white z-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

      {/* Emergency Exit */}
      <button
        onClick={handleEmergencyExit}
        className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all z-10 backdrop-blur-sm border border-white/10"
        title="Gespräch abbrechen"
      >
        <X className="h-5 w-5 text-white/60 hover:text-white/90" />
      </button>

      {/* Header */}
      <div className="flex flex-col items-center pt-12 sm:pt-16 relative">
        <div className={cn(
          "h-20 w-20 sm:h-24 sm:w-24 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-4 border border-white/10",
          isSpeaking && 'zen-speaking'
        )}>
          {persona.image}
        </div>
        <h1 className="text-lg sm:text-xl font-semibold text-white/90">
          Kundengespräch mit {persona.name}
        </h1>
        <p className="text-sm text-white/40 mt-1">{persona.difficulty}</p>
      </div>

      {/* Center - Mic Indicator */}
      <div className="flex flex-col items-center relative">
        {session.isAnalyzing ? (
          <div className="flex flex-col items-center gap-4 zen-overlay">
            <Loader2 className="h-16 w-16 animate-spin text-emerald-400" />
            <p className="text-emerald-300 font-medium">Dein Gespräch wird ausgewertet...</p>
          </div>
        ) : (
          <>
            {isSpeechActive && (
              <div className="flex items-center justify-center gap-1.5 h-8 mb-4">
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

            <div className={cn(
              "relative h-24 w-24 sm:h-28 sm:w-28 rounded-full flex items-center justify-center transition-all duration-300",
              getMicColor()
            )}>
              {isSpeechActive && (
                <div className="pulse-ring absolute inset-0 bg-red-500 rounded-full" />
              )}
              {isTranscribing || isProcessing ? (
                <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin relative z-10" />
              ) : (
                <Mic className="h-8 w-8 sm:h-10 sm:w-10 relative z-10" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Bottom - Status */}
      <div className="pb-8 sm:pb-12 text-center relative">
        <p className="text-sm text-white/40">{session.statusText}</p>
        {session.interruptionCount > 0 && !session.conversationEnded && (
          <p className="text-xs text-amber-400/50 mt-1">
            Unterbrechungen: {session.interruptionCount}
          </p>
        )}
      </div>

      {/* Exit Confirmation */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-sm border-0 shadow-2xl animate-slide-in">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-foreground mb-2">Gespräch abbrechen?</h3>
              <p className="text-sm text-muted-foreground mb-5">
                Du hast bereits genug Austausche für eine Teil-Auswertung. Möchtest du das Gespräch auswerten lassen?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/roleplay')}
                >
                  Ohne Auswertung
                </Button>
                <Button
                  variant="success"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  onClick={handleExitWithAnalysis}
                >
                  Auswerten
                </Button>
              </div>
            </CardContent>
          </Card>
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
