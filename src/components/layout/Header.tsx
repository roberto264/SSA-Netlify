import { Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export function Header() {
  const { signOut, profile } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center">
            <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-bold text-indigo-950">Swiss Solar Academy</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Powered by Gama AG</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{profile?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{profile?.firma || profile?.role}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full hidden sm:inline-block ${
              profile?.role === 'betreiber' ? 'bg-red-100 text-red-700' :
              profile?.role === 'arbeitgeber' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {profile?.role === 'betreiber' ? 'Admin' :
               profile?.role === 'arbeitgeber' ? 'Arbeitgeber' : 'Lernender'}
            </span>
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base ${
              profile?.role === 'betreiber' ? 'bg-indigo-950' :
              profile?.role === 'arbeitgeber' ? 'bg-purple-600' :
              'bg-indigo-600'
            }`}>
              {profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <button
              onClick={signOut}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Abmelden"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
