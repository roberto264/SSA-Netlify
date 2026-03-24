import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useFirmaUsers, useFirmaSubscription } from '../lib/database';
import { modules } from '../lib/contentLoader';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import SubscriptionCard from '@/components/billing/SubscriptionCard';
import SeatManager from '@/components/billing/SeatManager';

export function ArbeitgeberDashboard() {
  const { profile } = useAuth();
  const { users, loading } = useFirmaUsers(profile?.firma);
  const { firma, loading: firmaLoading } = useFirmaSubscription();

  const calculateUserProgress = (user: any) => {
    const completed = user.modul_fortschritt?.filter((p: any) => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const avgProgress = users.length > 0
    ? Math.round(users.reduce((acc, u) => acc + calculateUserProgress(u), 0) / users.length)
    : 0;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-indigo-800 p-6 md:p-8 text-white animate-slide-in">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{profile?.firma || 'Firma'}</h1>
          <p className="text-indigo-200 mb-6">Mitarbeiter-Fortschritt im Überblick</p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { value: users.length, label: 'Mitarbeiter' },
              { value: `${avgProgress}%`, label: 'Ø Fortschritt' },
              { value: users.reduce((acc, u) => acc + (u.quiz_ergebnisse?.filter((q: any) => q.passed).length || 0), 0), label: 'Quiz bestanden' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold">{value}</div>
                <div className="text-xs sm:text-sm text-indigo-200">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Billing Section */}
      {firma && !firmaLoading && (
        <div className="grid md:grid-cols-2 gap-6">
          <SubscriptionCard firma={firma} activeSeats={users.length} />
          <SeatManager users={users} seatLimit={firma.seat_limit || 5} />
        </div>
      )}

      {/* Employee Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Mitarbeiter</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.length === 0 ? (
            <Card className="col-span-full border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Noch keine Mitarbeiter registriert</p>
              </CardContent>
            </Card>
          ) : users.map((user: any) => {
            const userProgress = calculateUserProgress(user);
            const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
            return (
              <Card key={user.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-11 w-11 bg-primary/10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{user.name || 'Benutzer'}</h3>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">Fortschritt</span>
                      <span className="font-medium text-foreground">{userProgress}%</span>
                    </div>
                    <Progress
                      value={userProgress}
                      className="h-2"
                      indicatorClassName={userProgress === 100 ? 'bg-emerald-500' : 'bg-primary'}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Quiz: <span className="font-medium text-foreground">{user.quiz_ergebnisse?.filter((q: any) => q.passed).length || 0} bestanden</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
