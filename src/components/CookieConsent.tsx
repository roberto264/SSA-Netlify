import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CONSENT_KEY = 'ssa-cookie-consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-2xl mx-auto bg-white border border-border rounded-xl shadow-lg p-4 flex items-start gap-4">
        <Cookie className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 text-sm text-muted-foreground">
          <p>
            Diese Website verwendet ausschliesslich technisch notwendige Cookies für die Anmeldung.
            Keine Tracking- oder Analyse-Cookies.{' '}
            <Link to="/privacy" className="text-primary hover:underline">Datenschutzerklärung</Link>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button size="sm" onClick={accept}>Verstanden</Button>
          <button onClick={accept} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
