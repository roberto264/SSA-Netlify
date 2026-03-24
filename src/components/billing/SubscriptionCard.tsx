/**
 * SubscriptionCard — Zeigt Abo-Status, Seats, Trial-Countdown.
 * Wird im ArbeitgeberDashboard eingebunden.
 */
import { useState } from 'react';
import { CreditCard, Users, Clock, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

interface SubscriptionCardProps {
  firma: {
    id: string;
    name: string;
    subscription_status: string;
    seat_limit: number;
    trial_ends_at: string | null;
    current_period_end: string | null;
  };
  activeSeats: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Aktiv', color: 'text-green-600 bg-green-50' },
  trialing: { label: 'Testphase', color: 'text-blue-600 bg-blue-50' },
  past_due: { label: 'Zahlung ausstehend', color: 'text-amber-600 bg-amber-50' },
  canceled: { label: 'Gekündigt', color: 'text-red-600 bg-red-50' },
  unpaid: { label: 'Kein Abo', color: 'text-gray-600 bg-gray-50' },
  incomplete: { label: 'Unvollständig', color: 'text-amber-600 bg-amber-50' },
};

export default function SubscriptionCard({ firma, activeSeats }: SubscriptionCardProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const status = STATUS_LABELS[firma.subscription_status] || STATUS_LABELS.unpaid;
  const isTrialing = firma.subscription_status === 'trialing';
  const needsSubscription = ['unpaid', 'canceled', 'incomplete'].includes(firma.subscription_status);

  // Trial countdown
  let trialDaysLeft = 0;
  if (isTrialing && firma.trial_ends_at) {
    const diff = new Date(firma.trial_ends_at).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  const handleCheckout = async () => {
    setLoading('checkout');
    try {
      const response = await authFetch('/.netlify/functions/stripe-checkout', {
        method: 'POST',
        body: JSON.stringify({ seats: firma.seat_limit }),
      });
      const result = await response.json();
      if (result.ok && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  const handlePortal = async () => {
    setLoading('portal');
    try {
      const response = await authFetch('/.netlify/functions/stripe-portal', {
        method: 'POST',
      });
      const result = await response.json();
      if (result.ok && result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      console.error('Portal error:', err);
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

        {/* Actions */}
        <div className="flex gap-3">
          {needsSubscription || isTrialing ? (
            <Button onClick={handleCheckout} disabled={!!loading} className="flex-1">
              {loading === 'checkout' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Abo abschliessen
            </Button>
          ) : null}

          {firma.subscription_status === 'active' || firma.subscription_status === 'past_due' ? (
            <Button variant="outline" onClick={handlePortal} disabled={!!loading} className="flex-1">
              {loading === 'portal' && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <ExternalLink className="h-4 w-4 mr-2" />
              Billing-Portal
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
