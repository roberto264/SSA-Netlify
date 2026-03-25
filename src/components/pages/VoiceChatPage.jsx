import { useState } from 'react';
import { Loader2, Mic, MicOff, Send, Star, TrendingUp, AlertCircle, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { useParams, useNavigate } from '../islands/IslandWrapper';
import { useConversationSession } from '../../hooks/useConversationSession';
import { useVAD } from '../../hooks/useVAD';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Skill Rating Component ─────────────────────────────────────────
function SkillRating({ label, value, max = 5 }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex gap-0.5">
        {[...Array(max)].map((_, i) => (
          <Star
            key={i}
            className={cn("h-4 w-4", i < value ? 'text-amber-400 fill-amber-400' : 'text-border')}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Feedback Modal Component ───────────────────────────────────────
function FeedbackModal({ feedback, personaName, onSave, isSaving }) {
  const ratingConfig = {
    schwach: { bg: 'from-red-500 to-red-600', badge: 'destructive' },
    mittel: { bg: 'from-amber-500 to-amber-600', badge: 'warning' },
    gut: { bg: 'from-emerald-500 to-emerald-600', badge: 'success' },
  };
  const ratingEmoji = {
    schwach: '\u{1F614}', mittel: '\u{1F914}', gut: '\u{1F389}'
  };

  const config = ratingConfig[feedback.gesamtbewertung] || ratingConfig.mittel;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 shadow-2xl animate-slide-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.bg} text-white p-5 rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ratingEmoji[feedback.gesamtbewertung] || '\u{1F4CA}'}</span>
            <div>
              <h2 className="font-bold text-lg">Gesprächsanalyse</h2>
              <p className="text-white/80 text-sm">Gespräch mit {personaName}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Rating */}
          <div className="p-5 border-b flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Gesamtbewertung:</span>
            <Badge variant={config.badge} className="text-sm px-4 py-1 capitalize">
              {feedback.gesamtbewertung}
            </Badge>
          </div>

          {/* Feedback Text */}
          <div className="p-5 border-b bg-muted/30">
            <p className="text-foreground text-sm leading-relaxed">{feedback.feedback}</p>
          </div>

          {/* Soft Skills */}
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Soft Skills Bewertung
            </h3>
            <div className="divide-y divide-border">
              <SkillRating label="Gesprächsführung" value={feedback.gesprachsfuhrung} />
              <SkillRating label="Aktives Zuhören" value={feedback.aktives_zuhoren} />
              <SkillRating label="Klarheit" value={feedback.klarheit} />
              <SkillRating label="Einwandbehandlung" value={feedback.einwand_behandlung} />
              <SkillRating label="Empathie" value={feedback.empathie} />
              <SkillRating label="Überzeugungskraft" value={feedback.uberzeugungskraft} />
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="p-5 grid grid-cols-2 gap-4 border-b">
            {feedback.staerken?.length > 0 && (
              <div>
                <h4 className="font-medium text-emerald-700 mb-2 flex items-center gap-1.5 text-sm">
                  <CheckCircle className="h-4 w-4" /> Stärken
                </h4>
                <ul className="space-y-1">
                  {feedback.staerken.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">·</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.verbesserungen?.length > 0 && (
              <div>
                <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-1.5 text-sm">
                  <AlertCircle className="h-4 w-4" /> Verbesserungen
                </h4>
                <ul className="space-y-1">
                  {feedback.verbesserungen.map((v, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <span className="text-amber-500 mt-0.5">·</span>{v}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="p-5">
            <Button onClick={onSave} disabled={isSaving} className="w-full" size="lg">
              {isSaving ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Speichern...</>
              ) : (
                'Speichern & Beenden'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
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
    personaId: personaId,
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
    if (!micEnabled) return 'Mikrofon deaktiviert — Texteingabe nutzen';
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
          <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center text-xl">
            {persona.image}
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm sm:text-base">{persona.name}</h2>
            <p className="text-xs text-muted-foreground">{persona.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={ttsEnabled ? 'secondary' : 'ghost'}
            size="icon"
            onClick={() => setTtsEnabled(!ttsEnabled)}
            title={ttsEnabled ? 'Sprache ausschalten' : 'Sprache einschalten'}
            className={ttsEnabled ? 'text-primary' : 'text-muted-foreground'}
          >
            {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={session.endSession}
            disabled={session.isAnalyzing}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 shadow-none"
          >
            {session.isAnalyzing ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Analysiere...</>
            ) : (
              'Gespräch beenden'
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <Card className="flex-1 border-0 shadow-sm overflow-hidden mb-4">
        <CardContent className="p-4 h-full overflow-y-auto scrollbar-thin">
          {session.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <span className="text-4xl mb-3">{persona.image}</span>
              <p className="text-sm">Das Gespräch beginnt...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {session.messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    "max-w-[85%] sm:max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed",
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMicEnabled(!micEnabled)}
              className={cn(
                "relative h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center text-white transition-all flex-shrink-0",
                !micEnabled && 'bg-muted-foreground/50 hover:bg-muted-foreground/60',
                micEnabled && isSpeechActive && 'bg-destructive shadow-lg shadow-destructive/30',
                micEnabled && isListening && !isSpeechActive && 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30',
                micEnabled && !isListening && 'bg-primary hover:bg-primary/90'
              )}
            >
              {micEnabled && isListening && !isSpeechActive && (
                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-pulse opacity-40" />
              )}
              {micEnabled
                ? <Mic className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
                : <MicOff className="h-5 w-5 sm:h-6 sm:w-6 relative z-10" />
              }
            </button>

            {micEnabled ? (
              <div className={cn(
                "flex-1 h-12 rounded-xl flex items-center justify-center gap-2",
                isTranscribing && 'bg-primary/5',
                isSpeechActive && 'bg-destructive/5',
                !isTranscribing && !isSpeechActive && isSpeaking && 'bg-purple-50',
                !isTranscribing && !isSpeechActive && !isSpeaking && 'bg-emerald-50'
              )}>
                {isTranscribing ? (
                  <><Loader2 className="h-4 w-4 animate-spin text-primary" /><span className="text-sm text-primary">Wird transkribiert...</span></>
                ) : isSpeechActive ? (
                  <><div className="h-2 w-2 bg-destructive rounded-full animate-pulse" /><span className="text-sm text-destructive font-medium">Aufnahme...</span></>
                ) : (
                  <span className={cn("text-sm", isSpeaking ? 'text-purple-600' : 'text-emerald-600')}>
                    {isSpeaking ? 'Persona spricht...' : 'Sprich einfach los...'}
                  </span>
                )}
              </div>
            ) : (
              <>
                <Input
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
                  className="flex-1 h-12"
                />
                <Button
                  size="icon-lg"
                  onClick={() => { session.sendTextMessage(inputText); setInputText(''); }}
                  disabled={isProcessing || !inputText.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">
            {getMicStatusText()}
          </p>
        </CardContent>
      </Card>

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
