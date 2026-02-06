import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { personas } from '../lib/contentLoader';

export function PersonaSelectionPage() {
  const navigate = useNavigate();

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Zurück zur Übersicht</span>
      </button>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Kundengespräche üben</h1>
      <p className="text-slate-600 mb-6 text-sm sm:text-base">Wähle eine Persona für dein Übungsgespräch</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {personas.map(persona => (
          <button
            key={persona.id}
            onClick={() => navigate(`/roleplay/${persona.id}`)}
            className="bg-white rounded-2xl p-4 sm:p-6 card-shadow text-left hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform flex-shrink-0">
                {persona.image}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{persona.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    persona.difficulty === 'Einsteiger' ? 'bg-green-100 text-green-700' :
                    persona.difficulty === 'Fortgeschritten' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {persona.difficulty}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mb-2 sm:mb-3">{persona.summary}</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {persona.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 sm:py-1 bg-slate-100 text-slate-600 text-xs rounded-lg">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
