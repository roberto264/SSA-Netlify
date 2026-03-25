/**
 * AccountSettings — Daten-Export und Konto-Löschung (DSGVO).
 */
import { useState } from 'react';
import { Download, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { authFetch } from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

export default function AccountSettings() {
  const { signOut, profile } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState(null);

  const handleExport = async () => {
    setExporting(true);
    setMessage(null);
    try {
      const response = await authFetch('/.netlify/functions/user-export', { method: 'POST' });
      const result = await response.json();

      if (!result.ok) {
        setMessage({ type: 'error', text: result.error?.message || 'Export fehlgeschlagen' });
        return;
      }

      // Download as JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssa-daten-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Daten erfolgreich exportiert.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Export fehlgeschlagen. Bitte später erneut versuchen.' });
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      const response = await authFetch('/.netlify/functions/user-delete', {
        method: 'POST',
        body: JSON.stringify({ confirm: true }),
      });
      const result = await response.json();

      if (!result.ok) {
        setMessage({ type: 'error', text: result.error?.message || 'Löschung fehlgeschlagen' });
        return;
      }

      setMessage({ type: 'success', text: result.data.message });
      // Sign out after short delay
      setTimeout(() => signOut(), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Löschung fehlgeschlagen. Bitte später erneut versuchen.' });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">Kontoeinstellungen</h3>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Data Export */}
          <Button variant="outline" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
            Meine Daten exportieren
          </Button>

          {/* Account Deletion */}
          {!showDeleteConfirm ? (
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Konto löschen
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <span className="text-sm text-red-700">Wirklich löschen? Daten werden nach 30 Tagen endgültig entfernt.</span>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Ja, löschen'}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                Abbrechen
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Gemäss DSGVO/nDSG hast du das Recht auf Export und Löschung deiner Daten.
        </p>
      </CardContent>
    </Card>
  );
}
