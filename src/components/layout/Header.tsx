import { useState, useRef, useEffect } from 'react';
import { Sun, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const roleConfig: Record<string, { label: string; variant: 'destructive' | 'secondary' | 'default'; avatarBg: string }> = {
    betreiber: { label: 'Admin', variant: 'destructive', avatarBg: 'bg-slate-900' },
    arbeitgeber: { label: 'Arbeitgeber', variant: 'secondary', avatarBg: 'bg-purple-600' },
    lernender: { label: 'Lernender', variant: 'default', avatarBg: 'bg-primary' },
    privat: { label: 'Privat', variant: 'default', avatarBg: 'bg-blue-600' },
  };

  const role = roleConfig[profile?.role as string] || roleConfig.lernender;

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-14 sm:h-16 items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold tracking-tight text-foreground">Swiss Solar Academy</h1>
            <p className="text-[10px] text-muted-foreground leading-none">Powered by Gama AG</p>
          </div>
        </button>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-tight">{profile?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground leading-tight">{profile?.firma || ''}</p>
            </div>
            <Badge variant={role.variant} className="hidden sm:inline-flex text-[10px]">
              {role.label}
            </Badge>
            <Avatar className={cn("h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all", role.avatarBg)}>
              <AvatarFallback className={cn("text-white text-xs font-semibold", role.avatarBg)}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Einstellungen
              </button>
              <div className="border-t border-border my-1" />
              <button
                onClick={() => { signOut(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
