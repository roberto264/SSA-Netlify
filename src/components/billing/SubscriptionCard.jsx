/**
 * SubscriptionCard — Zeigt Abo-Status, Seats, Trial-Countdown.
 * Unterstützt: Neues Abo abschliessen, Seats anpassen, Billing-Portal.
 */
import { useState } from 'react';
import { CreditCard, Users, Clock, ExternalLink, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

const STATUS_LABELS = {
  active: { label: 'Aktiv', color: 'text-green-600 bg-green-50' },
  trialing: { label: 'Testphase', color: 'text-blue-600 bg-blue-50' },
  past_due: { label: 'Zahlung ausstehend', color: 'text-amber-600 bg-amber-50' },
  canceled: { label: 'Gekündigt', color: 'text-red-600 bg-red-50' },
  unpaid: { label: 'Kein Abo', color: 'text-gray-600 bg-gray-50' },
  incomplete: { label: 'Unvollständig', color: 'text-amber-600 bg-amber-50' },
};

export default function SubscriptionCard({ firma, activeSeats, onUpdate }) {
  const [loading, setLoading] = useState(null);
  const [seats, setSeats] = useState(firma.seat_limit || 1);
  const [message, setMessage] = useState(null);

  const status = STATUS_LABELS[firma.subscription_status] || STATUS_LABELS.unpaid;
  const isActive = firma.subscription_status === 'active';
  const isTrialing = firma.subscription_status === 'trialing';
  const needsSubscription = ['unpaid', 'canceled', 'incomplete'].includes(firma.subscription_status);
  const seatsChanged = seats !== firma.seat_limit;

  // Trial countdown
  let trialDaysLeft = 0;
  if (isTrialing && firma.trial_ends_at) {
    const diff = new Date(firma.trial_ends_at).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const handleCheckout = async () => {
    setLoading('checkout');
    setMessage(null);
    try {
      const response = await authFetch('/.netlify/functions/stripe-checkout', {
        method: 'POST',
        body: JSON.stringify({ seats }),
      });
      const result = await response.json();
      if (result.ok && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Checkout fehlgeschlagen' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Verbindungsfehler' });
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateSeats = async () => {
    setLoading('update');
    setMessage(null);
    try {
      const response = await authFetch('/.netlify/functions/stripe-update-seats', {
        method: 'POST',
        body: JSON.stringify({ seats }),
      });
      const result = await response.json();
      if (result.ok) {
        setMessage({ type: 'success', text: result.data.message });
        onUpdate?.();
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Fehler beim Anpassen' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Verbindungsfehler' });
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading('portal');
    setMessage(null);
    try {
      const response = await authFetch('/.netlify/functions/stripe-portal', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.ok && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setMessage({ type: 'error', text: result.error?.message || 'Portal nicht verfügbar' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Verbindungsfehler' });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Abo-Verwaltung
          </h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Trial Banner */}
        {isTrialing && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2 text-blue-700 text-sm">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              Testphase: noch <strong>{trialDaysLeft} Tage</strong> kostenlos.
              {trialDaysLeft <= 3 && ' Jetzt Abo abschliessen!'}
            </span>
          </div>
        )}

        {/* Past Due Warning */}
        {firma.subscription_status === 'past_due' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-700 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Zahlung fehlgeschlagen. Bitte Zahlungsmethode aktualisieren.</span>
          </div>
        )}

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              Seats
            </div>
            <p className="text-xl font-bold">
              {activeSeats} / {firma.seat_limit}
            </p>
          </div>
          {firma.current_period_end && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Nächste Abrechnung
              </div>
              <p className="text-xl font-bold">
                {new Date(firma.current_period_end).toLocaleDateString('de-CH')}
              </p>
            </div>
          )}
        </div>

        {/* Seat Adjustment (for new checkout OR active subscription) */}
        {(needsSubscription || isTrialing || isActive) && (
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">
              {isActive ? 'Seats anpassen' : 'Anzahl Seats'}
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSeats(Math.max(isActive ? activeSeats : 1, seats - 1))}
                disabled={seats <= (isActive ? activeSeats : 1)}
                className="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="w-12 text-center text-lg font-bold">{seats}</span>
              <button
                onClick={() => setSeats(seats + 1)}
                className="h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-muted transition-colors text-lg font-medium"
              >
                +
              </button>
              {isActive && seats < activeSeats && (
                <span className="text-xs text-destructive">Min. {activeSeats} (aktive Nutzer)</span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* New subscription */}
          {(needsSubscription || isTrialing) && (
            <Button onClick={handleCheckout} disabled={!!loading} className="flex-1">
              {loading === 'checkout' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Abo abschliessen ({seats} {seats === 1 ? 'Seat' : 'Seats'})
            </Button>
          )}

          {/* Update seats (active subscription) */}
          {isActive && seatsChanged && (
            <Button onClick={handleUpdateSeats} disabled={!!loading} className="flex-1">
              {loading === 'update' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
              Auf {seats} Seats ändern
            </Button>
          )}

          {/* Billing Portal (active or past_due) */}
          {(isActive || firma.subscription_status === 'past_due') && (
            <Button variant="outline" onClick={handlePortal} disabled={!!loading} className="flex-1">
              {loading === 'portal' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <ExternalLink className="h-4 w-4 mr-2" />
              Billing-Portal
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
