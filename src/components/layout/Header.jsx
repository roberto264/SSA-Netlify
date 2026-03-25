import { useState, useRef, useEffect } from 'react';
import { Sun, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from '../islands/IslandWrapper';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const roleLabels = {
    betreiber: 'Admin',
    arbeitgeber: 'Firma',
    lernender: 'Lernender',
    privat: 'Privat',
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0F172A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Sun className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:block">Swiss Solar Academy</span>
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xs font-semibold text-emerald-400">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium leading-tight">{profile?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{roleLabels[profile?.role] || ''}{profile?.firma ? ` · ${profile.firma}` : ''}</p>
            </div>
            <ChevronDown className={cn("h-3.5 w-3.5 text-slate-400 transition-transform", menuOpen && "rotate-180")} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 text-slate-900">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium">{profile?.name}</p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Einstellungen
              </button>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Abmelden
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
