import { Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800">Swiss Solar Academy</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Powered by Gama AG</p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800">{profile?.name || 'User'}</p>
            <p className="text-xs text-slate-500">{profile?.firma || profile?.role}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-lg hidden sm:inline-block ${
            profile?.role === 'betreiber' ? 'bg-red-100 text-red-700' :
            profile?.role === 'arbeitgeber' ? 'bg-purple-100 text-purple-700' :
            'bg-blue-100 text-blue-700'
          }`}>
            {profile?.role === 'betreiber' ? 'Admin' :
             profile?.role === 'arbeitgeber' ? 'Arbeitgeber' : 'Lernender'}
          </span>
          <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
            profile?.role === 'betreiber' ? 'bg-indigo-950' :
            profile?.role === 'arbeitgeber' ? 'bg-purple-600' :
            'bg-indigo-600'
          }`}>
            {initials}
          </div>
          <button
            onClick={signOut}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 transition-colors"
            title="Abmelden"
          >
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
