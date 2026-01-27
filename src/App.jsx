import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, BookOpen, CheckCircle, Award, ChevronRight, ArrowLeft, 
  MessageCircle, User, Send, X, Mic, Loader2, Brain, Trophy, 
  XCircle, Building2, Download, Search, Star, Heart, Target, 
  Clock, Mail, Phone as PhoneIcon, Calendar, BarChart3, Edit,
  LogOut
} from 'lucide-react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { useProgress, useQuizResults, useRollenspiele, useAllUsers, useFirmaUsers } from './lib/database';
import AuthPage from './components/AuthPage';
import { modules } from './modules';
import { personas } from './personas';

// ============================================
// STAR RATING COMPONENT
// ============================================
function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
        />
      ))}
    </div>
  );
}

// ============================================
// HEADER COMPONENT
// ============================================
function Header({ currentUser }) {
  const { signOut, profile } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-indigo-950">Swiss Solar Academy</h1>
            <p className="text-xs text-gray-500">Powered by Gama AG</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{profile?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{profile?.firma || profile?.role}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              profile?.role === 'betreiber' ? 'bg-red-100 text-red-700' :
              profile?.role === 'arbeitgeber' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {profile?.role === 'betreiber' ? 'Admin' : 
               profile?.role === 'arbeitgeber' ? 'Arbeitgeber' : 'Lernender'}
            </span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              profile?.role === 'betreiber' ? 'bg-indigo-950' :
              profile?.role === 'arbeitgeber' ? 'bg-purple-600' :
              'bg-indigo-600'
            }`}>
              {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <button 
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Abmelden"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================
// LERNENDER DASHBOARD
// ============================================
function LernenderDashboard({ onSelectModule, onStartRoleplay, onStartTutor }) {
  const { profile } = useAuth();
  const { progress } = useProgress();
  const { results: quizResults } = useQuizResults();
  const { sessions: rollenspielSessions } = useRollenspiele();

  // Calculate stats
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
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Willkommen, {profile?.name?.split(' ')[0]}! 👋</h2>
            <p className="text-indigo-200 text-lg">Du hast {overallProgress}% deiner Ausbildung abgeschlossen.</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{overallProgress}%</div>
            <p className="text-indigo-200">Fortschritt</p>
          </div>
        </div>
        <div className="mt-6 bg-white/20 rounded-full h-3">
          <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${overallProgress}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedTopics}</p>
              <p className="text-sm text-gray-500">Themen abgeschlossen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalTopics - completedTopics}</p>
              <p className="text-sm text-gray-500">Noch offen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{quizPassed}</p>
              <p className="text-sm text-gray-500">Quiz bestanden</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rollenspielSessions.length}</p>
              <p className="text-sm text-gray-500">Rollenspiele</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Kursmodule</h3>
          <span className="text-sm text-gray-500">{modules.length} Module • {totalTopics} Themen</span>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {modules.map((module) => {
            const moduleProgress = getModuleProgress(module.id);
            const isComplete = moduleProgress === 100;
            const isActive = moduleProgress > 0 && moduleProgress < 100;
            
            return (
              <div 
                key={module.id}
                onClick={() => onSelectModule(module)}
                className={`rounded-xl p-5 cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-white shadow-md border-2 border-indigo-600' 
                    : 'bg-gray-50 hover:shadow-md hover:bg-white border-2 border-transparent hover:border-indigo-200'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {module.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{module.title}</h4>
                <p className="text-xs text-gray-500 mb-3">{module.description}</p>
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
                  {isComplete ? 'Abgeschlossen' : isActive ? 'In Bearbeitung' : 'Offen'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div 
          onClick={onStartRoleplay}
          className="bg-gradient-to-br from-indigo-950 to-indigo-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl mb-2">Kundengespräche üben</h4>
              <p className="text-indigo-200 mb-4">Trainiere realistische Verkaufsgespräche mit KI-gestützten Kunden.</p>
              <button className="bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition">
                Gespräch starten
              </button>
            </div>
          </div>
        </div>

        <div 
          onClick={onStartTutor}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900 mb-2">AI Lehrer</h4>
              <p className="text-gray-500 mb-4">Lass dich vom AI Tutor durch die Themen führen.</p>
              <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition">
                Mit AI Lehrer lernen
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// BETREIBER DASHBOARD
// ============================================
function BetreiberDashboard() {
  const { users, loading } = useAllUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFirma, setFilterFirma] = useState('alle');

  const firmen = [...new Set(users.map(u => u.firma).filter(Boolean))];

  const filteredUsers = users.filter(u => {
    if (filterFirma !== 'alle' && u.firma !== filterFirma) return false;
    if (searchTerm && !u.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const calculateUserProgress = (user) => {
    const completed = user.modul_fortschritt?.filter(p => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Aktive Lernende</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Firmen</p>
          <p className="text-3xl font-bold text-gray-900">{firmen.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Ø Fortschritt</p>
          <p className="text-3xl font-bold text-gray-900">
            {users.length > 0 
              ? Math.round(users.reduce((acc, u) => acc + calculateUserProgress(u), 0) / users.length)
              : 0}%
          </p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Quiz bestanden</p>
          <p className="text-3xl font-bold text-green-600">
            {users.reduce((acc, u) => acc + (u.quiz_ergebnisse?.filter(q => q.passed).length || 0), 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Alle Lernenden</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Suchen..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40"
              />
            </div>
            <select 
              value={filterFirma}
              onChange={(e) => setFilterFirma(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            >
              <option value="alle">Alle Firmen</option>
              {firmen.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-5 py-3">Lernender</th>
              <th className="px-5 py-3">Firma</th>
              <th className="px-5 py-3">Fortschritt</th>
              <th className="px-5 py-3">Quiz</th>
              <th className="px-5 py-3">Rollenspiele</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredUsers.map(user => {
              const userProgress = calculateUserProgress(user);
              return (
                <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-medium text-sm">
                        {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name || 'Unbekannt'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{user.firma || '-'}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${userProgress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${userProgress}%` }}></div>
                      </div>
                      <span className="text-xs font-medium">{userProgress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">{user.quiz_ergebnisse?.filter(q => q.passed).length || 0} bestanden</td>
                  <td className="px-5 py-4 text-sm">{user.rollenspiel_sessions?.length || 0}</td>
                  <td className="px-5 py-4">
                    <button className="text-indigo-600 text-sm font-medium">Details →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// ============================================
// USER PROFILE (Admin View)
// ============================================
function UserProfile({ user, onBack }) {
  const calculateProgress = () => {
    const completed = user.modul_fortschritt?.filter(p => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getModuleProgress = (moduleId) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    const completed = user.modul_fortschritt?.filter(p => p.modul_id === moduleId && p.completed).length || 0;
    return module.topics.length > 0 ? Math.round((completed / module.topics.length) * 100) : 0;
  };

  // Calculate average soft skills from rollenspiele
  const avgSoftSkills = {
    gesprachsfuhrung: 0,
    aktives_zuhoren: 0,
    klarheit: 0,
    einwand_behandlung: 0,
    empathie: 0,
    uberzeugungskraft: 0
  };

  const sessions = user.rollenspiel_sessions || [];
  if (sessions.length > 0) {
    Object.keys(avgSoftSkills).forEach(key => {
      const values = sessions.filter(s => s[key]).map(s => s[key]);
      avgSoftSkills[key] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    });
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Übersicht
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
              {user.name?.split(' ').map(n => n[0]).join('') || '?'}
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900">{user.name}</h3>
              <p className="text-gray-500">{user.firma} • {user.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-indigo-600">{calculateProgress()}%</p>
            <p className="text-sm text-gray-500">Gesamtfortschritt</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Modulfortschritt */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Modulfortschritt
            </h4>
            <div className="space-y-3">
              {modules.map(module => (
                <div key={module.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{module.title}</span>
                    <span className="font-medium">{getModuleProgress(module.id)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getModuleProgress(module.id) === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${getModuleProgress(module.id)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-600" />
              Kommunikation
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gesprächsführung</span>
                <StarRating rating={avgSoftSkills.gesprachsfuhrung} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aktives Zuhören</span>
                <StarRating rating={avgSoftSkills.aktives_zuhoren} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Klarheit</span>
                <StarRating rating={avgSoftSkills.klarheit} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Einwandbehandlung</span>
                <StarRating rating={avgSoftSkills.einwand_behandlung} />
              </div>
            </div>

            <h4 className="font-semibold text-gray-900 mb-4 mt-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" />
              Verkaufstalent
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Empathie</span>
                <StarRating rating={avgSoftSkills.empathie} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Überzeugungskraft</span>
                <StarRating rating={avgSoftSkills.uberzeugungskraft} />
              </div>
            </div>
          </div>

          {/* Quiz & Rollenspiele */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" />
              Quiz-Ergebnisse
            </h4>
            <div className="space-y-2 mb-6">
              {(user.quiz_ergebnisse || []).slice(0, 5).map((quiz, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{modules.find(m => m.id === quiz.modul_id)?.title || 'Unbekannt'}</span>
                  <span className={`text-sm font-medium ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>
                    {quiz.score}/{quiz.max_score}
                  </span>
                </div>
              ))}
              {(!user.quiz_ergebnisse || user.quiz_ergebnisse.length === 0) && (
                <p className="text-sm text-gray-500">Noch keine Quiz absolviert</p>
              )}
            </div>

            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-600" />
              Rollenspiele ({sessions.length})
            </h4>
            <div className="space-y-2">
              {sessions.slice(0, 3).map((session, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{personas.find(p => p.id === session.persona_id)?.name || session.persona_id}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    session.rating === 'gut' ? 'bg-green-100 text-green-700' :
                    session.rating === 'mittel' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {session.rating || 'Offen'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// ARBEITGEBER DASHBOARD
// ============================================
function ArbeitgeberDashboard() {
  const { profile } = useAuth();
  const { users, loading } = useFirmaUsers(profile?.firma);

  const calculateUserProgress = (user) => {
    const completed = user.modul_fortschritt?.filter(p => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  const avgProgress = users.length > 0 
    ? Math.round(users.reduce((acc, u) => acc + calculateUserProgress(u), 0) / users.length) 
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{profile?.firma} - Team Übersicht</h2>
        <p className="text-indigo-200">{users.length} Mitarbeiter in Ausbildung</p>
        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Ø Fortschritt</p>
            <p className="text-3xl font-bold">{avgProgress}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Quiz bestanden</p>
            <p className="text-3xl font-bold">{users.reduce((acc, u) => acc + (u.quiz_ergebnisse?.filter(q => q.passed).length || 0), 0)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Rollenspiele</p>
            <p className="text-3xl font-bold">{users.reduce((acc, u) => acc + (u.rollenspiel_sessions?.length || 0), 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {users.map(user => {
          const userProgress = calculateUserProgress(user);
          return (
            <div key={user.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {user.name?.split(' ').map(n => n[0]).join('') || '?'}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Fortschritt</span>
                  <span className="font-medium">{userProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${userProgress === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${userProgress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Quiz</span>
                  <span>{user.quiz_ergebnisse?.filter(q => q.passed).length || 0} bestanden</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

// ============================================
// MODULE DETAIL
// ============================================
function ModuleDetail({ module, onBack, onSelectTopic }) {
  const { progress } = useProgress();

  const isTopicCompleted = (topicId) => {
    return progress.some(p => p.modul_id === module.id && p.topic_id === topicId && p.completed);
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-3xl`}>
            {module.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
            <p className="text-gray-500">{module.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {module.topics.map(topic => {
            const completed = isTopicCompleted(topic.id);
            return (
              <div 
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className={`p-5 rounded-xl cursor-pointer transition border-2 ${
                  completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-md hover:border-indigo-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {completed && <CheckCircle className="w-5 h-5 text-green-500" />}
                    <div>
                      <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                      <p className="text-sm text-gray-500">{topic.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

// ============================================
// QUIZ COMPONENT
// ============================================
function Quiz({ module, topic, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState([]);

  const { updateProgress } = useProgress();
  const { saveQuizResult } = useQuizResults();

  const question = topic.questions[currentQuestion];

  const handleAnswer = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    setAnswers([...answers, { question: currentQuestion, selected: index, correct: question.correct }]);
    if (index === question.correct) setScore(score + 1);
  };

  const handleNext = async () => {
    if (currentQuestion < topic.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      const passed = (score / topic.questions.length) >= 0.7;
      
      // Save quiz result
      await saveQuizResult(module.id, topic.id, score, topic.questions.length, passed, answers);
      
      // Update progress if passed
      if (passed) {
        await updateProgress(module.id, topic.id, true, score);
      }
      
      setShowResult(true);
    }
  };

  if (showResult) {
    const percentage = Math.round((score / topic.questions.length) * 100);
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
            {percentage >= 70 ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{percentage >= 70 ? 'Bestanden!' : 'Nicht bestanden'}</h2>
          <p className="text-gray-500 mb-6">{score}/{topic.questions.length} richtig ({percentage}%)</p>
          <button onClick={onBack} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium">Zurück zum Modul</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{topic.title}</h3>
          <span className="text-sm text-gray-500">{currentQuestion + 1}/{topic.questions.length}</span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentQuestion + 1) / topic.questions.length) * 100}%` }}></div>
        </div>

        <h4 className="text-lg font-semibold text-gray-900 mb-6">{question.question}</h4>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={answered}
              className={`w-full p-4 text-left rounded-xl border-2 transition ${
                answered
                  ? index === question.correct ? 'border-green-500 bg-green-50'
                    : index === selectedAnswer ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <>
            <div className={`p-4 rounded-xl mb-6 ${selectedAnswer === question.correct ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className="text-sm">{question.explanation}</p>
            </div>
            <button onClick={handleNext} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium">
              {currentQuestion < topic.questions.length - 1 ? 'Weiter' : 'Ergebnis'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

// ============================================
// PERSONA SELECTION
// ============================================
function PersonaSelection({ onSelect, onBack }) {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Wähle einen Kunden</h2>

      <div className="grid grid-cols-2 gap-6">
        {personas.map(persona => (
          <div 
            key={persona.id}
            onClick={() => onSelect(persona)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:border-indigo-200 cursor-pointer transition"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{persona.image}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{persona.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    persona.difficulty === 'Einsteiger' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {persona.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{persona.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {persona.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
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

// ============================================
// VOICE CHAT
// ============================================
function VoiceChat({ persona, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const { saveSession } = useRollenspiele();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: `Guten Tag, mein Name ist ${persona.firstName}. Wie kann ich Ihnen helfen?` }]);
  }, [persona]);

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputText('');
    setIsProcessing(true);

    try {
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
          systemPrompt: persona.systemPrompt
        })
      });
      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      
      const ttsResponse = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply, voice: persona.voiceType || 'onyx' })
      });
      const ttsData = await ttsResponse.json();
      const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      new Audio(URL.createObjectURL(audioBlob)).play();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const response = await fetch('/.netlify/functions/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 })
            });
            const data = await response.json();
            if (data.text) sendMessage(data.text);
          } catch (error) {
            console.error('Error:', error);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const endSession = async () => {
    // Save session with messages
    await saveSession(persona.id, messages, null, null, {});
    onBack();
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={endSession} className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Gespräch beenden
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3" style={{ backgroundColor: persona.color + '10' }}>
          <div className="text-4xl">{persona.image}</div>
          <div>
            <h3 className="font-bold text-gray-900">{persona.name}</h3>
            <p className="text-sm text-gray-500">{persona.difficulty}</p>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`p-3 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder="Nachricht..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={isProcessing || !inputText.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

// ============================================
// MAIN APP CONTENT
// ============================================
function AppContent() {
  const { user, profile, loading } = useAuth();
  const [view, setView] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleBack = () => {
    if (view === 'voicechat') { setView('personas'); setSelectedPersona(null); }
    else if (view === 'personas') { setView('dashboard'); }
    else if (view === 'quiz') { setView('module'); setSelectedTopic(null); }
    else if (view === 'module') { setView('dashboard'); setSelectedModule(null); }
    else { setView('dashboard'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {profile?.role === 'betreiber' && <BetreiberDashboard />}
      {profile?.role === 'arbeitgeber' && <ArbeitgeberDashboard />}
      {profile?.role === 'lernender' && (
        <>
          {view === 'dashboard' && (
            <LernenderDashboard 
              onSelectModule={(m) => { setSelectedModule(m); setView('module'); }}
              onStartRoleplay={() => setView('personas')}
              onStartTutor={() => {}}
            />
          )}
          {view === 'module' && selectedModule && (
            <ModuleDetail 
              module={selectedModule} 
              onBack={handleBack}
              onSelectTopic={(t) => { setSelectedTopic(t); setView('quiz'); }}
            />
          )}
          {view === 'quiz' && selectedTopic && selectedModule && (
            <Quiz module={selectedModule} topic={selectedTopic} onBack={handleBack} />
          )}
          {view === 'personas' && (
            <PersonaSelection onSelect={(p) => { setSelectedPersona(p); setView('voicechat'); }} onBack={handleBack} />
          )}
          {view === 'voicechat' && selectedPersona && (
            <VoiceChat persona={selectedPersona} onBack={handleBack} />
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// APP WITH AUTH PROVIDER
// ============================================
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
