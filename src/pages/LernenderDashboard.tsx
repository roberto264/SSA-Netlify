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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-8 mb-4 sm:mb-8 text-white">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Willkommen, {profile?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-indigo-200 text-sm sm:text-lg">Du hast {overallProgress}% deiner Ausbildung abgeschlossen.</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-3xl sm:text-5xl font-bold">{overallProgress}%</div>
            <p className="text-indigo-200 text-sm">Fortschritt</p>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 bg-white/20 rounded-full h-2 sm:h-3">
          <div className="bg-amber-500 h-2 sm:h-3 rounded-full transition-all" style={{ width: `${overallProgress}%` }}></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
        <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{completedTopics}</p>
              <p className="text-xs sm:text-sm text-gray-500">Abgeschlossen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalTopics - completedTopics}</p>
              <p className="text-xs sm:text-sm text-gray-500">Offen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{quizPassed}</p>
              <p className="text-xs sm:text-sm text-gray-500">Quiz best.</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{rollenspielSessions.length}</p>
              <p className="text-xs sm:text-sm text-gray-500">Rollenspiele</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 mb-4 sm:mb-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Kursmodule</h3>
          <span className="text-xs sm:text-sm text-gray-500">{modules.length} Module • {totalTopics} Themen</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {modules.map((module) => {
            const moduleProgress = getModuleProgress(module.id);
            const isComplete = moduleProgress === 100;
            const isActive = moduleProgress > 0 && moduleProgress < 100;

            return (
              <div
                key={module.id}
                onClick={() => navigate(`/module/${module.id}`)}
                className={`rounded-xl p-3 sm:p-5 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-white shadow-md border-2 border-indigo-600'
                    : 'bg-gray-50 hover:shadow-md hover:bg-white border-2 border-transparent hover:border-indigo-200'
                }`}
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-4`}>
                  {module.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">{module.title}</h4>
                <p className="text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2 hidden sm:block">{module.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-600'}`}
                      style={{ width: `${moduleProgress}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                    {moduleProgress}%
                  </span>
                </div>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  isComplete ? 'bg-green-100 text-green-700' :
                  isActive ? 'bg-indigo-600 text-white' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {isComplete ? 'Fertig' : isActive ? 'Aktiv' : 'Offen'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div
          onClick={() => navigate('/roleplay')}
          className="bg-gradient-to-br from-indigo-950 to-indigo-600 rounded-xl p-4 sm:p-6 text-white cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg sm:text-xl mb-1 sm:mb-2">Kundengespräche üben</h4>
              <p className="text-indigo-200 text-sm mb-3 sm:mb-4">Trainiere Verkaufsgespräche mit KI-Kunden.</p>
              <button className="bg-white text-indigo-600 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-50 transition text-sm sm:text-base">
                Gespräch starten
              </button>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('/tutor')}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-6 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-lg sm:text-xl text-gray-900 mb-1 sm:mb-2">AI Lehrer</h4>
              <p className="text-gray-500 text-sm mb-3 sm:mb-4">Lass dich vom AI Tutor durch die Themen führen.</p>
              <button className="bg-indigo-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base">
                Mit AI Lehrer lernen
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
