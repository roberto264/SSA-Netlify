import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useFirmaUsers } from '../lib/database';
import { modules } from '../lib/contentLoader';

export function ArbeitgeberDashboard() {
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
