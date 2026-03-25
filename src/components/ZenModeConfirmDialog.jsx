import { Clock, Mic, EyeOff, Brain, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ZenModeConfirmDialog({ personaName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl animate-slide-in overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Kundengespräch</h2>
                <p className="text-emerald-100 text-sm">Realistisches Gespräch mit {personaName}</p>
              </div>
            </div>
            <button onClick={onCancel} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              Kannst du dir 30 Minuten ungestört Zeit nehmen?
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Dieses Rollenspiel wird umfassend ausgewertet. Bereite dich auf ein realistisches Kundengespräch vor.
          </p>

          <div className="space-y-2.5">
            {[
              { icon: Mic, text: 'Nur Spracheingabe - kein Text' },
              { icon: EyeOff, text: 'Keine Chat-Nachrichten sichtbar' },
              { icon: Clock, text: 'Die Persona beendet das Gespräch natürlich' },
              { icon: Brain, text: 'Detaillierte Auswertung am Ende' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-foreground">
                <div className="h-8 w-8 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-emerald-600" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={onConfirm}>
              Kundengespräch starten
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
