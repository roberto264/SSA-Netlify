import { BookOpen, CheckCircle, Trophy, MessageCircle, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useProgress, useQuizResults, useRollenspiele } from '../lib/database';
import { modules } from '../lib/contentLoader';

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

  const getModuleProgress = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    const moduleProgress = progress.filter(p => p.modul_id === moduleId && p.completed);
    return module.topics.length > 0
      ? Math.round((moduleProgress.length / module.topics.length) * 100)
      : 0;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 text-white animate-slide-in">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Willkommen zurück, {profile?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-indigo-100 text-sm sm:text-base mb-4">Setze deine Lernreise fort und werde zum Solar-Experten.</p>
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-1">
              <span>Gesamtfortschritt</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 rounded-full progress-bar-animate" style={{ width: `${overallProgress}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white rounded-2xl p-3 sm:p-5 card-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-800">{completedTopics}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Abgeschlossen</p>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-5 card-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-800">{totalTopics - completedTopics}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">In Bearbeitung</p>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-5 card-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-800">{quizPassed}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Quiz bestanden</p>
        </div>
        <div className="bg-white rounded-2xl p-3 sm:p-5 card-shadow">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-800">{rollenspielSessions.length}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">Rollenspiele</p>
        </div>
      </div>

      {/* Modules Section */}
      <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Lernmodule</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {modules.map((module) => {
          const moduleProgress = getModuleProgress(module.id);
          const isComplete = moduleProgress === 100;
          const isActive = moduleProgress > 0 && moduleProgress < 100;

          return (
            <button
              key={module.id}
              onClick={() => navigate(`/module/${module.id}`)}
              className="bg-white rounded-2xl p-3 sm:p-5 card-shadow text-left hover:shadow-lg transition-all transform hover:scale-[1.02] group"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                {module.icon}
              </div>
              <h3 className="font-semibold text-slate-800 mb-1 sm:mb-2 text-xs sm:text-sm truncate">{module.title}</h3>
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  isComplete ? 'bg-green-100 text-green-700' :
                  isActive ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {isComplete ? 'Fertig' : isActive ? 'Aktiv' : 'Offen'}
                </span>
                <span className="text-xs text-slate-500">{moduleProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${module.color} rounded-full progress-bar-animate`}
                  style={{ width: `${moduleProgress}%` }}
                ></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/roleplay')}
          className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-4 sm:p-6 text-left hover:shadow-xl transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
              🎭
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Kundengespräche üben</h3>
              <p className="text-slate-300 text-sm">Trainiere mit KI-Personas</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => navigate('/tutor')}
          className="bg-white border-2 border-amber-400 text-slate-800 rounded-2xl p-4 sm:p-6 text-left hover:shadow-xl hover:border-amber-500 transition-all group"
        >
          <div className="flex items-center gap-3 sm:gap-4 mb-2">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform flex-shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">AI Lehrer</h3>
              <p className="text-slate-500 text-sm">Personalisierte Lernhilfe</p>
            </div>
          </div>
        </button>
      </div>
    </main>
  );
}
