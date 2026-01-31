import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { personas } from '../lib/contentLoader';

export function PersonaSelectionPage() {
  const navigate = useNavigate();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
        <ArrowLeft className="w-4 h-4" /> Zurück
      </button>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Wähle einen Kunden</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {personas.map(persona => (
          <div key={persona.id} onClick={() => navigate(`/roleplay/${persona.id}`)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 hover:shadow-lg hover:border-indigo-200 cursor-pointer transition">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="text-4xl sm:text-5xl">{persona.image}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base">{persona.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    persona.difficulty === 'Einsteiger' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>{persona.difficulty}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{persona.summary}</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {persona.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
