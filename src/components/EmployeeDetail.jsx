/**
 * EmployeeDetail — Detailansicht eines Mitarbeiters für Arbeitgeber.
 * Zeigt: Fortschritt, Quiz-Ergebnisse, Rollenspiel-Bewertungen, Soft Skills, Aktivität.
 */
import { useState } from 'react';
import { ArrowLeft, BookOpen, Brain, MessageCircle, TrendingUp, Clock, Award, AlertTriangle, ChevronDown, ChevronUp, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useModules } from '../hooks/useContent';

export default function EmployeeDetail({ user, onBack }) {
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  const { data: modules } = useModules();
  if (!modules) return null;

  // Module Progress
  const totalTopics = modules.reduce((acc, m) => acc + m.topics.length, 0);
  const completedTopics = user.modul_fortschritt?.filter(p => p.completed).length || 0;
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Per module progress
  const moduleProgress = modules.map(m => {
    const moduleTopics = m.topics.length;
    const completed = user.modul_fortschritt?.filter(p => p.modul_id === m.id && p.completed).length || 0;
    return {
      id: m.id,
      title: m.title,
      completed,
      total: moduleTopics,
      percent: moduleTopics > 0 ? Math.round((completed / moduleTopics) * 100) : 0,
    };
  });

  // Quiz Results
  const quizResults = user.quiz_ergebnisse || [];
  const quizPassed = quizResults.filter(q => q.passed).length;
  const quizFailed = quizResults.filter(q => !q.passed).length;
  const avgQuizScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((acc, q) => acc + (q.score / q.max_score) * 100, 0) / quizResults.length)
    : 0;

  // Rollenspiel Sessions
  const sessions = user.rollenspiel_sessions || [];
  const ratedSessions = sessions.filter(s => s.rating);
  const sessionsByRating = {
    gut: ratedSessions.filter(s => s.rating === 'gut').length,
    mittel: ratedSessions.filter(s => s.rating === 'mittel').length,
    schwach: ratedSessions.filter(s => s.rating === 'schwach').length,
  };

  // Average soft skills across all sessions
  const softSkillKeys = ['gesprachsfuhrung', 'aktives_zuhoren', 'klarheit', 'einwand_behandlung', 'empathie', 'uberzeugungskraft'];
  const softSkillLabels = {
    gesprachsfuhrung: 'Gesprächsführung',
    aktives_zuhoren: 'Aktives Zuhören',
    klarheit: 'Klarheit',
    einwand_behandlung: 'Einwandbehandlung',
    empathie: 'Empathie',
    uberzeugungskraft: 'Überzeugungskraft',
  };

  const avgSoftSkills = softSkillKeys.map(key => {
    const values = sessions.filter(s => s[key] != null).map(s => s[key]);
    return {
      key,
      label: softSkillLabels[key],
      avg: values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)) : null,
      count: values.length,
    };
  });

  const overallSoftSkill = avgSoftSkills.filter(s => s.avg !== null);
  const avgOverall = overallSoftSkill.length > 0
    ? parseFloat((overallSoftSkill.reduce((acc, s) => acc + (s.avg || 0), 0) / overallSoftSkill.length).toFixed(1))
    : null;

  // Activity & Lernzeit
  const lastLogin = user.last_login ? new Date(user.last_login) : null;
  const memberSince = new Date(user.created_at);
  const daysSinceLogin = lastLogin ? Math.floor((Date.now() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null;

  // Aktive Tage (Tage mit mindestens einer Aktivität)
  const activityDates = new Set();
  (user.modul_fortschritt || []).forEach(p => {
    if (p.completed_at) activityDates.add(new Date(p.completed_at).toDateString());
  });
  (user.quiz_ergebnisse || []).forEach(q => {
    activityDates.add(new Date(q.created_at).toDateString());
  });
  sessions.forEach(s => {
    activityDates.add(new Date(s.created_at).toDateString());
  });
  const activeDays = activityDates.size;

  // Geschätzte Rollenspiel-Zeit (aus duration_seconds wenn vorhanden, sonst ~5min pro Session)
  const rollenspielMinutes = sessions.reduce((acc, s) => {
    const dur = s.duration_seconds;
    return acc + (dur ? Math.round(dur / 60) : 5);
  }, 0);

  // Geschätzte Quiz-Zeit (~3min pro Quiz)
  const quizMinutes = quizResults.length * 3;

  // Geschätzte Modul-Zeit (~10min pro abgeschlossenem Thema)
  const modulMinutes = completedTopics * 10;

  const totalLernMinuten = rollenspielMinutes + quizMinutes + modulMinutes;
  const lernStunden = Math.floor(totalLernMinuten / 60);
  const lernRestMinuten = totalLernMinuten % 60;

  // Performance Rating
  let performanceLevel = 'no_data';
  if (avgOverall !== null && overallProgress > 0) {
    const combined = (avgOverall / 5) * 0.5 + (overallProgress / 100) * 0.3 + (avgQuizScore / 100) * 0.2;
    if (combined >= 0.8) performanceLevel = 'excellent';
    else if (combined >= 0.6) performanceLevel = 'good';
    else if (combined >= 0.4) performanceLevel = 'average';
    else performanceLevel = 'needs_improvement';
  }

  const performanceConfig = {
    excellent: { label: 'Ausgezeichnet', color: 'bg-green-100 text-green-700', icon: Award },
    good: { label: 'Gut', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
    average: { label: 'Durchschnittlich', color: 'bg-amber-100 text-amber-700', icon: Clock },
    needs_improvement: { label: 'Verbesserungsbedarf', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
    no_data: { label: 'Keine Daten', color: 'bg-gray-100 text-gray-500', icon: Clock },
  };

  const perf = performanceConfig[performanceLevel];
  const PerfIcon = perf.icon;

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Zurück
        </Button>
      </div>

      {/* User Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 bg-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user.name || 'Benutzer'}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Dabei seit {memberSince.toLocaleDateString('de-CH')}
                  </span>
                  {lastLogin && (
                    <span className="text-xs text-muted-foreground">
                      · Letzter Login: {daysSinceLogin === 0 ? 'Heute' : daysSinceLogin === 1 ? 'Gestern' : `vor ${daysSinceLogin} Tagen`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${perf.color}`}>
              <PerfIcon className="h-4 w-4" />
              <span className="font-medium text-sm">{perf.label}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Fortschritt', value: `${overallProgress}%`, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Quiz bestanden', value: `${quizPassed}/${quizResults.length}`, icon: Brain, color: 'text-green-600' },
          { label: 'Rollenspiele', value: `${sessions.length}`, icon: MessageCircle, color: 'text-purple-600' },
          { label: 'Ø Soft Skills', value: avgOverall !== null ? `${avgOverall}/5` : '–', icon: TrendingUp, color: 'text-amber-600' },
          { label: 'Lernzeit', value: lernStunden > 0 ? `${lernStunden}h ${lernRestMinuten}m` : `${totalLernMinuten}m`, icon: Clock, color: 'text-indigo-600' },
          { label: 'Aktive Tage', value: `${activeDays}`, icon: Award, color: 'text-teal-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4 text-center">
              <Icon className={`h-5 w-5 mx-auto mb-2 ${color}`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lernzeit-Aufschlüsselung */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Lernzeit-Übersicht
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-xl font-bold text-blue-700">{modulMinutes}m</p>
              <p className="text-xs text-blue-600">Module & Themen</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <p className="text-xl font-bold text-green-700">{quizMinutes}m</p>
              <p className="text-xs text-green-600">Quiz</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg text-center">
              <p className="text-xl font-bold text-purple-700">{rollenspielMinutes}m</p>
              <p className="text-xs text-purple-600">Rollenspiele</p>
            </div>
          </div>
          {/* Visual bar */}
          {totalLernMinuten > 0 && (
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-muted">
              {modulMinutes > 0 && (
                <div className="bg-blue-500 h-full" style={{ width: `${(modulMinutes / totalLernMinuten) * 100}%` }} title={`Module: ${modulMinutes}m`} />
              )}
              {quizMinutes > 0 && (
                <div className="bg-green-500 h-full" style={{ width: `${(quizMinutes / totalLernMinuten) * 100}%` }} title={`Quiz: ${quizMinutes}m`} />
              )}
              {rollenspielMinutes > 0 && (
                <div className="bg-purple-500 h-full" style={{ width: `${(rollenspielMinutes / totalLernMinuten) * 100}%` }} title={`Rollenspiele: ${rollenspielMinutes}m`} />
              )}
            </div>
          )}
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Module</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Quiz</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Rollenspiele</div>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Geschätzte Werte basierend auf abgeschlossenen Aktivitäten. Tatsächliche Lernzeit kann abweichen.
          </p>
        </CardContent>
      </Card>

      {/* Module Progress */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Modulfortschritt
          </h3>
          <div className="space-y-3">
            {moduleProgress.map(m => (
              <div key={m.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{m.title}</span>
                  <span className="text-muted-foreground">{m.completed}/{m.total} Themen</span>
                </div>
                <Progress
                  value={m.percent}
                  className="h-2"
                  indicatorClassName={m.percent === 100 ? 'bg-emerald-500' : 'bg-primary'}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quiz Results */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Quiz-Ergebnisse
            </h3>
            {quizResults.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Noch keine Quiz absolviert.</p>
            ) : (
              <>
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{quizPassed}</p>
                    <p className="text-xs text-green-600">Bestanden</p>
                  </div>
                  <div className="flex-1 p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{quizFailed}</p>
                    <p className="text-xs text-red-600">Nicht bestanden</p>
                  </div>
                  <div className="flex-1 p-3 bg-blue-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-700">{avgQuizScore}%</p>
                    <p className="text-xs text-blue-600">Ø Score</p>
                  </div>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {quizResults.slice().reverse().map(q => (
                    <div key={q.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                      <span>Modul {q.modul_id} – {q.topic_id}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{q.score}/{q.max_score}</span>
                        <Badge variant={q.passed ? 'default' : 'destructive'} className="text-[10px]">
                          {q.passed ? 'Bestanden' : 'Nicht bestanden'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Rollenspiel Bewertungen */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Rollenspiel-Bewertungen
            </h3>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Noch keine Rollenspiele absolviert.</p>
            ) : (
              <>
                {/* Rating Distribution */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1 p-3 bg-green-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-700">{sessionsByRating.gut}</p>
                    <p className="text-xs text-green-600">Gut</p>
                  </div>
                  <div className="flex-1 p-3 bg-amber-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-amber-700">{sessionsByRating.mittel}</p>
                    <p className="text-xs text-amber-600">Mittel</p>
                  </div>
                  <div className="flex-1 p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-700">{sessionsByRating.schwach}</p>
                    <p className="text-xs text-red-600">Schwach</p>
                  </div>
                </div>

                {/* Klickbare Session-Liste */}
                <SessionList sessions={sessions} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Soft Skills Radar */}
      {overallSoftSkill.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Soft Skills (Durchschnitt aus {ratedSessions.length} Rollenspielen)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {avgSoftSkills.map(skill => (
                <div key={skill.key} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{skill.label}</span>
                    <span className={`text-lg font-bold ${
                      skill.avg === null ? 'text-gray-400' :
                      skill.avg >= 4 ? 'text-green-600' :
                      skill.avg >= 3 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {skill.avg !== null ? skill.avg : '–'}
                    </span>
                  </div>
                  {skill.avg !== null && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          skill.avg >= 4 ? 'bg-green-500' :
                          skill.avg >= 3 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(skill.avg / 5) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Hinweis DSGVO */}
            <p className="text-xs text-muted-foreground mt-4">
              Bewertungen basieren auf KI-Analyse der Rollenspiele. Diese Daten dienen ausschliesslich der Weiterbildung.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Session List (klickbar, aufklappbar)

const skillLabels = {
  gesprachsfuhrung: 'Gesprächsführung',
  aktives_zuhoren: 'Aktives Zuhören',
  klarheit: 'Klarheit',
  einwand_behandlung: 'Einwandbehandlung',
  empathie: 'Empathie',
  uberzeugungskraft: 'Überzeugungskraft',
};

function SessionList({ sessions }) {
  const [expandedId, setExpandedId] = useState(null);
  const sorted = sessions.slice().reverse();

  return (
    <div className="space-y-2">
      {sorted.map(s => {
        const isExpanded = expandedId === s.id;
        const date = new Date(s.created_at).toLocaleDateString('de-CH', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
        const skills = ['gesprachsfuhrung', 'aktives_zuhoren', 'klarheit', 'einwand_behandlung', 'empathie', 'uberzeugungskraft']
          .filter(k => s[k] != null);

        return (
          <div key={s.id} className="border border-border rounded-lg overflow-hidden">
            {/* Header — klickbar */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : s.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={s.rating === 'gut' ? 'default' : s.rating === 'schwach' ? 'destructive' : 'secondary'}
                  className="text-[10px] min-w-[50px] justify-center"
                >
                  {s.rating || '–'}
                </Badge>
                <div>
                  <span className="text-sm font-medium">{s.persona_id}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {s.session_type === 'zen' ? 'Zen-Modus' : 'Übung'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{date}</span>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-border p-4 bg-muted/30 space-y-4">
                {/* KI-Feedback */}
                {s.ai_feedback && (
                  <div className="p-3 bg-background rounded-lg border border-border">
                    <div className="flex items-start gap-2">
                      <Quote className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-primary mb-1">KI-Feedback</p>
                        <p className="text-sm text-foreground leading-relaxed">{s.ai_feedback}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Soft Skills Grid */}
                {skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Soft Skills</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {skills.map(key => {
                        const val = s[key];
                        return (
                          <div key={key} className="flex items-center justify-between p-2 bg-background rounded border border-border">
                            <span className="text-xs text-muted-foreground">{skillLabels[key]}</span>
                            <span className={`text-sm font-bold ${
                              val >= 4 ? 'text-green-600' : val >= 3 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {val}/5
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Session-Typ Info */}
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Typ: {s.session_type === 'zen' ? 'Zen-Modus (realistisch)' : 'Übungsmodus'}</span>
                  <span>Persona: {s.persona_id}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
