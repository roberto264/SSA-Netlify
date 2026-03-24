import { useState } from 'react';
import { ArrowLeft, Loader2, Search, Trophy, MessageCircle, BarChart3, Target } from 'lucide-react';
import { useAllUsers } from '../lib/database';
import { modules } from '../lib/contentLoader';
import { personas } from '../lib/contentLoader';
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
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${module.color} rounded-full transition-all duration-500`} style={{ width: `${prog}%` }} />
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFirma, setFilterFirma] = useState('alle');

  const firmen = [...new Set(users.map((u: any) => u.firma).filter(Boolean))];

  const filteredUsers = users.filter((u: any) => {
    if (filterFirma !== 'alle' && u.firma !== filterFirma) return false;
    if (searchTerm && !u.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
          <Card key={label} className="border-0 shadow-sm">
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

      {/* User Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
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
              {firmen.map((f: string) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
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
      </Card>
    </main>
  );
}
