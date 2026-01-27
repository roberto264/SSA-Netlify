import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, BookOpen, CheckCircle, Award, ChevronRight, ArrowLeft, 
  MessageCircle, User, Send, X, RotateCcw, Mic, MicOff, Volume2, 
  VolumeX, Phone, PhoneOff, Loader2, AlertCircle, Settings, 
  GraduationCap, Brain, Trophy, XCircle, HelpCircle, Building2,
  Users, TrendingUp, DollarSign, Calendar, Download, Search,
  Filter, BarChart3, Star, Heart, Zap, Target, Clock, Mail,
  Phone as PhoneIcon, MapPin, FileText, Edit, ChevronDown
} from 'lucide-react';
import { personas } from './personas';
import { modules } from './modules';

// ============================================
// MOCK DATEN FÜR DEMO
// ============================================
const mockLernende = [
  {
    id: 1,
    name: 'Max Mustermann',
    email: 'max@gama-ag.ch',
    phone: '+41 79 123 45 67',
    firma: 'Gama AG',
    startDatum: '15.10.2024',
    fortschritt: 68,
    status: 'in_ausbildung',
    letzterLogin: 'Heute, 14:32',
    loginsGesamt: 47,
    loginsProWoche: 4.2,
    modulFortschritt: [100, 100, 50, 0, 0],
    quizBestanden: 3,
    rollenspiele: 6,
    rollenspielRating: 'mittel',
    kommunikation: { gesprachsfuhrung: 4, aktivesZuhoren: 3, klarheit: 4, einwandBehandlung: 3 },
    personlichkeit: { auftreten: 'selbstbewusst', empathie: 4, uberzeugungskraft: 3, stressresistenz: 3 },
    verkaufstalent: { bedarfsanalyse: 4, abschlussstarke: 3, beziehungsaufbau: 4 },
    aiFeedback: 'Sehr motiviert, lernt schnell. Braucht noch Übung bei schwierigen Kunden. Zeigt gutes Einfühlungsvermögen.',
    gesamteinschatzung: 'geeignet',
    notizen: 'Sehr motiviert, lernt schnell. Braucht noch Übung bei schwierigen Kunden.'
  },
  {
    id: 2,
    name: 'Sandra Keller',
    email: 's.keller@solartech.ch',
    phone: '+41 79 234 56 78',
    firma: 'SolarTech GmbH',
    startDatum: '01.09.2024',
    fortschritt: 100,
    status: 'bestanden',
    letzterLogin: 'Gestern',
    loginsGesamt: 62,
    loginsProWoche: 5.1,
    modulFortschritt: [100, 100, 100, 100, 100],
    quizBestanden: 5,
    rollenspiele: 12,
    rollenspielRating: 'gut',
    prufungsergebnis: 92,
    prufungsdatum: '12.12.2024',
    kommunikation: { gesprachsfuhrung: 5, aktivesZuhoren: 5, klarheit: 4, einwandBehandlung: 5 },
    personlichkeit: { auftreten: 'selbstbewusst', empathie: 5, uberzeugungskraft: 5, stressresistenz: 4 },
    verkaufstalent: { bedarfsanalyse: 5, abschlussstarke: 5, beziehungsaufbau: 5 },
    aiFeedback: 'Herausragende Leistung. Natürliches Verkaufstalent mit exzellenter Kundenorientierung.',
    gesamteinschatzung: 'geeignet',
    notizen: 'Top-Kandidatin, sofort einsetzbar.'
  },
  {
    id: 3,
    name: 'Thomas Weber',
    email: 't.weber@ecoenergy.ch',
    phone: '+41 79 345 67 89',
    firma: 'EcoEnergy AG',
    startDatum: '01.11.2024',
    fortschritt: 45,
    status: 'inaktiv',
    letzterLogin: 'Vor 7 Tagen',
    loginsGesamt: 18,
    loginsProWoche: 2.1,
    modulFortschritt: [100, 75, 0, 0, 0],
    quizBestanden: 2,
    rollenspiele: 2,
    rollenspielRating: 'mittel',
    kommunikation: { gesprachsfuhrung: 3, aktivesZuhoren: 3, klarheit: 3, einwandBehandlung: 2 },
    personlichkeit: { auftreten: 'zurückhaltend', empathie: 3, uberzeugungskraft: 2, stressresistenz: 3 },
    verkaufstalent: { bedarfsanalyse: 3, abschlussstarke: 2, beziehungsaufbau: 3 },
    aiFeedback: 'Zeigt Potenzial, aber wenig Engagement. Sollte aktiver am Training teilnehmen.',
    gesamteinschatzung: 'bedingt_geeignet',
    notizen: 'Nachfassen wegen Inaktivität.'
  },
  {
    id: 4,
    name: 'Laura Brunner',
    email: 'laura.b@gama-ag.ch',
    phone: '+41 79 456 78 90',
    firma: 'Gama AG',
    startDatum: '01.09.2024',
    fortschritt: 100,
    status: 'nicht_bestanden',
    letzterLogin: 'Vor 2 Tagen',
    loginsGesamt: 55,
    loginsProWoche: 4.5,
    modulFortschritt: [100, 100, 100, 100, 60],
    quizBestanden: 4,
    rollenspiele: 8,
    rollenspielRating: 'schwach',
    prufungsergebnis: 58,
    prufungsdatum: '10.12.2024',
    kommunikation: { gesprachsfuhrung: 3, aktivesZuhoren: 4, klarheit: 3, einwandBehandlung: 2 },
    personlichkeit: { auftreten: 'zurückhaltend', empathie: 4, uberzeugungskraft: 2, stressresistenz: 2 },
    verkaufstalent: { bedarfsanalyse: 3, abschlussstarke: 2, beziehungsaufbau: 4 },
    aiFeedback: 'Gutes Fachwissen, aber Schwächen in der Abschlussstärke. Wird unter Druck unsicher.',
    gesamteinschatzung: 'bedingt_geeignet',
    notizen: 'Modul 5 wiederholen, dann erneut prüfen.'
  },
  {
    id: 5,
    name: 'Anna Huber',
    email: 'a.huber@gama-ag.ch',
    phone: '+41 79 567 89 01',
    firma: 'Gama AG',
    startDatum: '15.08.2024',
    fortschritt: 100,
    status: 'bestanden',
    letzterLogin: 'Vor 3 Tagen',
    loginsGesamt: 71,
    loginsProWoche: 4.8,
    modulFortschritt: [100, 100, 100, 100, 100],
    quizBestanden: 5,
    rollenspiele: 15,
    rollenspielRating: 'gut',
    prufungsergebnis: 88,
    prufungsdatum: '20.11.2024',
    kommunikation: { gesprachsfuhrung: 4, aktivesZuhoren: 5, klarheit: 4, einwandBehandlung: 4 },
    personlichkeit: { auftreten: 'selbstbewusst', empathie: 5, uberzeugungskraft: 4, stressresistenz: 4 },
    verkaufstalent: { bedarfsanalyse: 4, abschlussstarke: 4, beziehungsaufbau: 5 },
    aiFeedback: 'Sehr empathisch, baut schnell Vertrauen auf. Starke Beziehungsorientierung.',
    gesamteinschatzung: 'geeignet',
    notizen: 'Bereits im Sales-Team eingesetzt.'
  }
];

