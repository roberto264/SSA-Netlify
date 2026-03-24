import { Loader2, Star, TrendingUp, AlertCircle, AlertTriangle, CheckCircle, Clock, MessageSquare, BarChart3, HelpCircle, Volume2, Brain } from 'lucide-react';
import type { ZenFeedback } from '../types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function SkillRating({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
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

interface ZenFeedbackModalProps {
  feedback: ZenFeedback;
  personaName: string;
  personaImage: string;
  onSave: () => void;
  isSaving: boolean;
}

export function ZenFeedbackModal({ feedback, personaName, personaImage, onSave, isSaving }: ZenFeedbackModalProps) {
  const ratingConfig: Record<string, { badge: 'destructive' | 'warning' | 'success'; gradient: string }> = {
    schwach: { badge: 'destructive', gradient: 'from-red-500 to-red-600' },
    mittel: { badge: 'warning', gradient: 'from-amber-500 to-amber-600' },
    gut: { badge: 'success', gradient: 'from-emerald-500 to-emerald-600' },
  };

  const ratingEmoji: Record<string, string> = { schwach: '\u{1F614}', mittel: '\u{1F914}', gut: '\u{1F389}' };

  const config = ratingConfig[feedback.gesamtbewertung] || ratingConfig.mittel;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} Min ${secs} Sek` : `${secs} Sek`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border-0 shadow-2xl animate-slide-in">
        {/* Header */}
        <div className={`bg-gradient-to-r ${config.gradient} text-white p-5 rounded-t-xl`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ratingEmoji[feedback.gesamtbewertung] || '\u{1F4CA}'}</span>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Kundengespräch - Analyse
              </h2>
              <p className="text-white/80 text-sm">Gespräch mit {personaName}</p>
            </div>
          </div>
        </div>

        <CardContent className="p-0">
          {/* Overall Rating */}
          <div className="p-5 border-b flex items-center justify-center gap-3">
            <span className="text-sm text-muted-foreground">Gesamtbewertung:</span>
            <Badge variant={config.badge} className="text-sm px-4 py-1 capitalize">
              {feedback.gesamtbewertung}
            </Badge>
          </div>

          {/* Session Metrics */}
          <div className="p-5 border-b bg-muted/30">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              Gesprächsmetriken
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: Clock, label: 'Dauer', value: formatDuration(feedback.duration_seconds) },
                { icon: MessageSquare, label: 'Austausche', value: String(feedback.exchange_count) },
                { icon: BarChart3, label: 'Sprechanteil', value: `${Math.round(feedback.speaking_ratio * 100)}% / ${Math.round((1 - feedback.speaking_ratio) * 100)}%` },
                { icon: AlertTriangle, label: 'Unterbrechungen', value: `${feedback.interruption_count}x`, warn: feedback.interruption_count > 0 },
              ].map(({ icon: Icon, label, value, warn }) => (
                <div key={label} className={cn("bg-background rounded-lg p-3 border", warn ? 'border-amber-200' : 'border-border')}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn("h-3.5 w-3.5", warn ? 'text-amber-500' : 'text-muted-foreground')} />
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                  </div>
                  <p className={cn("font-semibold text-sm", warn ? 'text-amber-700' : 'text-foreground')}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="p-5 border-b">
            <p className="text-foreground text-sm leading-relaxed">{feedback.feedback}</p>
          </div>

          {/* Soft Skills */}
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              Soft Skills Bewertung
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

          {/* Tonality Analysis */}
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <Volume2 className="h-4 w-4 text-purple-600" />
              Tonalität & Wortwahl
            </h3>
            <SkillRating label="Tonalität-Score" value={feedback.sentiment_score} />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{feedback.tonalitaet}</p>
          </div>

          {/* Question Quality */}
          <div className="p-5 border-b">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
              <HelpCircle className="h-4 w-4 text-teal-600" />
              Fragenqualität
            </h3>
            <SkillRating label="Fragenqualität" value={feedback.user_question_quality} />
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{feedback.gefragte_fragen_analyse}</p>
          </div>

          {/* Interruption Analysis */}
          {feedback.dem_kunden_reingeredet != null && (
            <div className="p-5 border-b">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-sm">
                <AlertTriangle className={cn("h-4 w-4",
                  feedback.dem_kunden_reingeredet >= 4 ? 'text-emerald-600' :
                  feedback.dem_kunden_reingeredet >= 3 ? 'text-amber-600' : 'text-destructive'
                )} />
                Dem Kunden reingeredet
              </h3>
              <SkillRating label="Bewertung" value={feedback.dem_kunden_reingeredet} />
              {feedback.unterbrechungs_analyse && (
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{feedback.unterbrechungs_analyse}</p>
              )}
            </div>
          )}

          {/* Strengths & Improvements */}
          <div className="p-5 grid grid-cols-2 gap-4 border-b">
            {feedback.staerken && feedback.staerken.length > 0 && (
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
            {feedback.verbesserungen && feedback.verbesserungen.length > 0 && (
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
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
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
