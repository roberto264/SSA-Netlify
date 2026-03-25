/**
 * SeatManager — Zeigt Mitarbeiter und deren Seat-Status.
 * Arbeitgeber können einzelne Mitarbeiter entfernen (Seat wird frei).
 */
import { useState } from 'react';
import { Users, UserCheck, UserX, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { authFetch } from '@/lib/api';

export default function SeatManager({ users, seatLimit, currentUserId, onUserRemoved }) {
  const [removingId, setRemovingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState(null);

  const activeUsers = users.filter(u => u.role !== 'betreiber');
  const seatsUsed = activeUsers.length;
  const seatsAvailable = Math.max(0, seatLimit - seatsUsed);

  const handleRemove = async (userId) => {
    setRemovingId(userId);
    setMessage(null);
    try {
      const response = await authFetch('/.netlify/functions/remove-user', {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      const result = await response.json();

      if (!result.ok) {
        setMessage({ type: 'error', text: result.error?.message || 'Fehler beim Entfernen' });
      } else {
        setMessage({ type: 'success', text: result.data.message });
        onUserRemoved?.();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Verbindungsfehler' });
    } finally {
      setRemovingId(null);
      setConfirmId(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Seat-Verwaltung
          </h3>
          <span className="text-sm text-muted-foreground">
            {seatsUsed}/{seatLimit} Seats belegt
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${
              seatsUsed >= seatLimit ? 'bg-red-500' : seatsUsed >= seatLimit * 0.8 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, (seatsUsed / Math.max(seatLimit, 1)) * 100)}%` }}
          />
        </div>

        {seatsAvailable === 0 && seatsUsed > 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            Alle Seats belegt. Erhöhe das Seat-Limit im Billing-Portal oder entferne Mitarbeiter.
          </div>
        )}

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* User list */}
        <div className="space-y-2">
          {activeUsers.map(user => {
            const isCurrentUser = user.id === currentUserId;
            const isConfirming = confirmId === user.id;
            const isRemoving = removingId === user.id;

            return (
              <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    user.last_login ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {user.name || 'Unbekannt'}
                      {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(Du)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.last_login ? (
                    <UserCheck className="h-4 w-4 text-green-500" />
                  ) : (
                    <UserX className="h-4 w-4 text-gray-400" />
                  )}

                  {/* Remove button (not for self, not for arbeitgeber) */}
                  {!isCurrentUser && user.role === 'lernender' && (
                    <>
                      {isConfirming ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemove(user.id)}
                            disabled={isRemoving}
                            className="h-7 text-xs"
                          >
                            {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ja'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmId(null)}
                            className="h-7 text-xs"
                          >
                            Nein
                          </Button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(user.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-1"
                          title="Mitarbeiter entfernen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {activeUsers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Noch keine Mitarbeiter registriert.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
