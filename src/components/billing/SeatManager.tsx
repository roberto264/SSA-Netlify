/**
 * SeatManager — Zeigt Mitarbeiter und deren Seat-Status.
 * Ermöglicht Arbeitgebern die Übersicht über gebuchte Seats.
 */
import { Users, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  last_login: string | null;
}

interface SeatManagerProps {
  users: User[];
  seatLimit: number;
}

export default function SeatManager({ users, seatLimit }: SeatManagerProps) {
  const activeUsers = users.filter(u => u.role !== 'betreiber');
  const seatsUsed = activeUsers.length;
  const seatsAvailable = Math.max(0, seatLimit - seatsUsed);

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
            style={{ width: `${Math.min(100, (seatsUsed / seatLimit) * 100)}%` }}
          />
        </div>

        {seatsAvailable === 0 && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            Alle Seats belegt. Erhöhen Sie Ihr Seat-Limit im Billing-Portal.
          </div>
        )}

        {/* User list */}
        <div className="space-y-2">
          {activeUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  user.last_login ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{user.name || 'Unbekannt'}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                {user.last_login ? (
                  <UserCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <UserX className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
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
