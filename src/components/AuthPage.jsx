import React, { useState } from 'react';
import { Sun, Mail, Lock, User, Building2, Loader2, AlertCircle, UserCircle } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Map Supabase error messages to German */
function localizeError(message) {
  const map = {
    'Invalid login credentials': 'Ungültige Anmeldedaten.',
    'User already registered': 'Diese E-Mail-Adresse ist bereits registriert.',
    'Email rate limit exceeded': 'Zu viele Versuche. Bitte später erneut probieren.',
    'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen haben.',
    'Signup requires a valid password': 'Bitte gib ein gültiges Passwort ein.',
    'Unable to validate email address: invalid format': 'Bitte gib eine gültige E-Mail-Adresse ein.',
  };
  return map[message] || message;
}

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // login | register
  const [accountType, setAccountType] = useState(null); // null | 'privat' | 'firma'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [firmaName, setFirmaName] = useState('');
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { signIn, signUpPrivat, signUpFirma } = useAuth();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setFirmaName('');
    setAgbAccepted(false);
    setError('');
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        window.location.href = '/';
        return;
      } else if (accountType === 'privat') {
        await signUpPrivat(email, password, name);
        setMessage('Registrierung erfolgreich! Bitte bestätige deine E-Mail.');
        setMode('login');
        resetForm();
      } else if (accountType === 'firma') {
        await signUpFirma(email, password, name, firmaName);
        setMessage('Firma und Konto erstellt! Bitte bestätige deine E-Mail.');
        setMode('login');
        resetForm();
      }
    } catch (err) {
      setError(localizeError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    setMode('register');
    setAccountType(null);
    setError('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Left side: branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">Swiss Solar Academy</span>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Die Lernplattform für<br />professionelle Solarberater
          </h2>
          <p className="text-slate-400 text-lg max-w-md">
            KI-gestützte Rollenspiele, interaktive Module und detaillierte Analysen für Ihr Vertriebsteam.
          </p>
        </div>
        <p className="text-slate-500 text-sm relative z-10">&copy; Swiss Solar Academy</p>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Right side: form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white lg:rounded-l-3xl">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="h-10 w-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Sun className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-slate-900">Swiss Solar Academy</span>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-muted rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Anmelden
            </button>
            <button
              onClick={switchToRegister}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Registrieren
            </button>
          </div>

          {/* Error/Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-success text-sm">
              {message}
            </div>
          )}

          {/* Register: Account Type Selection */}
          {mode === 'register' && !accountType && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">Wie möchtest du dich registrieren?</p>
              <button
                onClick={() => setAccountType('privat')}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Als Privatperson</p>
                  <p className="text-xs text-muted-foreground">Eigenes Konto mit persönlicher Abrechnung</p>
                </div>
              </button>
              <button
                onClick={() => setAccountType('firma')}
                className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex items-center gap-4"
              >
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Als Firma</p>
                  <p className="text-xs text-muted-foreground">Firmenkonto erstellen und Mitarbeiter einladen</p>
                </div>
              </button>
            </div>
          )}

          {/* Login Form OR Register Form (after type selected) */}
          {(mode === 'login' || (mode === 'register' && accountType)) && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  {/* Back to type selection */}
                  <button
                    type="button"
                    onClick={() => setAccountType(null)}
                    className="text-sm text-muted-foreground hover:text-foreground mb-2"
                  >
                    ← {accountType === 'privat' ? 'Privatperson' : 'Firma'} — ändern
                  </button>

                  {/* Firma name (only for firma) */}
                  {accountType === 'firma' && (
                    <div className="space-y-2">
                      <Label htmlFor="firmaName">Firmenname</Label>
                      <div className="relative">
                        <Building2 className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="firmaName"
                          type="text"
                          value={firmaName}
                          onChange={(e) => setFirmaName(e.target.value)}
                          placeholder="Meine Solar GmbH"
                          required
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  )}

                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="relative">
                      <User className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Max Mustermann"
                        required
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="max@beispiel.ch"
                    required
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10 h-11"
                  />
                </div>
                {mode === 'register' && (
                  <p className="text-xs text-muted-foreground">Mindestens 6 Zeichen</p>
                )}
              </div>

              {mode === 'register' && (
                <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agbAccepted}
                    onChange={(e) => setAgbAccepted(e.target.checked)}
                    required
                    className="mt-1 rounded border-input"
                  />
                  <span>
                    Ich akzeptiere die{' '}
                    <a href="/terms" className="text-primary hover:underline" target="_blank">AGB</a>
                    {' '}und die{' '}
                    <a href="/privacy" className="text-primary hover:underline" target="_blank">Datenschutzerklärung</a>.
                  </span>
                </label>
              )}

              <Button
                type="submit"
                disabled={loading || (mode === 'register' && !agbAccepted)}
                size="lg"
                className="w-full"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'login' ? 'Anmelden' : accountType === 'firma' ? 'Firma erstellen' : 'Registrieren'}
              </Button>
            </form>
          )}

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === 'login' ? (
              <>
                Noch kein Konto?{' '}
                <button onClick={switchToRegister} className="text-primary font-medium hover:underline">
                  Registrieren
                </button>
              </>
            ) : (
              <>
                Bereits registriert?{' '}
                <button onClick={() => { setMode('login'); setAccountType(null); setError(''); }} className="text-primary font-medium hover:underline">
                  Anmelden
                </button>
              </>
            )}
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground">Datenschutz</a>
            <a href="/terms" className="hover:text-foreground">AGB</a>
          </div>
        </div>
      </div>
    </div>
  );
}
