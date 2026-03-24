import { useState } from 'react';
import { Loader2, Search, Trophy, MessageCircle, BarChart3, Target, CreditCard, Users, Building2, Clock } from 'lucide-react';
import { useAllUsers, useFirmen } from '../lib/database';
import { modules } from '../lib/contentLoader';
import { StarRating } from '../components/common';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

function UserProfile({ user, onBack }: { user: any; onBack: () => void }) {
  const calculateProgress = () => {
    const completed = user.modul_fortschritt?.filter((p: any) => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const getModuleProgress = (moduleId: number) => {
    const module = modules.find(m => m.id === moduleId);
    if (!module) return 0;
    const completed = user.modul_fortschritt?.filter((p: any) => p.modul_id === moduleId && p.completed).length || 0;
    return module.topics.length > 0 ? Math.round((completed / module.topics.length) * 100) : 0;
  };

  const avgSoftSkills: Record<string, number> = {
    gesprachsfuhrung: 0, aktives_zuhoren: 0, klarheit: 0,
    einwand_behandlung: 0, empathie: 0, uberzeugungskraft: 0
  };

  const sessions = user.rollenspiel_sessions || [];
  if (sessions.length > 0) {
    Object.keys(avgSoftSkills).forEach(key => {
      const values = sessions.filter((s: any) => s[key]).map((s: any) => s[key]);
      avgSoftSkills[key] = values.length > 0 ? Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length) : 0;
    });
  }

  const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
        <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
      </Button>

      <Card className="border-0 shadow-sm animate-slide-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">{user.name || 'Benutzer'}</h1>
                <p className="text-muted-foreground text-sm">{user.firma} · {user.email}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl sm:text-4xl font-bold text-primary">{calculateProgress()}%</p>
              <p className="text-xs text-muted-foreground">Gesamtfortschritt</p>
            </div>
          </div>

          <h3 className="font-semibold text-foreground mb-4">Modulfortschritt</h3>
          <div className="space-y-3">
            {modules.map(module => {
              const prog = getModuleProgress(module.id);
              return (
                <div key={module.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-foreground">{module.icon} {module.title}</span>
                    <span className="font-medium text-muted-foreground">{prog}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${prog}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Soft Skills */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" /> Soft-Skills Bewertung
            </h3>
            <div className="space-y-3">
              {[
                ['Gesprächsführung', avgSoftSkills.gesprachsfuhrung],
                ['Aktives Zuhören', avgSoftSkills.aktives_zuhoren],
                ['Klarheit', avgSoftSkills.klarheit],
                ['Einwandbehandlung', avgSoftSkills.einwand_behandlung],
                ['Empathie', avgSoftSkills.empathie],
                ['Überzeugungskraft', avgSoftSkills.uberzeugungskraft],
              ].map(([label, value]) => (
                <div key={label as string} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{label}</span>
                  <StarRating rating={value as number} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quiz & Roleplay */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Aktivitäten
            </h3>

            <h4 className="text-sm font-medium text-muted-foreground mb-2">Quiz-Ergebnisse</h4>
            <div className="space-y-1.5 mb-4">
              {(!user.quiz_ergebnisse || user.quiz_ergebnisse.length === 0) ? (
                <p className="text-sm text-muted-foreground">Noch keine Quiz absolviert</p>
              ) : (user.quiz_ergebnisse || []).slice(0, 5).map((quiz: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-foreground">{modules.find(m => m.id === quiz.modul_id)?.title || 'Unbekannt'}</span>
                  <span className={`text-sm font-medium ${quiz.passed ? 'text-emerald-600' : 'text-destructive'}`}>
                    {quiz.score}/{quiz.max_score}
                  </span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-muted-foreground mb-2">Rollenspiele ({sessions.length})</h4>
            <div className="space-y-1.5">
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Rollenspiele</p>
              ) : sessions.slice(0, 3).map((session: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-foreground">{personas.find(p => p.id === session.persona_id)?.name || session.persona_id}</span>
                  <Badge variant={
                    session.rating === 'gut' ? 'success' :
                    session.rating === 'mittel' ? 'warning' : 'destructive'
                  }>
                    {session.rating || 'Offen'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export function BetreiberDashboard() {
  const { users, loading } = useAllUsers();
  const { firmen: allFirmen, loading: firmenLoading } = useFirmen();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'billing'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFirma, setFilterFirma] = useState('alle');
  const [filterRole, setFilterRole] = useState('alle');

  const firmen = [...new Set(users.map((u: any) => u.firma).filter(Boolean))];

  const filteredUsers = users.filter((u: any) => {
    if (filterFirma !== 'alle' && u.firma !== filterFirma) return false;
    if (filterRole !== 'alle' && u.role !== filterRole) return false;
    if (searchTerm && !u.name?.toLowerCase().includes(searchTerm.toLowerCase()) && !u.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const calculateUserProgress = (user: any) => {
    const completed = user.modul_fortschritt?.filter((p: any) => p.completed).length || 0;
    const total = modules.reduce((acc, m) => acc + m.topics.length, 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  if (selectedUser) {
    return <UserProfile user={selectedUser} onBack={() => setSelectedUser(null)} />;
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  const avgProgress = users.length > 0
    ? Math.round(users.reduce((acc: number, u: any) => acc + calculateUserProgress(u), 0) / users.length)
    : 0;

  // Billing stats
  const privatUsers = users.filter((u: any) => u.role === 'privat');
  const activeSubs = allFirmen.filter((f: any) => f.subscription_status === 'active').length;
  const trialingSubs = allFirmen.filter((f: any) => f.subscription_status === 'trialing').length;
  const totalSeats = allFirmen.reduce((acc: number, f: any) => acc + (f.seat_limit || 0), 0);

  const statsData = [
    { label: 'Benutzer gesamt', value: users.length, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Firmen', value: firmen.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Ø Fortschritt', value: `${avgProgress}%`, icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Quiz bestanden', value: users.reduce((acc: number, u: any) => acc + (u.quiz_ergebnisse?.filter((q: any) => q.passed).length || 0), 0), icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsData.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-2xl font-bold text-foreground">{value}</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'users' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" /> Benutzer
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'billing' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <CreditCard className="h-4 w-4" /> Abrechnung
        </button>
      </div>

      {/* Billing Tab */}
      {activeTab === 'billing' && (
        <BillingOverview allFirmen={allFirmen} users={users} privatUsers={privatUsers} activeSubs={activeSubs} trialingSubs={trialingSubs} totalSeats={totalSeats} />
      )}

      {/* User Table */}
      {activeTab === 'users' && <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Benutzer suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterFirma}
              onChange={(e) => setFilterFirma(e.target.value)}
              className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="alle">Alle Firmen</option>
              <option value="">(Ohne Firma)</option>
              {firmen.map((f: string) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="alle">Alle Rollen</option>
              <option value="privat">Privat</option>
              <option value="lernender">Lernender</option>
              <option value="arbeitgeber">Arbeitgeber</option>
              <option value="betreiber">Betreiber</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rolle</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Firma</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fortschritt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quiz</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rollenspiele</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((user: any) => {
                const userProgress = calculateUserProgress(user);
                const initials = user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '?';
                return (
                  <tr key={user.id} className="hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setSelectedUser(user)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-primary/10">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium text-foreground text-sm">{user.name || 'Unbekannt'}</span>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        user.role === 'betreiber' ? 'destructive' :
                        user.role === 'arbeitgeber' ? 'secondary' :
                        user.role === 'privat' ? 'outline' : 'default'
                      } className="text-[10px]">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.firma || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20">
                          <Progress
                            value={userProgress}
                            className="h-1.5"
                            indicatorClassName={userProgress === 100 ? 'bg-emerald-500' : 'bg-primary'}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{userProgress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.quiz_ergebnisse?.filter((q: any) => q.passed).length || 0}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{user.rollenspiel_sessions?.length || 0}</td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="text-primary">
                        Details →
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>}
    </main>
  );
}

// ─── Billing Overview (Admin) ─────────────────────────────────
function BillingOverview({ allFirmen, users, privatUsers, activeSubs, trialingSubs, totalSeats }: any) {
  const statusColors: Record<string, string> = {
    active: 'text-green-600 bg-green-50',
    trialing: 'text-blue-600 bg-blue-50',
    past_due: 'text-amber-600 bg-amber-50',
    canceled: 'text-red-600 bg-red-50',
    unpaid: 'text-gray-600 bg-gray-50',
    incomplete: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="space-y-6">
      {/* Billing KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Aktive Abos', value: activeSubs, icon: CreditCard, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'In Testphase', value: trialingSubs, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Gebuchte Seats', value: totalSeats, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Privat-User', value: privatUsers.length, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-1.5">
                <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-2xl font-bold text-foreground">{value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Firmen-Tabelle */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 sm:p-5 border-b border-border">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Firmen & Abonnements
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Firma</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Seats</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mitarbeiter</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Trial / Abo-Ende</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stripe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allFirmen.map((f: any) => {
                  const firmaUserCount = users.filter((u: any) => u.firma === f.name).length;
                  const endDate = f.current_period_end
                    ? new Date(f.current_period_end).toLocaleDateString('de-CH')
                    : f.trial_ends_at
                      ? new Date(f.trial_ends_at).toLocaleDateString('de-CH') + ' (Trial)'
                      : '–';

                  return (
                    <tr key={f.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground text-sm">{f.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${statusColors[f.subscription_status] || 'text-gray-500 bg-gray-50'}`}>
                          {f.subscription_status || '–'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{f.seat_limit || 0}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{firmaUserCount}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{endDate}</td>
                      <td className="px-4 py-3">
                        {f.stripe_customer_id ? (
                          <Badge variant="default" className="text-[10px]">Verknüpft</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">–</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {allFirmen.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Keine Firmen vorhanden</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Privat-User */}
      {privatUsers.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="p-4 sm:p-5 border-b border-border">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Target className="h-5 w-5" />
                Privat-User ({privatUsers.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">E-Mail</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Trial-Ende</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Stripe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {privatUsers.map((u: any) => (
                    <tr key={u.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-medium text-foreground">{u.name || '–'}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${statusColors[u.subscription_status] || 'text-gray-500 bg-gray-50'}`}>
                          {u.subscription_status || '–'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {u.trial_ends_at ? new Date(u.trial_ends_at).toLocaleDateString('de-CH') : '–'}
                      </td>
                      <td className="px-4 py-3">
                        {u.stripe_customer_id ? (
                          <Badge variant="default" className="text-[10px]">Verknüpft</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">–</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
