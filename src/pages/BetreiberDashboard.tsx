import { useState } from 'react';
import { ArrowLeft, Loader2, Search, Trophy, MessageCircle, BarChart3, Target } from 'lucide-react';
import { useAllUsers } from '../lib/database';
import { modules } from '../lib/contentLoader';
import { personas } from '../lib/contentLoader';
import { StarRating } from '../components/common';

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

  const avgSoftSkills = {
    gesprachsfuhrung: 0, aktives_zuhoren: 0, klarheit: 0,
    einwand_behandlung: 0, empathie: 0, uberzeugungskraft: 0
  };

  const sessions = user.rollenspiel_sessions || [];
  if (sessions.length > 0) {
    Object.keys(avgSoftSkills).forEach(key => {
      const values = sessions.filter(s => s[key]).map(s => s[key]);
      avgSoftSkills[key] = values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    });
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" /> Zurück zur Übersicht
      </button>

      <div className="bg-white rounded-2xl p-6 card-shadow mb-6 animate-slide-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl">
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{user.name || 'Benutzer'}</h1>
              <p className="text-slate-500">{user.firma} - {user.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-indigo-600">{calculateProgress()}%</p>
            <p className="text-sm text-slate-500">Gesamtfortschritt</p>
          </div>
        </div>

        <h3 className="font-semibold text-slate-800 mb-4">Modulfortschritt</h3>
        <div className="space-y-3">
          {modules.map(module => {
            const prog = getModuleProgress(module.id);
            return (
              <div key={module.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700">{module.icon} {module.title}</span>
                  <span className="font-medium">{prog}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${module.color} rounded-full progress-bar-animate`} style={{ width: `${prog}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Soft Skills */}
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-indigo-600" /> Soft-Skills Bewertung
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Gesprächsführung</span><StarRating rating={avgSoftSkills.gesprachsfuhrung} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Aktives Zuhören</span><StarRating rating={avgSoftSkills.aktives_zuhoren} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Klarheit</span><StarRating rating={avgSoftSkills.klarheit} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Einwandbehandlung</span><StarRating rating={avgSoftSkills.einwand_behandlung} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Empathie</span><StarRating rating={avgSoftSkills.empathie} /></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-700">Überzeugungskraft</span><StarRating rating={avgSoftSkills.uberzeugungskraft} /></div>
          </div>
        </div>

        {/* Quiz & Roleplay */}
        <div className="bg-white rounded-2xl p-6 card-shadow">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-600" /> Aktivitäten
          </h3>

          <h4 className="text-sm font-medium text-slate-600 mb-2">Quiz-Ergebnisse</h4>
          <div className="space-y-2 mb-4">
            {(!user.quiz_ergebnisse || user.quiz_ergebnisse.length === 0) ? (
              <p className="text-sm text-slate-400">Noch keine Quiz absolviert</p>
            ) : (user.quiz_ergebnisse || []).slice(0, 5).map((quiz, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{modules.find(m => m.id === quiz.modul_id)?.title || 'Unbekannt'}</span>
                <span className={`text-sm font-medium ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>{quiz.score}/{quiz.max_score}</span>
              </div>
            ))}
          </div>

          <h4 className="text-sm font-medium text-slate-600 mb-2">Rollenspiele ({sessions.length})</h4>
          <div className="space-y-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-slate-400">Noch keine Rollenspiele</p>
            ) : sessions.slice(0, 3).map((session, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{personas.find(p => p.id === session.persona_id)?.name || session.persona_id}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  session.rating === 'gut' ? 'bg-green-100 text-green-700' :
                  session.rating === 'mittel' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>{session.rating || 'Offen'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export function BetreiberDashboard() {
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </main>
    );
  }

  const avgProgress = users.length > 0
    ? Math.round(users.reduce((acc, u) => acc + calculateUserProgress(u), 0) / users.length)
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{users.length}</span>
          </div>
          <p className="text-sm text-slate-500">Benutzer gesamt</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{firmen.length}</span>
          </div>
          <p className="text-sm text-slate-500">Firmen</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-slate-800">{avgProgress}%</span>
          </div>
          <p className="text-sm text-slate-500">Ø Fortschritt</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-green-600">
              {users.reduce((acc, u) => acc + (u.quiz_ergebnisse?.filter(q => q.passed).length || 0), 0)}
            </span>
          </div>
          <p className="text-sm text-slate-500">Quiz bestanden</p>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 transition-colors"
              />
            </div>
            <select
              value={filterFirma}
              onChange={(e) => setFilterFirma(e.target.value)}
              className="px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 transition-colors"
            >
              <option value="alle">Alle Firmen</option>
              {firmen.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Firma</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Fortschritt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Quiz</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Rollenspiele</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const userProgress = calculateUserProgress(user);
                return (
                  <tr key={user.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-xs">
                          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">{user.name || 'Unbekannt'}</span>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{user.firma || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${userProgress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${userProgress}%` }}></div>
                        </div>
                        <span className="text-sm text-slate-600">{userProgress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{user.quiz_ergebnisse?.filter(q => q.passed).length || 0}</td>
                    <td className="px-4 py-3 text-slate-600 text-sm">{user.rollenspiel_sessions?.length || 0}</td>
                    <td className="px-4 py-3">
                      <button className="text-indigo-600 hover:text-indigo-800 font-medium text-sm">Details →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
