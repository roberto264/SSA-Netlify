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
    <main className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Zurück zur Übersicht
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
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" /> Modulfortschritt
            </h4>
            <div className="space-y-3">
              {modules.map(module => (
                <div key={module.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{module.title}</span>
                    <span className="font-medium">{getModuleProgress(module.id)}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${getModuleProgress(module.id) === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${getModuleProgress(module.id)}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-600" /> Kommunikation
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Gesprächsführung</span><StarRating rating={avgSoftSkills.gesprachsfuhrung} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Aktives Zuhören</span><StarRating rating={avgSoftSkills.aktives_zuhoren} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Klarheit</span><StarRating rating={avgSoftSkills.klarheit} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Einwandbehandlung</span><StarRating rating={avgSoftSkills.einwand_behandlung} /></div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-4 mt-6 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" /> Verkaufstalent
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Empathie</span><StarRating rating={avgSoftSkills.empathie} /></div>
              <div className="flex items-center justify-between"><span className="text-sm text-gray-600">Überzeugungskraft</span><StarRating rating={avgSoftSkills.uberzeugungskraft} /></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-600" /> Quiz-Ergebnisse
            </h4>
            <div className="space-y-2 mb-6">
              {(user.quiz_ergebnisse || []).slice(0, 5).map((quiz, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{modules.find(m => m.id === quiz.modul_id)?.title || 'Unbekannt'}</span>
                  <span className={`text-sm font-medium ${quiz.passed ? 'text-green-600' : 'text-red-600'}`}>{quiz.score}/{quiz.max_score}</span>
                </div>
              ))}
              {(!user.quiz_ergebnisse || user.quiz_ergebnisse.length === 0) && (
                <p className="text-sm text-gray-500">Noch keine Quiz absolviert</p>
              )}
            </div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-purple-600" /> Rollenspiele ({sessions.length})
            </h4>
            <div className="space-y-2">
              {sessions.slice(0, 3).map((session, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm">{personas.find(p => p.id === session.persona_id)?.name || session.persona_id}</span>
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
            {users.length > 0 ? Math.round(users.reduce((acc, u) => acc + calculateUserProgress(u), 0) / users.length) : 0}%
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
              <input type="text" placeholder="Suchen..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40" />
            </div>
            <select value={filterFirma} onChange={(e) => setFilterFirma(e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
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
                  <td className="px-5 py-4"><button className="text-indigo-600 text-sm font-medium">Details →</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