const mockFirmen = [
  { id: 1, name: 'Gama AG', lernende: 32, erfolgsquote: 78, umsatz: 3200 },
  { id: 2, name: 'SolarTech GmbH', lernende: 28, erfolgsquote: 92, umsatz: 2800 },
  { id: 3, name: 'EcoEnergy AG', lernende: 19, erfolgsquote: 65, umsatz: 1900 },
  { id: 4, name: 'SunPower Swiss', lernende: 15, erfolgsquote: 87, umsatz: 1500 }
];

// ============================================
// STAR RATING COMPONENT
// ============================================
function StarRating({ rating, max = 5 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star 
          key={i} 
          className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} 
        />
      ))}
    </div>
  );
}

// ============================================
// HEADER COMPONENT
// ============================================
function Header({ userRole, setUserRole, currentUser }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
            <Sun className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-indigo-950">Swiss Solar Academy</h1>
            <p className="text-xs text-gray-500">Powered by Gama AG</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setUserRole('lernender')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${userRole === 'lernender' ? 'bg-white shadow-sm text-indigo-950' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Lernender
            </button>
            <button 
              onClick={() => setUserRole('arbeitgeber')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${userRole === 'arbeitgeber' ? 'bg-white shadow-sm text-indigo-950' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Arbeitgeber
            </button>
            <button 
              onClick={() => setUserRole('betreiber')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${userRole === 'betreiber' ? 'bg-white shadow-sm text-indigo-950' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Betreiber
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-500">{currentUser.role}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              userRole === 'betreiber' ? 'bg-red-100 text-red-700' :
              userRole === 'arbeitgeber' ? 'bg-purple-100 text-purple-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {userRole === 'betreiber' ? 'Admin' : userRole === 'arbeitgeber' ? 'Arbeitgeber' : 'Lernender'}
            </span>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
              userRole === 'betreiber' ? 'bg-indigo-950' :
              userRole === 'arbeitgeber' ? 'bg-purple-600' :
              'bg-indigo-600'
            }`}>
              {currentUser.initials}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================
// LERNENDER DASHBOARD
// ============================================
function LernenderDashboard({ onSelectModule, onStartRoleplay, onStartTutor, userProgress }) {
  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Willkommen zurück! 👋</h2>
            <p className="text-indigo-200 text-lg">Du hast {userProgress.overall}% deiner Ausbildung abgeschlossen.</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{userProgress.overall}%</div>
            <p className="text-indigo-200">Fortschritt</p>
          </div>
        </div>
        <div className="mt-6 bg-white/20 rounded-full h-3">
          <div className="bg-amber-500 h-3 rounded-full transition-all" style={{ width: `${userProgress.overall}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProgress.lessonsCompleted}</p>
              <p className="text-sm text-gray-500">Lektionen abgeschlossen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProgress.lessonsOpen}</p>
              <p className="text-sm text-gray-500">Noch offen</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProgress.quizPassed}</p>
              <p className="text-sm text-gray-500">Quiz bestanden</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userProgress.roleplays}</p>
              <p className="text-sm text-gray-500">Rollenspiele</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Kursmodule</h3>
          <span className="text-sm text-gray-500">5 Module • 24 Lektionen</span>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {modules.map((module, index) => {
            const progress = userProgress.modules[index] || 0;
            const isComplete = progress === 100;
            const isActive = progress > 0 && progress < 100;
            
            return (
              <div 
                key={module.id}
                onClick={() => onSelectModule(module)}
                className={`rounded-xl p-5 cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-white shadow-md border-2 border-indigo-600' 
                    : 'bg-gray-50 hover:shadow-md hover:bg-white border-2 border-transparent hover:border-indigo-200'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-2xl mb-4`}>
                  {module.icon}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">{module.title}</h4>
                <p className="text-xs text-gray-500 mb-3">{module.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-600'}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs font-medium ${isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                    {progress}%
                  </span>
                </div>
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                  isComplete ? 'bg-green-100 text-green-700' :
                  isActive ? 'bg-indigo-600 text-white' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {isComplete ? 'Abgeschlossen' : isActive ? 'In Bearbeitung' : 'Offen'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div 
          onClick={onStartRoleplay}
          className="bg-gradient-to-br from-indigo-950 to-indigo-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl mb-2">Kundengespräche üben</h4>
              <p className="text-indigo-200 mb-4">Trainiere realistische Verkaufsgespräche mit KI-gestützten Kunden.</p>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {personas.slice(0, 4).map((p, i) => (
                    <span key={i} className="text-2xl">{p.image}</span>
                  ))}
                </div>
                <span className="text-indigo-200 text-sm">{personas.length} Kundenprofile</span>
              </div>
              <button className="bg-white text-indigo-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition">
                Gespräch starten
              </button>
            </div>
          </div>
        </div>

        <div 
          onClick={onStartTutor}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 cursor-pointer hover:shadow-md transition"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Brain className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-xl text-gray-900 mb-2">AI Lehrer</h4>
              <p className="text-gray-500 mb-4">Lass dich vom AI Tutor durch die Themen führen und teste dein Wissen.</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Personalisiert
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Sofort-Feedback
                </div>
              </div>
              <button className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-indigo-700 transition">
                Mit AI Lehrer lernen
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// BETREIBER DASHBOARD
// ============================================
function BetreiberDashboard() {
  const [selectedLernender, setSelectedLernender] = useState(null);
  const [filterFirma, setFilterFirma] = useState('alle');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLernende = mockLernende.filter(l => {
    if (filterFirma !== 'alle' && l.firma !== filterFirma) return false;
    if (searchTerm && !l.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (selectedLernender) {
    return <LernenderProfil lernender={selectedLernender} onBack={() => setSelectedLernender(null)} />;
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Aktive Lernende</p>
          <p className="text-3xl font-bold text-gray-900">247</p>
          <p className="text-xs text-green-600 mt-1">↑ 12%</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Firmen</p>
          <p className="text-3xl font-bold text-gray-900">18</p>
          <p className="text-xs text-green-600 mt-1">↑ 2 neue</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Erfolgsquote</p>
          <p className="text-3xl font-bold text-gray-900">89%</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Prüfungen offen</p>
          <p className="text-3xl font-bold text-amber-600">23</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Ø Logins/Woche</p>
          <p className="text-3xl font-bold text-gray-900">4.2</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Umsatz (Monat)</p>
          <p className="text-3xl font-bold text-green-600">CHF 12'450</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Alle Lernenden</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Suchen..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm w-40"
                />
              </div>
              <select 
                value={filterFirma}
                onChange={(e) => setFilterFirma(e.target.value)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-500"
              >
                <option value="alle">Alle Firmen</option>
                {mockFirmen.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
              </select>
            </div>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="px-5 py-3">Lernender</th>
                <th className="px-5 py-3">Firma</th>
                <th className="px-5 py-3">Fortschritt</th>
                <th className="px-5 py-3">Einschätzung</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLernende.map(lernender => (
                <tr key={lernender.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedLernender(lernender)}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm ${
                        lernender.status === 'bestanden' ? 'bg-green-100 text-green-600' :
                        lernender.status === 'nicht_bestanden' ? 'bg-red-100 text-red-600' :
                        lernender.status === 'inaktiv' ? 'bg-amber-100 text-amber-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {lernender.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{lernender.name}</p>
                        <p className="text-xs text-gray-500">{lernender.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">{lernender.firma}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-2">
                        <div className={`h-2 rounded-full ${lernender.fortschritt === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${lernender.fortschritt}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">{lernender.fortschritt}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      lernender.gesamteinschatzung === 'geeignet' ? 'bg-green-100 text-green-700' :
                      lernender.gesamteinschatzung === 'bedingt_geeignet' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {lernender.gesamteinschatzung === 'geeignet' ? '✓ Geeignet' :
                       lernender.gesamteinschatzung === 'bedingt_geeignet' ? '~ Bedingt' : '✗ Nicht'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">Profil →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Firmen</h3>
          </div>
          <div className="p-5 space-y-4">
            {mockFirmen.map(firma => (
              <div key={firma.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{firma.name}</p>
                  <span className="text-xs text-gray-500">{firma.lernende} Lernende</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${firma.erfolgsquote >= 80 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${firma.erfolgsquote}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-600">{firma.erfolgsquote}%</span>
                </div>
                <p className="text-xs text-gray-500">CHF {firma.umsatz.toLocaleString()} / Monat</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// LERNENDER PROFIL
// ============================================
function LernenderProfil({ lernender, onBack }) {
  const [notizen, setNotizen] = useState(lernender.notizen);

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück zur Übersicht
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Persönlichkeitsprofil</h3>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            lernender.gesamteinschatzung === 'geeignet' ? 'bg-green-100 text-green-700' :
            lernender.gesamteinschatzung === 'bedingt_geeignet' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            {lernender.gesamteinschatzung === 'geeignet' ? '✓ Geeignet für Sales' :
             lernender.gesamteinschatzung === 'bedingt_geeignet' ? '~ Bedingt geeignet' : '✗ Nicht geeignet'}
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center font-bold text-xl ${
                lernender.status === 'bestanden' ? 'bg-green-100 text-green-600' :
                lernender.status === 'nicht_bestanden' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {lernender.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900">{lernender.name}</h4>
                <p className="text-gray-500 text-sm">{lernender.firma}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{lernender.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <span>{lernender.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Start: {lernender.startDatum}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{lernender.loginsGesamt} Logins</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-indigo-600" />
              Kommunikation
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Gesprächsführung</span>
                <StarRating rating={lernender.kommunikation.gesprachsfuhrung} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aktives Zuhören</span>
                <StarRating rating={lernender.kommunikation.aktivesZuhoren} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Klarheit</span>
                <StarRating rating={lernender.kommunikation.klarheit} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Einwandbehandlung</span>
                <StarRating rating={lernender.kommunikation.einwandBehandlung} />
              </div>
            </div>

            <h5 className="font-semibold text-gray-900 flex items-center gap-2 pt-4">
              <Heart className="w-4 h-4 text-pink-600" />
              Persönlichkeit
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Auftreten</span>
                <span className={`text-sm font-medium ${lernender.personlichkeit.auftreten === 'selbstbewusst' ? 'text-green-600' : 'text-amber-600'}`}>
                  {lernender.personlichkeit.auftreten === 'selbstbewusst' ? 'Selbstbewusst' : 'Zurückhaltend'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Empathie</span>
                <StarRating rating={lernender.personlichkeit.empathie} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Überzeugungskraft</span>
                <StarRating rating={lernender.personlichkeit.uberzeugungskraft} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-600" />
              Verkaufstalent
            </h5>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Bedarfsanalyse</span>
                <StarRating rating={lernender.verkaufstalent.bedarfsanalyse} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Abschlussstärke</span>
                <StarRating rating={lernender.verkaufstalent.abschlussstarke} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Beziehungsaufbau</span>
                <StarRating rating={lernender.verkaufstalent.beziehungsaufbau} />
              </div>
            </div>

            <h5 className="font-semibold text-gray-900 flex items-center gap-2 pt-4">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Module
            </h5>
            <div className="space-y-2">
              {['Grundlagen', 'Komponenten', 'Planung', 'Installation', 'Wirtschaft'].map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-20">{name}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${lernender.modulFortschritt[i] === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${lernender.modulFortschritt[i]}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-600 w-8">{lernender.modulFortschritt[i]}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              AI-Einschätzung
            </h5>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-900">{lernender.aiFeedback}</p>
            </div>

            <h5 className="font-semibold text-gray-900 flex items-center gap-2 pt-2">
              <Edit className="w-4 h-4 text-gray-600" />
              Notizen
            </h5>
            <textarea 
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none h-20"
              placeholder="Notizen..."
            />

            {lernender.prufungsergebnis && (
              <div className={`p-3 rounded-lg ${lernender.status === 'bestanden' ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm font-medium ${lernender.status === 'bestanden' ? 'text-green-800' : 'text-red-800'}`}>
                  Prüfung: {lernender.prufungsergebnis}%
                </p>
                <p className={`text-xs ${lernender.status === 'bestanden' ? 'text-green-600' : 'text-red-600'}`}>
                  {lernender.prufungsdatum}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// ============================================
// ARBEITGEBER DASHBOARD
// ============================================
function ArbeitgeberDashboard() {
  const firmaMitarbeiter = mockLernende.filter(l => l.firma === 'Gama AG');

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      <div className="bg-gradient-to-r from-indigo-950 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold mb-2">Gama AG - Team Übersicht</h2>
            <p className="text-indigo-200">{firmaMitarbeiter.length} Mitarbeiter in Ausbildung</p>
          </div>
          <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6 mt-6">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Ø Fortschritt</p>
            <p className="text-3xl font-bold">{Math.round(firmaMitarbeiter.reduce((a, b) => a + b.fortschritt, 0) / firmaMitarbeiter.length)}%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Bestanden</p>
            <p className="text-3xl font-bold">{firmaMitarbeiter.filter(l => l.status === 'bestanden').length}/{firmaMitarbeiter.length}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Erfolgsquote</p>
            <p className="text-3xl font-bold">78%</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-indigo-200 text-sm">Bereit für Prüfung</p>
            <p className="text-3xl font-bold text-amber-400">{firmaMitarbeiter.filter(l => l.fortschritt === 100 && l.status === 'in_ausbildung').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {firmaMitarbeiter.map(m => (
          <div key={m.id} className={`bg-white rounded-xl p-5 shadow-sm border ${
            m.status === 'inaktiv' ? 'border-amber-200' :
            m.status === 'nicht_bestanden' ? 'border-red-200' :
            'border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  m.status === 'bestanden' ? 'bg-green-100 text-green-600' :
                  m.status === 'nicht_bestanden' ? 'bg-red-100 text-red-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  <p className="text-xs text-gray-500">Start: {m.startDatum}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                m.status === 'bestanden' ? 'bg-green-100 text-green-700' :
                m.status === 'nicht_bestanden' ? 'bg-red-100 text-red-700' :
                m.status === 'inaktiv' ? 'bg-amber-100 text-amber-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {m.status === 'bestanden' ? '✓ Bestanden' :
                 m.status === 'nicht_bestanden' ? '✗ Nicht best.' :
                 m.status === 'inaktiv' ? '⚠ Inaktiv' : 'Lernt'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fortschritt</span>
                <span className="font-medium">{m.fortschritt}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className={`h-2 rounded-full ${m.fortschritt === 100 ? 'bg-green-500' : 'bg-indigo-600'}`} style={{ width: `${m.fortschritt}%` }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quiz</span>
                <span>{m.quizBestanden}/5</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Vergleich</h3>
          <button className="text-indigo-600 text-sm font-medium flex items-center gap-1">
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-medium text-gray-500 uppercase">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">M1</th>
              <th className="px-5 py-3">M2</th>
              <th className="px-5 py-3">M3</th>
              <th className="px-5 py-3">M4</th>
              <th className="px-5 py-3">M5</th>
              <th className="px-5 py-3">Gesamt</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {firmaMitarbeiter.map(m => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                {m.modulFortschritt.map((p, i) => (
                  <td key={i} className="px-5 py-3">
                    <span className={p === 100 ? 'text-green-600' : p > 0 ? 'text-indigo-600' : 'text-gray-400'}>{p}%</span>
                  </td>
                ))}
                <td className="px-5 py-3 font-bold">{m.fortschritt}%</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    m.status === 'bestanden' ? 'bg-green-100 text-green-700' :
                    m.status === 'nicht_bestanden' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {m.status === 'bestanden' ? 'Bestanden' : m.status === 'nicht_bestanden' ? 'Nicht best.' : 'Lernt'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

// ============================================
// MODULE DETAIL VIEW
// ============================================
function ModuleDetail({ module, onBack, onSelectTopic }) {
  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-xl flex items-center justify-center text-3xl`}>
            {module.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{module.title}</h2>
            <p className="text-gray-500">{module.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          {module.topics.map(topic => (
            <div 
              key={topic.id}
              onClick={() => onSelectTopic(topic)}
              className="p-5 bg-gray-50 rounded-xl hover:bg-white hover:shadow-md border-2 border-transparent hover:border-indigo-200 cursor-pointer transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{topic.title}</h3>
                  <p className="text-sm text-gray-500">{topic.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// ============================================
// QUIZ COMPONENT
// ============================================
function Quiz({ topic, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);

  const question = topic.questions[currentQuestion];

  const handleAnswer = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);
    if (index === question.correct) setScore(score + 1);
  };

  const handleNext = () => {
    if (currentQuestion < topic.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  if (showResult) {
    const percentage = Math.round((score / topic.questions.length) * 100);
    return (
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${percentage >= 70 ? 'bg-green-100' : 'bg-red-100'}`}>
            {percentage >= 70 ? <Trophy className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{percentage >= 70 ? 'Bestanden!' : 'Nicht bestanden'}</h2>
          <p className="text-gray-500 mb-6">{score}/{topic.questions.length} richtig ({percentage}%)</p>
          <button onClick={onBack} className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium">Zurück</button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">{topic.title}</h3>
          <span className="text-sm text-gray-500">{currentQuestion + 1}/{topic.questions.length}</span>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentQuestion + 1) / topic.questions.length) * 100}%` }}></div>
        </div>

        <h4 className="text-lg font-semibold text-gray-900 mb-6">{question.question}</h4>

        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={answered}
              className={`w-full p-4 text-left rounded-xl border-2 transition ${
                answered
                  ? index === question.correct ? 'border-green-500 bg-green-50'
                    : index === selectedAnswer ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        {answered && (
          <>
            <div className={`p-4 rounded-xl mb-6 ${selectedAnswer === question.correct ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className="text-sm">{question.explanation}</p>
            </div>
            <button onClick={handleNext} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium">
              {currentQuestion < topic.questions.length - 1 ? 'Weiter' : 'Ergebnis'}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

// ============================================
// PERSONA SELECTION
// ============================================
function PersonaSelection({ onSelect, onBack }) {
  return (
    <main className="max-w-5xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Wähle einen Kunden</h2>

      <div className="grid grid-cols-2 gap-6">
        {personas.map(persona => (
          <div 
            key={persona.id}
            onClick={() => onSelect(persona)}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg hover:border-indigo-200 cursor-pointer transition"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{persona.image}</div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{persona.name}</h3>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    persona.difficulty === 'Einsteiger' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {persona.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">{persona.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {persona.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

// ============================================
// VOICE CHAT - MIT NETLIFY FUNCTIONS
// ============================================
function VoiceChat({ persona, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setMessages([{ role: 'assistant', content: `Guten Tag, mein Name ist ${persona.firstName}. Wie kann ich Ihnen helfen?` }]);
  }, [persona]);

  const sendMessage = async (text) => {
    if (!text.trim() || isProcessing) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Chat via Netlify Function
      const response = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: text }],
          systemPrompt: persona.systemPrompt
        })
      });
      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      
      // TTS via Netlify Function
      const ttsResponse = await fetch('/.netlify/functions/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply, voice: persona.voiceType || 'onyx' })
      });
      const ttsData = await ttsResponse.json();
      const audioBlob = new Blob([Uint8Array.from(atob(ttsData.audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' });
      new Audio(URL.createObjectURL(audioBlob)).play();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const response = await fetch('/.netlify/functions/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64 })
            });
            const data = await response.json();
            if (data.text) sendMessage(data.text);
          } catch (error) {
            console.error('Error:', error);
          }
        };
        reader.readAsDataURL(blob);
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Zurück
      </button>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3" style={{ backgroundColor: persona.color + '10' }}>
          <div className="text-4xl">{persona.image}</div>
          <div>
            <h3 className="font-bold text-gray-900">{persona.name}</h3>
            <p className="text-sm text-gray-500">{persona.difficulty}</p>
          </div>
        </div>

        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            className={`p-3 rounded-full ${isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputText)}
            placeholder="Nachricht..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
          />
          <button
            onClick={() => sendMessage(inputText)}
            disabled={isProcessing || !inputText.trim()}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </main>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [userRole, setUserRole] = useState('lernender');
  const [view, setView] = useState('dashboard');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedPersona, setSelectedPersona] = useState(null);

  const currentUser = {
    lernender: { name: 'Max Mustermann', role: 'Sales Trainee', initials: 'MM' },
    arbeitgeber: { name: 'Gama AG', role: 'HR Manager', initials: 'GA' },
    betreiber: { name: 'Nico R.', role: 'Administrator', initials: 'NR' }
  }[userRole];

  const userProgress = {
    overall: 68,
    lessonsCompleted: 16,
    lessonsOpen: 8,
    quizPassed: 4,
    roleplays: 12,
    modules: [100, 100, 50, 0, 0]
  };

  useEffect(() => {
    setView('dashboard');
    setSelectedModule(null);
    setSelectedTopic(null);
    setSelectedPersona(null);
  }, [userRole]);

  const handleBack = () => {
    if (view === 'voicechat') { setView('personas'); setSelectedPersona(null); }
    else if (view === 'personas') { setView('dashboard'); }
    else if (view === 'quiz') { setView('module'); setSelectedTopic(null); }
    else if (view === 'module') { setView('dashboard'); setSelectedModule(null); }
    else { setView('dashboard'); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={userRole} setUserRole={setUserRole} currentUser={currentUser} />
      
      {userRole === 'betreiber' && <BetreiberDashboard />}
      {userRole === 'arbeitgeber' && <ArbeitgeberDashboard />}
      {userRole === 'lernender' && (
        <>
          {view === 'dashboard' && (
            <LernenderDashboard 
              onSelectModule={(m) => { setSelectedModule(m); setView('module'); }}
              onStartRoleplay={() => setView('personas')}
              onStartTutor={() => {}}
              userProgress={userProgress}
            />
          )}
          {view === 'module' && selectedModule && (
            <ModuleDetail 
              module={selectedModule} 
              onBack={handleBack}
              onSelectTopic={(t) => { setSelectedTopic(t); setView('quiz'); }}
            />
          )}
          {view === 'quiz' && selectedTopic && (
            <Quiz topic={selectedTopic} onBack={handleBack} />
          )}
          {view === 'personas' && (
            <PersonaSelection onSelect={(p) => { setSelectedPersona(p); setView('voicechat'); }} onBack={handleBack} />
          )}
          {view === 'voicechat' && selectedPersona && (
            <VoiceChat persona={selectedPersona} onBack={handleBack} />
          )}
        </>
      )}
    </div>
  );
}
