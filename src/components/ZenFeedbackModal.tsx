import { Loader2, Star, TrendingUp, AlertCircle, AlertTriangle, CheckCircle, Clock, MessageSquare, BarChart3, HelpCircle, Volume2, Brain } from 'lucide-react';
import type { ZenFeedback } from '../types/content';

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

interface ZenFeedbackModalProps {
  feedback: ZenFeedback;
  personaName: string;
  personaImage: string;
  onSave: () => void;
  isSaving: boolean;
}

export function ZenFeedbackModal({ feedback, personaName, personaImage, onSave, isSaving }: ZenFeedbackModalProps) {
  const ratingColor: Record<string, string> = {
    schwach: 'bg-red-100 text-red-700 border-red-200',
    mittel: 'bg-amber-100 text-amber-700 border-amber-200',
    gut: 'bg-green-100 text-green-700 border-green-200'
  };

  const ratingEmoji: Record<string, string> = {
    schwach: '😔',
    mittel: '🤔',
    gut: '🎉'
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} Min ${secs} Sek` : `${secs} Sek`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{ratingEmoji[feedback.gesamtbewertung] || '📊'}</span>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Kundengespräch - Analyse
              </h2>
              <p className="text-emerald-100 text-sm">Gespräch mit {personaName}</p>
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

        {/* Session Metrics */}
        <div className="p-5 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Gesprächsmetriken
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Dauer</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{formatDuration(feedback.duration_seconds)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Austausche</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{feedback.exchange_count}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">Sprechanteil</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm">{Math.round(feedback.speaking_ratio * 100)}% du / {Math.round((1 - feedback.speaking_ratio) * 100)}% Kunde</p>
            </div>
            <div className={`bg-white rounded-xl p-3 border ${feedback.interruption_count > 0 ? 'border-amber-200' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className={`w-4 h-4 ${feedback.interruption_count > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-xs text-slate-500">Unterbrechungen</span>
              </div>
              <p className={`font-semibold text-sm ${feedback.interruption_count > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
                {feedback.interruption_count}x
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Text */}
        <div className="p-5 border-b">
          <p className="text-slate-700 text-sm leading-relaxed">{feedback.feedback}</p>
        </div>

        {/* Soft Skills */}
        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
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

        {/* Tonality Analysis */}
        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <Volume2 className="w-4 h-4 text-purple-600" />
            Tonalität & Wortwahl
          </h3>
          <SkillRating label="Tonalität-Score" value={feedback.sentiment_score} />
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feedback.tonalitaet}</p>
        </div>

        {/* Question Quality */}
        <div className="p-5 border-b">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            Fragenqualität
          </h3>
          <SkillRating label="Fragenqualität" value={feedback.user_question_quality} />
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feedback.gefragte_fragen_analyse}</p>
        </div>

        {/* Interruption Analysis */}
        {feedback.dem_kunden_reingeredet != null && (
          <div className="p-5 border-b">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
              <AlertTriangle className={`w-4 h-4 ${feedback.dem_kunden_reingeredet >= 4 ? 'text-green-600' : feedback.dem_kunden_reingeredet >= 3 ? 'text-amber-600' : 'text-red-600'}`} />
              Dem Kunden reingeredet
            </h3>
            <SkillRating label="Bewertung" value={feedback.dem_kunden_reingeredet} />
            {feedback.unterbrechungs_analyse && (
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{feedback.unterbrechungs_analyse}</p>
            )}
          </div>
        )}

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

        {/* Save Button */}
        <div className="p-5 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
