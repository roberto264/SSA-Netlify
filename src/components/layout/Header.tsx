import { Sun, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Header() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const roleConfig = {
    betreiber: { label: 'Admin', variant: 'destructive' as const, avatarBg: 'bg-slate-900' },
    arbeitgeber: { label: 'Arbeitgeber', variant: 'secondary' as const, avatarBg: 'bg-purple-600' },
    lernender: { label: 'Lernender', variant: 'default' as const, avatarBg: 'bg-primary' },
  };

  const role = roleConfig[profile?.role as keyof typeof roleConfig] || roleConfig.lernender;

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

        {/* User */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground leading-tight">{profile?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground leading-tight">{profile?.firma || ''}</p>
          </div>
          <Badge variant={role.variant} className="hidden sm:inline-flex text-[10px]">
            {role.label}
          </Badge>
          <Avatar className={cn("h-8 w-8 sm:h-9 sm:w-9", role.avatarBg)}>
            <AvatarFallback className={cn("text-white text-xs font-semibold", role.avatarBg)}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={signOut}
            title="Abmelden"
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
