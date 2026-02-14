import { Clock, Mic, EyeOff, Brain, X } from 'lucide-react';

interface ZenModeConfirmDialogProps {
  personaName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ZenModeConfirmDialog({ personaName, onConfirm, onCancel }: ZenModeConfirmDialogProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slide-in">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Kundengespräch</h2>
                <p className="text-emerald-100 text-sm">Realistisches Gespräch mit {personaName}</p>
              </div>
            </div>
            <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              Kannst du dir 30 Minuten ungestört Zeit nehmen?
            </p>
          </div>

          <p className="text-sm text-slate-600 mb-4">
            Dieses Rollenspiel wird umfassend ausgewertet. Bereite dich auf ein realistisches Kundengespräch vor.
          </p>

          <div className="space-y-2.5 mb-5">
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Nur Spracheingabe - kein Text</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <EyeOff className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Keine Chat-Nachrichten sichtbar</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Die Persona beendet das Gespräch natürlich</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-emerald-600" />
              </div>
              <span>Detaillierte Auswertung am Ende</span>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors text-sm"
          >
            Kundengespräch starten
          </button>
        </div>
      </div>
    </div>
  );
}
