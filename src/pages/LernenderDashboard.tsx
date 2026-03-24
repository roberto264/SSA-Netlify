import { BookOpen, CheckCircle, Trophy, MessageCircle, Brain, ArrowRight, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useProgress, useQuizResults, useRollenspiele } from '../lib/database';
import { modules } from '../lib/contentLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

export function LernenderDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { progress } = useProgress();
  const { results: quizResults } = useQuizResults();
  const { sessions: rollenspielSessions } = useRollenspiele();

  const completedTopics = progress.filter(p => p.completed).length;
  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const quizPassed = quizResults.filter(q => q.passed).length;

  const getModuleProgress = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    const moduleProgress = progress.filter(p => p.modul_id === moduleId && p.completed);
    return module.topics.length > 0
      ? Math.round((moduleProgress.length / module.topics.length) * 100)
      : 0;
  };

  const stats = [
    { label: 'Abgeschlossen', value: completedTopics, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'In Bearbeitung', value: totalTopics - completedTopics, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Quiz bestanden', value: quizPassed, icon: Trophy, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Rollenspiele', value: rollenspielSessions.length, icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 sm:p-8 text-white animate-slide-in">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Willkommen zurück, {profile?.name?.split(' ')[0]}!
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mb-5">
            Setze deine Lernreise fort und werde zum Solar-Experten.
          </p>
          <div className="max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Gesamtfortschritt</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow rounded-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-2xl font-bold text-foreground">{value}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Section */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Lernmodule</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {modules.map((module) => {
            const moduleProgress = getModuleProgress(module.id);
            const isComplete = moduleProgress === 100;
            const isActive = moduleProgress > 0 && moduleProgress < 100;

            return (
              <Card
                key={module.id}
                className="border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-xl"
                onClick={() => navigate(`/module/${module.id}`)}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className={`h-10 w-10 sm:h-12 sm:w-12 ${isComplete ? 'bg-emerald-50' : 'bg-slate-100'} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <BookOpen className={`h-5 w-5 sm:h-6 sm:w-6 ${isComplete ? 'text-emerald-600' : 'text-slate-500'}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-xs sm:text-sm truncate">
                    {module.title}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={isComplete ? 'success' : isActive ? 'warning' : 'secondary'}
                      className="text-[10px]"
                    >
                      {isComplete ? 'Fertig' : isActive ? 'Aktiv' : 'Offen'}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">{moduleProgress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${moduleProgress}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          className="border-0 bg-[#0F172A] text-white cursor-pointer hover:shadow-xl transition-all group overflow-hidden rounded-xl"
          onClick={() => navigate('/roleplay')}
        >
          <CardContent className="p-5 sm:p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg">Kundengespräche üben</h3>
              <p className="text-slate-400 text-sm">Trainiere mit KI-Personas</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </CardContent>
        </Card>

        <Card
          className="border border-emerald-200 bg-white cursor-pointer hover:shadow-xl transition-all group overflow-hidden rounded-xl"
          onClick={() => navigate('/tutor')}
        >
          <CardContent className="p-5 sm:p-6 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
              <Brain className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-slate-900">AI Lehrer</h3>
              <p className="text-slate-600 text-sm">Personalisierte Lernhilfe</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </CardContent>
        </Card>
      </div>

    </main>
  );
}
