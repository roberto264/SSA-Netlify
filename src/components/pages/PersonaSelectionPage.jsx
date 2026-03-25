import { useState } from 'react';
import { ArrowLeft, Brain, Loader2, User } from 'lucide-react';
import { useNavigate } from '../islands/IslandWrapper';
import { usePersonas } from '../../hooks/useContent';
import { ZenModeConfirmDialog } from '../ZenModeConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function PersonaSelectionPage() {
  const navigate = useNavigate();
  const [zenPersona, setZenPersona] = useState(null);
  const [zenPersonaName, setZenPersonaName] = useState('');
  const { data: personas, loading: personasLoading } = usePersonas();

  const handleZenClick = (personaId, personaName) => {
    setZenPersona(personaId);
    setZenPersonaName(personaName);
  };

  const difficultyVariant = (d) =>
    d === 'Einsteiger' ? 'success' :
    d === 'Fortgeschritten' ? 'warning' : 'destructive';

  if (personasLoading || !personas) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="gap-2 text-muted-foreground hover:text-foreground -ml-2 mb-4">
        <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
      </Button>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">Kundengespräche üben</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Wähle eine Persona für dein Übungsgespräch</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {personas.map(persona => (
          <Card
            key={persona.id}
            className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 group rounded-xl"
          >
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <User className="h-7 w-7 sm:h-8 sm:w-8 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">{persona.name}</h3>
                    <Badge variant={difficultyVariant(persona.difficulty)} className="text-[10px]">
                      {persona.difficulty}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-3">{persona.summary}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <Button
                  variant="secondary"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700"
                  onClick={() => navigate(`/roleplay/${persona.id}`)}
                >
                  Übungsmodus
                </Button>
                <Button
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleZenClick(persona.id, persona.name)}
                >
                  <Brain className="h-4 w-4" />
                  Kundengespräch
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zen Mode Confirmation Dialog */}
      {zenPersona && (
        <ZenModeConfirmDialog
          personaName={zenPersonaName}
          onConfirm={() => {
            navigate(`/roleplay/${zenPersona}/zen`);
            setZenPersona(null);
          }}
          onCancel={() => setZenPersona(null)}
        />
      )}
    </main>
  );
}
