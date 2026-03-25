import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { useFirmaUsers, useFirmaSubscription } from '../../lib/database';
import { useModules } from '../../hooks/useContent';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import SubscriptionCard from '@/components/billing/SubscriptionCard';
import SeatManager from '@/components/billing/SeatManager';
import InviteWidget from '@/components/billing/InviteWidget';
import EmployeeDetail from '@/components/EmployeeDetail';

export function ArbeitgeberDashboard() {
  const { profile } = useAuth();
  const { users, loading, refresh: refreshUsers } = useFirmaUsers(profile?.firma);
  const { firma, loading: firmaLoading, refresh: refreshFirma } = useFirmaSubscription();
  const [selectedUser, setSelectedUser] = useState(null);
  const { data: modules, loading: modulesLoading } = useModules();

  const calculateUserProgress = (user) => {
    const completed = user.modul_fortschritt?.filter((p) => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getQuizPassed = (user) =>
    user.quiz_ergebnisse?.filter((q) => q.passed).length || 0;

  const getSessionCount = (user) =>
    user.rollenspiel_sessions?.length || 0;

  const getAvgSoftSkill = (user) => {
    const sessions = user.rollenspiel_sessions || [];
    const keys = ['gesprachsfuhrung', 'aktives_zuhoren', 'klarheit', 'einwand_behandlung', 'empathie', 'uberzeugungskraft'];
    let total = 0, count = 0;
    for (const s of sessions) {
      for (const k of keys) {
        if (s[k] != null) { total += s[k]; count++; }
      }
    }
    return count > 0 ? (total / count).toFixed(1) : null;
  };

  const getLastRating = (user) => {
    const rated = (user.rollenspiel_sessions || []).filter(s => s.rating).slice(-1)[0];
    return rated?.rating || null;
  };

  if (loading || modulesLoading || !modules) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  // Detail view
  if (selectedUser) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <EmployeeDetail user={selectedUser} onBack={() => setSelectedUser(null)} />
      </main>
    );
  }

  const avgProgress = users.length > 0
    ? Math.round(users.reduce((acc, u) => acc + calculateUserProgress(u), 0) / users.length)
    : 0;

  const totalSessions = users.reduce((acc, u) => acc + getSessionCount(u), 0);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] p-6 md:p-8 text-white animate-slide-in">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{profile?.firma || 'Firma'}</h1>
          <p className="text-slate-400 mb-6">Mitarbeiter-Fortschritt im Überblick</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { value: users.length, label: 'Mitarbeiter' },
              { value: `${avgProgress}%`, label: 'Ø Fortschritt' },
              { value: users.reduce((acc, u) => acc + getQuizPassed(u), 0), label: 'Quiz bestanden' },
              { value: totalSessions, label: 'Rollenspiele' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold">{value}</div>
                <div className="text-xs sm:text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Section */}
      {firma && !firmaLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriptionCard firma={firma} activeSeats={users.length} onUpdate={refreshFirma} />
          <SeatManager users={users} seatLimit={firma.seat_limit || 1} currentUserId={profile?.id} onUserRemoved={refreshUsers} />
        </div>
      )}

      {/* Invite Widget */}
      <InviteWidget onInvited={refreshUsers} />

      {/* Employee Grid — klickbar */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Mitarbeiter {users.length > 0 && <span className="text-muted-foreground font-normal">({users.length})</span>}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.length === 0 ? (
            <Card className="col-span-full border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Noch keine Mitarbeiter registriert. Lade Mitarbeiter über das Einladungsformular oben ein.</p>
              </CardContent>
            </Card>
          ) : users.map((user) => {
            const userProgress = calculateUserProgress(user);
            const initials = user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || '?';
            const quizPassed = getQuizPassed(user);
            const sessionCount = getSessionCount(user);
            const avgSkill = getAvgSoftSkill(user);
            const lastRating = getLastRating(user);

            return (
              <Card
                key={user.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-11 w-11 bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">{user.name || 'Benutzer'}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {lastRating && (
                      <Badge
                        variant={lastRating === 'gut' ? 'default' : lastRating === 'schwach' ? 'destructive' : 'secondary'}
                        className="text-[10px]"
                      >
                        {lastRating}
                      </Badge>
                    )}
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Fortschritt</span>
                      <span className="font-medium text-foreground">{userProgress}%</span>
                    </div>
                    <Progress
                      value={userProgress}
                      className="h-2"
                      indicatorClassName={userProgress === 100 ? 'bg-emerald-500' : 'bg-emerald-500'}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Quiz: <span className="font-medium text-foreground">{quizPassed}</span></span>
                    <span>Rollenspiele: <span className="font-medium text-foreground">{sessionCount}</span></span>
                    {avgSkill && <span>Ø Skills: <span className="font-medium text-foreground">{avgSkill}/5</span></span>}
                  </div>

                  <p className="text-[10px] text-primary mt-3 text-right">Details ansehen →</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
