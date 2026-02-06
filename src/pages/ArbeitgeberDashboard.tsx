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
      {/* Hero */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 md:p-8 mb-6 text-white animate-slide-in">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{profile?.firma || 'Firma'}</h1>
        <p className="text-indigo-100 mb-4">Mitarbeiter-Fortschritt im Überblick</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{users.length}</div>
            <div className="text-sm text-indigo-100">Mitarbeiter</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{avgProgress}%</div>
            <div className="text-sm text-indigo-100">Ø Fortschritt</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{users.reduce((acc, u) => acc + (u.quiz_ergebnisse?.filter(q => q.passed).length || 0), 0)}</div>
            <div className="text-sm text-indigo-100">Quiz bestanden</div>
          </div>
        </div>
      </div>

      {/* Employee Grid */}
      <h2 className="text-xl font-bold text-slate-800 mb-4">Mitarbeiter</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 card-shadow text-center">
            <p className="text-slate-500">Noch keine Mitarbeiter registriert</p>
          </div>
        ) : users.map(user => {
          const userProgress = calculateUserProgress(user);
          const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
          return (
            <div key={user.id} className="bg-white rounded-2xl p-5 card-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                  {initials}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{user.name || 'Benutzer'}</h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">Fortschritt</span>
                  <span className="font-medium text-slate-800">{userProgress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full progress-bar-animate ${userProgress === 100 ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${userProgress}%` }}></div>
                </div>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Quiz:</span>
                  <span className="font-medium text-slate-800 ml-1">{user.quiz_ergebnisse?.filter(q => q.passed).length || 0} bestanden</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
