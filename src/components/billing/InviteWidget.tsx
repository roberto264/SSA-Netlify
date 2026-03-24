/**
 * InviteWidget — Kompakte Einladungs-Komponente für Dashboard und Settings.
 */
import { useState } from 'react';
import { Mail, Send, Copy, Check, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authFetch } from '@/lib/api';

interface InviteWidgetProps {
  onInvited?: () => void;
}

export default function InviteWidget({ onInvited }: InviteWidgetProps) {
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; text: string; url?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    setInviting(true);
    setResult(null);
    try {
      const response = await authFetch('/.netlify/functions/invite-user', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!data.ok) {
        setResult({ type: 'error', text: data.error?.message || 'Fehler beim Einladen' });
        return;
      }

      setResult({
        type: 'success',
        text: `Einladung für ${email} erstellt.`,
        url: data.data.inviteUrl,
      });
      setEmail('');
      onInvited?.();
    } catch {
      setResult({ type: 'error', text: 'Verbindungsfehler' });
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
    <Card>
      <CardContent className="p-6 space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Send className="h-5 w-5" />
          Mitarbeiter einladen
        </h3>
        <p className="text-sm text-muted-foreground">
          E-Mail eingeben — der Mitarbeiter erhält einen Registrierungslink.
        </p>

        {result && (
          <div className={`p-3 rounded-lg text-sm ${
            result.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <p>{result.text}</p>
            {result.url && (
              <div className="mt-2 flex items-center gap-2">
                <Input value={result.url} readOnly className="text-xs bg-white" />
                <Button size="sm" variant="outline" onClick={() => copyUrl(result.url!)}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mitarbeiter@firma.ch"
              className="pl-10"
              onKeyDown={(e) => e.key === 'Enter' && email.includes('@') && handleInvite()}
            />
          </div>
          <Button onClick={handleInvite} disabled={inviting || !email.includes('@')}>
            {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Einladen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
