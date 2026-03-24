import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useFirmaSubscription, useFirmaUsers } from '@/lib/database';
import { authFetch } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { User, Shield, CreditCard, Users, Loader2, Settings, Mail, Copy, Check, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AccountSettings from '@/components/AccountSettings';
import SubscriptionCard from '@/components/billing/SubscriptionCard';
import SeatManager from '@/components/billing/SeatManager';

const TABS = {
  profile: { label: 'Profil', icon: User },
  account: { label: 'Konto & Datenschutz', icon: Shield },
  billing: { label: 'Abrechnung', icon: CreditCard },
  team: { label: 'Mitarbeiter', icon: Users },
};

export default function SettingsPage() {
  const { profile, updateProfile } = useAuth();
  const { firma, loading: firmaLoading } = useFirmaSubscription();
  const { users: firmaUsers } = useFirmaUsers(profile?.firma);
  const [activeTab, setActiveTab] = useState('profile');

  const role = profile?.role;
  const showBilling = role === 'privat' || role === 'arbeitgeber' || role === 'betreiber';
  const showTeam = role === 'arbeitgeber';

  const availableTabs = Object.entries(TABS).filter(([key]) => {
    if (key === 'billing') return showBilling;
    if (key === 'team') return showTeam;
    return true;
  });

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Settings className="h-6 w-6" />
        Einstellungen
      </h1>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
        {availableTabs.map(([key, { label, icon: Icon }]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'account' && <AccountTab />}
      {activeTab === 'billing' && showBilling && (
        <BillingTab role={role} firma={firma} firmaLoading={firmaLoading} firmaUsers={firmaUsers} />
      )}
      {activeTab === 'team' && showTeam && (
        <TeamTab firma={firma} firmaUsers={firmaUsers} />
      )}
    </main>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────
function ProfileTab() {
  const { profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  const roleLabels: Record<string, string> = {
    privat: 'Privatperson',
    lernender: 'Lernender (Mitarbeiter)',
    arbeitgeber: 'Arbeitgeber (Firma-Admin)',
    betreiber: 'Administrator',
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profil</h2>

        <div className="space-y-2">
          <Label>Name</Label>
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm" />
            <Button onClick={handleSave} disabled={saving || name === profile?.name}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <Check className="h-4 w-4" /> : 'Speichern'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>E-Mail</Label>
          <Input value={profile?.email || ''} disabled className="max-w-sm bg-muted" />
        </div>

        <div className="space-y-2">
          <Label>Rolle</Label>
          <Input value={roleLabels[profile?.role] || profile?.role} disabled className="max-w-sm bg-muted" />
        </div>

        {profile?.firma && (
          <div className="space-y-2">
            <Label>Firma</Label>
            <Input value={profile.firma} disabled className="max-w-sm bg-muted" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Account & Privacy Tab ────────────────────────────────────
function AccountTab() {
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async () => {
    setPwLoading(true);
    setPwMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setPwMessage({ type: 'success', text: 'Passwort erfolgreich geändert.' });
      setCurrentPw('');
      setNewPw('');
    } catch (err: any) {
      setPwMessage({ type: 'error', text: err.message || 'Fehler beim Ändern des Passworts.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Passwort ändern</h2>

          {pwMessage && (
            <div className={`p-3 rounded-lg text-sm ${
              pwMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {pwMessage.text}
            </div>
          )}

          <div className="space-y-3 max-w-sm">
            <div className="space-y-2">
              <Label>Neues Passwort</Label>
              <Input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                minLength={6}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={pwLoading || newPw.length < 6}>
              {pwLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Passwort ändern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* DSGVO Export/Delete */}
      <AccountSettings />
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────
function BillingTab({ role, firma, firmaLoading, firmaUsers }: any) {
  if (firmaLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  // Privat-User: eigenes Billing (TODO: Privat-SubscriptionCard)
  if (role === 'privat') {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Abrechnung</h2>
          {firma ? (
            <SubscriptionCard firma={firma} activeSeats={1} />
          ) : (
            <div className="text-center py-8">
              <CreditCard className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Testphase aktiv. Abo-Details folgen.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Arbeitgeber: Firma-Billing
  if (!firma) {
    return (
      <Card>
        <CardContent className="p-6 text-center py-8">
          <p className="text-muted-foreground">Keine Firma-Daten verfügbar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <SubscriptionCard firma={firma} activeSeats={firmaUsers?.length || 0} />
      <SeatManager users={firmaUsers || []} seatLimit={firma.seat_limit || 5} />
    </div>
  );
}

// ─── Team Tab (Arbeitgeber only) ──────────────────────────────
function TeamTab({ firma, firmaUsers }: any) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    setInviting(true);
    setInviteResult(null);
    try {
      const response = await authFetch('/.netlify/functions/invite-user', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!result.ok) {
        setInviteResult({ type: 'error', text: result.error?.message || 'Fehler beim Einladen' });
        return;
      }

      setInviteResult({
        type: 'success',
        text: `Einladung für ${email} erstellt.`,
        url: result.data.inviteUrl,
      });
      setEmail('');
    } catch (err) {
      setInviteResult({ type: 'error', text: 'Verbindungsfehler' });
    } finally {
      setInviting(false);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Invite */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Mitarbeiter einladen</h2>
          <p className="text-sm text-muted-foreground">
            Lade Mitarbeiter per E-Mail ein. Sie erhalten einen Link zur Registrierung.
          </p>

          {inviteResult && (
            <div className={`p-3 rounded-lg text-sm ${
              inviteResult.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <p>{inviteResult.text}</p>
              {inviteResult.url && (
                <div className="mt-2 flex items-center gap-2">
                  <Input value={inviteResult.url} readOnly className="text-xs bg-white" />
                  <Button size="sm" variant="outline" onClick={() => copyUrl(inviteResult.url!)}>
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mitarbeiter@firma.ch"
                className="pl-10"
              />
            </div>
            <Button onClick={handleInvite} disabled={inviting || !email.includes('@')}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Einladen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team List */}
      <SeatManager users={firmaUsers || []} seatLimit={firma?.seat_limit || 5} />
    </div>
  );
}
