import React, { useState } from 'react';
import { Sun, Mail, Lock, User, Building2, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useFirmen } from '../lib/database';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [firma, setFirma] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUp } = useAuth();
  const { firmen } = useFirmen();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, name, firma);
        setMessage('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
        setMode('login');
      }
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Ungültige Anmeldedaten'
        : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl card-shadow p-8 w-full max-w-md animate-slide-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
            <Sun className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Swiss Solar Academy</h1>
            <p className="text-sm text-slate-500">Lernplattform für Solarberater</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'login' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Anmelden
          </button>
          <button
            onClick={() => setMode('register')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              mode === 'register' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Registrieren
          </button>
        </div>

        {/* Error/Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Max Mustermann"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Firma</label>
                <div className="relative">
                  <Building2 className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={firma}
                    onChange={(e) => setFirma(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Firma auswählen...</option>
                    {firmen.map(f => (
                      <option key={f.id} value={f.name}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-Mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="max@beispiel.ch"
                required
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Passwort</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 transition-colors"
              />
            </div>
            {mode === 'register' && (
              <p className="text-xs text-slate-500 mt-1">Mindestens 6 Zeichen</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button onClick={() => setMode('register')} className="text-indigo-600 font-medium hover:underline">
                Registrieren
              </button>
            </>
          ) : (
            <>
              Bereits registriert?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-600 font-medium hover:underline">
                Anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
